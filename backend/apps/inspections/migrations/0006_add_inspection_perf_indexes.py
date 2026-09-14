"""
Add database indexes on the most-queried inspection fields.

Indexes added:
- UnitInspection.unit      (FK already indexed by Django, but add composite
                            with created_at for ORDER BY performance)
- UnitInspection.status    (used in dashboard count queries)
- UnitInspection.created_at (used for ordering on every list request)
- UnitInspectionResult.inspection (FK — already indexed; explicit for clarity)
- UnitInspectionResult.checklist  (FK — already indexed; explicit for clarity)
- Defect.unit              (FK — already indexed)
- Defect.status            (used for open-defect count in completion transition)
- Defect.reported_date     (ordering field on every defect list)
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0005_remove_unitinspectionresult_unique_inspection_checklist_item_and_more'),
    ]

    operations = [
        # UnitInspection: composite index for the default order + role filter
        migrations.AddIndex(
            model_name='unitinspection',
            index=models.Index(
                fields=['unit', '-created_at'],
                name='insp_unit_createdat_idx',
            ),
        ),
        # UnitInspection.status — dashboard filter
        migrations.AddIndex(
            model_name='unitinspection',
            index=models.Index(
                fields=['status'],
                name='insp_status_idx',
            ),
        ),
        # UnitInspection.created_at — list ordering
        migrations.AddIndex(
            model_name='unitinspection',
            index=models.Index(
                fields=['-created_at'],
                name='insp_createdat_idx',
            ),
        ),
        # Defect.status — open-defect check in completion transition
        migrations.AddIndex(
            model_name='defect',
            index=models.Index(
                fields=['status'],
                name='defect_status_idx',
            ),
        ),
        # Defect.reported_date — list ordering
        migrations.AddIndex(
            model_name='defect',
            index=models.Index(
                fields=['-reported_date'],
                name='defect_reporteddate_idx',
            ),
        ),
    ]
