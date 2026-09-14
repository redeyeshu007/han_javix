from rest_framework.exceptions import ValidationError

def check_and_update_storage(builder, file_size):
    """
    Check if the builder has enough storage quota left for the new file.
    If yes, update the quota. If not, raise a ValidationError.
    """
    if not builder or not builder.subscription_plan:
        return

    plan = builder.subscription_plan
    # Convert GB to bytes
    limit_bytes = int(plan.storage_limit_gb * 1024 * 1024 * 1024)
    
    if builder.storage_used_bytes + file_size > limit_bytes:
        raise ValidationError({
            "non_field_errors": f"Storage limit exceeded. Your plan allows up to {plan.storage_limit_gb} GB of storage."
        })
    
    # Update storage usage
    builder.storage_used_bytes += file_size
    builder.save(update_fields=['storage_used_bytes'])
