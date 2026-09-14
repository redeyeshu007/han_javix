from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'SUPER_ADMIN' or request.user.is_superuser))


class IsBuilderOwner(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'BUILDER_OWNER')


class IsProjectAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PROJECT_ADMIN')


class IsSiteEngineer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'SITE_ENGINEER')

class IsAccountsEmployee(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ACCOUNTS')


class IsContractor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CONTRACTOR')


class IsPropertyCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'CUSTOMER')


class IsAssociationRep(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ASSOCIATION_REPRESENTATIVE')


class IsAnyOfRoles(BasePermission):
    """
    Generic reusable permission — pass allowed roles as a list in the view.
    Usage in view: allowed_roles = ['PROJECT_ADMIN', 'PROJECT_MANAGER']
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        allowed_roles = getattr(view, 'allowed_roles', [])
        
        if request.user.role == 'PROJECT_ADMIN':
            if request.method not in ('GET', 'HEAD', 'OPTIONS'):
                return False
                
        return request.user.role in allowed_roles
