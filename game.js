import config from './config.js';
import bank from './data.js';
import {valid,runs} from './puzzle-engine.mjs';
import {$,el,shell,storage,message,confirmAction,button,formatTime} from './common.js';
shell(config);
const store=storage(config.id+':session:v1');const saved=store.read();
let level=0,p,values,notes,selected=0,history=[],noteMode=false,paintMode=1,elapsed=0,hints=0,paused=false,done=false,checked=false;
const boardHost=$('#board-host'),keys=$('#keypad'),tools=$('#tools'),difficulty=$('#difficulty');
const restore=saved&&[0,1,2].includes(saved.level)&&bank[saved.level].find(x=>x.id===saved.id);
if(restore&&Array.isArray(saved.values)&&saved.values.length===restore.n**2&&saved.values.every(v=>Number.isInteger(v)&&v>=(config.kind==='nonogram'?-1:0)&&v<=restore.n)&&Array.isArray(saved.notes)&&saved.notes.length===restore.n**2&&saved.notes.every(a=>Array.isArray(a)&&a.every(v=>Number.isInteger(v)&&v>=1&&v<=restore.n))&&!(restore.givens||[]).some((v,i)=>v&&saved.values[i]!==v)){
 level=saved.level;p=restore;values=saved.values;notes=saved.notes;elapsed=Number.isFinite(saved.elapsed)?Math.max(0,Math.floor(saved.elapsed)):0;hints=Number.isInteger(saved.hints)?saved.hints:0;done=valid(p,values);message(done?'완성한 퍼즐이에요. 새 퍼즐에 도전해 보세요.':'지난번 풀던 자리에서 이어서 해요.',done);
}else fresh(0);
difficulty.value=String(level);
function persist(){store.write({level,id:p.id,values,notes,elapsed,hints});}
function fresh(l){level=l;const pool=bank[l].filter(x=>x.id!==p?.id);p=pool[Math.floor(Math.random()*pool.length)];values=config.kind==='nonogram'?Array(p.n*p.n).fill(-1):[...p.givens];notes=values.map(()=>[]);selected=values.findIndex((v,i)=>!p.givens?.[i]);if(selected<0)selected=0;history=[];elapsed=0;hints=0;paused=false;done=false;checked=false;noteMode=false;message(config.start);persist();}
function checkpoint(){history.push({values:[...values],notes:notes.map(a=>[...a])});if(history.length>100)history.shift();}
function input(v){if(done||paused||p.givens?.[selected])return;checkpoint();checked=false;
 if(config.kind==='nonogram')values[selected]=v;
 else if(noteMode&&v){if(values[selected]){history.pop();message('메모는 빈칸에 적을 수 있어요.');return;}const a=notes[selected];notes[selected]=a.includes(v)?a.filter(x=>x!==v):[...a,v].sort();}
 else {values[selected]=v;notes[selected]=[];}
 complete();render();persist();}
function complete(){done=valid(p,values);if(done){if(config.kind==='nonogram')values=values.map(v=>v===-1?0:v);message('완성! '+formatTime(elapsed)+' · 힌트 '+hints+'번 사용했어요.',true);}else message(config.kind==='nonogram'?'숫자만큼 이어 칠하고, 덩어리 사이는 한 칸 이상 비워요.':noteMode?'메모 모드 · 가능한 숫자를 여러 개 적어 보세요.':'차근차근 빈칸을 채워 보세요.');}
function render(){
 const n=p.n;boardHost.replaceChildren();const grid=el('div',{class:'board '+(config.kind==='nonogram'?'nonogram-grid':config.kind==='futoshiki'?'futo-grid':'number-grid'),'aria-label':config.title+' 퍼즐'});grid.style.setProperty('--n',n);
 if(config.kind==='futoshiki')grid.style.gridTemplateColumns=Array.from({length:2*n-1},(_,i)=>i%2?'22px':'minmax(0,1fr)').join(' ');
 const cells=[];
 function tile(i){const r=Math.floor(i/n),c=i%n, given=!!p.givens?.[i],v=values[i];const b=el('button',{type:'button',class:'tile','data-cell':i,'aria-label':`${r+1}행 ${c+1}열, ${config.kind==='nonogram'?(v===1?'칠함':v===0?'비움':'미정'):(v||'빈칸')}${given?' 고정 숫자':''}`,'aria-pressed':String(selected===i),tabindex:i===selected?'0':'-1'});
 b.classList.toggle('selected',i===selected);b.classList.toggle('given',given);b.classList.toggle('error',checked&&((config.kind==='nonogram'?v>=0:!!v)&&v!==p.solution[i]));
 if(config.kind==='nonogram'){b.classList.toggle('filled',v===1);b.textContent=v===0?'×':'';b.onclick=()=>{selected=i;input(values[i]===paintMode?-1:paintMode);focusCell();};}
 else {if(v)b.textContent=v;else if(notes[i].length){const pencil=el('span',{class:'notes'});for(let k=1;k<=n;k++)pencil.append(el('span',{},notes[i].includes(k)?String(k):''));b.append(pencil);}
 b.onclick=()=>{selected=i;render();focusCell();};
 if(config.kind==='sudoku'){b.classList.toggle('related',r===Math.floor(selected/n)||c===selected%n);b.classList.toggle('same',v>0&&v===values[selected]);if((c+1)%p.box===0&&c<n-1)b.classList.add('box-right');if((r+1)%p.box===0&&r<n-1)b.classList.add('box-bottom');}
 if(config.kind==='calcudoku'){const cage=p.cages.find(c=>c.cells.includes(i));b.classList.add('caged');if(i===cage.cells[0])b.append(el('span',{class:'cage-clue'},cage.target+(cage.op==='='?'':cage.op)));for(const [side,j]of [['top',i-n],['bottom',i+n],['left',c?i-1:-1],['right',c<n-1?i+1:-1]])if(!cage.cells.includes(j))b.classList.add('cage-'+side);}}
 cells[i]=b;return b;}
 if(config.kind==='nonogram'){
 grid.append(el('span',{'aria-hidden':'true'}));p.cols.forEach((clue,c)=>{const x=el('span',{class:'clue col','aria-label':`${c+1}열 단서 ${clue.join(', ')}`});clue.forEach(v=>x.append(el('span',{},v)));x.classList.toggle('done',String(runs(values.filter((_,i)=>i%n===c)))===String(clue));grid.append(x);});
 for(let r=0;r<n;r++){const x=el('span',{class:'clue','aria-label':`${r+1}행 단서 ${p.rows[r].join(', ')}`},p.rows[r].join(' '));x.classList.toggle('done',String(runs(values.slice(r*n,r*n+n)))===String(p.rows[r]));grid.append(x);for(let c=0;c<n;c++)grid.append(tile(r*n+c));}
 }else if(config.kind==='futoshiki'){
 for(let r=0;r<2*n-1;r++)for(let c=0;c<2*n-1;c++){if(r%2===0&&c%2===0)grid.append(tile(r/2*n+c/2));else{const a=r%2?Math.floor(r/2)*n+c/2:r/2*n+Math.floor(c/2),b=a+(r%2?n:1);const sign=!(r%2&&c%2)&&p.signs.find(s=>s[0]===a&&s[1]===b);grid.append(el('span',{class:'sign'+(r%2?' vertical':''),'aria-hidden':'true'},sign?sign[2]:''));}}
 }else for(let i=0;i<n*n;i++)grid.append(tile(i));
 boardHost.append(grid);if(paused){const cover=el('div',{class:'paused-cover'},'잠깐 쉬는 중');boardHost.append(cover);grid.inert=true;}
 keys.replaceChildren();if(config.kind!=='nonogram'){keys.style.setProperty('--keys',n);for(let v=1;v<=n;v++){const b=button(String(v),()=>input(v));b.disabled=paused||done;keys.append(b);}}
 tools.replaceChildren();
 const undo=button('↶ 되돌리기',()=>{if(!history.length||paused)return;const old=history.pop();values=old.values;notes=old.notes;done=valid(p,values);checked=false;message('한 단계 되돌렸어요.');render();persist();});undo.disabled=!history.length||paused;tools.append(undo);
 const erase=button('지우기',()=>input(config.kind==='nonogram'?-1:0));erase.disabled=paused||done;tools.append(erase);
 if(config.kind==='nonogram'){for(const [v,label]of [[1,'■ 칠하기'],[0,'× 비우기']]){const b=button(label,()=>{paintMode=v;render();},paintMode===v?'active':'');b.setAttribute('aria-pressed',String(paintMode===v));tools.append(b);}}
 else {const b=button('✎ 메모',()=>{noteMode=!noteMode;message(noteMode?'메모 모드 · 빈칸에 후보 숫자를 적어요.':'숫자 입력 모드');render();},noteMode?'active':'');b.setAttribute('aria-pressed',String(noteMode));tools.append(b);}
 const check=button('확인',()=>{checked=true;const wrong=values.filter((v,i)=>(config.kind==='nonogram'?v>=0:!!v)&&v!==p.solution[i]).length;message(wrong?`${wrong}칸을 다시 살펴보세요. 붉게 표시했어요.`:'지금까지 입력한 내용이 맞아요.');render();});check.disabled=paused||done;tools.append(check);
 const hint=button('힌트',()=>{let i=selected;if(p.givens?.[i]||values[i]===p.solution[i])i=values.findIndex((v,i)=>v!==p.solution[i]);if(i<0)return;checkpoint();selected=i;values[i]=p.solution[i];notes[i]=[];hints++;checked=false;complete();if(!done)message(`${Math.floor(i/n)+1}행 ${i%n+1}열의 정답을 채웠어요. 힌트 ${hints}번`);render();persist();});hint.disabled=paused||done;tools.append(hint);
 $('#pause').textContent=paused?'이어 하기':'잠깐 쉬기';$('#pause').disabled=done;$('#count').textContent=config.kind==='nonogram'?`${values.filter(v=>v===1).length}칸`:`${values.filter(Boolean).length}/${n*n}`;$('#time').textContent=formatTime(elapsed);
}
function focusCell(){boardHost.querySelector(`[data-cell="${selected}"]`)?.focus({preventScroll:true});}
difficulty.onchange=()=>{const next=Number(difficulty.value);confirmAction('진행 중인 퍼즐 대신 새 난이도로 시작할까요?',()=>{fresh(next);render();},()=>difficulty.value=String(level));};
$('#new').onclick=()=>confirmAction('다른 퍼즐을 시작할까요? 현재 퍼즐의 입력 내용은 지워져요.',()=>{fresh(level);render();});
$('#pause').onclick=()=>{paused=!paused;message(paused?'시간도 잠시 멈췄어요. 이어 하기를 누르면 계속해요.':config.start);render();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;render();persist();}});
window.addEventListener('pagehide',persist);
setInterval(()=>{if(!document.hidden&&!paused&&!done&&!document.querySelector('dialog[open]')){elapsed++;$('#time').textContent=formatTime(elapsed);if(elapsed%10===0)persist();}},1000);
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||/^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName)||paused)return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const n=p.n,r=Math.floor(selected/n),c=selected%n;selected=e.key==='ArrowUp'?Math.max(0,r-1)*n+c:e.key==='ArrowDown'?Math.min(n-1,r+1)*n+c:e.key==='ArrowLeft'?r*n+Math.max(0,c-1):r*n+Math.min(n-1,c+1);render();focusCell();}
 else if(config.kind!=='nonogram'&&/^[1-9]$/.test(e.key)&&Number(e.key)<=p.n){e.preventDefault();input(Number(e.key));}
 else if(['Backspace','Delete','0'].includes(e.key)){e.preventDefault();input(config.kind==='nonogram'?-1:0);}
 else if(config.kind==='nonogram'&&e.key.toLowerCase()==='x'){e.preventDefault();paintMode=0;input(0);}
 else if(config.kind==='nonogram'&&e.key===' '&&boardHost.contains(e.target)){e.preventDefault();input(values[selected]===1?0:1);}
});
render();persist();
