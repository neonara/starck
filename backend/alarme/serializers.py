from rest_framework import serializers
from .models import AlarmeCode, AlarmeDeclenchee

class AlarmeCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlarmeCode
        fields = '__all__'


class AlarmeDeclencheeSerializer(serializers.ModelSerializer):
    installation_nom = serializers.CharField(source='installation.nom', read_only=True)
    code_constructeur = serializers.CharField(source='code_alarme.code_constructeur', read_only=True)
    type_alarme = serializers.CharField(source='code_alarme.type_alarme', read_only=True)
    marque = serializers.CharField(source='code_alarme.marque', read_only=True)
    gravite = serializers.CharField(source='code_alarme.gravite', read_only=True)
    description = serializers.CharField(source='code_alarme.description', read_only=True)

    class Meta:
        model = AlarmeDeclenchee
        fields = '__all__'
