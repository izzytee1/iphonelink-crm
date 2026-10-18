import { useState } from 'react';
import MailIcon from './MailIcon.jsx';
export default function EmailHeader({ query, setQuery, advanced, setAdvanced, compact=false }) {
  const [showSearch, setShowSearch] = useState(false);
  return <header className={`gm-header ${compact?'gm-header-compact':''}`}>
    <form className="gm-search-wrap" onSubmit={(e)=>e.preventDefault()} role="search">
      <MailIcon name="search" size={20}/><input aria-label="Search mail" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search mail" />
      {query?<button type="button" aria-label="Clear search" onClick={()=>setQuery('')}><MailIcon name="close"/></button>:null}
      <button type="button" aria-label="Advanced search" aria-expanded={showSearch} title="Search options" onClick={()=>setShowSearch(!showSearch)}><MailIcon name="filter" size={19}/></button>
    </form>
    {showSearch && <form className="gm-advanced" onSubmit={e=>{e.preventDefault();setShowSearch(false);}}>
      <label>From<input placeholder="Sender address" value={advanced.from} onChange={e=>setAdvanced(s=>({...s,from:e.target.value}))}/></label>
      <label>To<input placeholder="Recipient address" value={advanced.to} onChange={e=>setAdvanced(s=>({...s,to:e.target.value}))}/></label>
      <label>Subject<input placeholder="Words in subject" value={advanced.subject} onChange={e=>setAdvanced(s=>({...s,subject:e.target.value}))}/></label>
      <label>After<input type="date" value={advanced.after} onChange={e=>setAdvanced(s=>({...s,after:e.target.value}))}/></label>
      <label>Before<input type="date" value={advanced.before} onChange={e=>setAdvanced(s=>({...s,before:e.target.value}))}/></label>
      <label className="gm-checklabel"><input type="checkbox" checked={advanced.unread} onChange={e=>setAdvanced(s=>({...s,unread:e.target.checked}))}/> Unread only</label>
      <label className="gm-checklabel"><input type="checkbox" checked={advanced.attachments} onChange={e=>setAdvanced(s=>({...s,attachments:e.target.checked}))}/> Has attachment</label>
      <div className="gm-search-actions"><button type="button" onClick={()=>{setQuery('');setAdvanced({from:'',to:'',subject:'',after:'',before:'',unread:false,attachments:false});setShowSearch(false);}}>Clear</button><button type="submit">Search</button></div>
    </form>}
  </header>;
}
