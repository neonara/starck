# Generated by Django 5.1.6 on 2025-05-21 00:04

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Entretien',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('periode_recurrence', models.PositiveIntegerField(blank=True, choices=[(1, '1 mois'), (3, '3 mois'), (6, '6 mois'), (12, '12 mois')], help_text='Créer automatiquement un entretien récurrent après cette période (en mois)', null=True)),
                ('titre', models.CharField(blank=True, max_length=100, verbose_name='Titre personnalisé')),
                ('event_id_google', models.CharField(blank=True, max_length=200, null=True, verbose_name="ID de l'événement Google Calendar")),
                ('lien_evenement_google', models.URLField(blank=True, null=True, verbose_name='Lien vers l’événement Google Calendar')),
                ('type_entretien', models.CharField(choices=[('preventif', 'Préventif'), ('correctif', 'Correctif'), ('annuel', 'Contrôle annuel'), ('trimestriel', 'Contrôle trimestriel')], default='preventif', max_length=20)),
                ('date_debut', models.DateTimeField(blank=True, null=True, verbose_name='Date et heure de début')),
                ('date_fin', models.DateTimeField(blank=True, null=True, verbose_name='Date et heure de fin')),
                ('duree_estimee', models.PositiveIntegerField(default=60, help_text='Durée estimée en minutes')),
                ('statut', models.CharField(choices=[('planifie', 'Planifié'), ('en_cours', 'En cours'), ('termine', 'Terminé'), ('annule', 'Annulé')], default='planifie', max_length=20)),
                ('priorite', models.CharField(choices=[('urgent', 'Urgent'), ('elevee', 'Élevée'), ('normale', 'Normale'), ('basse', 'Basse')], default='normale', max_length=20)),
                ('notes', models.TextField(blank=True, null=True, verbose_name='Notes supplémentaires')),
                ('rapport', models.FileField(blank=True, null=True, upload_to='rapports_entretien/', verbose_name="Rapport d'intervention")),
                ('cree_le', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('modifie_le', models.DateTimeField(auto_now=True, verbose_name='Dernière modification')),
            ],
            options={
                'verbose_name': 'Entretien',
                'verbose_name_plural': 'Entretiens',
                'ordering': ['date_debut'],
                'permissions': [('planifier_entretien', 'Peut planifier un entretien'), ('annuler_entretien', 'Peut annuler un entretien')],
            },
        ),
        migrations.CreateModel(
            name='EvenementGoogleParUtilisateur',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.CharField(max_length=255)),
                ('calendar_id', models.CharField(default='primary', max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='GoogleToken',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('access_token', models.TextField()),
                ('refresh_token', models.TextField()),
                ('expires_at', models.DateTimeField()),
                ('token_type', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='RappelEntretien',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rappel_datetime', models.DateTimeField(help_text='Date et heure exacte du rappel')),
                ('cree_le', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
