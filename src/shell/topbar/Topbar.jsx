import Brand from './Brand.jsx';
import TopNavigation from './TopNavigation.jsx';
import TopbarActions from './TopbarActions.jsx';
export default function Topbar({workspace,setWorkspace,unreadMail,onSettings,phoneController}){
 return <header className="crm-topbar"><Brand onLeads={()=>setWorkspace('leads')}/><TopNavigation workspace={workspace} setWorkspace={setWorkspace}/><TopbarActions setWorkspace={setWorkspace} unreadMail={unreadMail} onSettings={onSettings} phoneController={phoneController}/></header>;
}
