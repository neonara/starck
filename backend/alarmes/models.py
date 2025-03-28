from django.db import models
from equipements.models import Equipement

class Alarme(models.Model):


    def __str__(self):
        return f"🔴 {self.type_alarme} - {self.equipement.nom} ({self.niveau_criticite})"
