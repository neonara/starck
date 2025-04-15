from django.db import models
from django.contrib.auth import get_user_model
from installations.models import Installation
from alarme.models import AlarmeDeclenchee
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Notification(models.Model):
    """Modèle représentant une notification envoyée à un utilisateur"""
    
    TYPE_NOTIF_CHOICES = [
        ('alarme', 'Alarme'),
        ('intervention', 'Intervention'),
        ('maintenance', 'Maintenance'),
        ('performance', 'Performance'),
        ('system', 'Système'),
        ('autre', 'Autre'),
    ]
    
    CANAL_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Notification push'),
        ('in_app', "Dans l'application"),
    ]
    
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name="Utilisateur")
    type_notification = models.CharField(max_length=20, choices=TYPE_NOTIF_CHOICES, verbose_name="Type de notification")
    titre = models.CharField(max_length=255, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    canal = models.CharField(max_length=20, choices=CANAL_CHOICES, verbose_name="Canal")
    envoyee_le = models.DateTimeField(auto_now_add=True, verbose_name="Envoyée le")
    lue_le = models.DateTimeField(null=True, blank=True, verbose_name="Lue le")
    alarme_associee = models.ForeignKey(AlarmeDeclenchee, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications', verbose_name="Alarme associée")
    installation_associee = models.ForeignKey(Installation, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications', verbose_name="Installation associée")
    priorite = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name="Priorité")
    
    class Meta:
        ordering = ['-envoyee_le']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
    
    def __str__(self):
        return f"{self.get_type_notification_display()} - {self.titre}"
