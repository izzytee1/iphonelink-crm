import {useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import CrmIcon from '../../components/CrmIcons.jsx';
import './deployment.css';

const PRODUCTION_URL='https://iphonelink-crm-gamma.vercel.app';
const HOOK_STORAGE_KEY='iphonelink.vercel.deployHook.v1';
const HOOK_SETTINGS_URL='https://vercel.com/izzy-bb13/iphonelink-crm/settings/git';
const DASHBOARD_URL='https://vercel.com/izzy-bb13/iphonelink-crm/deployments';
const HOOK_PATTERN=/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY\/[A-Za-z0-9_-]{12,}$/;

function readStoredHook(){
 try{const value=window.localStorage.getItem(HOOK_STORAGE_KEY)||'';return HOOK_PATTERN.test(value)?value:''}catch{return ''}
}
export default function DeploymentPanel({onClose}){
 const [hook,setHook]=useState(readStoredHook);
 const [editing,setEditing]=useState(()=>!readStoredHook());
 const [busy,setBusy]=useState(false);
 const [result,setResult]=useState(null);
 const inFlight=useRef(false);
 async function deploy(event){
  event.preventDefault();
  if(inFlight.current)return;
  const deployHook=hook.trim();
  if(!HOOK_PATTERN.test(deployHook)){
   setResult({kind:'error',text:'Paste the Deploy Hook from your iPhoneLink project, branch main.'});return;
  }
  inFlight.current=true;setBusy(true);setResult(null);
  try{
   const response=await fetch('/api/deploy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hookUrl:deployHook}),cache:'no-store'});
   const data=await response.json();
   if(!response.ok||data.status!=='queued'||!data.jobId)throw new Error(data.error||'Vercel did not confirm a deployment job');
   try{window.localStorage.setItem(HOOK_STORAGE_KEY,deployHook)}catch{}
   setEditing(false);
   setResult({kind:'success',text:'Deployment requested. Vercel is building from main. Your URL updates after the build succeeds.'});
  }catch(error){setResult({kind:'error',text:error.message||'Deployment request failed.'})}
  finally{inFlight.current=false;setBusy(false)}
 }
 function forgetHook(){
  try{window.localStorage.removeItem(HOOK_STORAGE_KEY)}catch{}
  setHook('');setEditing(true);setResult(null);
 }
 return createPortal(<div className="crm-deploy-overlay" onPointerDown={event=>{if(event.target===event.currentTarget&&!busy)onClose()}}>
  <section role="dialog" aria-modal="true" aria-label="Deploy iPhoneLink to Vercel" className="crm-deploy-panel">
   <header className="crm-deploy-header"><div><strong>Publish iPhoneLink</strong><span>Production · GitHub main</span></div><button type="button" aria-label="Close deployment panel" onClick={onClose}><CrmIcon name="x" size={18}/></button></header>
   <form className="crm-deploy-body" onSubmit={deploy}>
    <div className="crm-deploy-url"><span>Permanent website</span><a href={PRODUCTION_URL} target="_blank" rel="noopener noreferrer">iphonelink-crm-gamma.vercel.app ↗</a></div>
    {editing&&<div className="crm-deploy-setup">
     <label htmlFor="crm-deploy-hook">One-time connection</label>
     <p>In <a href={HOOK_SETTINGS_URL} target="_blank" rel="noopener noreferrer">Vercel → Settings → Git → Deploy Hooks ↗</a>, create a hook for <strong>main</strong>. Paste its URL here once.</p>
     <input id="crm-deploy-hook" type="password" autoComplete="off" spellCheck={false} placeholder="Paste Vercel Deploy Hook URL" value={hook} onChange={event=>{setHook(event.target.value);setResult(null)}}/>
    </div>}
    <button className="crm-deploy-submit" type="submit" disabled={busy||(editing&&!hook.trim())}>
     <CrmIcon name="send" size={17}/>{busy?'Sending deployment…':editing?'Connect & deploy':'Deploy now'}
    </button>
    {result&&<p role="status" className={'crm-deploy-result '+result.kind}>{result.text}</p>}
    <p className="crm-deploy-foot">Builds the latest committed code on <strong>main</strong>. Failed builds do not replace your existing website.</p>
    <div className="crm-deploy-links"><a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">View deployment status ↗</a>{!editing&&<button type="button" onClick={forgetHook}>Change connection</button>}</div>
   </form>
  </section>
 </div>,document.body)
}
