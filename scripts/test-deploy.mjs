import assert from 'node:assert/strict';
import handler from '../api/deploy.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.IPHONELINK_DEPLOY_ADMIN_KEY;
const originalToken = process.env.IPHONELINK_VERCEL_TOKEN;
process.env.IPHONELINK_DEPLOY_ADMIN_KEY = 'test-owner-key-with-long-random-characters-123456789';
process.env.IPHONELINK_VERCEL_TOKEN = 'test-vercel-access-token';
const requests=[];
globalThis.fetch=async (url,options)=>{
  requests.push({url,options});
  const payload=url.includes('/v13/deployments?') ? {id:'dpl_TEST123',readyState:'QUEUED'} : url.includes('/v13/deployments/dpl_TEST123') ? {id:'dpl_TEST123',readyState:'READY',gitSource:{sha:'abc123'}} : {deployments:[{uid:'dpl_PREVIOUS123',state:'READY'}]};
  return {ok:true,json:async()=>payload};
};
function req(method,body,extra={}){
  return {method,body, url:'/api/deploy',headers:{host:'iphonelink-crm-gamma.vercel.app',origin:'https://iphonelink-crm-gamma.vercel.app',...extra}};
}
function resp(){
  const result={headers:{},statusCode:0,body:null,setHeader(n,v){this.headers[n]=v;return this},status(n){this.statusCode=n;return this},json(x){this.body=x;return this}};
  return result;
}
async function invoke(r){const response=resp();await handler(r,response);return response;}
try {
  let r=await invoke(req('GET'));
  assert.equal(r.statusCode,200);assert.equal(r.body.authenticated,false);assert.equal(r.body.configured,true);
  assert.equal(r.headers['Cache-Control'],'no-store, max-age=0');
  r=await invoke(req('POST',{action:'deploy'})); assert.equal(r.statusCode,401);
  r=await invoke(req('POST',{action:'login',key:'incorrect'}));assert.equal(r.statusCode,401);
  r=await invoke(req('POST',{action:'login',key:process.env.IPHONELINK_DEPLOY_ADMIN_KEY},{origin:'https://evil.example'}));assert.equal(r.statusCode,403);
  r=await invoke(req('POST',{action:'login',key:process.env.IPHONELINK_DEPLOY_ADMIN_KEY}));assert.equal(r.statusCode,200);
  const cookie=r.headers['Set-Cookie'];assert.ok(cookie.includes('HttpOnly; Secure; SameSite=Strict'));assert.ok(cookie.includes('Max-Age=2592000'));
  const validCookie=cookie.split(';')[0];
  r=await invoke(req('GET',null,{cookie:validCookie}));assert.equal(r.statusCode,200);assert.equal(r.body.authenticated,true);assert.equal(r.body.deployment.state,'READY');
  r=await invoke(req('POST',{action:'deploy'},{cookie:validCookie}));assert.equal(r.statusCode,202);assert.equal(r.body.deployment.state,'QUEUED');
  assert.ok(requests.some(entry=>entry.url.includes('/v13/deployments?forceNew=1') && entry.options.method==='POST' && JSON.parse(entry.options.body).target==='production' && JSON.parse(entry.options.body).gitSource.ref==='main'));
  r=await invoke({...req('GET',null,{cookie:validCookie}),url:'/api/deploy?id=dpl_TEST123'});assert.equal(r.statusCode,200);assert.equal(r.body.deployment.state,'READY');
  assert.equal(r.body.deployment.sourceCommit,'abc123');
  r=await invoke({...req('GET',null,{cookie:validCookie}),url:'/api/deploy?id=../../foo'});assert.equal(r.statusCode,400);
  const oldKey=process.env.IPHONELINK_VERCEL_TOKEN;delete process.env.IPHONELINK_VERCEL_TOKEN;
  r=await invoke(req('POST',{action:'deploy'},{cookie:validCookie}));assert.equal(r.statusCode,503);process.env.IPHONELINK_VERCEL_TOKEN=oldKey;
  assert.ok(!requests.some(x=>x.options.headers.Authorization.includes(process.env.IPHONELINK_DEPLOY_ADMIN_KEY)));
  console.log('15 deployment security/behavior checks passed');
} finally {
  globalThis.fetch=originalFetch;
  if(originalKey===undefined)delete process.env.IPHONELINK_DEPLOY_ADMIN_KEY;else process.env.IPHONELINK_DEPLOY_ADMIN_KEY=originalKey;
  if(originalToken===undefined)delete process.env.IPHONELINK_VERCEL_TOKEN;else process.env.IPHONELINK_VERCEL_TOKEN=originalToken;
}
