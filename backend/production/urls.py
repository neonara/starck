# urls.py
from django.urls import path
from .views import ProductionConsommationAPIView

urlpatterns = [
    path('production-consommation/', ProductionConsommationAPIView.as_view(), name='production_consommation'),
]
