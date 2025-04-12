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
    path('detail-installation/<int:id>/', DetailsInstallationView.as_view(), name='detail-installation'),
    path('ajouter-installation/', AjouterInstallationView.as_view(), name='ajouter-installation'),
    path('modifier-installation/<int:id>/', ModifierInstallationView.as_view(), name='modifier-installation'),
    path('supprimer-installation/<int:installation_id>/', SupprimerInstallationView.as_view(), name='supprimer-installation'),
    path('statistiques/', StatistiquesInstallationsView.as_view(), name='statistiques_installations'),
  
]