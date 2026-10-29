# PythonAnywhere Deployment Checklist

## Pre-Deployment (Local)
- [x] requirements.txt created
- [x] settings.py environment-aware
- [x] .gitignore updated
- [x] Code pushed to GitHub
- [x] Local testing successful

## PythonAnywhere Setup
- [ ] Create web app from GitHub
- [ ] Set up virtualenv
- [ ] Install requirements
- [ ] Set environment variables
- [ ] Deploy changes
- [ ] Test deployed site
- [ ] Configure custom domain

## Environment Variables Needed:
DJANGO_DEBUG = "0"
DJANGO_SECRET_KEY = [generate secure random string]
PYTHONUNBUFFERED = "1"

## Commands to Run on PythonAnywhere:
1. source /home/tripcoders/venv/bin/activate
2. pip install -r requirements.txt
3. python manage.py collectstatic --noinput
4. python manage.py migrate

## Custom Domain:
sapphire-pythonanywhere.com
