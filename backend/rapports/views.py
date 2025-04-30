from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.db.models.functions import TruncDay
from production.models import ProductionConsommation
from users.permissions import IsAdminOrInstallateur
from datetime import datetime
import pandas as pd
import io
from django.http import HttpResponse
 
class RapportProductionMensuelleView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
 
    def get(self, request):
        installation_id = request.query_params.get("installation_id")
        mois = request.query_params.get("mois")  # Format: "2025-03"
 
        if not installation_id or not mois:
            return Response({"error": "installation_id et mois sont requis"}, status=400)
 
        try:
            year, month = map(int, mois.split("-"))
 
            queryset = ProductionConsommation.objects.filter(
                installation_id=installation_id,
                horodatage__year=year,
                horodatage__month=month
            ).annotate(day=TruncDay("horodatage")).values("day").annotate(
                total=Sum("energie_produite_kwh")
            ).order_by("day")
 
            resultats = [
                {
                    "jour": entry["day"].strftime("%Y-%m-%d"),
                    "production_kwh": float(entry["total"])
                }
                for entry in queryset
            ]
 
            return Response(resultats, status=200)
 
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class ExporterRapportProductionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
 
    def post(self, request):
        installation_id = request.data.get("installation_id")
        mois = request.data.get("mois")  # ex: "2025-03"
 
        if not installation_id or not mois:
            return Response({"error": "installation_id et mois requis"}, status=400)
 
        year, month = map(int, mois.split("-"))
 
        queryset = ProductionConsommation.objects.filter(
            installation_id=installation_id,
            horodatage__year=year,
            horodatage__month=month
        ).annotate(jour=TruncDay("horodatage")).values("jour").annotate(
            production_kwh=Sum("energie_produite_kwh")
        ).order_by("jour")
 
        data = [{
            "Jour": entry["jour"].strftime("%Y-%m-%d"),
            "Production (kWh)": float(entry["production_kwh"])
        } for entry in queryset]
 
        df = pd.DataFrame(data)
 
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="Production", index=False)
 
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        filename = f"rapport_production_{mois}.xlsx"
        response['Content-Disposition'] = f'attachment; filename={filename}'
        return response
    
from django.template.loader import render_to_string
from xhtml2pdf import pisa
from django.http import HttpResponse
import tempfile
from rest_framework.views import APIView

from django.db.models.functions import TruncDay
from django.db.models import Sum
from rest_framework.response import Response
 
class ExporterRapportProductionPDFView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
 
    def post(self, request):
        installation_id = request.data.get("installation_id")
        mois = request.data.get("mois")  # format YYYY-MM
 
        if not installation_id or not mois:
            return Response({"error": "installation_id et mois requis"}, status=400)
 
        year, month = map(int, mois.split("-"))
        queryset = ProductionConsommation.objects.filter(
            installation_id=installation_id,
            horodatage__year=year,
            horodatage__month=month
        ).annotate(jour=TruncDay("horodatage")).values("jour").annotate(
            production_kwh=Sum("energie_produite_kwh")
        ).order_by("jour")
 
        data = [{
            "jour": entry["jour"].strftime("%Y-%m-%d"),
            "production_kwh": float(entry["production_kwh"])
        } for entry in queryset]
 
        html_string = render_to_string("rapport_production_pdf.html", {
            "mois": mois,
            "donnees": data,
        })
 
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="rapport_production_{mois}.pdf"'
 
        pisa_status = pisa.CreatePDF(
            html_string, dest=response
        )
 
        if pisa_status.err:
            return Response({'error': 'Erreur lors de la génération du PDF'}, status=500)
        return response
    
class RapportConsommationMensuelleView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
 
    def get(self, request):
        installation_id = request.query_params.get("installation_id")
        mois = request.query_params.get("mois")  # ex: 2025-03
 
        if not installation_id or not mois:
            return Response({"error": "installation_id et mois requis"}, status=400)
 
        year, month = map(int, mois.split("-"))
        queryset = ProductionConsommation.objects.filter(
            installation_id=installation_id,
            horodatage__year=year,
            horodatage__month=month
        ).annotate(jour=TruncDay("horodatage")).values("jour").annotate(
            consommation_kwh=Sum("energie_consomme_kwh")
        ).order_by("jour")
 
        resultats = [
            {
                "jour": entry["jour"].strftime("%Y-%m-%d"),
                "consommation_kwh": float(entry["consommation_kwh"])
            }
            for entry in queryset
        ]
 
        return Response(resultats, status=200)
    
 
class ExporterRapportConsommationExcelView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
 
    def post(self, request):
        installation_id = request.data.get("installation_id")
        mois = request.data.get("mois")
 
        if not installation_id or not mois:
            return Response({"error": "installation_id et mois requis"}, status=400)
 
        year, month = map(int, mois.split("-"))
        queryset = ProductionConsommation.objects.filter(
            installation_id=installation_id,
            horodatage__year=year,
            horodatage__month=month
        ).annotate(jour=TruncDay("horodatage")).values("jour").annotate(
            consommation_kwh=Sum("energie_consomme_kwh")
        ).order_by("jour")
 
        data = [{
            "Date": entry["jour"].strftime("%Y-%m-%d"),
            "Consommation (kWh)": float(entry["consommation_kwh"])
        } for entry in queryset]
 
        df = pd.DataFrame(data)
 
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename=rapport_consommation_{mois}.xlsx'
        df.to_excel(response, index=False)
 
        return response
    
class ExporterRapportConsommationPDFView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrInstallateur]
 
    def post(self, request):
        installation_id = request.data.get("installation_id")
        mois = request.data.get("mois")
 
        if not installation_id or not mois:
            return Response({"error": "installation_id et mois requis"}, status=400)
 
        year, month = map(int, mois.split("-"))
        queryset = ProductionConsommation.objects.filter(
            installation_id=installation_id,
            horodatage__year=year,
            horodatage__month=month
        ).annotate(jour=TruncDay("horodatage")).values("jour").annotate(
            consommation_kwh=Sum("energie_consomme_kwh")
        ).order_by("jour")
 
        data = [{
            "jour": entry["jour"].strftime("%Y-%m-%d"),
            "consommation_kwh": float(entry["consommation_kwh"])
        } for entry in queryset]
 
        html_string = render_to_string("rapport_consommation_pdf.html", {
            "mois": mois,
            "donnees": data,
        })
 
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=rapport_consommation_{mois}.pdf'
 
        pisa_status = pisa.CreatePDF(html_string, dest=response)
 
        if pisa_status.err:
            return Response({'error': 'Erreur PDF'}, status=500)
        return response