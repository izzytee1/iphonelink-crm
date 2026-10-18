import {useEffect,useRef,useState} from 'react';
import PhoneToolbar from './PhoneToolbar.jsx';
import Notifications from '../notifications/Notifications.jsx';
import CrmIcon from '../../components/CrmIcons.jsx';

export default function TopbarActions({setWorkspace,unreadMail,onSettings,phoneController}){
 const [menuOpen,setMenuOpen]=useState(false);
 const menu=useRef(null);
 useEffect(()=>{const close=e=>{if(!menu.current?.contains(e.target))setMenuOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 return <div className="crm-topbar-tools">
   <PhoneToolbar phoneController={phoneController}/>
   <Notifications unreadMail={unreadMail} onOpenEmail={()=>setWorkspace('email')}/>
   <div className="crm-account" ref={menu}>
     <button type="button" className="crm-avatar-button" aria-expanded={menuOpen} aria-label="User menu" onClick={()=>setMenuOpen(s=>!s)}>
       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="8.3" r="3.3"/><path d="M5.4 20c.3-3.9 2.6-5.7 6.6-5.7s6.3 1.8 6.6 5.7"/></svg>
     </button>
     {menuOpen&&<div className="crm-user-menu" role="menu">
       <button type="button" role="menuitem" aria-label="Display settings" onClick={()=>{setMenuOpen(false);onSettings()}}><CrmIcon name="settings" size={17}/> Display settings</button>
     </div>}
   </div>
 </div>;
}
