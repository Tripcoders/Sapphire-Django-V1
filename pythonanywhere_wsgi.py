# WSGI file for PythonAnywhere
import os
import sys

# Add your project directory to the sys.path
path = '/home/tripcoders/sapphire-pythonanywhere'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('DJANGO_DEBUG', '0')
os.environ.setdefault('DJANGO_SECRET_KEY', 'your-secret-key-here')
os.environ.setdefault('PYTHONUNBUFFERED', '1')

# Get WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
