/**
 * AE3301 · TREE / GRAPH RENDERER (SVG)
 * Tree state: { nodes:[{id,val,p,l,r}], hi:{id:color}, queue?:[], stack?:[] }
 * Graph state: { nodes:[{id,x,y,val}], edges:[{a,b,w}], hi:{id:color}, edgeHi:{key:color} }
 * Layout: simple level-order spacing for trees; pre-computed positions for graphs
 */
(() => {
  'use strict';
  const C = { compare: '#d4a24e', swap: '#d43d2a', visited: '#1f8a34', mid: '#6a4dc4', current: '#f0561c', node: '#3a3a3a', edge: '#444' };

  function layout(nodes) {
    const root = nodes.find(n => n.p === null); if (!root) return {};
    const pos = {}; const depth = {};
    function walk(id, d, x) { depth[id] = d; const ch = nodes.filter(n => n.p === id);
      if (!ch.length) { pos[id] = { x, y: d * 56 + 24 }; return; }
      const lx = x - Math.pow(2, Math.max(0, 3 - d)) * 18;
      const rx = x + Math.pow(2, Math.max(0, 3 - d)) * 18;
      if (ch[0]) walk(ch[0].id, d + 1, lx);
      if (ch[1]) walk(ch[1].id, d + 1, rx);
      pos[id] = { x, y: d * 56 + 24 };
    }
    walk(root.id, 0, 180);
    return pos;
  }

  function initTree(stage) {
    stage.innerHTML =
      '<svg viewBox="0 0 360 280" style="width:100%;height:260px;background:#0a0a0a;border-radius:10px" data-svg></svg>' +
      '<div class="mono" style="margin-top:8px;font-size:.72rem;color:var(--dim);display:flex;gap:10px;flex-wrap:wrap"><span data-queue></span><span data-stack></span></div>';
  }
  function drawTree(stage, trace, state) {
    const svg = stage.querySelector('[data-svg]');
    const pos = layout(state.nodes);
    let h = '';
    state.nodes.forEach(n => {
      const p = pos[n.id]; if (!p) return;
      const col = C[(state.hi && state.hi[n.id]) || 'node'];
      ['l', 'r'].forEach(k => { if (n[k] != null && pos[n[k]])
        h += '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + pos[n[k]].x + '" y2="' + pos[n[k]].y + '" stroke="' + C.edge + '" stroke-width="2"/>'; });
      h += '<circle cx="' + p.x + '" cy="' + p.y + '" r="18" fill="' + col + '" stroke="#000" stroke-width="1"/>' +
           '<text x="' + p.x + '" y="' + (p.y + 5) + '" text-anchor="middle" style="font:700 12px var(--fm);fill:#fff">' + n.val + '</text>';
    });
    svg.innerHTML = h;
    stage.querySelector('[data-queue]').textContent = state.queue ? 'queue: [' + state.queue.join(', ') + ']' : '';
    stage.querySelector('[data-stack]').textContent = state.stack ? 'stack: [' + state.stack.join(', ') + ']' : '';
  }
  window.AE3301_VIZ.register('tree', { init: initTree, draw: drawTree });

  function initGraph(stage) {
    stage.innerHTML = '<svg viewBox="0 0 400 280" style="width:100%;height:260px;background:#0a0a0a;border-radius:10px" data-svg></svg>';
  }
  function drawGraph(stage, trace, state) {
    const svg = stage.querySelector('[data-svg]');
    let h = '';
    state.edges.forEach(e => {
      const a = state.nodes[e.a], b = state.nodes[e.b];
      const col = C[(state.edgeHi && state.edgeHi[e.a + '-' + e.b]) || 'edge'];
      h += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + col + '" stroke-width="2"/>';
      if (e.w) { const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        h += '<text x="' + mx + '" y="' + (my - 4) + '" text-anchor="middle" style="font:700 10px var(--fm);fill:#8a867e">' + e.w + '</text>'; }
    });
    state.nodes.forEach(n => {
      const col = C[(state.hi && state.hi[n.id]) || 'node'];
      h += '<circle cx="' + n.x + '" cy="' + n.y + '" r="18" fill="' + col + '"/>' +
           '<text x="' + n.x + '" y="' + (n.y + 5) + '" text-anchor="middle" style="font:700 12px var(--fm);fill:#fff">' + n.val + '</text>';
    });
    svg.innerHTML = h;
  }
  window.AE3301_VIZ.register('graph', { init: initGraph, draw: drawGraph });
})();
