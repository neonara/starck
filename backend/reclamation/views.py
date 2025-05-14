from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics, filters
from .models import Reclamation
from .serializers import ReclamationSerializer
from users.permissions import IsAdmin, IsClient,IsInstallateur
from installations.models import Installation
from django.core.cache import cache

 
class EnvoyerReclamationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def post(self, request):
        data = request.data.copy()
        installation_id = data.get("installation")

        if not installation_id:
            installation = Installation.objects.filter(client=request.user).first()
            if installation:
                data["installation"] = installation.id
        else:
            try:
                installation = Installation.objects.get(pk=int(installation_id))
            except (Installation.DoesNotExist, ValueError, TypeError):
                return Response(
                    {"installation": ["Installation introuvable."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if installation.client.id != request.user.id:
                return Response(
                    {"installation": ["Cette installation n'appartient pas à ce client."]},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = ReclamationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(client=request.user)
            cache.delete("stats:reclamations_total")
            cache.delete("stats:reclamations_par_statut")
            return Response({"message": "Réclamation envoyée avec succès."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MesReclamationsView(generics.ListAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]  # Client connecté

    def get_queryset(self):
        return Reclamation.objects.filter(client=self.request.user).order_by('-date_envoi')
    
class ReclamationListView(generics.ListAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['client__email', 'sujet', 'message', 'statut']
 
    def get_queryset(self):
        return Reclamation.objects.all().order_by('-date_envoi')
 
class ReclamationUpdateView(generics.UpdateAPIView):
    queryset = Reclamation.objects.all()
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        if user.role == 'admin':
            return super().update(request, *args, **kwargs)
        elif user.role == 'installateur':
            if instance.installation and instance.installation.installateur_id == user.id:
                return super().update(request, *args, **kwargs)
            else:
                return Response({"error": "Vous n'êtes pas autorisé à modifier cette réclamation."}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"error": "Action non autorisée."}, status=status.HTTP_403_FORBIDDEN)

class SupprimerReclamationView(generics.DestroyAPIView):
    queryset = Reclamation.objects.all()
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        if user.role == "admin":
            return super().delete(request, *args, **kwargs)

        if user.role == "installateur":
            if instance.installation and instance.installation.installateur_id == user.id:
                return super().delete(request, *args, **kwargs)

        if user.role == "client":
            if instance.client_id == user.id:
                return super().delete(request, *args, **kwargs)

        return Response({"error": "Non autorisé à supprimer cette réclamation."}, status=403)
    

class ReclamationsInstallateurView(generics.ListAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstallateur]
    filter_backends = [filters.SearchFilter]
    search_fields = ['client__email', 'sujet', 'message', 'statut']

    def get_queryset(self):
        installateur = self.request.user

        installations_ids = Installation.objects.filter(
            installateur=installateur
        ).values_list('id', flat=True)

        return Reclamation.objects.filter(
            installation_id__in=installations_ids
        ).select_related('client', 'installation').order_by('-date_envoi')
