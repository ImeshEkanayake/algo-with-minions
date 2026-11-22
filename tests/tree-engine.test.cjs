const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={};vm.createContext(context);for(const f of ['tree-runtime.js','tree-programs.js','tree-engine.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
const E=context.TreeEngine,plain=x=>JSON.parse(JSON.stringify(x));let runs=0,states=0;
function checkTree(root,family,order){
 const values=[],depths=[],seen=new Set(),minimum=Math.ceil(order/2)-1;
 function walk(n,lo,hi,depth,isRoot){if(!n)return -1;assert(!seen.has(n));seen.add(n);
  if(family==='bst'||family==='avl'){assert(n.key>lo&&n.key<hi,'BST ordering');values.push(n.key);const l=walk(n.left,lo,n.key,depth+1,false),r=walk(n.right,n.key,hi,depth+1,false),h=1+Math.max(l,r);if(family==='avl'){assert.equal(n.height,h,'stored AVL height');assert(Math.abs(l-r)<=1,'AVL balance');}return h;}
  assert(n.keys.length>=(isRoot?1:minimum)&&n.keys.length<=order-1,'multiway occupancy '+JSON.stringify(n));for(let i=0;i<n.keys.length;i++){assert(n.keys[i]>lo&&n.keys[i]<hi);if(i)assert(n.keys[i-1]<n.keys[i]);values.push(n.keys[i]);}
  if(!n.children.length)depths.push(depth);else{assert.equal(n.children.length,n.keys.length+1);for(let i=0;i<n.children.length;i++)walk(n.children[i],i?n.keys[i-1]:lo,i<n.keys.length?n.keys[i]:hi,depth+1,false);}return depth;
 }
 walk(root,-Infinity,Infinity,0,true);assert(depths.every(d=>d===depths[0]),'balanced leaf depth');return values.sort((a,b)=>a-b);
}
const examples=[[],[0],[4,4,4],[-0,0,-0],[40,20,60,10,30,50,70,25],[-3.5,0,4.25,-9,4.25],Array.from({length:16},(_,i)=>i-8),Array.from({length:16},(_,i)=>15-i),[-1e200,1e200,0,1e-200]];
let seed=97;for(let trial=0;trial<22;trial++){const a=[];for(let j=0;j<trial%17;j++){seed=seed*16807%2147483647;a.push((seed%61-30)/2);}examples.push(a);}
for(const family of ['bst','avl','two-three','multiway'])for(const order of family==='multiway'?[3,4,5,6]:[family==='two-three'?3:4]){
 for(const input of examples){const unique=[...new Set(input)].sort((a,b)=>a-b);
  for(const operation of ['build','search','insert','delete','preorder','inorder','postorder'])for(const key of operation==='delete'?[...new Set([-99,...unique])]:operation==='search'?[...new Set([-99,...unique.slice(0,2),...unique.slice(-2)])]:[2.75]){
   const b=E.build(family,input,key,{operation,order}),last=b.events.at(-1);assert(last.done);let expected=unique.slice();if(operation==='insert'&&!expected.includes(key))expected.push(key);if(operation==='delete')expected=expected.filter(v=>v!==key);expected.sort((a,b)=>a-b);
   assert.deepEqual(plain(checkTree(b.result.root,family,order)),plain(expected),family+' '+operation+' '+input+' key '+key);assert.deepEqual(plain(b.result.keys),plain(expected));if(operation==='search')assert.equal(b.result.found,unique.includes(key));if(['preorder','inorder','postorder'].includes(operation)){assert.deepEqual(plain([...b.result.output].sort((a,b)=>a-b)),plain(unique));if(operation==='inorder')assert.deepEqual(plain(b.result.output),plain(unique));function visit(node){if(!node)return [];if(family==='bst'||family==='avl'){const left=visit(node.left),right=visit(node.right);return operation==='preorder'?[node.key,...left,...right]:operation==='postorder'?[...left,...right,node.key]:[...left,node.key,...right];}const children=node.children.map(visit);if(operation==='preorder')return [...node.keys,...children.flat()];if(operation==='postorder')return [...children.flat(),...node.keys];const out=[];for(let i=0;i<node.keys.length;i++)out.push(...(children[i]||[]),node.keys[i]);out.push(...(children[node.keys.length]||[]));return out;}assert.deepEqual(plain(b.result.output),plain(visit(b.result.root)),'traversal visit order');}
   for(const s of [b.initial,...b.events]){assert.equal(new Set(s.items.map(v=>v.id)).size,s.items.length);assert(s.line===null||s.line>=1&&s.line<=b.meta.code.length);assert.equal(Object.keys(s.fixed).length,0);for(const n of s.view.graph)for(const child of n.children.filter(Boolean))assert(s.view.graph.some(c=>c.id===child),'child pointer remains visible');}
   runs++;states+=b.events.length;
  }
 }
 console.log('PASS '+family+' order '+order);
}
for(const name of ['ll','rr','lr','rl']){const c=E.cases[name],b=E.build(c.family,c.values,c.key,c);assert.equal(b.events.at(-1).view.rotations,name.length===2&&name[0]===name[1]?1:2,name+' rotation count');checkTree(b.result.root,'avl',4);}
const splitExample=E.cases.split,split=E.build('two-three',splitExample.values,splitExample.key,splitExample);assert.equal(split.events.at(-1).items.find(k=>k.v===40).id,1);assert(split.events.some(s=>s.view.heldKeys.some(k=>k.v===60&&k.id===5)),'promoted key identity retained');
const b=E.build('bst',[40,20,60,10,30,50,70,25],40,{operation:'delete'});assert.equal(b.result.root.key,50);assert(b.events.some(s=>s.view.heldNodes.length));const held=b.events.find(s=>s.view.heldNodes.length);const saved=plain(held);b.initial.view.graph[0].keys[0].v=999;assert.deepEqual(plain(held),saved);
for(const family of ['bst','avl','two-three','multiway'])assert.throws(()=>E.build(family,Array(17).fill(0),0));assert.throws(()=>E.build('multiway',[1],0,{order:2}));
console.log('Validated '+runs+' tree runs and '+states+' snapshots: ordering, all deletion cases, duplicate semantics, rotations/heights, occupancy, equal leaf depth, traversal membership and immutable history.');
