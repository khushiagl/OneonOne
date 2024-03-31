from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.core.exceptions import ObjectDoesNotExist
from ..models import Contacts
from ..serializers import ContactSerializer

class UpdateContact(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Contacts.objects.all()
    serializer_class = ContactSerializer

    def get_object(self):
        """
        Override get_object to return the object based on contact_email in the request body.
        """
        contact_email = self.request.data.get('contact_email')
        if contact_email is None:
            raise ValueError("Contact email must be provided.")
        
        try:
            # Ensure that the contact belongs to the user making the request.
            contact = Contacts.objects.get(user=self.request.user, contact_email=contact_email)
            return contact
        except Contacts.DoesNotExist:
            raise ObjectDoesNotExist("No contact found matching the provided email.")

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True  # Force partial update
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        """
        Custom update logic to handle "new_contact_email" field.
        """
        new_contact_email = self.request.data.get('new_contact_email')
        if new_contact_email:
            serializer.validated_data['contact_email'] = new_contact_email
        serializer.save()
        new_contact_name = self.request.data.get('new_contact_name')
        if new_contact_name:
            serializer.validated_data['contact_name'] = new_contact_name
        serializer.save()
        new_contact_picture = self.request.data.get('new_contact_picture')
        if new_contact_picture:
            serializer.validated_data['contact_picture'] = new_contact_picture
        serializer.save()
