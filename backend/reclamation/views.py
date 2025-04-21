from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics, filters
from .models import Reclamation
from .serializers import ReclamationSerializer
from users.permissions import IsAdmin, IsClient
from installations.models import Installation

 
class EnvoyerReclamationView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsClient]
 
    def post(self, request):
        data = request.data.copy()
        installation_id = data.get("installation")
 
        if installation_id:
            try:
                installation = Installation.objects.get(pk=int(installation_id))
            except (Installation.DoesNotExist, ValueError, TypeError):
                return Response(
                    {"installation": ["Installation introuvable."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            if installation.client.id != request.user.id:
                return Response(
                    {"installation": [f"L'installation {installation_id} n'appartient pas à ce client."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
 
        serializer = ReclamationSerializer(data=data)
        if serializer.is_valid():
            serializer.save(client=request.user)
            return Response({"message": "Réclamation envoyée avec succès."}, status=status.HTTP_201_CREATED)
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
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
    permission_classes = [permissions.IsAuthenticated, IsAdmin]