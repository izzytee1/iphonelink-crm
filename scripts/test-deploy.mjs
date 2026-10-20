import assert from 'node:assert/strict';
import handler,{isValidDeployHook} from '../api/deploy.js';
const valid='https://api.vercel.com/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/testHookToken1234';
function response(){return{code:0,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(n){this.code=n;return this},json(data){this.body=data;return this}}}
async function call(body,headers={'content-type':'application/json'},method='POST'){
 const res=response();await handler({method,headers,body},res);return res
}
assert.equal(isValidDeployHook(valid),true);
for(const hook of ['','not-a-url','http://api.vercel.com/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/abcdefghijklm','https://evil.example/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/abcdefghijklm','https://api.vercel.com/v1/integrations/deploy/prj_OTHER/abcdefghijklm','https://api.vercel.com/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/abcdefghijklm?debug=1','https://api.vercel.com/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/short','https://api.vercel.com.evil.example/v1/integrations/deploy/prj_QfgsdOPqc8DroLiSnDIs4bCXN9hY/abcdefghijklm'])assert.equal(isValidDeployHook(hook),false);
assert.equal((await call({hookUrl:valid},{},'GET')).code,405);
assert.equal((await call({hookUrl:valid},{'content-type':'text/plain'})).code,415);
assert.equal((await call({hookUrl:'https://evil.example'})).code,400);
const original=globalThis.fetch;
try{
 let called=0;
 globalThis.fetch=async(url,options)=>{called++;assert.equal(url,valid);assert.equal(options.method,'POST');assert.equal(options.redirect,'error');return{ok:true,json:async()=>({job:{id:'job-test-123',state:'PENDING'}})}};
 const accepted=await call({hookUrl:valid});assert.equal(accepted.code,202);assert.equal(accepted.body.status,'queued');assert.equal(accepted.body.jobId,'job-test-123');assert.equal(accepted.headers['Cache-Control'],'no-store');assert.equal(called,1);
 globalThis.fetch=async()=>({ok:false,status:403});let rejected=await call({hookUrl:valid});assert.equal(rejected.code,502);assert.ok(!JSON.stringify(rejected.body).includes('testHookToken'));
 globalThis.fetch=async()=>({ok:true,json:async()=>({foo:1})});rejected=await call({hookUrl:valid});assert.equal(rejected.code,502);
 globalThis.fetch=async()=>{throw new Error(valid)};rejected=await call({hookUrl:valid});assert.equal(rejected.code,502);assert.ok(!JSON.stringify(rejected.body).includes('testHookToken'));
}finally{globalThis.fetch=original}
console.log('Deploy API tests PASS — accepted, method, project scope, SSRF protection, invalid upstream, no secret leaks');
