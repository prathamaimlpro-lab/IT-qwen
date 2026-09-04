/**
 * AE3301 · PERF v2 — preconnect + lazy images + streak display patch
 */
(() => {
  ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(h => {
    const l = document.createElement('link');
    l.rel = 'preconnect'; l.crossOrigin = 'anonymous'; l.href = h;
    document.head.appendChild(l);
  });

  const lz = () => document.querySelectorAll('img:not([loading])').forEach(i => { i.loading = 'lazy'; i.decoding = 'async'; });
  lz();
  new MutationObserver(lz).observe(document.body, { childList: true, subtree: true });

  /* patches "[object Object] days" on the Home dashboard */
  function fixStreak() {
    document.querySelectorAll('.kicker').forEach(k => {
      if (!/CURRENT STREAK/.test(k.textContent)) return;
      const big = k.nextElementSibling;
      if (!big || !/object Object/.test(big.textContent)) return;
      let raw = 0;
      try {
        const s = (JSON.parse(localStorage.getItem('itq2:save') || '{}').s) || {};
        raw = s.streak;
      } catch (_) {}
      let n = 0;
      if (typeof raw === 'object' && raw) {
        const v = Object.values(raw).find(x => typeof x === 'number');
        n = v || 0;
      } else n = raw || 0;
      big.innerHTML = n + '<span class="faint" style="font-size:.9rem"> days</span>';
    });
  }
  setInterval(fixStreak, 1200);
  addEventListener('hashchange', () => setTimeout(fixStreak, 150));
})();
