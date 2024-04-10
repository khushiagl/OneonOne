from django.db import models
from django.contrib.auth.models import User

class Contacts(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owner_contacts')
    contact = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_contacts')
    
    class Meta:
        unique_together = (('user', 'contact'),)

    def __str__(self):
        return f'{self.user.username}\'s contact: {self.contact.username}'

    
