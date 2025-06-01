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

from celery import shared_task
from django.core.mail import send_mail
@shared_task
def envoyer_email_entretien_google_calendar(
    email_destinataire,
    nom_utilisateur,
    nom_installation,
    date_entretien,
    duree_entretien,
    lien_google_calendar
):
    if not email_destinataire:
        print("❌ Email destinataire vide")
        return
    try:
        send_mail(
            subject=f"📅 Entretien prévu le {date_entretien}",
            message=f"""
Bonjour {nom_utilisateur},

Un entretien a été planifié pour l'installation : {nom_installation}

📆 Date : {date_entretien}
🕒 Durée : {duree_entretien} minutes
🔗 Voir l’événement dans Google Calendar : {lien_google_calendar}

Cordialement,
L’équipe Starck
""",
            from_email="noreply@tonapp.com",
            recipient_list=[email_destinataire],
            fail_silently=False,
        )
        print(f"📨 Email envoyé à {email_destinataire}")
    except Exception as e:
        print(f"⚠️ Erreur lors de l'envoi d'email : {e}")

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from entretien.models import GoogleToken
from urllib.parse import urlencode

User = get_user_model()

@shared_task
def inviter_connexion_google_calendar(email_utilisateur, nom_utilisateur):
    if not email_utilisateur:
        print("❌ Email destinataire manquant")
        return

    try:
        utilisateur = User.objects.get(email=email_utilisateur)
    except User.DoesNotExist:
        print(f"❌ Utilisateur introuvable pour l'email : {email_utilisateur}")
        return

    # Vérifie s’il a déjà un token Google
    has_token = GoogleToken.objects.filter(utilisateur=utilisateur).exists()
    if has_token:
        print(f"✅ Token Google déjà présent pour {email_utilisateur}")
        return

    # Lien de connexion OAuth
    query = urlencode({"email": email_utilisateur})
    lien_connexion = f"{settings.SITE_BASE_URL}/oauth2/login/?{query}"
    try:
        send_mail(
            subject="🔐 Connecte ton Google Calendar pour les entretiens",
            message=f"""
Bonjour {nom_utilisateur},

Tu as été désigné pour intervenir sur une installation.

⚠️ Pour recevoir automatiquement les entretiens dans ton Google Calendar, merci de connecter ton compte Google :

👉 {lien_connexion}

Cela ne prend que quelques secondes et t’évitera de manquer un rendez-vous.

Cordialement,  
L’équipe Starck
""",
            from_email="noreply@tonapp.com",
            recipient_list=[email_utilisateur],
            fail_silently=False,
        )
        print(f"📨 Email de connexion Google envoyé à {email_utilisateur}")
    except Exception as e:
        print(f"⚠️ Erreur lors de l'envoi de l'invitation : {e}")


from datetime import timedelta
from dateutil.relativedelta import relativedelta
from .models import Entretien
from entretien.google_calendar import ajouter_entretien_google_calendar 
def generer_suivant_entretien(entretien, user):
    if (
        entretien.statut == "termine"
        and entretien.periode_recurrence
        and entretien.installation.statut == "active"
    ):
        prochaine_date = entretien.date_debut + relativedelta(months=entretien.periode_recurrence)
        deja_genere = Entretien.objects.filter(entretien_parent=entretien).exists()

        if not deja_genere:
            suivant = Entretien.objects.create(
                installation=entretien.installation,
                type_entretien=entretien.type_entretien,
                date_debut=prochaine_date,
                duree_estimee=entretien.duree_estimee,
                statut='planifie',
                priorite=entretien.priorite,
                technicien=entretien.technicien,
                cree_par=entretien.technicien or user, 
                notes=f"[Généré automatiquement après {entretien.periode_recurrence} mois] {entretien.notes or ''}",
                entretien_parent=entretien,
                periode_recurrence=entretien.periode_recurrence,
            )
            print(f"✅ Suivant généré : {suivant.id} (technicien: {suivant.technicien}, cree_par: {suivant.cree_par})")
            ajouter_entretien_google_calendar(suivant)

            return suivant
