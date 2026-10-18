import MailIcon from './MailIcon.jsx';
const folders = [['inbox','Inbox'], ['sent','Sent'], ['drafts','Drafts'], ['all','All Mail'], ['spam','Spam'], ['trash','Trash'], ['archive','Archive']];
export default function EmailSidebar({ folder, setFolder, setThreadId, startCompose, unreadCount, draftCount, compact=false }) {
  return <aside id="gmSide" className={`gm-sidebar ${compact ? 'gm-sidebar-compact' : ''}`} aria-label="Mail folders">
    {<div className="gm-logo" aria-label="Gmail style email"><svg viewBox="0 0 109 82" width="32" height="25" aria-hidden="true"><path fill="#4285F4" d="M6 82h17V30L0 13v62a7 7 0 0 0 6 7Z"/><path fill="#34A853" d="M86 82h17a7 7 0 0 0 6-7V13L86 30v52Z"/><path fill="#EA4335" d="m23 30 31.5 24L86 30V9l-31.5 24L23 9v21Z"/><path fill="#C5221F" d="M0 13 23 30V9L10 0A7 7 0 0 0 0 6Z"/><path fill="#FBBC04" d="M86 9v21l23-17V6a7 7 0 0 0-10-6Z"/></svg><span>Gmail</span></div>}
    <button type="button" className="gm-compose-trigger" onClick={() => startCompose()}><MailIcon name="compose" size={20}/> Compose</button>
    <nav className="gm-folder-nav">{folders.map(([key,label]) => <button key={key} type="button" aria-current={folder===key?'page':undefined} onClick={()=>{setFolder(key);setThreadId(null);}} className={`gm-folder ${folder===key?'active':''}`}><MailIcon name={key} size={19}/><span>{label}</span>{key==='inbox'&&unreadCount>0?<small>{unreadCount}</small>:key==='drafts'&&draftCount>0?<small>{draftCount}</small>:null}</button>)}</nav>
  </aside>;
}
