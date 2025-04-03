from django.db import models
from django.contrib.auth import get_user_model
from installations.models import Installation
from equipements.models import Equipment

User = get_user_model()

class ProductionConsommation(models.Model):
    """Modèle pour enregistrer les données de production et de consommation"""
    
    installation = models.ForeignKey(Installation, on_delete=models.CASCADE, related_name='donnees_production', verbose_name="Installation")
    horodatage = models.DateTimeField(null=True, verbose_name="Horodatage")
    energie_produite_kwh = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Énergie produite (kWh)")
    energie_consomme_kwh = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Énergie consommée (kWh)")
    puissance_maximale_kw = models.DecimalField(max_digits=10, decimal_places=2, default=0.0, verbose_name="Puissance maximale (kW)")
    temperature_c = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Température (°C)")
    irradiation_wh_m2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Irradiation (Wh/m²)")
    ratio_performance = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Ratio de performance")
    est_prediction = models.BooleanField(default=False, verbose_name="Donnée prédite")
    
    class Meta:
        ordering = ['-horodatage']
        verbose_name = "Donnée de production/consommation"
        verbose_name_plural = "Données de production/consommation"
        indexes = [
            models.Index(fields=['installation', 'horodatage']),
        ]
    
    def __str__(self):
        return f"{self.installation.nom} - {self.horodatage}"
