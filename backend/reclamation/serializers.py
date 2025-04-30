from rest_framework import serializers
from .models import Reclamation

class ReclamationSerializer(serializers.ModelSerializer):
    client_email = serializers.EmailField(source='client.email', read_only=True)
    installation_nom = serializers.SerializerMethodField()

    class Meta:
        model = Reclamation
        fields = ['id', 'client_email', 'sujet', 'message', 'date_envoi', 'statut', 'installation_nom', 'installation']

    def get_installation_nom(self, obj):
        if obj.installation is not None:
            return obj.installation.nom  
        return None




