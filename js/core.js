/* IT QUEST v2 — single writer for player state + adaptive learning engine. */
import { XP, levelInfo, LEVELS, LESSONS, QUESTIONS, ARENA } from './data.js';

const KEY = 'itq2:save';
const OK = (() => { try { localStorage.setItem('__iq2', '1'); localStorage.removeItem('__iq2'); return true; } catch { return false; } })();
const pad2 = n => String(n).padStart(2, '0');
const dateStr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayStr = () => dateStr();
const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); };

function load() {
  if (!OK) return null;
  try { const d = JSON.parse(localStorage.getItem(KEY)); return d && d.s ? d.s : null; } catch { return null; }
}
function save(s) { if (OK) try { localStorage.setItem(KEY, JSON.stringify({ v: 1, s })); } catch {} }

function defaults() {
  return {
    name: 'Explorer', accent: '#38e1ff', xp: 0,
    completedLessons: [], startedLessons: [],
    attempts: [], awardedQ: [], solvedArena: [], gates: [],
    achievements: [], showcase: [], codes: {}, customized: false,
    streak: { count: 0, lastActive: null },
    today: { date: todayStr(), xp: 0, lessons: 0, problems: 0 },
    createdAt: Date.now()
  };
}
let state = Object.assign({}, defaults(), load() || {});
const listeners = new Set();

function commit() {
  if (state.today.date !== todayStr()) state.today = { date: todayStr(), xp: 0, lessons: 0, problems: 0 };
  save(state); listeners.forEach(fn => fn(state));
}
export const getState = () => state;
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const TIER_XP = { concept: XP.easy, apply: XP.medium, industrial: XP.hard };

function addXp(n) {
  state.xp += n; state.today.xp += n;
  const t = todayStr();
  if (state.streak.lastActive !== t) {
    state.streak.count = state.streak.lastActive === yesterdayStr() ? state.streak.count + 1 : 1;
    state.streak.lastActive = t;
  }
}

const CHECKS = {
  'first-xp': s => s.xp > 0,
  'first-step': s => s.completedLessons.length >= 1,
  'gate-pass': s => s.gates.length >= 1,
  'arena-1': s => s.solvedArena.length >= 1,
  'deep-3': s => s.completedLessons.length >= 3,
  'stylist': s => s.customized
};
import { ACHIEVEMENTS } from './data.js';
function evaluate() {
  const gained = []; let changed = true, guard = 0;
  while (changed && guard++ < 5) {
    changed = false;
    for (const a of ACHIEVEMENTS) {
      if (!state.achievements.some(x => x.id === a.id) && CHECKS[a.id] && CHECKS[a.id](state)) {
        state.achievements.push({ id: a.id, at: Date.now() }); gained.push(a); changed = true;
      }
    }
  }
  return gained;
}
function result(before, extra) {
  const b = levelInfo(before), a = levelInfo(state.xp);
  return Object.assign({ gained: state.xp - before, totalXp: state.xp, leveledUp: a.level > b.level, newLevel: a, achievements: evaluate() }, extra);
}

/* ---------- actions ---------- */
export function setName(n) { state.name = String(n).trim().slice(0, 24) || 'Explorer'; commit(); }
export function setAccent(c) { state.accent = c; state.customized = true; const r = result(state.xp); commit(); return r; }
export function toggleShowcase(id) {
  const i = state.showcase.indexOf(id);
  if (i >= 0) state.showcase.splice(i, 1);
  else { if (state.showcase.length >= 3) return { full: true }; state.showcase.push(id); state.customized = true; }
  const r = result(state.xp); commit(); return r;
}
export function markStarted(id) { if (!state.startedLessons.includes(id)) { state.startedLessons.push(id); commit(); } }
export function setCode(id, code) { state.codes[id] = code; save(state); }

export function recordAnswer(q, topic, correct) {
  state.attempts.push({ topic, tags: q.tags, correct, at: Date.now() });
  state.today.problems += 1;
  const before = state.xp;
  if (correct && !state.awardedQ.includes(q.id)) { state.awardedQ.push(q.id); addXp(TIER_XP[q.tier]); }
  const r = result(before); commit(); return r;
}
export function passGate(topic) {
  if (state.gates.includes(topic)) return { gained: 0, achievements: [], leveledUp: false, newLevel: levelInfo(state.xp), duplicate: true };
  const before = state.xp; state.gates.push(topic); addXp(XP.gate);
  const r = result(before); commit(); return r;
}
export function completeLesson(id) {
  if (state.completedLessons.includes(id)) return { gained: 0, achievements: [], leveledUp: false, newLevel: levelInfo(state.xp), duplicate: true };
  const before = state.xp; state.completedLessons.push(id); state.today.lessons += 1; addXp(XP.lesson);
  const r = result(before); commit(); return r;
}
export function solveArena(id) {
  if (state.solvedArena.includes(id)) return { gained: 0, achievements: [], leveledUp: false, newLevel: levelInfo(state.xp), duplicate: true };
  const before = state.xp; state.solvedArena.push(id); state.today.problems += 1; addXp(XP.arena);
  const r = result(before); commit(); return r;
}
export function resetAll() { if (OK) localStorage.removeItem(KEY); location.hash = '#/home'; location.reload(); }

/* ---------- selectors + adaptive engine ---------- */
export function lessonStatus(id) {
  if (state.completedLessons.includes(id)) return 'completed';
  if (LESSONS[id]) return 'ready';
  return 'soon';
}
export function nextLesson() {
  for (const l of LEVELS) for (const ls of l.lessons)
    if (LESSONS[ls.id] && !state.completedLessons.includes(ls.id)) return ls;
  return null;
}
export function levelProgress(level) {
  const total = level.lessons.length;
  const done = level.lessons.filter(ls => state.completedLessons.includes(ls.id)).length;
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}
export function levelLocked(level) {
  if (level.num === 0) return false;
  const prev = LEVELS[level.num - 1];
  return !(prev && prev.lessons.length && prev.lessons.every(ls => state.completedLessons.includes(ls.id)));
}
export function topicStats(topic) {
  const a = state.attempts.filter(x => x.topic === topic);
  const correct = a.filter(x => x.correct).length;
  const last = a.length ? Math.max(...a.map(x => x.at)) : null;
  return { total: a.length, correct, m: a.length ? correct / a.length : null, last };
}
export function topicLabel(topic) {
  for (const l of LEVELS) { const ls = l.lessons.find(x => x.id === topic); if (ls) return ls.title; }
  return topic;
}
function weakestTopic() {
  let worst = null;
  for (const t of Object.keys(QUESTIONS)) {
    const s = topicStats(t);
    if (s.total > 0 && s.m < 0.7 && (!worst || s.m < worst.m)) worst = { topic: t, m: s.m };
  }
  return worst;
}
function staleTopic() {
  const day = 86400000;
  for (const t of Object.keys(QUESTIONS)) {
    const s = topicStats(t);
    if (s.total > 0 && s.m < 1) {
      const days = Math.floor((Date.now() - s.last) / day);
      if (days >= 2) return { topic: t, days };
    }
  }
  return null;
}
export function plan() {
  const s = state, steps = [];
  const cont = LEVELS.flatMap(l => l.lessons).find(ls => LESSONS[ls.id] && s.startedLessons.includes(ls.id) && !s.completedLessons.includes(ls.id));
  if (cont) steps.push({ icon: 'play', title: 'Continue: ' + cont.title, why: 'You started it — pass its gate to lock it in.', href: '#/lesson/' + cont.id });
  const weak = weakestTopic();
  if (weak) steps.push({ icon: 'target', title: 'Shore up: ' + topicLabel(weak.topic), why: 'Mastery ' + Math.round(weak.m * 100) + '% — below your 70% bar.', href: '#/practice/' + weak.topic });
  const nl = nextLesson();
  if (nl && !s.startedLessons.includes(nl.id)) steps.push({ icon: 'book', title: 'New lesson: ' + nl.title, why: 'Next on your Level 0 path.', href: '#/lesson/' + nl.id });
  const ar = ARENA.find(a => !s.solvedArena.includes(a.id));
  if (ar) steps.push({ icon: 'code', title: 'Arena: ' + ar.title, why: 'Real code, real judge, +' + XP.arena + ' XP.', href: '#/arena' });
  const stale = staleTopic();
  if (stale) steps.push({ icon: 'refresh', title: 'Review: ' + topicLabel(stale.topic), why: 'Last practiced ' + stale.days + 'd ago — memory fades.', href: '#/practice/' + stale.topic });
  return steps.slice(0, 4);
}
export function overallPct() {
  const all = LEVELS.flatMap(l => l.lessons);
  const done = all.filter(ls => state.completedLessons.includes(ls.id)).length;
  return all.length ? Math.round(done / all.length * 100) : 0;
}
export { levelInfo };
