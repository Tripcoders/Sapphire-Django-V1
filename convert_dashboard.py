import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# First, add {% load static %} at the top after <head>
content = content.replace('<head>', '<head>\n{% load static %}')

# Replace all url_for('static', filename='...') with {% static '...' %}
# Pattern: {{ url_for('static', filename='...') }} or {{ url_for("static", filename="...") }}
content = re.sub(
    r'\{\{\s*url_for\(\s*[\'"]static[\'"]\s*,\s*filename\s*=\s*[\'"]([^\'"]+)[\'"]\s*\)\s*\}\}',
    r'{% static \'\1\' %}',
    content
)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done converting dashboard.html')