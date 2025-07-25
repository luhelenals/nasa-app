from rest_framework import serializers
from base.models import *
from django.contrib.auth import get_user_model

class AsteroidSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asteroid
        fields = '__all__'

# Usuário atual do Django
User = get_user_model()
class UserRegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data['first_name'],
        )
        return user