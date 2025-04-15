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
    from alarme.models import AlarmeDeclenchee

    User = get_user_model()

    try:
        user = User.objects.get(email=email)

       
        installation = None
        if installation_id:
            try:
                installation = Installation.objects.get(id=installation_id)
            except Installation.DoesNotExist:
                print(f"⚠️ Installation ID {installation_id} introuvable")

      
        alarme = None
        if alarme_id:
            try:
                alarme = AlarmeDeclenchee.objects.get(id=alarme_id)

            except AlarmeDeclenchee.DoesNotExist:
                print(f"⚠️ Alarme ID {alarme_id} introuvable")

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

        print(f" Notification enregistrée et envoyée à {email}")

    except Exception as e:
        print(f" Erreur création + envoi notif : {e}")








@shared_task
def creer_notif_alarme_task(
    utilisateur_email,
    titre,
    message,
    type_notification,
    canal,
    installation_id,
    alarme_id,
    priorite
):
    from django.contrib.auth import get_user_model
    from notification.models import Notification
    from installations.models import Installation
    from alarme.models import AlarmeDeclenchee

    User = get_user_model()

    try:
        utilisateur = User.objects.get(email=utilisateur_email)
        installation = Installation.objects.get(id=installation_id)
        alarme = AlarmeDeclenchee.objects.get(id=alarme_id)

        notification = Notification.objects.create(
            utilisateur=utilisateur,
            titre=titre,
            message=message,
            type_notification=type_notification,
            canal=canal,
            installation_associee=installation,
            alarme_associee=alarme,
            priorite=priorite
        )

        channel_layer = get_channel_layer()
        group = f"user_{utilisateur.id}"
        async_to_sync(channel_layer.group_send)(
            group,
            {
                "type": "send_notification",
                "message": {
                    "id": notification.id,
                    "title": titre,
                    "content": message,
                    "type": type_notification,
                    "canal": canal,
                    "priorite": priorite,
                    "envoyee_le": now().strftime('%Y-%m-%d %H:%M'),
                },
            }
        )

        print(f"✅ Notification envoyée à {utilisateur_email}")

    except Exception as e:
        print(f"❌ Erreur dans creer_notif_alarme_task : {str(e)}")