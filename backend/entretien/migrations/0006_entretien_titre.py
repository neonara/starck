# Generated by Django 5.1.7 on 2025-04-16 09:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entretien', '0005_alter_entretien_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='entretien',
            name='titre',
            field=models.CharField(blank=True, max_length=100, verbose_name='Titre personnalisé'),
        ),
    ]
