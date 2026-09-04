/**
 * ================================================================
 *  AE3301 · LEADERBOARD v2 — FULLSCREEN "Where you stand"
 *  podium top-3 (glow) · ranks 4–10 · % rings · sticky YOU row
 *  XP / Lessons tabs · dark stage in both themes
 * ================================================================
 */
(() => {
  'use strict';
  const NM = 'ae3301:name';
  let tab = 'xp';
  const COLORS = ['#f0561c', '#1f8a34', '#6a4dc4', '#d4a24e', '#d44d8f', '#2456c4', '#84a98c'];
  const col = n => COLORS[((n.charCodeAt(0) || 65) + (n.charCodeAt(1) || 66)) % COLORS.length];

  const ring = (p, c) => '<svg width="34" height="34" viewBox="0 0 34 34">' +
    '<circle cx="17" cy="17" r="13" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/>' +
    '<circle cx="17" cy="17" r="13" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 13) + '" stroke-dashoffset="' + (2 * Math.PI * 13 * (1 - p / 100)) + '" transform="rotate(-90 17 17)"/>' +
    '<text x="17" y="21" text-anchor="middle" style="font:700 9px var(--fm,monospace);fill:#f2f0ea">' + p + '%</text></svg>';

  const ava = (n, size, glow) => '<span style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#161616;border:2px solid ' + (glow || col(n)) + ';display:grid;place-items:center;font-weight:800;color:#f2f0ea;' + (glow ? 'box-shadow:0 0 26px ' + glow + '66' : '') + '">' + (n[0] || '?').toUpperCase() + '</span>';

  function html(rows) {
    const me = localStorage.getItem(NM);
    rows = [...rows].sort((a, b) => b[tab] - a[tab]);
    const unit = tab === 'xp' ? 'XP' : 'lessons';
    const pct = r => Math.min(100, Math.round(r.lessons / 7 * 100));
    const top = rows.slice(0, 3);
    const pod = (r, h, glow, rank) => r ? '<div style="flex:1;text-align:center;animation:lbRise .5s ' + (rank * .08) + 's cubic-bezier(.2,.8,.2,1) both">' +
      ava(r.name, rank === 1 ? 64 : 52, glow) +
      '<b style="display:block;margin:8px 0 4px;font-size:.85rem;color:#f2f0ea">' + r.name + '</b>' +
      '<span class="mono" style="font-size:.66rem;border:1px solid rgba(255,255,255,.15);border-radius:99px;padding:3px 8px;color:var(--acc,#f0561c)">' + r[tab] + ' ' + unit + '</span>' +
      '<div style="height:' + h + 'px;margin-top:10px;border-radius:12px 12px 0 0;background:linear-gradient(180deg,' + glow + '55,transparent);display:grid;place-items:center;font:800 1.4rem var(--fd,sans-serif);color:#f2f0ea">' + rank + '</div></div>' : '<div style="flex:1"></div>';
    const rest = rows.slice(3, 10).map((r, i) =>
      '<div style="display:flex;gap:12px;align-items:center;padding:10px 6px;border-bottom:1px solid rgba(255,255,255,.08);animation:lbFade .4s ' + (.15 + i * .05) + 's both">' +
      '<span class="mono" style="width:24px;color:#8a867e">' + (i + 4) + '</span>' + ava(r.name, 38) +
      '<div style="flex:1"><b style="font-size:.9rem;color:#f2f0ea">' + r.name + '</b><div class="mono" style="font-size:.7rem;color:#8a867e">' + r[tab] + ' ' + unit + '</div></div>' +
      ring(pct(r), col(r.name)) + '</div>').join('');
    const meR = rows.find(r => r.name === me);
    const meRank = rows.indexOf(meR) + 1;
    return '<style>@keyframes lbRise{from{opacity:0;transform:translateY(24px)}}@keyframes lbFade{from{opacity:0;transform:translateX(-8px)}}</style>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<span class="mono" style="border:1px solid rgba(255,255,255,.15);border-radius:99px;padding:4px 10px;font-size:.66rem;color:#b6b1a8">🏆 LEADERBOARD</span>' +
      '<div style="flex:1"></div>' +
      '<button class="btn btn-sm ' + (tab === 'xp' ? 'btn-primary' : 'btn-ghost') + '" data-t="xp">XP</button>' +
      '<button class="btn btn-sm ' + (tab === 'lessons' ? 'btn-primary' : 'btn-ghost') + '" data-t="lessons">Lessons</button></div>' +
      '<h2 style="font-family:var(--fd,sans-serif);margin:2px 0 18px;color:#f2f0ea">Where you stand</h2>' +
      '<div style="display:flex;gap:10px;align-items:flex-end">' + pod(top[1], 72, '#c0c0c0', 2) + pod(top[0], 96, '#c8a468', 1) + pod(top[2], 56, '#c08050', 3) + '</div>' +
      '<div style="margin-top:6px">' + rest + '</div>' +
      (meR ? '<div style="position:sticky;bottom:8px;margin-top:12px;display:flex;gap:12px;align-items:center;padding:12px;border:1px solid var(--acc,#f0561c);border-radius:14px;background:#161616;box-shadow:0 -8px 30px rgba(0,0,0,.45)">' +
        '<span class="mono" style="width:24px;color:#8a867e">' + meRank + '</span>' + ava(meR.name, 40) +
        '<div style="flex:1"><b style="color:#f2f0ea">' + meR.name + ' <span class="mono" style="color:var(--acc,#f0561c)">YOU</span></b><div class="mono" style="font-size:.7rem;color:#8a867e">' + meR[tab] + ' ' + unit + '</div></div>' +
        ring(pct(meR), '#84a98c') + '</div>' : '');
  }

  async function open() {
    const rows = await (await fetch('/api/board')).json();
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:12000;background:#0b0b0b;overflow:auto;padding:20px clamp(14px,6vw,120px) 40px;color:#f2f0ea';
    ov.innerHTML = '<div style="max-width:760px;margin:0 auto">' +
      '<div style="display:flex;margin-bottom:8px"><button class="btn btn-ghost btn-sm" data-x>← Back</button></div>' +
      '<div data-b></div></div>';
    document.body.appendChild(ov);
    const draw = () => {
      ov.querySelector('[data-b]').innerHTML = html(rows);
      ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
    };
    draw();
    ov.querySelector('[data-x]').onclick = () => ov.remove();
  }

  fetch('/api/ping').then(r => {
    if (!r.ok) return;
    const bar = document.querySelector('.hdr-chips');
    if (bar && !document.querySelector('[data-lead2]')) {
      const b = document.createElement('button');
      b.className = 'chip'; b.dataset.lead2 = '1'; b.style.cursor = 'pointer'; b.textContent = '🏆';
      b.onclick = open;
      bar.prepend(b);
    }
  }).catch(() => {});
})();
