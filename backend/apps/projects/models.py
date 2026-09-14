from django.db import models
from apps.accounts.models import User


class Project(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('nearing_completion', 'Nearing Completion'),
        ('inspection_stage', 'Inspection Stage'),
        ('customer_handover_stage', 'Customer Handover Stage'),
        ('warranty_stage', 'Warranty Stage'),
        ('association_handover_stage', 'Association Handover Stage'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    TYPE_CHOICES = [
        ('apartment', 'Apartment'),
        ('villa', 'Villa'),
        ('commercial', 'Commercial'),
        ('mixed_use', 'Mixed Use'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    builder_company = models.ForeignKey(
        'builders.BuilderCompany',
        on_delete=models.CASCADE,
        related_name='projects',
        null=True,
        blank=True
    )
    project_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    project_type_other = models.CharField(max_length=100, blank=True)
    address = models.TextField()
    start_date = models.DateField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    rera_number = models.CharField(max_length=100, blank=True)
    builder_contact = models.CharField(max_length=150, blank=True)
    common_facilities = models.TextField(blank=True)
    image = models.ImageField(upload_to='projects/', null=True, blank=True)
    status = models.CharField(
        max_length=30, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Block(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    total_floors = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.name} - {self.name}"


class Floor(models.Model):
    block = models.ForeignKey(
        Block, on_delete=models.CASCADE, related_name='floors')
    name = models.CharField(max_length=100, blank=True)
    floor_number = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"{self.block.name} - Floor {self.floor_number}"


class Unit(models.Model):
    UNIT_STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('construction_in_progress', 'Construction in Progress'),
        ('nearing_completion', 'Nearing Completion'),
        ('internal_inspection', 'Internal Inspection'),
        ('defect_resolution', 'Defect Resolution'),
        ('customer_inspection_ready', 'Customer Inspection Ready'),
        ('customer_inspection_completed', 'Customer Inspection Completed'),
        ('handover_preparation', 'Handover Preparation'),
        ('ready_for_handover', 'Ready for Handover'),
        ('handover_scheduled', 'Handover Scheduled'),
        ('handed_over', 'Handed Over'),
        ('warranty_stage', 'Warranty Stage'),
    ]

    floor = models.ForeignKey(
        Floor, on_delete=models.CASCADE, related_name='units')
    unit_number = models.CharField(max_length=20)
    unit_type = models.CharField(max_length=50, blank=True)
    area_sqft = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.IntegerField(null=True, blank=True)

    customer = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_units')
    booking_date = models.DateField(null=True, blank=True)
    agreement_date = models.DateField(null=True, blank=True)
    expected_handover_date = models.DateField(null=True, blank=True)
    completion_percentage = models.IntegerField(default=0)
    status = models.CharField(
        max_length=40, choices=UNIT_STATUS_CHOICES, default='not_started')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.floor.block.name} - {self.unit_number}"


class Milestone(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='milestones')
    unit = models.ForeignKey(
        Unit, on_delete=models.CASCADE, related_name='milestones', null=True, blank=True)
    name = models.CharField(max_length=200)
    planned_date = models.DateField(null=True, blank=True)
    actual_date = models.DateField(null=True, blank=True)
    responsible_person = models.CharField(max_length=150, blank=True)
    completion_percentage = models.IntegerField(default=0)
    evidence = models.FileField(upload_to='milestones/', null=True, blank=True)
    remarks = models.TextField(blank=True)
    approval_status = models.CharField(max_length=50, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.name} - {self.name}"
