import CrmIcon from '../../components/CrmIcons.jsx';
import { leadByNumber, formatPhone } from '../../hooks/usePhoneController.js';
import { listTime, durationText } from '../shared/format.js';
export default function HubView({ hubItems, leads, openThread, selectCall }) {
  return (
            <div className="crm-scroll h-full overflow-y-auto">
              <div className="comm-section-kicker">Recent activity</div>
              {hubItems.map((item) => {
                if (item.type === 'message') {
                  const message = item.data;
                  const lead = leadByNumber(leads, message.number);
                  return (
                    <button key={`hub-${message.id}`} type="button" onClick={() => openThread(message.channel, message.number)} className="comm-hub-row">
                      <span className="comm-hub-icon"><CrmIcon name={message.channel === 'wa' ? 'whatsapp' : 'sms'} size={14} /></span>
                      <span className="min-w-0 flex-1"><strong>{lead?.name || formatPhone(message.number)}</strong><small>{message.text || 'Attachment'}</small></span>
                      <span className="[font-size:calc(10px+var(--crm-font-offset))] text-slate-400">{listTime(message.at)}</span>
                    </button>
                  );
                }
                const call = item.data;
                const lead = leadByNumber(leads, call.number);
                return (
                  <button key={`hub-${call.id}`} type="button" onClick={() => selectCall(call)} className="comm-hub-row">
                    <span className="comm-hub-icon"><CrmIcon name="phone" size={14} /></span>
                    <span className="min-w-0 flex-1"><strong>{lead?.name || formatPhone(call.number)}</strong><small>{call.dir === 'missed' ? 'Missed call' : `${call.dir === 'out' ? 'Outgoing' : 'Incoming'} · ${durationText(call.duration)}`}</small></span>
                    <span className="[font-size:calc(10px+var(--crm-font-offset))] text-slate-400">{listTime(call.at)}</span>
                  </button>
                );
              })}
            </div>
  );
}
