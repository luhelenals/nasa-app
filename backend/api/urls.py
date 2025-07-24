from django.urls import path
from . import views

urlpatterns = [
    path('', views.getData),
    path('importar/', views.importData),
    path('indicadores/', views.getIndicators)
]