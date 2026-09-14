from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.apps import apps

from .models import (
    UnitInspection,
    UnitInspectionResult,
    Defect,
    DefectActivityLog,
)

from .serializers import (
    UnitInspectionSerializer,
    UnitInspectionListSerializer,
    UnitInspectionResultSerializer,
    DefectSerializer,
    DefectActivityLogSerializer,
)

from apps.accounts.permissions import IsAnyOfRoles
from apps.platform_admin.models import Checklist as PlatformChecklist
from apps.platform_admin.serializers import ChecklistSerializer as PlatformChecklistSerializer
# Ordered lifecycle used by the inspection-completion auto-transition.
# A unit is never moved backwards or past handover preparation by it.
UNIT_LATER_STAGES = {
    'handover_preparation', 'ready_for_handover', 'handover_scheduled',
    'handed_over', 'warranty_stage',
}


def apply_inspection_completion_transition(unit):
    """On inspection completion: open defects -> defect_resolution,
    otherwise -> customer_inspection_ready. Documented minimal rule; a unit
    already in a later lifecycle stage is never moved."""
    if unit.status in UNIT_LATER_STAGES:
        return
    open_defects = unit.defects.exclude(
        status__in=['resolved', 'closed', 'cancelled']
    ).exists()
    target = 'defect_resolution' if open_defects else 'customer_inspection_ready'
    if unit.status != target:
        unit.status = target
        unit.save(update_fields=['status', 'updated_at'])


class PlatformChecklistViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Exposes Super Admin defined 'Standard Checklists' to the platform 
    for builders/inspectors to use as templates.
    """
    queryset = PlatformChecklist.objects.prefetch_related('items').filter(status='Active')
    serializer_class = PlatformChecklistSerializer
    permission_classes = [IsAnyOfRoles]





from rest_framework.exceptions import PermissionDenied

class BlockProjectAdminMutationMixin:
    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role == 'PROJECT_ADMIN' and request.method not in ['GET', 'HEAD', 'OPTIONS']:
            raise PermissionDenied("Project Admins cannot mutate inspection or defect records.")


class UnitInspectionViewSet(BlockProjectAdminMutationMixin, viewsets.ModelViewSet):
    """
    GET /inspections/inspections/        → list   → UnitInspectionListSerializer (no results, ~1 query)
    GET /inspections/inspections/:id/    → detail → UnitInspectionSerializer    (with results, prefetched)
    POST/PATCH /inspections/inspections/ → full serializer
    """
    permission_classes = [IsAnyOfRoles]
    allowed_roles = [
        'SUPER_ADMIN',
        'BUILDER_OWNER',
        'PROJECT_ADMIN',
        'SITE_ENGINEER',
        'CUSTOMER',
    ]

    # ── serializer selection ─────────────────────────────────────────────────
    def get_serializer_class(self):
        if self.action == 'list':
            return UnitInspectionListSerializer
        return UnitInspectionSerializer

    # ── queryset with optimised joins ────────────────────────────────────────
    _BASE_SELECT = (
        'unit__floor__block__project',
        'unit__floor__block__project__builder_company',
        'inspected_by',
    )

    def _base_qs(self):
        """Common select_related for all roles."""
        return UnitInspection.objects.select_related(*self._BASE_SELECT)

    def _with_results_prefetch(self, qs):
        """Add prefetch for results+checklist — only used on detail/create/update."""
        return qs.prefetch_related('results__checklist')

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return UnitInspection.objects.none()

        # ── scope by role ────────────────────────────────────────────────────
        if user.role == 'SUPER_ADMIN':
            qs = self._base_qs().order_by('-created_at')

        elif user.role in ('PROJECT_ADMIN', 'SITE_ENGINEER'):
            # Both roles: scope to their assigned projects (single IN query)
            assigned_projects = user.assigned_projects.all()
            qs = self._base_qs().filter(
                unit__floor__block__project__in=assigned_projects
            ).order_by('-created_at')

        elif user.role == 'CUSTOMER':
            qs = self._base_qs().filter(
                unit__customer=user
            ).order_by('-created_at')

        elif user.builder_company_id:
            # BUILDER_OWNER and any other builder-company-scoped role
            qs = self._base_qs().filter(
                unit__floor__block__project__builder_company_id=user.builder_company_id
            ).order_by('-created_at')

        else:
            return UnitInspection.objects.none()

        # ── add results prefetch for detail/write actions only ───────────────
        # List action uses UnitInspectionListSerializer which has no `results`
        # field, so skipping the prefetch keeps list queries to a minimum.
        if self.action != 'list':
            qs = self._with_results_prefetch(qs)

        return qs

    def perform_create(self, serializer):
        inspection = serializer.save(inspected_by=self.request.user)
        if inspection.status == 'completed':
            apply_inspection_completion_transition(inspection.unit)

    def perform_update(self, serializer):
        inspection = serializer.save()
        if inspection.status == 'completed':
            apply_inspection_completion_transition(inspection.unit)


class UnitInspectionResultViewSet(BlockProjectAdminMutationMixin, viewsets.ModelViewSet):
    serializer_class = UnitInspectionResultSerializer
    permission_classes = [IsAnyOfRoles]
    allowed_roles = [
        'SUPER_ADMIN',
        'BUILDER_OWNER',
        'PROJECT_ADMIN',
        'SITE_ENGINEER',
        'CUSTOMER',
    ]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return UnitInspectionResult.objects.none()
        if user.role == 'SUPER_ADMIN':
            return UnitInspectionResult.objects.all()
        if user.role == 'CUSTOMER':
            return UnitInspectionResult.objects.filter(inspection__unit__customer=user)
        if user.builder_company:
            return UnitInspectionResult.objects.filter(inspection__unit__floor__block__project__builder_company=user.builder_company)
        return UnitInspectionResult.objects.none()


class DefectViewSet(BlockProjectAdminMutationMixin, viewsets.ModelViewSet):
    serializer_class = DefectSerializer
    permission_classes = [IsAnyOfRoles]

    allowed_roles = [
        'SUPER_ADMIN',
        'BUILDER_OWNER',
        'PROJECT_ADMIN',
        'SITE_ENGINEER',
        'CUSTOMER',
        'CONTRACTOR',
    ]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Defect.objects.none()
        if user.role == 'SUPER_ADMIN':
            qs = Defect.objects.all().order_by('-reported_date')
        elif user.role in ['PROJECT_ADMIN', 'SITE_ENGINEER']:
            # Scope to defects within the assigned project only.
            assigned_projects = user.assigned_projects.all()
            qs = Defect.objects.filter(
                unit__floor__block__project__in=assigned_projects
            ).order_by('-reported_date')
        elif user.role == 'CUSTOMER':
            qs = Defect.objects.filter(unit__customer=user).order_by('-reported_date')
        elif user.builder_company:
            qs = Defect.objects.filter(unit__floor__block__project__builder_company=user.builder_company).order_by('-reported_date')
        else:
            qs = Defect.objects.none()

        if user.role == 'CONTRACTOR':
            # Contractors see only defects assigned to them or reported by them.
            from django.db.models import Q
            qs = qs.filter(Q(assigned_contractor=user) | Q(reported_by=user))

        # Optional server-side scoping, mirroring the payments / records views.
        if self.request.query_params.get('unit'):
            qs = qs.filter(unit_id=self.request.query_params.get('unit'))
        return qs

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

    def perform_update(self, serializer):
        defect = self.get_object()
        old_status = defect.status
        new_status = serializer.validated_data.get(
            'status',
            old_status
        )

        user_role = self.request.user.role

        # Contractor cannot resolve or close
        if user_role == 'CONTRACTOR':
            if new_status in ['resolved', 'closed']:
                from rest_framework.exceptions import ValidationError

                raise ValidationError({
                    'status': 'Contractor cannot resolve or close a defect.'
                })

        # Resolved / closed approval only for PM / Site Engineer
        if new_status in ['resolved', 'closed']:
            if user_role not in [
                        'SITE_ENGINEER',
            ]:
                from rest_framework.exceptions import ValidationError

                raise ValidationError({
                    'status': 'Only Project Manager or Site Engineer can approve this status.'
                })

        serializer.save()


class DefectActivityLogViewSet(viewsets.ModelViewSet):
    queryset = DefectActivityLog.objects.all()
    serializer_class = DefectActivityLogSerializer
    permission_classes = [IsAnyOfRoles]
    allowed_roles = [
        'SUPER_ADMIN',
        'BUILDER_OWNER',
        'SITE_ENGINEER',
        'CONTRACTOR',
    ]



class SiteEngineerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'SITE_ENGINEER':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Site Engineers can access this dashboard.")

        projects = user.assigned_projects.all()
        units = apps.get_model('projects', 'Unit').objects.filter(floor__block__project__in=projects)
        
        inspections = UnitInspection.objects.filter(unit__in=units)
        defects = Defect.objects.filter(unit__in=units)

        return Response({
            'inspections': {
                'assigned': inspections.count(), # or pending? Let's just say total assigned = all inspections in their projects
                'pending': inspections.filter(status='pending').count(),
                'in_progress': inspections.filter(status='in_progress').count(),
                'completed': inspections.filter(status='completed').count(),
                'needs_reinspection': inspections.filter(status='needs_reinspection').count(),
            },
            'defects': {
                'open': defects.filter(status='open').count(),
                'high_priority': defects.filter(priority='high').exclude(status__in=['closed', 'resolved', 'cancelled']).count(),
                'critical': defects.filter(priority='critical').exclude(status__in=['closed', 'resolved', 'cancelled']).count(),
                'awaiting_reinspection': defects.filter(status='waiting_for_reinspection').count(),
                'assigned_to_contractors': defects.filter(status__in=['assigned', 'accepted', 'in_progress']).count(),
            }
        })

