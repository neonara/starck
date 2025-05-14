from rest_framework import serializers
from intervention.models import FicheIntervention
from users.serializers import UserSerializer
from installations.serializers import InstallationSerializer

class FicheInterventionListSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la liste des fiches d'intervention"""
    technicien_nom = serializers.CharField(source='technicien.get_full_name', read_only=True)
    installation_nom = serializers.CharField(source='installation.nom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = FicheIntervention
        fields = [
            'id', 'technicien_nom', 
            'installation_nom', 'date_prevue', 
            'statut', 'statut_display'
        ]


class FicheInterventionCreateSerializer(serializers.ModelSerializer):
    type_intervention = serializers.ChoiceField(choices=FicheIntervention.TYPE_CHOICES)


    class Meta:
        model = FicheIntervention
        fields = [
            'installation',
            'technicien',
            'date_prevue',
            'statut',
            'description',
            'type_intervention',
        ]

    def create(self, validated_data):
        validated_data.pop('periode_recurrence', None)
        return super().create(validated_data)

    def validate_technicien(self, value):
        """Vérifie que l'utilisateur est bien un technicien"""
        if value and value.role != 'technicien':
            raise serializers.ValidationError("L'utilisateur sélectionné n'est pas un technicien")

        return value

class FicheInterventionDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les détails d'une fiche d'intervention"""
    technicien_details = UserSerializer(source='technicien', read_only=True)
    installation_details = InstallationSerializer(source='installation', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    class Meta:
        model = FicheIntervention
        fields = [
            'id', 'technicien', 'installation',
            'technicien_details', 'installation_details',
            'description','type_intervention', 'date_prevue', 'date_creation',
            'date_modification', 'statut', 'statut_display',
            'commentaire'
        ]
        

class FicheInterventionUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour d'une fiche d'intervention"""
    class Meta:
        model = FicheIntervention
        fields = [
            'technicien', 'description', 'date_prevue',
            'statut', 'commentaire'
        ]

    def validate_technicien(self, value):
        """Vérifie que l'utilisateur est bien un technicien"""
        if value and value.role != 'technicien':
            raise serializers.ValidationError("L'utilisateur sélectionné n'est pas un technicien")
        return value

    def validate_statut(self, value):
        """Vérifie que le statut est valide"""
        if value not in dict(FicheIntervention.STATUT_CHOICES):
            raise serializers.ValidationError("Statut invalide")
        return value

class ChangerStatutSerializer(serializers.Serializer):
    """Sérialiseur pour le changement de statut"""
    statut = serializers.ChoiceField(choices=FicheIntervention.STATUT_CHOICES)

from users.models import User 

from rest_framework import serializers
from users.models import User 

class AssignerTechnicienSerializer(serializers.Serializer):
    """Sérialiseur pour l'assignation d'un technicien"""
    technicien_id = serializers.IntegerField()

    def validate_technicien_id(self, value):
        """Vérifie que l'utilisateur existe et a bien le rôle 'technicien'"""
        try:
            technicien = User.objects.get(id=value)
            if technicien.role != 'technicien':
                raise serializers.ValidationError("L'utilisateur n'a pas le rôle de technicien")
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("Technicien non trouvé")


