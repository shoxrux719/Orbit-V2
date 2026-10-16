import {createClient} from '@libsql/client/http';
import {d1Adapter} from './d1-adapter.js';
let cache;
export function getDatabase(config=process.env){
 const url=config.TURSO_DATABASE_URL,authToken=config.TURSO_AUTH_TOKEN;
 if(!url||!authToken)return null;
 const parsed=new URL(url);
 if(!['libsql:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('Use a remote libSQL database URL.');
 if(!cache||cache.url!==url||cache.authToken!==authToken){cache?.client.close();const client=createClient({url,authToken});cache={url,authToken,client,DB:d1Adapter(client)};}
 return cache.DB;
}
