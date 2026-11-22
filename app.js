(() => {
  'use strict';
  const sorting=window.SortingEngine,searching=window.SearchingEngine,$=id=>document.getElementById(id);
  const E={algorithms:[...sorting.algorithms.map(meta=>({...meta,collection:'sorting'})),...searching.algorithms],parse:sorting.parse,clone:sorting.clone,build(id,values,target){const meta=this.algorithms.find(a=>a.id===id),bundle=meta.collection==='searching'?searching.build(id,values,target):sorting.build(id,values);return {...bundle,meta};}};
  const isSearch=()=>state.bundle?.meta.collection==='searching';
  const state={id:'bubble',values:[5,1,4,2,8,3],bundle:null,cursor:-1,timer:null,playing:false,mode:'Ready',figures:new Map(),wasDone:false,celebrated:false,fxTimer:null,fxFrame:null,fxCanvas:null,category:'sorting',target:3,sessions:{}};
  const number=value=>Object.is(value,-0)?'-0':String(value);
  const short=value=>{const t=number(value);return t.length<=7?t:value.toExponential(2).replace('e+','e');};
  const watch=value=>value===null||value===undefined?'not set':Array.isArray(value)?`[${value.map(x=>x===null?'None':watch(x)).join(', ')}]`:typeof value==='boolean'?(value?'True':'False'):typeof value==='object'?`{${Object.entries(value).map(([k,v])=>`${k}: ${watch(v)}`).join(', ')}}`:number(value);
  function snapshot(){return state.cursor<0?state.bundle.initial:state.bundle.events[state.cursor];}
  function save(){try{state.sessions[state.bundle.meta.collection]={id:state.id,values:state.values.slice(),step:state.cursor,target:state.target};localStorage.setItem('algo-with-minions-v1',JSON.stringify({algorithm:state.id,array:state.values,step:state.cursor,target:state.target,sessions:state.sessions},(_key,value)=>Object.is(value,-0)?'-0':value));}catch{}}
  function stop(){if(state.playing)state.mode='Paused';clearTimeout(state.timer);state.timer=null;state.playing=false;}
  function cancelEffects(){clearTimeout(state.fxTimer);cancelAnimationFrame(state.fxFrame);state.fxCanvas?.remove();state.fxTimer=null;state.fxFrame=null;state.fxCanvas=null;for(const f of state.figures.values()){f.jump?.cancel();f.jump=null;f.node.style.transition='';}}
  function fireworks(top,height,delay){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    state.fxTimer=setTimeout(()=>{
      state.fxTimer=null;const canvas=document.createElement('canvas');canvas.className='fireworks';canvas.setAttribute('aria-hidden','true');canvas.style.top=`${top}px`;canvas.style.height=`${height}px`;$('stage').append(canvas);state.fxCanvas=canvas;
      const width=$('stage').clientWidth,dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);
      const colors=['#67df9b','#80bdff','#f9ce45','#bc9aff','#ff9d76'],sparks=[];
      for(let b=0;b<3;b++)for(let k=0;k<34;k++){const angle=k*Math.PI*2/34,speed=65+Math.random()*85;sparks.push({x:width*[.23,.52,.78][b],y:height*[.38,.25,.4][b],vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,born:b*.25,color:colors[(k+b)%colors.length]});}
      const start=performance.now();function draw(now){const elapsed=(now-start)/1000;ctx.clearRect(0,0,width,height);for(const p of sparks){const age=elapsed-p.born;if(age<0||age>1.25)continue;const x=p.x+p.vx*age,y=p.y+p.vy*age+65*age*age;ctx.globalAlpha=Math.pow(1-age/1.25,1.3);ctx.strokeStyle=p.color;ctx.fillStyle=p.color;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x-p.vx*.035,y-(p.vy+130*age)*.035);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(x,y,1.6,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;if(elapsed<1.8)state.fxFrame=requestAnimationFrame(draw);else{canvas.remove();state.fxCanvas=null;state.fxFrame=null;}}
      state.fxFrame=requestAnimationFrame(draw);
    },delay);
  }
  function createFigure(item){
    const shapeValues=isSearch()?[...state.values,state.target]:state.values,scale=Math.max(1,...shapeValues.map(Math.abs)),min=Math.min(...shapeValues)/scale,max=Math.max(...shapeValues)/scale;
    const ratio=max===min?.5:(item.v/scale-min)/(max-min),height=Math.round(64+ratio*36);
    const node=document.createElement('div');node.className='character';node.dataset.id=item.id;
    const value=document.createElement('span');value.className='value';value.textContent=short(item.v);value.title=number(item.v);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 54 ${height+16}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
    const eyes=item.id%2===0?'<circle cx="21" cy="24" r="8" fill="#c5d0da"/><circle cx="35" cy="24" r="8" fill="#c5d0da"/><circle cx="21" cy="24" r="5" fill="#fbfdff"/><circle cx="35" cy="24" r="5" fill="#fbfdff"/><circle cx="22" cy="25" r="2.5" fill="#182332"/><circle cx="34" cy="25" r="2.5" fill="#182332"/>':'<circle cx="27" cy="24" r="10" fill="#c5d0da"/><circle cx="27" cy="24" r="7" fill="#fbfdff"/><circle cx="28" cy="25" r="3" fill="#182332"/>';
    svg.innerHTML=`<rect x="9" y="2" width="36" height="${height}" rx="18" fill="#f9ce45"/><path d="M10 24H44" stroke="#17222f" stroke-width="5"/>${eyes}<path d="M21 38Q27 43 33 38" fill="none" stroke="#17222f" stroke-width="2"/><path d="M9 ${height*.67}H45V${height-7}Q45 ${height+1} 27 ${height+1}Q9 ${height+1} 9 ${height-7}Z" fill="#338bdf"/><path d="M12 ${height*.64}V${height*.8}M42 ${height*.64}V${height*.8}" fill="none" stroke="#338bdf" stroke-width="5"/><path d="M9 ${height*.72}L2 ${height*.65}M45 ${height*.72}L52 ${height*.65}" fill="none" stroke="#f9ce45" stroke-width="4"/><path d="M17 ${height}V${height+8}H11M36 ${height}V${height+8}H42" fill="none" stroke="#d5dfeb" stroke-width="6"/>`;
    const identity=document.createElement('span');identity.className='identity';identity.textContent=String.fromCharCode(65+item.id);
    const cap=document.createElement('span');cap.className='hat';cap.setAttribute('aria-hidden','true');const tick=document.createElement('span');tick.textContent='✓';cap.append(tick);
    const position=document.createElement('span');position.className='position';node.append(value,svg,identity,cap,position);$('stage').append(node);state.figures.set(item.id,{node,svg,height,position,value:item.v,jump:null});
  }
  function buildCode(meta){
    $('code').replaceChildren();const keywords=new Set('def if elif else for while in return break and not from import True False None'.split(' '));
    for(let i=0;i<meta.code.length;i++){const row=document.createElement('div');row.className='code-row';row.dataset.line=i+1;const ln=document.createElement('span');ln.className='line-number';ln.textContent=i+1;const code=document.createElement('code');
      const text=meta.code[i],pattern=/\b(?:def|if|elif|else|for|while|in|return|break|and|not|from|import|True|False|None)\b|\b\d+\b|\b[A-Za-z_]+(?=\()/g;let end=0,m;
      while((m=pattern.exec(text))){code.append(document.createTextNode(text.slice(end,m.index)));const span=document.createElement('span');span.className=keywords.has(m[0])?'token-keyword':/^\d/.test(m[0])?'token-number':'token-function';span.textContent=m[0];code.append(span);end=m.index+m[0].length;}code.append(document.createTextNode(text.slice(end)));row.append(ln,code);$('code').append(row);
    }
  }
  function startRun(id,values,restoreStep=-1,target=state.target){
    const meta=E.algorithms.find(a=>a.id===id),limit=meta.maxLength||10;if(values.length>limit)throw Error(`${meta.name} supports up to ${limit} values. Shorten the array, then choose this algorithm.`);
    const bundle=E.build(id,values,target);stop();cancelEffects();state.id=id;state.target=target;state.category=meta.collection;state.values=values.slice();state.bundle=bundle;state.cursor=Math.max(-1,Math.min(bundle.events.length-1,restoreStep));state.wasDone=Boolean(snapshot().done);state.celebrated=state.wasDone;state.mode=state.wasDone?'Finished':state.cursor<0?'Ready':'Paused';state.figures.clear();$('stage').replaceChildren();bundle.initial.items.forEach(createFigure);
    const searchingNow=meta.collection==='searching';$('sorting-page').hidden=false;$('future-page').hidden=true;setNav(meta.collection);populateSelect(meta.collection);
    document.querySelector('.setup').dataset.search=String(searchingNow);$('target-label').hidden=!searchingNow;$('target-input').value=number(target);$('search-help').hidden=!searchingNow;$('apply-array').textContent=searchingNow?'Apply input':'Apply array';$('sort-search-input').hidden=!searchingNow;$('search-requirement').textContent=searchingNow?(meta.ordered?'Ascending input required. Sort input explicitly or enter an ascending array.':'Any input order. Linear and sentinel search return the first matching index.'):'';
    $('detail-label').textContent=searchingNow?'Match returned':'Equal values';$('array-label').textContent=searchingNow?'Array':'Working order';$('search-result').hidden=!searchingNow;$('sorting-legend').hidden=searchingNow;$('searching-legend').hidden=!searchingNow;$('exchanges').hidden=searchingNow;
    $('algorithm-title').textContent=meta.name;$('algorithm-family').textContent=meta.family;$('time-cost').textContent=meta.time;$('space-cost').textContent=meta.space;$('stability').textContent=searchingNow?meta.match:meta.stable?'Stable':'May reorder ties';$('algorithm-description').textContent=meta.description;$('algorithm-select').value=id;$('input-limit').textContent=`Up to ${limit} numbers · negatives, zero & decimals`;$('array-input').value=values.map(number).join(', ');$('input-error').hidden=true;
    for(const button of $('algorithm-menu').children)button.setAttribute('aria-current',String(button.dataset.algorithm===id));buildCode(meta);$('stack-details').open=['quick','merge','heap'].includes(id);render();
  }
  function drawGuides(s,placements,width,rowHeight,base){
    const stage=$('stage');for(const old of stage.querySelectorAll('.range,.level-label,.floor,.edges,.stage-empty,.search-pointer'))old.remove();
    if(!placements.length){const empty=document.createElement('span');empty.className='stage-empty';empty.textContent=isSearch()?(s.done?'Empty array · target not found.':'Empty array · step through the base case.'):s.done?'Empty array sorted.':'Empty array · add values or step through the base case.';stage.append(empty);return;}
    if(s.view.type==='search'){
      const slot=width/state.values.length,label=document.createElement('span');label.className='level-label';label.style.top='8px';label.textContent=s.done?(s.result<0?'No match':`Found at index ${s.result}`):`Search target ${number(state.target)}`;stage.append(label);
      if(!s.done&&s.view.lo<=s.view.hi){const range=document.createElement('span');range.className='range';range.dataset.active='true';range.style.cssText=`left:${s.view.lo*slot+4}px;width:${Math.max(1,(s.view.hi-s.view.lo+1)*slot-8)}px;top:33px;height:205px`;stage.append(range);}
      const labels=new Map();for(const [name,index]of Object.entries(s.view.pointers)){if(index<0||index>=state.values.length)continue;labels.set(index,[...(labels.get(index)||[]),name]);}
      for(const [index,names]of labels){const pointer=document.createElement('span');pointer.className='search-pointer';pointer.textContent=names.join(' · ');pointer.style.left=`${slot*(index+.5)}px`;pointer.style.top='255px';stage.append(pointer);}
      const floor=document.createElement('span');floor.className='floor';floor.style.top='230px';stage.append(floor);return;
    }
    const maxDepth=Math.max(...placements.map(p=>p.depth)),slot=width/state.values.length;
    function label(text,depth){const node=document.createElement('span');node.className='level-label';node.textContent=text;node.style.top=`${depth*rowHeight+8}px`;stage.append(node);}
    if(s.view.type==='recursive'){for(let d=0;d<=maxDepth;d++)label(s.done&&d===maxDepth?'Sorted result':`Depth ${d}`,d);}
    else if(s.view.type==='counting'){label('Input',0);label('Sorted output',1);}
    else if(s.view.type==='heap'){for(let d=0;d<maxDepth;d++)label(`Heap level ${d}`,d);if(Object.keys(s.fixed).length||s.done)label('Sorted output',maxDepth);}
    else label(s.done?'Sorted result':s.heldId!==null?'Key held above the ordered prefix':'Array',0);
    if(!s.done)for(const n of s.nodes.filter(n=>['active','pending','ready','merging'].includes(n.status)&&n.lo<=n.hi)){
      const node=document.createElement('span');node.className='range';node.dataset.active=String(n.status==='active'||n.status==='merging');node.style.left=`${n.lo*slot+4}px`;node.style.width=`${Math.max(1,(n.hi-n.lo+1)*slot-8)}px`;node.style.top=`${n.depth*rowHeight+29}px`;node.style.height=`${rowHeight-35}px`;stage.append(node);
    }
    if(s.view.type==='row'&&!s.done&&(s.view.prefix||s.view.flip)){
      const count=s.view.flip||s.view.prefix,node=document.createElement('span');node.className='range';node.style.left='4px';node.style.width=`${slot*count-8}px`;node.style.top='33px';node.style.height=`${rowHeight-44}px`;stage.append(node);
    }
    if(s.view.type==='heap'&&!s.done){
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('edges');svg.setAttribute('width',width);svg.setAttribute('height',(maxDepth+1)*rowHeight+16);
      for(let i=1;i<s.view.heapSize;i++){const child=placements[i],parent=placements[Math.floor((i-1)/2)];if(!child||!parent)continue;const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',parent.x);line.setAttribute('y1',parent.depth*rowHeight+base+155);line.setAttribute('x2',child.x);line.setAttribute('y2',child.depth*rowHeight+34);svg.append(line);}stage.append(svg);
    }
    if(s.done||s.view.type==='row'||s.view.type==='counting'){
      const floor=document.createElement('span');floor.className='floor';floor.style.top=`${maxDepth*rowHeight+base+160}px`;stage.append(floor);
    }
  }
  function renderScene(s){
    const stage=$('stage'),viewport=$('stage-viewport'),n=s.items.length,width=n<=6?viewport.clientWidth:Math.max(viewport.clientWidth,n*54);stage.style.width=`${width}px`;
    $('stage-hint').hidden=width<=viewport.clientWidth+2;$('stage-hint').textContent=`Scroll sideways to see all ${n} values.`;
    const slot=width/Math.max(1,n),tree=s.view.type==='heap',recursive=s.view.type==='recursive',counting=s.view.type==='counting',rowHeight=s.view.type==='search'?300:recursive||tree||counting?220:260,base=recursive||tree||counting?32:70;
    const heapDepth=Math.floor(Math.log2(Math.max(1,n))),deepest=Math.max(0,...Object.values(s.depths),...Object.values(s.fixed).map(x=>x.depth)),gather=s.done&&(recursive||tree),finalDepth=tree?heapDepth+1:deepest+1;
    const placements=s.items.map((item,index)=>{
      let depth=0,x=slot*(index+.5),displayIndex=index;
      if(gather)depth=finalDepth;
      else if(tree){if(s.fixed[item.id])depth=heapDepth+1;else{depth=Math.floor(Math.log2(index+1));x=width*((index-(2**depth-1))+.5)/2**depth;}}
      else if(recursive)depth=s.fixed[item.id]?.depth??s.depths[item.id]??0;
      else if(counting){const fixed=s.fixed[item.id];if(fixed){depth=1;displayIndex=fixed.index;x=slot*(displayIndex+.5);}}
      return {item,index:displayIndex,depth,x};
    });
    const maxDepth=Math.max(0,...placements.map(p=>p.depth));stage.style.height=`${Math.max(235,(maxDepth+1)*rowHeight+16)}px`;drawGuides(s,placements,width,rowHeight,base);
    const justFinished=Boolean(s.done)&&!state.wasDone,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    for(const p of placements){
      let f=state.figures.get(p.item.id);if(!Object.is(f.value,p.item.v)){f.node.remove();createFigure(p.item);f=state.figures.get(p.item.id);}const charWidth=Math.min(44,slot*.68),top=p.depth*rowHeight+base+100-f.height-(s.heldId===p.item.id?32:0),oldTop=justFinished?f.node.getBoundingClientRect().top-stage.getBoundingClientRect().top:null;
      if(justFinished&&gather)f.node.style.transition='none';f.node.style.left=`${p.x-charWidth/2}px`;f.node.style.top=`${top}px`;f.node.style.width=`${charWidth}px`;f.svg.style.width=`${charWidth}px`;f.svg.style.height=`${f.height+16}px`;
      if(justFinished&&gather&&!reduced){const from=oldTop-top;f.jump=f.node.animate([{transform:`translateY(${from}px)`,offset:0},{transform:`translateY(${from-28}px)`,offset:.16},{transform:'translateY(0)',offset:.76},{transform:'translateY(-9px)',offset:.87},{transform:'translateY(0)',offset:1}],{duration:1050,easing:'ease-in-out'});f.jump.onfinish=()=>{f.jump=null;f.node.style.transition='';};}
      const searchingNow=s.view.type==='search';f.node.dataset.eliminated=String(searchingNow&&s.view.eliminated.includes(p.index));f.node.dataset.found=String(searchingNow&&s.done&&s.result===p.index);f.node.dataset.sentinel=String(searchingNow&&s.view.sentinel===p.index);
      let badge=f.node.querySelector('.search-badge');if(searchingNow&&(s.view.sentinel===p.index||(s.done&&s.result===p.index))){if(!badge){badge=document.createElement('span');badge.className='search-badge';f.node.append(badge);}badge.textContent=s.view.sentinel===p.index?'Sentinel':'Found ✓';}else badge?.remove();
      const fixed=s.fixed[p.item.id];f.node.dataset.final=String(Boolean(fixed));f.node.dataset.pivot=String(!s.done&&(s.pivotId===p.item.id||fixed?.kind==='pivot'));f.node.dataset.target=String(!s.done&&(s.view.minimum===p.item.id||(searchingNow&&s.active.includes(p.item.id))));f.node.dataset.active=String(s.active.includes(p.item.id));f.node.dataset.held=String(s.heldId===p.item.id);f.node.dataset.index=p.index;f.node.dataset.depth=p.depth;f.position.textContent=`[${p.index}]`;
      f.node.setAttribute('aria-label',`${number(p.item.v)}, original character ${String.fromCharCode(65+p.item.id)}, index ${p.index}${fixed?', final position confirmed':''}${searchingNow&&s.done&&s.result===p.index?', target found':''}${searchingNow&&s.view.sentinel===p.index?', temporary sentinel':''}`);
    }
    stage.setAttribute('aria-label',isSearch()?`${state.bundle.meta.name}. Target ${number(state.target)}. ${s.done?(s.result<0?'Not found':`Found at index ${s.result}`):'Search in progress'}. Array ${s.items.map(x=>number(x.v)).join(', ')}.`:`${state.bundle.meta.name}. Working order ${s.items.map(x=>number(x.v)).join(', ')}. ${Object.keys(s.fixed).length} confirmed final positions.`);
    if(justFinished&&!state.celebrated&&(!isSearch()||s.result>=0)){state.celebrated=true;fireworks(maxDepth*rowHeight+28,Math.min(220,rowHeight-20),gather?1050:0);}
    state.wasDone=Boolean(s.done);
    const active=state.figures.get(s.active.at(-1))||state.figures.get(s.pivotId);
    if(active&&!s.done){const t=parseFloat(active.node.style.top);if(t<viewport.scrollTop||t+170>viewport.scrollTop+viewport.clientHeight)viewport.scrollTop=Math.max(0,t-45);}
    if(justFinished&&gather)viewport.scrollTo({top:finalDepth*rowHeight-15,behavior:reduced?'auto':'smooth'});
  }
  function renderInspector(s){
    const frame=s.frames.at(-1),previous=state.cursor>0?state.bundle.events[state.cursor-1]:null,oldFrame=previous?.frames.find(f=>f.id===frame?.id);
    const locals=frame?.locals||(isSearch()?{a:s.items.map(x=>x.v),key:state.target}:{a:s.items.map(x=>x.v)});$('scope').textContent=frame?frame.name:'Top level';$('variables').replaceChildren();
    for(const [name,value]of Object.entries(locals)){
      const current=watch(value),old=watch(oldFrame?.locals[name]),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.dataset.variable=name;dd.dataset.changed=String(state.cursor>=0&&current!==old);const display=document.createElement('span');display.className='current-value';display.textContent=current;dd.append(display);
      if(dd.dataset.changed==='true'){const p=document.createElement('span');p.className='previous-value';p.textContent=`was ${old}`;dd.append(p);}$('variables').append(dt,dd);
    }
    $('stack').replaceChildren();for(const f of s.frames){const li=document.createElement('li');li.textContent=`${f.name}(${Object.entries(f.locals).filter(([k])=>k!=='a').map(([k,v])=>`${k}=${watch(v)}`).join(', ')})`;$('stack').append(li);}
    if(!s.frames.length){const li=document.createElement('li');li.textContent=s.done?'All calls returned':'Top level';$('stack').append(li);}$('stack-size').textContent=`(${s.frames.length})`;
    for(const row of $('code').children){const current=Number(row.dataset.line)===s.line;row.dataset.current=String(current);if(current){row.setAttribute('aria-current','step');const pane=$('code');if(row.offsetTop<pane.scrollTop)pane.scrollTop=row.offsetTop;else if(row.offsetTop+row.offsetHeight>pane.scrollTop+pane.clientHeight)pane.scrollTop=row.offsetTop+row.offsetHeight-pane.clientHeight;}else row.removeAttribute('aria-current');}
    $('current-line').textContent=s.line?`line ${s.line}`:'';
  }
  function render(){
    if(!state.bundle||!['sorting','searching'].includes(state.category))return;const s=snapshot();renderScene(s);renderInspector(s);$('array-readout').textContent=`[${s.items.map(x=>number(x.v)).join(', ')}]`;$('comparisons').textContent=`${s.comparisons} comparisons`;$('exchanges').textContent=`${s.exchanges} ${state.id==='pancake'?'flips':'exchanges'}`;
    $('mode').textContent=s.done?'Finished':state.playing?'Running':state.mode;$('mode').dataset.state=s.done?'finished':state.playing?'running':'paused';$('step-count').textContent=`Step ${state.cursor+1} / ${state.bundle.events.length}`;$('operation').textContent=s.done&&!isSearch()?(state.values.length?'Sorted. Every final position is confirmed.':'Empty array sorted.'):s.text;
    if(isSearch()){$('search-result').dataset.state=s.done?(s.result>=0?'found':'missing'):'pending';$('search-result').textContent=`Target ${number(state.target)} · ${s.done?(s.result>=0?`Found at index ${s.result}`:'Not found · returned -1'):state.cursor<0?'Ready to search':'Searching…'}`;}
    $('back').disabled=state.cursor<0;$('next').disabled=Boolean(s.done);$('play').disabled=Boolean(s.done);$('play').textContent=state.playing?'Ⅱ Pause':'▶ Quick run';
    $('code-back').disabled=state.cursor<0;$('code-next').disabled=Boolean(s.done);$('code-play').disabled=Boolean(s.done);$('code-play').setAttribute('aria-label',state.playing?'Pause quick run':'Quick run, one algorithm step per second');$('code-play').dataset.tooltip=state.playing?'Pause: stop playback at the current step.':'Quick run: advance one algorithm step per second.';$('code-play').innerHTML=state.playing?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5l9 7-9 7zM12 5l9 7-9 7z"/></svg>';if(tooltipTarget===$('code-play'))tooltip.textContent=$('code-play').dataset.tooltip;
    $('counting-panel').hidden=s.view.type!=='counting';if(s.view.type==='counting'){$('counting-phase').textContent=s.view.phase||'Frequencies';$('buckets').replaceChildren();for(let i=0;i<s.view.keys.length;i++){const cell=document.createElement('div');cell.className='bucket';const key=document.createElement('span');key.className='bucket-key';key.textContent=number(s.view.keys[i]);const count=document.createElement('strong');count.textContent=s.view.counts[i]??0;cell.append(key,count);$('buckets').append(cell);}}
  }
  function advanceLine(direction){stop();cancelEffects();state.mode='Line by line';state.cursor=Math.max(-1,Math.min(state.bundle.events.length-1,state.cursor+direction));if(!snapshot().done)state.wasDone=false;render();save();}
  function tick(){let target=state.cursor+1;while(target<state.bundle.events.length&&!state.bundle.events[target].quick)target++;if(target>=state.bundle.events.length){stop();render();return;}state.cursor=target;if(snapshot().done){stop();render();save();return;}state.timer=setTimeout(tick,1000);render();save();}
  function reset(){startRun(state.id,state.values);save();}
  function pause(){stop();render();save();}
  function play(){if(state.playing){pause();return;}if(snapshot().done)return;state.playing=true;state.mode='Running';tick();}
  function error(message){$('input-error').textContent=message;$('input-error').hidden=false;}
  function closeMenus(){document.querySelectorAll('.sort-menu').forEach(menu=>menu.open=false);}
  function populateSelect(collection){const list=E.algorithms.filter(meta=>meta.collection===collection);if($('algorithm-select').dataset.collection===collection)return;$('algorithm-select').dataset.collection=collection;$('algorithm-select').replaceChildren();for(const meta of list){const option=document.createElement('option');option.value=meta.id;option.textContent=meta.name;$('algorithm-select').append(option);}}
  function setNav(name){document.querySelectorAll('[data-category],#sorting-nav').forEach(button=>{const current=(button.dataset.category||'sorting')===name;if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});}
  function select(id){try{startRun(id,state.values);save();closeMenus();}catch(e){$('algorithm-select').value=state.id;stop();render();error(e.message);}}
  function category(name){
    hideTooltip();stop();cancelEffects();closeMenus();
    if(['sorting','searching'].includes(name)){
      if(state.category===name){render();return;}const remembered=state.sessions[name];startRun(remembered?.id||(name==='sorting'?'bubble':'linear'),remembered?.values||state.values,remembered?.step??-1,remembered?.target??state.target);save();
    }else{state.category=name;$('sorting-page').hidden=true;$('future-page').hidden=false;setNav(name);$('future-title').textContent=name==='trees'?'Trees':'Graphs';$('future-copy').textContent=name==='trees'?'A separate collection for binary search trees, AVL trees, 2–3 trees and multiway search. Tree search, insertion, deletion and rotations will have their own animations.':'A separate collection for breadth-first search, depth-first search, paths and reachability. Graph animations will show visited vertices, frontier queues and stacks.';}
  }
  for(const meta of E.algorithms.filter(a=>a.collection==='sorting')){const button=document.createElement('button');button.type='button';button.dataset.algorithm=meta.id;button.textContent=meta.name;button.addEventListener('click',()=>select(meta.id));$('algorithm-menu').append(button);}
  const searchGroup=document.createElement('p');searchGroup.className='menu-group';searchGroup.textContent='Array searching';$('searching-algorithm-menu').append(searchGroup);
  for(const meta of searching.algorithms){const button=document.createElement('button');button.type='button';button.dataset.algorithm=meta.id;button.textContent=meta.name;button.addEventListener('click',()=>select(meta.id));$('searching-algorithm-menu').append(button);}
  const treeNames={bst:'Binary search tree',avl:'AVL tree','two-three':'2–3 tree',multiway:'Multiway search tree'};
  document.querySelectorAll('[data-tree]').forEach(button=>button.addEventListener('click',()=>{category('trees');$('future-title').textContent=treeNames[button.dataset.tree];$('future-copy').textContent=button.dataset.tree==='avl'?'Planned in Trees / Balanced search trees. AVL trees maintain a height balance at every node. This view will animate search, insertion, deletion and the rotations that restore balance.':button.dataset.tree==='two-three'?'Planned in Trees / Balanced search trees. A 2–3 tree holds one or two keys per node and keeps all leaves at the same level. This view will animate search, node splits and merges.':button.dataset.tree==='bst'?'Planned in Trees / Binary search trees. This view will animate left/right search decisions, insertion and the three deletion cases.':'Planned in Trees / Multiway search trees. This view will show comparisons within each node and the branch chosen between its keys.';}));
  function applyInput(sortFirst=false){try{const meta=state.bundle.meta,values=E.parse($('array-input').value,meta.maxLength||10),target=isSearch()?searching.parseTarget($('target-input').value):state.target;if(sortFirst)values.sort((a,b)=>a-b);startRun(state.id,values,-1,target);save();}catch(e){stop();render();error(e.message);}}
  $('algorithm-select').addEventListener('change',event=>select(event.target.value));$('apply-array').addEventListener('click',()=>applyInput());$('sort-search-input').addEventListener('click',()=>applyInput(true));for(const id of ['array-input','target-input'])$(id).addEventListener('keydown',e=>{if(e.key==='Enter')applyInput();});
  $('back').addEventListener('click',()=>advanceLine(-1));$('next').addEventListener('click',()=>advanceLine(1));$('play').addEventListener('click',play);$('restart').addEventListener('click',reset);
  $('code-back').addEventListener('click',()=>advanceLine(-1));$('code-next').addEventListener('click',()=>advanceLine(1));$('code-play').addEventListener('click',play);$('code-reset').addEventListener('click',reset);
  document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{const menu=b.closest('details'),wasOpen=menu?.open;category(b.dataset.category);if(menu)menu.open=wasOpen;}));$('return-sorting').addEventListener('click',()=>category('sorting'));document.querySelector('.brand').addEventListener('click',()=>category('sorting'));
  document.addEventListener('click',e=>{for(const menu of document.querySelectorAll('.sort-menu'))if(!menu.contains(e.target))menu.open=false;});
  document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,summary,[contenteditable=true]')||!['sorting','searching'].includes(state.category))return;if(e.key==='ArrowLeft'&&!$('back').disabled){e.preventDefault();advanceLine(-1);}if(e.key==='ArrowRight'&&!$('next').disabled){e.preventDefault();advanceLine(1);}if(e.code==='Space'&&(state.playing||!$('play').disabled)){e.preventDefault();if(state.playing)pause();else play();}if(e.key==='Escape')closeMenus();});
  const tooltip=$('control-tooltip');let tooltipTimer=null,tooltipTarget=null;
  function hideTooltip(){clearTimeout(tooltipTimer);tooltipTimer=null;tooltip.hidden=true;tooltipTarget?.removeAttribute('aria-describedby');tooltipTarget=null;}
  function showTooltip(button){
    hideTooltip();tooltipTarget=button;tooltip.textContent=button.dataset.tooltip;tooltip.hidden=false;button.setAttribute('aria-describedby',tooltip.id);
    const box=button.getBoundingClientRect(),tip=tooltip.getBoundingClientRect();
    tooltip.style.left=`${Math.max(8,Math.min(innerWidth-tip.width-8,box.left+box.width/2-tip.width/2))}px`;
    tooltip.style.top=`${box.bottom+tip.height+16<=innerHeight?box.bottom+8:Math.max(8,box.top-tip.height-8)}px`;
    tooltipTimer=setTimeout(hideTooltip,3000);
  }
  for(const button of document.querySelectorAll('.code-controls button')){
    button.addEventListener('pointerenter',()=>showTooltip(button));button.addEventListener('pointerleave',hideTooltip);
    button.addEventListener('focus',()=>showTooltip(button));button.addEventListener('blur',hideTooltip);button.addEventListener('pointerdown',hideTooltip);
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideTooltip();closeMenus();}});window.addEventListener('scroll',hideTooltip,true);window.addEventListener('resize',hideTooltip);
  let restored=false;try{const saved=JSON.parse(localStorage.getItem('algo-with-minions-v1'),(_key,value)=>value==='-0'?-0:value);if(saved&&E.algorithms.some(a=>a.id===saved.algorithm)&&Array.isArray(saved.array)&&saved.array.every(Number.isFinite)){state.sessions=saved.sessions&&typeof saved.sessions==='object'?saved.sessions:{};startRun(saved.algorithm,saved.array,saved.step,Number.isFinite(saved.target)?saved.target:3);restored=true;}}catch{}if(!restored)startRun(state.id,state.values);
  let lastWidth=0;const resize=new ResizeObserver(entries=>{const width=Math.round(entries[0].contentRect.width);if(width===lastWidth)return;lastWidth=width;render();});resize.observe($('stage-viewport'));
  window.SortingStudio={snapshot:()=>E.clone(snapshot()),history:()=>({cursor:state.cursor,length:state.bundle.events.length,algorithm:state.id}),restart:()=>startRun(state.id,state.values)};
})();
