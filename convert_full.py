import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add {% load static %} after <head>
content = content.replace('<head>', '<head>\n{% load static %}', 1)

# 2. Replace all url_for('static', filename='...') with {% static '...' %}
content = re.sub(
    r"\{\{\s*url_for\(\s*['\"]static['\"]\s*,\s*filename\s*=\s*['\"]([^'\"]+)['\"]\s*\)\s*\}\}",
    r"{% static '\1' %}",
    content
)

# 3. Replace Jinja2 conditionals with Django template syntax
# Pattern: {{ 'active' if tab=='value' else '' }}
content = re.sub(
    r"\{\{\s*['\"]active['\"]\s+if\s+(\w+)==['\"]([^'\"]+)['\"]\s+else\s+['\"][\"']?\s*\}\}",
    r"{% if \1 == '\2' %}active{% else %}{% endif %}",
    content
)

# Pattern: {{ 'active' if tab in ['value1','value2'] else '' }}
content = re.sub(
    r"\{\{\s*['\"]active['\"]\s+if\s+(\w+)\s+in\s+\[([^\]]+)\]\s+else\s+['\"][\"']?\s*\}\}",
    r"{% if \1 in [\2] %}active{% else %}{% endif %}",
    content
)

# 4. Replace generic ternary: {{ value if condition else other }}
content = re.sub(
    r"\{\{\s*([\w\.]+)\s+if\s+([^}]+)\s+else\s+([^}]+)\s*\}\}",
    r"{% if \2 %}\1{% else %}\3{% endif %}",
    content
)

# 5. Replace loop.index0 conditionals
content = re.sub(
    r"\{%\s+if\s+loop\.index0\s+==\s+0\s+or\s+rows\[loop\.index0-1\]\.type\s+!=\s+r\.type\s+%\}\s*\{%\s+endif\s+%\}",
    "",
    content
)

# 6. Replace range() calls in for loops
content = re.sub(
    r"\{%\s+for\s+(\w+)\s+in\s+range\(([^)]+)\)\s+%\}",
    r"{% for \1 in \2 %}",
    content
)

# 7. Fix the range in pagination - Django doesn't have range()
# Replace {% for p in range(1, pages+1) %} with a custom approach
content = re.sub(
    r"\{%\s+for\s+(\w+)\s+in\s+range\(1,\s*pages\+1\)\s+%\}",
    r"{% for \1 in pages_range %}",
    content
)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Converted dashboard.html to Django template syntax')