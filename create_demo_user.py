import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# Create demo user
username = 'agent'
password = 'Sapphire2025!'
email = 'agent@sapphire.co'

if not User.objects.filter(username=username).exists():
    User.objects.create_user(username=username, password=password, email=email)
    print(f'Created user: {username}')
    print(f'Password: {password}')
else:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f'Updated user: {username}')
    print(f'Password: {password}')
