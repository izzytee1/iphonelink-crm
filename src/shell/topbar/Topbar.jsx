import Brand from './Brand.jsx';
import TopNavigation from './TopNavigation.jsx';
import TopbarActions from './TopbarActions.jsx';

export default function Topbar({ workspace, setWorkspace, globalSearch, setGlobalSearch, unreadMail, settingsOpen, onSettings, communicationsOpen, onToggleCommunications }) {
 return <header className="crm-topbar">
  <Brand onLeads={() => setWorkspace('leads')} />
  <TopNavigation workspace={workspace} setWorkspace={setWorkspace} />
  <TopbarActions workspace={workspace} setWorkspace={setWorkspace} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} unreadMail={unreadMail} communicationsOpen={communicationsOpen} onToggleCommunications={onToggleCommunications} settingsOpen={settingsOpen} onSettings={onSettings} />
 </header>;
}
