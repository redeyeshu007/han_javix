from django.db import models
from django.conf import settings

class PaymentClearance(models.Model):
    STATUS_CHOICES = (
        ('NOT_REVIEWED', 'Not Reviewed'),
        ('PENDING_PAYMENT', 'Pending Payment'),
        ('PARTIALLY_CLEARED', 'Partially Cleared'),
        ('CLEARED', 'Cleared'),
        ('APPROVED_FOR_HANDOVER', 'Approved for Handover'),
        ('ON_HOLD', 'On Hold'),
    )

    unit = models.ForeignKey(
        'projects.Unit',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True
    )
    unit_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    amount_received = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pending_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    maintenance_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    corpus_fund = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    registration_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    utility_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    additional_work_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    late_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    refundable_deposits = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='NOT_REVIEWED')
    receipt_file = models.FileField(upload_to='payments/', null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='verified_payments',
        null=True,
        blank=True
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    remarks = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        self.pending_amount = max(0, self.unit_amount - self.amount_received)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment for Unit {self.unit.unit_number} - Status: {self.status}"


class HandoverRecord(models.Model):
    STATUS_CHOICES = (
        ('NOT_READY', 'Not Ready'),
        ('READY_FOR_HANDOVER', 'Ready for Handover'),
        ('HANDOVER_SCHEDULED', 'Handover Scheduled'),
        ('HANDED_OVER', 'Handed Over'),
    )

    unit = models.OneToOneField(
        'projects.Unit',
        on_delete=models.CASCADE,
        related_name='handover_record'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='handovers',
        null=True,
        blank=True
    )
    scheduled_date = models.DateField(null=True, blank=True)
    actual_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='NOT_READY')
    
    meter_readings = models.TextField(blank=True, default='Electricity: 0, Water: 0')
    keys_handed_over = models.BooleanField(default=False)
    access_cards_handed_over = models.BooleanField(default=False)

    
    customer_signature = models.FileField(upload_to='signatures/', null=True, blank=True)
    handover_certificate = models.FileField(upload_to='certificates/', null=True, blank=True)
    
    site_engineer_approval = models.BooleanField(default=False)
    accounts_approval = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Handover for Unit {self.unit.unit_number} ({self.status})"


class ServiceRequest(models.Model):
    STATUS_CHOICES = (
        ('Submitted', 'Submitted'),
        ('Scheduled', 'Scheduled'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Closed', 'Closed'),
        ('Rejected', 'Rejected'),
    )

    unit = models.ForeignKey(
        'projects.Unit',
        on_delete=models.CASCADE,
        related_name='service_requests'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='service_requests'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100, default='General Warranty')
    priority = models.CharField(max_length=20, default='MEDIUM')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Submitted')
    
    assigned_contractor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='assigned_service_requests',
        null=True,
        blank=True
    )
    visit_date = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    evidence = models.FileField(upload_to='care_evidence/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - Unit {self.unit.unit_number}"


class AssociationTransition(models.Model):
    builder_company = models.ForeignKey(
        'builders.BuilderCompany',
        on_delete=models.CASCADE,
        related_name='association_transitions'
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='association_transitions'
    )
    step = models.CharField(max_length=100, default='Initial Planning')
    structure_status = models.CharField(max_length=50, default='Pending')
    docs_status = models.CharField(max_length=50, default='Pending')
    financials_status = models.CharField(max_length=50, default='Pending')
    assets_status = models.CharField(max_length=50, default='Pending')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Transition for {self.project.name}"


class Charge(models.Model):
    CHARGE_TYPES = (
        ('BOOKING_AMOUNT', 'Booking Amount'),
        ('AGREEMENT_AMOUNT', 'Agreement Amount'),
        ('INSTALLMENT', 'Installment'),
        ('MAINTENANCE_DEPOSIT', 'Maintenance Deposit'),
        ('CORPUS_FUND', 'Corpus Fund'),
        ('REGISTRATION', 'Registration'),
        ('UTILITY_CHARGE', 'Utility Charge'),
        ('ADDITIONAL_CHARGE', 'Additional Charge'),
        ('LATE_FEE', 'Late Fee'),
        ('OTHER', 'Other'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PARTIALLY_PAID', 'Partially Paid'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
    )

    clearance = models.ForeignKey(
        PaymentClearance,
        on_delete=models.CASCADE,
        related_name='charges'
    )
    charge_type = models.CharField(max_length=50, choices=CHARGE_TYPES, default='INSTALLMENT')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    due_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='created_charges',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.amount_paid >= self.amount:
            self.status = 'PAID'
        elif self.amount_paid > 0:
            from django.utils import timezone
            if self.due_date and timezone.now().date() > self.due_date:
                self.status = 'OVERDUE'
            else:
                self.status = 'PARTIALLY_PAID'
        else:
            from django.utils import timezone
            if self.due_date and timezone.now().date() > self.due_date:
                self.status = 'OVERDUE'
            else:
                self.status = 'PENDING'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_charge_type_display()} - {self.amount}"


class PaymentRecord(models.Model):
    PAYMENT_METHODS = (
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CREDIT_CARD', 'Credit Card'),
        ('CHEQUE', 'Cheque'),
        ('CASH', 'Cash'),
        ('ONLINE', 'Online Payment Gateway'),
        ('OTHER', 'Other'),
    )

    STATUS_CHOICES = (
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )

    # Who approved / rejected this payment
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='approved_payment_records',
        null=True, blank=True
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='rejected_payment_records',
        null=True, blank=True
    )
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    clearance = models.ForeignKey(
        PaymentClearance,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    charge = models.ForeignKey(
        Charge,
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS, default='BANK_TRANSFER')
    reference_id = models.CharField(max_length=100, blank=True)
    payment_date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING_VERIFICATION')

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='recorded_payments',
        null=True,
        blank=True
    )
    remarks = models.TextField(blank=True)
    receipt_file = models.FileField(upload_to='payment_receipts/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment of {self.amount} on {self.payment_date}"
