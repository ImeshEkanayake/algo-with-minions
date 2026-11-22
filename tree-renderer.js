(function(global){
  'use strict';
  const NS='http://www.w3.org/2000/svg',format=v=>Object.is(v,-0)?'-0':String(v);
  const short=v=>{const s=format(v);return s.length<=9?s:v.toExponential(2).replace('e+','e');};
  const escape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  class Renderer{
    constructor(stage,viewport){this.stage=stage;this.viewport=viewport;this.groupPositions=new Map();this.keyPositions=new Map();this.frame=null;this.zoom=1;this.lastSnapshot=null;this.maxHeight=0;this.svg=null;}
    clear(){cancelAnimationFrame(this.frame);this.frame=null;this.groupPositions.clear();this.keyPositions.clear();this.svg=null;this.maxHeight=0;}
    cancel(){cancelAnimationFrame(this.frame);this.frame=null;}
    fit(){this.zoom=1;this.maxHeight=0;this.groupPositions.clear();this.keyPositions.clear();if(this.lastSnapshot)this.render(this.lastSnapshot,false);this.viewport.scrollTop=0;this.viewport.scrollLeft=0;}
    setZoom(change){this.zoom=Math.max(.8,Math.min(1.6,Math.round((this.zoom+change)*10)/10));if(this.lastSnapshot)this.render(this.lastSnapshot,false);}
    layout(view){
      const nodes=view.graph,byId=new Map(nodes.map(n=>[n.id,n])),indegree=new Map(nodes.map(n=>[n.id,0])),depth=new Map(nodes.map(n=>[n.id,0]));
      for(const n of nodes)for(const child of n.children.filter(Boolean))indegree.set(child,(indegree.get(child)||0)+1);
      const roots=nodes.filter(n=>!indegree.get(n.id)),queue=roots.slice(),pending=new Map(indegree);
      while(queue.length){const n=queue.shift();for(const child of n.children.filter(Boolean)){depth.set(child,Math.max(depth.get(child)||0,(depth.get(n.id)||0)+1));pending.set(child,pending.get(child)-1);if(!pending.get(child))queue.push(byId.get(child));}}
      const avl=view.family==='avl',multi=['two-three','multiway'].includes(view.family),groups=nodes.map(n=>{
        const cellWidths=n.keys.map(k=>Math.max(48,short(k.v).length*8.4/this.zoom+12)),w=multi?Math.max(58,cellWidths.reduce((a,b)=>a+b,0)+14):Math.max(avl?78:58,cellWidths[0]||48);
        const caption=n.id+(n.id===view.root?' · root':view.heldNodes.includes(n.id)?' · held':'');return {...n,w:Math.max(w,caption.length*7.2/this.zoom+12),h:avl?120:108,cellWidths,depth:depth.get(n.id)||0,x:0,y:132+(depth.get(n.id)||0)*(avl?154:142)};
      }),groupMap=new Map(groups.map(n=>[n.id,n]));
      let width=this.viewport.clientWidth/this.zoom;
      for(const d of new Set(groups.map(g=>g.depth))){const row=groups.filter(g=>g.depth===d);width=Math.max(width,48+row.reduce((sum,g)=>sum+g.w,0)+Math.max(0,row.length-1)*14);}
      width=Math.max(width,220);
      const placed=new Set();function put(node,lo,hi){if(!node||placed.has(node.id))return;placed.add(node.id);const g=groupMap.get(node.id);g.x=(lo+hi)/2;const count=node.children.length;node.children.forEach((id,i)=>put(byId.get(id),lo+(hi-lo)*i/count,lo+(hi-lo)*(i+1)/count));}
      roots.forEach((node,i)=>put(node,24+(width-48)*i/Math.max(1,roots.length),24+(width-48)*(i+1)/Math.max(1,roots.length)));
      for(const d of new Set(groups.map(g=>g.depth))){
        const row=groups.filter(g=>g.depth===d).sort((a,b)=>a.x-b.x);for(let i=1;i<row.length;i++)row[i].x=Math.max(row[i].x,row[i-1].x+(row[i-1].w+row[i].w)/2+14);
        const overflow=row.at(-1).x+row.at(-1).w/2-(width-16);if(overflow>0)row.forEach(g=>g.x-=overflow);
        const under=16-(row[0].x-row[0].w/2);if(under>0)row.forEach(g=>g.x+=under);
      }
      const keys=new Map(),keyGroups=new Map();
      for(const g of groups){
        let left=g.x-g.cellWidths.reduce((a,b)=>a+b,0)/2;
        for(let i=0;i<g.keys.length;i++){const item=g.keys[i],p={id:item.id,v:item.v,x:left+g.cellWidths[i]/2,y:g.y,group:g.id,opacity:1};keys.set(item.id,p);keyGroups.set(item.id,g.id);left+=g.cellWidths[i];}
      }
      view.heldKeys.forEach((item,i)=>keys.set(item.id,{...item,x:48+i*68,y:39,group:null,held:true,opacity:1}));
      const height=Math.max(300,...groups.map(g=>g.y+(avl?100:90)));
      return {groups:groupMap,keys,width,height,multi,avl,keyGroups};
    }
    render(snapshot,animate=true){
      this.lastSnapshot=snapshot;const view=snapshot.view;if(view.type!=='tree')return;
      if(!this.svg||!this.stage.contains(this.svg)){this.stage.replaceChildren();this.svg=document.createElementNS(NS,'svg');this.svg.id='tree-scene-svg';this.svg.classList.add('tree-canvas');this.svg.setAttribute('role','img');this.stage.append(this.svg);}
      const target=this.layout(view),oldGroups=new Map(this.groupPositions),oldKeys=new Map(this.keyPositions),svg=this.svg,scale=this.zoom;
      this.maxHeight=Math.max(this.maxHeight,target.height);
      svg.style.setProperty('--tree-label-scale',String(1/scale));svg.setAttribute('viewBox','0 0 '+target.width+' '+this.maxHeight);svg.setAttribute('width',target.width*scale);svg.setAttribute('height',this.maxHeight*scale);
      this.stage.style.width=target.width*scale+'px';this.stage.style.height=this.maxHeight*scale+'px';
      svg.setAttribute('aria-label',snapshot.text+' Root '+(view.root||'None')+'. Reachable keys '+view.inorder.map(format).join(', ')+'.');
      cancelAnimationFrame(this.frame);const duration=animate&&oldGroups.size&&!matchMedia('(prefers-reduced-motion: reduce)').matches?440:0,start=performance.now();
      const renderFrame=now=>{
        const t=duration?Math.min(1,(now-start)/duration):1,eased=1-Math.pow(1-t,3),groups=new Map(),keys=new Map();
        for(const [id,g]of target.groups){const old=oldGroups.get(id)||{...g,y:g.y-18,opacity:0};groups.set(id,{...g,x:old.x+(g.x-old.x)*eased,y:old.y+(g.y-old.y)*eased,w:old.w+(g.w-old.w)*eased,opacity:(old.opacity??1)+(1-(old.opacity??1))*eased});}
        for(const [id,k]of target.keys){const old=oldKeys.get(id)||{...k,y:k.y-18,opacity:0};keys.set(id,{...k,x:old.x+(k.x-old.x)*eased,y:old.y+(k.y-old.y)*eased,opacity:(old.opacity??1)+(1-(old.opacity??1))*eased});}
        if(t<1){for(const [id,g]of oldGroups)if(!target.groups.has(id))groups.set(id,{...g,opacity:(g.opacity??1)*(1-eased),leaving:true});for(const [id,k]of oldKeys)if(!target.keys.has(id))keys.set(id,{...k,opacity:(k.opacity??1)*(1-eased),leaving:true});}
        let html='';
        if(!view.graph.length&&!view.heldKeys.length)html+='<text x="'+target.width/2+'" y="125" text-anchor="middle" class="tree-empty">Empty tree</text>';
        if(view.heldKeys.length)html+='<text x="16" y="14" class="tree-small">Held keys</text>';
        for(const n of view.graph)for(const childId of n.children.filter(Boolean)){
          const a=groups.get(n.id),b=groups.get(childId);if(!a||!b)continue;const changed=view.changedEdges.includes(n.id+'>'+childId),onPath=view.visited.includes(n.id)&&view.visited.includes(childId);
          html+='<line data-parent="'+n.id+'" data-child="'+childId+'" x1="'+a.x+'" y1="'+(a.y+(target.avl?70:55))+'" x2="'+b.x+'" y2="'+(b.y-53)+'" class="tree-edge'+(changed?' rewired':onPath?' visited':'')+'"/>';
        }
        for(const [id,g]of groups){
          const held=view.heldNodes.includes(id),active=view.activeNodes.includes(id),overfull=target.multi&&g.keys.length>=view.order;
          html+='<g data-tree-node="'+id+'" data-root="'+(id===view.root)+'" data-held="'+held+'" data-depth="'+g.depth+'" opacity="'+(g.opacity??1)+'" transform="translate('+g.x+' '+g.y+')">';
          html+='<rect class="tree-node-box'+(active?' active':'')+(held?' held':'')+(overfull?' overfull':'')+'" x="'+(-g.w/2)+'" y="-54" width="'+g.w+'" height="'+(target.avl?126:111)+'" rx="'+(target.multi?10:22)+'"/>';
          if(!g.keys.length)html+='<text text-anchor="middle" y="3" class="tree-key">∅</text>';
          html+='<text text-anchor="middle" y="'+(target.avl?62:47)+'" class="tree-node-ref">'+id+(id===view.root?' · root':held?' · held':'')+'</text>';
          if(target.avl)html+='<text text-anchor="middle" y="43" class="tree-meta'+(Math.abs(g.balance)>1?' unbalanced':'')+'">h'+g.height+' · b'+(g.balance>0?'+':'')+g.balance+'</text>';
          html+='</g>';
        }
        for(const [id,k]of keys){
          const found=snapshot.done&&snapshot.result?.operation==='search'&&snapshot.result.found&&snapshot.result.key===k.v,visitedOutput=view.output.includes(k.v);
          html+='<g data-tree-key="'+id+'" data-value="'+escape(format(k.v))+'" data-found="'+found+'" opacity="'+(k.opacity??1)+'" transform="translate('+k.x+' '+k.y+')"><title>'+escape(format(k.v))+' · character '+String.fromCharCode(65+id)+'</title>';
          if(!found&&!visitedOutput&&view.activeKeys.includes(id))html+='<rect class="tree-current-key" x="-21" y="-49" width="42" height="79" rx="15"/>';
          if(found||visitedOutput)html+='<rect class="tree-confirmed" x="-21" y="-49" width="42" height="79" rx="15"/>';
          html+='<text class="tree-key" text-anchor="middle" y="-34">'+escape(short(k.v))+'</text>';
          html+='<rect x="-15" y="-23" width="30" height="49" rx="15" fill="#f9ce45"/><path d="M-15 8H15V15Q15 26 0 26Q-15 26-15 15Z" fill="#338bdf"/><path d="M-15 -7H15" stroke="#17222f" stroke-width="4"/><circle cy="-7" r="9" fill="#c5d0da"/><circle cy="-7" r="6" fill="#fff"/><circle cy="-6" r="3" fill="#17222f"/><path d="M-5 4Q0 9 5 4" fill="none" stroke="#17222f" stroke-width="1.5"/><text y="21" text-anchor="middle" class="tree-identity">'+String.fromCharCode(65+id)+'</text>';
          if(k.held)html+='<text class="tree-held-caption" text-anchor="middle" y="44">held</text>';
          html+='</g>';
        }
        svg.innerHTML=html;this.groupPositions=groups;this.keyPositions=keys;if(t<1)this.frame=requestAnimationFrame(renderFrame);else{this.frame=null;if(snapshot.done){this.maxHeight=target.height;svg.setAttribute('viewBox','0 0 '+target.width+' '+this.maxHeight);svg.setAttribute('height',this.maxHeight*scale);this.stage.style.height=this.maxHeight*scale+'px';this.viewport.scrollTop=0;const root=target.groups.get(view.root);this.viewport.scrollLeft=root?Math.max(0,root.x*scale-this.viewport.clientWidth/2):0;document.getElementById('stage-hint').hidden=target.width*scale<=this.viewport.clientWidth+2&&this.maxHeight*scale<=this.viewport.clientHeight+2;}}
      };renderFrame(start);
      const overflow=target.width*scale>this.viewport.clientWidth+2||this.maxHeight*scale>this.viewport.clientHeight+2;
      const hint=document.getElementById('stage-hint');hint.hidden=!overflow;hint.textContent='Pan inside the tree to explore. The view follows active nodes.';
      const activeKey=target.keys.get(view.activeKeys.at(-1)),active=activeKey||target.groups.get(view.activeNodes.at(-1));
      if(active&&snapshot.line!==null){const x=active.x*scale,y=active.y*scale,margin=(activeKey?55:80)*scale;
        if(x-margin<this.viewport.scrollLeft)this.viewport.scrollLeft=Math.max(0,x-margin);
        else if(x+margin>this.viewport.scrollLeft+this.viewport.clientWidth)this.viewport.scrollLeft=x+margin-this.viewport.clientWidth;
        if(y-margin<this.viewport.scrollTop)this.viewport.scrollTop=Math.max(0,y-margin);
        else if(y+margin>this.viewport.scrollTop+this.viewport.clientHeight)this.viewport.scrollTop=y+margin-this.viewport.clientHeight;
      }
      document.getElementById('tree-zoom-level').textContent=Math.round(this.zoom*100)+'%';
    }
  }
  global.TreeRenderer=Renderer;
})(typeof window!=='undefined'?window:globalThis);
