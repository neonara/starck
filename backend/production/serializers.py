from rest_framework import serializers
from .models import ProductionConsommation

class ProductionConsommationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionConsommation
        fields = '__all__'