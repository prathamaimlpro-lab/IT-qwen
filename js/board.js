/**
 * ================================================================
 *  AE3301 · HOME DASHBOARD v2
 *  stat row (solved / streak / last-left) + donut + heatmap +
 *  "pick up where you left off" — injected on Home
 * ================================================================
 */
import * as S from './core.js';
import { QUESTIONS, LEVELS, LESSONS } from './data.js';

const dkey = t => new Date(t).toISOString().slice(0, 10);
const findQ = id => { for (const [topic, arr] of Object.entries(QUESTIONS)) { const q = arr.find(x => x.id === id); if (q) return { q, topic }; } return null; };

function compute() {
  const st = S.getState();
  const att = Array.isArray(st.attempts) ? st.attempts : [];
  const solved = new Set(att.filter(a => a.good).map(a => a.id));
  const totals = { concept: 0, apply: 0, industrial: 0 };
  const done = { concept: 0, apply: 0, industrial: 0 };
  Object.values(QUESTIONS).flat().forEach(q => { totals[q.tier]++; if (solved.has(q.id)) done[q.tier]++; });
  const days = {};
  att.forEach(a => { const k = dkey(a.ts || Date.now()); days[k] = (days[k] || 0) + 1; });
  const last = att.filter(a => a.good).sort((a, b) => (b.ts || 0) - (a.ts || 0))[0];
  return { st, solved, totals, done, days, last };
}

function heatHtml(days) {
  const cells = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 181; i >= 0; i--) {
    const n = days[dkey(today.getTime() - i * 86400000)] || 0;
    const c = n === 0 ? 'rgba(255,255,255,.06)' : n < 3 ? 'rgba(240,86,28,.45)' : n < 6 ? 'rgba(240,86,28,.75)' : '#f0561c';
    cells.push('<span style="width:11px;height:11px;border-radius:3px;background:' + c + '"></span>');
  }
  return '<div style="display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,11px);gap:3px;overflow:hidden">' + cells.join('') + '</div>';
}

function dashHtml() {
  const { st, solved, totals, done, days, last } = compute();
  const allT = totals.concept + totals.apply + totals.industrial;
  const pct = allT ? Math.round(solved.size / allT * 100) : 0;
  const lq = last ? findQ(last.id) : null;
  const started = (st.startedLessons || []).filter(id => !(st.completedLessons || []).includes(id));
  const firstLs = started.map(id => Object.values(LESSONS).find(l => l.id === id)).find(Boolean);
  const lastLabel = lq ? lq.q.q.slice(0, 34) : firstLs ? firstLs.title : 'Start your first lesson';
  const lastHref = lq ? '#/practice/' + lq.topic : firstLs ? '#/lesson/' + firstLs.id : '#/learn';
  const tier = (k, label, col) => '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed var(--line)">' +
    '<span style="width:8px;height:8px;border-radius:50%;background:' + col + '"></span><span style="flex:1">' + label + '</span>' +
    '<span class="mono">' + done[k] + ' / ' + totals[k] + '</span></div>';
  return '<section class="card" data-dash style="margin:0 0 16px;padding:16px">' +
    '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">' +
    '<div style="border:1px solid var(--line);border-radius:12px;padding:12px"><div class="kicker" style="font-size:.6rem">🧩 PROBLEMS SOLVED</div><div style="font:800 1.6rem var(--fd)">' + solved.size + '<span class="faint" style="font-size:.9rem"> / ' + allT + '</span></div></div>' +
    '<div style="border:1px solid var(--line);border-radius:12px;padding:12px"><div class="kicker" style="font-size:.6rem">🔥 CURRENT STREAK</div><div style="font:800 1.6rem var(--fd)">' + (st.streak || 0) + '<span class="faint" style="font-size:.9rem"> days</span></div></div>' +
    '<div style="border:1px solid var(--line);border-radius:12px;padding:12px"><div class="kicker" style="font-size:.6rem">🕐 LAST LEFT</div><a href="' + lastHref + '" style="font-weight:700;color:var(--acc);text-decoration:none">' + lastLabel + ' →</a></div></div>' +
    '<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:14px">' +
    '<div><div class="kicker" style="font-size:.6rem;margin-bottom:8px">SOLVED BY DIFFICULTY</div>' +
    '<div style="display:flex;gap:14px;align-items:center">' +
    '<svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="var(--line)" stroke-width="8"/>' +
    '<circle cx="42" cy="42" r="34" fill="none" stroke="var(--acc)" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 34) + '" stroke-dashoffset="' + (2 * Math.PI * 34 * (1 - pct / 100)) + '" transform="rotate(-90 42 42)"/>' +
    '<text x="42" y="47" text-anchor="middle" style="font:700 18px var(--fm);fill:var(--ink)">' + solved.size + '</text></svg>' +
    '<div style="flex:1">' + tier('concept', 'Easy', 'var(--green)') + tier('apply', 'Medium', 'var(--gold)') + tier('industrial', 'Hard', 'var(--red)') + '</div></div></div>' +
    '<div><div class="kicker" style="font-size:.6rem;margin-bottom:8px">ACTIVITY · 26 WEEKS</div>' + heatHtml(days) + '</div></div>' +
    ((started.length || lq) ? '<div class="kicker" style="font-size:.6rem;margin:14px 0 8px">PICK UP WHERE YOU LEFT OFF</div>' +
      started.slice(0, 3).map(id => { const l = Object.values(LESSONS).find(x => x.id === id); return l ? '<a class="btn btn-ghost btn-sm" style="margin:0 8px 8px 0" href="#/lesson/' + l.id + '">▶ ' + l.title + '</a>' : ''; }).join('') +
      (lq ? '<a class="btn btn-ghost btn-sm" style="margin:0 8px 8px 0" href="#/practice/' + lq.topic + '">🧩 ' + lq.q.q.slice(0, 30) + '</a>' : '') : '') +
    '</section>';
}

function mount() {
  const h = (location.hash || '').replace('#', '');
  if (h !== '' && h !== '/home') return;
  if (document.querySelector('[data-dash]')) return;
  const head = document.querySelector('.page-head');
  if (head) head.insertAdjacentHTML('afterend', dashHtml());
}
S.subscribe(() => setTimeout(mount, 80));
addEventListener('hashchange', () => setTimeout(mount, 80));
setTimeout(mount, 80);
