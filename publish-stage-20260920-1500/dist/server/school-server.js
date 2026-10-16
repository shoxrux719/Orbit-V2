// School access is resolved here before forwarding to the supplied learning app.
// No browser field, URL or platform header is trusted as a role or user identity.
const encoder = new TextEncoder();
export const skills = ['listening','reading','speaking','writing','grammar','vocabulary'];
const levels = ['A1','A2','B1','B2','C1','C2'];
const pub = 'id,number,role,first_name,last_name,gender,bio,level,avatar_id,banner_id,banner_style,created_at';
const json = (value, status=200, headers={}) => Response.json(value,{status,headers:{'Cache-Control':'no-store',...headers}});
class Problem extends Error { constructor(status,message){super(message);this.status=status;} }
const fail = (status,message) => {throw new Problem(status,message);};
const token = () => [...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');
export const digest = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function hashPassword(password, salt=token().slice(0,32)) {
 const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return `pbkdf2:100000:${salt}:${[...new Uint8Array(bits)].map(n=>n.toString(16).padStart(2,'0')).join('')}`;
}
async function verifyPassword(password, expected) {
 const parts=expected.split(':'); if(parts.length!==4||parts[0]!=='pbkdf2'||parts[1]!=='100000')return false;
 const actual=await hashPassword(password,parts[2]); let diff=actual.length^expected.length;
 for(let i=0;i<actual.length;i++)diff|=actual.charCodeAt(i)^(expected.charCodeAt(i)||0); return diff===0;
}
const cookieValue = (request,name) => request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
const cookie = (request,value,age) => `orbit_school=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
export async function schoolUser(request,env) {
 const value=cookieValue(request,'orbit_school'); if(!value)return null;
 if(!/^[a-f0-9]{64}$/.test(value))return null;
 return env.DB.prepare('SELECT u.* FROM school_sessions s JOIN school_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1').bind(await digest(value),Date.now()).first();
}
export function learningRequest(request,user) {
 const headers=new Headers(request.headers);
 for(const name of [...headers.keys()])if(name.startsWith('oai-authenticated-'))headers.delete(name);
 // Retired provider cookies cannot override the school session in legacy modules.
 headers.set('cookie',(headers.get('cookie')||'').split(';').filter(x=>!x.trim().startsWith('orbit_session=')).join(';'));
 if(user){headers.set('oai-authenticated-user-id',user.id);headers.set('oai-authenticated-user-email',`${user.number}@orbit.local`);headers.set('oai-authenticated-user-full-name',encodeURIComponent(`${user.first_name} ${user.last_name}`.trim()));headers.set('oai-authenticated-user-full-name-encoding','percent-encoded-utf-8');}
 return new Request(request,{headers});
}
function text(value,max=200,required=false) {if(typeof value!=='string')fail(400,'Заполните текстовые поля.'); const clean=value.trim();if(clean.length>max||(required&&!clean))fail(400,`Введите текст от ${required?1:0} до ${max} символов.`);return clean;}
function choice(value,values){if(!values.includes(value))fail(400,'Недопустимое значение.');return value;}
export function normalizePhone(value){
 const raw=text(value,40,true);
 if(!/^[+0-9 ()-]+$/.test(raw))fail(400,'Укажите номер телефона с кодом страны, например +998 90 123 45 67.');
 let digits=raw.replace(/[ ()-]/g,'');
 if(!digits.startsWith('+'))digits=digits.length===9?'+998'+digits:digits.startsWith('00')?'+'+digits.slice(2):'+'+digits;
 if(!/^\+[1-9]\d{7,14}$/.test(digits))fail(400,'Укажите номер телефона с кодом страны, например +998 90 123 45 67.');
 return digits;
}
const requireUser = user => {if(!user)fail(401,'Войдите по данным, выданным администрацией.');};
const requireAdmin = user => {requireUser(user);if(user.role!=='admin')fail(403,'Это действие доступно только администрации.');};
const all = async (env,sql,...args) => (await env.DB.prepare(sql).bind(...args).all()).results;
const run = (env,sql,...args) => env.DB.prepare(sql).bind(...args).run();
async function audit(env,user,action,detail){await run(env,'INSERT INTO school_audit VALUES(?,?,?,?,?)',crypto.randomUUID(),user.id,action,detail,Date.now());}
async function groupFor(env,user,id,teach=false){
 requireUser(user);const group=await env.DB.prepare('SELECT g.*,u.first_name AS teacher_first_name,u.last_name AS teacher_last_name FROM school_groups g JOIN school_users u ON u.id=g.teacher_id WHERE g.id=?').bind(id).first();
 if(!group)fail(404,'Группа не найдена.');
 if(user.role==='admin'||(user.role==='teacher'&&group.teacher_id===user.id))return group;
 if(teach)fail(403,'Вы можете вести только свои группы.');
 if(user.role==='student'&&await env.DB.prepare('SELECT 1 FROM school_members WHERE group_id=? AND student_id=?').bind(id,user.id).first())return group;
 fail(403,'Нет доступа к этой группе.');
}
async function member(env,groupId,studentId){const found=await env.DB.prepare("SELECT u.id FROM school_users u JOIN school_members m ON m.student_id=u.id WHERE m.group_id=? AND u.id=? AND u.role='student' AND u.active=1").bind(groupId,studentId).first();if(!found)fail(400,'Ученик не состоит в этой группе.');}
const person = row => ({id:row.id,number:row.number,role:row.role,firstName:row.first_name,lastName:row.last_name,gender:row.gender,bio:row.bio,level:row.level,avatar:row.avatar_id?`/api/school/media/${row.avatar_id}`:null,banner:row.banner_id?`/api/school/media/${row.banner_id}`:null,bannerStyle:row.banner_style,createdAt:row.created_at});
const account = user => ({user:user?{userId:user.id,displayName:`${user.first_name} ${user.last_name}`.trim(),provider:'school',role:user.role}:null,profile:user?{...person(user),name:`${user.first_name} ${user.last_name}`.trim(),phone:user.phone,loginPhone:user.login_phone||null,dailyGoal:3,motion:true,accent:'en-GB'}:null,googleReady:false,schoolVersion:'1.0'});
async function body(request) {if(Number(request.headers.get('content-length'))>2200000)fail(413,'Файл слишком большой.');const raw=await request.text();if(raw.length>2200000)fail(413,'Файл слишком большой.');try{const data=JSON.parse(raw);if(!data||typeof data!=='object'||Array.isArray(data))fail(400,'Некорректные данные.');return data;}catch(error){if(error instanceof Problem)throw error;fail(400,'Некорректный запрос.');}}
const validDate = value => {const clean=text(value,10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(clean)||Number.isNaN(Date.parse(clean))||new Date(clean).toISOString().slice(0,10)!==clean)fail(400,'Укажите дату.');return clean;};
const validScore = value => {if(!Number.isInteger(value)||value<0||value>100)fail(400,'Оценка должна быть от 0 до 100.');return value;};
export async function handleSchool(request,env,user) {
 const path=new URL(request.url).pathname;
 if(!['/api/account','/api/auth/logout','/api/auth/google','/api/auth/google/callback'].includes(path)&&!path.startsWith('/api/school/'))return null;
 try {
  const write=request.method!=='GET'&&request.method!=='HEAD';
  if(write&&request.headers.get('origin')!==new URL(request.url).origin)fail(403,'Недопустимый источник запроса.');
  if(path.startsWith('/api/auth/google'))return json({error:'В ORBIT 1.0 аккаунты создаёт администрация. Google-вход временно приостановлен.'},403);
  if(path==='/api/account') {
   if(request.method==='GET')return json(account(user));
   if(request.method!=='POST')fail(405,'Метод не поддерживается.');requireUser(user); const b=await body(request);
   const first=text(b.firstName,60,true),last=text(b.lastName,60),gender=choice(b.gender,['male','female','unspecified']),level=choice(b.level,levels),style=choice(b.bannerStyle,['blue','violet','mint','sunset']);
   await run(env,'UPDATE school_users SET first_name=?,last_name=?,gender=?,bio=?,level=?,phone=?,banner_style=? WHERE id=?',first,last,gender,text(b.bio,600),level,text(b.phone,40),style,user.id);
   return json({ok:true});
  }
  if(path==='/api/auth/logout') {if(request.method!=='POST')fail(405,'Метод не поддерживается.');await run(env,'DELETE FROM school_sessions WHERE token_hash=?',await digest(cookieValue(request,'orbit_school')));return json({ok:true},200,{'Set-Cookie':cookie(request,'',0)});}
  if(path==='/api/school/login') {
   if(request.method!=='POST')fail(405,'Метод не поддерживается.');const b=await body(request),identifier=text(b.identifier,80,true).toLowerCase(),password=text(b.password,200,true),portal=b.portal===undefined?null:choice(b.portal,['student','staff']);
   const student=portal==='student'||(!portal&&/^[+0-9 ()-]+$/.test(identifier)),identity=student?normalizePhone(identifier):identifier;
   const key=await digest((student?'phone:':'staff:')+identity+'|'+(request.headers.get('cf-connecting-ip')||'local')),now=Date.now();
   await run(env,'DELETE FROM school_login_limits WHERE window_start<?',now-900000);
   const limit=await env.DB.prepare('INSERT INTO school_login_limits(key,attempts,window_start) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(key,now).first();
   if(limit.attempts>10)fail(429,'Слишком много попыток. Попробуйте через 15 минут.');
   const candidate=student?await env.DB.prepare("SELECT * FROM school_users WHERE login_phone=? AND role='student' AND active=1").bind(identity).first():await env.DB.prepare("SELECT * FROM school_users WHERE (login=? COLLATE NOCASE OR number=? COLLATE NOCASE) AND role IN ('teacher','admin') AND active=1").bind(identity,identity).first();
   // Keep password work for unknown logins to avoid a fast username oracle.
   const valid=await verifyPassword(password,candidate?.password_hash||'pbkdf2:100000:00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000');
   if(!candidate||!valid)fail(401,student?'Неверный номер телефона или пароль.':'Неверный логин или пароль.');
   const session=token();await env.DB.batch([env.DB.prepare('DELETE FROM school_login_limits WHERE key=?').bind(key),env.DB.prepare('DELETE FROM school_sessions WHERE expires_at<?').bind(now),env.DB.prepare('INSERT INTO school_sessions VALUES(?,?,?)').bind(await digest(session),candidate.id,now+30*86400000)]);
   return json(account(candidate),200,{'Set-Cookie':cookie(request,session,30*86400)});
  }
  requireUser(user);
  if(path==='/api/school/overview'&&request.method==='GET') {
   const groups=await all(env,`SELECT g.*,u.first_name||' '||u.last_name AS teacher_name,(SELECT count(*) FROM school_members m JOIN school_users s ON s.id=m.student_id AND s.active=1 WHERE m.group_id=g.id) AS student_count FROM school_groups g JOIN school_users u ON u.id=g.teacher_id ${user.role==='admin'?'':user.role==='teacher'?'WHERE g.teacher_id=?':'WHERE g.id IN (SELECT group_id FROM school_members WHERE student_id=?)'} ORDER BY g.created_at DESC`,...(user.role==='admin'?[]:[user.id]));
   const people=user.role==='admin'?await all(env,`SELECT ${pub},login,phone,login_phone,active FROM school_users ORDER BY created_at DESC`):[];
   const auditLog=user.role==='admin'?await all(env,'SELECT a.*,u.first_name AS actor FROM school_audit a JOIN school_users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 15'):[];
   return json({account:account(user),groups,people:people.map(p=>({...person(p),login:p.login,phone:p.phone,loginPhone:p.login_phone||null,active:!!p.active})),audit:auditLog});
  }
  if(path==='/api/school/users'&&request.method==='POST') {
   requireAdmin(user);const b=await body(request),role=choice(b.role,['teacher','student']),id=crypto.randomUUID(),login=role==='student'&&!b.login?'student.'+id:text(b.login,60,true).toLowerCase(),phone=role==='student'?normalizePhone(b.phone):text(b.phone||'',40);
   if(!/^[a-z0-9][a-z0-9._-]{2,59}$/.test(login))fail(400,'Логин: 3–60 латинских букв, цифр, точек, дефисов или подчёркиваний.');
   if(await env.DB.prepare('SELECT 1 FROM school_users WHERE login=?').bind(login).first())fail(409,'Этот логин уже занят.');
   if(role==='student'&&await env.DB.prepare('SELECT 1 FROM school_users WHERE login_phone=?').bind(phone).first())fail(409,'Этот номер уже используется для входа другого ученика.');
   const password=b.password?text(b.password,200,true):token().slice(0,16);if(password.length<8)fail(400,'Пароль должен содержать минимум 8 символов.');
   const number='OR-'+token().slice(0,10).toUpperCase();
   await run(env,'INSERT INTO school_users(id,number,login,password_hash,role,first_name,last_name,gender,level,phone,login_phone,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',id,number,login,await hashPassword(password),role,text(b.firstName,60,true),text(b.lastName||'',60),choice(b.gender||'unspecified',['male','female','unspecified']),choice(b.level||'A1',levels),phone,role==='student'?phone:null,Date.now());
   await audit(env,user,'Аккаунт создан',`${role==='teacher'?'Учитель':'Ученик'}: ${login}`);return json({id,number,login,phone:role==='student'?phone:null,password,role},201);
  }
  const userAction=path.match(/^\/api\/school\/users\/([^/]+)\/(reset|status|phone)$/);
  if(userAction&&request.method==='POST') {
   requireAdmin(user);const target=await env.DB.prepare('SELECT * FROM school_users WHERE id=?').bind(userAction[1]).first();if(!target)fail(404,'Аккаунт не найден.');const b=await body(request);
   if(userAction[2]==='phone'){
    if(target.role!=='student')fail(400,'Номер для входа назначается только ученикам.');
    const phone=normalizePhone(b.phone);
    if(await env.DB.prepare('SELECT 1 FROM school_users WHERE login_phone=? AND id<>?').bind(phone,target.id).first())fail(409,'Этот номер уже используется для входа другого ученика.');
    if(phone!==target.login_phone){await env.DB.batch([env.DB.prepare('UPDATE school_users SET login_phone=?,phone=? WHERE id=?').bind(phone,phone,target.id),env.DB.prepare('DELETE FROM school_sessions WHERE user_id=?').bind(target.id)]);await audit(env,user,'Номер для входа изменён',target.login);}
    return json({ok:true,phone});
   }
   if(userAction[2]==='status') {if(target.role==='admin')fail(400,'Аккаунт администрации нельзя отключить.');if(typeof b.active!=='boolean')fail(400,'Укажите статус.');await env.DB.batch([env.DB.prepare('UPDATE school_users SET active=? WHERE id=?').bind(b.active?1:0,target.id),env.DB.prepare('DELETE FROM school_sessions WHERE user_id=?').bind(target.id)]);await audit(env,user,b.active?'Аккаунт включён':'Аккаунт отключён',target.login);return json({ok:true});}
   const password=token().slice(0,16);await env.DB.batch([env.DB.prepare('UPDATE school_users SET password_hash=? WHERE id=?').bind(await hashPassword(password),target.id),env.DB.prepare('DELETE FROM school_sessions WHERE user_id=?').bind(target.id)]);await audit(env,user,'Пароль сброшен',target.login);return json({login:target.login,number:target.number,phone:target.role==='student'?target.login_phone:null,password,role:target.role});
  }
  if(path==='/api/school/groups'&&request.method==='POST') {
   requireAdmin(user);const b=await body(request),teacherId=text(b.teacherId,80,true);if(!await env.DB.prepare("SELECT 1 FROM school_users WHERE id=? AND role='teacher' AND active=1").bind(teacherId).first())fail(400,'Выберите активного учителя.');
   const id=crypto.randomUUID();await run(env,'INSERT INTO school_groups VALUES(?,?,?,?,?,?,?)',id,text(b.name,80,true),choice(b.level,levels),teacherId,text(b.schedule||'',160),text(b.room||'',80),Date.now());await audit(env,user,'Группа создана',text(b.name,80,true));return json({id},201);
  }
  const groupMatch=path.match(/^\/api\/school\/groups\/([^/]+)(?:\/(members|settings))?$/);
  if(groupMatch) {
   const group=await groupFor(env,user,groupMatch[1]);
   if(request.method==='POST'&&groupMatch[2]==='settings') {requireAdmin(user);const b=await body(request);if(!await env.DB.prepare("SELECT 1 FROM school_users WHERE id=? AND role='teacher' AND active=1").bind(b.teacherId).first())fail(400,'Выберите учителя.');await run(env,'UPDATE school_groups SET name=?,level=?,teacher_id=?,schedule=?,room=? WHERE id=?',text(b.name,80,true),choice(b.level,levels),b.teacherId,text(b.schedule||'',160),text(b.room||'',80),group.id);await audit(env,user,'Группа изменена',group.name);return json({ok:true});}
   if(request.method==='POST'&&groupMatch[2]==='members') {requireAdmin(user);const b=await body(request);if(!Array.isArray(b.studentIds)||b.studentIds.length>200||new Set(b.studentIds).size!==b.studentIds.length)fail(400,'Некорректный список учеников.');for(const id of b.studentIds)if(typeof id!=='string'||!await env.DB.prepare("SELECT 1 FROM school_users WHERE id=? AND role='student' AND active=1").bind(id).first())fail(400,'Выберите активных учеников.');await env.DB.batch([env.DB.prepare('DELETE FROM school_members WHERE group_id=?').bind(group.id),...b.studentIds.map(id=>env.DB.prepare('INSERT INTO school_members VALUES(?,?,?)').bind(group.id,id,Date.now()))]);await audit(env,user,'Состав группы изменён',`${group.name}: ${b.studentIds.length} учеников`);return json({ok:true});}
   if(request.method==='GET'&&!groupMatch[2]) {
    const students=await all(env,`SELECT ${pub.split(',').map(c=>'u.'+c).join(',')} FROM school_users u JOIN school_members m ON m.student_id=u.id WHERE m.group_id=? AND u.active=1 ORDER BY u.last_name,u.first_name`,group.id);
    const lessons=await all(env,'SELECT * FROM school_lessons WHERE group_id=? ORDER BY date DESC,created_at DESC',group.id);
    const attendance=await all(env,`SELECT a.* FROM school_attendance a JOIN school_lessons l ON l.id=a.lesson_id WHERE l.group_id=? ${user.role==='student'?'AND a.student_id=?':''}`,group.id,...(user.role==='student'?[user.id]:[]));
    const marks=await all(env,`SELECT m.* FROM school_marks m JOIN school_lessons l ON l.id=m.lesson_id WHERE l.group_id=? ${user.role==='student'?'AND m.student_id=?':''}`,group.id,...(user.role==='student'?[user.id]:[]));
    const assignments=await all(env,'SELECT * FROM school_assignments WHERE group_id=? ORDER BY due_at DESC',group.id);
    const submissions=await all(env,`SELECT s.* FROM school_submissions s JOIN school_assignments a ON a.id=s.assignment_id WHERE a.group_id=? ${user.role==='student'?'AND s.student_id=?':''}`,group.id,...(user.role==='student'?[user.id]:[]));
    return json({group,students:students.map(person),lessons,attendance,marks,assignments:assignments.map(a=>({...a,checklist:JSON.parse(a.checklist)})),submissions:submissions.map(s=>({...s,completed:JSON.parse(s.completed)}))});
   }
  }
  if(path==='/api/school/lessons'&&request.method==='POST') {const b=await body(request);await groupFor(env,user,b.groupId,true);const id=crypto.randomUUID();await run(env,'INSERT INTO school_lessons VALUES(?,?,?,?,?,?)',id,b.groupId,validDate(b.date),text(b.title,160,true),user.id,Date.now());return json({id},201);}
  const lessonMatch=path.match(/^\/api\/school\/lessons\/([^/]+)\/(attendance|marks)$/);
  if(lessonMatch&&request.method==='POST') {
   const lesson=await env.DB.prepare('SELECT * FROM school_lessons WHERE id=?').bind(lessonMatch[1]).first();if(!lesson)fail(404,'Занятие не найдено.');await groupFor(env,user,lesson.group_id,true);const b=await body(request);
   if(!Array.isArray(b.rows)||b.rows.length>200)fail(400,'Некорректный журнал.');const statements=[];
   for(const row of b.rows){await member(env,lesson.group_id,row.studentId);if(lessonMatch[2]==='attendance'){if(row.status==='unmarked')statements.push(env.DB.prepare('DELETE FROM school_attendance WHERE lesson_id=? AND student_id=?').bind(lesson.id,row.studentId));else statements.push(env.DB.prepare('INSERT INTO school_attendance VALUES(?,?,?,?,?,?) ON CONFLICT(lesson_id,student_id) DO UPDATE SET status=excluded.status,note=excluded.note,updated_by=excluded.updated_by,updated_at=excluded.updated_at').bind(lesson.id,row.studentId,choice(row.status,['present','absent','late','excused']),text(row.note||'',300),user.id,Date.now()));}else statements.push(env.DB.prepare('INSERT INTO school_marks VALUES(?,?,?,?,?,?,?) ON CONFLICT(lesson_id,student_id,skill) DO UPDATE SET score=excluded.score,comment=excluded.comment,updated_by=excluded.updated_by,updated_at=excluded.updated_at').bind(lesson.id,row.studentId,choice(row.skill,['general',...skills]),validScore(row.score),text(row.comment||'',600),user.id,Date.now()));}
   if(statements.length)await env.DB.batch(statements);return json({ok:true});
  }
  if(path==='/api/school/assignments'&&request.method==='POST') {const b=await body(request);await groupFor(env,user,b.groupId,true);if(!Array.isArray(b.checklist)||b.checklist.length<1||b.checklist.length>20)fail(400,'Добавьте от 1 до 20 шагов задания.');const checklist=b.checklist.map(x=>text(x,200,true));const id=crypto.randomUUID();await run(env,'INSERT INTO school_assignments VALUES(?,?,?,?,?,?,?,?,?)',id,b.groupId,text(b.title,160,true),text(b.instructions,6000,true),JSON.stringify(checklist),choice(b.skill,['general',...skills]),validDate(b.dueAt),user.id,Date.now());return json({id},201);}
  const submitMatch=path.match(/^\/api\/school\/assignments\/([^/]+)\/(submit|review)$/);
  if(submitMatch&&request.method==='POST') {
   const a=await env.DB.prepare('SELECT * FROM school_assignments WHERE id=?').bind(submitMatch[1]).first();if(!a)fail(404,'Задание не найдено.');const b=await body(request);
   if(submitMatch[2]==='submit') {
    if(user.role!=='student')fail(403,'Работу отправляет ученик.');await groupFor(env,user,a.group_id);await member(env,a.group_id,user.id);
    const previous=await env.DB.prepare('SELECT status FROM school_submissions WHERE assignment_id=? AND student_id=?').bind(a.id,user.id).first();if(previous&&['submitted','reviewed'].includes(previous.status))fail(409,'Работа уже отправлена. Изменить её можно после возврата учителем.');
    const checklist=JSON.parse(a.checklist);if(!Array.isArray(b.completed)||b.completed.length>checklist.length||new Set(b.completed).size!==b.completed.length||b.completed.some(n=>!Number.isInteger(n)||n<0||n>=checklist.length))fail(400,'Некорректные шаги задания.');const answer=text(b.answer,12000),status=choice(b.status,['draft','submitted']);if(status==='submitted'&&(!answer||b.completed.length!==checklist.length))fail(400,'Выполните все шаги и добавьте ответ перед отправкой.');
    await run(env,'INSERT INTO school_submissions(assignment_id,student_id,answer,completed,status,submitted_at,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(assignment_id,student_id) DO UPDATE SET answer=excluded.answer,completed=excluded.completed,status=excluded.status,score=NULL,feedback=\'\',submitted_at=excluded.submitted_at,reviewed_by=NULL,updated_at=excluded.updated_at',a.id,user.id,answer,JSON.stringify(b.completed),status,status==='submitted'?Date.now():null,Date.now());return json({ok:true});
   }
   await groupFor(env,user,a.group_id,true);await member(env,a.group_id,b.studentId);const previous=await env.DB.prepare('SELECT status FROM school_submissions WHERE assignment_id=? AND student_id=?').bind(a.id,b.studentId).first();if(!previous||!['submitted','reviewed'].includes(previous.status))fail(409,'Ученик ещё не отправил работу.');const status=choice(b.status,['reviewed','returned']),feedback=text(b.feedback||'',2000);if(status==='returned'&&!feedback)fail(400,'Объясните, что нужно доработать.');await run(env,'UPDATE school_submissions SET status=?,score=?,feedback=?,reviewed_by=?,updated_at=? WHERE assignment_id=? AND student_id=?',status,status==='reviewed'?validScore(b.score):null,feedback,user.id,Date.now(),a.id,b.studentId);return json({ok:true});
  }
  if(path==='/api/school/skills'&&request.method==='POST') {const b=await body(request);requireUser(user);if(user.role==='student')fail(403,'Уровень навыка подтверждает учитель.');if(!await env.DB.prepare("SELECT 1 FROM school_users WHERE id=? AND role='student' AND active=1").bind(b.studentId).first())fail(404,'Ученик не найден.');if(user.role==='teacher'&&!await env.DB.prepare('SELECT 1 FROM school_members m JOIN school_groups g ON g.id=m.group_id WHERE m.student_id=? AND g.teacher_id=?').bind(b.studentId,user.id).first())fail(403,'Это ученик другого учителя.');await run(env,'INSERT INTO school_skill_levels VALUES(?,?,?,?,?) ON CONFLICT(user_id,skill) DO UPDATE SET level=excluded.level,assessed_by=excluded.assessed_by,updated_at=excluded.updated_at',b.studentId,choice(b.skill,skills),choice(b.level,levels),user.id,Date.now());return json({ok:true});}
  if(path==='/api/school/people'&&request.method==='GET')return json({people:(await all(env,`SELECT ${pub} FROM school_users WHERE active=1 ORDER BY role,last_name,first_name`)).map(person)});
  const profileMatch=path.match(/^\/api\/school\/people\/([^/]+)$/);
  if(profileMatch&&request.method==='GET') {
   const target=await env.DB.prepare(`SELECT ${pub} FROM school_users WHERE id=? AND active=1`).bind(profileMatch[1]).first();if(!target)fail(404,'Профиль не найден.');
   const assessed=await all(env,'SELECT skill,level,updated_at FROM school_skill_levels WHERE user_id=?',target.id);
   const practice=await all(env,'SELECT kind,COUNT(*) AS count,ROUND(100.0*SUM(score)/SUM(total)) AS accuracy FROM sessions WHERE user_id=? GROUP BY kind',target.id);
   const totals=await env.DB.prepare("SELECT (SELECT count(*) FROM sessions WHERE user_id=?) AS practice,(SELECT count(*) FROM school_submissions WHERE student_id=? AND status='reviewed') AS homework,(SELECT count(*) FROM school_attendance WHERE student_id=? AND status IN ('present','late')) AS attended").bind(target.id,target.id,target.id).first();
   const achievements=[];if(totals.practice)achievements.push({name:'Первый шаг',detail:'Первое сохранённое упражнение',icon:'↗'});if(totals.practice>=10)achievements.push({name:'В своём ритме',detail:'10 упражнений завершено',icon:'✦'});if(totals.homework)achievements.push({name:'Работа принята',detail:'Первое проверенное домашнее задание',icon:'✓'});if(totals.homework>=5)achievements.push({name:'Держу темп',detail:'5 домашних заданий проверено',icon:'◈'});if(totals.attended>=10)achievements.push({name:'В центре событий',detail:'10 занятий посещено',icon:'◎'});
   const canAssess=target.role==='student'&&(user.role==='admin'||(user.role==='teacher'&&!!await env.DB.prepare('SELECT 1 FROM school_members m JOIN school_groups g ON g.id=m.group_id WHERE m.student_id=? AND g.teacher_id=?').bind(target.id,user.id).first()));
   return json({person:person(target),assessed,practice,totals,achievements,canAssess});
  }
  if(path==='/api/school/media'&&request.method==='POST') {
   const b=await body(request),kind=choice(b.kind,['avatar','banner']);const match=typeof b.data==='string'&&b.data.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);if(!match)fail(400,'Загрузите PNG, JPEG или WebP.');let binary;try{binary=atob(match[2]);}catch{fail(400,'Некорректный файл.');}if(binary.length>1500000||binary.length<16)fail(413,'Изображение должно быть размером до 1,5 МБ.');
   const valid=match[1]==='image/png'?binary.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='image/jpeg'?binary.startsWith('\xff\xd8\xff'):binary.startsWith('RIFF')&&binary.slice(8,12)==='WEBP';if(!valid)fail(400,'Файл не соответствует формату изображения.');
   const id=crypto.randomUUID(),field=kind==='avatar'?'avatar_id':'banner_id',old=user[field];await env.DB.batch([env.DB.prepare('INSERT INTO school_media VALUES(?,?,?,?,?,?)').bind(id,user.id,kind,match[1],match[2],Date.now()),env.DB.prepare(`UPDATE school_users SET ${field}=? WHERE id=?`).bind(id,user.id),...(old?[env.DB.prepare('DELETE FROM school_media WHERE id=? AND owner_id=?').bind(old,user.id)]:[])]);return json({url:`/api/school/media/${id}`},201);
  }
  const mediaMatch=path.match(/^\/api\/school\/media\/([^/]+)$/);
  if(mediaMatch&&request.method==='GET') {const row=await env.DB.prepare('SELECT m.* FROM school_media m JOIN school_users u ON u.id=m.owner_id AND u.active=1 WHERE m.id=?').bind(mediaMatch[1]).first();if(!row)fail(404,'Изображение не найдено.');return new Response(Uint8Array.from(atob(row.data),c=>c.charCodeAt(0)),{headers:{'Content-Type':row.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
  if(path==='/api/school/media'&&request.method==='DELETE') {const b=await body(request),kind=choice(b.kind,['avatar','banner']),field=kind==='avatar'?'avatar_id':'banner_id';await env.DB.batch([env.DB.prepare('DELETE FROM school_media WHERE owner_id=? AND kind=?').bind(user.id,kind),env.DB.prepare(`UPDATE school_users SET ${field}=NULL WHERE id=?`).bind(user.id)]);return json({ok:true});}
  fail(404,'Раздел не найден.');
 }catch(error){if(error instanceof Problem)return json({error:error.message},error.status);if(error.message?.includes('UNIQUE constraint failed: school_users.login_phone'))return json({error:'Этот номер уже используется для входа другого ученика.'},409);console.error('School request failed:',error.message);return json({error:'Не удалось выполнить запрос. Попробуйте снова.'},503);}
}
