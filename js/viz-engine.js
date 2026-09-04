/**
 * AE3301 · VIZ ENGINE v3 — pro dashboard
 * controls deck · chart · inspector(metrics+code tabs) · legend
 * settings modal(size/speed/custom) · fullscreen · shortcuts
 */
(() => {
  'use strict';
  const R = new Map();
  window.AE3301_VIZ = { register: (k, f) => R.set(k, f), open: id => location.hash = '#/visualize/' + id };
  let CTL = null;
  addEventListener('keydown', e => {
    if (!CTL || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); CTL.play(); }
    if (e.key === 'ArrowRight') CTL.step();
    if (e.key === 'r' || e.key === 'R') CTL.reset();
    if (e.key === 'Escape') CTL.fsOff();
  });

  function mount(root, trace) {
    const steps = trace.steps;
    let cur = 0, playing = false, pct = 60, timer = null, size = (trace.state0 || steps[0].state.arr || []).length || 0;
    const codes = Object.assign({}, trace.codes || {}); if (trace.code) codes.Pseudo = trace.code;
    let lang = Object.keys(codes)[0];
    root.innerHTML =
      '<style>.vizwrap{display:grid;gap:12px;grid-template-columns:230px 1fr 280px}@media(max-width:1100px){.vizwrap{grid-template-columns:1fr}}.vizfs{position:fixed!important;inset:0;z-index:15000;background:var(--bg0,#0b0b0b);overflow:auto;padding:14px}.vizfs .vizwrap{grid-template-columns:1fr 1fr}</style>' +
      '<div class="vizwrap" data-w>' +
      '<div class="card" style="padding:14px"><div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-sm" data-c="play">▶ Play</button><button class="btn btn-ghost btn-sm" data-c="step">⏭ Step</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="reset">↺ Reset</button><button class="btn btn-ghost btn-sm" data-c="rand">🎲 Randomize</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="set">⚙ Settings</button><button class="btn btn-ghost btn-sm" data-c="fs">⛶ Full</button></div>' +
      '<p class="mono" style="margin:12px 0 4px;font-size:.75rem;color:var(--dim)">Size: <b data-size style="color:var(--ink)"></b> · Speed: <b data-sp style="color:var(--ink)"></b></p>' +
      (trace.meta ? '<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0"><span class="mono" style="font-size:.65rem;border:1px solid var(--line);border-radius:99px;padding:4px 10px">Time ' + trace.meta.time + '</span><span class="mono" style="font-size:.65rem;border:1px solid var(--line);border-radius:99px;padding:4px 10px">Space ' + trace.meta.space + '</span></div>' : '') +
      '<div data-legend style="margin-top:10px"></div>' +
      '<p class="mono faint" style="font-size:.63rem;margin-top:12px">Space play/pause · → step · R reset · ESC exit full</p></div>' +
      '<div class="card" style="padding:14px"><div data-banner class="mono" style="border-left:3px solid var(--acc);padding:6px 10px;background:rgba(240,86,28,.08);border-radius:0 8px 8px 0;min-height:1.7em;margin-bottom:10px"></div>' +
      '<div data-stage></div>' +
      '<div style="display:flex;gap:10px;align-items:center;margin-top:10px"><input type="range" data-c="scrub" min="0" max="' + (steps.length - 1) + '" value="0" style="flex:1"><span class="mono faint" data-cnt></span></div></div>' +
      '<div class="card" style="padding:14px"><b>Inspector</b>' +
      '<div class="mono" style="margin:10px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px;color:var(--dim)">' +
      '<span>Comparisons<br><b data-m="c" style="font-size:1.25rem;color:var(--ink)">0</b></span>' +
      '<span>Swaps<br><b data-m="s" style="font-size:1.25rem;color:var(--ink)">0</b></span>' +
      '<span>Pass<br><b data-m="p" style="color:var(--ink)">1</b></span><span>Step<br><b data-m="t" style="color:var(--ink)">1</b></span></div>' +
      '<div class="mono faint" style="font-size:.66rem;max-height:64px;overflow:auto" data-arr></div>' +
      '<div style="margin-top:12px"><b style="font-size:.8rem">Code</b><div data-tabs style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0"></div>' +
      '<pre data-code style="font-family:var(--fm);font-size:.72rem;line-height:1.55;overflow:auto;max-height:250px;margin:0"></pre></div></div></div>';
    const q = s => root.querySelector(s);
    const stage = q('[data-stage]');
    const renderer = R.get(trace.kind);
    if (!renderer) { stage.innerHTML = '<p class="empty-note">No renderer</p>'; return; }
    renderer.init(stage, trace);
    q('[data-legend]').innerHTML = (trace.legend || [['#f5c518', 'Comparing'], ['#e05252', 'Swapping'], ['#2ecc71', 'Sorted / found'], ['#f28c28', 'Current / key'], ['#6a4dc4', 'Mid'], ['#8a94a6', 'Unsorted']])
      .map(l => '<div style="display:flex;gap:8px;align-items:center;margin:5px 0"><i style="width:12px;height:12px;border-radius:3px;background:' + l[0] + '"></i><span style="font-size:.75rem;color:var(--dim)">' + l[1] + '</span></div>').join('');

    function metrics() {
      let c = 0, s = 0, p = 1;
      for (let i = 0; i <= cur; i++) { const h = steps[i].state.hi || {}; const v = Object.values(h);
        if (v.includes('compare')) c++; if (v.includes('swap')) s++; if (steps[i].state.ptrs && steps[i].state.ptrs.i != null) p = Math.max(p, steps[i].state.ptrs.i + 1); }
      return { c, s, p };
    }
    function renderCode() {
      q('[data-tabs]').innerHTML = Object.keys(codes).map(k => '<button class="btn btn-sm ' + (k === lang ? 'btn-primary' : 'btn-ghost') + '" data-l="' + k + '">' + k + '</button>').join('');
      q('[data-tabs]').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { lang = b.dataset.l; renderCode(); });
      const src = codes[lang] || '';
      q('[data-code]').innerHTML = src.split('\n').map((l, i) => '<div data-ln="' + i + '" style="padding:1px 8px;border-radius:4px;white-space:pre;color:var(--dim)">' + (l || ' ') + '</div>').join('');
      highlight();
    }
    function highlight() {
      q('[data-code]').querySelectorAll('[data-ln]').forEach(el => el.style.background = '');
      const t = steps[cur];
      if (lang === 'Pseudo' && typeof t.line === 'number') { const el = q('[data-code]').querySelector('[data-ln="' + t.line + '"]'); if (el) { el.style.background = 'var(--acc)'; el.style.color = '#0b0b0b'; } }
    }
    function draw() {
      const t = steps[cur];
      renderer.draw(stage, trace, t.state);
      q('[data-banner]').textContent = '→ ' + (t.note || '');
      q('[data-cnt]').textContent = (cur + 1) + ' / ' + steps.length;
      q('[data-c="scrub"]').value = cur;
      const m = metrics();
      q('[data-m="c"]').textContent = m.c; q('[data-m="s"]').textContent = m.s; q('[data-m="p"]').textContent = m.p; q('[data-m="t"]').textContent = cur + 1;
      q('[data-arr]').textContent = 'arr: [' + t.state.arr.join(', ') + ']';
      q('[data-size]').textContent = t.state.arr.length; q('[data-sp]').textContent = pct + '%';
      highlight();
    }
    const delay = () => 1500 - pct * 14;
    function stop() { playing = false; clearInterval(timer); q('[data-c="play"]').textContent = '▶ Play'; }
    function play() { if (playing) return stop(); playing = true; q('[data-c="play"]').textContent = '⏸ Pause'; timer = setInterval(() => { if (cur < steps.length - 1) { cur++; draw(); } else stop(); }, delay()); }
    function regen(n, custom) {
      stop();
      const nt = custom && trace.custom ? trace.custom(custom) : trace.regenerate ? trace.regenerate(n) : null;
      if (nt) mount(root, nt); 
    }
    root.querySelectorAll('[data-c]').forEach(el => {
      const c = el.dataset.c;
      if (c === 'play') el.onclick = play;
      if (c === 'step') el.onclick = () => { stop(); cur = Math.min(steps.length - 1, cur + 1); draw(); };
      if (c === 'reset') el.onclick = () => { stop(); cur = 0; draw(); };
      if (c === 'rand') el.onclick = () => regen(size || 8);
      if (c === 'fs') el.onclick = () => root.classList.toggle('vizfs');
      if (c === 'scrub') el.oninput = () => { stop(); cur = +el.value; draw(); };
      if (c === 'set') el.onclick = () => settings();
    });
    function settings() {
      const ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:16000;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px';
      ov.innerHTML = '<div class="card" style="width:min(430px,94vw);padding:20px"><b style="font-size:1.05rem">Visualizer Settings</b>' +
        '<p class="mono" style="margin:14px 0 6px;font-size:.75rem">Array Size: <b data-v></b></p><input type="range" data-s="n" min="5" max="40" value="' + (size || 8) + '" style="width:100%">' +
        '<p class="mono" style="margin:14px 0 6px;font-size:.75rem">Speed: <b data-v2></b></p><input type="range" data-s="v" min="0" max="100" value="' + pct + '" style="width:100%">' +
        '<p class="mono" style="margin:14px 0 6px;font-size:.75rem">Custom Array (comma-separated)</p>' +
        '<div style="display:flex;gap:8px"><input class="code-box" data-s="arr" placeholder="e.g., 5,2,8,1,9" style="flex:1;min-height:44px;color:var(--ink)"><button class="btn btn-primary btn-sm" data-s="go">Set</button></div>' +
        '<div style="margin-top:14px;text-align:right"><button class="btn btn-ghost btn-sm" data-s="x">Close</button></div></div>';
      document.body.appendChild(ov);
      const nn = ov.querySelector('[data-s="n"]'), vv = ov.querySelector('[data-s="v"]');
      const paint = () => { ov.querySelector('[data-v]').textContent = nn.value; ov.querySelector('[data-v2]').textContent = vv.value + '%'; };
      paint();
      nn.oninput = () => { paint(); size = +nn.value; regen(size); };
      vv.oninput = () => { paint(); pct = +vv.value; if (playing) { stop(); play(); } };
      ov.querySelector('[data-s="go"]').onclick = () => { const a = ov.querySelector('[data-s="arr"]').value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x)); if (a.length > 1) { size = a.length; regen(0, a); ov.remove(); } };
      ov.querySelector('[data-s="x"]').onclick = () => ov.remove();
      ov.onclick = e => { if (e.target === ov) ov.remove(); };
    }
    CTL = { play, step: () => { stop(); cur = Math.min(steps.length - 1, cur + 1); draw(); }, reset: () => { stop(); cur = 0; draw(); }, fsOff: () => root.classList.remove('vizfs') };
    renderCode(); draw(); play();
  }
  window.AE3301_VIZ_ENGINE = { mount };
})();
