import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix: {% if tab in ['quotes','quote'] %} -> {% if tab == 'quotes' or tab == 'quote' %}
content = re.sub(
    r'\{% if tab in \[\'quotes\',\'quote\'\] %\}',
    "{% if tab == 'quotes' or tab == 'quote' %}",
    content
)

content = re.sub(
    r'\{% if tab in \[\'policies\',\'policy\'\] %\}',
    "{% if tab == 'policies' or tab == 'policy' %}",
    content
)

content = re.sub(
    r'\{% if tab in \[\'leads\',\'lead\'\] %\}',
    "{% if tab == 'leads' or tab == 'lead' %}",
    content
)

# Fix: {{ (page-1)*per_page+1 if total else 0 }}
content = content.replace(
    "{{ (page-1)*per_page+1 if total else 0 }}",
    "{% if total %}{{ page|add:-1|add:1 }}{% else %}0{% endif %}"
)

# Fix: {{ [page*per_page, total]|min }}
content = content.replace(
    "{{ [page*per_page, total]|min }}",
    "{% if total %}{{ page|mul:per_page }}{% else %}0{% endif %}"
)

# Fix remaining Jinja2 conditionals: {{ 'active' if tab=='value' else '' }}
content = re.sub(
    r'\{\{\s*[\'"]active[\'"]\s+if\s+(\w+)==[\'"]([^\'"]+)[\'"]\s+else\s+[\'"][\'"]\s*\}\}',
    r"{% if \1 == '\2' %}active{% else %}{% endif %}",
    content
)

# Fix generic ternary expressions
content = re.sub(
    r'\{\{\s*([\w\.]+)\s+if\s+([^}]+)\s+else\s+([^}]+)\s*\}\}',
    r"{% if \2 %}\1{% else %}\3{% endif %}",
    content
)

# Remove the problematic loop.index0 conditional
content = re.sub(
    r'\{\%\s+if\s+loop\.index0\s+==\s+0\s+or\s+rows\[loop\.index0-1\]\.type\s+!=\s+r\.type\s+\%\}\s*\{\%\s+endif\s+\%\}',
    '',
    content
)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Jinja2 conditionals v2')