/**
 * ================================================================
 *  AE3301 · LEADERBOARD v3 — fullscreen, THEME-AWARE
 *  · uses site CSS variables (matches light & dark)
 *  · visible ← Back / ✕ / Esc
 *  · entry point: LEFT SIDEBAR (no top-bar chip)
 * ================================================================
 */
(() => {
  'use strict';
  const NM = 'ae3301:name';
  let tab = 'xp';
  const COLORS = ['#f0561c', '#1f8a34', '#6a4dc4', '#d4a24e', '#d44d8f', '#2456c4', '#84a98c'];
  const col = n => COLORS[((n.charCodeAt(0) || 65) + (n.charCodeAt(1) || 66)) % COLORS.length];
  const ring = (p, c) => '<svg width="34" height="34" viewBox="0 0 34 34">' +
    '<circle cx="17" cy="17" r="13" fill="none" stroke="var(--line)" stroke-width="4"/>' +
    '<circle cx="17" cy="17" r="13" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 13) + '" stroke-dashoffset="' + (2 * Math.PI * 13 * (1 - p / 100)) + '" transform="rotate(-90 17 17)"/>' +
    '<text x="17" y="21" text-anchor="middle" style="font:700 9px var(--fm);fill:var(--ink)">' + p + '%</text></svg>';
  const ava = (n, size, glow) => '<span style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:var(--panel3);border:2px solid ' + (glow || col(n)) + ';display:grid;place-items:center;font-weight:800;color:var(--ink);' + (glow ? 'box-shadow:0 0 26px ' + glow + '66' : '') + '">' + (n[0] || '?').toUpperCase() + '</span>';

  function html(rows) {
    const me = localStorage.getItem(NM);
    rows = [...rows].sort((a, b) => b[tab] - a[tab]);
    const unit = tab === 'xp' ? 'XP' : 'lessons';
    const pct = r => Math.min(100, Math.round(r.lessons / 7 * 100));
    const top = rows.slice(0, 3);
    const pod = (r, h, glow, rank) => r ? '<div style="flex:1;text-align:center;animation:lbRise .5s ' + (rank * .08) + 's cubic-bezier(.2,.8,.2,1) both">' +
      ava(r.name, rank === 1 ? 64 : 52, glow) +
      '<b style="display:block;margin:8px 0 4px;font-size:.85rem">' + r.name + '</b>' +
      '<span class="mono" style="font-size:.66rem;border:1px solid var(--line);border-radius:99px;padding:3px 8px;color:var(--acc)">' + r[tab] + ' ' + unit + '</span>' +
      '<div style="height:' + h + 'px;margin-top:10px;border-radius:12px 12px 0 0;background:linear-gradient(180deg,' + glow + '44,transparent);display:grid;place-items:center;font:800 1.4rem var(--fd)">' + rank + '</div></div>' : '<div style="flex:1"></div>';
    const rest = rows.slice(3, 10).map((r, i) =>
      '<div style="display:flex;gap:12px;align-items:center;padding:10px 6px;border-bottom:1px solid var(--line);animation:lbFade .4s ' + (.15 + i * .05) + 's both">' +
      '<span class="mono faint" style="width:24px">' + (i + 4) + '</span>' + ava(r.name, 38) +
      '<div style="flex:1"><b style="font-size:.9rem">' + r.name + '</b><div class="mono faint" style="font-size:.7rem">' + r[tab] + ' ' + unit + '</div></div>' +
      ring(pct(r), col(r.name)) + '</div>').join('');
    const meR = rows.find(r => r.name === me);
    const meRank = rows.indexOf(meR) + 1;
    return '<style>@keyframes lbRise{from{opacity:0;transform:translateY(24px)}}@keyframes lbFade{from{opacity:0;transform:translateX(-8px)}}</style>' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
      '<button class="btn btn-ghost btn-sm" data-x>← Back</button>' +
      '<span class="mono faint" style="border:1px solid var(--line);border-radius:99px;padding:4px 10px;font-size:.66rem">🏆 LEADERBOARD</span>' +
      '<div style="flex:1"></div>' +
      '<button class="btn btn-sm ' + (tab === 'xp' ? 'btn-primary' : 'btn-ghost') + '" data-t="xp">XP</button>' +
      '<button class="btn btn-sm ' + (tab === 'lessons' ? 'btn-primary' : 'btn-ghost') + '" data-t="lessons">Lessons</button>' +
      '<button class="btn btn-ghost btn-sm" data-x>✕</button></div>' +
      '<h2 style="font-family:var(--fd);margin:2px 0 18px">Where you stand</h2>' +
      '<div style="display:flex;gap:10px;align-items:flex-end">' + pod(top[1], 72, '#9aa0a6', 2) + pod(top[0], 96, '#c8a468', 1) + pod(top[2], 56, '#c08050', 3) + '</div>' +
      '<div style="margin-top:6px">' + rest + '</div>' +
      (meR ? '<div style="position:sticky;bottom:8px;margin-top:12px;display:flex;gap:12px;align-items:center;padding:12px;border:1px solid var(--acc);border-radius:14px;background:var(--panel);box-shadow:0 -8px 30px rgba(0,0,0,.25)">' +
        '<span class="mono faint" style="width:24px">' + meRank + '</span>' + ava(meR.name, 40) +
        '<div style="flex:1"><b>' + meR.name + ' <span class="mono" style="color:var(--acc)">YOU</span></b><div class="mono faint" style="font-size:.7rem">' + meR[tab] + ' ' + unit + '</div></div>' +
        ring(pct(meR), 'var(--green)') + '</div>' : '');
  }

  async function open() {
    const rows = await (await fetch('/api/board')).json();
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:12000;background:var(--bg0);overflow:auto;padding:20px clamp(14px,6vw,120px) 40px;color:var(--ink)';
    ov.innerHTML = '<div style="max-width:760px;margin:0 auto"><div data-b></div></div>';
    document.body.appendChild(ov);
    const draw = () => {
      ov.querySelector('[data-b]').innerHTML = html(rows);
      ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
      ov.querySelectorAll('[data-x]').forEach(b => b.onclick = () => ov.remove());
    };
    draw();
    const esc = e => { if (e.key === 'Escape') ov.remove(); };
    addEventListener('keydown', esc);
    ov.addEventListener('remove', () => removeEventListener('keydown', esc));
  }

  /* sidebar entry (left menu), NOT top bar */
  const side = document.querySelector('.side-nav');
  if (side && !side.querySelector('[data-lbnav]')) {
    const a = document.createElement('a');
    a.className = 'nav-link'; a.dataset.lbnav = '1'; a.href = 'javascript:void(0)';
    a.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3"/></svg><span>Leaderboard</span>';
    a.onclick = open;
    side.appendChild(a);
  }
})();
