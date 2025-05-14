from django.db import models
from django.contrib.auth import get_user_model
from installations.models import Installation
 
User = get_user_model()
 
class Reclamation(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours de traitement'),
        ('resolu', 'Résolu'),
    ]
 
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reclamations', verbose_name='Client')
    installation = models.ForeignKey(Installation, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Installation concernée')
    sujet = models.CharField(max_length=255, verbose_name='Sujet de la réclamation')
    message = models.TextField(verbose_name='Message détaillé')
    date_envoi = models.DateTimeField(auto_now_add=True, verbose_name='Date d’envoi')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente', verbose_name='Statut')
 
    def __str__(self):
        return f"{self.client.email} - {self.sujet}"
    
class ReclamationImage(models.Model):
    reclamation = models.ForeignKey(Reclamation, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='reclamations/images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image pour {self.reclamation.sujet}"
