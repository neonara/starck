from rest_framework import serializers
from .models import ProductionConsommation

class ProductionConsommationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionConsommation
        fields = [
            'id',
            'installation',
            'horodatage',
            'energie_produite_kwh',
            'energie_consomme_kwh',
            'puissance_maximale_kw',
            'temperature_c',
            'irradiation_wh_m2',
            'ratio_performance',
            'est_prediction'
        ]
