// Exercise the real supplied OAuth handlers with an isolated in-memory DB and
// mocked Google endpoints. No browser account, real credential or live DB is used.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import esbuild from 'esbuild';

const directory=path.resolve('publish-stage-20260920-1500/dist/server/_next/static');
const env={GOOGLE_CLIENT_ID:'test.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'test-secret',APP_ORIGIN:'http://127.0.0.1:3000'};
let store, start, callback, logout, keys, jwk, token, claims, httpCalls;
const savedFetch=globalThis.fetch;
const hash=async value=>Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).toString('hex');
function reset(){ store={states:new Map(),accounts:new Map(),sessions:new Map()}; httpCalls=0; }
function statement(sql){
  return { sql, values:[], bind(...values){this.values=values;return this},
    async first(){const [state,now]=this.values;if(sql.startsWith('DELETE FROM oauth_states')){const row=store.states.get(state);if(!row||row.expires<=now)return null;store.states.delete(state);return {nonce:row.nonce}}throw Error('Unexpected SQL in test: '+sql)},
    async run(){const [a,b,c]=this.values;
      if(sql.startsWith('INSERT INTO oauth_states')) store.states.set(a,{nonce:b,expires:c});
      else if(sql.startsWith('INSERT INTO google_accounts')) store.accounts.set(a,{email:b,name:c});
      else if(sql.startsWith('INSERT INTO auth_sessions')) store.sessions.set(a,{userId:b,expires:c});
      else if(sql.includes('DELETE FROM auth_sessions WHERE token_hash')) store.sessions.delete(a);
      else if(sql.includes('DELETE FROM auth_sessions WHERE expires_at')) {for(const [key,row] of store.sessions)if(row.expires<a)store.sessions.delete(key)}
      else if(sql.includes('DELETE FROM oauth_states WHERE expires_at')) {for(const [key,row] of store.states)if(row.expires<a)store.states.delete(key)}
      else throw Error('Unexpected SQL in test: '+sql); return {success:true};
    } };
}
env.DB={prepare:statement,async batch(statements){return Promise.all(statements.map(s=>s.run()))}};
async function load(file){
  const compiled=await esbuild.build({entryPoints:[path.join(directory,file)],bundle:true,format:'esm',platform:'neutral',write:false,plugins:[{name:'isolated-worker-env',setup(build){build.onLoad({filter:/user-auth-.*\.js$/},args=>({contents:fs.readFileSync(args.path,'utf8').replace(/^.*?var n=/,'const t=globalThis.__orbitAuthTest.env;async function e(){return new Headers()}var n='),loader:'js'}))}}]});
  return import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
}
async function signedToken(overrides={}){
  const header=Buffer.from(JSON.stringify({alg:'RS256',kid:'local-test-key'})).toString('base64url');
  const payload=Buffer.from(JSON.stringify({...claims,...overrides})).toString('base64url');
  const body=header+'.'+payload;
  const signature=await webcrypto.subtle.sign('RSASSA-PKCS1-v1_5',keys.privateKey,new TextEncoder().encode(body));
  return body+'.'+Buffer.from(signature).toString('base64url');
}
async function attempt(overrides={},mutateToken){
  const state='state-'+webcrypto.randomUUID();const nonce='nonce-'+webcrypto.randomUUID();
  store.states.set(await hash(state),{nonce,expires:Date.now()+60000});
  claims={aud:env.GOOGLE_CLIENT_ID,iss:'https://accounts.google.com',exp:Date.now()/1000+300,iat:Date.now()/1000,nonce,email_verified:true,sub:'test-person',email:'learner@example.invalid',name:'Test Learner'};
  token=await signedToken(overrides);if(mutateToken)token=mutateToken(token);
  return callback(new Request(env.APP_ORIGIN+'/api/auth/google/callback?state='+state+'&code=test-code',{headers:{cookie:'orbit_oauth='+state}}));
}
before(async()=>{
  globalThis.__orbitAuthTest={env}; reset();
  keys=await webcrypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  jwk={...await webcrypto.subtle.exportKey('jwk',keys.publicKey),kid:'local-test-key'};
  globalThis.fetch=async url=>{httpCalls++;if(String(url)==='https://oauth2.googleapis.com/token')return Response.json({id_token:token});if(String(url)==='https://www.googleapis.com/oauth2/v3/certs')return Response.json({keys:[jwk]});throw Error('Unexpected network request in isolated test')};
  start=(await load('route-BHIw5N5d.js')).GET;
  callback=(await load('route-BrOA1eBs.js')).GET;
  logout=(await load('route-o2LZUz2U.js')).POST;
});
after(()=>{globalThis.fetch=savedFetch;delete globalThis.__orbitAuthTest});

test('Google start requests only identity scopes and stores a one-time state',async()=>{
  reset();const response=await start();assert.equal(response.status,302);
  const url=new URL(response.headers.get('location'));assert.equal(url.origin,'https://accounts.google.com');
  assert.equal(url.searchParams.get('scope'),'openid email profile');
  assert.equal(url.searchParams.get('redirect_uri'),env.APP_ORIGIN+'/api/auth/google/callback');
  assert.ok(response.headers.get('set-cookie').includes('HttpOnly'));assert.equal(store.states.size,1);
  const row=store.states.get(await hash(url.searchParams.get('state')));assert.equal(row.nonce,url.searchParams.get('nonce'));
});
test('callback rejects a mismatched state before calling Google',async()=>{
  reset();const response=await callback(new Request(env.APP_ORIGIN+'/api/auth/google/callback?state=a&code=b',{headers:{cookie:'orbit_oauth=c'}}));
  assert.equal(response.headers.get('location'),env.APP_ORIGIN+'/?authError=google#account');assert.equal(httpCalls,0);assert.equal(store.sessions.size,0);
});
test('first login creates an account; another login uses the same identity',async()=>{
  reset();for(let i=0;i<2;i++){const response=await attempt();assert.equal(response.headers.get('location'),env.APP_ORIGIN+'/#account');assert.ok(response.headers.get('set-cookie').includes('orbit_session='));assert.ok(response.headers.get('set-cookie').includes('HttpOnly'))}
  assert.equal(store.accounts.size,1);assert.equal(store.sessions.size,2);assert.ok(store.accounts.has('google:test-person'));assert.equal(store.states.size,0);
});
test('expired, wrong-audience, wrong-nonce and unverified-email tokens cannot create a session',async()=>{
  for(const overrides of [{exp:Date.now()/1000-1},{aud:'another-client'},{nonce:'another-nonce'},{email_verified:false}]){reset();const response=await attempt(overrides);assert.ok(response.headers.get('location').includes('authError'));assert.equal(store.accounts.size,0);assert.equal(store.sessions.size,0)}
});
test('an invalid signature cannot create an account',async()=>{
  reset();const response=await attempt({},value=>{const parts=value.split('.');parts[2]='AAAA';return parts.join('.')});assert.ok(response.headers.get('location').includes('authError'));assert.equal(store.accounts.size,0);
});
test('a consumed state cannot be replayed',async()=>{
  reset();const state='consumed-state';const response=await callback(new Request(env.APP_ORIGIN+'/api/auth/google/callback?state='+state+'&code=b',{headers:{cookie:'orbit_oauth='+state}}));assert.ok(response.headers.get('location').includes('authError'));assert.equal(httpCalls,0);
});
test('logout rejects other origins and revokes the current session',async()=>{
  reset();const raw='opaque-session';store.sessions.set(await hash(raw),{userId:'google:test-person',expires:Date.now()+1000});
  const bad=await logout(new Request(env.APP_ORIGIN+'/api/auth/logout',{method:'POST',headers:{origin:'https://other.example',cookie:'orbit_session='+raw}}));assert.equal(bad.status,403);assert.equal(store.sessions.size,1);
  const good=await logout(new Request(env.APP_ORIGIN+'/api/auth/logout',{method:'POST',headers:{origin:env.APP_ORIGIN,cookie:'orbit_session='+raw}}));assert.equal(good.status,200);assert.equal(store.sessions.size,0);assert.ok(good.headers.get('set-cookie').includes('Max-Age=0'));
});
