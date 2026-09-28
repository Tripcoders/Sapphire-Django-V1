"""Root URLconf. Unified Sapphire application."""
from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("dashboard.urls")),
    path("accounts/", include("accounts.urls")),
    path("accounts/logout/", auth_views.LogoutView.as_view(next_page="accounts:login"), name="logout"),
    path("design-system/", TemplateView.as_view(template_name="design_system.html"), name="design-system"),
]
