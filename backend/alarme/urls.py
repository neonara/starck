from django.urls import path, include
from .views import AjouterAlarmeView, ListeAlarmesView, StatistiquesAlarmesView, ModifierAlarmeView, SupprimerAlarmeView, DetailAlarmeView

urlpatterns = [
    path('ajouter/', AjouterAlarmeView.as_view(), name='ajouter-alarmes'),
    path('liste/', ListeAlarmesView.as_view(), name='liste-alarmes'),
    path('statistiques/', StatistiquesAlarmesView.as_view(), name='statistiques-alarmes'),
    path('modifier/<int:alarme_id>/', ModifierAlarmeView.as_view(), name='modifier-alarmes'),
    path('supprimer/<int:alarme_id>/', SupprimerAlarmeView.as_view(), name='supprimer-alarmes'),
    path('detail/<int:alarme_id>/', DetailAlarmeView.as_view(), name='detail-alarmes'),
]
