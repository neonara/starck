from django.urls import path
from .views import (
    AjouterInstallationView,
    ModifierInstallationView,
    SupprimerInstallationView,
    ListerInstallationsView,
    DetailsInstallationView,
    StatistiquesInstallationsView
)

urlpatterns = [
    path('installations/', ListerInstallationsView.as_view(), name='lister_installations'),
    path('installations/<int:installation_id>/', DetailsInstallationView.as_view(), name='details_installation'),
    path('ajouter-installation/', AjouterInstallationView.as_view(), name='ajouter-installation'),
    path('modifier-installation/<int:installation_id>/', ModifierInstallationView.as_view(), name='modifier-installation'),  
    path('supprimer-installation/<int:installation_id>/', SupprimerInstallationView.as_view(), name='supprimer-installation'),
    path('installations/statistiques/', StatistiquesInstallationsView.as_view(), name='statistiques_installations'),
  
]