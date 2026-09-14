from django.core.exceptions import PermissionDenied

def get_accounts_assigned_project(user):
    """
    Returns the single assigned project for an ACCOUNTS user.
    Enforces the 'ONE ACCOUNTS USER = ONE PROJECT' business rule.
    If the user has no assigned project, raises PermissionDenied to prevent data leakage.
    """
    if not user.is_authenticated or user.role != 'ACCOUNTS':
        return None
        
    project = user.assigned_projects.first()
    if not project:
        raise PermissionDenied("Accounts user has no assigned project.")
        
    return project
