import re

with open('templates/design_system.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix double-wrapped static tags: {{ {% static 'x' %} }} -> {% static 'x' %}
content = re.sub(r"\{\{\s*\{%\s*static\s*'([^']+)'\s*%\}\s*\}\}", r"{% static '\1' %}", content)

# Fix any remaining url_for in href/src attributes
content = re.sub(r"href=\"\{%\s*static\s*'([^']+)'\s*%\}\"", r"href=\"{% static '\1' %}\"", content)

with open('templates/design_system.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed design_system.html static tags')