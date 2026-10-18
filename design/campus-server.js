import {practiceBank} from './practice-bank.js';
import {chatReactions,chatStickers} from './chat-data.js';
import {academyMetrics,academyRanking} from './academy-server.js';
const response=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const all=async(env,sql,...args)=>(await env.DB.prepare(sql).bind(...args).all()).results;
const run=(env,sql,...args)=>env.DB.prepare(sql).bind(...args).run();
class Fault extends Error {constructor(status,message){super(message);this.status=status;}}
const fail=(s,m)=>{throw new Fault(s,m);};
const str=(v,max=200,required=true)=>{if(typeof v!=='string'||v.trim().length>max||(required&&!v.trim()))fail(400,'Проверьте заполненные поля.');return v.trim();};
const one=(v,values)=>{if(!values.includes(v))fail(400,'Недопустимое значение.');return v;};
const id=()=>crypto.randomUUID();
const person=p=>({id:p.id,firstName:p.first_name,lastName:p.last_name,gender:p.gender,level:p.level,role:p.role,avatar:p.avatar_id?'/api/school/media/'+p.avatar_id:null,number:p.number});
const admin=u=>{if(u.role!=='admin')fail(403,'Только для администрации.');};
async function groupAccess(env,u,groupId){const g=await env.DB.prepare('SELECT * FROM school_groups WHERE id=?').bind(groupId).first();if(!g)fail(404,'Группа не найдена.');if(u.role==='admin'||(u.role==='teacher'&&g.teacher_id===u.id))return g;if(u.role==='student'&&await env.DB.prepare('SELECT 1 FROM school_members WHERE group_id=? AND student_id=?').bind(groupId,u.id).first())return g;fail(403,'Нет доступа к группе.');}
export async function metrics(env,userId){
 return academyMetrics(env,userId);
}
export async function handleCampus(request,env,user){
 const url=new URL(request.url),path=url.pathname;if(!path.startsWith('/api/campus/'))return null;
 try{
  if(!user)fail(401,'Войдите в свой аккаунт.');
  if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==url.origin)fail(403,'Недопустимый источник запроса.');
  let b={};if(request.method!=='GET'&&request.method!=='HEAD'){const raw=await request.text();if(raw.length>100000)fail(413,'Запрос слишком большой.');try{b=JSON.parse(raw);}catch{fail(400,'Некорректный запрос.');}if(!b||typeof b!=='object'||Array.isArray(b))fail(400,'Некорректный запрос.');}
  const now=Date.now();
  if(path==='/api/campus/dashboard'&&request.method==='GET'){
   const groups=await all(env,`SELECT g.*,u.first_name||' '||u.last_name AS teacher_name FROM school_groups g JOIN school_users u ON u.id=g.teacher_id ${user.role==='admin'?'':user.role==='teacher'?'WHERE g.teacher_id=?':'WHERE g.id IN (SELECT group_id FROM school_members WHERE student_id=?)'} ORDER BY g.name`,...(user.role==='admin'?[]:[user.id]));
   const assignments=groups.length?await all(env,`SELECT a.*,g.name AS group_name,s.status,s.completed,s.score,s.feedback FROM school_assignments a JOIN school_groups g ON g.id=a.group_id LEFT JOIN school_submissions s ON s.assignment_id=a.id AND s.student_id=? WHERE g.id IN (${groups.map(()=>'?').join(',')}) ORDER BY a.due_at DESC`,user.id,...groups.map(g=>g.id)):[];
   const lessons=groups.length?await all(env,`SELECT l.*,g.name AS group_name FROM school_lessons l JOIN school_groups g ON g.id=l.group_id WHERE g.id IN (${groups.map(()=>'?').join(',')}) ORDER BY l.date DESC,l.created_at`,...groups.map(g=>g.id)):[];
   const stats=await metrics(env,user.id);
   const messages=await env.DB.prepare('SELECT count(*) AS count FROM campus_messages WHERE recipient_id=? AND read_at IS NULL').bind(user.id).first();
   return response({stats,groups,lessons,assignments:assignments.map(a=>({...a,checklist:JSON.parse(a.checklist),completed:JSON.parse(a.completed||'[]')})),unread:messages.count});
  }
  if(path==='/api/campus/ranking'&&request.method==='GET'){
   const scope=one(url.searchParams.get('scope')||'school',['school','group']),level=url.searchParams.get('level')||'';if(level)one(level,['A1','A2','B1','B2','C1','C2']);const groupId=scope==='group'?(await groupAccess(env,user,url.searchParams.get('groupId'))).id:null;
   return response({ranking:await academyRanking(env,{level,groupId}),self:await metrics(env,user.id)});
  }
  if(path==='/api/campus/marks'&&request.method==='GET'){
   const group=await groupAccess(env,user,url.searchParams.get('groupId')),month=str(url.searchParams.get('month'),7);if(!/^\d{4}-\d{2}$/.test(month))fail(400,'Укажите месяц.');
   const lessons=await all(env,'SELECT * FROM school_lessons WHERE group_id=? AND substr(date,1,7)=? ORDER BY date,created_at',group.id,month);
   const people=await all(env,`SELECT u.* FROM school_users u JOIN school_members m ON m.student_id=u.id WHERE m.group_id=? AND u.active=1 ${user.role==='student'?'AND u.id=?':''} ORDER BY u.last_name,u.first_name`,group.id,...(user.role==='student'?[user.id]:[]));
   const marks=await all(env,`SELECT m.* FROM school_marks m JOIN school_lessons l ON l.id=m.lesson_id WHERE l.group_id=? AND substr(l.date,1,7)=? ${user.role==='student'?'AND m.student_id=?':''}`,group.id,month,...(user.role==='student'?[user.id]:[]));
   const attendance=await all(env,`SELECT a.* FROM school_attendance a JOIN school_lessons l ON l.id=a.lesson_id WHERE l.group_id=? AND substr(l.date,1,7)=? ${user.role==='student'?'AND a.student_id=?':''}`,group.id,month,...(user.role==='student'?[user.id]:[]));
   return response({group,lessons,people:people.map(person),marks,attendance});
  }
  if(path==='/api/campus/support'&&request.method==='GET'){
   const slots=await all(env,'SELECT s.*,u.first_name||\' \'||u.last_name AS teacher_name,(SELECT count(*) FROM campus_bookings b WHERE b.slot_id=s.id AND b.status!=\'cancelled\') AS taken FROM campus_slots s JOIN school_users u ON u.id=s.teacher_id AND u.active=1 WHERE s.starts_at>? AND s.cancelled_at IS NULL ORDER BY s.starts_at',now);
   const bookings=await all(env,`SELECT b.*,s.topic,s.starts_at,s.minutes,s.teacher_id,t.first_name||' '||t.last_name AS teacher_name,u.first_name||' '||u.last_name AS student_name FROM campus_bookings b JOIN campus_slots s ON s.id=b.slot_id JOIN school_users t ON t.id=s.teacher_id JOIN school_users u ON u.id=b.student_id ${user.role==='admin'?'':user.role==='teacher'?'WHERE s.teacher_id=?':'WHERE b.student_id=?'} ORDER BY s.starts_at DESC`,...(user.role==='admin'?[]:[user.id]));
   const teachers=user.role==='admin'?(await all(env,"SELECT * FROM school_users WHERE role='teacher' AND active=1")).map(person):[];return response({slots,bookings,teachers});
  }
  if(path==='/api/campus/support/slots'&&request.method==='POST'){
   if(user.role==='student')fail(403,'Время добавляет учитель.');const teacherId=user.role==='teacher'?user.id:str(b.teacherId,80);if(!await env.DB.prepare("SELECT 1 FROM school_users WHERE id=? AND role='teacher' AND active=1").bind(teacherId).first())fail(400,'Выберите учителя.');const start=Number(b.startsAt);if(!Number.isInteger(start)||start<now+60000||start>now+365*86400000)fail(400,'Укажите будущую дату.');const minutes=one(Number(b.minutes),[20,30,45,60]);const slot=id();const result=await run(env,'INSERT INTO campus_slots(id,teacher_id,starts_at,minutes,topic,created_at) SELECT ?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM campus_slots WHERE teacher_id=? AND cancelled_at IS NULL AND starts_at<? AND starts_at+minutes*60000>?)',slot,teacherId,start,minutes,str(b.topic,160),now,teacherId,start+minutes*60000,start);if(!result.meta.changes)fail(409,'Это время пересекается с другим занятием учителя.');return response({id:slot},201);
  }
  if(path==='/api/campus/support/slots/cancel'&&request.method==='POST'){const slot=await env.DB.prepare('SELECT * FROM campus_slots WHERE id=?').bind(str(b.slotId,80)).first();if(!slot)fail(404,'Время не найдено.');if(user.role!=='admin'&&(user.role!=='teacher'||slot.teacher_id!==user.id))fail(403,'Можно отменить только своё время.');await env.DB.batch([env.DB.prepare('UPDATE campus_slots SET cancelled_at=? WHERE id=?').bind(now,slot.id),env.DB.prepare("UPDATE campus_bookings SET status='cancelled' WHERE slot_id=? AND status='booked'").bind(slot.id)]);return response({ok:true});}
  if(path==='/api/campus/support/book'&&request.method==='POST'){
   if(user.role!=='student')fail(403,'Запись доступна ученикам.');const slot=await env.DB.prepare('SELECT s.* FROM campus_slots s JOIN school_users u ON u.id=s.teacher_id AND u.active=1 WHERE s.id=? AND s.starts_at>? AND s.cancelled_at IS NULL').bind(str(b.slotId,80),now).first();if(!slot)fail(404,'Это время уже недоступно.');const booked=id();const result=await run(env,"INSERT INTO campus_bookings SELECT ?,?,?,?,'booked',? WHERE NOT EXISTS(SELECT 1 FROM campus_bookings WHERE slot_id=? AND status!='cancelled') AND EXISTS(SELECT 1 FROM campus_slots WHERE id=? AND cancelled_at IS NULL) AND NOT EXISTS(SELECT 1 FROM campus_bookings b JOIN campus_slots s ON s.id=b.slot_id WHERE b.student_id=? AND b.status='booked' AND s.starts_at<? AND s.starts_at+s.minutes*60000>?)",booked,slot.id,user.id,str(b.note||'',600,false),now,slot.id,slot.id,user.id,slot.starts_at+slot.minutes*60000,slot.starts_at);if(!result.meta.changes)fail(409,'Время занято или пересекается с другой вашей записью.');return response({id:booked},201);
  }
  if(path==='/api/campus/support/status'&&request.method==='POST'){
   const booking=await env.DB.prepare('SELECT b.*,s.teacher_id,s.starts_at FROM campus_bookings b JOIN campus_slots s ON s.id=b.slot_id WHERE b.id=?').bind(b.id).first();if(!booking)fail(404,'Запись не найдена.');if(user.role!=='admin'&&booking.student_id!==user.id&&booking.teacher_id!==user.id)fail(403,'Нет доступа.');const status=one(b.status,['completed','cancelled']);if(user.role==='student'&&(status==='completed'||booking.starts_at<now||booking.status!=='booked'))fail(403,'Запись уже нельзя изменить.');await run(env,'UPDATE campus_bookings SET status=? WHERE id=?',status,booking.id);return response({ok:true});
  }
  if(path==='/api/campus/catalog'&&request.method==='GET')return response({items:await all(env,`SELECT * FROM campus_catalog ${user.role==='admin'?'':'WHERE active=1'} ORDER BY created_at DESC`),orders:await all(env,`SELECT o.*,c.title,u.first_name||' '||u.last_name AS user_name FROM campus_orders o JOIN campus_catalog c ON c.id=o.item_id JOIN school_users u ON u.id=o.user_id ${user.role==='admin'?'':'WHERE o.user_id=?'} ORDER BY o.created_at DESC`,...(user.role==='admin'?[]:[user.id])),registered:(await all(env,'SELECT event_id FROM campus_event_bookings WHERE user_id=?',user.id)).map(r=>r.event_id)});
  if(path==='/api/campus/catalog'&&request.method==='POST'){
   admin(user);const kind=one(b.kind,['reward','event','university','video']),link=str(b.url||'',2000,false);if(link){let u;try{u=new URL(link);}catch{fail(400,'Укажите корректную ссылку.');}if(u.protocol!=='https:')fail(400,'Используйте HTTPS-ссылку.');}const cost=Number(b.cost||0),stock=Number(b.stock||0);if(!Number.isInteger(cost)||cost<0||cost>100000||!Number.isInteger(stock)||stock<0||stock>10000)fail(400,'Проверьте стоимость и количество.');const item=id();await run(env,'INSERT INTO campus_catalog VALUES(?,?,?,?,?,?,?,?,1,?)',item,kind,str(b.title,160),str(b.description,3000),link,cost,stock,str(b.date||'',40,false),now);return response({id:item},201);
  }
  if(path==='/api/campus/catalog/status'&&request.method==='POST'){admin(user);if(typeof b.active!=='boolean')fail(400,'Укажите статус.');await run(env,'UPDATE campus_catalog SET active=? WHERE id=?',b.active?1:0,b.id);return response({ok:true});}
  if(path==='/api/campus/shop/redeem'&&request.method==='POST'){
   if(user.role!=='student')fail(403,'Награды доступны ученикам.');const item=await env.DB.prepare("SELECT * FROM campus_catalog WHERE id=? AND kind='reward' AND active=1").bind(b.itemId).first();if(!item)fail(404,'Награда не найдена.');const stats=await metrics(env,user.id);if(stats.coins<item.cost)fail(400,'Пока не хватает баллов ORBIT.');const order=id();
   // One guarded statement atomically reserves stock and checks the current wallet.
   const result=await run(env,"INSERT INTO campus_orders(id,user_id,item_id,cost,status,created_at) SELECT ?,?,?,?,'requested',? WHERE (SELECT count(*) FROM campus_orders WHERE item_id=? AND status!='cancelled')<? AND COALESCE((SELECT SUM(cost) FROM campus_orders WHERE user_id=? AND status!='cancelled'),0)+?<=?",order,user.id,item.id,item.cost,now,item.id,item.stock,user.id,item.cost,stats.earned);
   if(!result.meta.changes)fail(409,'Награда закончилась или баланс изменился. Обновите страницу.');return response({id:order},201);
  }
  if(path==='/api/campus/shop/status'&&request.method==='POST'){admin(user);const status=one(b.status,['fulfilled','cancelled']);await run(env,"UPDATE campus_orders SET status=? WHERE id=? AND status='requested'",status,b.id);return response({ok:true});}
  if(path==='/api/campus/events/book'&&request.method==='POST'){const event=await env.DB.prepare("SELECT * FROM campus_catalog WHERE id=? AND kind='event' AND active=1").bind(b.eventId).first();if(!event)fail(404,'Событие не найдено.');await run(env,'INSERT INTO campus_event_bookings VALUES(?,?,?) ON CONFLICT DO NOTHING',event.id,user.id,now);return response({ok:true});}
  if(path==='/api/campus/requests'&&request.method==='GET')return response({requests:await all(env,`SELECT r.*,u.first_name||' '||u.last_name AS user_name FROM campus_requests r JOIN school_users u ON u.id=r.user_id ${user.role==='admin'?'':'WHERE user_id=?'} ORDER BY created_at DESC`,...(user.role==='admin'?[]:[user.id]))});
  if(path==='/api/campus/requests'&&request.method==='POST'){const kind=one(b.kind,['referral','letter','university']);await run(env,'INSERT INTO campus_requests VALUES(?,?,?,?,\'new\',\'\',?)',id(),user.id,kind,str(b.body,3000),now);return response({ok:true},201);}
  if(path==='/api/campus/requests/reply'&&request.method==='POST'){admin(user);await run(env,'UPDATE campus_requests SET reply=?,status=? WHERE id=?',str(b.reply,3000),one(b.status,['done','in_progress']),b.id);return response({ok:true});}
  if(path==='/api/campus/messages'&&request.method==='GET'){
   const contacts=await all(env,`SELECT DISTINCT u.* FROM school_users u WHERE u.active=1 AND u.id!=? AND (u.role='admin' OR ?='admin' OR (u.role='teacher' AND u.id IN (SELECT g.teacher_id FROM school_groups g JOIN school_members m ON m.group_id=g.id WHERE m.student_id=?)) OR (u.role='student' AND u.id IN (SELECT m.student_id FROM school_members m JOIN school_groups g ON g.id=m.group_id WHERE g.teacher_id=?)))`,user.id,user.role,user.id,user.id);
   const messages=await all(env,'SELECT * FROM campus_messages WHERE sender_id=? OR recipient_id=? ORDER BY created_at DESC,id DESC LIMIT 300',user.id,user.id);
   const reactions=await all(env,'SELECT r.message_id,r.user_id,r.emoji FROM campus_message_reactions r JOIN (SELECT id FROM campus_messages WHERE sender_id=? OR recipient_id=? ORDER BY created_at DESC,id DESC LIMIT 300) m ON m.id=r.message_id',user.id,user.id);
   const decorated=messages.reverse().map(message=>({...message,reactions:reactions.filter(r=>r.message_id===message.id).map(({user_id,emoji})=>({userId:user_id,emoji}))}));
   const tag='"chat-'+await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([contacts.map(person),decorated]))).then(hash=>Array.from(new Uint8Array(hash)).map(n=>n.toString(16).padStart(2,'0')).join(''))+'"';
   if(request.headers.get('if-none-match')===tag)return new Response(null,{status:304,headers:{ETag:tag,'Cache-Control':'private, no-cache'}});
   const result=response({contacts:contacts.map(person),messages:decorated});result.headers.set('ETag',tag);return result;
  }
  if(path==='/api/campus/messages/read'&&request.method==='POST'){await run(env,'UPDATE campus_messages SET read_at=? WHERE recipient_id=? AND sender_id=? AND read_at IS NULL',now,user.id,str(b.senderId,80));return response({ok:true});}
  if(path==='/api/campus/messages'&&request.method==='POST'){
   const target=await env.DB.prepare('SELECT * FROM school_users WHERE id=? AND active=1').bind(str(b.recipientId,80)).first();if(!target||target.id===user.id)fail(400,'Выберите получателя.');
   if(user.role!=='admin'&&target.role!=='admin'&&!await env.DB.prepare('SELECT 1 FROM school_groups g JOIN school_members m ON m.group_id=g.id WHERE (g.teacher_id=? AND m.student_id=?) OR (g.teacher_id=? AND m.student_id=?)').bind(user.id,target.id,target.id,user.id).first())fail(403,'Можно написать своему учителю или администрации.');
   const kind=one(b.kind||'text',['text','sticker']),stickerId=kind==='sticker'?one(b.stickerId,chatStickers.map(s=>s.id)):null,textBody=kind==='sticker'?'':str(b.body,3000);
   const replyTo=b.replyTo?str(b.replyTo,80):null,clientId=b.clientId?str(b.clientId,80):null;
   if(replyTo&&!await env.DB.prepare('SELECT id FROM campus_messages WHERE id=? AND ((sender_id=? AND recipient_id=?) OR (sender_id=? AND recipient_id=?))').bind(replyTo,user.id,target.id,target.id,user.id).first())fail(400,'Можно ответить только на сообщение этого разговора.');
   if(clientId){const existing=await env.DB.prepare('SELECT * FROM campus_messages WHERE sender_id=? AND client_id=?').bind(user.id,clientId).first();if(existing){if(existing.recipient_id!==target.id||existing.kind!==kind||existing.body!==textBody||existing.sticker_id!==stickerId||existing.reply_to!==replyTo)fail(409,'Этот идентификатор уже использован.');return response({ok:true,message:{...existing,reactions:[]}});}}
   const recent=await env.DB.prepare('SELECT count(*) AS count FROM campus_messages WHERE sender_id=? AND created_at>?').bind(user.id,now-60000).first();if(recent.count>=20)fail(429,'Слишком много сообщений. Подождите минуту.');
   const message={id:id(),sender_id:user.id,recipient_id:target.id,body:textBody,read_at:null,created_at:now,kind,sticker_id:stickerId,reply_to:replyTo,client_id:clientId};
   await run(env,'INSERT INTO campus_messages(id,sender_id,recipient_id,body,read_at,created_at,kind,sticker_id,reply_to,client_id) VALUES(?,?,?,?,NULL,?,?,?,?,?)',message.id,user.id,target.id,textBody,now,kind,stickerId,replyTo,clientId);return response({ok:true,message:{...message,reactions:[]}},201);
  }
  const reactionMatch=path.match(/^\/api\/campus\/messages\/([^/]+)\/reactions$/);
  if(reactionMatch&&request.method==='POST'){
   const message=await env.DB.prepare('SELECT id FROM campus_messages WHERE id=? AND (sender_id=? OR recipient_id=?)').bind(reactionMatch[1],user.id,user.id).first();if(!message)fail(404,'Сообщение не найдено.');
   const emoji=one(b.emoji,chatReactions);if(typeof b.active!=='boolean')fail(400,'Укажите состояние реакции.');
   if(b.active)await run(env,'INSERT INTO campus_message_reactions VALUES(?,?,?,?) ON CONFLICT(message_id,user_id,emoji) DO NOTHING',message.id,user.id,emoji,now);
   else await run(env,'DELETE FROM campus_message_reactions WHERE message_id=? AND user_id=? AND emoji=?',message.id,user.id,emoji);
   return response({ok:true});
  }
  if(path==='/api/campus/practice/start'&&request.method==='POST'){
   const recent=await env.DB.prepare('SELECT count(*) AS count FROM campus_attempts WHERE user_id=? AND created_at>?').bind(user.id,now-60000).first();if(recent.count>=6)fail(429,'Подождите минуту перед новой попыткой.');
   const mode=one(b.mode,['sprint','smart','duel','mock']);const pool=[...practiceBank].sort(()=>Math.random()-.5),questions=pool.slice(0,mode==='mock'?12:mode==='sprint'?8:6),attempt=id(),duration=mode==='mock'?20*60000:mode==='sprint'?90000:10*60000;
   await run(env,'DELETE FROM campus_attempts WHERE expires_at<? AND score IS NULL',now-86400000);await run(env,'INSERT INTO campus_attempts VALUES(?,?,?,?,NULL,NULL,?,?,?)',attempt,user.id,mode,JSON.stringify(questions.map(q=>q.id)),questions.length,now+duration,now);return response({id:attempt,mode,expiresAt:now+duration,questions:questions.map(({answer,why,...q})=>q)});
  }
  if(path==='/api/campus/practice/finish'&&request.method==='POST'){
   const attempt=await env.DB.prepare('SELECT * FROM campus_attempts WHERE id=? AND user_id=?').bind(b.id,user.id).first();if(!attempt)fail(404,'Попытка не найдена.');if(attempt.score!==null)fail(409,'Результат уже сохранён.');if(now>attempt.expires_at+30000)fail(400,'Время попытки истекло. Начните заново.');const questions=JSON.parse(attempt.questions).map(id=>practiceBank.find(q=>q.id===id));if(!Array.isArray(b.answers)||b.answers.length!==questions.length||b.answers.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>3)))fail(400,'Некорректные ответы.');const score=questions.filter((q,i)=>q.answer===b.answers[i]).length;
   const result=await run(env,'UPDATE campus_attempts SET answers=?,score=? WHERE id=? AND user_id=? AND score IS NULL',JSON.stringify(b.answers),score,attempt.id,user.id);if(!result.meta.changes)fail(409,'Результат уже сохранён.');return response({score,total:questions.length,review:questions.map((q,i)=>({q:q.q,correct:q.answer,selected:b.answers[i],options:q.options,why:q.why})),stats:await metrics(env,user.id)});
  }
  if(path==='/api/campus/rooms'&&request.method==='GET')return response({rooms:await all(env,'SELECT r.*,u.first_name||\' \'||u.last_name AS owner_name,(SELECT count(*) FROM campus_room_members m WHERE m.room_id=r.id AND m.seen_at>?) AS members FROM campus_rooms r JOIN school_users u ON u.id=r.owner_id WHERE r.created_at>? ORDER BY r.created_at DESC LIMIT 30',now-45000,now-6*3600000)});
  if(path==='/api/campus/rooms'&&request.method==='POST'){const recent=await env.DB.prepare('SELECT count(*) AS count FROM campus_rooms WHERE owner_id=? AND created_at>?').bind(user.id,now-60000).first();if(recent.count>=3)fail(429,'Подождите минуту перед созданием новой комнаты.');await run(env,'DELETE FROM campus_rooms WHERE created_at<?',now-6*3600000);const room=id();await run(env,'INSERT INTO campus_rooms VALUES(?,?,?,?,?)',room,user.id,str(b.name,100),one(b.kind,['pair','group']),now);return response({id:room},201);}
  const roomMatch=path.match(/^\/api\/campus\/rooms\/([^/]+)\/(join|poll|signal|leave)$/);
  if(roomMatch){const room=await env.DB.prepare('SELECT * FROM campus_rooms WHERE id=? AND created_at>?').bind(roomMatch[1],now-6*3600000).first();if(!room)fail(404,'Комната закрыта.');const action=roomMatch[2];
   if(action==='join'&&request.method==='POST'){const capacity=room.kind==='pair'?2:4;const result=await run(env,'INSERT INTO campus_room_members SELECT ?,?,? WHERE (SELECT count(*) FROM campus_room_members WHERE room_id=? AND seen_at>?)<? OR EXISTS(SELECT 1 FROM campus_room_members WHERE room_id=? AND user_id=?) ON CONFLICT(room_id,user_id) DO UPDATE SET seen_at=excluded.seen_at',room.id,user.id,now,room.id,now-45000,capacity,room.id,user.id);if(!result.meta.changes)fail(409,'В комнате нет свободных мест.');return response({ok:true});}
   const member=await env.DB.prepare('SELECT * FROM campus_room_members WHERE room_id=? AND user_id=? AND seen_at>?').bind(room.id,user.id,now-60000).first();if(!member)fail(403,'Сначала войдите в комнату.');
   if(action==='leave'&&request.method==='POST'){await run(env,'DELETE FROM campus_room_members WHERE room_id=? AND user_id=?',room.id,user.id);return response({ok:true});}
   if(action==='signal'&&request.method==='POST'){const recipient=str(b.recipientId,80);if(!await env.DB.prepare('SELECT 1 FROM campus_room_members WHERE room_id=? AND user_id=? AND seen_at>?').bind(room.id,recipient,now-60000).first())fail(404,'Участник вышел.');const payload=JSON.stringify(b.payload);if(payload.length>30000||!b.payload||!['offer','answer','candidate'].includes(b.payload.type))fail(400,'Некорректный сигнал.');await run(env,'INSERT INTO campus_signals VALUES(?,?,?,?,?,?)',id(),room.id,user.id,recipient,payload,now);return response({ok:true});}
   if(action==='poll'&&request.method==='GET'){await run(env,'UPDATE campus_room_members SET seen_at=? WHERE room_id=? AND user_id=?',now,room.id,user.id);const signals=await all(env,'SELECT * FROM campus_signals WHERE room_id=? AND recipient_id=? ORDER BY created_at',room.id,user.id);if(signals.length)await env.DB.batch(signals.map(s=>env.DB.prepare('DELETE FROM campus_signals WHERE id=?').bind(s.id)));return response({room,members:(await all(env,'SELECT u.* FROM campus_room_members m JOIN school_users u ON u.id=m.user_id WHERE m.room_id=? AND m.seen_at>?',room.id,now-45000)).map(person),signals:signals.map(s=>({...s,payload:JSON.parse(s.payload)}))});}
  }
  fail(404,'Раздел не найден.');
 }catch(e){if(e instanceof Fault)return response({error:e.message},e.status);if(String(e.message).includes('UNIQUE constraint'))return response({error:'Запись уже существует или время занято.'},409);console.error('Campus request failed',e.message);return response({error:'Не удалось выполнить запрос. Попробуйте снова.'},503);}
}
