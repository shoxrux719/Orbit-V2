import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createServer} from 'node:http';
import {createClient} from '@libsql/client';
import {d1Adapter} from './d1-adapter.js';
import {applyMigrations,ensureAdministrator,splitSQL} from './migrations.js';
import {getDatabase} from './database.js';
import {env,withEnvironment} from './runtime-env.js';
import {createFetch,createNodeHandler} from '../.vercel/output/functions/orbit.func/handler.mjs';
const migrationDir='publish-stage-20260920-1500/dist/.openai/drizzle';
const password='Private-test-password-2026';

test('production migrations and administrator setup are idempotent and preserve data',async()=>{
 const client=createClient({url:'file::memory:'});try{
  assert.equal((await applyMigrations(client,migrationDir)).length,8);
  await assert.rejects(ensureAdministrator(client),/ORBIT_ADMIN/);
  assert.equal((await ensureAdministrator(client,{password})).created,true);
  const before=(await client.execute("SELECT * FROM school_users WHERE role='admin'")).rows[0];
  assert.equal((await applyMigrations(client,migrationDir)).length,0);
  assert.equal((await ensureAdministrator(client,{password:'A-different-test-password'})).created,false);
  const after=(await client.execute("SELECT * FROM school_users WHERE role='admin'")).rows[0];assert.equal(after.password_hash,before.password_hash);assert.equal(after.id,before.id);
  assert.deepEqual(splitSQL("-- a;\nSELECT 'one;two'; /* ; */ SELECT 'it''s OK';"),["SELECT 'one;two'","SELECT 'it''s OK'"]);
 }finally{client.close();}
});
test('D1 adapter keeps bound values, RETURNING, first(column), affected rows and atomic rollback',async()=>{
 const client=createClient({url:'file::memory:'});try{
  const DB=d1Adapter(client);await DB.prepare('CREATE TABLE sample (id TEXT PRIMARY KEY, value INTEGER)').run();
  const value="bound'; DELETE FROM sample; --";
  const inserted=await DB.prepare('INSERT INTO sample VALUES(?,?) RETURNING value').bind(value,7).first('value');assert.equal(inserted,7);
  assert.equal((await DB.prepare('UPDATE sample SET value=? WHERE id=?').bind(8,value).run()).meta.changes,1);
  await assert.rejects(DB.batch([DB.prepare('INSERT INTO sample VALUES(?,?)').bind('new',1),DB.prepare('INSERT INTO sample VALUES(?,?)').bind(value,2)]));
  assert.equal(await DB.prepare('SELECT value FROM sample WHERE id=?').bind('new').first(),null);
  assert.equal(await DB.prepare('SELECT value FROM sample WHERE id=?').bind(value).first('value'),8);
 }finally{client.close();}
});
test('request environments stay isolated across concurrent async work',async()=>{
 const result=await Promise.all(['one','two'].map(id=>withEnvironment({DB:id},async()=>{await new Promise(r=>setTimeout(r,10));return env.DB;})));
 assert.deepEqual(result,['one','two']);assert.equal(env.DB,undefined);
});
test('Vercel serves SSR login and explicit database errors without a configured database',async()=>{
 const app=createFetch({database:()=>null});
 for(const route of ['/','/student','/teacher','/admin','/people/example']){
  const response=await app(new Request('https://orbit.example'+route));const html=await response.text();assert.equal(response.status,200);assert.match(html,/orbit-campus-[a-f0-9]{12}\.css/);assert.match(html,/page-orbit-[a-f0-9]{12}\.js/);assert.equal(response.headers.get('cache-control'),'private, no-store');
 }
 const account=await app(new Request('https://orbit.example/api/account'));assert.equal((await account.json()).user,null);
 const login=await app(new Request('https://orbit.example/api/school/login',{method:'POST'}));assert.equal(login.status,503);assert.match((await login.json()).error,/база/);
 const stale=await app(new Request('https://orbit.example/api/account',{headers:{Cookie:'orbit_school=abc'}}));assert.equal(stale.status,503);
 assert.equal(getDatabase({}),null);assert.throws(()=>getDatabase({TURSO_DATABASE_URL:'file:/tmp/database.sqlite',TURSO_AUTH_TOKEN:'test-only'}),/remote/);
});
test('Vercel server supports real roles, cookies, legacy progress and origin checks',async()=>{
 const client=createClient({url:'file::memory:'});try{
  await applyMigrations(client,migrationDir);await ensureAdministrator(client,{password});
  const app=createFetch({database:()=>d1Adapter(client)}),origin='https://orbit.example';
  async function api(route,body,cookie='',requestOrigin=origin){const response=await app(new Request(origin+route,{method:body?'POST':'GET',headers:{Cookie:cookie,...(body?{'Content-Type':'application/json',Origin:requestOrigin}:{})},...(body?{body:JSON.stringify(body)}:{})}));return {response,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};}
  const admin=await api('/api/school/login',{identifier:'admin',password,portal:'staff'});assert.equal(admin.response.status,200);assert.match(admin.response.headers.get('set-cookie'),/Secure/);
  const student=await api('/api/school/users',{role:'student',firstName:'Test',phone:'+998900000001',password},admin.cookie);assert.equal(student.response.status,201);
  const wrong=await api('/api/school/login',{identifier:'admin',password,portal:'student'});assert.equal(wrong.response.status,400);
  const signed=await api('/api/school/login',{identifier:'90 000 00 01',password,portal:'student'});assert.equal(signed.data.user.role,'student');
  const progress=await api('/api/progress',undefined,signed.cookie);assert.equal(progress.response.status,200);assert.deepEqual(progress.data.sessions,[]);
  assert.equal((await api('/api/school/users',{role:'teacher'},signed.cookie)).response.status,403);
  assert.equal((await api('/api/school/users',{role:'student'},admin.cookie,'https://other.example')).response.status,403);
  const redirect=await app(new Request(origin+'/teacher',{headers:{Cookie:signed.cookie}}));assert.equal(redirect.status,302);assert.match(redirect.headers.get('location'),/\/student#account$/);
  assert.equal((await api('/api/auth/logout',{},signed.cookie)).response.status,200);
  assert.equal((await api('/api/account',undefined,signed.cookie)).data.user,null);
 }finally{client.close();}
});
test('Node HTTP bridge preserves paths and cookies, supports HEAD and rejects spoofed IPs',async()=>{
 let seen;
 const handler=createNodeHandler({vercel:false,fetchRequest:async request=>{seen=request;return new Response('ok',{headers:{'Set-Cookie':'test=value; HttpOnly; SameSite=Lax','Content-Type':'text/plain'}});}});
 const server=createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  const response=await fetch(origin+'/student?hello=world',{headers:{'cf-connecting-ip':'spoofed','x-forwarded-for':'spoofed'}});assert.equal(await response.text(),'ok');assert.match(seen.url,/\/student\?hello=world$/);assert.notEqual(seen.headers.get('cf-connecting-ip'),'spoofed');assert.match(response.headers.get('set-cookie'),/HttpOnly/);
  assert.equal((await fetch(origin+'/student',{method:'HEAD'})).status,200);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
test('build output includes only public assets and the explicit Vercel function route',async()=>{
 const base='.vercel/output',config=JSON.parse(await fs.readFile(base+'/config.json','utf8'));
 assert.equal(config.version,3);assert.deepEqual(config.routes.slice(-2),[{handle:'filesystem'},{src:'/(.*)',dest:'/orbit'}]);
 const fn=JSON.parse(await fs.readFile(base+'/functions/orbit.func/.vc-config.json','utf8'));assert.equal(fn.runtime,'nodejs22.x');
 for(const route of ['/orbit-auth-studio.png','/orbit-campus.css','/_next/static/chunks/orbit-design.js'])assert.ok((await fs.stat(base+'/static'+route)).size>0);
 const assets=JSON.parse(await fs.readFile(base+'/functions/orbit.func/assets.json','utf8'));assert.ok(assets.every(name=>!name.includes('.dev.vars')&&!name.includes('.sqlite')&&!name.includes('.local-admin')));
 await assert.rejects(fs.stat(base+'/static/server'));await assert.rejects(fs.stat(base+'/static/.env.production.local'));
});

test('optimized assets use revisioned URLs, immutable cache routes and compact WebP images',async()=>{
 const base='.vercel/output/static',revision=JSON.parse(await fs.readFile(base+'/orbit-assets.json','utf8'));
 assert.match(revision.version,/^[a-f0-9]{12}$/);
 const app=createFetch({database:()=>null}),html=await (await app(new Request('https://orbit.example/'))).text();
 assert.ok(html.includes(revision.pageName));assert.ok(html.includes(revision.indexName));
 for(const name of ['design','learning','school','campus']){
  const file=`/orbit-${name}-${revision.version}.css`;assert.ok(html.includes(file));assert.ok((await fs.stat(base+file)).size>0);
 }
 const page=await fs.readFile(base+'/_next/static/chunks/'+revision.pageName,'utf8');assert.ok(page.includes(revision.designName));
 const legacyStyles=await fs.readFile(base+'/_next/static/css/index.BUnWrGnF.css','utf8');assert.doesNotMatch(legacyStyles,/listening-hero\.png|homework-sprite\.png|orbit-hero\.png/);
 assert.ok((await fs.stat(base+`/orbit-auth-studio-${revision.version}.webp`)).size<80000);
 assert.ok((await fs.stat(base+`/orbit-auth-studio-mobile-${revision.version}.webp`)).size<40000);
 assert.ok((await fs.stat(base+'/_next/static/chunks/'+revision.designName)).size<300000);
 const config=JSON.parse(await fs.readFile('.vercel/output/config.json','utf8'));assert.ok(config.routes.some(r=>r.headers?.['Cache-Control']?.includes('immutable')));
 for(const match of html.matchAll(/(?:src|href)="(\/(?:_next\/static|orbit-)[^"?#]+)(?:[?#][^"]*)?"/g))assert.ok((await fs.stat(base+match[1])).isFile(),match[1]);
});
