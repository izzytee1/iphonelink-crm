import {createPortal} from 'react-dom';
import {useState} from 'react';
import CrmIcon from '../../components/CrmIcons.jsx';
import useDraggablePosition from '../../hooks/useDraggablePosition.js';
const KEYS=[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];
const clock=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');

export default function FloatingCallPanel({phoneController,onClose}){
  const {position,dragHandlers,reset}=useDraggablePosition('crm.iphonelink.call.panel.position');
  const [keypad,setKeypad]=useState(false);
  const call=phoneController.activeCall;
  const active=call.phase!=='idle';
  const startOrEnd=()=>active?(call.phase==='incoming'?phoneController.decline():phoneController.requestCall()):phoneController.requestCall();
  const items=[
    ['Mute','mute',()=>phoneController.toggleControl('muted')],
    ['Keypad','keypad',()=>setKeypad(v=>!v)],
    ['Speaker','speaker',()=>phoneController.toggleControl('speaker')],
    ['Hold','hold',()=>phoneController.toggleControl('held')],
    ['Add Call','add',()=>phoneController.addCall()],
    ['Transfer','transfer',()=>phoneController.transfer()],
  ];
  return createPortal(<section className="crm-floating-call" data-drag-surface aria-label="Floating call controls"
    style={position?{left:position.x,top:position.y}:undefined}>
    <div className="crm-floating-call-head">
      <button type="button" className="crm-call-grab" {...dragHandlers} aria-label="Drag call panel" title="Drag to move call panel"><span/></button>
      <button type="button" className="crm-call-dock-panel" onClick={reset} aria-label="Reset call panel position" title="Reset position"><CrmIcon name="resize" size={16}/></button>
      <button type="button" className="crm-call-close" onClick={onClose} aria-label="Close call panel"><CrmIcon name="x" size={18}/></button>
    </div>
    <div className="crm-floating-call-title">{call.name||phoneController.dialerName}</div>
    <div className="crm-floating-call-number">{call.number||phoneController.dialInput||'Enter a number'}</div>
    <div className="crm-floating-call-timer">{active?(call.phase==='active'?clock(phoneController.seconds):phoneController.dialerStatus):'Ready to dial'}</div>
    {keypad?<div className="crm-float-keypad">{KEYS.map(([key,letters])=><button key={key} type="button" data-dtmf="true" onClick={()=>phoneController.sendTone(key)}>{key}<small>{letters}</small></button>)}</div>:
      <div className="crm-floating-call-actions">{items.map(([name,icon,action])=><button type="button" key={name} onClick={action}><span><CrmIcon name={icon} size={21}/></span><small>{name}</small></button>)}</div>}
    <button className={'crm-floating-call-primary '+(active?'is-end':'is-start')} type="button" onClick={startOrEnd}
      aria-label={active?'End or decline call':'Start call'}><CrmIcon name={active?'endcall':'phone'} size={24}/></button>
  </section>,document.body);
}
