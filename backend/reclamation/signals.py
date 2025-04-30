# reclamations/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reclamation
from notification.utils import save_notification
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=Reclamation)
def send_notification_to_admins(sender, instance, created, **kwargs):
    if created:
        admins = User.objects.filter(is_staff=True)  # tous les admins du système
        for admin in admins:
            save_notification(
                email=admin.email,
                titre="📩 Nouvelle Réclamation Client",
                message=f"Un client ({instance.client.email}) a envoyé une réclamation : '{instance.sujet}'",
                type_notification="reclamation",
                canal="in_app",
                priorite=2
            )
