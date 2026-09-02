/* IT QUEST v2 — interactive simulations registry. */
import { icon, REDUCED, sleep } from './ui.js';

const IN = [
  { emoji: '🔢', label: '“27 + 15”', out: '42 appears on screen 🎉' },
  { emoji: '🎤', label: '“Alarm 7 AM”', out: '⏰ Alarm set for 7:00' },
  { emoji: '📷', label: 'Dog photo', out: 'Photo enhanced 🐶' },
  { emoji: '🎮', label: 'JUMP pressed', out: 'Character jumps 🕹️' }
];
function pipeline(root) {
  let sel = -1, running = false, saved = 0;
  root.innerHTML = `
    <div class="terms" style="margin-bottom:16px">${IN.map((i, n) => `<button class="term-card p-opt" data-i="${n}" style="cursor:pointer"><b>${i.emoji}</b><p>${i.label}</p></button>`).join('')}</div>
    <div class="sim-machine">
      <div class="sim-token hide" data-tk></div>
      <div class="sim-station"><span class="station-cap">INPUT</span><div class="sim-slot" data-in>—</div></div>
      <div class="sim-arrow">${icon('arrow-right')}</div>
      <div class="sim-station st-cpu" data-cpu><span class="station-cap">PROCESSING</span><div class="cpu-core">${icon('cpu')}</div><div class="cpu-status" data-st>waiting…</div></div>
      <div class="sim-arrow">${icon('arrow-right')}</div>
      <div class="sim-station"><span class="station-cap">OUTPUT</span><div class="sim-slot" data-out>—</div></div>
    </div>
    <div class="power-row"><button class="btn btn-primary" data-feed disabled>${icon('play')} FEED IT IN</button><span class="muted" data-hint style="font-size:.85rem">Pick an input ↑</span></div>
    <p class="muted" data-cap style="margin-top:12px;min-height:1.4em"></p>`;
  const q = s => root.querySelector(s);
  const opts = [...root.querySelectorAll('[data-i]')];
  opts.forEach(b => b.addEventListener('click', () => {
    if (running) return;
    sel = +b.dataset.i;
    opts.forEach(o => o.style.borderColor = ''); b.style.borderColor = 'var(--acc)';
    q('[data-feed]').disabled = false; q('[data-hint]').textContent = 'Ready!';
  }));
  q('[data-feed]').addEventListener('click', async () => {
    if (running || sel < 0) return; running = true; q('[data-feed]').disabled = true;
    const i = IN[sel], tk = q('[data-tk]');
    q('[data-in]').textContent = i.emoji; tk.textContent = i.emoji; tk.classList.remove('hide', 'pos-cpu', 'pos-out');
    q('[data-cap]').innerHTML = '<b style="color:var(--acc)">Input received.</b>';
    await sleep(700);
    tk.classList.add('pos-cpu'); q('[data-cpu]').classList.add('working');
    q('[data-st]').textContent = 'calculating…'; await sleep(1400);
    q('[data-cpu]').classList.remove('working'); q('[data-st]').textContent = 'done ✓';
    tk.classList.add('pos-out'); await sleep(REDUCED ? 100 : 800);
    tk.classList.add('hide'); q('[data-out]').innerHTML = `<span style="font-size:.9rem">${i.out}</span>`;
    q('[data-cap]').innerHTML = `<b style="color:var(--green)">Output:</b> ${i.out} — and if you <b>save</b>, it goes to storage.`;
    running = false; q('[data-feed]').disabled = false;
  });
}

const PROG = [
  { op: 'LOAD', arg: '2', note: 'put 2 in the working slot (register)' },
  { op: 'ADD', arg: '3', note: '2 + 3 calculated in the ALU' },
  { op: 'OUT', arg: '', note: 'send result to output' }
];
function cpu(root) {
  let i = 0, phase = 0, reg = null;
  const PH = ['FETCH', 'DECODE', 'EXECUTE'];
  root.innerHTML = `
    <div class="mem-grid">
      <div class="mem-box"><h5 style="color:var(--acc)">PROGRAM (in RAM)</h5><div class="mem-cells" style="grid-template-columns:1fr" data-prog></div></div>
      <div class="mem-box"><h5 style="color:var(--gold)">CPU STATE</h5>
        <div class="cpu-status" data-cyc>cycle: —</div>
        <div class="cpu-status" data-reg>register: —</div>
        <div class="cpu-status" data-outp>output: —</div>
      </div>
    </div>
    <div class="power-row"><button class="btn btn-primary" data-step>${icon('play')} RUN ONE STEP</button><button class="btn btn-ghost" data-rst>${icon('refresh')} RESET</button></div>
    <p class="muted" data-note style="margin-top:12px;min-height:1.4em">Press the button: FETCH → DECODE → EXECUTE, one instruction at a time.</p>`;
  const q = s => root.querySelector(s);
  q('[data-prog]').innerHTML = PROG.map((p, n) => `<div class="mem-cell" data-ins="${n}" style="height:40px">${p.op}${p.arg ? ' ' + p.arg : ''}</div>`).join('');
  function paint() {
    PROG.forEach((p, n) => q(`[data-ins="${n}"]`).classList.toggle('full', n === i && i < PROG.length));
    q('[data-cyc]').textContent = i < PROG.length ? `instruction ${i + 1}/${PROG.length} · ${PH[phase]}` : 'program complete ✓';
    q('[data-reg]').textContent = 'register: ' + (reg === null ? '—' : reg);
  }
  q('[data-step]').addEventListener('click', () => {
    if (i >= PROG.length) return;
    const ins = PROG[i];
    if (phase === 0) q('[data-note]').innerHTML = `<b style="color:var(--acc)">FETCH:</b> CPU grabs “${ins.op}${ins.arg ? ' ' + ins.arg : ''}” from RAM.`;
    else if (phase === 1) q('[data-note]').innerHTML = `<b style="color:var(--violet)">DECODE:</b> figure out what “${ins.op}” means.`;
    else {
      if (ins.op === 'LOAD') { reg = +ins.arg; q('[data-note]').innerHTML = `<b style="color:var(--green)">EXECUTE:</b> ${ins.note}. register = ${reg}.`; }
      if (ins.op === 'ADD') { reg = reg + +ins.arg; q('[data-note]').innerHTML = `<b style="color:var(--green)">EXECUTE:</b> ${ins.note}. register = ${reg}.`; }
      if (ins.op === 'OUT') { q('[data-outp]').textContent = 'output: ' + reg; q('[data-note]').innerHTML = `<b style="color:var(--green)">EXECUTE:</b> ${ins.note} → <b>${reg}</b>.`; }
    }
    phase++;
    if (phase === 3) { phase = 0; i++; }
    paint();
  });
  q('[data-rst]').addEventListener('click', () => { i = 0; phase = 0; reg = null; q('[data-outp]').textContent = 'output: —'; q('[data-note]').textContent = 'Reset. Run one step at a time.'; paint(); });
  paint();
}

function mem(root) {
  const ITEMS = ['📷', '', '', '🎮'];
  let power = true; const ram = [false, false, false, false], sto = [true, true, true, true];
  root.innerHTML = `
    <div class="mem-grid">
      <div class="mem-box" data-rambox><h5 style="color:var(--acc)">RAM — the desk</h5><div class="mem-cells" data-ram></div></div>
      <div class="mem-box"><h5 style="color:var(--gold)">STORAGE — the shelf</h5><div class="mem-cells" data-sto></div></div>
    </div>
    <div class="power-row">
      ${ITEMS.map((it, n) => `<button class="btn btn-ghost btn-sm" data-open="${n}">OPEN ${it}</button>`).join('')}
      <button class="btn btn-danger btn-sm" data-pow>${icon('bolt')} POWER OFF</button>
    </div>
    <p class="muted" data-cap style="margin-top:12px;min-height:1.4em">Open items to copy them from shelf (storage) to desk (RAM). Then hit POWER OFF and watch what survives.</p>`;
  const q = s => root.querySelector(s);
  function paint() {
    q('[data-ram]').innerHTML = ram.map((f, n) => `<div class="mem-cell full ram ${f ? '' : 'x'}" style="${f ? '' : 'opacity:.35'}">${f ? ITEMS[n] : ''}</div>`).join('');
    q('[data-sto]').innerHTML = sto.map((f, n) => `<div class="mem-cell ${f ? 'full' : ''}">${f ? ITEMS[n] : ''}</div>`).join('');
    q('[data-rambox]').classList.toggle('off', !power);
  }
  root.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (!power) { q('[data-cap]').innerHTML = '<b style="color:var(--red)">No power — RAM can’t work.</b> Turn it on first.'; return; }
    const n = +b.dataset.open; ram[n] = true;
    q('[data-cap]').innerHTML = `${ITEMS[n]} copied shelf → desk. It’s now fast to use, but <b>unsaved</b>.`;
    paint();
  }));
  q('[data-pow]').addEventListener('click', () => {
    power = !power;
    if (!power) { ram.fill(false); q('[data-cap]').innerHTML = '<b style="color:var(--red)">Power off:</b> the desk is cleared (RAM empty) — the shelf (storage) keeps everything. That’s volatile vs non-volatile.'; }
    else q('[data-cap]').innerHTML = '<b style="color:var(--green)">Power on.</b> RAM is empty again; storage unchanged.';
    q('[data-pow]').innerHTML = power ? `${icon('bolt')} POWER OFF` : `${icon('play')} POWER ON`;
    paint();
  });
  paint();
}

const REG = { pipeline, cpu, mem };
export function initSims(root) {
  root.querySelectorAll('[data-sim]').forEach(h => { const f = REG[h.dataset.sim]; if (f) f(h); });
}
