from rest_framework import serializers
from .models import Entretien
from installations.serializers import InstallationSerializer
from users.serializers import UserSerializer

class EntretienSerializer(serializers.ModelSerializer):
    installation_details = InstallationSerializer(source='installation', read_only=True)
    technicien_details = UserSerializer(source='technicien', read_only=True)
    createur_details = UserSerializer(source='cree_par', read_only=True)
    installation_nom = serializers.CharField(source='installation.nom', read_only=True)
    technicien_nom = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_type_entretien_display', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    periode_recurrence = serializers.IntegerField(required=False, allow_null=True)
    entretien_suivant = serializers.SerializerMethodField()  # ✅ AJOUT

    event_id_google = serializers.CharField(read_only=True)
    lien_evenement_google = serializers.URLField(read_only=True)

    class Meta:
        model = Entretien
        fields = [
            'id',
            'installation', 'installation_details', 'installation_nom',
            'type_entretien', 'type_display',
            'date_debut', 'date_fin', 'duree_estimee',
            'statut', 'statut_display',
            'priorite',
            'technicien', 'technicien_details', 'technicien_nom',
            'notes', 'rapport',
            'cree_par', 'createur_details',
            'cree_le', 'modifie_le',
            'periode_recurrence',
            'entretien_suivant',
            'event_id_google', 'lien_evenement_google'

        ]
        extra_kwargs = {
            'installation': {'write_only': True},
            'technicien': {'write_only': True},
            'cree_par': {'write_only': True, 'required': False},
        }

    def get_technicien_nom(self, obj):
        if obj.technicien:
            return f"{obj.technicien.first_name} {obj.technicien.last_name}"
        return "Non assigné"

    def get_entretien_suivant(self, obj):
        """Retourne l'entretien suivant s’il existe, basé sur la période de récurrence"""
        if not obj.periode_recurrence:
            return None
        suivant = Entretien.objects.filter(
            installation=obj.installation,
            date_debut__gt=obj.date_debut
        ).order_by('date_debut').first()
        if suivant:
            return EntretienSerializer(suivant, context=self.context).data
        return None

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
    

