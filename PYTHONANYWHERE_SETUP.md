# PythonAnywhere Deployment Guide

## Important Note: Environment Mismatch

You tried to use bash commands (`source`, `export`, `git pull`) in PowerShell, which is incorrect. **PythonAnywhere uses their own web console or PowerShell, not bash.**

## What You Have Ready Locally ✅

- **GitHub Repo**: `Tripcoders/Sapphire-Django-V1` (committed with deployment-ready changes)
- **requirements.txt**: Django==6.1.2, tzdata
- **settings.py**: Environment-aware (DEBUG, SECRET_KEY from env vars)
- **STATIC_ROOT**: Configured for collected static files
- **Virtualenv**: `.venv` directory (included in .gitignore)

## Correct PythonAnywhere Setup Process

### Step 1: Create Web App (Manual - Web Console)
1. Go to https://www.pythonanywhere.com
2. Login with username: `tripcoders`
3. In dashboard → Web tab → "Add a new web app"
4. Choose **Django** template
5. Set:
   - **Domain**: `sapphire-pythonanywhere.com`
   - **Virtualenv path**: `~/venv`
   - **Git repository**: `https://github.com/Tripcoders/Sapphire-Django-V1.git`
   - **Git branch**: `master`
6. Click "Create"

### Step 2: Set Up Virtualenv (Web Console)
```bash
# Open a bash shell in your web console
# Navigate to your project
cd /home/tripcoders/sapphire-pythonanywhere

# Activate virtualenv (this creates it if it doesn't exist)
source /home/tripcoders/venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### Step 3: Set Environment Variables (Web Console)
**Account → Environment variables**:
- `DJANGO_DEBUG` = `0`
- `DJANGO_SECRET_KEY` = [generate a secure random string]
- `PYTHONUNBUFFERED` = `1`

### Step 4: Deploy Changes (PowerShell in Web Console)
```powershell
# Open PowerShell in your web console
cd /home/tripcoders/sapphire-pythonanywhere

# Activate virtualenv
& C:\Users\tripcoders\venv\Scripts\Activate.ps1

# Deploy changes
git pull origin master
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### Step 5: Configure Static Files (Web Console)
**Web app → Static** → Ensure `staticfiles/` is mapped correctly

### Step 6: Set Custom Domain (Web Console)
**Web app → Domain** → Add `sapphire-pythonanywhere.com` as mapped domain

## Alternative: Manual Git Deployment
If you prefer manual control:

```bash
# On PythonAnywhere bash shell
cd /home/tripcoders/sapphire-pythonanywhere

# Each time you push to master locally:
git pull origin master

# In virtualenv
source /home/tripcoders/venv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

## Quick Testing
```bash
# Test the deployed app
curl https://sapphire-pythonanywhere.com/
```

## Error Resolution

### "source: command not found" (PowerShell)
```powershell
# PowerShell uses different syntax
& C:\Users\tripcoders\venv\Scripts\Activate.ps1
```

### "requirements.txt not found"
```bash
# Make sure you're in the right directory
cd /home/tripcoders/sapphire-pythonanywhere
ls -la  # should show requirements.txt
```

## Next Steps
1. Create the web app in PythonAnywhere web console
2. Set up the virtualenv
3. Configure environment variables  
4. Deploy using the PowerShell commands above
5. Test the deployed application
6. Configure custom domain

Your local code is ready! Just needs the PythonAnywhere environment setup.