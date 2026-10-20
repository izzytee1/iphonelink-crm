/** Send a deployment request to the connected project's Vercel Deploy Hook. */
const PROJECT_ID='prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY';
const HOOK_PATTERN=/^\/v1\/integrations\/deploy\/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY\/[A-Za-z0-9_-]{12,}$/;
export function isValidDeployHook(input){
 if(typeof input!=='string'||input.length>512)return false;
 try{
  const url=new URL(input);
  return url.protocol==='https:'&&url.hostname==='api.vercel.com'&&!url.port&&!url.username&&!url.password&&!url.search&&!url.hash&&HOOK_PATTERN.test(url.pathname)&&url.href===input;
 }catch{return false}
}
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 if(request.method!=='POST')return response.status(405).json({error:'Method not allowed'});
 const contentType=request.headers?.['content-type']||'';
 if(!contentType.toLowerCase().startsWith('application/json'))return response.status(415).json({error:'JSON required'});
 const hookUrl=request.body?.hookUrl;
 if(!isValidDeployHook(hookUrl))return response.status(400).json({error:'Use a Vercel Deploy Hook for this iPhoneLink project'});
 try{
  const upstream=await fetch(hookUrl,{method:'POST',headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000),redirect:'error'});
  if(!upstream.ok)return response.status(502).json({error:'Vercel rejected the deployment request; check the hook in Project Settings'});
  const data=await upstream.json();
  if(!data?.job?.id||!['PENDING','RUNNING','SUCCEEDED','QUEUED'].includes(data.job.state))return response.status(502).json({error:'Vercel did not confirm a deployment job'});
  return response.status(202).json({jobId:String(data.job.id),status:'queued'});
 }catch{return response.status(502).json({error:'Could not contact Vercel; try again later'})}
}
