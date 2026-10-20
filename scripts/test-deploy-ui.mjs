import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from 'playwright';

const host='http://127.0.0.1:4271';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4271','--strictPort'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function run(engine,mobile){
 const browser=await engine.launch();
 try{
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(host,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'User menu'}).click();
  await page.getByRole('menuitem',{name:'Deploy to Vercel'}).click();
  const dialog=page.getByRole('dialog',{name:'Deploy iPhoneLink to Vercel'});
  await dialog.waitFor();
  assert.equal(await dialog.getByText('Publish iPhoneLink').isVisible(),true);
  assert.equal(await dialog.getByRole('link',{name:/iphonelink-crm-gamma/}).getAttribute('href'),'https://iphonelink-crm-gamma.vercel.app');
  assert.equal(await dialog.getByRole('button',{name:'Deploy latest to Vercel'}).count(),0,'Do not offer an unconfigured live deploy');
  const geometry=await dialog.evaluate(e=>{const a=e.getBoundingClientRect();return{width:a.width,height:a.height,viewportWidth:window.innerWidth,viewportHeight:window.innerHeight}});
  assert.ok(geometry.width<=geometry.viewportWidth+1 && geometry.height<=geometry.viewportHeight+1,'Deploy modal fits the available screen');
  await dialog.getByRole('button',{name:'Close deployment panel'}).click();
  assert.equal(await dialog.count(),0);
  assert.deepEqual(errors,[]);
  console.log(`Deploy control UI PASS ${mobile?'mobile WebKit':'desktop Chromium'}`);
 } finally{await browser.close()}
}
try{
 let ready=false;
 for(let n=0;n<80;n++){try{if((await fetch(host)).ok){ready=true;break}}catch{}await sleep(250)}
 assert.ok(ready,'Vite dev server did not start');
 await run(chromium,false);
 await run(webkit,true);
}finally{server.kill()}
