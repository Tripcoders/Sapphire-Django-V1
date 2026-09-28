import re

with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Flask url_for with Django static template tag
content = re.sub(r"url_for\(['\"]static['\"]\s*,\s*filename=['\"]", "{% static '", content)
content = content.replace('") }}', "' %}")

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')