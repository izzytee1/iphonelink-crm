import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from 'playwright';
const host='http://127.0.0.1:4182',sleep=ms=>new Promise(r=>setTimeout(r,ms));
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4182','--strictPort'],{stdio:'ignore'});
async function run(type,mobile){
 const browser=await type.launch({headless:true});
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(host,{waitUntil:'networkidle'});
  const ctl=page.locator('.crm-call-surface');
  const input=page.getByRole('textbox',{name:'Topbar phone number'});
  assert.equal(await ctl.count(),1);
  assert.equal(await ctl.evaluate(e=>getComputedStyle(e).backgroundImage.includes('gradient')),true);
  await input.fill('13052995147');
  assert.equal(await input.inputValue(),'1 (305) 299-5147','Preserve typed country digit');
  await page.getByRole('button',{name:'Open keypad',exact:true}).click();
  assert.equal(await page.locator('.crm-topbar-keypad > button').count(),12);
  await page.getByRole('button',{name:'Open keypad',exact:true}).click();
  if(!mobile){
   const grip=page.getByRole('button',{name:'Drag phone bar'});
   const box=await grip.boundingBox();
   await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
   await page.mouse.down();
   await page.mouse.move(box.x-95,box.y+115,{steps:12});
   await page.mouse.up();
   assert.equal(await ctl.evaluate(e=>e.classList.contains('is-floating')),true,'Phone bar should detach');
   await page.getByRole('button',{name:'Return phone bar to topbar'}).click();
   assert.equal(await ctl.evaluate(e=>e.classList.contains('is-floating')),false);
  }
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('crm:call-state',{detail:{phase:'active',number:'3052995147',name:'Test Call',startedAt:Date.now()-42000}})));
  await ctl.locator('.crm-call-main-action.is-end').waitFor({state:'visible'});
  assert.equal(await ctl.locator('.crm-call-main-action.is-end').count(),1);
  assert.equal(await ctl.locator('.crm-call-main-action.is-start').count(),0);
  await page.getByRole('button',{name:'Open call controls'}).click();
  assert.equal(await page.locator('.crm-floating-call').count(),1);
  assert.equal(await page.getByRole('button',{name:'Drag call panel'}).count(),1);
  await page.getByRole('button',{name:'Close call panel'}).click();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('crm:call-state',{detail:{phase:'idle'}})));
  await ctl.locator('input').waitFor({state:'visible'});
  assert.equal(await ctl.locator('input').count(),1,'Idle restores editable input');
  assert.equal(await page.locator('.crm-call-main-action.is-start').count(),1);
  if(!mobile){
    await page.locator('.np-launch').click();
    await page.getByRole('button',{name:'Messages',exact:true}).click();
    assert.ok(await page.locator('.np-channel-blue').count()>0,'iMessage mock conversations visible');
    await page.locator('.np-list-row').filter({has:page.locator('.np-channel-blue')}).first().click();
    assert.equal(await page.locator('.np-imessage-send').count(),1);
    await page.getByRole('button',{name:'SMS',exact:true}).click();
    assert.equal(await page.locator('.np-sms-send').count(),1);
    await page.getByRole('button',{name:'Back to messages'}).click();
    await page.getByRole('button',{name:'WhatsApp chats'}).click();
    await page.locator('.np-wa-list-row').first().click();
    await page.getByRole('textbox',{name:'WhatsApp message'}).fill('Local test message');
    assert.equal(await page.locator('.np-wa-submit svg').count(),1);
    await page.locator('.np-wa-submit').click();
    assert.ok((await page.locator('.np-status-note').textContent()).includes('not delivered'));
    assert.equal(await page.locator('.np-battery').getAttribute('aria-label'),'Phone battery information unavailable');
  }
  assert.deepEqual(errors,[],'No uncaught page errors');
  console.log((type===chromium?'Chromium':'WebKit')+(mobile?' mobile':' desktop')+': v08 PASS');
 }finally{await browser.close();}
}
try{
 for(let i=0;i<80;i++){try{const response=await fetch(host);if(response.ok)break;}catch{}await sleep(250);}
 await run(chromium,false);
 await run(chromium,true);
 await run(webkit,true);
 console.log('All v08 UI states PASS');
}finally{server.kill();}
