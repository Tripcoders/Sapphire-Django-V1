from django.apps import AppConfig
from django.db import connection
from django.db.utils import OperationalError
import os


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'

    def ready(self):
        # Auto-run migrations on startup if tables don't exist
        try:
            from django.core.management import call_command
            # Check if auth_user table exists
            with connection.cursor() as cursor:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='auth_user'")
                if not cursor.fetchone():
                    print("Running migrations automatically...")
                    call_command('migrate', '--noinput', verbosity=0)
                    print("Migrations completed!")
        except Exception as e:
            print(f"Migration check failed: {e}")
