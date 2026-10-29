# Quick PythonAnywhere Deployment Guide

## Current Status ✅

**Local preparations complete:**
- GitHub repo committed and pushed with deployment-ready changes
- requirements.txt (Django 6.1.2, tzdata)
- settings.py with environment variables
- STATIC_ROOT configured
- All changes ready to deploy

## Environment Clarification

**You need to use PowerShell commands in PythonAnywhere, not bash:**

❌ **Incorrect:**
```bash
source /home/tripcoders/venv/bin/activate
export DJANGO_DEBUG=0
git pull origin master
```

✅ **Correct (PowerShell):**
```powershell
cd /home/tripcoders/sapphire-pythonanywhere
& C:\Users\tripcoders\venv\Scripts\Activate.ps1
$env:DJANGO_DEBUG = "0"
$env:PYTHONUNBUFFERED = "1"
git pull origin master
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

## Step-by-Step Deployment

### Step 1: Create Web App (Web Console Only)
1. Go to https://www.pythonanywhere.com
2. Login with username: `tripcoders`
3. Web → "Add a new web app"
4. Choose Django template
5. Fill in:
   - Domain: `sapphire-pythonanywhere.com`
   - Virtualenv path: `~/venv`
   - Git repository: `https://github.com/Tripcoders/Sapphire-Django-V1.git`
   - Git branch: `master`
6. Click "Create"

### Step 2: Set Up Project (Web Console - Bash Shell)
```bash
# In PythonAnywhere web console → Bash shell
cd /home/tripcoders/sapphire-pythonwhere
ls -la  # Verify files exist
```

### Step 3: Create & Activate Virtualenv (Web Console - Bash)
```bash
# Create virtualenv if needed
virtualenv /home/tripcoders/venv

# Activate it
source /home/tripcoders/venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Step 4: Set Environment Variables (Web Console - Account)
**Account → Environment variables:**
- `DJANGO_DEBUG` = `0`
- `DJANGO_SECRET_KEY` = [generate secure random string]
- `PYTHONUNBUFFERED` = `1`

### Step 5: Deploy Changes (Web Console - PowerShell)
```powershell
# In PowerShell
cd /home/tripcoders/sapphire-pythonwhere
& C:\Users\tripcoders\venv\Scripts\Activate.ps1

# Deploy from git
git pull origin master

# Install updated requirements
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate
```

### Step 6: Configure Custom Domain (Web Console - Web)
**Web app → Domain:**
- Add `sapphire-pythonanywhere.com` as mapped domain
- Set up CNAME record if needed

## Important Notes

### Environment Variables in settings.py:
```python
# In config/settings.py, we read from environment:
_DEBUG = os.environ.get("DJANGO_DEBUG", "1") != "0"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "fallback-secret")
```

### For Production:
- Set `DJANGO_DEBUG=0` in environment variables
- Use a real `DJANGO_SECRET_KEY` (not the fallback)
- The fallback is only for local development

### Static Files:
- Run `python manage.py collectstatic --noinput` after deployment
- Configure STATIC_ROOT in production

## Testing Commands

```bash
# Test the deployed site
curl https://sapphire-pythonanywhere.com/

# Or visit in browser
# Should show your Django app running
```

## Common Issues & Solutions

### "Virtualenv not found"
```bash
# Create it
virtualenv /home/tripcoders/venv
```

### "Command not found: source" (PowerShell)
```powershell
# Use PowerShell's & operator to call scripts
& C:\Users\tripcoders\venv\Scripts\Activate.ps1
```

### "requirements.txt not found"
```bash
cd /home/tripcoders/sapphire-pythonwhere
ls -la  # Verify you're in the right directory
```

## Quick Start Checklist

- [ ] Create web app in PythonAnywhere web console
- [ ] Set up virtualenv and install requirements  
- [ ] Configure environment variables
- [ ] Deploy changes (git pull + collectstatic + migrate)
- [ ] Test the deployed site
- [ ] Configure custom domain

## Next Steps After Deployment

Once deployed and working:
1. Configure your custom domain (`sapphire-pythonanywhere.com`)
2. Set up SSL certificate (free via Let's Encrypt)
3. Configure backup strategy
4. Set up monitoring
5. Configure email settings

Your local code is ready! Just needs the PythonAnywhere environment setup.