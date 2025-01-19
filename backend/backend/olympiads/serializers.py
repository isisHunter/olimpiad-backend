from rest_framework import serializers
from .models import User, Olympiad
    
class OlympiadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Olympiad
        fields = ['id', 'subject', 'name', 'description', 'grades', 'type', 'dates']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    olympiads = OlympiadSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'olympiads']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
