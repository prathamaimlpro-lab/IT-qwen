/**
 * ================================================================
 *  AE3301 · FIX LAYER · truncation-safe runtime patches
 * ----------------------------------------------------------------
 *  A · ⋯ menu hijack: capture-phase listener owns the post menu,
 *      with a verified server round-trip for DELETE.
 *  B · FAB discipline: the + button exists ONLY on #/community.
 *  C · Menu hygiene: closes on scroll / outside tap / navigation.
 * ================================================================
 */
(() => {
  'use strict';

  const TK   = 'ae3301:token';
  const isCommunity = () => (location.hash || '').replace('#', '') === '/community';
  const send = (path, body) =>
    fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body) })
      .then(r => r.json()).catch(() => ({ err: 'network' }));

  /* ---------- B · FAB only inside Community ---------- */
  function syncFab() {
    const f = document.getElementById('fab');
    if (f) f.style.setProperty('display', isCommunity() ? 'grid' : 'none', 'important');
  }
  addEventListener('hashchange', () => setTimeout(syncFab, 60));
  setInterval(syncFab, 900);

  /* ---------- A · anchored post menu ---------- */
  let menu = null;
  const close = () => { if (menu) { menu.remove(); menu = null; } };

  function place(anchor) {
    const r = anchor.getBoundingClientRect();
    const left = Math.min(Math.max(12, r.right - 220), innerWidth - 232);
    let top = r.bottom + 8;
    if (top + 170 > innerHeight) top = Math.max(10, r.top - 150);
    menu.style.left = left + 'px';
    menu.style.top  = top + 'px';
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
        close();
        if (d && d.ok) {
          const card = document.querySelector('[data-post="' + id + '"]');
          if (card) {
            card.style.transition = 'all .3s';
            card.style.opacity = '0';
            card.style.transform = 'translateX(-24px)';
            setTimeout(() => card.remove(), 300);
          }
        }
      }
    };
  }

  /* Capture-phase hijack: runs BEFORE any older/broken handler. */
  document.addEventListener('click', e => {
    const m = e.target.closest('[data-more]');
    if (m && isCommunity()) {
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      open(m, m.dataset.more);
    } else if (!e.target.closest('.x-pop')) {
      close();
    }
  }, true);

  /* ---------- C · menu hygiene ---------- */
  addEventListener('scroll', close, true);
  addEventListener('resize', close);
})();
