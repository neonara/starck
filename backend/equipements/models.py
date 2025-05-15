from django.db import models
from installations.models import Installation 
import uuid
import os


def qr_code_upload_path(instance, filename):
    return f"qr_codes/{instance.code_unique}.png"

class Equipement(models.Model):
    TYPES = [
        ("onduleur", "Onduleur"),
        ("compteur", "Compteur"),
        ("micro-onduleur", "Micro-onduleur"),
        ("batterie", "Batterie"),
        ("station_meteo", "Station météo"),
        ("boite_jonction", "Boîte de jonction"),
        ("repetiteur", "Répéteur"),
        ("ventilateur", "Ventilateur"),
        ("erm", "ERM"),
    ]
    code_unique = models.CharField(max_length=100, unique=True, editable=False)

    qr_code_image = models.ImageField(upload_to=qr_code_upload_path, null=True, blank=True)

    installation = models.ForeignKey(Installation, on_delete=models.CASCADE, related_name='equipements')
    nom = models.CharField(max_length=255)
    type_appareil = models.CharField(max_length=50, choices=TYPES)
    numero_serie = models.CharField(max_length=100, unique=True)
    etat = models.CharField(max_length=50, default="actif")

    def save(self, *args, **kwargs):
        if not self.code_unique:
            self.code_unique = str(uuid.uuid4())
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} - {self.type_appareil}"
