import { useEffect, useRef, useState } from 'react';
import { templates, mailAccounts } from '../../data/mail.js';
import MailIcon from './MailIcon.jsx';
import { escapeText } from './shared.js';

const splitEmails = text => text.split(/[;,]/).map(s=>s.trim()).filter(Boolean);
function bodyHtml(value) { return /<\/?(?:div|p|b|i|strong|em|u|br|a|ul|li|img)\b/i.test(value||'') ? String(value) : escapeText(value||'').replace(/\n/g,'<br>'); }
export default function EmailComposer({ compose, setCompose, send, applyTemplate, onClose, onDiscard, compact=false }) {
  const [minimized,setMinimized]=useState(false);
  const [maximized,setMaximized]=useState(false);
  const editor=useRef(null);
  const attachRef=useRef(null);
  const imgRef=useRef(null);
  useEffect(()=> { if(editor.current) editor.current.innerHTML=bodyHtml(compose.body); },[compose.id,compose.templateVersion]);
  const update = (key,value)=>setCompose(s=>({...s,[key]:value}));
  function rich(command, value) {
    editor.current?.focus();
    document.execCommand(command,false,value);
    update('body',editor.current?.innerHTML||'');
  }
  function insertLink() { const url=window.prompt('Link URL (https://…)'); if(url && /^https?:\/\//i.test(url)) rich('createLink',url); }
  function attach(files) { if(files?.length) setCompose(s=>({...s,attachments:[...s.attachments,...Array.from(files)]})); }
  function addImage(file) {
    if(!file || !file.type.startsWith('image/')) return;
    const reader=new FileReader();reader.onload=()=>rich('insertImage',String(reader.result||''));reader.readAsDataURL(file);
  }
  return <section className={`gm-compose ${compact?'gm-compose-compact':''} ${minimized?'minimized':''} ${maximized?'maximized':''}`} aria-label="New message">
    <header className="gm-compose-head"><span>New Message</span><div className="gm-compose-head-buttons">
      <button type="button" title={minimized?'Restore':'Minimize'} aria-label={minimized?'Restore compose':'Minimize compose'} onClick={()=>setMinimized(!minimized)}><MailIcon name="minimize"/></button>
      <button type="button" title={maximized?'Restore size':'Full screen'} aria-label="Toggle compose full screen" onClick={()=>{setMaximized(!maximized);setMinimized(false);}}><MailIcon name="expand"/></button>
      <button type="button" title="Save and close" aria-label="Close compose" onClick={onClose}><MailIcon name="close"/></button>
    </div></header>
    {!minimized && <div className="gm-compose-content">
      <div className="gm-compose-addresses">
        <div className="gm-compose-line"><label htmlFor="gmFrom">From</label><select id="gmFrom" value={compose.account} onChange={e=>update('account',Number(e.target.value))}>{mailAccounts.map((a,i)=><option key={a.id} value={i}>{a.name} &lt;{a.email}&gt;</option>)}</select></div>
        <div className="gm-compose-line"><label htmlFor="gmTo">To</label><input id="gmTo" type="text" value={compose.to.join(', ')} onChange={e=>update('to',splitEmails(e.target.value))} autoComplete="off"/><button type="button" onClick={()=>update('showExtra',!compose.showExtra)}>Cc Bcc</button></div>
        {compose.showExtra&&<><div className="gm-compose-line"><label htmlFor="gmCc">Cc</label><input id="gmCc" value={compose.cc.join(', ')} onChange={e=>update('cc',splitEmails(e.target.value))}/></div><div className="gm-compose-line"><label htmlFor="gmBcc">Bcc</label><input id="gmBcc" value={compose.bcc.join(', ')} onChange={e=>update('bcc',splitEmails(e.target.value))}/></div></>}
        <input aria-label="Subject" className="gm-compose-subject" value={compose.subject} onChange={e=>update('subject',e.target.value)} placeholder="Subject"/>
      </div>
      <div className="gm-editor" ref={editor} role="textbox" aria-label="Email message" contentEditable suppressContentEditableWarning onInput={()=>update('body',editor.current?.innerHTML||'')} data-placeholder="Write a message…"/>
      <div className="gm-compose-bottom">
        <div className="gm-template-strip" aria-label="Email templates">{templates.map(t=><button type="button" key={t.id} onClick={()=>{applyTemplate(t);}}>{t.name}</button>)}</div>
        {compose.attachments.length>0&&<div className="gm-attachments">{compose.attachments.map((f,i)=><span key={`${f.name}-${i}`}><MailIcon name="attachment" size={13}/>{f.name}<button type="button" aria-label={`Remove ${f.name}`} onClick={()=>update('attachments',compose.attachments.filter((_,j)=>i!==j))}>×</button></span>)}</div>}
        <div className="gm-format-bar" aria-label="Formatting tools">
          <button type="button" aria-label="Bold" title="Bold" onMouseDown={e=>e.preventDefault()} onClick={()=>rich('bold')}><b>B</b></button>
          <button type="button" aria-label="Italic" title="Italic" onMouseDown={e=>e.preventDefault()} onClick={()=>rich('italic')}><i>I</i></button>
          <button type="button" aria-label="Underline" title="Underline" onMouseDown={e=>e.preventDefault()} onClick={()=>rich('underline')}><u>U</u></button>
          <select aria-label="Text size" onChange={e=>{rich('fontSize',e.target.value);}} defaultValue="3"><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option></select>
          <button type="button" aria-label="Numbered list" onMouseDown={e=>e.preventDefault()} onClick={()=>rich('insertOrderedList')}>1.</button>
          <button type="button" aria-label="Bulleted list" onMouseDown={e=>e.preventDefault()} onClick={()=>rich('insertUnorderedList')}>•</button>
          <button type="button" title="Insert link" aria-label="Insert link" onMouseDown={e=>e.preventDefault()} onClick={insertLink}><MailIcon name="link"/></button>
          <button type="button" title="Insert emoji" aria-label="Insert emoji" onMouseDown={e=>e.preventDefault()} onClick={()=>rich('insertText','🙂')}><MailIcon name="emoji"/></button>
          <button type="button" title="Insert image" aria-label="Insert image" onClick={()=>imgRef.current?.click()}><MailIcon name="image"/></button>
          <input ref={imgRef} type="file" accept="image/*" hidden onChange={e=>{addImage(e.target.files?.[0]);e.target.value='';}}/>
        </div>
        <div className="gm-send-row"><button type="button" className="gm-send" onClick={send}>Send</button>
          <button type="button" title="Attach files" aria-label="Attach files" onClick={()=>attachRef.current?.click()}><MailIcon name="attachment"/></button><input type="file" ref={attachRef} hidden multiple onChange={e=>{attach(e.target.files);e.target.value='';}} />
          <label className="gm-track"><input type="checkbox" checked={compose.track} onChange={e=>update('track',e.target.checked)} /> Track opens</label>
          <button type="button" className="gm-discard" title="Discard draft" aria-label="Discard draft" onClick={onDiscard}><MailIcon name="trash"/></button>
        </div>
      </div>
    </div>}
  </section>;
}
