from notification.utils import save_notification

def notifier_creation_intervention(fiche):
    technicien = fiche.technicien
    client = getattr(fiche.installation, "client", None)
    date_str = fiche.date_prevue.strftime('%d/%m/%Y à %Hh') if fiche.date_prevue else "bientôt"

    if technicien:
        save_notification(
            email=technicien.email,
            titre="Nouvelle intervention assignée",
            message=f"Une intervention '{fiche.get_type_intervention_display()}' a été assignée pour l'installation {fiche.installation.nom}, le {date_str}.",
            type_notification="intervention",
            canal="in_app",
            priorite=2,
            installation_id=fiche.installation.id  
        )

    if client:
        save_notification(
            email=client.email,
            titre="Intervention planifiée",
            message=f"Une intervention '{fiche.get_type_intervention_display()}' est prévue pour votre installation {fiche.installation.nom}, le {date_str}.",
            type_notification="intervention",
            canal="in_app",
            priorite=1,
            installation_id=fiche.installation.id  
        )
