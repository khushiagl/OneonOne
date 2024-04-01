from django.db import models
from django.contrib.auth import get_user_model
from django.forms import ValidationError
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

class Schedule(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedules')
    non_busy_times = models.JSONField(default=dict)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    is_finalized = models.BooleanField(default=False)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"Schedule {self.id} for {self.user.username}"


class Invitation(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='invitations')
    invited_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitations_received')
    deadline = models.DateTimeField()
    non_busy_times = models.JSONField(default=dict) 
    is_submitted = models.BooleanField(default=False)

    def clean(self):
        if self.non_busy_times:
            # Example validation: ensure non_busy_times matches the specified criteria
            valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
            for day, times in self.non_busy_times.items():
                if day not in valid_days:
                    raise ValidationError(f"Invalid day: {day}. Days must be Monday to Friday.")
                
                for time, value in times.items():
                    if not (time.endswith(":00") and 9 <= int(time.split(":")[0]) <= 17):
                        raise ValidationError(f"Invalid time: {time}. Times must be on the hour between 9:00 and 17:00, inclusive.")
                    
                    if value not in [1, 2, 3]:
                        raise ValidationError(f"Invalid value: {value} for time {time}. Values must be between 1 and 3.")
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)  
        
        # If this is a new instance, send an email
        if is_new:
            subject = "Invitation to Schedule a Meeting"
            message = f"Hello {self.invited_user.get_full_name() or self.invited_user.username},\n\nYou have been invited to schedule a regular meeting. Please visit our platform to view the invitation and submit your availability.\n\nThank you!"
            email_from = settings.DEFAULT_FROM_EMAIL
            recipient_list = [self.invited_user.email]
            
            send_mail(subject, message, email_from, recipient_list)

    def __str__(self):
        return f"Invitation for {self.invited_user.username} to {self.schedule}"
    
    
class SuggestedSchedule(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='suggested_schedules')
    suggested_times = models.JSONField(default=list) 
    status = models.CharField(max_length=20, default='pending', choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('modified', 'Modified')])

    def __str__(self):
        return f"Suggested Schedules for schedule {self.schedule.id}"


class FinalizedMeeting(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday')
    ]

    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='finalized_meetings')
    day = models.CharField(max_length=9, default='Monday',choices=DAY_CHOICES)  # Updated to include choices
    time = models.TimeField(null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_meetings')
    invited_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invited_meetings')

    def __str__(self):
        return f"Meeting on {self.day} at {self.time.strftime('%H:%M')} for Schedule {self.schedule.id}"


