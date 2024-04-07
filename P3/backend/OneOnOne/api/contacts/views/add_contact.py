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
        # Set the 'user' field to the current user
        request.data['user'] = request.user.pk
        serializer = ContactSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
