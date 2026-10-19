import {useEffect,useRef,useState} from 'react';
import PhoneToolbar from './PhoneToolbar.jsx';
import Notifications from '../notifications/Notifications.jsx';
import CrmIcon from '../../components/CrmIcons.jsx';
import {mailAccounts} from '../../data/mail.js';

export default function TopbarActions({setWorkspace,messages,setMessages,mailbox,setMailbox,onSettings,phoneController}){
 const [menuOpen,setMenuOpen]=useState(false);
 const user=mailAccounts[0]?.name||"";
 const initials=user.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]?.toUpperCase()).join("")||"U";
 const menu=useRef(null);
 useEffect(()=>{const close=e=>{if(!menu.current?.contains(e.target))setMenuOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 return <div className="crm-topbar-tools">
   <PhoneToolbar phoneController={phoneController}/>
   <Notifications messages={messages} setMessages={setMessages} mailbox={mailbox} setMailbox={setMailbox}/>
   <div className="crm-account" ref={menu}>
     <button type="button" className="crm-avatar-button" aria-expanded={menuOpen} aria-label="User menu" onClick={()=>setMenuOpen(s=>!s)}>
       <span className="crm-user-initials">{initials}</span>
     </button>
     {menuOpen&&<div className="crm-user-menu" role="menu">
       <button type="button" role="menuitem" aria-label="Display settings" onClick={()=>{setMenuOpen(false);onSettings()}}><CrmIcon name="settings" size={17}/> Display settings</button>
     </div>}
   </div>
 </div>;
}
