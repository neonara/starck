from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.utils.timezone import now
from django.conf import settings
from .models import GoogleToken
import requests
from datetime import timedelta


def refresh_token_google(token: GoogleToken) -> Credentials | None:
    """
    Rafraîchit le token si expiré. Met à jour en base.
    """
    if token.expires_at > now():
        return Credentials(
            token=token.access_token,
            refresh_token=token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=["https://www.googleapis.com/auth/calendar"]
        )

    print("🔄 Token expiré — tentative de rafraîchissement")

    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "refresh_token": token.refresh_token,
        "grant_type": "refresh_token"
    }

    response = requests.post("https://oauth2.googleapis.com/token", data=data)
    if response.status_code == 200:
        new_data = response.json()
        token.access_token = new_data["access_token"]
        token.expires_at = now() + timedelta(seconds=new_data["expires_in"])
        token.token_type = new_data.get("token_type", token.token_type)
        token.save(update_fields=["access_token", "expires_at", "token_type"])
        print("✅ Token Google rafraîchi")
        return Credentials(
            token=token.access_token,
            refresh_token=token.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=["https://www.googleapis.com/auth/calendar"]
        )
    else:
        print("❌ Échec de rafraîchissement du token :", response.text)
        return None


def get_token_for_entretien(entretien):
    for user in [entretien.technicien, entretien.installation.client, entretien.cree_par]:
        if user:
            try:
                return GoogleToken.objects.get(utilisateur=user)
            except GoogleToken.DoesNotExist:
                continue
    return None


from .models import EvenementGoogleParUtilisateur

def ajouter_entretien_google_calendar(entretien):
    utilisateurs = [entretien.technicien, entretien.installation.client]

    for utilisateur in utilisateurs:
        if not utilisateur:
            continue

        try:
            token = GoogleToken.objects.get(utilisateur=utilisateur)
        except GoogleToken.DoesNotExist:
            print(f"❌ Pas de token pour {utilisateur.email}")
            continue

        creds = refresh_token_google(token)
        if not creds:
            continue

        service = build('calendar', 'v3', credentials=creds)

        calendar_id = 'primary'
        event = {
            'summary': f"{entretien.get_type_entretien_display()} - {entretien.installation.nom}",
            'description': entretien.notes or "",
            'start': {
                'dateTime': entretien.date_debut.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'end': {
                'dateTime': (
                    entretien.date_fin or entretien.date_debut + timedelta(minutes=entretien.duree_estimee)
                ).isoformat(),
                'timeZone': 'Europe/Paris',
            }
        }

        try:
            created = service.events().insert(calendarId=calendar_id, body=event).execute()
            EvenementGoogleParUtilisateur.objects.update_or_create(
                utilisateur=utilisateur,
                entretien=entretien,
                defaults={
                    "event_id": created["id"],
                    "calendar_id": calendar_id
                }
            )
            print(f"✅ Événement ajouté au calendrier de {utilisateur.email} : {created['htmlLink']}")

            # Enregistre l’event global s’il vient du technicien
            if utilisateur == entretien.technicien:
                entretien.event_id_google = created["id"]
                entretien.lien_evenement_google = created["htmlLink"]
                entretien.save(update_fields=["event_id_google", "lien_evenement_google"])
        except Exception as e:
            print(f"❌ Erreur création pour {utilisateur.email} : {e}")

def supprimer_evenement_google_calendar(entretien):
    evenements = EvenementGoogleParUtilisateur.objects.filter(entretien=entretien)

    for evenement in evenements:
        try:
            token = GoogleToken.objects.get(utilisateur=evenement.utilisateur)
        except GoogleToken.DoesNotExist:
            print(f"❌ Pas de token pour {evenement.utilisateur.email}")
            continue

        creds = refresh_token_google(token)
        if not creds:
            continue

        service = build('calendar', 'v3', credentials=creds)

        try:
            service.events().delete(
                calendarId=evenement.calendar_id,
                eventId=evenement.event_id
            ).execute()
            print(f"🗑️ Supprimé du calendrier de {evenement.utilisateur.email}")
        except Exception as e:
            print(f"❌ Erreur suppression pour {evenement.utilisateur.email} : {e}")

    # Nettoyage base
    evenements.delete()
def modifier_evenement_google_calendar(entretien):
    evenements = EvenementGoogleParUtilisateur.objects.filter(entretien=entretien)

    for evenement in evenements:
        try:
            token = GoogleToken.objects.get(utilisateur=evenement.utilisateur)
        except GoogleToken.DoesNotExist:
            print(f"❌ Pas de token pour {evenement.utilisateur.email}")
            continue

        creds = refresh_token_google(token)
        if not creds:
            continue

        service = build('calendar', 'v3', credentials=creds)

        event = {
            'summary': f"{entretien.get_type_entretien_display()} - {entretien.installation.nom}",
            'description': entretien.notes or "",
            'start': {
                'dateTime': entretien.date_debut.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'end': {
                'dateTime': (
                    entretien.date_fin or entretien.date_debut + timedelta(minutes=entretien.duree_estimee)
                ).isoformat(),
                'timeZone': 'Europe/Paris',
            }
        }

        try:
            service.events().update(
                calendarId=evenement.calendar_id,
                eventId=evenement.event_id,
                body=event
            ).execute()
            print(f"🔁 Événement modifié dans le calendrier de {evenement.utilisateur.email}")
        except Exception as e:
            print(f"❌ Erreur mise à jour pour {evenement.utilisateur.email} : {e}")
