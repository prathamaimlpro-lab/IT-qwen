/**
 * AE3301 · ALGORITHM LAB v4 — full catalog (visualizedsa layout, AE3301 DNA)
 * hero stats · filters · category sections · pro cards · detail stage
 */
(() => {
  'use strict';
  const CAT = window.AE3301_CATALOG || [];
  const CODES = window.AE3301_CODES || {}, META = window.AE3301_META || {};
  const rand = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const S = (arr, hi, ptrs, note, line) => ({ state: { arr: [...arr], hi: hi || {}, ptrs }, note, line });
  const DIFFC = { beginner: 'var(--green)', intermediate: 'var(--gold)', advanced: 'var(--red)' };
  const CATI = { 'Sorting Algorithms': '📊', 'Divide & Conquer': '🔀', 'Graph Algorithms': '🕸️', 'Tree Data Structures': '🌳', 'Search Algorithms': '🔍', 'Data Structures': '🗃️', 'Dynamic Programming': '🧮', 'Greedy Algorithms': '⚡', 'Backtracking Algorithms': '↩️', 'String Algorithms': '🔤' };

  /* ---------- recorders (unchanged, compact) ---------- */
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
    for (let i = 0; i < arr.length; i++) { st.push(S(arr, { [i]: 'compare' }, { i }, 'Slot ' + i + ': ' + arr[i] + (arr[i] === t ? ' — match!' : ' — no'), 1)); if (arr[i] === t) { st.push(S(arr, { [i]: 'found' }, {}, 'Found at index ' + i + ' ✔', 2)); return ret('linear', 'Linear Search', CODE, st, n => linear(rand(n || 10, 1, 50), pick(rand(10, 1, 50))), x => linear(x, pick(x))); } }
    st.push(S(arr, {}, {}, 'Checked all → not found ✗', 3));
    return ret('linear', 'Linear Search', CODE, st, n => linear(rand(n || 10, 1, 50), pick(rand(10, 1, 50))), x => linear(x, pick(x))); }
  function binary(a, t) { const CODE = 'lo=0 hi=n-1\nwhile lo<=hi\n  mid=(lo+hi)/2\n  if arr[mid]==t: found\n  if arr[mid]<t: lo=mid+1\n  else: hi=mid-1\nreturn -1';
    const arr = [...a].sort((x, y) => x - y), st = [S(arr, {}, { lo: 0, hi: arr.length - 1 }, 'Sorted array → we may halve. Target ' + t, 0)];
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1;
      const h = {}; for (let k = 0; k < lo; k++) h[k] = 'dim'; for (let k = hi + 1; k < arr.length; k++) h[k] = 'dim'; h[m] = 'mid';
      st.push(S(arr, h, { lo, hi, mid: m }, 'Middle is ' + arr[m] + '. ' + (arr[m] === t ? 'That is the target!' : arr[m] < t ? 'Too small → throw away LEFT half' : 'Too big → throw away RIGHT half'), 2));
      if (arr[m] === t) { st.push(S(arr, { [m]: 'found' }, {}, 'Found at ' + m + ' ✔', 3)); return ret('binary', 'Binary Search', CODE, st, n => binary(rand(n || 10, 1, 50), 0), x => binary(x, pick(x))); }
      if (arr[m] < t) lo = m + 1; else hi = m - 1; }
    st.push(S(arr, {}, {}, 'Range empty → not found ✗', 6));
    return ret('binary', 'Binary Search', CODE, st, n => binary(rand(n || 10, 1, 50), 0), x => binary(x, pick(x))); }
  function mkTree() { const vals = rand(7, 1, 30).sort((x, y) => x - y);
    const nodes = vals.map((v, i) => ({ id: i, val: v, p: null, l: null, r: null }));
    nodes.forEach((n, i) => { if (!i) return; const p = Math.floor((i - 1) / 2); n.p = p; nodes[p][i % 2 ? 'l' : 'r'] = i; });
    return nodes; }
  function dfsTree() { const CODE = 'stack=[root]\nwhile stack:\n  node=pop\n  visit(node)\n  push children';
    const nodes = mkTree(), st = [{ state: { nodes, stack: [0], hi: {} }, note: 'DFS uses a STACK → go deep first', line: 0 }];
    const stk = [0], vis = new Set();
    while (stk.length) { const id = stk.pop(); if (vis.has(id)) continue; vis.add(id);
      const hi = {}; vis.forEach(v => hi[v] = 'visited'); hi[id] = 'current';
      st.push({ state: { nodes, stack: [...stk], hi }, note: 'Visit ' + nodes[id].val + ' — dive left', line: 3 });
      if (nodes[id].r != null) stk.push(nodes[id].r);
      if (nodes[id].l != null) stk.push(nodes[id].l);
      st.push({ state: { nodes, stack: [...stk], hi }, note: 'Stack children (right first so left pops first)', line: 4 }); }
    return { id: 'traversals', title: 'Binary Tree Traversals', kind: 'tree', code: CODE, meta: META.dfsTree, steps: st, regenerate: () => dfsTree() }; }
  function bfsGraph() { const CODE = 'queue=[start]\nvisited={start}\nwhile queue:\n  v=pop\n  for u in neighbors(v):\n    if u not visited: enqueue';
    const g = { nodes: [{ id: 0, x: 60, y: 60, val: 'A' }, { id: 1, x: 200, y: 40, val: 'B' }, { id: 2, x: 340, y: 80, val: 'C' }, { id: 3, x: 80, y: 200, val: 'D' }, { id: 4, x: 220, y: 220, val: 'E' }, { id: 5, x: 340, y: 200, val: 'F' }],
      edges: [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 4, b: 5 }] };
    const st = [{ state: { nodes: g.nodes, edges: g.edges, hi: { 0: 'current' } }, note: 'Spread from A like a ripple', line: 0 }];
    const q = [0], vis = new Set([0]);
    while (q.length) { const v = q.shift(); const hi = {}; vis.forEach(x => hi[x] = 'visited'); hi[v] = 'current';
      st.push({ state: { nodes: g.nodes, edges: g.edges, hi }, note: 'Visit ' + g.nodes[v].val, line: 3 });
      g.edges.forEach(e => { const nb = e.a === v ? e.b : e.b === v ? e.a : -1;
        if (nb >= 0 && !vis.has(nb)) { vis.add(nb); q.push(nb);
          const h2 = {}; vis.forEach(x => h2[x] = 'visited'); h2[nb] = 'current';
          st.push({ state: { nodes: g.nodes, edges: g.edges, hi: h2, edgeHi: { [v + '-' + nb]: 'visited' } }, note: 'Discover ' + g.nodes[nb].val + ' via the glowing edge', line: 5 }); } }); }
    return { id: 'bfs', title: 'Breadth-First Search', kind: 'graph', code: CODE, meta: META.bfsGraph, steps: st, regenerate: () => bfsGraph() }; }
  function ret(id, title, code, st, regen, custom) { return { id, title, kind: 'array', code, meta: META[id], steps: st, regenerate: regen, custom }; }

  const GEN = { bubble: () => bubble(rand(8, 1, 40)), selection: () => selection(rand(8, 1, 40)), insertion: () => insertion(rand(8, 1, 40)), linear: () => { const a = rand(10, 1, 50); return linear(a, pick(a)); }, binary: () => { const a = rand(10, 1, 50); return binary(a, pick(a)); }, dfsTree, bfsGraph };
  const genFor = id => GEN[id] || ((window.AE3301_PRACTICAL || []).find(p => p.id === id) || {}).gen || (window.AE3301_DP || {})[id];
  window.AE3301_GEN = GEN;
  /* ---------- catalog page ---------- */
  const F = { q: '', cat: 'all', diff: 'all', type: 'all' };
  function page() {
    const cats = [...new Set(CAT.map(c => c.cat))];
    const types = [...new Set(CAT.map(c => c.type))];
    const shown = CAT.filter(c => genFor(c.gen || c.id)).length;
    const list = CAT.filter(c =>
      (F.cat === 'all' || c.cat === F.cat) && (F.diff === 'all' || c.diff === F.diff) &&
      (F.type === 'all' || c.type === F.type) && (!F.q || c.name.toLowerCase().includes(F.q.toLowerCase())));
    return '<div class="page-head"><div class="kicker">◉ VISUALIZE · PART OF LEARN</div><h1>ALGORITHM LAB</h1>' +
      '<p class="muted">Master DSA through interactive visualizations — step-by-step execution with complexity analysis.</p></div>' +
      '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:14px">' +
      stat(CAT.length, 'Total Algorithms', 'var(--ink)') + stat(cats.length, 'Categories', 'var(--green)') + stat(3, 'Difficulty Levels', 'var(--gold)') + stat(shown, 'Shown (live)', 'var(--acc)') + '</div>' +
      '<div class="card" style="padding:16px;margin-bottom:16px"><b>⛃ Filters & Search</b>' +
      '<div style="display:grid;gap:10px;grid-template-columns:1fr 1fr;margin-top:10px">' +
      '<input class="code-box" data-f="q" placeholder="Search algorithms…" style="min-height:44px;color:var(--ink)" value="' + F.q + '">' +
      '<select class="code-box" data-f="cat" style="min-height:44px;color:var(--ink)"><option value="all">All Categories</option>' + cats.map(c => '<option' + (F.cat === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select>' +
      '<select class="code-box" data-f="diff" style="min-height:44px;color:var(--ink)"><option value="all">All Levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>' +
      '<select class="code-box" data-f="type" style="min-height:44px;color:var(--ink)"><option value="all">All Types</option>' + types.map(t => '<option' + (F.type === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div></div>' +
      cats.map(cat => {
        const items = list.filter(c => c.cat === cat);
        if (!items.length) return '';
        return '<h3 style="margin:20px 0 4px;font-size:1.05rem">' + (CATI[cat] || '◉') + ' ' + cat + '</h3>' +
          '<p class="mono faint" style="font-size:.7rem;margin-bottom:10px">' + items.length + ' algorithm' + (items.length > 1 ? 's' : '') + '</p>' +
          '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">' + items.map(card).join('') + '</div>';
      }).join('') +
      '<div data-stage style="margin-top:18px"></div>';
  }
  const stat = (n, l, c) => '<div class="card" style="padding:14px;text-align:center"><div style="font:800 1.6rem var(--fd);color:' + c + '">' + n + '</div><div class="mono faint" style="font-size:.68rem">' + l + '</div></div>';
  function card(c) {
    const live = genFor(c.gen || c.id);
    return '<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">' +
      '<div style="display:flex;gap:8px;align-items:flex-start"><b style="flex:1;font-size:1rem">' + c.name + '</b>' +
      '<span class="mono" style="font-size:.6rem;border-radius:99px;padding:3px 9px;color:' + DIFFC[c.diff] + ';border:1px solid ' + DIFFC[c.diff] + '">' + c.diff + '</span>' +
      '<span class="mono" style="font-size:.6rem;border-radius:99px;padding:3px 9px;border:1px solid var(--line);color:var(--dim)">' + c.type + '</span></div>' +
      '<p class="muted" style="font-size:.8rem;flex:1">' + c.desc + '</p>' +
      '<div class="mono" style="font-size:.68rem;color:var(--dim)">🕐 Time: <span style="border:1px solid var(--line);border-radius:6px;padding:2px 7px;color:var(--ink)">' + c.time + '</span></div>' +
      '<div class="mono" style="font-size:.68rem;color:var(--dim)">💾 Space: <span style="border:1px solid var(--line);border-radius:6px;padding:2px 7px;color:var(--ink)">' + c.space + '</span></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + c.tags.map(t => '<span class="mono" style="font-size:.6rem;background:var(--panel3);border-radius:6px;padding:3px 8px;color:var(--dim)">' + t + '</span>').join('') + '</div>' +
      (live ? '<button class="btn btn-primary" data-run="' + c.id + '" style="width:100%">Visualize Algorithm →</button>'
            : '<button class="btn btn-ghost" disabled style="width:100%;opacity:.5">SOON</button>') + '</div>';
  }
  function run(id) {
    const g = genFor(id); if (!g) return;
    const v = document.getElementById('view');
    window.AE3301_VIZ_ENGINE.mount(v.querySelector('[data-stage]'), g());
    v.querySelector('[data-stage]').scrollIntoView({ behavior: 'smooth' });
  }
  function mount() {
    const h = (location.hash || '').replace('#', '');
    document.querySelectorAll('[data-nav]').forEach(x => x.classList.toggle('active', x.dataset.nav === 'learn' && h === '/learn'));
    if (h === '/learn') { learnStrip(); return; }
    if (!h.startsWith('/visualize')) return;
    const id = h.split('/')[2];
    const v = document.getElementById('view');
    v.innerHTML = page();
    document.title = 'Visualize · AE3301';
    v.querySelectorAll('[data-f]').forEach(el => {
      el.oninput = el.onchange = () => { F[el.dataset.f] = el.value; const sc = el.selectionStart; mount(); if (el.dataset.f === 'q') { const i = v.querySelector('[data-f="q"]'); i.focus(); i.setSelectionRange(sc, sc); } };
    });
    v.querySelectorAll('[data-run]').forEach(b => b.onclick = () => run(b.dataset.run));
    if (id) run(id);
  }
  function learnStrip() {
    const v = document.getElementById('view');
    if (!v || v.querySelector('[data-labstrip]')) return;
    const live = CAT.filter(c => genFor(c.gen || c.id));
    const div = document.createElement('div'); div.dataset.labstrip = '1';
    div.innerHTML = '<div class="card" style="margin-top:18px;padding:16px"><div class="kicker">◉ VISUALIZATIONS</div>' +
      '<p class="muted" style="margin:6px 0 12px">Every topic, moving. Tap to watch it think.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' + live.map(a => '<a class="btn btn-ghost btn-sm" href="#/visualize/' + a.id + '">◉ ' + a.name + '</a>').join('') + '</div></div>';
    v.appendChild(div);
  }
  addEventListener('hashchange', () => setTimeout(mount, 0));
  setTimeout(mount, 60);
})();
