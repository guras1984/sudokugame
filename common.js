export const $ = s => document.querySelector(s);
export function el(tag, attrs={}, text='') { const node=document.createElement(tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);node.textContent=text;return node; }
export const shuffle = a => {a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function storage(key) {
  let available=true;
  const report=()=>{$('#save-status').textContent=available?'이 기기에 자동 저장돼요':'이 브라우저에서는 기록을 저장할 수 없어요';};
  return {
    read(fallback=null){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{available=false;report();return fallback;}},
    write(value){try{localStorage.setItem(key,JSON.stringify(value));available=true;}catch{available=false;}report();}
  };
}
export function shell(c) {
  document.documentElement.style.setProperty('--accent',c.accent);
  document.documentElement.style.setProperty('--tint',c.tint);
  $('#title').textContent=c.title;$('#tagline').textContent=c.tagline;$('#eyebrow').textContent=c.label;$('#game-mark').textContent=c.mark;
  $('#rules-title').textContent=c.title+' · 하는 방법';
  const list=$('#rules-list');c.rules.forEach(t=>list.append(el('li',{},t)));
  $('#help').onclick=()=>$('#help-dialog').showModal();$('#close-help').onclick=()=>$('#help-dialog').close();
  $('#help-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
  if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
export function message(text,win=false) { $('#message').textContent=text;$('#message').classList.toggle('success',win); }
export function confirmAction(text, action, cancel=()=>{}) {
  const d=$('#confirm-dialog');$('#confirm-copy').textContent=text;
  const close=()=>{d.oncancel=null;};
  $('#confirm-yes').onclick=()=>{d.close();close();action();};
  $('#confirm-no').onclick=()=>{d.close();close();cancel();};d.oncancel=()=>{close();cancel();};d.showModal();
}
export function formatTime(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
export function button(text,handler,className=''){const b=el('button',{type:'button',class:className},text);b.onclick=handler;return b;}
