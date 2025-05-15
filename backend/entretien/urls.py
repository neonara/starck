from django.urls import path
from .views import (
    EntretienCalendarInstallateurAPIView,
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
    MesEntretiensAPIView,
    MesEntretiensInstallateurAPIView,
    RappelEntretienAPIView
)

urlpatterns = [
    path('entretiens/', EntretienListCreateAPIView.as_view(), name='entretien-list-create'),
    path('entretiens/<int:pk>/', EntretienDetailAPIView.as_view(), name='entretien-detail'),
    path('entretiens/calendar/', EntretienCalendarAPIView.as_view(), name='entretien-calendar'),
    path("entretien/statistiques/", EntretienStatistiquesView.as_view(), name="entretien-statistiques"),
    
    
    path('entretiens/<int:entretien_id>/rappel/', RappelEntretienAPIView.as_view(), name='ajouter-rappel'),
    path('entretiens/mes-entretiens/', MesEntretiensAPIView.as_view(), name='mes-entretiens'),
    path('entretiens/mes-entretiens-installateur/', MesEntretiensInstallateurAPIView.as_view(), name='mes-entretiens-installateur'),  # ➡️ ici
    path('entretiens/calendar-installateur/', EntretienCalendarInstallateurAPIView.as_view(), name='entretien-calendar-installateur'),

    path("client/entretiens/", EntretiensClientAPIView.as_view(), name="entretiens-client"),
    path("client/entretiens/<int:pk>/", EntretienClientDetailView.as_view(), name="detail-entretien-client"),
    
    
    path('entretiens/<int:entretien_id>/rappel/', RappelEntretienAPIView.as_view(), name='ajouter-rappel'),
    path('entretiens/mes-entretiens/', MesEntretiensAPIView.as_view(), name='mes-entretiens'),
    path('entretiens/mes-entretiens-installateur/', MesEntretiensInstallateurAPIView.as_view(), name='mes-entretiens-installateur'),  # ➡️ ici
path('entretiens/calendar-installateur/', EntretienCalendarInstallateurAPIView.as_view(), name='entretien-calendar-installateur'),
    path('entretiens/calendar-installateur/', EntretienCalendarInstallateurAPIView.as_view(), name='entretien-calendar-installateur'),

    path("client/entretiens/", EntretiensClientAPIView.as_view(), name="entretiens-client"),
    path("client/entretiens/<int:pk>/", EntretienClientDetailView.as_view(), name="detail-entretien-client"),

]


