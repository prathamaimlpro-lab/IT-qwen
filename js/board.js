/**
 * AE3301 · DROP A — PROGRESS BOARD v2
 * Year heatmap · tier denominators · donut · last-solved · course cards
 */
import * as S from './core.js';
import { QUESTIONS, LEVELS } from './data.js';

const dkey = t => new Date(t).toISOString().slice(0, 10);
const findQ = id => { for (const [topic, arr] of Object.entries(QUESTIONS)) { const q = arr.find(x => x.id === id); if (q) return { q, topic }; } return null; };

function compute() {
  const st = S.getState();
  const att = Array.isArray(st.attempts) ? st.attempts : [];
  const solved = new Set(att.filter(a => a.good).map(a => a.id));
  const totals = { concept: 0, apply: 0, industrial: 0 };
  const done   = { concept: 0, apply: 0, industrial: 0 };
  Object.values(QUESTIONS).flat().forEach(q => { totals[q.tier]++; if (solved.has(q.id)) done[q.tier]++; });
  const days = {};
  att.forEach(a => { const k = dkey(a.ts || Date.now()); days[k] = (days[k] || 0) + 1; });
  const last = att.filter(a => a.good).sort((a, b) => (b.ts || 0) - (a.ts || 0))[0];
  return { solved, totals, done, days, last };
}

function heatHtml(days) {
  const cells = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 181; i >= 0; i--) {
    const k = dkey(today.getTime() - i * 86400000);
    const n = days[k] || 0;
    const c = n === 0 ? 'rgba(255,255,255,.06)' : n < 3 ? 'rgba(240,86,28,.45)' : n < 6 ? 'rgba(240,86,28,.75)' : '#f0561c';
    cells.push('<span style="width:11px;height:11px;border-radius:3px;background:' + c + '"></span>');
  }
  return '<div style="display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,11px);gap:3px;overflow:hidden">' + cells.join('') + '</div>';
}

function boardHtml() {
  const { solved, totals, done, days, last } = compute();
  const allT = totals.concept + totals.apply + totals.industrial;
  const allD = solved.size;
  const pct = allT ? Math.round(allD / allT * 100) : 0;
  const lq = last ? findQ(last.id) : null;
  const tier = (k, label, col) => '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed var(--line)">' +
    '<span style="width:8px;height:8px;border-radius:50%;background:' + col + '"></span><span style="flex:1">' + label + '</span>' +
    '<span class="mono">' + done[k] + ' / ' + totals[k] + '</span></div>';
  return '<section class="card" data-board style="margin-bottom:18px;padding:20px">' +
    '<div class="kicker">📊 PROGRESS BOARD</div>' +
    '<div style="display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin-top:12px">' +
    '<div><h4 style="margin-bottom:8px">Problems solved</h4>' +
      '<div style="display:flex;gap:14px;align-items:center">' +
      '<svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="none" stroke="var(--line)" stroke-width="8"/>' +
      '<circle cx="42" cy="42" r="34" fill="none" stroke="var(--acc)" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 34) + '" stroke-dashoffset="' + (2 * Math.PI * 34 * (1 - pct / 100)) + '" transform="rotate(-90 42 42)"/>' +
      '<text x="42" y="47" text-anchor="middle" style="font:700 18px var(--fm);fill:var(--ink)">' + allD + '</text></svg>' +
      '<div style="flex:1">' + tier('concept', 'Easy', 'var(--green)') + tier('apply', 'Medium', 'var(--gold)') + tier('industrial', 'Hard', 'var(--red)') + '</div></div></div>' +
    '<div><h4 style="margin-bottom:8px">Activity · last 26 weeks</h4>' + heatHtml(days) +
      '<p class="faint" style="font-size:.72rem;margin-top:8px">less ▸ more</p></div></div>' +
    (lq ? '<div style="display:flex;gap:10px;align-items:center;margin-top:14px;border:1px dashed var(--line);border-radius:12px;padding:10px 14px">' +
      '<span class="mono faint">LAST SOLVED</span><b style="flex:1">' + lq.q.q.slice(0, 60) + '</b>' +
      '<a class="btn btn-ghost btn-sm" href="#/practice/' + lq.topic + '">OPEN →</a></div>' : '') +
    '<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-top:16px">' +
    LEVELS.slice(0, 6).map(lv => {
      const p = S.levelProgress(lv);
      const qs = lv.lessons.length ? Object.values(QUESTIONS).flat().length && lv.id === 'l0' ? Object.values(QUESTIONS).flat().length : 0 : 0;
      return '<div style="border:1px solid var(--line);border-radius:12px;padding:12px"><b>' + lv.title + '</b>' +
        '<p class="faint" style="font-size:.72rem;margin:4px 0">' + lv.lessons.length + ' lessons · ' + (lv.id === 'l0' ? Object.values(QUESTIONS).flat().length : 0) + ' questions</p>' +
        '<div class="progress-bar pb-sm">' + '<i style="width:' + p.pct + '%"></i></div>' +
        '<span class="mono" style="font-size:.7rem;color:var(--acc)">' + p.pct + '%</span></div>';
    }).join('') + '</div></section>';
}

function mount() {
  if ((location.hash || '').replace('#', '') !== '/profile') return;
  const old = document.querySelector('[data-board]');
  if (old) old.remove();
  const head = document.querySelector('.page-head');
  if (head) head.insertAdjacentHTML('afterend', boardHtml());
}
S.subscribe(() => setTimeout(mount, 80));
addEventListener('hashchange', () => setTimeout(mount, 80));
setTimeout(mount, 80);
