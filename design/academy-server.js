import {verifyPassword} from './school-server.js';

const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
const all=async(env,sql,...args)=>(await env.DB.prepare(sql).bind(...args).all()).results;
const first=(env,sql,...args)=>env.DB.prepare(sql).bind(...args).first();
const run=(env,sql,...args)=>env.DB.prepare(sql).bind(...args).run();
class Fault extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new Fault(status,message);};
const text=(v,max=200,required=true)=>{if(typeof v!=='string'||v.trim().length>max||(required&&!v.trim()))fail(400,'Проверьте текстовые поля.');return v.trim();};
const one=(v,list)=>{if(!list.includes(v))fail(400,'Недопустимое значение.');return v;};
const admin=u=>{if(u.role!=='admin')fail(403,'Раздел администрации.');};
const staff=u=>{if(u.role==='student')fail(403,'Раздел сотрудников.');};
const person=p=>({id:p.id,firstName:p.first_name,lastName:p.last_name,role:p.role,level:p.level,number:p.number,avatar:p.avatar_id?'/api/school/media/'+p.avatar_id:null,gender:p.gender});
const date=v=>{if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v)fail(400,'Укажите корректную дату.');return v;};
const secureLink=v=>{if(!v)return '';let url;try{url=new URL(text(v,2000));}catch{fail(400,'Укажите HTTPS-ссылку.');}if(url.protocol!=='https:')fail(400,'Укажите HTTPS-ссылку.');return url.href;};
async function groupAccess(env,u,id){
 const g=await first(env,'SELECT * FROM school_groups WHERE id=?',id);
 if(!g)fail(404,'Группа не найдена.');
 if(u.role==='admin'||u.role==='teacher'&&g.teacher_id===u.id)return g;
 if(u.role==='student'&&await first(env,'SELECT 1 FROM school_members WHERE group_id=? AND student_id=?',id,u.id))return g;
 fail(403,'Нет доступа к группе.');
}
async function audit(env,u,action,detail){await run(env,'INSERT INTO school_audit VALUES(?,?,?,?,?)',crypto.randomUUID(),u.id,action,detail,Date.now());}
async function limit(env,key,max,ms){
 const now=Date.now();
 const value=await first(env,'INSERT INTO campus_action_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN window_start<? THEN 1 ELSE attempts+1 END,window_start=CASE WHEN window_start<? THEN excluded.window_start ELSE window_start END RETURNING attempts',key,now,now-ms,now-ms);
 if(value.attempts>max)fail(429,'Слишком много попыток. Попробуйте позже.');
}

// A solved question is counted once. Practice games, self-reported checkboxes and
// historical teacher grades never enter the new homework score or wallet.
export const scoreCTE=`WITH work AS (SELECT student_id,SUM(percent) AS xp,SUM(CAST(percent/5 AS INTEGER)) AS earned,ROUND(AVG(percent)) AS average,SUM(CASE WHEN percent=100 THEN 1 ELSE 0 END) AS completed FROM navigate_scores WHERE kind='homework' GROUP BY student_id),
 grants AS (SELECT student_id,SUM(amount) AS earned FROM (SELECT student_id,amount FROM campus_coin_grants UNION ALL SELECT user_id AS student_id,amount FROM campus_wallet_openings) GROUP BY student_id),
 spent AS (SELECT user_id,SUM(cost) AS amount FROM campus_orders WHERE status!='cancelled' GROUP BY user_id)`;
export async function academyMetrics(env,userId){
 const value=await first(env,`${scoreCTE} SELECT COALESCE(w.xp,0) AS xp,COALESCE(w.earned,0)+COALESCE(g.earned,0) AS earned,MAX(0,COALESCE(w.earned,0)+COALESCE(g.earned,0)-COALESCE(s.amount,0)) AS coins,w.average,COALESCE(w.completed,0) AS completed FROM school_users u LEFT JOIN work w ON w.student_id=u.id LEFT JOIN grants g ON g.student_id=u.id LEFT JOIN spent s ON s.user_id=u.id WHERE u.id=?`,userId);
 const rows=await all(env,"SELECT p.step_index,u.steps FROM navigate_progress p JOIN navigate_units u ON u.id=p.unit_id WHERE p.student_id=? AND p.kind='homework'",userId);
 const totals=await all(env,"SELECT DISTINCT u.id,u.steps FROM navigate_units u JOIN navigate_assignments a ON a.unit_id=u.id JOIN school_members m ON m.group_id=a.group_id WHERE m.student_id=? AND a.kind='homework'",userId);
 const skills={};for(const skill of ['vocabulary','grammar','listening','reading','writing','speaking']){let done=0,total=0;for(const row of totals)for(const step of JSON.parse(row.steps))if(step.skill===skill)total+=step.questions.length;for(const row of rows)if(JSON.parse(row.steps)[row.step_index]?.skill===skill)done++;skills[skill]=total?Math.min(100,Math.floor(done/total*100)):null;}
 return {...value,skills};
}
export async function academyRanking(env,{level='',groupId=null}={}){
 return (await all(env,`${scoreCTE} SELECT u.*,COALESCE(w.xp,0) AS xp,MAX(0,COALESCE(w.earned,0)+COALESCE(g.earned,0)-COALESCE(s.amount,0)) AS coins,w.average,COALESCE(w.completed,0) AS completed FROM school_users u LEFT JOIN work w ON w.student_id=u.id LEFT JOIN grants g ON g.student_id=u.id LEFT JOIN spent s ON s.user_id=u.id WHERE u.role='student' AND u.active=1 ${level?'AND u.level=?':''} ${groupId?'AND EXISTS(SELECT 1 FROM school_members m WHERE m.student_id=u.id AND m.group_id=?)':''} ORDER BY xp DESC,u.number LIMIT 1000`,...(level?[level]:[]),...(groupId?[groupId]:[]))).map((p,i)=>({...person(p),xp:p.xp,coins:p.coins,average:p.average,completed:p.completed,rank:i+1}));
}
async function groupRanks(env){
 return (await all(env,`SELECT g.id,g.name,g.level,g.room,COUNT(DISTINCT m.student_id) AS students,COALESCE(ROUND(AVG(COALESCE(s.percent,0))),0) AS progress FROM school_groups g LEFT JOIN school_members m ON m.group_id=g.id AND m.student_id IN (SELECT id FROM school_users WHERE active=1) LEFT JOIN navigate_assignments a ON a.group_id=g.id AND a.kind='homework' LEFT JOIN navigate_scores s ON s.unit_id=a.unit_id AND s.student_id=m.student_id AND s.kind='homework' GROUP BY g.id ORDER BY progress DESC,g.name`)).map((g,i)=>({...g,rank:i+1}));
}
function validateSteps(raw,published){
 if(!Array.isArray(raw)||raw.length>8)fail(400,'Добавьте до 8 этапов.');
 const steps=raw.map(s=>{
  if(!s||typeof s!=='object')fail(400,'Проверьте этапы юнита.');
  const type=one(s.type,['vocabulary','video','practice','listening','reading']);
  if(!Array.isArray(s.questions)||s.questions.length>40)fail(400,'В этапе должно быть до 40 вопросов.');
  const questions=s.questions.map(q=>{
   if(!q||typeof q!=='object')fail(400,'Проверьте вопросы юнита.');
   if(!Array.isArray(q.options)||q.options.length<2||q.options.length>6||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)fail(400,'Для вопроса нужны 2–6 вариантов и правильный ответ.');
   const options=q.options.map(v=>text(v,500));if(new Set(options.map(v=>v.toLowerCase())).size!==options.length)fail(400,'Варианты ответа должны различаться.');
   return {prompt:text(q.prompt,1500),options,answer:q.answer,explanation:text(q.explanation||'',1500,false)};
  });
  return {type,skill:one(s.skill||({video:'listening',practice:'grammar'}[type]||type),['vocabulary','grammar','listening','reading','writing','speaking']),title:text(s.title,160),instructions:text(s.instructions||'',6000,false),mediaUrl:secureLink(s.mediaUrl||''),questions};
 });
 if(published&&(steps.length<3||steps[0].type!=='vocabulary'||steps[1].type!=='video'||!steps.some(s=>s.type==='practice')||steps.some(s=>!s.questions.length)||!steps[1].mediaUrl))fail(400,'Для публикации нужны Vocabulary → Video lesson → Practice, вопросы на каждом этапе и ссылка на видео.');
 return steps;
}
async function assignmentsFor(env,u){
 return all(env,`SELECT a.*,u.level,u.code,u.title,u.status,u.total_questions,g.name AS group_name FROM navigate_assignments a JOIN navigate_units u ON u.id=a.unit_id JOIN school_groups g ON g.id=a.group_id WHERE ${u.role==='admin'?'1=1':u.role==='teacher'?'g.teacher_id=?':"u.level=? AND g.level=u.level AND EXISTS(SELECT 1 FROM school_members m WHERE m.group_id=g.id AND m.student_id=?)"} ORDER BY a.lesson_date DESC,a.created_at DESC`,...(u.role==='admin'?[]:u.role==='teacher'?[u.id]:[u.level,u.id]));
}
async function unitForStudent(env,u,assignmentId){
 const a=await first(env,'SELECT a.*,n.steps,n.total_questions,n.title,n.code,n.level,n.status FROM navigate_assignments a JOIN navigate_units n ON n.id=a.unit_id WHERE a.id=?',assignmentId);
 if(!a)fail(404,'Задание не найдено.');const g=await groupAccess(env,u,a.group_id);
 if(u.role==='student'&&(a.status!=='published'||a.level!==u.level||g.level!==u.level))fail(403,'Этот юнит не назначен на ваш уровень.');
 return a;
}
export async function handleAcademy(request,env,user){
 const url=new URL(request.url),path=url.pathname;if(!path.startsWith('/api/academy/'))return null;
 try{
  if(!user)fail(401,'Войдите в свой аккаунт.');
  const write=!['GET','HEAD'].includes(request.method);
  if(write&&request.headers.get('origin')!==url.origin)fail(403,'Недопустимый источник запроса.');
  let b={};if(write){const raw=await request.text();if(raw.length>180000)fail(413,'Запрос слишком большой.');try{b=JSON.parse(raw);}catch{fail(400,'Некорректный запрос.');}if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'Некорректный запрос.');}
  const now=Date.now();
  if(path==='/api/academy/overview'&&request.method==='GET'){
   const groupsRequest=all(env,`SELECT g.*,(SELECT COUNT(*) FROM school_members m JOIN school_users s ON s.id=m.student_id WHERE m.group_id=g.id AND s.active=1) AS student_count FROM school_groups g ${user.role==='admin'?'':user.role==='teacher'?'WHERE g.teacher_id=?':'WHERE id IN (SELECT group_id FROM school_members WHERE student_id=?)'} ORDER BY name`,...(user.role==='admin'?[]:[user.id]));
   const assignmentsRequest=assignmentsFor(env,user),progressRequest=user.role==='student'?all(env,'SELECT * FROM navigate_scores WHERE student_id=?',user.id):Promise.resolve([]);
   const unitsRequest=all(env,`SELECT id,level,code,position,title,edition,status,total_questions FROM navigate_units ${user.role==='student'?'WHERE level=?':''} ORDER BY level,position`,...(user.role==='student'?[user.level]:[]));
   const studentsRequest=user.role==='student'?Promise.resolve([]):all(env,`SELECT DISTINCT u.*,f.status AS flag,f.note AS flag_note FROM school_users u LEFT JOIN campus_student_flags f ON f.student_id=u.id WHERE u.role='student' ${user.role==='teacher'?'AND EXISTS(SELECT 1 FROM school_members m JOIN school_groups g ON g.id=m.group_id WHERE m.student_id=u.id AND g.teacher_id=?)':''} ORDER BY u.last_name,u.first_name`,...(user.role==='teacher'?[user.id]:[]));
   const absentRequest=user.role==='student'?Promise.resolve([]):all(env,`SELECT DISTINCT a.student_id FROM school_attendance a JOIN school_lessons l ON l.id=a.lesson_id JOIN school_groups g ON g.id=l.group_id WHERE a.status='absent' AND l.date=? ${user.role==='teacher'?'AND g.teacher_id=?':''}`,new Date(now+5*3600000).toISOString().slice(0,10),...(user.role==='teacher'?[user.id]:[]));
   const [groups,assignments,progress,units,students,absent]=await Promise.all([groupsRequest,assignmentsRequest,progressRequest,unitsRequest,studentsRequest,absentRequest]);
   const counts={active:students.filter(s=>s.active&&(!s.flag||s.flag==='active')).length,new:students.filter(s=>s.active&&s.created_at>now-7*86400000).length,lost:students.filter(s=>s.flag==='lost').length,potential:students.filter(s=>s.flag==='potential').length,absent:absent.length,red:students.filter(s=>s.flag==='red').length,black:students.filter(s=>s.flag==='black').length};
   const adminData=user.role==='admin'?{
    counts:await first(env,"SELECT COUNT(*) AS people,SUM(role='student' AND active=1) AS students,SUM(role='teacher' AND active=1) AS teachers,(SELECT COUNT(*) FROM navigate_units WHERE status='published') AS published,(SELECT COUNT(*) FROM campus_resources) AS resources FROM school_users"),
    audit:await all(env,'SELECT a.*,u.first_name||\' \'||u.last_name AS actor FROM school_audit a JOIN school_users u ON u.id=a.actor_id ORDER BY a.created_at DESC LIMIT 50'),
    health:await first(env,'SELECT (SELECT COUNT(*) FROM school_groups) AS groups,(SELECT COUNT(*) FROM navigate_units) AS units,(SELECT COUNT(*) FROM navigate_assignments) AS assignments,(SELECT COUNT(*) FROM navigate_progress) AS solved,(SELECT COUNT(*) FROM campus_coin_grants) AS grants')
   }:null;
   const summaries=user.role==='student'?[]:await all(env,`SELECT a.id AS assignment_id,COUNT(CASE WHEN s.percent=100 THEN 1 END) AS done FROM navigate_assignments a JOIN school_groups g ON g.id=a.group_id JOIN school_members m ON m.group_id=g.id JOIN school_users u ON u.id=m.student_id AND u.active=1 LEFT JOIN navigate_scores s ON s.student_id=m.student_id AND s.unit_id=a.unit_id AND s.kind=a.kind WHERE ${user.role==='admin'?'1=1':'g.teacher_id=?'} GROUP BY a.id`,...(user.role==='admin'?[]:[user.id]));
   return json({groups,units,assignments,progress,summaries,newIds:students.filter(s=>s.active&&s.created_at>now-7*86400000).map(s=>s.id),absentIds:absent.map(s=>s.student_id),students:students.map(s=>({...person(s),active:!!s.active,flag:s.flag||'active',flagNote:s.flag_note||''})),counts,groupRanking:await groupRanks(env),admin:adminData});
  }
  if(path==='/api/academy/units'&&request.method==='POST'){
   admin(user);const level=one(b.level,['A1','A2','B1']),code=text(b.code,12);if(!/^\d{1,2}\.\d{1,2}$/.test(code))fail(400,'Номер юнита: например 1.1.');
   const id=level+'-'+code;if(await first(env,'SELECT 1 FROM navigate_units WHERE id=?',id))fail(409,'Такой юнит уже есть.');
   await run(env,'INSERT INTO navigate_units(id,level,code,position,title,updated_at) VALUES(?,?,?,?,?,?)',id,level,code,Number(code.split('.')[0])*10+Number(code.split('.')[1]),text(b.title,160),now);return json({id},201);
  }
  const unit=path.match(/^\/api\/academy\/units\/([^/]+)$/);
  if(unit){
   staff(user);const n=await first(env,'SELECT * FROM navigate_units WHERE id=?',unit[1]);if(!n)fail(404,'Юнит не найден.');
   if(request.method==='GET')return json({...n,steps:JSON.parse(n.steps)});
   if(request.method==='POST'){
    admin(user);if(await first(env,'SELECT 1 FROM navigate_assignments WHERE unit_id=?',n.id))fail(409,'Выданный юнит зафиксирован. Создайте новый юнит для обновлённого материала.');
    const status=one(b.status,['draft','published']),steps=validateSteps(b.steps,status==='published');
    const edition=text(b.edition||'',160,false);if(status==='published'&&!edition)fail(400,'Укажите издание или источник материалов.');
    const saved=await run(env,'UPDATE navigate_units SET title=?,edition=?,status=?,steps=?,total_questions=?,updated_at=? WHERE id=? AND NOT EXISTS(SELECT 1 FROM navigate_assignments WHERE unit_id=?)',text(b.title,160),edition,status,JSON.stringify(steps),steps.reduce((n,s)=>n+s.questions.length,0),now,n.id,n.id);
    if(!saved.meta.changes)fail(409,'Юнит уже выдан группе и зафиксирован.');
    await audit(env,user,status==='published'?'Юнит опубликован':'Юнит сохранён',n.id);return json({ok:true});
   }
  }
  if(path==='/api/academy/assign'&&request.method==='POST'){
   staff(user);const g=await groupAccess(env,user,text(b.groupId,80)),n=await first(env,"SELECT * FROM navigate_units WHERE id=? AND status='published'",text(b.unitId,80));
   if(!n)fail(400,'Сначала опубликуйте материалы юнита.');if(n.level!==g.level)fail(400,'Уровень юнита должен совпадать с уровнем группы.');
   const lessonDate=date(b.lessonDate),due=date(b.dueAt);if(due<lessonDate)fail(400,'Срок домашки должен быть не раньше занятия.');const kind=one(b.kind||'homework',['homework','exam']);
   if(await first(env,'SELECT 1 FROM navigate_assignments WHERE group_id=? AND unit_id=? AND kind=?',g.id,n.id,kind))fail(409,'Этот юнит уже назначен группе.');
   const id=crypto.randomUUID(),saved=await run(env,'INSERT INTO navigate_assignments VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(group_id,unit_id,kind) DO NOTHING',id,g.id,n.id,kind,lessonDate,due,user.id,now);if(!saved.meta.changes)fail(409,'Этот юнит уже назначен группе.');await audit(env,user,kind==='exam'?'Назначен экзамен':'Назначена домашка',g.name+' · '+n.id);return json({id},201);
  }
  const learning=path.match(/^\/api\/academy\/learning\/([^/]+)(?:\/(answer))?$/);
  if(learning){
   const a=await unitForStudent(env,user,learning[1]),steps=JSON.parse(a.steps);
   if(request.method==='GET'&&!learning[2]){
    const done=await all(env,'SELECT step_index,question_index FROM navigate_progress WHERE student_id=? AND unit_id=? AND kind=?',user.id,a.unit_id,a.kind);
    return json({assignment:a.id,title:a.title,code:a.code,kind:a.kind,total:a.total_questions,done,steps:steps.map(s=>({...s,questions:s.questions.map(({answer,explanation,...q})=>q)}))});
   }
   if(request.method==='POST'&&learning[2]){
    if(user.role!=='student')fail(403,'Задания выполняют ученики.');await limit(env,'answer:'+user.id,120,60000);
    const si=b.step,qi=b.question;if(!Number.isInteger(si)||!Number.isInteger(qi)||!steps[si]?.questions[qi])fail(400,'Вопрос не найден.');
    const previous=await first(env,'SELECT COUNT(*) AS n FROM navigate_progress WHERE student_id=? AND unit_id=? AND kind=? AND step_index<?',user.id,a.unit_id,a.kind,si);
    if(previous.n!==steps.slice(0,si).reduce((n,s)=>n+s.questions.length,0))fail(409,'Сначала завершите предыдущие этапы.');
    const q=steps[si].questions[qi];if(!Number.isInteger(b.answer)||b.answer<0||b.answer>=q.options.length)fail(400,'Выберите вариант ответа.');
    const correct=b.answer===q.answer;
    if(correct)await run(env,'INSERT INTO navigate_progress VALUES(?,?,?,?,?,?) ON CONFLICT DO NOTHING',user.id,a.unit_id,a.kind,si,qi,now);
    const progress=await first(env,'SELECT * FROM navigate_scores WHERE student_id=? AND unit_id=? AND kind=?',user.id,a.unit_id,a.kind);
    return json({correct,explanation:correct?q.explanation:'Попробуйте ещё раз. Вернитесь к материалу этапа.',progress:progress?.percent||0});
   }
  }
  if(path==='/api/academy/journal'&&request.method==='GET'){
   const g=await groupAccess(env,user,text(url.searchParams.get('groupId'),80)),month=text(url.searchParams.get('month'),7);if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))fail(400,'Укажите месяц.');
   const people=await all(env,`SELECT u.* FROM school_users u JOIN school_members m ON m.student_id=u.id WHERE m.group_id=? AND u.active=1 ${user.role==='student'?'AND u.id=?':''} ORDER BY u.last_name,u.first_name`,g.id,...(user.role==='student'?[user.id]:[]));
   const assignments=await all(env,'SELECT a.*,n.title,n.code FROM navigate_assignments a JOIN navigate_units n ON n.id=a.unit_id WHERE a.group_id=? AND substr(a.lesson_date,1,7)=? ORDER BY a.lesson_date,a.created_at',g.id,month);
   const results=await all(env,`SELECT s.*,a.id AS assignment_id FROM navigate_scores s JOIN navigate_assignments a ON a.unit_id=s.unit_id AND a.kind=s.kind JOIN school_members m ON m.group_id=a.group_id AND m.student_id=s.student_id WHERE a.group_id=? AND substr(a.lesson_date,1,7)=? ${user.role==='student'?'AND s.student_id=?':''}`,g.id,month,...(user.role==='student'?[user.id]:[]));
   const lessons=await all(env,'SELECT * FROM school_lessons WHERE group_id=? AND substr(date,1,7)=? ORDER BY date',g.id,month);
   const attendance=await all(env,`SELECT a.*,l.date FROM school_attendance a JOIN school_lessons l ON l.id=a.lesson_id WHERE l.group_id=? AND substr(l.date,1,7)=? ${user.role==='student'?'AND a.student_id=?':''}`,g.id,month,...(user.role==='student'?[user.id]:[]));
   return json({group:g,people:people.map(person),assignments,results,lessons,attendance});
  }
  if(path==='/api/academy/flags'&&request.method==='POST'){
   staff(user);const studentId=text(b.studentId,80);if(!await first(env,"SELECT 1 FROM school_users WHERE id=? AND role='student'",studentId))fail(404,'Ученик не найден.');
   if(user.role==='teacher'&&!await first(env,'SELECT 1 FROM school_members m JOIN school_groups g ON g.id=m.group_id WHERE m.student_id=? AND g.teacher_id=?',studentId,user.id))fail(403,'Это не ваш ученик.');
   const status=one(b.status,['active','lost','potential','red','black']);
   const previous=await first(env,'SELECT status FROM campus_student_flags WHERE student_id=?',studentId);
   if(['lost','black'].includes(status)||['lost','black'].includes(previous?.status))admin(user);
   const note=text(b.note||'',600,status!=='active');
   await run(env,'INSERT INTO campus_student_flags VALUES(?,?,?,?,?) ON CONFLICT(student_id) DO UPDATE SET status=excluded.status,note=excluded.note,updated_by=excluded.updated_by,updated_at=excluded.updated_at',studentId,status,note,user.id,now);
   await audit(env,user,'Статус сопровождения',studentId+' · '+status+' · '+note);return json({ok:true});
  }
  if(path==='/api/academy/coins'&&request.method==='POST'){
   if(user.role!=='teacher')fail(403,'Коины выдаёт учитель своим ученикам.');
   const studentId=text(b.studentId,80),clientId=text(b.clientId,80);if(!/^[a-zA-Z0-9-]{8,80}$/.test(clientId))fail(400,'Некорректный номер операции.');
   if(!await first(env,"SELECT 1 FROM school_members m JOIN school_groups g ON g.id=m.group_id JOIN school_users u ON u.id=m.student_id WHERE m.student_id=? AND g.teacher_id=? AND u.active=1 AND u.role='student'",studentId,user.id))fail(403,'Можно наградить только своего активного ученика.');
   await limit(env,'coins-password:'+user.id,10,900000);
   if(typeof b.password!=='string'||b.password.length>200||!await verifyPassword(b.password,user.password_hash))fail(401,'Пароль учителя неверный.');
   await run(env,'DELETE FROM campus_action_limits WHERE key=?','coins-password:'+user.id);
   if(!Number.isInteger(b.amount)||b.amount<1||b.amount>500)fail(400,'За одну операцию можно выдать от 1 до 500 коинов.');const reason=text(b.reason,600);
   const existing=await first(env,'SELECT * FROM campus_coin_grants WHERE teacher_id=? AND client_id=?',user.id,clientId);
   if(existing){if(existing.student_id!==studentId||existing.amount!==b.amount||existing.reason!==reason)fail(409,'Номер операции уже использован.');return json({id:existing.id,replayed:true});}
   const id=crypto.randomUUID();
   // Serialize the daily allowance, ownership check and retry nonce in one write.
   const saved=await run(env,"INSERT INTO campus_coin_grants SELECT ?,?,?,?,?,?,? WHERE COALESCE((SELECT SUM(amount) FROM campus_coin_grants WHERE teacher_id=? AND created_at>=?),0)+?<=5000 AND EXISTS(SELECT 1 FROM school_members m JOIN school_groups g ON g.id=m.group_id JOIN school_users u ON u.id=m.student_id WHERE m.student_id=? AND g.teacher_id=? AND u.active=1) ON CONFLICT(teacher_id,client_id) DO NOTHING",id,user.id,studentId,b.amount,reason,clientId,now,user.id,now-now%86400000,b.amount,studentId,user.id);
   if(!saved.meta.changes){const retry=await first(env,'SELECT * FROM campus_coin_grants WHERE teacher_id=? AND client_id=?',user.id,clientId);if(retry&&retry.student_id===studentId&&retry.amount===b.amount&&retry.reason===reason)return json({id:retry.id,replayed:true});fail(409,'Дневной лимит коинов исчерпан или состав группы изменился.');}
   await audit(env,user,'Выданы коины',studentId+' · +'+b.amount+' · '+reason);return json({id},201);
  }
  if(path==='/api/academy/coins'&&request.method==='GET'){
   staff(user);return json({grants:await all(env,`SELECT c.*,u.first_name||' '||u.last_name AS student_name,t.first_name||' '||t.last_name AS teacher_name FROM campus_coin_grants c JOIN school_users u ON u.id=c.student_id JOIN school_users t ON t.id=c.teacher_id ${user.role==='teacher'?'WHERE c.teacher_id=?':''} ORDER BY c.created_at DESC LIMIT 100`,...(user.role==='teacher'?[user.id]:[]))});
  }
  if(path==='/api/academy/resources'&&request.method==='GET'){
   const kind=one(url.searchParams.get('kind')||'library',['file','library','vocabulary']);if(kind==='file')admin(user);
   return json({resources:await all(env,`SELECT * FROM campus_resources WHERE kind=? ${user.role==='student'?"AND (level='' OR level=?)":''} ORDER BY created_at DESC`,kind,...(user.role==='student'?[user.level]:[]))});
  }
  if(path==='/api/academy/resources'&&request.method==='POST'){
   admin(user);const id=crypto.randomUUID(),kind=one(b.kind,['file','library','vocabulary']),level=one(b.level||'',['','A1','A2','B1']);
   const link=secureLink(b.url||'');if(kind!=='vocabulary'&&!link)fail(400,'Добавьте ссылку на материал.');
   await run(env,'INSERT INTO campus_resources VALUES(?,?,?,?,?,?,?,?)',id,text(b.title,160),kind,level,link,text(b.description||'',12000,kind==='vocabulary'),user.id,now);await audit(env,user,'Материал добавлен',kind+' · '+text(b.title,160));return json({id},201);
  }
  if(path==='/api/academy/resources/delete'&&request.method==='POST'){admin(user);await run(env,'DELETE FROM campus_resources WHERE id=?',text(b.id,80));await audit(env,user,'Материал удалён',b.id);return json({ok:true});}
  if(path==='/api/academy/export'&&request.method==='GET'){
   admin(user);const rows=await all(env,'SELECT number,role,first_name,last_name,level,active,created_at FROM school_users ORDER BY created_at');
   return json({exportedAt:now,people:rows,groups:await all(env,'SELECT * FROM school_groups'),members:await all(env,'SELECT * FROM school_members'),assignments:await all(env,'SELECT * FROM navigate_assignments'),results:await all(env,'SELECT * FROM navigate_scores')});
  }
  fail(404,'Раздел не найден.');
 }catch(e){if(e instanceof Fault)return json({error:e.message},e.status);console.error('Academy request failed',e);return json({error:'Не удалось выполнить действие. Повторите попытку.'},500);}
}
