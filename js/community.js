/**
 * ================================================================
 *  AE3301 · COMMUNITY MODULE · v6 (production grade)
 * ----------------------------------------------------------------
 *  Responsibilities
 *    1. Full-page feed at #/community (X-style).
 *    2. Composer with photo/video attach (stored on the Pad).
 *    3. Likes (+2 Mentor XP to author), view counters, comments.
 *    4. Anchored "⋯" post menu: Copy text / Delete (own posts),
 *       with confirm state and verified server round-trips.
 *    5. Floating compose button (FAB) + nav injection.
 *
 *  Engineering notes
 *    - IIFE + 'use strict'  → no globals leak, no collisions.
 *    - ONE delegated click listener on #view (capture phase).
 *    - All network calls defensive (never throw into the UI).
 *    - DOM updates are surgical: no full-page rebuilds, no blink.
 * ================================================================
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------
   * 1 · CONSTANTS & HELPERS
   * ---------------------------------------------------------- */
  const KEY = { token: 'ae3301:token', name: 'ae3301:name' };
  const API = {
    posts:    '/api/posts',
    post:     '/api/post',
    like:     '/api/like',
    seen:     '/api/seen',
    comments: '/api/comments',
    comment:  '/api/comment',
    delpost:  '/api/delpost'
  };
  const MAX_MEDIA_BYTES = 8_000_000; // ~8 MB cap (Pad-friendly)

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Escape untrusted text before injecting into HTML. */
  const esc = s => String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /** Compact relative timestamp: 5s / 4m / 3h / 2d */
  function timeAgo(ts) {
    const s = Math.max(1, Math.floor(Date.now() / 1000 - ts));
    if (s < 60)   return s + 's';
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400)return Math.floor(s / 3600) + 'h';
    return Math.floor(s / 86400) + 'd';
  }

  /** Network wrapper that NEVER throws — returns {err} on failure. */
  async function api(path, options) {
    try {
      const res = await fetch(path, options);
      return await res.json();
    } catch (_) {
      return { err: 'network' };
    }
  }
  const postJSON = (path, body) => api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const auth = () => ({
    token: localStorage.getItem(KEY.token),
    name:  localStorage.getItem(KEY.name)
  });

  let pendingMedia = null;   // {ext, data(base64)} staged by the composer
  let openMenu     = null;   // currently open ⋯ menu element

  /* ------------------------------------------------------------
   * 2 · TEMPLATES (pure functions → HTML strings)
   * ---------------------------------------------------------- */
  function mediaBlock(p) {
    if (!p.media) return '';
    return /\.(mp4|webm)$/.test(p.media)
      ? `<video controls src="${p.media}" style="width:100%;border-radius:12px;margin-top:10px"></video>`
      : `<img  src="${p.media}" style="width:100%;border-radius:12px;margin-top:10px">`;
  }

  function postCard(p, me) {
    const mine = p.name === me;
    return `
    <article class="card" data-post="${p.id}"
      style="margin-bottom:12px;padding:16px;overflow:hidden;
             transition:opacity .3s,transform .3s,max-height .3s,margin .3s,padding .3s">
      <header style="display:flex;gap:10px;align-items:center">
        <span style="width:40px;height:40px;border-radius:50%;background:#161616;
                     color:#f4f4f2;display:grid;place-items:center;font-weight:800">
          ${esc((p.name[0] || '?').toUpperCase())}
        </span>
        <b>${esc(p.name)}</b>
        ${mine ? '<span class="mono" style="color:var(--acc)">(you)</span>' : ''}
        <span class="mono faint">${timeAgo(p.ts)}</span>
        <button class="btn btn-ghost btn-sm" data-more="${p.id}"
                style="margin-left:auto" aria-label="Post options">⋯</button>
      </header>
      <p style="margin-top:10px;white-space:pre-wrap">${esc(p.text)}</p>
      ${mediaBlock(p)}
      <footer style="display:flex;gap:10px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" data-cm="${p.id}">💬 <span data-cmn>${p.cmts || 0}</span></button>
        <button class="btn btn-ghost btn-sm" data-like="${p.id}">♥ <span data-liken>${p.likes || 0}</span></button>
        <span class="btn btn-ghost btn-sm" data-views style="cursor:default">👁 ${p.views || 0}</span>
      </footer>
      <div data-cbox="${p.id}"></div>
    </article>`;
  }

  function feedPage(rows, me, token) {
    return `
    <div class="page-head">
      <div class="kicker">💬 COMMUNITY</div>
      <h1>The Feed</h1>
      <p class="muted">Ask, help, share wins, photos & clips. +2 XP per like on your post.</p>
    </div>
    <section class="card" style="margin-bottom:16px;padding:16px">
      ${token ? `
        <textarea id="c-t" class="code-box"
          style="min-height:64px;width:100%;color:#f4f4f2"
          placeholder="What’s happening, ${esc(me)}?"></textarea>
        <div id="c-prev"></div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <label class="btn btn-ghost btn-sm" style="cursor:pointer">📎
            <input id="c-f" type="file" accept="image/*,video/*" style="display:none">
          </label>
          <span id="c-fname" class="faint" style="font-size:.75rem"></span>
          <button id="c-post" class="btn btn-primary btn-sm" style="margin-left:auto">POST</button>
        </div>` : `
        <p class="muted">Tap ☁ SYNC in the top bar to log in and join the conversation.</p>`}
    </section>
    <div id="feed">
      ${rows.map(p => postCard(p, me)).join('') ||
        '<p class="empty-note">No posts yet — be the first.</p>'}
    </div>`;
  }

  /* ------------------------------------------------------------
   * 3 · DATA OPERATIONS
   * ---------------------------------------------------------- */
  const fetchPosts = async () => {
    const d = await api(API.posts);
    return Array.isArray(d) ? d : [];
  };

  /** Bump view counters once per feed render (fire-and-forget). */
  function markSeen(ids) {
    if (ids.length) postJSON(API.seen, { ids });
  }

  /** Update 💬 / ♥ / 👁 numbers in place — no rebuild, no blink. */
  async function syncCounts() {
    const rows = await fetchPosts();
    rows.forEach(p => {
      const card = $(`[data-post="${p.id}"]`);
      if (!card) return;
      $('[data-liken]', card).textContent = p.likes;
      $('[data-cmn]',   card).textContent = p.cmts;
      $('[data-views]', card).textContent = p.views;
    });
  }

  /* ------------------------------------------------------------
   * 4 · PAGE RENDER
   * ---------------------------------------------------------- */
  async function render() {
    const view = $('#view');
    if (!view) return;
    const { token, name } = auth();
    const rows = await fetchPosts();

    view.innerHTML = feedPage(rows, name, token);
    document.title = 'Community · AE3301';
    $$('[data-nav]').forEach(a =>
      a.classList.toggle('active', a.dataset.nav === 'community'));

    markSeen(rows.map(r => r.id));
    bindComposer(view, token);
  }

  function bindComposer(view, token) {
    const file = $('#c-f', view);
    if (file) file.onchange = () => {
      const f = file.files[0];
      if (!f) return;
      if (f.size > MAX_MEDIA_BYTES) {
        $('#c-fname', view).textContent = '⚠ too large (max 8 MB)';
        return;
      }
      $('#c-fname', view).textContent = f.name;
      const r = new FileReader();
      r.onload = () => {
        pendingMedia = { ext: f.name.split('.').pop(), data: String(r.result).split(',')[1] };
        $('#c-prev', view).innerHTML = f.type.startsWith('image')
          ? `<img src="${r.result}" style="max-height:90px;border-radius:10px;margin-top:8px">`
          : '<p class="faint" style="font-size:.75rem">🎬 video attached</p>';
      };
      r.readAsDataURL(f);
    };

    const send = $('#c-post', view);
    if (send) send.onclick = async () => {
      const box = $('#c-t', view);
      if (!box.value.trim()) { box.focus(); return; }
      send.disabled = true; send.textContent = '…';
      const d = await postJSON(API.post, { token, text: box.value, media: pendingMedia });
      send.disabled = false; send.textContent = 'POST';
      if (d.ok) {
        pendingMedia = null;
        box.value = '';
        const pv = $('#c-prev', view); if (pv) pv.innerHTML = '';
        const rows = await fetchPosts();
        $('#feed', view).innerHTML =
          rows.map(p => postCard(p, auth().name)).join('') ||
          '<p class="empty-note">No posts yet — be the first.</p>';
        markSeen(rows.map(r => r.id));
      }
    };
  }

  /* ------------------------------------------------------------
   * 5 · X-STYLE POST MENU (anchored, stateful, verified)
   * ---------------------------------------------------------- */
  function closeMenu() {
    if (openMenu) { openMenu.remove(); openMenu = null; }
  }

  function placeMenu(menu, anchor) {
    const r = anchor.getBoundingClientRect();
    const W = 220;
    let left = Math.min(Math.max(12, r.right - W), innerWidth - W - 12);
    let top  = r.bottom + 8;
    if (top + 180 > innerHeight) top = Math.max(10, r.top - 150);
    menu.style.left = left + 'px';
    menu.style.top  = top + 'px';
  }

  function menuHTML(p, mine, state) {
    if (state === 'confirm') return `
      <p>Delete this post?</p>
      <button class="danger" data-act="yes">Delete</button>
      <button data-act="cancel">Cancel</button>`;
    if (state === 'working') return `<p style="opacity:.6">Working…</p>`;
    return `
      <button data-act="copy">⧉ Copy text</button>
      ${mine ? '<button class="danger" data-act="del">🗑 Delete post</button>' : ''}
      <button data-act="cancel">Cancel</button>`;
  }

  async function openPostMenu(anchor, post) {
    closeMenu();
    const mine = post.name === auth().name;
    const menu = document.createElement('div');
    menu.className = 'x-pop';
    menu.innerHTML = menuHTML(post, mine, 'list');
    document.body.appendChild(menu);
    placeMenu(menu, anchor);
    openMenu = menu;

    menu.onclick = async ev => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      ev.stopPropagation();
      const act = btn.dataset.act;

      if (act === 'cancel') { closeMenu(); return; }

      if (act === 'copy') {
        try { await navigator.clipboard.writeText(post.text); } catch (_) {}
        closeMenu();
        return;
      }

      if (act === 'del') {
        menu.innerHTML = menuHTML(post, mine, 'confirm');
        placeMenu(menu, anchor);
        return;
      }

      if (act === 'yes') {
        menu.innerHTML = menuHTML(post, mine, 'working');
        const { token } = auth();
        const d = await postJSON(API.delpost, { token, post: post.id });
        closeMenu();
        if (!d.ok) return;                       // server refused → keep card
        const card = $(`[data-post="${post.id}"]`);
        if (card) collapseCard(card);            // smooth X-style removal
      }
    };
  }

  /** Fade + slide + collapse, then remove the node. */
  function collapseCard(card) {
    card.style.maxHeight = card.scrollHeight + 'px';
    requestAnimationFrame(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(-24px)';
      card.style.maxHeight = '0';
      card.style.paddingTop = '0';
      card.style.paddingBottom = '0';
      card.style.marginBottom = '0';
    });
    setTimeout(() => card.remove(), 340);
  }

  /* ------------------------------------------------------------
   * 6 · SINGLE DELEGATED EVENT LAYER (feed actions)
   * ---------------------------------------------------------- */
  function onViewClick(e) {
    if (!(location.hash || '').includes('/community')) return;
    const { token } = auth();

    const more = e.target.closest('[data-more]');
    if (more) {
      e.preventDefault();
      e.stopPropagation();
      fetchPosts().then(rows => {
        const p = rows.find(x => x.id === more.dataset.more);
        if (p) openPostMenu(more, p);
      });
      return;
    }

    const like = e.target.closest('[data-like]');
    if (like) {
      postJSON(API.like, { token, post: like.dataset.like }).then(syncCounts);
      return;
    }

    const cm = e.target.closest('[data-cm]');
    if (cm) { toggleComments(cm.dataset.cm, token); return; }

    const cs = e.target.closest('[data-cs]');
    if (cs) {
      const input = $('[data-ci]');
      postJSON(API.comment, { token, post: cs.dataset.cs, text: input.value })
        .then(d => { if (d.ok) { toggleComments(cs.dataset.cs, token, true); syncCounts(); } });
    }
  }

  async function toggleComments(postId, token, forceOpen = false) {
    const box = $(`[data-cbox="${postId}"]`);
    if (!box) return;
    if (box.dataset.open && !forceOpen) { box.innerHTML = ''; box.dataset.open = ''; return; }
    const rows = await api(`${API.comments}?post=${postId}`);
    box.dataset.open = '1';
    box.innerHTML =
      (Array.isArray(rows) ? rows.map(c =>
        `<p style="border-left:2px solid var(--acc);padding:4px 8px;margin-top:8px;font-size:.85rem">
           <b>${esc(c.name)}</b> ${esc(c.text)}</p>`).join('') : '') +
      (token ? `<div style="display:flex;gap:6px;margin-top:8px">
          <input class="code-box" data-ci placeholder="Reply…"
                 style="min-height:40px;flex:1;color:#f4f4f2">
          <button class="btn btn-primary btn-sm" data-cs="${postId}">➤</button>
        </div>` : '');
  }

  /* ------------------------------------------------------------
   * 7 · CHROME INJECTION (nav entries + FAB)
   * ---------------------------------------------------------- */
  const CHAT_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/></svg>';

  function injectChrome() {
    const side = $('.side-nav');
    if (side && !$('[data-comnav]', side)) {
      side.insertAdjacentHTML('beforeend',
        `<a class="nav-link" data-comnav data-nav="community" href="#/community">${CHAT_ICON}<span>Community</span></a>`);
    }
    const bot = $('.bottomnav');
    if (bot && !$('[data-comnav]', bot)) {
      bot.style.gridTemplateColumns = 'repeat(5,1fr)';
      bot.insertAdjacentHTML('beforeend',
        `<a class="bnav-link" data-comnav data-nav="community" href="#/community">${CHAT_ICON}<span>Talk</span></a>`);
    }
    const chips = $('.hdr-chips');
    if (chips && !$('[data-com]')) {
      chips.insertAdjacentHTML('afterbegin',
        `<a class="chip" data-com href="#/community">💬 <span class="mono">TALK</span></a>`);
    }
    if (!$('#fab')) {
      const fab = document.createElement('button');
      fab.id = 'fab';
      fab.textContent = '+';
      fab.setAttribute('aria-label', 'New post');
      fab.onclick = () => {
        if (!(location.hash || '').includes('/community')) {
          location.hash = '#/community';
          setTimeout(() => $('#c-t')?.focus(), 450);
        } else {
          scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => $('#c-t')?.focus(), 300);
        }
      };
      document.body.appendChild(fab);
    }
  }

  /* ------------------------------------------------------------
   * 8 · ROUTING & BOOT
   * ---------------------------------------------------------- */
  const isCommunity = () => (location.hash || '').replace('#', '') === '/community';
  const route = () => { if (isCommunity()) render(); };

  function boot() {
    const view = $('#view');
    if (view && !view.dataset.comBound) {
      view.dataset.comBound = '1';
      view.addEventListener('click', onViewClick, true);   // capture, single source
    }
    document.addEventListener('click', e => {
      if (!e.target.closest('.x-pop') && !e.target.closest('[data-more]')) closeMenu();
    });
    addEventListener('scroll', closeMenu, true);
    addEventListener('resize', closeMenu);

    api('/api/ping').then(d => {
      if (d.ok) { injectChrome(); setTimeout(route, 0); }
    });
    addEventListener('hashchange', () => { closeMenu(); setTimeout(route, 0); });
  }

  boot();
})();
