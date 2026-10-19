import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
const host='http://127.0.0.1:4201';
const server=spawn('npm',['run','dev','--','--host','127.0.0.1','--port','4201','--strictPort'],{stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 for(let i=0;i<80;i++){try{if((await fetch(host)).ok)break}catch{}await wait(175)}
 const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1280,height:800}});
 try{
  await page.goto(host,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
   const React=(await import('/node_modules/.vite/deps/react.js')).default;
   const module=await import('/node_modules/.vite/deps/react-dom_client.js');
   const createRoot=module.createRoot||module.default?.createRoot;
   const Notifications=(await import('/src/shell/notifications/Notifications.jsx')).default;
   const mount=document.createElement('div');mount.id='notification-harness';document.body.appendChild(mount);
   function Harness(){
    const [messages,setMessages]=React.useState([]);
    const [mailbox,setMailbox]=React.useState([]);
    window.__notify=(m)=>setMessages(s=>[...s,m]);
    window.__getMessages=()=>messages;
    return React.createElement(Notifications,{messages,setMessages,mailbox,setMailbox});
   }
   createRoot(mount).render(React.createElement(Harness));
  });
  await page.waitForTimeout(180);
  await page.evaluate(()=>window.__notify({id:'a',channel:'wa',number:'2125550199',dir:'in',text:'New WhatsApp message',at:Date.now(),unread:true}));
  const banner=page.getByLabel('Incoming notification banner');
  await banner.waitFor({state:'visible',timeout:4000});
  const bannerBox=await banner.boundingBox(),topbarBox=await page.locator('.crm-topbar').boundingBox();
  assert.ok(bannerBox.y>=topbarBox.y+topbarBox.height-1,'Banner must appear under topbar');
  await page.waitForTimeout(5650);
  await banner.waitFor({state:'hidden',timeout:3000});
  await page.evaluate(()=>window.__notify({id:'b',channel:'text',number:'2125550198',dir:'in',text:'New SMS',at:Date.now()+1,unread:true}));
  await banner.waitFor({state:'visible',timeout:4000});
  await banner.getByRole('button',{name:'Reply here'}).click();
  await banner.getByRole('textbox',{name:'Reply to 2125550198'}).fill('Saved inline');
  await page.waitForTimeout(5600);
  assert.ok(await banner.isVisible(),'Active reply must prevent auto-dismiss');
  await banner.getByRole('button',{name:'Save reply'}).click();
  await banner.waitFor({state:'hidden'});
  const stored=await page.evaluate(()=>window.__getMessages());
  assert.ok(stored.some(x=>x.text==='Saved inline'&&x.status==='local'&&x.dir==='out'));
  console.log('Notification banner enters below topbar, hides after five seconds, pauses for reply, and saves locally: PASS');
 }finally{await browser.close()}
}finally{server.kill()}
