from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Prefetch

from .models import Project, Block, Floor, Unit, Milestone
from .serializers import (
    ProjectSerializer,
    BlockSerializer,
    FloorSerializer,
    UnitSerializer,
    MilestoneSerializer,
)
from .permissions import CanManageProjects
from apps.accounts.utils import get_accounts_assigned_project


# Nested prefetch plans that kill the N+1 in the Project → Block → Floor → Unit
# serializer tree WITHOUT changing the response shape (ProjectDetail /
# ProjectsList and other consumers depend on it).
BLOCK_TREE_PREFETCH = Prefetch(
    'blocks',
    queryset=Block.objects.prefetch_related(
        Prefetch('floors', queryset=Floor.objects.prefetch_related('units'))
    ),
)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [CanManageProjects]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Project.objects.none()

        if user.role == 'SUPER_ADMIN':
            qs = Project.objects.all().order_by('-created_at')
        elif user.builder_company:
            if user.role == 'ACCOUNTS':
                qs = Project.objects.filter(id=get_accounts_assigned_project(user).id)
            else:
                qs = Project.objects.filter(builder_company=user.builder_company).order_by('-created_at')
                if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                    qs = qs.filter(id__in=user.assigned_projects.all())
        else:
            return Project.objects.none()

        # blocks → floors → units + milestones are serialized nested by
        # ProjectSerializer; prefetch them so list responses don't issue
        # 3 queries per block.
        return qs.prefetch_related(BLOCK_TREE_PREFETCH, 'milestones')

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            created_by=user,
            builder_company=user.builder_company if user.role != 'SUPER_ADMIN' else None
        )

    @action(detail=True, methods=['get'])
    def admin_dashboard(self, request, pk=None):
        project = self.get_object()
        
        # Base units queryset for this project
        units = Unit.objects.filter(floor__block__project=project)
        total_units = units.count()
        
        assigned_customers = units.filter(customer__isnull=False).count()
        unassigned_units = total_units - assigned_customers
        
        handed_over = units.filter(status='handed_over').count()
        nearing_handover = units.filter(status='inspection_approved').count()
        
        # Open defects for the project
        from apps.inspections.models import Defect
        open_defects = Defect.objects.filter(unit__in=units).exclude(status__in=['resolved', 'closed']).count()
        
        # Handover readiness breakdown
        readiness_status = {
            'not_ready': units.filter(status='pending').count(),
            'inspections_in_progress': units.filter(status='inspection_pending').count(),
            'defects_pending': units.filter(status='defects_logged').count(),
            'ready': units.filter(status='inspection_approved').count(),
        }
        
        return Response({
            'project_name': project.name,
            'total_units': total_units,
            'assigned_customers': assigned_customers,
            'unassigned_units': unassigned_units,
            'nearing_handover': nearing_handover,
            'handed_over': handed_over,
            'open_defects': open_defects,
            'readiness_status': readiness_status,
        })


class BlockViewSet(viewsets.ModelViewSet):
    serializer_class = BlockSerializer
    permission_classes = [CanManageProjects]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Block.objects.none()
            
        qs = Block.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = Block.objects.all().order_by('-created_at')
        elif user.builder_company:
            qs = Block.objects.filter(project__builder_company=user.builder_company).select_related('project').order_by('-created_at')
            if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                qs = qs.filter(project__in=user.assigned_projects.all())
            
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)

        # BlockSerializer nests floors → units; prefetch to avoid the N+1.
        return qs.prefetch_related(
            Prefetch('floors', queryset=Floor.objects.prefetch_related('units'))
        )


class FloorViewSet(viewsets.ModelViewSet):
    serializer_class = FloorSerializer
    permission_classes = [CanManageProjects]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Floor.objects.none()
            
        qs = Floor.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = Floor.objects.all().order_by('-created_at')
        elif user.builder_company:
            qs = Floor.objects.filter(block__project__builder_company=user.builder_company).select_related('block__project').order_by('-created_at')
            if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                qs = qs.filter(block__project__in=user.assigned_projects.all())
            
        block_id = self.request.query_params.get('block')
        if block_id:
            qs = qs.filter(block_id=block_id)

        # FloorSerializer nests units; prefetch to avoid the N+1.
        return qs.prefetch_related('units')


class UnitViewSet(viewsets.ModelViewSet):
    serializer_class = UnitSerializer
    permission_classes = [CanManageProjects]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Unit.objects.none()
            
        qs = Unit.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = Unit.objects.all().select_related('floor__block__project', 'customer').order_by('-created_at')
        elif user.role == 'CUSTOMER':
            qs = Unit.objects.filter(customer=user).select_related('floor__block__project', 'customer')
        elif user.builder_company_id:
            if user.role == 'ACCOUNTS':
                qs = Unit.objects.filter(
                    floor__block__project=get_accounts_assigned_project(user)
                ).select_related('floor__block__project', 'customer').order_by('-created_at')
            else:
                qs = Unit.objects.filter(
                    floor__block__project__builder_company_id=user.builder_company_id
                ).select_related('floor__block__project', 'customer').order_by('-created_at')
                if user.role not in ('SUPER_ADMIN', 'BUILDER_OWNER'):
                    assigned_projects = user.assigned_projects.all()
                    qs = qs.filter(floor__block__project__in=assigned_projects)
        else:
            return Unit.objects.none()
            
        project_id = self.request.query_params.get('floor__block__project') or self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(floor__block__project_id=project_id)
            
        floor_id = self.request.query_params.get('floor')
        if floor_id:
            qs = qs.filter(floor_id=floor_id)
            
        return qs

    def perform_update(self, serializer):
        unit = self.get_object()

        new_status = serializer.validated_data.get(
            'status',
            unit.status
        )

        # Critical defects must be closed before handover
        if new_status in [
            'ready_for_handover',
            'handover_scheduled',
            'handed_over',
        ]:
            from apps.inspections.models import Defect

            has_open_critical_defect = Defect.objects.filter(
                unit=unit,
                priority='critical',
            ).exclude(
                status__in=['resolved', 'closed', 'cancelled']
            ).exists()

            if has_open_critical_defect:
                from rest_framework.exceptions import ValidationError

                raise ValidationError({
                    'status': (
                        'Unit cannot proceed to handover while '
                        'critical defects are unresolved.'
                    )
                })

        serializer.save()

    def _resolve_allocation_company_id(self, unit):
        """Builder company the allocation is validated against: the caller's
        own company, or — for platform-level SUPER_ADMINs without one — the
        company that owns the unit's project."""
        return (
            self.request.user.builder_company_id
            or unit.floor.block.project.builder_company_id
        )

    @action(detail=True, methods=['post'], url_path='assign-customer')
    def assign_customer(self, request, pk=None):
        """
        Atomic customer allocation for this unit.

        LINKS an existing CUSTOMER account (matched case-insensitively by
        email, or explicitly via customer_id) when one exists in the caller's
        builder company, otherwise CREATES one — then writes Unit.customer.
        Both steps run inside transaction.atomic: a failure never leaves an
        orphan account behind or a half-assigned unit. Duplicate emails are
        pre-checked and IntegrityError is converted to a 400 — never a 500.
        """
        User = get_user_model()
        unit = self.get_object()  # company-scoped by get_queryset()
        company_id = self._resolve_allocation_company_id(unit)

        email = str(request.data.get('email') or '').strip().lower()
        name = str(request.data.get('name') or '').strip()
        phone = str(request.data.get('phone') or '').strip()
        password = request.data.get('password') or None
        customer_id = request.data.get('customer_id') or None
        is_active = request.data.get('is_active')
        is_active = True if is_active is None else str(is_active).lower() in ('true', '1', 'yes')

        # --- resolve the target account (explicit link path first) ----------
        if customer_id:
            existing = User.objects.filter(pk=customer_id).first()
            if existing is None:
                raise ValidationError({'customer_id': 'Customer account not found.'})
        else:
            if not email:
                raise ValidationError({'email': 'Email is required.'})
            try:
                validate_email(email)
            except DjangoValidationError:
                raise ValidationError({'email': 'Enter a valid email address.'})
            existing = User.objects.filter(email__iexact=email).first()

        if existing is not None:
            if existing.role != 'CUSTOMER':
                raise ValidationError({
                    'email': (
                        'This email already belongs to a '
                        f'{existing.get_role_display()} account. '
                        'Only Customer accounts can be allocated to a unit.'
                    )
                })
            if existing.builder_company_id != company_id:
                raise ValidationError({
                    'email': (
                        'This customer belongs to a different builder company '
                        'and cannot be allocated to your unit.'
                    )
                })

        try:
            with transaction.atomic():
                account_created = existing is None
                if account_created:
                    if not password:
                        raise ValidationError({
                            'password': (
                                'Password is required when creating a new '
                                'customer account.'
                            )
                        })
                    if name:
                        first_name, _, last_name = name.partition(' ')
                    else:
                        first_name, last_name = email.split('@', 1)[0], ''
                    customer = User.objects.create_user(
                        username=email,
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        phone=phone,
                        role='CUSTOMER',
                        builder_company_id=company_id,
                        is_active=is_active,
                    )
                else:
                    customer = existing
                unit.customer = customer
                unit.save()
        except IntegrityError:
            # Race on the unique email/username — pre-check missed it.
            raise ValidationError({
                'email': 'A user account with this email already exists.'
            })

        return Response({
            'unit': UnitSerializer(unit, context={'request': request}).data,
            'customer': {
                'id': customer.id,
                'name': customer.get_full_name() or customer.email,
                'email': customer.email,
                'phone': customer.phone,
            },
            'account_created': account_created,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unassign-customer')
    def unassign_customer(self, request, pk=None):
        """
        Release the unit's customer link. The customer account itself is
        KEPT — only the Unit.customer relationship is cleared.
        """
        unit = self.get_object()
        released_customer_id = unit.customer_id
        unit.customer = None
        unit.save()
        return Response({
            'unit': UnitSerializer(unit, context={'request': request}).data,
            'released_customer_id': released_customer_id,
        })

    @action(detail=True, methods=['get'])
    def workspace(self, request, pk=None):
        """
        Aggregate payload for the Unit Details page: one request instead of the
        old 9-step loadData waterfall.

        Reuses the Phase-1 domain serializers (DefectSerializer /
        DocumentSerializer / PaymentClearanceSerializer / ServiceRequestSerializer
        / HandoverRecordSerializer / UnitInspectionSerializer) so the frontend
        normalizers (api/normalize.ts) keep working unchanged. Permissioning is
        identical to `retrieve` — this goes through self.get_object(), i.e. the
        same staff-scoped get_queryset.
        """
        from django.db.models import Count, OuterRef, Prefetch, Q, Subquery
        from django.db.models.functions import Coalesce
        from apps.inspections.models import Defect, UnitInspection, UnitInspectionResult, DefectActivityLog
        from apps.inspections.serializers import (
            DefectSerializer, UnitInspectionSerializer,
        )
        from apps.documents.models import Document
        from apps.documents.serializers import DocumentSerializer
        from apps.handovers.models import (
            PaymentClearance, HandoverRecord, ServiceRequest,
        )
        from apps.handovers.serializers import (
            PaymentClearanceSerializer, HandoverRecordSerializer,
            ServiceRequestSerializer,
        )

        unit = self.get_object()  # select_related(floor__block__project, customer)

        defects_qs = (
            Defect.objects.filter(unit=unit)
            .select_related('assigned_contractor', 'inspection_result')
            .prefetch_related(
                Prefetch('activity_logs',
                         queryset=DefectActivityLog.objects.order_by('timestamp'))
            )
            .order_by('-reported_date')
        )
        documents_qs = (
            Document.objects.filter(unit=unit)
            .select_related('uploaded_by', 'customer', 'unit', 'project')
            .order_by('-created_at')
        )
        payments_qs = (
            PaymentClearance.objects.filter(unit=unit)
            .select_related('customer', 'verified_by', 'unit')
            .order_by('-created_at')
        )
        service_requests_qs = (
            ServiceRequest.objects.filter(unit=unit)
            .select_related('customer', 'assigned_contractor', 'unit')
            .order_by('-created_at')
        )

        context = {'request': request}

        # --- counts: Computed in Python from the loaded querysets to save 7 DB queries
        defects_list = list(defects_qs)
        documents_list = list(documents_qs)
        payments_list = list(payments_qs)
        service_requests_list = list(service_requests_qs)

        open_defects_count = sum(1 for d in defects_list if d.status in UNIT_OPEN_DEFECT_STATUSES)
        critical_defects_count = sum(1 for d in defects_list if d.priority == 'critical' and d.status not in ['resolved', 'closed', 'cancelled'])
        
        documents_cnt = len(documents_list)
        documents_approved_cnt = sum(1 for d in documents_list if d.status == 'APPROVED')

        payments_cnt = len(payments_list)
        payments_cleared_cnt = sum(1 for p in payments_list if p.status in PAYMENT_CLEARED_STATUSES)
        
        service_requests_cnt = len(service_requests_list)

        counts = {
            'open_defects': open_defects_count,
            'critical_defects': critical_defects_count,
            'documents': documents_cnt,
            'payments': payments_cnt,
            'service_requests': service_requests_cnt,
        }

        # --- singletons ------------------------------------------------------
        # IMPORTANT: unit__floor__block__project MUST be in select_related so
        # UnitInspectionSerializer.get_project_name / get_project_id can resolve
        # the full chain without issuing a separate DB query per inspection.
        # Missing this caused 8 × 4 lazy-load round-trips @ ~350ms each = 11s.
        inspections_qs = (
            UnitInspection.objects.filter(unit=unit)
            .select_related(
                'inspected_by',
                'unit__floor__block__project',
                'unit__floor__block__project__builder_company',
            )
            .prefetch_related(
                Prefetch('results',
                         queryset=UnitInspectionResult.objects.select_related('checklist'))
            )
            .order_by('-created_at')
        )
        inspections_list = list(inspections_qs)
        latest_inspection = inspections_list[0] if inspections_list else None
        handover_record = (
            HandoverRecord.objects.filter(unit=unit)
            .select_related('customer', 'unit__floor__block__project')
            .first()
        )

        # --- readiness (computed from real rows; zero rows => not ready) -----
        customer_obj = unit.customer
        customer_payload = None
        if customer_obj is not None:
            customer_payload = {
                'id': customer_obj.id,
                'name': customer_obj.get_full_name() or customer_obj.email,
                'email': customer_obj.email,
                'phone': customer_obj.phone,
            }

        construction_ready = unit.status in UNIT_CONSTRUCTION_READY_STATUSES
        inspection_ready = bool(
            latest_inspection and latest_inspection.status == 'completed'
        )
        defects_ready = open_defects_count == 0
        # Zero documents must NOT claim ready — the UI needs to be able to show
        # "no documents" instead of a false green light.
        documents_ready = (
            documents_cnt > 0
            and documents_approved_cnt == documents_cnt
        )
        payment_ready = (
            payments_cnt > 0
            and payments_cleared_cnt == payments_cnt
        )
        approvals_ready = bool(
            handover_record
            and handover_record.site_engineer_approval
            and handover_record.accounts_approval
        )
        keys_handed_over = bool(
            handover_record and handover_record.keys_handed_over
        )
        readiness = {
            'construction_ready': construction_ready,
            'inspection_ready': inspection_ready,
            'defects_ready': defects_ready,
            'documents_ready': documents_ready,
            'payment_ready': payment_ready,
            'approvals_ready': approvals_ready,
            'keys_handed_over': keys_handed_over,
            'is_ready': (
                construction_ready and inspection_ready and defects_ready
                and documents_ready and payment_ready and approvals_ready
            ),
        }

        # Serialize inspections ONCE — reuse first element for latest_inspection
        # so we never run UnitInspectionSerializer twice on the same data.
        serialized_inspections = UnitInspectionSerializer(
            inspections_list, many=True, context=context
        ).data
        serialized_latest = serialized_inspections[0] if serialized_inspections else None

        return Response({
            'unit': {
                'id': unit.id,
                'unit_number': unit.unit_number,
                'unit_type': unit.unit_type,
                'area_sqft': unit.area_sqft,
                'bedrooms': unit.bedrooms,
                'bathrooms': unit.bathrooms,
                'status': unit.status,
                'floor': {'id': unit.floor_id, 'name': unit.floor.name},
                'block': {'id': unit.floor.block_id, 'name': unit.floor.block.name},
                'project': {
                    'id': unit.floor.block.project_id,
                    'name': unit.floor.block.project.name,
                },
                'customer': customer_payload,
            },
            'counts': counts,
            'latest_inspection': serialized_latest,
            'inspections': serialized_inspections,
            'defects': DefectSerializer(defects_list, many=True, context=context).data,
            'documents': DocumentSerializer(documents_list, many=True, context=context).data,
            'payments': PaymentClearanceSerializer(payments_list, many=True, context=context).data,
            'handover_record': (
                HandoverRecordSerializer(handover_record, context=context).data
                if handover_record else None
            ),
            'service_requests': ServiceRequestSerializer(service_requests_list, many=True, context=context).data,
            'readiness': readiness,
        })


# Unit statuses at which construction work is considered done (everything from
# customer inspection readiness onwards). Used by the workspace readiness block.
UNIT_CONSTRUCTION_READY_STATUSES = [
    'customer_inspection_ready',
    'customer_inspection_completed',
    'handover_preparation',
    'ready_for_handover',
    'handover_scheduled',
    'handed_over',
    'warranty_stage',
]

# Defect statuses that still block readiness (i.e. everything that is not
# resolved / closed / cancelled).
UNIT_OPEN_DEFECT_STATUSES = [
    'open',
    'assigned',
    'accepted',
    'in_progress',
    'waiting_for_reinspection',
    'rejected',
]

PAYMENT_CLEARED_STATUSES = ['CLEARED', 'APPROVED_FOR_HANDOVER']


class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [CanManageProjects]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Milestone.objects.none()
            
        qs = Milestone.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = Milestone.objects.all().order_by('-created_at')
        elif user.builder_company:
            qs = Milestone.objects.filter(project__builder_company=user.builder_company).order_by('-created_at')
            
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
            
        return qs
