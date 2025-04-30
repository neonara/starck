from rest_framework import serializers
from .models import Entretien
from installations.serializers import InstallationSerializer
from users.serializers import UserSerializer

class EntretienSerializer(serializers.ModelSerializer):
    installation_details = InstallationSerializer(source='installation', read_only=True)
    technicien_details = UserSerializer(source='technicien', read_only=True)
    createur_details = UserSerializer(source='cree_par', read_only=True)
    
    class Meta:
        model = Entretien
        fields = [
            'id',
            'installation', 'installation_details',
            'type_entretien',
            'date_debut', 'date_fin', 'duree_estimee',
            'statut', 'priorite',
            'technicien', 'technicien_details',
            'notes', 'rapport',
            'cree_par', 'createur_details',
            'cree_le', 'modifie_le',
        ]
        extra_kwargs = {
            'installation': {'write_only': True},
            'technicien': {'write_only': True},
            'cree_par': {'write_only': True, 'required': False},
        }

    def validate_technicien(self, value):
        if value and value.role != 'technicien':
            raise serializers.ValidationError("Le technicien assigné doit avoir le rôle 'technicien'")
        return value

    def validate(self, data):
        date_debut = data.get('date_debut', self.instance.date_debut if self.instance else None)
        date_fin = data.get('date_fin', self.instance.date_fin if self.instance else None)
        
        if date_debut and date_fin and date_fin <= date_debut:
            raise serializers.ValidationError({
                'date_fin': "La date de fin doit être après la date de début"
            })
            
        return data