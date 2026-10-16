import { journeys, normaliseAnswer } from './grammar-content.js';

function factory(runtime) {
  return (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...(children.length ? { children: children.length === 1 ? children[0] : children } : {}) }, key);
  };
}

export function orbitGrammar(runtime, React, { topics, translate, locale, save, sessions = [], signedIn, navigate, speak, primitives }) {
  const h = factory(runtime);
  const c = (ru, en, uz) => locale === 'en' ? en : locale === 'uz' ? (uz || en) : ru;
  const content = value => typeof value === 'string' ? translate(value) : (value[locale] || value.en);
  const [group, setGroup] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [topic, setTopic] = React.useState(null);
  const [phase, setPhase] = React.useState(0);
  const [exercise, setExercise] = React.useState(0);
  const [value, setValue] = React.useState('');
  const [words, setWords] = React.useState([]);
  const [feedback, setFeedback] = React.useState(null);
  const [attempted, setAttempted] = React.useState(false);
  const [practice, setPractice] = React.useState([]);
  const [answers, setAnswers] = React.useState([]);
  const [saving, setSaving] = React.useState('');
  const [saveError, setSaveError] = React.useState('');
  const [quit, setQuit] = React.useState(false);
  const [resume, setResume] = React.useState(null);
  const focusRef = React.useRef(null);
  const started = React.useRef(0);
  const resultId = React.useRef('');
  const payload = React.useRef(null);
  const draftKey = 'orbit-grammar-journey-v1';
  const labels = [c('Почувствуй смысл', 'Find the meaning', 'Ma’noni anglang'), c('Разбери логику', 'Understand the form', 'Qoidani tushuning'), c('Попробуй сам', 'Guided practice', 'Mashq qiling'), c('Проверь себя', 'Independent check', 'O‘zingizni tekshiring'), c('Твой результат', 'Your result', 'Natijangiz')];
  const { Tabs, TabsList, TabsTrigger } = primitives;

  React.useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey));
      if (draft && topics.some(t => t.id === draft.topicId) && [0,1,2,3,4].includes(draft.phase) && Array.isArray(draft.answers) && Array.isArray(draft.practice) && Array.isArray(draft.words)) setResume(draft);
    } catch { /* Storage may be unavailable in a private browser. */ }
  }, []);
  React.useEffect(() => {
    if (!topic) return;
    try {
      if (phase === 4 && saving === 'done') sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, JSON.stringify({ topicId: topic.id, phase, exercise, value, words, feedback, attempted, practice, answers, started: started.current, payload: payload.current }));
    } catch { /* Learning remains usable without device storage. */ }
  }, [topic, phase, exercise, value, words, feedback, attempted, practice, answers, saving]);
  React.useEffect(() => {
    if (!topic) return;
    focusRef.current?.focus({ preventScroll: true });
    focusRef.current?.closest('.og-lesson')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [topic?.id, phase, exercise]);

  const resetQuestion = () => { setValue(''); setWords([]); setFeedback(null); setAttempted(false); };
  const open = (chosen, draft) => {
    setTopic(chosen); setPhase(draft?.phase || 0); setExercise(draft?.exercise || 0);
    setValue(draft?.value || ''); setWords(draft?.words || []); setFeedback(draft?.feedback || null);
    setAttempted(draft?.attempted || false); setPractice(draft?.practice || []); setAnswers(draft?.answers || []);
    setSaving(''); setSaveError(''); setQuit(false); setResume(null);
    started.current = draft?.started || Date.now(); resultId.current = draft?.payload?.id || ''; payload.current = draft?.payload || null;
  };
  React.useEffect(() => {
    const requested=sessionStorage.getItem('orbit-open-topic');
    if(requested){sessionStorage.removeItem('orbit-open-topic');const chosen=topics.find(t=>t.id===requested);if(chosen)open(chosen);}
  },[]);
  const close = () => { setTopic(null); setQuit(false); window.speechSynthesis?.cancel(); try { setResume(JSON.parse(sessionStorage.getItem(draftKey))); } catch {} };
  const latest = id => sessions.filter(s => s.kind === 'grammar' && s.itemId === id).sort((a,b) => b.createdAt - a.createdAt)[0];
  const mastered = topics.filter(t => { const s = latest(t.id); return s && s.score / s.total >= .8; }).length;
  const list = topics.filter(t => (group === 'all' || t.group === group) && (t.name + ' ' + translate(t.name) + ' ' + translate(t.summary)).toLowerCase().includes(search.toLowerCase()));
  const journey = topic ? journeys[topic.id] : null;
  const meaningPosition = topic ? topics.indexOf(topic) % 3 : 0;
  const meanings = journey ? journey.meanings.map((_,i) => journey.meanings[(i - meaningPosition + 3) % 3]) : [];
  const question = phase === 2 ? [journey.gap, journey.build, journey.fix][exercise] : null;
  const tokens = question?.type === 'build' ? question.sentence.split(' ').map((word, id) => ({ word, id })).sort((a,b) => ((a.id * 7 + 3) % 19) - ((b.id * 7 + 3) % 19)) : [];
  const built = words.map(id => question?.sentence.split(' ')[id]).join(' ');
  const current = phase === 3 ? topic.questions[exercise] : null;
  const score = topic ? answers.filter((a,i) => a === topic.questions[i]?.answer).length : 0;
  const wrong = topic ? topic.questions.map((q,i) => ({q,i})).filter(({q,i}) => answers[i] !== q.answer) : [];
  const canCheck = phase === 0 ? value !== '' : question?.type === 'build' ? words.length === tokens.length : value.trim().length > 0;
  const check = event => {
    event?.preventDefault();
    if (!canCheck || feedback?.correct) return;
    const correct = phase === 0 ? value === String(meaningPosition) : question.type === 'build' ? normaliseAnswer(built) === normaliseAnswer(question.sentence) : question.answers.some(a => normaliseAnswer(a) === normaliseAnswer(value));
    if (!attempted) setPractice(previous => [...previous, correct]);
    setAttempted(true); setFeedback({ correct });
  };
  const advance = () => {
    resetQuestion();
    if (phase === 0) setPhase(1);
    else if (phase === 1) { setExercise(0); setPhase(2); }
    else if (phase === 2 && exercise < 2) setExercise(exercise + 1);
    else if (phase === 2) { setExercise(0); setPhase(3); }
  };
  const assess = () => {
    if (value === '') return;
    const next = [...answers, Number(value)]; setAnswers(next); resetQuestion();
    if (exercise < topic.questions.length - 1) setExercise(exercise + 1);
    else {
      resultId.current = crypto.randomUUID();
      const date = new Date(); const day = [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
      payload.current = { id: resultId.current, kind: 'grammar', itemId: topic.id, score: next.filter((a,i) => a === topic.questions[i].answer).length, total: topic.questions.length, seconds: Math.min(7200, Math.max(0, Math.round((Date.now()-started.current)/1000))), day };
      setPhase(4);
    }
  };
  const saveResult = async () => {
    if (!payload.current || saving === 'busy' || saving === 'done') return;
    setSaving('busy'); setSaveError('');
    try { await save(payload.current); setSaving('done'); }
    catch { setSaving('error'); setSaveError(c('Не удалось сохранить. Результат остаётся здесь — проверь вход и повтори попытку.', 'Could not save. Your result remains here — check your sign-in and retry.', 'Saqlanmadi. Natija shu yerda — akkauntga kirib, qayta urinib ko‘ring.')); }
  };
  const options = (items, selected, onSelect) => <fieldset className="og-options"><legend className="og-sr-only">{c('Выбери ответ', 'Choose an answer', 'Javobni tanlang')}</legend>{items.map((item,i) => <label key={i} className={selected === String(i) ? 'is-selected' : ''}><input type="radio" name="og-answer" value={i} checked={selected === String(i)} onChange={() => {onSelect(String(i)); setFeedback(null);}} disabled={feedback?.correct}/><span className="og-option-letter">{String.fromCharCode(65+i)}</span><span>{item}</span></label>)}</fieldset>;

  if (!topic) return <div className="og-library">
    <div className="og-heading"><span className="orbit-overline">GRAMMAR, IN REAL LIFE</span><h1>{c('Не заучивай.', 'Don’t just memorise.', 'Faqat yodlamang.')}<br/><span>{c('Начни понимать.', 'Start understanding.', 'Tushunishni boshlang.')}</span></h1><p>{c('От первого «почему?» до уверенного предложения. Одна тема — одно маленькое открытие.', 'From your first “why?” to a confident sentence. One topic. One small discovery.', 'Birinchi «nega?»dan ishonchli gapgacha. Har bir mavzu — kichik kashfiyot.')}</p></div>
    <section className="og-start">
      <div className="og-start-copy"><span className="og-label">{resume ? c('ПРОДОЛЖИ ТАМ, ГДЕ ОСТАНОВИЛСЯ', 'PICK UP WHERE YOU LEFT OFF', 'TO‘XTAGAN JOYINGIZDAN DAVOM ETING') : c('ТВОЯ ПЕРВАЯ ИСТОРИЯ', 'YOUR FIRST STORY', 'BIRINCHI HIKOYANGIZ')}</span><h2>{resume ? topics.find(t=>t.id===resume.topicId)?.name : 'Present Simple'}</h2><p>{resume ? c('Текущий шаг сохранён в этой вкладке. Можно вернуться к нему после обновления страницы.', 'Your current step is kept in this tab, including after a page refresh.', 'Joriy bosqich bu sahifada saqlangan. Sahifa yangilansa ham davom etishingiz mumkin.') : content(journeys['present-simple'].goal)}</p><button className="og-primary" onClick={()=>open(topics.find(t=>t.id===(resume?.topicId || 'present-simple')),resume)}>{resume ? c('Продолжить урок', 'Continue lesson', 'Darsni davom ettirish') : c('Начать первый урок', 'Start your first lesson', 'Birinchi darsni boshlash')}<span>↗</span></button></div>
      <div className="og-start-art" aria-hidden="true"><div className="og-orbit-ring"/><div className="og-art-dot"/><span className="og-art-time">every day</span><b>I <span>do.</span></b><small>small steps. real understanding.</small></div>
    </section>
    <div className="og-route-strip">{labels.slice(0,4).map((label,i)=><div key={label}><span>{String(i+1).padStart(2,'0')}</span>{label}</div>)}</div>
    <div className="og-catalog-heading"><h2>{c('Найди свою тему.', 'Find your topic.', 'Mavzuni tanlang.')}</h2><span>{signedIn ? `${mastered} / ${topics.length} `+c('проверок пройдено', 'checks passed', 'tekshiruv bajarildi') : c('18 тем · в своём ритме', '18 topics · your own pace', '18 mavzu · o‘z ritmingizda')}</span></div>
    <div className="og-filters"><Tabs value={group} onValueChange={setGroup}><TabsList className="og-tabs">{['all','Present','Past','Future','Basics'].map(id=><TabsTrigger key={id} value={id}>{id==='all' ? c('Все темы','All topics','Barcha mavzular') : id==='Basics' ? c('Основы','Essentials','Asoslar') : id}</TabsTrigger>)}</TabsList></Tabs><label className="og-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m12 12 5 5"/></svg><input aria-label={c('Поиск по грамматике','Search grammar','Grammatika bo‘yicha qidiruv')} placeholder={c('Найти тему','Find a topic','Mavzuni qidiring')} value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className="og-topic-grid">{list.map(t=>{const session=latest(t.id); const passed=session && session.score/session.total>=.8; const repeat=passed && session.day < new Date().toLocaleDateString('en-CA'); return <button className={'og-topic '+(passed?'is-passed':'')} key={t.id} onClick={()=>open(t)}><div className="og-topic-meta"><span>{String(topics.indexOf(t)+1).padStart(2,'0')}</span><span>{t.level}</span>{passed&&<span className="og-passed-label">{repeat ? c('К повторению','Review due','Takrorlang') : c('Проверка пройдена','Check passed','Tekshiruv bajarildi')} ✓</span>}</div><h3>{translate(t.name)}</h3><p>{content(journeys[t.id].goal)}</p><div className="og-topic-footer"><span>{c('История · практика · проверка','Story · practice · check','Hikoya · mashq · tekshiruv')}</span><span aria-hidden="true">↗</span></div></button>})}</div>
    {!list.length&&<div className="og-empty"><h3>{c('Такой темы пока нет','No matching topic','Mavzu topilmadi')}</h3><p>{c('Попробуй другое название или убери фильтры.','Try another name or clear the filters.','Boshqa nom kiriting yoki filtrlarni tozalang.')}</p><button className="og-secondary" onClick={()=>{setSearch('');setGroup('all')}}>{c('Показать все темы','Show all topics','Barcha mavzular')}</button></div>}
    <p className="og-sources">{c('Сверяй правила с первоисточниками:','Explore the reference guides:','Qoidalar bo‘yicha manbalar:')} <a href="https://learnenglish.britishcouncil.org/grammar" target="_blank" rel="noreferrer">British Council</a> · <a href="https://dictionary.cambridge.org/grammar/british-grammar/" target="_blank" rel="noreferrer">Cambridge Dictionary</a></p>
  </div>;

  return <div className="og-lesson">
    <div className="og-lesson-top"><button className="og-back" onClick={()=>phase===4 ? close() : setQuit(true)}>← {c('Все темы','All topics','Barcha mavzular')}</button><span>{translate(topic.name)}<b>{topic.level}</b></span></div>
    {quit&&<div className="og-exit" role="status"><p>{c('Урок ещё не закончен. Текущий шаг останется в этой вкладке, чтобы ты мог продолжить.','The lesson is unfinished. Your current step stays in this tab so you can continue.','Dars tugamagan. Davom etish uchun joriy bosqich bu sahifada saqlanadi.')}</p><button className="og-secondary" onClick={()=>setQuit(false)}>{c('Остаться','Keep learning','Davom etish')}</button><button className="og-back" onClick={close}>{c('Вернуться к темам','Return to topics','Mavzularga qaytish')}</button></div>}
    <ol className="og-steps" aria-label={c('Этапы урока','Lesson stages','Dars bosqichlari')}>{labels.map((label,i)=><li key={label} className={i<phase?'is-done':i===phase?'is-current':''} aria-current={i===phase?'step':undefined}><span>{i<phase?'✓':i+1}</span><b>{label}</b></li>)}</ol>
    <div className="og-lesson-layout"><section className="og-stage" aria-labelledby="og-stage-title">
      <div className="og-stage-heading" ref={focusRef} tabIndex={-1}><span className="og-label">{phase<4 ? `${String(phase+1).padStart(2,'0')} / 04 · ` : ''}{phase===0?content(journey.place):labels[phase]}</span><h1 id="og-stage-title">{phase===0?c('Сначала — смысл.','Meaning comes first.','Avval — ma’no.'):phase===1?c('Теперь всё сходится.','Now it makes sense.','Endi hammasi tushunarli.'):phase===2?c('Твоя очередь.','Your turn.','Sizning navbatingiz.'):phase===3?c('Без подсказок.','On your own.','Yordamsiz.'):score/topic.questions.length>=.8?c('Понимание есть.','You’ve got it.','Tushundingiz.'):c('Ещё немного практики.','A little more practice.','Yana bir oz mashq.')}</h1></div>
      {phase===0&&<div><p className="og-lead">{content(journey.story)}</p><div className="og-scene"><span>{c('ТВОЯ ФРАЗА','YOUR SENTENCE','SIZNING GAPINGIZ')}</span><p>{journey.sentence.split(journey.chunk)[0]}<mark>{journey.chunk}</mark>{journey.sentence.split(journey.chunk)[1]}</p><button className="og-audio" aria-label={c('Прослушать фразу','Listen to the sentence','Gapni tinglash')} onClick={()=>speak(journey.sentence)}>↗ {c('Послушать','Listen','Tinglash')}</button></div><h2 className="og-question">{c('Что сообщает эта фраза?','What does this sentence tell us?','Bu gap nimani anglatadi?')}</h2>{options(meanings.map(content),value,setValue)}{feedback&&<div className={'og-feedback '+(feedback.correct?'is-good':'is-wrong')} role="status"><strong>{feedback.correct?c('Да, ты уловил смысл.','Yes, you found the meaning.','Ha, ma’noni tushundingiz.'):c('Посмотри на ситуацию ещё раз.','Look at the situation again.','Vaziyatga yana bir qarang.')}</strong><p>{content(journey.clue)}</p></div>}<div className="og-actions">{feedback?.correct?<button className="og-primary" onClick={advance}>{c('Разобраться в правиле','Understand the rule','Qoidani tushunish')} →</button>:<button className="og-primary" disabled={!canCheck} onClick={check}>{c('Проверить мысль','Check your idea','Fikrni tekshirish')}</button>}</div></div>}
      {phase===1&&<div><p className="og-lead">{translate(topic.summary)}</p><div className="og-insight"><span>01</span><div><h2>{c('Смысл выбирает форму','Meaning chooses the form','Ma’no shaklni tanlaydi')}</h2><p>{content(journey.clue)}</p></div></div><div className="og-insight"><span>02</span><div><h2>{c('Собери фразу по частям','Build the sentence','Gapni tuzing')}</h2><div className="og-formulas">{topic.formula.map(line=><div key={line}>{translate(line)}</div>)}</div></div></div><div className="og-insight"><span>03</span><div><h2>{c('Проверь на примерах','Look at examples','Misollarni ko‘ring')}</h2>{topic.examples.map(example=><div key={example} className="og-example"><p>{translate(example)}</p><button className="og-audio" aria-label={c('Озвучить пример','Listen to example','Misolni tinglash')} onClick={()=>speak(example.split(' — ')[0])}>▶</button></div>)}</div></div><aside className="og-note"><strong>{c('Ловушка, которую стоит заметить','A trap to notice','E’tibor berish kerak')}</strong><p>{translate(topic.tip)}</p></aside><p className="og-notation">{c('V — начальная форма · V2 — прошедшая форма · V3 — причастие прошедшего времени.','V — base form · V2 — past form · V3 — past participle.','V — boshlang‘ich shakl · V2 — o‘tgan zamon · V3 — o‘tgan zamon sifatdoshi.')}</p><div className="og-actions"><button className="og-primary" onClick={advance}>{c('Попробовать самому','Try it yourself','Mashq qilish')} →</button></div></div>}
      {phase===2&&<form onSubmit={check}><div className="og-question-meta"><span>{question.type==='gap'?c('Заполни пропуск','Fill the gap','Bo‘sh joyni to‘ldiring'):question.type==='build'?c('Собери предложение','Build a sentence','Gapni tuzing'):c('Исправь ошибку','Correct the mistake','Xatoni tuzating')}</span><span>{exercise+1} / 3</span></div><h2 className="og-question">{question.type==='gap'?c('Поставь глагол или слово в нужную форму.','Use the correct verb form or word.','To‘g‘ri shakl yoki so‘zni kiriting.'):question.type==='build'?content(question.translation):c('В этой фразе есть ошибка. Напиши её правильно.','This sentence has a mistake. Write it correctly.','Bu gapda xato bor. To‘g‘ri gapni yozing.')}</h2>{question.type==='build'?<div><div className="og-sentence-board" aria-live="polite">{words.length?words.map((id,i)=><button type="button" key={id} disabled={feedback?.correct} aria-label={c('Убрать слово ','Remove word ','So‘zni olib tashlash ')+question.sentence.split(' ')[id]} onClick={()=>{setWords(words.filter((_,n)=>n!==i));setFeedback(null)}}>{question.sentence.split(' ')[id]} <span>×</span></button>):<span>{c('Выбирай слова в правильном порядке','Choose words in the right order','So‘zlarni to‘g‘ri tartibda tanlang')}</span>}</div><div className="og-word-bank">{tokens.map(({word,id})=><button key={id} type="button" disabled={words.includes(id)||feedback?.correct} onClick={()=>{setWords([...words,id]);setFeedback(null)}}>{word}</button>)}</div><button type="button" className="og-back" disabled={!words.length||feedback?.correct} onClick={()=>{setWords([]);setFeedback(null)}}>{c('Начать сборку заново','Clear sentence','Gapni tozalash')}</button></div>:<div><div className={'og-prompt '+(question.type==='fix'?'og-mistake':'')}>{question.sentence}</div><label className="og-answer-field">{question.type==='gap'?c('Только пропущенные слова','Only the missing words','Faqat tushirib qoldirilgan so‘zlar'):c('Полное исправленное предложение','The full corrected sentence','To‘liq tuzatilgan gap')}<input lang="en" autoComplete="off" autoCapitalize="none" spellCheck={false} value={value} disabled={feedback?.correct} onChange={e=>{setValue(e.target.value);setFeedback(null)}} aria-describedby="og-answer-note" placeholder={question.type==='gap'?'…':c('Напиши по-английски','Write in English','Ingliz tilida yozing')}/></label><small id="og-answer-note" className="og-input-note">{c('Регистр, пунктуация и обычные сокращения не влияют на результат.','Capitalisation, punctuation and common contractions do not affect the result.','Katta harflar, tinish belgilari va oddiy qisqartmalar natijaga ta’sir qilmaydi.')}</small></div>}{feedback&&<div className={'og-feedback '+(feedback.correct?'is-good':'is-wrong')} role="status"><strong>{feedback.correct?c('Именно так.','Exactly.','To‘g‘ri.'):c('Почти. Попробуй ещё раз.','Almost. Try again.','Yana urinib ko‘ring.')}</strong><p>{content(question.why)}</p>{!feedback.correct&&question.type!=='build'&&<p>{c('Ориентир: ','A model: ','Namuna: ')}<b lang="en">{question.answers[0]}</b></p>}</div>}<div className="og-actions">{feedback?.correct?<button className="og-primary" type="button" onClick={advance}>{exercise===2?c('Перейти к проверке','Start the check','Tekshiruvni boshlash'):c('Следующее упражнение','Next exercise','Keyingi mashq')} →</button>:<button className="og-primary" type="submit" disabled={!canCheck}>{c('Проверить','Check','Tekshirish')}</button>}{question.type==='gap'&&!feedback?.correct&&<button className="og-back" type="button" onClick={()=>{if(!attempted){setPractice(p=>[...p,false]);setAttempted(true);}setFeedback({correct:false});}}>{c('Нужна подсказка','I need a hint','Yordam kerak')}</button>}</div></form>}
      {phase===3&&<div><p className="og-lead">{c('Четыре новых вопроса. Ответы и объяснения появятся в конце — здесь проверяем самостоятельное понимание.','Four new questions. Answers and explanations appear at the end, so this checks independent understanding.','To‘rtta yangi savol. Javoblar va izohlar oxirida ko‘rsatiladi.')}</p><div className="og-question-meta"><span>{c('Самостоятельная проверка','Independent check','Mustaqil tekshiruv')}</span><span>{exercise+1} / {topic.questions.length}</span></div><h2 className="og-question">{translate(current.q)}</h2>{options(current.options.map(translate),value,setValue)}<div className="og-actions"><button className="og-primary" disabled={value===''} onClick={assess}>{exercise===topic.questions.length-1?c('Посмотреть результат','See your result','Natijani ko‘rish'):c('Дальше','Continue','Davom etish')} →</button></div></div>}
      {phase===4&&<div><div className="og-score"><strong>{score}<span> / {topic.questions.length}</span></strong><p>{c('правильных ответов без подсказок','correct answers without hints','yordamsiz to‘g‘ri javoblar')}</p></div><p className="og-lead">{score/topic.questions.length>=.8?c('Эта проверка пройдена. Вернись к теме завтра и попробуй вспомнить правило на новых примерах.','This check is passed. Return tomorrow and recall the rule with fresh examples.','Tekshiruv bajarildi. Ertaga qaytib, qoidani yangi misollarda eslang.'):c('В этой проверке ещё остались ошибки. Разбери их, вернись к примерам и попробуй снова.','This check still has some mistakes. Review them, revisit the examples and try again.','Qoidani o‘rgandingiz. Xatolarni ko‘rib chiqing va qayta tekshiring.')}</p><div className="og-practice-score"><span>✓</span>{c('На тренировке с первой попытки: ','In guided practice, correct on first try: ','Mashqda birinchi urinishda: ')}<b>{practice.filter(Boolean).length} / 4</b></div>{wrong.length>0&&<section className="og-review"><h2>{c('Вот что стоит закрепить','What to reinforce','Nimani takrorlash kerak')}</h2>{wrong.map(({q,i})=><div key={i}><strong>{translate(q.q)}</strong><p className="og-review-wrong">{c('Твой ответ: ','Your answer: ','Javobingiz: ')}{translate(q.options[answers[i]])}</p><p>{c('Верно: ','Correct: ','To‘g‘ri: ')}<b>{translate(q.options[q.answer])}</b></p><p>{translate(q.why)}</p></div>)}</section>}<details className="og-all-answers"><summary>{c('Разбор всех ответов','Review all answers','Barcha javoblarni ko‘rish')}</summary>{topic.questions.map((q,i)=><div key={i}><strong>{answers[i]===q.answer?'✓':'↻'} {translate(q.q)}</strong><p>{translate(q.options[q.answer])} — {translate(q.why)}</p></div>)}</details><div className="og-save"><h2>{c('Сохрани этот шаг.','Keep this step.','Natijani saqlang.')}</h2>{signedIn?<div><button className="og-primary" disabled={saving==='busy'||saving==='done'} onClick={saveResult}>{saving==='busy'?c('Сохраняем…','Saving…','Saqlanmoqda…'):saving==='done'?c('Сохранено в прогрессе ✓','Saved to progress ✓','Natija saqlandi ✓'):saving==='error'?c('Повторить сохранение','Retry saving','Qayta saqlash'):c('Сохранить результат','Save your result','Natijani saqlash')}</button>{saveError&&<p role="alert">{saveError}</p>}</div>:<div><p>{c('Без входа результат доступен в этом уроке. В аккаунте занятия сохраняются между посещениями.','Without signing in, your result stays in this lesson. An account keeps results between visits.','Akkauntsiz natija shu darsda mavjud. Akkaunt natijalarni keyingi tashriflar uchun saqlaydi.')}</p><button className="og-secondary" onClick={()=>navigate('account')}>{c('Войти в аккаунт','Sign in','Akkauntga kirish')} →</button></div>}</div><div className="og-result-actions"><button className="og-secondary" onClick={()=>{setAnswers([]);setExercise(0);resetQuestion();setPhase(3);setSaving('');setSaveError('');started.current=Date.now();payload.current=null;}}>{c('Пройти проверку снова','Retake the check','Qayta tekshirish')}</button><button className="og-back" onClick={()=>{setPhase(1);resetQuestion();setAnswers([]);setPractice(practice.slice(0,1));setSaving('');setSaveError('');started.current=Date.now();payload.current=null;}}>{c('Повторить объяснение','Review the explanation','Qoidani takrorlash')}</button><button className="og-back" onClick={close}>{c('К другим темам','Explore other topics','Boshqa mavzular')} ↗</button></div></div>}
    </section><aside className="og-guide"><span className="og-label">{c('ПОСЛЕ ЭТОГО УРОКА','AFTER THIS LESSON','DARS OXIRIDA')}</span><h2>{content(journey.goal)}</h2><div className="og-guide-orbit" aria-hidden="true"><span>{phase===4?'✓':String(phase+1).padStart(2,'0')}</span></div><p>{phase===3?c('Попробуй вспомнить логику самостоятельно. Ошибки разберём в конце.','Recall the logic on your own. We will review mistakes at the end.','Qoidani mustaqil eslang. Xatolar oxirida ko‘rsatiladi.'):phase===4?c('Понимание становится привычкой через повторение.','Understanding becomes a habit through review.','Takrorlash tushunishni mustahkamlaydi.'):c('Не торопись. Понимание важнее скорости. На тренировке можно ошибаться и пробовать снова.','Take your time. Understanding matters more than speed. Guided practice lets you make mistakes and try again.','Shoshilmang. Tushunish tezlikdan muhim. Mashqda xato qilib, qayta urinishingiz mumkin.')}</p><div className="og-guide-progress" role="progressbar" aria-label={c('Прогресс урока','Lesson progress','Dars jarayoni')} aria-valuenow={phase*25} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${phase*25}%`}}/></div></aside></div>
  </div>;
}
