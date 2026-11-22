(function(global){
  'use strict';
  const NS='http://www.w3.org/2000/svg',palette=['#80bdff','#e6a5e9','#67df9b','#ffb37e','#b9adff','#f9ce45'];
  function el(name,attrs={},text){const node=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;return node;}
  const value=v=>v===Infinity?'∞':v===-Infinity?'−∞':v===null||v===undefined?'—':typeof v==='boolean'?(v?'1':'0'):String(v);
  class GraphRenderer{
    constructor(stage,viewport){this.stage=stage;this.viewport=viewport;this.zoom=1;this.groups=new Map();this.marker=null;}
    clear(){this.groups.clear();this.svg=null;this.viewport.classList.remove('graph-viewport');this.stage.classList.remove('graph-stage');}
    cancel(){for(const node of this.groups.values())node.getAnimations().forEach(a=>a.cancel());}
    setZoom(delta){this.zoom=Math.max(.8,Math.min(1.6,Math.round((this.zoom+delta)*10)/10));this.render(this.last);}
    fit(){this.zoom=1;this.render(this.last);this.viewport.scrollLeft=Math.max(0,(this.stage.clientWidth-this.viewport.clientWidth)/2);this.viewport.scrollTop=0;}
    render(s){
      if(!s)return;this.last=s;const v=s.view,n=v.vertices.length;this.stage.classList.add('graph-stage');this.viewport.classList.add('graph-viewport');
      const width=Math.max(this.viewport.clientWidth,n>8?650:540)*this.zoom,height=(n>8?560:470)*this.zoom;
      this.stage.style.width=width+'px';this.stage.style.height=height+'px';document.getElementById('graph-zoom-level').textContent=Math.round(this.zoom*100)+'%';
      const hint=document.getElementById('stage-hint');hint.hidden=width<=this.viewport.clientWidth+2;hint.textContent='Scroll sideways to explore the graph. Vertex order follows the input.';
      const fresh=!this.svg;if(!this.svg){this.stage.replaceChildren();this.svg=el('svg',{class:'graph-svg',role:'presentation'});this.stage.append(this.svg);this.edges=el('g',{class:'graph-links'});this.vertices=el('g',{class:'graph-vertices'});this.svg.append(this.edges,this.vertices);}
      this.svg.setAttribute('width',width);this.svg.setAttribute('height',height);this.edges.replaceChildren();
      const defs=el('defs');for(const[color,id]of [['#7188a1','normal'],['#80bdff','active'],['#67df9b','selected'],['#ffb37e','residual'],['#f9ce45','path'],['#ff8c96','conflict']]){const marker=el('marker',{id:'graph-arrow-'+id,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse',markerUnits:'userSpaceOnUse'});marker.append(el('path',{d:'M0 0L10 5L0 10Z',fill:color}));defs.append(marker);}this.edges.append(defs);
      const cx=width/2,cy=height/2,rx=Math.min(width/2-65,260*this.zoom),ry=height/2-70*this.zoom;
      const points=Array.from({length:n},(_,i)=>{const angle=-Math.PI/2+2*Math.PI*i/Math.max(1,n);return {x:n===1?cx:cx+rx*Math.cos(angle),y:n===1?cy:cy+ry*Math.sin(angle)};});
      const key=(u,w)=>v.directed?u+'>'+w:Math.min(u,w)+'>'+Math.max(u,w),chosen=new Set(v.chosen.map(([u,w])=>key(u,w))),treeEdges=new Set(v.parent.map((p,i)=>p===null||p===undefined?null:key(p,i)).filter(Boolean));
      const pathEdges=new Set();const path=v.algorithm==='tsp'&&s.done?v.bestPath:v.path;for(let i=1;i<path.length;i++)pathEdges.add(key(path[i-1],path[i]));
      if(v.algorithm==='dijkstra'&&s.done){let u=v.sink;const seen=new Set();while(v.parent[u]!==null&&v.parent[u]!==undefined&&!seen.has(u)){seen.add(u);pathEdges.add(key(v.parent[u],u));u=v.parent[u];}}
      const edgeMap=new Map(v.edges.map(([u,w,c])=>[u+'>'+w,c])),draws=v.edges.map(([u,w,weight])=>({u,w,weight,extra:false}));
      if(['ford-fulkerson','edmonds-karp'].includes(v.algorithm)&&v.matrix)for(let u=0;u<n;u++)for(let w=0;w<n;w++)if(u!==w&&v.matrix[u]?.[w]>0&&!edgeMap.has(u+'>'+w))draws.push({u,w,weight:v.matrix[u][w],extra:true});
      for(const e of draws){
        const a=points[e.u],b=points[e.w];if(!a||!b)continue;const edgeId=key(e.u,e.w),active=v.activeEdges.includes(edgeId),onPath=pathEdges.has(edgeId),selected=chosen.has(edgeId)||(['bfs','dfs'].includes(v.algorithm)&&treeEdges.has(edgeId))||(v.algorithm==='dijkstra'&&v.parent.some((p,i)=>p!==null&&p!==undefined&&v.settled[i]&&key(p,i)===edgeId));
        const tentative=v.algorithm==='dijkstra'&&treeEdges.has(edgeId)&&!selected;
        const conflict=['greedy-colouring','local-recolouring'].includes(v.algorithm)&&v.colours[e.u]!==null&&v.colours[e.u]!==undefined&&v.colours[e.u]===v.colours[e.w];
        const cut=s.done&&['ford-fulkerson','edmonds-karp'].includes(v.algorithm)&&v.reachable[e.u]&&!v.reachable[e.w]&&!e.extra;
        const tone=active?'active':onPath?'path':conflict?'conflict':cut?'selected':e.extra?'residual':selected?'selected':tentative?'active':'normal',color={active:'#80bdff',path:'#f9ce45',conflict:'#ff8c96',selected:'#67df9b',residual:'#ffb37e',normal:'#7188a1'}[tone];
        const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length,offset=36*this.zoom;
        const reverse=v.directed&&(edgeMap.has(e.w+'>'+e.u)||draws.some(x=>x.extra&&x.u===e.w&&x.w===e.u)),curve=reverse?24*this.zoom:0;
        let d,mx=(a.x+b.x)/2-uy*curve*.5,my=(a.y+b.y)/2+ux*curve*.5;
        if(e.u===e.w){d=`M${a.x-25} ${a.y-24}C${a.x-82} ${a.y-100} ${a.x+82} ${a.y-100} ${a.x+25} ${a.y-24}`;mx=a.x;my=a.y-82;}
        else d=`M${a.x+ux*offset} ${a.y+uy*offset}Q${(a.x+b.x)/2-uy*curve} ${(a.y+b.y)/2+ux*curve} ${b.x-ux*offset} ${b.y-uy*offset}`;
        const group=el('g',{'data-edge':e.u+'>'+e.w,'data-residual':String(e.extra),'data-selected':String(selected),'data-tentative':String(tentative),'data-active':String(active),class:'graph-edge'});const line=el('path',{d,fill:'none',stroke:color,'stroke-width':active||selected||onPath||conflict?3:1.6,'stroke-dasharray':e.extra?'6 5':tentative?'3 4':'none'});if(v.directed)line.setAttribute('marker-end','url(#graph-arrow-'+tone+')');group.append(line);
        const flow=['ford-fulkerson','edmonds-karp'].includes(v.algorithm);let label=flow?(e.extra?'r '+value(v.matrix?.[e.u]?.[e.w]):Math.max(0,v.flow[e.u]?.[e.w]||0)+'/'+value(e.weight)):['bfs','dfs','topological','warshall','greedy-colouring','local-recolouring'].includes(v.algorithm)?'':value(e.weight);
        if(label){const text=el('text',{x:mx,y:my-3,fill:color,'text-anchor':'middle',class:'graph-edge-label'},label);text.append(el('title',{},flow?'Forward flow / capacity; dashed r labels show residual capacity.':'Weight '+value(e.weight)));group.append(text);}if(active&&this.stamp!==s.comparisons&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const token=el('circle',{r:4,fill:'#80bdff'}),motion=el('animateMotion',{dur:'.44s',path:d,fill:'freeze'});token.append(motion);group.append(token);}this.edges.append(group);
      }
      this.stamp=s.comparisons;
      for(let i=0;i<n;i++){
        let group=this.groups.get(i);if(!group){group=el('g',{'data-vertex':i,class:'graph-vertex'});group.append(el('circle',{r:33,class:'graph-node-ring'}));const portrait=el('g',{transform:'translate(-15 -23) scale(.65)',class:'graph-portrait'});portrait.innerHTML='<rect x="7" y="0" width="32" height="57" rx="16" fill="#f9ce45"/><path d="M7 23H39" stroke="#17222f" stroke-width="5"/><circle cx="23" cy="23" r="11" fill="#c5d0da"/><circle cx="23" cy="23" r="8" fill="#fff"/><circle cx="24" cy="23" r="4" fill="#17222f"/><path d="M17 40Q23 45 29 40" fill="none" stroke="#17222f" stroke-width="2"/><path d="M7 45H39V62Q23 75 7 62Z" fill="#338bdf"/>';group.append(portrait,el('text',{y:-43,'text-anchor':'middle',class:'graph-vertex-name'}),el('text',{y:53,'text-anchor':'middle',class:'graph-vertex-state'}));this.vertices.append(group);this.groups.set(i,group);}
        const p=points[i];group.style.transform=`translate(${p.x}px, ${p.y}px)`;group.dataset.active=String(v.activeVertices.includes(i));group.dataset.visited=String(Boolean(v.visited[i])||v.output.includes(i));group.dataset.settled=String(Boolean(v.settled[i])||v.finished.includes(i));group.dataset.queued=String(v.queue.includes(i));group.dataset.removed=String(v.algorithm==='topological'&&v.output.includes(i));
        const colour=v.colours[i];group.style.setProperty('--vertex-colour',colour!==null&&colour!==undefined?(palette[colour]||'hsl('+Math.round(colour*137.5%360)+' 70% 70%)'):'#67df9b');group.dataset.coloured=String(colour!==null&&colour!==undefined);
        group.querySelector('.graph-vertex-name').textContent=v.vertices[i];let status='';
        if(['dijkstra','prim'].includes(v.algorithm)&&v.distance.length)status=(v.algorithm==='prim'?'key ':'d ')+value(v.distance[i]);
        else if(v.algorithm==='topological'&&v.indegree.length)status='in '+value(v.indegree[i]);
        else if(['greedy-colouring','local-recolouring'].includes(v.algorithm))status=colour===null||colour===undefined?'uncoloured':'colour '+(colour+1);
        else if(v.algorithm==='kruskal'&&v.parent[i]!==undefined){let root=i,seen=new Set();while(v.parent[root]!==root&&v.parent[root]!==undefined&&!seen.has(root)){seen.add(root);root=v.parent[root];}status='set '+v.vertices[root];}
        else if(v.algorithm==='bfs'&&v.distance.length)status=v.distance[i]===null?'unseen':'level '+value(v.distance[i]);
        else if(v.algorithm==='dfs')status=v.finished.includes(i)?'returned':v.stack.includes(i)?'in stack':v.visited[i]?'visited':'';
        else if(['ford-fulkerson','edmonds-karp'].includes(v.algorithm))status=i===v.source?'source':i===v.sink?'sink':s.done?(v.reachable[i]?'source side':'sink side'):'';
        else if(v.algorithm==='tsp')status=path.includes(i)?'in path':'';
        if(['warshall','floyd-warshall'].includes(v.algorithm)&&i===v.k)status='via k';group.querySelector('.graph-vertex-state').textContent=status;
        group.setAttribute('aria-label',v.vertices[i]+(status?', '+status:''));
      }
      for(const[i,node]of this.groups)if(i>=n){node.remove();this.groups.delete(i);}
      if(!n){this.edges.append(el('text',{x:width/2,y:height/2,'text-anchor':'middle',class:'graph-empty'},'Empty graph · step through the base case.'));}
      this.stage.setAttribute('aria-label',v.vertices.length+' vertices; '+v.edges.length+' '+(v.directed?'directed':'undirected')+' edges. '+s.text);
      if(fresh&&width>this.viewport.clientWidth)this.viewport.scrollLeft=Math.max(0,(points[v.source]?.x??width/2)-this.viewport.clientWidth/2);
      if(v.activeVertices.length&&width>this.viewport.clientWidth){const p=points[v.activeVertices[0]];if(p&&(p.x-60<this.viewport.scrollLeft||p.x+60>this.viewport.scrollLeft+this.viewport.clientWidth))this.viewport.scrollLeft=Math.max(0,p.x-this.viewport.clientWidth/2);}
      this.renderData(s);
    }
    renderData(s){
      const v=s.view,labels=v.vertices,host=document.getElementById('graph-data');host.replaceChildren();
      const name=i=>labels[i]??'—';function strip(title,values,format=name){const section=document.createElement('div');section.className='graph-strip';const h=document.createElement('strong');h.textContent=title;section.append(h);const list=document.createElement('span');list.textContent=values.length?values.map(format).join(' → '):'empty';section.append(list);host.append(section);}
      if(['bfs','topological'].includes(v.algorithm)||['ford-fulkerson','edmonds-karp'].includes(v.algorithm))strip('Queue · front first',v.queue);
      if(['dfs','tsp'].includes(v.algorithm)||v.algorithm==='ford-fulkerson')strip('Call path · top last',v.stack);
      if(['bfs','dfs','topological'].includes(v.algorithm))strip('Output',v.output);
      if(v.algorithm==='tsp'){strip('Current path',v.path);strip('Best tour · '+value(v.bestCost),v.bestPath);}
      if(['prim','kruskal'].includes(v.algorithm)){strip('Accepted edges · weight '+value(v.total),v.chosen,e=>name(e[0])+'–'+name(e[1]));}
      if(['ford-fulkerson','edmonds-karp'].includes(v.algorithm)){strip((s.done?'Last augmenting path':'Augmenting path')+' · Δ '+value(v.delta),v.path);strip('Net flow', [v.value],value);}
      if(v.algorithm==='local-recolouring')strip('Conflicting edges',v.conflicts===null?[]:[v.conflicts],value);
      const matrix=v.matrix,distances=['bfs','dijkstra','prim'].includes(v.algorithm)?v.distance:null;
      if(matrix||distances?.length){const wrap=document.createElement('div');wrap.className='graph-table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',matrix?'Algorithm matrix; scroll sideways':'Vertex values; scroll sideways');const table=document.createElement('table');table.className='graph-table';const caption=document.createElement('caption');caption.textContent=matrix?(v.algorithm==='warshall'?'Reachability · 1 = reachable':v.algorithm==='floyd-warshall'?'All-pairs distance · ∞ = unreachable':'Residual capacity · includes reverse edges'):(v.algorithm==='prim'?'Cheapest connecting edge':v.algorithm==='dijkstra'?'Distance from '+name(v.source):'Distance from each traversal root');table.append(caption);const header=document.createElement('tr');for(const text of ['From / to',...labels]){const th=document.createElement('th');th.scope='col';th.textContent=text;header.append(th);}const thead=document.createElement('thead');thead.append(header);table.append(thead);const tbody=document.createElement('tbody');
        const rows=matrix||[distances];for(let i=0;i<(matrix?labels.length:1);i++){const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=matrix?name(i):'Value';tr.append(th);for(let j=0;j<labels.length;j++){const td=document.createElement('td');let val=rows[i]?.[j];if(s.done&&v.algorithm==='floyd-warshall'&&s.result[1].some(k=>Number.isFinite(matrix[i]?.[k])&&Number.isFinite(matrix[k]?.[j])))val='undefined';td.textContent=value(val);td.dataset.changed=String(v.changedCells.includes(i+','+j));td.dataset.current=String(i===v.i&&j===v.j);td.dataset.via=String(matrix&&(i===v.k||j===v.k));tr.append(td);}tbody.append(tr);}table.append(tbody);wrap.append(table);host.append(wrap);}
    }
  }
  global.GraphRenderer=GraphRenderer;
})(typeof window!=='undefined'?window:globalThis);
