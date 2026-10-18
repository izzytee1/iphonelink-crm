import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Avatar,NativeIcon,NativeButton,StatusBar,formatStamp,digits} from './Native.jsx';
import Messages from './Messages.jsx';
import Calls from './Calls.jsx';
import WhatsApp from './WhatsApp.jsx';
import {calls} from '../data/communications.js';
import {mailAccounts} from '../data/mail.js';
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
 return <div className="np-screen np-all"><ScreenHeader title="All" subtitle="Recent activity"/><div className="np-scroll np-native-list">{feed.map(item=><button type="button" key={item.type+item.id} className="np-list-row" onClick={()=>item.type==='call'?onCall(item.call):item.type==='mail'?onMail(item.id):onMessage(item.channel,item.number)}><Avatar name={item.type==='mail'?item.peer:nameFor(item.number)} size={43} initial={item.type==='mail'||Boolean(leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(item.number))))}/><span className="np-list-copy"><span className="np-list-top"><strong>{item.type==='mail'?item.peer||'Email':nameFor(item.number)}</strong><span className="np-meta">{formatStamp(item.at)}</span></span><span className="np-preview">{item.type==='message'?(item.channel==='wa'?'WhatsApp · ':'SMS · '):item.type==='call'?'Call · ':'Email · '}{item.preview}</span></span><NativeIcon name="chevron" size={13}/></button>)}{!feed.length&&<p className="np-empty">No recent activity</p>}</div></div>;
}
function EmbeddedEmail({view,mailId,mailbox,onEmail,onBack,onOpen}){
 const [search,setSearch]=useState('');
 const inbox=useMemo(()=>mailbox.filter(t=>t.folder==='inbox').sort((a,b)=>(last(b).at||0)-(last(a).at||0)),[mailbox]);
 const thread=mailbox.find(t=>t.id===mailId);
 if(view==='reader'&&thread)return <div className="np-screen np-mail-screen"><div className="np-simple-nav"><NativeButton name="back" label="Inbox" onClick={onBack}/><strong>Mail</strong><NativeButton name="email" label="Reply in Gmail" onClick={()=>onEmail?.([last(thread).peer])}/></div><div className="np-email-reader np-scroll"><h2>{last(thread).subject||'No subject'}</h2>{thread.msgs.map((m,i)=><article key={m.id||i}><div><strong>{m.out?mailAccounts[thread.account]?.name:m.peer}</strong><span>{formatStamp(m.at)}</span></div><small>{m.out?'To':'From'}: {m.peer}</small><p>{String(m.body||'').replace(/<[^>]*>/g,' ').trim()}</p></article>)}<button type="button" className="np-email-reply" onClick={()=>onEmail?.([last(thread).peer])}>Reply in Email</button></div></div>;
 return <div className="np-screen np-mail-screen"><ScreenHeader title="Inbox" subtitle="Email"/><label className="np-search-pill np-mail-search"><NativeIcon name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search mail"/></label><div className="np-native-list np-scroll">{inbox.filter(t=>(last(t).peer+' '+last(t).subject+' '+last(t).body).toLowerCase().includes(search.toLowerCase())).map(t=><button type="button" key={t.id} className="np-list-row" onClick={()=>onOpen(t.id)}><Avatar name={last(t).peer} size={43} initial/><span className="np-list-copy"><span className="np-list-top"><strong>{last(t).peer||mailAccounts[t.account]?.name||'Email'}</strong><span className="np-meta">{formatStamp(last(t).at)}</span></span><span className="np-preview">{last(t).subject||'No subject'} · {String(last(t).body||'').replace(/<[^>]*>/g,' ').slice(0,80)}</span></span></button>)}{!inbox.length&&<p className="np-empty">Inbox empty</p>}</div><button className="np-email-compose" type="button" onClick={()=>onEmail?.([])}><NativeIcon name="compose"/> Compose</button></div>;
}
export default function Comms({open,onToggle,leads,onSelectLead,phoneController,messages,setMessages,mailbox,setMailbox,onEmail,commRequest,onConsumeCommRequest}){
 const [screen,setScreen]=useState({id:'all',view:'list'});
 const [origin,setOrigin]=useState('messages');
 const [notice,setNotice]=useState('');
 const [position,setPosition]=useState(()=>{try{return Math.max(8,Number(localStorage.getItem('iphonelink.comms.x'))||18)}catch{return 18}});
 const drag=useRef(null),cancelClick=useRef(false);
 const root=screen.view==='list'&&rootPages.some(([id])=>id===screen.id);
 const showNav=root;
 const nameFor=n=>leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(n)))?.name||formatPhone(n);
 const navigate=id=>{setScreen({id,view:'list'});setNotice('')};
 const identify=n=>{const lead=leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(n)));if(lead)onSelectLead?.(lead.id)};
 const thread=(channel,number)=>{
  identify(number);setOrigin(channel==='wa'?'whatsapp':'messages');
  setScreen({id:channel==='wa'?'whatsapp':'messages',view:'thread',number});
  setMessages(current=>current.map(m=>m.channel===channel&&digits(m.number)===digits(number)&&m.unread?{...m,unread:false,read:true}:m));
 };
 const callDetail=(call)=>{identify(call.number);setScreen({id:'calls',view:'detail',call})};
 const keypad=number=>{if(number)phoneController.loadNumber(number);setScreen({id:'calls',view:'keypad'})};
 const emailDetail=id=>{setScreen({id:'email',view:'reader',mailId:id});setMailbox(current=>current.map(t=>t.id===id?{...t,msgs:t.msgs.map(m=>m.unread?{...m,unread:false}:m)}:t))};
 function back(){
  if(screen.id==='whatsapp'&&screen.view!=='list'){setScreen({id:'whatsapp',view:'list'});return}
  if(screen.id==='calls'&&screen.view==='detail'){setScreen({id:'calls',view:screen.call?.contact?'contacts':'list'});return}
  if(screen.id==='messages'&&screen.view!=='list'){navigate('messages');return}
  if(screen.id==='email'&&screen.view!=='list'){navigate('email');return}
  if(screen.id==='calls'&&screen.view!=='list'){navigate('calls');return}
  navigate(origin==='whatsapp'?'messages':'all');
 }
 function saveLocal(channel,number,value){const text=String(value||'').trim();if(!text)return;setMessages(current=>[...current,{id:'local-'+Date.now()+'-'+current.length,channel,number:digits(number),dir:'out',text,at:Date.now(),status:'local',unread:false,files:[]}]);setNotice('Saved locally · not delivered');}
 useEffect(()=>{
  if(!commRequest)return;
  if(['sms','text','wa'].includes(commRequest.type)){const c=commRequest.type==='wa'?'wa':'text',n=commRequest.number;if(n){setScreen({id:c==='wa'?'whatsapp':'messages',view:'thread',number:n});setMessages(current=>current.map(m=>m.channel===c&&digits(m.number)===digits(n)&&m.unread?{...m,unread:false,read:true}:m));}}
  else if(commRequest.type==='calls')setScreen({id:'calls',view:'list'});
  else if(commRequest.type==='email')setScreen({id:'email',view:'list'});
  onConsumeCommRequest?.();
 },[commRequest]);
 function pointerDown(e){if(e.button!==undefined&&e.button!==0)return;drag.current={x:e.clientX,old:position,moved:false};e.currentTarget.setPointerCapture?.(e.pointerId)}
 function pointerMove(e){if(!drag.current)return;const dx=e.clientX-drag.current.x;if(Math.abs(dx)>5)drag.current.moved=true;if(drag.current.moved)setPosition(Math.max(8,Math.min(window.innerWidth-110,drag.current.old+dx)))}
 function pointerUp(){if(!drag.current)return;cancelClick.current=drag.current.moved;if(drag.current.moved)try{localStorage.setItem('iphonelink.comms.x',String(Math.round(position)))}catch{}drag.current=null}
 return <div className="np-root">
  <section className={'np-device '+(open?'np-is-open':'')} style={{left:'clamp(8px, '+position+'px, calc(100vw - min(414px, 46.25vh) - 8px))'}} aria-label="iPhone Communications" aria-hidden={!open}>
   <StatusBar/>
   <main className="np-device-main">
    {screen.id==='all'&&<AllActivity messages={messages} mailbox={mailbox} leads={leads} onMessage={thread} onCall={callDetail} onMail={emailDetail}/>}
    {screen.id==='messages'&&<Messages page={screen.view} number={screen.number} messages={messages} leads={leads} onBack={back} onThread={n=>thread('text',n)} onCompose={()=>setScreen({id:'messages',view:'new'})} onWhatsApp={()=>{setOrigin('messages');setScreen({id:'whatsapp',view:'list'})}} onSave={saveLocal} onCall={keypad}/>}
    {screen.id==='whatsapp'&&<WhatsApp page={screen.view} number={screen.number} messages={messages} leads={leads} onBack={back} onThread={n=>thread('wa',n)} onCompose={()=>setScreen({id:'whatsapp',view:'new'})} onSave={saveLocal} onCall={n=>phoneController.callNumber(n)} onCalls={()=>navigate('calls')}/>}
    {screen.id==='calls'&&<Calls view={screen.view} call={screen.call} leads={leads} calls={calls} phoneController={phoneController} onBack={back} onDetail={callDetail} onMessage={n=>thread('text',n)} onWhatsApp={n=>thread('wa',n)} onContacts={()=>setScreen({id:'calls',view:'contacts'})} onKeypad={()=>keypad('')}/>}
    {screen.id==='email'&&<EmbeddedEmail view={screen.view} mailId={screen.mailId} mailbox={mailbox} onEmail={onEmail} onBack={back} onOpen={emailDetail}/>}
   </main>
   {notice&&<div className="np-status-note" role="status">{notice}<NativeButton name="close" label="Dismiss" onClick={()=>setNotice('')} size={16}/></div>}
   {showNav&&<nav className="np-root-tabs" aria-label="Communications sections">{rootPages.map(([id,title,icon])=><button type="button" key={id} className={screen.id===id?'np-active':''} onClick={()=>navigate(id)}><NativeIcon name={icon} size={22}/><span>{title}</span></button>)}</nav>}
   <div className="np-home-indicator" aria-hidden="true"/>
  </section>
  {open&&<button className="np-device-close" style={{left:'calc(clamp(8px, '+position+'px, calc(100vw - min(414px, 46.25vh) - 8px)) + min(414px, 46.25vh) - 8px)'}} type="button" onClick={()=>onToggle(false)} aria-label="Close Communications"><NativeIcon name="close" size={19}/></button>}
  <button type="button" className="np-launch" style={{left:'clamp(8px, '+position+'px, calc(100vw - 140px))'}} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClick={()=>{if(cancelClick.current){cancelClick.current=false;return}onToggle(!open)}} aria-expanded={open}><NativeIcon name="message" size={18}/> Comms</button>
 </div>;
}
