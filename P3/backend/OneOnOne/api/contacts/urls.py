from django.urls import path
from .views import add_contact, all_contacts, edit_contact, delete_contact, contact_details


app_name='contacts'
urlpatterns = [
    path('add_contact/', add_contact.AddContact.as_view(), name='add_contact'),
    path('all_contacts/', all_contacts.ContactList.as_view(), name='all_contacts'),
    path('edit_contact/', edit_contact.UpdateContact.as_view(), name='edit_contact'),
    path('delete_contact/', delete_contact.DeleteContact.as_view(), name='delete_contact'),
    path('contact_details/', contact_details.ContactDetails.as_view(), name='contact_detail'),
]