/**
 * ================================================================
 *  AE3301 · ADMIN CONSOLE — progression bypass for the owner
 * ----------------------------------------------------------------
 *  · 🔒/🔓 ADMIN chip in the top bar, gated by the admin key.
 *  · Unlock all levels  → completes Level-0 gates in saved state
 *                         (pure state edit: zero XP, no farming).
 *  · Future levels      → render their PLANNED topic lists so the
 *                         roadmap is visible/previewable.
 *  · Reset progress     → double-tap guarded wipe.
 * ================================================================
 */
import { LEVELS } from './data.js';

const KEY  = 'ae3301:adminkey';
const MODE = 'ae3301:adminmode';
const SAVE = 'itq2:save';

/** Planned topics per future level (from the master spec §2). */
const PLANNED = {
  l1: ['Variables & data types', 'Operators & conditions', 'Loops', 'Functions', 'Arrays & strings', 'Objects', 'Error handling & debugging', 'Mini projects'],
  l2: ['Linux fundamentals', 'Terminal commands', 'Permissions & processes', 'Git basics', 'Branches & commits', 'Pull requests & collaboration'],
  l3: ['Arrays & two pointers', 'Linked lists', 'Stacks & queues', 'Hash tables', 'Trees & graphs', 'Sorting & searching', 'Big-O & problem solving'],
  l4: ['Tables, rows & keys', 'SQL SELECT & filters', 'CRUD', 'Joins', 'Indexes & transactions', 'Database design project'],
  l5: ['Processes & threads', 'CPU scheduling', 'Memory & virtual memory', 'File systems', 'Concurrency & deadlocks'],
  l6: ['IP & MAC', 'DNS', 'HTTP/HTTPS', 'TCP/UDP & ports', 'Routers, switches & packets', 'OSI / TCP-IP model'],
  l7: ['HTML', 'CSS', 'JavaScript & the DOM', 'APIs & authentication', 'Full-stack project'],
  l8: ['Clean code', 'Testing', 'Design patterns', 'Code review & docs', 'Agile teamwork'],
  l9: ['Cloud fundamentals', 'Containers & Docker', 'CI/CD', 'Deployment & monitoring'],
  l10: ['Encryption basics', 'AuthN vs AuthZ', 'Common vulnerabilities', 'Secure coding'],
  l11: ['Python for AI', 'ML fundamentals', 'Neural networks', 'LLMs & AI APIs', 'AI project'],
  l12: ['Caching & load balancing', 'Microservices & queues', 'High availability', 'Capstone system design'],
  l13: ['Capstone projects', 'Portfolio building', 'Interview preparation']
};

const $ = s => document.querySelector(s);
const isAdmin = () => localStorage.getItem(MODE) === '1';

/* ---------- tiny bottom sheet ---------- */
function sheet(html, mount) {
  const s = document.createElement('div');
  s.className = 'x-pop';
  s.style.cssText = 'left:50%;transform:translateX(-50%);bottom:14px;width:min(420px,92vw);top:auto';
  s.innerHTML = html;
  document.body.appendChild(s);
  s.addEventListener('click', e => { if (e.target === s) s.remove(); });
  if (mount) mount(s);
  return s;
}

/* ---------- admin-key verification ---------- */
function verify(cb) {
  const ask = () => sheet(
    '<p>Admin key</p><input id="ak" type="password" class="code-box" style="min-height:44px;width:100%;color:#f4f4f2" placeholder="admin key">' +
    '<button data-v="go" style="margin-top:8px">UNLOCK</button><button data-v="x">Cancel</button>',
    s => { s.onclick = e => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      if (b.dataset.v === 'x') { s.remove(); return; }
      check(s.querySelector('#ak').value, s, cb);
    }; });
  const stored = localStorage.getItem(KEY);
  if (stored) check(stored, null, cb); else ask();
}
function check(key, s, cb) {
  fetch('/api/qcheck', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) })
    .then(r => r.json())
    .then(d => {
      if (d.ok) { localStorage.setItem(KEY, key); localStorage.setItem(MODE, '1'); if (s) s.remove(); cb(); }
      else if (s) s.querySelector('#ak').placeholder = 'wrong key';
      else sheet('<p class="danger">✗ wrong key</p><button data-x="1">Close</button>', x => { x.onclick = () => x.remove(); });
    });
}

/* ---------- state surgery (no XP, no farming) ---------- */
function unlockAll() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE) || 'null');
    const s = (d && d.s) ? d.s : { completedLessons: [], startedLessons: [] };
    const ids = [];
    LEVELS.forEach(l => l.lessons.forEach(ls => { if (ls.id) ids.push(ls.id); }));
    s.completedLessons = Array.from(new Set((s.completedLessons || []).concat(ids)));
    s.startedLessons   = Array.from(new Set((s.startedLessons   || []).concat(ids)));
    localStorage.setItem(SAVE, JSON.stringify({ v: 1, s }));
  } catch (_) { /* corrupted save → ignore */ }
}

/* ---------- console sheet ---------- */
function consoleSheet() {
  sheet(
    '<p>ADMIN CONSOLE</p>' +
    '<button data-a="unlock">🔓 Unlock all levels</button>' +
    '<button data-a="reset" class="danger">↩️ Reset all progress</button>' +
    '<button data-a="off">🚪 Exit admin mode</button>' +
    '<button data-a="x">Close</button>',
    s => { s.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'x') { s.remove(); return; }
      if (a === 'off') { localStorage.removeItem(MODE); location.reload(); return; }
      if (a === 'reset') {
        if (!s.dataset.sure) { s.dataset.sure = '1'; b.textContent = '⚠ Sure? Tap again'; return; }
        localStorage.removeItem(SAVE); location.reload(); return;
      }
      if (a === 'unlock') { unlockAll(); location.reload(); }
    }; });
}

/* ---------- planned-topic preview for future levels ---------- */
function injectPlanned() {
  const m = (location.hash || '').match(/#\/level\/(l\d+)/);
  if (!m) return;
  const lv = LEVELS.find(l => l.id === m[1]);
  if (!lv || lv.lessons.length) return;
  const list = $('.lesson-list');
  if (!list || list.children.length) return;
  const topics = PLANNED[m[1]] || [];
  list.innerHTML = topics.map((t, i) =>
    '<div class="lesson-row upcoming"><div class="row-num">' + String(i + 1).padStart(2, '0') + '</div>' +
    '<div><h4>' + t + '</h4><div class="lr-sub">planned · ships in a future content drop</div></div><div>🔒</div></div>'
  ).join('') || '<p class="empty-note">Curriculum design in progress.</p>';
}

/* ---------- chip + boot ---------- */
function chip() {
  const bar = $('.hdr-chips');
  if (!bar || $('[data-admin2]')) return;
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.admin2 = '1'; b.style.cursor = 'pointer';
  const paint = () => { b.innerHTML = (isAdmin() ? '🔓' : '🔒') + ' <span class="mono">ADMIN</span>'; };
  b.onclick = () => { isAdmin() ? consoleSheet() : verify(() => { paint(); consoleSheet(); }); };
  bar.prepend(b); paint();
}
addEventListener('hashchange', () => setTimeout(injectPlanned, 80));
setTimeout(() => { chip(); injectPlanned(); }, 80);
