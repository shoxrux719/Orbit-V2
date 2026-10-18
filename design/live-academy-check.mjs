import fs from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),stateFile='design/.academy-qa.json',base='http://127.0.0.1:3000';
if(process.argv.includes('--cleanup')){
 const state=JSON.parse(await fs.readFile(stateFile,'utf8'));
 if(!state.prefix.startsWith('academy.qa.')||!state.users.every(u=>/^[a-f0-9-]{36}$/.test(u.id))||!state.groups.every(g=>/^[a-f0-9-]{36}$/.test(g)))throw Error('Invalid fixture scope');
 const quoted=a=>a.map(v=>"'"+v.replaceAll("'","''")+"'").join(','),users=quoted(state.users.map(u=>u.id)),groups=quoted(state.groups),units=quoted(state.units);
 const sql=`PRAGMA foreign_keys=ON;
 DELETE FROM navigate_progress WHERE student_id IN (${users});
 DELETE FROM campus_coin_grants WHERE teacher_id IN (${users}) OR student_id IN (${users});
 DELETE FROM campus_student_flags WHERE student_id IN (${users});
 DELETE FROM navigate_assignments WHERE group_id IN (${groups});
 DELETE FROM navigate_units WHERE id IN (${units}) AND edition='${state.prefix}';
 DELETE FROM school_attendance WHERE student_id IN (${users});
 DELETE FROM school_lessons WHERE group_id IN (${groups});
 DELETE FROM school_members WHERE group_id IN (${groups});
 DELETE FROM school_groups WHERE id IN (${groups});
 DELETE FROM school_sessions WHERE user_id IN (${users});
 DELETE FROM school_audit WHERE actor_id IN (${users}) OR detail LIKE '%${state.prefix}%' OR detail IN (${units});
 DELETE FROM campus_action_limits WHERE key IN (${quoted(state.users.flatMap(u=>['answer:'+u.id,'coins-password:'+u.id]))});
 DELETE FROM school_users WHERE id IN (${users}) AND (login LIKE '${state.prefix}%' OR number IN (${quoted(state.users.map(u=>u.number))}));`;
 await fs.writeFile('.vercel/academy-cleanup.sql',sql);execFileSync(process.execPath,['run-wrangler.cjs','d1','execute','DB','--local','--config','wrangler.local.json','--file','.vercel/academy-cleanup.sql'],{cwd:root,stdio:'ignore'});
 await fs.unlink(stateFile);await fs.unlink('.vercel/academy-cleanup.sql');console.log('Only owned academy QA fixtures removed.');process.exit(0);
}
try{await fs.access(stateFile);throw Error('QA fixtures already exist');}catch(e){if(e.message==='QA fixtures already exist')throw e;}
const secret=await fs.readFile('.local-admin.txt','utf8'),pass=secret.match(/Пароль:\s*(\S+)/)[1];
async function call(path,body,cookie){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{Origin:base,'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(path+': '+JSON.stringify(d));return {data:d,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const admin=(await call('/api/school/login',{identifier:'admin',password:pass,portal:'staff'})).cookie;
const prefix='academy.qa.'+randomUUID().slice(0,8),state={prefix,users:[],groups:[],units:[]};
async function save(){await fs.writeFile(stateFile,JSON.stringify(state,null,2));}
await save();
const teacher=(await call('/api/school/users',{role:'teacher',login:prefix+'.teacher',firstName:'Александр',lastName:'Учитель QA',level:'A1'},admin)).data;state.users.push(teacher);await save();
const teacherCookie=(await call('/api/school/login',{identifier:teacher.login,password:teacher.password,portal:'staff'})).cookie;
const studentNames=[['Дилноза','Ахмедова'],['Азиз','Каримов'],['Малика','Рахимова'],['Тимур','Алиев'],['Сабина','Умарова'],['Бехруз','Саидов'],['Амина','Юсупова'],['Даврон','Рустамов']];
for(let i=0;i<8;i++){const phone='+99899'+String(Date.now()+i).slice(-7);const s=(await call('/api/school/users',{role:'student',login:prefix+'.student'+i,phone,firstName:studentNames[i][0],lastName:studentNames[i][1]+' QA',level:'A1',gender:i%2?'male':'female'},admin)).data;state.users.push(s);await save();}
for(const [label,schedule] of [['ENG 101 · QA','Пн / Ср / Пт · 18:00'],['ENG 102 · QA','Вт / Чт / Сб · 16:00']]){const g=(await call('/api/school/groups',{name:prefix+' · '+label,teacherId:teacher.id,level:'A1',schedule,room:'Campus / 03'},admin)).data.id;state.groups.push(g);await save();await call('/api/school/groups/'+g+'/members',{studentIds:state.users.slice(1).map(u=>u.id)},admin);}
const studentCookies=[];for(const s of state.users.slice(1))studentCookies.push((await call('/api/school/login',{identifier:s.phone,password:s.password,portal:'student'})).cookie);
for(let i=1;i<=6;i++){
 const code='99.'+i,id='A1-'+code;const created=(await call('/api/academy/units',{code,level:'A1',title:['First connections','Everyday stories','Around the world','A new perspective','Small discoveries','The next chapter'][i-1]},admin)).data.id;state.units.push(created);await save();
 const steps=[{type:'vocabulary',skill:'vocabulary',title:'Words for a new beginning',instructions:'hello — привет\nworld — мир\nlearn — учиться\nЭто авторский материал для проверки ORBIT, не содержание книги Navigate.',mediaUrl:'',questions:[{prompt:'Choose the meaning of “learn”.',options:['Учиться','Забывать','Ждать'],answer:0,explanation:'Learn means учиться.'}]},{type:'video',skill:'listening',title:'See a little more',instructions:'Тестовое видео для проверки проигрывателя. Ответьте на вопрос по словарю.',mediaUrl:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',questions:[{prompt:'Which word means «мир»?',options:['World','Book','Hello'],answer:0,explanation:'World means мир.'}]},{type:'practice',skill:'grammar',title:'Bring it together',instructions:'Выберите подходящую форму.',mediaUrl:'',questions:[{prompt:'I ___ learning English.',options:['am','is','are'],answer:0,explanation:'I am learning English.'}]}];
 await call('/api/academy/units/'+id,{title:['First connections','Everyday stories','Around the world','A new perspective','Small discoveries','The next chapter'][i-1],edition:prefix,status:'published',steps},admin);
 const assignment=(await call('/api/academy/assign',{groupId:state.groups[0],unitId:id,kind:'homework',lessonDate:'2026-10-'+String(i*2+3).padStart(2,'0'),dueAt:'2026-10-22'},teacherCookie)).data.id;
 for(let si=0;si<8;si++){const count=si===0&&i===6?2:si%4===3?0:si%4===2?1:3;for(let step=0;step<count;step++)await call('/api/academy/learning/'+assignment+'/answer',{step,question:0,answer:0},studentCookies[si]);}
}
const lesson=(await call('/api/school/lessons',{groupId:state.groups[0],date:'2026-10-18',title:'Navigate / group meeting'},teacherCookie)).data.id;
await call('/api/school/lessons/'+lesson+'/attendance',{rows:state.users.slice(1).map((s,i)=>({studentId:s.id,status:i===3?'absent':i===6?'late':'present'}))},teacherCookie);
for(const [index,status] of [[2,'potential'],[4,'red'],[6,'black']])await call('/api/academy/flags',{studentId:state.users[index+1].id,status,note:prefix+' · Arrange support'},status==='black'?admin:teacherCookie);
await call('/api/academy/coins',{studentId:state.users[1].id,amount:25,reason:prefix+' · Consistent progress',password:teacher.password,clientId:randomUUID()},teacherCookie);
console.log('Local academy QA ready: 1 teacher, 8 students, 2 groups, 6 original QA units. Credentials remain in ignored .vercel file.');
