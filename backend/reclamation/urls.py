from django.urls import path
from .views import EnvoyerReclamationView, ReclamationListView, ReclamationUpdateView
 
urlpatterns = [
    path('reclamations/envoyer/', EnvoyerReclamationView.as_view(), name='envoyer_reclamation'),
    path('reclamations/', ReclamationListView.as_view(), name='liste_reclamations'),
    path('reclamations/<int:pk>/', ReclamationUpdateView.as_view(), name='update_reclamation'),
]