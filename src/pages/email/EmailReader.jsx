import { useState } from 'react';
import { mailAccounts } from '../../data/mail.js';
import { lastMessage, listDate, safeHtml } from './shared.js';
import MailIcon from './MailIcon.jsx';
export default function EmailReader({ currentThread, setThreadId, archiveCurrent, deleteCurrent, replyToThread, replyAllToThread, forwardThread, markCurrentUnread, moveCurrentToSpam, compact=false,onInlineReply }) {
  const [details,setDetails]=useState({});
  const [replyMode,setReplyMode]=useState(null);
  const [replyText,setReplyText]=useState("");
  const msg=lastMessage(currentThread);
  return <article id="gmRead" className="gm-reader">
    <div className="gm-reader-toolbar"><button type="button" title="Back to messages" aria-label="Back" onClick={()=>setThreadId(null)}><MailIcon name="back"/></button>
      <button type="button" title="Archive" aria-label="Archive" onClick={archiveCurrent}><MailIcon name="archive"/></button>
      <button type="button" title="Delete" aria-label="Delete" onClick={deleteCurrent}><MailIcon name="trash"/></button>
      <button type="button" title="Mark unread" aria-label="Mark unread" onClick={markCurrentUnread}><MailIcon name="unread"/></button>
      <button type="button" title="Report spam" aria-label="Report spam" onClick={moveCurrentToSpam}><MailIcon name="spam"/></button>
    </div>
    <div id="gmReadScroll" className="gm-reader-scroll"><h1 className="gm-reader-subject">{msg.subject||'(no subject)'}</h1>
    {currentThread.msgs.filter(m=>!m.draft).map(message=>{const by=message.out?mailAccounts[currentThread.account]?.name||'Me':message.peer||'Unknown';const fromAddress=message.out?mailAccounts[currentThread.account]?.email:message.peer;return <section key={message.id} className="gm-message">
      <div className="gm-message-header"><div className="gm-message-avatar" aria-hidden="true">{String(by).split(/[@\s.]+/).slice(0,2).map(s=>s.charAt(0).toUpperCase()).join('')}</div>
        <div className="gm-message-meta"><strong>{by}</strong><button type="button" className="gm-message-details-trigger" onClick={()=>setDetails(s=>({...s,[message.id]:!s[message.id]}))}>to {message.out?(message.to||[message.peer]).join(', '):(mailAccounts[currentThread.account]?.email||'me')} <span>⌄</span></button>
        {details[message.id]&&<div className="gm-message-details"><div>From: {fromAddress}</div><div>To: {(message.to||[message.peer]).join(', ')}</div>{message.cc?.length?<div>Cc: {message.cc.join(', ')}</div>:null}{message.bcc?.length?<div>Bcc: {message.bcc.join(', ')}</div>:null}<div>Date: {new Date(message.at).toLocaleString()}</div></div>}</div>
        <span className="gm-message-time">{listDate(message.at)}</span><button type="button" title="Reply" aria-label="Reply" onClick={compact?()=>setReplyMode("reply"):replyToThread}><MailIcon name="reply"/></button><button type="button" title="More reply options" aria-label="Reply options" onClick={compact?()=>setReplyMode("all"):replyAllToThread}><MailIcon name="more"/></button>
      </div>
      <div className="gm-message-body" dangerouslySetInnerHTML={{__html:safeHtml(message.body)}}/>
      {message.attachments?.length>0&&<div className="gm-read-attachments">{message.attachments.map((file,index)=><button type="button" key={`${file.name}-${index}`} onClick={()=>{const blob=file.data;if(!(blob instanceof Blob))return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}} title={file.data?'Download attachment':'Attachment preview unavailable for sample email'}><MailIcon name="attachment" size={16}/>{file.name} {file.data?'↓':''}</button>)}</div>}
      {message.out && message.opens?.length>0&&<div className="gm-open-info">Opened {message.opens.length} time{message.opens.length!==1?'s':''}</div>}
    </section>;})}
    <div className="gm-read-replies"><button type="button" onClick={compact?()=>setReplyMode("reply"):replyToThread}><MailIcon name="reply" size={16}/> Reply</button><button type="button" onClick={compact?()=>setReplyMode("all"):replyAllToThread}><MailIcon name="replyAll" size={16}/> Reply all</button><button type="button" onClick={forwardThread}><MailIcon name="forward" size={16}/> Forward</button></div>
    </div>
    {compact&&replyMode&&<form className="gm-inline-reply" onSubmit={e=>{e.preventDefault();if(!replyText.trim())return;onInlineReply?.(replyText.trim(),replyMode);setReplyMode(null);setReplyText("");}}>
      <label>{replyMode==='all'?'Reply all':'Reply'} · {msg.peer}</label>
      <textarea aria-label="Inline email reply" rows={3} autoFocus value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply"/>
      <div><span>Local only · not delivered</span><button type="button" onClick={()=>setReplyMode(null)}>Cancel</button><button type="submit" disabled={!replyText.trim()}>Save reply</button></div>
    </form>}
  </article>;
}
