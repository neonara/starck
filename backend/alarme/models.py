from django.db import models
from installations.models import Installation  

class AlarmeCode(models.Model):
    MARQUE_CHOICES = [
        ('Huawei', 'Huawei'),
        ('Kstar', 'Kstar'),
        ('Solax', 'Solax'),
    ]

    TYPE_ALARME_CHOICES = [
        ('DC', 'Partie DC'),
        ('Terre', 'Partie Terre'),
        ('AC', 'Partie AC'),
        ('Logiciel', 'Logiciel'),
        ('autre', 'Autre'),
    ]

    GRAVITE_CHOICES = [
        ('critique', 'Critique'),
        ('majeure', 'Majeure'),
        ('mineure', 'Mineure'),
    ]

    marque = models.CharField(max_length=50, choices=MARQUE_CHOICES)
    type_alarme = models.CharField(max_length=50, choices=TYPE_ALARME_CHOICES)
    code_constructeur = models.CharField(max_length=50)
    gravite = models.CharField(max_length=20, choices=GRAVITE_CHOICES)
    est_resolue = models.BooleanField(default=False)
    description = models.TextField()

    def __str__(self):
        return f"{self.marque} - {self.code_constructeur}"


class AlarmeDeclenchee(models.Model):
    installation = models.ForeignKey(Installation, on_delete=models.CASCADE, related_name="alarmes_declenchees")
    code_alarme = models.ForeignKey(AlarmeCode, on_delete=models.CASCADE, related_name="occurrences")
    date_declenchement = models.DateTimeField(auto_now_add=True)
    est_resolue = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.installation.nom} - {self.code_alarme} ({self.date_declenchement})"
