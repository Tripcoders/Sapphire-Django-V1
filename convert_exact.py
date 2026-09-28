with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Use exact string replacements - more reliable than regex for this template

# 1. Add {% load static %}
if '{% load static %}' not in content:
    content = content.replace('<head>', '<head>\n{% load static %}', 1)

# 2. Replace url_for patterns
content = content.replace("{{ url_for('static', filename='css/style.css') }}", "{% static 'css/style.css' %}")
content = content.replace("{{ url_for('static', filename='img/icon-sapphire.svg') }}", "{% static 'img/icon-sapphire.svg' %}")
content = content.replace("{{ url_for('static', filename='img/sapphire-horiz-logo.svg') }}", "{% static 'img/sapphire-horiz-logo.svg' %}")
content = content.replace("{{ url_for('static', filename='js/dashboard.js') }}", "{% static 'js/dashboard.js' %}")

# 3. Replace Jinja2 ternary expressions
content = content.replace("{{ 'active' if tab=='all' else '' }}", "{% if tab == 'all' %}active{% else %}{% endif %}")
content = content.replace("{{ 'active' if tab in ['quotes','quote'] else '' }}", "{% if tab == 'quotes' or tab == 'quote' %}active{% else %}{% endif %}")
content = content.replace("{{ 'active' if tab in ['policies','policy'] else '' }}", "{% if tab == 'policies' or tab == 'policy' %}active{% else %}{% endif %}")
content = content.replace("{{ 'active' if tab in ['leads','lead'] else '' }}", "{% if tab == 'leads' or tab == 'lead' %}active{% else %}{% endif %}")

# 4. Replace pagination expressions
content = content.replace("{{ (page-1)*per_page+1 if total else 0 }}", "{{ start_item }}")
content = content.replace("{{ [page*per_page, total]|min }}", "{{ end_item }}")

# 5. Fix operator spacing
content = content.replace("{% if r.type=='quote' %}", "{% if r.type == 'quote' %}")
content = content.replace("{% elif r.type=='policy' %}", "{% elif r.type == 'policy' %}")
content = content.replace("{% if r.type=='lead' %}", "{% if r.type == 'lead' %}")

# 6. Replace range() in for loops
content = content.replace("{% for p in range(1, pages+1) %}", "{% for p in pages_range %}")

# 7. Remove empty loop.index0 conditionals
content = content.replace("""{% if loop.index0 == 0 or rows[loop.index0-1].type != r.type %}
        {% endif %}""", "")

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Exact string replacement complete')