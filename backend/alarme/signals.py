from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import AlarmeDeclenchee
from notification.tasks import creer_notif_alarme_task
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_save, sender=AlarmeDeclenchee)
def notifier_creation_alarme(sender, instance, created, **kwargs):
    if created:
        code = instance.code_alarme
        installation = instance.installation

        destinataires = set()

        if installation.installateur:
            destinataires.add(installation.installateur)

        destinataires.update(installation.techniciens.all())

        if installation.client:
            destinataires.add(installation.client)

        admins = User.objects.filter(role="admin")
        destinataires.update(admins)

        for utilisateur in destinataires:
            titre = f"🔔 {code.gravite.upper()} – Alarme sur {installation.nom}"
            message = f"L’alarme {code.code_constructeur} ({code.description}) a été déclenchée."

            creer_notif_alarme_task.delay(
                utilisateur_email=utilisateur.email,
                titre=titre,
                message=message,
                type_notification="alarme",
                canal="in_app",
                installation_id=installation.id,
                alarme_id=instance.id,
                priorite=1 if code.gravite == "critique" else 3
            )

#notifs en cas de resolution de l'alarme


@receiver(post_save, sender=AlarmeDeclenchee)
def notifier_alarme_resolution(sender, instance, created, **kwargs):
    if not created and instance.est_resolue:
        code = instance.code_alarme
        installation = instance.installation

        destinataires = set()

        if installation.installateur:
            destinataires.add(installation.installateur)

        destinataires.update(installation.techniciens.all())

        if installation.client:
            destinataires.add(installation.client)

        admins = User.objects.filter(role="admin")
        destinataires.update(admins)

        for utilisateur in destinataires:
            titre = f"✅ Alarme résolue sur {installation.nom}"
            message = f"L’alarme {code.code_constructeur} ({code.description}) a été marquée comme résolue."

            creer_notif_alarme_task.delay(
                utilisateur_email=utilisateur.email,
                titre=titre,
                message=message,
                type_notification="alarme",
                canal="in_app",
                installation_id=installation.id,
                alarme_id=instance.id,
                priorite=3
            )