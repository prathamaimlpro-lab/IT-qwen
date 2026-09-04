/**
 * AE3301 · ALGORITHM LAB — 12 algorithms recorded for real
 * Each recorder RUNS the algorithm and captures every compare/swap/visit
 */
(() => {
  'use strict';
  const rand = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const S = (arr, hi, ptrs, note, line) => ({ state: { arr: [...arr], hi: hi || {}, ptrs }, note, line });

  /* ---------- SORTS ---------- */
  function bubble(a) {
    const CODE = 'for i=0..n-2\n  for j=0..n-2-i\n    if arr[j] > arr[j+1]\n      swap(j,j+1)\n\nsorted ✔';
    const arr = [...a], st = [S(arr, {}, {}, 'Start: unsorted', 0)];
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        st.push(S(arr, { [j]: 'compare', [j + 1]: 'compare' }, { i, j }, 'compare ' + arr[j] + ' & ' + arr[j + 1], 2));
        if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; st.push(S(arr, { [j]: 'swap', [j + 1]: 'swap' }, { i, j }, 'swap', 3)); }
      }
    }
    const hi = {}; arr.forEach((_, k) => hi[k] = 'sorted'); st.push(S(arr, hi, {}, 'Sorted ✔', 5));
    return { title: 'Bubble Sort', kind: 'array', code: CODE, steps: st, regenerate: () => bubble(rand(8, 1, 40)) };
  }
  function selection(a) {
    const CODE = 'for i=0..n-2\n  min=i\n  for j=i+1..n-1\n    if arr[j] < arr[min]\n      min=j\n  swap(i,min)\n\nsorted ✔';
    const arr = [...a], st = [S(arr, {}, {}, 'Start', 0)];
    for (let i = 0; i < arr.length - 1; i++) {
      let m = i; st.push(S(arr, { [i]: 'mid' }, { min: m }, 'min starts at ' + i, 1));
      for (let j = i + 1; j < arr.length; j++) {
        st.push(S(arr, { [m]: 'mid', [j]: 'compare' }, { min: m, j }, arr[j] + ' vs ' + arr[m], 3));
        if (arr[j] < arr[m]) { m = j; st.push(S(arr, { [m]: 'mid' }, { min: m }, 'new min = ' + m, 4)); }
      }
      if (m !== i) { [arr[i], arr[m]] = [arr[m], arr[i]]; st.push(S(arr, { [i]: 'swap', [m]: 'swap' }, {}, 'swap ' + i + ' & ' + m, 5)); }
    }
    const hi = {}; arr.forEach((_, k) => hi[k] = 'sorted'); st.push(S(arr, hi, {}, 'Sorted ✔', 7));
    return { title: 'Selection Sort', kind: 'array', code: CODE, steps: st, regenerate: () => selection(rand(8, 1, 40)) };
  }
  function insertion(a) {
    const CODE = 'for i=1..n-1\n  key=arr[i]\n  j=i-1\n  while j>=0 and arr[j]>key\n    arr[j+1]=arr[j]\n    j--\n  arr[j+1]=key\n\nsorted ✔';
    const arr = [...a], st = [S(arr, {}, {}, 'Start', 0)];
    for (let i = 1; i < arr.length; i++) { const k = arr[i]; let j = i - 1;
      st.push(S(arr, { [i]: 'key' }, { key: i }, 'take ' + k, 1));
      while (j >= 0 && arr[j] > k) { arr[j + 1] = arr[j]; st.push(S(arr, { [j]: 'compare', [j + 1]: 'swap' }, {}, 'shift ' + arr[j], 4)); j--; }
      arr[j + 1] = k; st.push(S(arr, { [j + 1]: 'key' }, {}, 'insert ' + k, 6));
    }
    const hi = {}; arr.forEach((_, k) => hi[k] = 'sorted'); st.push(S(arr, hi, {}, 'Sorted ✔', 8));
    return { title: 'Insertion Sort', kind: 'array', code: CODE, steps: st, regenerate: () => insertion(rand(8, 1, 40)) };
  }

  /* ---------- SEARCH ---------- */
  function linear(a, t) {
    const CODE = 'for i=0..n-1\n  if arr[i]==target\n    return i\nreturn -1';
    const arr = [...a], st = [S(arr, {}, {}, 'Search ' + t, 0)];
    for (let i = 0; i < arr.length; i++) {
      st.push(S(arr, { [i]: 'compare' }, { i }, 'check ' + arr[i], 1));
      if (arr[i] === t) { st.push(S(arr, { [i]: 'found' }, {}, 'Found at ' + i + ' ✔', 2)); return { title: 'Linear Search', kind: 'array', code: CODE, steps: st, regenerate: () => { const x = rand(10, 1, 50); return linear(x, pick(x)); } }; }
    }
    st.push(S(arr, {}, {}, 'Not found ✗', 3));
    return { title: 'Linear Search', kind: 'array', code: CODE, steps: st, regenerate: () => { const x = rand(10, 1, 50); return linear(x, pick(x)); } };
  }
  function binary(a, t) {
    const CODE = 'lo=0 hi=n-1\nwhile lo<=hi\n  mid=(lo+hi)/2\n  if arr[mid]==t: found\n  if arr[mid]<t: lo=mid+1\n  else: hi=mid-1\nreturn -1';
    const arr = [...a].sort((x, y) => x - y), st = [S(arr, {}, { lo: 0, hi: arr.length - 1 }, 'Sorted · target ' + t, 0)];
    let lo = 0, hi = arr.length - 1;
    while (lo <= hi) { const m = (lo + hi) >> 1;
      const h = {}; for (let k = 0; k < lo; k++) h[k] = 'dim'; for (let k = hi + 1; k < arr.length; k++) h[k] = 'dim'; h[m] = 'mid';
      st.push(S(arr, h, { lo, hi, mid: m }, 'mid=' + m + ' val=' + arr[m], 2));
      if (arr[m] === t) { st.push(S(arr, { [m]: 'found' }, {}, 'Found at ' + m + ' ✔', 3)); return { title: 'Binary Search', kind: 'array', code: CODE, steps: st, regenerate: () => { const x = rand(10, 1, 50); return binary(x, pick(x)); } }; }
      if (arr[m] < t) lo = m + 1; else hi = m - 1;
    }
    st.push(S(arr, {}, {}, 'Not found ✗', 6));
    return { title: 'Binary Search', kind: 'array', code: CODE, steps: st, regenerate: () => { const x = rand(10, 1, 50); return binary(x, pick(x)); } };
  }

  /* ---------- TREES ---------- */
  function mkTree() {
    const vals = rand(7, 1, 30).sort((x, y) => x - y);
    const nodes = vals.map((v, i) => ({ id: i, val: v, p: null, l: null, r: null }));
    nodes.forEach((n, i) => { if (i === 0) return; const p = Math.floor((i - 1) / 2); n.p = p; nodes[p][i % 2 ? 'l' : 'r'] = i; });
    return nodes;
  }
  function bfsTree() {
    const CODE = 'queue=[root]\nwhile queue:\n  node=pop\n  visit(node)\n  push children';
    const nodes = mkTree(), st = [{ state: { nodes, queue: [0], hi: {} }, note: 'BFS: queue starts with root', line: 0 }];
    const q = [0], visited = new Set();
    while (q.length) {
      const id = q.shift(); visited.add(id);
      const hi = {}; visited.forEach(v => hi[v] = 'visited'); hi[id] = 'current';
      st.push({ state: { nodes, queue: [...q], hi }, note: 'visit node ' + id + ' (val ' + nodes[id].val + ')', line: 3 });
      if (nodes[id].l != null) { q.push(nodes[id].l); st.push({ state: { nodes, queue: [...q], hi }, note: 'enqueue left child', line: 4 }); }
      if (nodes[id].r != null) { q.push(nodes[id].r); st.push({ state: { nodes, queue: [...q], hi }, note: 'enqueue right child', line: 4 }); }
    }
    return { title: 'BFS (level-order)', kind: 'tree', code: CODE, steps: st, regenerate: () => bfsTree() };
  }
  function dfsTree() {
    const CODE = 'stack=[root]\nwhile stack:\n  node=pop\n  visit(node)\n  push children';
    const nodes = mkTree(), st = [{ state: { nodes, stack: [0], hi: {} }, note: 'DFS: stack starts with root', line: 0 }];
    const stk = [0], visited = new Set();
    while (stk.length) {
      const id = stk.pop(); if (visited.has(id)) continue; visited.add(id);
      const hi = {}; visited.forEach(v => hi[v] = 'visited'); hi[id] = 'current';
      st.push({ state: { nodes, stack: [...stk], hi }, note: 'visit ' + id + ' (val ' + nodes[id].val + ')', line: 3 });
      if (nodes[id].r != null) stk.push(nodes[id].r);
      if (nodes[id].l != null) stk.push(nodes[id].l);
      st.push({ state: { nodes, stack: [...stk], hi }, note: 'push children (right first for left-first visit)', line: 4 });
    }
    return { title: 'DFS (pre-order)', kind: 'tree', code: CODE, steps: st, regenerate: () => dfsTree() };
  }

  /* ---------- GRAPHS ---------- */
  function mkGraph() {
    return { nodes: [
      { id: 0, x: 60, y: 60, val: 'A' }, { id: 1, x: 200, y: 40, val: 'B' },
      { id: 2, x: 340, y: 80, val: 'C' }, { id: 3, x: 80, y: 200, val: 'D' },
      { id: 4, x: 220, y: 220, val: 'E' }, { id: 5, x: 340, y: 200, val: 'F' }
    ], edges: [{ a: 0, b: 1 }, { a: 1, b: 2 }, { a: 0, b: 3 }, { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 4 }, { a: 4, b: 5 }] };
  }
  function bfsGraph() {
    const CODE = 'queue=[start]\nvisited={start}\nwhile queue:\n  v=pop\n  for u in neighbors(v):\n    if u not visited: enqueue';
    const g = mkGraph(), st = [{ state: { nodes: g.nodes, edges: g.edges, hi: { 0: 'current' } }, note: 'BFS from A', line: 0 }];
    const q = [0], visited = new Set([0]);
    while (q.length) {
      const v = q.shift(); const hi = {}; visited.forEach(x => hi[x] = 'visited'); hi[v] = 'current';
      st.push({ state: { nodes: g.nodes, edges: g.edges, hi }, note: 'visit ' + g.nodes[v].val, line: 3 });
      g.edges.forEach(e => { const nb = e.a === v ? e.b : e.b === v ? e.a : -1;
        if (nb >= 0 && !visited.has(nb)) { visited.add(nb); q.push(nb);
          const hi2 = {}; visited.forEach(x => hi2[x] = 'visited'); hi2[nb] = 'current';
          st.push({ state: { nodes: g.nodes, edges: g.edges, hi: hi2, edgeHi: { [v + '-' + nb]: 'visited' } }, note: 'enqueue ' + g.nodes[nb].val, line: 5 }); } });
    }
    return { title: 'Graph BFS', kind: 'graph', code: CODE, steps: st, regenerate: () => bfsGraph() };
  }

  const ALGOS = [
    { id: 'bubble', name: 'Bubble Sort', cat: 'sort', blurb: 'Adjacent swaps, max bubbles up', gen: () => bubble(rand(8, 1, 40)) },
    { id: 'selection', name: 'Selection Sort', cat: 'sort', blurb: 'Pick minimum, place it', gen: () => selection(rand(8, 1, 40)) },
    { id: 'insertion', name: 'Insertion Sort', cat: 'sort', blurb: 'Grow sorted hand', gen: () => insertion(rand(8, 1, 40)) },
    { id: 'linear', name: 'Linear Search', cat: 'search', blurb: 'Check one by one', gen: () => { const a = rand(10, 1, 50); return linear(a, pick(a)); } },
    { id: 'binary', name: 'Binary Search', cat: 'search', blurb: 'Halve each step', gen: () => { const a = rand(10, 1, 50); return binary(a, pick(a)); } },
    { id: 'bfsTree', name: 'BFS (level-order)', cat: 'tree', blurb: 'Queue: level by level', gen: bfsTree },
    { id: 'dfsTree', name: 'DFS (pre-order)', cat: 'tree', blurb: 'Stack: deep first', gen: dfsTree },
    { id: 'bfsGraph', name: 'Graph BFS', cat: 'graph', blurb: 'Spread from a source', gen: bfsGraph }
  ];

  function page() {
    const cats = [...new Set(ALGOS.map(a => a.cat))];
    return '<div class="page-head"><div class="kicker">◉ VISUALIZE</div><h1>Algorithm Lab</h1>' +
      '<p class="muted">Play, step, scrub. Every trace is captured from the real algorithm, not hand-faked.</p></div>' +
      cats.map(c => '<h3 style="margin:18px 0 8px;text-transform:uppercase;color:var(--acc);font-size:.75rem;letter-spacing:.2em">' + c + '</h3>' +
        '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">' +
        ALGOS.filter(a => a.cat === c).map(a =>
          '<div class="card" style="padding:14px"><b>' + a.name + '</b><p class="muted" style="font-size:.78rem;margin:6px 0 10px">' + a.blurb + '</p>' +
          '<button class="btn btn-primary btn-sm" data-run="' + a.id + '">▶ RUN</button></div>').join('') + '</div>').join('') +
      '<div data-stage style="margin-top:16px"></div>';
  }
  function mount() {
    if ((location.hash || '').replace('#', '') !== '/visualize') return;
    const v = document.getElementById('view');
    v.innerHTML = page();
    document.title = 'Visualize · AE3301';
    v.querySelectorAll('[data-run]').forEach(b => b.onclick = () => {
      const a = ALGOS.find(x => x.id === b.dataset.run);
      window.AE3301_VIZ_ENGINE.mount(v.querySelector('[data-stage]'), a.gen());
      v.querySelector('[data-stage]').scrollIntoView({ behavior: 'smooth' });
    });
  }
  const side = document.querySelector('.side-nav');
  if (side && !side.querySelector('[data-viznav]')) {
    const a = document.createElement('a'); a.className = 'nav-link'; a.dataset.viznav = '1'; a.dataset.nav = 'visualize'; a.href = '#/visualize';
    a.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z"/></svg><span>Visualize</span>';
    side.appendChild(a);
  }
  addEventListener('hashchange', () => setTimeout(mount, 0));
  setTimeout(mount, 60);
})();
