from django.urls import path
from .views import *

urlpatterns = [
    path('creer-export/', ExportInstallationsView.as_view()),
    path('liste/', ListeExportsView.as_view()),
    path('supprimer/<int:pk>/', SupprimerExportView.as_view()),
    path('export-global/', ExportGlobalInstallationsView.as_view()),
    path("export-utilisateurs/", ExportGlobalUtilisateursView.as_view()), 
    path("export-alarmecodes/", ExportAlarmeCodesView.as_view(), name="export-alarmecodes"),
    path('export-alarmes-declenchees/', ExportAlarmesDeclencheesView.as_view(), name='export-alarmes-declenchees'),
    path("exports/interventions/", ExportInterventionsView.as_view(), name="export-interventions"),

path("exports/entretiens/", ExportEntretiensView.as_view()),
path("export/reclamations/", ExportReclamationsView.as_view(), name="export_reclamations"),
path("export-equipements/", ExportEquipementsView.as_view(), name="export-equipements"),

]
