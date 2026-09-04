/**
 * ================================================================
 *  AE3301 · ACCESS GATE
 *  · No valid API key → fullscreen lock; site unusable.
 *  · Admin login (admin / pratham.3438) bypasses + opens key factory.
 *  · Legacy top-bar ADMIN / +Q chips hidden; admin tools live in
 *    the sidebar "Admin" panel (key gen 7d/1mo/6mo/1y, revoke, copy,
 *    and question authoring via the hidden ✚ Q engine).
 * ================================================================
 */
(() => {
  'use strict';
  const AK = 'ae3301:apikey', AT = 'ae3301:admintoken', AKEY = 'ae3301:adminkey';
  const post = (p, b) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json()).catch(() => ({ err: 'network' }));

  document.head.insertAdjacentHTML('beforeend', '<style>[data-admin],[data-admin2]{display:none!important}</style>');

  function lockScreen() {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:20000;background:var(--bg0,#0b0b0b);color:var(--ink,#f2f0ea);display:grid;place-items:center;padding:20px';
    ov.innerHTML = '<div style="width:min(440px,94vw);text-align:center">' +
      '<div style="font:800 2.2rem var(--fd,sans-serif)">AE3301</div>' +
      '<p class="muted" style="margin:6px 0 18px">Licensed platform. Enter your API key to unlock.</p>' +
      '<div data-pane="key"><input id="g-key" class="code-box" style="min-height:52px;width:100%;color:var(--ink)" placeholder="API key (AE-XXXX-XXXX)">' +
      '<button id="g-go" class="btn btn-primary" style="margin-top:10px;width:100%">UNLOCK</button></div>' +
      '<div data-pane="admin" style="display:none"><input id="g-u" class="code-box" style="min-height:46px;width:100%;color:var(--ink)" placeholder="username">' +
      '<input id="g-p" type="password" class="code-box" style="min-height:46px;width:100%;color:var(--ink);margin-top:8px" placeholder="password">' +
      '<button id="g-ad" class="btn btn-primary" style="margin-top:10px;width:100%">ADMIN LOGIN</button></div>' +
      '<p style="margin-top:14px"><button class="btn btn-ghost btn-sm" data-swap>Admin? Login here</button></p>' +
      '<p id="g-err" style="color:var(--red);margin-top:8px;font-size:.8rem"></p></div>';
    document.body.appendChild(ov);
    let admin = false;
    ov.querySelector('[data-swap]').onclick = e => {
      admin = !admin;
      ov.querySelector('[data-pane="key"]').style.display = admin ? 'none' : '';
      ov.querySelector('[data-pane="admin"]').style.display = admin ? '' : 'none';
      e.target.textContent = admin ? 'Have an API key?' : 'Admin? Login here';
    };
    ov.querySelector('#g-go').onclick = async () => {
      const k = ov.querySelector('#g-key').value.trim();
      const d = await post('/api/activate', { key: k });
      if (d.ok) { localStorage.setItem(AK, k); location.reload(); }
      else ov.querySelector('#g-err').textContent = '✗ ' + (d.err || 'invalid key');
    };
    ov.querySelector('#g-ad').onclick = async () => {
      const d = await post('/api/adminlogin', { user: ov.querySelector('#g-u').value.trim(), pw: ov.querySelector('#g-p').value });
      if (d.token) { localStorage.setItem(AT, d.token); localStorage.setItem(AKEY, d.token); location.reload(); }
      else ov.querySelector('#g-err').textContent = '✗ ' + (d.err || 'bad credentials');
    };
  }

  async function openPanel() {
    const token = localStorage.getItem(AT);
    const d = await post('/api/keylist', { admin: token });
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = '<div class="modal-card" style="max-height:86vh;overflow:auto;text-align:left">' +
      '<h3 style="text-transform:uppercase">Admin · API keys</h3>' +
      '<p class="muted">Students need a key to use AE3301.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0">' +
      [7, 30, 180, 365].map(x => '<button class="btn btn-ghost btn-sm" data-gen="' + x + '">+ ' + (x === 7 ? '7 days' : x === 30 ? '1 month' : x === 180 ? '6 months' : '1 year') + '</button>').join('') +
      '<button class="btn btn-gold btn-sm" data-author>✚ Author question</button></div>' +
      '<div>' + (d.keys || []).map(k => '<div style="display:flex;gap:8px;align-items:center;padding:8px 0;border-bottom:1px dashed var(--line)"><code class="mono" style="flex:1">' + k.key + '</code><span class="mono faint">' + k.left + 'd left</span><button class="btn btn-ghost btn-sm" data-copy="' + k.key + '">⧉</button><button class="btn btn-danger btn-sm" data-rev="' + k.key + '">✕</button></div>').join('') || '<p class="muted">No keys yet.</p>' + '</div>' +
      '<div class="cp-actions"><button class="btn btn-ghost" data-x>CLOSE</button></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    ov.querySelector('[data-x]').onclick = () => ov.remove();
    ov.querySelector('[data-author]').onclick = () => { ov.remove(); document.querySelector('[data-admin]') && document.querySelector('[data-admin]').click(); };
    ov.querySelectorAll('[data-gen]').forEach(b => b.onclick = async () => {
      await post('/api/keygen', { admin: token, days: +b.dataset.gen });
      ov.remove(); openPanel();
    });
    ov.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy));
    ov.querySelectorAll('[data-rev]').forEach(b => b.onclick = async () => {
      await post('/api/keydel', { admin: token, key: b.dataset.rev });
      ov.remove(); openPanel();
    });
  }

  function adminNav() {
    const side = document.querySelector('.side-nav');
    if (side && !side.querySelector('[data-admnav]')) {
      const a = document.createElement('a');
      a.className = 'nav-link'; a.dataset.admnav = '1'; a.href = 'javascript:void(0)';
      a.innerHTML = '🛡️<span>Admin</span>'; a.onclick = openPanel;
      side.appendChild(a);
    }
  }

  async function boot() {
    const at = localStorage.getItem(AT);
    if (at) { const d = await post('/api/qcheck', { key: at }); if (d.ok) { adminNav(); return; } }
    const key = localStorage.getItem(AK);
    if (key) { const d = await post('/api/keycheck', { key }); if (d.ok) return; }
    lockScreen();
  }
  setTimeout(boot, 50);
})();
