from django.db import models
from django.contrib.auth import get_user_model
from installations.models import Installation

User = get_user_model()

class Equipment(models.Model):
    """Modèle dédié aux équipements solaires"""
    
    TYPE_CHOICES = [
        ('panel', 'Panneau solaire'),
        ('inverter', 'Onduleur'),
        ('battery', 'Batterie'),
        ('meter', 'Compteur'),
        ('monitoring', 'Système de monitoring'),
        ('other', 'Autre'),
    ]
    
    installation = models.ForeignKey(
        Installation,
        on_delete=models.CASCADE,
        related_name='equipments',
        verbose_name="Installation associée"
    )
    equipment_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name="Type d'équipement"
    )
    model_number = models.CharField(
        max_length=100,
        verbose_name="Numéro de modèle"
    )
    serial_number = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Numéro de série"
    )
    manufacturer = models.CharField(
        max_length=100,
        verbose_name="Fabricant"
    )
    
    # Champs techniques
    installation_date = models.DateField(
        verbose_name="Date d'installation"
    )
    warranty_expiry = models.DateField(
        null=True,
        blank=True,
        verbose_name="Fin de garantie"
    )
    technical_specs = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Spécifications techniques"
    )
    
    # Identifiants uniques
    qr_code = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        verbose_name="Code QR"
    )
    
    class Meta:
        verbose_name = "Équipement"
        verbose_name_plural = "Équipements"
        ordering = ['equipment_type', 'model_number']
        indexes = [
            models.Index(fields=['serial_number']),
            models.Index(fields=['equipment_type']),
        ]
    
    def __str__(self):
        return f"{self.get_equipment_type_display()} - {self.model_number}"
        