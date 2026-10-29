#!/bin/bash
# Startup script for Render deployment
# This ensures migrations run before starting the server

echo "=== Starting deployment ==="
echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating demo user..."
python manage.py create_demo_user

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0: