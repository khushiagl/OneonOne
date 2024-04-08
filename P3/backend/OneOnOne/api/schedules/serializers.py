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
    deadline = serializers.DateTimeField(required=True)
    non_busy_times = serializers.JSONField(required=False, default=dict, allow_null=True)

    # Use this field for creating/updating (writable).
    invited_user_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=User.objects.all(), 
        source='invited_user', 
        required=True
    )
    
    # This field is used for reading (read-only).
    invited_user = UserSerializer(read_only=True)

    class Meta:
        model = Invitation
        fields = '__all__'
        read_only_fields = ('schedule', 'is_submitted')

    def create(self, validated_data):
        validated_data.pop('non_busy_times', None)
        return super().create(validated_data)

    def to_representation(self, instance):
        """Modify the representation of the instance according to our needs."""
        representation = super().to_representation(instance)
        # When reading, you want to show the user details, so we ensure
        # `invited_user` contains detailed user data.
        # `invited_user_id` is not included in the read representation, so it's not necessary
        # to explicitly remove it, but you can if you include it in `fields` and want to ensure it's not shown.
        return representation


# class FinalizedMeetingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FinalizedMeeting
#         fields = '__all__'

class FinalizedMeetingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    invited_user = UserSerializer(read_only=True)
    schedule = ScheduleSerializer(read_only=True)

    is_owned_by_current_user = serializers.SerializerMethodField()

    class Meta:
        model = FinalizedMeeting
        fields = '__all__'  # Add 'is_owned_by_current_user' to your fields if you list them explicitly
        # If you specify fields explicitly, ensure to include 'is_owned_by_current_user'

    def get_is_owned_by_current_user(self, obj):
        # 'self.context['request'].user' accesses the current user from the request context
        return obj.owner == self.context['request'].user

class SuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuggestedSchedule
        fields = '__all__'



