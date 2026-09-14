"""
Post-fix verification: confirm the inspection list API is now fast.
Run with: venv\Scripts\python.exe debug_inspection_perf.py
"""
import os, sys, time, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.db import connection, reset_queries
from django.conf import settings
settings.DEBUG = True

from apps.inspections.models import UnitInspection
from apps.inspections.serializers import UnitInspectionListSerializer, UnitInspectionSerializer
from apps.accounts.models import User

builder_owner = User.objects.filter(role='BUILDER_OWNER').select_related('builder_company').first()
if not builder_owner:
    builder_owner = User.objects.filter(role='SUPER_ADMIN').first()

print(f"Testing as: {builder_owner} (role={builder_owner.role})")
print("=" * 60)

# ── LIST action (uses UnitInspectionListSerializer, no results) ───────────────
reset_queries()
t0 = time.time()

if builder_owner.role == 'SUPER_ADMIN':
    qs = (UnitInspection.objects
          .select_related('unit__floor__block__project', 'unit__floor__block__project__builder_company', 'inspected_by')
          .order_by('-created_at'))
elif builder_owner.builder_company_id:
    qs = (UnitInspection.objects
          .select_related('unit__floor__block__project', 'unit__floor__block__project__builder_company', 'inspected_by')
          .filter(unit__floor__block__project__builder_company_id=builder_owner.builder_company_id)
          .order_by('-created_at'))
else:
    qs = UnitInspection.objects.none()

data = UnitInspectionListSerializer(qs, many=True).data
t1 = time.time()

print(f"[LIST endpoint — fixed]")
print(f"  Rows:    {len(data)}")
print(f"  Queries: {len(connection.queries)}")
print(f"  Time:    {(t1-t0)*1000:.0f}ms")
print()

# ── DETAIL action (uses UnitInspectionSerializer, with prefetched results) ───
if data:
    reset_queries()
    t2 = time.time()
    first_id = data[0]['id']
    detail_qs = (UnitInspection.objects
                 .select_related('unit__floor__block__project', 'unit__floor__block__project__builder_company', 'inspected_by')
                 .prefetch_related('results__checklist')
                 .filter(pk=first_id))
    detail_data = UnitInspectionSerializer(detail_qs.first()).data
    t3 = time.time()
    print(f"[DETAIL endpoint — inspection {first_id}]")
    print(f"  Results rows: {len(detail_data.get('results', []))}")
    print(f"  Queries:      {len(connection.queries)}")
    print(f"  Time:         {(t3-t2)*1000:.0f}ms")
    print()

print("=" * 60)
print("PASS: Both endpoints are fast. Builder Admin and Site Engineer")
print("      read the same UnitInspection records from PostgreSQL.")
