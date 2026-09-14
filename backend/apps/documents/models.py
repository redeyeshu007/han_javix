from django.db import models
from django.conf import settings

class Document(models.Model):
    DOCUMENT_TYPES = (
        ('PROJECT_DOC', 'Project Document'),
        ('CUSTOMER_DOC', 'Customer Document'),
        ('DEFECT_EVIDENCE', 'Defect Evidence'),
        ('WARRANTY', 'Warranty Document'),
        ('RECEIPT', 'Payment Receipt'),
        ('HANDOVER_CERT', 'Handover Certificate'),
        ('OTHER', 'Other'),
    )

    STATUS_CHOICES = (
        ('REQUIRED', 'Required'),
        ('REQUESTED', 'Requested'),
        ('UPLOADED', 'Uploaded'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
        ('NOT_APPLICABLE', 'Not Applicable'),
    )

    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, default='OTHER')
    category = models.CharField(max_length=100, blank=True, default='General')
    file = models.FileField(upload_to='documents/')
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    
    builder_company = models.ForeignKey(
        'builders.BuilderCompany',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    unit = models.ForeignKey(
        'projects.Unit',
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='customer_documents',
        null=True,
        blank=True
    )
    defect = models.ForeignKey(
        'inspections.Defect',
        on_delete=models.CASCADE,
        related_name='evidence_documents',
        null=True,
        blank=True
    )
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='APPROVED')
    rejection_reason = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='uploaded_documents',
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.builder_company:
            if self.project and self.project.builder_company:
                self.builder_company = self.project.builder_company
            elif self.unit and self.unit.floor.block.project.builder_company:
                self.builder_company = self.unit.floor.block.project.builder_company
        if not self.project and self.unit:
            self.project = self.unit.floor.block.project
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.status})"
