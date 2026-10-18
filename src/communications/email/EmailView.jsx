import EmailClient from '../../pages/email/EmailClient.jsx';
export default function EmailView({selectedLead,composeEmail,onOpenEmail,leads,mailbox,setMailbox,onSelectLead}) {
  return <div id="mailHostComms" className="h-full min-h-0 flex flex-col bg-white">
    <EmailClient leads={leads} mailbox={mailbox} setMailbox={setMailbox} onSelectLead={onSelectLead} compact/>
  </div>;
}
