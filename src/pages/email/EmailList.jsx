import { lastMessage, unreadThread, listDate } from './shared.js';
import MailIcon from './MailIcon.jsx';
export default function EmailList({ visibleThreads, openConversation, selectedIds, toggleSelected, compact=false }) {
  return <div id="gmList" className="gm-list" role="list" aria-label="Mail conversations">
    {visibleThreads.length?visibleThreads.map(thread=>{const msg=lastMessage(thread); const unread=unreadThread(thread); return <div role="listitem" className={`gm-mailrow ${unread?'unread':''}`} key={thread.id}>
      <label className="gm-selectbox" aria-label={`Select ${msg.subject||'message'}`}><input type="checkbox" checked={selectedIds.includes(thread.id)} onChange={()=>toggleSelected(thread.id)}/></label>
      <button type="button" onClick={()=>openConversation(thread.id)} className="gm-mailrow-open"><span className="gm-row-peer">{msg.out?'Me':msg.peer}</span><span className="gm-row-detail"><strong>{msg.subject||'(no subject)'}</strong><span> — {String(msg.body||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ')}</span></span><span className="gm-row-date">{listDate(msg.at)}</span></button>
      {(msg.attachments?.length>0)&&<span className="gm-clip" title="Attachment"><MailIcon name="attachment" size={15}/></span>}
    </div>;}):<div className="gm-empty">No mail in this view.</div>}
  </div>;
}
