# from rest_framework import generics, permissions
# from django.shortcuts import get_object_or_404
# from ..models import Contacts
# from ..serializers import ContactSerializer
# from rest_framework.response import Response
# from rest_framework import status

# class ContactDetails(generics.RetrieveAPIView):
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = ContactSerializer
#     queryset = Contacts.objects.all()

#     def get_object(self):
#         # Assuming 'contact_email' is the field name in your Contacts model
#         # that you're using to filter the contact by email.
#         username = self.request.data.get('username')  # This line is corrected to use .get()
#         obj = get_object_or_404(self.queryset, username=username)  # Correct use of get_object_or_404
#         self.check_object_permissions(self.request, obj)  # Don't forget permission checks
#         return obj
