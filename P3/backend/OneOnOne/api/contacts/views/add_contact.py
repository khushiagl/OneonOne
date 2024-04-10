from rest_framework.response import Response
from rest_framework import generics
from ..models import Contacts
from ..serializers import ContactSerializer
from rest_framework import status
from rest_framework import permissions

from django.contrib.auth.models import User
from django.db.models import Q
from django.db import IntegrityError

# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class AddContactView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Extract the username of the contact from the request data
        contact_username = request.data.get('contact')
        
        if not contact_username:
            return Response({"error": "Contact username is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch the user instance for the given username
        try:
            contact_user = User.objects.get(username=contact_username)
        except User.DoesNotExist:
            return Response({"error": "User with this username does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if the authenticated user is trying to add themselves
        if request.user == contact_user:
            return Response({"error": "You cannot add yourself as a contact."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing contact
        if Contacts.objects.filter(user=request.user, contact=contact_user).exists():
            return Response({"error": "This contact already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the contact
        contact = Contacts(user=request.user, contact=contact_user)
        contact.save()

        # Serialize the contact instance to return as response
        # Adjust this based on how you wish to serialize your response
        serializer = ContactSerializer(contact)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
