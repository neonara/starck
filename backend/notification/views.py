from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from notification.tasks import send_notification_to_email
from .serializers import NotificationSerializer
from django.utils.timezone import now
from .models import Notification


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notification_view(request):
    email = request.data.get('email')
    message = request.data.get('message')
    titre = request.data.get('titre', "📢 Notification")
    type_notification = request.data.get('type_notification', 'system')
    canal = request.data.get('canal', 'in_app')
    installation_id = request.data.get('installation_id') or None
    alarme_id = request.data.get('alarme_id') or None
    priorite = request.data.get('priorite', 1)

    if not email or not message:
        return Response({"error": "email et message sont requis."}, status=400)

    send_notification_to_email.delay(
        email=email,
        message=message,
        titre=titre,
        type_notification=type_notification,
        canal=canal,
        installation_id=installation_id,
        alarme_id=alarme_id,
        priorite=priorite
    )

    return Response({"success": True, "message": "Notification en cours d'envoi 🚀"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_notifications(request):
    user = request.user
    notifications = Notification.objects.filter(utilisateur=user).order_by('-envoyee_le')
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        notif = Notification.objects.get(id=pk, utilisateur=request.user)
        notif.lue_le = now()
        notif.save()
        return Response({'status': 'marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(utilisateur=request.user, lue_le__isnull=True).update(lue_le=now())
    return Response({'status': 'all marked as read'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    try:
        notif = Notification.objects.get(id=pk, utilisateur=request.user)
        notif.delete()
        return Response({'status': 'deleted'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)
