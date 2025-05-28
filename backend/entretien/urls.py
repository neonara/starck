from django.urls import path
from .views import (
    EntretienCalendarInstallateurAPIView,
    EntretienListCreateAPIView,
    EntretienDetailAPIView,
    EntretienCalendarAPIView,
    EntretienStatistiquesView,
    ListeEntretiensTechnicienAPIView,
    ModifierStatutEntretienAPIView,
    RappelEntretienAPIView,
    MesEntretiensAPIView, 
    MesEntretiensInstallateurAPIView,
    EntretienCalendarInstallateurAPIView,
    EntretienStatistiquesView,
    EntretiensClientAPIView,
    EntretienClientDetailView,
    MesEntretiensAPIView,
    MesEntretiensInstallateurAPIView,
    RappelEntretienAPIView,
    ListeEntretiensTechnicienAPIView,
    ModifierStatutEntretienAPIView, 
    TechnicienCalendarAPIView,
    ClientCalendarAPIView,
    StatistiquesActivitesTechnicienView,
    MesEntretiens7JoursAPIView,
    EntretienInstallateurDetailView
    

)

urlpatterns = [
    path('entretiens/', EntretienListCreateAPIView.as_view(), name='entretien-list-create'),
    path('entretiens/<int:pk>/', EntretienDetailAPIView.as_view(), name='entretien-detail'),
    path('entretiens/calendar/', EntretienCalendarAPIView.as_view(), name='entretien-calendar'),
    path("entretien/statistiques/", EntretienStatistiquesView.as_view(), name="entretien-statistiques"),

    path("calendar/client/", ClientCalendarAPIView.as_view(), name="calendar-client"),

    path('entretiens/<int:entretien_id>/rappel/', RappelEntretienAPIView.as_view(), name='ajouter-rappel'),
    path('entretiens/mes-entretiens/', MesEntretiensAPIView.as_view(), name='mes-entretiens'),
    path("installateur/entretiens/<int:pk>/", EntretienInstallateurDetailView.as_view(), name="entretien-installateur-detail"),

    path('entretiens/mes-entretiens-installateur/', MesEntretiensInstallateurAPIView.as_view(), name='mes-entretiens-installateur'),  
    path('entretiens/calendar-installateur/', EntretienCalendarInstallateurAPIView.as_view(), name='entretien-calendar-installateur'),


    path("client/entretiens/", EntretiensClientAPIView.as_view(), name="entretiens-client"),
    path("client/entretiens/<int:pk>/", EntretienClientDetailView.as_view(), name="detail-entretien-client"),
    
    
    path('entretiens/<int:entretien_id>/rappel/', RappelEntretienAPIView.as_view(), name='ajouter-rappel'),
    path('entretiens/mes-entretiens/', MesEntretiensAPIView.as_view(), name='mes-entretiens'),
    path('entretiens/mes-entretiens-installateur/', MesEntretiensInstallateurAPIView.as_view(), name='mes-entretiens-installateur'),  # ➡️ ici
    path('technicien/entretiens/', ListeEntretiensTechnicienAPIView.as_view(), name='liste-entretiens-technicien'),
    path("entretien/modifier-statut-technicien/<int:pk>/", ModifierStatutEntretienAPIView.as_view(), name="modifier-statut-entretien"),
    path("entretien/calendar/technicien/", TechnicienCalendarAPIView.as_view(), name="calendar-technicien"),

    
    path('entretiens/calendar-installateur/', EntretienCalendarInstallateurAPIView.as_view(), name='entretien-calendar-installateur'),

    path("client/entretiens/", EntretiensClientAPIView.as_view(), name="entretiens-client"),
    path("client/entretiens/<int:pk>/", EntretienClientDetailView.as_view(), name="detail-entretien-client"),


    path("dashboard/technicien/activites-mensuelles/", StatistiquesActivitesTechnicienView.as_view(), name="stats_tech_dashboard"),
    path('mes-entretiens-7-jours/', MesEntretiens7JoursAPIView.as_view(), name='mes_entretiens_7_jours'),


]



