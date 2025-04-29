
from notification.models import Notification
from django.contrib.auth import get_user_model
from installations.models import Installation
from alarme.models import AlarmeDeclenchee

def save_notification(
    email,
    titre,
    message,
    type_notification="system",
    canal="in_app",
    installation_id=None,
    alarme_id=None,
    priorite=1
):
    User = get_user_model()
    try:
        user = User.objects.get(email=email)
        installation = Installation.objects.get(id=installation_id) if installation_id else None
        alarme = AlarmeDeclenchee.objects.get(id=alarme_id) if alarme_id else None

        Notification.objects.create(
            utilisateur=user,
            titre=titre,
            message=message,
            type_notification=type_notification,
            canal=canal,
            installation_associee=installation,
            alarme_associee=alarme,
            priorite=priorite
        )
        print("✅ Notification enregistrée en base.")

    except Exception as e:
        print(f"❌ Erreur sauvegarde notif : {e}")
