from django.db import models
from django.utils import timezone

def chemin_export(instance, filename):
    return f"exports/{filename}"

class Exportation(models.Model):
    nom = models.CharField(max_length=255)
    fichier = models.FileField(upload_to=chemin_export)
    date_creation = models.DateTimeField(auto_now_add=True)

    def est_expire(self):
        return self.date_creation < timezone.now() - timezone.timedelta(days=3)
