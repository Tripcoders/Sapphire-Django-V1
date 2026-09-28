/* Sapphire Dashboard v2 — routing, dropdowns, pages, design-system behaviours.
   Icons render thick via CSS (svg.lucide stroke-width 2.5). */
const state = { q: document.getElementById('quickSearch')?.value || '', tab: document.querySelector('#page-dashboard [data-tab].active')?.dataset.tab || 'all', sort: 'name', dir: 'asc', page: 1, pages: 1, channel: 'all', cache: [] };
const policyState = { q: '', page: 1, pages: 1, cache: [] };
const loaded = { policies: false, clients: false, messages: false, notifications: false, settings: false, help: false };
let notifs = [], threads = [], activeThread = null, notifFilter = 'all', clientsCache = [];

function refreshIcons(){ if (window.lucide) lucide.createIcons(); }
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---------------- Button loading state: every call-based action shows a spinner ---------------- */
async function withLoading(btn, task, label){
  if (!btn || btn.classList.contains('loading')){ if (!btn) await task(); return; }
  const orig = btn.innerHTML;
  btn.classList.add('loading'); btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span>' + (label ? '<span>' + escapeHtml(label) + '</span>' : '');
  try { await task(); }
  finally { btn.classList.remove('loading'); btn.disabled = false; btn.innerHTML = orig; refreshIcons(); }
}

/* ---------------- Avatars: ghost style, color derived from the name ---------------- */
const AVATAR_PAIRS = [
  { bg: 'rgba(0,145,255,.12)', fg: '#0063b8' },
  { bg: 'rgba(0,51,170,.10)', fg: '#0033aa' },
  { bg: 'rgba(0,200,151,.15)', fg: '#00755a' },
  { bg: 'rgba(124,58,237,.12)', fg: '#5b21b6' },
  { bg: 'rgba(245,158,11,.18)', fg: '#92400e' },
  { bg: 'rgba(244,63,94,.12)', fg: '#9f1239' },
  { bg: 'rgba(6,182,212,.15)', fg: '#0e7490' },
  { bg: 'rgba(100,116,139,.18)', fg: '#334155' },
];
function avatarFor(name){
  let h = 0;
  for (const ch of String(name || '?')) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return AVATAR_PAIRS[h % AVATAR_PAIRS.length];
}
function avatarStyle(name){ const a = avatarFor(name); return 'background:' + a.bg + ';color:' + a.fg; }
function paintUserAvatars(){
  const s = avatarStyle('Tal Hassal');
  ['topAvatar', 'profileAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.cssText += ';' + s;
  });
}
function toast(msg, error){
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast' + (error ? ' error' : '');
  el.innerHTML = '<i data-lucide="' + (error ? 'alert-circle' : 'check-circle-2') + '" class="i16"></i><span></span>';
  el.querySelector('span').textContent = msg;
  box.appendChild(el); refreshIcons();
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 350); }, 2600);
}

/* ---------------- Router (hash pages, every nav item is a real page) ---------------- */
const TITLES = { dashboard: 'Insurance policies', policies: 'Policies', clients: 'Clients', messages: 'Messages', settings: 'Settings', notifications: 'Notifications', help: 'Help centre' };
function go(page){ closeAllDrops(); closeDrawer(); if (location.hash === '#/' + page){ renderRoute(); } else { location.hash = '#/' + page; } toggleNav(false); }
function currentRoute(){ const h = (location.hash || '').replace('#/', ''); return TITLES[h] ? h : 'dashboard'; }
function renderRoute(){
  const r = currentRoute();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + r).classList.add('active');
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === r));
  document.getElementById('pageTitle').textContent = TITLES[r];
  if (r === 'policies' && !loaded.policies){ loaded.policies = true; loadPolicies(); }
  if (r === 'clients' && !loaded.clients){ loaded.clients = true; loadClients(); }
  if (r === 'messages' && !loaded.messages){ loaded.messages = true; loadThreads(); }
  if (r === 'notifications' && !loaded.notifications){ loaded.notifications = true; renderNotifPage(); }
  if (r === 'settings' && !loaded.settings){ loaded.settings = true; initSettings(); }
  if (r === 'help' && !loaded.help){ loaded.help = true; initFaq(); }
  refreshIcons();
  window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', renderRoute);

/* ---------------- Dropdown manager (only one open at a time) ---------------- */
const DROPS = [['filterBtn','filterPop'],['sortBtn','sortPop'],['topFilterBtn','topFilterPop'],['bellBtn','bellPop'],['profileBtn','profilePop'],['notifFilterBtn','notifFilterPop'],['roleBtn','rolePop'],['nqChannelBtn','nqChannelPop'],['emojiBtn','emojiPop'],['resolveReasonBtn','resolveReasonPop'],['resolveReminderBtn','resolveReminderPop']];
function closeAllDrops(except){ DROPS.forEach(([b,p]) => { if (p !== except) document.getElementById(p)?.classList.add('hidden'); }); }
function bindDrops(){
  DROPS.forEach(([b,p]) => {
    document.getElementById(b)?.addEventListener('click', e => {
      e.stopPropagation();
      const pop = document.getElementById(p);
      const wasHidden = pop.classList.contains('hidden');
      closeAllDrops();
      if (wasHidden) pop.classList.remove('hidden');
      if (p === 'bellPop') renderBellList();
    });
  });
  document.addEventListener('click', e => { if (!e.target.closest('.dropdown')) closeAllDrops(); });
}

/* ---------------- Shared pills / rows ---------------- */
function pill(type){
  if (type === 'quote') return '<span class="pill pill-quote"><i data-lucide="file-text" class="i14"></i>Quote</span>';
  if (type === 'policy') return '<span class="pill pill-policy"><i data-lucide="shield-check" class="i14"></i>Policy</span>';
  return '<span class="pill pill-lead"><i data-lucide="sparkles" class="i14"></i>Lead</span>';
}
function rowHtml(r, i){
  return '<tr data-id="' + r.id + '" style="animation:fadeUp .5s ' + (i * 0.04) + 's both">'
    + '<td>' + pill(r.type) + '</td>'
    + '<td>' + escapeHtml(r.name) + '</td><td>' + escapeHtml(r.date) + '</td><td>' + escapeHtml(r.number) + '</td>'
    + '<td><span class="pill pill-channel"><i data-lucide="' + r.channel_icon + '" class="i14"></i>' + escapeHtml(r.channel) + '</span></td>'
    + '<td>' + escapeHtml(r.id_number) + '</td>'
    + '<td><button class="view-link" onclick="openDetail(' + r.id + ', \'main\')">View <i data-lucide="arrow-right" class="i14"></i></button></td></tr>';
}
function cardHtml(r, list){
  return '<article class="record-card"><div class="record-card-top">' + pill(r.type)
    + '<button class="view-link" onclick="openDetail(' + r.id + ', \'' + list + '\')">View <i data-lucide="arrow-right" class="i14"></i></button></div>'
    + '<p class="record-card-name" style="margin:0">' + escapeHtml(r.name) + '</p>'
    + '<div class="record-card-meta"><span>' + escapeHtml(r.date) + '</span><span>·</span><span>' + escapeHtml(r.number) + '</span></div>'
    + '<div class="record-card-foot"><span class="pill pill-channel"><i data-lucide="' + r.channel_icon + '" class="i14"></i>' + escapeHtml(r.channel) + '</span><span class="t-caption">' + escapeHtml(r.id_number) + '</span></div></article>';
}
function pagerHtml(page, pages){
  let h = '<button class="page-btn" data-page="prev" title="Previous page"><i data-lucide="chevron-left" class="i16"></i></button>';
  for (let p = 1; p <= pages; p++) h += '<button class="page-btn' + (p === page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
  return h + '<button class="page-btn" data-page="next" title="Next page"><i data-lucide="chevron-right" class="i16"></i></button>';
}

/* ---------------- Dashboard table ---------------- */
async function load(){
  const tb = document.getElementById('tbody');
  tb.innerHTML = Array.from({ length: 4 }).map(() => '<tr><td colspan="7"><div class="skeleton" style="height:34px"></div></td></tr>').join('');
  const params = new URLSearchParams({ q: state.q, tab: state.tab, sort: state.sort, dir: state.dir, page: state.page, channel: state.channel });
  const data = await (await fetch('/api/activities?' + params)).json();
  state.cache = data.rows; state.page = data.page; state.pages = data.pages;
  document.getElementById('emptyState').classList.toggle('hidden', data.rows.length > 0);
  tb.innerHTML = data.rows.map(rowHtml).join('');
  document.getElementById('recordCards').innerHTML = data.rows.map(r => cardHtml(r, 'main')).join('');
  document.getElementById('rangeLabel').textContent = data.total ? 'Showing ' + data.range[0] + '-' + data.range[1] + ' of ' + data.total + ' results' : 'No results';
  document.getElementById('searchMeta').textContent = state.q ? data.total + ' match' + (data.total === 1 ? '' : 'es') + ' for "' + state.q + '"' : '';
  document.getElementById('pager').innerHTML = pagerHtml(data.page, data.pages);
  if (data.counts){ document.getElementById('cQuotes').textContent = data.counts.quotes; document.getElementById('cPolicies').textContent = data.counts.policies; document.getElementById('cLeads').textContent = data.counts.leads; }
  refreshIcons();
}
function clearAllFilters(){
  state.q = ''; state.channel = 'all'; state.page = 1;
  document.getElementById('quickSearch').value = ''; document.getElementById('topSearch').value = '';
  document.querySelectorAll('[data-channel-list] .dropdown-item').forEach(b => b.classList.toggle('active', b.dataset.channel === 'all'));
  load();
}

/* ---------------- Policies page ---------------- */
async function loadPolicies(){
  const tb = document.getElementById('tbodyPolicies');
  tb.innerHTML = Array.from({ length: 4 }).map(() => '<tr><td colspan="7"><div class="skeleton" style="height:34px"></div></td></tr>').join('');
  const params = new URLSearchParams({ q: policyState.q, tab: 'policies', sort: 'name', dir: 'asc', page: policyState.page, channel: 'all' });
  const data = await (await fetch('/api/activities?' + params)).json();
  policyState.cache = data.rows; policyState.page = data.page; policyState.pages = data.pages;
  tb.innerHTML = data.rows.map(rowHtml).join('');
  document.getElementById('policyCards').innerHTML = data.rows.map(r => cardHtml(r, 'policies')).join('');
  document.getElementById('policyRange').textContent = 'Showing ' + data.range[0] + '-' + data.range[1] + ' of ' + data.total + ' policies';
  document.getElementById('policyPager').innerHTML = pagerHtml(data.page, data.pages);
  const c = data.counts;
  const stats = [
    { label: 'Total policies', value: c.policies, icon: 'shield-check', bg: 'rgba(0,200,151,.12)', fg: '#00916c' },
    { label: 'Open quotes', value: c.quotes, icon: 'file-text', bg: 'rgba(0,145,255,.10)', fg: '#0081e6' },
    { label: 'Active leads', value: c.leads, icon: 'sparkles', bg: 'rgba(124,58,237,.10)', fg: '#7c3aed' },
    { label: 'Total records', value: c.all, icon: 'layout-dashboard', bg: 'rgba(0,51,170,.08)', fg: '#0033aa' },
  ];
  document.getElementById('policyStats').innerHTML = stats.map(s =>
    '<div class="stat-card"><div class="stat-ic" style="background:' + s.bg + ';color:' + s.fg + '"><i data-lucide="' + s.icon + '" class="i22"></i></div>'
    + '<div><p class="t-h2" style="margin:0;font-size:22px">' + s.value + '</p><p class="t-caption" style="margin:2px 0 0">' + s.label + '</p></div></div>').join('');
  refreshIcons();
}

/* ---------------- Clients page ---------------- */
async function loadClients(){
  const grid = document.getElementById('clientGrid');
  grid.innerHTML = Array.from({ length: 6 }).map(() => '<div class="card card-pad"><div class="skeleton" style="height:90px"></div></div>').join('');
  const data = await (await fetch('/api/clients')).json();
  clientsCache = data.clients;
  renderClients('');
}
function renderClients(q){
  q = (q || '').toLowerCase();
  const list = clientsCache.filter(c => !q || c.name.toLowerCase().includes(q) || c.id_number.includes(q));
  document.getElementById('clientGrid').innerHTML = list.length ? list.map((c, i) =>
    '<div class="client-card" style="animation:fadeUp .5s ' + (Math.min(i, 8) * 0.05) + 's both">'
    + '<div class="flex items-center gap-3" style="display:flex;gap:14px;align-items:center;margin-bottom:18px">'
    + '<div class="avatar" style="' + avatarStyle(c.name) + ';width:52px;height:52px;font-size:16px">' + escapeHtml(c.initials) + '</div>'
    + '<div><p class="t-h2" style="margin:0;font-size:15px">' + escapeHtml(c.name) + '</p><p class="t-caption" style="margin:4px 0 0">' + c.policies + ' polic' + (c.policies === 1 ? 'y' : 'ies') + ' · ' + c.quotes + ' quote' + (c.quotes === 1 ? '' : 's') + '</p></div></div>'
    + '<div class="flex items-center gap-2" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px">' + pill(c.kind) + '<span class="pill pill-channel"><i data-lucide="' + c.channel_icon + '" class="i14"></i>' + escapeHtml(c.channel) + '</span></div>'
    + '<div class="flex gap-2" style="display:flex;gap:10px"><button class="btn btn-ghost btn-sm" style="flex:1" onclick="openDetail(' + c.id + ', \'clients\')">View record</button>'
    + '<button class="btn btn-primary btn-sm" style="flex:1" onclick="messageClient(\'' + escapeHtml(c.name) + '\')"><i data-lucide="message-square-text" class="i16"></i> Message</button></div></div>'
  ).join('') : '<div class="card card-pad" style="grid-column:1/-1"><div class="empty-state"><div class="empty-ic"><i data-lucide="users" class="i24"></i></div><p class="t-h2" style="margin:0">No clients match</p></div></div>';
  refreshIcons();
}
function messageClient(name){
  document.getElementById('cmTo').value = name;
  openModal('composeModal');
}

/* ---------------- Chat portal: threads, filters, resolve flow, calls ---------------- */
const EMOJIS = ['😀','😄','😊','🙂','😉','😍','😎','🤔','👍','👏','🙏','✅','🎉','💼','📋','⏰','❤️','⭐','⚠️','🔔','📞','📎','📄','💬'];
const REASONS = ['Documentation outstanding','Awaiting client response','Pending approval','Payment outstanding','Inspection required','Other'];
const REASON_ICONS = {'Documentation outstanding':'file-warning','Awaiting client response':'hourglass','Pending approval':'badge-check','Payment outstanding':'wallet','Inspection required':'clipboard-check','Other':'message-circle'};
const REMINDERS = ['Tomorrow','In 3 days','Next week','No reminder'];
const REMINDER_ICONS = {'Tomorrow':'sunrise','In 3 days':'calendar-days','Next week':'calendar-range','No reminder':'bell-off'};
let msgFilter = 'all';
let resolveDraft = { threadId: null, outcome: 'resolved', reason: REASONS[0], reminder: REMINDERS[0] };
let callTimers = [], callClock = null;

function statusPill(t){
  if (t.status === 'resolved') return '<span class="pill pill-policy"><i data-lucide="check" class="i14"></i>Resolved</span>';
  if (t.status === 'ended') return '<span class="pill pill-grey">Ended</span>';
  if (t.status === 'pending') return '<span class="pill pill-warn"><i data-lucide="triangle-alert" class="i14"></i>' + escapeHtml(t.reason || 'To resolve') + '</span>';
  return '<span class="pill pill-channel">Open</span>';
}
function bubbleHtml(m){
  if (m.attachment){
    return '<div class="bubble me"><div style="display:flex;gap:10px;align-items:center">'
      + '<i data-lucide="file-text" class="i20"></i><div><p class="t-small" style="margin:0;font-weight:700">' + escapeHtml(m.attachment.name) + '</p>'
      + '<p class="t-caption" style="margin:2px 0 0;color:rgba(255,255,255,.8)">' + formatSize(m.attachment.size) + '</p></div></div></div>';
  }
  return '<div class="bubble ' + (m.mine ? 'me' : 'them') + '">' + escapeHtml(m.text) + '</div>';
}
function formatSize(b){
  if (b == null) return '';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function threadMatches(t){
  if (msgFilter === 'important') return t.important;
  if (msgFilter === 'pending') return t.status === 'pending';
  if (msgFilter === 'resolved') return t.status === 'resolved';
  return true;
}
async function loadThreads(){
  const data = await (await fetch('/api/messages')).json();
  threads = data.threads;
  renderThreadList();
}
function renderThreadList(){
  const list = threads.filter(threadMatches);
  document.getElementById('threadList').innerHTML = list.length ? list.map(t =>
    '<div class="msg-thread' + (activeThread === t.id ? ' active' : '') + '" onclick="openThread(' + t.id + ')" onkeydown="if(event.key===\'Enter\')openThread(' + t.id + ')" tabindex="0" role="button" aria-label="Chat with ' + escapeHtml(t.name) + '">'
    + '<div class="avatar" style="' + avatarStyle(t.name) + ';width:44px;height:44px;font-size:15px">' + escapeHtml(t.initials) + '</div>'
    + '<div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:2px"><span class="t-body" style="font-weight:700">' + escapeHtml(t.name) + '</span><span class="t-caption">' + escapeHtml(t.time) + '</span></div>'
    + '<p class="t-small" style="margin:0 0 8px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escapeHtml(t.preview) + '</p>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">'
    + (t.important ? '<span class="pill pill-warn"><i data-lucide="star" class="i14"></i>Important</span>' : '')
    + statusPill(t)
    + ((t.reminder && t.status === 'pending') ? '<span class="t-caption">Reminder: ' + escapeHtml(t.reminder) + '</span>' : '')
    + '</div></div>'
    + '<button class="icon-btn star-btn' + (t.important ? ' star-on' : '') + '" style="width:30px;height:30px;flex-shrink:0" onclick="toggleImportant(' + t.id + ',event)" title="Mark as important"><i data-lucide="star" class="i16"></i></button>'
    + '</div>').join('')
    : '<div class="card card-pad" style="text-align:center"><p class="t-h2" style="margin:0">No chats here</p><p class="t-small" style="color:var(--muted);margin:4px 0 0">Try a different filter.</p></div>';
  refreshIcons();
}
function openThread(id){
  activeThread = id;
  const t = threads.find(x => x.id === id);
  if (!t) return;
  renderThreadList();
  const ended = t.status === 'ended';
  document.getElementById('threadView').innerHTML =
    '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">'
    + '<div class="avatar" style="' + avatarStyle(t.name) + ';width:48px;height:48px;font-size:16px">' + escapeHtml(t.initials) + '</div>'
    + '<div style="flex:1;min-width:0"><p class="t-h2" style="margin:0;font-size:15px">' + escapeHtml(t.name) + '</p>'
    + '<p class="t-caption" style="margin:2px 0 0;display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
    + '<span class="dot" style="background:' + (t.online ? 'var(--mint)' : '#c3cad7') + ';width:7px;height:7px"></span>'
    + (t.online ? 'Online' : 'Offline')
    + '<span>·</span><i data-lucide="map-pin" class="i14"></i>' + escapeHtml(t.location || 'Not shared') + '</p></div>'
    + (ended ? '' : '<div style="display:flex;gap:4px;flex-shrink:0">'
      + '<button class="icon-btn bordered" onclick="startCall(\'voice\')" title="Voice call"><i data-lucide="phone" class="i18"></i></button>'
      + '<button class="icon-btn bordered" onclick="startCall(\'video\')" title="Video call"><i data-lucide="video" class="i18"></i></button>'
      + '<button class="icon-btn bordered star-btn' + (t.important ? ' star-on' : '') + '" onclick="toggleImportant()" title="Mark as important"><i data-lucide="star" class="i18"></i></button>'
      + '<button class="icon-btn bordered" onclick="openResolve()" title="Update status"><i data-lucide="check-check" class="i18"></i></button>'
      + '<button class="icon-btn bordered" onclick="openModal(\'endModal\')" title="End session"><i data-lucide="phone-off" class="i18"></i></button>'
      + '</div>') + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px">' + statusPill(t)
    + ((t.status === 'pending' && t.reminder) ? '<span class="pill pill-channel"><i data-lucide="bell-ring" class="i14"></i>Reminder: ' + escapeHtml(t.reminder) + '</span>' : '')
    + (t.important ? '<span class="pill pill-warn"><i data-lucide="star" class="i14"></i>Important</span>' : '') + '</div>'
    + '<div id="bubbles">' + t.messages.map(bubbleHtml).join('') + '</div>';
  document.getElementById('replyRow').style.display = ended ? 'none' : 'flex';
  document.getElementById('endedBanner').style.display = ended ? 'block' : 'none';
  const scroller = document.getElementById('bubbles');
  if (scroller) scroller.scrollTop = scroller.scrollHeight;
  refreshIcons();
}
async function toggleImportant(id, ev){
  if (ev) ev.stopPropagation();
  const tid = id ?? activeThread;
  const t = threads.find(x => x.id === tid);
  if (!t) return;
  const res = await (await fetch('/api/messages/' + tid + '/important', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ important: !t.important }) })).json();
  t.important = res.important;
  renderThreadList();
  if (activeThread === tid) openThread(tid);
  toast(res.important ? 'Marked as important' : 'Removed from important');
}
/* Resolve workflow: resolved chats auto-label green; pending chats carry a reason + reminder */
function openResolve(){
  const t = threads.find(x => x.id === activeThread);
  if (!t) return;
  resolveDraft = { threadId: t.id, outcome: t.status === 'pending' ? 'pending' : 'resolved', reason: t.reason || REASONS[0], reminder: t.reminder || REMINDERS[0] };
  syncResolveModal();
  openModal('resolveModal');
}
function setOutcome(o){ resolveDraft.outcome = o; syncResolveModal(); }
function syncResolveModal(){
  document.getElementById('outcomeResolved').classList.toggle('active', resolveDraft.outcome === 'resolved');
  document.getElementById('outcomePending').classList.toggle('active', resolveDraft.outcome === 'pending');
  document.getElementById('pendingFields').style.display = resolveDraft.outcome === 'pending' ? 'block' : 'none';
  document.getElementById('resolveReasonLabel').textContent = resolveDraft.reason;
  document.getElementById('resolveReminderLabel').textContent = resolveDraft.reminder;
  document.querySelectorAll('[data-resolve-reason]').forEach(b => b.classList.toggle('active', b.dataset.resolveReason === resolveDraft.reason));
  document.querySelectorAll('[data-reminder]').forEach(b => b.classList.toggle('active', b.dataset.reminder === resolveDraft.reminder));
}
function saveResolve(btn){
  withLoading(btn, async () => {
    const d = resolveDraft;
    const payload = d.outcome === 'resolved' ? { status: 'resolved' } : { status: 'pending', reason: d.reason, reminder: d.reminder };
    const res = await (await fetch('/api/messages/' + d.threadId + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json();
    Object.assign(threads.find(x => x.id === d.threadId), res.thread);
    closeModal('resolveModal');
    renderThreadList(); openThread(d.threadId);
    toast(d.outcome === 'resolved' ? 'Chat marked as resolved' : 'Follow-up logged');
  }, 'Saving');
}
function confirmEndChat(btn){
  withLoading(btn, async () => {
    const res = await (await fetch('/api/messages/' + activeThread + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ended' }) })).json();
    Object.assign(threads.find(x => x.id === activeThread), res.thread);
    closeModal('endModal'); renderThreadList(); openThread(activeThread);
    toast('Chat session ended');
  }, 'Ending');
}
function reopenChat(btn){
  withLoading(btn, async () => {
    const res = await (await fetch('/api/messages/' + activeThread + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'open' }) })).json();
    Object.assign(threads.find(x => x.id === activeThread), res.thread);
    renderThreadList(); openThread(activeThread);
    toast('Chat reopened');
  }, 'Reopening');
}
/* Calls: live session view with timer */
function startCall(type){
  const t = threads.find(x => x.id === activeThread);
  if (!t || t.status === 'ended') return;
  const av = document.getElementById('callAvatar');
  av.textContent = t.initials;
  const a = avatarFor(t.name); av.style.background = a.bg; av.style.color = a.fg;
  document.getElementById('callName').textContent = t.name;
  document.getElementById('callType').textContent = type === 'video' ? 'Video call' : 'Voice call';
  document.getElementById('callStatus').textContent = 'Ringing…';
  document.getElementById('muteBtn').classList.remove('on');
  document.getElementById('speakerBtn').classList.remove('on');
  openModal('callModal');
  let secs = 0;
  callTimers.forEach(clearTimeout); callTimers = [];
  if (callClock){ clearInterval(callClock); callClock = null; }
  callTimers.push(setTimeout(() => {
    const st = document.getElementById('callStatus');
    if (st) st.textContent = '00:00';
    callClock = setInterval(() => {
      secs++;
      const m = String(Math.floor(secs / 60)).padStart(2, '0'), s = String(secs % 60).padStart(2, '0');
      const el = document.getElementById('callStatus');
      if (el) el.textContent = m + ':' + s;
    }, 1000);
  }, 2500));
}
function endCall(){
  callTimers.forEach(clearTimeout); callTimers = [];
  if (callClock){ clearInterval(callClock); callClock = null; }
  closeModal('callModal');
  toast('Call ended');
}
/* Emoji + attachments */
function initEmoji(){
  document.getElementById('emojiGrid').innerHTML = EMOJIS.map(e => '<button class="emoji-opt" onclick="insertEmoji(\'' + e + '\')">' + e + '</button>').join('');
}
function insertEmoji(e){
  const inp = document.getElementById('replyInput');
  inp.value += e; inp.focus(); closeAllDrops();
}
function initResolveOptions(){
  document.getElementById('reasonOptions').innerHTML = REASONS.map(r => '<button class="dropdown-item" data-resolve-reason="' + r + '"><span class="dropdown-ic"><i data-lucide="' + REASON_ICONS[r] + '" class="i16"></i></span><span class="dropdown-label">' + r + '</span><i data-lucide="check" class="i16 dropdown-check"></i></button>').join('');
  document.getElementById('reminderOptions').innerHTML = REMINDERS.map(r => '<button class="dropdown-item" data-reminder="' + r + '"><span class="dropdown-ic"><i data-lucide="' + REMINDER_ICONS[r] + '" class="i16"></i></span><span class="dropdown-label">' + r + '</span><i data-lucide="check" class="i16 dropdown-check"></i></button>').join('');
  refreshIcons();
}
function triggerAttach(){
  const t = threads.find(x => x.id === activeThread);
  if (activeThread == null || !t){ toast('Select a conversation first', true); return; }
  if (t.status === 'ended'){ toast('Reopen the chat to send files', true); return; }
  document.getElementById('attachInput').click();
}
async function handleAttach(input){
  const file = input.files && input.files[0];
  input.value = '';
  if (!file || activeThread == null) return;
  toast('Uploading ' + file.name + '…');
  const fd = new FormData(); fd.append('file', file);
  const res = await (await fetch('/api/messages/' + activeThread + '/attach', { method: 'POST', body: fd })).json();
  const t = threads.find(x => x.id === activeThread);
  t.messages.push(res.message); t.preview = 'Sent an attachment'; t.time = 'Now';
  renderThreadList(); openThread(activeThread);
  toast('File attached');
}
function sendReply(btn){
  const inp = document.getElementById('replyInput');
  const text = inp.value.trim();
  if (!text || activeThread == null) return;
  withLoading(btn, async () => {
    inp.value = '';
    await fetch('/api/messages/' + activeThread + '/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    const t = threads.find(x => x.id === activeThread);
    t.messages.push({ mine: true, text }); t.preview = text;
    openThread(activeThread); renderThreadList();
    toast('Reply sent');
  }, 'Send');
}
function sendMessage(btn){
  withLoading(btn, async () => {
    const to = document.getElementById('cmTo').value.trim() || 'New contact';
    const body = document.getElementById('cmBody').value.trim() || 'Hello!';
    const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, body }) });
    const data = await res.json();
    threads.unshift(data.thread); activeThread = data.thread.id;
    closeModal('composeModal');
    document.getElementById('cmTo').value = ''; document.getElementById('cmBody').value = '';
    if (!loaded.messages){ loaded.messages = true; }
    go('messages'); renderThreadList(); openThread(activeThread);
    toast('Message sent to ' + to);
  }, 'Sending');
}

/* ---------------- Notifications ---------------- */
async function fetchNotifs(){
  const data = await (await fetch('/api/notifications')).json();
  notifs = data.notifications;
  updateBadge();
}
function updateBadge(){
  const unread = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('bellBadge');
  badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none';
  document.getElementById('sideDot').style.display = unread ? 'block' : 'none';
}
function notifItem(n){
  return '<button class="notif-row' + (n.read ? '' : ' unread') + '" onclick="openNotification(' + n.id + ')">'
    + '<span class="dropdown-ic" style="width:44px;height:44px;background:' + n.bg + ';color:' + n.fg + '"><i data-lucide="' + n.icon + '" class="i20"></i></span>'
    + '<span style="flex:1;min-width:0"><span class="t-body" style="display:block;font-weight:' + (n.read ? '500' : '700') + '">' + escapeHtml(n.title) + '</span>'
    + '<span class="t-caption" style="display:block;margin-top:4px">' + escapeHtml(n.body) + ' · ' + escapeHtml(n.time) + '</span></span>'
    + (n.read ? '' : '<span class="dot unread" style="margin-top:10px"></span>')
    + '<i data-lucide="chevron-right" class="i18 notif-go"></i></button>';
}
function bellItem(n){
  return '<button class="dropdown-item" onclick="closeAllDrops();go(\'notifications\')">'
    + '<span class="dropdown-ic" style="background:' + n.bg + ';color:' + n.fg + '"><i data-lucide="' + n.icon + '" class="i16"></i></span>'
    + '<span class="dropdown-label">' + escapeHtml(n.title) + '<small>' + escapeHtml(n.body) + ' · ' + escapeHtml(n.time) + '</small></span>'
    + (n.read ? '' : '<span class="dot unread"></span>') + '</button>';
}
function renderBellList(){
  const items = notifs.slice(0, 4);
  const unread = notifs.filter(n => !n.read).length;
  document.getElementById('bellSub').textContent = unread ? unread + ' unread update' + (unread === 1 ? '' : 's') : 'You are all caught up';
  document.getElementById('bellList').innerHTML = items.length ? items.map(bellItem).join('')
    : '<p class="t-small" style="padding:12px 10px;color:var(--muted)">You are all caught up.</p>';
  refreshIcons();
}
function renderNotifPage(){
  const pool = notifFilter === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const fresh = pool.filter(n => n.group === 'new'), old = pool.filter(n => n.group !== 'new');
  const unread = notifs.filter(n => !n.read).length;
  document.getElementById('notifSub').textContent = unread ? unread + ' unread notification' + (unread === 1 ? '' : 's') : 'You are all caught up.';
  let html = '';
  if (fresh.length) html += '<p class="notif-section">Newest</p>' + fresh.map(notifItem).join('');
  if (old.length) html += '<p class="notif-section">Older</p>' + old.map(notifItem).join('');
  document.getElementById('notifList').innerHTML = html
    || '<div class="empty-state"><div class="empty-ic"><i data-lucide="bell-off" class="i24"></i></div><p class="t-h2" style="margin:0">Nothing here</p></div>';
  refreshIcons();
}
/* Actionable notifications: open the exact page, record or chat */
async function openNotification(id){
  const res = await (await fetch('/api/notifications/' + id + '/read', { method: 'POST' })).json();
  const n = res.notification;
  const ix = notifs.findIndex(x => x.id === id);
  if (ix > -1) notifs[ix].read = true;
  updateBadge(); renderBellList();
  if (loaded.notifications) renderNotifPage();
  const t = n.target || {};
  if (t.thread){
    if (!loaded.messages) loaded.messages = true;
    go('messages');
    if (!threads.length) await loadThreads();
    openThread(t.thread);
  } else if (t.record){
    go('dashboard');
    await gotoRecord(t.record, t.tab);
  } else if (t.tab){
    go('dashboard');
    setTab(t.tab);
  } else if (t.page){
    go(t.page);
  }
  toast(n.title + ' opened');
}
function setTab(tab){
  state.tab = tab; state.page = 1;
  document.querySelectorAll('#page-dashboard [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  load();
}
async function gotoRecord(name, tab){
  if (tab){
    state.tab = tab; state.page = 1;
    document.querySelectorAll('#page-dashboard [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  }
  state.q = name; state.page = 1;
  document.getElementById('quickSearch').value = name;
  const ts = document.getElementById('topSearch');
  if (ts) ts.value = name;
  await load();
  const hit = state.cache.find(r => r.name.toLowerCase() === name.toLowerCase()) || state.cache[0];
  if (hit) openDetail(hit.id, 'main');
}
function markAllRead(btn){
  withLoading(btn, async () => {
    await fetch('/api/notifications/read', { method: 'POST' });
    notifs.forEach(n => n.read = true);
    updateBadge(); renderNotifPage(); renderBellList();
    toast('All notifications marked as read');
  }, 'Updating');
}

/* ---------------- Settings ---------------- */
const TOGGLES = [
  { id: 'email', label: 'Email notifications', sub: 'Policy updates and renewals', on: true },
  { id: 'sms', label: 'SMS alerts', sub: 'Urgent claim updates', on: false },
  { id: 'digest', label: 'Weekly digest', sub: 'A Monday summary of activity', on: true },
];
const THEMES = [
  { name: 'Sky', value: '#0091ff' }, { name: 'Sapphire', value: '#0033aa' },
  { name: 'Mint', value: '#00c897' }, { name: 'Violet', value: '#7c3aed' },
];
const ROLE_ICONS = { 'Broker': 'briefcase', 'Administrator': 'shield-check', 'Claims handler': 'clipboard-list', 'Viewer': 'eye' };
let settingsRole = 'Broker';
const NQ_CHANNEL_ICONS = { 'Branch': 'building-2', 'Website': 'globe', 'Referral': 'handshake', 'Boomerang': 'message-circle', 'SAP': 'database', 'Social media': 'thumbs-up' };
let nqChannel = 'Branch';
function setNqChannel(name){
  if (!NQ_CHANNEL_ICONS[name]) return;
  nqChannel = name;
  document.getElementById('nqChannelLabel').textContent = name;
  document.getElementById('nqChannelIconWrap').innerHTML = '<i data-lucide="' + NQ_CHANNEL_ICONS[name] + '" class="i16"></i>';
  document.querySelectorAll('[data-nqchannel]').forEach(b => b.classList.toggle('active', b.dataset.nqchannel === name));
  refreshIcons();
}
function setRole(name){
  if (!ROLE_ICONS[name]) return;
  settingsRole = name;
  document.getElementById('roleLabel').textContent = name;
  document.getElementById('roleIconWrap').innerHTML = '<i data-lucide="' + ROLE_ICONS[name] + '" class="i16"></i>';
  document.querySelectorAll('[data-role]').forEach(b => b.classList.toggle('active', b.dataset.role === name));
  refreshIcons();
}
function initSettings(){
  const saved = JSON.parse(localStorage.getItem('sapphire-settings') || '{}');
  if (saved.name) document.getElementById('setName').value = saved.name;
  if (saved.email) document.getElementById('setEmail').value = saved.email;
  setRole(saved.role || 'Broker');
  (saved.toggles || TOGGLES).forEach(t => { const f = TOGGLES.find(x => x.id === t.id); if (f) f.on = !!t.on; });
  renderToggles();
  document.getElementById('themeRow').innerHTML = THEMES.map(t =>
    '<button class="swatch' + ((saved.accent || '#0091ff') === t.value ? ' selected' : '') + '" data-theme="' + t.value + '" style="--c:' + t.value + '">'
    + '<span class="swatch-dot"><i data-lucide="check" class="i16 swatch-check"></i></span>' + t.name + '</button>').join('');
  refreshIcons();
}
function renderToggles(){
  document.getElementById('settingsToggles').innerHTML = TOGGLES.map(t =>
    '<div class="flex items-center justify-between" style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--line)">'
    + '<div><p class="t-body" style="margin:0;font-weight:600">' + t.label + '</p><p class="t-caption" style="margin:2px 0 0">' + t.sub + '</p></div>'
    + '<button class="toggle' + (t.on ? ' on' : '') + '" data-toggle="' + t.id + '" role="switch" aria-checked="' + t.on + '"></button></div>').join('');
}
function saveSettings(btn){
  withLoading(btn, async () => {
    localStorage.setItem('sapphire-settings', JSON.stringify({
      name: document.getElementById('setName').value, email: document.getElementById('setEmail').value,
      role: settingsRole, toggles: TOGGLES,
      accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    }));
    toast('Settings saved');
  }, 'Saving');
}
function resetSettings(){
  localStorage.removeItem('sapphire-settings');
  document.getElementById('setName').value = 'Tal Hassal';
  document.getElementById('setEmail').value = 'tal.hassal@sapphire.co';
  setRole('Broker');
  TOGGLES.forEach(t => t.on = t.id !== 'sms');
  document.documentElement.style.setProperty('--accent', '#0091ff');
  renderToggles(); toast('Settings reset');
}

/* ---------------- Help / FAQ ---------------- */
const FAQS = [
  { q: 'How do I create a new quote?', a: 'Select New quote anywhere in the app, fill in the customer name, channel and ID number, then select Create quote. It appears in recent activity immediately.' },
  { q: 'How does quick search work?', a: 'Type any part of a name, reference number, ID number or channel. Results filter as you type across quotes, policies and leads.' },
  { q: 'What do the channel filters do?', a: 'Use Filter to narrow the list to one source such as Branch, Website, Referral, Boomerang, SAP or Social media. Select All channels to clear it.' },
  { q: 'How do I open a claim?', a: 'Select New claim in the top bar, enter the customer name and a short description, then select Open claim.' },
  { q: 'Can I sort the activity table?', a: 'Yes. Select a column heading or use the Sort button to order by name or by date opened, ascending or descending.' },
  { q: 'Where do I manage notifications?', a: 'Open the bell icon for a preview, or visit the Notifications page to filter and mark everything as read.' },
];
function initFaq(){ renderFaq(''); document.getElementById('faqSearch').addEventListener('input', e => renderFaq(e.target.value)); }
function renderFaq(q){
  q = (q || '').toLowerCase();
  const list = FAQS.filter(f => !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  document.getElementById('faqList').innerHTML = list.length ? list.map((f, i) =>
    '<div class="faq-item' + (i === 0 ? ' open' : '') + '"><button class="faq-q" onclick="this.parentElement.classList.toggle(\'open\')">'
    + escapeHtml(f.q) + '<i data-lucide="chevron-down" class="i18 faq-chev"></i></button><div class="faq-a"><p>' + escapeHtml(f.a) + '</p></div></div>').join('')
    : '<div class="card card-pad" style="text-align:center"><p class="t-h2" style="margin:0">No articles match your search</p></div>';
  refreshIcons();
}

/* ---------------- Modals / drawer / nav ---------------- */
function openModal(id){ closeAllDrops(); const el = document.getElementById(id); el.classList.remove('hidden'); el.style.display = 'flex'; document.body.style.overflow = 'hidden'; refreshIcons(); const f = el.querySelector('input'); if (f) setTimeout(() => f.focus(), 60); }
function closeModal(id){ const el = document.getElementById(id); el.classList.add('hidden'); el.style.display = 'none'; document.body.style.overflow = ''; }
function submitQuote(btn){
  withLoading(btn, async () => {
    const name = document.getElementById('nqName').value.trim() || 'New customer';
    const channel = nqChannel;
    const id_number = document.getElementById('nqId').value.trim() || '9311160103084';
    const data = await (await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, channel, id_number }) })).json();
    closeModal('quoteModal');
    document.getElementById('nqName').value = ''; document.getElementById('nqId').value = '';
    state.tab = 'all'; state.page = 1; state.q = '';
    document.getElementById('quickSearch').value = ''; document.getElementById('topSearch').value = '';
    document.querySelectorAll('#page-dashboard [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === 'all'));
    go('dashboard'); await load(); await fetchNotifs(); renderBellList();
    if (loaded.notifications) renderNotifPage();
    toast('Quote created for ' + data.row.name);
  }, 'Creating');
}
function submitClaim(btn){
  withLoading(btn, async () => {
    const name = document.getElementById('ncName').value.trim() || 'customer';
    await fetch('/api/claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    closeModal('claimModal'); document.getElementById('ncName').value = ''; document.getElementById('ncDesc').value = '';
    await fetchNotifs(); renderBellList(); if (loaded.notifications) renderNotifPage();
    toast('Claim opened for ' + name);
  }, 'Opening');
}
function signOut(){ closeModal('signoutModal'); toast('Signed out (demo session)'); }
function openDetail(id, list){
  const pool = list === 'policies' ? policyState.cache : list === 'clients' ? clientsCache.flatMap(c => c.records || []) : state.cache;
  const r = pool.find(x => x.id === id);
  if (!r){ toast('Record not found', true); return; }
  const initials = r.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('drawerBody').innerHTML =
    '<div class="flex items-center gap-3" style="display:flex;gap:12px;align-items:center;margin-bottom:8px">'
    + '<div class="avatar" style="' + avatarStyle(r.name) + ';font-size:18px;width:56px;height:56px">' + escapeHtml(initials) + '</div>'
    + '<div><p class="t-h2" style="margin:0">' + escapeHtml(r.name) + '</p><p class="t-caption" style="margin:2px 0 0">' + cap(r.type) + ' · ' + escapeHtml(r.number) + '</p></div></div>'
    + '<div style="margin:12px 0">' + pill(r.type) + '</div>'
    + [['Date opened', r.date], ['Channel', r.channel], ['ID number', r.id_number], ['Reference no.', r.number]]
      .map(([k, v]) => '<div class="flex justify-between" style="display:flex;justify-content:space-between;padding:12px 0;border-top:1px solid var(--line);font-size:14px"><span style="color:var(--muted)">' + k + '</span><span style="font-weight:600">' + escapeHtml(v) + '</span></div>').join('')
    + '<div class="flex gap-2" style="display:flex;gap:8px;margin-top:16px"><button class="btn btn-ghost" style="flex:1" onclick="toast(\'Record shared\')"><i data-lucide="share-2" class="i16"></i> Share</button>'
    + '<button class="btn btn-primary" style="flex:1" onclick="messageClient(\'' + escapeHtml(r.name) + '\');closeDrawer();"><i data-lucide="message-square-text" class="i16"></i> Message</button></div>';
  const d = document.getElementById('drawer');
  d.classList.remove('hidden'); d.style.display = 'block'; refreshIcons();
}
function closeDrawer(){ const d = document.getElementById('drawer'); d.classList.add('hidden'); d.style.display = 'none'; }
function toggleSidebar(){
  const open = document.body.classList.toggle('side-open');
  document.getElementById('collapseBtn').style.transform = open ? 'rotate(180deg)' : '';
  document.getElementById('collapseBtn').title = open ? 'Collapse sidebar' : 'Expand sidebar';
}
function toggleNav(force){
  const open = force !== undefined ? force : !document.body.classList.contains('nav-open');
  document.body.classList.toggle('nav-open', open);
}
function toggleMobileSearch(){
  const box = document.getElementById('topSearchBox');
  box.classList.toggle('mobile-open');
  if (box.classList.contains('mobile-open')) box.querySelector('input').focus();
}

/* ---------------- Global click delegation ---------------- */
let searchTimer;
function setQ(v){ state.q = v; state.page = 1; clearTimeout(searchTimer); searchTimer = setTimeout(load, 280); }
document.getElementById('quickSearch')?.addEventListener('input', e => {
  document.getElementById('clearSearch').classList.toggle('hidden', !e.target.value);
  setQ(e.target.value);
});
document.getElementById('quickSearch')?.addEventListener('keydown', e => { if (e.key === 'Enter'){ state.page = 1; load(); } });
document.getElementById('topSearch')?.addEventListener('input', e => {
  document.getElementById('quickSearch').value = e.target.value;
  document.getElementById('clearSearch').classList.toggle('hidden', !e.target.value);
  setQ(e.target.value);
});
document.getElementById('searchBtn')?.addEventListener('click', e => { state.page = 1; withLoading(e.currentTarget, load, 'Searching'); });
document.getElementById('clearSearch')?.addEventListener('click', () => {
  document.getElementById('quickSearch').value = ''; document.getElementById('topSearch').value = '';
  document.getElementById('clearSearch').classList.add('hidden'); setQ('');
});
document.getElementById('policySearch')?.addEventListener('input', e => { policyState.q = e.target.value; policyState.page = 1; clearTimeout(searchTimer); searchTimer = setTimeout(loadPolicies, 280); });
document.getElementById('clientSearch')?.addEventListener('input', e => renderClients(e.target.value));
document.getElementById('replyInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendReply(); });
document.getElementById('agentChatInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') sendAgentMessage(); });

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab){
    document.querySelectorAll('#page-dashboard [data-tab]').forEach(b => b.classList.remove('active'));
    tab.classList.add('active'); state.tab = tab.dataset.tab; state.page = 1; load(); return;
  }
  const th = e.target.closest('th.sortable');
  if (th){
    const k = th.dataset.sort;
    if (state.sort === k) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
    else { state.sort = k; state.dir = 'asc'; }
    state.page = 1; syncSortLabel(); load(); return;
  }
  const so = e.target.closest('[data-sort-opt]');
  if (so){
    const [s, d] = so.dataset.sortOpt.split('-');
    state.sort = s; state.dir = d; state.page = 1; syncSortLabel(); closeAllDrops(); load(); return;
  }
  const pg = e.target.closest('#pager [data-page]');
  if (pg){
    const v = pg.dataset.page;
    if (v === 'prev') state.page = Math.max(1, state.page - 1);
    else if (v === 'next') state.page = Math.min(state.pages, state.page + 1);
    else state.page = +v;
    load(); return;
  }
  const pg2 = e.target.closest('#policyPager [data-page]');
  if (pg2){
    const v = pg2.dataset.page;
    if (v === 'prev') policyState.page = Math.max(1, policyState.page - 1);
    else if (v === 'next') policyState.page = Math.min(policyState.pages, policyState.page + 1);
    else policyState.page = +v;
    loadPolicies(); return;
  }
  const ch = e.target.closest('[data-channel]');
  if (ch){
    state.channel = ch.dataset.channel; state.page = 1;
    document.querySelectorAll('[data-channel-list] .dropdown-item').forEach(b => b.classList.toggle('active', b === ch));
    closeAllDrops(); load();
    toast(state.channel === 'all' ? 'Showing all channels' : 'Filtered by ' + state.channel);
    return;
  }
  const chip = e.target.closest('[data-chip]');
  if (chip){
    document.querySelectorAll('[data-chip]').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    const map = { id: 'ID number', lead: 'Lead ID', quote: 'Quote number', policy: 'Policy number' };
    toast('Search mode: ' + map[chip.dataset.chip]);
    document.getElementById('quickSearch').focus(); return;
  }
  const rec = e.target.closest('[data-recent]');
  if (rec){
    state.tab = rec.dataset.recent === 'quote' ? 'quotes' : 'policies';
    document.querySelectorAll('#page-dashboard [data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
    state.page = 1; load(); return;
  }
  const nav = e.target.closest('[data-nav]');
  if (nav){ go(nav.dataset.nav); return; }
  const tg = e.target.closest('[data-toggle]');
  if (tg){
    const t = TOGGLES.find(x => x.id === tg.dataset.toggle);
    t.on = !t.on; tg.classList.toggle('on', t.on); tg.setAttribute('aria-checked', t.on);
    toast(t.label + (t.on ? ' on' : ' off')); return;
  }
  const thm = e.target.closest('[data-theme]');
  if (thm){
    document.documentElement.style.setProperty('--accent', thm.dataset.theme);
    document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('selected', b === thm));
    toast('Accent updated'); return;
  }
  const nf = e.target.closest('[data-notif-filter]');
  if (nf){
    notifFilter = nf.dataset.notifFilter;
    document.getElementById('notifFilterLabel').textContent = notifFilter === 'all' ? 'All' : 'Unread';
    document.querySelectorAll('[data-notif-filter]').forEach(b => b.classList.toggle('active', b === nf));
    closeAllDrops(); renderNotifPage(); return;
  }
  const rl = e.target.closest('[data-role]');
  if (rl){ setRole(rl.dataset.role); closeAllDrops(); toast('Role set to ' + rl.dataset.role); return; }
  const mf = e.target.closest('[data-msg-filter]');
  if (mf){
    msgFilter = mf.dataset.msgFilter;
    document.querySelectorAll('[data-msg-filter]').forEach(c => c.classList.toggle('selected', c === mf));
    renderThreadList(); return;
  }
  const rr = e.target.closest('[data-resolve-reason]');
  if (rr){ resolveDraft.reason = rr.dataset.resolveReason; syncResolveModal(); closeAllDrops(); return; }
  const rm = e.target.closest('[data-reminder]');
  if (rm){ resolveDraft.reminder = rm.dataset.reminder; syncResolveModal(); closeAllDrops(); return; }
  const nc = e.target.closest('[data-nqchannel]');
  if (nc){ setNqChannel(nc.dataset.nqchannel); closeAllDrops(); return; }
});
function syncSortLabel(){
  const map = { 'name-asc': 'Name', 'name-desc': 'Name Z–A', 'date-desc': 'Newest', 'date-asc': 'Oldest' };
  document.getElementById('sortLabel').textContent = map[state.sort + '-' + state.dir] || 'Name';
  document.querySelectorAll('[data-sort-opt]').forEach(b => b.classList.toggle('active', b.dataset.sortOpt === state.sort + '-' + state.dir));
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape'){ closeAllDrops(); ['quoteModal','claimModal','composeModal','signoutModal'].forEach(closeModal); closeDrawer(); toggleNav(false); }
});

/* ---------------- Agent chat: team list, DM, file share, ping/ring ---------------- */
const AGENTS = [
  { id: 1, name: 'Sarah Mitchell', initials: 'SM', role: 'Senior broker', online: true },
  { id: 2, name: 'James Carter', initials: 'JC', role: 'Claims handler', online: true },
  { id: 3, name: 'Lerato Mokoena', initials: 'LM', role: 'Underwriter', online: true },
  { id: 4, name: 'David Osei', initials: 'DO', role: 'Senior broker', online: true },
  { id: 5, name: 'Priya Nair', initials: 'PN', role: 'Policy admin', online: true },
  { id: 6, name: 'Tom Basson', initials: 'TB', role: 'IT support', online: true },
];
let activeAgent = null, agentMessages = {};

function renderAgentList(){
  document.getElementById('agentList').innerHTML = AGENTS.map(a =>
    '<button class="agent-row' + (activeAgent === a.id ? ' active' : '') + '" onclick="openAgentChat(' + a.id + ')">'
    + '<span class="avatar" style="' + avatarStyle(a.name) + ';width:36px;height:36px;font-size:12px">' + escapeHtml(a.initials) + '</span>'
    + '<span style="flex:1;min-width:0;text-align:left"><span class="t-small" style="display:block;font-weight:700;font-size:12.5px">' + escapeHtml(a.name) + '</span>'
    + '<span class="t-caption" style="display:block;font-size:10.5px;margin-top:1px">' + escapeHtml(a.role) + '</span></span>'
    + '<span class="dot" style="background:' + (a.online ? 'var(--mint)' : '#c3cad7') + ';width:7px;height:7px;flex-shrink:0" title="' + (a.online ? 'Online' : 'Offline') + '"></span>'
    + '</button>').join('');
  refreshIcons();
}
function openAgentChat(id){
  activeAgent = id;
  const a = AGENTS.find(x => x.id === id);
  renderAgentList();
  const av = document.getElementById('agentChatAvatar');
  if (av){ av.textContent = a.initials; const st = avatarStyle(a.name); av.style.background = st.match(/background:(.*?);/)?.[1] || 'rgba(0,145,255,.12)'; av.style.color = st.match(/color:(.*?);/)?.[1] || '#0063b8'; }
  document.getElementById('agentChatView').style.display = 'none';
  const msgs = document.getElementById('agentChatMessages');
  msgs.style.display = 'flex';
  msgs.innerHTML = (agentMessages[id] || []).map(m => agentBubbleHtml(m)).join('')
    || '<div style="text-align:center;padding:24px"><p class="t-small" style="color:var(--muted);margin:0">No messages yet — say hi to ' + escapeHtml(a.name) + '.</p></div>';
  msgs.scrollTop = msgs.scrollHeight;
  const inp = document.getElementById('agentChatInput');
  if (inp) inp.focus();
}
function agentBubbleHtml(m){
  if (m.attachment){
    return '<div class="bubble me"><div style="display:flex;gap:10px;align-items:center">'
      + '<i data-lucide="file-text" class="i20"></i><div><p class="t-small" style="margin:0;font-weight:700">' + escapeHtml(m.attachment.name) + '</p>'
      + '<p class="t-caption" style="margin:2px 0 0;color:rgba(255,255,255,.8)">' + formatSize(m.attachment.size) + '</p></div></div></div>';
  }
  if (m.ping){
    return '<div class="bubble ' + (m.mine ? 'me' : 'them') + '" style="display:flex;gap:8px;align-items:center"><i data-lucide="bell-ring" class="i16"></i><span>' + escapeHtml(m.text) + '</span></div>';
  }
  return '<div class="bubble ' + (m.mine ? 'me' : 'them') + '">' + escapeHtml(m.text) + '</div>';
}
function sendAgentMessage(btn){
  const inp = document.getElementById('agentChatInput');
  const text = (inp.value || '').trim();
  if (!text || !activeAgent) return;
  withLoading(btn, async () => {
    inp.value = '';
    agentMessages[activeAgent] = agentMessages[activeAgent] || [];
    agentMessages[activeAgent].push({ mine: true, text });
    openAgentChat(activeAgent);
    toast('Message sent');
  }, 'Sending');
}
function triggerAgentAttach(){
  if (!activeAgent){ toast('Pick an agent first', true); return; }
  document.getElementById('agentAttachInput').click();
}
async function handleAgentAttach(input){
  const file = input.files && input.files[0];
  input.value = '';
  if (!file || !activeAgent) return;
  toast('Uploading ' + file.name + '...');
  agentMessages[activeAgent] = agentMessages[activeAgent] || [];
  agentMessages[activeAgent].push({ mine: true, attachment: { name: file.name, size: file.size } });
  openAgentChat(activeAgent);
  toast('File shared');
}
function pingAgent(){
  if (!activeAgent){ toast('Pick an agent first', true); return; }
  const a = AGENTS.find(x => x.id === activeAgent);
  agentMessages[activeAgent] = agentMessages[activeAgent] || [];
  agentMessages[activeAgent].push({ mine: true, ping: true, text: 'Pinged you for assistance' });
  openAgentChat(activeAgent);
  toast('Ping sent to ' + a.name);
}
function ringAgent(){
  if (!activeAgent){ toast('Pick an agent first', true); return; }
  const a = AGENTS.find(x => x.id === activeAgent);
  if (!a.online){ toast(a.name + ' is offline', true); return; }
  toast('Ringing ' + a.name + '...');
  setTimeout(() => toast(a.name + ' is joining'), 1500);
}

/* ---------------- Boot ---------------- */
bindDrops();
syncSortLabel();
paintUserAvatars();
initEmoji();
initResolveOptions();
renderAgentList();
renderRoute();
fetchNotifs().then(() => { renderBellList(); if (loaded.notifications) renderNotifPage(); });
refreshIcons();
