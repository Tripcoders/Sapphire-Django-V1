#!/bin/bash
# Startup script for Render deployment
# Runs migrations before starting server

python manage.py migrate --noinput
python manage.py create_demo_user
python manage.py collectstatic --noinput
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT