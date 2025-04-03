from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Installation
from .serializers import InstallationSerializer

class InstallationViewSet(viewsets.ModelViewSet):
    queryset = Installation.objects.all()
    serializer_class = InstallationSerializer
    permission_classes = [IsAuthenticated]  # Restreindre l'accès aux utilisateurs connectés

   