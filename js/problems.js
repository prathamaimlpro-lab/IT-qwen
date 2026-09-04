/**
 * AE3301 · DROP B — GLOBAL PROBLEMS PAGE (#/problems)
 * Difficulty chips · tag filter · search · Random · solved ticks · Visualise
 * Visualise calls window.AE3301_VIZ.open(id) → lights up when Drop E lands.
 */
import * as S from './core.js';
import { QUESTIONS } from './data.js';

const ALL = Object.entries(QUESTIONS).flatMap(([topic, arr]) => arr.map(q => ({ ...q, topic })));
const TIER = { concept: ['EASY', 'var(--green)'], apply: ['MEDIUM', 'var(--gold)'], industrial: ['HARD', 'var(--red)'] };
const state = { tier: 'all', tag: 'all', q: '' };

const tags = () => [...new Set(ALL.flatMap(x => x.tags))].sort();
const solvedSet = () => new Set(((Array.isArray(S.getState().attempts) ? S.getState().attempts : []).filter(a => a.good)).map(a => a.id));

function page() {
  const solved = solvedSet();
  const rows = ALL.filter(x =>
    (state.tier === 'all' || x.tier === state.tier) &&
    (state.tag === 'all' || x.tags.includes(state.tag)) &&
    (!state.q || x.q.toLowerCase().includes(state.q.toLowerCase())));
  return '<div class="page-head"><div class="kicker">🧩 PROBLEMS</div><h1>' + ALL.length + ' curated</h1>' +
    '<p class="muted">Filter, search, solve, visualise.</p></div>' +
    '<div class="card" style="padding:14px;margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
    ['all', 'concept', 'apply', 'industrial'].map(t =>
      '<button class="btn btn-sm ' + (state.tier === t ? 'btn-primary' : 'btn-ghost') + '" data-tier="' + t + '">' + (t === 'all' ? 'All' : TIER[t][0]) + '</button>').join('') +
    '<select class="code-box" data-tag style="min-height:40px;flex:1;max-width:180px"><option value="all">All tags</option>' +
    tags().map(t => '<option' + (state.tag === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select>' +
    '<input class="code-box" data-q placeholder="Search…" style="min-height:40px;flex:2" value="' + state.q + '">' +
    '<button class="btn btn-gold btn-sm" data-rand>🎲 RANDOM</button></div>' +
    '<div>' + rows.map(x => {
      const [tl, tc] = TIER[x.tier];
      return '<div class="card" style="display:flex;gap:12px;align-items:center;padding:14px;margin-bottom:10px">' +
        '<span style="width:26px;height:26px;border-radius:50%;border:2px solid ' + (solved.has(x.id) ? 'var(--green)' : 'var(--line)') + ';' +
        (solved.has(x.id) ? 'background:var(--green);color:#0d0d0d;' : '') + 'display:grid;place-items:center;font-size:.8rem">' + (solved.has(x.id) ? '✓' : '') + '</span>' +
        '<div style="flex:1"><b style="' + (solved.has(x.id) ? 'color:var(--green)' : '') + '">' + x.q.slice(0, 70) + '</b>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">' + x.tags.map(t => '<span class="mono" style="font-size:.65rem;border:1px solid var(--line);border-radius:6px;padding:2px 6px;color:var(--faint)">' + t + '</span>').join('') + '</div></div>' +
        '<span class="mono" style="color:' + tc + ';font-size:.7rem">' + tl + '</span>' +
        '<button class="btn btn-ghost btn-sm" data-viz="' + x.id + '">◉ Visualise</button>' +
        '<a class="btn btn-primary btn-sm" href="#/practice/' + x.topic + '">OPEN</a></div>';
    }).join('') || '<p class="empty-note">No matches.</p>' + '</div>';
}

function mount() {
  const view = document.getElementById('view');
  view.innerHTML = page();
  document.title = 'Problems · AE3301';
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === 'problems'));
  view.querySelectorAll('[data-tier]').forEach(b => b.onclick = () => { state.tier = b.dataset.tier; mount(); });
  view.querySelector('[data-tag]').onchange = e => { state.tag = e.target.value; mount(); };
  view.querySelector('[data-q]').oninput = e => { state.q = e.target.value; const sc = e.target.selectionStart; mount(); const i = view.querySelector('[data-q]'); i.focus(); i.setSelectionRange(sc, sc); };
  view.querySelector('[data-rand]').onclick = () => { const x = ALL[Math.floor(Math.random() * ALL.length)]; location.hash = '#/practice/' + x.topic; };
  view.querySelectorAll('[data-viz]').forEach(b => b.onclick = () => {
    if (window.AE3301_VIZ) window.AE3301_VIZ.open(b.dataset.viz);
    else { b.textContent = 'SOON (Drop E)'; setTimeout(() => b.textContent = '◉ Visualise', 1200); }
  });
}
function nav() {
  const side = document.querySelector('.side-nav');
  if (side && !side.querySelector('[data-probnav]')) {
    const arena = [...side.children].find(a => (a.textContent || '').includes('Arena'));
    const a = document.createElement('a');
    a.className = 'nav-link'; a.dataset.probnav = '1'; a.dataset.nav = 'problems'; a.href = '#/problems';
    a.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h7"/></svg><span>Problems</span>';
    arena ? arena.after(a) : side.appendChild(a);
  }
}
const isP = () => (location.hash || '').replace('#', '') === '/problems';
const route = () => { if (isP()) { mount(); } };
addEventListener('hashchange', () => { nav(); setTimeout(route, 0); });
setTimeout(() => { nav(); route(); }, 60);
