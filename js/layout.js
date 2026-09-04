/**
 * ================================================================
 *  AE3301 · LAYOUT ENGINE
 *  · device classes on <body data-l> (xs…xl), live on resize/rotate
 *  · toolbar overflow resolver: buttons that don't fit collapse
 *    into a ⋯ sheet automatically (topbar + any [data-flow])
 *  · refresh API for modules
 * ================================================================
 */
(() => {
  'use strict';
  const B = document.body;
  const MQ = [
    ['xs', '(max-width:479px)'],
    ['sm', '(min-width:480px) and (max-width:767px)'],
    ['md', '(min-width:768px) and (max-width:1023px)'],
    ['lg', '(min-width:1024px) and (max-width:1439px)'],
    ['xl', '(min-width:1440px)']
  ];
  function detect() {
    B.dataset.l = 'lg';
    for (const [k, q] of MQ) if (matchMedia(q).matches) { B.dataset.l = k; break; }
  }

  /* ---------- overflow resolver ---------- */
  function flowEl(el) {
    if (el._pop) { while (el._pop.firstChild) el.appendChild(el._pop.firstChild); el._pop.remove(); el._pop = null; }
    const old = el.querySelector('[data-morebtn]'); if (old) old.remove();
    const kids = [...el.children];
    kids.forEach(k => k.style.display = '');
    if (el.scrollWidth <= el.clientWidth + 2) return;
    const hidden = [];
    for (let i = kids.length - 1; i >= 0; i--) {
      hidden.unshift(kids[i]); kids[i].style.display = 'none';
      if (el.scrollWidth <= el.clientWidth + 2) break;
    }
    if (!hidden.length) return;
    const btn = document.createElement('button');
    btn.className = 'chip'; btn.dataset.morebtn = '1'; btn.textContent = '⋯'; btn.style.cursor = 'pointer';
    el.appendChild(btn);
    const pop = document.createElement('div'); pop.className = 'flow-pop';
    hidden.forEach(h => pop.appendChild(h));
    el._pop = pop;
    btn.onclick = e => {
      e.stopPropagation();
      if (pop.parentElement) { pop.remove(); return; }
      const r = btn.getBoundingClientRect();
      pop.style.top = (r.bottom + 8) + 'px';
      pop.style.right = Math.max(8, innerWidth - r.right) + 'px';
      document.body.appendChild(pop);
    };
  }
  function flows() { document.querySelectorAll('[data-flow], .hdr-chips').forEach(flowEl); }

  document.addEventListener('click', e => {
    if (!e.target.closest('.flow-pop') && !e.target.closest('[data-morebtn]'))
      document.querySelectorAll('.flow-pop').forEach(p => p.remove());
  }, true);

  let raf = 0;
  function refresh() { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { detect(); flows(); }); }
  addEventListener('resize', refresh);
  addEventListener('orientationchange', refresh);
  addEventListener('hashchange', () => setTimeout(refresh, 80));
  const tb = document.querySelector('.topbar'), vw = document.getElementById('view');
  if (tb) new MutationObserver(() => setTimeout(refresh, 120)).observe(tb, { childList: true, subtree: true });
  if (vw) new MutationObserver(() => setTimeout(refresh, 120)).observe(vw, { childList: true });
  window.AE_LAYOUT = { refresh };
  refresh();
})();
