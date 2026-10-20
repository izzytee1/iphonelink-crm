import React,{useEffect,useMemo,useRef,useState} from 'react';
import {NativeIcon,NativeButton,formatStamp,digits} from './Native.jsx';
import Messages from './Messages.jsx';
import Calls from './Calls.jsx';
import WhatsApp from './WhatsApp.jsx';
import {calls} from '../data/communications.js';
import {mailAccounts} from '../data/mail.js';
import EmailClient from '../pages/email/EmailClient.jsx';
import {createLocalMessage} from '../services/localReplies.js';
import {formatPhone} from '../hooks/usePhoneController.js';
import {leadPhones} from '../utils/leadUtils.js';

const rootPages=[['all','All','all'],['messages','Messages','message'],['calls','Calls','phone'],['email','Email','email']];
const last=t=>t.msgs?.at(-1)||{};
function ScreenHeader({title,subtitle,action}){return <div className="np-workspace-heading"><h1>{title}</h1>{subtitle&&<small>{subtitle}</small>}{action}</div>}
function AllActivity({messages,mailbox,leads,onMessage,onCall,onMail}){
 const feed=useMemo(()=>{
  const latest=new Map();messages.forEach(m=>{const key=m.channel+':'+digits(m.number);if(!latest.has(key)||m.at>latest.get(key).at)latest.set(key,m)});
  return [...[...latest.values()].map(m=>({type:'message',id:m.channel+':'+digits(m.number),channel:m.channel,number:m.number,at:m.at,preview:m.text})),...calls.map(c=>({type:'call',id:c.id,number:c.number,at:c.at,call:c,preview:c.dir==='missed'?'Missed call':'Phone call'})),...mailbox.filter(t=>t.folder==='inbox').map(t=>({type:'mail',id:t.id,at:last(t).at||0,preview:last(t).subject||'No subject',peer:last(t).peer}))].sort((a,b)=>b.at-a.at);
 },[messages,mailbox]);
 const nameFor=n=>leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(n)))?.name||formatPhone(n);
 return <div className="np-screen np-all"><ScreenHeader title="All" subtitle="Recent activity"/><div className="np-scroll np-native-list">{feed.map(item=><button type="button" key={item.type+item.id} className="np-list-row" onClick={()=>item.type==='call'?onCall(item.call):item.type==='mail'?onMail(item.id):onMessage(item.channel,item.number)}><span className="np-list-copy"><span className="np-list-top"><strong>{item.type==='mail'?item.peer||'Email':nameFor(item.number)}</strong><span className="np-meta">{formatStamp(item.at)}</span></span><span className="np-preview">{item.type==='message'?(item.channel==='wa'?'WhatsApp · ':item.channel==='imessage'?'iMessage · ':'Text · '):item.type==='call'?'Call · ':'Email · '}{item.preview}</span></span><NativeIcon name="chevron" size={13}/></button>)}{!feed.length&&<p className="np-empty">No recent activity</p>}</div></div>;
}
export default function Comms({theme='light',open,onToggle,leads,onSelectLead,phoneController,messages,setMessages,mailbox,setMailbox,onEmail,commRequest,onConsumeCommRequest}){
 const [screen,setScreen]=useState({id:'all',view:'list'});
 const [notice,setNotice]=useState('');
 const [mailRequest,setMailRequest]=useState(null);
 const [width,setWidth]=useState(()=>{try{const stored=Number(localStorage.getItem('iphonelink.comms.panelWidth'));return Number.isFinite(stored)&&stored>=320?stored:480}catch{return 480}});
 const resizing=useRef(null);
 const root=screen.view==='list'&&rootPages.some(([id])=>id===screen.id);
 const showNav=true;
 const navigate=id=>{setScreen({id,view:'list'});setNotice('')};
 const identify=n=>{const lead=leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(n)));if(lead)onSelectLead?.(lead.id)};
 const thread=(channel,number)=>{
  identify(number);
  setScreen({id:channel==='wa'?'whatsapp':'messages',view:'thread',number,channel});
  setMessages(current=>current.map(m=>m.channel===channel&&digits(m.number)===digits(number)&&m.unread?{...m,unread:false,read:true}:m));
 };
 const callDetail=(call)=>{identify(call.number);setScreen({id:'calls',view:'detail',call})};
 const keypad=number=>{if(number)phoneController.loadNumber(number);setScreen({id:'calls',view:'keypad'})};
 const emailDetail=id=>{setMailRequest({id});setScreen({id:'email',view:'list'});};
 function back(){
  if(screen.id==='whatsapp'&&screen.view!=='list'){setScreen({id:'whatsapp',view:'list'});return}
  if(screen.id==='calls'&&screen.view==='detail'){setScreen({id:'calls',view:screen.call?.contact?'contacts':'list'});return}
  if(screen.id==='messages'&&screen.view!=='list'){navigate('messages');return}
  if(screen.id==='email'&&screen.view!=='list'){navigate('email');return}
  if(screen.id==='calls'&&screen.view!=='list'){navigate('calls');return}
  navigate(screen.id==='whatsapp'?'messages':'all');
 }
 function saveLocal(channel,number,value,files=[]){const text=String(value||'').trim();if(!text&&!files.length)return;setMessages(current=>[...current,createLocalMessage(channel,number,text,files)]);setNotice('Saved locally · not delivered');}
 useEffect(()=>{
  if(!commRequest)return;
  if(['sms','text','wa','imessage'].includes(commRequest.type)){const c=commRequest.type==='wa'?'wa':commRequest.type==='imessage'?'imessage':'text',n=commRequest.number;if(n){setScreen({id:c==='wa'?'whatsapp':'messages',view:'thread',number:n,channel:c});setMessages(current=>current.map(m=>m.channel===c&&digits(m.number)===digits(n)&&m.unread?{...m,unread:false,read:true}:m));}}
  else if(commRequest.type==='calls')setScreen({id:'calls',view:'list'});
  else if(commRequest.type==='email')setScreen({id:'email',view:'list'});
  onConsumeCommRequest?.();
 },[commRequest]);
 function resizeStart(e){if(e.button!==undefined&&e.button!==0)return;resizing.current={id:e.pointerId,x:e.clientX,width:e.currentTarget.parentElement.getBoundingClientRect().width};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault()}
 function resizeMove(e){const d=resizing.current;if(!d||d.id!==e.pointerId)return;const app=e.currentTarget.closest('.crm-app');const available=app?.getBoundingClientRect().width||window.innerWidth;setWidth(Math.round(Math.max(320,Math.min(available-360,d.width+d.x-e.clientX))))}
 function resizeEnd(e){const d=resizing.current;if(!d||d.id!==e.pointerId)return;resizing.current=null;setWidth(current=>{try{localStorage.setItem('iphonelink.comms.panelWidth',String(current))}catch{}return current})}
 return <div className={'np-root '+(open?'np-panel-open':'')} data-theme={theme} style={{'--crm-comms-width':width+'px'}}>
  <div className="np-panel-resize" role="separator" aria-label="Resize Communications panel" aria-orientation="vertical" tabIndex={open?0:-1} onPointerDown={resizeStart} onPointerMove={resizeMove} onPointerUp={resizeEnd} onPointerCancel={resizeEnd} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setWidth(w=>{const next=Math.max(320,Math.min(960,w+(e.key==='ArrowLeft'?20:-20)));try{localStorage.setItem('iphonelink.comms.panelWidth',String(next))}catch{}return next})}}}/>
  <section className={'np-device '+(open?'np-is-open':'')}  aria-label="Communications" aria-hidden={!open}>
   <div className="cp-header"><strong>Communications</strong><button type="button" className="cp-close" aria-label="Close Communications" onClick={()=>onToggle(false)}><NativeIcon name="close" size={16}/></button></div>
   {showNav&&<nav className="np-root-tabs" aria-label="Communications sections">{rootPages.map(([id,title,icon])=><button type="button" key={id} className={screen.id===id||id==='messages'&&screen.id==='whatsapp'?'np-active':''} onClick={()=>navigate(id)}><NativeIcon name={icon} size={16}/><span>{title}</span></button>)}</nav>}
   <main className="np-device-main">
    {screen.id==='all'&&<AllActivity messages={messages} mailbox={mailbox} leads={leads} onMessage={thread} onCall={callDetail} onMail={emailDetail}/>}
    {screen.id==='messages'&&<Messages page={screen.view} number={screen.number} channel={screen.channel||'text'} messages={messages} leads={leads} onBack={back} onThread={thread} onCompose={()=>setScreen({id:'messages',view:'new'})} onWhatsApp={()=>setScreen({id:'whatsapp',view:'list'})} onSave={saveLocal} onCall={keypad}/>}
    {screen.id==='whatsapp'&&<WhatsApp page={screen.view} number={screen.number} messages={messages} leads={leads} onBack={back} onThread={n=>thread('wa',n)} onCompose={()=>setScreen({id:'whatsapp',view:'new'})} onSave={saveLocal} onCall={n=>phoneController.callNumber(n)} onCalls={()=>navigate('calls')}/>}
    {screen.id==='calls'&&<Calls view={screen.view} call={screen.call} leads={leads} calls={calls} phoneController={phoneController} onBack={back} onDetail={callDetail} onMessage={n=>thread('text',n)} onWhatsApp={n=>thread('wa',n)} onContacts={()=>setScreen({id:'calls',view:'contacts'})} onKeypad={()=>keypad('')} onExit={()=>navigate('all')}/>}
    {screen.id==='email'&&<div className="np-screen np-gmail-embedded"><EmailClient compact leads={leads} mailbox={mailbox} setMailbox={setMailbox} openThreadRequest={mailRequest} onSelectLead={onSelectLead}/></div>}
   </main>
   {notice&&<div className="np-status-note" role="status">{notice}<NativeButton name="close" label="Dismiss" onClick={()=>setNotice('')} size={16}/></div>}
  </section>
 </div>;
}
