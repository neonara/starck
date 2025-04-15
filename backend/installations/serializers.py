from rest_framework import serializers
from .models import Installation
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer
from production.models import ProductionConsommation
from alarme.models import AlarmeDeclenchee
from django.utils import timezone
from django.db.models import Sum
from decimal import Decimal
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
            'client',             
            'installateur',
        ]

   

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


#partie carte geographique
class InstallationGeoSerializer(serializers.ModelSerializer):
    production_journaliere_kwh = serializers.SerializerMethodField()
    production_mensuelle_kwh = serializers.SerializerMethodField()
    revenus_mensuels_dt = serializers.SerializerMethodField()
    etat_alarme = serializers.SerializerMethodField()
    class Meta:
        model = Installation
        fields = ['id', 'nom', 'latitude', 'longitude', 'production_journaliere_kwh', 'production_mensuelle_kwh', 'revenus_mensuels_dt', "etat_alarme"]

    def get_production_journaliere_kwh(self, obj):
        today = timezone.now().date()
        production = ProductionConsommation.objects.filter(
            installation=obj,
            horodatage__date=today
        ).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
        return round(production, 2)
    def get_production_mensuelle_kwh(self, obj):
        now = timezone.now()
        production = ProductionConsommation.objects.filter(
            installation=obj,
            horodatage__year=now.year,
            horodatage__month=now.month
        ).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
        return round(production, 2)
    
    def get_revenus_mensuels_dt(self, obj):
        prix_kwh = Decimal('0.5')  
        prod = self.get_production_mensuelle_kwh(obj)
        return round(prod * prix_kwh, 2)
    
    def get_etat_alarme(self, installation):
        alarmes = AlarmeDeclenchee.objects.filter(
            installation=installation,
            est_resolue=False
        ).select_related('code_alarme')

        niveaux = [a.code_alarme.gravite for a in alarmes]

        if 'critique' in niveaux:
            return "critique"
        elif 'majeure' in niveaux:
            return "moyenne"
        elif 'mineure' in niveaux:
            return "mineure"
        else:
            return "ok"

    
    