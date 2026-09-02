/* IT QUEST v2 — pages + router + boot. Entry module loaded by index.html. */
import { XP, LEVELS, LESSONS, QUESTIONS, ARENA, ACHIEVEMENTS, ACCENTS, levelInfo } from './data.js';
import * as S from './core.js';
import { icon, escapeHtml, progressBar, statusBadge, toast, celebrate, mergeResults, buildShell, initShellUpdates, setActiveNav, setupReveal, scanReveals, openOverlay, sleep } from './ui.js';
import { initSims } from './sims.js';

/* ---------- shared: question cards ---------- */
function questionsHtml(topic) {
  return QUESTIONS[topic].map(q => `
    <article class="card q-card" data-q="${q.id}">
      <div class="p-head" style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
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
    card.querySelector('[data-hint]').addEventListener('click', () => {
      card.querySelector('[data-hinttxt]').textContent = q.hint;
    });
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
      feed.innerHTML = good ? `<b>✓ Correct.</b> ${escapeHtml(q.explain)}` : `<b>✗ Not quite.</b> ${escapeHtml(q.wrongWhy[pick])} <i>(The answer: ${escapeHtml(q.options[q.answer])})</i>`;
      if (good && res.gained) celebrate(res, btn);
      run.answered++; if (good) run.correct++;
      if (onAllDone && run.answered === cards.length) onAllDone(run);
    }));
  });
}

/* ---------- HOME ---------- */
function renderHome() {
  const s = S.getState(), li = levelInfo(s.xp), steps = S.plan();
  const nl = S.nextLesson();
  return `
  <div class="page-head">
    <div class="kicker">${icon('sparkle')} WELCOME BACK, ${escapeHtml(s.name).toUpperCase()}</div>
    <h1>Level ${li.level} · ${li.title}</h1>
    <p class="muted">${li.isMax ? 'Max level for now.' : li.need + ' XP to Level ' + li.nextLevel + ' — ' + li.nextTitle + '.'} Your path below is <b>designed for you</b> from your mastery data.</p>
  </div>
  <div class="hero-grid">
    <section class="card plan-card">
      <div class="kicker">${icon('target')} TODAY’S PATH — AUTO-DESIGNED</div>
      ${steps.length ? steps.map(st => `
        <a class="plan-step" href="${st.href}">
          <span class="ps-ico">${icon(st.icon)}</span>
          <div><h4>${escapeHtml(st.title)}</h4><div class="ps-why">${escapeHtml(st.why)}</div></div>
          ${icon('arrow-right')}
        </a>`).join('') : '<p class="muted" style="margin-top:12px">Answer questions and finish lessons — your adaptive path builds itself from your mastery.</p>'}
    </section>
    <section class="card">
      <div class="kicker">${icon('book')} CONTINUE LEARNING</div>
      ${nl ? `<h3 style="margin:10px 0 6px">${escapeHtml(nl.title)}</h3><p class="muted" style="font-size:.9rem">${escapeHtml(LESSONS[nl.id] ? 'Deep lesson + mastery gate.' : '')}</p>
      <div style="margin:14px 0">${progressBar(S.levelProgress(LEVELS[0]).pct)}</div>
      <a class="btn btn-primary" href="#/lesson/${nl.id}">${icon('play')} ${s.startedLessons.includes(nl.id) ? 'CONTINUE' : 'START'}</a>`
      : '<p class="muted" style="margin-top:12px">All current lessons complete. More drop soon.</p>'}
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
      const m = lv.num === 0 ? Math.round((QUESTIONS['cb-computer'] ? (S.topicStats('cb-computer').m ?? 0) : 0) * 100) : 0;
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

/* ---------- LEARN ---------- */
function renderLearn() {
  return `
  <div class="page-head"><div class="kicker">${icon('book')} CURRICULUM</div><h1>Your path, zero → engineer</h1>
  <p class="muted">Each level unlocks the next. Lessons are <b>deep</b>: analogy → mechanism → industrial view → mastery gate.</p></div>
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
        <div class="row-status" style="display:flex;gap:8px;align-items:center">${st === 'soon' ? icon('lock') : st === 'completed' ? statusBadge('done') : icon('play', 'play-ico')}</div>
      </div>`;
    }).join('')}
  </div>`;
}
function mountLevel(root) {
  root.querySelectorAll('[data-ls]').forEach(r => r.addEventListener('click', () => location.hash = '#/lesson/' + r.dataset.ls));
}

/* ---------- LESSON ---------- */
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
      <p class="muted">Pass with ${Math.ceil(qs.length * 0.7)}+ correct to complete the lesson (+${XP.gate} gate XP, +${XP.lesson} lesson XP).</p>
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
  start.addEventListener('click', () => {
    const body = root.querySelector('[data-gatebody]');
    body.innerHTML = questionsHtml(id);
    start.disabled = true;
    bindQuestions(body, id, run => {
      const need = Math.ceil(QUESTIONS[id].length * 0.7);
      if (run.correct >= need) {
        const r = mergeResults([S.passGate(id), S.completeLesson(id)]);
        body.innerHTML = `<p class="empty-note" style="border-color:rgba(61,220,151,.5);color:var(--green)">✓ GATE PASSED ${run.correct}/${QUESTIONS[id].length} — lesson complete!</p>`;
        celebrate(r);
      } else {
        body.insertAdjacentHTML('beforeend', `<p class="empty-note" style="margin-top:12px">${run.correct}/${QUESTIONS[id].length} — need ${need}. Review the red feedback above, then retry.</p><div class="cp-actions"><button class="btn btn-primary" data-retry>${icon('refresh')} RETRY GATE</button></div>`);
        body.querySelector('[data-retry]').addEventListener('click', () => { body.innerHTML = questionsHtml(id); bindQuestions(body, id, arguments.callee ? undefined : undefined); mountRetry(body); });
        function mountRetry(b) { bindQuestions(b, id, run2 => { if (run2.correct >= need) { const r = mergeResults([S.passGate(id), S.completeLesson(id)]); b.innerHTML = '<p class="empty-note" style="color:var(--green)">✓ GATE PASSED — lesson complete!</p>'; celebrate(r); } }); }
      }
    });
  });
}

/* ---------- PRACTICE (free practice per topic) ---------- */
function renderPractice(topic) {
  if (!QUESTIONS[topic]) return '<p class="empty-note">No questions for this topic yet.</p>';
  return `
  <a class="back-link" href="#/home">${icon('arrow-left')} Home</a>
  <div class="page-head"><div class="kicker">${icon('target')} PRACTICE</div><h1>${escapeHtml(S.topicLabel(topic))}</h1>
  <p class="muted">First correct answer earns XP by tier: concept +${XP.easy}, apply +${XP.medium}, industrial +${XP.hard}. Wrong answers teach via feedback.</p></div>
  <div data-qs>${questionsHtml(topic)}</div>`;
}
function mountPractice(root, topic) { bindQuestions(root, topic); }

/* ---------- ARENA ---------- */
function makeJudge() {
  const src = `self.onmessage=function(e){var d=e.data;try{var f=new Function(d.code+';return '+d.fn+';')();var out=d.cases.map(function(c){var got;try{got=f.apply(null,c[0]);}catch(err){got='ERROR: '+err.message;}return{got:got,exp:c[1],pass:JSON.stringify(got)===JSON.stringify(c[1])};});self.postMessage({ok:true,out:out});}catch(err){self.postMessage({ok:false,err:err.message});}};`;
  return new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
}
function renderArena() {
  const s = S.getState();
  return `
  <div class="page-head"><div class="kicker">${icon('code')} CODING ARENA</div><h1>Write real code. A real judge tests it.</h1>
  <p class="muted">Your code runs in a sealed, timed box (Web Worker) — safe to experiment. RUN shows sample cases; SUBMIT runs hidden tests. +${XP.arena} XP per solved problem.</p></div>
  ${ARENA.map(p => {
    const solved = s.solvedArena.includes(p.id);
    return `<section class="card" data-prob="${p.id}" style="margin-bottom:18px">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">
        <span class="tier ${p.tier}">${p.tier.toUpperCase()}</span><h3>${escapeHtml(p.title)}</h3>
        ${solved ? '<span class="status-badge b-done" style="margin-left:auto">' + icon('check') + 'Solved</span>' : ''}
      </div>
      <p class="muted" style="margin-bottom:12px">${escapeHtml(p.prompt)}</p>
      <textarea class="code-box" spellcheck="false">${escapeHtml(s.codes[p.id] ?? p.starter)}</textarea>
      <div class="cp-actions" style="justify-content:flex-start"><button class="btn btn-ghost" data-run>${icon('play')} RUN</button><button class="btn btn-primary" data-sub>${icon('check')} SUBMIT</button></div>
      <div class="console" data-con>— console —</div>
      <div data-tests></div>
    </section>`;
  }).join('')}`;
}
function mountArena(root) {
  root.querySelectorAll('[data-prob]').forEach(card => {
    const p = ARENA.find(x => x.id === card.dataset.prob);
    const ta = card.querySelector('.code-box'), con = card.querySelector('[data-con]'), tests = card.querySelector('[data-tests]');
    ta.addEventListener('input', () => S.setCode(p.id, ta.value));
    function runJudge(cases, onSubmit) {
      const w = makeJudge(); let done = false;
      const kill = setTimeout(() => { if (!done) { done = true; w.terminate(); con.textContent = '⏱ timed out (2.5s) — infinite loop?'; } }, 2500);
      w.onmessage = e => {
        if (done) return; done = true; clearTimeout(kill); w.terminate();
        if (!e.data.ok) { con.textContent = '✗ ' + e.data.err; tests.innerHTML = ''; return; }
        con.textContent = e.data.out.map(r => `${p.fn}(${JSON.stringify(r.got === undefined ? null : r.got) }) …`).join('\n') || '—';
        con.textContent = e.data.out.map(r => `→ got ${JSON.stringify(r.got)} · expected ${JSON.stringify(r.exp)} ${r.pass ? '✓' : '✗'}`).join('\n');
        tests.innerHTML = e.data.out.map((r, i) => `<div class="test-row ${r.pass ? 'pass' : 'fail'}">${icon(r.pass ? 'check' : 'x')} test ${i + 1}: ${r.pass ? 'passed' : 'failed'}</div>`).join('');
        if (onSubmit && e.data.out.every(r => r.pass)) {
          const res = S.solveArena(p.id);
          if (!res.duplicate) { celebrate(res, card.querySelector('[data-sub]')); toast('success', 'Arena solved: ' + p.title, '+' + XP.arena + ' XP'); }
        }
      };
      w.postMessage({ code: ta.value, fn: p.fn, cases });
    }
    card.querySelector('[data-run]').addEventListener('click', () => runJudge(p.show, false));
    card.querySelector('[data-sub]').addEventListener('click', () => runJudge(p.show.concat(p.hidden), true));
  });
}

/* ---------- PROFILE ---------- */
function renderProfile() {
  const s = S.getState(), li = levelInfo(s.xp);
  return `
  <div class="page-head"><div class="kicker">${icon('user')} PROFILE</div><h1>Your explorer identity</h1></div>
  <section class="card profile-head" style="margin-bottom:18px">
    <div class="ava-big" style="border-color:${s.accent}">${li.avatar}</div>
    <div style="flex:1;min-width:220px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <h2 data-name>${escapeHtml(s.name)}</h2>
        <button class="btn btn-ghost btn-sm" data-editname>${icon('edit')} EDIT</button>
      </div>
      <div data-editrow hidden style="margin-top:10px"><input class="code-box" style="min-height:48px;width:min(240px,100%)" maxlength="24" value="${escapeHtml(s.name)}" data-namein /><button class="btn btn-primary btn-sm" data-savename>SAVE</button></div>
      <p class="muted" style="margin-top:6px">LV ${li.level} · ${escapeHtml(li.title)} · ${s.xp} XP · streak ${s.streak.count}</p>
      <div style="margin-top:8px">${progressBar(li.pct, { gold: true })}</div>
    </div>
  </section>
  <section class="card" style="margin-bottom:18px">
    <div class="kicker">${icon('star')} CUSTOMIZE</div>
    <p class="muted" style="margin:8px 0 12px">Avatar evolves with level: ${LEVELS ? '' : ''}🌱→→🛠️→⚙️→🏛️. Pick your accent:</p>
    <div class="swatches">${ACCENTS.map(c => `<button class="swatch ${c === s.accent ? 'sel' : ''}" data-acc="${c}" style="background:${c}" aria-label="accent"></button>`).join('')}</div>
  </section>
  <section class="card" style="margin-bottom:18px">
    <div class="kicker">${icon('trophy')} ACHIEVEMENT SHOWCASE (pick up to 3)</div>
    <div class="slots" style="margin-top:12px">${[0, 1, 2].map(i => {
      const a = ACHIEVEMENTS.find(x => x.id === s.showcase[i]);
      return `<div class="slot ${a ? 'filled' : ''}">${a ? icon(a.icon) : '+'}</div>`;
    }).join('')}</div>
    <div class="ach-pick">${ACHIEVEMENTS.map(a => {
      const got = s.achievements.some(x => x.id === a.id);
      if (!got) return `<span class="ach-chip" style="opacity:.45">${icon('lock')} ${escapeHtml(a.title)}</span>`;
      return `<button class="ach-chip ${s.showcase.includes(a.id) ? 'on' : ''}" data-show="${a.id}">${icon(a.icon)} ${escapeHtml(a.title)}</button>`;
    }).join('')}</div>
  </section>
  <section class="card">
    <div class="kicker" style="color:var(--red)">${icon('alert')} DANGER ZONE</div>
    <p class="muted" style="margin:8px 0 12px">Wipe XP, lessons, mastery, achievements. Cannot be undone.</p>
    <button class="btn btn-danger" data-reset>${icon('refresh')} RESET ALL PROGRESS</button>
  </section>`;
}
function mountProfile(root) {
  root.querySelector('[data-editname]').addEventListener('click', () => { root.querySelector('[data-editrow]').hidden = false; });
  root.querySelector('[data-savename]').addEventListener('click', () => {
    S.setName(root.querySelector('[data-namein]').value);
    root.querySelector('[data-name]').textContent = S.getState().name;
    root.querySelector('[data-editrow]').hidden = true;
  });
  root.querySelectorAll('[data-acc]').forEach(b => b.addEventListener('click', async () => {
    const r = S.setAccent(b.dataset.acc);
    document.documentElement.style.setProperty('--acc', b.dataset.acc);
    root.querySelectorAll('[data-acc]').forEach(o => o.classList.toggle('sel', o === b));
    root.querySelector('.ava-big').style.borderColor = b.dataset.acc;
    celebrate(r, b);
  }));
  root.querySelectorAll('[data-show]').forEach(b => b.addEventListener('click', () => {
    const r = S.toggleShowcase(b.dataset.show);
    if (r.full) { toast('info', 'Showcase full', 'Max 3 achievements on display.'); return; }
    celebrate(r, b);
    const view = document.getElementById('view'); view.innerHTML = renderProfile(); mountProfile(view);
  }));
  root.querySelector('[data-reset]').addEventListener('click', async () => {
    await openOverlay('<h3>Reset everything?</h3><p class="muted">All progress will be permanently wiped.</p><div class="cp-actions"><button class="btn btn-ghost" data-close>KEEP</button><button class="btn btn-danger" data-yes>YES, RESET</button></div>');
    if (!document.querySelector('[data-yes]')) return;
  });
  const yes = root.querySelector('[data-reset]');
  document.addEventListener('click', function h(e) {
    if (e.target.closest('[data-yes]')) { document.removeEventListener('click', h); S.resetAll(); }
  });
}

/* ---------- router + boot ---------- */
const ROUTES = [
  { re: /^\/?$/, n: 'home' }, { re: /^\/home$/, n: 'home' },
  { re: /^\/learn$/, n: 'learn' }, { re: /^\/level\/([\w-]+)$/, n: 'level' },
  { re: /^\/lesson\/([\w-]+)$/, n: 'lesson' }, { re: /^\/practice\/([\w-]+)$/, n: 'practice' },
  { re: /^\/arena$/, n: 'arena' }, { re: /^\/profile$/, n: 'profile' }
];
const PAGES = {
  home: { r: renderHome, m: null, t: 'Home' },
  learn: { r: renderLearn, m: mountLearn, t: 'Learn' },
  level: { r: renderLevel, m: mountLevel, t: 'Level' },
  lesson: { r: renderLesson, m: mountLesson, t: 'Lesson' },
  practice: { r: renderPractice, m: mountPractice, t: 'Practice' },
  arena: { r: renderArena, m: mountArena, t: 'Arena' },
  profile: { r: renderProfile, m: mountProfile, t: 'Profile' }
};
function go() {
  const h = (location.hash || '#/').slice(1);
  let name = 'home', params = [];
  for (const r of ROUTES) { const m = h.match(r.re); if (m) { name = r.n; params = m.slice(1); break; } }
  const p = PAGES[name] || PAGES.home;
  const view = document.getElementById('view');
  view.innerHTML = p.r(...params);
  view.classList.remove('page'); void view.offsetWidth; view.classList.add('page');
  if (p.m) p.m(view, ...params);
  scanReveals(view);
  setActiveNav(name);
  document.title = p.t + ' · IT QUEST';
  window.scrollTo(0, 0);
}
function onboarding() {
  if (localStorage.getItem('itq2:ob')) return;
  openOverlay(`
    <h3 style="margin-top:0">Create your explorer</h3>
    <p class="muted">Local identity — no account needed. Your quest lives on this device.</p>
    <input class="code-box" style="min-height:52px;width:100%;text-align:center" id="obn" maxlength="24" placeholder="Your name, explorer…" />
    <div class="swatches" style="justify-content:center;margin:16px 0">${ACCENTS.map((c, i) => `<button class="swatch ${i === 0 ? 'sel' : ''}" data-ob="${c}" style="background:${c}"></button>`).join('')}</div>
    <button class="btn btn-primary btn-lg btn-block" data-obstart>${icon('bolt')} BEGIN THE QUEST</button>
  `).then(() => {});
  let acc = ACCENTS[0];
  document.addEventListener('click', function h(e) {
    const sw = e.target.closest('[data-ob]');
    if (sw) { acc = sw.dataset.ob; document.querySelectorAll('[data-ob]').forEach(o => o.classList.toggle('sel', o === sw)); }
    if (e.target.closest('[data-obstart]')) {
      document.removeEventListener('click', h);
      S.setName(document.getElementById('obn').value || 'Explorer');
      S.setAccent(acc);
      document.documentElement.style.setProperty('--acc', acc);
      localStorage.setItem('itq2:ob', '1');
      go();
    }
  });
}
buildShell(document.getElementById('app'));
initShellUpdates();
setupReveal();
document.documentElement.style.setProperty('--acc', S.getState().accent);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('hashchange', go);
go();
onboarding();
