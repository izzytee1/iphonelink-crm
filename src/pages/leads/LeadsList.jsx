import { Fragment, useMemo, useState } from 'react';
import LeadDetails from './LeadDetails.jsx';
import useResizableColumns from '../../hooks/useResizableColumns.js';
import { formatMoneyText, leadEmails, leadPhones, leadSearchText } from '../../utils/leadUtils.js';
import MailIcon from '../email/MailIcon.jsx';
const columns=[
  {key:'number',label:'#',width:40,minWidth:38},
  {key:'company',label:'Company',width:190,minWidth:150},
  {key:'owner',label:'Owner',width:155,minWidth:125},
  {key:'approval',label:'Approval',width:130,minWidth:115},
  {key:'revenue',label:'Revenue',width:120,minWidth:105},
  {key:'statements',label:'Statements',width:195,minWidth:170},
  {key:'phones',label:'Phone',width:195,minWidth:165},
  {key:'emails',label:'Email',width:270,minWidth:215},
  {key:'dob',label:'DOB',width:125,minWidth:110},
  {key:'address',label:'Address',width:315,minWidth:265},
  {key:'ssn',label:'SSN',width:135,minWidth:115},
  {key:'ein',label:'EIN',width:125,minWidth:108},
  {key:'bank',label:'Bank',width:190,minWidth:155},
  {key:'appDate',label:'App Date',width:140,minWidth:120},
];
const splitPreview=values=>{const x=(values||[]).filter(Boolean);return x.length>1?`${x[0]} +${x.length-1}`:x[0]||'—';};
const showDob=date=>{if(!date)return '—';const p=date.split('/');if(p.length!==3)return date;return new Date(Number(p[2]),Number(p[0])-1,Number(p[1])).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'});};
const numberTone=stage=>({'New':'new','Hot':'engaged','Follow-up':'contract','Messaged':'engaged','Replied':'closed'}[stage]||'new');
export default function LeadsList({leads=[],onAddLead,selectedLeadId,expandedLeadId,onSelectLead,onToggleLead,searchQuery='',notesByLead,onNotesChange,onCall,onSMS,onWhatsApp,onEmail,onEmailAll,messages=[],mailbox=[]}){
 const widths0=useMemo(()=>Object.fromEntries(columns.map(c=>[c.key,c.width])),[]);
 const {widths,startResize}=useResizableColumns(widths0,38);
 const [search,setSearch]=useState('');
 const [searchOpen,setSearchOpen]=useState(false);const [filter,setFilter]=useState('All');const [filtersOpen,setFiltersOpen]=useState(false);const [addOpen,setAddOpen]=useState(false);
 const [newLead,setNewLead]=useState({company:'',name:'',value:'',phone:'',email:'',address:''});
 const combinedQuery=(search+' '+searchQuery).trim().toLowerCase();
 const filteredLeads=useMemo(()=>leads.filter(lead=>(!combinedQuery||leadSearchText(lead).includes(combinedQuery))&&(filter==='All'||lead.stage===filter)),[leads,combinedQuery,filter]);
 const statuses=useMemo(()=>['All',...new Set(leads.map(l=>l.stage).filter(Boolean))],[leads]);
 const phoneFor=l=>leadPhones(l).map(v=>v.replace(/\D/g,'').slice(-10));
 const records = useMemo(()=>leads.map(l=>{const numbers=phoneFor(l);const outbound=messages.filter(m=>m.dir==='out'&&numbers.includes(String(m.number||'').replace(/\D/g,'').slice(-10)));const inbound=messages.filter(m=>m.dir==='in'&&numbers.includes(String(m.number||'').replace(/\D/g,'').slice(-10))); const thread=mailbox.filter(t=>(t.msgs||[]).some(m=>leadEmails(l).includes(m.peer))); const outboundMail=thread.some(t=>t.msgs.some(m=>m.out&&!m.draft));const inboundMail=thread.some(t=>t.msgs.some(m=>!m.out));return {...l,_contacted:outbound.length>0||outboundMail,_replied:inbound.length>0||inboundMail};}),[leads,messages,mailbox]);
 const contacted=records.filter(l=>l._contacted).length; const replied=records.filter(l=>l._replied).length;
 const hasRealActivity=records.some(l=>l._contacted||l._replied);
 const stats=[['Total',leads.length],['Contacted',hasRealActivity?contacted:'—'],['Not Contacted',hasRealActivity?leads.length-contacted:'—'],['Awaiting Reply',hasRealActivity?records.filter(l=>l._contacted&&!l._replied).length:'—'],['Replied',hasRealActivity?replied:'—'],['Follow-ups Due',leads.some(l=>l.followUpAt)?leads.filter(l=>l.followUpAt&&new Date(l.followUpAt)<new Date()).length:'—']];
 function add(event){event.preventDefault();if(!newLead.company.trim())return;onAddLead?.({company:newLead.company.trim(),name:newLead.name.trim(),owner:newLead.name.trim(),value:Number(newLead.value)||0,approval:0,phones:newLead.phone.trim()?[newLead.phone.trim()]:[],emails:newLead.email.trim()?[newLead.email.trim()]:[],address:newLead.address.trim(),stage:'New',statements:[],bank:'',dob:'',ein:'',ssn:'',appDate:new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})});setAddOpen(false);setNewLead({company:'',name:'',value:'',phone:'',email:'',address:''});}
 const render=(lead,key,index)=>{
  switch(key){case'number':return index+1;case'company':return lead.company;case'owner':return lead.owner||lead.name||'—';case'approval':return formatMoneyText(lead.approval||0);case'revenue':return formatMoneyText(lead.value||0);case'statements':return lead.statements?.length?<><span className="il-statement-month">{lead.statements[0].month}</span> {formatMoneyText(lead.statements[0].deposits)} • {formatMoneyText(lead.statements[0].balance)}</>:'—';case'phones':return splitPreview(leadPhones(lead));case'emails':return splitPreview(leadEmails(lead));case'dob':return showDob(lead.dob||lead.birthDate);case'address':return typeof lead.address==='string'?lead.address:([lead.address?.street,lead.address?.city,lead.address?.state,lead.address?.zip].filter(Boolean).join(', ')||'—');case'ssn':return lead.ssn||'—';case'ein':return lead.ein||'—';case'bank':return lead.bank||'—';case'appDate':return lead.appDate||'—';default:return '—';}
 };
 const tableWidth=columns.reduce((s,c)=>s+Number(widths[c.key]||c.width),0);
 return <section className="lead-panel-shell il-leads" aria-label="Lead list">
 <div className="il-lead-toolbar"><div className="il-stats" aria-label="Lead statistics">{stats.map(([label,count])=><span key={label}><small>{label}</small><strong>{count}</strong></span>)}</div>
 <div className="il-lead-actions"><div className={"il-lead-search"+(searchOpen?" expanded":" collapsed")}>{searchOpen?<><MailIcon name="search" size={17}/><input autoFocus aria-label="Search leads" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search leads"/><button type="button" className="il-search-close" aria-label="Close lead search" onClick={()=>{setSearchOpen(false);setSearch("")}}>×</button></>:<button type="button" className="il-search-open" aria-label="Search leads" onClick={()=>setSearchOpen(true)}><MailIcon name="search" size={17}/></button>}</div><div className="il-filter-wrap"><button type="button" className="il-filter-btn" onClick={()=>setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><MailIcon name="filter" size={17}/> Filter</button>{filtersOpen&&<div className="il-filter-menu">{statuses.map(s=><button type="button" key={s} className={filter===s?'active':''} onClick={()=>{setFilter(s);setFiltersOpen(false);}}>{s}</button>)}</div>}</div><button type="button" className="il-add-btn" onClick={()=>setAddOpen(true)}>+ Add Lead</button></div></div>
 <div className="crm-scroll il-grid-scroll"><table id="leadTable" className="il-grid-table" style={{width:tableWidth,minWidth:'100%'}}><colgroup>{columns.map(c=><col key={c.key} style={{width:widths[c.key]||c.width}} />)}</colgroup><thead><tr>{columns.map(c=><th key={c.key} className={c.key==='number'?'il-number':''}><span>{c.label}</span><span className="il-resizer" onPointerDown={e=>startResize(e,c.key,c.minWidth)}/></th>)}</tr></thead><tbody>{filteredLeads.map((l,i)=><Fragment key={l.id}>
 <tr key={`lead-${l.id}`} data-lead-id={l.id} tabIndex={0} onClick={()=>{onSelectLead(l.id);onToggleLead?.(l.id);}} onKeyDown={e=>{if(e.key==='Enter'){onSelectLead(l.id);onToggleLead?.(l.id);}}} className={Number(l.id)===Number(selectedLeadId)?'selected':''}>{columns.map(c=><td key={c.key} title={c.key==='phones'?leadPhones(l).join('\n'):c.key==='emails'?leadEmails(l).join('\n'):undefined} className={`${c.key==='number'?'il-number il-state-'+numberTone(l.stage):''} ${c.key==='company'?'il-company':''}`}>{render(l,c.key,i)}</td>)}</tr>
 {Number(expandedLeadId)===Number(l.id)?<tr key={`details-${l.id}`} className="lead-expanded-row"><td colSpan={columns.length}><LeadDetails lead={l} notes={notesByLead?.[l.id]||''} onNotesChange={notes=>onNotesChange?.(l.id,notes)} onCall={onCall} onSMS={onSMS} onWhatsApp={onWhatsApp} onEmail={onEmail} onEmailAll={onEmailAll}/></td></tr>:null}
 </Fragment>)}{!filteredLeads.length&&<tr><td colSpan={columns.length} className="il-no-leads">No matching leads</td></tr>}</tbody></table></div>
 {addOpen&&<div className="il-add-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setAddOpen(false);}}><form className="il-add-modal" onSubmit={add}><header>Add Lead <button type="button" onClick={()=>setAddOpen(false)} aria-label="Close"><MailIcon name="close"/></button></header>{[['company','Company'],['name','Contact'],['value','Revenue'],['phone','Phone'],['email','Email'],['address','Address']].map(([key,label])=><label key={key}>{label}<input type={key==='email'?'email':key==='value'?'number':'text'} required={key==='company'} value={newLead[key]} onChange={e=>setNewLead(s=>({...s,[key]:e.target.value}))}/></label>)}<footer><button type="button" onClick={()=>setAddOpen(false)}>Cancel</button><button type="submit">Save Lead</button></footer></form></div>}
 </section>;
}
