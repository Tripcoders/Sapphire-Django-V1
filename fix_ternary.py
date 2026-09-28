import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix remaining Jinja2 ternary expressions
# Pattern: {{ (page-1)*per_page+1 if total else 0 }}
content = content.replace(
    "{{ (page-1)*per_page+1 if total else 0 }}",
    "{{ start_item }}"
)

# Pattern: {{ [page*per_page, total]|min }}
content = content.replace(
    "{{ [page*per_page, total]|min }}",
    "{{ end_item }}"
)

# Fix any remaining Jinja2 expressions with if/else
# Pattern: {{ value if condition else other }}
content = re.sub(
    r"\{\{\s*([\w\.\(\)\*\+\-]+)\s+if\s+([\w\.\(\)\*\+\-]+)\s+else\s+([\w\.\(\)\*\+\-]+)\s*\}\}",
    r"{% if \2 %}{{ \1 }}{% else %}{{ \3 }}{% endif %}",
    content
)

# Fix Jinja2 expressions with filters like |min
content = re.sub(
    r"\{\{\s*\[([^\]]+)\]\|min\s*\}\}",
    r"{{ \1 }}",
    content
)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed remaining Jinja2 expressions')