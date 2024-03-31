from django.contrib import admin

from .contacts.models import Contacts
from .schedules.models import (Schedule, Invitation, SuggestedSchedule, FinalizedMeeting)

admin.site.register(Contacts)
admin.site.register(Schedule)
admin.site.register(SuggestedSchedule)
admin.site.register(Invitation)
admin.site.register(FinalizedMeeting)
