import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add {% load static %} after <head>
if '{% load static %}' not in content:
    content = content.replace('<head>', '<head>\n{% load static %}', 1)

# 2. Replace Flask url_for('static', filename='...') with {% static '...' %}
# Handle both single and double quotes
content = re.sub(
    r"""url_for\(\s*['"]static['"]\s*,\s*filename\s*=\s*['"]([^'"]+)['"]\s*\)""",
    r"{% static '\1' %}",
    content
)

# 3. Replace Jinja2 ternary {{ expr if cond else other }}
# Handle: {{ 'active' if tab=='all' else '' }}
content = re.sub(
    r"""\{\{\s*(['"][^'"]*['"])\s+if\s+(\w+)==(['"][^'"]*['"])\s+else\s*(['"][^'"]*['"])\s*\}\}""",
    r"{% if \2 == \3 %}\1{% else %}\4{% endif %}",
    content
)

# Handle: {{ (page-1)*per_page+1 if total else 0 }}
content = re.sub(
    r"""\{\{\s*\(page-1\)\*per_page\+1\s+if\s+total\s+else\s+0\s*\}\}""",
    r"{{ start_item }}",
    content
)

# Handle: {{ [page*per_page, total]|min }}
content = re.sub(
    r"""\{\{\s*\[page\*per_page,\s*total\]\|min\s*\}\}""",
    r"{{ end_item }}",
    content
)

# 4. Replace Jinja2 list membership: {% if x in ['a','b'] %}
def fix_in_list(m):
    var = m.group(1)
    items = [i.strip().strip("'\"") for i in m.group(2).split(',')]
    conditions = " or ".join(f"{var} == '{item}'" for item in items)
    return f"{{% if {conditions} %}}"

content = re.sub(
    r"""\{%\s*if\s+(\w+)\s+in\s+\[([^\]]+)\]\s*%\}""",
    fix_in_list,
    content
)

# 5. Fix operator spacing in if/elif
content = re.sub(r"""\{%\s*if\s+(\w+(?:\.\w+)*)\s*==\s*(['"][^'"]*['"])\s*%\}""", r"{% if \1 == \2 %}", content)
content = re.sub(r"""\{%\s*elif\s+(\w+(?:\.\w+)*)\s*==\s*(['"][^'"]*['"])\s*%\}""", r"{% elif \1 == \2 %}", content)
content = re.sub(r"""\{%\s*if\s+(\w+(?:\.\w+)*)\s*!=\s*(['"][^'"]*['"])\s*%\}""", r"{% if \1 != \2 %}", content)

# 6. Replace range() in for loops
content = re.sub(
    r"""\{%\s*for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*%\}""",
    r"{% for \1 in pages_range %}",
    content
)

# 7. Remove empty loop.index0 conditionals
content = re.sub(
    r"""\{%\s+if\s+loop\.index0\s+==\s+0\s+or\s+rows\[loop\.index0-1\]\.type\s+!=\s+r\.type\s+%\}\s*\{%\s+endif\s+%\}""",
    "",
    content
)

# 8. Replace remaining Jinja2 expressions
# {{ counts.quotes }} etc. work in Django
# {{ q }} works in Django
# {{ r.name }} etc. work in Django

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Conversion complete')