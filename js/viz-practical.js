/**
 * ================================================================
 *  AE3301 · PRACTICAL CS ANIMATIONS
 *  Stack (LIFO) · Queue (FIFO) · Linked List · Recursion call-stack
 *  Renderers + recorders + Lab cards appended to Algorithm Lab
 * ================================================================
 */
(() => {
  'use strict';
  const C = { current:'#f0561c', compare:'#d4a24e', added:'#1f8a34', removed:'#d43d2a', node:'#3a3a3a', found:'#1f8a34' };

  /* ---------- renderers ---------- */
  function initStack(s){ s.innerHTML='<div data-col style="display:flex;flex-direction:column-reverse;gap:6px;align-items:center;min-height:220px"></div><div data-top class="mono" style="margin-top:8px;font-size:.72rem;color:var(--dim)"></div>'; }
  function drawStack(s,t,st){
    s.querySelector('[data-col]').innerHTML = st.items.map((v,i)=>'<div style="min-width:150px;padding:10px 14px;border-radius:8px;background:'+(C[(st.hi&&st.hi[i])||'node'])+';color:#fff;font:700 14px var(--fm);text-align:center;transition:all .3s">'+v+'</div>').join('') || '<span class="faint" style="font-size:.75rem">empty</span>';
    s.querySelector('[data-top]').textContent='top = '+(st.items.length-1);
  }
  window.AE3301_VIZ.register('stack',{init:initStack,draw:drawStack});

  function initQueue(s){ s.innerHTML='<div data-row style="display:flex;gap:6px;align-items:center;min-height:110px;flex-wrap:wrap"></div><div class="mono" style="margin-top:8px;font-size:.72rem;color:var(--dim)">FRONT ← ··· → REAR</div>'; }
  function drawQueue(s,t,st){
    s.querySelector('[data-row]').innerHTML = st.items.map((v,i)=>'<div style="padding:12px 16px;border-radius:8px;background:'+(C[(st.hi&&st.hi[i])||'node'])+';color:#fff;font:700 14px var(--fm);transition:all .3s">'+v+'</div>').join('') || '<span class="faint" style="font-size:.75rem">empty</span>';
  }
  window.AE3301_VIZ.register('queue',{init:initQueue,draw:drawQueue});

  function initList(s){ s.innerHTML='<div data-row style="display:flex;align-items:center;flex-wrap:wrap;min-height:120px"></div>'; }
  function drawList(s,t,st){
    let h='';
    st.nodes.forEach((n,i)=>{
      const c=C[(st.hi&&st.hi[n.id])||'node'];
      const ptrs=[]; if(st.ptrs) Object.entries(st.ptrs).forEach(([k,v])=>{ if(v===i) ptrs.push(k); });
      h+='<div style="display:flex;flex-direction:column;align-items:center;gap:4px">'+
        (ptrs.length?'<span class="mono" style="font-size:.6rem;color:var(--acc)">↑ '+ptrs.join(', ')+'</span>':'<span style="height:12px"></span>')+
        '<div style="display:flex;border:2px solid '+c+';border-radius:6px;overflow:hidden;transition:all .3s">'+
        '<div style="padding:10px 14px;background:'+c+';color:#fff;font:700 14px var(--fm)">'+n.val+'</div>'+
        '<div style="padding:10px 8px;background:#111;color:var(--dim);font:700 12px var(--fm)">→</div></div></div>';
      if(i<st.nodes.length-1) h+='<div style="width:22px;height:2px;background:#555;margin:0 2px 16px"></div>';
    });
    h+='<div style="padding:10px 8px;border:2px dashed #555;border-radius:6px;color:var(--dim);font:700 12px var(--fm);margin-left:2px">∅</div>';
    s.querySelector('[data-row]').innerHTML=h;
  }
  window.AE3301_VIZ.register('list',{init:initList,draw:drawList});

  /* ---------- recorders (run the real ops, capture each state) ---------- */
  const SS=(items,hi,note,line)=>({state:{items:[...items],hi:hi||{}},note,line});
  function stackOps(){ const CODE='push(x): top++ ; s[top]=x\npop(): x=s[top]; top--';
    const items=[],st=[SS(items,{},'Empty stack',0)];
    [5,3,8,1].forEach(v=>{ items.push(v); st.push(SS(items,{[items.length-1]:'added'},'push('+v+') → lands on TOP',0)); });
    for(let k=0;k<2;k++){ const v=items.pop(); st.push(SS(items,{},'pop() → '+v+' removed first (LIFO)',1)); }
    return {title:'Stack · LIFO',kind:'stack',code:CODE,steps:st,regenerate:stackOps}; }
  function queueOps(){ const CODE='enqueue(x): q[rear]=x; rear++\ndequeue(): x=q[front]; front++';
    const items=[],st=[SS(items,{},'Empty queue',0)];
    ['A','B','C','D'].forEach(v=>{ items.push(v); st.push(SS(items,{[items.length-1]:'added'},'enqueue('+v+') → joins at REAR',0)); });
    for(let k=0;k<2;k++){ const v=items.shift(); st.push(SS(items,{},'dequeue() → '+v+' left from FRONT (FIFO)',1)); }
    return {title:'Queue · FIFO',kind:'queue',code:CODE,steps:st,regenerate:queueOps}; }

  const LS=(nodes,hi,ptrs,note,line)=>({state:{nodes:nodes.map(n=>({...n})),hi:hi||{},ptrs},note,line});
  function listBuild(){ const CODE='node.next=null\ntail.next=node\ntail=node';
    let nodes=[],st=[LS([],{},{head:null},'Empty list',0)];
    [10,20,30,40].forEach((v,i)=>{ nodes.push({id:i,val:v}); st.push(LS(nodes,{[i]:'added'},{head:0},'insert '+v+' at tail',2)); });
    return {title:'Linked List · build',kind:'list',code:CODE,steps:st,regenerate:listBuild}; }
  function listTraverse(){ const CODE='cur=head\nwhile cur:\n  visit(cur)\n  cur=cur.next';
    const nodes=[0,1,2,3].map(i=>({id:i,val:[10,20,30,40][i]}));
    const st=[LS(nodes,{},{head:0},'start at head',0)];
    for(let i=0;i<4;i++) st.push(LS(nodes,{[i]:'current'},{head:0,cur:i},'visit '+nodes[i].val,2));
    st.push(LS(nodes,{},{head:0},'cur=null → done',3));
    return {title:'Linked List · traverse',kind:'list',code:CODE,steps:st,regenerate:listTraverse}; }
  function listInsertHead(){ const CODE='node.next=head\nhead=node';
    let nodes=[1,2,3].map(i=>({id:i,val:[20,30,40][i]}));
    const st=[LS(nodes,{},{head:0},'list: 20→30→40',0)];
    nodes=[{id:0,val:10},...nodes.map(n=>({id:n.id+1,val:n.val}))];
    st.push(LS(nodes,{0:'added'},{head:0},'insert 10 at head (O(1))',1));
    return {title:'Linked List · insert head',kind:'list',code:CODE,steps:st,regenerate:listInsertHead}; }
  function listDelete(){ const CODE='prev.next=cur.next\nfree(cur)';
    let nodes=[0,1,2,3].map(i=>({id:i,val:[10,20,30,40][i]}));
    const st=[LS(nodes,{},{head:0,cur:0},'find node 30',0)];
    st.push(LS(nodes,{1:'compare'},{head:0,cur:1},'20 ≠ 30',0));
    st.push(LS(nodes,{2:'removed'},{head:0,cur:2,prev:1},'found 30 → unlink',1));
    nodes=nodes.filter(n=>n.val!==30);
    st.push(LS(nodes,{},{head:0},'list: 10→20→40',1));
    return {title:'Linked List · delete',kind:'list',code:CODE,steps:st,regenerate:listDelete}; }
  function recursionFact(){ const CODE='fact(n):\n if n==0: return 1\n return n*fact(n-1)';
    const items=[],st=[SS(items,{},'call fact(4)',0)];
    for(let n=4;n>=0;n--){ items.push('fact('+n+')'); st.push(SS(items,{[items.length-1]:'current'},'call fact('+n+') → push frame',2)); }
    const rets=[1,1,2,6,24];
    for(let i=0;i<5;i++){ const f=items.pop(); st.push(SS(items,{},f+' returns '+rets[i],2)); }
    return {title:'Recursion · fact(4) call stack',kind:'stack',code:CODE,steps:st,regenerate:recursionFact}; }

  const PRAC=[
    {id:'stackOps',name:'Stack (LIFO)',blurb:'push / pop, top pointer',gen:stackOps},
    {id:'queueOps',name:'Queue (FIFO)',blurb:'enqueue / dequeue',gen:queueOps},
    {id:'listBuild',name:'Linked List · build',blurb:'insert at tail',gen:listBuild},
    {id:'listTraverse',name:'Linked List · traverse',blurb:'walk node by node',gen:listTraverse},
    {id:'listInsertHead',name:'Linked List · insert head',blurb:'O(1) head insert',gen:listInsertHead},
    {id:'listDelete',name:'Linked List · delete',blurb:'unlink a node',gen:listDelete},
    {id:'recursionFact',name:'Recursion · call stack',blurb:'fact(4) frames push/pop',gen:recursionFact}
  ];

  /* append a "practical" group to the Lab page after it mounts */
  function append(){
    if((location.hash||'').replace('#','')!=='/visualize') return;
    const v=document.getElementById('view');
    if(!v||v.querySelector('[data-prac]')) return;
    const stage=v.querySelector('[data-stage]'); if(!stage) return;
    const div=document.createElement('div'); div.dataset.prac='1';
    div.innerHTML='<h3 style="margin:18px 0 8px;text-transform:uppercase;color:var(--acc);font-size:.75rem;letter-spacing:.2em">practical · data structures</h3>'+
      '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">'+
      PRAC.map(a=>'<div class="card" style="padding:14px"><b>'+a.name+'</b><p class="muted" style="font-size:.78rem;margin:6px 0 10px">'+a.blurb+'</p><button class="btn btn-primary btn-sm" data-prun="'+a.id+'">▶ RUN</button></div>').join('')+'</div>';
    v.insertBefore(div, stage);
    div.querySelectorAll('[data-prun]').forEach(b=>b.onclick=()=>{
      const a=PRAC.find(x=>x.id===b.dataset.prun);
      window.AE3301_VIZ_ENGINE.mount(stage,a.gen());
      stage.scrollIntoView({behavior:'smooth'});
    });
  }
  addEventListener('hashchange',()=>setTimeout(append,10));
  setTimeout(append,80);
})();
