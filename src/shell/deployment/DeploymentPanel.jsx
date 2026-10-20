import {createPortal} from 'react-dom';
import CrmIcon from '../../components/CrmIcons.jsx';
import './deployment.css';

const PRODUCTION_URL='https://iphonelink-crm-gamma.vercel.app';
const DASHBOARD='https://vercel.com/izzy-bb13/iphonelink-crm';
const DEPLOY_REQUEST='Deploy iPhoneLink. Use the connected GitHub and Vercel accounts. Deploy the latest commit from izzytee1/iphonelink-crm main to the existing Vercel project iphonelink-crm in production. Keep the permanent URL https://iphonelink-crm-gamma.vercel.app. Verify that the deployment reaches READY and the permanent URL points to that commit. Do not change CRM source code.';
const CHAT_URL='https://chatgpt.com/?prompt='+encodeURIComponent(DEPLOY_REQUEST);

export default function DeploymentPanel({onClose}){
 return createPortal(<div className="crm-deploy-overlay" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section role="dialog" aria-modal="true" aria-label="Deploy iPhoneLink to Vercel" className="crm-deploy-panel">
   <header className="crm-deploy-header"><div><strong>Publish iPhoneLink</strong><span>Production · GitHub main</span></div><button type="button" aria-label="Close deployment panel" onClick={onClose}><CrmIcon name="x" size={18}/></button></header>
   <div className="crm-deploy-body">
    <div className="crm-deploy-url"><span>Permanent website</span><a href={PRODUCTION_URL} target="_blank" rel="noopener noreferrer">iphonelink-crm-gamma.vercel.app ↗</a></div>
    <a className="crm-deploy-submit" href={CHAT_URL} target="_blank" rel="noopener noreferrer"><CrmIcon name="send" size={17}/> Open ChatGPT to deploy</a>
    <p className="crm-deploy-foot">Opens ChatGPT with your deployment request ready. Press <strong>Send</strong> there. You can also type <strong>Deploy iPhoneLink</strong> in this chat any time. No setup or keys needed.</p>
    <p className="crm-deploy-foot">Deploys the latest code already committed to <strong>main</strong>; local file changes are not included. Your permanent URL stays the same after a successful build.</p>
    <a className="crm-deploy-dashboard" href={DASHBOARD} target="_blank" rel="noopener noreferrer">View Vercel deployments ↗</a>
   </div>
  </section>
 </div>,document.body);
}
