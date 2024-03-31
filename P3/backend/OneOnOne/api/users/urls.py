from django.urls import path
from .views import RegisterUsersView, UserProfileView, UserProfileUpdateView, MyTokenObtainPairView, DeleteProfileView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUsersView.as_view(), name="register"),
    path('login/', MyTokenObtainPairView.as_view(), name="login"),
    path('token/refresh/', TokenRefreshView.as_view(), name="login-refresh"),
    path('profile/view/', UserProfileView.as_view(), name="profile"),
    path('profile/edit/', UserProfileUpdateView.as_view(), name="edit"),
    path('profile/delete/', DeleteProfileView.as_view(), name="delete"),
]