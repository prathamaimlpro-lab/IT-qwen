/**
 * ================================================================
 *  AE3301 · HUB LAYOUT — competitor-style topic cards
 *  Every lesson becomes a card: mastery bar + 4 actions
 *  ▶ Start/Review · 🧩 Practice ·  Visualize · 🎤 Interview
 * ================================================================
 */
import * as S from './core.js';
import { LESSONS } from './data.js';

function scrollToBlock(names) {
  const tags = [...document.querySelectorAll('.blk-tag')];
  const t = tags.find(x => names.some(n => x.textContent.toUpperCase().includes(n)));
  (t ? t.closest('.card') : null)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
const goViz = id => { location.hash = '#/lesson/' + id; setTimeout(() => scrollToBlock(['INTERACTIVE']), 500); };
const goInt = id => { location.hash = '#/lesson/' + id; setTimeout(() => scrollToBlock(['INTERVIEW']), 500); };

function card(ls) {
  const st = S.lessonStatus(ls.id);
  const m = S.topicStats(ls.id);
  const pct = m && m.total ? Math.round(m.m * 100) : 0;
  const done = st === 'completed';
  return '<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">' +
    '<div style="display:flex;gap:10px;align-items:center">' +
    '<span style="width:38px;height:38px;border-radius:10px;border:1px solid var(--line);display:grid;place-items:center">' + (done ? '✅' : '📘') + '</span>' +
    '<div style="flex:1"><b>' + ls.title + '</b><div class="mono faint" style="font-size:.68rem">' + ls.minutes + ' min · ' + (done ? 'completed' : st === 'ready' ? 'ready' : 'soon') + '</div></div></div>' +
    '<div class="progress-bar pb-sm"><i style="width:' + pct + '%"></i></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
    '<a class="btn btn-primary btn-sm" href="#/lesson/' + ls.id + '">▶ ' + (done ? 'REVIEW' : 'START') + '</a>' +
    '<a class="btn btn-ghost btn-sm" href="#/practice/' + ls.id + '">🧩 Practice</a>' +
    '<button class="btn btn-ghost btn-sm" data-viz="' + ls.id + '">◉ Visualize</button>' +
    '<button class="btn btn-ghost btn-sm" data-int="' + ls.id + '">🎤 Interview</button>' +
    '</div></div>';
}

function mount() {
  const m = (location.hash || '').match(/#\/level\/(l\d+)/);
  if (!m) return;
  const list = document.querySelector('.lesson-list');
  if (!list || list.dataset.hub) return;
  const ids = [...list.querySelectorAll('[data-ls]')].map(x => x.dataset.ls);
  if (!ids.length) return;                     /* locked/planned levels keep roadmap preview */
  list.dataset.hub = '1';
  list.style.cssText = 'display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))';
  list.innerHTML = ids.map(id => card(LESSONS[id])).join('');
  list.querySelectorAll('[data-viz]').forEach(b => b.onclick = () => goViz(b.dataset.viz));
  list.querySelectorAll('[data-int]').forEach(b => b.onclick = () => goInt(b.dataset.int));
}
addEventListener('hashchange', () => setTimeout(mount, 60));
setTimeout(mount, 60);
