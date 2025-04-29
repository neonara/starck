from django.urls import path
from .views import EnvoyerReclamationView, ReclamationListView, ReclamationUpdateView, MesReclamationsView
 
urlpatterns = [
    path('reclamations/envoyer/', EnvoyerReclamationView.as_view(), name='envoyer_reclamation'),
    path('mes-reclamations/', MesReclamationsView.as_view(), name='mes-reclamations-client'),
    path('reclamations/', ReclamationListView.as_view(), name='liste_reclamations'),
    path('reclamations/<int:pk>/', ReclamationUpdateView.as_view(), name='update_reclamation'),
]