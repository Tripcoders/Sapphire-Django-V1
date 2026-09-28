import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','config.settings')
django.setup()
from django.test import Client
c = Client()
c.post('/accounts/', {'username':'demo@sapphire.co','password':'Sapphire123'})
r = c.get('/')
h = r.content.decode()
print('dashboard:', r.status_code)
print('has layout-grid:', 'layout-grid' in h)
print('has layout-dashboard:', 'layout-dashboard' in h)
print('no menu icon:', 'data-lucide="menu"' not in h)
print('has sb-agent.png:', 'sb-agent.png' in h)
print('no chevrons-right:', 'chevrons-right' not in h)