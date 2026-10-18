export function normaliseExercise(value){
 return String(value).normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'")
  .replace(/\bi'm\b/g,'i am').replace(/\b(you|we|they)'re\b/g,'$1 are')
  .replace(/\b(i|you|we|they)'ve\b/g,'$1 have').replace(/\bdoesn't\b/g,'does not').replace(/\bdon't\b/g,'do not')
  .replace(/\bhaven't\b/g,'have not').replace(/\bhasn't\b/g,'has not').replace(/\bhadn't\b/g,'had not')
  .replace(/\bdidn't\b/g,'did not').replace(/\bisn't\b/g,'is not').replace(/\baren't\b/g,'are not')
  .replace(/\bwasn't\b/g,'was not').replace(/\bweren't\b/g,'were not').replace(/\bwon't\b/g,'will not')
  .replace(/\bcan't\b/g,'cannot').replace(/\bmustn't\b/g,'must not').replace(/\bshouldn't\b/g,'should not')
  .replace(/\b([a-z]+)'ll\b/g,'$1 will').replace(/[.,!?;:"]/g,'').replace(/\s+/g,' ').trim();
}
export function validateExercise(q){
 const clean=(v,max=1500)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw Error('Заполните вопрос и варианты ответа.');return v.trim();};
 if(!q||typeof q!=='object')throw Error('Проверьте вопрос.');
 const type=q.type||'choice',common={type,prompt:clean(q.prompt),explanation:typeof q.explanation==='string'?q.explanation.slice(0,1500):''};
 if(type==='choice'){
  if(!Array.isArray(q.options)||q.options.length<2||q.options.length>6||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)throw Error('Для выбора ответа нужны 2–6 вариантов и номер правильного.');
  const options=q.options.map(v=>clean(v,500));if(new Set(options.map(normaliseExercise)).size!==options.length)throw Error('Варианты ответа должны различаться.');
  return {...common,options,answer:q.answer,...(typeof q.word==='string'?{word:q.word.slice(0,100)}:{})};
 }
 if(!['text','order'].includes(type)||!Array.isArray(q.answers)||!q.answers.length||q.answers.length>10)throw Error('Для ввода слова и порядка слов добавьте правильный ответ.');
 const answers=q.answers.map(v=>clean(v,500));
 if(type==='text')return {...common,answers,hint:typeof q.hint==='string'?q.hint.slice(0,40):''};
 if(!Array.isArray(q.tokens)||q.tokens.length<2||q.tokens.length>30)throw Error('Добавьте от 2 до 30 слов для сборки предложения.');
 const tokens=q.tokens.map(v=>clean(v,80)),normaliseTokens=s=>normaliseExercise(s).split(' ').sort().join(' ');
 if(answers.some(a=>normaliseTokens(a)!==normaliseTokens(tokens.join(' '))))throw Error('Набор слов должен соответствовать правильному предложению.');
 return {...common,answers,tokens};
}
export function publicExercise({answer,answers,explanation,...visible}){return visible;}
export function checkExercise(q,answer){
 if((q.type||'choice')==='choice'){
  if(!Number.isInteger(answer)||answer<0||answer>=q.options.length)throw Error('Выберите вариант ответа.');
  return answer===q.answer;
 }
 if(typeof answer!=='string'||!answer.trim()||answer.length>600)throw Error('Введите ответ или соберите предложение.');
 return q.answers.some(expected=>normaliseExercise(expected)===normaliseExercise(answer));
}
