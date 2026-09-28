import re

with open('templates/design_system.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the header section with proper design system nav
old_header_start = content.find('<header')
old_header_end = content.find('</header>') + len('</header>')
if old_header_start > -1 and old_header_end > old_header_start:
    old_header = content[old_header_start:old_header_end]
    
    new_header = '''<header style="position:sticky;top:0;z-index:50;background:rgba(253,253,253,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:0;height:var(--top-h);display:flex;align-items:center;padding:0 28px;gap:24px">
  <a href="/" class="flex items-center gap-2" style="text-decoration:none">
    <img src="{% static 'img/sapphire-horiz-logo.svg' %}" alt="Sapphire" style="height:26px;width:auto" />
    <span class="pill pill-channel">Design system v2</span>
  </a>
  <nav class="ds-tabs" style="position:static;background:transparent;border:none;flex:1;display:flex;justify-content:center">
    <div style="display:flex;gap:4px;overflow-x:auto">
      <button class="tab-btn active" data-dstab="foundations">Foundations<span class="tab-ink"></span></button>
      <button class="tab-btn" data-dstab="atoms">Atoms<span class="tab-ink"></span></button>
      <button class="tab-btn" data-dstab="molecules">Molecules<span class="tab-ink"></span></button>
      <button class="tab-btn" data-dstab="organisms">Organisms<span class="tab-ink"></span></button>
      <button class="tab-btn" data-dstab="templates">Templates<span class="tab-ink"></span></button>
    </div>
  </nav>
  <div style="display:flex;gap:8px">
    <a href="/" class="btn btn-ghost btn-sm" style="text-decoration:none"><i data-lucide="layout-dashboard" class="i16"></i> Dashboard</a>
    <button class="btn btn-primary btn-sm" onclick="navigator.clipboard && navigator.clipboard.writeText(window.location.href);toast('Link copied')"><i data-lucide="share-2" class="i16"></i> Share</button>
  </div>
</header>'''
    
    content = content[:old_header_start] + new_header + content[old_header_end:]
    
    with open('templates/design_system.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Header replaced')
else:
    print('Header not found')
