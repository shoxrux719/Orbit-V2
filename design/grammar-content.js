import { uzJourneys } from './grammar-uz.js';
// Each lesson moves from meaning to form to independent recall.
const pair = (ru, en) => ({ ru, en });
const lesson = (place, goal, story, sentence, chunk, meanings, clue, gap, build, fix) => ({ place, goal, story, sentence, chunk, meanings, clue, gap, build, fix });
const gap = (sentence, answers, hint, why) => ({ type: 'gap', sentence, answers, hint, why });
const build = (sentence, translation, why) => ({ type: 'build', sentence, translation, why });
const fix = (sentence, answers, why) => ({ type: 'fix', sentence, answers, why });

export const journeys = {
  'present-simple': lesson(
    pair('Знакомство за кофе', 'Meeting over coffee'), pair('Рассказать о привычках и задать вопрос о чужом распорядке.', 'Describe habits and ask about someone’s routine.'),
    pair('Вы знакомитесь с новой коллегой. Она рассказывает, что обычно делает перед работой.', 'You meet a new colleague. She tells you what she usually does before work.'),
    'I walk to work every morning.', 'walk',
    [pair('Она обычно ходит на работу пешком.', 'She usually walks to work.'), pair('Она идёт на работу именно сейчас.', 'She is walking to work right now.'), pair('Она уже дошла до работы.', 'She has already arrived at work.')],
    pair('Every morning — повторяющееся действие. Present Simple описывает привычку, а не процесс в эту секунду.', 'Every morning signals a repeated action. Present Simple describes a habit, rather than an action in progress.'),
    gap('Mia ___ (take) the bus every day.', ['takes'], 'take → takes', pair('Mia = she. В утверждении с he / she / it добавляем -s: takes.', 'Mia = she. Add -s in a positive sentence with he / she / it: takes.')),
    build('Does she work on Saturdays?', pair('Она работает по субботам?', 'Ask whether she works on Saturdays.'), pair('Does + she + work. Окончание -s уже выражено в does, поэтому work без -s.', 'Does + she + work. Does carries the third-person ending, so work stays in its base form.')),
    fix('He doesn’t works here.', ['He doesn’t work here.', 'He does not work here.'], pair('После doesn’t нужна начальная форма work. Нельзя ставить -s дважды.', 'Use the base form work after doesn’t. Do not mark the third person twice.'))),
  'present-continuous': lesson(
    pair('Сообщение другу', 'A message to a friend'), pair('Описать действие сейчас и отличить его от привычки.', 'Describe an action in progress and distinguish it from a habit.'),
    pair('Друг звонит во время вашей подготовки к экзамену. Вы объясняете, почему сейчас заняты.', 'A friend calls while you are preparing for an exam. Explain why you are busy right now.'),
    'I am studying for my exam right now.', 'am studying',
    [pair('Учёба идёт прямо сейчас.', 'Studying is happening right now.'), pair('Это ежедневная привычка.', 'This is a daily habit.'), pair('Экзамен уже закончился.', 'The exam has already finished.')],
    pair('Right now задаёт текущий момент. Нужны и am, и studying: вспомогательный глагол + процесс.', 'Right now sets the current moment. Both am and studying are needed: the auxiliary and the ongoing action.'),
    gap('Look! The children ___ (play) outside.', ['are playing'], 'children = they → are + play-ing', pair('Children — множественное число: are playing. Look! обращает внимание на происходящее сейчас.', 'Children is plural: are playing. Look! draws attention to an action happening now.')),
    build('Are you waiting for the bus?', pair('Ты сейчас ждёшь автобус?', 'Ask whether someone is waiting for the bus.'), pair('В вопросе are стоит перед you, затем waiting. Do здесь не нужен.', 'Put are before you in the question, followed by waiting. Do is not needed.')),
    fix('She reading a book now.', ['She is reading a book now.'], pair('Пропущено is. Форма -ing сама по себе не образует Present Continuous.', 'Is is missing. An -ing form alone does not form Present Continuous.'))),
  'present-perfect': lesson(
    pair('Ключи исчезли', 'Missing keys'), pair('Связать прошлое действие с результатом сейчас.', 'Connect a past action with its present result.'),
    pair('Вы стоите у двери и не можете войти. Ключи потеряны, и это проблема прямо сейчас.', 'You are at the door and cannot get in. The keys are missing, and that matters now.'),
    'I have lost my keys.', 'have lost',
    [pair('Ключей сейчас нет, и я не могу войти.', 'The keys are missing now, so I cannot get in.'), pair('Я называю точное время потери вчера.', 'I specify the exact time I lost them yesterday.'), pair('Я теряю ключи каждый день.', 'I lose my keys every day.')],
    pair('Have lost подчёркивает результат в настоящем. Если назвать yesterday, нужен Past Simple: I lost my keys yesterday.', 'Have lost focuses on the present result. With yesterday, use Past Simple: I lost my keys yesterday.'),
    gap('She ___ (finish) her homework, so she can go out.', ['has finished'], 'she → has + finish-ed', pair('Есть результат сейчас: домашняя работа готова. She требует has.', 'There is a result now: the homework is ready. Use has with she.')),
    build('Have you ever visited London?', pair('Ты когда-нибудь бывал в Лондоне?', 'Ask about someone’s experience of visiting London.'), pair('Have + you + ever + V3. Вопрос об опыте до настоящего момента без законченной даты.', 'Have + you + ever + past participle. This asks about experience up to now without a finished date.')),
    fix('I have seen him yesterday.', ['I saw him yesterday.'], pair('Yesterday — законченное время в прошлом. Seen меняется на saw, have убираем.', 'Yesterday is a finished past time. Use saw and remove have.'))),
  'present-perfect-continuous': lesson(
    pair('Перерыв в учёбе', 'A study break'), pair('Сказать, как долго длится текущий процесс.', 'Say how long an ongoing activity has lasted.'),
    pair('Вы начали заниматься два часа назад и всё ещё учитесь. Сейчас пора сделать перерыв.', 'You started studying two hours ago and are still studying. It is time for a break.'),
    'I have been studying for two hours.', 'have been studying',
    [pair('Я начал раньше и всё ещё занимаюсь.', 'I started earlier and am still studying.'), pair('Я начну заниматься через два часа.', 'I will start studying in two hours.'), pair('Я учился только вчера.', 'I only studied yesterday.')],
    pair('For two hours — длительность до настоящего момента. Have been + -ing подчёркивает процесс.', 'For two hours is a duration up to now. Have been + -ing emphasises the activity.'),
    gap('They ___ (wait) since nine o’clock and are still here.', ['have been waiting'], 'have + been + wait-ing', pair('They → have. Since nine o’clock называет начало процесса, который продолжается.', 'Use have with they. Since nine o’clock gives the starting point of an ongoing activity.')),
    build('How long have you been learning English?', pair('Как давно ты учишь английский?', 'Ask how long someone has been learning English.'), pair('How long + have + you + been + learning. Спрашиваем о длительности процесса.', 'How long + have + you + been + learning. Ask about the duration of an activity.')),
    fix('I have been knowing her for years.', ['I have known her for years.'], pair('Know обычно обозначает состояние, поэтому здесь Present Perfect: have known.', 'Know normally describes a state, so use Present Perfect: have known.'))),
  'past-simple': lesson(
    pair('Вчерашний вечер', 'Yesterday evening'), pair('Рассказать о завершённом событии в прошлом.', 'Describe a completed past event.'),
    pair('В понедельник коллега спрашивает, как прошли выходные. Вы рассказываете о вчерашнем фильме.', 'On Monday, a colleague asks about your weekend. You tell them about a film you watched yesterday.'),
    'We watched a film yesterday.', 'watched',
    [pair('Просмотр закончился вчера.', 'The film was watched yesterday and is over.'), pair('Мы смотрим фильм сейчас.', 'We are watching it now.'), pair('Мы смотрим фильмы каждый день.', 'We watch films every day.')],
    pair('Yesterday — завершённый период. У правильного глагола watch добавляем -ed.', 'Yesterday is a finished period. Add -ed to the regular verb watch.'),
    gap('She ___ (go) home at six yesterday.', ['went'], 'go → went → gone', pair('В утверждении Past Simple нужна вторая форма. Go — неправильный глагол: went.', 'A positive Past Simple sentence uses the past form. Go is irregular: went.')),
    build('Did you enjoy the film?', pair('Тебе понравился фильм?', 'Ask whether someone enjoyed the film.'), pair('Did + you + enjoy. После did глагол возвращается в начальную форму.', 'Did + you + enjoy. After did, the verb returns to its base form.')),
    fix('We didn’t went out yesterday.', ['We didn’t go out yesterday.', 'We did not go out yesterday.'], pair('Прошедшее время уже выражено в didn’t, поэтому go, а не went.', 'Didn’t already marks the past, so use go rather than went.'))),
  'past-continuous': lesson(
    pair('Звонок посреди ужина', 'A call during dinner'), pair('Описать фон для короткого события в прошлом.', 'Describe the background to a short past event.'),
    pair('Вы ужинали, когда зазвонил телефон. Ужин уже шёл в момент звонка.', 'You were having dinner when the phone rang. Dinner was already in progress at that moment.'),
    'I was having dinner when the phone rang.', 'was having',
    [pair('Ужин был в процессе в момент звонка.', 'Dinner was in progress when the phone rang.'), pair('Ужин ещё не начался.', 'Dinner had not started.'), pair('Я всегда ужинаю после звонка.', 'I always have dinner after a call.')],
    pair('Was having — длительный фон. Rang — короткое событие, которое произошло на этом фоне.', 'Was having is the ongoing background. Rang is the short event that happened during it.'),
    gap('At eight last night, they ___ (watch) TV.', ['were watching'], 'they → were + watch-ing', pair('At eight last night задаёт момент в прошлом. They требует were.', 'At eight last night sets a past moment. Use were with they.')),
    build('Were you sleeping when I called?', pair('Ты спал, когда я позвонил?', 'Ask whether someone was asleep when you called.'), pair('Were + you + sleeping — вопрос о процессе; called — короткое завершённое действие.', 'Were + you + sleeping asks about an ongoing action; called is the short completed event.')),
    fix('They was waiting at the station.', ['They were waiting at the station.'], pair('С they нужна форма were. Was используется с I / he / she / it.', 'They takes were. Use was with I / he / she / it.'))),
  'past-perfect': lesson(
    pair('Опоздание на поезд', 'Missing the train'), pair('Показать, какое из двух прошлых событий случилось раньше.', 'Show which of two past events happened first.'),
    pair('Вы пришли на вокзал в десять. Поезд уехал в 9:55, и платформу вы увидели пустой.', 'You reached the station at ten. The train left at 9:55, so the platform was empty.'),
    'When I arrived, the train had left.', 'had left',
    [pair('Поезд уехал раньше моего прихода.', 'The train left before I arrived.'), pair('Поезд уехал после моего прихода.', 'The train left after I arrived.'), pair('Поезд ещё стоит на платформе.', 'The train is still at the platform.')],
    pair('Приход — точка отсчёта в прошлом. Had left показывает событие до этой точки.', 'Arrival is the past reference point. Had left describes an event before it.'),
    gap('By the time we arrived, the shop ___ (close).', ['had closed'], 'had + close-d', pair('Магазин закрылся до нашего прихода. Had одинаково для всех лиц.', 'The shop closed before our arrival. Had is the same for every subject.')),
    build('Had she eaten before the meeting?', pair('Она поела до встречи?', 'Ask whether she had eaten before the meeting.'), pair('Had + she + eaten. Eaten — третья форма eat.', 'Had + she + eaten. Eaten is the past participle of eat.')),
    fix('The train had went before I arrived.', ['The train had gone before I arrived.'], pair('После had нужна третья форма: go → went → gone.', 'Use the past participle after had: go → went → gone.'))),
  'past-perfect-continuous': lesson(
    pair('Усталость после прогулки', 'Tired after a walk'), pair('Объяснить длительность процесса до момента в прошлом.', 'Explain the duration of an activity before a past moment.'),
    pair('Вы нашли деревню после нескольких часов ходьбы. Рассказываете, почему тогда так устали.', 'You found a village after several hours of walking. Explain why you were so tired then.'),
    'We had been walking for hours when we found the village.', 'had been walking',
    [pair('Ходьба длилась до того, как мы нашли деревню.', 'Walking had lasted up to the moment we found the village.'), pair('Мы начнём идти после посещения деревни.', 'We will start walking after visiting the village.'), pair('Мы гуляем сейчас.', 'We are walking now.')],
    pair('Had been walking связывает длительный процесс с более поздней точкой в прошлом.', 'Had been walking connects a sustained activity to a later past reference point.'),
    gap('She was tired because she ___ (work) all day.', ['had been working'], 'had + been + work-ing', pair('Работа продолжалась до момента, когда она чувствовала усталость.', 'The work had continued up to the point when she felt tired.')),
    build('How long had you been waiting?', pair('Как долго ты ждал к тому моменту?', 'Ask how long someone had been waiting up to that point.'), pair('How long + had + you + been + waiting. Точка отсчёта находится в прошлом.', 'How long + had + you + been + waiting. The reference point is in the past.')),
    fix('We had been waited for an hour when she arrived.', ['We had been waiting for an hour when she arrived.'], pair('Процесс после had been требует -ing: waiting.', 'An ongoing action after had been needs the -ing form: waiting.'))),
  'future-simple': lesson(
    pair('Предложить помощь', 'Offering help'), pair('Выразить решение сейчас, обещание или предсказание.', 'Express a decision made now, a promise or a prediction.'),
    pair('Вы видите, что другу тяжело нести сумку, и тут же предлагаете помощь.', 'You see a friend struggling with a bag and immediately offer to help.'),
    'I will help you with that bag.', 'will help',
    [pair('Я предлагаю помощь прямо в момент разговора.', 'I offer help at the moment of speaking.'), pair('Я описываю привычку в прошлом.', 'I describe a past habit.'), pair('Я уже помог и ушёл.', 'I have already helped and left.')],
    pair('Will подходит для решения, принятого сейчас. После will — начальная форма без to.', 'Will is used for a decision made now. It is followed by the base form without to.'),
    gap('I think it ___ (rain) tomorrow.', ['will rain', '’ll rain', "'ll rain"], 'will + rain', pair('I think вводит предсказание. После will форма rain не меняется.', 'I think introduces a prediction. The verb rain stays in its base form after will.')),
    build('Will you help me tomorrow?', pair('Ты поможешь мне завтра?', 'Ask whether someone will help you tomorrow.'), pair('Will + you + help. Вопрос строится перестановкой will перед подлежащим.', 'Will + you + help. Form the question by placing will before the subject.')),
    fix('I will to call you tonight.', ['I will call you tonight.'], pair('Will — модальный глагол; после него не ставим to.', 'Will is a modal verb; do not put to after it.'))),
  'future-continuous': lesson(
    pair('Завтра в это время', 'This time tomorrow'), pair('Описать процесс в определённый момент будущего.', 'Describe an activity in progress at a future moment.'),
    pair('Ваш рейс завтра с десяти до двенадцати. Друг спрашивает, чем вы будете заняты в одиннадцать.', 'Your flight tomorrow runs from ten to twelve. A friend asks what you will be doing at eleven.'),
    'At eleven tomorrow, I will be flying to Rome.', 'will be flying',
    [pair('В одиннадцать я буду в процессе полёта.', 'At eleven, the flight will be in progress.'), pair('Я уже приземлился вчера.', 'I landed yesterday.'), pair('Я летаю в Рим каждый день.', 'I fly to Rome every day.')],
    pair('Мы мысленно оказываемся в будущем и видим процесс: will be + flying.', 'Imagine the future moment and see the activity in progress: will be + flying.'),
    gap('At six tomorrow, we ___ (have) dinner.', ['will be having', '’ll be having', "'ll be having"], 'will + be + have → having', pair('Ужин будет происходить в шесть, поэтому will be having.', 'Dinner will be in progress at six, so use will be having.')),
    build('Will you be working at eight?', pair('Ты будешь работать в восемь?', 'Ask whether someone will be working at eight.'), pair('Will + you + be + working. Сохраняем и be, и -ing.', 'Will + you + be + working. Keep both be and -ing.')),
    fix('She will be study at nine tomorrow.', ['She will be studying at nine tomorrow.'], pair('После will be для процесса нужна форма studying.', 'An activity in progress after will be needs studying.'))),
  'future-perfect': lesson(
    pair('Дедлайн в пятницу', 'A Friday deadline'), pair('Сказать, что будет готово к будущему сроку.', 'Say what will be completed by a future deadline.'),
    pair('Отчёт нужен в пятницу. Вы обещаете, что к этому сроку работа уже будет завершена.', 'The report is needed on Friday. You promise it will already be completed by then.'),
    'By Friday, I will have finished the report.', 'will have finished',
    [pair('К пятнице отчёт будет готов.', 'The report will be ready by Friday.'), pair('Я только начну отчёт в пятницу.', 'I will only start the report on Friday.'), pair('Я всегда пишу отчёты по пятницам.', 'I always write reports on Fridays.')],
    pair('By Friday — срок. Смотрим из будущего назад на завершённый результат: will have + V3.', 'By Friday is the deadline. Look back from the future at the completed result: will have + past participle.'),
    gap('By noon tomorrow, she ___ (finish) the test.', ['will have finished', '’ll have finished', "'ll have finished"], 'will + have + finish-ed', pair('К полудню тест уже завершится: will have finished.', 'The test will already be completed by noon: will have finished.')),
    build('Will you have finished by Friday?', pair('Ты закончишь к пятнице?', 'Ask whether the work will be finished by Friday.'), pair('Will + you + have + finished. By называет крайний срок.', 'Will + you + have + finished. By marks the deadline.')),
    fix('By then, I will have wrote the email.', ['By then, I will have written the email.'], pair('После will have нужна V3: write → wrote → written.', 'Use the past participle after will have: write → wrote → written.'))),
  'future-perfect-continuous': lesson(
    pair('Год в новой команде', 'A year with a new team'), pair('Посчитать длительность процесса к будущей дате.', 'State the duration of an activity at a future date.'),
    pair('Вы начали работать здесь в июле прошлого года. В наступающем июле исполнится год, и работа продолжится.', 'You started working here last July. This coming July marks a year, and the work will continue.'),
    'By July, I will have been working here for a year.', 'will have been working',
    [pair('В июле длительность моей работы достигнет года.', 'In July, the duration of my work will reach a year.'), pair('Я впервые начну работать в июле.', 'I will start working for the first time in July.'), pair('Я работал здесь только вчера.', 'I only worked here yesterday.')],
    pair('Важна длительность к сроку, а не завершённый объём работы: will have been + -ing.', 'The focus is the duration at a deadline, rather than a completed amount of work: will have been + -ing.'),
    gap('At ten, we ___ (drive) for six hours.', ['will have been driving', '’ll have been driving', "'ll have been driving"], 'will + have + been + drive → driving', pair('К десяти длительность поездки достигнет шести часов.', 'At ten, the journey’s duration will have reached six hours.')),
    build('How long will you have been studying by June?', pair('Как долго ты будешь учиться к июню?', 'Ask what the duration of studying will be by June.'), pair('How long + will + you + have been + studying. Длительность измеряется в будущей точке.', 'How long + will + you + have been + studying. Measure the duration at a future point.')),
    fix('By July, she will have been work here for a year.', ['By July, she will have been working here for a year.'], pair('После will have been для процесса нужна -ing форма: working.', 'An ongoing action after will have been needs the -ing form: working.'))),
  'articles': lesson(
    pair('Новая собака', 'A new dog'), pair('Отличить новый предмет от уже известного собеседнику.', 'Distinguish a new item from one already known to the listener.'),
    pair('Вы впервые упоминаете собаку, которую встретили. Во второй фразе собеседник уже знает, о какой собаке речь.', 'You mention a dog for the first time. In the second sentence, the listener knows which dog you mean.'),
    'I saw a dog. The dog was friendly.', 'The dog',
    [pair('The указывает на уже упомянутую собаку.', 'The refers to the dog already mentioned.'), pair('The означает любую неизвестную собаку.', 'The means any unknown dog.'), pair('Перед dog никогда не бывает артикля.', 'Dog never takes an article.')],
    pair('Сначала a dog — вводим предмет. Затем the dog — возвращаемся к конкретному знакомому предмету.', 'First a dog introduces the item. Then the dog refers back to that specific known item.'),
    gap('We waited for ___ hour.', ['an'], 'hour начинается с гласного звука /aʊ/', pair('H в hour не произносится. Выбираем an по первому звуку, а не по букве.', 'The h in hour is silent. Choose an by the first sound, rather than the letter.')),
    build('I saw a cat. The cat was black.', pair('Я увидел кошку. Эта кошка была чёрной.', 'Introduce a cat, then describe that same cat.'), pair('A cat — первое упоминание. The cat — тот же уже известный предмет.', 'A cat introduces it. The cat refers to the same known animal.')),
    fix('She gave me an advice.', ['She gave me some advice.', 'She gave me advice.', 'She gave me a piece of advice.'], pair('Advice — неисчисляемое слово. Подходят some advice или a piece of advice.', 'Advice is uncountable. Use some advice or a piece of advice.'))),
  'modals': lesson(
    pair('Совет другу', 'Advice for a friend'), pair('Выразить совет, умение и запрет без путаницы.', 'Express advice, ability and prohibition clearly.'),
    pair('Друг долго работает без отдыха. Вы мягко советуете сделать перерыв, а не отдаёте приказ.', 'A friend has been working without rest. You gently suggest a break rather than give an order.'),
    'You should take a break.', 'should take',
    [pair('Это совет.', 'This is advice.'), pair('Это строгий запрет.', 'This is a strict prohibition.'), pair('Это рассказ о вчерашнем событии.', 'This describes a past event.')],
    pair('Should передаёт совет. После модального глагола используется начальная форма без to.', 'Should expresses advice. A modal is followed by the base form without to.'),
    gap('She ___ (can / swim) very well.', ['can swim'], 'can + swim', pair('Can не получает -s даже с she. После него swim без to.', 'Can does not take -s with she. Follow it with swim without to.')),
    build('You must not park here.', pair('Здесь нельзя парковаться.', 'Express a prohibition on parking here.'), pair('Must not означает запрет. Don’t have to означает отсутствие необходимости.', 'Must not expresses prohibition. Don’t have to means there is no necessity.')),
    fix('He can to speak English.', ['He can speak English.'], pair('После can не ставим to. Speak остаётся в начальной форме.', 'Do not put to after can. Speak stays in its base form.'))),
  'conditionals': lesson(
    pair('Планы и погода', 'Plans and the weather'), pair('Связать условие с реальным или воображаемым результатом.', 'Connect a condition to a real or imagined result.'),
    pair('Вы планируете прогулку, но прогноз обещает дождь. Обсуждаете возможное решение на завтра.', 'You plan a walk, but rain is forecast. Discuss a possible decision for tomorrow.'),
    'If it rains, we will stay home.', 'If it rains',
    [pair('Это реальная возможная ситуация в будущем.', 'This is a real possibility in the future.'), pair('Это сожаление о прошлом.', 'This is regret about the past.'), pair('Это событие, которое уже точно случилось.', 'This is an event that has definitely already happened.')],
    pair('First conditional: if + Present Simple, will + V. Будущий смысл не требует will в части после if.', 'First conditional: if + Present Simple, will + base form. A future meaning does not require will after if.'),
    gap('If she ___ (study) tonight, she will be ready tomorrow.', ['studies'], 'if + Present Simple; she → -s', pair('В части с if используем Present Simple: studies. Will стоит в результате.', 'Use Present Simple in the if-clause: studies. Will belongs in the result.')),
    build('If I had more time, I would travel.', pair('Если бы у меня было больше времени, я бы путешествовал.', 'Describe an imagined situation with more time.'), pair('Second conditional: had обозначает воображаемое настоящее, would travel — его результат.', 'Second conditional: had describes an imagined present, and would travel is its result.')),
    fix('If it will rain, we will stay home.', ['If it rains, we will stay home.'], pair('В обычном условии о будущем после if нужен Present Simple: rains.', 'An ordinary future condition uses Present Simple after if: rains.'))),
  'passive': lesson(
    pair('История моста', 'The history of a bridge'), pair('Поставить в центр внимания предмет, над которым совершили действие.', 'Focus on the object affected by an action.'),
    pair('Гид рассказывает о мосте. Важны сам мост и год строительства, а строители не названы.', 'A guide talks about a bridge. The bridge and its construction date matter; the builders are not named.'),
    'The bridge was built in 1990.', 'was built',
    [pair('Мост — объект строительства, и действие в прошлом.', 'The bridge received the action, which happened in the past.'), pair('Мост сам что-то построил.', 'The bridge built something itself.'), pair('Мост ещё только будут строить.', 'The bridge will be built in the future.')],
    pair('Was показывает прошлое, built — V3 от build. Исполнителя можно добавить через by, если он важен.', 'Was marks the past; built is the past participle of build. Add the agent with by if it matters.'),
    gap('English ___ (speak) in many countries.', ['is spoken'], 'be в Present Simple + speak → spoken', pair('English — единственное число, поэтому is. Speak → spoke → spoken.', 'English is singular, so use is. Speak → spoke → spoken.')),
    build('The window was broken yesterday.', pair('Окно разбили вчера.', 'Describe what happened to the window yesterday.'), pair('Window получает действие. Was + broken выражает пассивный залог в прошлом.', 'The window receives the action. Was + broken forms the past passive.')),
    fix('The house was build in 1980.', ['The house was built in 1980.'], pair('В пассивном залоге после be нужна V3: build → built → built.', 'The passive uses the past participle after be: build → built → built.'))),
  'comparatives': lesson(
    pair('Выбираем сумку', 'Choosing a bag'), pair('Сравнить два предмета и выбрать один из группы.', 'Compare two items and identify one in a group.'),
    pair('Вы выбираете ручную кладь. Поднимаете две сумки и сравниваете их вес.', 'You are choosing cabin baggage. Lift two bags and compare their weight.'),
    'This bag is lighter than mine.', 'lighter than',
    [pair('Эта сумка легче моей.', 'This bag weighs less than mine.'), pair('Эта сумка самая тяжёлая из всех.', 'This is the heaviest bag of all.'), pair('Обе сумки весят одинаково.', 'Both bags weigh the same.')],
    pair('Lighter сравнивает два предмета, than вводит второй. Для лучшего из группы используем the lightest.', 'Lighter compares two items; than introduces the second. Use the lightest for the lightest item in a group.'),
    gap('This book is ___ (interesting) than that one.', ['more interesting'], 'длинное прилагательное → more + adjective', pair('Interesting — длинное прилагательное: more interesting, без -er.', 'Interesting is a long adjective: more interesting, without -er.')),
    build('This is the best café in town.', pair('Это лучшее кафе в городе.', 'Identify the best café in the town.'), pair('Good → better → best. Для одного лучшего из группы: the best.', 'Good → better → best. Use the best to identify one item in a group.')),
    fix('My room is more bigger than yours.', ['My room is bigger than yours.'], pair('Нельзя сочетать more и -er. Big → bigger, с удвоением g.', 'Do not combine more and -er. Big → bigger, with a doubled g.'))),
  'prepositions': lesson(
    pair('Назначаем встречу', 'Arranging a meeting'), pair('Точно назвать время, день и месяц.', 'Specify a time, a day and a month.'),
    pair('Вы договариваетесь о занятии в понедельник. В сообщении нужно назвать и день, и точное время.', 'You arrange a lesson on Monday. Your message needs both a day and an exact time.'),
    'Let’s meet on Monday at ten.', 'on Monday at ten',
    [pair('On — день, at — точное время.', 'On marks the day; at marks the exact time.'), pair('At всегда используется с месяцем.', 'At is always used with a month.'), pair('In всегда используется с днём недели.', 'In is always used with a weekday.')],
    pair('At — точное время, on — дни и даты, in — месяцы и годы. Эти значения помогают выбрать предлог.', 'At is for exact times, on for days and dates, and in for months and years. These meanings guide the choice.'),
    gap('My birthday is ___ July.', ['in'], 'месяц → in', pair('July — месяц, поэтому in July. Для полной даты нужен on: on 5 July.', 'July is a month, so use in July. A full date uses on: on 5 July.')),
    build('The lesson starts at nine on Monday.', pair('Урок начинается в девять в понедельник.', 'Say the lesson starts at nine on Monday.'), pair('At nine — точное время. On Monday — день недели.', 'At nine is an exact time. On Monday is a weekday.')),
    fix('We will meet on next Monday.', ['We will meet next Monday.'], pair('Перед next / last / this / every в таком выражении предлог не нужен.', 'Do not use a preposition before next / last / this / every in this time expression.'))),
};

for (const [id, translations] of Object.entries(uzJourneys)) {
  const entry = journeys[id];
  [entry.place, entry.goal, entry.story, entry.clue, entry.gap.why, entry.build.translation, entry.build.why, entry.fix.why, ...entry.meanings]
    .forEach((field, index) => { field.uz = translations[index]; });
}

// Accept punctuation, curly apostrophes and standard contractions without
// accepting a wrong tense, a missing word or an incorrect word order.
export function normaliseAnswer(value) {
  return String(value).toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bi'm\b/g, 'i am').replace(/\b(you|we|they)'re\b/g, '$1 are')
    .replace(/\b(i|you|we|they)'ve\b/g, '$1 have').replace(/\b(he|she|it)'s\b/g, '$1 is')
    .replace(/\bdoesn't\b/g, 'does not').replace(/\bdon't\b/g, 'do not')
    .replace(/\bdidn't\b/g, 'did not').replace(/\bisn't\b/g, 'is not')
    .replace(/\baren't\b/g, 'are not').replace(/\bwasn't\b/g, 'was not')
    .replace(/\bweren't\b/g, 'were not').replace(/\bwon't\b/g, 'will not')
    .replace(/\bcan't\b/g, 'cannot').replace(/\bmustn't\b/g, 'must not')
    .replace(/\bshouldn't\b/g, 'should not').replace(/\b([a-z]+)'ll\b/g, '$1 will')
    .replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
}
