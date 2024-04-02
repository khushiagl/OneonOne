from rest_framework import serializers
from .models import Schedule, Invitation, FinalizedMeeting, SuggestedSchedule, User
from ..users.serializers import UserSerializer

class ScheduleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Schedule
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
        read_only_fields = ('id', 'user', 'is_finalized', 'created', 'updated')

class InvitationSerializer(serializers.ModelSerializer):
    schedule = ScheduleSerializer(read_only=True)
    invited_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True)
    deadline = serializers.DateTimeField(required=True)
    non_busy_times = serializers.JSONField(required=False, default=dict, allow_null=True)
    class Meta:
        model = Invitation
        fields = '__all__'
        read_only_fields=('schedule', 'is_submitted')

    def create(self, validated_data):
        validated_data.pop('non_busy_times', None)
        return super().create(validated_data)


class FinalizedMeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinalizedMeeting
        fields = '__all__'

class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuggestedSchedule
        fields = '__all__'


