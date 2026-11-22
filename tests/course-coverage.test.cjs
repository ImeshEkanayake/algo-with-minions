const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),c={};vm.createContext(c);
for(const f of ['engine.js','search-engine.js','tree-runtime.js','tree-programs.js','tree-engine.js','graph-programs.js','graph-engine.js','lab-programs.js','lab-engine.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const algorithms=[...c.SortingEngine.algorithms,...c.SearchingEngine.algorithms,...c.TreeEngine.algorithms,...c.GraphEngine.algorithms,...c.LabEngine.algorithms],ids=new Set(algorithms.map(a=>a.id)),coverage=JSON.parse(fs.readFileSync('course-coverage.json','utf8'));
assert.equal(ids.size,61);assert.equal(coverage.length,63);assert.equal(new Set(coverage.map(row=>row.title)).size,63);
for(const row of coverage){assert(ids.has(row.algorithm),row.title+' has a selectable algorithm');if(row.operation){assert(c.TreeEngine.algorithms.some(a=>a.id===row.algorithm));assert(c.TreeEngine.operations.some(op=>op.id===row.operation));}}
for(const a of c.LabEngine.algorithms)assert(coverage.some(row=>row.algorithm===a.id),a.id+' belongs to the agreed course scope');
assert.deepEqual(c.LabEngine.algorithms.reduce((counts,a)=>(counts[a.collection]=(counts[a.collection]||0)+1,counts),{}),{'dynamic-programming':9,hashing:5,optimization:5,mathematics:3,searching:4,trees:5});
console.log('PASS all 63 original course-plan rows resolve to implemented algorithms / tree operations across 61 menu entries; all 31 agreed additions are covered.');
