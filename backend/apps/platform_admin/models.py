from django.db import models
from django.conf import settings
import uuid

class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    billing_cycle = models.CharField(max_length=50, choices=[('Monthly', 'Monthly'), ('Yearly', 'Yearly')], default='Monthly')
    max_projects = models.IntegerField(default=1)
    max_units = models.IntegerField(default=10)
    max_users = models.IntegerField(default=1)
    storage_limit_gb = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    features = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'platform_admin_subscription_plan'

    def __str__(self):
        return self.name

class Checklist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50, choices=[('Active', 'Active'), ('Archived', 'Archived')], default='Active')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_checklists')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='updated_checklists')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'platform_admin_checklist'

    def __str__(self):
        return self.name

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    entity_type = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'platform_admin_audit_log'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} by {self.actor} on {self.created_at}"


class SubscriptionBilling(models.Model):
    """
    Tracks subscription payment state for each builder per billing period.
    Super Admin uses this to record payments (Paid/Overdue/Pending).
    No payment gateway — Super Admin manually records/confirms payments.
    """
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    builder = models.ForeignKey(
        'builders.BuilderCompany',
        on_delete=models.CASCADE,
        related_name='billing_records'
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True,
        related_name='billing_records'
    )
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    amount_due = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )
    due_date = models.DateField()
    paid_date = models.DateField(null=True, blank=True)
    payment_reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recorded_billings'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'platform_admin_subscription_billing'
        ordering = ['-billing_period_start']
        # Prevent duplicate billing records for the same period
        unique_together = [['builder', 'billing_period_start', 'billing_period_end']]

    def __str__(self):
        return f"{self.builder.company_name} — {self.billing_period_start} to {self.billing_period_end} [{self.payment_status}]"

