from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from notification.tasks import send_notification_to_email

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification_view(request):
    email = request.data.get('email')
    message = request.data.get('message')
    if not email or not message:
        return Response({"error": "email et message sont requis."}, status=400)
    send_notification_to_email.delay(email, message)
    return Response({"success": True, "message": "Notification envoyée."})