/* AE3301 COMMUNITY v2 — posts + media + comments + Mentor XP */
const TKc = 'ae3301:token', NMc = 'ae3301:name';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ago = ts => { const s = Math.max(1, Math.floor(Date.now() / 1000 - ts)); if (s < 60) return s + 's'; if (s < 3600) return Math.floor(s / 60) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h'; return Math.floor(s / 86400) + 'd'; };
const CHAT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/></svg>';
function overlay(html, mount) { const ov = document.createElement('div'); ov.className = 'overlay'; ov.innerHTML = '<div class="modal-card" style="max-height:88vh;overflow:auto">' + html + '</div>'; document.body.appendChild(ov); ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); }); if (mount) mount(ov); return ov; }
let pendingMedia = null;
async function openBoard() {
  const token = localStorage.getItem(TKc), me = localStorage.getItem(NMc);
  const rows = await (await fetch('/api/posts')).json();
  overlay('<h3 style="text-transform:uppercase">Community</h3><p style="color:rgba(244,244,242,.7)">Ask, help, share wins, photos & clips. +2 XP per like on your post.</p>' +
    (token ? '<textarea id="c-t" class="code-box" style="min-height:56px;width:100%;color:#f4f4f2" placeholder="Share a question, a win, a tip…"></textarea>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:8px"><label class="btn btn-ghost btn-sm" style="cursor:pointer">📎 MEDIA<input id="c-f" type="file" accept="image/*,video/*" style="display:none"></label><span id="c-fname" style="color:rgba(244,244,242,.6);font-size:.75rem"></span><button class="btn btn-primary btn-sm" id="c-post" style="margin-left:auto">POST</button></div><p id="c-msg" style="color:rgba(244,244,242,.6)"></p>'
      : '<p style="border:1px dashed rgba(244,244,242,.3);padding:10px;color:rgba(244,244,242,.7)">Tap ☁ SYNC to log in and join.</p>') +
    '<div style="margin-top:12px">' + (rows.map(p => {
      const media = p.media ? (p.media.match(/\.(mp4|webm)$/) ? '<video controls src="' + p.media + '" style="width:100%;border-radius:10px;margin-top:8px"></video>' : '<img src="' + p.media + '" style="width:100%;border-radius:10px;margin-top:8px">') : '';
      return '<div style="border:1px solid var(--line);background:var(--panel);border-radius:12px;padding:14px;margin-bottom:10px;color:var(--ink)">' +
        '<div style="display:flex;gap:8px;align-items:center"><b>' + esc(p.name) + (p.name === me ? ' <span class="mono" style="color:var(--acc)">(you)</span>' : '') + '</b><span class="mono faint">' + ago(p.ts) + '</span>' +
        (p.name === me ? '<button class="btn btn-danger btn-sm" data-dp="' + p.id + '">✕</button>' : '') +
        '<button class="btn btn-ghost btn-sm" data-cm="' + p.id + '" style="margin-left:auto">💬 ' + p.cmts + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-like="' + p.id + '">♥ ' + p.likes + '</button></div>' +
        '<p style="margin-top:8px;white-space:pre-wrap">' + esc(p.text) + '</p>' + media +
        '<div data-cbox="' + p.id + '"></div></div>';
    }).join('') || '<p style="color:rgba(244,244,242,.6)">No posts yet — be the first.</p>') + '</div>',
    root => {
      const f = root.querySelector('#c-f');
      if (f) f.onchange = () => { const file = f.files[0]; if (!file) return; root.querySelector('#c-fname').textContent = file.name + ' (' + Math.round(file.size / 1024) + 'KB)'; const r = new FileReader(); r.onload = () => { pendingMedia = { ext: file.name.split('.').pop(), data: String(r.result).split(',')[1] }; }; r.readAsDataURL(file); };
      const send = root.querySelector('#c-post');
      if (send) send.onclick = async () => {
        send.disabled = true; root.querySelector('#c-msg').textContent = 'posting…';
        const r = await fetch('/api/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, text: root.querySelector('#c-t').value, media: pendingMedia }) });
        const d = await r.json();
        if (d.ok) { pendingMedia = null; root.remove(); openBoard(); } else { send.disabled = false; root.querySelector('#c-msg').textContent = d.err; }
      };
      root.querySelectorAll('[data-like]').forEach(b => b.onclick = async () => {
        const r = await fetch('/api/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: b.dataset.like }) });
        if ((await r.json()).ok) { root.remove(); openBoard(); }
      });
      root.querySelectorAll('[data-dp]').forEach(b => b.onclick = async () => {
        await fetch('/api/delpost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: b.dataset.dp }) });
        root.remove(); openBoard();
      });
      root.querySelectorAll('[data-cm]').forEach(b => b.onclick = async () => {
        const box = root.querySelector('[data-cbox="' + b.dataset.cm + '"]');
        if (box.dataset.open) { box.innerHTML = ''; box.dataset.open = ''; return; }
        const cs = await (await fetch('/api/comments?post=' + b.dataset.cm)).json();
        box.dataset.open = '1';
        box.innerHTML = cs.map(c => '<p style="border-left:2px solid var(--acc);padding:4px 8px;margin-top:6px;font-size:.85rem"><b>' + esc(c.name) + '</b> ' + esc(c.text) + '</p>').join('') +
          (token ? '<div style="display:flex;gap:6px;margin-top:8px"><input class="code-box" style="min-height:40px;flex:1;color:#f4f4f2" data-ci placeholder="Reply…"><button class="btn btn-primary btn-sm" data-cs>➤</button></div>' : '');
        const sb = box.querySelector('[data-cs]');
        if (sb) sb.onclick = async () => {
          const r = await fetch('/api/comment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: b.dataset.cm, text: box.querySelector('[data-ci]').value }) });
          if ((await r.json()).ok) { box.dataset.open = ''; b.click(); }
        };
      });
    });
}
function injectNav() {
  const side = document.querySelector('.side-nav');
  if (side && !side.querySelector('[data-comnav]')) {
    const a = document.createElement('a'); a.className = 'nav-link'; a.dataset.comnav = '1'; a.href = 'javascript:void(0)'; a.innerHTML = CHAT + '<span>Community</span>'; a.onclick = openBoard; side.appendChild(a);
  }
  const bot = document.querySelector('.bottomnav');
  if (bot && !bot.querySelector('[data-comnav]')) {
    bot.style.gridTemplateColumns = 'repeat(5,1fr)';
    const a = document.createElement('a'); a.className = 'bnav-link'; a.dataset.comnav = '1'; a.href = 'javascript:void(0)'; a.innerHTML = CHAT + '<span>Talk</span>'; a.onclick = openBoard; bot.appendChild(a);
  }
  const bar = document.querySelector('.hdr-chips');
  if (bar && !document.querySelector('[data-com]')) {
    const b = document.createElement('button'); b.className = 'chip'; b.dataset.com = '1'; b.style.cursor = 'pointer'; b.innerHTML = '💬 <span class="mono">TALK</span>'; b.onclick = openBoard; bar.prepend(b);
  }
}
fetch('/api/ping').then(r => { if (r.ok) injectNav(); }).catch(() => {});
