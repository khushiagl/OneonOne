from django.contrib import admin
from .models import Schedule, Invitation, SuggestedSchedule, FinalizedMeeting

admin.site.register(Schedule)
admin.site.register(Invitation)
admin.site.register(SuggestedSchedule)
admin.site.register(FinalizedMeeting)


