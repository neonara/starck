from django.urls import path
from intervention.views import (
    ListeFicheInterventionView, 
    CreerFicheInterventionView,
    DetailFicheInterventionView,
    ModifierFicheInterventionView,
    SupprimerFicheInterventionView,
    ChangerStatutFicheInterventionView,
    AssignerTechnicienView
)

urlpatterns = [
    path('interventions/', ListeFicheInterventionView.as_view(), name='intervention-liste'),
    path('interventions/creer/', CreerFicheInterventionView.as_view(), name='intervention-creer'),
    path('interventions/<int:pk>/', DetailFicheInterventionView.as_view(), name='intervention-detail'),
    path('interventions/<int:pk>/modifier/', ModifierFicheInterventionView.as_view(), name='intervention-modifier'),
    path('interventions/<int:pk>/supprimer/', SupprimerFicheInterventionView.as_view(), name='intervention-supprimer'),
    path('interventions/<int:pk>/changer-statut/', ChangerStatutFicheInterventionView.as_view(), name='intervention-changer-statut'),
    path('interventions/<int:pk>/assigner-technicien/', AssignerTechnicienView.as_view(), name='intervention-assigner-technicien'),
]