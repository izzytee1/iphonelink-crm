import ActionButton from '../shared/ActionButton.jsx';
export default function ContactsView({ leads, contactTarget, onSelectLead, phoneController, openThread, composeEmail }) {
  return (
                <div className="crm-scroll min-h-0 flex-1 overflow-y-auto">
                  {leads.map((lead) => {
                    const mobile = contactTarget('sms', lead);
                    const phone = contactTarget('call', lead);
                    const email = contactTarget('email', lead);
                    return (
                      <div key={lead.id} className="comm-contact-row">
                        <button type="button" data-contact={lead.id} onClick={() => onSelectLead(lead.id)} className="min-w-0 flex-1 text-left"><strong>{lead.name}</strong><small>{lead.company}</small></button>
                        <div className="flex shrink-0 items-center gap-1">
                          {phone ? <ActionButton title="Call" icon="phone" dataProps={{ 'data-card-act': 'call' }} onClick={() => phoneController.callNumber(phone)} /> : null}
                          {mobile ? <ActionButton title="SMS" icon="sms" dataProps={{ 'data-card-act': 'sms' }} onClick={() => openThread('text', mobile)} /> : null}
                          {mobile ? <ActionButton title="WhatsApp" icon="whatsapp" dataProps={{ 'data-card-act': 'wa' }} onClick={() => openThread('wa', mobile)} /> : null}
                          {email ? <ActionButton title="Email" icon="email" dataProps={{ 'data-card-act': 'email' }} onClick={() => composeEmail(email)} /> : null}
                          {phone ? <ActionButton title="Load dialer" icon="keypad" dataProps={{ 'data-load': phone }} onClick={() => phoneController.loadNumber(phone)} /> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
  );
}
