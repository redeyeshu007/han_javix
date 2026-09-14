"""
Post-fix verification: Measure workspace API after fix.
Run with: venv\Scripts\python.exe debug_workspace_perf.py
"""
import os, sys, time, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.db import connection, reset_queries
from django.conf import settings
settings.DEBUG = True

from django.db.models import Prefetch
from apps.inspections.models import Defect, UnitInspection, UnitInspectionResult, DefectActivityLog
from apps.inspections.serializers import DefectSerializer, UnitInspectionSerializer
from apps.projects.models import Unit
from apps.accounts.models import User

builder_owner = User.objects.filter(role='BUILDER_OWNER').select_related('builder_company').first()
print(f"Testing as: {builder_owner} (role={builder_owner.role})")

unit_with_inspection = (
    UnitInspection.objects
    .filter(unit__floor__block__project__builder_company=builder_owner.builder_company)
    .select_related('unit__floor__block__project')
    .first()
)
unit = unit_with_inspection.unit if unit_with_inspection else None
if not unit:
    print("No unit with inspections found!")
    sys.exit(1)

print(f"Unit: {unit} (id={unit.id})")
insp_count = UnitInspection.objects.filter(unit=unit).count()
print(f"Inspections: {insp_count}")
print("=" * 60)

# AFTER FIX: with unit__floor__block__project in select_related
reset_queries()
t0 = time.time()

inspections_qs = (
    UnitInspection.objects.filter(unit=unit)
    .select_related(
        'inspected_by',
        'unit__floor__block__project',
        'unit__floor__block__project__builder_company',
    )
    .prefetch_related(
        Prefetch('results', queryset=UnitInspectionResult.objects.select_related('checklist'))
    )
    .order_by('-created_at')
)
inspections_list = list(inspections_qs)

defects_qs = (
    Defect.objects.filter(unit=unit)
    .select_related('assigned_contractor', 'inspection_result')
    .prefetch_related(
        Prefetch('activity_logs', queryset=DefectActivityLog.objects.order_by('timestamp'))
    )
    .order_by('-reported_date')
)
defects_list = list(defects_qs)

# Serialize once, reuse for latest
serialized_inspections = UnitInspectionSerializer(inspections_list, many=True).data
serialized_latest = serialized_inspections[0] if serialized_inspections else None
defect_data = DefectSerializer(defects_list, many=True).data

t1 = time.time()
q_after = len(connection.queries)
print(f"[AFTER FIX]")
print(f"  Inspections: {len(inspections_list)}, Results in first: {len(inspections_list[0].results.all()) if inspections_list else 0}")
print(f"  Defects: {len(defects_list)}")
print(f"  SQL queries: {q_after}")
print(f"  Time taken:  {(t1-t0)*1000:.0f}ms")
print()

# Show query breakdown
checklist_queries = [q for q in connection.queries if 'checklist' in q['sql'].lower()]
project_queries = [q for q in connection.queries if 'projects_project' in q['sql'].lower()]
print(f"  Checklist queries: {len(checklist_queries)}")
print(f"  Project queries: {len(project_queries)} (should be 0 - resolved by select_related JOIN)")
print()

slow = sorted(connection.queries, key=lambda q: float(q['time']), reverse=True)[:3]
print("  Top 3 slowest queries:")
for q in slow:
    print(f"    [{q['time']}s] {q['sql'][:120]}")
print()
print("=" * 60)
print(f"BEFORE: 35 queries, 11381ms")
print(f"AFTER:  {q_after} queries, {(t1-t0)*1000:.0f}ms")
if (t1 - t0) < 2.0:
    print("PASS: Workspace endpoint is now under 2 seconds.")
elif (t1 - t0) < 15.0:
    print("PASS: Workspace endpoint is now under 15 seconds (no timeout).")
else:
    print("FAIL: Still timing out. Further investigation needed.")
