from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Installation
from .serializers import InstallationSerializer

User = get_user_model()

class AjouterInstallationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InstallationSerializer(data=request.data)

        if serializer.is_valid():
            installation = serializer.save()
            return Response({
                "message": "Installation ajoutée avec succès.",
                "installation_id": installation.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ModifierInstallationView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Installation.objects.all()
    serializer_class = InstallationSerializer

    def put(self, request, installation_id, *args, **kwargs):
        try:
            installation = self.get_queryset().get(id=installation_id)
        except Installation.DoesNotExist:
            return Response({"error": "Installation non trouvée."}, status=404)

        serializer = self.get_serializer(installation, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Installation mise à jour avec succès.", "installation": serializer.data}, status=200)
        return Response(serializer.errors, status=400)

class SupprimerInstallationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, installation_id):
        try:
            installation = Installation.objects.get(id=installation_id)
            installation.delete()
            return Response({"message": "Installation supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)

        except Installation.DoesNotExist:
            return Response({"error": "Installation non trouvée."}, status=status.HTTP_404_NOT_FOUND)

class ListerInstallationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        installations = Installation.objects.all()

        etat = request.query_params.get('etat', None)
        if etat:
            installations = installations.filter(statut=etat)

        adresse = request.query_params.get('adresse', None)
        if adresse:
            installations = installations.filter(adresse__icontains=adresse)

        ville = request.query_params.get('ville', None)
        if ville:
            installations = installations.filter(ville__icontains=ville)

        nom = request.query_params.get('nom', None) 
        if nom:
            installations = installations.filter(nom__icontains=nom)

        serializer = InstallationSerializer(installations, many=True)

        if not serializer.data:
            return Response({"message": "Aucune installation trouvée."}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.data, status=status.HTTP_200_OK)

class DetailsInstallationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, installation_id):
        try:
            installation = Installation.objects.get(id=installation_id)
            serializer = InstallationSerializer(installation)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Installation.DoesNotExist:
            return Response({"error": "Installation non trouvée."}, status=status.HTTP_404_NOT_FOUND)

class StatistiquesInstallationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_normales = Installation.objects.filter(statut='active').count()
        total_en_panne = Installation.objects.filter(statut='fault').count()  

        return Response({
            "total_normales": total_normales,
            "total_en_panne": total_en_panne
        }, status=status.HTTP_200_OK)
