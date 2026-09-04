/**
 * AE3301 · ALGORITHM LAB v3 — full pro traces (codes/meta/resize/custom)
 * Integrated into Learn (no separate menu), deep-links auto-run
 */
(() => {
  'use strict';
  const CODES = window.AE3301_CODES || {}, META = window.AE3301_META || {};
  const rand = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const S = (arr, hi, ptrs, note, line) => ({ state: { arr: [...arr], hi: hi || {}, ptrs }, note, line });

  function bubble(a) { const CODE = 'for i=0..n-2\n  for j=0..n-2-i\n    if arr[j] > arr[j+1]\n      swap(j,j+1)\n\nsorted ✔';
    const arr = [...a], st = [S(arr, {}, {}, 'Start: nothing is sorted yet', 0)];
    for (let i = 0; i < arr.length - 1; i++) for (let j = 0; j < arr.length - 1 - i; j++) {
      st.push(S(arr, { [j]: 'compare', [j + 1]: 'compare' }, { i, j }, 'Compare neighbours ' + arr[j] + ' and ' + arr[j + 1], 2));
      if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; st.push(S(arr, { [j]: 'swap', [j + 1]: 'swap' }, { i, j }, 'Out of order → swap them', 3)); } }
    const hi = {}; arr.forEach((_, k) => hi[k] = 'sorted'); st.push(S(arr, hi, {}, 'All pairs checked → sorted ✔', 5));
    return { id: 'bubble', title: 'Bubble Sort', kind: 'array', code: CODE, codes: CODES.bubble, meta: META.bubble, steps: st, regenerate: n => bubble(rand(n || 8, 1, 40)), custom: x => bubble(x) }; }

  function selection(a) { const CODE = 'for i=0..n-2\n  min=i\n  for j=i+1..n-1\n    if arr[j] < arr[min]\n      min=j\n  swap(i,min)\n\nsorted ✔';
    const arr = [...a], st = [S(arr, {}, {}, 'Start', 0)];
    for (let i = 0; i < arr.length - 1; i++) { let m = i; st.push(S(arr, { [i]: 'mid' }, { min: m }, 'Assume position ' + i + ' holds the minimum', 1));
      for (let j = i + 1; j < arr.length; j++) { st.push(S(arr, { [m]: 'mid', [j]: 'compare' }, { min: m, j }, 'Is ' + arr[j] + ' smaller than ' + arr[m] + '?', 3)); if (arr[j] < arr[m]) { m = j; st.push(S(arr, { [m]: 'mid' }, { min: m }, 'Yes → new minimum at ' + j, 4)); } }
      if (m !== i) { [arr[i], arr[m]] = [arr[m], arr[i]]; st.push(S(arr, { [i]: 'swap', [m]: 'swap' }, {}, 'Swap minimum into place ' + i, 5)); } }
    const hi = {}; arr.forEach((_, k) => hi[k] = 'sorted'); st.push(S(arr, hi, {}, 'Sorted ✔', 7));
    return { id: 'selection', title: 'Selection Sort', kind: 'array', code: CODE, codes: CODES.selection, meta: META.selection, steps: st, regenerate: n => selection(rand(n || 8, 1, 40)), custom: x => selection(x) }; }

  function insertion(a) { const CODE = 'for i=1..n-1\n  key=arr[i]\n  j=i-1\n  while j>=0 and arr[j]>key\n    arr[j+1]=arr[j]\n    j--\n  arr[j+1]=key\n\nsorted ✔';
    const arr = [...a], st = [S(arr, {}, {}, 'Left part starts sorted (1 element)', 0)];
    for (let i = 1; i < arr.length; i++) { const k = arr[i]; let j = i - 1;
      st.push(S(arr, { [i]: 'key' }, { key: i }, 'Pick up ' + k + ' like a new card', 1));
      while (j >= 0 && arr[j] > k) { arr[j + 1] = arr[j]; st.push(S(arr, { [j]: 'compare', [j + 1]: 'swap' }, {}, arr[j] + ' is bigger → shift it right', 4)); j--; }
      arr[j + 1] = k; st.push(S(arr, { [j + 1]: 'key' }, {}, 'Drop ' + k + ' into its slot', 6)); }
    const hi = {}; arr.forEach((_, k) => hi[k] = 'sorted'); st.push(S(arr, hi, {}, 'Sorted ✔', 8));
    return { id: 'insertion', title: 'Insertion Sort', kind: 'array', code: CODE, codes: CODES.insertion, meta: META.insertion, steps: st, regenerate: n => insertion(rand(n || 8, 1, 40)), custom: x => insertion(x) }; }

  function linear(a, t) { const CODE = 'for i=0..n-1\n  if arr[i]==target\n    return i\nreturn -1';
    const arr = [...a], st = [S(arr, {}, {}, 'Hunt for ' + t + ' — check every slot', 0)];
    for (let i = 0; i < arr.length; i++) { st.push(S(arr, { [i]: 'compare' }, { i }, 'Slot ' + i + ': ' + arr[i] + (arr[i] === t ? ' — match!' : ' — no'), 1));
      if (arr[i] === t) { st.push(S(arr, { [i]: 'found' }, {}, 'Found at index ' + i + ' ✔', 2)); return done('linear', 'Linear Search', CODE, st, n => { const x = rand(n || 10, 1, 50); return linear(x, pick(x)); }, x => linear(x, pick(x))); } }
    st.push(S(arr, {}, {}, 'Checked all → not found ✗', 3));
    return done('linear', 'Linear Search', CODE, st, n => { const x = rand(n || 10, 1, 50); return linear(x, pick(x)); }, x => linear(x, pick(x))); }

  function binary(a, t) { const CODE = 'lo=0 hi=n-1\nwhile lo<=hi\n  mid=(lo+hi)/2\n  if arr[mid]==t: found\n  if arr[mid]<t: lo=mid+1\n  else: hi=mid-1\nreturn -1';
    const arr = [...a].sort((x, y) => x - y), st = [S(arr, {}, { lo: 0, hi: arr.length - 1 }, 'Sorted array → we may halve. Target ' + t, 0)];
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1;
      const h = {}; for (let k = 0; k < lo; k++) h[k] = 'dim'; for (let k = hi + 1; k < arr.length; k++) h[k] = 'dim'; h[m] = 'mid';
      st.push(S(arr, h, { lo, hi, mid: m }, 'Middle is ' + arr[m] + '. ' + (arr[m] === t ? 'That is the target!' : arr[m] < t ? 'Too small → throw away LEFT half' : 'Too big → throw away RIGHT half'), 2));
      if (arr[m] === t) { st.push(S(arr, { [m]: 'found' }, {}, 'Found at ' + m + ' ✔', 3)); return done('binary', 'Binary Search', CODE, st, n => { const x = rand(n || 10, 1, 50); return binary(x, pick(x)); }, x => binary([...x].sort((p, q) => p - q), pick(x))); }
      if (arr[m] < t) lo = m + 1; else hi = m - 1; }
    st.push(S(arr, {}, {}, 'Range empty → not found ✗', 6));
    return done('binary', 'Binary Search', CODE, st, n => { const x = rand(n || 10, 1, 50); return binary(x, pick(x)); }, x => binary([...x].sort((p, q) => p - q), pick(x))); }

  function mkTree() { const vals = rand(7, 1, 30).sort((x, y) => x - y);
    const nodes = vals.map((v, i) => ({ id: i, val: v, p: null, l: null, r: null }));
    nodes.forEach((n, i) => { if (!i) return; const p = Math.floor((i - 1) / 2); n.p = p; nodes[p][i % 2 ? 'l' : 'r'] = i; });
    return nodes; }
  function bfsTree() { const CODE = 'queue=[root]\nwhile queue:\n  node=pop\n  visit(node)\n  push children';
    const nodes = mkTree(), st = [{ state: { nodes, queue: [0], hi: {} }, note: 'BFS uses a QUEUE → level by level', line: 0 }];
    const q = [0], vis = new Set();
    while (q.length) { const id = q.shift(); vis.add(id);
      const hi = {}; vis.forEach(v => hi[v] = 'visited'); hi[id] = 'current';
      st.push({ state: { nodes, queue: [...q], hi }, note: 'Visit ' + nodes[id].val + ' (green = done, orange = now)', line: 3 });
      if (nodes[id].l != null) { q.push(nodes[id].l); st.push({ state: { nodes, queue: [...q], hi }, note: 'Queue its left child ' + nodes[nodes[id].l].val, line: 4 }); }
      if (nodes[id].r != null) { q.push(nodes[id].r); st.push({ state: { nodes, queue: [...q], hi }, note: 'Queue its right child ' + nodes[nodes[id].r].val, line: 4 }); } }
    return { id: 'bfsTree', title: 'BFS (level-order)', kind: 'tree', code: CODE, meta: META.bfsTree, steps: st, regenerate: () => bfsTree() }; }
  function dfsTree() { const CODE = 'stack=[root]\nwhile stack:\n  node=pop\n  visit(node)\n  push children';
    const nodes = mkTree(), st = [{ state: { nodes, stack: [0], hi: {} }, note: 'DFS uses a STACK → go deep first', line: 0 }];
    const stk = [0], vis = new Set();
    while (stk.length) { const id = stk.pop(); if (vis.has(id)) continue; vis.add(id);
      const hi = {}; vis.forEach(v => hi[v] = 'visited'); hi[id] = 'current';
      st.push({ state: { nodes, stack: [...stk], hi }, note: 'Visit ' + nodes[id].val + ' — dive to the left', line: 3 });
      if (nodes[id].r != null) stk.push(nodes[id].r);
      if (nodes[id].l != null) stk.push(nodes[id].l);
      st.push({ state: { nodes, stack: [...stk], hi }, note: 'Stack children (right first so left pops first)', line: 4 }); }
    return { id: 'dfsTree', title: 'DFS (pre-order)', kind: 'tree', code: CODE, meta: META.dfsTree, steps: st, regenerate: () => dfsTree() }; }
  function bfsGraph() { const CODE = 'queue=[start]\nvisited={start}\nwhile queue:\n  v=pop\n  for u in neighbors(v):\n    if u not visited: enqueue';
    const g = { nodes: [{ id: 0, x: 60, y: 60, val: 'A' }, { id: 1, x: 200, y: 40, val: 'B' }, { id: 2, x: 340, y: 80, val: 'C' }, { id: 3, x: 80, y: 200, val: 'D' }, { id: 4, x: 220, y: 220, val: 'E' }, { id: 5, x: 340, y: 200, val: 'F' }],
      edges: [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 4, b: 5 }] };
    const st = [{ state: { nodes: g.nodes, edges: g.edges, hi: { 0: 'current' } }, note: 'Spread from A like a ripple in water', line: 0 }];
    const q = [0], vis = new Set([0]);
    while (q.length) { const v = q.shift(); const hi = {}; vis.forEach(x => hi[x] = 'visited'); hi[v] = 'current';
      st.push({ state: { nodes: g.nodes, edges: g.edges, hi }, note: 'Visit ' + g.nodes[v].val, line: 3 });
      g.edges.forEach(e => { const nb = e.a === v ? e.b : e.b === v ? e.a : -1;
        if (nb >= 0 && !vis.has(nb)) { vis.add(nb); q.push(nb);
          const h2 = {}; vis.forEach(x => h2[x] = 'visited'); h2[nb] = 'current';
          st.push({ state: { nodes: g.nodes, edges: g.edges, hi: h2, edgeHi: { [v + '-' + nb]: 'visited' } }, note: 'Discover ' + g.nodes[nb].val + ' through the glowing edge', line: 5 }); } }); }
    return { id: 'bfsGraph', title: 'Graph BFS', kind: 'graph', code: CODE, meta: META.bfsGraph, steps: st, regenerate: () => bfsGraph() }; }

  function done(id, title, code, st, regen, custom) {
    return { id, title, kind: 'array', code, meta: META[id], steps: st, regenerate: regen, custom };
  }

  const ALGOS = [
    { id: 'bubble', name: 'Bubble Sort', cat: 'sort', blurb: 'Adjacent swaps, max bubbles up', gen: n => bubble(rand(n || 8, 1, 40)) },
    { id: 'selection', name: 'Selection Sort', cat: 'sort', blurb: 'Pick minimum, place it', gen: n => selection(rand(n || 8, 1, 40)) },
    { id: 'insertion', name: 'Insertion Sort', cat: 'sort', blurb: 'Grow sorted hand', gen: n => insertion(rand(n || 8, 1, 40)) },
    { id: 'linear', name: 'Linear Search', cat: 'search', blurb: 'Check one by one', gen: n => { const a = rand(n || 10, 1, 50); return linear(a, pick(a)); } },
    { id: 'binary', name: 'Binary Search', cat: 'search', blurb: 'Halve each step', gen: n => { const a = rand(n || 10, 1, 50); return binary(a, pick(a)); } },
    { id: 'bfsTree', name: 'BFS (level-order)', cat: 'tree', blurb: 'Queue: level by level', gen: () => bfsTree() },
    { id: 'dfsTree', name: 'DFS (pre-order)', cat: 'tree', blurb: 'Stack: deep first', gen: () => dfsTree() },
    { id: 'bfsGraph', name: 'Graph BFS', cat: 'graph', blurb: 'Spread from a source', gen: () => bfsGraph() }
  ];
  const find = id => ALGOS.find(a => a.id === id) || (window.AE3301_PRACTICAL || []).find(a => a.id === id);

  function page() {
    const cats = [...new Set(ALGOS.map(a => a.cat))];
    return '<div class="page-head"><div class="kicker">◉ VISUALIZE · PART OF LEARN</div><h1>Algorithm Lab</h1>' +
      '<p class="muted">Play, step, scrub, fullscreen, multi-language code. Every trace is real.</p></div>' +
      cats.map(c => '<h3 style="margin:18px 0 8px;text-transform:uppercase;color:var(--acc);font-size:.75rem;letter-spacing:.2em">' + c + '</h3>' +
        '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">' +
        ALGOS.filter(a => a.cat === c).map(a => '<div class="card" style="padding:14px"><b>' + a.name + '</b><p class="muted" style="font-size:.78rem;margin:6px 0 10px">' + a.blurb + '</p><button class="btn btn-primary btn-sm" data-run="' + a.id + '">▶ RUN</button></div>').join('') + '</div>').join('') +
      '<div data-stage style="margin-top:16px"></div>';
  }
  function run(id) {
    const a = find(id); if (!a) return;
    const v = document.getElementById('view');
    window.AE3301_VIZ_ENGINE.mount(v.querySelector('[data-stage]'), a.gen());
    v.querySelector('[data-stage]').scrollIntoView({ behavior: 'smooth' });
  }
  function learnStrip() {
    const v = document.getElementById('view');
    if (!v || v.querySelector('[data-labstrip]')) return;
    const all = ALGOS.concat(window.AE3301_PRACTICAL || []);
    const div = document.createElement('div'); div.dataset.labstrip = '1';
    div.innerHTML = '<div class="card" style="margin-top:18px;padding:16px"><div class="kicker">◉ VISUALIZATIONS</div>' +
      '<p class="muted" style="margin:6px 0 12px">Every topic, moving. Tap to watch it think.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + all.map(a => '<a class="btn btn-ghost btn-sm" href="#/visualize/' + a.id + '">◉ ' + a.name + '</a>').join('') + '</div></div>';
    v.appendChild(div);
  }
  function mount() {
    const h = (location.hash || '').replace('#', '');
    document.querySelectorAll('[data-nav]').forEach(x => x.classList.toggle('active', x.dataset.nav === 'learn' && (h === '/learn' || h.startsWith('/visualize'))));
    if (h === '/learn') { learnStrip(); return; }
    if (!h.startsWith('/visualize')) return;
    const id = h.split('/')[2];
    const v = document.getElementById('view');
    v.innerHTML = page();
    document.title = 'Visualize · AE3301';
    v.querySelectorAll('[data-run]').forEach(b => b.onclick = () => run(b.dataset.run));
    if (id) run(id);
  }
  addEventListener('hashchange', () => setTimeout(mount, 0));
  setTimeout(mount, 60);
})();
