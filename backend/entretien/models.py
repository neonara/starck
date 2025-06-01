from django.db import models
from django.utils import timezone
from installations.models import Installation
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Entretien(models.Model):
    TYPE_ENTRETIEN = [
        ('preventif', 'Préventif'),
        ('correctif', 'Correctif'),
        ('annuel', 'Contrôle annuel'),
        ('trimestriel', 'Contrôle trimestriel'),
    ]
    
    STATUT_CHOICES = [
        ('planifie', 'Planifié'),
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('annule', 'Annulé'),
    ]
    
    PRIORITE_CHOICES = [
        ('urgent', 'Urgent'),
        ('elevee', 'Élevée'),
        ('normale', 'Normale'),
        ('basse', 'Basse'),
    ]
    PERIODE = [
    (1, '1 mois'),
    (3, '3 mois'),
    (6, '6 mois'),
    (12, '12 mois'),
]
    
    periode_recurrence = models.PositiveIntegerField(
    choices=PERIODE,
    null=True,
    blank=True,
    help_text="Créer automatiquement un entretien récurrent après cette période (en mois)"
    )
    titre = models.CharField(max_length=100, blank=True, verbose_name="Titre personnalisé")
    installation = models.ForeignKey(
        Installation, 
        on_delete=models.CASCADE, 
        related_name='entretiens'
    )
    event_id_google = models.CharField(
    max_length=200,
    null=True,
    blank=True,
    verbose_name="ID de l'événement Google Calendar"
    )
    lien_evenement_google = models.URLField(
    blank=True,
    null=True,
    verbose_name="Lien vers l’événement Google Calendar"
    )
    entretien_parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='doublons')

    type_entretien = models.CharField(
        max_length=20, 
        choices=TYPE_ENTRETIEN,
        default='preventif'
    )
    
    date_debut = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="Date et heure de début"
    )
    
    date_fin = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="Date et heure de fin"
    )
    
    duree_estimee = models.PositiveIntegerField(
        help_text="Durée estimée en minutes",
        default=60
    )
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='planifie'
    )
    
    priorite = models.CharField(
        max_length=20,
        choices=PRIORITE_CHOICES,
        default='normale'
    )
    
    technicien = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='entretiens_assignes',
        limit_choices_to={'role': 'technicien'},
        verbose_name="Technicien assigné"
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name="Notes supplémentaires"
    )
    
    rapport = models.FileField(
        upload_to='rapports_entretien/',
        null=True,
        blank=True,
        verbose_name="Rapport d'intervention"
    )
    
    cree_par = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='entretiens_crees',
        verbose_name="Créé par"
    )
    
    cree_le = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    
    modifie_le = models.DateTimeField(
        auto_now=True,
        verbose_name="Dernière modification"
    )

    class Meta:
        ordering = ['date_debut']
        verbose_name = "Entretien"
        verbose_name_plural = "Entretiens"
        permissions = [
            ("planifier_entretien", "Peut planifier un entretien"),
            ("annuler_entretien", "Peut annuler un entretien"),
        ]

    def __str__(self):
        return f"Entretien #{self.id} - {self.installation.nom} ({self.get_type_entretien_display()})"

    def save(self, *args, **kwargs):
        """Surcharge de la méthode save pour calculer automatiquement la date de fin"""
        if not self.date_fin and self.date_debut:
            self.date_fin = self.date_debut + timezone.timedelta(minutes=self.duree_estimee)
        super().save(*args, **kwargs)

    def est_en_retard(self):
        """Vérifie si l'entretien est en retard"""
        return self.statut == 'planifie' and timezone.now() > self.date_debut
    @property
    def est_termine(self):
        return self.statut == 'termine'
    






class RappelEntretien(models.Model):
    entretien = models.OneToOneField(
        'Entretien', on_delete=models.CASCADE, related_name='rappel')
    technicien = models.ForeignKey(
        User, on_delete=models.CASCADE, limit_choices_to={"role": "technicien"})
    rappel_datetime = models.DateTimeField(help_text="Date et heure exacte du rappel")
    cree_le = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rappel pour entretien {self.entretien_id} à {self.rappel_datetime}"



class GoogleToken(models.Model):
    utilisateur = models.OneToOneField(User, on_delete=models.CASCADE, related_name="google_token")
    access_token = models.TextField()
    refresh_token = models.TextField()
    expires_at = models.DateTimeField()
    token_type = models.CharField(max_length=50)

    def __str__(self):
        return f"GoogleToken({self.utilisateur.email})"

class EvenementGoogleParUtilisateur(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    entretien = models.ForeignKey('Entretien', on_delete=models.CASCADE, related_name="evenements_google")
    event_id = models.CharField(max_length=255)
    calendar_id = models.CharField(max_length=255, default='primary')

    class Meta:
        unique_together = ('utilisateur', 'entretien')

    def __str__(self):
        return f"{self.utilisateur.email} - {self.entretien.id}"
