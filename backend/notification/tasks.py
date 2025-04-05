from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@shared_task
def send_notification_to_email(email, message):
    from django.contrib.auth import get_user_model
    User = get_user_model()

    try:
        user = User.objects.get(email=email)
        group_name = f"user_{user.id}"

        channel_layer = get_channel_layer()
        print(f"📦 Groupe WebSocket cible : {group_name}")
        print(f"📤 Envoi au groupe : {message}")
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "send_notification",
                "message": {
                    "title": "📢 Notification",
                    "content": message,
                }
            }
        )
    except User.DoesNotExist:
        print(f"❌ Aucun utilisateur trouvé avec l'email : {email}")
