from .views import( RapportProductionMensuelleView, ExporterRapportProductionView, ExporterRapportProductionPDFView, RapportConsommationMensuelleView, ExporterRapportConsommationExcelView, ExporterRapportConsommationPDFView, RapportAlarmesMensuellesView, ExportRapportAlarmesExcelView, ExportRapportAlarmesPDFView,  RapportProductionClientView, RapportConsommationClientView,
    RapportAlarmesClientView,
    ExportRapportProductionClientExcelView,
    ExportRapportConsommationClientExcelView,
    ExportRapportAlarmesClientExcelView,
    ExportRapportProductionClientPDFView,
    ExportRapportConsommationClientPDFView,
    ExportRapportAlarmesClientPDFView,)
from django.urls import path

urlpatterns = [

    path("rapports/production-mensuelle/", RapportProductionMensuelleView.as_view()),
    path("rapports/export-production/", ExporterRapportProductionView.as_view()),
    path("rapports/export-production-pdf/", ExporterRapportProductionPDFView.as_view()),
    path("rapports/consommation-mensuelle/", RapportConsommationMensuelleView.as_view()),
    path("rapports/export-consommation/", ExporterRapportConsommationExcelView.as_view()),
    path("rapports/export-consommation-pdf/", ExporterRapportConsommationPDFView.as_view()),
    path("rapports/alarme-mensuelle/", RapportAlarmesMensuellesView.as_view(), name="rapport-alarmes-mensuelles"),
    path("rapports/export-alarmes-excel/", ExportRapportAlarmesExcelView.as_view(), name="export-alarmes-excel"),
    path("rapports/export-alarmes-pdf/", ExportRapportAlarmesPDFView.as_view(), name="export-alarmes-pdf"),

    path("client/rapport/production", RapportProductionClientView.as_view(), name="rapport_production_client"),
    path("client/rapport/consommation", RapportConsommationClientView.as_view(), name="rapport_consommation_client"),
    path("client/rapport/alarmes", RapportAlarmesClientView.as_view(), name="rapport_alarmes_client"),

    path("client/export/production/excel", ExportRapportProductionClientExcelView.as_view(), name="export_production_excel_client"),
    path("client/export/consommation/excel", ExportRapportConsommationClientExcelView.as_view(), name="export_consommation_excel_client"),
    path("client/export/alarmes/excel", ExportRapportAlarmesClientExcelView.as_view(), name="export_alarmes_excel_client"),

    path("client/export/production/pdf", ExportRapportProductionClientPDFView.as_view(), name="export_production_pdf_client"),
    path("client/export/consommation/pdf", ExportRapportConsommationClientPDFView.as_view(), name="export_consommation_pdf_client"),
    path("client/export/alarmes/pdf", ExportRapportAlarmesClientPDFView.as_view(), name="export_alarmes_pdf_client"),

]

 