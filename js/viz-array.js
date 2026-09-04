/**
 * AE3301 · ARRAY / LIST / HEAP RENDERER
 * State: { arr, hi: {idx: color}, ptrs: {label: idx} }
 * Persistent DOM: bars are keyed by index → smooth transitions, no flicker
 */
(() => {
  'use strict';
  const C = { compare: 'var(--gold,#d4a24e)', swap: 'var(--red,#d43d2a)', sorted: 'var(--green,#1f8a34)',
              mid: 'var(--vio,#6a4dc4)', key: 'var(--acc,#f0561c)', found: 'var(--green,#1f8a34)',
              dim: '#3a3a3a', bar: '#8a867e' };
  function init(stage) {
    stage.innerHTML =
      '<div style="display:flex;gap:4px;align-items:flex-end;height:180px" data-bars></div>' +
      '<div class="mono" style="margin-top:10px;min-height:1.4em;font-size:.75rem;color:var(--dim)" data-ptrs></div>';
  }
  function draw(stage, trace, state) {
    const bars = stage.querySelector('[data-bars]');
    const max = Math.max(...state.arr, 1);
    const existing = {};
    bars.querySelectorAll('[data-idx]').forEach(b => existing[b.dataset.idx] = b);
    state.arr.forEach((v, i) => {
      let b = existing[i];
      if (!b) {
        b = document.createElement('div'); b.dataset.idx = i;
        b.style.cssText = 'flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px;transition:transform .3s';
        bars.appendChild(b);
      }
      const col = C[(state.hi && state.hi[i]) || 'bar'];
      const h = Math.round(v / max * 130) + 16;
      b.innerHTML =
        '<span class="mono" style="font-size:.6rem;color:var(--dim)">' + v + '</span>' +
        '<div style="width:100%;height:' + h + 'px;background:' + col + ';border-radius:4px 4px 0 0;transition:height .3s,background .3s"></div>';
    });
    Object.keys(existing).forEach(k => { if (+k >= state.arr.length) existing[k].remove(); });
    stage.querySelector('[data-ptrs]').innerHTML = state.ptrs
      ? Object.entries(state.ptrs).map(([k, v]) => '<span style="margin-right:14px;color:var(--acc)">' + k + '=' + v + '</span>').join('')
      : '';
  }
  window.AE3301_VIZ.register('array', { init, draw });
})();
