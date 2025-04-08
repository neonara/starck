from django.urls import path
from .views import *

urlpatterns = [
    path('send-notification/', send_notification_view),
    path("get-my-notifications/", get_my_notifications),
    path('mark-read/<int:pk>/', mark_notification_read),
    path('mark-all-read/', mark_all_read),
    path('delete/<int:pk>/', delete_notification),
]
