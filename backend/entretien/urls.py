from django.urls import path
from .views import (
    EntretienListCreateAPIView,
    EntretienDetailAPIView,
    EntretienCalendarAPIView,
    EntretienStatistiquesView,
    RappelEntretienAPIView,
    MesEntretiensAPIView, 
    MesEntretiensInstallateurAPIView,
    EntretienCalendarInstallateurAPIView,
    EntretienStatistiquesView,
    EntretiensClientAPIView,
    EntretienClientDetailView,
    MesEntretiens7JoursAPIView
)

urlpatterns = [
    path('entretiens/', EntretienListCreateAPIView.as_view(), name='entretien-list-create'),
    path('entretiens/<int:pk>/', EntretienDetailAPIView.as_view(), name='entretien-detail'),
    path('entretiens/calendar/', EntretienCalendarAPIView.as_view(), name='entretien-calendar'),
    path("entretien/statistiques/", EntretienStatistiquesView.as_view(), name="entretien-statistiques"),
    
    
    path('entretiens/<int:entretien_id>/rappel/', RappelEntretienAPIView.as_view(), name='ajouter-rappel'),
    path('entretiens/mes-entretiens/', MesEntretiensAPIView.as_view(), name='mes-entretiens'),
    path('entretiens/mes-entretiens-installateur/', MesEntretiensInstallateurAPIView.as_view(), name='mes-entretiens-installateur'),  
    path('entretiens/calendar-installateur/', EntretienCalendarInstallateurAPIView.as_view(), name='entretien-calendar-installateur'),
    path('mes-entretiens-7-jours/', MesEntretiens7JoursAPIView.as_view(), name='mes_entretiens_7_jours'),


    path("client/entretiens/", EntretiensClientAPIView.as_view(), name="entretiens-client"),
    path("client/entretiens/<int:pk>/", EntretienClientDetailView.as_view(), name="detail-entretien-client"),

]
