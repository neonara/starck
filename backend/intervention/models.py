from django.db import models
from django.contrib.auth import get_user_model
from installations.models import Installation

User = get_user_model()

class FicheIntervention(models.Model):
    """Modèle représentant une fiche d'intervention"""
    
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
        ('annulee', 'Annulée')
    ]
    
<<<<<<< HEAD
=======
    TYPE_CHOICES = [
    ('diagnostic', 'Diagnostic'),
    ('preventive', 'Préventive'),
    ('curative', 'Curative'),
    ]
>>>>>>> 84e4fecf1fa4ff404ea02293a1d583f37f4d1b7e

    
    technicien = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        related_name='interventions_assignees',
        limit_choices_to={'role': 'technicien'},
        verbose_name="Technicien assigné"
    )
    
    installation = models.ForeignKey(
        Installation,
        on_delete=models.CASCADE,
        related_name='interventions',
        verbose_name="Installation concernée"
    )
    
<<<<<<< HEAD
=======
    type_intervention = models.CharField(
    max_length=20,
    choices=TYPE_CHOICES,
    default='diagnostic',
    verbose_name="Type d'intervention"
    )
    
>>>>>>> 84e4fecf1fa4ff404ea02293a1d583f37f4d1b7e
    description = models.TextField(verbose_name="Description de l'intervention")
    date_prevue = models.DateTimeField(verbose_name="Date d'intervention prévue")
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    date_modification = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente',
        verbose_name="Statut"
    )
    
    commentaire = models.TextField(blank=True, null=True, verbose_name="Commentaires")
    
    class Meta:
        ordering = ['-date_prevue']
        verbose_name = "Fiche d'intervention"
        verbose_name_plural = "Fiches d'intervention"
    
    def __str__(self):
        return f"Intervention {self.id} - {self.installation.nom} - {self.date_prevue}"