from rest_framework import serializers
from base.models import *

class AsteroidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asteroid
        fields = '__all__'