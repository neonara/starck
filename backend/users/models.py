from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('installateur', 'Installateur'),
        ('technicien', 'Technicien'),
        ('client', 'Client'),
    ]
    
    role = models.CharField(max_length=20, default='admin')  
    verification_code = models.CharField(
        max_length=6, 
        blank=True, 
        null=True, 
        help_text="Code sent to user email for verification."
    )   
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']