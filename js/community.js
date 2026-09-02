/* AE3301 COMMUNITY v4 — X-style: FAB compose, ⋯ menu, views, no blink */
const TKc = 'ae3301:token', NMc = 'ae3301:name';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ago = ts => { const s = Math.max(1, Math.floor(Date.now() / 1000 - ts)); if (s < 60) return s + 's'; if (s < 3600) return Math.floor(s / 60) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h'; return Math.floor(s / 86400) + 'd'; };
const CHAT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/></svg>';
let media = null;
const posts = async () => await (await fetch('/api/posts')).json();
function cardHtml(p, me) {
  const med = p.media ? (/\.(mp4|webm)$/.test(p.media) ? '<video controls src="' + p.media + '" style="width:100%;border-radius:12px;margin-top:10px"></video>' : '<img src="' + p.media + '" style="width:100%;border-radius:12px;margin-top:10px">') : '';
  return '<article class="card" data-post="' + p.id + '" style="margin-bottom:12px;padding:16px;transition:opacity .25s,transform .25s">' +
    '<div style="display:flex;gap:10px;align-items:center">' +
    '<span style="width:40px;height:40px;border-radius:50%;background:#161616;color:#f4f4f2;display:grid;place-items:center;font-weight:800">' + esc((p.name[0] || '?').toUpperCase()) + '</span>' +
    '<b>' + esc(p.name) + '</b>' + (p.name === me ? '<span class="mono" style="color:var(--acc)">(you)</span>' : '') +
    '<span class="mono faint">' + ago(p.ts) + '</span>' +
    '<button class="btn btn-ghost btn-sm" data-more="' + p.id + '" style="margin-left:auto">⋯</button></div>' +
    '<p style="margin-top:10px;white-space:pre-wrap">' + esc(p.text) + '</p>' + med +
    '<div style="display:flex;gap:10px;margin-top:12px">' +
    '<button class="btn btn-ghost btn-sm" data-cm="' + p.id + '">💬 <span data-cmn>' + (p.cmts || 0) + '</span></button>' +
    '<button class="btn btn-ghost btn-sm" data-like="' + p.id + '">♥ <span data-liken>' + (p.likes || 0) + '</span></button>' +
    '<span class="btn btn-ghost btn-sm" style="cursor:default">👁 ' + (p.views || 0) + '</span></div>' +
    '<div data-cbox="' + p.id + '"></div></article>';
}
async function rebuild() {
  const view = document.getElementById('view'), me = localStorage.getItem(NMc);
  const feed = view && view.querySelector('#feed'); if (!feed) return;
  feed.innerHTML = (await posts()).map(p => cardHtml(p, me)).join('') || '<p class="empty-note">No posts yet — be the first.</p>';
}
async function renderCommunity() {
  const view = document.getElementById('view'); if (!view) return;
  const token = localStorage.getItem(TKc), me = localStorage.getItem(NMc);
  const rows = await posts();
  view.innerHTML = '<div class="page-head"><div class="kicker">💬 COMMUNITY</div><h1>The Feed</h1><p class="muted">Ask, help, share wins, photos & clips. +2 XP per like on your post.</p></div>' +
    '<section class="card" style="margin-bottom:16px;padding:16px">' +
    (token ? '<textarea id="c-t" class="code-box" style="min-height:64px;width:100%;color:#f4f4f2" placeholder="What’s happening, ' + esc(me) + '?"></textarea><div id="c-prev"></div>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:10px"><label class="btn btn-ghost btn-sm" style="cursor:pointer">📎<input id="c-f" type="file" accept="image/*,video/*" style="display:none"></label><span id="c-fname" class="faint" style="font-size:.75rem"></span><button id="c-post" class="btn btn-primary btn-sm" style="margin-left:auto">POST</button></div>'
      : '<p class="muted">Tap ☁ SYNC in the top bar to log in and join the conversation.</p>') +
    '</section><div id="feed">' + (rows.map(p => cardHtml(p, me)).join('') || '<p class="empty-note">No posts yet — be the first.</p>') + '</div>';
  document.title = 'Community · AE3301';
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === 'community'));
  fetch('/api/seen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: rows.map(r => r.id) }) }).catch(() => {});
  const f = view.querySelector('#c-f');
  if (f) f.onchange = () => { const file = f.files[0]; if (!file) return; view.querySelector('#c-fname').textContent = file.name; const r = new FileReader(); r.onload = () => { media = { ext: file.name.split('.').pop(), data: String(r.result).split(',')[1] }; view.querySelector('#c-prev').innerHTML = file.type.startsWith('image') ? '<img src="' + r.result + '" style="max-height:90px;border-radius:10px;margin-top:8px">' : '<p class="faint" style="font-size:.75rem">🎬 video attached</p>'; }; r.readAsDataURL(file); };
  const send = view.querySelector('#c-post');
  if (send) send.onclick = async () => {
    send.disabled = true;
    const r = await fetch('/api/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, text: view.querySelector('#c-t').value, media }) });
    const d = await r.json(); send.disabled = false;
    if (d.ok) { media = null; view.querySelector('#c-t').value = ''; const pv = view.querySelector('#c-prev'); if (pv) pv.innerHTML = ''; await rebuild(); }
  };
}
function sheet(html) {
  const s = document.createElement('div'); s.className = 'sheet'; s.innerHTML = html; document.body.appendChild(s);
  const kill = e => { if (!s.contains(e.target)) { s.remove(); document.removeEventListener('click', kill); } };
  setTimeout(() => document.addEventListener('click', kill), 0);
  return s;
}
document.getElementById('view').addEventListener('click', async e => {
  if (!(location.hash || '').includes('/community')) return;
  const token = localStorage.getItem(TKc);
  const like = e.target.closest('[data-like]');
  const cm = e.target.closest('[data-cm]');
  const cs = e.target.closest('[data-cs]');
  const more = e.target.closest('[data-more]');
  if (like) { await fetch('/api/like', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: like.dataset.like }) }); await rebuild(); }
  if (more) {
    const id = more.dataset.more;
    const p = (await posts()).find(x => x.id === id);
    const mine = p && p.name === localStorage.getItem(NMc);
    const s = sheet((mine ? '<button class="danger" data-act="del">🗑 Delete post</button>' : '') + '<button data-act="copy">⧉ Copy text</button><button data-act="x">Cancel</button>');
    s.onclick = async ev => {
      const a = ev.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'x') { s.remove(); return; }
      if (a.dataset.act === 'copy') { try { await navigator.clipboard.writeText(p.text); } catch (_) {} s.remove(); return; }
      if (a.dataset.act === 'del') {
        if (!s.dataset.sure) { s.dataset.sure = '1'; s.innerHTML = '<p style="padding:10px 14px;font-weight:700">Delete this post?</p><button class="danger" data-act="yes">Delete</button><button data-act="x">Cancel</button>'; return; }
        await fetch('/api/delpost', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: id }) });
        s.remove();
        const card = document.querySelector('[data-post="' + id + '"]');
        if (card) { card.style.opacity = '0'; card.style.transform = 'scale(.96)'; setTimeout(rebuild, 260); } else rebuild();
      }
    };
  }
  if (cm) {
    const box = document.querySelector('[data-cbox="' + cm.dataset.cm + '"]');
    if (box.dataset.open) { box.innerHTML = ''; box.dataset.open = ''; return; }
    const rows = await (await fetch('/api/comments?post=' + cm.dataset.cm)).json();
    box.dataset.open = '1';
    box.innerHTML = rows.map(c => '<p style="border-left:2px solid var(--acc);padding:4px 8px;margin-top:8px;font-size:.85rem"><b>' + esc(c.name) + '</b> ' + esc(c.text) + '</p>').join('') +
      (token ? '<div style="display:flex;gap:6px;margin-top:8px"><input class="code-box" style="min-height:40px;flex:1;color:#f4f4f2" data-ci placeholder="Reply…"><button class="btn btn-primary btn-sm" data-cs="' + cm.dataset.cm + '">➤</button></div>' : '');
  }
  if (cs) {
    const r = await fetch('/api/comment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, post: cs.dataset.cs, text: document.querySelector('[data-ci]').value }) });
    if ((await r.json()).ok) await rebuild();
  }
});
function injectNav() {
  const side = document.querySelector('.side-nav');
  if (side && !side.querySelector('[data-comnav]')) {
    const a = document.createElement('a'); a.className = 'nav-link'; a.dataset.comnav = '1'; a.dataset.nav = 'community'; a.href = '#/community'; a.innerHTML = CHAT + '<span>Community</span>'; side.appendChild(a);
  }
  const bot = document.querySelector('.bottomnav');
  if (bot && !bot.querySelector('[data-comnav]')) {
    bot.style.gridTemplateColumns = 'repeat(5,1fr)';
    const a = document.createElement('a'); a.className = 'bnav-link'; a.dataset.comnav = '1'; a.dataset.nav = 'community'; a.href = '#/community'; a.innerHTML = CHAT + '<span>Talk</span>'; bot.appendChild(a);
  }
  const bar = document.querySelector('.hdr-chips');
  if (bar && !document.querySelector('[data-com]')) {
    const b = document.createElement('a'); b.className = 'chip'; b.dataset.com = '1'; b.href = '#/community'; b.innerHTML = '💬 <span class="mono">TALK</span>'; bar.prepend(b);
  }
  if (!document.querySelector('#fab')) {
    const fab = document.createElement('button'); fab.id = 'fab'; fab.textContent = '+'; fab.setAttribute('aria-label', 'New post');
    fab.onclick = () => {
      if (!(location.hash || '').includes('/community')) { location.hash = '#/community'; setTimeout(() => { const t = document.querySelector('#c-t'); t && t.focus(); }, 450); }
      else { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { const t = document.querySelector('#c-t'); t && t.focus(); }, 300); }
    };
    document.body.appendChild(fab);
  }
}
function maybe() { if ((location.hash || '').replace('#', '') === '/community') renderCommunity(); }
window.addEventListener('hashchange', () => setTimeout(maybe, 0));
fetch('/api/ping').then(r => { if (r.ok) { injectNav(); setTimeout(maybe, 0); } }).catch(() => {});
