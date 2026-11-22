const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const c={};vm.createContext(c);for(const f of ['tree-runtime.js','tree-programs.js','tree-engine.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);const E=c.TreeEngine,plain=x=>JSON.parse(JSON.stringify(x));
for(const family of ['bst','avl','multiway'])assert.equal(c.TreePrograms[family],fs.readFileSync('tree-sources/'+family+'.py','utf8'),'generated source matches Python file');
const cases=[];function add(family,values,key,operation,order=4){const b=E.build(family,values,key,{operation,order});cases.push({family,values,key,operation,order:b.order,base:c.TreePrograms[family==='two-three'||family==='multiway'?'multiway':family],main:b.main,initial:b.initial.view,expected:plain(b.events.map(s=>({line:s.line,frames:s.frames.map(f=>({name:f.name,locals:f.locals}))}))),result:plain(b.result)});}
for(const family of ['bst','avl','two-three','multiway']){
 for(const op of ['build','search','insert','delete','preorder','inorder','postorder'])add(family,[40,20,60,10,30,50,70,25],op==='delete'?40:35,op);
 add(family,[],0,'insert');add(family,[0],0,'delete');add(family,[-2.5,0,3.25,3.25],0,'search');
}
for(const example of Object.values(E.cases))add(example.family,example.values,example.key,example.operation);
const py=spawnSync('python3',['-c',String.raw`import sys,json,types
cases=json.load(sys.stdin)
for case in cases:
 ns={'values':case['values'][:],'key':case['key'],'order':case['order'],'root':None}
 exec(compile(case['base'],'tree-program.py','exec'),ns)
 multi=case['family'] in ('two-three','multiway')
 if case['operation']!='build':
  for value in ns['values']:
   ns['root']=ns['insert_root'](ns['root'],value,case['order']) if multi else ns['insert'](ns['root'],value)
 ids={};objects={};next_id=0
 graph={n['id']:n for n in case['initial']['graph']}
 def map_initial(node,ref):
  global next_id
  if node is None:return
  ids[id(node)]=ref;objects[id(node)]=node;next_id=max(next_id,int(ref[1:])+1)
  children=node.children if multi else [node.left,node.right]
  for child,child_ref in zip(children,graph[ref]['children']):map_initial(child,child_ref)
 map_initial(ns['root'],case['initial']['root'])
 def register(value):
  global next_id
  if isinstance(value,types.SimpleNamespace):
   if id(value) not in ids:ids[id(value)]='N'+str(next_id);next_id+=1;objects[id(value)]=value
  elif isinstance(value,list):
   for v in value:register(v)
 def normal(value):
  if isinstance(value,types.SimpleNamespace):
   register(value)
   return dict(ref=ids[id(value)],**({'keys':value.keys[:],'children':[ids[id(child)] for child in value.children]} if multi else dict(key=value.key,left=ids[id(value.left)] if value.left is not None else None,right=ids[id(value.right)] if value.right is not None else None,**({'height':value.height} if hasattr(value,'height') else {}))))
  if isinstance(value,list):return [normal(v) for v in value]
  return value
 names=set(k for k,v in ns.items() if callable(v) and getattr(v,'__code__',None))
 pending={};events=[];module_names={'root','values','key','order','result','output','value'}
 def record(frame,line):
  frames=[];current=frame
  while current:
   if current.f_code.co_filename=='tree-program.py':
    name='Top level' if current.f_code.co_name=='<module>' else current.f_code.co_name
    local=dict(current.f_locals)
    if name=='Top level':local={k:v for k,v in local.items() if k in module_names}
    frames.append({'name':name,'locals':{k:normal(v) for k,v in local.items()}})
   current=current.f_back
  events.append({'line':line,'frames':list(reversed(frames))})
 def observe(frame,event,arg):
  if frame.f_code.co_filename!='tree-program.py':return observe
  identity=id(frame)
  if event=='line':
   if identity in pending:record(frame,pending[identity])
   pending[identity]=frame.f_lineno
  elif event=='return':
   register(arg)
   if identity in pending:record(frame,pending.pop(identity))
  return observe
 sys.settrace(observe)
 exec(compile('\n'*(case['base'].count('\n')+1)+case['main'],'tree-program.py','exec'),ns)
 sys.settrace(None)
 if events!=case['expected']:
  mismatch=next(((i,a,b) for i,(a,b) in enumerate(zip(events,case['expected'])) if a!=b),None)
  raise AssertionError(case['family']+' '+case['operation']+' events '+str((len(events),len(case['expected'])))+' mismatch '+str(mismatch))
print('PASS '+str(len(cases))+' tree traces match actual Python line execution, references, local variables and call stacks.')`],{input:JSON.stringify(cases),encoding:'utf8',maxBuffer:3e6});
assert.equal(py.status,0,py.stderr);process.stdout.write(py.stdout);
