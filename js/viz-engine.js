/**
 * AE3301 · VIZ ENGINE v5 — real fullscreen overlay (visualizedsa parity)
 * header + tall chart + controls left · numbered code + line highlight right
 */
(() => {
  'use strict';
  const R = new Map();
  window.AE3301_VIZ = { register: (k, f) => R.set(k, f), open: id => location.hash = '#/viz/' + id };
  let CTL = null;
  addEventListener('keydown', e => {
    if (!CTL || /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
    if (e.code === 'Space') { e.preventDefault(); CTL.play(); }
    if (e.key === 'ArrowRight') CTL.step();
    if (e.key === 'r' || e.key === 'R') CTL.reset();
    if (e.key === 'Escape') CTL.fs(false);
  });

  function mount(root, trace) {
    const steps = trace.steps;
    let cur = 0, playing = false, pct = 60, timer = null, ov = null;
    let size = ((steps[0].state.arr || steps[0].state.rows || []).length) || 8;
    const codes = Object.assign({}, trace.codes || {}); if (trace.code) codes.Pseudo = trace.code;
    let lang = Object.keys(codes)[0] || 'Pseudo';
    root.innerHTML =
      '<style>.vz-top{display:flex;gap:8px;align-items:center;margin:6px 0 10px}.vz-grid{display:grid;gap:14px;grid-template-columns:250px minmax(0,1fr) 290px}@media(max-width:1100px){.vz-grid{grid-template-columns:1fr}}.vz .card{padding:14px}.vz-acc>div>button{width:100%;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;color:var(--ink);font-weight:700;cursor:pointer;margin-bottom:8px}.vz-acc .body{display:none;padding:4px 4px 12px}' +
      '.vzfsov{position:fixed;inset:0;z-index:15000;background:var(--bg0,#0b0b0b);overflow:auto;padding:14px}.vzfshead{display:flex;align-items:center;gap:8px;margin-bottom:12px}.fsgrid{display:grid;gap:14px;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}@media(max-width:900px){.fsgrid{grid-template-columns:1fr}}.fsl{display:flex;flex-direction:column;gap:14px}.fsl>.card:first-child{flex:1}</style>' +
      '<div class="vz" data-vz>' +
      '<div class="vz-top" data-top><a class="btn btn-ghost btn-sm" href="#/visualize">← Back to Visualizers</a><span style="flex:1"></span>' +
      '<button class="btn btn-ghost btn-sm" data-c="share">⚯ Share</button><button class="btn btn-ghost btn-sm" data-c="fs">⛶ Full Screen + Code</button></div>' +
      '<h1 data-title style="font-family:var(--fd);font-size:1.6rem;margin:0 0 12px">' + trace.title + '</h1>' +
      '<div class="vz-grid" data-grid>' +
      '<div data-left><div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-primary btn-sm" data-c="play">▶ Play</button><button class="btn btn-ghost btn-sm" data-c="step">⏭ Step</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="reset">↺ Reset</button><button class="btn btn-ghost btn-sm" data-c="rand">🎲 Randomize</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="set">⚙ Settings</button></div>' +
      '<p class="mono" style="margin:12px 0 4px;font-size:.75rem;color:var(--dim)">Size: <b data-size style="color:var(--ink)"></b> · Speed: <b data-sp style="color:var(--ink)"></b></p>' +
      '<p class="mono faint" style="font-size:.63rem">Space Play/Pause · → Step Forward · R Reset</p></div>' +
      '<div class="card" style="margin-top:14px"><b>Legend</b>' +
      [['#f5c518', 'Comparing', 'Elements being compared'], ['#e05252', 'Swapping', 'Elements being swapped'], ['#2ecc71', 'Sorted', 'Elements in final position'], ['#8a94a6', 'Unsorted', 'Elements not yet processed']].map(l => '<div style="display:flex;gap:10px;margin:8px 0"><i style="width:14px;height:14px;border-radius:4px;background:' + l[0] + ';margin-top:2px"></i><div><b style="font-size:.8rem">' + l[1] + '</b><div class="faint" style="font-size:.7rem">' + l[2] + '</div></div></div>').join('') +
      '<div class="faint" style="font-size:.68rem;border-top:1px solid var(--line);padding-top:8px">How to read: numbers = values · bottom labels = indices · colors = operation · height = magnitude</div></div></div>' +
      '<div data-mid><div class="card"><div data-stage></div>' +
      '<div class="mono faint" style="display:flex;justify-content:space-between;font-size:.68rem;margin-top:8px"><span data-chartlbl></span><span data-maxlbl></span></div></div>' +
      '<div data-banner style="margin:10px 0;padding:10px 14px;border-radius:10px;background:var(--panel);border:1px solid var(--line);color:var(--dim);min-height:1.4em"></div>' +
      '<div data-chips style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"></div>' +
      '<div data-scrubrow style="display:flex;gap:10px;align-items:center"><input type="range" data-c="scrub" min="0" max="' + (steps.length - 1) + '" value="0" style="flex:1"><span class="mono faint" data-cnt></span></div></div>' +
      '<div data-right><div class="card"><div style="display:flex;align-items:center"><b style="flex:1">Inspector</b><span class="mono" data-stepchip style="font-size:.65rem;border:1px solid var(--line);border-radius:99px;padding:3px 9px"></span></div>' +
      '<div class="mono faint" style="display:flex;justify-content:space-between;font-size:.68rem;margin:10px 0 4px"><span>Progress</span><span data-prog></span></div>' +
      '<div style="height:6px;border-radius:99px;background:var(--line);overflow:hidden"><i data-progbar style="display:block;height:100%;background:var(--ink);width:0"></i></div>' +
      '<p class="mono faint" style="font-size:.63rem;margin:12px 0 6px">CURRENT OPERATION</p><div data-op style="font-size:.8rem;display:flex;gap:8px;align-items:center"></div>' +
      '<p class="mono faint" style="font-size:.63rem;margin:12px 0 6px">ALGORITHM METRICS</p>' +
      '<div class="mono" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--dim);font-size:.7rem"><span>Comparisons<br><b data-m="c" style="font-size:1.1rem;color:var(--ink)">0</b></span><span>Swaps<br><b data-m="s" style="font-size:1.1rem;color:var(--ink)">0</b></span><span>Pass<br><b data-m="p" style="color:var(--ink)">1</b></span><span>Efficiency<br><b data-m="e" style="color:var(--ink)">0%</b></span></div>' +
      '<p class="mono faint" style="font-size:.63rem;margin:12px 0 6px">CURRENT STEP</p><div data-note style="background:var(--panel3);border-radius:8px;padding:8px 10px;font-size:.78rem;min-height:2.2em"></div>' +
      '<p class="mono faint" style="font-size:.63rem;margin:12px 0 6px">ARRAY STATE</p><div data-arr style="background:var(--panel3);border-radius:8px;padding:8px 10px;font-family:var(--fm);font-size:.7rem;max-height:60px;overflow:auto"></div></div></div>' +
      '<div data-codecol style="display:none"><div data-opbanner class="mono" style="border-left:3px solid var(--acc);background:rgba(240,86,28,.08);padding:6px 10px;border-radius:0 8px 8px 0;margin-bottom:8px"></div>' +
      '<div data-tabs style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"></div>' +
      '<pre data-code style="font-family:var(--fm);font-size:.72rem;line-height:1.7;overflow:auto;max-height:52vh;margin:0"></pre>' +
      '<div class="mono" style="display:flex;gap:14px;margin-top:10px;font-size:.65rem;color:var(--dim)"><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f5c518"></i> Comparing</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#2ecc71"></i> Swapping</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#6a4dc4"></i> Loop</span><span style="margin-left:auto">ESC to exit</span></div></div>' +
      '</div>' +
      '<div class="vz-acc" data-acc style="margin-top:16px">' +
      '<div><button data-a="how">ⓘ How ' + trace.title + ' Works</button><div class="body" data-b="how"></div></div>' +
      '<div><button data-a="edge">⊙ Edge Cases & Examples</button><div class="body" data-b="edge"></div></div>' +
      '<div><button data-a="code">‹/› ' + trace.title + ' — code in C, C++, Java, Python & JavaScript</button><div class="body" data-b="code"></div></div></div></div>';

    const q = s => root.querySelector(s);
    const stage = q('[data-stage]');
    const stageCard = stage.closest('.card');
    const midEl = q('[data-mid]'), leftEl = q('[data-left]'), gridEl = q('[data-grid]');
    const ctlCard = leftEl.querySelector('.card');
    const accCode = q('[data-b="code"]');
    const codecol = q('[data-codecol]');
    accCode.appendChild(codecol); codecol.style.display = 'block';
    const renderer = R.get(trace.kind);
    if (!renderer) { stage.innerHTML = '<p class="empty-note">No renderer for ' + trace.kind + '</p>'; return; }
    renderer.init(stage, trace);
    q('[data-chips]').innerHTML = (trace.meta ? ['Time Complexity: ' + trace.meta.time, 'Space Complexity: ' + trace.meta.space] : []).map(t => '<span class="mono" style="border:1px solid var(--line);border-radius:99px;padding:6px 14px;font-size:.7rem">' + t + '</span>').join('');
    q('[data-b="how"]').innerHTML = '<p style="margin:8px 0;font-size:.85rem">' + (trace.desc || 'Watch the algorithm run step by step.') + '</p><b style="font-size:.8rem">How it works:</b><ol style="margin:6px 0 0 18px;font-size:.82rem;color:var(--dim)"><li>Start with the initial structure.</li><li>Apply the core operation (compare / move / relax).</li><li>Colors show exactly what touches each step.</li><li>Stop when the termination condition is met.</li></ol>';
    const sortish = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'].includes(trace.id);
    q('[data-b="edge"]').innerHTML = '<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin:8px 0">' +
      (sortish ? [['Already Sorted: [1,2,3,4,5]', 'Best case — fewest operations'], ['Reverse Sorted: [5,4,3,2,1]', 'Worst case — maximum work'], ['Duplicates: [3,1,4,1,5,9,2,6,5]', 'Stability matters here'], ['Single Element: [42]', 'Trivial — already done']] : [['Tiny input', 'Base case behaviour'], ['Large input', 'Watch complexity grow'], ['Structured input', 'Best-case patterns'], ['Random input', 'Typical average case']]).map(e => '<div style="border:1px solid var(--line);border-radius:10px;padding:12px"><b style="font-size:.8rem">' + e[0] + '</b><div class="faint" style="font-size:.72rem;margin-top:4px">' + e[1] + '</div></div>').join('') + '</div>';

    function opNow() {
      const v = Object.values(steps[cur].state.hi || {});
      return v.includes('swap') ? 'swap' : v.includes('compare') ? 'compare' : (v.includes('sorted') || v.includes('found')) ? 'sorted' : v.length ? 'write' : 'idle';
    }
    function renderCode() {
      q('[data-tabs]').innerHTML = Object.keys(codes).map(k => '<button class="btn btn-sm ' + (k === lang ? 'btn-primary' : 'btn-ghost') + '" data-l="' + k + '">' + k + '</button>').join('') + '<button class="btn btn-ghost btn-sm" data-copycode style="margin-left:auto">⧉ Copy</button>';
      q('[data-tabs]').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { lang = b.dataset.l; renderCode(); });
      q('[data-tabs]').querySelector('[data-copycode]').onclick = () => navigator.clipboard && navigator.clipboard.writeText(codes[lang] || '');
      q('[data-code]').innerHTML = (codes[lang] || '').split('\n').map((l, i) => '<div data-ln="' + i + '" style="padding:1px 8px;border-radius:4px;white-space:pre;color:var(--dim)"><span style="display:inline-block;width:22px;text-align:right;margin-right:12px;color:var(--faint)">' + (i + 1) + '</span>' + (l || ' ') + '</div>').join('');
      highlight();
    }
    function highlight() {
      const pre = q('[data-code]');
      pre.querySelectorAll('[data-ln]').forEach(el => el.style.background = '');
      const t = steps[cur]; const lines = (codes[lang] || '').split('\n');
      const mark = (i, col) => { const el = pre.querySelector('[data-ln="' + i + '"]'); if (el) { el.style.background = col; el.style.color = col === 'var(--acc)' ? '#0b0b0b' : 'var(--ink)'; } };
      if (lang === 'Pseudo') { if (typeof t.line === 'number') mark(t.line, 'var(--acc)'); return; }
      const op = opNow();
      const ifIdx = lines.findIndex(l => /if\s/.test(l));
      if (op === 'compare' && ifIdx >= 0) mark(ifIdx, 'rgba(245,197,24,.25)');
      if (op === 'swap' && ifIdx >= 0) for (let i = ifIdx + 1; i < Math.min(ifIdx + 4, lines.length); i++) if (/=|swap/.test(lines[i])) mark(i, 'rgba(46,204,113,.25)');
    }
    function metrics() {
      let c = 0, s = 0, p = 1, sorted = 0, n = 1;
      for (let i = 0; i <= cur; i++) { const st = steps[i].state; const v = Object.values(st.hi || {});
        if (v.includes('compare')) c++; if (v.includes('swap')) s++;
        if (st.ptrs && st.ptrs.i != null) p = Math.max(p, st.ptrs.i + 1);
        if (st.arr) { n = st.arr.length; sorted = v.filter(x => x === 'sorted' || x === 'found').length; } }
      return { c, s, p, e: n > 1 ? Math.round(sorted / n * 100) : 0 };
    }
    function draw() {
      const t = steps[cur]; const st = t.state;
      renderer.draw(stage, trace, st);
      const arr = st.arr || [];
      q('[data-banner]').textContent = t.note || '';
      q('[data-opbanner]').textContent = '→ ' + (t.note || '');
      q('[data-chartlbl]').textContent = trace.title + ' — ' + (arr.length || (st.rows || []).length) + ' elements';
      q('[data-maxlbl]').textContent = arr.length ? 'Max value: ' + Math.max(...arr) : '';
      q('[data-cnt]').textContent = (cur + 1) + ' / ' + steps.length;
      q('[data-c="scrub"]').value = cur;
      q('[data-stepchip]').textContent = 'Step ' + (cur + 1) + ' of ' + steps.length;
      q('[data-prog]').textContent = Math.round(cur / (steps.length - 1) * 100) + '%';
      q('[data-progbar]').style.width = Math.round(cur / (steps.length - 1) * 100) + '%';
      const op = opNow();
      const opl = { swap: ['Swapping', '#e05252'], compare: ['Comparing', '#f5c518'], sorted: ['Sorted', '#2ecc71'], write: ['Writing', '#f28c28'], idle: ['Idle', '#8a94a6'] }[op];
      q('[data-op]').innerHTML = '<i style="width:10px;height:10px;border-radius:3px;background:' + opl[1] + '"></i>' + opl[0];
      const m = metrics();
      q('[data-m="c"]').textContent = m.c; q('[data-m="s"]').textContent = m.s; q('[data-m="p"]').textContent = m.p; q('[data-m="e"]').textContent = m.e + '%';
      q('[data-note]').textContent = t.note || '';
      q('[data-arr]').textContent = arr.length ? '[' + arr.join(', ') + ']' : '—';
      q('[data-size]').textContent = arr.length || size; q('[data-sp]').textContent = pct + '%';
      highlight();
    }
    const delay = () => 1500 - pct * 14;
    function stop() { playing = false; clearInterval(timer); q('[data-c="play"]').innerHTML = '▶ Play'; }
    function play() { if (playing) return stop(); playing = true; q('[data-c="play"]').innerHTML = '⏸ Pause'; timer = setInterval(() => { if (cur < steps.length - 1) { cur++; draw(); } else stop(); }, delay()); }
    function fs(on) {
      if (on && !ov) {
        ov = document.createElement('div'); ov.className = 'vzfsov';
        ov.innerHTML = '<div class="vzfshead"><b style="font-size:1.05rem">🖥 ' + trace.title + '</b><span class="faint" style="font-size:.8rem"> — Full Screen</span><span style="flex:1"></span><button class="btn btn-ghost btn-sm" data-x>✕</button></div>' +
          '<div class="fsgrid"><div class="fsl" data-fsl></div><div class="fsr" data-fsr></div></div>';
        root.appendChild(ov);
        ov.querySelector('[data-fsl]').appendChild(stageCard);
        ov.querySelector('[data-fsl]').appendChild(ctlCard);
        ov.querySelector('[data-fsr]').appendChild(codecol);
        ov.querySelector('[data-x]').onclick = () => fs(false);
        window.AE3301_TALL = true;
        draw();
      } else if (!on && ov) {
        midEl.insertBefore(stageCard, midEl.firstChild);
        leftEl.insertBefore(ctlCard, leftEl.firstChild);
        accCode.appendChild(codecol);
        ov.remove(); ov = null;
        window.AE3301_TALL = false;
        draw();
      }
    }
    root.querySelectorAll('[data-c]').forEach(el => {
      const c = el.dataset.c;
      if (c === 'play') el.onclick = play;
      if (c === 'step') el.onclick = () => { stop(); cur = Math.min(steps.length - 1, cur + 1); draw(); };
      if (c === 'reset') el.onclick = () => { stop(); cur = 0; draw(); };
      if (c === 'rand') el.onclick = () => { if (trace.regenerate) { fs(false); mount(root, trace.regenerate(size)); } };
      if (c === 'fs') el.onclick = () => fs(!ov);
      if (c === 'share') el.onclick = () => { navigator.clipboard && navigator.clipboard.writeText(location.href); q('[data-banner]').textContent = '🔗 Link copied — share it!'; };
      if (c === 'scrub') el.oninput = () => { stop(); cur = +el.value; draw(); };
      if (c === 'set') el.onclick = settings;
    });
    root.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const body = q('[data-b="' + b.dataset.a + '"]'); body.style.display = body.style.display === 'block' ? 'none' : 'block'; });
    function settings() {
      const so = document.createElement('div');
      so.style.cssText = 'position:fixed;inset:0;z-index:16000;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px';
      so.innerHTML = '<div class="card" style="width:min(430px,94vw);padding:20px"><b style="font-size:1.05rem">Visualizer Settings</b>' +
        '<p class="mono" style="margin:14px 0 6px;font-size:.75rem">Array Size: <b data-v></b></p><input type="range" data-s="n" min="5" max="40" value="' + size + '" style="width:100%">' +
        '<p class="mono" style="margin:14px 0 6px;font-size:.75rem">Speed: <b data-v2></b></p><input type="range" data-s="v" min="0" max="100" value="' + pct + '" style="width:100%">' +
        '<p class="mono" style="margin:14px 0 6px;font-size:.75rem">Custom Array (comma-separated)</p>' +
        '<div style="display:flex;gap:8px"><input class="code-box" data-s="arr" placeholder="e.g., 5,2,8,1,9" style="flex:1;min-height:44px;color:var(--ink)"><button class="btn btn-primary btn-sm" data-s="go">Set</button></div>' +
        '<div style="margin-top:14px;text-align:right"><button class="btn btn-ghost btn-sm" data-s="x">Close</button></div></div>';
      document.body.appendChild(so);
      const nn = so.querySelector('[data-s="n"]'), vv = so.querySelector('[data-s="v"]');
      const paint = () => { so.querySelector('[data-v]').textContent = nn.value; so.querySelector('[data-v2]').textContent = vv.value + '%'; };
      paint();
      nn.oninput = () => { paint(); size = +nn.value; if (trace.regenerate) { so.remove(); fs(false); mount(root, trace.regenerate(size)); } };
      vv.oninput = () => { paint(); pct = +vv.value; if (playing) { stop(); play(); } };
      so.querySelector('[data-s="go"]').onclick = () => { const a = so.querySelector('[data-s="arr"]').value.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x)); if (a.length > 1 && trace.custom) { so.remove(); fs(false); mount(root, trace.custom(a)); } };
      so.querySelector('[data-s="x"]').onclick = () => so.remove();
      so.onclick = e => { if (e.target === so) so.remove(); };
    }
    CTL = { play, step: () => { stop(); cur = Math.min(steps.length - 1, cur + 1); draw(); }, reset: () => { stop(); cur = 0; draw(); }, fs };
    renderCode(); draw();
  }
  window.AE3301_VIZ_ENGINE = { mount };
})();
