from rest_framework import serializers
from .models import Exportation

class ExportationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exportation
        fields = ['id', 'nom', 'date_creation', 'fichier']
