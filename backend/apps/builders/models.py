from django.db import models
from django.conf import settings
from apps.platform_admin.models import SubscriptionPlan
import uuid

class BuilderCompany(models.Model):
    STATUS_CHOICES = [
        ('PENDING_REVIEW', 'Pending Review'),
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
        ('REJECTED', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company_name = models.CharField(max_length=255)
    registered_address = models.TextField(blank=True)
    contact_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    logo = models.URLField(blank=True, null=True)
    registration_number = models.CharField(max_length=100, blank=True)
    business_registration_details = models.TextField(blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='PENDING_REVIEW')
    
    # Can be null if assigned later
    subscription_plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='builders')
    
    # Real-time tracking of file storage quota
    storage_used_bytes = models.BigIntegerField(default=0)

    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='owned_builder')
    
    joined_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'builders_builder_company'

    def __str__(self):
        return self.company_name
