from rest_framework.permissions import BasePermission


class CanManageProjects(BasePermission):
    """Authenticated users can view.
    Project-management roles can manage projects.
    Project Manager and Site Engineer can update unit status.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.user.role == 'PROJECT_ADMIN':
            if request.method in ('GET', 'HEAD', 'OPTIONS'):
                return True
            if getattr(view, 'action', None) == 'assign_customer':
                return True
            return False

        # Site Engineers are read-only on project/unit resources.
        # They may view units and the workspace endpoint but must not mutate
        # unit records, create projects, or assign customers.
        if request.user.role == 'SITE_ENGINEER':
            if request.method in ('GET', 'HEAD', 'OPTIONS'):
                return True
            return False

        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        return request.user.role in (
            'SUPER_ADMIN',
            'BUILDER_OWNER',
        )
