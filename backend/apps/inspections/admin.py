from django.contrib import admin
from .models import (
    UnitInspection,
    UnitInspectionResult,
    Defect,
    DefectActivityLog,
)





@admin.register(UnitInspection)
class UnitInspectionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'unit',
        'inspection_type',
        'inspected_by',
        'status',
        'scheduled_date',
        'completed_date',
    )
    list_filter = ('inspection_type', 'status')
    search_fields = ('unit__unit_number', 'inspected_by__email')


@admin.register(UnitInspectionResult)
class UnitInspectionResultAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'inspection',
        'checklist',
        'result',
    )
    list_filter = ('result',)


@admin.register(Defect)
class DefectAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'unit',
        'category',
        'priority',
        'status',
        'assigned_contractor',
        'reported_by',
    )
    list_filter = ('priority', 'status', 'category')
    search_fields = (
        'description',
        'unit__unit_number',
    )


@admin.register(DefectActivityLog)
class DefectActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'defect',
        'action',
        'performed_by',
        'timestamp',
    )
    list_filter = ('action',)
