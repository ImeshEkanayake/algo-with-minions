const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const c={};vm.createContext(c);for(const f of ['tree-runtime.js','graph-programs.js','graph-engine.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const E=c.GraphEngine;
const json=x=>JSON.stringify(x,(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v),plain=x=>JSON.parse(json(x));
const cases=[];
function add(id,config){
 const b=E.build(id,config),split=b.source.lastIndexOf('\nresult =');
 const expected=plain(b.events.map(s=>({line:s.line,frames:s.frames.map(f=>({name:f.name,locals:f.locals}))})));
 cases.push({id,base:b.source.slice(0,split+1),main:b.source.slice(split+1),inputs:plain(b.inputs),expected});
}
for(const a of E.algorithms){
 assert.equal(c.GraphPrograms[a.id],fs.readFileSync('graph-sources/'+a.id+'.py','utf8'));
 add(a.id,E.example(a.id));add(a.id,{...E.examples.empty(),directed:a.id==='topological'||E.isFlow(a.id)});
}
for(const [id,preset]of [['topological','cycle'],['floyd-warshall','negative'],['floyd-warshall','negative-cycle'],['prim','disconnected'],['kruskal','disconnected']])add(id,E.examples[preset]());
const py=spawnSync('python3',['-c',String.raw`import sys,json,math
cases=json.load(sys.stdin)
for case in cases:
 ns=case['inputs']
 module_names=set(ns)|{'result'}
 exec(compile(case['base'],'graph-program.py','exec'),ns)
 events=[];pending={}
 def normal(v):
  if isinstance(v,float) and math.isinf(v):return 'Infinity' if v>0 else '-Infinity'
  if isinstance(v,list):return [normal(x) for x in v]
  return v
 def record(frame,line):
  frames=[];current=frame
  while current:
   if current.f_code.co_filename=='graph-program.py':
    name='Top level' if current.f_code.co_name=='<module>' else current.f_code.co_name
    local=dict(current.f_locals)
    if name=='Top level':local={k:v for k,v in local.items() if k in module_names}
    frames.append({'name':name,'locals':{k:normal(v) for k,v in local.items()}})
   current=current.f_back
  events.append({'line':line,'frames':list(reversed(frames))})
 def observe(frame,event,arg):
  if frame.f_code.co_filename!='graph-program.py':return observe
  identity=id(frame)
  if event=='line':
   if identity in pending:record(frame,pending[identity])
   pending[identity]=frame.f_lineno
  elif event=='return':
   if identity in pending:record(frame,pending.pop(identity))
  return observe
 sys.settrace(observe)
 exec(compile('\n'*case['base'].count('\n')+case['main'],'graph-program.py','exec'),ns)
 sys.settrace(None)
 if events!=case['expected']:
  mismatch=next(((i,a,b) for i,(a,b) in enumerate(zip(events,case['expected'])) if a!=b),None)
  raise AssertionError(case['id']+' '+str((len(events),len(case['expected'])))+' mismatch '+str(mismatch))
print('PASS '+str(len(cases))+' graph traces match actual Python lines, local variables and call stacks.')`],{input:JSON.stringify(cases),encoding:'utf8',maxBuffer:3e6});assert.equal(py.status,0,py.stderr);process.stdout.write(py.stdout);
