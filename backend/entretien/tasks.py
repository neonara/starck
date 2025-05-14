from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Entretien
from .utils import notifier_rappel_entretien
from dateutil.relativedelta import relativedelta


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

from datetime import timedelta
from dateutil.relativedelta import relativedelta
from .models import Entretien
from utils.google_calendar_service import ajouter_entretien_google_calendar

def generer_suivant_entretien(entretien, user):
    """
    Génère un nouvel entretien automatiquement si :
    - l'entretien est terminé
    - il a une période de récurrence
    - son installation est active
    - aucun suivant direct n’a été généré
    """
    if (
        entretien.statut == "termine"
        and entretien.periode_recurrence
        and entretien.installation.statut == "active"
    ):
        prochaine_date = entretien.date_debut + relativedelta(months=entretien.periode_recurrence)

        # Vérifie si cet entretien a déjà un enfant (quel qu’il soit)
        deja_genere = Entretien.objects.filter(entretien_parent=entretien).exists()
        if not deja_genere:
            prochain = Entretien.objects.create(
                installation=entretien.installation,
                type_entretien=entretien.type_entretien,
                date_debut=prochaine_date,
                duree_estimee=entretien.duree_estimee,
                statut='planifie',
                priorite=entretien.priorite,
                technicien=entretien.technicien,
                cree_par=user,
                notes=f"[Généré automatiquement après {entretien.periode_recurrence} mois] {entretien.notes or ''}",
                entretien_parent=entretien,
                periode_recurrence=entretien.periode_recurrence,
            )
            ajouter_entretien_google_calendar(prochain)
            print(f"✅ Suivant généré : {prochain.id} (parent: {entretien.id})")
            return prochain
    return None
