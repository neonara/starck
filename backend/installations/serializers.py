from rest_framework import serializers
from .models import Installation
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
User = get_user_model()

class InstallationSerializer(serializers.ModelSerializer):
    client_email = serializers.EmailField(write_only=True)
    installateur_email = serializers.EmailField(write_only=True, required=False)
    client = UserSerializer(read_only=True)
    installateur = UserSerializer(read_only=True)
    
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
            'photo_installation',
            'client',
            'installateur',
        ]
        
    def get_photo_installation_url(self, obj):
        request = self.context.get('request')
        try:
            if obj.photo_installation and hasattr(obj.photo_installation, 'url'):
                return request.build_absolute_uri(obj.photo_installation.url)
        except Exception as e:
            print("Erreur image:", e)
        return None
    def validate_photo_installation(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image trop lourde (max 5MB).")
        return image



    def create(self, validated_data):
        client_email = validated_data.pop('client_email').strip().lower()
        installateur_email = validated_data.pop('installateur_email', None) 

        try:
            client = User.objects.get(email=client_email, role='client')
        except User.DoesNotExist:
            raise serializers.ValidationError({"client_email": "Aucun client trouvé avec cet e-mail."})

        if installateur_email:
            try:
                installateur = User.objects.get(email=installateur_email, role='installateur')
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
            client = User.objects.get(email=client_email, role='client')
            instance.client = client
        if installateur_email:
            installateur = User.objects.get(email=installateur_email, role='installateur')
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
