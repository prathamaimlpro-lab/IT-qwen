/**
 * ================================================================
 *  AE3301 · FIX LAYER v3 · single-file, self-contained
 * ----------------------------------------------------------------
 *  0 · Injects critical CSS: kills expensive blur/clip animations
 *      (scroll/transition smoothness on low-power tablets),
 *      hides the inline composer (X uses a compose sheet),
 *      caps post media, styles menus & sheet.
 *  1 · FAB (+) → Community only → opens X-style compose sheet.
 *  2 · ⋯ menu with VERIFIED delete (errors shown, never silent).
 *  3 · Media capping for present + future posts.
 * ================================================================
 */
(() => {
  'use strict';
  const TK = 'ae3301:token';

  /* ---------- 0 · critical CSS ---------- */
  document.head.insertAdjacentHTML('beforeend', `<style>
    *{-webkit-tap-highlight-color:transparent!important}
    html{scroll-behavior:auto!important}
    .page{animation:none!important}
    .page-head h1,.lesson-title{animation:none!important}
    #app::before,#app::after,body::after{display:none!important}
    body::before{position:absolute!important}
    .sidebar,.topbar,.bottomnav{transform:translateZ(0);backface-visibility:hidden}
    section:has(#c-t){display:none!important}
    [data-post] img,[data-post] video{max-height:420px!important;object-fit:cover!important;object-position:top!important;border-radius:12px}
    .x-pop,.c-sheet{position:fixed;z-index:10000;background:var(--panel,#161616);
      color:var(--ink,#f2f0ea);border:1px solid var(--line,rgba(244,244,242,.14));
      border-radius:16px;box-shadow:0 18px 45px rgba(0,0,0,.4)}
    .x-pop{width:230px;padding:8px}
    .x-pop button{width:100%;min-height:44px;border:0;background:transparent;color:inherit;
      display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;
      font-weight:700;text-align:left;cursor:pointer}
    .x-pop button:active{background:var(--panel2,#1b1b1b)}
    .x-pop .danger,.c-sheet .danger{color:var(--red,#d43d2a)}
    .x-pop p,.c-sheet p{margin:6px 10px 10px;font-weight:800}
    .c-sheet{left:50%;transform:translateX(-50%);bottom:12px;width:min(560px,94vw);padding:14px}
    .c-sheet textarea{width:100%;min-height:96px;background:#0d0d0d;color:#f4f4f2;
      border:1px solid var(--line,rgba(244,244,242,.14));border-radius:12px;padding:12px;
      font-family:var(--fm,monospace)}
    .c-sheet .row{display:flex;gap:8px;align-items:center;margin-top:10px}
  </style>`);

  const isCommunity = () => (location.hash || '').replace('#', '') === '/community';
  const send = (p, b) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
    .then(r => r.json()).catch(() => ({ err: 'network / old server — restart: python3 server.py' }));
  const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

  /* ---------- 1 · FAB → compose sheet (X-style) ---------- */
  function compose() {
    const token = localStorage.getItem(TK);
    if (!token) { location.hash = '#/community'; return; }   // shows login hint
    close();
    const s = document.createElement('div');
    s.className = 'c-sheet';
    s.innerHTML =
      '<textarea id="cs-t" placeholder="What’s happening?"></textarea>' +
      '<div id="cs-prev"></div>' +
      '<div class="row">' +
      '<label class="btn btn-ghost btn-sm" style="cursor:pointer">📎<input id="cs-f" type="file" accept="image/*,video/*" style="display:none"></label>' +
      '<span id="cs-fn" class="faint" style="font-size:.75rem"></span>' +
      '<button class="btn btn-ghost btn-sm" data-c="x" style="margin-left:auto">Cancel</button>' +
      '<button class="btn btn-primary btn-sm" data-c="go">POST</button></div>';
    document.body.appendChild(s);
    setTimeout(() => s.querySelector('#cs-t').focus(), 60);

    let media = null;
    s.querySelector('#cs-f').onchange = () => {
      const f = s.querySelector('#cs-f').files[0];
      if (!f) return;
      s.querySelector('#cs-fn').textContent = f.name;
      const r = new FileReader();
      r.onload = () => { media = { ext: f.name.split('.').pop(), data: String(r.result).split(',')[1] };
        s.querySelector('#cs-prev').innerHTML = f.type.startsWith('image')
          ? '<img src="' + r.result + '" style="max-height:80px;border-radius:10px;margin-top:8px">' : ''; };
      r.readAsDataURL(f);
    };
    s.querySelector('[data-c="x"]').onclick = () => s.remove();
    s.querySelector('[data-c="go"]').onclick = async () => {
      const t = s.querySelector('#cs-t').value;
      if (!t.trim()) return;
      const d = await send('/api/post', { token, text: t, media });
      if (d.ok) { s.remove(); rerender(); scrollTo({ top: 0 }); }
    };
  }

  function syncFab() {
    const f = document.getElementById('fab');
    if (f) f.style.setProperty('display', isCommunity() ? 'grid' : 'none', 'important');
  }
  const oldFab = document.getElementById('fab');
  if (oldFab) oldFab.onclick = compose;
  addEventListener('hashchange', () => setTimeout(syncFab, 60));
  setInterval(() => { syncFab(); const f = document.getElementById('fab'); if (f && !f.dataset.v3) { f.dataset.v3 = '1'; f.onclick = compose; } }, 900);

  /* ---------- 2 · ⋯ menu, verified delete ---------- */
  let menu = null;
  const close = () => { if (menu) { menu.remove(); menu = null; } };
  function place(a) {
    const r = a.getBoundingClientRect();
    const left = Math.min(Math.max(12, r.right - 230), innerWidth - 242);
    let top = r.bottom + 8;
    if (top + 180 > innerHeight) top = Math.max(10, r.top - 160);
    menu.style.left = left + 'px'; menu.style.top = top + 'px';
  }
  function open(anchor, id) {
    close();
    menu = document.createElement('div');
    menu.className = 'x-pop';
    menu.innerHTML = '<button data-a="copy">⧉ Copy text</button>' +
      '<button data-a="del" class="danger">🗑 Delete post</button>' +
      '<button data-a="x">Cancel</button>';
    document.body.appendChild(menu); place(anchor);
    menu.onclick = async e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      e.stopPropagation();
      const a = b.dataset.a;
      if (a === 'x') { close(); return; }
      if (a === 'copy') {
        const t = anchor.closest('[data-post]')?.querySelector('p')?.textContent || '';
        try { await navigator.clipboard.writeText(t); } catch (_) {}
        close(); return;
      }
      if (a === 'del') {
        menu.innerHTML = '<p>Delete this post?</p><button data-a="yes" class="danger">Delete</button><button data-a="x">Cancel</button>';
        place(anchor); return;
      }
      if (a === 'yes') {
        menu.innerHTML = '<p style="opacity:.6">Deleting…</p>';
        const d = await send('/api/delpost', { token: localStorage.getItem(TK), post: id });
        if (d && d.ok) {
          close();
          const card = document.querySelector('[data-post="' + id + '"]');
          if (card) { card.style.transition = 'all .3s'; card.style.opacity = '0'; card.style.transform = 'translateX(-24px)'; setTimeout(() => { card.remove(); }, 300); }
        } else {
          menu.innerHTML = '<p class="danger">✗ ' + (d && d.err ? d.err : 'failed') + '</p><button data-a="x">Close</button>';
        }
      }
    };
  }
  document.addEventListener('click', e => {
    const m = e.target.closest('[data-more]');
    if (m && isCommunity()) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); open(m, m.dataset.more); }
    else if (!e.target.closest('.x-pop') && !e.target.closest('.c-sheet')) close();
  }, true);
  addEventListener('scroll', close, true);
  addEventListener('resize', close);

  /* ---------- 3 · media caps ---------- */
  const cap = () => document.querySelectorAll('[data-post] img,[data-post] video').forEach(el => {
    el.style.maxHeight = '420px'; el.style.objectFit = 'cover'; el.style.objectPosition = 'top';
  });
  const view = document.getElementById('view');
  if (view) new MutationObserver(cap).observe(view, { childList: true, subtree: true });
  cap();
})();
