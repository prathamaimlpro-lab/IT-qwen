/**
 * ================================================================
 *  AE3301 · LIVE LAYER
 *  1 · Polls /api/posts every 5s → feed re-renders on change
 *      (live across tabs, localhost AND cloudflared tunnel).
 *  2 · 🔗 PAIR chip: origins don't share logins (localhost vs tunnel
 *      are separate browser storages). Logged-in device shows a
 *      5-minute code; the other device types it → instant login.
 * ================================================================
 */
(() => {
  'use strict';
  const TK = 'ae3301:token', NM = 'ae3301:name';

  /* ---------- 1 · live polling ---------- */
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
    } catch (_) { /* offline → ignore */ }
  }
  setInterval(poll, 5000);
  addEventListener('hashchange', () => { last = ''; });

  /* ---------- 2 · pairing ---------- */
  function pairSheet() {
    const token = localStorage.getItem(TK);
    const s = document.createElement('div');
    s.className = 'x-pop';
    s.style.cssText = 'left:50%;transform:translateX(-50%);bottom:14px;width:min(420px,92vw);top:auto';
    if (token) {
      s.innerHTML = '<p>Pair another device</p>' +
        '<p class="mono" id="pc" style="font-size:1.5rem;letter-spacing:.3em;color:var(--acc)">…</p>' +
        '<p style="opacity:.6;font-size:.75rem">On the other device tap 🔗 and type this code. Valid 5 minutes.</p>' +
        '<button data-x="1">Close</button>';
      document.body.appendChild(s);
      fetch('/api/pair', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
        .then(r => r.json())
        .then(d => { const e = s.querySelector('#pc'); if (e) e.textContent = d.code || 'error'; });
    } else {
      s.innerHTML = '<p>Pair from another device</p>' +
        '<input id="pin" class="code-box" style="min-height:44px;width:100%;color:#f4f4f2" placeholder="6-letter code" autocapitalize="characters">' +
        '<button data-go="1" style="margin-top:8px">JOIN</button><button data-x="1">Cancel</button>';
      document.body.appendChild(s);
      s.querySelector('[data-go]').onclick = async () => {
        const d = await (await fetch('/api/pairlogin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: s.querySelector('#pin').value }) })).json();
        if (d.token) { localStorage.setItem(TK, d.token); localStorage.setItem(NM, d.name || 'Explorer'); location.reload(); }
        else s.querySelector('#pin').placeholder = 'wrong or expired code';
      };
    }
    s.addEventListener('click', e => { if (e.target.closest('[data-x]')) s.remove(); });
  }

  fetch('/api/ping').then(r => {
    if (!r.ok) return;
    const bar = document.querySelector('.hdr-chips');
    if (bar && !document.querySelector('[data-pair]')) {
      const b = document.createElement('button');
      b.className = 'chip'; b.dataset.pair = '1'; b.style.cursor = 'pointer'; b.textContent = '🔗';
      b.onclick = pairSheet;
      bar.prepend(b);
    }
  }).catch(() => {});
})();
