from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Count
from rest_framework import serializers
from .models import BuilderCompany
from apps.platform_admin.serializers import SubscriptionPlanSerializer

User = get_user_model()


class BuilderCompanySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    subscription_plan_details = SubscriptionPlanSerializer(source='subscription_plan', read_only=True)
    project_count = serializers.SerializerMethodField(read_only=True)

    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_password = serializers.CharField(write_only=True, required=False)
    admin_name = serializers.CharField(write_only=True, required=False)
    admin_phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = BuilderCompany
        fields = '__all__'

    def get_project_count(self, obj):
        # Uses prefetch if available, otherwise counts directly.
        if hasattr(obj, '_prefetched_objects_cache') and 'projects' in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache['projects'])
        return obj.projects.count() if hasattr(obj, 'projects') else 0

    def validate(self, attrs):
        # On creation, we MUST have admin credentials to create the owner user.
        if self.instance is None:
            if not attrs.get('admin_email') or not attrs.get('admin_password'):
                raise serializers.ValidationError({
                    "admin_email": "Admin email and password are required to create a builder account."
                })
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        admin_email = validated_data.pop('admin_email', None)
        admin_password = validated_data.pop('admin_password', None)
        admin_name = validated_data.pop('admin_name', None)
        admin_phone = validated_data.pop('admin_phone', None)

        builder = super().create(validated_data)

        if admin_email and admin_password:
            name_parts = admin_name.split(' ', 1) if admin_name else ['', '']
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

            user = User.objects.create_user(
                username=admin_email,
                email=admin_email,
                password=admin_password,
                first_name=first_name,
                last_name=last_name,
                role='BUILDER_OWNER',
                builder_company=builder,
                phone=admin_phone or '',
            )

            builder.owner = user
            builder.save()

        # Create Initial SubscriptionBilling Record
        if builder.subscription_plan:
            from apps.platform_admin.models import SubscriptionBilling
            from django.utils import timezone
            from datetime import timedelta
            
            now = timezone.now().date()
            if builder.subscription_plan.billing_cycle == 'Yearly':
                end_date = now + timedelta(days=365)
            else:
                # Default to Monthly
                import calendar
                days_in_month = calendar.monthrange(now.year, now.month)[1]
                end_date = now + timedelta(days=days_in_month)
                
            SubscriptionBilling.objects.create(
                builder=builder,
                plan=builder.subscription_plan,
                billing_period_start=now,
                billing_period_end=end_date,
                amount_due=builder.subscription_plan.price,
                amount_paid=builder.subscription_plan.price,
                payment_status='PAID',
                due_date=now,
                paid_date=now,
                payment_reference='Initial Setup',
                notes='Automatically generated during onboarding.',
                recorded_by=self.context['request'].user if self.context.get('request') else None
            )

        return builder

    @transaction.atomic
    def update(self, instance, validated_data):
        # Pop write-only admin fields — they are not model fields
        validated_data.pop('admin_email', None)
        validated_data.pop('admin_password', None)
        validated_data.pop('admin_name', None)
        validated_data.pop('admin_phone', None)
        return super().update(instance, validated_data)
