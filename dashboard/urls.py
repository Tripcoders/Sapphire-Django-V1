from django.urls import path

from . import views

app_name = "dashboard"

urlpatterns = [
    path("", views.index, name="index"),
    path("api/activities/", views.api_activities, name="api-activities"),
    path("api/quotes/", views.api_create_quote, name="api-create-quote"),
    path("api/claims/", views.api_create_claim, name="api-create-claim"),
    path("api/clients/", views.api_clients, name="api-clients"),
    path("api/messages/", views.api_messages, name="api-messages"),
    path("api/messages/", views.api_send_message, name="api-send-message"),
    path("api/messages/<int:tid>/", views.api_reply, name="api-reply"),
    path("api/clients/", views.api_clients, name="api-clients"),
    path("api/messages/", views.api_messages, name="api-messages"),
    path("api/messages/", views.api_send_message, name="api-send-message"),
    path("api/messages/<int:tid>/", views.api_reply, name="api-reply"),
    path("api/notifications/", views.api_notifications, name="api-notifications"),
    path("api/notifications/<int:nid>/read/", views.api_notification_read, name="api-notification-read"),
    path("api/notifications/read-all/", views.api_notifications_read_all, name="api-notifications-read-all"),
]