/**
 * ================================================================
 *  AE3301 · DAILY MISSIONS (§24)
 *  - 3 missions/day, read live from state.today counters.
 *  - Claim-once rewards (anti-farm), auto-reset at midnight.
 *  - Injects a card on Home, right after the adaptive path card.
 * ================================================================
 */
import * as S from './core.js';
import { progressBar, celebrate } from './ui.js';

const KEY = 'ae3301:missions';
const MISSIONS = [
  { id: 'm-lesson', icon: '📖', label: 'Complete 1 lesson',      key: 'lessons',  target: 1,   xp: 20 },
  { id: 'm-prob',   icon: '🧩', label: 'Solve 3 problems',       key: 'problems', target: 3,   xp: 30 },
  { id: 'm-xp',     icon: '⚡', label: 'Earn 100 XP',            key: 'xp',       target: 100, xp: 40 }
];

const today = () => new Date().toISOString().slice(0, 10);

/** Load today's mission store; resets automatically on a new day. */
function store() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && d.date === today()) return d;
  } catch (_) { /* corrupted → fresh */ }
  return { date: today(), claimed: {} };
}
const save = d => localStorage.setItem(KEY, JSON.stringify(d));
const isHome = () => { const h = (location.hash || '').replace('#', ''); return h === '' || h === '/home'; };

function cardHtml() {
  const st = store();
  const t = S.getState().today;
  return `<section class="card" data-missions style="margin-top:18px;padding:20px">
    <div class="kicker">🎯 TODAY'S MISSIONS</div>
    ${MISSIONS.map(m => {
      const cur = Math.min(t[m.key], m.target);
      const done = cur >= m.target;
      const claimed = !!st.claimed[m.id];
      return `<div style="display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px dashed var(--line)">
        <span style="font-size:1.2rem">${m.icon}</span>
        <div><b>${m.label}</b> <span class="mono faint">(${cur}/${m.target})</span>
          ${progressBar(Math.round(cur / m.target * 100), { small: true })}
        </div>
        ${claimed ? '<span class="status-badge b-done">✓ DONE</span>'
          : done ? `<button class="btn btn-gold btn-sm" data-claim="${m.id}">CLAIM +${m.xp} XP</button>`
          : `<span class="mono faint">+${m.xp} XP</span>`}
      </div>`;
    }).join('')}
  </section>`;
}

function mount(force = false) {
  if (!isHome()) return;
  const old = document.querySelector('[data-missions]');
  if (old && !force) return;
  if (old) old.remove();
  const anchor = document.querySelector('.plan-card');
  if (!anchor) return;
  anchor.insertAdjacentHTML('afterend', cardHtml());

  document.querySelectorAll('[data-claim]').forEach(b => b.onclick = () => {
    const m = MISSIONS.find(x => x.id === b.dataset.claim);
    const st = store();
    if (!m || st.claimed[m.id]) return;
    st.claimed[m.id] = 1;
    save(st);
    celebrate(S.grantXp(m.xp), b);   // real XP → streak/level/achievements fire
    mount(true);
  });
}

S.subscribe(() => setTimeout(() => mount(), 60));
addEventListener('hashchange', () => setTimeout(() => mount(), 60));
setTimeout(() => mount(), 60);
