from rest_framework import serializers

from .models import (
    UnitInspection,
    UnitInspectionResult,
    Defect,
    DefectActivityLog,
)


class UnitInspectionResultSerializer(serializers.ModelSerializer):
    checklist_id = serializers.UUIDField(source='checklist.id', read_only=True)
    checklist_name = serializers.CharField(source='checklist.name', read_only=True)

    class Meta:
        model = UnitInspectionResult
        fields = [
            'id',
            'inspection',
            'checklist',
            'checklist_id',
            'checklist_name',
            'snapshot_item_text',
            'snapshot_category',
            'result',
            'remarks',
        ]
        read_only_fields = ['inspection']


class UnitInspectionResultInputSerializer(serializers.Serializer):
    """Write-only: used for nested results during inspection creation."""
    checklist = serializers.UUIDField()
    snapshot_item_text = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')
    snapshot_category = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    result = serializers.ChoiceField(choices=['not_inspected', 'passed', 'defect_found', 'not_applicable', 'resolved'])
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')


# ---------------------------------------------------------------------------
# LIST serializer — used for GET /inspections/ (no results rows to avoid N+1)
# ---------------------------------------------------------------------------

class UnitInspectionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the inspections list endpoint.

    Deliberately EXCLUDES the `results` field which causes catastrophic N+1
    queries (one SELECT per inspection row to load results, then another per
    result row to load the related Checklist).  The `results` detail is only
    needed on the single-inspection workspace page, which uses the full
    UnitInspectionSerializer via the retrieve() action.

    The unit/project name fields are resolved entirely from the
    select_related() join produced by get_queryset() — zero extra queries.
    """
    unit_name = serializers.CharField(source='unit.unit_number', read_only=True, default='')
    project_name = serializers.SerializerMethodField()
    project_id = serializers.SerializerMethodField()

    def get_project_name(self, obj):
        try:
            return obj.unit.floor.block.project.name
        except Exception:
            return ''

    def get_project_id(self, obj):
        try:
            return str(obj.unit.floor.block.project.id)
        except Exception:
            return ''

    class Meta:
        model = UnitInspection
        fields = [
            'id',
            'unit',
            'unit_name',
            'project_name',
            'project_id',
            'inspection_type',
            'inspected_by',
            'status',
            'scheduled_date',
            'completed_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'inspected_by',
            'completed_date',
            'created_at',
            'updated_at',
        ]


# ---------------------------------------------------------------------------
# DETAIL serializer — used for retrieve/create/update (includes results)
# ---------------------------------------------------------------------------

class UnitInspectionSerializer(serializers.ModelSerializer):
    results = UnitInspectionResultSerializer(many=True, read_only=True)
    results_input = UnitInspectionResultInputSerializer(many=True, write_only=True, required=False)

    # Denormalised read-only fields so the frontend can display the project/unit
    # name without an extra API round-trip (fixes the "Unknown" project label).
    unit_name = serializers.CharField(source='unit.unit_number', read_only=True, default='')
    project_name = serializers.SerializerMethodField()
    project_id = serializers.SerializerMethodField()

    def get_project_name(self, obj):
        try:
            return obj.unit.floor.block.project.name
        except Exception:
            return ''

    def get_project_id(self, obj):
        try:
            return str(obj.unit.floor.block.project.id)
        except Exception:
            return ''

    class Meta:
        model = UnitInspection
        fields = [
            'id',
            'unit',
            'unit_name',
            'project_name',
            'project_id',
            'inspection_type',
            'inspected_by',
            'status',
            'scheduled_date',
            'completed_date',
            'created_at',
            'updated_at',
            'results',
            'results_input',
        ]
        read_only_fields = [
            'inspected_by',
            'completed_date',
            'created_at',
            'updated_at',
        ]

    def create(self, validated_data):
        results_data = validated_data.pop('results_input', [])
        inspection = UnitInspection.objects.create(**validated_data)
        if results_data:
            from apps.platform_admin.models import Checklist as PlatformChecklist
            # Bulk-fetch all checklist items in one query instead of one per item
            checklist_ids = [r['checklist'] for r in results_data]
            checklists_by_id = {
                str(c.pk): c
                for c in PlatformChecklist.objects.filter(pk__in=checklist_ids)
            }
            to_create = []
            for r in results_data:
                item_obj = checklists_by_id.get(str(r['checklist']))
                if not item_obj:
                    continue
                to_create.append(UnitInspectionResult(
                    inspection=inspection,
                    checklist=item_obj,
                    snapshot_item_text=r.get('snapshot_item_text', '') or item_obj.name,
                    snapshot_category=r.get('snapshot_category', '') or item_obj.category or 'General',
                    result=r.get('result', 'not_inspected'),
                    remarks=r.get('remarks', ''),
                ))
            if to_create:
                UnitInspectionResult.objects.bulk_create(to_create)
        return inspection

    def update(self, instance, validated_data):
        results_data = validated_data.pop('results_input', None)
        inspection = super().update(instance, validated_data)

        if results_data is not None:
            from apps.platform_admin.models import Checklist as PlatformChecklist

            # Map existing results by checklist ID (single query)
            existing_results = {str(r.checklist_id): r for r in inspection.results.all() if r.checklist_id}

            # Bulk-fetch new checklist items needed for creation (single query)
            new_ids = [str(r['checklist']) for r in results_data if str(r['checklist']) not in existing_results]
            new_checklists = {}
            if new_ids:
                new_checklists = {
                    str(c.pk): c
                    for c in PlatformChecklist.objects.filter(pk__in=new_ids)
                }

            to_create = []
            to_update_objs = []

            for r in results_data:
                checklist_id = str(r['checklist'])
                if checklist_id in existing_results:
                    # Update existing result — collect for bulk_update
                    existing_result = existing_results[checklist_id]
                    existing_result.result = r.get('result', existing_result.result)
                    existing_result.remarks = r.get('remarks', existing_result.remarks)
                    to_update_objs.append(existing_result)
                else:
                    item_obj = new_checklists.get(checklist_id)
                    if not item_obj:
                        continue
                    to_create.append(UnitInspectionResult(
                        inspection=inspection,
                        checklist=item_obj,
                        snapshot_item_text=r.get('snapshot_item_text', '') or item_obj.name,
                        snapshot_category=r.get('snapshot_category', '') or item_obj.category or 'General',
                        result=r.get('result', 'not_inspected'),
                        remarks=r.get('remarks', ''),
                    ))

            if to_update_objs:
                UnitInspectionResult.objects.bulk_update(to_update_objs, ['result', 'remarks'])
            if to_create:
                UnitInspectionResult.objects.bulk_create(to_create)

        return inspection


class DefectActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefectActivityLog
        fields = [
            'id',
            'defect',
            'action',
            'performed_by',
            'remarks',
            'timestamp',
        ]
        read_only_fields = [
            'performed_by',
            'timestamp',
        ]


class DefectSerializer(serializers.ModelSerializer):
    activity_logs = DefectActivityLogSerializer(
        many=True,
        read_only=True
    )

    def validate(self, attrs):
        request = self.context.get('request')
        unit = attrs.get('unit') or (self.instance.unit if self.instance else None)
        contractor = attrs.get('assigned_contractor') or (
            self.instance.assigned_contractor if self.instance else None)

        # Company safety: the defect's unit must belong to the requester's
        # builder company (super admins bypass, as elsewhere in the app).
        if unit and request and request.user.role != 'SUPER_ADMIN' \
                and request.user.builder_company_id \
                and unit.floor.block.project.builder_company_id != request.user.builder_company_id:
            raise serializers.ValidationError(
                {'unit': 'Defects can only be created for units of your builder company.'})

        # A defect may only be assigned to a contractor of the same builder company.
        if unit and contractor and contractor.builder_company_id and \
                contractor.builder_company_id != unit.floor.block.project.builder_company_id:
            raise serializers.ValidationError(
                {'assigned_contractor': 'Contractor must belong to the same builder company as the unit.'})
        return attrs

    def create(self, validated_data):
        from apps.builders.utils import check_and_update_storage
        unit = validated_data.get('unit')
        if unit and unit.floor.block.project.builder_company:
            builder = unit.floor.block.project.builder_company
            for field in ['photo', 'video', 'evidence']:
                file_obj = validated_data.get(field)
                if file_obj:
                    check_and_update_storage(builder, file_obj.size)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from apps.builders.utils import check_and_update_storage
        builder = instance.unit.floor.block.project.builder_company
        if builder:
            for field in ['photo', 'video', 'evidence']:
                file_obj = validated_data.get(field)
                if file_obj:
                    check_and_update_storage(builder, file_obj.size)
        return super().update(instance, validated_data)

    class Meta:
        model = Defect
        fields = [
            'id',
            'unit',
            'inspection_result',
            'category',
            'description',
            'photo',
            'priority',
            'status',
            'assigned_contractor',
            'reported_by',
            'reported_date',
            'expected_completion_date',
            'resolved_date',
            'reopen_reason',
            'activity_logs',
        ]
        read_only_fields = [
            'reported_by',
            'reported_date',
            'resolved_date',
            'activity_logs',
        ]
