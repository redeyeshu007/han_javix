"""
Add database indexes for Unit, Floor, Block, Project lookup performance.

These fields are traversed on every workspace request via:
  unit__floor__block__project__builder_company

FKs already have auto-indexes in PostgreSQL, but explicit composite indexes
on the ordering fields significantly speed up list queries.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0008_remove_project_project_manager'),
    ]

    operations = [
        # Unit.status — used in workspace readiness checks and unit list filters
        migrations.AddIndex(
            model_name='unit',
            index=models.Index(
                fields=['status'],
                name='unit_status_idx',
            ),
        ),
        # Unit(floor, status) — workspace retrieval by floor + ordering
        migrations.AddIndex(
            model_name='unit',
            index=models.Index(
                fields=['floor', 'status'],
                name='unit_floor_status_idx',
            ),
        ),
        # Unit.created_at — list ordering
        migrations.AddIndex(
            model_name='unit',
            index=models.Index(
                fields=['-created_at'],
                name='unit_createdat_idx',
            ),
        ),
        # Project.builder_company — the most common top-level scope filter
        migrations.AddIndex(
            model_name='project',
            index=models.Index(
                fields=['builder_company'],
                name='project_builderco_idx',
            ),
        ),
    ]
