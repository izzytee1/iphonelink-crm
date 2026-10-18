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
  await page.getByRole('button',{name:'Comms'}).click();
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
  await page.getByRole('button',{name:'Missed'}).click();
  await page.getByRole('button',{name:'All',exact:true}).first().click();
  await page.getByRole('button',{name:'Keypad'}).click();
  assert.equal(await page.locator('.np-dial-key').count(),12,'Missing DTMF digits');
  assert.equal(await page.locator('.np-in-call button').count(),6,'Call control positions moved');
  for(const d of '2225555555')await page.locator('.np-dial-key').filter({hasText:new RegExp('^'+d)}).first().click();
  const input=await page.getByRole('textbox',{name:'Phone number'}).inputValue();
  assert.equal(input,'(222) 555-5555','Dial formatting wrong');
  await page.getByRole('button',{name:'Back to calls'}).click();
  await page.locator('.np-root-tabs button').filter({hasText:'Email'}).click();
  await page.getByRole('heading',{name:'Inbox'}).waitFor();
  const overflow=await page.locator('.np-device').evaluate(n=>({height:n.clientHeight,scroll:n.scrollHeight,width:n.clientWidth,content:n.scrollWidth}));
  assert.ok(overflow.height>350,'Phone shell too short');
  assert.ok(overflow.content<=overflow.width+2,'Phone content horizontal overflow');
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log(type.name+' '+(mobile?'mobile':'desktop')+': PASS, device '+radius+', keypad '+input);
  await context.close();
 }finally{await browser.close()}
}
try{
 await ready();
 await run(chromium,false);
 await run(chromium,true);
 await run(webkit,true);
 console.log('3 browser/viewport smoke tests passed');
}catch(error){console.error(error);process.exitCode=1}
finally{server.kill('SIGTERM')}
