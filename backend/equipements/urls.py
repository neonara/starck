from django.urls import path
from .views import (
    AjouterEquipementView,
    ModifierEquipementView,
    SupprimerEquipementView,
    ListerEquipementsParInstallationView,
    DetailsEquipementView,
    EquipementParQRCodeView
)

urlpatterns = [
    path('ajouter/', AjouterEquipementView.as_view(), name='ajouter_equipement'),
    path('modifier/<int:id>/', ModifierEquipementView.as_view(), name='modifier_equipement'),
    path('supprimer/<int:id>/', SupprimerEquipementView.as_view(), name='supprimer_equipement'),
    path('installation/<int:installation_id>/', ListerEquipementsParInstallationView.as_view(), name='equipements_par_installation'),
    path('details/<int:id>/', DetailsEquipementView.as_view(), name='details_equipement'),
    path("qrcode/<str:code>/", EquipementParQRCodeView.as_view(), name="equipement-par-qrcode"),

]
