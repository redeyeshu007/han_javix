from rest_framework import serializers
from .models import PaymentClearance, HandoverRecord, ServiceRequest, AssociationTransition, Charge, PaymentRecord

class PaymentClearanceSerializer(serializers.ModelSerializer):
    unit_number = serializers.ReadOnlyField(source='unit.unit_number')
    customer_name = serializers.ReadOnlyField(source='customer.name')
    verified_by_name = serializers.ReadOnlyField(source='verified_by.name')

    class Meta:
        model = PaymentClearance
        fields = [
            'id', 'unit', 'unit_number', 'customer', 'customer_name',
            'unit_amount', 'amount_received', 'pending_amount',
            'maintenance_deposit', 'corpus_fund', 'registration_charges',
            'utility_charges', 'additional_work_charges', 'late_fees',
            'refundable_deposits', 'status', 'receipt_file',
            'verified_by', 'verified_by_name', 'verified_at', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'pending_amount', 'created_at', 'updated_at',
            # Server-owned: the viewset stamps these from request.user on
            # verified status transitions. Client-sent values are ignored.
            'verified_by', 'verified_at'
        ]

    def create(self, validated_data):
        from apps.builders.utils import check_and_update_storage
        unit = validated_data.get('unit')
        if unit and unit.floor.block.project.builder_company:
            builder = unit.floor.block.project.builder_company
            file_obj = validated_data.get('receipt_file')
            if file_obj:
                check_and_update_storage(builder, file_obj.size)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from apps.builders.utils import check_and_update_storage
        builder = instance.unit.floor.block.project.builder_company
        if builder:
            file_obj = validated_data.get('receipt_file')
            if file_obj:
                check_and_update_storage(builder, file_obj.size)
        return super().update(instance, validated_data)


class HandoverRecordSerializer(serializers.ModelSerializer):
    unit_number = serializers.ReadOnlyField(source='unit.unit_number')
    customer_name = serializers.ReadOnlyField(source='customer.name')
    project_id = serializers.ReadOnlyField(source='unit.floor.block.project.id')
    project_name = serializers.ReadOnlyField(source='unit.floor.block.project.name')

    class Meta:
        model = HandoverRecord
        fields = [
            'id', 'unit', 'unit_number', 'customer', 'customer_name',
            'project_id', 'project_name', 'scheduled_date', 'actual_date',
            'status', 'meter_readings', 'keys_handed_over',
            'access_cards_handed_over',
            'customer_signature', 'handover_certificate',
            'site_engineer_approval',
            'accounts_approval', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        from apps.builders.utils import check_and_update_storage
        unit = validated_data.get('unit')
        if unit and unit.floor.block.project.builder_company:
            builder = unit.floor.block.project.builder_company
            for field in ['customer_signature', 'handover_certificate']:
                file_obj = validated_data.get(field)
                if file_obj:
                    check_and_update_storage(builder, file_obj.size)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from apps.builders.utils import check_and_update_storage
        builder = instance.unit.floor.block.project.builder_company
        if builder:
            for field in ['customer_signature', 'handover_certificate']:
                file_obj = validated_data.get(field)
                if file_obj:
                    check_and_update_storage(builder, file_obj.size)
        return super().update(instance, validated_data)


class ServiceRequestSerializer(serializers.ModelSerializer):
    unit_number = serializers.ReadOnlyField(source='unit.unit_number')
    customer_name = serializers.ReadOnlyField(source='customer.name')
    assigned_contractor_name = serializers.ReadOnlyField(source='assigned_contractor.name')

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'unit', 'unit_number', 'customer', 'customer_name',
            'title', 'description', 'category', 'priority', 'status',
            'assigned_contractor', 'assigned_contractor_name',
            'visit_date', 'resolution_notes', 'evidence',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        from apps.builders.utils import check_and_update_storage
        if 'customer' not in validated_data and self.context['request'].user.role == 'CUSTOMER':
            validated_data['customer'] = self.context['request'].user
            
        unit = validated_data.get('unit')
        if unit and unit.floor.block.project.builder_company:
            builder = unit.floor.block.project.builder_company
            file_obj = validated_data.get('evidence')
            if file_obj:
                check_and_update_storage(builder, file_obj.size)
                
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from apps.builders.utils import check_and_update_storage
        builder = instance.unit.floor.block.project.builder_company
        if builder:
            file_obj = validated_data.get('evidence')
            if file_obj:
                check_and_update_storage(builder, file_obj.size)
        return super().update(instance, validated_data)


class AssociationTransitionSerializer(serializers.ModelSerializer):
    builder_company_name = serializers.ReadOnlyField(source='builder_company.company_name')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = AssociationTransition
        fields = [
            'id', 'builder_company', 'builder_company_name',
            'project', 'project_name', 'step', 'structure_status',
            'docs_status', 'financials_status', 'assets_status',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ChargeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Charge
        fields = '__all__'
        read_only_fields = ['amount_paid', 'status', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, instance):
        if instance.created_by:
            return f"{instance.created_by.first_name} {instance.created_by.last_name}".strip() or instance.created_by.email
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['charge_type_display'] = instance.get_charge_type_display()
        # Nest basic unit & customer info efficiently. Assuming select_related is used in views.
        clearance = instance.clearance
        if clearance and clearance.unit_id:
            unit = clearance.unit
            ret['unit_details'] = {
                'id': unit.id,
                'unit_number': unit.unit_number,
                'customer_id': unit.customer_id,
                'customer_name': (unit.customer.get_full_name() or unit.customer.username) if unit.customer else "No Customer",
                'customer_email': unit.customer.email if unit.customer else None,
            }
        return ret


class PaymentRecordSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.SerializerMethodField()
    verified_by_name = serializers.ReadOnlyField(source='verified_by.name')
    rejected_by_name = serializers.ReadOnlyField(source='rejected_by.name')

    class Meta:
        model = PaymentRecord
        fields = '__all__'
        read_only_fields = [
            'recorded_by', 'created_at', 'updated_at',
            'verified_by', 'verified_at', 'rejected_by', 'rejected_at',
        ]

    def get_recorded_by_name(self, instance):
        if instance.recorded_by:
            return f"{instance.recorded_by.first_name} {instance.recorded_by.last_name}".strip() or instance.recorded_by.email
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        clearance = instance.clearance
        if clearance and clearance.unit_id:
            unit = clearance.unit
            ret['unit_details'] = {
                'id': unit.id,
                'unit_number': unit.unit_number,
                'customer_id': unit.customer_id,
                'customer_name': (unit.customer.get_full_name() or unit.customer.username) if unit.customer else "No Customer",
                'customer_email': unit.customer.email if unit.customer else None,
            }
        if instance.charge_id:
            ret['charge_details'] = {
                'id': instance.charge.id,
                'charge_type': instance.charge.charge_type,
                'charge_type_display': instance.charge.get_charge_type_display(),
                'amount': float(instance.charge.amount) if instance.charge.amount is not None else 0.0,
                'amount_paid': float(instance.charge.amount_paid) if instance.charge.amount_paid is not None else 0.0,
            }
        # Include receipt file absolute URL if available
        if instance.receipt_file:
            request = self.context.get('request')
            if request:
                ret['receipt_file_url'] = request.build_absolute_uri(instance.receipt_file.url)
            else:
                ret['receipt_file_url'] = instance.receipt_file.url
        return ret
