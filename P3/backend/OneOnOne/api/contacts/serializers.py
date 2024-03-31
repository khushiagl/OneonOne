from rest_framework import serializers
from .models import Contacts

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contacts
        fields = ['contact_name', 'contact_email', 'contact_picture']
        extra_kwargs = {'user': {'read_only': True}}


