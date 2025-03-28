import uuid
from django.db import models
from django.conf import settings

class Installation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    

    nom = models.CharField(max_length=255, unique=True)
    adresse = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=0.0)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=0.0)
    

    capacite_kw = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    production_actuelle_kw = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    consommation_kw = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    

    etat = models.CharField(
        max_length=50, 
        choices=[('Actif', 'Actif'), ('Inactif', 'Inactif'), ('En maintenance', 'En maintenance')],
        default='Actif'
    )
    connecte_reseau = models.BooleanField(default=True)
    
    dernier_controle = models.DateTimeField(null=True, blank=True)
    alarme_active = models.BooleanField(default=False)
    
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='installations_client', 
        null=True, blank=True,
        help_text="Le client propriétaire de l'installation"
    )

    installateurs = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='installations_installateurs',
        blank=True,
        help_text="Les installateurs responsables de l'installation"
    )
    
    date_installation = models.DateField()
    derniere_mise_a_jour = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.nom} - {self.etat}"
