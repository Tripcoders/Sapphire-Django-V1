import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
django.setup()
from django.test import Client
c = Client()
c.post('/accounts/', {'username':'demo@sapphire.co','password':'Sapphire123'})
r = c.get('/design-system/')
h = r.content.decode()
print('design-system:', r.status_code)
print('has border:none:', 'border:none' in h)
print('has Iconography:', 'Iconography' in h)