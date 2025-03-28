from django.contrib import admin
from .models import Equipement

class EquipementAdmin(admin.ModelAdmin):
    list_display = ('nom', 'marque')
    list_filter = ('marque',) 

admin.site.register(Equipement, EquipementAdmin)