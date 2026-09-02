/* AE3301 ADMIN v2 — authoring locked behind the admin key */
import { QUESTIONS } from './data.js';
const AK = 'ae3301:adminkey';
const seen = new Set();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function merge(rows) {
  rows.forEach(r => {
    if (seen.has(r.id)) return; seen.add(r.id);
    const orig = JSON.parse(r.options || '[]');
    const idx = [0, 1, 2, 3].sort(() => Math.random() - .5);
    const opts = idx.map(i => orig[i]); const ans = idx.indexOf(0);
    (QUESTIONS[r.topic] = QUESTIONS[r.topic] || []).push({ id: 'x-' + r.id, tier: r.tier, tags: [(r.topic || '').replace('cb-', '') || 'custom'], q: r.q, options: opts, answer: ans, explain: r.explain, hint: r.hint || 'Think it through.', wrongWhy: opts.map((o, i) => i === ans ? '' : 'Not quite — read the explanation after answering.') });
  });
}
function overlay(html, mount) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = '<div class="modal-card" style="max-height:85vh;overflow:auto">' + html + '</div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  if (mount) mount(ov);
  return ov;
}
const inp = (id, ph, extra) => '<input id="' + id + '" class="code-box" style="min-height:44px;width:100%;margin-top:6px" ' + (extra || '') + ' placeholder="' + ph + '">';
function unlock(cb) {
  overlay('<h3 style="text-transform:uppercase">Admin key</h3><p class="muted">Only the admin can author questions.</p>' +
    '<input id="k-in" type="password" class="code-box" style="min-height:48px;width:100%" placeholder="admin key" />' +
    '<div class="cp-actions"><button class="btn btn-primary" id="k-go">UNLOCK</button></div><p class="muted" id="k-err" style="margin-top:8px"></p>',
    root => {
      root.querySelector('#k-go').onclick = async () => {
        const key = root.querySelector('#k-in').value;
        const r = await fetch('/api/qcheck', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
        const d = await r.json();
        if (d.ok) { localStorage.setItem(AK, key); root.remove(); cb(); }
        else root.querySelector('#k-err').textContent = 'Wrong key — students cannot author.';
      };
    });
}
function form() {
  const key = localStorage.getItem(AK) || '';
  overlay('<h3 style="text-transform:uppercase">Author a question</h3><p class="muted" style="color:var(--green)">✔ admin session active</p>' +
    '<select id="a-t" class="code-box" style="min-height:44px;width:100%"><option value="cb-computer">What Is a Computer</option><option value="cb-cpu">CPU</option><option value="cb-mem">RAM & Storage</option><option value="cb-files">Files & Folders</option><option value="cb-paths">Paths & Extensions</option></select>' +
    '<select id="a-tier" class="code-box" style="min-height:44px;width:100%;margin-top:6px"><option>concept</option><option>apply</option><option>industrial</option></select>' +
    '<textarea id="a-q" class="code-box" style="min-height:60px;width:100%;margin-top:6px" placeholder="Question text"></textarea>' +
    inp('a-o0', 'Option A — the CORRECT one') + inp('a-o1', 'Option B') + inp('a-o2', 'Option C') + inp('a-o3', 'Option D') +
    inp('a-h', 'Hint') +
    '<textarea id="a-e" class="code-box" style="min-height:50px;width:100%;margin-top:6px" placeholder="Explanation (why A is correct)"></textarea>' +
    '<div class="cp-actions"><button class="btn btn-primary" id="a-save">PUBLISH</button><button class="btn btn-ghost" id="a-man">MANAGE</button></div><p class="muted" id="a-msg" style="margin-top:8px"></p>',
    root => {
      root.querySelector('#a-save').onclick = async () => {
        const opts = [0, 1, 2, 3].map(i => root.querySelector('#a-o' + i).value);
        const body = { key, topic: root.querySelector('#a-t').value, tier: root.querySelector('#a-tier').value, q: root.querySelector('#a-q').value, options: opts, explain: root.querySelector('#a-e').value, hint: root.querySelector('#a-h').value };
        if (!body.q || opts.some(o => !o)) { root.querySelector('#a-msg').textContent = 'Fill the question + all 4 options.'; return; }
        const r = await fetch('/api/qadd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const d = await r.json();
        if (d.ok) {
          merge([Object.assign({ id: d.id }, body, { options: JSON.stringify(opts) })]);
          root.querySelector('#a-msg').textContent = '✔ Published to every device.';
          setTimeout(() => root.remove(), 900);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } else root.querySelector('#a-msg').textContent = d.err || 'server error';
      };
      root.querySelector('#a-man').onclick = async () => {
        const rows = await (await fetch('/api/qlist')).json();
        root.querySelector('.modal-card').innerHTML = '<h3 style="text-transform:uppercase">Manage questions</h3>' +
          (rows.map(r => '<div class="plan-step"><span style="flex:1">' + esc(r.q) + ' <span class="mono faint">(' + r.tier + ')</span></span><button class="btn btn-danger btn-sm" data-del="' + r.id + '">DEL</button></div>').join('') || '<p class="muted">Nothing authored yet.</p>') +
          '<div class="cp-actions"><button class="btn btn-ghost" data-close2>CLOSE</button></div>';
        root.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
          await fetch('/api/qdel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.dataset.del, key }) });
          Object.values(QUESTIONS).forEach(arr => { const k = arr.findIndex(x => x.id === 'x-' + b.dataset.del); if (k > -1) arr.splice(k, 1); });
          b.closest('.plan-step').remove();
        });
        root.querySelector('[data-close2]').onclick = () => root.remove();
      };
    });
}
fetch('/api/qlist').then(r => r.ok ? r.json() : []).then(rows => {
  merge(rows);
  const bar = document.querySelector('.hdr-chips');
  if (bar && !document.querySelector('[data-admin]')) {
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.admin = '1'; b.style.cursor = 'pointer';
    b.innerHTML = '✚ <span class="mono">Q</span>';
    b.addEventListener('click', () => {
      const k = localStorage.getItem(AK);
      if (k) fetch('/api/qcheck', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k }) }).then(r => r.json()).then(d => d.ok ? form() : unlock(form));
      else unlock(form);
    });
    bar.prepend(b);
  }
}).catch(() => {});
