from django.db import models
from installations.models import Installation

class ProductionConsommation(models.Model):


    def __str__(self):
        return f"{self.installation.nom} - {self.date_heure} | Prod: {self.production_kw} kW, Conso: {self.consommation_kw} kW"
