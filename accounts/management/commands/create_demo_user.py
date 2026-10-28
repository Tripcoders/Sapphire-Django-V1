from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates a demo user for the agent portal'

    def handle(self, *args, **options):
        username = 'agent'
        password = 'Sapphire2025!'
        email = 'agent@sapphire.co'

        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username=username, password=password, email=email)
            self.stdout.write(self.style.SUCCESS(f'Created demo user: {username}'))
        else:
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated demo user: {username}'))
        
        self.stdout.write(f'Username: {username}')
        self.stdout.write(f'Password: {password}')
