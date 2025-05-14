from django.urls import path
from .views import (
    AjouterAlarmeView,
    ListeAlarmesView,
    StatistiquesAlarmesView,
    ModifierAlarmeView,
    SupprimerAlarmeView,
    DetailAlarmeView,
    AjouterAlarmeCodeView,
    ListeAlarmeCodesView,
    ModifierAlarmeCodeView,
    SupprimerAlarmeCodeView,
    DetailAlarmeCodeView,
    StatistiquesAlarmeCodesView,
    StatistiquesAlarmesClientView,
    StatistiquesAlarmesInstallationView,
    ListeAlarmesInstallateurView,
    StatistiquesAlarmesInstallateurView,
    ListeAlarmesInstallateurView
)



urlpatterns = [
#alarme code
 path('codes/ajouter/', AjouterAlarmeCodeView.as_view(), name='ajouter-code-alarme'),
    path('codes/liste/', ListeAlarmeCodesView.as_view(), name='liste-codes-alarme'),
    path('codes/detail/<int:pk>/', DetailAlarmeCodeView.as_view(), name='detail-code-alarme'),
    path('codes/modifier/<int:pk>/', ModifierAlarmeCodeView.as_view(), name='modifier-code-alarme'),
    path('codes/supprimer/<int:pk>/', SupprimerAlarmeCodeView.as_view(), name='supprimer-code-alarme'),
    path('codes/stats/', StatistiquesAlarmeCodesView.as_view(), name='statistiques-code-alarme'),

#alarme declenche
    path('ajouter/', AjouterAlarmeView.as_view(), name='ajouter-alarme'),
    path('liste/', ListeAlarmesView.as_view(), name='liste-alarmes'),
    path('stats/', StatistiquesAlarmesView.as_view(), name='statistiques-alarmes'),
    path('modifier/<int:pk>/', ModifierAlarmeView.as_view(), name='modifier-alarme'),
    path('supprimer/<int:pk>/', SupprimerAlarmeView.as_view(), name='supprimer-alarme'),
    path('detail/<int:pk>/', DetailAlarmeView.as_view(), name='detail-alarme'),
    path("stats-client/", StatistiquesAlarmesClientView.as_view()),
    path("stats/<int:installation_id>/", StatistiquesAlarmesInstallationView.as_view(), name="statistiques-alarmes-installation"),
    path('liste/installateur/', ListeAlarmesInstallateurView.as_view(), name='liste-alarmes-installateur'),
    path("statistiques-installateur/", StatistiquesAlarmesInstallateurView.as_view(), name="statistiques-alarmes-installateur"),

]
