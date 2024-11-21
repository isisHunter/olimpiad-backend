from rest_framework import serializers
from .models import Olympiad, UserOlympiad

class OlympiadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Olympiad
        fields = '__all__'

class UserOlympiadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserOlympiad
        fields = '__all__'
