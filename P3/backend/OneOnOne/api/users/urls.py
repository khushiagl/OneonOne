from django.urls import path
from .views import RegisterUsersView, UserProfileView, MyTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterUsersView.as_view(), name="register"),
    path('login/', MyTokenObtainPairView.as_view(), name="login"),
    path('token/refresh/', TokenRefreshView.as_view(), name="login-refresh"),
    path('profile/', UserProfileView.as_view(), name="profile"),
]