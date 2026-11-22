import {chromium} from 'playwright';import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});let checked=0;
try{
 for(const width of [1440,375]){
  const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:4318/');await page.locator('[data-category="graphs"]').click();await page.keyboard.press('Escape');
  const algorithms=await page.locator('#algorithm-select option').evaluateAll(options=>options.map(o=>o.value));
  for(const id of algorithms){
   await page.selectOption('#algorithm-select',id);await page.locator('#code-next').click();
   const presets=await page.locator('#graph-example option[value]').evaluateAll(options=>options.filter(o=>o.value).map(o=>o.value));
   for(const preset of presets){
    const expected=await page.evaluate(({id,preset})=>{const config=GraphEngine.examples[preset]();if(preset==='empty')config.directed=SortingStudio.snapshot().view.directed;try{GraphEngine.validate(id,config);return {valid:true};}catch(e){return {valid:false,reason:e.message};}},{id,preset});
    const option=page.locator('#graph-example option[value="'+preset+'"]');assert.equal(await option.evaluate(o=>o.disabled),!expected.valid,id+' '+preset+' availability');
    const before=await page.evaluate(()=>({snapshot:SortingStudio.snapshot(),history:SortingStudio.history(),example:document.getElementById('graph-example').value}));
    if(expected.valid){await page.selectOption('#graph-example',preset);assert.equal(await page.locator('#graph-example').inputValue(),preset);assert.equal(await page.locator('#input-error').isVisible(),false);}
    else{
     // Even a stale option or a synthetic change must not replace the algorithm/history.
     await page.locator('#graph-example').evaluate((select,value)=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));},preset);
     assert.deepEqual(await page.evaluate(()=>({snapshot:SortingStudio.snapshot(),history:SortingStudio.history(),example:document.getElementById('graph-example').value})),before,id+' '+preset+' preserves history');assert.equal(await page.locator('#input-error').textContent(),expected.reason);
    }
    assert.equal(await page.locator('#algorithm-select').inputValue(),id);assert.equal(await page.evaluate(()=>SortingStudio.history().algorithm),id);checked++;
   }
  }
  await page.selectOption('#algorithm-select','tsp');assert.match(await page.locator('#graph-help').textContent(),/7 vertices/);await page.selectOption('#graph-example','tsp');await page.locator('#code-next').click();const stored=await page.evaluate(()=>SortingStudio.snapshot());await page.reload();assert.equal(await page.locator('#algorithm-select').inputValue(),'tsp');assert.deepEqual(await page.evaluate(()=>SortingStudio.snapshot()),stored);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS '+checked+' algorithm/example combinations on desktop and phone: examples preserve the selected algorithm, incompatible data is disabled and safely rejected, history and last selection survive rejection, and TSP persists after reload.');
}finally{await browser.close();}
