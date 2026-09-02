/* IT QUEST v2 — shared UI: icons, components, celebrations, shell. */
import { getState, subscribe, levelInfo } from './core.js';

const P = {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  flame: '<path d="M12 21a6 6 0 0 1-6-6c0-3 2-5 3.5-7C10.6 6.4 11.5 4.6 12 3c.5 1.6 1.4 3.4 2.5 5 1.5 2 3.5 4 3.5 7a6 6 0 0 1-6 6Z"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  play: '<path d="M8 5v14l11-7Z" fill="currentColor" stroke="none"/>',
  'arrow-right': '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  'arrow-left': '<path d="M20 12H5"/><path d="m11 6-6 6 6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3"/><path d="M12 13v4M8 21h8"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 3.5L17 11H5"/>',
  edit: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z"/>',
  refresh: '<path d="M20 8A8 8 0 1 0 20 16"/><path d="M20 3v5h-5"/>',
  sparkle: '<path d="M12 2l2.2 6L20 12l-5.8 2-2.2 6-2.2-6L4 12l5.8-4 2.2-6Z"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><rect x="10.5" y="10.5" width="3" height="3"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  monitor: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6M12 17v4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z"/>',
  alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5M12 18h.01"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  chart: '<path d="M4 20h16"/><path d="M6 20v-6M10.5 20V6M15 20v-9M19.5 20V10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>'
};
export function icon(n, c = '') {
  return `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.info || P.star}</svg>`;
}
export const LOGO_MARK = '<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 42 13.5v21L24 45 6 34.5v-21z" fill="#0a1120" stroke="#38e1ff" stroke-width="2.5"/><path d="M26 12 16 26h6l-2 10 10-14h-6z" fill="#ffc861"/></svg>';

export const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function progressBar(p, o = {}) {
  const v = Math.max(0, Math.min(100, p));
  return `<div class="progress-bar ${o.gold ? 'pb-gold' : ''} ${o.small ? 'pb-sm' : ''}" role="progressbar" aria-valuenow="${v}" aria-valuemin="0" aria-valuemax="100"><i style="width:${v}%"></i></div>`;
}
export function statusBadge(k) {
  const m = { locked: ['b-locked', icon('lock'), 'Locked'], open: ['b-open', icon('play'), 'Active'], progress: ['b-progress', '', 'In progress'], done: ['b-done', icon('check'), 'Completed'], soon: ['b-locked', icon('lock'), 'Coming soon'] }[k];
  return `<span class="status-badge ${m[0]}">${m[1]}${m[2]}</span>`;
}
export function toast(kind, title, sub = '') {
  const root = document.getElementById('toasts'); if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast t-' + kind; el.setAttribute('role', 'status');
  el.innerHTML = `${icon(kind === 'success' ? 'check' : kind === 'ach' ? 'trophy' : 'star')}<div>${escapeHtml(title)}${sub ? `<small>${escapeHtml(sub)}</small>` : ''}</div>`;
  root.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3600);
}

/* ---- fx ---- */
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const sleep = ms => new Promise(r => setTimeout(r, REDUCED ? Math.min(ms, 150) : ms));
export function floatXp(n, anchor) {
  const t = anchor || document.querySelector('.chip-xp'); if (!t) return;
  const r = t.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'xp-float'; el.textContent = '+' + n + ' XP';
  el.style.left = (r.left + r.width / 2) + 'px'; el.style.top = (r.bottom + 8) + 'px';
  document.getElementById('fx-layer').appendChild(el);
  setTimeout(() => el.remove(), 1400);
}
export function countUp(el, from, to, dur = 650) {
  if (!el) return; if (from === to || REDUCED) { el.textContent = to; return; }
  const s = performance.now();
  (function tick(n) { const t = Math.min(1, (n - s) / dur); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(tick); })(s);
}
function confetti(host, n = 16) {
  if (REDUCED) return;
  const cols = ['#38e1ff', '#ffc861', '#ff7ab8', '#3ddc97', '#8b7bff'];
  const w = document.createElement('div'); w.className = 'confetti';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.style.left = (8 + Math.random() * 84) + '%';
    s.style.setProperty('--c', cols[i % 5]);
    s.style.setProperty('--dx', (Math.random() * 240 - 120) + 'px');
    s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    s.style.setProperty('--dur', (0.8 + Math.random() * 0.7) + 's');
    w.appendChild(s);
  }
  host.appendChild(w); setTimeout(() => w.remove(), 1800);
}
export function openOverlay(html, cls = '') {
  return new Promise(res => {
    const ov = document.createElement('div'); ov.className = 'overlay';
    ov.innerHTML = `<div class="modal-card ${cls}" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(ov); confetti(ov);
    const close = () => { ov.remove(); document.removeEventListener('keydown', k); res(); };
    const k = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', k);
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    const b = ov.querySelector('.btn'); if (b) b.focus();
  });
}
export function levelUpFx(info) {
  return openOverlay(`<div class="lu-kicker">LEVEL UP</div><div class="lu-level">${info.level}</div><div class="lu-title">${escapeHtml(info.title).toUpperCase()}</div><p class="muted" style="margin-top:10px">${info.isMax ? 'Max level — for now.' : `Next: Level ${info.nextLevel} — ${escapeHtml(info.nextTitle)}.`}</p><div class="cp-actions"><button class="btn btn-primary" data-close>ONWARD</button></div>`, 'lvlup-card');
}
export async function celebrate(r, anchor) {
  if (r.gained) floatXp(r.gained, anchor);
  for (const a of r.achievements || []) toast('ach', 'Achievement: ' + a.title, a.desc);
  if (r.leveledUp) { await sleep(250); await levelUpFx(r.newLevel); }
}
export function mergeResults(rs) {
  return rs.reduce((acc, r) => ({ gained: acc.gained + (r.gained || 0), achievements: acc.achievements.concat(r.achievements || []), leveledUp: acc.leveledUp || r.leveledUp, newLevel: r.newLevel || acc.newLevel }), { gained: 0, achievements: [], leveledUp: false });
}

/* ---- shell ---- */
const NAV = [
  { id: 'home', label: 'Home', icon: 'home', href: '#/home' },
  { id: 'learn', label: 'Learn', icon: 'book', href: '#/learn' },
  { id: 'arena', label: 'Arena', icon: 'code', href: '#/arena' },
  { id: 'profile', label: 'Profile', icon: 'user', href: '#/profile' }
];
export function buildShell(root) {
  root.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div class="side-brand">${LOGO_MARK}<div><span class="logo-text">IT <em>QUEST</em></span></div></div>
      <nav class="side-nav">${NAV.map(n => `<a class="nav-link" data-nav="${n.id}" href="${n.href}">${icon(n.icon)}<span>${n.label}</span></a>`).join('')}</nav>
    </aside>
    <header class="topbar">
      <a class="mob-brand" href="#/home">${LOGO_MARK}<span class="logo-text">IT <em>QUEST</em></span></a>
      <div class="hdr-chips">
        <div class="chip chip-streak">${icon('flame')}<span class="hdr-streak mono">0</span><span class="chip-unit">DAY</span></div>
        <div class="chip chip-xp">${icon('bolt')}<span class="hdr-xp mono">0</span><span class="chip-unit">XP</span></div>
        <div class="chip chip-level">LV&nbsp;<b class="hdr-lv mono">1</b></div>
        <a class="avatar-btn" href="#/profile" data-avatar aria-label="Profile">🌱</a>
      </div>
    </header>
    <main id="view" tabindex="-1"></main>
    <nav class="bottomnav">${NAV.map(n => `<a class="bnav-link" data-nav="${n.id}" href="${n.href}">${icon(n.icon)}<span>${n.label}</span></a>`).join('')}</nav>
  </div>
  <div id="toasts" aria-live="polite"></div><div id="fx-layer"></div>`;
}
let shownXp = null;
export function initShellUpdates() {
  const upd = () => {
    const s = getState(), li = levelInfo(s.xp);
    const xp = document.querySelector('.hdr-xp');
    if (xp) { if (shownXp === null) xp.textContent = s.xp; else countUp(xp, shownXp, s.xp); shownXp = s.xp; }
    const lv = document.querySelector('.hdr-lv'); if (lv) lv.textContent = li.level;
    const st = document.querySelector('.hdr-streak'); if (st) st.textContent = s.streak.count;
    const av = document.querySelector('[data-avatar]'); if (av) { av.textContent = li.avatar; av.style.borderColor = s.accent; }
  };
  upd(); subscribe(upd);
}
export function setActiveNav(name) {
  const map = { lesson: 'learn', level: 'learn', practice: 'learn' };
  const a = map[name] || name;
  document.querySelectorAll('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === a));
}
/* scroll reveal */
let obs = null;
export function setupReveal() {
  obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } }), { threshold: .1 });
}
export function scanReveals(root) {
  if (!obs) return;
  root.querySelectorAll('.card,.page-head,.section-title,.lesson-row,.stat-tile').forEach(el => obs.observe(el));
}
