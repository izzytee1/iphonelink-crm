import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initialMailbox, mailAccounts } from '../../data/mail.js';
import { validAddr, lastMessage, unreadThread, leadByEmail } from './shared.js';
import EmailSidebar from './EmailSidebar.jsx';
import EmailHeader from './EmailHeader.jsx';
import EmailList from './EmailList.jsx';
import EmailReader from './EmailReader.jsx';
import EmailComposer from './EmailComposer.jsx';
import MailIcon from './MailIcon.jsx';
import { loadMailbox } from '../../services/mailStore.js';
import {createLocalEmailThread} from '../../services/localReplies.js';
export { initialMailbox, mailAccounts };
const emptyAdvanced = {from:'',to:'',subject:'',after:'',before:'',unread:false,attachments:false};
const uuid = () => `draft-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const makeCompose = (initial={}) => ({ id:initial.id||uuid(), to:initial.to||[],cc:initial.cc||[],bcc:initial.bcc||[],subject:initial.subject||'',body:initial.body||'',account:initial.account??0, attachments:initial.attachments||[],track:initial.track??true,showExtra:initial.showExtra||false });

export default function EmailClient({ leads=[], mailbox, setMailbox, composeRequest, onConsumeComposeRequest, onSelectLead, compact=false,openThreadRequest=null }) {
  const [folder,setFolder]=useState('inbox');
  const [accountFilter,setAccountFilter]=useState('all');
  const [folderOpen,setFolderOpen]=useState(false);
  const [query,setQuery]=useState('');
  const [advanced,setAdvanced]=useState(emptyAdvanced);
  const [threadId,setThreadId]=useState(null);
  const [compose,setCompose]=useState(null);
  const [selectedIds,setSelectedIds]=useState([]);
  const [toast,setToast]=useState(null);
  const undoRef=useRef(null);
  const timerRef=useRef(null);
  const lastComposeRequestRef=useRef(null);
  const toastMessage=useCallback((message,undo=null)=>{setToast({message,undo});if(timerRef.current)clearTimeout(timerRef.current);timerRef.current=setTimeout(()=>setToast(null),undo?7000:3200);},[]);
  useEffect(()=>()=>{clearTimeout(timerRef.current);clearTimeout(undoRef.current);},[]);
  useEffect(()=>{if(!composeRequest||composeRequest.id===lastComposeRequestRef.current)return;lastComposeRequestRef.current=composeRequest.id;setCompose(makeCompose({to:composeRequest.to}));onConsumeComposeRequest?.();},[composeRequest,onConsumeComposeRequest]);
  useEffect(()=>{if(!compose)return;const draftMsg={id:`${compose.id}-message`,draft:true,out:true,peer:compose.to[0]||'',to:compose.to,cc:compose.cc,bcc:compose.bcc,subject:compose.subject,body:compose.body,at:Date.now(),by:mailAccounts[compose.account]?.name,tracked:compose.track,attachments:compose.attachments.map(f=>({name:f.name,size:f.size,type:f.type,data:f.data||f})),opens:[]};
    setMailbox(current=>{const idx=current.findIndex(t=>t.id===compose.id); const thread={id:compose.id,folder:'drafts',account:compose.account,msgs:[draftMsg]};return idx===-1?[thread,...current]:current.map(t=>t.id===compose.id?thread:t);});
  },[compose,setMailbox]);
  const visibleThreads=useMemo(()=>{
    const terms=query.trim().toLowerCase(); const hasFilters=terms||Object.values(advanced).some(Boolean);
    return mailbox.filter(t=>{
      if(folder!=='all' && (folder==='drafts' ? t.folder!=='drafts' : t.folder!==folder))return false;
       if(compact && accountFilter!=='all' && Number(t.account)!==Number(accountFilter))return false;
      if(!hasFilters)return true;
      return t.msgs.some(m=>{
        const content=[m.peer,m.by,m.subject,m.body,(m.to||[]).join(' '),(m.cc||[]).join(' ')].join(' ').toLowerCase();
        if(terms&&!content.includes(terms))return false;
        if(advanced.from&&!String(m.out?mailAccounts[t.account]?.email:m.peer||'').toLowerCase().includes(advanced.from.toLowerCase()))return false;
        if(advanced.to&&!(m.to||[m.peer]).join(',').toLowerCase().includes(advanced.to.toLowerCase()))return false;
        if(advanced.subject&&!String(m.subject||'').toLowerCase().includes(advanced.subject.toLowerCase()))return false;
        if(advanced.after && m.at < new Date(`${advanced.after}T00:00:00`).getTime())return false;
        if(advanced.before && m.at > new Date(`${advanced.before}T23:59:59`).getTime())return false;
        if(advanced.unread&&!m.unread)return false;
        if(advanced.attachments&&!m.attachments?.length)return false;
        return true;
      });
    }).sort((a,b)=>(lastMessage(b).at||0)-(lastMessage(a).at||0));
  },[mailbox,folder,query,advanced,accountFilter,compact]);
  const currentThread=mailbox.find(t=>t.id===threadId)||null;
  const unreadCount=mailbox.filter(t=>t.folder==='inbox'&&unreadThread(t)).length;
  const draftCount=mailbox.filter(t=>t.folder==='drafts').length;
  const selected = mailbox.filter(t=>selectedIds.includes(t.id));
  const toggleSelected = id=>setSelectedIds(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const clearSelection=()=>setSelectedIds([]);
  function openConversation(id) {const t=mailbox.find(x=>x.id===id);if(!t)return;
    if(t.folder==='drafts'){const m=lastMessage(t);setCompose(makeCompose({...m,id:t.id,account:t.account,track:m.tracked,showExtra:!!(m.cc?.length||m.bcc?.length)}));setThreadId(null);return;}
    setThreadId(id);clearSelection();setMailbox(s=>s.map(t=>t.id===id?{...t,msgs:t.msgs.map(m=>({...m,unread:false}))}:t));
    const lead=leadByEmail(leads,lastMessage(t).peer);if(lead)onSelectLead?.(lead.id);
  }
  function startCompose(initial={}) {setFolderOpen(false);setCompose(makeCompose({...initial,account:initial.account??(accountFilter==='all'?0:Number(accountFilter))}));}
  function template(t) {setCompose(s=>{if(!s)return s;const lead=leadByEmail(leads,s.to[0]);const replace=x=>String(x||'').replaceAll('{first}',lead?.name?.split(/\s+/)[0]||'').replaceAll('{company}',lead?.company||'');return {...s,subject:replace(t.subject),body:replace(t.html),templateVersion:(s.templateVersion||0)+1};});}
  function removeDraft(id) {setMailbox(s=>s.filter(t=>t.id!==id));}
  function closeCompose() {setCompose(null);toastMessage('Draft saved');}
  function discardCompose() {if(compose)removeDraft(compose.id);setCompose(null);toastMessage('Draft discarded');}
  function send() {if(!compose)return;const recipients=[...compose.to,...compose.cc,...compose.bcc].map(x=>x.trim()).filter(Boolean);
    if(!recipients.length)return toastMessage('Add at least one recipient.');const bad=recipients.find(x=>!validAddr(x));if(bad)return toastMessage(`Invalid email address: ${bad}`);
    const outThread=createLocalEmailThread(compose);
    const oldDraft=compose;
    setMailbox(s=>[outThread,...s.filter(t=>t.id!==compose.id)]);setCompose(null);
    const undo=()=>{setMailbox(s=>s.filter(t=>t.id!==outThread.id));setCompose(oldDraft);toastMessage('Local send undone');};
    undoRef.current=setTimeout(()=>{undoRef.current=null;},7000);
    toastMessage('Added to Sent (local demo — not delivered)',()=>{if(undoRef.current){clearTimeout(undoRef.current);undoRef.current=null;undo();}});
  }
  function updateMany(updater,message) {const targets=selectedIds.length?selectedIds:(threadId?[threadId]:[]);if(!targets.length)return;
    setMailbox(s=>s.map(t=>targets.includes(t.id)?updater(t):t));clearSelection();setThreadId(null);toastMessage(message);}
  const archiveCurrent=()=>updateMany(t=>({...t,folder:'archive'}),'Archived');
  const deleteCurrent=()=>updateMany(t=>({...t,folder:'trash'}),'Moved to Trash');
  const markCurrentUnread=()=>updateMany(t=>({...t,msgs:t.msgs.map((m,i)=>i===t.msgs.length-1?{...m,unread:true}:m)}),'Marked unread');
  const moveCurrentToSpam=()=>updateMany(t=>({...t,folder:'spam'}),'Moved to Spam');
  useEffect(()=>{if(!openThreadRequest?.id)return;setFolderOpen(false);openConversation(openThreadRequest.id);},[openThreadRequest?.id]);
  function replyToThread(type='reply') {if(!currentThread)return;const m=lastMessage(currentThread);let to=[];if(type==='forward')to=[];else if(m.out)to=m.to||[m.peer];else to=[m.peer];
    if(type==='all')to=[...new Set([...to,...(m.to||[]),...(m.cc||[])].filter(x=>validAddr(x)&&x!==mailAccounts[currentThread.account]?.email))];
    startCompose({to,subject:type==='forward'?(/^fwd:/i.test(m.subject||'')?m.subject:`Fwd: ${m.subject||''}`):(/^re:/i.test(m.subject||'')?m.subject:`Re: ${m.subject||''}`),body:type==='forward'?`\n\n---------- Forwarded message ----------\nFrom: ${m.peer}\nSubject: ${m.subject}\n\n${String(m.body||'').replace(/<[^>]+>/g,' ')}`:'',account:currentThread.account});
  }
  function saveInlineReply(text,mode){
    if(!currentThread||!text.trim())return;
    const latest=lastMessage(currentThread);
    const to=[latest.peer];
    const subject=/^re:/i.test(latest.subject||'')?latest.subject:'Re: '+(latest.subject||'');
    const reply=createLocalEmailThread({to,subject,body:text,account:currentThread.account}).msgs[0];
    setMailbox(current=>current.map(t=>t.id===currentThread.id?{...t,msgs:[...t.msgs.map(m=>({...m,unread:false})),reply]}:t));
    toastMessage('Reply saved locally — not delivered');
  }
  async function refresh() {try{const saved=await loadMailbox();if(Array.isArray(saved)){setMailbox(saved);toastMessage('Mailbox refreshed');}else toastMessage('Local mailbox is up to date');}catch{toastMessage('Could not refresh local mailbox');}}
  return <section className={`gm-mail-app ${compact?'gm-compact':''}`} aria-label="Email client">
    {(!compact||folderOpen)&&<><EmailSidebar folder={folder} setFolder={v=>{setFolder(v);setFolderOpen(false)}} setThreadId={setThreadId} startCompose={startCompose} unreadCount={unreadCount} draftCount={draftCount} compact={compact}/>{compact&&<button type="button" className="gm-compact-scrim" aria-label="Close mail folders" onClick={()=>setFolderOpen(false)}/>}</>}
    <div id={compact?"gmCompactPanes":"gmPanes"} className="gm-main">
      {compact&&<div className="gm-compact-tools"><button type="button" className="gm-compact-folders" onClick={()=>setFolderOpen(v=>!v)} aria-label="Switch mail folder"><MailIcon name="inbox" size={16}/>{folder==="all"?"All Mail":folder[0].toUpperCase()+folder.slice(1)}<span aria-hidden="true">⌄</span></button><select aria-label="Switch email account" value={accountFilter} onChange={e=>setAccountFilter(e.target.value)}><option value="all">All accounts</option>{mailAccounts.map((a,i)=><option key={a.id} value={i}>{a.email}</option>)}</select><button type="button" aria-label="Compose mail inline" onClick={()=>startCompose()}><MailIcon name="compose" size={18}/></button></div>}
      <EmailHeader query={query} setQuery={setQuery} advanced={advanced} setAdvanced={setAdvanced} compact={compact}/>
      {!currentThread?<><div className="gm-list-toolbar">
        {!compact&&<label className="gm-select-all" title="Select all visible messages"><input type="checkbox" checked={visibleThreads.length>0&&visibleThreads.every(t=>selectedIds.includes(t.id))} onChange={e=>setSelectedIds(e.target.checked?visibleThreads.map(t=>t.id):[])} /></label>}
        <button type="button" title="Refresh" aria-label="Refresh" onClick={refresh}><MailIcon name="refresh"/></button>
        {selected.length>0?<><button type="button" title="Archive selected" onClick={archiveCurrent}><MailIcon name="archive"/></button><button type="button" title="Delete selected" onClick={deleteCurrent}><MailIcon name="trash"/></button><button type="button" title="Mark unread" onClick={markCurrentUnread}><MailIcon name="unread"/></button><button type="button" title="Move to Spam" onClick={moveCurrentToSpam}><MailIcon name="spam"/></button><select aria-label="Move selected" defaultValue="" onChange={e=>{const target=e.target.value;if(target)updateMany(t=>({...t,folder:target}),`Moved to ${target}`);e.target.value='';}}><option value="">Move to…</option>{['inbox','archive','spam','trash'].map(f=><option key={f} value={f}>{f}</option>)}</select><button type="button" onClick={clearSelection}>Clear</button></>:null}
        <span className="gm-list-count">{visibleThreads.length?`1–${visibleThreads.length} of ${visibleThreads.length}`:'0 messages'}</span>
      </div><EmailList visibleThreads={visibleThreads} openConversation={openConversation} selectedIds={selectedIds} toggleSelected={toggleSelected} compact={compact}/></>:
      <EmailReader onInlineReply={saveInlineReply} currentThread={currentThread} setThreadId={setThreadId} archiveCurrent={archiveCurrent} deleteCurrent={deleteCurrent} replyToThread={()=>replyToThread('reply')} replyAllToThread={()=>replyToThread('all')} forwardThread={()=>replyToThread('forward')} markCurrentUnread={markCurrentUnread} moveCurrentToSpam={moveCurrentToSpam} compact={compact}/>}
    </div>
    {compose&&<EmailComposer compose={compose} setCompose={setCompose} send={send} applyTemplate={template} onClose={closeCompose} onDiscard={discardCompose} compact={compact}/>}
    {toast&&<div className="gm-toast" role="status">{toast.message}{toast.undo&&<button type="button" onClick={()=>{toast.undo();setToast(null);}}>Undo</button>}</div>}
  </section>;
}
