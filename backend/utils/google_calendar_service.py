from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import timedelta
import os
from django.conf import settings

SCOPES = ['https://www.googleapis.com/auth/calendar']
CREDENTIALS_PATH = os.path.join(settings.BASE_DIR, 'google_credentials', 'starck-calendar-key.json')

# Remplace ceci par ton vrai ID de calendrier partagé (email Gmail par exemple)
CALENDAR_ID = 'zttayla@gmail.com'

def ajouter_entretien_google_calendar(entretien):
    try:
        # ✅ Authentification
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=SCOPES
        )
        service = build('calendar', 'v3', credentials=creds)

        # ✅ Préparer les données de l’événement
        summary = f"🛠️ {entretien.get_type_entretien_display()} – {entretien.installation.nom}"
        # Lien vers l'application locale ou déployée
        base_url = settings.FRONTEND_BASE_URL 
        entretien_url = f"{base_url}/details-entretien/{entretien.id}"

        description = (
            f"🔧 Technicien : {entretien.technicien.get_full_name() if entretien.technicien else 'Non assigné'}\n"
            f"🏷️ Priorité : {entretien.get_priorite_display()}\n"
            f"📍 Installation : {entretien.installation.nom}\n"
            f"📝 Notes : {entretien.notes or 'Aucune'}\n"
            f"➡️ Voir les détails de l'entretien : {entretien_url}"        )

        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': entretien.date_debut.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'end': {
                'dateTime': (
                    entretien.date_fin or (entretien.date_debut + timedelta(minutes=entretien.duree_estimee))
                ).isoformat(),
                'timeZone': 'Europe/Paris',
            }
        }

        # ✅ Créer l’événement dans le bon agenda
        created_event = service.events().insert(calendarId=CALENDAR_ID, body=event).execute()
        print("🔁 Sauvegarde event_id_google =", created_event.get('id'))
        # Sauvegarder le lien + l'ID de l'événement
        entretien.event_id_google = created_event.get('id')
        entretien.lien_evenement_google = created_event.get('htmlLink')
        entretien.save(update_fields=['event_id_google', 'lien_evenement_google'])


    except Exception as e:
        print("❌ ECHEC Google Calendar :", e)

def supprimer_evenement_google_calendar(entretien):
    if not entretien.event_id_google:
        print("ℹ️ Aucun event_id à supprimer.")
        return
    try:
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        service = build('calendar', 'v3', credentials=creds)

        service.events().delete(calendarId=CALENDAR_ID, eventId=entretien.event_id_google).execute()
        print("🗑️ Événement supprimé de Google Calendar.")

    except Exception as e:
        print(f"❌ Erreur suppression Google Calendar : {e}")


def modifier_evenement_google_calendar(entretien):
    if not entretien.event_id_google:
        print("⚠️ Aucun event_id pour mise à jour")
        return

    try:
        creds = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH, scopes=SCOPES
        )
        service = build('calendar', 'v3', credentials=creds)

        summary = f"Entretien {entretien.get_type_entretien_display()} - {entretien.installation.nom}"
        description = f"Technicien : {entretien.technicien.get_full_name() if entretien.technicien else '—'}\nNotes : {entretien.notes or '—'}"

        event = {
            'summary': summary,
            'description': description,
            'start': {
                'dateTime': entretien.date_debut.isoformat(),
                'timeZone': 'Europe/Paris',
            },
            'end': {
                'dateTime': (
                    entretien.date_fin or (entretien.date_debut + timedelta(minutes=entretien.duree_estimee))
                ).isoformat(),
                'timeZone': 'Europe/Paris',
            }
        }

        service.events().update(
            calendarId=CALENDAR_ID,
            eventId=entretien.event_id_google,
            body=event
        ).execute()
        print("✅ Événement Google mis à jour")

    except Exception as e:
        print(f"❌ Erreur mise à jour Google Calendar : {e}")
