// Pure puzzle rules, shared by the browser, generator and tests.
export function cageMatches(values, cage) {
  const {op, target} = cage;
  if (op === '=') return values[0] === target;
  if (op === '+') return values.reduce((a,b) => a+b,0) === target;
  if (op === '×') return values.reduce((a,b) => a*b,1) === target;
  if (op === '−') return Math.abs(values[0]-values[1]) === target;
  if (op === '÷') return Math.max(...values) === target*Math.min(...values);
  return false;
}
export function runs(line) {
  const result=[]; let count=0;
  for (const v of [...line,0]) { if(v === 1) count++; else if(count) {result.push(count);count=0;} }
  return result.length ? result : [0];
}
export function valid(p, values) {
  const n=p.n;
  if(values.length!==n*n || values.some(v=>!Number.isInteger(v))) return false;
  if(p.kind==='nonogram') return p.rows.every((r,y)=>String(r)===String(runs(values.slice(y*n,y*n+n)))) && p.cols.every((c,x)=>String(c)===String(runs(Array.from({length:n},(_,y)=>values[y*n+x]))));
  if(values.some(v=>v<1||v>n)) return false;
  for(let r=0;r<n;r++) {
    if(new Set(values.slice(r*n,r*n+n)).size!==n) return false;
    if(new Set(Array.from({length:n},(_,c)=>values[c*n+r])).size!==n) return false;
  }
  if(p.box) for(let y=0;y<n;y+=p.box) for(let x=0;x<n;x+=p.box) {
    const vals=[]; for(let dy=0;dy<p.box;dy++) for(let dx=0;dx<p.box;dx++) vals.push(values[(y+dy)*n+x+dx]);
    if(new Set(vals).size!==n) return false;
  }
  if((p.givens||[]).some((v,i)=>v && values[i]!==v)) return false;
  if((p.signs||[]).some(([a,b,sign])=>sign==='<' ? values[a]>=values[b] : values[a]<=values[b])) return false;
  return (p.cages||[]).every(c=>cageMatches(c.cells.map(i=>values[i]),c));
}
export function countSolutions(p, limit=2) {
  if(p.kind==='nonogram') return countPictures(p,limit);
  const n=p.n, a=[...(p.givens||Array(n*n).fill(0))];
  const peers=Array.from({length:n*n},(_,i)=>Array.from({length:n*n},(_,j)=>j).filter(j=>i!==j&&(Math.floor(i/n)===Math.floor(j/n)||i%n===j%n||(p.box&&Math.floor(i/n/p.box)===Math.floor(j/n/p.box)&&Math.floor(i%n/p.box)===Math.floor(j%n/p.box)))));
  const cages=(p.cages||[]).map(c=>{
    const tuples=[];
    function build(v){if(v.length===c.cells.length){if(cageMatches(v,c))tuples.push(v);return;}
      for(let k=1;k<=n;k++)if(!v.some((x,j)=>x===k&&peers[c.cells[v.length]].includes(c.cells[j])))build([...v,k]);}
    build([]);return {...c,tuples};
  });
  let count=0,visits=0;
  function domain(i){let d=Array.from({length:n},(_,k)=>k+1).filter(v=>!peers[i].some(j=>a[j]===v));
    for(const [x,y,s] of p.signs||[]) if(x===i||y===i) d=d.filter(v=>{const l=x===i?v:a[x],r=y===i?v:a[y];return !l||!r||(s==='<'?l<r:l>r);});
    for(const c of cages)if(c.cells.includes(i)){const at=c.cells.indexOf(i);const options=c.tuples.filter(t=>c.cells.every((j,k)=>(!a[j]||a[j]===t[k])&&!peers[j].some(q=>!c.cells.includes(q)&&a[q]===t[k])));d=d.filter(v=>options.some(t=>t[at]===v));}
    return d;
  }
  function walk(){if(count>=limit)return;if(++visits>100000){count=limit;return;}
    let at=-1,opts=[];
    for(let i=0;i<a.length;i++)if(!a[i]){const d=domain(i);if(!d.length)return;if(at<0||d.length<opts.length){at=i;opts=d;if(d.length===1)break;}}
    if(at<0){if(valid(p,a))count++;return;}
    for(const v of opts){a[at]=v;walk();if(count>=limit)break;}a[at]=0;
  }
  walk();return count;
}
function lineOptions(n,clues){const opts=[];for(let mask=0;mask<2**n;mask++){const a=Array.from({length:n},(_,i)=>(mask>>i)&1);if(String(runs(a))===String(clues))opts.push(a);}return opts;}
function countPictures(p,limit){const n=p.n,rows=p.rows.map(c=>lineOptions(n,c)),cols=p.cols.map(c=>lineOptions(n,c));let count=0;const chosen=[];
  function walk(y,available){if(count>=limit)return;if(y===n){count++;return;}for(const row of rows[y]){const next=available.map((opts,x)=>opts.filter(col=>col[y]===row[x]));if(next.some(o=>!o.length))continue;chosen[y]=row;walk(y+1,next);}}
  walk(0,cols);return count;
}
