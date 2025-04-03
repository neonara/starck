from django.urls import path
from . import views 

urlpatterns = [

    path('', views.index, name='alarme_index'),
    
]
