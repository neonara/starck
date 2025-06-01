from rest_framework import serializers
from .models import Reclamation
from .models import Reclamation, ReclamationImage

class ReclamationImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(use_url=True)
    class Meta:
        model = ReclamationImage
        fields = ['id', 'image', 'uploaded_at']


class ReclamationSerializer(serializers.ModelSerializer):
    client_email = serializers.EmailField(source='client.email', read_only=True)
    installation_nom = serializers.SerializerMethodField()
    images = ReclamationImageSerializer(many=True, read_only=True)
    class Meta:
        model = Reclamation
        fields = ['id', 'client_email', 'sujet', 'message', 'date_envoi', 'statut', 'installation_nom', 'installation', 'images']

    def get_installation_nom(self, obj):
        if obj.installation is not None:
            return obj.installation.nom   
        return None
from rest_framework import serializers
from .models import Reclamation, ReclamationImage

class ReclamationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reclamation
        fields = ['statut']

    def update(self, instance, validated_data):
        request = self.context.get('request')

        instance.statut = validated_data.get('statut', instance.statut)
        instance.save()

        # ✅ ajout images
        if request.FILES:
            for f in request.FILES.getlist('images'):
                ReclamationImage.objects.create(reclamation=instance, image=f)

        # ✅ suppression images
        deleted = request.data.getlist('deleted_images')
        if deleted:
            ReclamationImage.objects.filter(id__in=deleted).delete()

        return instance
