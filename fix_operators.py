import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Django if/elif conditions - add spaces around == and != operators
# Pattern: {% if var=='value' %} -> {% if var == 'value' %}
content = re.sub(r"\{%\s*if\s+(\w+(?:\.\w+)*)\s*==\s*'([^']*)'\s*%\}", r"{% if \1 == '\2' %}", content)
content = re.sub(r"\{%\s*elif\s+(\w+(?:\.\w+)*)\s*==\s*'([^']*)'\s*%\}", r"{% elif \1 == '\2' %}", content)
content = re.sub(r"\{%\s*if\s+(\w+(?:\.\w+)*)\s*!=\s*'([^']*)'\s*%\}", r"{% if \1 != '\2' %}", content)

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed == and != operators in if conditions')