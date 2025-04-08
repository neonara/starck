from rest_framework import serializers
from .models import Alarme

class AlarmeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarme
        fields = '__all__'
