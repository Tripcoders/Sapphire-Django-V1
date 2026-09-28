import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the static tags - remove escaped backslashes
content = content.replace(r"\{% static \\'", "{% static '")
content = content.replace(r"\\' %}", "' %}")

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed')