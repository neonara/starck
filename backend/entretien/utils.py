from notification.models import Notification
from django.utils.timezone import now
 
def notifier_technicien_entretien(entretien):
    if entretien.technicien:
        Notification.objects.create(
            utilisateur=entretien.technicien,
            type_notification='maintenance',
            titre="Nouvel entretien assigné",
            message=f"Vous avez un nouvel entretien '{entretien.type_entretien}' planifié pour l'installation {entretien.installation.nom}, le {entretien.date_debut.strftime('%d/%m/%Y à %Hh')}.",
            canal='in_app',
            installation_associee=entretien.installation,
            priorite=2  # ou 3 si urgent
        )





def notifier_rappel_entretien(entretien):
    if entretien.technicien:
        Notification.objects.create(
            utilisateur=entretien.technicien,
            type_notification='maintenance', 
            titre="🔔 Rappel d'entretien",
            message=f"Rappel : entretien '{entretien.get_type_entretien_display()}' pour l'installation {entretien.installation.nom}.",
            canal='in_app',
            installation_associee=entretien.installation,
            priorite=1  
        )