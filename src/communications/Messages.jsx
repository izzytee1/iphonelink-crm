import React,{useMemo,useState,useEffect,useRef} from 'react';
import {Avatar,NativeIcon,NativeButton,formatStamp,digits} from './Native.jsx';
import {formatPhone} from '../hooks/usePhoneController.js';
import {leadPhones} from '../utils/leadUtils.js';

const nameFor=(leads,number)=>{const n=digits(number);const lead=leads.find(l=>leadPhones(l).some(p=>digits(p)===n));return lead?.name||formatPhone(number)||number;};
function List({messages,leads,onThread,onCompose}){
 const [query,setQuery]=useState('');
 const threads=useMemo(()=>{const map=new Map();messages.filter(m=>m.channel==='text').forEach(m=>{const key=digits(m.number);const old=map.get(key);if(!old||m.at>old.at)map.set(key,m);});return [...map.values()].sort((a,b)=>b.at-a.at)},[messages]);
 const filtered=threads.filter(m=>(nameFor(leads,m.number)+' '+m.text).toLowerCase().includes(query.toLowerCase()));
 return <div className="np-screen np-messages">
  <div className="np-top-action"><button type="button" className="np-text-action" onClick={onCompose}>Edit</button><NativeButton name="filter" label="Message filters" onClick={()=>setQuery(q=>q?'':' ')} kind="np-quiet-round"/></div>
  <h1 className="np-large-title">Messages</h1>
  <div className="np-native-list np-scroll">{filtered.map(m=><button className="np-list-row" type="button" key={digits(m.number)} onClick={()=>onThread(m.number)}><Avatar name={nameFor(leads,m.number)} size={47} initial={Boolean(nameFor(leads,m.number)&&!/^\+?[\d(\s-]/.test(nameFor(leads,m.number)))&&nameFor(leads,m.number)!==formatPhone(m.number)}/><span className="np-list-copy"><span className="np-list-top"><strong>{nameFor(leads,m.number)}</strong><span className="np-meta">{formatStamp(m.at)} <NativeIcon name="chevron" size={13}/></span></span><span className="np-preview">{m.text}</span></span>{messages.some(x=>digits(x.number)===digits(m.number)&&x.channel==='text'&&x.unread)&&<i className="np-unread-dot"/>}</button>)}{!filtered.length&&<p className="np-empty">No conversations</p>}</div>
  <div className="np-bottom-search"><label className="np-search-pill"><NativeIcon name="search" size={21}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search" aria-label="Search messages"/></label><NativeButton name="compose" label="New message" onClick={onCompose} kind="np-round-compose" size={24}/></div>
 </div>;
}
function Thread({number,messages,leads,onBack,onCall,onSave}){
 const [draft,setDraft]=useState('');const bottom=useRef(null);
 const conversation=useMemo(()=>messages.filter(m=>m.channel==='text'&&digits(m.number)===digits(number)).sort((a,b)=>a.at-b.at),[messages,number]);
 const name=nameFor(leads,number);
 useEffect(()=>bottom.current?.scrollIntoView?.({block:'end'}),[conversation.length,number]);
 const save=e=>{e.preventDefault();if(!draft.trim())return;onSave('text',number,draft.trim());setDraft('')};
 return <div className="np-screen np-thread">
  <div className="np-thread-nav"><NativeButton name="back" label="Back to messages" onClick={onBack} kind="np-back"/><div className="np-thread-identity"><Avatar name={name} size={37} initial={name!==formatPhone(number)}/><span>{name}</span></div><NativeButton name="video" label="Video call (unavailable)" onClick={()=>{}}/></div>
  <div className="np-thread-timeline np-scroll">{conversation.map((m,i)=><React.Fragment key={m.id||i}>{(i===0||new Date(m.at).toDateString()!==new Date(conversation[i-1].at).toDateString())&&<div className="np-day-divider">{new Date(m.at).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} {new Date(m.at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</div>}<div className={'np-message-line '+(m.dir==='out'?'np-out':'np-in')}><div className={'np-message-bubble '+(m.dir==='out'?'np-sms-out':'')}>{m.text}</div></div>{m.status==='local'&&<span className="np-local-badge">Saved locally · not delivered</span>}</React.Fragment>)}<div ref={bottom}/></div>
  <form className="np-composebar" onSubmit={save}><NativeButton name="plus" label="Attachments unavailable" onClick={()=>{}} kind="np-plus"/><label className="np-compose-field"><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Text Message · SMS" aria-label="Text message"/><NativeIcon name="mic" size={16}/></label><button type="submit" className="np-send-button" aria-label="Save local message"><NativeIcon name="send" size={19}/></button></form>
 </div>;
}
function NewMessage({leads,onBack,onThread}){
 const [query,setQuery]=useState('');
 const options=leads.flatMap(l=>leadPhones(l).map(phone=>({key:l.id+'-'+phone,name:l.name,phone}))).filter(x=>(x.name+' '+x.phone).toLowerCase().includes(query.toLowerCase())).slice(0,30);
 const typed=digits(query);
 return <div className="np-screen np-new-message"><div className="np-new-bar"><span/><strong>New Message</strong><NativeButton name="close" label="Close composer" onClick={onBack} kind="np-quiet-round"/></div><label className="np-to-field"><span>To:</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name or number"/></label><div className="np-contact-results np-scroll">{options.map(item=><button key={item.key} type="button" onClick={()=>onThread(item.phone)}><Avatar name={item.name} size={35} initial/><span><strong>{item.name}</strong><small>{formatPhone(item.phone)}</small></span><NativeIcon name="chevron" size={16}/></button>)}{typed.length===10&&!options.some(x=>digits(x.phone)===typed)&&<button type="button" onClick={()=>onThread(query)}><Avatar size={35}/><span><strong>{formatPhone(query)}</strong><small>New number</small></span></button>}</div><div className="np-composebar np-new-draft"><NativeButton name="plus" label="Attachments unavailable" onClick={()=>{}}/><span className="np-compose-field">Text Message · SMS</span><NativeIcon name="mic" size={18}/></div></div>;
}
export default function Messages({page,number,messages,leads,onBack,onThread,onCompose,onCall,onSave}){if(page==='thread')return <Thread number={number} messages={messages} leads={leads} onBack={onBack} onCall={onCall} onSave={onSave}/>;if(page==='new')return <NewMessage leads={leads} onBack={onBack} onThread={onThread}/>;return <List messages={messages} leads={leads} onThread={onThread} onCompose={onCompose}/>;}
