/**
 * ================================================================
 *  AE3301 · LIVE LAYER v3
 *  · 5s polling → live feed across tabs / localhost / tunnel
 *  · Profile → 🔐 ACCOUNT SETTINGS:
 *      🔗 pair code · 🎟️ redeem/renew API key · 🔑 change password
 * ================================================================
 */
(() => {
  'use strict';
  const TK = 'ae3301:token', NM = 'ae3301:name';
  const post = (p, b) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json()).catch(() => ({ err: 'network' }));

  /* ---------- live polling ---------- */
  let last = '';
  async function poll() {
    if (!(location.hash || '').includes('/community')) return;
    if (document.querySelector('.c-sheet,.x-pop,.overlay')) return;
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT')) return;
    try {
      const t = await (await fetch('/api/posts')).text();
      if (last && t !== last) window.dispatchEvent(new HashChangeEvent('hashchange'));
      last = t;
    } catch (_) {}
  }
  setInterval(poll, 5000);
  addEventListener('hashchange', () => { last = ''; });

  /* ---------- account settings card ---------- */
  function settings() {
    if ((location.hash || '').replace('#', '') !== '/profile') return;
    const view = document.getElementById('view');
    if (!view || document.querySelector('[data-acct]')) return;
    const token = localStorage.getItem(TK);
    const card = document.createElement('section');
    card.className = 'card'; card.dataset.acct = '1';
    card.style.cssText = 'margin-top:18px;padding:20px';
    card.innerHTML = '<div class="kicker">🔐 ACCOUNT SETTINGS</div>' +
      '<div style="display:grid;gap:14px;margin-top:12px">' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">🎟️ Redeem / renew API key</b>' +
      '<input class="code-box" data-redeem style="min-height:40px;width:170px;color:var(--ink)" placeholder="AE-XXXX-XXXX">' +
      '<button class="btn btn-primary btn-sm" data-redeemgo>REDEEM</button></div>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">🔗 Pair another device</b>' +
      (token ? '<button class="btn btn-ghost btn-sm" data-pair="show">GET CODE</button><span class="mono" data-code style="color:var(--acc);font-size:1.1rem;letter-spacing:.25em"></span>'
             : '<span class="muted" style="font-size:.75rem">log in via ☁ SYNC first</span>') + '</div>' +
      '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="flex:1">🔗 Join with a code</b>' +
      '<input class="code-box" data-pin style="min-height:40px;width:150px;color:var(--ink)" placeholder="CODE" autocapitalize="characters">' +
      '<button class="btn btn-ghost btn-sm" data-pair="join">JOIN</button></div>' +
      '<div style="border-top:1px dashed var(--line);padding-top:14px;display:grid;gap:8px"><b>🔑 Change password</b>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<input type="password" class="code-box" data-old style="min-height:40px;flex:1;color:var(--ink)" placeholder="current">' +
      '<input type="password" class="code-box" data-new style="min-height:40px;flex:1;color:var(--ink)" placeholder="new (4+)">' +
      '<button class="btn btn-primary btn-sm" data-pw>SAVE</button></div>' +
      '<p class="muted" data-msg style="font-size:.75rem"></p></div></div>';
    view.appendChild(card);
    const msg = card.querySelector('[data-msg]');

    card.querySelector('[data-redeemgo]').addEventListener('click', async () => {
      if (!token) { msg.textContent = '✗ log in first (☁ SYNC)'; return; }
      const d = await post('/api/bindkey', { token, key: card.querySelector('[data-redeem]').value.trim() });
      msg.textContent = d.ok ? '✔ key redeemed — access extended' : '✗ ' + (d.err || 'failed');
      if (d.ok) setTimeout(() => location.reload(), 700);
    });
    card.querySelector('[data-pair="show"]')?.addEventListener('click', () => {
      post('/api/pair', { token }).then(d => { card.querySelector('[data-code]').textContent = d.code || 'error'; });
    });
    card.querySelector('[data-pair="join"]').addEventListener('click', async () => {
      const d = await post('/api/pairlogin', { code: card.querySelector('[data-pin]').value });
      if (d.token) { localStorage.setItem(TK, d.token); localStorage.setItem(NM, d.name || 'Explorer'); location.reload(); }
      else msg.textContent = '✗ ' + (d.err || 'invalid code');
    });
    card.querySelector('[data-pw]').addEventListener('click', async () => {
      const d = await post('/api/changepw', { token, old: card.querySelector('[data-old]').value, new: card.querySelector('[data-new]').value });
      if (d.ok) { msg.textContent = '✔ password changed'; card.querySelector('[data-old]').value = ''; card.querySelector('[data-new]').value = ''; }
      else msg.textContent = '✗ ' + (d.err || 'failed');
    });
  }
  addEventListener('hashchange', () => setTimeout(settings, 80));
  setTimeout(settings, 80);
})();
