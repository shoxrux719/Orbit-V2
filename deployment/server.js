import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import worker from '../server/orbit-entry.js';
import {getDatabase} from './database.js';
import {withEnvironment} from './runtime-env.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assetRoot=path.join(root,'assets');
const mime={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2','.mp4':'video/mp4','.m4a':'audio/mp4','.vtt':'text/vtt; charset=utf-8'};
let manifest;
async function assets(request){
 if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});
 manifest??=new Set(JSON.parse(await readFile(path.join(root,'assets.json'),'utf8')));
 let name;try{name=decodeURIComponent(new URL(request.url).pathname);}catch{return new Response(null,{status:400});}
 if(!manifest.has(name))return new Response(null,{status:404});
 const data=await readFile(path.join(assetRoot,name.slice(1)));
 const media=name.startsWith('/orbit-lessons/'),headers={'Content-Type':mime[path.extname(name)]||'application/octet-stream','Cache-Control':media?'public, max-age=31536000, immutable':/\.(js|css|json)$/.test(name)?'no-store':'public, max-age=3600','X-Content-Type-Options':'nosniff','Content-Length':String(data.length)};
 if(media){
  headers['Accept-Ranges']='bytes';const range=request.headers.get('range');
  if(range&&request.method==='GET'){
   const match=/^bytes=(\d*)-(\d*)$/.exec(range);let start=0,end=data.length-1;
   if(match&&(match[1]||match[2])){if(match[1]){start=Number(match[1]);if(match[2])end=Number(match[2]);}else start=Math.max(0,data.length-Number(match[2]));}
   else return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${data.length}`}});
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=data.length||start>end)return new Response(null,{status:416,headers:{...headers,'Content-Length':'0','Content-Range':`bytes */${data.length}`}});
   end=Math.min(end,data.length-1);headers['Content-Range']=`bytes ${start}-${end}/${data.length}`;headers['Content-Length']=String(end-start+1);
   return new Response(data.subarray(start,end+1),{status:206,headers});
  }
 }
 return new Response(request.method==='HEAD'?null:data,{headers});
}
function configurationError(){return Response.json({error:'Онлайн-база ORBIT ещё не подключена. Администрации нужно настроить базу данных для этого сайта.'},{status:503,headers:{'Cache-Control':'no-store','Retry-After':'60'}});}
export function createFetch({database=()=>getDatabase(),site=worker}={}){
 return async function fetchRequest(request){
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/api/')&&['GET','HEAD'].includes(request.method)){const response=await assets(request);if(response.status!==404)return response;}
  const DB=await database();
  const requiresDatabase=url.pathname.startsWith('/api/')&&!(url.pathname==='/api/account'&&request.method==='GET'&&!request.headers.get('cookie')?.includes('orbit_school='))&&!url.pathname.startsWith('/api/auth/google');
  if(!DB&&(requiresDatabase||request.headers.get('cookie')?.includes('orbit_school=')))return configurationError();
  const bindings={DB,ASSETS:{fetch:assets}};
  return withEnvironment(bindings,async()=>{
   const response=await site.fetch(request,bindings,{waitUntil:promise=>promise.catch(error=>console.error('Background task failed:',error.name))});
   const headers=new Headers(response.headers);
   if((url.pathname.startsWith('/api/')&&!/^\/api\/school\/media\/[a-zA-Z0-9-]+$/.test(url.pathname))||headers.get('Content-Type')?.includes('text/html'))headers.set('Cache-Control','private, no-store');
   headers.set('X-Content-Type-Options','nosniff');
   return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers});
  });
 };
}
export function createNodeHandler({fetchRequest=createFetch(),vercel=process.env.VERCEL==='1'}={}){
 return async function handler(req,res){
  try{
   const headers=new Headers();
   for(const [key,value] of Object.entries(req.headers)){if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(', '):value);}
   // Vercel overwrites these forwarding headers. Never trust a client-supplied CF IP.
   headers.delete('cf-connecting-ip');
   const ip=vercel?req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']:req.socket.remoteAddress;
   if(ip)headers.set('cf-connecting-ip',String(ip).split(',')[0].trim());
   const host=req.headers.host;if(!host||/[\s/\\]/.test(host))throw Error('Invalid host');
   const protocol=vercel||req.socket.encrypted?'https:':'http:';
   const url=new URL(req.url,protocol+'//'+host);
   if(url.host!==host)throw Error('Invalid request URL');
   const parts=[];let size=0;
   if(!['GET','HEAD'].includes(req.method))for await(const part of req){size+=part.length;if(size>2200000){res.statusCode=413;res.end('Request too large');return;}parts.push(part);}
   const response=await fetchRequest(new Request(url,{method:req.method,headers,...(parts.length?{body:Buffer.concat(parts)}:{})}));
   res.statusCode=response.status;
   response.headers.forEach((value,key)=>{if(key!=='set-cookie'&&key!=='content-length')res.setHeader(key,value);});
   const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
   res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
  }catch(error){
   console.error('ORBIT request failed:',error.name);
   if(!res.headersSent){res.statusCode=503;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');}
   res.end(JSON.stringify({error:'Не удалось открыть ORBIT. Попробуй ещё раз позже.'}));
  }
 };
}
export default createNodeHandler();
