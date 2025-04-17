from rest_framework import serializers

from .models import Reclamation
 
class ReclamationSerializer(serializers.ModelSerializer):

    client_email = serializers.EmailField(source='client.email', read_only=True)
 
    class Meta:

        model = Reclamation

        fields = '__all__'

        read_only_fields = ['id', 'date_envoi', 'client']

 