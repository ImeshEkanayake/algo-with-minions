const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('engine.js','utf8'),context);
const E=context.SortingEngine;
const normal=x=>x===0?0:x;
const examples=[[],[0],[3,2,1],[1,2,3],[5,1,4,2,8,3],[-3,-1,-9],[0,-1,1,0],[-2.5,0,3.2,-.25,3.2],[.3,.1,.2],[4,4,4,4],[-0,0,-0],[-1e200,1e200,1e-200,-1e-200]];
let seed=83;for(let trial=0;trial<35;trial++){const a=[];for(let i=0;i<trial%11;i++){seed=seed*16807%2147483647;a.push((seed%81-40)/4);}examples.push(a);}
let checked=0,events=0;
for(const algorithm of E.algorithms){
 for(const values of examples){
  if(values.length>(algorithm.maxLength||10))continue;
  const result=E.build(algorithm.id,values),last=result.events.at(-1);
  assert(last.done,algorithm.id);const actual=Array.from(last.items,x=>normal(x.v)),expected=[...values].sort((a,b)=>a-b).map(normal);assert.deepEqual(actual,expected,algorithm.id+' '+values);
  assert.equal(new Set(Array.from(last.items,x=>x.id)).size,values.length);
  assert.equal(Object.keys(last.fixed).length,values.length);
  if(algorithm.stable)for(let i=1;i<last.items.length;i++)if(last.items[i-1].v===last.items[i].v)assert(last.items[i-1].id<last.items[i].id,algorithm.id+' stability');
  for(const snapshot of result.events){
   for(const [id,fixed]of Object.entries(snapshot.fixed))assert.equal(last.items[fixed.index].id,Number(id),algorithm.id+' premature final position');
   assert.equal(new Set(Array.from(snapshot.items,x=>x.id)).size,values.length,algorithm.id+' duplicate visual identity');
   assert(snapshot.line>0&&snapshot.line<=algorithm.code.length,algorithm.id+' line');
  }
  assert.equal(Object.keys(result.initial.fixed).length,0);
  checked++;events+=result.events.length;
 }
 console.log('PASS',algorithm.name);
}
for(const [text,expected]of [['-2, 0, 1.5',[-2,0,1.5]],['[-.5, +2e-3, 0]',[-.5,.002,0]],['−3, 1',[-3,1]],['[]',[]],['',[]]])assert.deepEqual(Array.from(E.parse(text)),expected);
for(const text of ['NaN','Infinity','1e999','hello','9007199254740993'])assert.throws(()=>E.parse(text));
assert.throws(()=>E.parse('1,2,3,4,5,6,7',6));
console.log(`Validated ${checked} runs and ${events} reversible snapshots, including negative numbers, positive numbers, zeros, decimals, duplicate values, extremes and empty arrays.`);
