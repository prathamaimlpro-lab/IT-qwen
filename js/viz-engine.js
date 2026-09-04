/**
 * ================================================================
 *  AE3301 · VIZ ENGINE — scene graph + playback
 *  · Trace = { title, kind, code, steps: [{state, note, line}] }
 *  · Renderer registry dispatches by `kind` (array/tree/graph/code)
 *  · Player: play/pause/step/scrub/speed, persistent DOM identity
 * ================================================================
 */
(() => {
  'use strict';
  const RENDERERS = new Map();
  window.AE3301_VIZ = {
    register: (kind, fn) => RENDERERS.set(kind, fn),
    open: (id) => { location.hash = '#/visualize/' + id; }
  };

  function mount(root, trace) {
    let cur = 0, playing = false, speed = 1, timer = null;
    root.innerHTML =
      '<div style="display:grid;gap:12px;grid-template-columns:1fr;grid-template-areas:\'stage stage\' \'controls controls\'">' +
      '<div style="grid-area:stage;display:grid;gap:12px;grid-template-columns:2fr 1fr">' +
      '<div class="card" style="padding:16px;min-height:260px">' +
      '<div style="display:flex;gap:10px;align-items:center"><b style="flex:1">' + trace.title + '</b><span class="mono faint" data-cnt></span></div>' +
      '<div data-stage style="margin-top:14px"></div>' +
      '<p data-note class="muted" style="margin-top:12px;min-height:1.4em;font-size:.9rem"></p></div>' +
      '<div class="card" data-code style="padding:16px;overflow:auto;max-height:400px;font-family:var(--fm);font-size:.78rem;line-height:1.5"></div></div>' +
      '<div class="card" style="grid-area:controls;padding:14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
      '<button class="btn btn-ghost btn-sm" data-c="first">⏮</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="prev">◀</button>' +
      '<button class="btn btn-primary btn-sm" data-c="play">▶ PLAY</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="next">▶|</button>' +
      '<button class="btn btn-ghost btn-sm" data-c="last">⏭</button>' +
      '<select class="code-box" data-c="speed" style="min-height:36px;width:auto">' +
      '<option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select>' +
      '<input type="range" data-c="scrub" min="0" max="' + (trace.steps.length - 1) + '" value="0" style="flex:1;min-width:140px">' +
      '<button class="btn btn-ghost btn-sm" data-c="reshuffle">🎲 New input</button></div>';
    const q = (s) => root.querySelector(s);
    const stage = q('[data-stage]');
    const codeEl = q('[data-code]');
    const renderer = RENDERERS.get(trace.kind);
    if (!renderer) { stage.innerHTML = '<p class="empty-note">No renderer for ' + trace.kind + '</p>'; return; }
    renderer.init(stage, trace);
    if (trace.code) {
      codeEl.innerHTML = trace.code.split('\n').map((l, i) =>
        '<div data-ln="' + i + '" style="padding:1px 8px;border-radius:4px;white-space:pre;color:var(--dim)">' + (l || ' ') + '</div>').join('');
    } else codeEl.style.display = 'none';

    function draw() {
      const t = trace.steps[cur];
      renderer.draw(stage, trace, t.state);
      q('[data-note]').textContent = t.note || '';
      q('[data-cnt]').textContent = (cur + 1) + ' / ' + trace.steps.length;
      q('[data-c="scrub"]').value = cur;
      if (trace.code) {
        codeEl.querySelectorAll('[data-ln]').forEach(el => el.style.background = '');
        if (typeof t.line === 'number') {
          const ln = codeEl.querySelector('[data-ln="' + t.line + '"]');
          if (ln) ln.style.background = 'var(--acc)';
        }
      }
    }
    function stop() { playing = false; clearInterval(timer); q('[data-c="play"]').textContent = '▶ PLAY'; }
    function play() {
      if (playing) return stop();
      playing = true; q('[data-c="play"]').textContent = '⏸ PAUSE';
      timer = setInterval(() => {
        if (cur < trace.steps.length - 1) { cur++; draw(); } else stop();
      }, 650 / speed);
    }
    root.querySelectorAll('[data-c]').forEach(el => {
      const c = el.dataset.c;
      if (c === 'first') el.onclick = () => { stop(); cur = 0; draw(); };
      if (c === 'last') el.onclick = () => { stop(); cur = trace.steps.length - 1; draw(); };
      if (c === 'prev') el.onclick = () => { stop(); cur = Math.max(0, cur - 1); draw(); };
      if (c === 'next') el.onclick = () => { stop(); cur = Math.min(trace.steps.length - 1, cur + 1); draw(); };
      if (c === 'play') el.onclick = play;
      if (c === 'speed') el.onchange = () => { speed = +el.value; if (playing) { stop(); play(); } };
      if (c === 'scrub') el.oninput = () => { stop(); cur = +el.value; draw(); };
      if (c === 'reshuffle') el.onclick = () => { if (trace.regenerate) { const nt = trace.regenerate(); mount(root, nt); } };
    });
    draw();
  }
  window.AE3301_VIZ_ENGINE = { mount };
})();
