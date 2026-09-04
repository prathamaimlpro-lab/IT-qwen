/**
 * AE3301 · LESSON TOC — sticky right rail (desktop) to jump between
 * lesson blocks, like competitor notes pages. Hidden on touch-small.
 */
(() => {
  'use strict';
  document.head.insertAdjacentHTML('beforeend', '<style>@media(max-width:1100px){[data-toc]{display:none!important}}</style>');
  function toc() {
    const old = document.querySelector('[data-toc]'); if (old) old.remove();
    if (!(location.hash || '').includes('/lesson/')) return;
    const tags = [...document.querySelectorAll('.blk-tag')];
    if (!tags.length) return;
    const nav = document.createElement('div');
    nav.dataset.toc = '1';
    nav.style.cssText = 'position:fixed;right:12px;top:50%;transform:translateY(-50%);z-index:60;display:flex;flex-direction:column;gap:6px';
    nav.innerHTML = tags.map((t, i) =>
      '<button data-i="' + i + '" class="mono" style="font-size:.58rem;letter-spacing:.08em;border:1px solid var(--line);background:var(--panel);color:var(--dim);border-radius:999px;padding:4px 9px;cursor:pointer">' +
      t.textContent.split(' ')[0] + '</button>').join('');
    document.body.appendChild(nav);
    nav.querySelectorAll('button').forEach(b => b.onclick = () =>
      tags[+b.dataset.i].closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  addEventListener('hashchange', () => setTimeout(toc, 90));
  setTimeout(toc, 90);
})();
