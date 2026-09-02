/* AE3301 SYNC + LEADERBOARD — Phase 2 (auto-hides if server has no API) */
import { getState, subscribe } from './core.js';
const TK = 'ae3301:token', NM = 'ae3301:name';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function overlay(html, mount) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = '<div class="modal-card">' + html + '</div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  if (mount) mount(ov);
  return ov;
}
async function sync() {
  const t = localStorage.getItem(TK); if (!t) return;
  const s = getState();
  try { await fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: t, xp: s.xp, lessons: s.completedLessons.length, accent: s.accent }) }); } catch (e) {}
}
async function showBoard() {
  const rows = await (await fetch('/api/board')).json();
  overlay('<h3 style="text-transform:uppercase">Leaderboard</h3><p class="muted">Live · everyone on this Pad’s network</p>' +
    (rows.map((u, i) => '<div class="plan-step"><span class="mono">(' + ('0' + (i + 1)).slice(-2) + ')</span><b>' + esc(u.name) + '</b><span class="mono" style="margin-left:auto">' + u.xp + ' XP · ' + u.lessons + ' lessons</span></div>').join('') || '<p class="muted">No explorers yet — create the first account.</p>') +
    '<div class="cp-actions"><button class="btn btn-ghost" data-out>LOG OUT</button></div>',
    root => { root.querySelector('[data-out]').onclick = () => { localStorage.removeItem(TK); localStorage.removeItem(NM); root.remove(); chipLabel(); }; });
  sync();
}
function loginForm() {
  overlay('<h3 style="text-transform:uppercase">Join the network</h3><p class="muted">One account for every device on this Wi‑Fi.</p>' +
    '<input id="lg-n" class="code-box" style="min-height:48px;width:100%" placeholder="name" maxlength="24" />' +
    '<input id="lg-p" class="code-box" type="password" style="min-height:48px;width:100%;margin-top:8px" placeholder="password" />' +
    '<div class="cp-actions"><button class="btn btn-primary" id="lg-reg">CREATE</button><button class="btn btn-ghost" id="lg-in">LOG IN</button></div>' +
    '<p class="muted" id="lg-err" style="margin-top:8px"></p>',
    root => {
      const go = async path => {
        const r = await fetch('/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: root.querySelector('#lg-n').value, pw: root.querySelector('#lg-p').value }) });
        const d = await r.json();
        if (d.token) { localStorage.setItem(TK, d.token); localStorage.setItem(NM, root.querySelector('#lg-n').value); root.remove(); chipLabel(); showBoard(); }
        else root.querySelector('#lg-err').textContent = d.err || 'error';
      };
      root.querySelector('#lg-reg').onclick = () => go('register');
      root.querySelector('#lg-in').onclick = () => go('login');
    });
}
function chipLabel() {
  const b = document.querySelector('[data-sync]'); if (!b) return;
  const n = localStorage.getItem(NM);
  b.innerHTML = n ? '☁ <span class="mono">' + esc(n) + '</span>' : '☁ <span class="mono">SYNC</span>';
}
function chip() {
  const bar = document.querySelector('.hdr-chips');
  if (!bar || document.querySelector('[data-sync]')) return;
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.sync = '1'; b.style.cursor = 'pointer';
  b.addEventListener('click', () => { localStorage.getItem(TK) ? showBoard() : loginForm(); });
  bar.prepend(b); chipLabel();
}
fetch('/api/ping').then(r => { if (r.ok) { chip(); let t; subscribe(() => { clearTimeout(t); t = setTimeout(sync, 1500); }); setInterval(sync, 8000); } }).catch(() => {});
