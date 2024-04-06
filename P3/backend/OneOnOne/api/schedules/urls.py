from django.urls import path
from .views import (
    ScheduleListCreateAPIView,
    ScheduleDetailAPIView,
    SchedulePreferencesUpdateAPIView,
    ScheduleInvitationsListCreateAPIView,
    InvitationListView,
    InvitationDetailView,
    InvitationResponseUpdateAPIView,
    SuggestedSchedulesListAPIView,
    SuggestedScheduleDetailView,
    FinalizeScheduleAPIView,
    ScheduleDeleteAPIView,
    InvitationDeleteAPIView,
    FinalizedMeetingsListView,
    FinalizedMeetingDetailView,
    SendReminderView,
    FinalizedScheduleView
)

app_name='schedules'
urlpatterns = [
    path('', ScheduleListCreateAPIView.as_view(), name='schedule-list-create'),
    path('<int:pk>/', ScheduleDetailAPIView.as_view(), name='schedule-detail'),
    path('<int:pk>/preferences/', SchedulePreferencesUpdateAPIView.as_view(), name='schedule-preferences-update'),
    path('<int:pk>/delete/', ScheduleDeleteAPIView.as_view(), name='delete-schedule'),
    path('<int:pk>/invitations/', ScheduleInvitationsListCreateAPIView.as_view(), name='schedule-invitations-list-create'),
    path('invitations/', InvitationListView.as_view(), name='invitation-list'),
    path('invitations/<int:pk>/', InvitationDetailView.as_view(), name='invitation-detail'),
    path('invitations/<int:pk>/responses/', InvitationResponseUpdateAPIView.as_view(), name='invitation-response-create'),
    path('invitations/<int:pk>/delete/', InvitationDeleteAPIView.as_view(), name='delete-invitation'),
    path('<int:pk>/suggestions/', SuggestedSchedulesListAPIView.as_view(), name='suggestion-list'),
    path('suggestions/<int:pk>/', SuggestedScheduleDetailView.as_view(), name='suggestion-detail'),
    path('suggestions/<int:pk>/finalize/', FinalizeScheduleAPIView.as_view(), name='final-schedule-create'),
    path('<int:pk>/meetings/', FinalizedMeetingsListView.as_view(), name='final-schedule'),
    path('meetings/<int:pk>/', FinalizedMeetingDetailView.as_view(), name='meeting'),
    path('<int:pk>/send-reminders/', SendReminderView.as_view(), name='send-reminders'),
    path('finalized/', FinalizedScheduleView.as_view(), name='finalized-schedules'),
]

