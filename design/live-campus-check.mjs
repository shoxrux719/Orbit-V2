import fs from 'node:fs';
import assert from 'node:assert/strict';
const q=JSON.parse(fs.readFileSync('design/.school-qa.json','utf8')),origin='http://127.0.0.1:3000';
async function api(path,b,cookie='',expected=200){const r=await fetch(origin+path,{method:b?'POST':'GET',headers:{Origin:origin,Cookie:cookie,...(b?{'Content-Type':'application/json'}:{})},body:b?JSON.stringify(b):undefined});const d=await r.json();assert.equal(r.status,expected,`${path}: ${d.error||''}`);return {data:d,cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const adminPass=fs.readFileSync('.local-admin.txt','utf8').match(/Пароль: (.+)/)[1].trim(),admin=(await api('/api/school/login',{identifier:'admin',password:adminPass})).cookie;
const student=(await api('/api/school/login',{identifier:q.student.phone,password:q.student.password})).cookie,teacher=(await api('/api/school/login',{identifier:q.teacher.login,password:q.teacher.password})).cookie;
const data=(await api('/api/campus/dashboard',null,student)).data;assert.equal(data.groups.length,1);assert.equal(data.stats.xp,163);assert.equal(data.stats.coins,33);
const ranking=(await api('/api/campus/ranking',null,student)).data;assert.ok(ranking.ranking.some(r=>r.id===q.student.id));
const marks=(await api(`/api/campus/marks?groupId=${q.groupId}&month=2026-10`,null,student)).data;assert.equal(marks.people.length,1);assert.equal(marks.marks[0].score,86);
const slot=(await api('/api/campus/support/slots',{startsAt:Date.now()+86400000,minutes:30,topic:'QA: Present Perfect clinic'},teacher,201)).data.id;
const booking=(await api('/api/campus/support/book',{slotId:slot,note:'Need help with questions'},student,201)).data.id;
assert.equal((await api('/api/campus/support',null,student)).data.bookings[0].id,booking);
const item=(await api('/api/campus/catalog',{kind:'reward',title:`QA ${q.prefix} · Учебный блокнот`,description:'Тестовая награда для проверки выдачи.',cost:10,stock:1},admin,201)).data.id;
await api('/api/campus/shop/redeem',{itemId:item},student,201);assert.equal((await api('/api/campus/dashboard',null,student)).data.stats.coins,23);
await api('/api/campus/messages',{recipientId:q.teacher.id,body:'Здравствуйте! Подскажите, как повторить Present Perfect?'},student,201);assert.equal((await api('/api/campus/messages',null,teacher)).data.messages.length,1);
await api('/api/campus/messages',{recipientId:q.student.id,body:'Привет! В Lessons есть тема Present Perfect. Приходи на дополнительное занятие — разберём вместе.'},teacher,201);
const attempt=(await api('/api/campus/practice/start',{mode:'smart'},student)).data;assert.ok(attempt.questions.every(q=>q.answer===undefined));const result=(await api('/api/campus/practice/finish',{id:attempt.id,answers:attempt.questions.map(()=>0)},student)).data;assert.equal(result.total,6);
const room=(await api('/api/campus/rooms',{kind:'pair',name:'QA conversation room'},student,201)).data.id;await api(`/api/campus/rooms/${room}/join`,{},student);await api(`/api/campus/rooms/${room}/leave`,{},student);
console.log('Live campus checks passed: metrics, ranking, private marks, booking, reward reservation, messages, graded practice, room membership.');
