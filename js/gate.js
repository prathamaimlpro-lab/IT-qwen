/**
 * ================================================================
 *  AE3301 · ACCESS GATE v5 — student site, zero admin surfaces
 *  · free preview (home + curriculum titles) for everyone
 *  · protected routes → Unlock panel (key / account)
 *  · license = account w/ bound key | valid stored key
 *  · merges admin-authored questions from /api/qlist
 *  · admin console lives ONLY at /admin.html
 * ================================================================
 */
(() => {
  'use strict';
  const AK = 'ae3301:apikey', TK = 'ae3301:token';
  const post = (p, b) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json()).catch(() => ({ err: 'network' }));

  /* dark-only + hide legacy theme toggle */
  document.body.classList.add('dark'); localStorage.setItem('ae3301:dark', '1');
  setInterval(() => { const t = document.querySelector('[data-th]'); if (t) t.style.display = 'none'; }, 800);

  /* ---------- merge admin-authored questions (from /admin.html) ---------- */
  import('./data.js').then(({ QUESTIONS }) => {
    const seen = new Set();
    fetch('/api/qlist').then(r => r.ok ? r.json() : []).then(rows => {
      (Array.isArray(rows) ? rows : []).forEach(r => {
        if (seen.has(r.id)) return; seen.add(r.id);
        const orig = JSON.parse(r.options || '[]');
        const idx = [0, 1, 2, 3].sort(() => Math.random() - .5);
        const opts = idx.map(i => orig[i]); const ans = idx.indexOf(0);
        (QUESTIONS[r.topic] = QUESTIONS[r.topic] || []).push({
          id: 'x-' + r.id, tier: r.tier, tags: [(r.topic || '').replace('cb-', '') || 'custom'],
          q: r.q, options: opts, answer: ans, explain: r.explain,
          hint: r.hint || 'Think it through.',
          wrongWhy: opts.map((o, i) => i === ans ? '' : 'Not quite — read the explanation after answering.')
        });
      });
    }).catch(() => {});
  });

  const PROTECTED = [/^\/lesson\//, /^\/level\//, /^\/arena/, /^\/problems/, /^\/practice\//, /^\/community/, /^\/profile/];
  let unlocked = false;

  function unlockView() {
    const view = document.getElementById('view'); if (!view) return;
    const tk = localStorage.getItem(TK);
    view.innerHTML =
      '<div style="max-width:560px;margin:8vh auto;text-align:center;padding:0 16px">' +
      '<div style="font:800 2.4rem var(--fd)">AE3301</div>' +
      '<p class="muted" style="margin:8px 0 4px">You’re browsing the free preview.</p>' +
      '<p class="muted" style="margin-bottom:22px">Lessons, problems, community & profile are for <b style="color:var(--acc)">licensed learners</b>.</p>' +
      '<div class="card" style="padding:20px;text-align:left">' +
      '<b>🔑 Unlock with your API key</b>' +
      '<input id="u-key" class="code-box" style="min-height:52px;width:100%;margin-top:8px;color:var(--ink)" placeholder="AE-XXXX-XXXX">' +
      '<button id="u-go" class="btn btn-primary" style="width:100%;margin-top:10px">UNLOCK CONTENT</button>' +
      '<p id="u-err" style="color:var(--red);font-size:.8rem;margin-top:8px;min-height:1em"></p>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap">' +
      '<button class="btn btn-ghost btn-sm" id="u-acct">I have an account</button>' +
      '<a class="btn btn-ghost btn-sm" href="#/learn">Browse curriculum (free)</a></div></div></div>';
    view.querySelector('#u-go').onclick = async () => {
      const k = view.querySelector('#u-key').value.trim();
      const d = tk ? await post('/api/bindkey', { token: tk, key: k }) : await post('/api/activate', { key: k });
      if (d.ok) { if (!tk) localStorage.setItem(AK, k); location.reload(); }
      else view.querySelector('#u-err').textContent = '✗ ' + (d.err || 'invalid key');
    };
    view.querySelector('#u-acct').onclick = () => window.AE3301_AUTH && window.AE3301_AUTH.open();
  }

  function enforce() {
    const h = (location.hash || '').replace('#', '');
    if (unlocked) return;
    if (PROTECTED.some(r => r.test(h))) { unlockView(); return; }
    if ((h === '' || h === '/home') && !document.querySelector('[data-preview]')) {
      const pc = document.querySelector('.page-head');
      pc && pc.insertAdjacentHTML('afterend',
        '<div class="card" data-preview style="margin:0 0 16px;padding:14px 18px;display:flex;gap:10px;align-items:center;border:1px dashed var(--acc)">' +
        '<span style="flex:1">👀 <b>Free preview.</b> Unlock full lessons, problems & community with your API key.</span>' +
        '<a class="btn btn-primary btn-sm" href="#/lesson/cb-computer">UNLOCK</a></div>');
    }
  }

  async function boot() {
    const tk = localStorage.getItem(TK);
    if (tk) { const d = await post('/api/access', { token: tk }); if (d.ok) { unlocked = true; return; } }
    const key = localStorage.getItem(AK);
    if (key) { const d = await post('/api/keycheck', { key }); if (d.ok) { unlocked = true; return; } }
    unlocked = false;
    enforce();
  }

  addEventListener('hashchange', () => setTimeout(enforce, 20));
  setTimeout(boot, 40);
})();
