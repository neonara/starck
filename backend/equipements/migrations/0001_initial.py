# Generated by Django 5.1.7 on 2025-03-26 03:24

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('installations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Equipement',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('nom', models.CharField(max_length=100)),
                ('type', models.CharField(choices=[('Onduleur', 'Onduleur'), ('Panneau', 'Panneau'), ('Compteur', 'Compteur'), ('Batterie', 'Batterie'), ('Capteur', 'Capteur')], max_length=50)),
                ('marque', models.CharField(max_length=100)),
                ('modele', models.CharField(max_length=100)),
                ('numero_serie', models.CharField(max_length=100, unique=True)),
                ('protocole', models.CharField(choices=[('WiFi', 'WiFi'), ('RS485', 'RS485'), ('Zigbee', 'Zigbee'), ('Ethernet', 'Ethernet')], default='WiFi', max_length=50)),
                ('statut', models.CharField(choices=[('Actif', 'Actif'), ('En panne', 'En panne'), ('Maintenance', 'Maintenance')], default='Actif', max_length=50)),
                ('date_ajout', models.DateTimeField(auto_now_add=True)),
                ('installation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equipements', to='installations.installation')),
            ],
        ),
    ]
