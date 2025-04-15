from django.contrib import admin
from .models import AlarmeCode, AlarmeDeclenchee  

@admin.register(AlarmeCode)
class AlarmeCodeAdmin(admin.ModelAdmin):
    list_display = ('marque', 'type_alarme', 'code_constructeur', 'gravite')

@admin.register(AlarmeDeclenchee)
class AlarmeDeclencheeAdmin(admin.ModelAdmin):
    list_display = ('installation', 'code_alarme', 'date_declenchement', 'est_resolue')
