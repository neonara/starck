from rest_framework import serializers
from .models import Equipement
from installations.models import Installation


class InstallationShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Installation
        fields = ['id', 'nom']

class EquipementSerializer(serializers.ModelSerializer):
    installation = serializers.PrimaryKeyRelatedField(
        queryset=Installation.objects.all(), write_only=True
    )
    installation_details = InstallationShortSerializer(source='installation', read_only=True)

    class Meta:
        model = Equipement
        fields = [
            "id", "nom", "type_appareil", "numero_serie", "etat",
            "installation", "installation_details", "code_unique", "qr_code_image"
        ]