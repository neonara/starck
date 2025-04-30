from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Reclamation
from notification.utils import save_notification
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=Reclamation)
def send_notification_to_admins(sender, instance, created, **kwargs):
    if created:
        print("📣 Signal post_save réclamation déclenché !")
        print("Client =", instance.client) 
        print("Client email =", getattr(instance.client, "email", "❌ aucun email"))

        admins = User.objects.filter(is_staff=True)
        for admin in admins:
            save_notification(
                email=admin.email,
                titre="📩 Nouvelle Réclamation Client",
                message=f"Un client ({instance.client.email}) a envoyé une réclamation : '{instance.sujet}'",
                type_notification="reclamation",
                canal="in_app",
                priorite=2
            )





@receiver(post_save, sender=Reclamation)
def notify_installateur_on_reclamation(sender, instance, created, **kwargs):
    if created and instance.installation and instance.installation.installateur:
        installateur = instance.installation.installateur
        save_notification(
            email=installateur.email,
            titre="📩 Nouvelle Réclamation sur votre installation",
            message=f"Un client ({instance.client.email}) a envoyé une réclamation sur l'installation '{instance.installation.nom}' : '{instance.sujet}'",
            type_notification="reclamation",
            canal="in_app",
            priorite=2
        )