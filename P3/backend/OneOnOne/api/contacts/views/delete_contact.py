from rest_framework.response import Response
from rest_framework import generics
from ..models import Contacts
from ..serializers import ContactSerializer
from rest_framework.exceptions import ValidationError
from rest_framework import status
from django.http import HttpResponse
from rest_framework import permissions
from rest_framework.views import APIView
from django.core.exceptions import ObjectDoesNotExist

class DeleteContact(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        contact_email = request.data.get('contact_email')
        user = request.user

        if not contact_email:
            return Response({'error': 'Contact email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            contact = Contacts.objects.get(user=user, contact_email=contact_email)
        except ObjectDoesNotExist:
            return Response({'error': 'No contact found with the provided email for this user.'}, status=status.HTTP_404_NOT_FOUND)
        
        # No need to check object-level permissions here since we're verifying the user directly
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
