/**
 * ================================================================
 *  AE3301 · AUTH EXPERIENCE — split-screen, spring-smooth
 *  floating labels · sliding tab pill · staggered brand reveal
 *  binds the API key to the account on first login
 * ================================================================
 */
(() => {
  'use strict';
  const TK = 'ae3301:token', NM = 'ae3301:name', AK = 'ae3301:apikey';
  const post = (p, b) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(r => r.json()).catch(() => ({ err: 'network' }));

  const CSS = `
  .auth-ov{position:fixed;inset:0;z-index:19000;display:flex;background:var(--bg0);color:var(--ink);overflow:auto}
  .auth-brand{flex:1.1;background:#0d0d0d;color:#f2f0ea;display:flex;flex-direction:column;justify-content:center;padding:clamp(24px,6vw,72px);position:relative;overflow:hidden}
  .auth-brand::before{content:"";position:absolute;inset:-20%;background:radial-gradient(520px 360px at 20% 20%,rgba(240,86,28,.16),transparent 60%),radial-gradient(620px 420px at 80% 70%,rgba(106,77,196,.12),transparent 60%)}
  .auth-brand>*{position:relative}
  .auth-logo{font:800 clamp(2.2rem,5vw,3.6rem) var(--fd)}
  .auth-logo em{color:var(--acc);font-style:normal}
  .auth-tag{font-family:var(--fm);letter-spacing:.3em;font-size:.68rem;color:#8a867e;margin:10px 0 26px}
  .auth-feats{display:grid;gap:12px;font-size:.9rem;color:#b6b1a8}
  .auth-feats span{opacity:0;animation:aUp .6s cubic-bezier(.2,.8,.2,1) forwards}
  .auth-feats span:nth-child(2){animation-delay:.12s}.auth-feats span:nth-child(3){animation-delay:.24s}.auth-feats span:nth-child(4){animation-delay:.36s}
  @keyframes aUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .auth-side{flex:1;display:grid;place-items:center;padding:24px;position:relative}
  .auth-card{width:min(430px,94vw);animation:aUp .5s cubic-bezier(.2,.8,.2,1) both}
  .auth-tabs{position:relative;display:flex;border:1px solid var(--line);border-radius:999px;padding:4px;margin-bottom:22px}
  .auth-tabs .pill{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);background:var(--acc);border-radius:999px;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
  .auth-tabs.right .pill{transform:translateX(100%)}
  .auth-tabs button{flex:1;border:0;background:transparent;color:var(--dim);font-weight:700;padding:11px 0;border-radius:999px;cursor:pointer;z-index:1;transition:color .3s}
  .auth-tabs button.on{color:#0d0d0d}
  .afield{position:relative;margin-bottom:14px}
  .afield input{width:100%;min-height:56px;border:1px solid var(--line);border-radius:14px;background:var(--panel);color:var(--ink);padding:18px 44px 6px 16px;outline:none;transition:border-color .25s}
  .afield label{position:absolute;left:16px;top:17px;color:var(--faint);font-size:.95rem;pointer-events:none;transition:all .2s cubic-bezier(.2,.8,.2,1)}
  .afield input:focus{border-color:var(--acc)}
  .afield input:focus+label,.afield input:not(:placeholder-shown)+label{top:7px;font-size:.6rem;letter-spacing:.14em;color:var(--acc);font-family:var(--fm)}
  .afield .eye{position:absolute;right:12px;top:16px;border:0;background:none;color:var(--faint);cursor:pointer}
  .auth-go{width:100%;min-height:54px;border:0;border-radius:14px;background:var(--acc);color:#0d0d0d;font-weight:800;letter-spacing:.06em;cursor:pointer;transition:transform .15s;box-shadow:0 10px 30px rgba(240,86,28,.25)}
  .auth-go:active{transform:scale(.97)}
  .auth-err{color:var(--red);font-size:.8rem;margin-top:10px;min-height:1.2em}
  .auth-x{position:absolute;top:14px;right:14px;z-index:2}
  @media(max-width:900px){.auth-brand{display:none}}`;

  function open() {
    const token = localStorage.getItem(TK);
    const ov = document.createElement('div');
    ov.className = 'auth-ov';
    ov.innerHTML = '<style>' + CSS + '</style>' +
      '<div class="auth-brand"><div class="auth-logo">AE<em>3301</em></div>' +
      '<div class="auth-tag">LEARN → BUILD → MASTER</div>' +
      '<div class="auth-feats"><span>▸ Deep lessons with live simulations</span><span>▸ Real code judge — JS & Python</span><span>▸ Leaderboards, streaks & missions</span><span>▸ Your progress, on every device</span></div></div>' +
      '<div class="auth-side"><button class="btn btn-ghost btn-sm auth-x" data-x>✕</button><div class="auth-card" data-card></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('[data-x]').onclick = () => ov.remove();
    const card = ov.querySelector('[data-card]');

    if (token) {
      card.innerHTML = '<h3 style="font-family:var(--fd);margin-bottom:6px">Signed in</h3>' +
        '<p class="muted" style="margin-bottom:18px">as <b>' + (localStorage.getItem(NM) || 'explorer') + '</b></p>' +
        '<button class="auth-go" data-out>LOG OUT</button>';
      card.querySelector('[data-out]').onclick = () => { localStorage.removeItem(TK); localStorage.removeItem(NM); location.reload(); };
      return;
    }

    let mode = 'in';
    card.innerHTML =
      '<div class="auth-tabs" data-tabs><div class="pill"></div><button data-m="in" class="on">LOG IN</button><button data-m="up">CREATE ACCOUNT</button></div>' +
      '<div class="afield" data-name style="display:none"><input id="a-n" placeholder=" "><label>username</label></div>' +
      '<div class="afield"><input id="a-p" type="password" placeholder=" "><label>password</label><button class="eye" data-eye>👁</button></div>' +
      '<button class="auth-go" data-go>CONTINUE →</button>' +
      '<p class="auth-err" data-err></p>';
    const tabs = card.querySelector('[data-tabs]');
    tabs.querySelectorAll('button').forEach(b => b.onclick = () => {
      mode = b.dataset.m;
      tabs.classList.toggle('right', mode === 'up');
      tabs.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      card.querySelector('[data-name]').style.display = mode === 'up' ? '' : 'none';
    });
    card.querySelector('[data-eye]').onclick = () => {
      const p = card.querySelector('#a-p');
      p.type = p.type === 'password' ? 'text' : 'password';
    };
    card.querySelector('[data-go]').onclick = async () => {
      const err = card.querySelector('[data-err]');
      err.textContent = '';
      const name = (card.querySelector('#a-n').value || '').trim();
      const pw = card.querySelector('#a-p').value;
      const d = mode === 'in' ? await post('/api/login', { name, pw }) : await post('/api/register', { name, pw });
      if (!d.token) { err.textContent = '✗ ' + (d.err || 'failed'); return; }
      localStorage.setItem(TK, d.token);
      localStorage.setItem(NM, name);
      const key = localStorage.getItem(AK);
      if (key) {
        const b = await post('/api/bindkey', { token: d.token, key });
        if (b.err) { err.textContent = '⚠ ' + b.err; }
      }
      location.reload();
    };
  }

  window.AE3301_AUTH = { open };

  /* take over the ☁ SYNC chip (clone kills old listeners) */
  function hijack() {
    const c = document.querySelector('[data-sync]');
    if (c && !c.dataset.mine) {
      c.dataset.mine = '1';
      const n = c.cloneNode(true);
      c.replaceWith(n);
      n.addEventListener('click', open);
    }
  }
  setTimeout(hijack, 200);
  new MutationObserver(hijack).observe(document.querySelector('.hdr-chips') || document.body, { childList: true, subtree: true });
})();
