const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),c={};vm.createContext(c);
for(const file of ['tree-runtime.js','lab-programs.js','lab-engine.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
const E=c.LabEngine,plain=x=>JSON.parse(JSON.stringify(x)),ids=['edit-distance','grid-sum','knapsack-dp','coin-row','minimum-coins'];let runs=0,moves=0;
function check(id,config){
 const b=E.build(id,config),last=b.events.at(-1),tracing=b.events.filter(s=>s.view.traceback);assert.equal(b.initial.view.traceback,null);let previous=null;
 for(const s of b.events){const trace=s.view.traceback;if(!trace)continue;const trail=plain(trace.trail),cell=plain(trace.cell),table=s.view.table,matrix=Array.isArray(table[0]);assert(Object.isFrozen(trace));assert(Object.isFrozen(trace.trail));assert.deepEqual(cell,trail.at(-1));assert.deepEqual(trail[0],matrix?[table.length-1,table[0].length-1]:[table.length-1]);assert.deepEqual(trail.slice(0,previous?.length||0),previous||[],'the route only extends during forward execution');assert.equal(new Set(trail.map(p=>p.join(','))).size,trail.length,'no repeated forward hops');assert(Array.isArray(id==='edit-distance'||id==='grid-sum'?s.view.locals.path:s.view.locals.chosen),'the marker starts only in reconstruction');
  if(!previous||cell.join(',')!==previous.at(-1).join(',')){assert(s.quick,'Quick Run shows every traceback movement');moves++;}
  for(const p of trail){assert(p.every(Number.isInteger));assert(p.every(v=>v>=0));assert(p[0]<table.length);if(matrix)assert(p[1]<table[p[0]].length);}
  if((id==='edit-distance'||id==='grid-sum')&&s.view.code.startsWith('while i '))assert.deepEqual(cell,[s.view.locals.i,s.view.locals.j],'the cursor follows the stable loop coordinates before choosing a predecessor');
  previous=trail;
 }
 if(tracing.length){const trace=plain(last.view.traceback),trail=trace.trail;
  if(id==='edit-distance'||id==='grid-sum'){const expected=plain(last.view.locals.path).map(p=>p.slice(0,2));if(id==='edit-distance'&&expected.at(-1)?.join(',')!=='0,0')expected.push([0,0]);if(!expected.length)expected.push([0,0]);assert.deepEqual(trail,expected);assert.deepEqual(trace.cell,[0,0]);for(let i=1;i<trail.length;i++){const dr=trail[i-1][0]-trail[i][0],dc=trail[i-1][1]-trail[i][1];assert(dr>=0&&dr<=1&&dc>=0&&dc<=1&&dr+dc>0);if(id==='grid-sum')assert.equal(dr+dc,1);}}
  if(id==='knapsack-dp'){assert.equal(trail.length,config.weights.length+1);const chosen=new Set(last.result[1]);for(let j=1;j<trail.length;j++){const [row,capacity]=trail[j-1],[nextRow,nextCapacity]=trail[j];assert.equal(nextRow,row-1);assert.equal(capacity-nextCapacity,chosen.has(row-1)?config.weights[row-1]:0);}assert.deepEqual(trace.cell,[0,config.capacity-last.result[1].reduce((sum,i)=>sum+config.weights[i],0)]);}
  if(id==='coin-row'){assert.deepEqual(trace.cell,[0]);for(let j=1;j<trail.length;j++)assert([1,2].includes(trail[j-1][0]-trail[j][0]));}
  if(id==='minimum-coins'){assert.deepEqual(trace.cell,[0]);assert.deepEqual(trail.slice(1).map((p,i)=>trail[i][0]-p[0]),plain(last.result[1]));}
 }
 if(id==='minimum-coins'&&last.result[0]===-1||id==='grid-sum'&&!config.grid.length)assert.equal(tracing.length,0,'no fabricated traceback for an unavailable result');
 const frozen=tracing[0];if(frozen){const before=JSON.stringify(frozen.view.traceback);E.build(id,config);assert.equal(JSON.stringify(frozen.view.traceback),before,'rebuilding does not mutate older cursor states');}
 runs++;return b;
}
for(const id of ids)for(const preset of E.algorithms.find(a=>a.id===id).examples)check(id,preset.config);
for(const[first,second]of [['',''],['','abc'],['abc',''],['a','b'],['🐱a','🐱b'],['same','same']])check('edit-distance',{first,second});
check('knapsack-dp',{weights:[],values:[],capacity:4});check('knapsack-dp',{weights:[5,6],values:[4,7],capacity:3});check('coin-row',{coins:[]});check('coin-row',{coins:[2.5]});check('coin-row',{coins:[0]});check('grid-sum',{grid:[],maximize:true});check('grid-sum',{grid:[[4]],maximize:false});check('minimum-coins',{coins:[2],amount:3});check('minimum-coins',{coins:[2],amount:0});
const diagonal=check('edit-distance',{first:'ab',second:'ab'});for(const s of diagonal.events)if(s.view.code==='i -= 1'&&s.view.locals.j>0)assert.deepEqual(plain(s.view.traceback.cell),plain(s.view.locals.path.at(-1).slice(0,2)),'half-updated diagonal coordinates do not invent a sideways hop');
for(const id of ['fibonacci-memo','fibonacci-table','grid-paths','prefix-sums'])assert(E.build(id,E.example(id)).events.every(s=>s.view.traceback===null),'no fake route for '+id);
console.log('PASS '+runs+' DP reconstructions and '+moves+' visible cursor transitions: final-cell starts, true diagonal / skipped-cell predecessors, terminal cells, empty/unreachable cases, immutable routes and Quick Run checkpoints.');
