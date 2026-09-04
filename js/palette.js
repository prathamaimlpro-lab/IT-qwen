/**
 * ================================================================
 *  AE3301 · DESIGN 2.0 — COMMAND PALETTE (Ctrl/⌘+K or 🔍)
 *  Linear-style instant navigation: pages, actions, lesson search.
 * ================================================================
 */
import { LESSONS } from './data.js';

const ACTIONS = [
  { t: 'Go: Home',      run: () => location.hash = '#/home' },
  { t: 'Go: Learn',     run: () => location.hash = '#/learn' },
  { t: 'Go: Arena',     run: () => location.hash = '#/arena' },
  { t: 'Go: Profile',   run: () => location.hash = '#/profile' },
  { t: 'Go: Community', run: () => location.hash = '#/community' },
  { t: 'Toggle dark mode', run: () => {
      document.body.classList.toggle('dark');
      localStorage.setItem('ae3301:dark', document.body.classList.contains('dark') ? '1' : '0');
    } },
  { t: 'Toggle compact density', run: () => {
      localStorage.setItem('ae3301:dense', localStorage.getItem('ae3301:dense') === '1' ? '0' : '1');
      location.reload();
    } },
  { t: 'Collapse / expand sidebar', run: () => {
      document.body.classList.toggle('sb-hidden');
      localStorage.setItem('ae3301:sb', document.body.classList.contains('sb-hidden') ? '1' : '');
    } }
];
const items = () => [
  ...ACTIONS,
  ...Object.entries(LESSONS).map(([id, l]) =>
    ({ t: 'Lesson: ' + l.title, run: () => location.hash = '#/lesson/' + id }))
];

function openPalette() {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.5)';
  ov.innerHTML =
    '<div style="max-width:560px;margin:10vh auto;background:var(--panel,#161616);' +
    'border:1px solid var(--line,rgba(244,244,242,.14));border-radius:16px;overflow:hidden">' +
    '<input id="pk-q" placeholder="Type a command or lesson…" style="width:100%;min-height:52px;' +
    'background:transparent;border:0;color:var(--ink,#f2f0ea);padding:0 16px;font-size:1rem;outline:none">' +
    '<div id="pk-list" style="max-height:50vh;overflow:auto;padding:6px"></div></div>';
  document.body.appendChild(ov);

  const q = ov.querySelector('#pk-q'), list = ov.querySelector('#pk-list');
  let pool = [], cur = 0;

  const hi = n => {
    cur = n;
    list.querySelectorAll('button')
      .forEach((b, i) => b.style.background = i === n ? 'var(--panel2,#242424)' : 'transparent');
  };
  const render = f => {
    pool = items().filter(i => i.t.toLowerCase().includes((f || '').toLowerCase()));
    list.innerHTML = pool.map((i, n) =>
      '<button data-n="' + n + '" style="display:flex;width:100%;padding:12px 14px;border:0;' +
      'border-radius:10px;background:transparent;color:var(--ink,#f2f0ea);font-weight:600;' +
      'text-align:left;cursor:pointer">' + i.t + '</button>').join('') ||
      '<p style="padding:12px;opacity:.6">No matches.</p>';
    list.querySelectorAll('button').forEach(b => {
      b.onmouseenter = () => hi(+b.dataset.n);
      b.onclick = () => { pool[+b.dataset.n].run(); ov.remove(); };
    });
    hi(0);
  };

  q.oninput = () => render(q.value);
  q.onkeydown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); hi(Math.min(cur + 1, pool.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); hi(Math.max(cur - 1, 0)); }
    if (e.key === 'Enter' && pool[cur]) { pool[cur].run(); ov.remove(); }
  };
  ov.onclick = e => { if (e.target === ov) ov.remove(); };
  render('');
  q.focus();
}

/* keyboard + touch entry points */
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
});
const bar = document.querySelector('.hdr-chips');
if (bar && !document.querySelector('[data-pk]')) {
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.pk = '1'; b.style.cursor = 'pointer'; b.textContent = '🔍';
  b.onclick = openPalette;
  bar.prepend(b);
}
