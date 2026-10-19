import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from 'playwright';
import {mkdirSync} from 'node:fs';
const host='http://127.0.0.1:4195';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4195','--strictPort'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
mkdirSync('visual',{recursive:true});
const rect=async el=>el.evaluate(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]});
async function stable(page,selector){
 const el=page.locator(selector).first();await el.waitFor({state:'visible'});
 const avatar=el.locator('.np-avatar'),before=await rect(avatar),row=await rect(el);
 const r=await el.boundingBox();
 await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
 await page.waitForTimeout(90);
 const during=await rect(avatar),pressed=await rect(el);
 for(let i=0;i<4;i++){assert.ok(Math.abs(before[i]-during[i])<1,'Avatar shifts when pressed');assert.ok(Math.abs(row[i]-pressed[i])<1,'Row shifts when pressed');}
 await page.mouse.move(r.x-25,r.y-12);await page.mouse.up();
}
async function run(type,mobile,theme){
 const browser=await type.launch(),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(host,{waitUntil:'networkidle'});await page.locator('.np-launch').click();
  await page.locator('.np-root').evaluate((el,theme)=>el.setAttribute('data-theme',theme),theme);
  await page.getByRole('button',{name:'Calls',exact:true}).click();
  await stable(page,'.np-call-main');
  await page.getByRole('button',{name:'Phone Search'}).click();
  await page.getByRole('searchbox',{name:'Search call history'}).fill('408');
  assert.ok(await page.locator('.np-call-row').count()>0);
  await page.locator('.np-device').screenshot({path:'visual/'+(mobile?'mobile-':'desktop-')+theme+'-calls.jpg',type:'jpeg',quality:70});
  await page.getByRole('button',{name:'Back to Communications'}).click();
  await page.getByRole('button',{name:'Messages',exact:true}).click();
  await stable(page,'.np-messages .np-list-row');
  await page.getByRole('button',{name:'WhatsApp chats'}).click();
  await stable(page,'.np-wa-list-row');
  const avatarColors=await page.locator('.np-wa-chats .np-avatar-solid').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).backgroundColor));
  assert.ok(avatarColors.length>=2 && new Set(avatarColors).size===1,'WhatsApp avatars should match original uniform slate style');

  assert.equal(await page.getByRole('button',{name:'Camera unavailable'}).count(),0);
  assert.equal(await page.locator('.np-wa-chips button').count(),2);
  await page.locator('.np-device').screenshot({path:'visual/'+(mobile?'mobile-':'desktop-')+theme+'-whatsapp.jpg',type:'jpeg',quality:70});
  await page.locator('.np-wa-list-row').first().click();
  assert.equal(await page.getByRole('button',{name:'Video unavailable'}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Voice messages unavailable'}).count(),0);
  await page.locator('.np-device').screenshot({path:'visual/'+(mobile?'mobile-':'desktop-')+theme+'-chat.jpg',type:'jpeg',quality:70});
  assert.deepEqual(errors,[]);
  console.log('Visual, press and navigation PASS',type===webkit?'WebKit':'Chromium',theme,mobile?'mobile':'desktop');
 }finally{await browser.close()}
}
async function battery(mode){
 const browser=await chromium.launch(),page=await browser.newPage();
 try{
  await page.addInitScript(mode=>{
   window.CRMPhoneProvider={
    getDevices(){return mode==='offline'?[]:[{id:'phone-1',connected:true}]},
    getDeviceStatus(){return mode==='yellow'?{batteryPercent:35,charging:false,lowPowerMode:true}:{batteryPercent:68,charging:true,lowPowerMode:false}}
   };
  },mode);
  await page.goto(host,{waitUntil:'networkidle'});await page.locator('.np-launch').click();
  const bat=page.locator('.np-battery');
  const exp=mode==='yellow'?'35':mode==='charging'?'68':'—';
  await bat.getByText(exp).waitFor();
  assert.equal(await bat.locator('.np-battery-bolt').count(),mode==='charging'?1:0);
  assert.ok((await bat.getAttribute('aria-label')).includes(mode==='offline'?'unavailable':'percent'));
  console.log('Battery',mode,'PASS');
 }finally{await browser.close()}
}
try{
 for(let i=0;i<80;i++){try{if((await fetch(host)).ok)break}catch{}await sleep(250)}
 await run(chromium,false,'light');await run(chromium,false,'dark');await run(webkit,true,'light');await run(webkit,true,'dark');
 await battery('offline');await battery('yellow');await battery('charging');
}finally{server.kill()}
