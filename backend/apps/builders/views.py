from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum
from apps.accounts.permissions import IsSuperAdmin
from .models import BuilderCompany
from .serializers import BuilderCompanySerializer


class BuilderCompanyViewSet(viewsets.ModelViewSet):
    serializer_class = BuilderCompanySerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['company_name', 'email', 'contact_name']

    def get_queryset(self):
        qs = BuilderCompany.objects.select_related('owner', 'subscription_plan').annotate(
            _project_count=Count('projects', distinct=True)
        )
        # Status filter: ?status=ACTIVE|SUSPENDED|PENDING_REVIEW
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status__iexact=status_param)
        return qs.order_by('-joined_at')

    @action(detail=True, methods=['get'], url_path='details')
    def details(self, request, pk=None):
        """
        Efficient single-request aggregate payload for the Super Admin Builder Details page.

        Returns:
          builder       – full company record
          subscription  – current plan + billing
          usage         – real project / unit / active_user / storage counts
          limits        – plan limits (or None if no plan assigned)
          projects      – project list with per-project unit counts
        """
        from django.db.models import Count, Sum, Q
        from apps.projects.models import Project, Unit
        from django.contrib.auth import get_user_model
        from apps.platform_admin.models import SubscriptionBilling

        User = get_user_model()
        builder = self.get_object()

        # ── Project list with per-project unit counts (one query) ─────────────
        projects_qs = (
            Project.objects
            .filter(builder_company=builder)
            .annotate(
                unit_count=Count('blocks__floors__units', distinct=True)
            )
            .order_by('-created_at')
        )
        projects_list = list(projects_qs)

        # ── Aggregate totals ──────────────────────────────────────────────────
        total_projects = len(projects_list)
        total_units = sum(p.unit_count for p in projects_list)

        # Active users: staff of this builder company who are active, excluding customers
        allowed_roles = [
            'BUILDER_OWNER', 'PROJECT_ADMIN',
            'SITE_ENGINEER', 'ACCOUNTS', 'CONTRACTOR',
        ]
        active_users = (
            User.objects
            .filter(
                builder_company=builder,
                is_active=True,
                role__in=allowed_roles,
            )
            .count()
        )

        storage_used_bytes = builder.storage_used_bytes or 0

        # ── Subscription plan ─────────────────────────────────────────────────
        plan = builder.subscription_plan
        subscription_payload = None
        limits_payload = None
        if plan:
            subscription_payload = {
                'id': str(plan.id),
                'name': plan.name,
                'billing_cycle': plan.billing_cycle,
                'price': str(plan.price),
            }
            limits_payload = {
                'max_projects': plan.max_projects,
                'max_units': plan.max_units,
                'max_users': plan.max_users,
                'storage_limit_gb': float(plan.storage_limit_gb),
            }

        # Latest billing record for this builder
        latest_billing = (
            SubscriptionBilling.objects
            .filter(builder=builder)
            .order_by('-billing_period_start')
            .first()
        )
        billing_payload = None
        if latest_billing:
            billing_payload = {
                'id': str(latest_billing.id),
                'payment_status': latest_billing.payment_status,
                'billing_period_start': str(latest_billing.billing_period_start),
                'billing_period_end': str(latest_billing.billing_period_end),
                'amount_due': str(latest_billing.amount_due),
                'amount_paid': str(latest_billing.amount_paid),
            }

        # ── Project summary ───────────────────────────────────────────────────
        projects_payload = [
            {
                'id': p.id,
                'name': p.name,
                'project_type': p.project_type,
                'status': p.status,
                'unit_count': p.unit_count,
                'start_date': str(p.start_date) if p.start_date else None,
                'expected_completion_date': str(p.expected_completion_date) if p.expected_completion_date else None,
                'created_at': p.created_at.isoformat(),
            }
            for p in projects_list
        ]

        # ── Builder payload ───────────────────────────────────────────────────
        builder_payload = BuilderCompanySerializer(builder, context={'request': request}).data

        return Response({
            'builder': builder_payload,
            'subscription': subscription_payload,
            'billing': billing_payload,
            'usage': {
                'projects': total_projects,
                'units': total_units,
                'active_users': active_users,
                'storage_used_bytes': storage_used_bytes,
                'storage_used_gb': round(storage_used_bytes / (1024 ** 3), 3),
            },
            'limits': limits_payload,
            'projects': projects_payload,
        })

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        builder = self.get_object()
        builder.status = 'ACTIVE'
        builder.save()
        return Response({'status': 'Builder approved', 'new_status': 'ACTIVE'})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        builder = self.get_object()
        builder.status = 'SUSPENDED'
        builder.save()
        return Response({'status': 'Builder suspended', 'new_status': 'SUSPENDED'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        builder = self.get_object()
        builder.status = 'ACTIVE'
        builder.save()
        return Response({'status': 'Builder activated', 'new_status': 'ACTIVE'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        builder = self.get_object()
        builder.status = 'REJECTED'
        builder.save()
        return Response({'status': 'Builder rejected', 'new_status': 'REJECTED'})
