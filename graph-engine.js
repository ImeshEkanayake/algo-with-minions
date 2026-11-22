(function(global){
  'use strict';
  const clone=v=>Array.isArray(v)?v.map(clone):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)])):v;
  const definitions=[
    ['bfs','Breadth-first search','Traversal · Week 4','O(V + E)','O(V)','Explore one level at a time with a queue. After the selected start, restart at each unvisited vertex to show the full traversal forest.','traversal'],
    ['dfs','Depth-first search','Traversal · Week 4','O(V + E)','O(V)','Follow a branch recursively, then backtrack. The live call stack shows the current path; disconnected vertices start new trees.','traversal'],
    ['topological','Source-removal topological sort','Ordering · Week 5','O(V + E)','O(V)','Remove zero-indegree vertices using a queue. If vertices remain but the queue is empty, a directed cycle prevents a topological ordering.','ordering'],
    ['prim','Prim’s minimum spanning forest','Spanning trees · Week 7','O(V²)','O(V)','Grow a minimum spanning tree using the cheapest connecting edge. A disconnected graph produces a minimum spanning forest. This version scans keys rather than using a heap.','spanning'],
    ['kruskal','Kruskal’s minimum spanning forest','Spanning trees · Week 7','O(V + E log E)','O(V + E)','Consider edges in ascending weight order and join different components using union by rank. Rejected edges would create a cycle.','spanning'],
    ['dijkstra','Dijkstra’s shortest paths','Shortest paths · Week 7','O(V²)','O(V)','Settle the nearest vertex and relax outgoing edges. Weights must be non-negative; zero and decimal weights are supported. This version scans distances rather than using a heap.','paths'],
    ['warshall','Warshall transitive closure','Reachability · Week 8','O(V³)','O(V²)','Admit one intermediate vertex k at a time. The matrix includes zero-length paths from every vertex to itself; weights are ignored.','matrix'],
    ['floyd-warshall','Floyd–Warshall shortest paths','Shortest paths · Week 8 extension','O(V³)','O(V²)','Update all-pairs distances through intermediate vertex k. Negative edges are allowed. Negative cycles are reported, with affected distances marked undefined.','matrix'],
    ['ford-fulkerson','Ford–Fulkerson · DFS paths','Network flow · Week 11','O(V² F)','O(V²)','Send flow along a depth-first residual path, including reverse edges that undo earlier choices. Integer capacities are required; this matrix version scans V neighbours per vertex.','flow'],
    ['edmonds-karp','Edmonds–Karp · BFS paths','Network flow · Week 11','O(V³ E)','O(V²)','Use a shortest augmenting path in the residual network. The final reachable set gives a minimum-cut certificate. This matrix version uses O(V²) path searches.','flow'],
    ['greedy-colouring','Greedy graph colouring','Colouring · Week 11 extra','O(V² + E)','O(V)','Give each vertex the smallest colour absent from its already-coloured neighbours, following the input vertex order. A valid colouring need not use the fewest colours.','colouring'],
    ['local-recolouring','Local recolouring','Colouring · Week 11 extra','O(Ek(V + E))','O(V)','With k fixed colours, choose the single-vertex change that removes the most conflicts. Ties follow vertex order, then colour order. Stop when conflict-free or stuck at a local minimum.','colouring'],
    ['tsp','Exhaustive travelling salesman','Exhaustive search · Week 4','O(V!)','O(V)','Explore every simple tour from the start, visibly backtracking and keeping the best completed tour. Missing edges are allowed; at most 7 vertices keep the trace manageable.','exhaustive']
  ];
  const algorithms=definitions.map(([id,name,family,time,space,description,group])=>({id,name,family,time,space,description,group,collection:'graphs',maxLength:12}));
  const graph=(vertices,edges,directed=false,source=0,sink=vertices.length-1,k=3,colours=[])=>({vertices,edges,directed,source,sink:Math.max(0,sink),k,colours:colours.length?colours:Array(vertices.length).fill(0)});
  const letters=n=>Array.from({length:n},(_,i)=>String.fromCharCode(65+i));
  const baseEdges=[[0,1,4],[0,2,2],[1,3,5],[1,4,10],[2,4,3],[2,5,8],[3,6,6],[4,6,4],[5,7,1],[6,7,2]];
  const examples={
    traversal:()=>graph(letters(8),baseEdges.map(([u,v])=>[u,v,1])),
    weighted:()=>graph(letters(8),clone(baseEdges)),
    disconnected:()=>graph(letters(8),[[0,1,2],[1,2,0],[0,2,4],[3,4,-1],[4,5,2],[6,7,3]]),
    dag:()=>graph(letters(8),clone(baseEdges),true),
    cycle:()=>graph(letters(4),[[0,1,1],[1,2,1],[2,0,1],[2,3,1]],true),
    negative:()=>graph(letters(4),[[0,1,2],[0,2,5],[1,2,-4],[2,3,2],[1,3,3]],true),
    'negative-cycle':()=>graph(letters(4),[[0,1,1],[1,2,-3],[2,1,1],[2,3,2]],true),
    flow:()=>graph(['S','A','B','C','D','T'],[[0,1,1],[0,2,1],[1,3,1],[1,4,1],[2,3,1],[3,5,1],[4,5,1]],true),
    colouring:()=>graph(letters(7),[[0,1,1],[0,2,1],[1,2,1],[1,3,1],[2,4,1],[3,4,1],[3,5,1],[4,6,1],[5,6,1]]),
    tsp:()=>graph(letters(5),[[0,1,4],[0,2,7],[0,3,3],[0,4,6],[1,2,2],[1,3,8],[1,4,5],[2,3,6],[2,4,3],[3,4,4]]),
    empty:()=>graph([],[])
  };
  const isFlow=id=>['ford-fulkerson','edmonds-karp'].includes(id),isColour=id=>['greedy-colouring','local-recolouring'].includes(id);
  function example(id){return (isFlow(id)?examples.flow:isColour(id)?examples.colouring:id==='tsp'?examples.tsp:id==='topological'||id==='warshall'?examples.dag:['prim','kruskal','dijkstra','floyd-warshall'].includes(id)?examples.weighted:examples.traversal)();}
  function validate(id,config){
    if(!algorithms.some(a=>a.id===id))throw Error('Unknown graph algorithm.');
    if(!config||!Array.isArray(config.vertices)||!Array.isArray(config.edges))throw Error('Enter vertices and edges.');
    const c=clone(config),n=c.vertices.length;
    if(n>12)throw Error('Use at most 12 vertices.');
    if(c.vertices.some(v=>typeof v!=='string'||!/^[A-Za-z0-9_.+\-]{1,10}$/.test(v))||new Set(c.vertices).size!==n)throw Error('Use unique vertex names of 1–10 letters, numbers, dots, underscores, + or −.');
    if(c.edges.length>60)throw Error('Use at most 60 edges.');
    c.directed=Boolean(c.directed);c.source=Number(c.source??0);c.sink=Number(c.sink??Math.max(0,n-1));c.k=Number(c.k??3);c.colours=c.colours?.length?c.colours:Array(n).fill(0);
    if(n&&(!Number.isInteger(c.source)||c.source<0||c.source>=n||!Number.isInteger(c.sink)||c.sink<0||c.sink>=n))throw Error('Choose start and destination vertices from the vertex list.');
    const seen=new Set();for(const edge of c.edges){if(!Array.isArray(edge)||edge.length!==3)throw Error('Each edge needs two vertices and an optional weight.');const[u,v,w]=edge;if(!Number.isInteger(u)||!Number.isInteger(v)||u<0||v<0||u>=n||v>=n)throw Error('Every edge endpoint must appear in the vertex list.');if(!Number.isFinite(w)||Math.abs(w)>1e9)throw Error('Use finite edge weights between −1,000,000,000 and 1,000,000,000.');const tag=c.directed?u+'>'+v:Math.min(u,v)+'>'+Math.max(u,v);if(seen.has(tag))throw Error('Duplicate edge: '+c.vertices[u]+' to '+c.vertices[v]+'. Keep one edge per pair.');seen.add(tag);}
    if(['prim','kruskal'].includes(id)&&c.directed)throw Error('Spanning trees require an undirected graph. Turn Directed off, or load the Weighted example.');
    if((id==='topological'||isFlow(id))&&!c.directed)throw Error('This algorithm requires a directed graph. Turn Directed on, or load a directed example.');
    if(id==='dijkstra'&&c.edges.some(e=>e[2]<0))throw Error('Dijkstra requires non-negative weights. Use Floyd–Warshall for negative edges.');
    if(isFlow(id)){if(n&&c.source===c.sink)throw Error('Flow needs different source and sink vertices.');if(c.edges.some(e=>!Number.isInteger(e[2])||e[2]<0||e[2]>1000))throw Error('Use integer capacities from 0 to 1000 for network flow.');}
    if(isColour(id)){if(c.directed)throw Error('Colouring uses an undirected graph. Turn Directed off.');if(c.edges.some(e=>e[0]===e[1]))throw Error('A self-loop cannot be properly coloured. Remove self-loops to run colouring.');}
    if(id==='local-recolouring'&&(!Number.isInteger(c.k)||c.k<2||c.k>6||c.colours.length!==n||c.colours.some(v=>!Number.isInteger(v)||v<0||v>=c.k)))throw Error('Choose 2–6 colours and one initial colour (1 to k) per vertex.');
    if(id==='tsp'&&n>7)throw Error('Exhaustive TSP supports at most 7 vertices. Load the Tour example or shorten the vertex list.');
    return c;
  }
  function parse(id,{vertices,edges,directed,source,sink,k,colours}){
    const names=vertices.trim()?vertices.trim().split(/[\s,]+/):[],index=new Map(names.map((v,i)=>[v,i])),list=[];
    for(const [i,line]of edges.split(/[\n;]+/).entries()){if(!line.trim())continue;const parts=line.trim().split(/[\s,]+/);if(parts.length<2||parts.length>3)throw Error('Edge line '+(i+1)+': use “A B 4” or “A B”.');if(!index.has(parts[0])||!index.has(parts[1]))throw Error('Edge line '+(i+1)+': add both endpoints to Vertices first.');const text=parts[2]??'1';if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text))throw Error('Edge line '+(i+1)+': enter a numeric weight.');list.push([index.get(parts[0]),index.get(parts[1]),Number(text)]);}
    const initial=colours?.trim()?colours.trim().split(/[\s,]+/).map(x=>Number(x)-1):Array(names.length).fill(0);
    return validate(id,graph(names,list,directed,index.get(source)??0,index.get(sink)??Math.max(0,names.length-1),Number(k||3),initial));
  }
  const cache=new Map();
  function build(id,raw){
    const config=validate(id,raw),meta=algorithms.find(a=>a.id===id),n=config.vertices.length;
    const weight=Array.from({length:n},()=>Array(n).fill(null)),adj=Array.from({length:n},()=>[]),capacity=Array.from({length:n},()=>Array(n).fill(0));
    for(const[u,v,w]of config.edges){weight[u][v]=w;adj[u].push(v);capacity[u][v]=w;if(!config.directed&&u!==v){weight[v][u]=w;adj[v].push(u);capacity[v][u]=w;}}
    adj.forEach(a=>a.sort((a,b)=>a-b));
    const edges=config.edges.map(([u,v,w])=>[w,u,v]),inputs={};
    if(['bfs','dfs','topological','greedy-colouring','local-recolouring'].includes(id))inputs.adj=adj;
    if(['prim','dijkstra','warshall','floyd-warshall','tsp'].includes(id))inputs.weight=weight;
    if(['kruskal','local-recolouring'].includes(id))inputs.edges=edges;
    if(id==='kruskal')inputs.n=n;
    if(isFlow(id))inputs.capacity=capacity;
    if(['bfs','dfs','prim','dijkstra','tsp'].includes(id)||isFlow(id))inputs.source=config.source;
    if(isFlow(id))inputs.sink=config.sink;
    if(id==='local-recolouring'){inputs.initial_colours=config.colours.slice();inputs.k=config.k;}
    const source=global.GraphPrograms[id];let program=cache.get(id);if(!program){program=global.TreeRuntime.compile(source);cache.set(id,program);}
    // Program inputs are read-only. Share frozen input arrays across snapshots,
    // Preserve aliases and reuse unchanged frozen values; never retain mutable live state.
    const constantInputs=clone(inputs),constants=new WeakSet();
    function freeze(value){if(!value||typeof value!=='object'||constants.has(value))return;constants.add(value);Object.values(value).forEach(freeze);Object.freeze(value);}
    Object.values(constantInputs).forEach(freeze);
    const copies=new WeakMap();
    function copy(value,memo=new Map()){
      if(!value||typeof value!=='object'||constants.has(value))return value;if(memo.has(value))return memo.get(value);
      const out=Array.isArray(value)?[]:{};memo.set(value,out);for(const[key,item]of Object.entries(value))out[key]=copy(item,memo);
      const prior=copies.get(value),keys=Object.keys(out);if(prior&&keys.length===Object.keys(prior).length&&keys.every(key=>out[key]===prior[key])){memo.set(value,prior);return prior;}
      Object.freeze(out);copies.set(value,out);return out;
    }
    const machine=new global.TreeRuntime.Machine(program,{...constantInputs},null),events=[],mainName=source.match(/\nresult = (\w+)\(/)[1];let lastMain={},previous=null;
    const edgeKey=(u,v)=>config.directed?u+'>'+v:Math.min(u,v)+'>'+Math.max(u,v);
    function snap(line,kind){
      const primary=machine.frames.find(f=>f.name===mainName);if(primary)lastMain=primary.locals;const locals=lastMain,current=machine.frame().locals,code=line?program.lines[line-1].trim():'';
      const frames=copy(machine.frames),output=(locals.output||[]).slice(),visited=(locals.visited||[]).slice(),finished=(locals.finished||[]).slice(),settled=(locals.settled||[]).slice(),queue=(current.queue||locals.queue||[]).slice(current.head??locals.head??0),parent=(isFlow(id)?current.parent||locals.parent||[]:locals.parent||[]).slice();
      const path=(locals.path||current.path||[]).slice(),chosen=clone(locals.chosen||[]),colours=(locals.colours||[]).slice();
      const activeVertices=[current.u,current.v,...(current.k!==undefined&&['warshall','floyd-warshall'].includes(id)?[current.k,current.i,current.j]:[])].filter(v=>Number.isInteger(v)&&v>=0&&v<n);
      const activeEdges=[];if(Number.isInteger(current.u)&&Number.isInteger(current.v)&&current.u>=0&&current.u<n&&current.v>=0&&current.v<n&&(weight[current.u][current.v]!==null||locals.residual?.[current.u]?.[current.v]>0))activeEdges.push(edgeKey(current.u,current.v));
      const matrix=id==='warshall'?clone(locals.reach||[]):id==='floyd-warshall'?clone(locals.distance||[]):isFlow(id)?clone(locals.residual||[]):null;
      const changedCells=[];if(matrix)for(let i=0;i<matrix.length;i++)for(let j=0;j<matrix[i].length;j++)if(previous?.view.matrix?.[i]?.[j]!==matrix[i][j])changedCells.push(i+','+j);
      const best=locals.best||current.best;const bestPath=clone(best?.[1]||[]),flow=clone(locals.flow||[]),reachable=(locals.reachable||[]).slice();
      let text=line?machine.frame().name+': '+code:'Choose Next line or Quick run to explore the graph.';
      if(kind==='condition-true'||kind==='condition-false')text='Condition '+(kind==='condition-true'?'true':'false')+': '+code.replace(/^(if|elif) /,'').replace(/:$/,'');
      if(kind==='loop-false')text='Loop finished: '+code.replace(/:$/,'');
      const label=i=>config.vertices[i]??'—',pair=(u,v)=>label(u)+' → '+label(v),frame=machine.frame().locals;
      if(code==='queue.append(v)')text='Enqueue '+label(frame.v)+' at the back of the frontier.';
      else if(code==='u = queue.pop(0)'||code==='u = queue[head]')text='Take '+label(frame.u)+' from the front of the queue.';
      else if(code==='head += 1')text='Advance the queue front to index '+frame.head+'.';
      else if(code==='output.append(u)')text=(id==='topological'?'Remove ':'Visit ')+label(frame.u)+' and append it to the output.';
      else if(code==='finished.append(u)')text='All neighbours of '+label(frame.u)+' are explored; return to its caller.';
      else if(code==='visited[v] = True')text='Discover '+label(frame.v)+'; mark it visited so later edges will not add it again.';
      else if(code==='parent[v] = u')text='Record '+label(frame.u)+' as the predecessor of '+label(frame.v)+'.';
      else if(code==='settled[u] = True')text='Confirm '+label(frame.u)+(id==='dijkstra'?' at distance '+locals.distance[frame.u]:' in the spanning forest')+'.';
      else if(code==='distance[v] = candidate')text='Improve the distance to '+label(frame.v)+' to '+frame.candidate+' through '+label(frame.u)+'.';
      else if(code==='key[v] = weight[u][v]')text='The cheapest connection to '+label(frame.v)+' is now '+pair(frame.u,frame.v)+' with weight '+frame.key[frame.v]+'.';
      else if(code==='indegree[v] -= 1')text='Remove '+pair(frame.u,frame.v)+'; '+label(frame.v)+' now has indegree '+frame.indegree[frame.v]+'.';
      else if(code.startsWith('chosen.append')){const edge=locals.chosen.at(-1);text='Accept '+pair(edge[0],edge[1])+' into the minimum spanning forest.';}
      else if(code==='parent[a] = b'||code==='parent[b] = a')text='Join the components containing '+label(frame.a)+' and '+label(frame.b)+'.';
      else if(code.startsWith('reach[i][j] ='))text='Through '+label(frame.k)+', '+pair(frame.i,frame.j)+' is '+(frame.reach[frame.i][frame.j]?'reachable':'still unreachable')+'.';
      else if(code==='distance[i][j] = candidate')text='Improve '+pair(frame.i,frame.j)+' to '+frame.candidate+' through '+label(frame.k)+'.';
      else if(code==='flow[u][v] += delta'){const old=previous?.view.flow?.[frame.u]?.[frame.v]||0;text=old<0?'Undo '+Math.min(frame.delta,-old)+' flow on '+pair(frame.v,frame.u)+' using its reverse residual edge.':'Add '+frame.delta+' net flow along '+pair(frame.u,frame.v)+'.';}
      else if(code.startsWith('residual['))text='Residual capacity '+pair(frame.u,frame.v)+': '+frame.residual[frame.u][frame.v]+', reverse: '+frame.residual[frame.v][frame.u]+'.';
      else if(code==='value += delta')text='Augmentation complete. Total flow is now '+frame.value+'.';
      else if(code==='colours[u] = colour')text='Give '+label(frame.u)+' colour '+(frame.colour+1)+', the smallest available colour.';
      else if(code==='colours[best_u] = best_colour')text='Recolour '+label(frame.best_u)+' to '+(frame.best_colour+1)+'; conflicts decrease to '+frame.best_count+'.';
      else if(code==='best[1] = path[:] + [source]')text='A better completed tour costs '+frame.best[0]+': '+frame.best[1].map(label).join(' → ')+'.';
      else if(code==='path.append(v)')text='Extend the tour to '+label(frame.v)+'.';
      else if(code==='path.pop()')text='Backtrack: remove the last vertex and try another branch.';

      const decision=kind?.startsWith('condition-')&&(/^if not visited\[v\]/.test(code)||code==='if a != b:'||code==='if candidate < distance[v]:'||code==='if candidate < distance[i][j]:');
      const changed=previous&&(JSON.stringify(output)!==JSON.stringify(previous.view.output)||JSON.stringify(queue)!==JSON.stringify(previous.view.queue)||JSON.stringify(chosen)!==JSON.stringify(previous.view.chosen)||JSON.stringify(colours)!==JSON.stringify(previous.view.colours)||JSON.stringify(flow)!==JSON.stringify(previous.view.flow)||JSON.stringify(path)!==JSON.stringify(previous.view.path)||JSON.stringify(locals.distance||locals.key||[])!==JSON.stringify(previous.view.distance)||JSON.stringify(parent)!==JSON.stringify(previous.view.parent));
      const s={line,text,quick:Boolean(changed||changedCells.length||decision||code.startsWith('reach[i][j] =')||(kind==='loop-true'&&(code.startsWith('for v in adj')||code.startsWith('for edge in')))||kind==='return'),items:config.vertices.map((v,id)=>({id,v})),frames,fixed:{},nodes:[],depths:{},active:activeVertices,pivotId:null,heldId:null,comparisons:machine.steps,exchanges:0,view:{type:'graph',algorithm:id,vertices:config.vertices.slice(),edges:clone(config.edges),directed:config.directed,source:config.source,sink:config.sink,activeVertices,activeEdges,output,visited,finished,settled,queue,parent,path,chosen,colours,component:clone(locals.component||[]),distance:clone(locals.distance||locals.key||[]),indegree:clone(locals.indegree||[]),matrix,changedCells,i:locals.i,j:locals.j,k:locals.k,flow,reachable,value:locals.value??0,delta:locals.delta??null,total:locals.total??0,bestPath,bestCost:best?.[0]??Infinity,conflicts:locals.conflict_count??null,trial:locals.colour,trialVertex:locals.u,colourLimit:config.k,stack:machine.frames.filter(f=>['visit','extend','find_path'].includes(f.name)).map(f=>f.locals.u??f.locals.path?.at(-1)).filter(Number.isInteger)}};
      previous=s;return s;
    }
    const initial=snap(null,'ready');machine.onStep=(line,kind)=>{const s=snap(line,kind);events.push(s);return s;};
    for(const ignored of machine.run()){}
    const last=events.at(-1);last.done=true;last.quick=true;const result=clone(machine.frames[0].locals.result);last.result=result;
    const v=last.view;if(id==='tsp'){v.bestCost=result[0];v.bestPath=result[1].slice();}
    if(id==='topological')last.text=result[1]?'Cycle detected: '+result[0].length+' of '+n+' vertices removed. No topological order exists.':'Topological order: '+result[0].map(i=>config.vertices[i]).join(' → ')+'.';
    else if(['bfs','dfs'].includes(id))last.text='Traversal forest complete: '+v.output.map(i=>config.vertices[i]).join(' → ')+'.';
    else if(['prim','kruskal'].includes(id)){last.text='Minimum spanning '+(v.chosen.length===Math.max(0,n-1)?'tree':'forest')+' complete. Total weight: '+v.total+'.';}
    else if(id==='dijkstra')last.text='Shortest paths complete. '+v.distance.filter(Number.isFinite).length+' of '+n+' vertices reachable from '+(config.vertices[config.source]||'the empty graph')+'.';
    else if(id==='warshall')last.text='Transitive closure complete, including zero-length self paths.';
    else if(id==='floyd-warshall')last.text=result[1].length?'Negative cycle detected at '+result[1].map(i=>config.vertices[i]).join(', ')+'. Affected distances are undefined.':'All-pairs shortest paths complete. ∞ marks unreachable pairs.';
    else if(isFlow(id)){const cut=config.edges.filter(([u,w])=>v.reachable[u]&&!v.reachable[w]).reduce((s,e)=>s+e[2],0);last.text='Maximum flow '+result[0]+' = minimum-cut capacity '+cut+'.';v.cutCapacity=cut;}
    else if(id==='greedy-colouring')last.text='Proper colouring complete using '+new Set(result).size+' colours. Greedy does not guarantee the minimum.';
    else if(id==='local-recolouring')last.text=result[1]===0?'Conflict-free colouring found with '+config.k+' available colours.':'Local minimum: '+result[1]+' conflicting edges remain. This does not prove '+config.k+'-colouring impossible.';
    else if(id==='tsp')last.text=Number.isFinite(result[0])?'Best tour: '+result[1].map(i=>config.vertices[i]).join(' → ')+'. Cost '+result[0]+'.':'No Hamiltonian tour exists in this graph.';
    return {meta:{...meta,code:program.lines},input:[],config,initial,events,result,source,inputs:clone(inputs)};
  }
  global.GraphEngine={algorithms,examples,example,validate,parse,build,clone,isFlow,isColour};
})(typeof window!=='undefined'?window:globalThis);
