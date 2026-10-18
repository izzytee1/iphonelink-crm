import ActionButton from '../shared/ActionButton.jsx';
import { formatPhone, leadByNumber } from '../../hooks/usePhoneController.js';
import { listTime } from '../shared/format.js';
import MessageComposer from './MessageComposer.jsx';

export default function MessageConversation({ threadNumber, threadMessages, leads, phoneController, channel, pendingFiles, setPendingFiles, fileInputRef, composer, setComposer, sendFromComposer }) {
  return (
              <div className="flex min-h-0 flex-col">
                {threadNumber ? <>
                  <div id="commsNav" className="comm-thread-head">
                    <div className="min-w-0 flex-1"><strong>{leadByNumber(leads, threadNumber)?.name || formatPhone(threadNumber)}</strong><small>{formatPhone(threadNumber)}</small></div>
                    <ActionButton title={`Call ${formatPhone(threadNumber)}`} icon="phone" dataProps={{ 'data-call': threadNumber }} onClick={() => phoneController.callNumber(threadNumber)} />
                  </div>
                  <div id="commsBody" className="crm-scroll min-h-0 flex-1 overflow-y-auto bg-[#FAFBFD] p-3">
                    {threadMessages.length ? threadMessages.map((message) => (
                      <div key={message.id} className={`mb-2 flex ${message.dir === 'out' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`comm-message-bubble ${message.dir === 'out' ? 'out' : 'in'} ${channel === 'wa' ? 'wa' : ''}`}>
                          <div>{message.text}</div>
                          <div className="mt-1 text-right [font-size:calc(9px+var(--crm-font-offset))] opacity-65">{listTime(message.at)}{message.dir === 'out' ? ' ✓✓' : ''}</div>
                        </div>
                      </div>
                    )) : <div className="py-10 text-center text-xs text-slate-400">No messages yet.</div>}
                  </div>
                  <MessageComposer pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} fileInputRef={fileInputRef} composer={composer} setComposer={setComposer} sendFromComposer={sendFromComposer} />
                </> : <div className="grid h-full place-items-center text-xs text-slate-400">Select a conversation</div>}
              </div>
  );
}
