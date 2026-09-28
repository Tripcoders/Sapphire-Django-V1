from django.urls import path

from . import views

app_name = "accounts"

urlpatterns = [
    path("", views.SignInView.as_view(), name="login"),
    path("signed-in/", views.SignedInView.as_view(), name="signed-in"),
    path("signed-out/", views.LoggedOutView.as_view(), name="signed-out"),
    path("forgot/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("forgot/submit/", views.ForgotPasswordSubmitView.as_view(), name="forgot-password-submit"),
    path("forgot/success/", views.ForgotPasswordSuccessView.as_view(), name="forgot-password-success"),
]
