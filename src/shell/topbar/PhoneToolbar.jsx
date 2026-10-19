import {useEffect,useRef,useState} from 'react';
import CrmIcon from '../../components/CrmIcons.jsx';
import {crmPhones} from '../../data/communications.js';
import {isPhoneConnected} from '../../services/phoneService.js';
import {formatPhone} from '../../hooks/usePhoneController.js';
import useDraggablePosition from '../../hooks/useDraggablePosition.js';
import FloatingCallPanel from './FloatingCallPanel.jsx';

const KEYS=[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];
const timer=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');

export default function PhoneToolbar({phoneController}){
  const [switchOpen,setSwitchOpen]=useState(false);
  const [keysOpen,setKeysOpen]=useState(false);
  const [panelOpen,setPanelOpen]=useState(false);
  const {position,dragHandlers,reset}=useDraggablePosition('crm.iphonelink.topbar.call.position');
  const wrap=useRef(null);
  const active=phoneController.activeCall.phase!=='idle';
  const call=phoneController.activeCall;
  const number=active?formatPhone(call.number):phoneController.dialInput;
  const providerReady=phone=>isPhoneConnected(phone);
  useEffect(()=>{
    const close=e=>{if(!wrap.current?.contains(e.target)){setSwitchOpen(false);setKeysOpen(false)}};
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[]);
  const callClick=()=>phoneController.requestCall();
  const endClick=()=>call.phase==='incoming'?phoneController.decline():phoneController.requestCall();
  return <div className="crm-phone-toolbar" ref={wrap} aria-label="Phone toolbar">
    <div className="crm-call-dock-slot">
      <div className={'crm-call-surface '+(position?'is-floating':'')} data-drag-surface
        style={position?{left:position.x,top:position.y}:undefined}>
        <button type="button" className="crm-call-grip" {...dragHandlers} aria-label="Drag phone bar" title="Drag phone bar anywhere; double-click to dock" onDoubleClick={reset}>
          <span aria-hidden="true"/>
        </button>
        <button type="button" className="crm-call-keypad-trigger" aria-label="Open keypad" title="Keypad" aria-expanded={keysOpen} onClick={()=>{setKeysOpen(s=>!s);setSwitchOpen(false)}}>
          <CrmIcon name="keypad" size={20}/>
        </button>
        {active?
          <button type="button" className="crm-call-active-summary" onClick={()=>setPanelOpen(s=>!s)} aria-label="Open call controls">
            <span className="crm-call-digits">{call.name||number||'Call'}</span>
            {call.phase==='active'&&<span className="crm-call-wave" aria-label="Connected"><i/><i/><i/><i/></span>}
            <span className="crm-call-clock">{call.phase==='active'?timer(phoneController.seconds):call.phase==='dialing'?'Calling':call.phase==='incoming'?'Incoming':'On call'}</span>
          </button>:
          <label className="crm-call-input-wrap"><input aria-label="Topbar phone number" type="tel" inputMode="tel"
            value={number||''} placeholder="(222) 555-5555" onChange={e=>phoneController.setDialInput(e.target.value)}
            autoComplete="off" maxLength={20}/></label>
        }
        <button type="button" className={'crm-call-main-action '+(active?'is-end':'is-start')}
          onClick={active?endClick:callClick} aria-label={active?'End or decline call':'Start call'} title={active?'End call':'Call'}>
          <CrmIcon name={active?'endcall':'phone'} size={18}/>
        </button>
        {position&&<button type="button" className="crm-call-redock" onClick={reset} aria-label="Return phone bar to topbar" title="Dock in topbar"><CrmIcon name="resize" size={13}/></button>}
        {keysOpen&&<div className="crm-topbar-keypad" aria-label="Topbar keypad">
          {KEYS.map(([key,letters])=><button key={key} type="button" data-dtmf="true" onClick={()=>phoneController.sendTone(key)}>{key}<small>{letters}</small></button>)}
          <div className="crm-keypad-in-call">
            <button type="button" onClick={()=>phoneController.toggleControl('muted')} title="Mute" aria-label="Mute"><CrmIcon name="mute" size={18}/></button>
            <button type="button" onClick={()=>phoneController.toggleControl('held')} title="Hold" aria-label="Hold"><CrmIcon name="hold" size={18}/></button>
            <button type="button" onClick={()=>phoneController.toggleControl('speaker')} title="Speaker" aria-label="Speaker"><CrmIcon name="speaker" size={18}/></button>
          </div>
        </div>}
      </div>
    </div>
    <div className="crm-phone-select">
      <button className="crm-phone-choice" type="button" aria-label="Select phone" aria-expanded={switchOpen} onClick={()=>{setSwitchOpen(s=>!s);setKeysOpen(false)}}>
        <span className={'crm-phone-dot '+(providerReady(phoneController.activePhone)?'crm-phone-online':'')}/>
        <span className="crm-phone-name">{phoneController.activePhone?.name||'Phone'}</span>
      </button>
      {switchOpen&&<div className="crm-phone-options" role="group" aria-label="Available phones">{crmPhones.map((phone,i)=><button key={phone.id} type="button" onClick={()=>{phoneController.setActivePhoneIndex(i);setSwitchOpen(false)}}>
        <span className={'crm-phone-dot '+(providerReady(phone)?'crm-phone-online':'')}/><span>{phone.name}</span><small>{providerReady(phone)?'Provider available':'Not connected'}</small>{i===phoneController.activePhoneIndex&&<span className="crm-selected-mark">✓</span>}
      </button>)}</div>}
    </div>
    {panelOpen&&<FloatingCallPanel phoneController={phoneController} onClose={()=>setPanelOpen(false)}/>}
  </div>;
}
