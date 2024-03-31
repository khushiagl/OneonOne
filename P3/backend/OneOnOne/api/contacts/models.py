from django.db import models
from django.contrib.auth.models import User

class Contacts(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owner_contacts')
    # contact = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_contacts')
    contact_email = models.EmailField(max_length=254, default="noemail@example.com")
    contact_name = models.CharField(max_length=150, default=None)
    contact_picture = models.ImageField(upload_to='contact_pics/', blank=True, null=True)


    def __str__(self):
        return f"{self.contact_name} ({self.contact_email} - {self.user} - {self.id})"
    
    class Meta:
        unique_together = ('user', 'contact_email')