import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from 'playwright';
import {mkdirSync} from 'node:fs';
const host='http://127.0.0.1:4197',server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4197','--strictPort'],{stdio:'ignore'});
mkdirSync('visual',{recursive:true});
const delay=t=>new Promise(r=>setTimeout(r,t));
async function test(engine,theme){
 const browser=await engine.launch();
 const page=await browser.newPage({viewport:{width:1440,height:900},colorScheme:theme});
 const issues=[];page.on('pageerror',e=>issues.push(e.message));
 try{
  await page.goto(host,{waitUntil:'networkidle'});
  await page.locator('html').evaluate((el,mode)=>el.setAttribute('data-theme',mode),theme);
  const row=page.locator('.il-grid-table tbody tr[data-lead-id]').first();await row.click();
  await page.locator('.lead-inline-details').waitFor({state:'visible'});
  await page.waitForTimeout(400);
  const metrics=await page.locator('.lead-detail-primary-grid').evaluate(e=>{
   const company=e.querySelector('section'),fields=[...company.querySelectorAll('.lead-detail-fields>div')].map(x=>{const r=x.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width}});
   const card=e.closest('.lead-inline-details');
   return {columns:getComputedStyle(e).gridTemplateColumns.split(' ').length,cardBg:getComputedStyle(card).backgroundColor,fields,
    companyHeight:company.getBoundingClientRect().height,fullHeight:card.getBoundingClientRect().height};
  });
  assert.equal(metrics.columns,5,'Primary detail matrix needs 3 columns');
  assert.ok(metrics.fields.length>=6);
  assert.ok(Math.abs(metrics.fields[0].y-metrics.fields[1].y)<2 && Math.abs(metrics.fields[0].y-metrics.fields[2].y)<2,'First three company labels on same row');
  assert.ok(metrics.companyHeight<245,'Compact company detail');
  assert.ok(metrics.fullHeight<540,'Compact full lead dropdown');
  assert.notEqual(metrics.cardBg,'rgb(251, 252, 253)','No stale white expanded panel');
  await page.locator('.lead-inline-details').screenshot({path:'visual/v09-'+theme+'-lead-details.jpg',type:'jpeg',quality:69});
  await page.getByRole('button',{name:'Email',exact:true}).first().click();
  const folder=page.locator('.gm-folder').filter({hasText:'Sent'}).first();await folder.waitFor({state:'visible'});
  const style=await folder.evaluate(e=>({color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));
  if(theme==='dark')assert.notEqual(style.color,'rgb(68, 71, 70)','Dark mail folders must inherit themed color');
  await page.locator('.gm-mail-app').screenshot({path:'visual/v09-'+theme+'-email.jpg',type:'jpeg',quality:65});
  await page.locator('.np-launch').click();
  await page.getByRole('button',{name:'Calls',exact:true}).click();
  await page.getByRole('button',{name:'Phone Keypad'}).click();
  const geom=await page.locator('.np-in-call').evaluate(e=>{
   const buttons=[...e.querySelectorAll('button')];const bounds=buttons.map(x=>{const r=x.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
   return {bounds,overflow:e.scrollWidth>e.clientWidth};
  });
  assert.equal(geom.bounds.length,6);
  assert.ok(!geom.overflow,'Keypad controls must stay inside shell');
  assert.ok(new Set(geom.bounds.slice(0,4).map(x=>Math.round(x.y))).size===1,'First four controls aligned');
  assert.ok(geom.bounds[4].y > geom.bounds[0].y+geom.bounds[0].h+12,'Second row below control labels');
  await page.locator('.np-device').screenshot({path:'visual/v09-'+theme+'-keypad.jpg',type:'jpeg',quality:69});
  console.log('v09 layout',engine===webkit?'WebKit':'Chromium',theme,metrics.companyHeight,metrics.fullHeight,'PASS');
  assert.deepEqual(issues,[]);
 }finally{await browser.close()}
}
try{
 for(let i=0;i<85;i++){try{if((await fetch(host)).ok)break}catch{}await delay(180)}
 await test(chromium,'light');await test(chromium,'dark');await test(webkit,'light');await test(webkit,'dark');
}finally{server.kill()}
