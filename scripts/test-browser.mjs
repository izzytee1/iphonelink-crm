import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';

const host='http://127.0.0.1:4173';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:'ignore'});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function ready(){
 for(let attempt=0;attempt<80;attempt++){
  try{const response=await fetch(host);if(response.ok)return}catch{}
  if(server.exitCode!==null)throw new Error('Vite server exited');
  await sleep(250);
 }
 throw new Error('Vite server did not start');
}
async function run(type,mobile){
 const browser=await type.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,colorScheme:mobile?'light':'dark',deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(host,{waitUntil:'networkidle'});
  if(mobile){
   const dimensions=await page.evaluate(()=>({scroll:document.querySelector('.crm-scroll-viewport').scrollWidth,viewport:document.querySelector('.crm-scroll-viewport').clientWidth,canvas:document.querySelector('.crm-app').getBoundingClientRect().width,view:window.visualViewport?.width||window.innerWidth,layout:window.innerWidth,small:matchMedia('(max-width:767px)').matches}));
   assert.ok(dimensions.scroll>=1400,'Desktop CRM must extend beyond phone viewport');
   assert.ok(dimensions.canvas>=1400,'CRM must initially be full desktop width');
   console.log('Mobile viewport:',JSON.stringify(dimensions));
   assert.ok(dimensions.view<500&&dimensions.viewport<500,'Browser must remain phone-sized');
   await page.locator('.crm-scroll-viewport').evaluate(n=>n.scrollLeft=550);
   assert.ok((await page.locator('.crm-scroll-viewport').evaluate(n=>n.scrollLeft))>100,'Desktop viewport must pan horizontally');
   await page.locator('.crm-scroll-viewport').evaluate(n=>n.scrollLeft=0);
   assert.ok(dimensions.view<dimensions.canvas,'Visual viewport must show only part of full desktop workspace');
   if(type===chromium){
     const before=await page.evaluate(()=>({visual:window.visualViewport?.offsetLeft||0,grid:document.querySelector('.il-grid-scroll')?.scrollLeft||0,workspace:document.querySelector('.crm-scroll-viewport')?.scrollLeft||0}));
     const cdp=await context.newCDPSession(page);
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y:52}]});
     for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:320-i*25,y:52}]});
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await page.waitForTimeout(350);
     const after=await page.evaluate(()=>({visual:window.visualViewport?.offsetLeft||0,grid:document.querySelector('.il-grid-scroll')?.scrollLeft||0,workspace:document.querySelector('.crm-scroll-viewport')?.scrollLeft||0}));
     console.log('Finger swipe',JSON.stringify({before,after}));
     assert.ok(after.visual>before.visual+30||after.grid>before.grid+30||after.workspace>before.workspace+30,'Finger swipe must pan the oversized CRM');
     await page.locator('.crm-scroll-viewport').evaluate(n=>n.scrollLeft=0);
   await page.reload({waitUntil:'networkidle'});
   }
  }
  await page.getByRole('button',{name:'User menu'}).click();
  await page.getByRole('menuitem',{name:'Display settings'}).click();
  await page.getByRole('dialog',{name:'Display settings'}).waitFor();
  await page.getByRole('button',{name:'Dark',exact:true}).click();
  assert.equal(await page.locator('.crm-app').getAttribute('data-theme'),'dark','Dark theme must apply');
  await page.getByRole('button',{name:'Light',exact:true}).click();
  assert.equal(await page.locator('.crm-app').getAttribute('data-theme'),'light','Light theme must apply');
  await page.locator('#crmCellDensity').selectOption('compact');
  assert.ok(await page.locator('.crm-app.crm-density-compact').count(),'Row density must change');
  await page.getByRole('button',{name:'Increase font size'}).click();
  assert.ok(Number(await page.locator('.crm-app').evaluate(n=>getComputedStyle(n).getPropertyValue('--crm-font-offset').trim().replace('px','')))>0,'Font size must change');
  await page.locator('#crmScreenScale').focus();
  await page.locator('#crmScreenScale').press('ArrowRight');
  assert.ok(Number(await page.locator('.crm-app').evaluate(n=>getComputedStyle(n).getPropertyValue('--crm-scale').trim()))>0.99,'Scale setting must change');
  await page.getByRole('button',{name:'Restore display defaults'}).click();
  await page.getByRole('button',{name:'Close settings'}).click();
  await page.getByRole('button',{name:'Select phone'}).click();
  await page.getByRole('group',{name:'Available phones'}).getByRole('button',{name:/Phone 2/}).click();
  await page.getByRole('button',{name:'Select phone'}).click();
  await page.getByRole('group',{name:'Available phones'}).getByRole('button',{name:/Phone 1/}).click();
  await page.getByRole('button',{name:'Open keypad'}).click();
  assert.equal(await page.locator('.crm-topbar-keypad button[data-dtmf]').count(),12);
  await page.locator('.crm-topbar-keypad button[data-dtmf]').first().click();
  assert.ok((await page.getByRole('textbox',{name:'Topbar phone number'}).inputValue()).includes('1'),'Topbar DTMF must fill dialer');
  await page.getByRole('button',{name:'Open keypad'}).click();
  await page.getByRole('button',{name:'Email',exact:true}).first().click();
  await page.locator('.gm-mail-app .gm-sidebar').waitFor();
  assert.ok((await page.locator('.gm-mail-app .gm-sidebar').evaluate(n=>n.getBoundingClientRect().width))>=230,'Gmail must retain desktop folder sidebar on phone');
  await page.getByRole('button',{name:'Leads',exact:true}).first().click();
  await page.getByRole('button',{name:'Comms'}).click({timeout:8000});
  await page.locator('.np-device.np-is-open').waitFor();
  const radius=await page.locator('.np-device').evaluate(n=>getComputedStyle(n).borderTopLeftRadius);
  assert.ok(parseFloat(radius)>=35,'Missing iPhone rounded shell');
  await page.locator('.np-root-tabs button').filter({hasText:'Messages'}).click();
  await page.getByRole('heading',{name:'Messages'}).waitFor();
  await page.getByRole('button',{name:'New iOS message'}).click();
  await page.getByText('New Message',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Close composer'}).click();
  await page.getByRole('button',{name:'WhatsApp chats'}).click();
  await page.getByRole('heading',{name:'Chats'}).waitFor();
  assert.equal(await page.locator('.np-root-tabs').count(),0,'Root tabs shown inside WhatsApp');
  await page.getByRole('button',{name:'New WhatsApp chat'}).click();
  await page.getByText('New chat',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.locator('.np-wa-list-row').first().click();
  await page.locator('.np-wa-thread').waitFor();
  assert.equal(await page.locator('.np-root-tabs').count(),0,'Root tabs in WhatsApp thread');
  await page.getByRole('button',{name:'Back to WhatsApp chats'}).click();
  await page.getByRole('button',{name:'Messages'}).first().click();
  await page.getByRole('heading',{name:'Messages'}).waitFor();
  await page.locator('.np-root-tabs button').filter({hasText:'Calls'}).click();
  await page.getByRole('heading',{name:'Calls'}).waitFor();
  await page.getByRole('button',{name:'Missed',exact:true}).click();
  await page.getByRole('button',{name:'All',exact:true}).first().click();
  await page.getByRole('button',{name:'Keypad',exact:true}).click();
  assert.equal(await page.locator('.np-dial-key').count(),12,'Missing DTMF digits');
  assert.equal(await page.locator('.np-in-call button').count(),6,'Call control positions moved');
  for(const d of '2225555555')await page.locator('.np-dial-key').filter({hasText:new RegExp('^'+d)}).first().click();
  const input=await page.getByRole('textbox',{name:'Phone number',exact:true}).inputValue();
  assert.equal(input,'(222) 555-5555','Dial formatting wrong');
  await page.getByRole('button',{name:'Back to calls'}).click();
  await page.locator('.np-root-tabs button').filter({hasText:'Email'}).click();
  await page.getByRole('heading',{name:'Inbox'}).waitFor();
  const oldBounds=await page.locator('.np-device').boundingBox();
  const grip=await page.getByRole('button',{name:'Resize Communications'}).boundingBox();
  assert.ok(grip,'Resize handle must be available');
  await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);
  await page.mouse.down();
  await page.mouse.move(grip.x+grip.width/2-35,grip.y+grip.height/2-42,{steps:5});
  await page.mouse.up();
  const resized=await page.locator('.np-device').boundingBox();
  assert.ok(resized.width<oldBounds.width-15,'Communications finger drag must resize the panel');
  assert.ok(await page.evaluate(()=>Boolean(localStorage.getItem('iphonelink.comms.size'))),'Communications size must persist');
  const overflow=await page.locator('.np-device').evaluate(n=>({height:n.clientHeight,scroll:n.scrollHeight,width:n.clientWidth,content:n.scrollWidth}));
  assert.ok(overflow.height>350,'Phone shell too short');
  console.log('Device geometry',JSON.stringify(overflow));
  assert.ok(overflow.content<=overflow.width+2,'Phone content horizontal overflow');
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log((type===chromium?'Chromium':'WebKit')+' '+(mobile?'mobile':'desktop')+': PASS, radius '+radius+', keypad '+input);
  await context.close();
 }finally{await browser.close()}
}
try{
 await ready();
 await run(chromium,false);
 await run(chromium,true);
 await run(webkit,true);
 console.log('3 browser/viewport tests passed including desktop canvas, settings, Gmail, topbar dialer, phone resize');
}catch(error){console.error(error);process.exitCode=1}
finally{server.kill('SIGTERM')}
