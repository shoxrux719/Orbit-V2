import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {chapters,courseUnits} from './course-content.js';
import {validateExercise,checkExercise,publicExercise,normaliseExercise} from './exercise-check.js';
test('108 original units contain complete level-specific journeys and 3888 gradable questions',()=>{
 assert.equal(courseUnits.length,108);assert.equal(new Set(courseUnits.map(u=>u.id)).size,108);assert.equal(courseUnits.reduce((n,u)=>n+u.total,0),3888);
 for(const [level,list] of Object.entries(chapters)){assert.equal(list.length,12);assert.equal(courseUnits.filter(u=>u.level===level).length,36);for(const c of list){assert.equal(c.words.length,24);assert.equal(new Set(c.words.map(w=>w.word)).size,24);}}
 for(const unit of courseUnits){
  assert.equal(unit.steps.length,8);assert.equal(unit.steps[0].type,'vocabulary');assert.equal(unit.steps[1].type,'video');assert.equal(unit.steps[0].words.length,8);assert.equal(unit.total,36);
  for(const step of unit.steps)for(const original of step.questions){const q=validateExercise(original),answer=q.type==='choice'?q.answer:q.answers[0];assert.equal(checkExercise(q,answer),true,unit.id+' '+q.prompt);const visible=publicExercise(q);assert.equal(visible.answers,undefined);assert.equal(visible.answer,undefined);assert.equal(visible.explanation,undefined);if(q.type==='choice'){assert.equal(checkExercise(q,(q.answer+1)%q.options.length),false);assert.equal(q.options.length,3);}else assert.equal(checkExercise(q,'definitely incorrect'),false);}
 }
});
test('typed and word-order answers accept harmless formatting but reject wrong grammar and order',()=>{
 const q={type:'text',answers:['have not'],prompt:'They ___ finished.'};assert.equal(checkExercise(q,"  HAVEN’T.  "),true);assert.equal(checkExercise(q,'has not'),false);
 const order={type:'order',answers:['She is reading a book.']};assert.equal(checkExercise(order,'she is reading a book'),true);assert.equal(checkExercise(order,'She reading is a book'),false);
 assert.notEqual(normaliseExercise('She has a book'),normaliseExercise('She is a book'));
 assert.throws(()=>validateExercise({type:'order',prompt:'Order',answers:['I am here.'],tokens:['I','are','here']}));
});
test('course migration publishes only untouched drafts and preserves custom teaching material and progress',()=>{
 const db=new DatabaseSync(':memory:');try{
  db.exec(fs.readFileSync('design/school-schema.sql','utf8'));db.exec(fs.readFileSync('design/navigate-schema.sql','utf8'));
  db.prepare("UPDATE navigate_units SET title='My custom lesson',edition='Teacher edition',steps='[]',total_questions=1 WHERE id='A1-1.1'").run();
  db.exec(fs.readFileSync('design/course-seed.sql','utf8'));
  assert.equal(db.prepare("SELECT count(*) AS n FROM navigate_units WHERE status='published'").get().n,107);assert.equal(db.prepare("SELECT title FROM navigate_units WHERE id='A1-1.1'").get().title,'My custom lesson');
  const unit=db.prepare("SELECT * FROM navigate_units WHERE id='B1-12.3'").get();assert.equal(unit.total_questions,36);const steps=JSON.parse(unit.steps);
  for(const step of steps){if(step.mediaUrl)assert.ok(fs.statSync('design/assets/lessons/'+step.mediaUrl.split('/').at(-1)).size>1000);if(step.captions)assert.match(fs.readFileSync('design/assets/lessons/'+step.captions.split('/').at(-1),'utf8'),/^WEBVTT/);}
  db.exec(fs.readFileSync('design/course-seed.sql','utf8'));assert.equal(db.prepare("SELECT count(*) AS n FROM navigate_units WHERE status='published'").get().n,107);
 }finally{db.close();}
});
