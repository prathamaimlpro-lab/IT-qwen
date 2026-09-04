/**
 * ================================================================
 *  AE3301 · DESIGN 2.0 — MOTION & DASHBOARD LAYER
 * ----------------------------------------------------------------
 *  · static mesh wash (Stripe-look, zero animation cost)
 *  · spring easing token + staggered grid reveals
 *  · buttery transform-only parallax (reduced-motion safe)
 *  · shrinking topbar · insight row · collapsible sections
 *  · compact density toggle (▤ chip)
 * ================================================================
 */
import * as S from './core.js';

/* ---------- 0 · injected CSS ---------- */
document.head.insertAdjacentHTML('beforeend', `<style>
.mesh{position:fixed;inset:-10%;z-index:-2;pointer-events:none;background:
  radial-gradient(600px 400px at 12% 8%, rgba(240,86,28,.10), transparent 60%),
  radial-gradient(700px 500px at 88% 12%, rgba(106,77,196,.08), transparent 60%),
  radial-gradient(800px 600px at 50% 100%, rgba(31,138,52,.06), transparent 60%)}
body.dark .mesh{opacity:.8}
.topbar{transition:padding .3s cubic-bezier(.22,.61,.2,1)}
body.scrolled .topbar{padding-top:4px!important;padding-bottom:4px!important}
.card,.btn,.q-opt,.lesson-row{transition-timing-function:cubic-bezier(.22,.61,.2,1)}
.rv{transition-delay:calc(var(--i,0)*55ms)}
body.compact .card{padding:12px!important}
body.compact .lesson-row{padding:8px 12px!important}
.insight{display:flex;gap:10px;align-items:center;border:1px dashed var(--line);
  border-radius:12px;padding:10px 14px;margin:0 0 16px;font-size:.9rem}
[data-post] img{background:linear-gradient(90deg,#151515 25%,#222 37%,#151515 63%);
  background-size:400% 100%;animation:shim 1.2s linear infinite}
@keyframes shim{from{background-position:100% 0}to{background-position:0 0}}
</style>`);

/* ---------- 1 · mesh layer ---------- */
if (!document.querySelector('.mesh'))
  document.body.insertAdjacentHTML('afterbegin', '<div class="mesh"></div>');

/* ---------- 2 · buttery parallax (transform-only) ---------- */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const amb = document.querySelector('[data-amb]');
  if (amb) {
    let target = 0, pos = 0, raf = null;
    const tick = () => {
      pos += (target - pos) * 0.08;
      amb.style.transform = 'translate3d(0,' + pos.toFixed(1) + 'px,0)';
      raf = Math.abs(target - pos) > .5 ? requestAnimationFrame(tick) : null;
    };
    addEventListener('scroll', () => {
      target = scrollY * -0.06;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }
}

/* ---------- 3 · shrinking topbar ---------- */
addEventListener('scroll', () =>
  document.body.classList.toggle('scrolled', scrollY > 40), { passive: true });

/* ---------- 4 · staggered grid reveals ---------- */
function stagger() {
  document.querySelectorAll('.skills-grid,.stats-grid')
    .forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));
}

/* ---------- 5 · insight row (decision-first) ---------- */
const TOPICS = ['cb-computer', 'cb-cpu', 'cb-mem', 'cb-files', 'cb-paths', 'cb-os', 'cb-term'];
function insight() {
  const h = (location.hash || '').replace('#', '');
  if (h !== '' && h !== '/home') return;
  if (document.querySelector('.insight')) return;
  const head = document.querySelector('.page-head');
  if (!head) return;
  let worst = null;
  TOPICS.forEach(t => {
    const s = S.topicStats(t);
    if (s && s.total > 0) {
      const m = Math.round(s.m * 100);
      if (!worst || m < worst.m) worst = { t, m };
    }
  });
  head.insertAdjacentHTML('afterend', worst
    ? `<div class="insight">🧠 <span><b>Insight:</b> weakest area <b>${S.topicLabel(worst.t)}</b> at ${worst.m}% — a 2-min drill fixes it.</span><a class="btn btn-primary btn-sm" style="margin-left:auto" href="#/practice/${worst.t}">DRILL</a></div>`
    : `<div class="insight">🧠 <span><b>Insight:</b> answer a few questions and I'll start designing personal drills for you.</span></div>`);
}

/* ---------- 6 · collapsible sections + density chip ---------- */
function collapse() {
  document.querySelectorAll('.section-title').forEach(t => {
    if (t.querySelector('[data-fold]')) return;
    const b = document.createElement('button');
    b.className = 'btn btn-ghost btn-sm';
    b.dataset.fold = '1'; b.textContent = '–'; b.style.marginLeft = 'auto';
    b.onclick = () => {
      const n = t.nextElementSibling; if (!n) return;
      const hid = n.style.display === 'none';
      n.style.display = hid ? '' : 'none';
      b.textContent = hid ? '–' : '+';
    };
    t.appendChild(b);
  });
}
function densityChip() {
  const bar = document.querySelector('.hdr-chips');
  if (!bar || document.querySelector('[data-den]')) return;
  const b = document.createElement('button');
  b.className = 'chip'; b.dataset.den = '1'; b.style.cursor = 'pointer'; b.textContent = '▤';
  const apply = () => {
    const on = localStorage.getItem('ae3301:dense') === '1';
    document.body.classList.toggle('compact', on);
    b.style.opacity = on ? 1 : .6;
  };
  b.onclick = () => {
    localStorage.setItem('ae3301:dense', localStorage.getItem('ae3301:dense') === '1' ? '0' : '1');
    apply();
  };
  bar.appendChild(b); apply();
}

const run = () => { stagger(); insight(); collapse(); densityChip(); };
S.subscribe(() => setTimeout(run, 80));
addEventListener('hashchange', () => setTimeout(run, 80));
setTimeout(run, 80);
