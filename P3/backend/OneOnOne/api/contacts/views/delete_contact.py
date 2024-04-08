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
        username = request.data.get('username')
        user = request.user

        if not username:
            return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            contact = Contacts.objects.get(user=user, contact=username)
        except ObjectDoesNotExist:
            return Response({'error': 'No contact found with the provided username for this user.'}, status=status.HTTP_404_NOT_FOUND)
        
        # No need to check object-level permissions here since we're verifying the user directly
        contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
