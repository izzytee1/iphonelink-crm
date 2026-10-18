import { useEffect, useMemo, useRef, useState } from 'react';
import HubView from '../hub/HubView.jsx';
import MessagesView from '../messages/MessagesView.jsx';
import CallsView from '../calls/CallsView.jsx';
import EmailView from '../email/EmailView.jsx';
import { mobileOfLead } from '../shared/format.js';
import CrmIcon from '../../components/CrmIcons.jsx';
import { leadEmails, leadPhones } from '../../utils/leadUtils.js';
import { digitsOf, leadByNumber } from '../../hooks/usePhoneController.js';
import { calls, crmPhones, imessageNumbers, initialMessages } from '../../data/communications.js';

export { crmPhones, initialMessages };

export default function CommunicationPanel({
  leads,
  selectedLeadId,
  onSelectLead,
  phones,
  phoneController,
  messages,
  setMessages,
  onEmail,
  onOpenEmail,
  commRequest,
  onConsumeCommRequest,
  onClose,
  mailbox,
  setMailbox,
}) {
  const [tab, setTab] = useState('hub');
  const [channel, setChannel] = useState('text');
  const [threadNumber, setThreadNumber] = useState('');
  const [composer, setComposer] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState('');
  const [callsMode, setCallsMode] = useState('history');
  const fileInputRef = useRef(null);

  const selectedLead = leads.find((lead) => lead.id === Number(selectedLeadId)) || leads[0] || null;
  const activePhoneIndex = phoneController.activePhoneIndex;

  const threads = useMemo(() => {
    const map = new Map();
    messages.filter((message) => message.channel === channel).forEach((message) => {
      const key = `${message.channel}:${message.number}`;
      const previous = map.get(key);
      if (!previous || message.at > previous.last.at) map.set(key, { channel: message.channel, number: message.number, last: message, unread: 0 });
      if (message.dir === 'in' && message.unread) map.get(key).unread += 1;
    });
    return [...map.values()].sort((a, b) => b.last.at - a.last.at);
  }, [messages, channel]);

  const threadMessages = useMemo(() => messages
    .filter((message) => message.channel === channel && digitsOf(message.number) === digitsOf(threadNumber))
    .sort((a, b) => a.at - b.at), [messages, channel, threadNumber]);

  const hubItems = useMemo(() => {
    const messageItems = messages.map((message) => ({ type: 'message', at: message.at, data: message }));
    const callItems = calls.map((call) => ({ type: 'call', at: call.at, data: call }));
    return [...messageItems, ...callItems].sort((a, b) => b.at - a.at).slice(0, 12);
  }, [messages]);

  const selectedCall = calls.find((call) => call.id === selectedCallId) || null;

  function composeEmail(addresses) {
    const list = Array.isArray(addresses) ? addresses : [addresses];
    onEmail?.(list.filter(Boolean));
  }

  function openThread(nextChannel, number) {
    setTab('messages');
    setChannel(nextChannel);
    setThreadNumber(digitsOf(number));
    const lead = leadByNumber(leads, number);
    if (lead) onSelectLead(lead.id);
    setMessages((current) => current.map((message) => message.channel === nextChannel && digitsOf(message.number) === digitsOf(number) ? { ...message, unread: false, read: true } : message));
  }

  function selectCall(call) {
    setTab('calls');
    setCallsMode('history');
    setSelectedCallId(call.id);
    const lead = leadByNumber(leads, call.number);
    if (lead) onSelectLead(lead.id);
  }

  function contactTarget(kind, contact) {
    if (!contact) return '';
    const contactPhones = leadPhones(contact);
    if (kind === 'email') return leadEmails(contact)[0] || '';
    if (kind === 'call') return contactPhones[0] || '';
    if (kind === 'sms' || kind === 'wa') return mobileOfLead(contact);
    return '';
  }

  function sendMessage(nextChannel, number, text, files = []) {
    const phone = phones[activePhoneIndex] || phones[0] || null;
    if (!phone?.connected) return null;
    const at = Date.now();
    const lead = leadByNumber(leads, number);
    const message = {
      id: `m${at}${messages.length}`,
      channel: nextChannel,
      number: digitsOf(number),
      leadId: lead?.id || null,
      dir: 'out',
      text,
      at,
      phone: phone.name,
      service: nextChannel === 'text' ? (imessageNumbers.includes(digitsOf(number)) ? 'iMessage' : 'SMS') : 'wa',
      read: true,
      status: 'sent',
      readAt: 0,
      unread: false,
      files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
    };
    setMessages((current) => [...current, message]);
    try { window.dispatchEvent(new CustomEvent('crm:message-sent', { detail: { message, lead } })); } catch {}
    return message;
  }

  function sendFromComposer() {
    const text = composer.trim();
    if (!threadNumber || (!text && pendingFiles.length === 0)) return;
    sendMessage(channel, threadNumber, text, pendingFiles);
    setComposer('');
    setPendingFiles([]);
  }

  useEffect(() => {
    if (!commRequest) return;
    if (commRequest.type === 'sms' && commRequest.number) openThread('text', commRequest.number);
    else if (commRequest.type === 'wa' && commRequest.number) openThread('wa', commRequest.number);
    else if (commRequest.type === 'calls') setTab('calls');
    else if (commRequest.type === 'email') setTab('email');
    onConsumeCommRequest?.();
  }, [commRequest]);

  const selectedCallLead = selectedCall ? leadByNumber(leads, selectedCall.number) : null;
  const selectedCallMobile = selectedCallLead ? mobileOfLead(selectedCallLead) : '';
  const selectedCallEmail = selectedCallLead ? leadEmails(selectedCallLead)[0] || '' : '';

  return (
    <aside className="comm-panel-shell" id="commPanel" aria-label="Communications">
      <div id="commMount" className="flex h-full min-h-0 flex-col">
        <header className="comm-panel-head">
          <div className="min-w-0">
            <div className="[font-size:calc(12px+var(--crm-font-offset))] font-semibold text-slate-800">Communications</div>
            <div className="mt-0.5 truncate [font-size:calc(10px+var(--crm-font-offset))] text-slate-400">{selectedLead?.name || 'No lead selected'}</div>
          </div>
          <button type="button" onClick={onClose} className="comm-close" aria-label="Close communications" title="Close communications"><CrmIcon name="close" size={15} /></button>
        </header>

        <nav id="commsTabs" className="comm-main-tabs" aria-label="Communications sections">
          {[
            ['hub', 'Hub'],
            ['messages', 'Messages'],
            ['calls', 'Calls'],
            ['email', 'Email'],
          ].map(([key, label]) => (
            <button key={key} type="button" data-tab={key} onClick={() => setTab(key)} className={tab === key ? 'active' : ''}>{label}</button>
          ))}
        </nav>

        <div id="comms" className="min-h-0 flex-1 overflow-hidden">
          {tab === 'hub' ? <HubView hubItems={hubItems} leads={leads} openThread={openThread} selectCall={selectCall} /> : null}
          {tab === 'messages' ? <MessagesView channel={channel} setChannel={setChannel} threadNumber={threadNumber} setThreadNumber={setThreadNumber} threads={threads} openThread={openThread} threadMessages={threadMessages} leads={leads} phoneController={phoneController} pendingFiles={pendingFiles} setPendingFiles={setPendingFiles} fileInputRef={fileInputRef} composer={composer} setComposer={setComposer} sendFromComposer={sendFromComposer} /> : null}
          {tab === 'calls' ? <CallsView callsMode={callsMode} setCallsMode={setCallsMode} selectedCallId={selectedCallId} selectCall={selectCall} selectedCall={selectedCall} selectedCallLead={selectedCallLead} selectedCallMobile={selectedCallMobile} selectedCallEmail={selectedCallEmail} leads={leads} phoneController={phoneController} openThread={openThread} composeEmail={composeEmail} contactTarget={contactTarget} onSelectLead={onSelectLead} /> : null}
          {tab === 'email' ? <EmailView selectedLead={selectedLead} composeEmail={composeEmail} onOpenEmail={onOpenEmail} leads={leads} mailbox={mailbox} setMailbox={setMailbox} onSelectLead={onSelectLead} /> : null}
        </div>
      </div>
    </aside>
  );
}
