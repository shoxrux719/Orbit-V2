import test,{beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {handleSchool,schoolUser,hashPassword,learningRequest,normalizePhone} from './school-server.js';
let database,env;
const pass='Test-only-password-42';
const phones={student:'+998900000001',student2:'+998900000002'};
class Statement {
 constructor(sql,args=[]){this.sql=sql;this.args=args;}
 bind(...args){return new Statement(this.sql,args);}
 async first(){return database.prepare(this.sql).get(...this.args)||null;}
 async all(){return {results:database.prepare(this.sql).all(...this.args)};}
 async run(){const result=database.prepare(this.sql).run(...this.args);return {meta:{changes:Number(result.changes)}};}
}
beforeEach(async()=>{
 database=new DatabaseSync(':memory:');database.exec(fs.readFileSync('design/school-schema.sql','utf8'));database.exec(fs.readFileSync('design/student-phone.sql','utf8'));database.exec(fs.readFileSync('design/navigate-schema.sql','utf8'));
 database.exec(fs.readFileSync('publish-stage-20260920-1500/dist/.openai/drizzle/0000_special_bug.sql','utf8'));
 env={DB:{prepare:sql=>new Statement(sql),batch:async statements=>{database.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());database.exec('COMMIT');return results;}catch(e){database.exec('ROLLBACK');throw e;}}}};
 const hash=await hashPassword(pass);
 for(const [id,role] of [['admin','admin'],['teacher','teacher'],['teacher2','teacher'],['student','student'],['student2','student']])database.prepare('INSERT INTO school_users(id,number,login,password_hash,role,first_name,last_name,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,'OR-'+id.toUpperCase(),id,hash,role,id,'Test',Date.now());
 for(const [id,phone] of Object.entries(phones))database.prepare('UPDATE school_users SET phone=?,login_phone=? WHERE id=?').run(phone,phone,id);
 database.prepare('UPDATE school_users SET phone=? WHERE id=?').run('+998900000003','teacher');
});
afterEach(()=>database.close());
async function request(path,b,cookie='',origin='http://127.0.0.1:3000',method=b?'POST':'GET'){
 const r=new Request('http://127.0.0.1:3000'+path,{method,headers:{...(b?{'Content-Type':'application/json','Origin':origin}:{}),Cookie:cookie},...(b?{body:JSON.stringify(b)}:{})});
 const response=await handleSchool(r,env,await schoolUser(r,env));const content=response.headers.get('content-type');return {status:response.status,data:content?.includes('application/json')?await response.json():await response.arrayBuffer(),cookie:response.headers.get('set-cookie')};
}
async function login(id){const result=await request('/api/school/login',{identifier:phones[id]||id,password:pass,portal:phones[id]?'student':'staff'});assert.equal(result.status,200);return result.cookie.split(';')[0];}
async function group(admin,teacher='teacher',members=['student']){const g=await request('/api/school/groups',{name:'Test group',level:'A2',teacherId:teacher},admin);assert.equal(g.status,201);assert.equal((await request(`/api/school/groups/${g.data.id}/members`,{studentIds:members},admin)).status,200);return g.data.id;}

test('profile images revalidate without resending bytes and still require a live session',async()=>{
 const cookie=await login('student'),uploaded=await request('/api/school/media',{kind:'avatar',data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1AAAAAASUVORK5CYII='},cookie);assert.equal(uploaded.status,201);
 const read=async(headers)=>{const req=new Request('http://127.0.0.1:3000'+uploaded.data.url,{headers});return handleSchool(req,env,await schoolUser(req,env));};
 const first=await read({Cookie:cookie});assert.equal(first.status,200);assert.equal(first.headers.get('cache-control'),'private, no-cache');
 const tag=first.headers.get('etag');assert.ok(tag);const unchanged=await read({Cookie:cookie,'If-None-Match':tag});assert.equal(unchanged.status,304);assert.equal((await unchanged.arrayBuffer()).byteLength,0);
 await request('/api/auth/logout',{},cookie);assert.equal((await read({Cookie:cookie,'If-None-Match':tag})).status,401);
});
test('closed enrollment, role checks, CSRF and secure sessions',async()=>{
 assert.equal((await request('/api/school/users',{role:'student'})).status,401);
 const admin=await login('admin'),student=await login('student');
 assert.equal((await request('/api/school/users',{role:'teacher'},student)).status,403);
 assert.equal((await request('/api/school/users',{role:'admin',login:'hack',firstName:'Hack'},admin)).status,400);
 assert.equal((await request('/api/school/users',{role:'student',login:'new.student',firstName:'New'},admin,'https://other.example')).status,403);
 const created=await request('/api/school/users',{role:'student',phone:'+998 90 000 00 04',firstName:'New',lastName:'Name'},admin);
 assert.equal(created.status,201);assert.ok(created.data.password.length>=12);
 const row=database.prepare('SELECT * FROM school_users WHERE id=?').get(created.data.id);assert.notEqual(row.password_hash,created.data.password);
 const signed=await request('/api/school/login',{identifier:created.data.phone,password:created.data.password,portal:'student'});assert.equal(signed.status,200);assert.match(signed.cookie,/HttpOnly/);assert.match(signed.cookie,/SameSite=Lax/);
 assert.equal((await request('/api/auth/google')).status,403);
 assert.equal((await request('/api/school/login',{identifier:phones.student,password:'incorrect'})).status,401);
 assert.equal((await request('/api/school/login',{identifier:'missing',password:'incorrect'})).status,401);
});
test('profile selection isolates phone-only students from staff and logout revokes sessions',async()=>{
 for(const identifier of ['student','OR-STUDENT',phones.student]){
  const wrong=await request('/api/school/login',{identifier,password:pass,portal:'staff'});
  assert.equal(wrong.status,401);assert.equal(wrong.cookie,null);
 }
 for(const identifier of ['teacher','admin']){
  const wrong=await request('/api/school/login',{identifier,password:pass,portal:'student'});
  assert.equal(wrong.status,400);assert.equal(wrong.cookie,null);
  const signed=await request('/api/school/login',{identifier,password:pass,portal:'staff'});
  assert.equal(signed.status,200);assert.equal(signed.data.user.role,identifier);
 }
 const teacherPhone=await request('/api/school/login',{identifier:'+998900000003',password:pass,portal:'student',role:'teacher'});
 assert.equal(teacherPhone.status,401);assert.equal(teacherPhone.cookie,null);
 for(const identifier of ['student','OR-STUDENT'])assert.equal((await request('/api/school/login',{identifier,password:pass})).status,401);
 const badPassword=await request('/api/school/login',{identifier:phones.student,password:'incorrect',portal:'student'});
 assert.equal(badPassword.status,401);assert.equal(badPassword.data.error,'Неверный номер телефона или пароль.');
 assert.equal((await request('/api/school/login',{identifier:phones.student,password:pass,portal:'admin'})).status,400);
 const signed=await request('/api/school/login',{identifier:'90 (000) 00-01',password:pass,portal:'student',role:'admin'});
 assert.equal(signed.status,200);assert.equal(signed.data.user.role,'student');const session=signed.cookie.split(';')[0];
 const loggedOut=await request('/api/auth/logout',{},session);assert.equal(loggedOut.status,200);assert.match(loggedOut.cookie,/Max-Age=0/);
 assert.equal((await request('/api/account',undefined,session)).data.user,null);
 assert.equal(database.prepare('SELECT count(*) AS n FROM school_sessions WHERE user_id=?').get('student').n,0);
});

test('student phone enrollment requires a valid unique number and never creates a staff identity',async()=>{
 const a=await login('admin');
 for(const phone of ['',undefined,'admin','+998','++998900000001','123abc456','+0123456789']){
  assert.equal((await request('/api/school/users',{role:'student',firstName:'New',phone},a)).status,400);
 }
 assert.equal((await request('/api/school/users',{role:'student',firstName:'New',phone:'90 000-00-01'},a)).status,409);
 const created=await request('/api/school/users',{role:'student',firstName:'New',phone:'00 998 (90) 000-00-04'},a);
 assert.equal(created.status,201);assert.equal(created.data.phone,'+998900000004');
 const row=database.prepare('SELECT * FROM school_users WHERE id=?').get(created.data.id);assert.equal(row.login_phone,created.data.phone);assert.match(row.login,/^student\./);
 const signed=await request('/api/school/login',{identifier:created.data.phone,password:created.data.password,portal:'student'});assert.equal(signed.status,200);assert.equal(signed.data.user.role,'student');
 assert.equal((await request('/api/school/login',{identifier:row.login,password:created.data.password})).status,401);
 database.prepare('UPDATE school_users SET active=0 WHERE id=?').run(created.data.id);
 assert.equal((await request('/api/school/users',{role:'student',firstName:'New',phone:'900000004'},a)).status,409);
 assert.throws(()=>database.prepare('UPDATE school_users SET login_phone=? WHERE id=?').run(phones.student,'student2'),/UNIQUE/);
 assert.equal(normalizePhone('+44 (20) 7946-0958'),'+442079460958');
 assert.equal(normalizePhone('000 123 456'),'+998000123456');
});

test('only administration can change sign-in phones; contact edits do not change access',async()=>{
 const a=await login('admin'),s=await login('student'),t=await login('teacher');
 const path='/api/school/users/student/phone';
 assert.equal((await request(path,{phone:'+998900000005'},s)).status,403);
 assert.equal((await request(path,{phone:'+998900000005'},t)).status,403);
 assert.equal((await request('/api/school/users/teacher/phone',{phone:'+998900000005'},a)).status,400);
 assert.equal((await request(path,{phone:phones.student2},a)).status,409);
 assert.equal((await request(path,{phone:'90 000 00 01'},a)).status,200);
 assert.equal((await request('/api/account',undefined,s)).data.user.role,'student');
 await request('/api/account',{firstName:'Student',lastName:'Test',gender:'unspecified',bio:'',level:'A1',phone:'+998900000006',loginPhone:'+998900000006',bannerStyle:'blue'},s);
 assert.equal(database.prepare('SELECT login_phone FROM school_users WHERE id=?').get('student').login_phone,phones.student);
 assert.equal((await request('/api/school/login',{identifier:'+998900000006',password:pass,portal:'student'})).status,401);
 assert.equal((await request(path,{phone:'90 000 00 05'},a)).status,200);
 assert.equal((await request('/api/account',undefined,s)).data.user,null);
 assert.equal((await request('/api/school/login',{identifier:phones.student,password:pass,portal:'student'})).status,401);
 const signed=await request('/api/school/login',{identifier:'+998900000005',password:pass,portal:'student'});assert.equal(signed.status,200);
 const mine=(await request('/api/account',undefined,signed.cookie.split(';')[0])).data;assert.equal(mine.profile.loginPhone,'+998900000005');
 const other=(await request('/api/school/people/student',undefined,await login('student2'))).data;assert.equal(other.person.loginPhone,undefined);assert.equal(other.person.phone,undefined);
});

test('phone migration preserves ambiguous and invalid contacts without assigning a wrong account',()=>{
 const old=new DatabaseSync(':memory:');try{
 old.exec(fs.readFileSync('design/school-schema.sql','utf8'));
 for(const [id,role,phone] of [['one','student','90 000 00 01'],['dup1','student','+998900000002'],['dup2','student','90 000 00 02'],['bad','student','private-phone'],['staff','teacher','+998900000003'],['uk','student','0044 20 7946 0958']])old.prepare('INSERT INTO school_users(id,number,login,password_hash,role,first_name,phone,created_at) VALUES(?,?,?,?,?,?,?,?)').run(id,id,id,'hash',role,id,phone,1);
 old.exec(fs.readFileSync('design/student-phone.sql','utf8'));
 const rows=old.prepare('SELECT id,login_phone FROM school_users').all();const lookup=Object.fromEntries(rows.map(x=>[x.id,x.login_phone]));
 assert.equal(lookup.one,'+998900000001');assert.equal(lookup.uk,'+442079460958');for(const id of ['dup1','dup2','bad','staff'])assert.equal(lookup[id],null);
 assert.equal(old.prepare('SELECT count(*) AS n FROM school_users').get().n,6);
 }finally{old.close();}
});

test('only administrators assign groups; journal access and bulk writes respect membership',async()=>{
 const a=await login('admin'),t=await login('teacher'),t2=await login('teacher2'),s=await login('student'),s2=await login('student2');const id=await group(a);
 assert.equal((await request('/api/school/groups',{name:'Forbidden'},t)).status,403);
 assert.equal((await request(`/api/school/groups/${id}/members`,{studentIds:['student2']},t)).status,403);
 assert.equal((await request(`/api/school/groups/${id}`,undefined,t2)).status,403);
 assert.equal((await request(`/api/school/groups/${id}`,undefined,s2)).status,403);
 const lesson=await request('/api/school/lessons',{groupId:id,date:'2026-10-05',title:'Present Simple'},t);assert.equal(lesson.status,201);
 const path=`/api/school/lessons/${lesson.data.id}/attendance`;
 assert.equal((await request(path,{rows:[{studentId:'student',status:'present'}]},s)).status,403);
 assert.equal((await request(path,{rows:[{studentId:'student',status:'present'},{studentId:'student2',status:'present'}]},t)).status,400);
 assert.equal(database.prepare('SELECT count(*) AS n FROM school_attendance').get().n,0);
 assert.equal((await request(path,{rows:[{studentId:'student',status:'late'}]},t)).status,200);
 assert.equal((await request(`/api/school/lessons/${lesson.data.id}/marks`,{rows:[{studentId:'student',skill:'reading',score:0,comment:'Try again'}]},t)).status,403);
 assert.equal((await request(`/api/school/lessons/${lesson.data.id}/marks`,{rows:[{studentId:'student',skill:'reading',score:101}]},t)).status,403);
 database.prepare('INSERT INTO school_marks VALUES(?,?,?,?,?,?,?)').run(lesson.data.id,'student','reading',0,'Historical','teacher',Date.now());
 const data=(await request(`/api/school/groups/${id}`,undefined,s)).data;assert.equal(data.attendance[0].status,'late');assert.equal(data.marks[0].score,0);
 assert.equal((await request(path,{rows:[{studentId:'student',status:'unmarked'}]},t)).status,200);
 assert.equal((await request(`/api/school/groups/${id}`,undefined,s)).data.attendance.length,0);
});
test('student sees only their historical grades and work, not classmates private submissions',async()=>{
 const a=await login('admin'),t=await login('teacher'),s=await login('student');const id=await group(a,'teacher',['student','student2']);
 const lesson=(await request('/api/school/lessons',{groupId:id,date:'2026-10-05',title:'Class'},t)).data.id;
 for(const who of ['student','student2'])database.prepare('INSERT INTO school_marks VALUES(?,?,?,?,?,?,?)').run(lesson,who,'general',75,'Historical','teacher',Date.now());
 database.prepare('INSERT INTO school_assignments VALUES(?,?,?,?,?,?,?,?,?)').run('history',id,'Old homework','Write','["Write"]','writing','2026-10-06','teacher',Date.now());
 database.prepare('INSERT INTO school_submissions(assignment_id,student_id,answer,completed,status,updated_at) VALUES(?,?,?,?,?,?)').run('history','student2','Private answer 2','[0]','submitted',Date.now());
 const data=(await request('/api/school/groups/'+id,undefined,s)).data;assert.equal(data.marks.length,1);assert.equal(data.marks[0].student_id,'student');assert.equal(data.submissions.length,0);
 assert.equal((await request('/api/school/groups/'+id,undefined,t)).data.submissions[0].answer,'Private answer 2');
});

test('manual grades and legacy homework writes are retired without deleting history',async()=>{
 const a=await login('admin'),t=await login('teacher'),s=await login('student');const id=await group(a);
 const lesson=(await request('/api/school/lessons',{groupId:id,date:'2026-10-05',title:'Class'},t)).data.id;
 assert.equal((await request('/api/school/lessons/'+lesson+'/marks',{rows:[{studentId:'student',skill:'general',score:100}]},t)).status,403);
 assert.equal((await request('/api/school/assignments',{groupId:id,title:'Legacy'},t)).status,403);
 assert.equal((await request('/api/school/assignments/history/submit',{answer:'Text'},s)).status,403);
 assert.equal((await request('/api/school/assignments/history/review',{score:100},t)).status,403);
});

test('profile privacy, media ownership, skill assessments and identity cannot be spoofed',async()=>{
 const a=await login('admin'),t=await login('teacher'),t2=await login('teacher2'),s=await login('student'),s2=await login('student2');await group(a);
 const updated=await request('/api/account',{firstName:'Alex',lastName:'Learner',gender:'female',bio:'English enthusiast',level:'A1',phone:'private-phone',bannerStyle:'violet',role:'admin'},s);assert.equal(updated.status,200);assert.equal(database.prepare('SELECT role FROM school_users WHERE id=?').get('student').role,'student');
 const publicProfile=(await request('/api/school/people/student',undefined,s2)).data;assert.equal(publicProfile.person.firstName,'Alex');assert.equal(publicProfile.person.phone,undefined);assert.equal(publicProfile.person.login,undefined);assert.equal(publicProfile.person.password_hash,undefined);
 assert.equal((await request('/api/school/skills',{studentId:'student',skill:'speaking',level:'B1'},s)).status,403);
 assert.equal((await request('/api/school/skills',{studentId:'student',skill:'speaking',level:'B1'},t2)).status,403);
 assert.equal((await request('/api/school/skills',{studentId:'student',skill:'speaking',level:'B1'},t)).status,200);
 assert.equal((await request('/api/school/people/student',undefined,t)).data.canAssess,true);
 const media=await request('/api/school/media',{kind:'avatar',ownerId:'student2',data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1AAAAAASUVORK5CYII='},s);assert.equal(media.status,201);assert.equal(database.prepare('SELECT owner_id FROM school_media').get().owner_id,'student');
 assert.equal((await request(media.data.url)).status,401);assert.equal((await request(media.data.url,undefined,s2)).status,200);
 assert.equal((await request('/api/school/media',{kind:'banner',data:'data:image/png;base64,QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFB'},s)).status,400);
 const forwarded=learningRequest(new Request('http://127.0.0.1:3000/api/progress',{headers:{'oai-authenticated-user-id':'admin','oai-authenticated-user-email':'spoof@test','Cookie':'orbit_session=retired'}}),null);assert.equal(forwarded.headers.get('oai-authenticated-user-id'),null);assert.equal(forwarded.headers.get('cookie'),'');
});
test('disable and password reset revoke sessions; group reassignment removes old teacher access',async()=>{
 const a=await login('admin'),s=await login('student'),t=await login('teacher');const id=await group(a);
 assert.equal((await request('/api/school/users/student/status',{active:false},a)).status,200);assert.equal((await request('/api/account',undefined,s)).data.user,null);
 assert.equal((await request('/api/school/login',{identifier:phones.student,password:pass})).status,401);
 await request('/api/school/users/student/status',{active:true},a);const signed=await login('student');
 const reset=await request('/api/school/users/student/reset',{},a);assert.equal(reset.status,200);assert.equal((await request('/api/account',undefined,signed)).data.user,null);assert.equal((await request('/api/school/login',{identifier:phones.student,password:reset.data.password})).status,200);
 assert.equal((await request(`/api/school/groups/${id}/settings`,{name:'Transferred',level:'A2',teacherId:'teacher2'},a)).status,200);
 assert.equal((await request(`/api/school/groups/${id}`,undefined,t)).status,403);
 assert.equal((await request('/api/school/users/admin/status',{active:false},a)).status,400);
});
test('login rate limit stops password work after ten failed attempts',async()=>{
 for(let i=0;i<10;i++)assert.equal((await request('/api/school/login',{identifier:phones.student,password:'wrong-password'})).status,401);
 assert.equal((await request('/api/school/login',{identifier:phones.student,password:pass})).status,429);
});
