import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
django.setup()
from django.test import Client
c = Client()
c.post('/accounts/', {'username':'demo@sapphire.co','password':'Sapphire123'})
r = c.get('/')
h = r.content.decode()
print('dashboard:', r.status_code)
print('has menu icon:', 'data-lucide="menu"' in h)
print('has layout-grid:', 'layout-grid' in h)
print('has layout-dashboard:', 'layout-dashboard' in h)
print('has agent-image.png:', 'agent-image.png' in h)
print('no chevrons-right:', 'chevrons-right' not in h)