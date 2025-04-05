from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from notification.tasks import send_notification_to_email
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification_view(request):
    email = request.data.get('email')
    message = request.data.get('message')
    if not email or not message:
        return Response({"error": "email et message sont requis."}, status=400)
    send_notification_to_email.delay(email, message)
    return Response({"success": True, "message": "Notification envoyée."})


def test_notification(request):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "user_60",  # Remplace avec ton user ID
        {
            "type": "send_notification",
            "message": {
                "title": "💥 Test WebSocket",
                "content": "Tu viens de recevoir une notif !"
            }
        }
    )
    return JsonResponse({"status": "sent"})