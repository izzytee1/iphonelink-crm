import {useCallback,useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import CrmIcon from '../../components/CrmIcons.jsx';
import './deployment.css';

const DASHBOARD = 'https://vercel.com/izzy-bb13/iphonelink-crm';
async function requestDeployment(method='GET', payload, id) {
  const response = await fetch(`/api/deploy${id ? `?id=${encodeURIComponent(id)}` : ''}`, {
    method, credentials:'same-origin', cache:'no-store',
    ...(payload ? {headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)} : {})
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Deployment service is unavailable');
  return data;
}

export default function DeploymentPanel({onClose}) {
  const [info,setInfo] = useState(null);
  const [accessKey,setAccessKey] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const [requestedId,setRequestedId] = useState(null);

  const refresh = useCallback(async id => {
    const result = await requestDeployment('GET',null,id);
    setInfo(result);
    return result;
  },[]);
  useEffect(() => {
    let active=true;
    refresh().catch(()=>{if(active)setError('Deployment controls require the published Vercel site.')});
    return ()=>{active=false};
  },[refresh]);
  useEffect(() => {
    if (!requestedId || ['READY','ERROR','CANCELED','BLOCKED'].includes(info?.deployment?.state)) return;
    const timer=setInterval(()=>refresh(requestedId).catch(()=>setError('Unable to refresh deployment status. Check Vercel.')),7000);
    return ()=>clearInterval(timer);
  },[requestedId,info?.deployment?.state,refresh]);

  const login=async event=>{
    event.preventDefault();setBusy(true);setError('');
    try {await requestDeployment('POST',{action:'login',key:accessKey});setAccessKey('');await refresh();}
    catch(err){setError(err.message)}finally{setBusy(false)}
  };
  const deploy=async()=>{
    setBusy(true);setError('');setMessage('');
    try {
      const result=await requestDeployment('POST',{action:'deploy'});
      setRequestedId(result.deployment?.id||null);
      setInfo(current=>({...current,deployment:result.deployment}));
      setMessage('Build requested. The permanent URL updates only after Vercel reports READY.');
    } catch(err){setError(err.message)} finally{setBusy(false)}
  };
  const state=info?.deployment?.state;
  const working=state && !['READY','ERROR','CANCELED','BLOCKED'].includes(state);
  return createPortal(<div className="crm-deploy-overlay" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section role="dialog" aria-modal="true" aria-label="Deploy iPhoneLink to Vercel" className="crm-deploy-panel">
      <header className="crm-deploy-header"><div><strong>Publish iPhoneLink</strong><span>Production · GitHub main</span></div><button type="button" aria-label="Close deployment panel" onClick={onClose}><CrmIcon name="x" size={18}/></button></header>
      <div className="crm-deploy-body">
        <div className="crm-deploy-url"><span>Permanent website</span><a href="https://iphonelink-crm-gamma.vercel.app" target="_blank" rel="noreferrer">iphonelink-crm-gamma.vercel.app ↗</a></div>
        {info?.deployment && <div className="crm-deploy-state"><span className={`crm-deploy-indicator ${state==='READY'?'is-ready':state==='ERROR'?'is-error':''}`}/><span>Latest deployment: <strong>{state||'QUEUED'}</strong></span></div>}
        {info && !info.configured && <p className="crm-deploy-notice">One-time setup required: add <code>IPHONELINK_DEPLOY_ADMIN_KEY</code> and <code>IPHONELINK_VERCEL_TOKEN</code> as encrypted Production variables in Vercel, then redeploy.</p>}
        {info?.configured && !info.authenticated && <form onSubmit={login} className="crm-deploy-signin"><label htmlFor="crmDeployKey">Owner access key</label><input id="crmDeployKey" type="password" autoComplete="off" required value={accessKey} onChange={e=>setAccessKey(e.target.value)} placeholder="Enter once per device"/><button disabled={busy} type="submit">Unlock publishing</button></form>}
        {info?.configured && info.authenticated && <button className="crm-deploy-submit" type="button" onClick={deploy} disabled={busy||working}><CrmIcon name="send" size={17}/>{busy?'Contacting Vercel…':working?'Deployment in progress…':'Deploy latest to Vercel'}</button>}
        {message && <p className="crm-deploy-message" role="status">{message}</p>}
        {error && <p className="crm-deploy-error" role="alert">{error}</p>}
        <p className="crm-deploy-foot">Deploys the newest commit on <strong>main</strong>. A failed build will not replace the current live site.</p>
        <a className="crm-deploy-dashboard" href={DASHBOARD} target="_blank" rel="noreferrer">View Vercel deployments ↗</a>
      </div>
    </section>
  </div>,document.body);
}
