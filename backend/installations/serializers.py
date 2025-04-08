from rest_framework import serializers
from .models import Installation
from django.contrib.auth import get_user_model

User = get_user_model()

class InstallationSerializer(serializers.ModelSerializer):
    client_email = serializers.EmailField(write_only=True)
    installateur_email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = Installation
        fields = [
            'id',
            'nom',
            'client_email',
            'installateur_email',
            'type_installation',
            'statut',
            'date_installation',
            'capacite_kw',
            'latitude',
            'longitude',
            'adresse',
            'ville',
            'code_postal',
            'pays',
            'documentation_technique',
            'expiration_garantie',
            'reference_contrat',
        ]

    def create(self, validated_data):
        client_email = validated_data.pop('client_email')
        installateur_email = validated_data.pop('installateur_email', None) 

        try:
            client = User.objects.get(email=client_email, groups__name='Clients')
        except User.DoesNotExist:
            raise serializers.ValidationError({"client_email": "Aucun client trouvé avec cet e-mail."})

        if installateur_email:
            try:
                installateur = User.objects.get(email=installateur_email, groups__name='Installateurs')
            except User.DoesNotExist:
                raise serializers.ValidationError({"installateur_email": "Aucun installateur trouvé avec cet e-mail."})
        else:
            installateur = None

        installation = Installation.objects.create(
            client=client,
            installateur=installateur,
            **validated_data 
        )
        return installation



    def update(self, instance, validated_data):
        client_email = validated_data.pop('client_email', None)
        installateur_email = validated_data.pop('installateur_email', None)

        if client_email:
            client = User.objects.get(email=client_email, groups__name='Clients')
            instance.client = client
        if installateur_email:
            installateur = User.objects.get(email=installateur_email, groups__name='Installateurs')
            instance.installateur = installateur

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def validate(self, data):
        if not data.get('nom'):
            raise serializers.ValidationError({"nom": "Le nom de l'installation est requis."})
        if not data.get('type_installation'):
            raise serializers.ValidationError({"type_installation": "Le type d'installation est requis."})
        if not data.get('date_installation'):
            raise serializers.ValidationError({"date_installation": "La date d'installation est requise."})
        if not data.get('capacite_kw'):
            raise serializers.ValidationError({"capacite_kw": "La capacité en kW est requise."})

        return data
