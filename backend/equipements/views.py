from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Equipement
from .serializers import EquipementSerializer
from installations.models import Installation
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
from users.permissions import IsAdminOrInstallateur,IsInstallateur
from users.permissions import IsTechnicien
from users.permissions import IsAdminOrInstallateurOrTechnicien,IsClient
from users.permissions import IsAdminInstallateurOrClient

from rest_framework.permissions import IsAuthenticated
from .tasks import generate_qr_code_task

class AjouterEquipementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateurOrTechnicien]

    def post(self, request):
        serializer = EquipementSerializer(data=request.data)
        if serializer.is_valid():
            equipement = serializer.save()

            generate_qr_code_task.delay(equipement.id)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ModifierEquipementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateurOrTechnicien]

    def put(self, request, id):
        equipement = get_object_or_404(Equipement, id=id)
        serializer = EquipementSerializer(equipement, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupprimerEquipementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateurOrTechnicien]

    def delete(self, request, id):
        equipement = get_object_or_404(Equipement, id=id)
        equipement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ListerEquipementsParInstallationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminInstallateurOrClient]

    def get(self, request, installation_id):
        if request.user.role == 'client':
            installation = get_object_or_404(Installation, id=installation_id, client=request.user)
        else:
            installation = get_object_or_404(Installation, id=installation_id)

        equipements = Equipement.objects.filter(installation=installation)
        serializer = EquipementSerializer(equipements, many=True)
        return Response(serializer.data)


class DetailsEquipementView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateurOrTechnicien]

    def get(self, request, id):
        equipement = get_object_or_404(Equipement, id=id)
        serializer = EquipementSerializer(equipement)
        return Response(serializer.data)




class EquipementParQRCodeView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateurOrTechnicien]

    def get(self, request, code):
        try:
            equipement = Equipement.objects.get(code_unique=code)
            serializer = EquipementSerializer(equipement, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Equipement.DoesNotExist:
            return Response({"error": "Équipement introuvable."}, status=status.HTTP_404_NOT_FOUND)