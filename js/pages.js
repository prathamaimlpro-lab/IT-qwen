/* IT QUEST v2 — pages + router + boot (A). Entry module. */
import { XP, LEVELS, LESSONS, QUESTIONS, ARENA, ACHIEVEMENTS, ACCENTS, levelInfo } from './data.js';
import * as S from './core.js';
import { icon, escapeHtml, progressBar, statusBadge, toast, celebrate, mergeResults, buildShell, initShellUpdates, setActiveNav, setupReveal, scanReveals, openOverlay } from './ui.js';
import { initSims } from './sims.js';

function questionsHtml(topic) {
  return QUESTIONS[topic].map(q => `
    <article class="card q-card" data-q="${q.id}">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
        <span class="tier ${q.tier}">${q.tier.toUpperCase()}</span>
        <span class="faint" style="font-size:.75rem">${q.tags.join(' · ')}</span>
      </div>
      <p style="font-weight:700">${escapeHtml(q.q)}</p>
      <div class="q-opts">${q.options.map((o, i) => `<button class="q-opt" data-opt="${i}">${escapeHtml(o)}</button>`).join('')}</div>
      <div class="q-hint"><button class="btn btn-ghost btn-sm" data-hint>${icon('search')} HINT</button> <span class="faint" data-hinttxt style="font-size:.85rem"></span></div>
      <div class="q-feed" data-feed></div>
    </article>`).join('');
}
function bindQuestions(root, topic, onAllDone) {
  const cards = [...root.querySelectorAll('.q-card')];
  const run = { answered: 0, correct: 0 };
  cards.forEach(card => {
    const q = QUESTIONS[topic].find(x => x.id === card.dataset.q);
    card.querySelector('[data-hint]').addEventListener('click', () => { card.querySelector('[data-hinttxt]').textContent = q.hint; });
    card.querySelectorAll('.q-opt').forEach(btn => btn.addEventListener('click', () => {
      if (card.classList.contains('done')) return;
      const pick = +btn.dataset.opt, good = pick === q.answer;
      const res = S.recordAnswer(q, topic, good);
      card.classList.add('done');
      card.querySelector('.q-opts').classList.add('answered');
      btn.classList.add(good ? 'correct' : 'wrong');
      if (good) card.querySelector(`[data-opt="${q.answer}"]`).classList.add('correct');
      const feed = card.querySelector('[data-feed]');
      feed.className = 'q-feed show ' + (good ? 'good' : 'bad');
      feed.innerHTML = good ? `<b>✓ Correct.</b> ${escapeHtml(q.explain)}` : `<b>✗ Not quite.</b> ${escapeHtml(q.wrongWhy[pick])} <i>(Answer: ${escapeHtml(q.options[q.answer])})</i>`;
      if (good && res.gained) celebrate(res, btn);
      run.answered++; if (good) run.correct++;
      if (onAllDone && run.answered === cards.length) onAllDone(run);
    }));
  });
}

function renderHome() {
  const s = S.getState(), li = levelInfo(s.xp), steps = S.plan();
  const nl = S.nextLesson();
  return `
  <div class="page-head">
    <div class="kicker">${icon('sparkle')} WELCOME BACK, ${escapeHtml(s.name).toUpperCase()}</div>
    <h1>Level ${li.level} · ${li.title}</h1>
    <p class="muted">${li.isMax ? 'Max level for now.' : li.need + ' XP to Level ' + li.nextLevel + ' — ' + li.nextTitle + '.'} Your path is <b>designed for you</b> from your mastery data.</p>
  </div>
  <div class="hero-grid">
    <section class="card plan-card">
      <div class="kicker">${icon('target')} TODAY’S PATH — AUTO-DESIGNED</div>
      ${steps.length ? steps.map(st => `
        <a class="plan-step" href="${st.href}">
          <span class="ps-ico">${icon(st.icon)}</span>
          <div><h4>${escapeHtml(st.title)}</h4><div class="ps-why">${escapeHtml(st.why)}</div></div>
          ${icon('arrow-right')}
        </a>`).join('') : '<p class="muted" style="margin-top:12px">Answer questions and finish lessons — your adaptive path builds itself.</p>'}
    </section>
    <section class="card">
      <div class="kicker">${icon('book')} CONTINUE LEARNING</div>
      ${nl ? `<h3 style="margin:10px 0 6px">${escapeHtml(nl.title)}</h3><p class="muted" style="font-size:.9rem">Deep lesson + mastery gate.</p>
      <div style="margin:14px 0">${progressBar(S.levelProgress(LEVELS[0]).pct)}</div>
      <a class="btn btn-primary" href="#/lesson/${nl.id}">${icon('play')} ${s.startedLessons.includes(nl.id) ? 'CONTINUE' : 'START'}</a>`
      : '<p class="muted" style="margin-top:12px">All current lessons complete.</p>'}
    </section>
  </div>
  <div class="stats-grid" style="margin-top:18px">
    <div class="card stat-tile st-lessons"><span class="stat-num">${s.today.lessons}</span><span class="stat-label">Lessons today</span></div>
    <div class="card stat-tile st-prob"><span class="stat-num">${s.today.problems}</span><span class="stat-label">Problems today</span></div>
    <div class="card stat-tile st-xp"><span class="stat-num">${s.today.xp}</span><span class="stat-label">XP today</span></div>
    <div class="card stat-tile st-streak"><span class="stat-num">${s.streak.count}</span><span class="stat-label">Day streak</span></div>
  </div>
  <h2 class="section-title">${icon('chart')} SKILL MASTERY</h2>
  <div class="skills-grid">
    ${LEVELS.map(lv => {
      const locked = S.levelLocked(lv), p = S.levelProgress(lv);
      const m = lv.num === 0 ? Math.round((S.topicStats('cb-computer').m ?? 0) * 100) : 0;
      return `<a class="card skill-tile ${locked ? 'locked' : 'clickable'}" href="${locked ? '#/learn' : '#/level/' + lv.id}">
        <div class="skill-ico">${lv.num === 0 ? icon('monitor') : icon('lock')}</div>
        <h4 style="font-size:.95rem">${escapeHtml(lv.title)}</h4>
        ${statusBadge(locked ? 'locked' : p.pct === 100 ? 'done' : p.done ? 'progress' : 'open')}
        ${progressBar(p.pct, { small: true })}
        <span class="mastery-line">mastery ${lv.num === 0 ? m + '%' : '—'}</span>
      </a>`;
    }).join('')}
  </div>`;
}

function renderLearn() {
  return `
  <div class="page-head"><div class="kicker">${icon('book')} CURRICULUM</div><h1>Your path, zero → engineer</h1>
  <p class="muted">Each level unlocks the next. Lessons are deep: analogy → mechanism → industrial view → mastery gate.</p></div>
  <div class="lesson-list">
    ${LEVELS.map(lv => {
      const locked = S.levelLocked(lv), p = S.levelProgress(lv);
      return `<div class="lesson-row ${locked ? 'upcoming' : 'clickable'}" ${locked ? '' : `data-lv="${lv.id}"`}>
        <div class="row-num">${lv.icon}</div>
        <div><h4>LEVEL ${lv.num} — ${escapeHtml(lv.title)}</h4><div class="lr-sub">${escapeHtml(lv.tagline)} · ${lv.lessons.length || '≈40'} lessons</div></div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${statusBadge(locked ? 'locked' : p.pct === 100 ? 'done' : p.done ? 'progress' : 'open')}${progressBar(p.pct, { small: true })}</div>
      </div>`;
    }).join('')}
  </div>`;
}
function mountLearn(root) {
  root.querySelectorAll('[data-lv]').forEach(r => r.addEventListener('click', () => location.hash = '#/level/' + r.dataset.lv));
}
function renderLevel(id) {
  const lv = LEVELS.find(l => l.id === id);
  if (!lv) return '<p class="empty-note">Level not found.</p>';
  if (S.levelLocked(lv)) return `<p class="empty-note">🔒 Complete Level ${lv.num - 1} to unlock.</p>`;
  return `
  <a class="back-link" href="#/learn">${icon('arrow-left')} Curriculum</a>
  <div class="page-head"><div class="kicker">LEVEL ${lv.num}</div><h1>${escapeHtml(lv.title)}</h1><p class="muted">${escapeHtml(lv.tagline)}</p></div>
  <div class="lesson-list">
    ${lv.lessons.map((ls, i) => {
      const st = S.lessonStatus(ls.id);
      return `<div class="lesson-row ${st === 'ready' ? 'clickable current' : st === 'completed' ? 'done' : 'upcoming'}" ${st !== 'soon' ? `data-ls="${ls.id}"` : ''}>
        <div class="row-num">${st === 'completed' ? icon('check') : String(i + 1).padStart(2, '0')}</div>
        <div><h4>${escapeHtml(ls.title)}</h4><div class="lr-sub">${ls.minutes} min · deep lesson · gate to complete</div></div>
        <div style="display:flex;gap:8px;align-items:center">${st === 'soon' ? icon('lock') : st === 'completed' ? statusBadge('done') : icon('play')}</div>
      </div>`;
    }).join('')}
  </div>`;
}
function mountLevel(root) {
  root.querySelectorAll('[data-ls]').forEach(r => r.addEventListener('click', () => location.hash = '#/lesson/' + r.dataset.ls));
}

const BLK = {
  analogy: b => `<div class="callout c-analogy"><div class="co-ico">${icon('sparkle')}</div><div><h5>${escapeHtml(b.title)}</h5><div>${b.html}</div></div></div>`,
  p: b => `<p>${b.html}</p>`,
  terms: b => `<div class="terms">${b.items.map(t => `<div class="term-card"><b>${t.t}</b><p>${t.d}</p></div>`).join('')}</div>`,
  steps: b => `<div class="blk-head"><span class="blk-tag" style="background:linear-gradient(135deg,var(--acc),var(--blue))">MECHANISM</span><h3>${escapeHtml(b.title)}</h3></div><ol class="steps">${b.items.map(i => `<li><span>${i}</span></li>`).join('')}</ol>`,
  viz: b => `<div class="blk-head"><span class="blk-tag" style="background:linear-gradient(135deg,#ffd27d,#ffab3d)">INTERACTIVE</span><h3>${escapeHtml(b.title)}</h3></div><div data-sim="${b.id}"></div>`,
  realworld: b => `<div class="callout c-realworld"><div class="co-ico">${icon('globe')}</div><div><h5>${escapeHtml(b.title)}</h5><div>${b.html}</div></div></div>`,
  pitfall: b => `<div class="callout c-pitfall"><div class="co-ico">${icon('alert')}</div><div><h5>${escapeHtml(b.title)}</h5><div>${b.html}</div></div></div>`,
  deepdive: b => `<div class="callout c-deepdive"><div class="co-ico">${icon('search')}</div><div><h5>${escapeHtml(b.title)}</h5><div>${b.html}</div></div></div>`,
  interview: b => `<div class="callout c-interview"><div class="co-ico">${icon('trophy')}</div><div><h5>${escapeHtml(b.title)}</h5><div>${b.html}</div></div></div>`,
  summary: b => `<div class="blk-head"><span class="blk-tag" style="background:linear-gradient(135deg,#3ddc97,#18b27b)">SUMMARY</span><h3>What you now know</h3></div><ul class="summary-list">${b.points.map(p => `<li>${icon('check')}<span>${p}</span></li>`).join('')}</ul>`
};
function renderLesson(id) {
  const L = LESSONS[id];
  if (!L) return '<p class="empty-note">Lesson not available yet.</p>';
  const done = S.getState().completedLessons.includes(id);
  const qs = QUESTIONS[id] || [];
  return `
  <a class="back-link" href="#/level/l0">${icon('arrow-left')} Level 0</a>
  <h1 class="lesson-title">${escapeHtml(L.title)}</h1>
  <div class="lesson-meta"><span>${icon('clock')} deep lesson</span><span>${icon('target')} gate: pass ${Math.ceil(qs.length * 0.7)} of ${qs.length}</span>${done ? `<span style="color:var(--green)">${icon('check')} completed</span>` : ''}</div>
  <div class="lesson-body">
    ${L.blocks.map(b => `<section class="card block-card">${BLK[b.kind] ? BLK[b.kind](b) : ''}</section>`).join('')}
    <section class="card gate-card" data-gate>
      <div class="kicker" style="justify-content:center;color:var(--gold)">${icon('shield')} MASTERY GATE</div>
      <h3>Prove it: ${qs.length} questions on this topic</h3>
      <p class="muted">Pass with ${Math.ceil(qs.length * 0.7)}+ correct (+${XP.gate} gate XP, +${XP.lesson} lesson XP).</p>
      <div class="cp-actions">${done ? '<span class="status-badge b-done">' + icon('check') + 'Gate passed</span>' : `<button class="btn btn-gold btn-lg" data-gatestart>${icon('play')} START THE GATE</button>`}</div>
      <div data-gatebody style="margin-top:18px;text-align:left"></div>
    </section>
  </div>`;
}
function mountLesson(root, id) {
  S.markStarted(id);
  initSims(root);
  const start = root.querySelector('[data-gatestart]');
  if (!start) return;
  function startGate(body) {
    body.innerHTML = questionsHtml(id);
    bindQuestions(body, id, run => {
      const need = Math.ceil(QUESTIONS[id].length * 0.7);
      if (run.correct >= need) {
        const r = mergeResults([S.passGate(id), S.completeLesson(id)]);
        body.innerHTML = '<p class="empty-note" style="color:var(--green)">✓ GATE PASSED ' + run.correct + '/' + QUESTIONS[id].length + ' — lesson complete!</p>';
        celebrate(r);
      } else {
        body.insertAdjacentHTML('beforeend', '<p class="empty-note" style="margin-top:12px">' + run.correct + '/' + QUESTIONS[id].length + ' — need ' + need + '. Read the red feedback, then retry.</p><div class="cp-actions"><button class="btn btn-primary" data-retry>RETRY GATE</button></div>');
        body.querySelector('[data-retry]').addEventListener('click', () => startGate(body));
      }
    });
  }
  start.addEventListener('click', () => { start.disabled = true; startGate(root.querySelector('[data-gatebody]')); });
}
