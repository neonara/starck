from django.urls import path
from .views import send_notification_view, test_notification

urlpatterns = [
    path('send-notification/', send_notification_view),
    path("test-notif/", test_notification),

]
