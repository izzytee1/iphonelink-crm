import Topbar from './shell/topbar/Topbar.jsx';
import Workspace from './pages/Workspace.jsx';
import { useEffect, useMemo, useState } from 'react';
import { iphoneLeadsSeed } from './data/iphoneLeadsSeed.js';
import Comms from './communications/Comms.jsx';
import { playClick } from './communications/sounds.js';
import { leadExtrasSeed, readSavedLeadNotes } from './pages/leads/LeadDetails.jsx';
import { crmPhones, initialMessages } from './data/communications.js';
import { initialMailbox } from './data/mail.js';
import DisplaySettings from './shell/settings/DisplaySettings.jsx';
import usePersistentState from './hooks/usePersistentState.js';
import usePhoneController from './hooks/usePhoneController.js';
import useViewportScale from './hooks/useViewportScale.js';
import { loadMailbox, saveMailbox } from './services/mailStore.js';
const defaultDisplaySettings = { scale: 1, density: 'comfortable', fontOffset: 0, accent: '#4669A8', theme: 'light' };

export default function App() {
  const [leads, setLeads] = usePersistentState('crm.iphonelink.leads.v02', iphoneLeadsSeed);
  const [selectedLeadId, setSelectedLeadId] = useState(1);
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  const [activeCall, setActiveCall] = useState({ phase: 'idle', number: '', name: '', startedAt: 0, muted: false, held: false, speaker: false });
  const [activePhoneIndex, setActivePhoneIndex] = usePersistentState('crm.iphonelink.phone.index', 0);
  const [messages, setMessages] = usePersistentState('crm.react.messages', initialMessages);
  const [mailbox, setMailbox] = useState(initialMailbox);
  const [mailHydrated, setMailHydrated] = useState(false);
  const [workspace, setWorkspace] = useState('leads');
  const [globalSearch, setGlobalSearch] = useState('');
  const [composeRequest, setComposeRequest] = useState(null);
  const [callRequest, setCallRequest] = useState(null);
  const [commRequest, setCommRequest] = useState(null);
  const [communicationsOpen, setCommunicationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = usePersistentState('crm.react.display', defaultDisplaySettings);
  const { autoScale, effectiveScale } = useViewportScale(settings.scale ?? 1);
  const [leadNotes, setLeadNotes] = useState(() => ({ ...Object.fromEntries(Object.entries(leadExtrasSeed).map(([id, value]) => [id, value.notes || ''])), ...readSavedLeadNotes() }));

  useEffect(()=>{document.documentElement.dataset.theme=settings.theme==='dark'?'dark':'light';},[settings.theme]);

  useEffect(() => {
    let live = true;
    loadMailbox().then((saved) => { if (live && Array.isArray(saved) && saved.length) setMailbox(saved); }).catch(() => {}).finally(() => { if (live) setMailHydrated(true); });
    return () => { live = false; };
  }, []);
  useEffect(() => { if (mailHydrated) saveMailbox(mailbox).catch(() => {}); }, [mailbox, mailHydrated]);
  useEffect(() => {
    setSettings((current) => {
      const next = { ...defaultDisplaySettings, ...(current || {}) };
      delete next.cellLayout;
      const same = Object.keys(next).length === Object.keys(current || {}).length
        && Object.entries(next).every(([key, value]) => current?.[key] === value);
      return same ? current : next;
    });
  }, [setSettings]);

  useEffect(() => {
    const soundOnPress = event => {
      const target = event.target.closest?.('button');
      if (target && target.dataset.dtmf !== 'true') playClick();
    };
    document.addEventListener('click', soundOnPress, true);
    return () => document.removeEventListener('click', soundOnPress, true);
  }, []);

  const unreadMail = useMemo(() => mailbox.filter((thread) => (thread.msgs || []).some((message) => message.unread)).length, [mailbox]);

  function selectLead(id) {
    const nextId = Number(id);
    if (!leads.some((lead) => lead.id === nextId)) return;
    setSelectedLeadId(nextId);
  }

  const phoneController = usePhoneController({
    leads,
    phones: crmPhones,
    activePhoneIndex,
    setActivePhoneIndex,
    activeCall,
    setActiveCall,
    onSelectLead: selectLead,
    callRequest,
    onConsumeCallRequest: () => setCallRequest(null),
  });

  function requestEmail(to = []) {
    const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
    setComposeRequest({ id: Date.now(), to: recipients });
    setWorkspace('email');
  }

  function saveLeadNotes(id, notes) {
    setLeadNotes((current) => {
      const next = { ...current, [id]: notes };
      try { localStorage.setItem('crm.visual.leadNotes', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function toggleLeadDetails(id) {
    const nextId = Number(id);
    setExpandedLeadId((current) => Number(current) === nextId ? null : nextId);
  }

  function openMessage(channel, number) {
    setCommunicationsOpen(true);
    setCommRequest({ id: Date.now(), type: channel, number });
  }

  function toggleCommunications() {
    if (workspace !== 'leads') {
      setWorkspace('leads');
      setCommunicationsOpen(true);
      return;
    }
    setCommunicationsOpen((open) => !open);
  }


  return (
    <div
      className={`crm-app crm-density-${settings.density || 'comfortable'}`}
      data-theme={settings.theme === 'dark' ? 'dark' : 'light'}
      style={{
        '--crm-scale': effectiveScale,
        '--crm-layout-width': `${100 / effectiveScale}vw`,
        '--crm-layout-height': `${100 / effectiveScale}vh`,
        '--crm-font-offset': `${Number(settings.fontOffset || 0)}px`,
        '--crm-accent': settings.accent || '#4669A8',
      }}
    >
      <Topbar
        workspace={workspace}
        setWorkspace={setWorkspace}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        unreadMail={unreadMail}
        onSettings={() => setSettingsOpen(true)}
        communicationsOpen={communicationsOpen}
        onToggleCommunications={toggleCommunications}
        phoneController={phoneController}
      />
      <main className="crm-main">
        <Workspace leads={leads} onAddLead={lead => setLeads(current => [...current, {...lead, id:Math.max(0,...current.map(l=>Number(l.id)||0))+1}])} workspace={workspace} mailbox={mailbox} setMailbox={setMailbox} composeRequest={composeRequest} setComposeRequest={setComposeRequest} selectLead={selectLead} communicationsOpen={communicationsOpen} selectedLeadId={selectedLeadId} expandedLeadId={expandedLeadId} toggleLeadDetails={toggleLeadDetails} globalSearch={globalSearch} leadNotes={leadNotes} saveLeadNotes={saveLeadNotes} setCallRequest={setCallRequest} openMessage={openMessage} requestEmail={requestEmail} phoneController={phoneController} messages={messages} setMessages={setMessages} commRequest={commRequest} setCommRequest={setCommRequest} setCommunicationsOpen={setCommunicationsOpen} setWorkspace={setWorkspace} />
      </main>
      <Comms theme={settings.theme === 'dark' ? 'dark' : 'light'} open={communicationsOpen} onToggle={setCommunicationsOpen} leads={leads} selectedLeadId={selectedLeadId} onSelectLead={selectLead} phones={crmPhones} phoneController={phoneController} messages={messages} setMessages={setMessages} onEmail={requestEmail} onOpenEmail={() => setWorkspace('email')} commRequest={commRequest} onConsumeCommRequest={() => setCommRequest(null)} mailbox={mailbox} setMailbox={setMailbox} />
      {settingsOpen ? <DisplaySettings settings={settings} setSettings={setSettings} autoScale={autoScale} effectiveScale={effectiveScale} onClose={() => setSettingsOpen(false)} /> : null}
    </div>
  );
}
