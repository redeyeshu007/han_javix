from django.conf import settings
from django.db import models




class UnitInspection(models.Model):

    INSPECTION_TYPE_CHOICES = [
        ('internal', 'Internal'),
        ('customer', 'Customer'),
    ]

    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    unit = models.ForeignKey(
        'projects.Unit',
        on_delete=models.CASCADE,
        related_name='inspections'
    )

    inspection_type = models.CharField(
        max_length=20,
        choices=INSPECTION_TYPE_CHOICES
    )

    inspected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='unit_inspections'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_started'
    )

    scheduled_date = models.DateField(
        null=True,
        blank=True
    )

    completed_date = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.unit} - {self.inspection_type} inspection"


class UnitInspectionResult(models.Model):

    RESULT_CHOICES = [
        ('not_inspected', 'Not Inspected'),
        ('passed', 'Passed'),
        ('defect_found', 'Defect Found'),
        ('not_applicable', 'Not Applicable'),
        ('resolved', 'Resolved'),
    ]

    inspection = models.ForeignKey(
        UnitInspection,
        on_delete=models.CASCADE,
        related_name='results'
    )

    checklist = models.ForeignKey(
        'platform_admin.Checklist',
        on_delete=models.CASCADE,
        related_name='inspection_results',
        null=True
    )

    # Snapshot fields to prevent historical corruption if the global template changes
    snapshot_item_text = models.CharField(max_length=500, blank=True)
    snapshot_category = models.CharField(max_length=100, blank=True)

    result = models.CharField(
        max_length=30,
        choices=RESULT_CHOICES,
        default='not_inspected'
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['inspection', 'checklist'],
                name='unique_inspection_checklist'
            )
        ]

    def __str__(self):
        return f"{self.inspection} - {self.checklist}"


class Defect(models.Model):

    PRIORITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('assigned', 'Assigned'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('waiting_for_reinspection', 'Waiting for Reinspection'),
        ('rejected', 'Rejected'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('cancelled', 'Cancelled'),
    ]

    unit = models.ForeignKey(
        'projects.Unit',
        on_delete=models.CASCADE,
        related_name='defects'
    )

    inspection_result = models.ForeignKey(
        UnitInspectionResult,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='defects'
    )

    category = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Category of the defect (e.g., Plumbing, Electrical)."
    )

    description = models.TextField()

    photo = models.FileField(
        upload_to='defects/photos/',
        null=True,
        blank=True
    )
    video = models.FileField(
        upload_to='defects/videos/',
        null=True,
        blank=True
    )
    resolution_evidence = models.FileField(
        upload_to='defects/evidence/',
        null=True,
        blank=True
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='open'
    )

    assigned_contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_defects'
    )

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reported_defects'
    )

    reported_date = models.DateTimeField(
        auto_now_add=True
    )

    expected_completion_date = models.DateField(
        null=True,
        blank=True
    )

    resolved_date = models.DateField(
        null=True,
        blank=True
    )

    reopen_reason = models.TextField(
    null=True,
    blank=True
)

    def __str__(self):
        return f"Defect #{self.id} - {self.priority}"


class DefectActivityLog(models.Model):

    defect = models.ForeignKey(
        Defect,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )

    action = models.CharField(max_length=100)

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='defect_activity_logs'
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.defect} - {self.action}"
