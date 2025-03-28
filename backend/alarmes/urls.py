from django.urls import path
from . import views 

urlpatterns = [

    path('', views.index, name='alarm_index'),
    
]
