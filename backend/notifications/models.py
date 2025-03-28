from django.db import models
from django.conf import settings

class Notification(models.Model):

    def __str__(self):
        return f"📢 {self.message} - {self.utilisateur.username} ({self.statut})"
