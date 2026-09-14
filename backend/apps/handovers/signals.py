from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import Charge, PaymentRecord, PaymentClearance

from decimal import Decimal

def update_clearance_totals(clearance):
    # Sum all charges
    charges = clearance.charges.all()
    total_charges = charges.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    # Specific charge fields
    clearance.maintenance_deposit = charges.filter(charge_type='MAINTENANCE_DEPOSIT').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    clearance.corpus_fund = charges.filter(charge_type='CORPUS_FUND').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    clearance.registration_charges = charges.filter(charge_type='REGISTRATION').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    clearance.utility_charges = charges.filter(charge_type='UTILITY_CHARGE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    clearance.additional_work_charges = charges.filter(charge_type='ADDITIONAL_CHARGE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    clearance.late_fees = charges.filter(charge_type='LATE_FEE').aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    
    # We map 'unit_amount' to total_charges so the existing logic works seamlessly
    clearance.unit_amount = total_charges

    # Sum verified payments
    payments = clearance.transactions.filter(status='VERIFIED')
    total_paid = payments.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')
    clearance.amount_received = total_paid

    # Auto-update clearance status based on the new totals
    pending = float(total_charges) - float(total_paid)
    if float(total_charges) > 0:
        if pending <= 0:
            clearance.status = 'CLEARED'
        elif float(total_paid) > 0:
            clearance.status = 'PARTIALLY_CLEARED'
        else:
            clearance.status = 'PENDING_PAYMENT'
    
    clearance.save()

@receiver([post_save, post_delete], sender=Charge)
def charge_saved_or_deleted(sender, instance, **kwargs):
    if instance.clearance:
        update_clearance_totals(instance.clearance)

@receiver([post_save, post_delete], sender=PaymentRecord)
def payment_record_saved_or_deleted(sender, instance, **kwargs):
    if instance.clearance:
        update_clearance_totals(instance.clearance)
        
    # Also update the specific charge's amount_paid if linked
    if instance.charge:
        charge = instance.charge
        charge_payments = charge.payments.filter(status='VERIFIED').aggregate(Sum('amount'))['amount__sum'] or 0.00
        charge.amount_paid = charge_payments
        charge.save()
