import { useEffect, useRef, useState } from 'react';
import CrmIcon from '../../components/CrmIcons.jsx';
import { formatPhone, platformLabel, validNumber } from '../../hooks/usePhoneController.js';

function Control({ icon, label, active = false, onClick, control }) {
  return (
    <button type="button" data-ctl={control} onClick={onClick} aria-pressed={active} title={label} className={`topbar-call-control ${active ? 'active' : ''}`}>
      <CrmIcon name={icon} size={14} />
      <span>{label}</span>
    </button>
  );
}

export default function TopbarDialer({ phones, controller }) {
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const deviceRef = useRef(null);
  const active = controller.activeCall.phase === 'active';
  const incoming = controller.activeCall.phase === 'incoming';
  const dialing = controller.activeCall.phase === 'dialing';
  const numberValue = controller.activeCall.phase === 'idle' ? controller.dialInput : formatPhone(controller.activeCall.number);
  const canCall = controller.activeCall.phase !== 'idle' || (controller.activePhone?.connected && validNumber(controller.dialInput));

  useEffect(() => {
    const close = (event) => {
      if (deviceRef.current && !deviceRef.current.contains(event.target)) setDeviceMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  return (
    <section id="crmDialer" data-state={controller.activeCall.phase} data-tone={incoming || dialing || controller.activeCall.held ? 'wait' : controller.activePhone?.connected ? 'live' : 'off'} className="topbar-dialer" aria-label="Dialer">
      <div className="topbar-dialer-status">
        <strong id="dialerName">{controller.dialerName}</strong>
        <span id="dialerStatus">{controller.dialerStatus}</span>
      </div>

      <div className="topbar-dial-input-area">
        <input
          id="crmDialInput"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          aria-label="Phone number"
          placeholder="Enter number"
          maxLength={20}
          readOnly={controller.activeCall.phase !== 'idle'}
          value={numberValue}
          onChange={(event) => controller.setDialInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); controller.requestCall(); } }}
        />
        {controller.activeCall.phase === 'idle' && controller.dialInput ? (
          <button id="dialerClearBtn" type="button" onClick={controller.clearDialInput} aria-label="Clear number" title="Clear number"><CrmIcon name="x" size={12} /></button>
        ) : null}
      </div>

      {active ? (
        <div id="dialerCtrlsWrap" className="topbar-call-controls">
          <div id="dialerCtrls" className="flex items-center gap-0.5">
            <Control icon="mute" label="Mute" control="mute" active={controller.activeCall.muted} onClick={() => controller.toggleControl('muted')} />
            <Control icon="hold" label="Hold" control="hold" active={controller.activeCall.held} onClick={() => controller.toggleControl('held')} />
            <Control icon="speaker" label="Speaker" control="speaker" active={controller.activeCall.speaker} onClick={() => controller.toggleControl('speaker')} />
            {controller.capabilities.transfer ? <Control icon="transfer" label="Transfer" control="transfer" onClick={controller.transfer} /> : null}
            {controller.capabilities.addCall ? <Control icon="add" label="Add" control="add" onClick={controller.addCall} /> : null}
          </div>
          <span id="dialerTimer" className="topbar-dialer-timer">{`${String(Math.floor(controller.seconds / 60)).padStart(2, '0')}:${String(controller.seconds % 60).padStart(2, '0')}`}</span>
        </div>
      ) : null}

      <div className="relative">
        <button id="dialerKeypadBtn" type="button" aria-expanded={keypadOpen} aria-controls="dialerKeypad" onClick={() => setKeypadOpen((open) => !open)} className="topbar-dial-icon" title="Keypad" aria-label="Keypad"><CrmIcon name="keypad" size={15} /></button>
        <div id="dialerKeypad" role="group" aria-label="Keypad" hidden={!keypadOpen} className="dialer-keypad-popover">
          {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
            <button key={key} type="button" data-key={key} onClick={() => controller.sendTone(key)}>{key}</button>
          ))}
        </div>
      </div>

      {incoming ? (
        <button id="dialerDeclineBtn" type="button" onClick={controller.decline} className="topbar-dial-action decline" title="Decline" aria-label="Decline call"><CrmIcon name="close" size={14} /></button>
      ) : null}
      <button id="dialerCallBtn" type="button" onClick={controller.requestCall} disabled={!canCall} className={`topbar-dial-action ${dialing || active ? 'end' : 'call'}`} title={incoming ? 'Answer' : dialing || active ? 'End call' : 'Call'} aria-label={incoming ? 'Answer' : dialing || active ? 'End call' : 'Call'}>
        <CrmIcon name={dialing || active ? 'close' : 'phone'} size={15} />
      </button>

      <div ref={deviceRef} className="topbar-device-wrap">
        <button id="dialerDeviceBtn" type="button" aria-label="Choose connected phone" aria-expanded={deviceMenuOpen} aria-controls="dialerDeviceMenu" onClick={() => setDeviceMenuOpen((open) => !open)} className="topbar-device-switcher">
          <span className={`topbar-device-status ${controller.activePhone?.connected ? 'connected' : 'disconnected'}`} />
          <span id="dialerDevicePlatform" className="topbar-device-platform">{controller.activePhone?.platform === 'ios' ? 'iOS' : controller.activePhone?.platform === 'android' ? 'AND' : 'TEL'}</span>
          <span id="dialerDeviceLast4" className="topbar-device-name" title={controller.activePhone?.name || 'Phone'}>{controller.activePhone?.name || 'Phone'}</span>
        </button>
        <div id="dialerDeviceMenu" role="menu" hidden={!deviceMenuOpen} className="topbar-device-menu">
          {phones.map((phone, index) => (
            <button key={phone.id} type="button" data-device-index={index} aria-current={index === controller.activePhoneIndex} disabled={controller.activeCall.phase !== 'idle'} onClick={() => { controller.setActivePhoneIndex(index); setDeviceMenuOpen(false); }}>
              <span className={`topbar-device-status ${phone.connected ? 'connected' : 'disconnected'}`} />
              <span className="min-w-0 flex-1"><strong>{phone.name}</strong><small>{platformLabel(phone)} · {phone.connected ? 'Connected' : 'Disconnected'}</small></span>
              <span className="shrink-0 [font-size:calc(10px+var(--crm-font-offset))] tabular-nums text-slate-400">{formatPhone(phone.number)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
