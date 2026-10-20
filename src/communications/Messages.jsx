import React,{useMemo,useState,useEffect,useRef} from 'react';
import {NativeIcon,NativeButton,formatStamp,digits} from './Native.jsx';
import {formatPhone} from '../hooks/usePhoneController.js';
import {leadPhones} from '../utils/leadUtils.js';

const nameFor=(leads,number)=>leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(number)))?.name||formatPhone(number)||number;
const supported=channel=>channel==='imessage'?'imessage':'text';
const channelLabel=channel=>channel==='imessage'?'iMessage':'Text Message';
function List({messages,leads,onThread,onCompose,onWhatsApp,onBack}){
 const [query,setQuery]=useState(''),[unreadOnly,setUnreadOnly]=useState(false),[searchOpen,setSearchOpen]=useState(false);
 const threads=useMemo(()=>{
   const map=new Map();
   messages.filter(m=>m.channel==='text'||m.channel==='imessage').forEach(m=>{
     const key=m.channel+':'+digits(m.number),old=map.get(key);
     if(!old||m.at>old.at)map.set(key,m);
   });
   return [...map.values()].sort((a,b)=>b.at-a.at);
 },[messages]);
 const filtered=threads.filter(m=>(nameFor(leads,m.number)+' '+m.text+' '+channelLabel(m.channel)).toLowerCase().includes(query.toLowerCase())&&(!unreadOnly||messages.some(x=>x.channel===m.channel&&digits(x.number)===digits(m.number)&&x.unread)));
 return <div className="np-screen np-messages">
   <div className="np-top-action"><NativeButton name="back" label="Back to All" onClick={onBack} kind="np-back"/><div><NativeButton name="search" label="Search messages" onClick={()=>setSearchOpen(v=>!v)}/><NativeButton name="whatsapp" label="WhatsApp chats" onClick={onWhatsApp} kind="np-whatsapp-entry"/><NativeButton name="filter" label={unreadOnly?'Show all messages':'Show unread messages'} onClick={()=>setUnreadOnly(s=>!s)} kind="np-quiet-round"/><NativeButton name="compose" label="New iOS message" onClick={onCompose} kind="np-compose-entry"/></div></div>
   <h1 className="np-large-title">Messages</h1>
   <div className="np-native-list np-scroll">{filtered.map(m=><button className="np-list-row" type="button" key={m.channel+digits(m.number)} onClick={()=>onThread(m.channel,m.number)}>
     
     <span className="np-list-copy"><span className="np-list-top"><strong>{nameFor(leads,m.number)}</strong><span className="np-meta">{formatStamp(m.at)}</span></span><span className="np-preview"><span className={m.channel==='imessage'?'np-channel-blue':'np-channel-green'}>{m.channel==='imessage'?'iMessage':'Text'}</span> · {m.text}</span></span>
     {messages.some(x=>x.channel===m.channel&&digits(x.number)===digits(m.number)&&x.unread)&&<i className="np-unread-dot"/>}
   </button>)}{!filtered.length&&<p className="np-empty">No conversations</p>}</div>
   {searchOpen&&<div className="np-compact-search"><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search messages" aria-label="Search messages input"/><NativeButton name="close" label="Close message search" onClick={()=>{setSearchOpen(false);setQuery("")}}/></div>}
 </div>;
}
function Thread({number,channel,messages,leads,onBack,onCall,onSave,onThread}){
 const [draft,setDraft]=useState(''),[attachments,setAttachments]=useState([]),bottom=useRef(null),fileRef=useRef(null);
 const conversation=useMemo(()=>messages.filter(m=>m.channel===channel&&digits(m.number)===digits(number)).sort((a,b)=>a.at-b.at),[messages,number,channel]);
 const name=nameFor(leads,number);
 useEffect(()=>{bottom.current?.scrollIntoView?.({block:'end'});},[conversation.length,number,channel]);
 const save=e=>{e.preventDefault();if(!draft.trim()&&!attachments.length)return;onSave(channel,number,draft.trim(),attachments);setDraft('');setAttachments([])};
 return <div className="np-screen np-thread">
  <div className="np-thread-nav"><NativeButton name="back" label="Back to messages" onClick={onBack} kind="np-back"/><div className="np-thread-identity"><span>{name}</span></div><div className="np-thread-actions"><NativeButton name="phone" label={'Call '+name} onClick={()=>onCall(number)}/></div></div>

  <div className="np-thread-timeline np-scroll">{conversation.map((m,i)=><React.Fragment key={m.id||i}>{(i===0||new Date(m.at).toDateString()!==new Date(conversation[i-1].at).toDateString())&&<div className="np-day-divider">{new Date(m.at).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} {new Date(m.at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</div>}<div className={'np-message-line '+(m.dir==='out'?'np-out':'np-in')}><div className={'np-message-bubble '+(m.dir==='out'&&channel==='text'?'np-sms-out':'')}>{m.text}{m.files?.length>0&&<div className="np-message-files">{m.files.map((f,k)=><small key={k}>{f.name} · local</small>)}</div>}</div></div>{m.status==='local'&&<span className="np-local-badge">Local only · not delivered</span>}</React.Fragment>)}<div ref={bottom}/></div>
  <form className="np-composebar" onSubmit={save}><input className="np-attachment-picker" ref={fileRef} aria-label="Attach local message files" type="file" multiple onChange={e=>setAttachments(current=>[...current,...Array.from(e.target.files||[])] )}/><button className="np-attach-button" type="button" aria-label="Attach message file" onClick={()=>fileRef.current?.click()}><NativeIcon name="paperclip" size={18}/></button><label className="np-compose-field"><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Message" aria-label={channel==='imessage'?'iMessage demo':'Text message'}/></label><button type="submit" className={'np-send-button '+(channel==='text'?'np-sms-send':'np-imessage-send')} aria-label="Save local message"><NativeIcon name="send" size={19}/></button></form>
  {attachments.length>0&&<div className="np-attachment-chips">{attachments.map((f,i)=><button type="button" key={i} onClick={()=>setAttachments(v=>v.filter((_,n)=>n!==i))}>{f.name} ×</button>)}</div>}
 </div>;
}
function NewMessage({leads,onBack,onThread}){
 const [query,setQuery]=useState('');
 const channel='text';
 const options=leads.flatMap(l=>leadPhones(l).map(phone=>({key:l.id+'-'+phone,name:l.name,phone}))).filter(x=>(x.name+' '+x.phone).toLowerCase().includes(query.toLowerCase())).slice(0,30),typed=digits(query);
 return <div className="np-screen np-new-message"><div className="np-new-bar"><span/><strong>New Message</strong><NativeButton name="close" label="Close composer" onClick={onBack} kind="np-quiet-round"/></div>

  <label className="np-to-field"><span>To:</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name or number"/></label>
  <div className="np-contact-results np-scroll">{options.map(item=><button key={item.key} type="button" onClick={()=>onThread(channel,item.phone)}><span><strong>{item.name}</strong><small>{formatPhone(item.phone)}</small></span></button>)}{typed.length===10&&!options.some(x=>digits(x.phone)===typed)&&<button type="button" onClick={()=>onThread(channel,query)}><span><strong>{formatPhone(query)}</strong><small>New number</small></span></button>}</div>
 </div>;
}
export default function Messages({page,number,channel='text',messages,leads,onBack,onThread,onCompose,onWhatsApp,onCall,onSave}){
 if(page==='thread')return <Thread number={number} channel={supported(channel)} messages={messages} leads={leads} onBack={onBack} onCall={onCall} onSave={onSave} onThread={onThread}/>;
 if(page==='new')return <NewMessage leads={leads} onBack={onBack} onThread={onThread}/>;
 return <List messages={messages} leads={leads} onThread={onThread} onCompose={onCompose} onWhatsApp={onWhatsApp} onBack={onBack}/>;
}
