import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from 'playwright';
const host='http://127.0.0.1:4271';
const valid='https://api.vercel.com/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/testHookToken1234';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4271','--strictPort'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function openPanel(page){
 await page.getByRole('button',{name:'User menu'}).click();
 await page.getByRole('menuitem',{name:'Deploy to Vercel'}).click();
 const dialog=page.getByRole('dialog',{name:'Deploy iPhoneLink to Vercel'});
 await dialog.waitFor();return dialog
}
async function run(engine,mobile){
 const browser=await engine.launch();
 try{
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
  const errors=[];let requestCount=0;
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/api/deploy',async route=>{
   requestCount++;
   const req=route.request();assert.equal(req.method(),'POST');assert.equal(req.postDataJSON().hookUrl,valid);
   if(requestCount===3)await route.fulfill({status:502,contentType:'application/json',body:JSON.stringify({error:'Could not contact Vercel; try again later'})});
   else await route.fulfill({status:202,contentType:'application/json',body:JSON.stringify({jobId:'queued-job',status:'queued'})});
  });
  await page.goto(host,{waitUntil:'networkidle'});
  let dialog=await openPanel(page);
  assert.equal(await dialog.getByText('Publish iPhoneLink').isVisible(),true);
  assert.equal(await dialog.getByRole('link',{name:/iphonelink-crm-gamma/}).getAttribute('href'),'https://iphonelink-crm-gamma.vercel.app');
  assert.equal(await dialog.getByRole('button',{name:'Connect & deploy'}).isEnabled(),false);
  await dialog.getByLabel('One-time connection').fill('https://evil.example/integrations/deploy');
  await dialog.getByRole('button',{name:'Connect & deploy'}).click();
  await dialog.getByText(/Paste the Deploy Hook/).waitFor();
  assert.equal(requestCount,0);
  await dialog.getByLabel('One-time connection').fill(valid);
  await dialog.getByRole('button',{name:'Connect & deploy'}).click();
  await dialog.getByRole('status').getByText(/Deployment requested/).waitFor();
  assert.equal(requestCount,1);
  assert.equal(await dialog.getByRole('button',{name:'Deploy now'}).count(),1);
  assert.equal(await dialog.getByText(/Open ChatGPT/).count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('iphonelink.vercel.deployHook.v1')),valid);
  const geometry=await dialog.evaluate(e=>{const a=e.getBoundingClientRect();return{width:a.width,height:a.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}});
  assert.ok(geometry.width<=geometry.viewportWidth+1&&geometry.height<=geometry.viewportHeight+1);
  await dialog.getByRole('button',{name:'Close deployment panel'}).click();
  dialog=await openPanel(page);
  assert.equal(await dialog.getByLabel('One-time connection').count(),0);
  await dialog.getByRole('button',{name:'Deploy now'}).click();
  await dialog.getByRole('status').getByText(/Deployment requested/).waitFor();
  assert.equal(requestCount,2);
  await dialog.getByRole('button',{name:'Deploy now'}).click();
  await dialog.getByRole('status').getByText(/Could not contact Vercel/).waitFor();
  assert.equal(requestCount,3);
  await dialog.getByRole('button',{name:'Change connection'}).click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('iphonelink.vercel.deployHook.v1')),null);
  assert.equal(await dialog.getByRole('button',{name:'Connect & deploy'}).isEnabled(),false);
  assert.deepEqual(errors,[]);
  console.log(mobile?'Deploy button mobile WebKit PASS':'Deploy button desktop Chromium PASS');
 }finally{await browser.close()}
}
try{
 let ready=false;
 for(let n=0;n<80;n++){try{if((await fetch(host)).ok){ready=true;break}}catch{}await sleep(250)}
 assert.ok(ready,'Vite dev server did not start');
 await run(chromium,false);await run(webkit,true);
}finally{server.kill()}
