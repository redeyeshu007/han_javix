from django.db.models import Sum, Count, Q, DecimalField, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from apps.accounts.permissions import IsAnyOfRoles
from apps.accounts.utils import get_accounts_assigned_project
from .models import PaymentClearance, HandoverRecord, ServiceRequest, AssociationTransition, Charge, PaymentRecord
from .serializers import (
    PaymentClearanceSerializer,
    HandoverRecordSerializer,
    ServiceRequestSerializer,
    AssociationTransitionSerializer,
    ChargeSerializer,
    PaymentRecordSerializer
)

# Statuses that mean "an accounts user has reviewed/verified this entry".
# Entering one of these stamps verified_by / verified_at server-side.
PAYMENT_VERIFIED_STATUSES = {'PARTIALLY_CLEARED', 'CLEARED', 'APPROVED_FOR_HANDOVER'}

# Payment clearance belongs to Accounts per the master spec; Builder Owner
# keeps oversight. Recorded as an implementation assumption.
PAYMENT_CLEARANCE_ROLES = {'SUPER_ADMIN', 'BUILDER_OWNER', 'ACCOUNTS'}


from apps.inspections.views import BlockProjectAdminMutationMixin

class PaymentClearanceViewSet(BlockProjectAdminMutationMixin, viewsets.ModelViewSet):
    serializer_class = PaymentClearanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['unit__unit_number', 'customer__first_name', 'customer__last_name']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PaymentClearance.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = PaymentClearance.objects.select_related('unit__floor__block__project', 'unit__customer').order_by('-updated_at')
        elif user.role == 'CUSTOMER':
            qs = PaymentClearance.objects.filter(customer=user)
        elif user.builder_company_id:
            if user.role == 'ACCOUNTS':
                qs = PaymentClearance.objects.filter(
                    unit__floor__block__project=get_accounts_assigned_project(user)
                ).select_related('unit__floor__block__project', 'unit__customer').order_by('-updated_at')
            else:
                qs = PaymentClearance.objects.filter(
                    unit__floor__block__project__builder_company_id=user.builder_company_id
                ).select_related('unit__floor__block__project', 'unit__customer').order_by('-updated_at')
                if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                    qs = qs.filter(unit__floor__block__project__in=user.assigned_projects.all())
        else:
            qs = PaymentClearance.objects.none()

        params = self.request.query_params
        if params.get('unit'):
            qs = qs.filter(unit_id=params.get('unit'))
        if params.get('customer'):
            qs = qs.filter(customer_id=params.get('customer'))
        if params.get('status'):
            qs = qs.filter(status=params.get('status'))
        return qs

    def perform_create(self, serializer):
        # verified_by/verified_at are server-owned: stamp from request.user when
        # the row is created directly in a verified state, never from the client.
        status = serializer.validated_data.get('status', PaymentClearance._meta.get_field('status').default)
        if status not in dict(PaymentClearance.STATUS_CHOICES):
            raise ValidationError({'status': f'Invalid status "{status}".'})
        if status in PAYMENT_VERIFIED_STATUSES and self.request.user.role not in PAYMENT_CLEARANCE_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Accounts or Builder Owner can record a verified payment.')
        if status in PAYMENT_VERIFIED_STATUSES:
            serializer.save(verified_by=self.request.user, verified_at=timezone.now())
        else:
            serializer.save(verified_by=None, verified_at=None)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)

        # Validate against the real PaymentClearance.STATUS_CHOICES.
        if new_status not in dict(PaymentClearance.STATUS_CHOICES):
            raise ValidationError({'status': f'Invalid status "{new_status}".'})

        # Clearance transitions belong to Accounts / Builder Owner.
        if new_status != old_status and self.request.user.role not in PAYMENT_CLEARANCE_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Accounts or Builder Owner can change payment clearance status.')

        if new_status in PAYMENT_VERIFIED_STATUSES and old_status not in PAYMENT_VERIFIED_STATUSES:
            # Transition into a verified state: record who verified it, server-side.
            serializer.save(verified_by=self.request.user, verified_at=timezone.now())
        else:
            # No verification transition (e.g. PARTIALLY_CLEARED -> CLEARED keeps
            # the original verifier) — leave verification fields untouched.
            serializer.save()


# Handover-critical fields are Builder-Owner-owned (master spec: "Builder
# Owner: relevant approvals"). Recorded as an implementation assumption.
HANDOVER_OWNER_FIELDS = {
    'site_engineer_approval',
    'accounts_approval', 'keys_handed_over', 'access_cards_handed_over',
    'status',
}
HANDOVER_PHASE_STATUSES = {
    'handover_preparation', 'ready_for_handover', 'handover_scheduled',
    'handed_over', 'warranty_stage',
}


class HandoverRecordViewSet(BlockProjectAdminMutationMixin, viewsets.ModelViewSet):
    serializer_class = HandoverRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]

    def perform_create(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if self.request.user.role == 'PROJECT_ADMIN':
            raise PermissionDenied("Project Admins cannot mutate handover records.")
        unit = serializer.validated_data.get('unit')
        if unit and unit.status not in HANDOVER_PHASE_STATUSES:
            raise ValidationError(
                {'unit': 'A handover record can only be created once the unit reaches handover preparation.'})
        kwargs = {}
        if unit and unit.customer and not serializer.validated_data.get('customer'):
            kwargs['customer'] = unit.customer
        record = serializer.save(**kwargs)
        self._maybe_complete(record)

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return HandoverRecord.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = HandoverRecord.objects.all()
        elif user.role == 'CUSTOMER':
            qs = HandoverRecord.objects.filter(customer=user)
        elif user.builder_company:
            qs = HandoverRecord.objects.filter(unit__floor__block__project__builder_company=user.builder_company)
        else:
            qs = HandoverRecord.objects.none()

        params = self.request.query_params
        if params.get('unit'):
            qs = qs.filter(unit_id=params.get('unit'))
        if params.get('customer'):
            qs = qs.filter(customer_id=params.get('customer'))
        if params.get('status'):
            qs = qs.filter(status=params.get('status'))
        return qs.order_by('-created_at')

    def perform_update(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        if self.request.user.role == 'PROJECT_ADMIN':
            raise PermissionDenied("Project Admins cannot mutate handover records.")
        owner_fields_touched = HANDOVER_OWNER_FIELDS & set(serializer.validated_data.keys())
        if owner_fields_touched and self.request.user.role not in {'SUPER_ADMIN', 'BUILDER_OWNER'}:
            raise PermissionDenied(f"Only Builder Owners can modify {', '.join(owner_fields_touched)}.")

        record = serializer.save()
        self._maybe_complete(record)

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied
        if self.request.user.role == 'PROJECT_ADMIN':
            raise PermissionDenied("Project Admins cannot mutate handover records.")
        instance.delete()

    def _maybe_complete(self, record):
        # Handover completion: all four approvals AND keys handed over ->
        # record HANDED_OVER + unit.status='handed_over' (server-side truth).
        if record.status == 'HANDED_OVER':
            return
        approvals = all([
            record.site_engineer_approval,
            record.accounts_approval,
            record.keys_handed_over,
        ])
        if approvals:
            record.status = 'HANDED_OVER'
            record.actual_date = timezone.now().date()
            record.save(update_fields=['status', 'actual_date', 'updated_at'])
            unit = record.unit
            if unit.status != 'handed_over':
                unit.status = 'handed_over'
                unit.save(update_fields=['status', 'updated_at'])


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description', 'unit__unit_number']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ServiceRequest.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = ServiceRequest.objects.all()
        elif user.role == 'CUSTOMER':
            qs = ServiceRequest.objects.filter(customer=user)
        elif user.role == 'CONTRACTOR':
            qs = ServiceRequest.objects.filter(assigned_contractor=user)
        elif user.builder_company:
            qs = ServiceRequest.objects.filter(unit__floor__block__project__builder_company=user.builder_company)
        else:
            qs = ServiceRequest.objects.none()

        params = self.request.query_params
        if params.get('unit'):
            qs = qs.filter(unit_id=params.get('unit'))
        if params.get('customer'):
            qs = qs.filter(customer_id=params.get('customer'))
        if params.get('status'):
            qs = qs.filter(status=params.get('status'))
        if params.get('priority'):
            qs = qs.filter(priority=params.get('priority'))
        if params.get('assigned_contractor'):
            qs = qs.filter(assigned_contractor_id=params.get('assigned_contractor'))
        return qs.order_by('-created_at')


class AssociationTransitionViewSet(viewsets.ModelViewSet):
    serializer_class = AssociationTransitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AssociationTransition.objects.none()
        
        qs = AssociationTransition.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = AssociationTransition.objects.all()
        elif user.builder_company:
            qs = AssociationTransition.objects.filter(builder_company=user.builder_company)
        
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
            
        return qs.select_related('project')

class ChargeViewSet(viewsets.ModelViewSet):
    serializer_class = ChargeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Charge.objects.none()
            
        if user.role == 'SUPER_ADMIN':
            qs = Charge.objects.select_related('clearance__unit__customer').order_by('-created_at')
        elif user.role == 'CUSTOMER':
            qs = Charge.objects.filter(clearance__customer=user).select_related('clearance__unit__customer')
        elif user.builder_company_id:
            if user.role == 'ACCOUNTS':
                qs = Charge.objects.filter(
                    clearance__unit__floor__block__project=get_accounts_assigned_project(user)
                ).select_related('clearance__unit__customer').order_by('-created_at')
            else:
                qs = Charge.objects.filter(
                    clearance__unit__floor__block__project__builder_company_id=user.builder_company_id
                ).select_related('clearance__unit__customer').order_by('-created_at')
                
                if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                    qs = qs.filter(clearance__unit__floor__block__project__in=user.assigned_projects.all())
        else:
            return Charge.objects.none()

        params = self.request.query_params
        if params.get('clearance'):
            qs = qs.filter(clearance_id=params.get('clearance'))
        if params.get('unit'):
            qs = qs.filter(clearance__unit_id=params.get('unit'))
        if params.get('status'):
            qs = qs.filter(status=params.get('status'))
        if params.get('charge_type'):
            qs = qs.filter(charge_type=params.get('charge_type'))
            
        return qs

    def create(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status
        
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        unit_id = data.get('unit')
        clearance_id = data.get('clearance')
        
        if not clearance_id and unit_id:
            from apps.projects.models import Unit
            from django.shortcuts import get_object_or_404
            from django.db import transaction
            from rest_framework.exceptions import PermissionDenied
            from .models import PaymentClearance
            from apps.accounts.utils import get_accounts_assigned_project

            unit = get_object_or_404(Unit, id=unit_id)
            if request.user.role == 'ACCOUNTS':
                accounts_project = get_accounts_assigned_project(request.user)
                if unit.floor.block.project_id != accounts_project.id:
                    raise PermissionDenied("You can only create charges for units in your assigned project.")
            
            with transaction.atomic():
                clearance, created = PaymentClearance.objects.get_or_create(
                    unit=unit,
                    defaults={'customer': unit.customer}
                )
                data['clearance'] = clearance.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = self.request.user
        clearance = serializer.validated_data.get('clearance')
        if user.role == 'ACCOUNTS':
            accounts_project = get_accounts_assigned_project(user)
            if clearance.unit.floor.block.project_id != accounts_project.id:
                raise PermissionDenied("You can only create charges for units in your assigned project.")
        serializer.save(created_by=user)

class PaymentRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PaymentRecord.objects.none()
            
        if user.role == 'SUPER_ADMIN':
            qs = PaymentRecord.objects.select_related('clearance__unit__customer', 'charge').order_by('-created_at')
        elif user.role == 'CUSTOMER':
            qs = PaymentRecord.objects.filter(clearance__customer=user)
        elif user.builder_company_id:
            if user.role == 'ACCOUNTS':
                qs = PaymentRecord.objects.filter(
                    clearance__unit__floor__block__project=get_accounts_assigned_project(user)
                ).select_related('clearance__unit__customer', 'charge').order_by('-created_at')
            else:
                qs = PaymentRecord.objects.filter(
                    clearance__unit__floor__block__project__builder_company_id=user.builder_company_id
                ).select_related('clearance__unit__customer', 'charge').order_by('-created_at')
                
                if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                    qs = qs.filter(clearance__unit__floor__block__project__in=user.assigned_projects.all())
        else:
            qs = PaymentRecord.objects.none()

        params = self.request.query_params
        if params.get('clearance'):
            qs = qs.filter(clearance_id=params.get('clearance'))
        if params.get('unit'):
            qs = qs.filter(clearance__unit_id=params.get('unit'))
        if params.get('charge'):
            qs = qs.filter(charge_id=params.get('charge'))
            
        return qs.order_by('-payment_date').select_related('clearance__unit', 'clearance__customer', 'charge')

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        # Auto-resolve or create clearance if only unit is provided
        if not data.get('clearance') and data.get('unit'):
            from apps.projects.models import Unit
            from django.shortcuts import get_object_or_404
            from django.db import transaction
            from rest_framework.exceptions import PermissionDenied
            from .models import PaymentClearance
            from apps.accounts.utils import get_accounts_assigned_project

            unit = get_object_or_404(Unit, id=data.get('unit'))
            if request.user.role == 'ACCOUNTS':
                accounts_project = get_accounts_assigned_project(request.user)
                if unit.floor.block.project_id != accounts_project.id:
                    raise PermissionDenied("You can only create payments for units in your assigned project.")
            
            with transaction.atomic():
                clearance, created = PaymentClearance.objects.get_or_create(
                    unit=unit,
                    defaults={'customer': unit.customer}
                )
                data['clearance'] = clearance.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = self.request.user
        clearance = serializer.validated_data.get('clearance')
        
        if user.role == 'CUSTOMER':
            if clearance.customer != user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only submit payments for your own account.")
            # Force status to PENDING_VERIFICATION
            serializer.validated_data['status'] = 'PENDING_VERIFICATION'

        if user.role == 'ACCOUNTS':
            accounts_project = get_accounts_assigned_project(user)
            if clearance.unit.floor.block.project_id != accounts_project.id:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only create payments for units in your assigned project.")
                
        serializer.save(recorded_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()

        # Only ACCOUNTS and BUILDER_OWNER can verify/reject
        if 'status' in serializer.validated_data:
            new_status = serializer.validated_data['status']
            if new_status != instance.status:
                if user.role not in ['ACCOUNTS', 'BUILDER_OWNER', 'SUPER_ADMIN']:
                    raise PermissionDenied("You do not have permission to change payment status.")

        serializer.save()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Mark a payment record as VERIFIED and stamp verified_by."""
        instance = self.get_object()
        if request.user.role not in ['ACCOUNTS', 'BUILDER_OWNER', 'SUPER_ADMIN']:
            raise PermissionDenied("Only Accounts or Builder Owner can approve payments.")
        if instance.status == 'VERIFIED':
            return Response({'detail': 'Payment is already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        with transaction.atomic():
            instance.status = 'VERIFIED'
            instance.verified_by = request.user
            instance.verified_at = timezone.now()
            instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Mark a payment record as REJECTED and store the rejection reason."""
        instance = self.get_object()
        if request.user.role not in ['ACCOUNTS', 'BUILDER_OWNER', 'SUPER_ADMIN']:
            raise PermissionDenied("Only Accounts or Builder Owner can reject payments.")
        if instance.status == 'REJECTED':
            return Response({'detail': 'Payment is already rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        reason = request.data.get('rejection_reason', '').strip()
        if not reason:
            return Response({'rejection_reason': 'A rejection reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        with transaction.atomic():
            instance.status = 'REJECTED'
            instance.rejected_by = request.user
            instance.rejected_at = timezone.now()
            instance.rejection_reason = reason
            instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ─── Accounts Summary View ────────────────────────────────────────────────────

class AccountsSummaryView(APIView):
    """
    GET /api/handovers/accounts-summary/
    One optimized query returning all financial metrics for the Accounts dashboard.
    Scoped strictly to the authenticated ACCOUNTS user's assigned project.
    NEVER creates any records.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role not in ('ACCOUNTS', 'BUILDER_OWNER', 'SUPER_ADMIN'):
            raise PermissionDenied("Access restricted to Accounts, Builder Owner, or Super Admin.")

        # Determine project scope
        if user.role == 'ACCOUNTS':
            project = get_accounts_assigned_project(user)
            project_name = project.name
            project_id = project.id
            clearance_qs = PaymentClearance.objects.filter(
                unit__floor__block__project=project
            )
        elif user.role == 'BUILDER_OWNER':
            clearance_qs = PaymentClearance.objects.filter(
                unit__floor__block__project__builder_company_id=user.builder_company_id
            )
            project_name = None
            project_id = None
        else:  # SUPER_ADMIN
            clearance_qs = PaymentClearance.objects.all()
            project_name = None
            project_id = None

        # Aggregate charges (total demanded)
        charge_qs = Charge.objects.filter(clearance__in=clearance_qs)
        total_demanded = charge_qs.aggregate(
            total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )['total']

        # Aggregate approved payments (VERIFIED only)
        record_qs = PaymentRecord.objects.filter(clearance__in=clearance_qs)
        total_collected = record_qs.filter(status='VERIFIED').aggregate(
            total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )['total']

        total_pending = max(total_demanded - total_collected, 0)

        # Overdue: charges past due date, not fully paid
        from django.utils import timezone as tz
        today = tz.now().date()
        overdue_count = charge_qs.filter(
            due_date__lt=today,
            status__in=['PENDING', 'PARTIALLY_PAID']
        ).count()

        # Awaiting verification
        awaiting_count = record_qs.filter(status='PENDING_VERIFICATION').count()

        # Cleared units
        cleared_count = clearance_qs.filter(status='CLEARED').count()

        # Pending verification records for the feed (most recent 10)
        pending_records = record_qs.filter(status='PENDING_VERIFICATION').select_related(
            'clearance__unit', 'clearance__customer', 'charge'
        ).order_by('-created_at')[:10]

        pending_records_data = []
        for rec in pending_records:
            unit = rec.clearance.unit if rec.clearance else None
            customer = rec.clearance.customer if rec.clearance else None
            pending_records_data.append({
                'id': str(rec.id),
                'amount': str(rec.amount),
                'payment_date': str(rec.payment_date),
                'payment_method': rec.payment_method,
                'reference_id': rec.reference_id,
                'unit_number': unit.unit_number if unit else '',
                'unit_id': str(unit.id) if unit else None,
                'customer_name': f"{customer.first_name} {customer.last_name}".strip() if customer else 'No Customer',
                'customer_id': str(customer.id) if customer else None,
                'charge_type': rec.charge.get_charge_type_display() if rec.charge else 'Payment',
                'submitted_at': rec.created_at.isoformat(),
            })

        return Response({
            'project_name': project_name,
            'project_id': str(project_id) if project_id else None,
            'total_demanded': str(total_demanded),
            'total_collected': str(total_collected),
            'total_pending': str(total_pending),
            'overdue_count': overdue_count,
            'awaiting_verification_count': awaiting_count,
            'cleared_units_count': cleared_count,
            'pending_verification_records': pending_records_data,
        })

