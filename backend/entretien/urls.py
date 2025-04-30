from django.urls import path
from .views import (
    EntretienListCreateAPIView,
    EntretienDetailAPIView,
    EntretienCalendarAPIView,
    EntretienStatistiquesView,
    EntretiensClientAPIView,
    EntretienClientDetailView
)

urlpatterns = [
    path('entretiens/', EntretienListCreateAPIView.as_view(), name='entretien-list-create'),
    path('entretiens/<int:pk>/', EntretienDetailAPIView.as_view(), name='entretien-detail'),
    path('entretiens/calendar/', EntretienCalendarAPIView.as_view(), name='entretien-calendar'),
    path("entretien/statistiques/", EntretienStatistiquesView.as_view(), name="entretien-statistiques"),

    path("client/entretiens/", EntretiensClientAPIView.as_view(), name="entretiens-client"),
    path("client/entretiens/<int:pk>/", EntretienClientDetailView.as_view(), name="detail-entretien-client"),

]