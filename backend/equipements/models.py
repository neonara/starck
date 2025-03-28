from django.db import models
import uuid
from installations.models import Installation
from django.core.exceptions import ValidationError

class Equipement(models.Model):
    TYPE_CHOICES = [
        ("Onduleur", "Onduleur"),
        ("Panneau", "Panneau"),
        ("Compteur", "Compteur"),
        ("Batterie", "Batterie"),
        ("Capteur", "Capteur"),
    ]

    MARQUE_CHOICES = [
        ('Huawei', 'Huawei'),
        ('Schneider', 'Schneider'),
        ('Tesla', 'Tesla'),
    ]

    STATUT_CHOICES = [
        ("Actif", "Actif"),
        ("En panne", "En panne"),
        ("Maintenance", "Maintenance"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    installation = models.ForeignKey(Installation, on_delete=models.CASCADE, related_name="equipements")
    nom = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    marque = models.CharField(max_length=50, choices=MARQUE_CHOICES)
    numero_serie = models.CharField(max_length=100, unique=True)
    protocole = models.CharField(max_length=50, choices=[("WiFi", "WiFi"), ("RS485", "RS485"), ("Zigbee", "Zigbee"), ("Ethernet", "Ethernet")], default="WiFi")
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default="Actif")
    date_ajout = models.DateTimeField(auto_now_add=True)



    def __str__(self):
        return f"{self.nom} ({self.type}) - {self.marque}"
