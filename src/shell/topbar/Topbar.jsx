import Brand from './Brand.jsx';
import TopNavigation from './TopNavigation.jsx';
import TopbarActions from './TopbarActions.jsx';
import TopbarDialer from '../dialer/TopbarDialer.jsx';
import { crmPhones } from '../../data/communications.js';

export default function Topbar({ workspace, setWorkspace, globalSearch, setGlobalSearch, unreadMail, settingsOpen, onSettings, communicationsOpen, onToggleCommunications, phoneController }) {
  return (
    <header className="crm-topbar">
      <Brand onLeads={() => setWorkspace('leads')} />
      <TopNavigation workspace={workspace} setWorkspace={setWorkspace} />
      <TopbarDialer phones={crmPhones} controller={phoneController} />
      <TopbarActions workspace={workspace} setWorkspace={setWorkspace} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} unreadMail={unreadMail} communicationsOpen={communicationsOpen} onToggleCommunications={onToggleCommunications} settingsOpen={settingsOpen} onSettings={onSettings} />
    </header>
  );
}
