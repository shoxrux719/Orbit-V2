import test,{beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleAcademy,academyMetrics} from './academy-server.js';
import {hashPassword,handleSchool} from './school-server.js';
import {academyMenus,roleAllows} from './academy-data.js';
let db,env;
const password='Teacher-password-123';
class Statement{constructor(sql,args=[]){this.sql=sql;this.args=args;}bind(...args){return new Statement(this.sql,args);}async first(){return db.prepare(this.sql).get(...this.args)||null;}async all(){return {results:db.prepare(this.sql).all(...this.args)};}async run(){return {meta:{changes:Number(db.prepare(this.sql).run(...this.args).changes)}};}}
const user=id=>db.prepare('SELECT * FROM school_users WHERE id=?').get(id);
beforeEach(async()=>{
 db=new DatabaseSync(':memory:');for(const file of ['design/school-schema.sql','design/student-phone.sql','publish-stage-20260920-1500/dist/.openai/drizzle/0000_special_bug.sql','design/campus-schema.sql','design/campus-updates.sql','design/chat-updates.sql','design/navigate-schema.sql','design/wallet-opening.sql'])db.exec(fs.readFileSync(file,'utf8'));
 env={DB:{prepare:sql=>new Statement(sql),batch:async statements=>{db.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}}}};
 const hash=await hashPassword(password);for(const [id,role,level] of [['a','admin','A1'],['t','teacher','A1'],['t2','teacher','A1'],['s','student','A1'],['s2','student','A1'],['a2','student','A2']])db.prepare('INSERT INTO school_users(id,number,login,password_hash,role,level,first_name,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,'OR-'+id,id,hash,role,level,id,Date.now());
 for(const [id,teacher,level] of [['g','t','A1'],['g2','t2','A1'],['gA2','t','A2']])db.prepare('INSERT INTO school_groups VALUES(?,?,?,?,?,?,?)').run(id,id,level,teacher,'Пн / Ср / Пт · 18:00','Room',Date.now());
 for(const [g,s] of [['g','s'],['g2','s2'],['gA2','a2']])db.prepare('INSERT INTO school_members VALUES(?,?,?)').run(g,s,Date.now());
});
afterEach(()=>db.close());
async function request(path,body,who='a',origin='https://orbit.example'){
 const req=new Request('https://orbit.example/api/academy/'+path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json',Origin:origin}:{},body:body?JSON.stringify(body):undefined});
 const res=await handleAcademy(req,env,who?user(who):null);return {status:res.status,data:await res.json()};
}
function content(){return {title:'Teacher-authored lesson',edition:'ORBIT original fixture, not textbook content',status:'published',steps:['vocabulary','video','practice'].map(type=>({type,title:type,instructions:'Original explanation',mediaUrl:type==='video'?'https://media.example/lesson.mp4':'',questions:[{prompt:'Choose the right answer',options:['Right','Wrong'],answer:0,explanation:'Correct explanation'}]}))};}
async function assign({unitId='A1-1.1',groupId='g',kind='homework'}={}){assert.equal((await request('units/'+unitId,content())).status,200);const r=await request('assign',{unitId,groupId,kind,lessonDate:'2026-10-18',dueAt:'2026-10-20'},'t');assert.equal(r.status,201,JSON.stringify(r.data));return r.data.id;}
async function solve(id,who='s'){for(let step=0;step<3;step++)assert.equal((await request('learning/'+id+'/answer',{step,question:0,answer:0},who)).status,200);}

test('separate menus deny student screens to staff and management screens to students',()=>{
 assert.deepEqual(academyMenus.teacher.map(([id])=>id),['home','lessons','ranking','tasks','exams','library','vocabulary']);
 for(const view of ['practice','marks','extra','lessons','ranking'])assert.equal(roleAllows('admin',view),false);
 for(const view of ['practice','marks','extra','curriculum','database','users'])assert.equal(roleAllows('teacher',view),false);
 for(const view of ['users','groups','curriculum','files','database','audit','tasks','exams'])assert.equal(roleAllows('student',view),false);
});
test('all three Navigate levels are seeded without fabricated textbook materials; level-scoped student overview',async()=>{
 const admin=(await request('overview')).data;assert.equal(admin.units.length,108);assert.ok(admin.units.every(u=>u.status==='draft'&&u.total_questions===0));
 for(const [id,level] of [['s','A1'],['a2','A2']]){const d=(await request('overview',null,id)).data;assert.equal(d.units.length,36);assert.ok(d.units.every(u=>u.level===level));assert.equal(d.admin,null);assert.equal(d.students.length,0);}
 assert.equal((await request('overview',null,null)).status,401);assert.equal((await request('units/A1-1.1',content(),'s')).status,403);assert.equal((await request('units/A1-1.1',content(),'a','https://other.example')).status,403);
});
test('publication validates stage order, video, questions and HTTPS; teachers cannot edit curriculum',async()=>{
 const invalid=content();invalid.steps[1].mediaUrl='';assert.equal((await request('units/A1-1.1',invalid)).status,400);
 invalid.steps[1].mediaUrl='javascript:alert(1)';assert.equal((await request('units/A1-1.1',invalid)).status,400);
 invalid.steps[1].mediaUrl='https://media.example/a.mp4';invalid.steps[0].questions[0].answer=8;assert.equal((await request('units/A1-1.1',invalid)).status,400);
 assert.equal((await request('units/A1-1.1',content(),'t')).status,403);
 assert.equal((await request('assign',{unitId:'A1-1.1',groupId:'g',lessonDate:'2026-10-18',dueAt:'2026-10-20'},'t')).status,400);
});
test('assignment ownership and level checks; student answers stay private and published assignments freeze content',async()=>{
 const id=await assign();assert.equal((await request('units/A1-1.1',content())).status,409);
 assert.equal((await request('learning/'+id,null,'s2')).status,403);assert.equal((await request('learning/'+id,null,'t2')).status,403);
 assert.equal((await request('units/A1-1.1',null,'s')).status,403);
 const lesson=(await request('learning/'+id,null,'s')).data;assert.ok(lesson.steps.every(s=>s.questions.every(q=>q.answer===undefined&&q.explanation===undefined)));
 const wrongLevel=await request('assign',{unitId:'A1-1.1',groupId:'gA2',lessonDate:'2026-10-18',dueAt:'2026-10-20'},'t');assert.equal(wrongLevel.status,400);
 assert.equal((await request('assign',{unitId:'A1-1.1',groupId:'g',lessonDate:'2026-10-18',dueAt:'2026-10-20'},'t2')).status,403);
 db.prepare("UPDATE school_users SET level='A2' WHERE id='s'").run();assert.equal((await request('learning/'+id,null,'s')).status,403);
});
test('server checks answers, gates stages, calculates automatic percentages and rejects score farming',async()=>{
 const id=await assign();const endpoint='learning/'+id+'/answer';
 assert.equal((await request(endpoint,{step:2,question:0,answer:0},'s')).status,409);
 const wrong=await request(endpoint,{step:0,question:0,answer:1,score:100,completed:[0,1,2]},'s');assert.equal(wrong.data.progress,0);assert.equal(wrong.data.correct,false);
 const first=await request(endpoint,{step:0,question:0,answer:0},'s');assert.equal(first.data.progress,33);await request(endpoint,{step:0,question:0,answer:0},'s');assert.equal((await academyMetrics(env,'s')).xp,33);
 await solve(id);const stats=await academyMetrics(env,'s');assert.equal(stats.xp,100);assert.equal(stats.coins,20);assert.equal(stats.completed,1);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM navigate_progress').get().n,3);
 await solve(id);assert.equal((await academyMetrics(env,'s')).xp,100);
 const journal=(await request('journal?groupId=g&month=2026-10',null,'s')).data;assert.equal(journal.results[0].percent,100);assert.equal(journal.people.length,1);assert.equal(journal.results[0].student_id,'s');
 assert.equal((await request('journal?groupId=g&month=2026-10',null,'t2')).status,403);
 const overview=(await request('overview',null,'t')).data;assert.equal(overview.groupRanking.find(g=>g.id==='g').progress,100);assert.equal(overview.summaries[0].done,1);
});
test('exam results stay separate and games or historical manual scores cannot increase homework points',async()=>{
 const id=await assign({kind:'exam'});await solve(id);assert.equal((await academyMetrics(env,'s')).xp,0);assert.equal((await academyMetrics(env,'s')).coins,0);
 const homework=await request('assign',{unitId:'A1-1.1',groupId:'g',kind:'homework',lessonDate:'2026-10-18',dueAt:'2026-10-20'},'t');assert.equal(homework.status,201);
 assert.equal((await request('learning/'+homework.data.id,null,'s')).data.done.length,0);
});
test('coin grants require personal password and own active pupil; retries are idempotent and coins never affect rankings',async()=>{
 const b={studentId:'s',amount:100,reason:'Great work',password,clientId:'grant-fixture-001'};
 assert.equal((await request('coins',b,'s')).status,403);assert.equal((await request('coins',b,'a')).status,403);assert.equal((await request('coins',b,'t2')).status,403);
 assert.equal((await request('coins',{...b,password:'wrong'},'t')).status,401);
 assert.equal((await request('coins',b,'t')).status,201);assert.equal((await request('coins',b,'t')).data.replayed,true);assert.equal((await academyMetrics(env,'s')).coins,100);assert.equal((await academyMetrics(env,'s')).xp,0);
 assert.equal((await request('coins',{...b,amount:200},'t')).status,409);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM school_audit WHERE action=?').get('Выданы коины').n,1);
 assert.equal((await request('coins',null,'t2')).data.grants.length,0);
});
test('coin daily allowance, password throttling and active membership are enforced server-side',async()=>{
 db.prepare('INSERT INTO campus_coin_grants VALUES(?,?,?,?,?,?,?)').run('old','t','s',500,'Old','old-fixture',Date.now());
 for(let i=0;i<9;i++)db.prepare('INSERT INTO campus_coin_grants VALUES(?,?,?,?,?,?,?)').run('old'+i,'t','s',500,'Old','old-fixture-'+i,Date.now());
 const b={studentId:'s',amount:1,reason:'Reward',password,clientId:'grant-fixture-002'};assert.equal((await request('coins',b,'t')).status,409);
 for(let i=0;i<10;i++)assert.equal((await request('coins',{...b,password:'wrong'},'t')).status,401);
 assert.equal((await request('coins',b,'t')).status,429);
});
test('staff support flags respect teacher assignment; lost/black are admin-only and never disable accounts',async()=>{
 const b={studentId:'s',status:'red',note:'Arrange support'};assert.equal((await request('flags',b,'s')).status,403);assert.equal((await request('flags',b,'t2')).status,403);assert.equal((await request('flags',b,'t')).status,200);
 assert.equal((await request('overview',null,'t')).data.counts.red,1);assert.equal((await request('flags',{...b,status:'black'},'t')).status,403);assert.equal((await request('flags',{...b,status:'black'},'a')).status,200);assert.equal(user('s').active,1);
 assert.equal((await request('flags',{...b,status:'active'},'t')).status,403);
});
test('files and exports are admin-only; students see resources for their assigned level',async()=>{
 const r=await request('resources',{title:'Words',kind:'vocabulary',level:'A2',description:'Original vocabulary'});assert.equal(r.status,201);
 assert.equal((await request('resources?kind=vocabulary',null,'s')).data.resources.length,0);assert.equal((await request('resources?kind=vocabulary',null,'a2')).data.resources.length,1);
 for(const id of ['s','t']){assert.equal((await request('resources?kind=file',null,id)).status,403);assert.equal((await request('export',null,id)).status,403);}
 const data=(await request('export')).data;assert.ok(data.people.every(p=>!('password_hash' in p)&&!('login' in p)&&!('phone' in p)));
});
test('only administrator may assign the student programme level; self-profile cannot bypass enrolment',async()=>{
 const body={firstName:'Student',lastName:'',gender:'unspecified',bio:'',level:'A2',phone:'',bannerStyle:'blue'};
 const req=new Request('https://orbit.example/api/account',{method:'POST',headers:{Origin:'https://orbit.example'},body:JSON.stringify(body)});
 assert.equal((await handleSchool(req,env,user('s'))).status,403);assert.equal(user('s').level,'A1');
 const change=async id=>handleSchool(new Request('https://orbit.example/api/school/users/s/level',{method:'POST',headers:{Origin:'https://orbit.example'},body:JSON.stringify({level:'A2'})}),env,user(id));
 assert.equal((await change('t')).status,403);assert.equal((await change('a')).status,200);assert.equal(user('s').level,'A2');
});

test('every published unit is immediately available at the pupil level without group assignment',async()=>{
 db.exec(fs.readFileSync('design/course-seed.sql','utf8'));
 for(const [who,level] of [['s','A1'],['a2','A2']]){
  const overview=(await request('overview',null,who)).data;assert.equal(overview.assignments.length,0);assert.equal(overview.units.length,36);assert.ok(overview.units.every(u=>u.status==='published'));
  for(const code of ['1.1','7.2','12.3']){const lesson=await request('learning/course-'+level+'-'+code,null,who);assert.equal(lesson.status,200);assert.equal(lesson.data.steps.length,8);assert.equal(lesson.data.total,36);assert.ok(lesson.data.steps.flatMap(s=>s.questions).every(q=>!('answers' in q)&&!('answer' in q)));}
 }
 assert.equal((await request('learning/course-A2-1.1',null,'s')).status,403);assert.equal((await request('learning/course-B1-12.3/answer',{step:0,question:0,answer:0},'s')).status,403);
});
test('mixed task types are graded on the server, respect stage order and preserve progress on retries',async()=>{
 db.exec(fs.readFileSync('design/course-seed.sql','utf8'));const id='course-A1-1.1',unit=db.prepare("SELECT * FROM navigate_units WHERE id='A1-1.1'").get(),steps=JSON.parse(unit.steps);
 assert.equal((await request('learning/'+id+'/answer',{step:2,question:0,answer:'hello'},'s')).status,409);
 for(let si=0;si<steps.length;si++)for(let qi=0;qi<steps[si].questions.length;qi++){
  const q=steps[si].questions[qi];if(si===2&&qi===0){const wrong=await request('learning/'+id+'/answer',{step:si,question:qi,answer:'wrong'},'s');assert.equal(wrong.data.correct,false);assert.equal(wrong.data.progress,27);}
  const answer=(q.type||'choice')==='choice'?q.answer:q.answers[0];const result=await request('learning/'+id+'/answer',{step:si,question:qi,answer},'s');assert.equal(result.status,200);assert.equal(result.data.correct,true);
 }
 assert.equal((await academyMetrics(env,'s')).xp,100);assert.equal((await academyMetrics(env,'s')).coins,20);
 const retry=await request('learning/'+id+'/answer',{step:7,question:0,answer:steps[7].questions[0].answers[0]},'s');assert.equal(retry.data.progress,100);assert.equal((await academyMetrics(env,'s')).xp,100);
 assert.equal((await request('learning/'+id,null,'s')).data.done.length,36);
});
test('class journal shows all active classmates and their homework percentages, while private answers and attendance stay scoped',async()=>{
 db.exec(fs.readFileSync('design/course-seed.sql','utf8'));db.prepare('INSERT INTO school_members VALUES(?,?,?)').run('g','s2',Date.now());
 db.prepare('INSERT INTO navigate_progress VALUES(?,?,?,?,?,?)').run('s2','A1-1.1','homework',0,0,Date.now());
 const own=(await request('journal?groupId=g&month=2026-10&view=course',null,'s')).data;
 assert.equal(own.people.length,2);assert.equal(own.assignments.length,36);assert.equal(own.view,'course');assert.equal(own.results[0].student_id,'s2');assert.equal(own.results[0].percent,2);assert.ok(own.results.every(r=>!('answer' in r)&&!('feedback' in r)));assert.ok(own.people.every(p=>!('phone' in p)&&!('login' in p)));
 db.prepare('INSERT INTO school_lessons VALUES(?,?,?,?,?,?)').run('journal-lesson','g','2026-10-18','Class','t',Date.now());
 db.prepare('INSERT INTO school_attendance VALUES(?,?,?,?,?,?)').run('journal-lesson','s2','absent','Private note','t',Date.now());
 assert.equal((await request('journal?groupId=g&month=2026-10&view=course',null,'s')).data.attendance.length,0);
 db.prepare('DELETE FROM school_members WHERE group_id=? AND student_id=?').run('g','s2');assert.equal((await request('journal?groupId=g&month=2026-10',null,'s2')).status,403);
});
