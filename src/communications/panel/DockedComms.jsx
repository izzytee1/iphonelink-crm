import { useRef, useState } from 'react';
import CommunicationPanel from './CommunicationPanel.jsx';
import './docked.css';
export default function DockedComms({open,onToggle,leads,selectedLeadId,onSelectLead,phones,phoneController,messages,setMessages,onEmail,onOpenEmail,commRequest,onConsumeCommRequest,mailbox,setMailbox}) {
  const [left,setLeft]=useState(()=>{try{return Math.max(0,Number(localStorage.getItem('il.comm.dock.x'))||18);}catch{return 18;}});
  const drag=useRef(null);
  const ignoreClick=useRef(false);
  function down(e){if(e.button!==undefined&&e.button!==0)return;drag.current={start:e.clientX,origin:left,moved:false};e.currentTarget.setPointerCapture?.(e.pointerId);}
  function move(e){if(!drag.current)return;const d=drag.current;const diff=e.clientX-d.start;if(Math.abs(diff)>5)d.moved=true;if(d.moved)setLeft(Math.max(5,Math.min(window.innerWidth-150,d.origin+diff)));}
  function up(){if(!drag.current)return;ignoreClick.current=drag.current.moved;if(drag.current.moved){try{localStorage.setItem('il.comm.dock.x',String(Math.round(Math.max(5,Math.min(window.innerWidth-150,left)))));}catch{}}drag.current=null;}
  const visualX=`min(max(5px, ${left}px), calc(100vw - 155px))`;
  return <div className="il-dock-root">
    <div className={`il-comm-popup ${open?'show':''}`} style={{left:`clamp(8px, ${left}px, calc(100vw - min(520px, 100vw - 16px) - 8px))`}} aria-hidden={!open}>
      <CommunicationPanel leads={leads} selectedLeadId={selectedLeadId} onSelectLead={onSelectLead} phones={phones} phoneController={phoneController} messages={messages} setMessages={setMessages} onEmail={onEmail} onOpenEmail={onOpenEmail} commRequest={commRequest} onConsumeCommRequest={onConsumeCommRequest} onClose={()=>onToggle(false)} mailbox={mailbox} setMailbox={setMailbox}/>
    </div>
    <button type="button" className={`il-comm-dock ${open?'active':''}`} style={{left:visualX}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={()=>{if(ignoreClick.current){ignoreClick.current=false;return;}onToggle(!open);}} aria-label="Communications" aria-expanded={open}><span className="il-two-chat" aria-hidden="true">▢▢</span><span>Comms</span><span aria-hidden="true">{open?'⌄':'⌃'}</span></button>
  </div>;
}
