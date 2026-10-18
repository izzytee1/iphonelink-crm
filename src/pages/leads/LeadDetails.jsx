import CrmIcon from '../../components/CrmIcons.jsx';
import { addressText, formatMoneyText, leadEmails, leadPhones } from '../../utils/leadUtils.js';
import { leadExtrasSeed } from '../../data/leadExtras.js';

export { leadExtrasSeed };

export function readSavedLeadNotes() {
  try {
    return JSON.parse(localStorage.getItem('crm.visual.leadNotes') || '{}');
  } catch {
    return {};
  }
}

export function stageLabel(stage) {
  return String(stage || '').split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : '').join(' ');
}

export function leadPhoneGroups(lead) {
  const phones = leadPhones(lead);
  return {
    landlines: phones.length ? [phones[0]] : [],
    mobiles: phones.slice(1),
  };
}

function DetailSection({ title, titleAction, children, className = '' }) {
  return (
    <section className={`min-w-0 ${className}`}>
      <div className="mb-3 flex min-h-6 items-center gap-2 border-b border-slate-200/80 pb-2">
        <h3 className="[font-size:calc(10px+var(--crm-font-offset))] font-semibold uppercase tracking-[0.075em] text-slate-500">{title}</h3>
        {titleAction ? <div className="ml-auto">{titleAction}</div> : null}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function DetailValue({ label, children, mono = false }) {
  return (
    <div className="min-w-0">
      <div className="mb-0.5 [font-size:calc(10px+var(--crm-font-offset))] leading-4 text-slate-400">{label}</div>
      <div className={`min-w-0 break-words [font-size:calc(12px+var(--crm-font-offset))] font-normal leading-[1.4] text-slate-700 ${mono ? 'tabular-nums' : ''}`}>{children || '—'}</div>
    </div>
  );
}

function ActionIconButton({ title, icon, onClick, disabled = false }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(event) => { event.stopPropagation(); onClick(); }}
      className="grid h-5 w-5 shrink-0 place-items-center text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-default disabled:opacity-35"
    >
      <CrmIcon name={icon} size={13} strokeWidth={1.7} />
    </button>
  );
}

function ContactValue({ value, actions }) {
  return (
    <div className="flex min-w-0 items-center">
      <span className="min-w-0 truncate [font-size:calc(12px+var(--crm-font-offset))] leading-[1.4] text-slate-700">{value}</span>
      <span className="ml-[0.5em] flex shrink-0 items-center gap-[0.25em]">
        {actions}
      </span>
    </div>
  );
}

function EmptyValue() {
  return <span className="[font-size:calc(12px+var(--crm-font-offset))] text-slate-400">—</span>;
}

export default function LeadDetails({
  lead,
  notes,
  onNotesChange,
  onCall,
  onSMS,
  onWhatsApp,
  onEmail,
  onEmailAll,
}) {
  if (!lead) return null;

  const approval = Number(lead.approval ?? (Number(lead.value || 0) + 150000));
  const extras = leadExtrasSeed[lead.id] || {};
  const activity = Array.isArray(extras.activity) ? extras.activity : [];
  const history = Array.isArray(extras.history) ? extras.history : [];
  const emails = leadEmails(lead);
  const { mobiles, landlines } = leadPhoneGroups(lead);

  return (
    <div id="comm-leads" className="lead-inline-details" aria-label={`${lead.company} details`}>
      <div className="lead-detail-primary-grid">
        <DetailSection title="Company">
          <DetailValue label="Contact">{lead.name}</DetailValue>
          <DetailValue label="Title">{lead.title || '—'}</DetailValue>
          <DetailValue label="Stage">{stageLabel(lead.stage) || '—'}</DetailValue>
          <DetailValue label="Owner">{lead.owner || '—'}</DetailValue>
          <DetailValue label="Next action">{lead.action || '—'}</DetailValue>
          <DetailValue label="Close date">{lead.date || '—'}</DetailValue>
          <DetailValue label="Birth date">{lead.birthDate || '—'}</DetailValue>
          <DetailValue label="Address">{addressText(lead.address) || '—'}</DetailValue>
        </DetailSection>

        <DetailSection title="Financials">
          <DetailValue label="Revenue" mono>{formatMoneyText(lead.value)}</DetailValue>
          <DetailValue label="Approval" mono>{formatMoneyText(approval)}</DetailValue>
        </DetailSection>

        <DetailSection title="Statements">
          {(lead.statements || []).length ? (lead.statements || []).map((statement) => (
            <div key={`${lead.id}-${statement.month}`} className="grid grid-cols-[34px_minmax(0,1fr)] gap-x-2 gap-y-0.5 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
              <span className="row-span-2 [font-size:calc(11px+var(--crm-font-offset))] font-medium text-slate-500">{statement.month}</span>
              <span className="[font-size:calc(10px+var(--crm-font-offset))] text-slate-400">Deposits <span className="ml-1 tabular-nums [font-size:calc(12px+var(--crm-font-offset))] text-slate-700">{formatMoneyText(statement.deposits)}</span></span>
              <span className="[font-size:calc(10px+var(--crm-font-offset))] text-slate-400">Balance <span className="ml-1 tabular-nums [font-size:calc(12px+var(--crm-font-offset))] text-slate-700">{formatMoneyText(statement.balance)}</span></span>
            </div>
          )) : <EmptyValue />}
        </DetailSection>

        <DetailSection title="Mobile">
          {mobiles.length ? mobiles.map((phone) => (
            <ContactValue
              key={phone}
              value={phone}
              actions={[
                <ActionIconButton key="call" title={`Call ${phone}`} icon="phone" onClick={() => onCall?.(phone)} />,
                <ActionIconButton key="sms" title={`SMS ${phone}`} icon="sms" onClick={() => onSMS?.(phone)} />,
                <ActionIconButton key="wa" title={`WhatsApp ${phone}`} icon="whatsapp" onClick={() => onWhatsApp?.(phone)} />,
              ]}
            />
          )) : <EmptyValue />}
        </DetailSection>

        <DetailSection title="Landline">
          {landlines.length ? landlines.map((phone) => (
            <ContactValue
              key={phone}
              value={phone}
              actions={<ActionIconButton title={`Call ${phone}`} icon="phone" onClick={() => onCall?.(phone)} />}
            />
          )) : <EmptyValue />}
        </DetailSection>

        <DetailSection
          title="Email"
          titleAction={emails.length > 1 && onEmailAll ? (
            <button type="button" onClick={(event) => { event.stopPropagation(); onEmailAll(emails); }} className="[font-size:calc(10px+var(--crm-font-offset))] font-medium text-slate-500 transition-colors hover:text-slate-800">Email all</button>
          ) : null}
        >
          {emails.length ? emails.map((email) => (
            <ContactValue
              key={email}
              value={email}
              actions={<ActionIconButton title={`Email ${email}`} icon="email" onClick={() => onEmail?.(email)} />}
            />
          )) : <EmptyValue />}
        </DetailSection>
      </div>

      <div className="lead-detail-secondary-grid">
        <DetailSection title="Notes">
          <textarea
            id="commNotes"
            className="min-h-28 w-full resize-y border-0 bg-transparent p-0 [font-size:calc(12px+var(--crm-font-offset))] font-normal leading-5 text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Add a note…"
            value={notes}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onNotesChange?.(event.target.value)}
          />
        </DetailSection>

        <DetailSection title="Upcoming Activity">
          {activity.length ? activity.map((item, index) => (
            <div key={`${item.text}-${index}`} className="border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
              <div className="[font-size:calc(12px+var(--crm-font-offset))] leading-5 text-slate-700">{item.text}</div>
              <div className="mt-0.5 [font-size:calc(10px+var(--crm-font-offset))] text-slate-400">{item.time}</div>
            </div>
          )) : <EmptyValue />}
        </DetailSection>

        <DetailSection title="History">
          {history.length ? history.map((item, index) => (
            <div key={`${item.subject}-${index}`} className="grid grid-cols-[36px_minmax(0,1fr)_42px] gap-2 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
              <span className="[font-size:calc(9px+var(--crm-font-offset))] font-medium uppercase text-slate-400">{item.type}</span>
              <div className="min-w-0">
                <div className="truncate [font-size:calc(12px+var(--crm-font-offset))] text-slate-700">{item.subject}</div>
                <div className="mt-0.5 truncate [font-size:calc(10px+var(--crm-font-offset))] text-slate-400">{item.preview}</div>
              </div>
              <span className="text-right [font-size:calc(10px+var(--crm-font-offset))] text-slate-400">{item.date}</span>
            </div>
          )) : <EmptyValue />}
        </DetailSection>
      </div>
    </div>
  );
}
