from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from django.core.cache import cache
from rest_framework.views import APIView
from .models import Installation
from .serializers import InstallationSerializer
from users.permissions import IsAdminOrInstallateur,IsInstallateur
from users.permissions import IsTechnicien
from rest_framework.permissions import IsAuthenticated
from users.serializers import UserSerializer
from .serializers import InstallationGeoSerializer
from users.permissions import IsAdminOrInstallateurOrTechnicien

User = get_user_model()

class AjouterInstallationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        serializer = InstallationSerializer(data=request.data)

        if serializer.is_valid():
            installation = serializer.save()
            cache.delete("stats:installations_global")
            cache.delete(f"stats:installations_installateur_{installation.installateur_id}")
            return Response({
                "message": "Installation ajoutée avec succès.",
                "installation_id": installation.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ModifierInstallationView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = Installation.objects.all()
    serializer_class = InstallationSerializer
    lookup_field = 'id'
  

class SupprimerInstallationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def delete(self, request, installation_id):
        try:
            installation = Installation.objects.get(id=installation_id)
            installation.delete()
            return Response({"message": "Installation supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)

        except Installation.DoesNotExist:
            return Response({"error": "Installation non trouvée."}, status=status.HTTP_404_NOT_FOUND)

class ListerInstallationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateurOrTechnicien]

    def get(self, request):
        user = request.user

        if user.role in ['admin', 'technicien']:
            installations = Installation.objects.all()
        elif user.role == 'installateur':
            installations = Installation.objects.filter(installateur=user)
        else:
            return Response({"error": "Rôle non autorisé."}, status=403)

        etat = request.query_params.get('etat')
        if etat:
            installations = installations.filter(statut=etat)

        adresse = request.query_params.get('adresse')
        if adresse:
            installations = installations.filter(adresse__icontains=adresse)

        ville = request.query_params.get('ville')
        if ville:
            installations = installations.filter(ville__icontains=ville)

        nom = request.query_params.get('nom')
        if nom:
            installations = installations.filter(nom__icontains=nom)

        serializer = InstallationSerializer(installations, many=True)
        return Response(serializer.data, status=200)

class DetailsInstallationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    queryset = Installation.objects.all()
    serializer_class = InstallationSerializer
    lookup_field = 'id'
    def get(self, request, id): 
        try:
            installation = Installation.objects.get(id=id)
            serializer = InstallationSerializer(installation, context={'request': request})

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Installation.DoesNotExist:
            return Response({"error": "Installation non trouvée."}, status=status.HTTP_404_NOT_FOUND)

class StatistiquesInstallationsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request):
        cache_key = "stats:installations_global"
        data = cache.get(cache_key)
        if data:
            return Response(data)

        total_normales = Installation.objects.filter(statut='active').count()
        total_en_panne = Installation.objects.filter(statut='fault').count()

        data = {
            "total_normales": total_normales,
            "total_en_panne": total_en_panne
        }

        cache.set(cache_key, data, timeout=3600)
        return Response(data, status=status.HTTP_200_OK)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from installations.models import Installation
from alarme.models import AlarmeDeclenchee
from entretien.models import Entretien
from production.models import ProductionConsommation
from datetime import date
from django.db.models import Sum
from django.db.models.functions import TruncHour, TruncDay
class InstallationClientView(APIView):

    permission_classes = [IsAuthenticated]
 
    def get(self, request):

        try:

            user = request.user
            installation = Installation.objects.filter(client=user).first() 
            if not installation:

                return Response({"error": "Aucune installation trouvée"}, status=404)
            alarme_critique_active = AlarmeDeclenchee.objects.filter(
                installation=installation,
                code_alarme__gravite='critique',
                est_resolue=False
            ).exists()

            etat_fonctionnement = 'En panne' if alarme_critique_active else 'Fonctionnelle'

            data = {
                "id": installation.id,
                "nom": installation.nom,
                "adresse": installation.adresse,
                "ville": installation.ville,
                "code_postal": installation.code_postal,
                "pays": installation.pays,
                "latitude": installation.latitude,
                "longitude": installation.longitude,
                "type_installation": installation.type_installation,
                "statut": installation.statut,
                "capacite_kw": installation.capacite_kw,
                "date_installation": installation.date_installation,
                "expiration_garantie": installation.expiration_garantie,
                "reference_contrat": installation.reference_contrat,
                "etat_fonctionnement": etat_fonctionnement,
            }

            if installation.photo_installation:
                data["photo_installation_url"] = request.build_absolute_uri(installation.photo_installation.url)
            else:
                data["photo_installation_url"] = None

 

            dernier_entretien = Entretien.objects.filter(installation=installation).order_by('-date_debut').first()

            prochain_entretien = Entretien.objects.filter(installation=installation, date_debut__gt=date.today()).order_by('date_debut').first()
 
            data["dernier_controle"] = getattr(dernier_entretien, "date_debut", None)

            data["prochaine_visite"] = getattr(prochain_entretien, "date_debut", None)
 
            # Production aujourd’hui

            prod_jour = ProductionConsommation.objects.filter(

                installation=installation,

                horodatage__date=date.today()

            ).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
 
            # Production du mois

            prod_mois = ProductionConsommation.objects.filter(

                installation=installation,

                horodatage__month=date.today().month

            ).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
 
            data["production_jour"] = round(prod_jour, 2)

            data["production_mois"] = round(prod_mois, 2)
 
            # Consommation aujourd’hui

            conso_jour = ProductionConsommation.objects.filter(

                installation=installation,

                horodatage__date=date.today()

            ).aggregate(total=Sum('energie_consomme_kwh'))['total'] or 0
 
            data["consommation_jour"] = round(conso_jour, 2)
 
            # Alertes actives

            alertes = AlarmeDeclenchee.objects.filter(installation=installation, est_resolue=False)
            data["alertes"] = {
                "mineures": alertes.filter(code_alarme__gravite="mineure").count(),
                "critiques": alertes.filter(code_alarme__gravite="critique").count()
            }
 
            # Graphe production par heure

            prod_par_heure = ProductionConsommation.objects.filter(

                installation=installation,

                horodatage__date=date.today()

            ).annotate(heure=TruncHour('horodatage')).values('heure').annotate(total=Sum('energie_produite_kwh'))
 
            data["production_journaliere"] = {

                item['heure'].strftime("%H:%M"): round(item['total'], 2) for item in prod_par_heure

            }
 
            # Graphe production par jour

            prod_par_jour = ProductionConsommation.objects.filter(

                installation=installation,

                horodatage__month=date.today().month

            ).annotate(jour=TruncDay('horodatage')).values('jour').annotate(total=Sum('energie_produite_kwh'))
 
            data["production_mensuelle"] = {

                item['jour'].strftime("%d"): round(item['total'], 2) for item in prod_par_jour

            }
 
            return Response(data)
 
        except Exception as e:

            import traceback

            traceback.print_exc()

            return Response({"error": str(e)}, status=500)
 


#partie geographique sur carte 

class InstallationGeoDataView(ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
    serializer_class = InstallationGeoSerializer

    def get_queryset(self):
        return Installation.objects.filter(latitude__isnull=False, longitude__isnull=False)
    




#installation par installateur
class ListerMesInstallationsView(APIView):
    """
    Liste des installations associées à l'installateur connecté.
    """
    permission_classes = [IsAuthenticated,IsInstallateur]

    def get(self, request):
        user = request.user

        if user.role != 'installateur':
            return Response({"error": "Accès non autorisé."}, status=status.HTTP_403_FORBIDDEN)

        installations = Installation.objects.filter(installateur=user)

        serializer = InstallationSerializer(installations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class InstallationGeoDataInstallateurView(ListAPIView):
    """
    Liste des installations (géolocalisées) associées à l'installateur connecté.
    """
    permission_classes = [IsAuthenticated, IsInstallateur]
    serializer_class = InstallationGeoSerializer  

    def get_queryset(self):
        user = self.request.user

        if user.role != 'installateur':
            return Installation.objects.none()

        return Installation.objects.filter(
            installateur=user,
            latitude__isnull=False,
            longitude__isnull=False
        )
    

class StatistiquesInstallateurView(APIView):
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        user = request.user

        if user.role != 'installateur':
            return Response({"error": "Accès non autorisé."}, status=status.HTTP_403_FORBIDDEN)

        cache_key = f"stats:installations_installateur_{user.id}"
        data = cache.get(cache_key)
        if data:
            return Response(data)

        total_installations = Installation.objects.filter(installateur=user).count()
        total_en_panne = Installation.objects.filter(installateur=user, statut='fault').count()
        total_normales = Installation.objects.filter(installateur=user, statut='active').count()

        data = {
            "total_installations": total_installations,
            "total_en_panne": total_en_panne,
            "total_normales": total_normales
        }

        cache.set(cache_key, data, timeout=3600)
        return Response(data, status=status.HTTP_200_OK)
