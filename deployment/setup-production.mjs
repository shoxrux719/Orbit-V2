import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@libsql/client/http';
import {applyMigrations,ensureAdministrator} from './migrations.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const envFile=path.join(root,'.env.production.local');
if(fs.existsSync(envFile)){
 if(!process.loadEnvFile)throw Error('Use Node.js 22 or newer to load .env.production.local.');
 process.loadEnvFile(envFile);
}
const url=process.env.TURSO_DATABASE_URL,authToken=process.env.TURSO_AUTH_TOKEN;
if(!url||!authToken)throw Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in the ignored .env.production.local file.');
if(!['libsql:','https:'].includes(new URL(url).protocol))throw Error('Production setup requires a remote database.');
const client=createClient({url,authToken});
try{
 const applied=await applyMigrations(client,path.join(root,'publish-stage-20260920-1500/dist/.openai/drizzle'));
 const admin=await ensureAdministrator(client,{login:process.env.ORBIT_ADMIN_LOGIN||'admin',password:process.env.ORBIT_ADMIN_PASSWORD});
 console.log(`${applied.length} migrations applied. Administrator ${admin.created?'created':'already exists; password preserved'}.`);
}finally{client.close();}
