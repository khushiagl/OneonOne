from rest_framework.response import Response
from rest_framework import generics
from ..models import Contacts
from ..serializers import ContactSerializer
from rest_framework import status
from rest_framework import permissions

class AddContact(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated] # This
    queryset = Contacts.objects.all()
    serializer_class = ContactSerializer
    
    def perform_create(self, serializer_class):
        try:
            serializer_class.save(user=self.request.user)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    
