from rest_framework.permissions import BasePermission



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



        
class IsAdminOrInstallateur(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'installateur']

 
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
 
class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'
    
from rest_framework.permissions import BasePermission

class IsTechnicienAndOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.technicien

    
from rest_framework.permissions import BasePermission

class IsAdminInstallateurOrClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['technicien', 'installateur', 'client']



class IsAdminOrInstallateurOrTechnicien(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['admin', 'installateur', 'technicien']
