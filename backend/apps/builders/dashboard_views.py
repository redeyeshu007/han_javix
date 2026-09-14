from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
import datetime

from apps.projects.models import Project, Unit
from apps.inspections.models import Defect


class BuilderDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user

        if not user.builder_company:
            return Response({'error': 'User does not belong to a builder company.'}, status=403)

        builder = user.builder_company

        # ── Projects ──────────────────────────────────────────────────
        projects = Project.objects.filter(builder_company=builder)
        total_projects = projects.count()
        active_projects = projects.filter(status='active').count()

        # ── Units ─────────────────────────────────────────────────────
        units = Unit.objects.filter(floor__block__project__in=projects)
        total_units = units.count()

        units_nearing_handover = units.filter(
            status__in=[
                'customer_inspection_ready',
                'customer_inspection_completed',
                'handover_preparation',
                'ready_for_handover',
                'handover_scheduled',
            ]
        ).count()

        customer_handovers = units.filter(status='handed_over').count()

        # ── Defects ───────────────────────────────────────────────────
        defects = Defect.objects.filter(unit__in=units)
        open_defects = defects.exclude(status__in=['resolved', 'closed', 'cancelled']).count()

        # ── Needs Attention ───────────────────────────────────────────
        attention_items = []
        critical_defects = defects.filter(
            priority='critical'
        ).exclude(status__in=['resolved', 'closed', 'cancelled']).count()

        if critical_defects > 0:
            attention_items.append({
                'title': 'Critical Defects',
                'count': critical_defects,
                'description': 'Require immediate resolution',
                'link': '/builder/defects',
            })

        if units_nearing_handover > 0:
            attention_items.append({
                'title': 'Units Nearing Handover',
                'count': units_nearing_handover,
                'description': 'Awaiting final preparations',
                'link': '/builder/handover',
            })

        pending_inspections = units.filter(
            status='customer_inspection_ready'
        ).count()
        if pending_inspections > 0:
            attention_items.append({
                'title': 'Pending Inspections',
                'count': pending_inspections,
                'description': 'Customer inspections scheduled',
                'link': '/builder/inspections',
            })

        # ── Real Chart Data: last 6 months ────────────────────────────
        today = timezone.now()
        six_months_ago = today - datetime.timedelta(days=182)

        # Units created per month
        units_by_month = (
            units
            .filter(created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Handed-over units per month (updated_at when status changed)
        handovers_by_month = (
            units
            .filter(status='handed_over', updated_at__gte=six_months_ago)
            .annotate(month=TruncMonth('updated_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Defects reported per month
        defects_by_month = (
            defects
            .filter(reported_date__gte=six_months_ago)
            .annotate(month=TruncMonth('reported_date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        # Build a month-keyed lookup
        units_map = {row['month'].strftime('%b %Y'): row['count'] for row in units_by_month}
        handovers_map = {row['month'].strftime('%b %Y'): row['count'] for row in handovers_by_month}
        defects_map = {row['month'].strftime('%b %Y'): row['count'] for row in defects_by_month}

        # Generate ordered list for the last 6 months (oldest → newest)
        chart_data = []
        for i in range(5, -1, -1):
            month_dt = (today.replace(day=1) - datetime.timedelta(days=i * 30)).replace(day=1)
            label = month_dt.strftime('%b %Y')
            chart_data.append({
                'name': month_dt.strftime('%b'),       # Short label: Jan, Feb …
                'full_label': label,
                'Units': units_map.get(label, 0),
                'Handovers': handovers_map.get(label, 0),
                'Defects': defects_map.get(label, 0),
            })

        data = {
            'kpis': {
                'total_projects': total_projects,
                'active_projects': active_projects,
                'total_units': total_units,
                'units_nearing_handover': units_nearing_handover,
                'open_defects': open_defects,
                'customer_handovers': customer_handovers,
                'financial_clearance_pending': 0,
                'association_handover_status': 'Pending',
            },
            'needs_attention': attention_items,
            'chart_data': chart_data,
        }

        return Response(data)
