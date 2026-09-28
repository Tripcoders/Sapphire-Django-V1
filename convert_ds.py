import re

with open('templates/design_system.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add {% load static %} after <head>
if '{% load static %}' not in content:
    content = content.replace('<head>', '<head>\n{% load static %}', 1)

# 2. Replace Flask url_for('static', filename='...') with {% static '...' %}
content = re.sub(
    r"""url_for\(\s*['"]static['"]\s*,\s*filename\s*=\s*['"]([^'"]+)['"]\s*\)""",
    r"{% static '\1' %}",
    content
)

# 3. Replace url_for('accounts:login') etc with {% url 'name' %}
content = re.sub(
    r"""url_for\(\s*['"]([^'"]+)['"]\s*\)""",
    r"{% url '\1' %}",
    content
)

with open('templates/design_system.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Converted design_system.html')