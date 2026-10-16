import test from 'node:test';
import assert from 'node:assert/strict';
import { journeys, normaliseAnswer } from './grammar-content.js';
import { t as topics } from '../publish-stage-20260920-1500/dist/server/_next/static/learning-data-DZjMNtax.js';

test('every existing topic has a complete journey and an independent assessment', () => {
  assert.equal(topics.length, 18);
  assert.deepEqual(Object.keys(journeys), topics.map(t=>t.id));
  for (const topic of topics) {
    const journey=journeys[topic.id];
    assert.ok(journey.sentence.includes(journey.chunk), topic.id);
    assert.equal(journey.meanings.length, 3);
    for (const field of [journey.place,journey.goal,journey.story,journey.clue,journey.gap.why,journey.build.translation,journey.build.why,journey.fix.why,...journey.meanings])
      for (const locale of ['ru','en','uz']) assert.ok(typeof field[locale]==='string' && field[locale].length>0,topic.id+' / '+locale);
    assert.ok(journey.gap.answers.every(a=>normaliseAnswer(a).length>0));
    assert.ok(journey.build.sentence.split(' ').length>=4);
    assert.ok(journey.fix.answers.every(a=>normaliseAnswer(a)!==normaliseAnswer(journey.fix.sentence)), topic.id);
    assert.equal(topic.questions.length, 4);
    assert.ok(topic.questions.every(q=>q.options[q.answer] && q.why));
  }
});

test('typing tolerates presentation differences and common contractions', () => {
  for (const [typed,expected] of [
    ['  He DOES NOT work here! ', 'He doesn’t work here.'],
    ['We did not go out yesterday', 'We didn’t go out yesterday.'],
    ["I'll call you tonight", 'I will call you tonight.'],
    ['She’s reading a book now', 'She is reading a book now.'],
    ["I've known her for years", 'I have known her for years.'],
    ["You mustn't park here", 'You must not park here.'],
  ]) assert.equal(normaliseAnswer(typed),normaliseAnswer(expected));
});

test('typing does not erase a wrong tense, a missing verb or a wrong word order', () => {
  for (const [typed,expected] of [
    ['takes','take'],['are play','are playing'],['had went','had gone'],
    ['She reading a book now','She is reading a book now'],
    ['Does work she on Saturdays','Does she work on Saturdays'],
    ['If it will rain, we will stay home','If it rains, we will stay home'],
  ]) assert.notEqual(normaliseAnswer(typed),normaliseAnswer(expected));
});
