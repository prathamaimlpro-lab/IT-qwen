/* AE3301 COMMUNITY — talk board + likes + Mentor XP */
const TKc = 'ae3301:token';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function ago(ts) { const s = Math.max(1, Math.floor(Date.now() / 1000 - ts)); if (s < 60) return s + 's'; if (s < 3600) return Math.floor(s / 60) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h'; return Math.floor(s / 86400) + 'd'; }
function overlay(html, mount) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = '<div class="modal-card" style="max-height:85vh;overflow:auto">' + html + '</div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  if (mount) mount(ov);
  return ov;
}
async function openBoard() {
  const token = localStorage.getItem(TKc);
  const rows = await (await fetch('/api/posts')).json();
  overlay('<h3 style="text-transform:uppercase">Community</h3><p class="muted">Ask, help, share wins. +2 XP when someone likes your post.</p>' +
    (token ? '<textarea id="c-t" class="code-box" style="min-height:60px;width:100%" placeholder="Share a question, a win, a tip…"></textarea><div class="cp-actions" style="justify-content:flex-start"><button class="btn btn-primary" id="c-post">POST</button><span class="muted" id="c-msg"></span></div>' : '<p class="muted" style="border:1px dashed var(--line);padding:10px">Tap the ☁ SYNC chip to log in and join the conversation.</p>') +
    '<div style="margin-top:14px">' + (rows.map(p => '<div class="card" style="margin-bottom:10px;padding:14px"><div style="display:flex;gap:8px;align-items:center"><b>' + esc(p.name) + '</b><span class="mono faint">' + ago(p.ts) + '</span><button class="btn btn-ghost btn-sm" data-like="' + p.id + '" style="margin-left:auto">♥ ' + p.likes + '</button></div><p style="margin-top:8px;white-space:pre-wrap">' + esc(p.text) + '</p></div>').join('') || '<p class="muted">No posts yet — be the first.</p>') + '</div>',
    root => {
      const send = root.querySelector('#c-post');
      if (send) send.onclick = async () => {
        const r = await fetch('/api/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, text: root.querySelector('#c-t').value }) });
        const d = await r.json();
        if (d.ok) { root.remove(); openBoard(); } else root.querySelector('#c-msg').textContent = d.err;
      };
      root.querySelectorAll('[data-like]').forEach(b => b.onclick = async () => {
        const r = await fetch('/api/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: b.dataset.like }) });
        const d = await r.json();
        if (d.ok) { root.remove(); openBoard(); } else root.querySelector('#c-msg') && (root.querySelector('#c-msg').textContent = d.err);
      });
    });
}
fetch('/api/ping').then(r => {
  if (!r.ok) return;
  const bar = document.querySelector('.hdr-chips');
  if (bar && !document.querySelector('[data-com]')) {
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.com = '1'; b.style.cursor = 'pointer';
    b.innerHTML = '💬 <span class="mono">TALK</span>';
    b.addEventListener('click', openBoard);
    bar.prepend(b);
  }
}).catch(() => {});
