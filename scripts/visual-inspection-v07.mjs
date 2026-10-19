import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {chromium,webkit} from 'playwright';
const host='http://127.0.0.1:4184';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4184','--strictPort'],{stdio:'ignore'});
mkdirSync('visual',{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function visual(type,mobile){
 const browser=await type.launch({headless:true});
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},
   isMobile:mobile,hasTouch:mobile,colorScheme:'light'});
 const page=await context.newPage(),prefix=mobile?'mobile':'desktop';
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(host,{waitUntil:'networkidle'});
  const control=page.locator('.crm-call-surface');
  if(!mobile){
   const bar=await control.boundingBox();
   await page.screenshot({path:'visual/dialer-idle.jpg',type:'jpeg',quality:80,
     clip:{x:bar.x-8,y:bar.y-10,width:450,height:90}});
   await page.getByRole('button',{name:'Open keypad',exact:true}).click();
   const panel=await page.locator('.crm-topbar-keypad').boundingBox();
   await page.screenshot({path:'visual/dialer-keypad.jpg',type:'jpeg',quality:80,
     clip:{x:bar.x-8,y:bar.y-10,width:450,height:Math.ceil(panel.y+panel.height-bar.y+18)}});
   await page.getByRole('button',{name:'Open keypad',exact:true}).click();
  }
  await page.locator('.np-launch').click();
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-all-light.jpg',type:'jpeg',quality:76});
  await page.locator('.np-root-tabs button').filter({hasText:'Calls'}).click();
  await page.getByRole('heading',{name:'Calls'}).waitFor();
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-calls-light.jpg',type:'jpeg',quality:76});
  await page.locator('.np-root').evaluate(el=>el.setAttribute('data-theme','dark'));
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-calls-dark.jpg',type:'jpeg',quality:76});
  await page.getByRole('button',{name:'Phone Keypad'}).click();
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-keypad-dark.jpg',type:'jpeg',quality:76});
  await page.getByRole('button',{name:'Back to calls'}).click();
  await page.getByRole('button',{name:'Back to Communications'}).click();
  await page.locator('.np-root-tabs button').filter({hasText:'Messages'}).click();
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-messages-dark.jpg',type:'jpeg',quality:76});
  await page.getByRole('button',{name:'WhatsApp chats'}).click();
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-whatsapp-dark.jpg',type:'jpeg',quality:76});
  await page.locator('.np-root').evaluate(el=>el.setAttribute('data-theme','light'));
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-whatsapp-light.jpg',type:'jpeg',quality:76});
  await page.locator('.np-wa-list-row').first().click();
  await page.locator('.np-device').screenshot({path:'visual/'+prefix+'-whatsapp-thread-light.jpg',type:'jpeg',quality:76});
  assert.equal(errors.length,0,'No page errors during visual inspection: '+errors.join('; '));
 }finally{await browser.close();}
}
async function battery(){
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>{
  window.CRMPhoneProvider={
    devices:[{id:'phone-1',connected:true}],
    getDeviceStatus:()=>({batteryPercent:35,lowPowerMode:true,charging:false}),
    subscribe(handler){this.handlers??=new Set();this.handlers.add(handler);return ()=>this.handlers.delete(handler)}
  };
 });
 try{
  await page.goto(host,{waitUntil:'networkidle'});
  await page.locator('.np-launch').click();
  const b=page.locator('.np-battery');
  await b.locator('.np-battery-percent').getByText('35').waitFor();
  assert.match(await b.getAttribute('aria-label'),/35 percent.*low power/);
  await page.locator('.np-device').screenshot({path:'visual/provider-low-power.jpg',type:'jpeg',quality:76});
  await page.evaluate(()=>window.CRMPhoneProvider.handlers.forEach(handler=>handler({deviceId:'phone-1',batteryPercent:46,charging:true,lowPowerMode:false})));
  await b.locator('.np-battery-percent').getByText('46').waitFor();
  assert.match(await b.getAttribute('aria-label'),/46 percent, charging/);
  assert.equal(await page.locator('.np-battery-bolt').count(),1);
  await page.locator('.np-device').screenshot({path:'visual/provider-charging.jpg',type:'jpeg',quality:76});
 }finally{await browser.close()}
}
try{
 for(let i=0;i<80;i++){try{if((await fetch(host)).ok)break}catch{}await sleep(250)}
 await visual(chromium,false);
 await visual(webkit,true);
 await battery();
 console.log('Visual states saved and device telemetry contract passed.');
}finally{server.kill()}
