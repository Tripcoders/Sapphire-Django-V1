/* Sapphire login interactions: password toggle, caps-lock hint, spinner, toasts. */
(function () {
  if (window.lucide) lucide.createIcons();

  // Password visibility toggle
  var toggle = document.getElementById('togglePw');
  var pw = document.getElementById('id_password');
  if (toggle && pw) {
    toggle.addEventListener('click', function () {
      var show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      toggle.innerHTML = '<i data-lucide="' + (show ? 'eye-off' : 'eye') + '" class="i18"></i>';
      toggle.title = show ? 'Hide password' : 'Show password';
      if (window.lucide) lucide.createIcons();
      pw.focus();
    });
    // Caps-lock hint
    var hint = document.getElementById('capsHint');
    pw.addEventListener('keyup', function (e) {
      var on = e.getModifierState && e.getModifierState('CapsLock');
      if (hint) hint.classList.toggle('hidden', !on);
    });
  }

  // Button spinner on submit (mirrors withLoading in the dashboard app)
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('[type="submit"]');
      if (!btn || btn.classList.contains('loading')) return;
      var label = btn.textContent.trim();
      btn.classList.add('loading');
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span><span>Signing in</span>';
      if (btn.id === 'resetBtn') btn.innerHTML = '<span class="btn-spinner"></span><span>Sending</span>';
      else if (label && label !== 'Sign in') btn.innerHTML = '<span class="btn-spinner"></span><span>' + label + '</span>';
    });
  });

  // Auto-dismiss server toasts
  document.querySelectorAll('[data-toast]').forEach(function (el) {
    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 350);
    }, 3200);
  });

  // Info tooltip for the username field
  var info = document.getElementById('userInfo');
  if (info) info.addEventListener('click', function () {
    alert('Use your Standard Bank C number (e.g. C123456) or your SB email address.');
  });
})();
