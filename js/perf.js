/**
 * AE3301 · PERF — preconnect fonts + lazy-load every image (event-driven)
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
})();
