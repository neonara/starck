from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import ProductionConsommation
from .serializers import ProductionConsommationSerializer
from installations.models import Installation
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncHour, TruncDay

from datetime import timedelta
from users.permissions import IsAdminOrInstallateur
from rest_framework.permissions import IsAuthenticated


class AjouterDonneesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def post(self, request):
        serializer = ProductionConsommationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Donnée ajoutée avec succès."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListeProductionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request):
        installation_id = request.query_params.get('installation_id')
        if not installation_id:
            return Response({"error": "installation_id requis"}, status=400)
        
        donnees = ProductionConsommation.objects.filter(installation__id=installation_id)
        serializer = ProductionConsommationSerializer(donnees, many=True)
        return Response(serializer.data, status=200)

class StatistiquesGlobalesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request):
        base_qs = ProductionConsommation.objects.all()

        jour = base_qs.filter(horodatage__date=timezone.now().date()).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
        mois = base_qs.filter(horodatage__year=timezone.now().year, horodatage__month=timezone.now().month).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
        annee = base_qs.filter(horodatage__year=timezone.now().year).aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
        totale = base_qs.aggregate(total=Sum('energie_produite_kwh'))['total'] or 0
        puissance = base_qs.aggregate(max=Sum('puissance_maximale_kw'))['max'] or 0

        return Response({
            "production_journaliere": jour,
            "production_mensuelle": mois,
            "production_annuelle": annee,
            "production_totale": totale,
            "puissance_totale": puissance
        }, status=200)


class StatistiquesProductionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request, installation_id):
        today = timezone.now().date()
        year = today.year
        month = today.month

        base_qs = ProductionConsommation.objects.filter(installation_id=installation_id)

        par_heure = (
            base_qs.filter(horodatage__date=today)
            .annotate(hour=TruncHour("horodatage"))
            .values("hour")
            .annotate(total=Sum("energie_produite_kwh"))
            .order_by("hour")
        )
        prod_journaliere_par_heure = {
            str(entry["hour"].hour): float(entry["total"]) for entry in par_heure
        }

        par_jour = (
            base_qs.filter(horodatage__year=year, horodatage__month=month)
            .annotate(day=TruncDay("horodatage"))
            .values("day")
            .annotate(total=Sum("energie_produite_kwh"))
            .order_by("day")
        )
        prod_mensuelle_par_jour = {
            entry["day"].strftime("%d"): float(entry["total"]) for entry in par_jour
        }

        from django.db.models.functions import TruncMonth
        par_mois = (
            base_qs.filter(horodatage__year=year)
            .annotate(month=TruncMonth("horodatage"))
            .values("month")
            .annotate(total=Sum("energie_produite_kwh"))
            .order_by("month")
        )
        prod_annuelle_par_mois = {
            entry["month"].strftime("%b"): float(entry["total"]) for entry in par_mois
        }

        prod_totale = base_qs.aggregate(total=Sum("energie_produite_kwh"))["total"] or 0

        return Response({
            "prod_journaliere_par_heure": prod_journaliere_par_heure,
            "prod_mensuelle_par_jour": prod_mensuelle_par_jour,
            "prod_annuelle_par_mois": prod_annuelle_par_mois,
            "prod_totale": prod_totale,
        }, status=200)

class StatistiquesInstallationClientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        installation = Installation.objects.filter(client=request.user).first()
        if not installation:
            return Response({"error": "Aucune installation trouvée."}, status=404)

        qs = ProductionConsommation.objects.filter(installation=installation)
        today = timezone.now().date()

        stats = {
            "production_jour": qs.filter(horodatage__date=today).aggregate(Sum("energie_produite_kwh"))["energie_produite_kwh__sum"] or 0,
            "production_mois": qs.filter(horodatage__month=today.month, horodatage__year=today.year).aggregate(Sum("energie_produite_kwh"))["energie_produite_kwh__sum"] or 0,
            "production_totale": qs.aggregate(Sum("energie_produite_kwh"))["energie_produite_kwh__sum"] or 0,

            "consommation_jour": qs.filter(horodatage__date=today).aggregate(Sum("energie_consomme_kwh"))["energie_consomme_kwh__sum"] or 0,
            "consommation_mois": qs.filter(horodatage__month=today.month, horodatage__year=today.year).aggregate(Sum("energie_consomme_kwh"))["energie_consomme_kwh__sum"] or 0,
            "consommation_totale": qs.aggregate(Sum("energie_consomme_kwh"))["energie_consomme_kwh__sum"] or 0,
        }

        return Response(stats)