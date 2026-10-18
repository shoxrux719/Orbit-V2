import fs from 'node:fs/promises';
const plan=JSON.parse(await fs.readFile('.vercel/course-media/plan.json','utf8'));
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const statements=['-- Original ORBIT practice course; preserve any existing customised or assigned unit.'];
for(const u of plan){
 for(const name of [u.video+'.mp4',u.video+'.vtt',u.audio+'.m4a'])await fs.access('design/assets/lessons/'+name);
 const steps=u.steps.map(s=>s.type==='video'?{...s,mediaUrl:'/orbit-lessons/'+u.video+'.mp4',captions:'/orbit-lessons/'+u.video+'.vtt'}:s.type==='listening'?{...s,mediaUrl:'/orbit-lessons/'+u.audio+'.m4a'}:s);
 statements.push(`UPDATE navigate_units SET title=${quote(u.title)},edition=${quote(u.edition)},status='published',steps=${quote(JSON.stringify(steps))},total_questions=${u.total},updated_at=1792281600000 WHERE id=${quote(u.id)} AND status='draft' AND total_questions=0 AND edition='' AND NOT EXISTS(SELECT 1 FROM navigate_assignments WHERE unit_id=navigate_units.id) AND NOT EXISTS(SELECT 1 FROM navigate_progress WHERE unit_id=navigate_units.id);`);
}
await fs.writeFile('design/course-seed.sql',statements.join('\n')+'\n');
console.log(`Course migration prepared: ${plan.length} units, ${plan.reduce((n,u)=>n+u.total,0)} questions. Existing custom material is protected.`);
