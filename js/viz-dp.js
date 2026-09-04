/**
 * AE3301 · DP VISUALIZERS — real table-fills, cell by cell
 */
(() => {
  'use strict';
  const P = (rows, cl, rl, hi, note, line) => ({ state: { rows: rows.map(r => [...r]), cl, rl, hi: hi || {} }, note, line });
  const num = v => v === '∞' ? Infinity : v;

  function fib() {
    const n = 10, cl = Array.from({ length: n + 1 }, (_, i) => i), rl = ['dp'];
    const rows = [Array(n + 1).fill('·')];
    const CODE = 'dp[0]=0; dp[1]=1\nfor i=2..n:\n  dp[i]=dp[i-1]+dp[i-2]\nanswer dp[n]';
    const st = [P(rows, cl, rl, {}, 'We want fib(' + n + '): build a table so nothing is recomputed', 0)];
    rows[0][0] = 0; st.push(P(rows, cl, rl, { '0_0': 'current' }, 'dp[0] = 0', 0));
    rows[0][1] = 1; st.push(P(rows, cl, rl, { '0_1': 'current' }, 'dp[1] = 1', 0));
    for (let i = 2; i <= n; i++) {
      st.push(P(rows, cl, rl, { ['0_' + (i - 1)]: 'compare', ['0_' + (i - 2)]: 'compare' }, 'read dp[' + (i - 1) + ']=' + rows[0][i - 1] + ' and dp[' + (i - 2) + ']=' + rows[0][i - 2], 1));
      rows[0][i] = rows[0][i - 1] + rows[0][i - 2];
      st.push(P(rows, cl, rl, { ['0_' + i]: 'current' }, 'dp[' + i + '] = ' + rows[0][i], 2));
    }
    const hi = {}; for (let c = 0; c <= n; c++) hi['0_' + c] = 'sorted';
    st.push(P(rows, cl, rl, hi, 'fib(' + n + ') = ' + rows[0][n] + ' ✔ each cell computed once', 3));
    return { id: 'fib', title: 'Fibonacci (DP)', kind: 'matrix', code: CODE, meta: { time: 'O(n)', space: 'O(n)' }, steps: st, regenerate: fib };
  }

  function knapsack() {
    const items = [{ w: 1, v: 1 }, { w: 3, v: 4 }, { w: 4, v: 5 }], W = 4;
    const cl = Array.from({ length: W + 1 }, (_, i) => i), rl = ['—'].concat(items.map((it, i) => 'item' + (i + 1) + ' (w' + it.w + ',v' + it.v + ')'));
    const rows = Array.from({ length: items.length + 1 }, () => Array(W + 1).fill(0));
    const CODE = 'for i in items:\n  for w=0..W:\n    skip=dp[i-1][w]\n    take= w>=wi ? dp[i-1][w-wi]+vi\n    dp[i][w]=max(skip,take)';
    const st = [P(rows, cl, rl, {}, 'Capacity ' + W + ', 3 items. dp[i][w] = best value with first i items, weight ≤ w', 0)];
    for (let i = 1; i <= items.length; i++) for (let w = 0; w <= W; w++) {
      const skip = rows[i - 1][w]; const hi = { [(i - 1) + '_' + w]: 'compare' };
      let best = skip, note = 'item' + i + ': skip → ' + skip;
      if (w >= items[i - 1].w) { const take = rows[i - 1][w - items[i - 1].w] + items[i - 1].v; hi[(i - 1) + '_' + (w - items[i - 1].w)] = 'compare'; note = 'skip ' + skip + ' vs take ' + take; best = Math.max(skip, take); }
      st.push(P(rows, cl, rl, hi, note, 2));
      rows[i][w] = best;
      st.push(P(rows, cl, rl, { [i + '_' + w]: 'current' }, 'write dp[' + i + '][' + w + '] = ' + best, 3));
    }
    st.push(P(rows, cl, rl, { [items.length + '_' + W]: 'found' }, 'Best value = ' + rows[items.length][W] + ' ✔', 3));
    return { id: 'knapsack', title: '0/1 Knapsack', kind: 'matrix', code: CODE, meta: { time: 'O(n·W)', space: 'O(n·W)' }, steps: st, regenerate: knapsack };
  }

  function lcs() {
    const s1 = 'ABCB', s2 = 'BDC';
    const cl = ['∅'].concat(s1.split('')), rl = ['∅'].concat(s2.split(''));
    const rows = Array.from({ length: s2.length + 1 }, () => Array(s1.length + 1).fill(0));
    const CODE = 'for r in 1..|s2|:\n  for c in 1..|s1|:\n    if s1[c]==s2[r]: dp=diag+1\n    else: dp=max(top,left)';
    const st = [P(rows, cl, rl, {}, 'LCS of "' + s1 + '" and "' + s2 + '": match → diagonal+1, else max(top,left)', 0)];
    for (let r = 1; r <= s2.length; r++) for (let c = 1; c <= s1.length; c++) {
      if (s1[c - 1] === s2[r - 1]) { st.push(P(rows, cl, rl, { [(r - 1) + '_' + (c - 1)]: 'compare' }, '“' + s1[c - 1] + '” matches → diagonal ' + rows[r - 1][c - 1] + ' + 1', 2)); rows[r][c] = rows[r - 1][c - 1] + 1; }
      else { st.push(P(rows, cl, rl, { [(r - 1) + '_' + c]: 'compare', [r + '_' + (c - 1)]: 'compare' }, 'no match → max(top ' + rows[r - 1][c] + ', left ' + rows[r][c - 1] + ')', 2)); rows[r][c] = Math.max(rows[r - 1][c], rows[r][c - 1]); }
      st.push(P(rows, cl, rl, { [r + '_' + c]: 'current' }, 'write ' + rows[r][c], 2));
    }
    const hi = {}; let r = s2.length, c = s1.length;
    while (r > 0 && c > 0) { if (s1[c - 1] === s2[r - 1]) { hi[r + '_' + c] = 'sorted'; r--; c--; } else if (rows[r - 1][c] > rows[r][c - 1]) r--; else c--; }
    st.push(P(rows, cl, rl, hi, 'Green traceback = the LCS (length ' + rows[s2.length][s1.length] + ') ✔', 2));
    return { id: 'lcs', title: 'Longest Common Subsequence', kind: 'matrix', code: CODE, meta: { time: 'O(n·m)', space: 'O(n·m)' }, steps: st, regenerate: lcs };
  }

  function lis() {
    const a = [10, 9, 2, 5, 3, 7, 101, 18];
    const cl = a.map((_, i) => i), rl = ['a', 'dp'];
    const rows = [a.slice(), Array(a.length).fill('·')];
    const CODE = 'for i in 0..n-1:\n  dp[i]=1\n  for j<i:\n    if a[j]<a[i]:\n      dp[i]=max(dp[i],dp[j]+1)';
    const st = [P(rows, cl, rl, {}, 'LIS: longest strictly increasing subsequence', 0)];
    let best = 0, bi = 0;
    for (let i = 0; i < a.length; i++) {
      rows[1][i] = 1;
      st.push(P(rows, cl, rl, { ['1_' + i]: 'current' }, 'dp[' + i + '] = 1 (the element alone)', 0));
      for (let j = 0; j < i; j++) if (a[j] < a[i]) {
        st.push(P(rows, cl, rl, { ['0_' + j]: 'compare', ['1_' + j]: 'compare' }, a[j] + ' < ' + a[i] + ' → try dp[' + j + ']+1 = ' + (rows[1][j] + 1), 2));
        if (rows[1][j] + 1 > rows[1][i]) { rows[1][i] = rows[1][j] + 1; st.push(P(rows, cl, rl, { ['1_' + i]: 'current' }, 'improve dp[' + i + '] → ' + rows[1][i], 3)); }
      }
      if (rows[1][i] > best) { best = rows[1][i]; bi = i; }
    }
    st.push(P(rows, cl, rl, { ['1_' + bi]: 'found' }, 'LIS length = ' + best + ' ✔', 3));
    return { id: 'lis', title: 'Longest Increasing Subsequence', kind: 'matrix', code: CODE, meta: { time: 'O(n²)', space: 'O(n)' }, steps: st, regenerate: lis };
  }

  function coin() {
    const coins = [1, 3, 4], A = 6;
    const cl = Array.from({ length: A + 1 }, (_, i) => i), rl = ['—'].concat(coins.map(c => 'coin ' + c));
    const rows = Array.from({ length: coins.length + 1 }, () => Array(A + 1).fill('∞'));
    rows[0][0] = 0;
    const CODE = 'dp[0]=0, rest=∞\nfor coin in coins:\n  for a=coin..A:\n    dp[a]=min(dp[a],dp[a-coin]+1)';
    const st = [P(rows, cl, rl, { '0_0': 'current' }, 'Fewest coins for every amount up to ' + A + '; ∞ = impossible so far', 0)];
    for (let i = 1; i <= coins.length; i++) {
      for (let a = 0; a <= A; a++) rows[i][a] = rows[i - 1][a];
      st.push(P(rows, cl, rl, {}, 'copy row (without coin ' + coins[i - 1] + ')', 1));
      for (let a = coins[i - 1]; a <= A; a++) {
        const skip = rows[i][a], prev = rows[i][a - coins[i - 1]];
        const take = prev === '∞' ? '∞' : prev + 1;
        st.push(P(rows, cl, rl, { [i + '_' + (a - coins[i - 1])]: 'compare' }, 'coin ' + coins[i - 1] + ': skip ' + skip + ' vs take ' + take, 2));
        rows[i][a] = Math.min(num(skip), num(take));
        st.push(P(rows, cl, rl, { [i + '_' + a]: 'current' }, 'dp[' + a + '] = ' + rows[i][a], 2));
      }
    }
    st.push(P(rows, cl, rl, { [coins.length + '_' + A]: 'found' }, 'Answer: ' + rows[coins.length][A] + ' coins ✔ (greedy would fail here)', 2));
    return { id: 'coin', title: 'Coin Change', kind: 'matrix', code: CODE, meta: { time: 'O(n·amount)', space: 'O(amount)' }, steps: st, regenerate: coin };
  }

  window.AE3301_DP = { fib, knapsack, lcs, lis, coin };
})();
