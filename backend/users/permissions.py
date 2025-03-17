from rest_framework.permissions import BasePermission

class IsAdminOrInstallateur(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'installateur']

class IsVerifiedAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin' and request.user.is_verified
