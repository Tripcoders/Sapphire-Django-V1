with open('templates/dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the Design system button from the nav
content = content.replace(
'''    <button class="side-item" onclick="location.href='/design-system'"><i data-lucide="palette" class="i22"></i><span class="nav-label">Design system</span><span class="tip">Design system</span></button>
  </nav>''',
'''  </nav>''')

# Add Agent chat label to the agent chat button
content = content.replace(
'''    <button onclick="openModal('agentChatModal')" class="side-item" data-nav="agent-chat" title="Agent chat">
      <img src="{% static 'img/agent-image.png' %}" alt="Agent chat" class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md" />
    </button>''',
'''    <button onclick="openModal('agentChatModal')" class="side-item" data-nav="agent-chat" title="Agent chat">
      <img src="{% static 'img/agent-image.png' %}" alt="Agent chat" class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md" />
      <span class="nav-label">Agent chat</span>
      <span class="tip">Agent chat</span>
    </button>''')

# Fix notification dot alignment - use top-1/2 -translate-y-1/2 for vertical centering
content = content.replace(
    '<span id="sideDot" class="absolute w-2 h-2 rounded-full bg-red-500" style="top:10px;right:16px"></span>',
    '<span id="sideDot" class="absolute top-1/2 -translate-y-1/2 right-2 w-2 h-2 rounded-full bg-red-500"></span>')

with open('templates/dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed sidebar')