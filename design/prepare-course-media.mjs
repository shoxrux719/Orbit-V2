import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {courseUnits} from './course-content.js';
const hash=s=>createHash('sha256').update(s).digest('hex').slice(0,12);
const units=courseUnits.map(u=>{
 const segments=[`Welcome to Orbit. ${u.title.split(' · ')[0]}. Our focus is ${u.focus}.`,u.rule,...u.examples,'Pause the video and say one example aloud. Now complete the tasks. You can try again and learn from every answer.'];
 const video=`${u.id.replace('.','-')}-${hash(segments.join('\n'))}`;
 return {...u,segments,video,audio:'story-'+hash(u.story)};
});
await fs.mkdir('.vercel/course-media',{recursive:true});await fs.mkdir('design/assets/lessons',{recursive:true});
await fs.writeFile('.vercel/course-media/plan.json',JSON.stringify(units,null,2));
console.log(`Prepared ${units.length} original video lessons and ${new Set(units.map(u=>u.audio)).size} listening stories.`);
