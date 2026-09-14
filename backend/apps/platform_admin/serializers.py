from rest_framework import serializers
from .models import SubscriptionPlan, Checklist, AuditLog, SubscriptionBilling


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class ChecklistSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField(read_only=True)
    updated_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Checklist
        fields = '__all__'
        read_only_fields = ('created_by', 'updated_by')

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.email
        return None

    def get_updated_by_name(self, obj):
        if obj.updated_by:
            return obj.updated_by.get_full_name() or obj.updated_by.email
        return None


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.email
        return None


class SubscriptionBillingSerializer(serializers.ModelSerializer):
    builder_name = serializers.CharField(source='builder.company_name', read_only=True)
    builder_status = serializers.CharField(source='builder.status', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_billing_cycle = serializers.CharField(source='plan.billing_cycle', read_only=True)
    recorded_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SubscriptionBilling
        fields = '__all__'
        read_only_fields = ('recorded_by',)

    def get_recorded_by_name(self, obj):
        if obj.recorded_by:
            return obj.recorded_by.get_full_name() or obj.recorded_by.email
        return None

    def validate(self, attrs):
        start = attrs.get('billing_period_start')
        end = attrs.get('billing_period_end')
        if start and end and start > end:
            raise serializers.ValidationError({
                'billing_period_end': 'Billing period end must be after start date.'
            })
        return attrs
