from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Autorise uniquement les utilisateurs avec le rôle 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsInstallateur(BasePermission):
    """
    Autorise uniquement les utilisateurs avec le rôle 'installateur'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'installateur'


class IsTechnicien(BasePermission):
    """
    Autorise uniquement les techniciens.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'technicien'


class IsClient(BasePermission):
    """
    Autorise uniquement les clients.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'
        
class IsAdminOrInstallateur(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'installateur']
