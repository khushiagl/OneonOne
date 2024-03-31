from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from ..models import Contacts
from ..serializers import ContactSerializer
from rest_framework import status
from rest_framework import permissions


class ContactList(generics.ListAPIView):
    permission_Clases = [permissions.IsAuthenticated] # This should be changed to IsAuthenticated
    serializer_class = ContactSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return Contacts.objects.none()
        else:
            return Contacts.objects.filter(user=user)