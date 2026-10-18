import { digitsOf, formatPhone, leadByNumber } from '../../hooks/usePhoneController.js';
import { listTime } from '../shared/format.js';
import SmsThread from './SmsThread.jsx';
import WhatsAppThread from '../whatsapp/WhatsAppThread.jsx';

export default function MessagesView({ channel, setChannel, threadNumber, setThreadNumber, threads, openThread, threadMessages, leads, phoneController, pendingFiles, setPendingFiles, fileInputRef, composer, setComposer, sendFromComposer }) {
  return (
            <div className="grid h-full min-h-0 grid-cols-[168px_minmax(0,1fr)]">
              <div className="crm-scroll min-h-0 overflow-y-auto border-r border-slate-200">
                <div id="commsSeg" className="comm-channel-tabs">
                  {[['text', 'SMS'], ['wa', 'WhatsApp']].map(([kind, label]) => (
                    <button key={kind} type="button" onClick={() => { setChannel(kind); setThreadNumber(''); }} className={channel === kind ? 'active' : ''}>{label}</button>
                  ))}
                </div>
                {threads.map((thread) => {
                  const lead = leadByNumber(leads, thread.number);
                  return (
                    <button key={`${thread.channel}-${thread.number}`} type="button" data-thread={thread.channel} data-number={thread.number} onClick={() => openThread(thread.channel, thread.number)} className={`comm-thread-row ${digitsOf(threadNumber) === digitsOf(thread.number) ? 'selected' : ''}`}>
                      <span className="flex items-center gap-2"><strong className="truncate">{lead?.name || formatPhone(thread.number)}</strong><time>{listTime(thread.last.at)}</time></span>
                      <span className="mt-1 flex items-center gap-1"><small className="truncate">{thread.last.text}</small>{thread.unread ? <b>{thread.unread}</b> : null}</span>
                    </button>
                  );
                })}
              </div>

              {channel === 'wa'
                ? <WhatsAppThread threadNumber={threadNumber} threadMessages={threadMessages} leads={leads} phoneController={phoneController} pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} fileInputRef={fileInputRef} composer={composer} setComposer={setComposer} sendFromComposer={sendFromComposer} />
                : <SmsThread threadNumber={threadNumber} threadMessages={threadMessages} leads={leads} phoneController={phoneController} pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} fileInputRef={fileInputRef} composer={composer} setComposer={setComposer} sendFromComposer={sendFromComposer} />}
            </div>
  );
}
