/**
 * AE3301 · MATRIX RENDERER — DP tables with row/col labels
 * state: { rows, cl, rl, hi{'r_c':color}, arr?, arrHi? }
 */
(() => {
  'use strict';
  const C = { base: '#242424', compare: '#f5c518', current: '#f28c28', sorted: '#2ecc71', found: '#2ecc71', swap: '#e05252', mid: '#6a4dc4', dim: '#1a1a1a', bar: '#8a94a6' };
  function init(s) { s.innerHTML = '<div data-m style="overflow:auto"></div>'; }
  function draw(s, t, st) {
    let h = '<div style="display:grid;grid-template-columns:auto repeat(' + st.cl.length + ',34px);gap:4px;justify-content:center;min-width:max-content;margin:0 auto">';
    h += '<span></span>' + st.cl.map(c => '<span class="mono" style="font-size:.6rem;color:var(--dim);text-align:center">' + c + '</span>').join('');
    st.rows.forEach((row, r) => {
      h += '<span class="mono" style="font-size:.6rem;color:var(--dim);align-self:center;padding-right:6px;white-space:nowrap">' + (st.rl[r] != null ? st.rl[r] : r) + '</span>';
      row.forEach((v, c) => {
        const k = (st.hi && st.hi[r + '_' + c]) || '';
        const col = C[k || 'base'];
        h += '<div style="height:30px;display:grid;place-items:center;border-radius:6px;background:' + col + ';color:' + (k ? '#0b0b0b' : 'var(--ink)') + ';font:700 .7rem var(--fm);' + (k ? 'box-shadow:0 0 10px ' + col + '88;' : '') + 'transition:background .2s">' + v + '</div>';
      });
    });
    h += '</div>';
    if (st.arr) h += '<div style="display:flex;gap:4px;justify-content:center;margin-top:12px;flex-wrap:wrap">' + st.arr.map((v, i) => {
      const k = (st.arrHi && st.arrHi[i]) || '';
      const col = C[k || 'bar'];
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><div style="min-width:34px;padding:6px 8px;border-radius:6px;background:' + col + ';color:' + (k ? '#0b0b0b' : '#fff') + ';font:700 .7rem var(--fm)">' + v + '</div><span class="mono" style="font-size:.58rem;color:var(--dim)">' + i + '</span></div>';
    }).join('') + '</div>';
    s.querySelector('[data-m]').innerHTML = h;
  }
  window.AE3301_VIZ.register('matrix', { init, draw });
})();
