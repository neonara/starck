from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils.timezone import now
@shared_task
def send_notification_to_email(
    email,
    message,
    titre="📢 Notification",
    type_notification="system",
    canal="in_app",
    installation_id=None,
    alarme_id=None,
    priorite=1
):
    from django.contrib.auth import get_user_model
    from notification.models import Notification
    from installations.models import Installation
    from alarme.models import Alarme

    User = get_user_model()
    try:
        user = User.objects.get(email=email)

        installation = Installation.objects.get(id=installation_id) if installation_id else None
        alarme = Alarme.objects.get(id=alarme_id) if alarme_id else None

        notif = Notification.objects.create(
            utilisateur=user,
            titre=titre,
            message=message,
            type_notification=type_notification,
            canal=canal,
            installation_associee=installation,
            alarme_associee=alarme,
            priorite=priorite
        )

        channel_layer = get_channel_layer()
        group = f"user_{user.id}"
        async_to_sync(channel_layer.group_send)(
            group,
            {
                "type": "send_notification",
                "message": {
                    "id": notif.id,
                    "title": notif.titre,
                    "content": notif.message,
                    "type": notif.type_notification,
                    "canal": notif.canal,
                    "priorite": notif.priorite,
                    "lue_le": notif.lue_le,
                    "envoyee_le": notif.envoyee_le.strftime('%Y-%m-%d %H:%M'),
                },
            },
        )
    except Exception as e:
        print(f"❌ Erreur création + envoi notif : {e}")
