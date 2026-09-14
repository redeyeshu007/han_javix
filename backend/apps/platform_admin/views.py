from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.accounts.permissions import IsSuperAdmin
from .models import SubscriptionPlan, Checklist, AuditLog, SubscriptionBilling
from .serializers import SubscriptionPlanSerializer, ChecklistSerializer, AuditLogSerializer, SubscriptionBillingSerializer


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all().order_by('-created_at')
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class ChecklistViewSet(viewsets.ModelViewSet):
    queryset = Checklist.objects.order_by('-updated_at')
    serializer_class = ChecklistSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='active')
    def active(self, request):
        """
        Public read-only endpoint: all Active checklists with items.
        Accessible to any authenticated user (builder staff, site engineers, etc.)
        so the inspection flow can load canonical checklist templates.
        """
        qs = (
            Checklist.objects
            .filter(status='Active')
            .order_by('name')
        )
        return Response(ChecklistSerializer(qs, many=True).data)




class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('actor').order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class SubscriptionBillingViewSet(viewsets.ModelViewSet):
    """
    Super Admin subscription billing/payment tracking.
    GET  /platform-admin/subscription-billing/          – list all records
    POST /platform-admin/subscription-billing/          – create a billing record
    PATCH/PUT /platform-admin/subscription-billing/{id}/ – update a record
    POST /platform-admin/subscription-billing/{id}/record_payment/ – mark as PAID
    """
    serializer_class = SubscriptionBillingSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        qs = SubscriptionBilling.objects.select_related(
            'builder', 'plan', 'recorded_by'
        )
        builder_id = self.request.query_params.get('builder')
        if builder_id:
            qs = qs.filter(builder_id=builder_id)
        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            qs = qs.filter(payment_status__iexact=payment_status)
        return qs.order_by('-billing_period_start')

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """
        Mark a billing record as PAID.
        Body: { amount_paid, paid_date, payment_reference (optional), notes (optional) }
        """
        billing = self.get_object()
        amount_paid = request.data.get('amount_paid', billing.amount_due)
        paid_date = request.data.get('paid_date')
        payment_reference = request.data.get('payment_reference', '')
        notes = request.data.get('notes', '')

        if not paid_date:
            from django.utils import timezone
            paid_date = timezone.now().date()

        billing.amount_paid = amount_paid
        billing.paid_date = paid_date
        billing.payment_status = 'PAID'
        billing.payment_reference = payment_reference
        if notes:
            billing.notes = notes
        billing.recorded_by = request.user
        billing.save()

        return Response(
            SubscriptionBillingSerializer(billing).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def mark_overdue(self, request, pk=None):
        """Mark a billing record as OVERDUE."""
        billing = self.get_object()
        billing.payment_status = 'OVERDUE'
        billing.recorded_by = request.user
        billing.save()
        return Response(
            SubscriptionBillingSerializer(billing).data,
            status=status.HTTP_200_OK
        )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request):
        from apps.builders.models import BuilderCompany
        from django.contrib.auth import get_user_model
        from django.db.models import Count
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        from datetime import timedelta

        User = get_user_model()

        # ── KPIs ────────────────────────────────────────────────────────────
        total_builders = BuilderCompany.objects.count()
        active_builders = BuilderCompany.objects.filter(status='ACTIVE').count()
        pending_reviews = BuilderCompany.objects.filter(status='PENDING_REVIEW').count()
        suspended_builders = BuilderCompany.objects.filter(status='SUSPENDED').count()
        active_users = User.objects.filter(is_active=True).exclude(role='SUPER_ADMIN').count()

        # Real project + unit counts
        total_projects = 0
        total_units = 0
        try:
            from apps.projects.models import Project, Unit
            total_projects = Project.objects.count()
            total_units = Unit.objects.count()
        except Exception:
            pass

        # ── Subscription distribution ────────────────────────────────────────
        plan_counts = (
            BuilderCompany.objects
            .exclude(subscription_plan__isnull=True)
            .values('subscription_plan__name', 'subscription_plan__id')
            .annotate(count=Count('id'))
        )
        subscription_distribution = [
            {
                'name': row['subscription_plan__name'],
                'id': str(row['subscription_plan__id']),
                'count': row['count'],
            }
            for row in plan_counts
        ]

        # ── Growth: builders joined per month (last 6 months) ──────────────
        six_months_ago = timezone.now() - timedelta(days=182)
        monthly_growth = (
            BuilderCompany.objects
            .filter(joined_at__gte=six_months_ago)
            .annotate(month=TruncMonth('joined_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        growth = [
            {
                'month': row['month'].strftime('%b %Y'),
                'builders': row['count'],
            }
            for row in monthly_growth
        ]

        # ── Attention items ──────────────────────────────────────────────────
        attention = []
        if pending_reviews > 0:
            attention.append({
                'title': 'Pending Builder Reviews',
                'count': pending_reviews,
                'link': '/admin/builders?status=PENDING_REVIEW',
                'type': 'warning',
            })
        if suspended_builders > 0:
            attention.append({
                'title': 'Suspended Accounts',
                'count': suspended_builders,
                'link': '/admin/builders?status=SUSPENDED',
                'type': 'danger',
            })

        return Response({
            'kpis': {
                'total_builders': total_builders,
                'active_builders': active_builders,
                'pending_reviews': pending_reviews,
                'suspended_builders': suspended_builders,
                'active_users': active_users,
                'total_projects': total_projects,
                'total_units': total_units,
            },
            'attention': attention,
            'subscription_distribution': subscription_distribution,
            'growth': growth,
        })
