from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import ProductionConsommation
from .serializers import ProductionConsommationSerializer
from installations.models import Installation
from django.utils import timezone
from django.db.models import Sum
from django.db.models.functions import TruncHour, TruncDay,TruncMonth
import requests
import os
from datetime import datetime

from datetime import timedelta
from users.permissions import IsAdminOrInstallateur, IsInstallateur
from rest_framework.permissions import IsAuthenticated
HASS_URL = "http://ammar404.duckdns.org:8123"
HASS_HEADERS = {
    "Authorization": f"Bearer {os.getenv('HASS_TOKEN')}",
    "Content-Type": "application/json"
}

def fetch_homeassistant_states():
    try:
        response = requests.get(f"{HASS_URL}/api/states", headers=HASS_HEADERS)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return None


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
        states = fetch_homeassistant_states()
        if states is None:
            return Response({"error": "Erreur lors de l’appel à Home Assistant"}, status=500)

        # Tu peux filtrer par installation_id si tu associes les entity_id à tes installations
        production = [
            {
                "entity_id": s["entity_id"],
                "state": s["state"],
                "unit": s["attributes"].get("unit_of_measurement", ""),
                "friendly_name": s["attributes"].get("friendly_name", ""),
                "last_updated": s["last_updated"]
            }
            for s in states
            if "production" in s["entity_id"] or "energie_produite" in s["entity_id"]
        ]
        return Response(production, status=200)





class StatistiquesGlobalesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request):
        today = timezone.now()
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        # Calculer la production totale
        total_production = ProductionConsommation.objects.filter(
            energie_produite_kwh__isnull=False
        ).aggregate(total=Sum("energie_produite_kwh"))["total"] or 0.0

        # Calculer la consommation totale
        total_consumption = ProductionConsommation.objects.filter(
            energie_consomme_kwh__isnull=False
        ).aggregate(total=Sum("energie_consomme_kwh"))["total"] or 0.0

        # Production et consommation journalières
        daily_production = ProductionConsommation.objects.filter(
            energie_produite_kwh__isnull=False,
            horodatage__date=today.date()
        ).aggregate(total=Sum("energie_produite_kwh"))["total"] or 0.0

        daily_consumption = ProductionConsommation.objects.filter(
            energie_consomme_kwh__isnull=False,
            horodatage__date=today.date()
        ).aggregate(total=Sum("energie_consomme_kwh"))["total"] or 0.0

        # Production et consommation mensuelles
        monthly_production = ProductionConsommation.objects.filter(
            energie_produite_kwh__isnull=False,
            horodatage__gte=month_start
        ).aggregate(total=Sum("energie_produite_kwh"))["total"] or 0.0

        monthly_consumption = ProductionConsommation.objects.filter(
            energie_consomme_kwh__isnull=False,
            horodatage__gte=month_start
        ).aggregate(total=Sum("energie_consomme_kwh"))["total"] or 0.0

        # Puissance maximale
        max_power = ProductionConsommation.objects.filter(
            puissance_maximale_kw__isnull=False,
            horodatage__gte=today - timedelta(days=1)
        ).order_by("-puissance_maximale_kw").first()
        max_power_value = float(max_power.puissance_maximale_kw) if max_power else 0.0

        return Response({
            "production_totale": float(total_production),
            "production_journaliere": float(daily_production),
            "production_mensuelle": float(monthly_production),
            "production_annuelle": float(ProductionConsommation.objects.filter(
                energie_produite_kwh__isnull=False,
                horodatage__gte=year_start
            ).aggregate(total=Sum("energie_produite_kwh"))["total"] or 0.0),
            "consommation_totale": float(total_consumption),
            "consommation_journaliere": float(daily_consumption),
            "consommation_mensuelle": float(monthly_consumption),
            "puissance_maximale": max_power_value,
        }, status=status.HTTP_200_OK)
    

from collections import defaultdict
from dateutil import parser

class StatistiquesProductionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]

    def get(self, request, installation_id):
        try:
            installation = Installation.objects.get(id=installation_id)
        except Installation.DoesNotExist:
            return Response({"error": "Installation non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now()
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        queryset = ProductionConsommation.objects.filter(
            installation=installation,
            energie_produite_kwh__isnull=False
        )

        # Production totale
        total_production = queryset.aggregate(total=Sum("energie_produite_kwh"))["total"] or 0.0

        # Production journalière (par heure)
        daily_by_hour = defaultdict(float)
        hourly_data = queryset.filter(horodatage__date=today.date()).annotate(
            hour=TruncHour('horodatage')
        ).values('hour').annotate(total=Sum('energie_produite_kwh')).order_by('hour')
        for entry in hourly_data:
            daily_by_hour[entry['hour'].strftime("%Hh")] += float(entry['total'] or 0.0)

        # Production mensuelle (par jour)
        monthly_by_day = defaultdict(float)
        daily_data = queryset.filter(horodatage__gte=month_start).annotate(
            day=TruncDay('horodatage')
        ).values('day').annotate(total=Sum('energie_produite_kwh')).order_by('day')
        for entry in daily_data:
            monthly_by_day[entry['day'].strftime("%d")] += float(entry['total'] or 0.0)

        # Production annuelle (par mois)
        yearly_by_month = defaultdict(float)
        monthly_data = queryset.filter(horodatage__gte=year_start).annotate(
            month=TruncMonth('horodatage')
        ).values('month').annotate(total=Sum('energie_produite_kwh')).order_by('month')
        for entry in monthly_data:
            yearly_by_month[entry['month'].strftime("%b")] += float(entry['total'] or 0.0)

        return Response({
            "prod_journaliere_par_heure": dict(daily_by_hour),
            "prod_mensuelle_par_jour": dict(monthly_by_day),
            "prod_annuelle_par_mois": dict(yearly_by_month),
            "prod_totale": float(total_production)
        }, status=status.HTTP_200_OK)

class StatistiquesInstallationClientView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        states = fetch_homeassistant_states()
        if states is None:
            return Response({"error": "Erreur Home Assistant"}, status=500)

        today = datetime.utcnow()

        def parse_state(s):
            try:
                return float(s["state"])
            except:
                return 0.0

        stats = {
            "production_jour": 0,
            "production_mois": 0,
            "production_totale": 0,
            "consommation_jour": 0,
            "consommation_mois": 0,
            "consommation_totale": 0,
        }

        for s in states:
            if not s["entity_id"].startswith("sensor."):
                continue

            try:
                dt = parser.isoparse(s["last_updated"])
                val = parse_state(s)

                # PRODUCTION
                if "production" in s["entity_id"]:
                    stats["production_totale"] += val
                    if dt.date() == today.date():
                        stats["production_jour"] += val
                    if dt.year == today.year and dt.month == today.month:
                        stats["production_mois"] += val

                # CONSOMMATION
                if "import" in s["entity_id"] or "consommation" in s["entity_id"]:
                    stats["consommation_totale"] += val
                    if dt.date() == today.date():
                        stats["consommation_jour"] += val
                    if dt.year == today.year and dt.month == today.month:
                        stats["consommation_mois"] += val

            except Exception as e:
                continue

        return Response(stats)
    
#production installateur 
class StatistiquesInstallateurProductionView(APIView):
    permission_classes = [IsAuthenticated, IsInstallateur]

    def get(self, request):
        today = timezone.now()
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        year_start = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        installations = Installation.objects.filter(installateur=request.user)
        if not installations:
            return Response({"error": "Aucune installation associée à cet installateur"}, status=status.HTTP_404_NOT_FOUND)

        queryset = ProductionConsommation.objects.filter(
            installation__in=installations,
            energie_produite_kwh__isnull=False
        )

        total_production = queryset.aggregate(total=Sum("energie_produite_kwh"))["total"] or 0.0
        daily_by_hour = defaultdict(float)
        hourly_data = queryset.filter(horodatage__date=today.date()).annotate(
            hour=TruncHour('horodatage')
        ).values('hour').annotate(total=Sum('energie_produite_kwh')).order_by('hour')
        for entry in hourly_data:
            daily_by_hour[entry['hour'].strftime("%Hh")] += float(entry['total'] or 0.0)

        monthly_by_day = defaultdict(float)
        daily_data = queryset.filter(horodatage__gte=month_start).annotate(
            day=TruncDay('horodatage')
        ).values('day').annotate(total=Sum('energie_produite_kwh')).order_by('day')
        for entry in daily_data:
            monthly_by_day[entry['day'].strftime("%d")] += float(entry['total'] or 0.0)

        yearly_by_month = defaultdict(float)
        monthly_data = queryset.filter(horodatage__gte=year_start).annotate(
            month=TruncMonth('horodatage')
        ).values('month').annotate(total=Sum('energie_produite_kwh')).order_by('month')
        for entry in monthly_data:
            yearly_by_month[entry['month'].strftime("%b")] += float(entry['total'] or 0.0)

        return Response({
            "prod_journaliere": dict(daily_by_hour),
            "prod_mensuelle": dict(monthly_by_day),
            "prod_annuelle": dict(yearly_by_month),
            "prod_totale": float(total_production)
        }, status=status.HTTP_200_OK)