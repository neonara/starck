from django.contrib import admin
from django import forms
from .models import Installation
from users.models import User 


class InstallationAdminForm(forms.ModelForm):
    class Meta:
        model = Installation
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields['client'].queryset = User.objects.filter(role='client')
        
        self.fields['installateurs'].queryset = User.objects.filter(role='installateur')

class InstallationAdmin(admin.ModelAdmin):
    form = InstallationAdminForm
    list_display = ('nom', 'client', 'etat', 'connecte_reseau', 'date_installation')
    search_fields = ('nom', 'client__email')
    list_filter = ('etat', 'connecte_reseau')
    filter_horizontal = ('installateurs',) 

admin.site.register(Installation, InstallationAdmin)
