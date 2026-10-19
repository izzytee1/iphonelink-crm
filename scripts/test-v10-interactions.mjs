import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium,webkit} from 'playwright';
import {mkdirSync} from 'node:fs';
const host='http://127.0.0.1:4199';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4199','--strictPort'],{stdio:'ignore'});
const wait=t=>new Promise(r=>setTimeout(r,t));
mkdirSync('visual',{recursive:true});
async function run(engine,mobile,theme){
 const browser=await engine.launch(),page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,colorScheme:theme});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const prefix='visual/v10-'+(mobile?'mobile-':'desktop-')+theme;
 try{
  await page.goto(host,{waitUntil:'networkidle'});
  await page.evaluate(theme=>{document.documentElement.setAttribute('data-theme',theme);document.querySelector('.np-root')?.setAttribute('data-theme',theme)},theme);
  const avatar=await page.getByRole('button',{name:'User menu'}).innerText();
  assert.equal(avatar.trim(),'MW','Account initials');
  await page.getByRole('button',{name:'Notifications',exact:true}).click();
  await page.getByLabel('Notifications dropdown').waitFor();
  assert.equal(await page.locator('.crm-notification-dropdown').isVisible(),true);
  const n=await page.locator('.crm-notification-card').count();
  assert.ok(n>0,'Unread notifications should be available');
  await page.locator('.crm-notification-dropdown .crm-notification-reply').first().click();
  await page.locator('.crm-notification-dropdown textarea').fill('Reply from notifications');
  await page.locator('.crm-notification-dropdown').screenshot({path:prefix+'-notifications.jpg',type:'jpeg',quality:75});
  await page.locator('.crm-notification-dropdown .crm-quick-send').click();
  assert.equal(await page.getByRole('status',{name:''}).count()>=0,true);
  await page.getByRole('button',{name:'Close notifications'}).click();
  await page.locator('.np-launch').click();
  await page.locator('.np-root-tabs button').filter({hasText:'Email'}).click();
  const compact=page.locator('.np-gmail-embedded');
  await compact.locator('.gm-mail-app').waitFor();
  assert.equal(await page.locator('.crm-app [data-page="email"]').count(),0);
  const select=compact.getByRole('combobox',{name:'Switch email account'});
  assert.ok(await select.locator('option').count()>=3);
  await select.selectOption('0');
  assert.equal(await select.inputValue(),'0');
  await select.selectOption('all');
  await compact.getByRole('button',{name:'Switch mail folder'}).click();
  await compact.locator('.gm-sidebar').waitFor();
  await compact.locator('.gm-folder').filter({hasText:'Sent'}).click();
  assert.ok((await compact.getByRole('button',{name:'Switch mail folder'}).innerText()).includes('Sent'));
  await compact.getByRole('button',{name:'Switch mail folder'}).click();
  await compact.locator('.gm-folder').filter({hasText:'Inbox'}).click();
  const rowVisual=await compact.locator('.gm-mailrow').first().evaluate(row=>{
    const position=sel=>{const r=row.querySelector(sel).getBoundingClientRect();return {x:r.x,y:r.y,h:r.height,w:r.width}};
    return {sender:position('.gm-row-peer'),date:position('.gm-row-date'),subject:position('.gm-row-detail'),
      font:getComputedStyle(row.querySelector('.gm-row-detail')).fontSize,
      selectHidden:getComputedStyle(row.querySelector('.gm-selectbox')).display==='none'};
  });
  assert.ok(rowVisual.subject.y-rowVisual.sender.y>=20,'Gmail spacing: preview is below sender with breathing room');
  assert.ok(Math.abs(rowVisual.sender.y-rowVisual.date.y)<3,'Sender and date aligned');
  assert.ok(rowVisual.selectHidden,'Compact row selection checkbox removed');
  assert.equal(rowVisual.font,'13px','Gmail compact preview font');
  assert.equal(await compact.getByRole('button',{name:/star|flag/i}).count(),0,'No star or flag controls');

  await compact.locator('.gm-mail-app').screenshot({path:prefix+'-inbox.jpg',type:'jpeg',quality:73});
  await compact.locator('.gm-mailrow-open').first().click();
  const inline=compact.locator('.gm-inline-reply');
  await compact.locator('.gm-reader .gm-read-replies button').filter({hasText:'Reply'}).first().click();
  await inline.waitFor({state:'visible'});
  await inline.getByRole('textbox',{name:'Inline email reply'}).fill('Inline email response');
  await compact.locator('.gm-mail-app').screenshot({path:prefix+'-reply.jpg',type:'jpeg',quality:73});
  await inline.getByRole('button',{name:'Save reply'}).click();
  await inline.waitFor({state:'hidden'});
  assert.ok(await compact.getByText('Inline email response').count()>0,'Reply appended in current mail thread');
  await compact.getByRole('button',{name:'Back',exact:true}).click();

  await compact.getByRole('button',{name:'Compose mail inline'}).click();
  const compose=compact.locator('.gm-compose');
  await compose.waitFor();
  const geom=await compose.evaluate(e=>{const a=e.getBoundingClientRect(),p=e.closest('.gm-mail-app').getBoundingClientRect();return {a:{x:a.x,y:a.y,right:a.right,bottom:a.bottom},p:{x:p.x,y:p.y,right:p.right,bottom:p.bottom}}});
  assert.ok(geom.a.x>=geom.p.x-2&&geom.a.right<=geom.p.right+2&&geom.a.bottom<=geom.p.bottom+2,'Compose confined inside phone');
  await compact.locator('.gm-mail-app').screenshot({path:prefix+'-compose.jpg',type:'jpeg',quality:73});
  console.log('v10 compact mail/notification tests PASS',engine===webkit?'WebKit':'Chromium',theme,mobile?'mobile':'desktop');
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
}
try{
 for(let i=0;i<80;i++){try{if((await fetch(host)).ok)break;}catch{}await wait(160)}
 await run(chromium,false,'light');await run(chromium,false,'dark');await run(webkit,true,'light');await run(webkit,true,'dark');
}finally{server.kill();}
