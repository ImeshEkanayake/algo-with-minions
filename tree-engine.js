(function(global){
  'use strict';
  const clone=value=>Array.isArray(value)?value.map(clone):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clone(v)])):value;
  const operations=[
    {id:'search',name:'Search'},{id:'insert',name:'Insert'},{id:'delete',name:'Delete'},
    {id:'build',name:'Build from empty'},{id:'preorder',name:'Preorder traversal'},{id:'inorder',name:'Inorder traversal'},{id:'postorder',name:'Postorder traversal'}
  ];
  const algorithms=[
    {id:'bst',name:'Binary search tree',family:'Binary search trees · Week 5',time:'O(n) worst',space:'O(h)',description:'Follow comparisons through an ordinary binary search tree. Deletion handles leaves, one child, and two children by transplanting the in-order successor.'},
    {id:'avl',name:'AVL tree',family:'Balanced search trees · Week 9',time:'O(log n)',space:'O(log n)',description:'Search, insert and delete while keeping every balance factor between −1 and +1. Heights, held subtrees and all four rotation cases follow the Python execution.'},
    {id:'two-three',name:'2–3 tree',family:'Balanced search trees · Week 9',time:'O(log n)',space:'O(log n)',description:'Nodes hold one or two keys. Insertion splits overfull nodes and promotes middle keys; deletion borrows or merges and can shrink the root.'},
    {id:'multiway',name:'Multiway search tree',family:'Multiway search trees · Week 9 extension',time:'O(m logₘ n)',space:'O(logₘ n)',description:'A balanced multiway (B-tree) implementation with 3–6 children per node. Compare keys within a node, then follow its child; insertion and deletion maintain occupancy and leaf depth.'}
  ].map(meta=>({...meta,collection:'trees',maxLength:16}));
  const cases={
    ll:{family:'avl',operation:'insert',values:[30,20,40,10,25],key:5},
    rr:{family:'avl',operation:'insert',values:[10,5,20,15,30],key:35},
    lr:{family:'avl',operation:'insert',values:[50,20,70,10,40],key:30},
    rl:{family:'avl',operation:'insert',values:[20,10,50,30,60],key:40},
    leaf:{family:'bst',operation:'delete',values:[40,20,60,10,30,50,70,25],key:10},
    one:{family:'bst',operation:'delete',values:[40,20,60,10,30,50,70,25],key:30},
    two:{family:'bst',operation:'delete',values:[40,20,60,10,30,50,70,25],key:40},
    split:{family:'two-three',operation:'insert',values:[20,40,10,30,50,60],key:70},
    merge:{family:'two-three',operation:'delete',values:[20,40,10,30,50,60,70],key:10}
  };
  const cache=new Map();
  const format=v=>Object.is(v,-0)?'-0':String(v);
  function build(id,input,key,options={}){
    const meta=algorithms.find(a=>a.id===id);if(!meta)throw Error('Unknown tree family.');
    if(!Array.isArray(input)||input.length>16||input.some(v=>!Number.isFinite(v))||!Number.isFinite(key))throw Error('Use up to 16 finite values and a finite operation key.');
    const operation=options.operation||'search';if(!operations.some(op=>op.id===operation))throw Error('Unknown tree operation.');
    const multi=id==='two-three'||id==='multiway',order=id==='two-three'?3:Number(options.order||4);if(multi&&(!Number.isInteger(order)||order<3||order>6))throw Error('Choose a multiway order from 3 to 6.');
    let main;
    const insertCall=multi?'insert_root(root, value, order)':'insert(root, value)';
    if(operation==='build')main='root = None\nfor value in values:\n    root = '+insertCall+'\nresult = root';
    else if(operation==='insert')main='root = '+(multi?'insert_root(root, key, order)':'insert(root, key)')+'\nresult = root';
    else if(operation==='delete')main='root = '+(multi?'delete_root(root, key, order)':'delete(root, key)')+'\nresult = root';
    else if(operation==='search')main='result = search(root, key)';
    else main='output = []\ntraverse(root, output, "'+operation+'")\nresult = output';
    const source=global.TreePrograms[multi?'multiway':id]+'\n'+main;
    let program=cache.get(source);if(!program){program=global.TreeRuntime.compile(source);cache.set(source,program);}
    const machine=new global.TreeRuntime.Machine(program,{root:null,values:input.slice(),key,order},null);
    for(const value of input)machine.keyId(value);
    if(operation!=='build'){
      let root=null;for(const value of input){const generator=machine.call(multi?'insert_root':'insert',multi?[root,value,order]:[root,value]);let step=generator.next();while(!step.done)step=generator.next();root=step.value;}machine.frames[0].locals.root=root;
    }
    machine.pending=null;machine.comparisons=0;machine.steps=0;machine.accessed.clear();machine.accessedKeys.clear();machine.visited.clear();
    const initialKeys=rootValues(machine.frames[0].locals.root),events=[];let previous=null,rotations=0,splits=0,merges=0;
    function nodeRef(value,seen=new Set()){
      if(value===null||typeof value!=='object')return value;
      if(machine.nodeIds.has(value))return {ref:machine.nodeIds.get(value),...('key'in value?{key:value.key,left:value.left?machine.nodeIds.get(value.left):null,right:value.right?machine.nodeIds.get(value.right):null,...('height'in value?{height:value.height}:{})}:{keys:value.keys.slice(),children:value.children.map(child=>machine.nodeIds.get(child))})};
      if(Array.isArray(value))return value.map(v=>nodeRef(v,seen));
      return String(value);
    }
    function collect(){
      const live=new Set(),objects=new Set(),candidateKeys=new Set();
      function visit(value){if(!value||typeof value!=='object'||objects.has(value))return;objects.add(value);if(machine.nodeIds.has(value)){live.add(value);if(multi)for(const c of value.children)visit(c);else{visit(value.left);visit(value.right);}}else if(Array.isArray(value))for(const v of value)visit(v);}
      for(const frame of machine.frames)for(const value of Object.values(frame.locals))visit(value);visit(machine.pending?.value);
      function held(value){if(typeof value==='number'&&machine.keyIds.has(value))candidateKeys.add(value);else if(Array.isArray(value))value.forEach(held);}
      for(const frame of machine.frames)for(const [name,value]of Object.entries(frame.locals))if(['promoted','separator','replacement','parts'].includes(name))held(value);
      if(machine.pending?.name==='split'||machine.pending?.name==='maximum_key')held(machine.pending.value);
      const nodes=[...live].map(n=>({id:machine.nodeIds.get(n),keys:(multi?n.keys:[n.key]).map(v=>({id:machine.keyId(v),v})),children:(multi?n.children:[n.left,n.right]).map(c=>c?machine.nodeIds.get(c):null),height:n.height??null,balance:!multi&&id==='avl'?(n.left?.height??-1)-(n.right?.height??-1):null}));
      const visible=new Set(nodes.flatMap(n=>n.keys.map(k=>k.v))),heldKeys=[...candidateKeys].filter(v=>!visible.has(v)).map(v=>({id:machine.keyId(v),v}));
      return {nodes,heldKeys};
    }
    function snapshot(line,kind='ready'){
      const data=collect(),root=machine.frames[0].locals.root,rootId=root?machine.nodeIds.get(root):null;
      const reachable=new Set();function visit(n){if(!n||reachable.has(n))return;reachable.add(n);for(const child of multi?n.children:[n.left,n.right])visit(child);}visit(root);
      const heldNodes=data.nodes.filter(n=>!reachable.has(machine.nodes.get(n.id))).map(n=>n.id);
      const edges=data.nodes.flatMap(n=>n.children.filter(Boolean).map(c=>n.id+'>'+c)),oldEdges=new Set(previous?.view.edges||[]),changedEdges=previous?edges.filter(e=>!oldEdges.has(e)):[];
      const changedKeys=data.nodes.filter(n=>{const before=previous?.view.graph.find(x=>x.id===n.id);return before&&before.keys.map(k=>k.v).join('|')!==n.keys.map(k=>k.v).join('|');}).map(n=>n.id);
      const frame=machine.frame(),activeNodes=[...machine.accessed];for(const name of ['node','pivot','successor','child','parent']){const node=frame.locals[name];if(node&&machine.nodeIds.has(node)&&!activeNodes.includes(machine.nodeIds.get(node)))activeNodes.push(machine.nodeIds.get(node));}
      const items=[];const used=new Set();for(const item of data.nodes.flatMap(n=>n.keys).concat(data.heldKeys))if(!used.has(item.id)){items.push({...item});used.add(item.id);}
      const frames=machine.frames.map(f=>({id:f.id,name:f.name,locals:Object.fromEntries(Object.entries(f.locals).map(([name,v])=>[name,nodeRef(v)]))}));
      const codeLine=line?program.lines[line-1].trim():'',structural=changedEdges.length>0||changedKeys.length>0||data.nodes.length!==(previous?.view.graph.length??data.nodes.length)||data.heldKeys.length>0;
      let text=line?frame.name+': '+codeLine:'Choose an operation and key, then step through the tree.';
      if(kind==='condition-true'||kind==='condition-false')text='Condition '+(kind==='condition-true'?'true':'false')+': '+codeLine.replace(/^(if|elif) /,'').replace(/:$/,'');
      else if(kind==='loop-true'||kind==='loop-false')text=(kind==='loop-true'?'Continue loop: ':'Finish loop: ')+codeLine.replace(/^(while|for) /,'').replace(/:$/,'');
      else if(kind==='return')text=frame.name+' returns '+(machine.pending?.value===null?'None':machine.nodeIds.has(machine.pending?.value)?'node '+machine.nodeIds.get(machine.pending.value):Array.isArray(machine.pending?.value)?'a list':format(machine.pending?.value))+'.';
      else if(changedEdges.length&&line)text='Reconnect links: '+changedEdges.map(e=>e.replace('>',' → ')).join(', ')+'.';
      else if(changedKeys.length)text='Update keys in '+changedKeys.join(', ')+'.';
      if(kind==='return'&&frame.name.startsWith('rotate_'))rotations++;
      if(kind==='return'&&frame.name==='split')splits++;
      if(frame.name==='repair'&&codeLine.startsWith('parent.children.pop'))merges++;
      const values=rootValues(root),output=machine.frames[0].locals.output?.slice()||[];
      const s={line,text,quick:structural||machine.comparisons>(previous?.comparisons||0)||(kind==='return'&&!['height','balance','update'].includes(frame.name))||(frame.name==='search'&&codeLine.startsWith('node =')),items,frames,fixed:{},nodes:[],depths:{},active:data.nodes.filter(n=>activeNodes.includes(n.id)).flatMap(n=>n.keys.map(k=>k.id)),pivotId:null,heldId:null,comparisons:machine.comparisons,exchanges:0,view:{type:'tree',family:id,operation,order,root:rootId,graph:data.nodes,edges,changedEdges,changedKeys,heldNodes,heldKeys:data.heldKeys,activeNodes,activeKeys:[...machine.accessedKeys],visited:[...machine.visited],inorder:values,output,rotations,splits,merges}};
      previous=s;return s;
    }
    const initial=snapshot(null);
    machine.onStep=(line,kind)=>{const s=snapshot(line,kind);events.push(s);return s;};
    for(const ignored of machine.run()){}
    const last=events.at(-1);if(!last)throw Error('The tree operation produced no trace.');last.done=true;last.quick=true;
    const root=machine.frames[0].locals.root,values=rootValues(root),rawResult=machine.frames[0].locals.result;
    const summary={operation,key,found:operation==='search'?rawResult!==null:null,changed:operation==='insert'?values.length>initialKeys.length:operation==='delete'?values.length<initialKeys.length:null,output:operation==='preorder'||operation==='inorder'||operation==='postorder'?rawResult.slice():[],root:serialize(root),keys:values};
    last.result=clone(summary);
    if(operation==='search')last.text=summary.found?'Found '+format(key)+' in node '+machine.nodeIds.get(rawResult)+'.':format(key)+' is not in the tree.';
    else if(operation==='insert')last.text=summary.changed?'Inserted '+format(key)+'.':format(key)+' already exists; duplicate keys are ignored.';
    else if(operation==='delete')last.text=summary.changed?'Deleted '+format(key)+'.':format(key)+' was absent; the tree is unchanged.';
    else if(operation==='build')last.text='Built the tree from '+input.length+' input values ('+values.length+' unique keys).';
    else last.text=operations.find(op=>op.id===operation).name+' complete: '+summary.output.map(format).join(', ')+'.';
    const op=operations.find(op=>op.id===operation),name=meta.name+' · '+op.name;
    const traversal=['preorder','inorder','postorder'].includes(operation),cost=operation==='build'?(id==='bst'?'O(n²) worst':'O(n log n)'):traversal?'O(n)':meta.time;
    return {meta:{...meta,name,operation,time:cost,space:operation==='search'?'O(1)':traversal||operation==='build'?'O(n)':meta.space,code:program.lines},input:input.slice(),target:key,initial,events,result:summary,source,main,order};
    function rootValues(node,seen=new Set()){if(!node||seen.has(node))return [];seen.add(node);if(multi){const out=[];for(let i=0;i<Math.max(node.keys.length+1,node.children.length);i++){out.push(...rootValues(node.children[i],seen));if(i<node.keys.length)out.push(node.keys[i]);}return out;}return [...rootValues(node.left,seen),node.key,...rootValues(node.right,seen)];}
    function serialize(node){if(!node)return null;return multi?{keys:node.keys.slice(),children:node.children.map(serialize)}:{key:node.key,height:node.height,left:serialize(node.left),right:serialize(node.right)};}
  }
  global.TreeEngine={algorithms,operations,cases,build,clone};
})(typeof window!=='undefined'?window:globalThis);
