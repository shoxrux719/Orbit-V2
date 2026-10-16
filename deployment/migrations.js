import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {hashPassword} from '../design/school-server.js';

export function splitSQL(source){
 const statements=[];let sql='',quote='',line=false,comment=false;
 for(let i=0;i<source.length;i++){
  const c=source[i],next=source[i+1];
  if(line){if(c==='\n'){line=false;sql+='\n';}continue;}
  if(comment){if(c==='*'&&next==='/'){comment=false;i++;sql+=' ';}continue;}
  if(quote){sql+=c;if(c===quote){if(next===quote){sql+=next;i++;}else quote='';}continue;}
  if(c==='-'&&next==='-'){line=true;i++;continue;}
  if(c==='/'&&next==='*'){comment=true;i++;continue;}
  if(["'",'"','`'].includes(c)){quote=c;sql+=c;continue;}
  if(c===';'){if(sql.trim())statements.push(sql.trim());sql='';}else sql+=c;
 }
 if(sql.trim())statements.push(sql.trim());
 return statements;
}
export async function applyMigrations(client,directory){
 await client.execute('CREATE TABLE IF NOT EXISTS _orbit_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at INTEGER NOT NULL)');
 const files=(await fs.readdir(directory)).filter(x=>/^\d{4}_[\w-]+\.sql$/.test(x)).sort(),applied=[];
 for(const name of files){
  const source=await fs.readFile(path.join(directory,name),'utf8'),checksum=createHash('sha256').update(source.replaceAll('\r\n','\n')).digest('hex');
  const tx=await client.transaction('write');
  try{
   const existing=(await tx.execute({sql:'SELECT checksum FROM _orbit_migrations WHERE name=?',args:[name]})).rows[0];
   if(existing){if(existing.checksum!==checksum)throw Error('Migration changed after application: '+name);await tx.commit();continue;}
   for(const sql of splitSQL(source).filter(sql=>!/^PRAGMA\s+foreign_keys/i.test(sql)))await tx.execute(sql);
   await tx.execute({sql:'INSERT INTO _orbit_migrations VALUES(?,?,?)',args:[name,checksum,Date.now()]});
   await tx.commit();applied.push(name);
  }catch(error){await tx.rollback();throw error;}finally{tx.close();}
 }
 return applied;
}
export async function ensureAdministrator(client,{login='admin',password}={}){
 if((await client.execute("SELECT count(*) AS n FROM school_users WHERE role='admin'")).rows[0].n)return {created:false};
 if(!/^[a-z0-9][a-z0-9._-]{2,59}$/.test(login)||typeof password!=='string'||password.trim()!==password||password.length<12||password.length>200)throw Error('Set ORBIT_ADMIN_LOGIN and a private ORBIT_ADMIN_PASSWORD of 12–200 characters.');
 const id=randomUUID(),number='OR-'+randomUUID().replaceAll('-','').slice(0,10).toUpperCase(),hash=await hashPassword(password);
 const tx=await client.transaction('write');
 try{
  const existing=(await tx.execute("SELECT count(*) AS n FROM school_users WHERE role='admin'")).rows[0].n;
  if(!existing)await tx.execute({sql:'INSERT INTO school_users(id,number,login,password_hash,role,first_name,created_at) VALUES(?,?,?,?,?,?,?)',args:[id,number,login,hash,'admin','Администратор',Date.now()]});
  await tx.commit();return {created:!existing};
 }catch(error){await tx.rollback();throw error;}finally{tx.close();}
}
