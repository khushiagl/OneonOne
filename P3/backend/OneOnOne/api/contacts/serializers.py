# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Contacts
from ..users.serializers import UserSerializer

class ContactSerializer(serializers.ModelSerializer):
    contact = UserSerializer(read_only=True)
    class Meta:
        model = Contacts
        fields = ['id', 'user', 'contact']

    def validate(self, data):
        """
        Add custom validation to ensure a user cannot add themselves as a contact,
        and to prevent duplicate contacts entries.
        """
        if data['user'] == data['contact']:
            raise serializers.ValidationError("A user cannot add themselves as a contact.")
        if Contacts.objects.filter(user=data['user'], contact=data['contact']).exists():
            raise serializers.ValidationError("This contact already exists.")
        return data
