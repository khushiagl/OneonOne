from django.urls import path, include

app_name = 'api'
urlpatterns = [
    path('contacts/', include('api.contacts.urls')),  # Note the 'api.' prefix here
    path('schedules/', include('api.schedules.urls')),  # And here
    path('users/', include('api.users.urls')),  # And so on for all nested apps
    path('about/', include('api.about.urls')),
    # ...
]
