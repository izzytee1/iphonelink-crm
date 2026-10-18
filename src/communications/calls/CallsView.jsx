import ActionButton from '../shared/ActionButton.jsx';
import { formatPhone, leadByNumber } from '../../hooks/usePhoneController.js';
import { listTime, durationText } from '../shared/format.js';
import { calls } from '../../data/communications.js';
import ContactsView from '../contacts/ContactsView.jsx';

export default function CallsView({ callsMode, setCallsMode, selectedCallId, selectCall, selectedCall, selectedCallLead, selectedCallMobile, selectedCallEmail, leads, phoneController, openThread, composeEmail, contactTarget, onSelectLead }) {
  return (
            <div className="flex h-full min-h-0 flex-col">
              <div className="comm-calls-mode">
                <button type="button" onClick={() => setCallsMode('history')} className={callsMode === 'history' ? 'active' : ''}>History</button>
                <button type="button" onClick={() => setCallsMode('contacts')} className={callsMode === 'contacts' ? 'active' : ''}>Contacts</button>
              </div>
              {callsMode === 'history' ? (
                <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_190px]">
                  <div className="crm-scroll min-h-0 overflow-y-auto border-r border-slate-200">
                    {calls.map((call) => {
                      const lead = leadByNumber(leads, call.number);
                      return (
                        <button key={call.id} type="button" data-open-call={call.id} onClick={() => selectCall(call)} className={`comm-call-row ${selectedCallId === call.id ? 'selected' : ''}`}>
                          <span className={`w-4 text-center [font-size:calc(11px+var(--crm-font-offset))] ${call.dir === 'missed' ? 'text-red-500' : 'text-slate-400'}`}>{call.dir === 'out' ? '↗' : call.dir === 'in' ? '↙' : '!'}</span>
                          <span className="min-w-0 flex-1"><strong className={call.dir === 'missed' ? 'text-red-600' : ''}>{lead?.name || formatPhone(call.number)}</strong><small>{formatPhone(call.number)} · {durationText(call.duration)}</small></span>
                          <time>{listTime(call.at)}</time>
                        </button>
                      );
                    })}
                  </div>
                  <div className="min-w-0 p-3">
                    {selectedCall ? <>
                      <div className="[font-size:calc(10px+var(--crm-font-offset))] uppercase tracking-[.06em] text-slate-400">Call detail</div>
                      <div className="mt-2 [font-size:calc(12px+var(--crm-font-offset))] font-semibold text-slate-800">{selectedCallLead?.name || formatPhone(selectedCall.number)}</div>
                      <div className="mt-1 [font-size:calc(11px+var(--crm-font-offset))] text-slate-500">{selectedCallLead?.company || formatPhone(selectedCall.number)}</div>
                      <div className="mt-3 space-y-1 [font-size:calc(11px+var(--crm-font-offset))] text-slate-500"><div>{selectedCall.dir === 'missed' ? 'Missed' : selectedCall.dir === 'out' ? 'Outgoing' : 'Incoming'}</div><div>{durationText(selectedCall.duration)}</div><div>{new Date(selectedCall.at).toLocaleString()}</div></div>
                      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                        <ActionButton title="Call" icon="phone" dataProps={{ 'data-call': selectedCall.number }} onClick={() => phoneController.callNumber(selectedCall.number)} />
                        {selectedCallMobile ? <ActionButton title="SMS" icon="sms" onClick={() => openThread('text', selectedCallMobile)} /> : null}
                        {selectedCallMobile ? <ActionButton title="WhatsApp" icon="whatsapp" onClick={() => openThread('wa', selectedCallMobile)} /> : null}
                        {selectedCallEmail ? <ActionButton title="Email" icon="email" onClick={() => composeEmail(selectedCallEmail)} /> : null}
                      </div>
                    </> : <div className="[font-size:calc(11px+var(--crm-font-offset))] text-slate-400">Select a call to view details.</div>}
                  </div>
                </div>
              ) : (
                <ContactsView leads={leads} contactTarget={contactTarget} onSelectLead={onSelectLead} phoneController={phoneController} openThread={openThread} composeEmail={composeEmail} />
              )}
            </div>
  );
}
