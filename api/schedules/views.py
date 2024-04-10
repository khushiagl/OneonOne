from django.forms import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from ..contacts.models import Contacts
from .models import Schedule, Invitation, SuggestedSchedule, FinalizedMeeting
from .serializers import ScheduleSerializer, InvitationSerializer
from rest_framework.permissions import IsAuthenticated
from .serializers import InvitationSerializer, SuggestionSerializer, FinalizedMeetingSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from datetime import datetime
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from .models import Invitation
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q



#User.objects.create_user('default_username', password='default_password', email='default_user@example.com')
# User.objects.create_user('testuser1', 'test1@example.com', 'testpassword')
# User.objects.create_user('testuser2', 'test2@example.com', 'testpassword')

class ScheduleListCreateAPIView(generics.ListCreateAPIView):#WORKS
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        return Schedule.objects.filter(user=self.request.user.id)

    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            user = self.request.user
        else:
            default_user, created = User.objects.get_or_create(
                username='default_username',
                defaults={'email': 'default_user@example.com'}  # You can set defaults for other fields here
            )
            if created:
                default_user.set_password('default_password')
                default_user.save()
            user = default_user
        
        # At this point, the serializer has validated the incoming data, but the instance isn't saved yet.
        # We can now update the serializer's valid data with the user and create the model instance without saving it.
        instance = serializer.Meta.model(**serializer.validated_data, user=user)  # Create an instance with the validated data and the user
        
        # Call full_clean() to run the model's full validation cycle, including custom clean methods.
        self.clean(instance)
        
        # Now that we've ensured the data is fully clean, save the instance through the serializer.
        serializer.save(user=user)

    def clean(self, instance):
        # Example validation: ensure non_busy_times matches the specified criteria
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        for day, times in instance.non_busy_times.items():
            if day not in valid_days:
                raise ValidationError(f"Invalid day: {day}. Days must be Monday to Friday.")
            
            for time, value in times.items():
                if not (time.endswith(":00") and 9 <= int(time.split(":")[0]) <= 17):
                    raise ValidationError(f"Invalid time: {time}. Times must be on the hour between 9:00 and 17:00, inclusive.")
                
                if value not in [1, 2, 3]:
                    raise ValidationError(f"Invalid value: {value} for time {time}. Values must be between 1 and 3.")



class ScheduleDetailAPIView(generics.RetrieveUpdateAPIView): #WORKS
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Schedule.objects.filter(user=user)  

    def get_object(self):
        """
        Override the default `get_object` method to make sure the object belongs to the current user.
        """
        queryset = self.get_queryset()  
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))  
        return obj


class SchedulePreferencesUpdateAPIView(generics.UpdateAPIView):#works
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user
        return Schedule.objects.filter(user=user)  

    def get_object(self):
        """
        Override the default `get_object` method to make sure the object belongs to the current user.
        """
        queryset = self.get_queryset()  
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))  
        return obj

    def put(self, request, *args, **kwargs):
        schedule = self.get_object()
        # Prevent update if the schedule is finalized
        if schedule.is_finalized:
            return Response({"error": "This schedule has been finalized and cannot be updated."},
                            status=status.HTTP_403_FORBIDDEN)
        
        # Update non_busy_times if not finalized
        non_busy_times = request.data.get('non_busy_times', {})
        schedule.non_busy_times = non_busy_times
        self.clean(schedule)
        schedule.save()
        return Response(ScheduleSerializer(schedule).data)
    
    def clean(self, instance):
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        for day, times in instance.non_busy_times.items():
            if day not in valid_days:
                raise ValidationError(f"Invalid day: {day}. Days must be Monday to Friday.")
            
            for time, value in times.items():
                if not (time.endswith(":00") and 9 <= int(time.split(":")[0]) <= 17):
                    raise ValidationError(f"Invalid time: {time}. Times must be on the hour between 9:00 and 17:00, inclusive.")
                
                if value not in [1, 2, 3]:
                    raise ValidationError(f"Invalid value: {value} for time {time}. Values must be between 1 and 3.")
                

class ScheduleDeleteAPIView(generics.DestroyAPIView):
    queryset = Schedule.objects.all()
    permission_classes = [permissions.IsAuthenticated]  

    def delete(self, request, *args, **kwargs):
        schedule = get_object_or_404(Schedule, pk=kwargs.get('pk'))

        if request.user != schedule.user:
            return Response({"detail": "You do not have permission to delete this schedule."}, status=status.HTTP_403_FORBIDDEN)

        schedule.delete()
        return Response({"detail": "Schedule and its invitations have been deleted."}, status=status.HTTP_204_NO_CONTENT)
    


class ScheduleInvitationsListCreateAPIView(generics.ListCreateAPIView): #works
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        schedule_id = self.kwargs['pk']
        return Invitation.objects.filter(schedule_id=schedule_id)
    
    def perform_create(self, serializer): 
        schedule_id = self.kwargs['pk']
        schedule = Schedule.objects.get(pk=schedule_id)
        if self.request.user != schedule.user:
            return Response({"detail": "You do not have permission to send initations for this schedule."}, status=status.HTTP_403_FORBIDDEN)

        invited_user = serializer.validated_data.get('invited_user')
        deadline = serializer.validated_data.get('deadline')

        # Ensure that both invited_user and deadline are provided and valid
        if not invited_user or not deadline:
            raise ValidationError('Both invited user and deadline must be provided.')

        # Ensure the deadline is in the future
        if deadline <= timezone.now():
            raise ValidationError('The deadline must be set to a future date and time.')
        
        # Prevent sending an invitation to oneself
        if schedule.user == invited_user:
            raise ValidationError('You cannot send an invitation to yourself.')
        
        if Invitation.objects.filter(schedule_id=schedule_id, invited_user=invited_user).exists():
            raise ValidationError('An invitation to this user for the current schedule already exists.')
        
        if not Contacts.objects.filter(user=self.request.user, contact=invited_user).exists():
            raise ValidationError(f'The invited user {invited_user.email} is not a contact of the user.')

        # Save the invitation with the schedule_id
        serializer.save(schedule=schedule)


# List invitations sent to the user
class InvitationListView(generics.ListAPIView):
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invitation.objects.filter(invited_user=self.request.user.id)
    

class InvitationDetailView(generics.RetrieveAPIView):
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Invitation.objects.filter(invited_user=user)  

    def get_object(self):
        """
        Override the default `get_object` method to make sure the object belongs to the current user.
        """
        queryset = self.get_queryset()  
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))  
        return obj


class InvitationDeleteAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def delete(self, request, pk, format=None):
        invitation = get_object_or_404(Invitation, pk=pk)

        # Check if the related schedule is finalized
        if invitation.schedule.is_finalized:
            return Response({"detail": "Cannot delete an invitation after the schedule has been finalized."}, status=status.HTTP_400_BAD_REQUEST)
        if invitation.schedule.user != self.request.user:
             return Response({"detail": "You do not have permission to delete this invitation."}, status=status.HTTP_403_FORBIDDEN)

        # Delete all SuggestedSchedule instances related to the schedule of the invitation being deleted
        SuggestedSchedule.objects.filter(schedule=invitation.schedule).delete()

        # Delete the invitation
        invitation.delete()
        
        return Response({"detail": "Invitation and related suggested schedules successfully deleted."}, status=status.HTTP_204_NO_CONTENT)

# Respond to an invitation by specifying non busy times
class InvitationResponseUpdateAPIView(generics.UpdateAPIView):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        invitation = get_object_or_404(Invitation, id=self.kwargs['pk'])

        # Ensure that the user updating the invitation is the invited user
        if request.user != invitation.invited_user:
            return Response({"detail": "You do not have permission to update this invitation."}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if the invitation is already submitted
        if invitation.schedule.is_finalized:
            return Response({"detail": "This schedule has been finalized."}, status=status.HTTP_400_BAD_REQUEST)
        if 'invited_user' in request.data:
            return Response({"detail": "Updating the invited user is not allowed."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(invitation, data=request.data, partial=True)  # Allow partial update
        if serializer.is_valid():
            unsaved_instance = serializer.Meta.model(**serializer.validated_data)
            self.clean(unsaved_instance)
            if 'non_busy_times' in request.data:
                non_busy_times = serializer.validated_data.get('non_busy_times', {})
                # Check if there's at least one day with times
                has_times = any(times for times in non_busy_times.values())
                
                serializer.save(is_submitted=has_times)
            else:
               serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def clean(self, instance):
        valid_days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        for day, times in instance.non_busy_times.items():
            if day not in valid_days:
                raise ValidationError(f"Invalid day: {day}. Days must be Monday to Friday.")
            
            for time, value in times.items():
                if not (time.endswith(":00") and 9 <= int(time.split(":")[0]) <= 17):
                    raise ValidationError(f"Invalid time: {time}. Times must be on the hour between 9:00 and 17:00, inclusive.")
                
                if value not in [1, 2, 3]:
                    raise ValidationError(f"Invalid value: {value} for time {time}. Values must be between 1 and 3.")
    
class SuggestedScheduleDetailView(generics.RetrieveAPIView):#WORKS
    queryset = SuggestedSchedule.objects.all()
    serializer_class = SuggestionSerializer
    permission_classes = [IsAuthenticated]


    def put(self, request, *args, **kwargs):
        suggestion_id = self.kwargs['pk']
        suggested_schedule = get_object_or_404(SuggestedSchedule, id=suggestion_id)
        schedule = suggested_schedule.schedule
        if schedule.user != self.request.user:
            return Response({"detail": "You do not have permission to edit suggestions for this schedule."}, status=status.HTTP_403_FORBIDDEN)

        # Extract new suggested times from request data
        new_suggested_times = request.data.get('suggested_times')

        # Validate new suggested times
        is_valid, message = self.check_validity(schedule, new_suggested_times)
        if not is_valid:
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

        # Update the suggested schedule
        suggested_schedule.suggested_times = new_suggested_times
        suggested_schedule.status = 'modified'  # Adjust as needed
        suggested_schedule.save()

        # Serialize and return the updated suggested schedule
        serializer = SuggestionSerializer(suggested_schedule, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def check_validity(self, schedule, suggested_times):
        # Nested helper functions
        def validate_meeting_format(meeting):
            try:
                day = meeting['day']
                time = datetime.strptime(meeting['time'], '%H:%M')
                if day not in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
                    return False, "Invalid day provided."
                if not 9 <= time.hour < 17:
                    return False, "Meeting time must be between 9:00 and 17:00."
            except (KeyError, ValueError):
                return False, "Incorrect time format or missing information."
            return True, ""

        def validate_no_overlap(suggested_times):
            for i, meeting1 in enumerate(suggested_times):
                for meeting2 in suggested_times[i+1:]:
                    if meeting1['day'] == meeting2['day'] and meeting1['time'] == meeting2['time']:
                        return False, "Overlapping meetings detected."
            return True, ""
        
        def is_user_available(user_id, day, time, schedule):
            # Fetch the non-busy times for the user related to this schedule
            if user_id == schedule.user_id:
                non_busy_times = schedule.non_busy_times
            else:
                non_busy_times = schedule.invitations.get(invited_user_id=user_id).non_busy_times
            if  time in non_busy_times.get(day, []):
                return True
            else:
                return False
 

        # Main validation checks
        for meeting in suggested_times:
            valid, message = validate_meeting_format(meeting)
            if not valid:
                return False, message

        valid, message = validate_no_overlap(suggested_times)
        if not valid:
            return False, message

        invited_users_ids = list(schedule.invitations.values_list('invited_user_id', flat=True))
        if len(set([meeting['user'] for meeting in suggested_times])) != len(invited_users_ids):
            return False, "Mismatch in the number of meetings and invited users."

        for meeting in suggested_times:
            day, time, user_id = meeting['day'], meeting['time'], meeting['user']
            if not is_user_available(user_id, day, time, schedule):
                return False, f"User {user_id} is not available at {day}, {time}."

        return True, "All checks passed."


class SuggestedSchedulesListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        schedule_id = self.kwargs['pk']
        schedule = get_object_or_404(Schedule, id=schedule_id)
        

        if schedule.user != request.user:
            return Response({"detail": "You do not have permission to view suggestions for this schedule."}, status=403)
        
        all_submitted = Invitation.objects.filter(schedule=schedule).exclude(is_submitted=True).exists()
        if all_submitted:
            return Response({"detail": "All invitations must be submitted before suggestions can be generated or retrieved."}, status=status.HTTP_400_BAD_REQUEST)
    
        existing_suggestions = SuggestedSchedule.objects.filter(schedule=schedule)
        if existing_suggestions.exists():
            # Serialize and return the existing suggestions
            serializer = SuggestionSerializer(existing_suggestions, many=True)
            return Response(serializer.data)
        
        suggestions = self.generate_suggestions(schedule)

        
        # Create SuggestedSchedule instances and collect them for serialization
        suggested_schedules = []
        for data in suggestions:
            suggested_schedule = SuggestedSchedule.objects.create(
                schedule=schedule,
                suggested_times= data,
                status = 'pending'
            )
            suggested_schedules.append(suggested_schedule)

        # Serialize the created SuggestedSchedule instances

        serializer = SuggestionSerializer(suggested_schedules, many=True)

        return Response(serializer.data)


    def generate_suggestions(self, schedule):
        all_user_meetings = []
        invitations = Invitation.objects.filter(schedule=schedule, is_submitted=True)

        # Step 1: Generate possible meeting times for each user
        for invitation in invitations:
            user_meeting_options = self.find_matching_times(schedule.non_busy_times, invitation.non_busy_times)
            all_user_meetings.append({
                'invited_user': invitation.invited_user.username,
                'meeting_options': user_meeting_options,
            })   

        # Step 2: Distribute meetings across three calendars
        calendars = self.distribute_meetings_across_calendars(all_user_meetings, schedule)

        return calendars


    def find_matching_times(self, owner_availability, invited_user_availability):
        matched_times = []

        for day, times in owner_availability.items():
            if day in invited_user_availability:
                for time, priority in times.items():
                    if time in invited_user_availability[day]:
                        matched_times.append({'day': day, 'time': time, 'priority': priority})

        return matched_times    
    
    def distribute_meetings_across_calendars(self, all_user_meetings, schedule):
        # Initialize empty calendars and track whether forced assignment was used.
        calendars = []
        max_length = max(len(user_meeting['meeting_options']) for user_meeting in all_user_meetings)

        def to_hashable(cal):
            return tuple(tuple(sorted(meeting.items())) for meeting in cal)

        def is_unique_calendar(meeting, calendar, user_meetings, is_forced=False):
            test_calendar = calendar + [{
                'day': meeting['day'],
                'time': meeting['time'],
                'user': user_meetings['invited_user']
                'forced': False,  # This assignment is within availability
                'available_times': user_meetings['meeting_options']
            }]
            test_calendar_hashable = to_hashable(test_calendar)
            for cal in calendars:
                if to_hashable(cal) == test_calendar_hashable:
                    return False
            return True

        # Adjusted logic to distribute meetings, incorporating primary user's availability for forced assignments
        n_of_calendars = 0
        i = 0
        while n_of_calendars < 3 and i < max_length:  # Ensure at least two calendars are created
            calendar = []
            scheduled_times = set()
            for user_meetings in all_user_meetings:
                assigned = False
                # Sort available times primarily by priority, then by day and time
                sorted_times = sorted(user_meetings['meeting_options'], key=lambda x: (-x['priority'], x['day'], x['time']))
                for meeting in sorted_times:
                    if (meeting['day'], meeting['time']) not in scheduled_times and is_unique_calendar(meeting, calendar, user_meetings):
                        calendar.append({
                            'day': meeting['day'],
                            'time': meeting['time'],
                            'user': user_meetings['invited_user'],
                            'forced': False,  # This assignment is within availability
                            'available_times': user_meetings['meeting_options']
                        })
                        scheduled_times.add((meeting['day'], meeting['time']))
                        assigned = True
                        break
                if not assigned and n_of_calendars < 3:  # Try to assign based on primary user's availability
                    for day, times in schedule.non_busy_times.items():
                        for time, priority in times.items():
                            if (day, time) not in scheduled_times and is_unique_calendar({'day': day, 'time': time}, calendar, user_meetings, is_forced=True):
                                calendar.append({
                                    'day': day,
                                    'time': time,
                                    'user': user_meetings['invited_user'],
                                    'forced': True,  # Assignment outside invited user's availability
                                    'available_times': user_meetings['meeting_options']
                                })
                                scheduled_times.add((day, time))
                                assigned = True
                                break
                        if assigned:
                            break
                if not assigned:  # If no assignment could be made, skip to the next calendar
                    break
            if assigned:  # Only add the calendar if at least one meeting could be scheduled
                n_of_calendars += 1
                calendars.append(calendar)
            i += 1

        return calendars


    
    
    
class FinalizeScheduleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        suggested_schedule_id = self.kwargs['pk']
        suggested_schedule = get_object_or_404(SuggestedSchedule, id=suggested_schedule_id)
        schedule = suggested_schedule.schedule

        # Ensure the schedule belongs to the requesting user
        if schedule.user != request.user:
            return Response({"detail": "You do not have permission to finalize this schedule."}, status=status.HTTP_403_FORBIDDEN)
        
        # Ensure the schedule is not already finalized
        if schedule.is_finalized:
            return Response({"detail": "This schedule has already been finalized."}, status=status.HTTP_400_BAD_REQUEST)
        
        finalized_meetings = []
        with transaction.atomic():
            # Create a FinalizedMeeting for each suggested time
            for meeting in suggested_schedule.suggested_times:
                finalized_meeting = FinalizedMeeting.objects.create(
                    schedule=schedule,
                    day= meeting["day"],
                    time=datetime.strptime(meeting["time"], "%H:%M").time(),
                    owner=schedule.user,
                    invited_user=User.objects.get(username=meeting['user']) 
                )
                finalized_meetings.append(finalized_meeting)
            
            # Mark the schedule as finalized
            schedule.is_finalized = True
            schedule.save()

        # Serialize the finalized meetings
        serializer = FinalizedMeetingSerializer(finalized_meetings, many=True, context={'request': request})


        for meeting in finalized_meetings:
            subject = "Meeting Schedule Notification"
            meeting_time_str = meeting.time.strftime("%H:%M")
            message = f"Dear {meeting.invited_user.get_full_name() or meeting.invited_user.username},\n\nYou have a scheduled meeting with {meeting.owner.get_full_name() or meeting.owner.username} on {meeting.day} at {meeting_time_str}.\n\nPlease mark this in your calendar.\n\nBest regards."
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [meeting.invited_user.email]

            send_mail(subject, message, email_from, recipient_list)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class FinalizedMeetingsListView(generics.ListAPIView):
    serializer_class = FinalizedMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        schedule_id = self.kwargs['pk']
        schedule = get_object_or_404(Schedule, id=schedule_id)
        if schedule.user != self.request.user:
            raise PermissionDenied("You do not have permission to view finalized meetings for this schedule.")
        return FinalizedMeeting.objects.filter(schedule=schedule, owner=self.request.user)
    
class FinalizedMeetingDetailView(generics.RetrieveUpdateAPIView): #WORKS
    queryset = FinalizedMeeting.objects.all()
    serializer_class = FinalizedMeetingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return FinalizedMeeting.objects.filter(
            Q(owner=user) | 
            Q(invited_user=user)
        ).distinct()

    def get_object(self):
        """
        Override the default `get_object` method to make sure the object belongs to the current user.
        """
        queryset = self.get_queryset()  
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))  
        return obj

class SendReminderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, *args, **kwargs):
        schedule_id = self.kwargs['pk']
        schedule = get_object_or_404(Schedule, id=schedule_id)
        if (schedule.user != self.request.user):
            return Response({"detail": "You do not have permission to send reminders for this schedule."}, status=status.HTTP_403_FORBIDDEN)
        pending_invitations = Invitation.objects.filter(is_submitted=False, schedule=schedule)

        for invitation in pending_invitations:
            subject = "Reminder: Please Submit Your Available Times"
            message = f"Hello {invitation.invited_user.get_full_name() or invitation.invited_user.username},\n\nYou have been invited to provide your available times for the schedule '{invitation.schedule}'. Please log in to our platform and submit your availability at your earliest convenience.\n\nThank you!"
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [invitation.invited_user.email]

            send_mail(subject, message, email_from, recipient_list)

        return Response({"message": "Reminders sent successfully."})
    

class FinalizedScheduleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Retrieve the user from the request
        user = request.user

        # Query for finalized meetings involving the user, either as the owner or invited user
        finalized_meetings = FinalizedMeeting.objects.filter(
            Q(owner=user) | Q(invited_user=user)
        )

        # Serialize the data
        serializer = FinalizedMeetingSerializer(finalized_meetings, many=True, context={'request': request})

        # Return the serialized data
        return Response(serializer.data)
    

    



