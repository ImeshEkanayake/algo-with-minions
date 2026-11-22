import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
const snapshot=()=>page.evaluate(()=>window.SortingStudio.snapshot());
const finish=()=>page.locator('#next').evaluate(button=>{let n=0;while(!button.disabled&&n<20000){button.click();n++;}return n;});
try{
 await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:4318/'));
 await page.evaluate(()=>localStorage.clear());await page.reload();
 assert.equal(await page.locator('#algorithm-title').textContent(),'Bubble sort');assert.equal(await page.locator('#algorithm-select option').count(),9);
 await page.locator('#next').click();await page.locator('#next').click();assert.equal(await page.locator('[data-variable="n"] .current-value').textContent(),'6');
 const before=await snapshot();await page.locator('#next').click();const after=await snapshot();await page.locator('#back').click();assert.deepEqual(await snapshot(),before);await page.locator('#next').click();assert.deepEqual(await snapshot(),after);
 for(const id of ['bubble','selection','insertion','merge','quick','heap','counting','pancake','exhaustive']){
  await page.selectOption('#algorithm-select',id);await page.locator('#array-input').fill('-2.5, 0, 3.25, -1, 3.25');await page.locator('#apply-array').click();
  assert.equal(await page.locator('.character[data-final="true"]').count(),0);
  const steps=await finish();assert(steps<20000,id);const s=await snapshot();assert(s.done,id);assert.deepEqual(s.items.map(x=>x.v),[-2.5,-1,0,3.25,3.25],id);assert.equal(await page.locator('.character[data-final="true"]').count(),5,id);
  await page.locator('#back').click();assert.equal((await snapshot()).done,undefined,id);await page.locator('#next').click();assert.deepEqual(await snapshot(),s,id);
 }
 await page.selectOption('#algorithm-select','bubble');await page.locator('#array-input').fill('5, 1, 4, 2, 8, 3');await page.locator('#apply-array').click();
 await page.locator('#play').click();const first=await page.evaluate(()=>SortingStudio.history().cursor);await page.waitForTimeout(1150);assert((await page.evaluate(()=>SortingStudio.history().cursor))>first);await page.locator('#pause').click();const paused=await snapshot();await page.waitForTimeout(1050);assert.deepEqual(await snapshot(),paused);
 await page.locator('#restart').click();await page.locator('#array-input').fill('1, NaN');await page.locator('#apply-array').click();assert(await page.locator('#input-error').isVisible());
 await page.locator('#array-input').fill('1, 2, 3');await page.locator('#apply-array').click();assert.equal(await page.locator('.character[data-final="true"]').count(),0);
 await page.locator('[data-category="searching"]').click();assert(await page.locator('#future-page').isVisible());await page.locator('#return-sorting').click();assert(await page.locator('#sorting-page').isVisible());
 await page.locator('#array-input').fill('5, 1, 4, 2, 8, 3');await page.locator('#apply-array').click();
 for(const width of [1440,1200,1024,900,768,640,510,430,375,320]){
  await page.setViewportSize({width,height:1100});await page.waitForTimeout(500);
  const bounds=await page.evaluate(()=>{const r=id=>document.getElementById(id).getBoundingClientRect();const scene=document.querySelector('.scene').getBoundingClientRect(),code=document.querySelector('.code-panel').getBoundingClientRect(),watch=document.querySelector('.variables-panel').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth+1,scene:{left:scene.left,right:scene.right,top:scene.top,bottom:scene.bottom},code:{left:code.left,right:code.right,top:code.top,bottom:code.bottom},watch:{left:watch.left,right:watch.right},stage:r('stage-viewport').right};});
  assert(!bounds.overflow,`page overflow ${width}: ${JSON.stringify(bounds)}`);
  assert(bounds.scene.right<=width+1,`scene overflow ${width}`);assert(bounds.stage<=bounds.scene.right+1,`stage overflow ${width}`);
  const overlapX=Math.min(bounds.scene.right,bounds.code.right)-Math.max(bounds.scene.left,bounds.code.left),overlapY=Math.min(bounds.scene.bottom,bounds.code.bottom)-Math.max(bounds.scene.top,bounds.code.top);assert(!(overlapX>1&&overlapY>1),`scene/code overlap ${width}`);
  assert(bounds.watch.right<=width+1,`watch overflow ${width}`);
  if([1440,1024,768,375,320].includes(width))await page.screenshot({path:`test-results/layout-${width}.png`,fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1100});await page.selectOption('#algorithm-select','quick');await page.locator('#array-input').fill('6, 3, 9, 1, 5, 8, 2, 7');await page.locator('#apply-array').click();
 await page.locator('#next').evaluate(button=>{for(let n=0;n<200;n++){button.click();if(document.querySelector('.character[data-final="true"]'))break;}});await page.waitForTimeout(600);await page.screenshot({path:'test-results/quicksort-active.png',fullPage:true});
 await page.selectOption('#algorithm-select','merge');await page.locator('#array-input').fill('-1.5, 3, 0, 2.25');await page.locator('#apply-array').click();
 await page.locator('#next').evaluate(button=>{for(let n=0;n<15;n++)button.click();});const mergeBefore=await snapshot();await page.locator('#next').click();await page.locator('#back').click();assert.deepEqual(await snapshot(),mergeBefore);
 await page.setViewportSize({width:375,height:1000});await page.waitForTimeout(600);await page.screenshot({path:'test-results/merge-phone.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: nine sorts with mixed decimals, exact backward/forward restore, hats, play/pause, validation, navigation, recursive state, and containment at ten widths from 320 to 1440.');
}finally{await browser.close();}
