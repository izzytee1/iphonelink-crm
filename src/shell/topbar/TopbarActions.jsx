import Clock from './Clock.jsx';
import Notifications from '../notifications/Notifications.jsx';
import CrmIcon from '../../components/CrmIcons.jsx';
export default function TopbarActions({ workspace, setWorkspace, unreadMail, settingsOpen, onSettings }) {
 return <div className="crm-topbar-tools"><button type="button" id="crmDisplaySettingsOpen" className={`crm-topbar-icon ${settingsOpen?'active':''}`} onClick={onSettings} title="Settings" aria-label="Display settings"><CrmIcon name="settings" size={17}/></button><Notifications unreadMail={unreadMail} onOpenEmail={()=>setWorkspace('email')}/><Clock /></div>;
}
