"""Sign-in form. Same wording as the Figma source, recast in sentence case."""
from django import forms
from django.contrib.auth.forms import AuthenticationForm


class SignInForm(AuthenticationForm):
    username = forms.CharField(
        label="Agent Number or Agent email",
        widget=forms.TextInput(
            attrs={
                "class": "input",
                "placeholder": "Agent Number or Agent email",
                "autocomplete": "username",
            }
        ),
        error_messages={"required": "Enter your agent number or email."},
    )
    password = forms.CharField(
        label="Password",
        widget=forms.PasswordInput(
            attrs={
                "class": "input",
                "placeholder": "Password",
                "autocomplete": "current-password",
                "id": "id_password",
            }
        ),
        error_messages={"required": "Enter your password."},
    )
    remember = forms.BooleanField(
        label="Remember me", required=False, initial=True,
        widget=forms.CheckboxInput(attrs={"class": "remember-box"}),
    )

    error_messages = {
        "invalid_login": "These details do not match our records. Check them and try again.",
        "inactive": "This account is inactive.",
    }
