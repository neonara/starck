from django.urls import path
from .views import send_notification_view

urlpatterns = [
    path('send-notification/', send_notification_view),
]
