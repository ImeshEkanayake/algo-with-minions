const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const c={};vm.createContext(c);for(const f of ['tree-runtime.js','lab-programs.js','lab-engine.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const E=c.LabEngine;
const plain=x=>JSON.parse(JSON.stringify(x,(_k,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v)),cases=[];
for(const meta of E.algorithms)for(const preset of meta.examples){const b=E.build(meta.id,preset.config),split=b.source.lastIndexOf('\nresult =');cases.push({id:meta.id,base:b.source.slice(0,split+1),main:b.source.slice(split+1),inputs:plain(b.inputs),expected:plain(b.events.map(s=>({line:s.line,frames:s.frames.map(f=>({name:f.name,locals:f.locals}))}))),result:plain(b.events.at(-1).result)});}
const py=spawnSync('python3',['-c',String.raw`import sys,json,math
cases=json.load(sys.stdin)
def normal(v):
 if isinstance(v,float) and math.isinf(v):return 'Infinity' if v>0 else '-Infinity'
 if isinstance(v,list):return [normal(x) for x in v]
 return v
def same(a,b):
 if isinstance(a,(int,float)) and not isinstance(a,bool) and isinstance(b,(int,float)) and not isinstance(b,bool):return math.isclose(a,b,rel_tol=1e-12,abs_tol=1e-12)
 if isinstance(a,list) and isinstance(b,list):return len(a)==len(b) and all(same(x,y) for x,y in zip(a,b))
 if isinstance(a,dict) and isinstance(b,dict):return a.keys()==b.keys() and all(same(a[k],b[k]) for k in a)
 return type(a)==type(b) and a==b
for case in cases:
 ns=case['inputs'];module_names=set(ns)|{'result'}
 exec(compile(case['base'],'lab-program.py','exec'),ns)
 events=[];pending={}
 def record(frame,line):
  frames=[];current=frame
  while current:
   if current.f_code.co_filename=='lab-program.py':
    name='Top level' if current.f_code.co_name=='<module>' else current.f_code.co_name
    local=dict(current.f_locals)
    if name=='Top level':local={k:v for k,v in local.items() if k in module_names}
    frames.append({'name':name,'locals':{k:normal(v) for k,v in local.items()}})
   current=current.f_back
  events.append({'line':line,'frames':list(reversed(frames))})
 def observe(frame,event,arg):
  if frame.f_code.co_filename!='lab-program.py':return observe
  identity=id(frame)
  if event=='line':
   if identity in pending:record(frame,pending[identity])
   pending[identity]=frame.f_lineno
  elif event=='return':
   if identity in pending:record(frame,pending.pop(identity))
  return observe
 sys.settrace(observe)
 exec(compile('\n'*case['base'].count('\n')+case['main'],'lab-program.py','exec'),ns)
 sys.settrace(None)
 if not same(events,case['expected']):
  mismatch=next(((i,a,b) for i,(a,b) in enumerate(zip(events,case['expected'])) if not same(a,b)),None)
  raise AssertionError(case['id']+' '+str((len(events),len(case['expected'])))+' mismatch '+str(mismatch))
 assert same(normal(ns['result']),case['result']),case['id']+' result'
print('PASS '+str(len(cases))+' complete lab traces agree with actual Python lines, locals, call stacks and results.')`],{input:JSON.stringify(cases),encoding:'utf8',maxBuffer:5e6});assert.equal(py.status,0,py.stderr);process.stdout.write(py.stdout);
