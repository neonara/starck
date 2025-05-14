from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Installation(models.Model):
   

    TYPE_CHOIX = [
        ('residential', 'Résidentiel'),
        ('commercial', 'Commercial'),
        ('industrial', 'Industriel'),
        ('utility', 'Utilitaire'),
    ]
    
    STATUT_CHOIX = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'En maintenance'),
        ('fault', 'En panne'),
    ]

    TYPE_CONTRAT_CHOICES = [
        ('exploitation', 'Exploitation'),
        ('preventive_curative', 'Préventive + Curative'),
        ('exploitation_curative', 'Exploitation + Curative'),
    ]

    STATUT_DIAGNOSTIC_CHOICES = [
        ('en_attente', 'En attente'),
        ('traitee', 'Traitée'),
    ]

    nom = models.CharField(max_length=255, verbose_name="Nom de l'installation")
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='installations', limit_choices_to={'groups__name': 'Clients'}, default='')
    installateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='systemes_installes', limit_choices_to={'groups__name': 'Installateurs'})
    technicien_assigne = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='installations_maintenues', limit_choices_to={'groups__name': 'Techniciens'})

    type_installation = models.CharField(max_length=20, choices=TYPE_CHOIX, default='', verbose_name="Type d'installation")
    statut = models.CharField(max_length=20, choices=STATUT_CHOIX, default='active', verbose_name="Statut")
    date_installation = models.DateField(verbose_name="Date d'installation")
    capacite_kw = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Capacité (kW)")
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    adresse = models.TextField(default='', verbose_name="Adresse")
    ville = models.CharField(max_length=100, default='', verbose_name="Ville")
    code_postal = models.CharField(max_length=20, default='', verbose_name="Code postal")
    pays = models.CharField(max_length=100, default='', verbose_name="Pays")

    documentation_technique = models.FileField(upload_to='documents_techniques/', null=True, blank=True, verbose_name="Documentation technique")
    expiration_garantie = models.DateField(null=True, blank=True, verbose_name="Fin de garantie")
    reference_contrat = models.CharField(max_length=100, null=True, blank=True, verbose_name="Référence contrat")

    type_contrat = models.CharField(
        max_length=30,
        choices=TYPE_CONTRAT_CHOICES,
        default='exploitation',
        verbose_name="Type de contrat"
    )

    date_mise_en_service = models.DateField(
        null=True, blank=True,
        verbose_name="Date de mise en service"
    )

    statut_diagnostic = models.CharField(
        max_length=20,
        choices=STATUT_DIAGNOSTIC_CHOICES,
        default='en_attente',
        null=True, blank=True,
        verbose_name="Statut diagnostic"
    )

    diagnostic_realise = models.BooleanField(
        default=False,
        verbose_name="Diagnostic réalisé"
    )

    devis_associe = models.FileField(
        upload_to='devis/',
        null=True,
        blank=True,
        verbose_name="Devis associé"
    )

    date_creation = models.DateTimeField(auto_now_add=True, null=True, blank=True, verbose_name="Date de création")
    date_mise_a_jour = models.DateTimeField(auto_now=True, verbose_name="Date de mise à jour")
    photo_installation = models.ImageField(upload_to='installations/photos/', null=True, blank=True, verbose_name="Photo de l'installation")

    class Meta:
        ordering = ['-date_installation']
        verbose_name = "Installation"
        verbose_name_plural = "Installations"

    def __str__(self):
        return f"{self.nom} ({self.get_type_installation_display()})"
