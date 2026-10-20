import {createHmac, timingSafeEqual} from 'node:crypto';

const PROJECT_ID = 'prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY';
const TEAM_ID = 'team_iIx4almAXAgWq1ADBXTQdZKe';
const REPOSITORY_ID = 1424287833;
const PRODUCTION_URL = 'https://iphonelink-crm-gamma.vercel.app';
const SESSION_AGE_SECONDS = 30 * 24 * 60 * 60;
const COOKIE_NAME = 'iphonelink_deploy_session';
const VERCEL_API = 'https://api.vercel.com';

function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(time, secret) {
  return createHmac('sha256', secret).update(String(time)).digest('hex');
}

function authenticated(request, secret) {
  if (!secret) return false;
  const value = (request.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value) return false;
  const [time, signature, extra] = value.split('.');
  const issued = Number(time);
  const now = Math.floor(Date.now() / 1000);
  return !extra && Number.isSafeInteger(issued) && issued <= now && now - issued < SESSION_AGE_SECONDS && safeEqual(signature, sign(time, secret));
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.host === request.headers.host && (url.protocol === 'https:' || (url.protocol === 'http:' && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.host)));
  } catch { return false; }
}

function json(response, code, body) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  return response.status(code).json(body);
}

async function vercel(path, init = {}) {
  const url = `${VERCEL_API}${path}${path.includes('?') ? '&' : '?'}teamId=${encodeURIComponent(TEAM_ID)}`;
  const response = await fetch(url, {
    ...init,
    headers: {'Authorization': `Bearer ${process.env.IPHONELINK_VERCEL_TOKEN}`, 'Content-Type': 'application/json', ...init.headers},
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Vercel API returned HTTP ${response.status}`);
  return response.json();
}

function deploymentInfo(value) {
  if (!value) return null;
  return {
    id: value.id ?? value.uid ?? null,
    state: value.readyState ?? value.state ?? 'QUEUED',
    sourceCommit: value.gitSource?.sha ?? value.meta?.githubCommitSha ?? null,
    createdAt: value.createdAt ?? value.created ?? null,
    productionUrl: PRODUCTION_URL
  };
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'POST') return json(response, 405, {error:'Method not allowed'});
  const secret = process.env.IPHONELINK_DEPLOY_ADMIN_KEY;
  const configured = Boolean(secret && process.env.IPHONELINK_VERCEL_TOKEN);
  const isOwner = authenticated(request, secret);

  if (request.method === 'GET') {
    const info = {configured, authenticated:isOwner, productionUrl:PRODUCTION_URL, branch:'main'};
    if (!isOwner || !configured) return json(response, 200, info);
    try {
      const id = new URL(request.url, `https://${request.headers.host}`).searchParams.get('id');
      if (id && !/^dpl_[A-Za-z0-9]+$/.test(id)) return json(response, 400, {error:'Invalid deployment ID'});
      const result = id
        ? await vercel(`/v13/deployments/${id}`)
        : await vercel(`/v6/deployments?projectId=${PROJECT_ID}&target=production&limit=1`);
      return json(response, 200, {...info, deployment:deploymentInfo(id ? result : result.deployments?.[0])});
    } catch {
      return json(response, 502, {...info, error:'Could not read deployment status from Vercel'});
    }
  }

  if (!sameOrigin(request)) return json(response, 403, {error:'Request origin was not accepted'});
  if (Number(request.headers['content-length'] || 0) > 2048) return json(response, 413, {error:'Request too large'});
  const body = request.body && typeof request.body === 'object' ? request.body : {};
  if (body.action === 'login') {
    if (!secret) return json(response, 503, {error:'Owner access is not configured'});
    if (!safeEqual(body.key, secret)) return json(response, 401, {error:'Incorrect owner access key'});
    const time = Math.floor(Date.now() / 1000);
    const cookie = `${COOKIE_NAME}=${time}.${sign(time,secret)}; HttpOnly; Secure; SameSite=Strict; Path=/api/deploy; Max-Age=${SESSION_AGE_SECONDS}`;
    response.setHeader('Set-Cookie', cookie);
    return json(response, 200, {authenticated:true, configured});
  }
  if (body.action !== 'deploy') return json(response, 400, {error:'Invalid action'});
  if (!isOwner) return json(response, 401, {error:'Owner sign-in required'});
  if (!configured) return json(response, 503, {error:'Vercel deployment token is not configured'});
  try {
    const result = await vercel('/v13/deployments?forceNew=1', {
      method:'POST',
      body: JSON.stringify({
        name:'iphonelink-crm',
        project:PROJECT_ID,
        target:'production',
        gitSource:{type:'github',repoId:REPOSITORY_ID,ref:'main'}
      })
    });
    return json(response, 202, {deployment:deploymentInfo(result), productionUrl:PRODUCTION_URL, message:'Vercel accepted the deployment request'});
  } catch {
    return json(response, 502, {error:'Vercel rejected the deployment request. Check the project token and Git access.'});
  }
}
