import { mountMotion } from './motion.js';
export { orbitGrammar } from './grammar.jsx';
export { orbitAccountGuest } from './account.jsx';
export { orbitSchool } from './school.jsx';
export { orbitCampus } from './campus.jsx';

function factory(runtime) {
  return (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...(children.length ? { children: children.length === 1 ? children[0] : children } : {}) }, key);
  };
}

function copy(locale) {
  const english = locale === 'en';
  const uzbek = locale === 'uz';
  return (ru, en, uz) => english ? en : uzbek ? (uz || ru) : ru;
}

export function orbitHeader(runtime, React, { view, navigate, locale, language, name }) {
  const h = factory(runtime);
  const c = copy(locale);
  React.useEffect(() => mountMotion(), []);
  const sections = [
    ['homework', c('Домашнее задание', 'Homework', 'Uy vazifasi'), '01'],
    ['grammar', c('Грамматика', 'Grammar', 'Grammatika'), '02'],
    ['vocabulary', c('Словарный запас', 'Vocabulary', 'So‘z boyligi'), '03'],
    ['reading', c('Чтение', 'Reading', 'O‘qish'), '04'],
    ['speaking', c('Разговорная студия', 'Speaking studio', 'Suhbat studiyasi'), '05'],
    ['listening', c('Аудирование', 'Listening', 'Tinglash'), '06'],
    ['writing', c('Студия письма', 'Writing studio', 'Yozish studiyasi'), '07'],
    ['books', c('Книжная полка', 'Bookshelf', 'Kitob javoni'), '08'],
    ['typing', c('Тренажёр печати', 'Typing studio', 'Yozish mashqi'), '09'],
    ['translator', c('Переводчик', 'Translator', 'Tarjimon'), '10'],
    ['progress', c('Мой прогресс', 'My progress', 'Natijalarim'), '11'],
  ];
  const go = (id, event) => {
    event?.currentTarget.closest('details')?.removeAttribute('open');
    navigate(id);
  };
  return <header className="orbit-header" data-view={view}>
    <div className="orbit-header-inner">
      <button className="orbit-wordmark" aria-label={c('ORBIT — главная', 'ORBIT — home', 'ORBIT — bosh sahifa')} onClick={() => navigate('home')}>
        <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="9"/><ellipse cx="20" cy="20" rx="18" ry="7" transform="rotate(-35 20 20)"/><circle className="orbit-mark-dot" cx="33" cy="9" r="3"/></svg>
        <span>orbit<span className="orbit-logo-period">.</span></span>
      </button>
      <nav className="orbit-navigation" aria-label={c('Основная навигация', 'Main navigation', 'Asosiy navigatsiya')}>
        <button className={view === 'home' ? 'is-active' : ''} onClick={() => navigate('home')}>{c('Обзор', 'Discover', 'Umumiy')}</button>
        <details className="orbit-nav-menu">
          <summary className={!['home', 'account', 'progress'].includes(view) ? 'is-active' : ''}>{c('Практика', 'Practice', 'Mashqlar')}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4 3 3 3-3"/></svg></summary>
          <div className="orbit-menu-panel">
            <span className="orbit-overline">{c('ТВОЁ ПРОСТРАНСТВО', 'YOUR SPACE', 'SENING MAKONING')}</span>
            {sections.map(([id, label, number]) => <button key={id} className={view === id ? 'is-active' : ''} onClick={event => go(id, event)}><span>{number}</span>{label}</button>)}
          </div>
        </details>
        <button className={view === 'account' ? 'is-active' : ''} onClick={() => navigate('account')}>{c('Мой кабинет', 'My campus', 'Mening kabinetim')}</button>
      </nav>
      <div className="orbit-header-actions">{language}<button className="orbit-account-button" onClick={() => navigate('account')}>{name || c('Войти', 'Sign in', 'Kirish')}</button></div>
    </div>
  </header>;
}

export function orbitHome(runtime, React, { setView, locale, today = 0, goal = 3 }) {
  const h = factory(runtime);
  const c = copy(locale);
  const skills = [
    { id: 'grammar', number: '01', name: c('Грамматика', 'Grammar', 'Grammatika'), title: c('Смысл.\nВ каждой фразе.', 'Meaning.\nIn every sentence.', 'Har bir gapda\nma’no.'), detail: c('Пойми логику языка.', 'Understand the logic of language.', 'Til mantiqini tushun.'), kind: 'grammar', art: 'Aa' },
    { id: 'vocabulary', number: '02', name: c('Словарь', 'Vocabulary', 'Lug‘at'), title: c('Найди\nсвои слова.', 'Find\nyour words.', 'O‘z so‘zlaringni\ntop.'), detail: c('Для того, что важно тебе.', 'For the things that matter to you.', 'Sen uchun muhim narsalar.'), kind: 'words', art: 'possibility' },
    { id: 'speaking', number: '03', name: c('Разговорная практика', 'Speaking', 'Suhbat'), title: c('Твой голос.\nБез границ.', 'Your voice.\nWithout limits.', 'Ovozing.\nChegarasiz.'), detail: c('Пусть тебя услышат.', 'Let the world hear you.', 'Dunyo seni eshitsin.'), kind: 'voice' },
    { id: 'reading', number: '04', name: c('Чтение', 'Reading', 'O‘qish'), title: c('Больше,\nчем слова.', 'More\nthan words.', 'So‘zlardan\nko‘proq.'), detail: c('Истории, которые открывают мир.', 'Stories that open up the world.', 'Dunyoni ochadigan hikoyalar.'), kind: 'reading', art: 'Once\nupon\na time.' },
    { id: 'listening', number: '05', name: c('Аудирование', 'Listening', 'Tinglash'), title: c('Почувствуй\nритм языка.', 'Feel the rhythm\nof language.', 'Til ohangini\nhis qil.'), detail: c('Живая речь. Настоящие диалоги.', 'Real voices. Real conversations.', 'Jonli nutq. Haqiqiy suhbatlar.'), kind: 'listening' },
    { id: 'writing', number: '06', name: c('Письмо', 'Writing', 'Yozish'), title: c('Мысли,\nкоторые звучат.', 'Thoughts\nthat resonate.', 'Jaranglaydigan\nfikrlar.'), detail: c('Вырази то, что чувствуешь.', 'Express what you feel.', 'Hislaringni ifoda et.'), kind: 'writing', art: 'Dear world,' },
  ];
  return <div className="orbit-home">
    <section className="orbit-hero" aria-labelledby="orbit-hero-title">
      <div className="orbit-hero-copy">
        <div className="orbit-hero-kicker"><span className="orbit-kicker-line"/>{c('НОВАЯ ТОЧКА ОТСЧЁТА', 'A NEW POINT OF VIEW', 'YANGI BOSHLANISH NUQTASI')}</div>
        <h1 id="orbit-hero-title">{c('Твой мир.', 'Your world.', 'Sening dunyong.')}<br/><span>{c('На английском.', 'In English.', 'Ingliz tilida.')}</span></h1>
        <p className="orbit-hero-description">{c('Не просто учить язык.', 'More than learning a language.', 'Til o‘rganishdan ko‘proq.')}<br/>{c('Открывать себя — с каждым словом.', 'Discovering yourself, one word at a time.', 'Har bir so‘z bilan o‘zingni kashf et.')}</p>
        <div className="orbit-hero-buttons">
          <button className="orbit-button orbit-button-dark" onClick={() => setView('homework')}>{c('Начать путешествие', 'Begin your journey', 'Sayohatni boshlash')}</button>
          <button className="orbit-film-button" data-orbit-action="intro"><span className="orbit-play-symbol"><svg viewBox="0 0 18 18" aria-hidden="true"><path d="m6 4 8 5-8 5Z"/></svg></span>{c('Смотреть интро', 'Watch the film', 'Introni ko‘rish')}</button>
        </div>
        <div className="orbit-hero-footnote">{c('В твоём ритме. В твоей орбите.', 'Your pace. Your orbit.', 'Sening ritming. Sening orbitang.')}</div>
      </div>
      <div className="orbit-hero-art">
        <div className="orbit-art-halo"/>
        <img className="orbit-sphere" src="/orbit-sphere.svg" alt="" width="800" height="800" fetchPriority="high"/>
        <div className="orbit-art-coordinate">ORBIT / ENGLISH IN MOTION</div>
        <button className="orbit-hello" aria-label={c('Послушать произношение Hello', 'Listen to Hello', 'Hello talaffuzini tinglash')} data-orbit-action="hello"><span className="orbit-hello-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 10 4 0 5-4v12l-5-4H4Z"/><path d="M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/></svg></span><span><b>Hello.</b><small>/həˈləʊ/</small></span><span className="orbit-hello-label">{c('Всё начинается здесь', 'It all starts here', 'Hammasi shu yerdan boshlanadi')}</span></button>
      </div>
      <div className="orbit-hero-bottom"><span>ENGLISH. A NEW PERSPECTIVE.</span><span>{c('Листай. Открывай.', 'Scroll. Discover.', 'Kashf et.')}<svg viewBox="0 0 18 24" aria-hidden="true"><rect x="4" y="2" width="10" height="19" rx="5"/><path d="M9 6v4"/></svg></span></div>
    </section>

    <section className="orbit-explore" id="orbit-explore" aria-labelledby="orbit-explore-title">
      <div className="orbit-section-heading" data-orbit-reveal><div><span className="orbit-overline">{c('ВЕСЬ ЯЗЫК. ТВОЯ ОРБИТА.', 'ONE LANGUAGE. YOUR ORBIT.', 'BIR TIL. SENING ORBITANG.')}</span><h2 id="orbit-explore-title">{c('Маленькие шаги.', 'Small steps.', 'Kichik qadamlar.')}<br/><span>{c('Большой новый мир.', 'A whole new world.', 'Butunlay yangi dunyo.')}</span></h2></div><p>{c('Шесть навыков. Бесконечно много возможностей.\nВыбери, что хочешь открыть сегодня.', 'Six skills. Endless possibilities.\nChoose what you want to discover today.', 'Olti ko‘nikma. Cheksiz imkoniyatlar.\nBugun nimani kashf etmoqchisan?')}</p></div>
      <div className="orbit-skills">
        {skills.map(skill => <button key={skill.id} className={'orbit-skill orbit-skill-' + skill.kind} onClick={() => setView(skill.id)} data-orbit-reveal>
          <div className="orbit-skill-top"><span>{skill.name}</span><span>{skill.number}</span></div>
          <div className={'orbit-skill-art orbit-skill-art-' + skill.kind} aria-hidden="true">
            {skill.art && <span>{skill.art}</span>}
            {skill.kind === 'words' && <div className="orbit-mini-sphere"/>}
            {['voice', 'listening'].includes(skill.kind) && <div className="orbit-wave">{Array.from({ length: 25 }, (_, i) => <i key={i} style={{ '--bar': i, '--height': (20 + Math.pow(Math.sin(i * 1.7), 2) * 75) + '%' }}/>)}</div>}
            {skill.kind === 'writing' && <div className="orbit-writing-lines"><i/><i/><i/></div>}
          </div>
          <div className="orbit-skill-copy"><h3>{skill.title}</h3><p>{skill.detail}</p><span className="orbit-skill-plus" aria-hidden="true">+</span></div>
        </button>)}
      </div>
    </section>

    <section className="orbit-cinema" data-orbit-reveal>
      <div className="orbit-cinema-art" aria-hidden="true"><div className="orbit-cinema-orb"/><div className="orbit-cinema-ring"/><div className="orbit-cinema-ring orbit-cinema-ring-two"/></div>
      <div className="orbit-cinema-copy"><span className="orbit-overline">{c('ТЫ МОЖЕШЬ БОЛЬШЕ', 'THERE IS MORE TO YOU', 'SEN KO‘PROG‘IGA QODIRSAN')}</span><h2>{c('Сначала слово.', 'First, a word.', 'Avval bir so‘z.')}<br/>{c('Потом — целый мир.', 'Then, a whole world.', 'Keyin — butun dunyo.')}</h2><p>{c('Новая история. Новая встреча. Новая возможность.\nТвой английский начинается с тебя.', 'A new story. A new connection. A new possibility.\nYour English begins with you.', 'Yangi hikoya. Yangi uchrashuv. Yangi imkoniyat.\nIngliz tiling sendan boshlanadi.')}</p><button className="orbit-button orbit-button-white" onClick={() => setView('speaking')}>{c('Найти свой голос', 'Find your voice', 'O‘z ovozingni top')}</button></div>
    </section>

    <section className="orbit-daily" data-orbit-reveal>
      <div className="orbit-section-heading"><div><span className="orbit-overline">{c('СЕГОДНЯ — ХОРОШИЙ ДЕНЬ', 'TODAY IS A GOOD DAY', 'BUGUN AJOYIB KUN')}</span><h2>{c('15 минут.', '15 minutes.', '15 daqiqa.')}<br/><span>{c('Только для тебя.', 'Just for you.', 'Faqat sen uchun.')}</span></h2></div><div className="orbit-daily-goal"><span>{c('Твоя дневная цель', 'Your daily goal', 'Kunlik maqsading')}</span><b>{today}<small> / {goal}</small></b><div><i style={{ width: Math.min(100, today / Math.max(1, goal) * 100) + '%' }}/></div><small>{c('Не спеши. Просто продолжай.', 'No rush. Just keep going.', 'Shoshilma. Davom et.')}</small></div></div>
      <div className="orbit-daily-items">
        {[['01', 'grammar', c('Разберись в Present Simple', 'Discover Present Simple', 'Present Simple bilan tanish'), c('Понять. Попробовать. Запомнить.', 'Understand. Try. Remember.', 'Tushun. Sinab ko‘r. Eslab qol.')], ['02', 'vocabulary', c('Найди 5 новых слов', 'Find 5 new words', '5 ta yangi so‘z top'), c('Для твоего следующего разговора.', 'For your next conversation.', 'Keyingi suhbating uchun.')], ['03', 'speaking', c('Расскажи миру о себе', 'Tell the world about yourself', 'Dunyoga o‘zing haqingda ayt'), c('Твоя первая история на английском.', 'Your first story in English.', 'Ingliz tilidagi ilk hikoyang.')]].map(([number, id, title, description]) => <button key={id} className="orbit-daily-item" onClick={() => setView(id)}><span className="orbit-daily-number">{number}</span><span><b>{title}</b><small>{description}</small></span><span className="orbit-daily-time">5 {c('мин', 'min', 'daq')}</span><span className="orbit-daily-plus" aria-hidden="true">+</span></button>)}
      </div>
    </section>

    <section className="orbit-extra" data-orbit-reveal><button onClick={() => setView('books')}><span className="orbit-overline">{c('КНИЖНАЯ ПОЛКА', 'YOUR BOOKSHELF', 'KITOB JAVONING')}</span><h3>{c('Оригинал.\nСовсем другой взгляд.', 'The original.\nA different perspective.', 'Asl nusxa.\nYangi nigoh.')}</h3><p>{c('Читай любимые истории на языке автора.', 'Read great stories in the author’s own words.', 'Hikoyalarni muallif tilida o‘qi.')}</p><span className="orbit-extra-art" aria-hidden="true">a<br/>story.</span><span className="orbit-skill-plus" aria-hidden="true">+</span></button><button onClick={() => setView('typing')}><span className="orbit-overline">{c('НАЙДИ СВОЙ FLOW', 'FIND YOUR FLOW', 'O‘Z RITMINGNI TOP')}</span><h3>{c('Думай.\nПечатай. Чувствуй.', 'Think.\nType. Feel.', 'O‘yla.\nYoz. His qil.')}</h3><p>{c('Живые выражения в твоём ритме.', 'Real expressions. Your rhythm.', 'Jonli iboralar. Sening ritming.')}</p><div className="orbit-keys" aria-hidden="true"><i>H</i><i>e</i><i>l</i><i>l</i><i>o</i></div><span className="orbit-skill-plus" aria-hidden="true">+</span></button></section>

    <footer className="orbit-footer"><button className="orbit-wordmark" aria-label="ORBIT" onClick={() => setView('home')}><span>orbit.</span></button><p>{c('Твой мир становится больше.', 'Your world is getting bigger.', 'Dunyong kengaymoqda.')}</p><span>© 2026 ORBIT</span><button className="orbit-footer-replay" data-orbit-action="intro">{c('Посмотреть интро ещё раз', 'Watch the film again', 'Introni yana ko‘rish')}</button></footer>

    <dialog id="orbit-intro" className="orbit-intro" aria-label={c('Добро пожаловать в ORBIT', 'Welcome to ORBIT', 'ORBITga xush kelibsiz')}>
      <div className="orbit-intro-stage"><img src="/orbit-sphere.svg" alt="" className="orbit-intro-orb"/><span className="orbit-intro-brand">ORBIT PRESENTS</span><div className="orbit-intro-frame orbit-intro-frame-one"><span>{c('Всё начинается', 'It all begins', 'Hammasi boshlanadi')}</span><span>{c('с одного слова.', 'with a single word.', 'bitta so‘zdan.')}</span></div><div className="orbit-intro-frame orbit-intro-frame-two">Hello<span>.</span></div><div className="orbit-intro-frame orbit-intro-frame-three"><span>{c('А дальше —', 'And then —', 'Keyin esa —')}</span><span>{c('целый мир.', 'a whole new world.', 'butun dunyo.')}</span></div><div className="orbit-intro-track"><i/></div><button className="orbit-intro-skip" data-orbit-action="skip">{c('Пропустить', 'Skip intro', 'O‘tkazib yuborish')}</button></div>
    </dialog>
  </div>;
}
