from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Entretien
from .utils import notifier_rappel_entretien

@shared_task
def rappel_mail_entretien_task(email, nom_technicien, nom_installation, type_entretien, date_entretien_str, entretien_id):
    print("📨 Tâche Celery DÉMARRÉE pour le rappel d'entretien")

    if not email or "@" not in email:
        print(f"❌ Email invalide ou vide : {email}")
        return

    subject = "🔔 Rappel d'entretien"
    message = (
        f"Bonjour {nom_technicien},\n\n"
        f"Ceci est un rappel pour l'entretien '{type_entretien}' prévu le {date_entretien_str} "
        f"pour l'installation '{nom_installation}'.\n\nMerci de vérifier votre disponibilité.\n\n"
        f"— L'équipe technique"
    )

    try:
        print(f"📬 Envoi de l'email à : {email}")
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        print(f"✅ Email envoyé avec succès à {email}")

        print("🔔 Création de la notification dashboard...")
        entretien = Entretien.objects.get(id=entretien_id)
        notifier_rappel_entretien(entretien)
        print(f"✅ Notification de rappel envoyée au technicien {nom_technicien}")

    except Exception as e:
        print(f"❌ Erreur lors de l’envoi du rappel : {e}")
