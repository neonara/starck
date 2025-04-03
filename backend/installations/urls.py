from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InstallationViewSet

router = DefaultRouter()
router.register(r'installations', InstallationViewSet)
urlpatterns = [
        path('api/', include(router.urls)),
]
