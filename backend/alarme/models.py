from django.db import models
from django.contrib.auth import get_user_model
from installations.models import Installation
from equipements.models import Equipment

User = get_user_model()

class Alarme(models.Model):
    """Modèle représentant une alarme générée par le système"""
    
    NIVEAU_GRAVITE = [
        ('critical', 'Critique'),
        ('high', 'Haute'),
        ('medium', 'Moyenne'),
        ('low', 'Basse'),
    ]
    
    STATUT_CHOICES = [
        ('open', 'Ouverte'),
        ('acknowledged', 'Reconnue'),
        ('in_progress', 'En cours'),
        ('resolved', 'Résolue'),
        ('false', 'Fausse alarme'),
    ]
    
    installation = models.ForeignKey(Installation, on_delete=models.CASCADE, related_name='alarmes', verbose_name="Installation")
    equipement = models.ForeignKey(Equipment, on_delete=models.SET_NULL, null=True, blank=True, related_name='alarmes', verbose_name="Équipement")
    code_alarme = models.CharField(max_length=50, verbose_name="Code d'alarme")
    titre = models.CharField(max_length=255, verbose_name="Titre")
    description = models.TextField(verbose_name="Description")
    gravite = models.CharField(max_length=20, choices=NIVEAU_GRAVITE, verbose_name="Gravité")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='open', verbose_name="Statut")
    declenchee_le = models.DateTimeField(auto_now_add=True, verbose_name="Déclenchée le")
    reconnue_le = models.DateTimeField(null=True, blank=True, verbose_name="Reconnue le")
    reconnue_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='alarmes_reconnues', verbose_name="Reconnue par")
    resolue_le = models.DateTimeField(null=True, blank=True, verbose_name="Résolue le")
    resolue_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='alarmes_resolues', verbose_name="Résolue par")
    automatique = models.BooleanField(default=True, verbose_name="Générée automatiquement")
    # intervention_associee = models.ForeignKey('interventions.Intervention', on_delete=models.SET_NULL, null=True, blank=True, related_name='alarmes_associees', verbose_name="Intervention associée")
    
    class Meta:
        ordering = ['-declenchee_le']
        verbose_name = "Alarme"
        verbose_name_plural = "Alarmes"
    
    def __str__(self):
        return f"{self.code_alarme} - {self.titre} ({self.get_gravite_display()})"
