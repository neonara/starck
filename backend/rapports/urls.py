from .views import RapportProductionMensuelleView, ExporterRapportProductionView, ExporterRapportProductionPDFView, RapportConsommationMensuelleView, ExporterRapportConsommationExcelView, ExporterRapportConsommationPDFView
from django.urls import path

urlpatterns = [

    path("rapports/production-mensuelle/", RapportProductionMensuelleView.as_view()),
    path("rapports/export-production/", ExporterRapportProductionView.as_view()),
    path("rapports/export-production-pdf/", ExporterRapportProductionPDFView.as_view()),
    path("rapports/consommation-mensuelle/", RapportConsommationMensuelleView.as_view()),
    path("rapports/export-consommation/", ExporterRapportConsommationExcelView.as_view()),
    path("rapports/export-consommation-pdf/", ExporterRapportConsommationPDFView.as_view()),
]

 