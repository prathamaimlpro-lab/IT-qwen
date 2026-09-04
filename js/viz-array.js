/**
 * AE3301 · ARRAY RENDERER v3 — value on top, index below, pro colors
 */
(() => {
  'use strict';
  const C = { compare: '#f5c518', swap: '#e05252', sorted: '#2ecc71', found: '#2ecc71', current: '#f28c28', key: '#f28c28', mid: '#6a4dc4', dim: '#3a3f4a', bar: '#8a94a6' };
  function init(s) { s.innerHTML = '<div data-bars style="display:flex;gap:3px;align-items:flex-end;height:220px"></div>'; }
  function draw(s, t, st) {
    const max = Math.max(...st.arr, 1);
    s.querySelector('[data-bars]').innerHTML = st.arr.map((v, i) => {
      const k = (st.hi && st.hi[i]) || '';
      const col = C[k || 'bar'];
      const glow = k ? 'box-shadow:0 0 14px ' + col + '88;' : '';
      const ptr = st.ptrs ? Object.entries(st.ptrs).filter(e => e[1] === i).map(e => e[0]).join(',') : '';
      return '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;min-width:0">' +
        '<span class="mono" style="font-size:.6rem;color:var(--ink)">' + v + '</span>' +
        '<div style="width:100%;height:' + (Math.round(v / max * 150) + 8) + 'px;background:' + col + ';border-radius:4px 4px 0 0;' + glow + 'transition:height .25s,background .25s"></div>' +
        '<span class="mono" style="font-size:.58rem;color:var(--faint)">' + i + '</span>' +
        '<span class="mono" style="font-size:.58rem;color:var(--acc);min-height:1em">' + (ptr ? '▲' + ptr : '') + '</span></div>';
    }).join('');
  }
  window.AE3301_VIZ.register('array', { init, draw });
})();
