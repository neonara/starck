from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics, filters
from .models import Reclamation
from .serializers import ReclamationSerializer, ReclamationUpdateSerializer
from users.permissions import IsAdmin, IsClient,IsInstallateur
from installations.models import Installation
from rest_framework.parsers import MultiPartParser, FormParser
from .models import ReclamationImage

 
class EnvoyerReclamationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClient]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        data = request.data.copy()
        installation_id = data.get("installation")

        # ✅ Si pas d'installation explicitement envoyée, chercher celle du client
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
            reclamation = serializer.save(client=request.user)

            # 🖼️ Traitement des images envoyées
            images = request.FILES.getlist('images')
            if len(images) > 5:
                return Response({"images": ["Maximum 5 images autorisées."]},
                                status=status.HTTP_400_BAD_REQUEST)

            for image in images:
                ReclamationImage.objects.create(reclamation=reclamation, image=image)
            serializer.save(client=request.user)
            return Response({"message": "Réclamation envoyée avec succès."}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MesReclamationsView(generics.ListAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]  # Client connecté

    def get_queryset(self):
        return Reclamation.objects.filter(client=self.request.user).order_by('-date_envoi')
    
class ReclamationListView(generics.ListAPIView):
    serializer_class = ReclamationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['client__email', 'sujet', 'message', 'statut']
 
    def get_queryset(self):
        return Reclamation.objects.all().order_by('-date_envoi')
 
class ReclamationUpdateView(generics.UpdateAPIView):
    queryset = Reclamation.objects.all()
    serializer_class = ReclamationUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

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
        # Récupérer l’utilisateur installateur connecté
        installateur = self.request.user

        # Obtenir tous les ID des installations où il est installateur
        installations_ids = Installation.objects.filter(
            installateur=installateur
        ).values_list('id', flat=True)

        # Retourner les réclamations liées à ces installations
        return Reclamation.objects.filter(
            installation_id__in=installations_ids
        ).select_related('client', 'installation').order_by('-date_envoi')
