/**
 * ================================================================
 *  AE3301 · FIX LAYER v2 · single-file, self-contained
 * ----------------------------------------------------------------
 *  0 · Injects its own critical CSS (no external file needed).
 *  1 · FAB (+) exists ONLY on #/community.
 *  2 · Post media capped (X-style 420px crop) — existing + future.
 *  3 · Scroll performance: blurred orbs removed, bars promoted
 *      to their own GPU layers → no shutter on fast scroll.
 *  4 · ⋯ post menu with VERIFIED delete: failures are displayed
 *      in the menu, never swallowed silently.
 * ================================================================
 */
(() => {
  'use strict';

  const TK = 'ae3301:token';

  /* ---------- 0 · critical CSS, injected at runtime ---------- */
  document.head.insertAdjacentHTML('beforeend', `<style>
    *{-webkit-tap-highlight-color:transparent!important}
    #app::before,#app::after,body::after{display:none!important}
    body::before{position:absolute!important}
    .sidebar,.topbar,.bottomnav{transform:translateZ(0);backface-visibility:hidden}
    [data-post] img,[data-post] video{max-height:420px!important;object-fit:cover!important;object-position:top!important;border-radius:12px}
    .x-pop{position:fixed;z-index:10000;width:230px;background:var(--panel,#161616);
      color:var(--ink,#f2f0ea);border:1px solid var(--line,rgba(244,244,242,.14));
      border-radius:16px;box-shadow:0 18px 45px rgba(0,0,0,.4);padding:8px}
    .x-pop button{width:100%;min-height:44px;border:0;background:transparent;color:inherit;
      display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;
      font-weight:700;text-align:left;cursor:pointer}
    .x-pop button:active{background:var(--panel2,#1b1b1b)}
    .x-pop .danger{color:var(--red,#d43d2a)}
    .x-pop p{margin:6px 10px 10px;font-weight:800}
  </style>`);

  const isCommunity = () => (location.hash || '').replace('#', '') === '/community';
  const send = (path, body) =>
    fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body) })
      .then(r => r.json()).catch(() => ({ err: 'network / old server — restart: python3 server.py' }));

  /* ---------- 1 · FAB only inside Community ---------- */
  function syncFab() {
    const f = document.getElementById('fab');
    if (f) f.style.setProperty('display', isCommunity() ? 'grid' : 'none', 'important');
  }
  addEventListener('hashchange', () => setTimeout(syncFab, 60));
  setInterval(syncFab, 900);

  /* ---------- 2 · media cap (present + future posts) ---------- */
  function capMedia() {
    document.querySelectorAll('[data-post] img,[data-post] video').forEach(el => {
      el.style.maxHeight = '420px';
      el.style.objectFit = 'cover';
      el.style.objectPosition = 'top';
    });
  }
  const view = document.getElementById('view');
  if (view) new MutationObserver(capMedia).observe(view, { childList: true, subtree: true });
  capMedia();

  /* ---------- 3 · anchored post menu, verified delete ---------- */
  let menu = null;
  const close = () => { if (menu) { menu.remove(); menu = null; } };

  function place(anchor) {
    const r = anchor.getBoundingClientRect();
    const left = Math.min(Math.max(12, r.right - 230), innerWidth - 242);
    let top = r.bottom + 8;
    if (top + 180 > innerHeight) top = Math.max(10, r.top - 160);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function collapse(card) {
    card.style.transition = 'all .3s';
    card.style.opacity = '0';
    card.style.transform = 'translateX(-24px)';
    setTimeout(() => card.remove(), 300);
  }

  function open(anchor, id) {
    close();
    menu = document.createElement('div');
    menu.className = 'x-pop';
    menu.innerHTML =
      '<button data-a="copy">⧉ Copy text</button>' +
      '<button data-a="del" class="danger">🗑 Delete post</button>' +
      '<button data-a="x">Cancel</button>';
    document.body.appendChild(menu);
    place(anchor);

    menu.onclick = async e => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      e.stopPropagation();
      const a = b.dataset.a;

      if (a === 'x') { close(); return; }

      if (a === 'copy') {
        const t = anchor.closest('[data-post]')?.querySelector('p')?.textContent || '';
        try { await navigator.clipboard.writeText(t); } catch (_) {}
        close(); return;
      }

      if (a === 'del') {
        menu.innerHTML =
          '<p>Delete this post?</p>' +
          '<button data-a="yes" class="danger">Delete</button>' +
          '<button data-a="x">Cancel</button>';
        place(anchor); return;
      }

      if (a === 'yes') {
        menu.innerHTML = '<p style="opacity:.6">Deleting…</p>';
        const d = await send('/api/delpost', { token: localStorage.getItem(TK), post: id });
        if (d && d.ok) {
          close();
          const card = document.querySelector('[data-post="' + id + '"]');
          if (card) collapse(card);
        } else {
          /* NEVER silent: show the exact server reason */
          menu.innerHTML =
            '<p class="danger">✗ ' + (d && d.err ? d.err : 'failed') + '</p>' +
            '<button data-a="x">Close</button>';
        }
      }
    };
  }

  /* Capture-phase hijack: owns ⋯ before any older handler. */
  document.addEventListener('click', e => {
    const m = e.target.closest('[data-more]');
    if (m && isCommunity()) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      open(m, m.dataset.more);
    } else if (!e.target.closest('.x-pop')) {
      close();
    }
  }, true);

  addEventListener('scroll', close, true);
  addEventListener('resize', close);
})();
