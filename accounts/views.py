"""Auth views. Stand-alone review slice: sign in/out, landing stub, admin reset."""
from django import forms
from django.contrib import messages
from django.contrib.auth import views as auth_views
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView

from .forms import SignInForm


class SignInView(auth_views.LoginView):
    template_name = "accounts/login.html"
    form_class = SignInForm
    redirect_authenticated_user = True

    def form_valid(self, form):
        if not form.cleaned_data.get("remember"):
            self.request.session.set_expiry(0)
        messages.success(self.request, f"Welcome back, {form.get_user().get_username()}.")
        return super().form_valid(form)


class SignedInView(LoginRequiredMixin, TemplateView):
    template_name = "accounts/signed_in.html"


class LoggedOutView(auth_views.LogoutView):
    template_name = "accounts/logged_out.html"


class ForgotPasswordForm(forms.Form):
    email = forms.EmailField(
        label="Work email",
        widget=forms.EmailInput(
            attrs={
                "class": "input",
                "placeholder": "you@sapphire.co",
                "autocomplete": "email",
                "autofocus": True,
            }
        ),
        error_messages={"required": "Enter your work email address."},
    )


class ForgotPasswordView(TemplateView):
    template_name = "accounts/forgot_password.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["form"] = ForgotPasswordForm()
        return ctx


class ForgotPasswordSubmitView(View):
    def post(self, request):
        form = ForgotPasswordForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            # In production: queue a task for IT admin to review and reset
            # For demo: just accept any email
            return JsonResponse({
                "ok": True,
                "message": "Your password reset will be ready soon. Check your email to see reset instructions."
            })
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)


class ForgotPasswordSuccessView(TemplateView):
    template_name = "accounts/forgot_password_success.html"
