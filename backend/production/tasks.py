from celery import shared_task
import requests
from django.utils import timezone
from alarme.models import AlarmeCode, AlarmeDeclenchee
from .models import ProductionConsommation
from installations.models import Installation
import os

HASS_URL = "http://ammar404.duckdns.org:8123"
HASS_TOKEN = os.getenv("HASS_TOKEN")
HASS_HEADERS = {
    "Authorization": f"Bearer {HASS_TOKEN}",
    "Content-Type": "application/json",
}


@shared_task
def fetch_homeassistant_data():
    print("Début de la tâche fetch_homeassistant_data")
    if not HASS_TOKEN:
        print("Erreur : HASS_TOKEN non défini dans .env")
        return

    try:
        response = requests.get(f"{HASS_URL}/api/states", headers=HASS_HEADERS)
        response.raise_for_status()
        states = response.json()
        print(f"Nombre d'états récupérés: {len(states)}")
        print(f"Entités capteurs: {[s['entity_id'] for s in states if 'sensor' in s['entity_id']]}")
    except Exception as e:
        print(f"Erreur lors de l'appel à Home Assistant: {e}")
        return

    installations = Installation.objects.all()
    print(f"Nombre d'installations: {installations.count()}")
    if not installations:
        print("Aucune installation trouvée")
        return

    for installation in installations:
        energie_produite = None
        energie_consomme = None
        puissance_maximale = None
        temperature = None
        irradiation = None

        for state in states:
            try:
                if state["entity_id"] == "sensor.export_kwh":
                    energie_produite = float(state["state"]) if state["state"] not in ["unknown", "unavailable"] else None
                    print(f"Production ({installation.nom}): {energie_produite} kWh")
                if state["entity_id"] == "sensor.import_kwh":
                    energie_consomme = float(state["state"]) if state["state"] not in ["unknown", "unavailable"] else None
                    print(f"Consommation import ({installation.nom}): {energie_consomme} kWh")
                if state["entity_id"] == "sensor.consommation_kwh":
                    energie_consomme = float(state["state"]) / 1000 if state["state"] not in ["unknown", "unavailable"] else None
                    print(f"Consommation consommation_kwh ({installation.nom}): {energie_consomme} kWh")
                if state["entity_id"] == "sensor.somme_energie_pzem":
                    puissance_maximale = float(state["state"]) if state["state"] not in ["unknown", "unavailable"] else None
                    print(f"Puissance ({installation.nom}): {puissance_maximale} kW")
                if state["entity_id"] == "sensor.qdh0b1300g_inverter_temperature":
                    temperature = float(state["state"]) if state["state"] not in ["unknown", "unavailable"] else None
                    print(f"Température ({installation.nom}): {temperature} °C")
            except (ValueError, KeyError) as e:
                print(f"Erreur pour {state['entity_id']} ({installation.nom}): {e}")
                continue

        last_entry = ProductionConsommation.objects.filter(
            installation=installation,
            horodatage__date=timezone.now().date()
        ).order_by("-horodatage").first()
        print(f"Dernière entrée pour {installation.nom}: {last_entry}")

        energie_produite_diff = None
        energie_consomme_diff = None
        if last_entry and energie_produite is not None and last_entry.energie_produite_kwh is not None:
            diff = energie_produite - float(last_entry.energie_produite_kwh)
            energie_produite_diff = max(diff, 0.0)  # Éviter les valeurs négatives
            print(f"Différence production ({installation.nom}): {energie_produite_diff} kWh")
        if last_entry and energie_consomme is not None and last_entry.energie_consomme_kwh is not None:
            diff = energie_consomme - float(last_entry.energie_consomme_kwh)
            energie_consomme_diff = max(diff, 0.0)  # Éviter les valeurs négatives
            print(f"Différence consommation ({installation.nom}): {energie_consomme_diff} kWh")

        try:
            ProductionConsommation.objects.create(
                installation=installation,
                horodatage=timezone.now(),
                energie_produite_kwh=energie_produite_diff if energie_produite_diff is not None else energie_produite,
                energie_consomme_kwh=energie_consomme_diff if energie_consomme_diff is not None else energie_consomme,
                puissance_maximale_kw=puissance_maximale,
                temperature_c=temperature,
                irradiation_wh_m2=irradiation,
                est_prediction=False,
            )
            print(f"Données enregistrées pour {installation.nom}")
        except Exception as e:
            print(f"Erreur lors de l'enregistrement pour {installation.nom}: {e}")





#task pour les alarme
@shared_task
def fetch_homeassistant_alarms():
    print("Début de la tâche fetch_homeassistant_alarms")
    if not HASS_TOKEN:
        print("Erreur : HASS_TOKEN non défini dans .env")
        return

    try:
        response = requests.get(f"{HASS_URL}/api/states", headers=HASS_HEADERS)
        response.raise_for_status()
        states = response.json()
        print(f"Nombre d'états récupérés: {len(states)}")
        print(f"Binary sensors: {[s['entity_id'] for s in states if 'binary_sensor' in s['entity_id']]}")
    except Exception as e:
        print(f"Erreur lors de l'appel à Home Assistant: {e}")
        return

    installations = Installation.objects.all()
    if not installations:
        print("Aucune installation trouvée")
        return

    for installation in installations:
        for state in states:
            try:
                entity_id = state["entity_id"]
                code_constructeur = None
                is_error = False

                # Gérer binary_sensor avec error ou fault
                if "binary_sensor" in entity_id and ("error" in entity_id.lower() or "fault" in entity_id.lower()):
                    code_constructeur = state.get("attributes", {}).get("code", state["state"])
                    is_error = state["state"] == "on"
                # Gérer sensor.qdh0b1300g_pv_status
                elif entity_id == "sensor.qdh0b1300g_pv_status" and state["state"] not in ["unknown", "unavailable"]:
                    code_constructeur = state["state"]
                    # Supposons que 1.0 = normal, tout autre état = erreur
                    is_error = code_constructeur != "1.0"

                if not code_constructeur:
                    continue

                alarme_code = AlarmeCode.objects.filter(
                    code_constructeur=code_constructeur,
                    marque=installation.onduleur_marque or "QDH0B1300G"
                ).first()

                if not alarme_code:
                    print(f"Code d'alarme {code_constructeur} non trouvé pour {installation.nom}")
                    continue

                if is_error:  # Alarme active
                    exists = AlarmeDeclenchee.objects.filter(
                        installation=installation,
                        code_alarme=alarme_code,
                        est_resolue=False
                    ).exists()

                    if not exists:
                        AlarmeDeclenchee.objects.create(
                            installation=installation,
                            code_alarme=alarme_code,
                            date_declenchement=timezone.now(),
                            est_resolue=False
                        )
                        print(f"Alarme déclenchée pour {installation.nom}: {code_constructeur}")
                else:  # Alarme résolue
                    AlarmeDeclenchee.objects.filter(
                        installation=installation,
                        code_alarme=alarme_code,
                        est_resolue=False
                    ).update(
                        est_resolue=True,
                        date_resolution=timezone.now()
                    )
                    print(f"Alarme résolue pour {installation.nom}: {code_constructeur}")
            except Exception as e:
                print(f"Erreur pour {entity_id} ({installation.nom}): {e}")
                continue