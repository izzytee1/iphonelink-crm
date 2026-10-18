
import {useEffect,useMemo,useRef,useState} from 'react';
import CrmIcon from '../components/CrmIcons.jsx';
import {calls} from '../data/communications.js';
import {mailAccounts} from '../data/mail.js';
import {digitsOf,formatPhone,leadByNumber} from '../hooks/usePhoneController.js';
import {leadPhones,leadEmails} from '../utils/leadUtils.js';

const sections=[['all','All','activity'],['messages','Messages','sms'],['calls','Calls','phone'],['email','Email','email']];
const pad=n=>String(n).padStart(2,'0');
const time=t=>{const d=new Date(t);return d.toDateString()===new Date().toDateString()?d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):d.toLocaleDateString([],{month:'short',day:'numeric'});};
const messageKey=m=>m.channel+':'+digitsOf(m.number);
const last=t=>t.msgs?.at(-1)||{};
function IconButton({icon,title,onClick,kind=''}) {return <button type="button" className={'nc-icon '+kind} onClick={onClick} aria-label={title} title={title}><CrmIcon name={icon} size={18}/></button>;}
function UserRow({icon,name,detail,date,onClick,unread=0}) {return <button type="button" className="nc-row" onClick={onClick}><span className="nc-row-mark"><CrmIcon name={icon} size={18}/></span><span className="nc-row-copy"><strong>{name}</strong><small>{detail}</small></span><span className="nc-row-end">{date}{unread>0&&<b>{unread}</b>}</span></button>;}
export default function Comms({open,onToggle,leads,onSelectLead,phoneController,messages,setMessages,mailbox,setMailbox,onEmail,commRequest,onConsumeCommRequest}) {
 const [tab,setTab]=useState('all');
 const [selectedThread,setSelectedThread]=useState('');
 const [text,setText]=useState('');
 const [selectedMail,setSelectedMail]=useState('');
 const [callsMode,setCallsMode]=useState('recents');
 const [callFilter,setCallFilter]=useState('all');
 const [selectedCall,setSelectedCall]=useState(null);
 const [search,setSearch]=useState('');
 const [notice,setNotice]=useState('');
 const [left,setLeft]=useState(()=>{try{return Math.max(8,Number(localStorage.getItem('iphonelink.comms.x'))||18)}catch{return 18}});
 const drag=useRef(null),ignoreClick=useRef(false),bottom=useRef(null);
 const match=v=>String(v||'').toLowerCase().includes(search.toLowerCase().trim());
 const findLead=number=>leadByNumber(leads,number);
 const display=number=>findLead(number)?.name||formatPhone(number);
 const threads=useMemo(()=>{
  const map=new Map();
  messages.forEach(m=>{const key=messageKey(m),value=map.get(key)||{key,number:digitsOf(m.number),channel:m.channel,latest:m,unread:0};
   if(m.at>value.latest.at)value.latest=m;
   if(m.dir==='in'&&m.unread)value.unread++;
   map.set(key,value);
  });
  return [...map.values()].sort((a,b)=>b.latest.at-a.latest.at);
 },[messages]);
 const activeThread=threads.find(t=>t.key===selectedThread);
 const conversation=messages.filter(m=>messageKey(m)===selectedThread).sort((a,b)=>a.at-b.at);
 const mail=useMemo(()=>mailbox.filter(t=>t.folder==='inbox').sort((a,b)=>(last(b).at||0)-(last(a).at||0)),[mailbox]);
 const currentMail=mailbox.find(t=>t.id===selectedMail);
 const feed=useMemo(()=>[
   ...threads.map(t=>({type:'message',id:t.key,at:t.latest.at,number:t.number,channel:t.channel,text:t.latest.text})),
   ...calls.map(c=>({type:'call',id:c.id,at:c.at,number:c.number,text:c.dir==='missed'?'Missed call':'Phone call'})),
   ...mail.map(t=>({type:'email',id:t.id,at:last(t).at||0,address:last(t).peer,text:last(t).subject}))
 ].sort((a,b)=>b.at-a.at),[threads,mail]);
 const state=phoneController.activeCall;
 const dialed=state.phase==='idle'?phoneController.dialInput:formatPhone(state.number);
 const seconds=phoneController.seconds;
 function openThread(channel,number) {
  setSelectedThread(channel+':'+digitsOf(number));setTab('messages');setText('');
  const lead=findLead(number);if(lead)onSelectLead?.(lead.id);
  setMessages(current=>current.map(m=>m.channel===channel&&digitsOf(m.number)===digitsOf(number)?{...m,unread:false,read:true}:m));
 }
 function openCall(call) {setTab('calls');setCallsMode('detail');setSelectedCall(call);const lead=findLead(call.number);if(lead)onSelectLead?.(lead.id);}
 function openEmail(id) {
  setTab('email');setSelectedMail(id);
  setMailbox(current=>current.map(t=>t.id===id?{...t,msgs:t.msgs.map(m=>({...m,unread:false}))}:t));
 }
 function sendLocal(e) {
  e.preventDefault();
  if(!activeThread||!text.trim())return;
  setMessages(current=>[...current,{id:'local-'+Date.now(),channel:activeThread.channel,number:activeThread.number,text:text.trim(),dir:'out',at:Date.now(),status:'local',unread:false,files:[]}]);
  setText('');setNotice('Saved locally · not delivered');
 }
 useEffect(()=>{
  if(!commRequest)return;
  if(commRequest.type==='sms'||commRequest.type==='wa')openThread(commRequest.type==='wa'?'wa':'text',commRequest.number);
  else if(commRequest.type==='calls'){setTab('calls');setCallsMode('recents');}
  else if(commRequest.type==='email')setTab('email');
  onConsumeCommRequest?.();
 },[commRequest]);
 useEffect(()=>bottom.current?.scrollIntoView?.({block:'end'}),[selectedThread,conversation.length]);
 function toKeypad(number) {if(number)phoneController.loadNumber(number);setCallsMode('keypad');setTab('calls');}
 function openFeed(item) {
  if(item.type==='message')openThread(item.channel,item.number);
  if(item.type==='call'){const call=calls.find(c=>c.id===item.id);if(call)openCall(call);}
  if(item.type==='email')openEmail(item.id);
 }
 function back() {if(tab==='messages')setSelectedThread('');if(tab==='calls')setCallsMode('recents');if(tab==='email')setSelectedMail('');}
 function down(e){if(e.button!==undefined&&e.button!==0)return;drag.current={x:e.clientX,origin:left,moved:false};e.currentTarget.setPointerCapture?.(e.pointerId);}
 function move(e){if(!drag.current)return;const dx=e.clientX-drag.current.x;if(Math.abs(dx)>5)drag.current.moved=true;if(drag.current.moved)setLeft(Math.max(8,Math.min(innerWidth-140,drag.current.origin+dx)));}
 function up(){if(!drag.current)return;ignoreClick.current=drag.current.moved;if(drag.current.moved)try{localStorage.setItem('iphonelink.comms.x',String(Math.round(left)))}catch{}drag.current=null;}
 const detail=tab==='messages'?!!activeThread:tab==='email'?!!currentMail:tab==='calls'&&callsMode!=='recents';
 const headline=tab==='all'?'All activity':tab==='messages'?(activeThread?display(activeThread.number):'Messages'):tab==='calls'?(callsMode==='recents'?'Recents':callsMode==='contacts'?'Contacts':callsMode==='keypad'?'Keypad':'Call details'):(currentMail?'Conversation':'Inbox');
 const nav=(section)=>{setTab(section);setSearch('');setNotice('');};
 return <div className="nc-root">
  <section className={'nc-panel '+(open?'is-open':'')} style={{left:'clamp(8px, '+left+'px, calc(100vw - min(540px, 100vw - 16px) - 8px))'}} aria-label="Communications" aria-hidden={!open}>
   <div className="nc-header">
    <div><small>iPhoneLink</small><h2>{headline}</h2></div>
    <div className="nc-header-right">{detail&&<IconButton icon="back" title="Back" onClick={back}/>}<IconButton icon="close" title="Close" onClick={()=>onToggle(false)}/></div>
   </div>
   <main className="nc-body">
    {tab==='all'&&<><div className="nc-context"><b>Recent activity</b><small>Messages, calls and email</small></div><div className="nc-scroll">
     {feed.map(item=><UserRow key={item.type+item.id} icon={item.type==='call'?'phone':item.type==='email'?'email':item.channel==='wa'?'whatsapp':'sms'} name={item.type==='email'?item.address||'Email':display(item.number)} detail={item.text} date={time(item.at)} onClick={()=>openFeed(item)}/>)}
    </div></>}
    {tab==='messages'&&(!activeThread?<><label className="nc-search"><CrmIcon name="search" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search messages"/></label><div className="nc-scroll">
     {threads.filter(t=>match(display(t.number))||match(t.latest.text)).map(t=><UserRow key={t.key} icon={t.channel==='wa'?'whatsapp':'sms'} name={display(t.number)} detail={t.latest.text} date={time(t.latest.at)} unread={t.unread} onClick={()=>openThread(t.channel,t.number)}/>)}
     {!threads.length&&<div className="nc-empty">No conversations</div>}
    </div></>:<div className="nc-conversation">
     <div className="nc-thread-meta"><span>{formatPhone(activeThread.number)}</span><div><IconButton icon="phone" title="Call" onClick={()=>toKeypad(activeThread.number)}/><IconButton icon="email" title="Email" onClick={()=>{const address=leadEmails(findLead(activeThread.number)||{})[0];if(address)onEmail?.([address]);}}/></div></div>
     <div className="nc-chat-scroll">{conversation.map(m=><div key={m.id} className={'nc-bubble-line '+(m.dir==='out'?'out':'in')}><div className={'nc-bubble '+(activeThread.channel==='wa'?'wa':'')}><p>{m.text}</p><small>{time(m.at)}{m.status==='local'?' · Local only':''}</small></div></div>)}<div ref={bottom}/></div>
     <form className="nc-send" onSubmit={sendLocal}><input value={text} onChange={e=>setText(e.target.value)} placeholder={activeThread.channel==='wa'?'WhatsApp message':'Text message'} aria-label="Message"/><button type="submit" aria-label="Save message"><CrmIcon name="send" size={18}/></button></form>
    </div>)}
    {tab==='calls'&&<>
     {callsMode==='recents'&&<><div className="nc-call-tools"><div className="nc-segment"><button className={callFilter==='all'?'selected':''} onClick={()=>setCallFilter('all')} type="button">All</button><button className={callFilter==='missed'?'selected':''} onClick={()=>setCallFilter('missed')} type="button">Missed</button></div><div className="nc-header-right"><IconButton icon="contacts" title="Contacts" onClick={()=>setCallsMode('contacts')}/><IconButton icon="keypad" title="Keypad" onClick={()=>toKeypad('')}/></div></div>
      <div className="nc-scroll">{calls.filter(c=>callFilter!=='missed'||c.dir==='missed').map(c=><UserRow key={c.id} icon="phone" name={display(c.number)} detail={(c.dir==='missed'?'Missed':c.dir==='out'?'Outgoing':'Incoming')+' · '+formatPhone(c.number)} date={time(c.at)} onClick={()=>openCall(c)}/>)}
       <p className="nc-sample">Sample call history · Real history needs a phone provider</p></div></>}
     {callsMode==='contacts'&&<div className="nc-scroll">{leads.map(lead=><UserRow key={lead.id} icon="contacts" name={lead.name} detail={lead.company} date="" onClick={()=>{onSelectLead?.(lead.id);toKeypad(leadPhones(lead)[0]||'');}}/>)}</div>}
     {callsMode==='detail'&&selectedCall&&<div className="nc-call-detail"><div className="nc-detail-icon"><CrmIcon name="phone" size={27}/></div><h3>{display(selectedCall.number)}</h3><p>{formatPhone(selectedCall.number)}</p><small>{selectedCall.dir==='missed'?'Missed':selectedCall.dir==='out'?'Outgoing':'Incoming'} · {new Date(selectedCall.at).toLocaleString()}</small><div className="nc-detail-actions"><IconButton icon="phone" title="Call" onClick={()=>toKeypad(selectedCall.number)}/><IconButton icon="sms" title="Message" onClick={()=>openThread('text',selectedCall.number)}/><IconButton icon="whatsapp" title="WhatsApp" onClick={()=>openThread('wa',selectedCall.number)}/><IconButton icon="email" title="Email" onClick={()=>{const address=leadEmails(findLead(selectedCall.number)||{})[0];if(address)onEmail?.([address]);}}/></div></div>}
     {callsMode==='keypad'&&<div className="nc-phone">
      <div className="nc-number"><CrmIcon name="phone" size={17}/><input type="tel" inputMode="tel" placeholder="Enter number" value={dialed} onChange={e=>phoneController.setDialInput(e.target.value)} readOnly={state.phase!=='idle'} aria-label="Number"/></div>
      <small className="nc-call-status">{state.phase!=='idle'?phoneController.dialerStatus+' · '+pad(Math.floor(seconds/60))+':'+pad(seconds%60):' '}</small>
      <div className="nc-keygrid">{['1','2','3','4','5','6','7','8','9','*','0','#'].map((key,i)=><button type="button" key={key} data-dtmf="true" onClick={()=>phoneController.sendTone(key)}><strong>{key}</strong><small>{['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ','','+',''][i]||'\u00a0'}</small></button>)}</div>
      <div className="nc-key-actions"><IconButton icon="mute" title="Mute" onClick={()=>phoneController.toggleControl('muted')}/><IconButton icon="speaker" title="Speaker" onClick={()=>phoneController.toggleControl('speaker')}/><button className="nc-answer" type="button" aria-label="Call" onClick={phoneController.requestCall}><CrmIcon name="phone" size={22}/></button><button className="nc-hangup" type="button" aria-label="End call" onClick={state.phase==='incoming'?phoneController.decline:state.phase!=='idle'?phoneController.requestCall:()=>{}}><CrmIcon name="endcall" size={22}/></button><IconButton icon="hold" title="Hold" onClick={()=>phoneController.toggleControl('held')}/><IconButton icon="x" title="Clear" onClick={phoneController.clearDialInput}/></div>
     </div>}
    </>}
    {tab==='email'&&(!currentMail?<><div className="nc-mailbar"><span>Primary</span><button type="button" onClick={()=>onEmail?.([])}><CrmIcon name="add" size={15}/> Compose</button></div><label className="nc-search"><CrmIcon name="search" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inbox"/></label>
     <div className="nc-scroll">{mail.filter(t=>match(last(t).subject)||match(last(t).body)||match(last(t).peer)).map(t=><UserRow key={t.id} icon="email" name={last(t).peer||mailAccounts[t.account]?.name||'Email'} detail={(last(t).subject||'No subject')+' · '+String(last(t).body||'').replace(/<[^>]*>/g,' ').slice(0,64)} date={time(last(t).at)} unread={t.msgs.some(m=>m.unread)?1:0} onClick={()=>openEmail(t.id)}/>)}</div></>:<div className="nc-mail-reader"><h3>{last(currentMail).subject||'No subject'}</h3>{currentMail.msgs.map(m=><article key={m.id||m.at}><div><strong>{m.out?mailAccounts[currentMail.account]?.name:m.peer}</strong><small>{time(m.at)}</small></div><small>{m.out?'To: ':'From: '}{m.peer}</small><p>{String(m.body||'').replace(/<[^>]*>/g,' ').trim()}</p></article>)}<button type="button" onClick={()=>onEmail?.([last(currentMail).peer])}>Reply in Email</button></div>)}
   </main>
   {notice&&<div className="nc-notice" role="status">{notice}<button type="button" onClick={()=>setNotice('')} aria-label="Dismiss">×</button></div>}
   <nav className="nc-tabs">{sections.map(([id,label,icon])=><button type="button" key={id} className={tab===id?'current':''} onClick={()=>nav(id)}><CrmIcon name={icon} size={20}/><span>{label}</span></button>)}</nav>
  </section>
  <button type="button" className="nc-launch" style={{left:'clamp(8px, '+left+'px, calc(100vw - 140px))'}} aria-expanded={open} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={()=>{if(ignoreClick.current){ignoreClick.current=false;return;}onToggle(!open);}}><CrmIcon name="sms" size={17}/> Comms</button>
 </div>;
}
