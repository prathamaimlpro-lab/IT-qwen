/**
 * AE3301 · VIZ PAGE — #/viz/<id> detail pages · sidebar "Visualizations"
 * catalog buttons & learn chips now OPEN the detail page (no inline scroll)
 */
(() => {
  'use strict';
  const CAT = window.AE3301_CATALOG || [];
  const entry = id => CAT.find(c => c.id === id) || (window.AE3301_PRACTICAL || []).find(p => p.id === id);
  const gen = id => (window.AE3301_GEN || {})[id] || (window.AE3301_DP || {})[id] || ((window.AE3301_PRACTICAL || []).find(p => p.id === id) || {}).gen;

  function mount() {
    const h = (location.hash || '').replace('#', '');
    if (h.startsWith('/visualize/')) { location.replace('#/viz/' + h.split('/')[2]); return; }
    const side = document.querySelector('.side-nav');
    if (side && !side.querySelector('[data-viznav]')) {
      const a = document.createElement('a');
      a.className = 'nav-link'; a.dataset.viznav = '1'; a.dataset.nav = 'visualize'; a.href = '#/visualize';
      a.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z"/></svg><span>Visualizations</span>';
      side.appendChild(a);
    }
    document.querySelectorAll('[data-nav]').forEach(x => x.classList.toggle('active', x.dataset.nav === 'visualize' && (h === '/visualize' || h.startsWith('/viz/'))));
    document.querySelectorAll('[data-run]').forEach(b => { b.onclick = () => { location.hash = '#/viz/' + b.dataset.run; }; });
    document.querySelectorAll('[data-prun]').forEach(b => { b.onclick = () => { location.hash = '#/viz/' + b.dataset.prun; }; });
    if (!h.startsWith('/viz/')) return;
    const id = h.split('/')[2]; const g = gen(id); const e = entry(id);
    if (!g) return;
    const tr = g(); tr.desc = e && e.desc;
    window.AE3301_VIZ_ENGINE.mount(document.getElementById('view'), tr);
    document.title = (e ? e.name : id) + ' · AE3301';
    scrollTo(0, 0);
  }
  addEventListener('hashchange', () => setTimeout(mount, 10));
  setTimeout(mount, 80);
})();
