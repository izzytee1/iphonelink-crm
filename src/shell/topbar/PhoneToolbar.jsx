import {useEffect,useRef,useState} from 'react';
import CrmIcon from '../../components/CrmIcons.jsx';
import {crmPhones} from '../../data/communications.js';
import {getPhoneProvider} from '../../services/phoneService.js';
import {formatPhone} from '../../hooks/usePhoneController.js';

const KEYS=['1','2','3','4','5','6','7','8','9','*','0','#'];
export default function PhoneToolbar({phoneController}){
 const [switchOpen,setSwitchOpen]=useState(false);
 const [keysOpen,setKeysOpen]=useState(false);
 const wrap=useRef(null);
 const active=phoneController.activeCall.phase!=='idle';
 const number=active?formatPhone(phoneController.activeCall.number):phoneController.dialInput;
 const providerReady=Boolean(getPhoneProvider());
 useEffect(()=>{
   const close=e=>{if(!wrap.current?.contains(e.target)){setSwitchOpen(false);setKeysOpen(false)}};
   document.addEventListener('pointerdown',close);
   return()=>document.removeEventListener('pointerdown',close);
 },[]);
 const start=()=>{if(phoneController.activeCall.phase==='incoming')phoneController.requestCall();else if(phoneController.activeCall.phase==='idle')phoneController.requestCall()};
 const end=()=>{if(phoneController.activeCall.phase==='incoming')phoneController.decline();else if(active)phoneController.requestCall()};
 return <div className="crm-phone-toolbar" ref={wrap} aria-label="Phone toolbar">
   <div className="crm-phone-select">
     <button className="crm-phone-choice" type="button" aria-label="Select phone" aria-expanded={switchOpen} onClick={()=>{setSwitchOpen(s=>!s);setKeysOpen(false)}}>
       <span className={'crm-phone-dot '+(providerReady&&phoneController.activePhone?.connected?'crm-phone-online':'')}/>
       <span>{phoneController.activePhone?.name||'Phone'}</span><span className="crm-choice-arrow">⌄</span>
     </button>
     {switchOpen&&<div className="crm-phone-options" role="group" aria-label="Available phones">{crmPhones.map((phone,i)=><button key={phone.id} type="button" onClick={()=>{phoneController.setActivePhoneIndex(i);setSwitchOpen(false)}}>
       <span className={'crm-phone-dot '+(providerReady&&phone.connected?'crm-phone-online':'')}/><span>{phone.name}</span><small>{providerReady&&phone.connected?'Provider available':'Not connected'}</small>{i===phoneController.activePhoneIndex&&<span className="crm-selected-mark">✓</span>}
     </button>)}</div>}
   </div>
   <label className="crm-dial-display"><CrmIcon name="phone" size={15}/><input aria-label="Topbar phone number" type="tel" inputMode="tel" value={number||''} placeholder="(222) 555-5555" readOnly={active} onChange={e=>phoneController.setDialInput(e.target.value)} maxLength={18}/></label>
   <div className="crm-phone-buttons">
     <button type="button" aria-label="Open keypad" title="Keypad" aria-expanded={keysOpen} onClick={()=>{setKeysOpen(s=>!s);setSwitchOpen(false)}}><CrmIcon name="keypad" size={18}/></button>
     <button type="button" aria-label="Mute call" title="Mute" onClick={()=>phoneController.toggleControl('muted')}><CrmIcon name="mute" size={17}/></button>
     <button type="button" aria-label="Hold call" title="Hold" onClick={()=>phoneController.toggleControl('held')}><CrmIcon name="hold" size={17}/></button>
     <button type="button" aria-label="Speakerphone" title="Speaker" onClick={()=>phoneController.toggleControl('speaker')}><CrmIcon name="speaker" size={18}/></button>
     <button type="button" className="crm-call-green" aria-label="Start call" title="Call" onClick={start}><CrmIcon name="phone" size={18}/></button>
     <button type="button" className="crm-call-red" aria-label="End call" title="End" onClick={end}><CrmIcon name="endcall" size={20}/></button>
   </div>
   {keysOpen&&<div className="crm-topbar-keypad" aria-label="Topbar keypad">{KEYS.map(key=><button key={key} type="button" data-dtmf="true" onClick={()=>phoneController.sendTone(key)}>{key}</button>)}<button type="button" className="crm-keypad-dismiss" onClick={()=>setKeysOpen(false)}>Close</button></div>}
 </div>;
}
