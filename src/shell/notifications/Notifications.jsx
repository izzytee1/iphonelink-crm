import {useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import CrmIcon from '../../components/CrmIcons.jsx';
import {mailAccounts} from '../../data/mail.js';
import {createLocalEmailThread,createLocalMessage} from '../../services/localReplies.js';
import {validAddr} from '../../pages/email/shared.js';

function notificationItems(messages,mailbox){
 const sms=messages.filter(m=>m.unread&&m.dir!=='out').map(m=>({id:'message:'+m.id,type:m.channel==='wa'?'wa':m.channel==='imessage'?'imessage':'text',peer:m.number,subject:'',preview:m.text,at:m.at,number:m.number,messageId:m.id}));
 const mail=mailbox.filter(t=>t.folder==='inbox'&&t.msgs.some(m=>m.unread)).map(t=>{
  const m=[...t.msgs].reverse().find(x=>x.unread)||t.msgs.at(-1);
  return {id:'mail:'+t.id,type:'email',peer:m.peer,subject:m.subject||'',preview:String(m.body||'').replace(/<[^>]*>/g,' ').slice(0,140),at:m.at,mailId:t.id,account:t.account};
 });
 return [...mail,...sms].sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,30);
}
function QuickReply({item,onSave,onCancel}){
 const [text,setText]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{setText('');setError('')},[item.id]);
 return <form className="crm-quick-reply" onSubmit={e=>{e.preventDefault();if(!text.trim())return;
    const result=onSave(item,text.trim());if(result)setError(result);}}>
   <textarea aria-label={'Reply to '+item.peer} rows={2} autoFocus placeholder={item.type==='email'?'Write an email reply':'Write a reply'} value={text} onChange={e=>setText(e.target.value)}/>
   {error&&<small role="alert">{error}</small>}
   <div><span>Local only · not delivered</span><button type="button" onClick={onCancel}>Cancel</button><button type="submit" className="crm-quick-send" disabled={!text.trim()}>Save reply</button></div>
 </form>;
}
export default function Notifications({messages=[],setMessages,mailbox=[],setMailbox}){
 const items=useMemo(()=>notificationItems(messages,mailbox),[messages,mailbox]);
 const [open,setOpen]=useState(false),[banner,setBanner]=useState(null),[replyId,setReplyId]=useState(null),[note,setNote]=useState(''),[exiting,setExiting]=useState(false);
 const [anchor,setAnchor]=useState({top:70,right:15});
 const button=useRef(null),previous=useRef(null),timeout=useRef(null);
 const place=()=>{const head=document.querySelector('.crm-topbar')?.getBoundingClientRect(),bell=button.current?.getBoundingClientRect();setAnchor({top:Math.max(8,head?.bottom||bell?.bottom||64)+8,right:Math.max(8,Math.min(Math.max(8,window.innerWidth-Math.min(365,window.innerWidth-24)-12),window.innerWidth-(bell?.right||window.innerWidth)+4))});};
 useEffect(()=>{place();window.addEventListener('resize',place);window.visualViewport?.addEventListener('resize',place);
  return()=>{window.removeEventListener('resize',place);window.visualViewport?.removeEventListener('resize',place)}},[]);
 useEffect(()=>{
  const ids=new Set(items.map(i=>i.id));
  if(previous.current!==null){const fresh=items.find(i=>!previous.current.has(i.id));if(fresh){setExiting(false);setBanner(fresh);setNote('');setReplyId(null);}}
  previous.current=ids;
 },[items]);
 useEffect(()=>{
  if(!banner||replyId===banner.id)return;
  timeout.current=setTimeout(()=>{setExiting(true);timeout.current=setTimeout(()=>setBanner(null),400);},5000);
  return()=>clearTimeout(timeout.current);
 },[banner?.id,replyId]);
 useEffect(()=>{const close=e=>{if(button.current?.contains(e.target)||e.target.closest?.('.crm-notification-layer'))return;setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 function saveReply(item,value){
  if(item.type==='email'){
   if(!validAddr(item.peer))return 'Recipient email address is unavailable.';
   const source=mailbox.find(m=>m.id===item.mailId);
   const subj=(item.subject||'').replace(/^re:\s*/i,'');
   setMailbox(current=>[createLocalEmailThread({to:[item.peer],subject:'Re: '+subj,body:value,account:source?.account??0}),
     ...current.map(t=>t.id===item.mailId?{...t,msgs:t.msgs.map(m=>({...m,unread:false}))}:t)]);
  }else{
   if(!item.number)return 'Phone number unavailable.';
   setMessages(current=>[...current.map(m=>m.id===item.messageId?{...m,unread:false,read:true}:m),createLocalMessage(item.type,item.number,value)]);
  }
  setNote('Reply saved locally — not delivered');
  setReplyId(null);setBanner(null);
  return null;
 }
 const currentBanner=banner&&items.find(i=>i.id===banner.id)||banner;
 const card=(item,isBanner)=> <div className="crm-notification-card" key={item.id}>
   <div className="crm-notification-symbol" aria-hidden="true">{item.type==='email'?'✉':item.type==='wa'?'WA':item.type==='imessage'?'iM':'SMS'}</div>
   <div className="crm-notification-body"><strong>{item.peer}</strong><span>{item.subject||item.preview||'New message'}</span>
     {item.subject&&<small>{item.preview}</small>}
     {replyId===item.id?<QuickReply item={item} onSave={saveReply} onCancel={()=>setReplyId(null)}/>:
     <button type="button" className="crm-notification-reply" onClick={()=>{clearTimeout(timeout.current);setReplyId(item.id);}}>Reply here</button>}</div>
    {isBanner&&<button className="crm-notification-dismiss" type="button" aria-label="Dismiss notification banner" onClick={()=>{setReplyId(null);setBanner(null)}}>×</button>}
 </div>;
 return <div className="crm-notification-area">
   <button id="crmNotificationsBtn" ref={button} type="button" className="crm-topbar-icon crm-notification-trigger" aria-label="Notifications" aria-expanded={open} onClick={()=>{place();setOpen(v=>!v);setBanner(null)}}>
    <CrmIcon name="bell" size={27}/>{items.length>0&&<span className="crm-notification-count">{items.length}</span>}
   </button>
   {createPortal(<div className="crm-notification-layer" style={{'--crm-note-top':anchor.top+'px','--crm-note-right':anchor.right+'px'}}>
    {open&&<aside className="crm-notification-dropdown" aria-label="Notifications dropdown">
      <header><strong>Notifications</strong><span>{items.length} unread</span><button type="button" aria-label="Close notifications" onClick={()=>setOpen(false)}>×</button></header>
      <div className="crm-notification-list">{items.length?items.map(i=>card(i,false)):<div className="crm-notification-empty">No unread notifications</div>}</div>
      {note&&<p role="status">{note}</p>}
    </aside>}
    {!open&&currentBanner&&<aside className={'crm-notification-banner'+(exiting?' exiting':'')} aria-label="Incoming notification banner">{card(currentBanner,true)}</aside>}
   </div>,document.body)}
 </div>;
}
