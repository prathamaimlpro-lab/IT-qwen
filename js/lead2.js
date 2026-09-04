/**
 * AE3301 · DROP C — LEADERBOARD v2 (🏆 chip)
 * Podium top-3 · % rings · sticky YOU row · XP / Lessons tabs
 */
const NM = 'ae3301:name';
let tab = 'xp';

const ring = p => '<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="11" fill="none" stroke="var(--line)" stroke-width="4"/>' +
  '<circle cx="15" cy="15" r="11" fill="none" stroke="var(--green)" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 11) + '" stroke-dashoffset="' + (2 * Math.PI * 11 * (1 - p / 100)) + '" transform="rotate(-90 15 15)"/></svg>';

function board(rows) {
  const me = localStorage.getItem(NM);
  const key = tab === 'xp' ? 'xp' : 'lessons';
  rows.sort((a, b) => b[key] - a[key]);
  const pct = r => Math.min(100, Math.round((r.lessons / 7) * 100));
  const top = rows.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  const rest = rows.slice(3, 10);
  const meRow = rows.find(r => r.name === me);
  const meRank = rows.indexOf(meRow) + 1;
  const cell = (r, h) => r ? '<div style="text-align:center;flex:1">' +
    '<div style="width:52px;height:52px;margin:0 auto;border-radius:50%;background:#161616;border:2px solid ' + (h ? 'var(--gold)' : 'var(--line)') + ';display:grid;place-items:center;font-weight:800">' + (r.name[0] || '?').toUpperCase() + '</div>' +
    '<b style="font-size:.8rem;display:block;margin-top:6px">' + r.name + '</b>' +
    '<span class="mono" style="font-size:.68rem;color:var(--acc)">' + r[key] + ' ' + (tab === 'xp' ? 'XP' : 'lessons') + '</span>' +
    '<div style="height:' + h + 'px;margin-top:8px;border-radius:10px 10px 0 0;background:linear-gradient(180deg,' + (h === 64 ? 'rgba(200,164,104,.5)' : h === 48 ? 'rgba(255,255,255,.25)' : 'rgba(200,120,80,.4)') + ',transparent);display:grid;place-items:center;font:800 1.2rem var(--fd);color:var(--ink)">' + (rows.indexOf(r) + 1) + '</div></div>' : '<div style="flex:1"></div>';
  return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><b style="flex:1">Where you stand</b>' +
    '<button class="btn btn-sm ' + (tab === 'xp' ? 'btn-primary' : 'btn-ghost') + '" data-t="xp">XP</button>' +
    '<button class="btn btn-sm ' + (tab === 'lessons' ? 'btn-primary' : 'btn-ghost') + '" data-t="lessons">Lessons</button></div>' +
    '<div style="display:flex;gap:8px;align-items:flex-end;margin-bottom:14px">' + cell(order[0], order[0] && rows.indexOf(order[0]) === 0 ? 64 : 48) + cell(order[1], 48) + cell(order[2], 36) + '</div>' +
    rest.map((r, i) => '<div style="display:flex;gap:10px;align-items:center;padding:9px 4px;border-bottom:1px dashed var(--line)">' +
      '<span class="mono faint" style="width:22px">' + (i + 4) + '</span>' +
      '<span style="width:34px;height:34px;border-radius:50%;background:#161616;display:grid;place-items:center;font-weight:800">' + (r.name[0] || '?').toUpperCase() + '</span>' +
      '<div style="flex:1"><b style="font-size:.85rem">' + r.name + '</b><div class="mono faint" style="font-size:.68rem">' + r[key] + ' ' + (tab === 'xp' ? 'XP' : 'lessons') + '</div></div>' +
      ring(pct(r)) + '</div>').join('') +
    (meRow ? '<div style="position:sticky;bottom:0;margin-top:8px;display:flex;gap:10px;align-items:center;padding:10px;border:1px solid var(--acc);border-radius:12px;background:var(--panel,#161616)">' +
      '<span class="mono" style="width:22px">' + meRank + '</span>' +
      '<span style="width:34px;height:34px;border-radius:50%;background:var(--acc);color:#0d0d0d;display:grid;place-items:center;font-weight:800">' + (meRow.name[0] || '?').toUpperCase() + '</span>' +
      '<div style="flex:1"><b style="font-size:.85rem">' + meRow.name + ' <span class="mono" style="color:var(--acc)">YOU</span></b><div class="mono faint" style="font-size:.68rem">' + meRow[key] + ' ' + (tab === 'xp' ? 'XP' : 'lessons') + '</div></div>' +
      ring(pct(meRow)) + '</div>' : '');
}

async function open() {
  const rows = await (await fetch('/api/board')).json();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="modal-card" style="max-height:85vh;overflow:auto;text-align:left"><h3 style="text-transform:uppercase">Leaderboard</h3><div data-b></div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  const draw = () => { ov.querySelector('[data-b]').innerHTML = board(rows);
    ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); }); };
  draw();
}
fetch('/api/ping').then(r => { if (!r.ok) return;
  const bar = document.querySelector('.hdr-chips');
  if (bar && !document.querySelector('[data-lead2]')) {
    const b = document.createElement('button');
    b.className = 'chip'; b.dataset.lead2 = '1'; b.style.cursor = 'pointer'; b.textContent = '🏆';
    b.onclick = open; bar.prepend(b);
  }
}).catch(() => {});
