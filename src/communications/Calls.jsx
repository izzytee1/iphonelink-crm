import {useMemo,useRef,useState} from 'react';
import {NativeIcon,NativeButton,formatStamp,digits} from './Native.jsx';
import {leadPhones} from '../utils/leadUtils.js';

const pad=n=>String(n).padStart(2,'0');
const telephone=(value)=>{const number=String(value||'').replace(/\D/g,'');const local=number.length===11&&number[0]==='1'?number.slice(1):number;return local.length===10?'('+local.slice(0,3)+') '+local.slice(3,6)+'-'+local.slice(6):value;};
const findLead=(leads,n)=>leads.find(l=>leadPhones(l).some(p=>digits(p)===digits(n)));
const label=(leads,n)=>findLead(leads,n)?.name||telephone(n);
function CallsList({calls,leads,onDetail,onContacts,onKeypad,onCall,onExit}){
 const [filter,setFilter]=useState('all'),[filterOpen,setFilterOpen]=useState(false),[searchOpen,setSearchOpen]=useState(false),[search,setSearch]=useState('');
 const filtered=calls.filter(c=>(filter==='all'||c.dir==='missed')&&(label(leads,c.number)+' '+telephone(c.number)).toLowerCase().includes(search.toLowerCase()));
 return <div className="np-screen np-call-list">
  <div className="np-phone-titlebar"><NativeButton name="back" label="Back to Communications" onClick={onExit}/>
   <strong>Calls</strong><div className="np-phone-filter"><NativeButton name="filter" label="Filter calls" onClick={()=>setFilterOpen(v=>!v)}/>
    {filterOpen&&<div className="np-phone-filter-menu">{[['all','All'],['missed','Missed']].map(([key,title])=><button key={key} type="button" aria-pressed={filter===key} onClick={()=>{setFilter(key);setFilterOpen(false)}}>{title}</button>)}</div>}
   </div>
  </div>
  <div className="cp-calls-actions"><button type="button" onClick={onContacts}><NativeIcon name="user" size={15}/> Contacts</button><button type="button" onClick={onKeypad}><NativeIcon name="keypad" size={15}/> Keypad</button><button type="button" onClick={()=>{setSearchOpen(v=>!v);setSearch('')}}><NativeIcon name="search" size={15}/> Search</button></div>
  {searchOpen&&<label className="np-phone-search"><NativeIcon name="search" size={17}/><input aria-label="Search call history" type="search" placeholder="Search calls" value={search} onChange={e=>setSearch(e.target.value)}/></label>}
  <div className="np-native-list np-scroll">{filtered.map(c=><div className="np-call-row" key={c.id}>
   <button className="np-call-main" type="button" onClick={()=>onDetail(c)}>
    <span className="np-call-copy"><strong className={c.dir==='missed'?'np-missed':''}>{label(leads,c.number)}</strong><small>{c.dir==='missed'?'Missed':c.dir==='out'?'Outgoing':'Incoming'} · {telephone(c.number)}</small></span><span className="np-call-time">{formatStamp(c.at)}</span></button>
   <div className="np-call-side"><NativeButton name="message" label={'Message '+label(leads,c.number)} onClick={()=>onDetail(c,'message')} size={19}/><NativeButton name="phone" label={'Call '+label(leads,c.number)} onClick={()=>onCall(c.number)} size={20}/></div>
  </div>)}<p className="np-demo-disclaimer">Sample call history · provider call history not connected</p></div>
 </div>;
}
function Contacts({leads,onBack,onDetail}){
 const [search,setSearch]=useState(''),[searchOpen,setSearchOpen]=useState(false);
 const contacts=useMemo(()=>leads.filter(l=>leadPhones(l).length>0&&String(l.name||'').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''))),[leads,search]);
 return <div className="np-screen"><div className="np-simple-nav"><NativeButton name="back" label="Back" onClick={onBack}/><strong>Contacts</strong><NativeButton name="search" label="Search contacts" onClick={()=>setSearchOpen(v=>!v)}/></div>{searchOpen&&<label className="np-search-pill np-contact-search"><NativeIcon name="search"/><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts"/></label>}<div className="np-contact-results np-scroll">{contacts.map(l=><button type="button" key={l.id} onClick={()=>onDetail({number:leadPhones(l)[0],contact:true,id:l.id})}><span><strong>{l.name}</strong><small>{l.company||telephone(leadPhones(l)[0])}</small></span><NativeIcon name="chevron" size={16}/></button>)}{!contacts.length&&<p className="np-empty">No contacts</p>}</div></div>
}
function CallDetail({call,leads,onBack,onMessage,onCall,onWhatsApp}){
 const lead=findLead(leads,call.number),name=lead?.name||telephone(call.number);
 return <div className="np-screen np-detail-screen"><div className="np-simple-nav"><NativeButton name="back" label="Back" onClick={onBack}/><strong>{call.contact?'Contact':'Info'}</strong><span className="np-nav-spacer" aria-hidden="true"/></div><div className="np-detail-scroll np-scroll"><div className="np-contact-hero"><h2>{name}</h2>{lead?.company&&<p>{lead.company}</p>}</div><div className="np-action-four">{[{icon:'message',title:'message',action:()=>onMessage(call.number)},{icon:'phone',title:'call',action:()=>onCall(call.number)},{icon:'whatsapp',title:'WhatsApp',action:()=>onWhatsApp(call.number)}].map(a=><button key={a.title} type="button" onClick={a.action}><NativeIcon name={a.icon} size={23}/><span>{a.title}</span></button>)}</div><div className="np-detail-card"><small>mobile</small><div><span>{telephone(call.number)}</span><NativeButton name="message" label="Message" onClick={()=>onMessage(call.number)}/><NativeButton name="phone" label="Call" onClick={()=>onCall(call.number)}/></div></div>{!call.contact&&<div className="np-detail-card"><small>Call History · Sample</small><p>{call.dir==='out'?'Outgoing':call.dir==='missed'?'Missed':'Incoming'} Call</p><p>{new Date(call.at).toLocaleString('en-US')}</p>{Number(call.duration)>0&&<p>{Math.floor(call.duration/60)} minutes</p>}</div>}</div></div>
}
function Keypad({phoneController,onBack}){
 const numberRef=useRef(null);
 const state=phoneController.activeCall,active=state.phase!=='idle';
 const digitsInput=active?state.number:phoneController.dialInput;
 const number=telephone(digitsInput);
 const seconds=phoneController.seconds;
 const status=state.phase==='idle'?'':state.phase==='active'?pad(Math.floor(seconds/60))+':'+pad(seconds%60):phoneController.dialerStatus;
 const labels=['','ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ','','+',''];
 const keys=['1','2','3','4','5','6','7','8','9','*','0','#'];
 return <div className="np-screen np-keypad-screen"><div className="np-keypad-back"><NativeButton name="back" label="Back to calls" onClick={onBack}/></div><div className="np-keypad-number"><NativeIcon name="phone" size={16}/><input ref={numberRef} type="tel" inputMode="tel" aria-label="Phone number" value={number||''} placeholder="Enter Number" readOnly={active} onChange={e=>phoneController.setDialInput(e.target.value)}/>{!active&&digitsInput&&<NativeButton name="delete" label="Delete last digit" onClick={()=>phoneController.setDialInput(String(digitsInput).replace(/\D/g,'').slice(0,-1))}/>}</div><div className="np-keypad-status">{status||'\u00a0'}</div><div className="np-keypad-grid">{keys.map((key,i)=><button className="np-dial-key" data-dtmf="true" type="button" key={key} onClick={()=>phoneController.sendTone(key)}><strong>{key}</strong><span>{labels[i]||'\u00a0'}</span></button>)}</div><div className="np-in-call"><button type="button" onClick={()=>phoneController.toggleControl('muted')}><NativeIcon name="mute"/><small>mute</small></button><button type="button" onClick={()=>phoneController.toggleControl('held')}><NativeIcon name="hold"/><small>hold</small></button><button type="button" onClick={()=>phoneController.toggleControl('speaker')}><NativeIcon name="speaker"/><small>speaker</small></button><button type="button" onClick={()=>numberRef.current?.focus()}><NativeIcon name="keypad"/><small>keypad</small></button><button type="button" className="np-dial-green" onClick={()=>{if(state.phase==='idle'||state.phase==='incoming')phoneController.requestCall()}} aria-label="Call or answer"><NativeIcon name="phone" size={25}/></button><button type="button" className="np-dial-red" onClick={()=>{if(state.phase==='incoming')phoneController.decline();else if(state.phase!=='idle')phoneController.requestCall()}} aria-label="End call"><NativeIcon name="end" size={27}/></button></div></div>
}
export default function Calls({view='list',call,leads,calls,phoneController,onBack,onDetail,onMessage,onWhatsApp,onContacts,onKeypad,onExit}){
 const dial=n=>phoneController.callNumber(n);
 if(view==='keypad')return <Keypad phoneController={phoneController} onBack={onBack}/>;
 if(view==='contacts')return <Contacts leads={leads} onBack={onBack} onDetail={onDetail}/>;
 if(view==='detail'&&call)return <CallDetail call={call} leads={leads} onBack={onBack} onMessage={onMessage} onCall={dial} onWhatsApp={onWhatsApp}/>;
 return <CallsList leads={leads} calls={calls} onDetail={(c,type)=>type==='message'?onMessage(c.number):onDetail(c)} onCall={dial} onContacts={onContacts} onKeypad={onKeypad} onExit={onExit}/>;
}
