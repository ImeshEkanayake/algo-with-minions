const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const context={};vm.createContext(context);for(const file of ['engine.js','search-engine.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const E=context.SearchingEngine,normal=value=>JSON.parse(JSON.stringify(value));
const examples=[[],[0],[1],[3,2,1],[1,2,3],[-3,-1,-9],[0,-1,1,0],[-2.5,0,3.25,-.25,3.25],[4,4,4,4],[-0,0,-0],[-1e200,1e200,1e-200,-1e-200],[Number.MAX_VALUE,-Number.MAX_VALUE,Number.MIN_VALUE,0]];
let seed=83;for(let trial=0;trial<25;trial++){const a=[];for(let i=0;i<trial%11;i++){seed=seed*16807%2147483647;a.push((seed%81-40)/4);}examples.push(a);}
let runs=0,states=0;const parity=[];
for(const meta of E.algorithms){
 for(const example of examples){const values=meta.ordered?[...example].sort((a,b)=>a-b):example;
  for(const key of [...new Set([...values,-99,99,.125])]){
   const result=E.build(meta.id,values,key),last=result.events.at(-1),expected=values.findIndex(v=>v===key);assert(last.done);assert.equal(last.result>=0,expected>=0,`${meta.id} presence`);if(last.result>=0){assert(values[last.result]===key);if(!meta.ordered)assert.equal(last.result,expected);}else assert.equal(last.result,-1);
   assert.deepEqual(normal(last.items.map(v=>v.v)),normal(values));for(let i=0;i<values.length;i++)assert(Object.is(last.items[i].v,values[i]),`${meta.id} original value restored`);
   let comparisons=0;for(const s of [result.initial,...result.events]){
    assert.equal(Object.keys(s.fixed).length,0);assert(s.comparisons>=comparisons);comparisons=s.comparisons;assert(s.items.every((v,i)=>v.id===i));assert(s.line===null||s.line>=1&&s.line<=meta.code.length);
    for(const i of s.view.eliminated)assert(i>=0&&i<values.length);
    assert.deepEqual(normal(s.frames[0]?.locals.a||values),normal(s.items.map(v=>v.v)));
    if(meta.id!=='sentinel'||s.view.sentinel===null)assert.deepEqual(normal(s.items.map(v=>v.v)),normal(values));
    else{assert.equal(s.view.sentinel,values.length-1);assert.equal(s.items.at(-1).v,key);assert.deepEqual(normal(s.items.slice(0,-1).map(v=>v.v)),normal(values.slice(0,-1)));}
    if(s.done&&s.result>=0)assert(!s.view.eliminated.includes(s.result));
   }
   if(parity.filter(p=>p.id===meta.id).length<18)parity.push({id:meta.id,code:meta.code.join('\n'),values,key,expected:normal(result.events.slice(1).map(s=>({line:s.line,locals:s.frames[0].locals}))),result:last.result});
   runs++;states+=result.events.length;
  }
 }
 console.log(`PASS ${meta.name}`);
}
for(const text of ['', '1, 2', 'NaN','Infinity','9007199254740993','1e309'])assert.throws(()=>E.parseTarget(text));for(const [text,value]of [['-2.5',-2.5],['−3',-3],['1e-3',.001],['0',0]])assert.equal(E.parseTarget(text),value);assert(Object.is(E.parseTarget('-0'),-0));
for(const id of ['binary','ternary'])assert.throws(()=>E.build(id,[2,1],1),/ascending/);assert.throws(()=>E.build('linear',[0],Infinity));
const check=E.build('sentinel',[3,1,2],99),untouched=normal(check.events[2]);check.events[1].items[0].v=999;check.events[1].frames[0].locals.a[0]=999;assert.deepEqual(normal(check.events[2]),untouched);
const python=spawnSync('python3',['-c',`import sys,json,copy
cases=json.load(sys.stdin)
for case in cases:
 ns={};exec(case['code'],ns);name=case['code'].split('def ')[1].split('(')[0];trace=[];pending=None
 def observe(frame,event,arg):
  global pending
  if frame.f_code.co_name != name: return observe
  if event=='line':
   if pending is not None: trace.append({'line':pending,'locals':copy.deepcopy(dict(frame.f_locals))})
   pending=frame.f_lineno
  elif event=='return':
   if pending is not None: trace.append({'line':pending,'locals':copy.deepcopy(dict(frame.f_locals))});pending=None
  return observe
 sys.settrace(observe)
 result=ns[name](case['values'][:],case['key'])
 sys.settrace(None)
 assert result==case['result'],case['id']+' result differs'
 assert trace==case['expected'],case['id']+' Python line/locals differ: '+str([(a,b) for a,b in zip(trace,case['expected']) if a!=b][:2])
print('PASS actual Python execution agrees with every displayed line and local variable in '+str(len(cases))+' traces.')`],{input:JSON.stringify(parity),encoding:'utf8',maxBuffer:2e6});
assert.equal(python.status,0,python.stderr);process.stdout.write(python.stdout);
console.log(`Validated ${runs} searches and ${states} snapshots, including present/missing targets, duplicates, negative/positive values, decimals, empty arrays, extremes, sentinel restoration and immutable history.`);
