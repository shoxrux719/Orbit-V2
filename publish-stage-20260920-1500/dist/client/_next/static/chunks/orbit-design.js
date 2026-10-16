// design/motion.js
function mountMotion() {
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timeout;
  let timerFrame;
  let lastFocused;
  let currentDialog;
  let started = false;
  const reduced = () => media.matches || root.dataset.motion === "off";
  const remember = () => {
    try {
      sessionStorage.setItem("orbit-intro-seen", "yes");
    } catch {
    }
  };
  const close = () => {
    clearTimeout(timeout);
    currentDialog?.close();
    currentDialog?.classList.remove("is-playing");
    root.classList.remove("orbit-film-open");
    remember();
    if (lastFocused?.isConnected) lastFocused.focus({ preventScroll: true });
  };
  const play = () => {
    const dialog = document.querySelector("#orbit-intro");
    if (!dialog || dialog.open) return;
    lastFocused = document.activeElement;
    currentDialog = dialog;
    dialog.classList.remove("is-playing");
    dialog.showModal();
    root.classList.add("orbit-film-open");
    void dialog.offsetWidth;
    dialog.classList.add("is-playing");
    dialog.querySelector(".orbit-intro-skip")?.focus({ preventScroll: true });
    dialog.addEventListener("close", close, { once: true });
    timeout = setTimeout(close, reduced() ? 1300 : 4700);
  };
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add("orbit-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  const scan = () => {
    document.querySelectorAll("[data-orbit-reveal]:not([data-orbit-observed])").forEach((element) => {
      element.dataset.orbitObserved = "yes";
      if (reduced()) element.classList.add("orbit-visible");
      else observer.observe(element);
    });
    if (!started && document.querySelector("#orbit-intro")) {
      started = true;
      let seen = false;
      try {
        seen = sessionStorage.getItem("orbit-intro-seen") === "yes";
      } catch {
      }
      if (!seen && !reduced()) timerFrame = requestAnimationFrame(play);
    }
  };
  const mutation = new MutationObserver(scan);
  mutation.observe(document.querySelector(".app-main") || document.body, { childList: true, subtree: true });
  const onClick = (event) => {
    const action = event.target.closest("[data-orbit-action]")?.dataset.orbitAction;
    if (action === "intro") play();
    if (action === "skip") close();
    if (action === "hello" && window.speechSynthesis) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("Hello.");
      utterance.lang = "en-GB";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
    const open = document.querySelector(".orbit-nav-menu[open]");
    if (open && !open.contains(event.target)) open.removeAttribute("open");
  };
  const onKey = (event) => {
    if (event.key === "Escape") {
      document.querySelector(".orbit-nav-menu[open]")?.removeAttribute("open");
      if (currentDialog?.open) close();
    }
  };
  const onScroll = () => root.classList.toggle("orbit-scrolled", window.scrollY > 20);
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  window.addEventListener("scroll", onScroll, { passive: true });
  scan();
  onScroll();
  return () => {
    close();
    cancelAnimationFrame(timerFrame);
    observer.disconnect();
    mutation.disconnect();
    document.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("scroll", onScroll);
  };
}

// design/grammar-uz.js
var uzJourneys = {
  "present-simple": [
    "Qahva ustida tanishuv",
    "Odatlar haqida gapirib, boshqalarning kun tartibini so\u2018rash.",
    "Yangi hamkasbingiz bilan tanishyapsiz. U ishga borishdan oldin odatda nima qilishini aytadi.",
    "Every morning \u2014 takrorlanadigan harakat. Present Simple ayni soniyadagi jarayonni emas, odatni bildiradi.",
    "Mia = she. He / she / it bilan tasdiq gapda -s qo\u2018shiladi: takes.",
    "U shanba kunlari ishlaydimi?",
    "Does + she + work. Shaxs qo\u2018shimchasi does ichida bor, shuning uchun work ga -s qo\u2018shilmaydi.",
    "Doesn\u2019t dan keyin work boshlang\u2018ich shaklda bo\u2018ladi. -s ikki marta ishlatilmaydi.",
    "U odatda ishga piyoda boradi.",
    "U ayni paytda ishga piyoda ketyapti.",
    "U ishga allaqachon yetib kelgan."
  ],
  "present-continuous": [
    "Do\u2018stga xabar",
    "Hozir davom etayotgan harakatni odatdan ajratish.",
    "Imtihonga tayyorlanayotganingizda do\u2018stingiz qo\u2018ng\u2018iroq qiladi. Hozir nega band ekaningizni tushuntirasiz.",
    "Right now hozirgi paytni bildiradi. Am va studying ikkalasi ham kerak: yordamchi fe\u2019l va jarayon.",
    "Children ko\u2018plikda: are playing. Look! hozir sodir bo\u2018layotgan harakatga e\u2019tibor qaratadi.",
    "Hozir avtobus kutyapsanmi?",
    "Savolda are you dan oldin, waiting esa undan keyin keladi. Do kerak emas.",
    "Is tushib qolgan. Faqat -ing shakli Present Continuous ni hosil qilmaydi.",
    "O\u2018qish ayni paytda davom etmoqda.",
    "Bu kundalik odat.",
    "Imtihon allaqachon tugagan."
  ],
  "present-perfect": [
    "Yo\u2018qolgan kalitlar",
    "O\u2018tgan harakatni hozirgi natija bilan bog\u2018lash.",
    "Eshik oldidasiz, ammo kira olmaysiz. Kalitlar yo\u2018qolgan va bu hozir muammo tug\u2018dirmoqda.",
    "Have lost hozirgi natijani ta\u2019kidlaydi. Yesterday deyilsa, Past Simple kerak: I lost my keys yesterday.",
    "Natija hozir mavjud: uy vazifasi tayyor. She bilan has ishlatiladi.",
    "Londonda biror marta bo\u2018lganmisan?",
    "Have + you + ever + V3. Bu aniq tugagan sanasiz, hozirgacha bo\u2018lgan tajriba haqida savol.",
    "Yesterday \u2014 tugagan o\u2018tgan vaqt. Have olib tashlanadi, seen o\u2018rniga saw qo\u2018yiladi.",
    "Kalitlar hozir yo\u2018q, shuning uchun kira olmayman.",
    "Kalitlarni kecha yo\u2018qotgan aniq vaqtimni aytyapman.",
    "Kalitlarni har kuni yo\u2018qotaman."
  ],
  "present-perfect-continuous": [
    "O\u2018qishdagi tanaffus",
    "Davom etayotgan jarayon qancha vaqt davom etganini aytish.",
    "Ikki soat oldin o\u2018qishni boshlagansiz va hali ham o\u2018qiyapsiz. Endi tanaffus qilish vaqti.",
    "For two hours \u2014 hozirgacha davom etgan muddat. Have been + -ing jarayonni ta\u2019kidlaydi.",
    "They bilan have ishlatiladi. Since nine o\u2019clock davom etayotgan jarayonning boshlanishini bildiradi.",
    "Qachondan beri ingliz tilini o\u2018rganyapsan?",
    "How long + have + you + been + learning. Jarayonning davomiyligi so\u2018raladi.",
    "Know odatda holatni bildiradi, shuning uchun Present Perfect: have known.",
    "Oldin boshlaganman va hali ham o\u2018qiyapman.",
    "Ikki soatdan keyin o\u2018qishni boshlayman.",
    "Faqat kecha o\u2018qiganman."
  ],
  "past-simple": [
    "Kecha kechqurun",
    "O\u2018tmishda tugagan voqea haqida gapirish.",
    "Dushanba kuni hamkasbingiz dam olish kunlaringiz haqida so\u2018raydi. Kecha ko\u2018rgan filmingizni aytasiz.",
    "Yesterday \u2014 tugagan davr. Watch muntazam fe\u2019liga -ed qo\u2018shiladi.",
    "Past Simple tasdiq gapda ikkinchi shakl kerak. Go \u2014 noto\u2018g\u2018ri fe\u2019l: went.",
    "Film senga yoqdimi?",
    "Did + you + enjoy. Did dan keyin fe\u2019l boshlang\u2018ich shaklga qaytadi.",
    "O\u2018tgan zamon didn\u2019t orqali ifodalangan, shuning uchun went emas, go ishlatiladi.",
    "Filmni ko\u2018rish kecha tugagan.",
    "Filmni hozir ko\u2018ryapmiz.",
    "Har kuni film ko\u2018ramiz."
  ],
  "past-continuous": [
    "Ovqat paytidagi qo\u2018ng\u2018iroq",
    "O\u2018tmishdagi qisqa voqea fonida davom etgan jarayonni tasvirlash.",
    "Telefon jiringlaganda kechki ovqatni yeyayotgan edingiz. Ovqatlanish o\u2018sha paytda davom etayotgan edi.",
    "Was having \u2014 davom etayotgan jarayon. Rang \u2014 shu jarayon paytida yuz bergan qisqa voqea.",
    "At eight last night o\u2018tmishdagi paytni bildiradi. They bilan were kerak.",
    "Qo\u2018ng\u2018iroq qilganimda uxlayotganmiding?",
    "Were + you + sleeping \u2014 jarayon haqida savol; called \u2014 qisqa tugagan harakat.",
    "They bilan were kerak. Was I / he / she / it bilan ishlatiladi.",
    "Telefon jiringlaganda ovqatlanish davom etayotgan edi.",
    "Ovqatlanish hali boshlanmagan edi.",
    "Har doim qo\u2018ng\u2018iroqdan keyin ovqatlanaman."
  ],
  "past-perfect": [
    "Poyezdga kechikish",
    "Ikki o\u2018tgan voqeadan qaysi biri oldin sodir bo\u2018lganini ko\u2018rsatish.",
    "Vokzalga soat o\u2018nda keldingiz. Poyezd 9:55 da jo\u2018nagan, platforma esa bo\u2018sh edi.",
    "Kelish \u2014 o\u2018tmishdagi tayanch nuqta. Had left undan oldin sodir bo\u2018lgan voqeani bildiradi.",
    "Do\u2018kon biz kelishimizdan oldin yopilgan. Had barcha shaxslar uchun bir xil.",
    "U uchrashuvdan oldin ovqatlangan edimi?",
    "Had + she + eaten. Eaten \u2014 eat fe\u2019lining uchinchi shakli.",
    "Had dan keyin uchinchi shakl kerak: go \u2192 went \u2192 gone.",
    "Poyezd men kelishimdan oldin ketgan.",
    "Poyezd men kelganimdan keyin ketgan.",
    "Poyezd hali platformada turibdi."
  ],
  "past-perfect-continuous": [
    "Sayrdan keyingi charchoq",
    "O\u2018tmishdagi paytgacha davom etgan jarayon muddatini tushuntirish.",
    "Bir necha soat yurgach qishloqni topdingiz. O\u2018sha paytda nega juda charchaganingizni aytasiz.",
    "Had been walking uzoq jarayonni undan keyingi o\u2018tgan payt bilan bog\u2018laydi.",
    "Ishlash jarayoni uning charchagan paytigacha davom etgan.",
    "O\u2018sha paytgacha qancha vaqt kutgan eding?",
    "How long + had + you + been + waiting. Tayanch nuqta o\u2018tmishda.",
    "Had been dan keyingi jarayon uchun -ing shakli kerak: waiting.",
    "Yurish qishloqni topgunimizgacha davom etgan.",
    "Qishloqqa borgandan keyin yurishni boshlaymiz.",
    "Hozir sayr qilyapmiz."
  ],
  "future-simple": [
    "Yordam taklif qilish",
    "Hozir qabul qilingan qaror, va\u2019da yoki taxminni ifodalash.",
    "Do\u2018stingiz sumkani qiynalib ko\u2018tarayotganini ko\u2018rib, darhol yordam taklif qilasiz.",
    "Will hozir qabul qilingan qarorni ifodalaydi. Undan keyin to siz boshlang\u2018ich shakl keladi.",
    "I think taxminni bildiradi. Will dan keyin rain shakli o\u2018zgarmaydi.",
    "Ertaga menga yordam berasanmi?",
    "Will + you + help. Savolda will egadan oldinga o\u2018tadi.",
    "Will \u2014 modal fe\u2019l. Undan keyin to qo\u2018yilmaydi.",
    "Gapirish paytida yordam taklif qilyapman.",
    "O\u2018tmishdagi odatni tasvirlayapman.",
    "Allaqachon yordam berib ketganman."
  ],
  "future-continuous": [
    "Ertaga shu paytda",
    "Kelajakdagi muayyan paytda davom etayotgan jarayonni tasvirlash.",
    "Ertangi parvozingiz soat o\u2018ndan o\u2018n ikkigacha. Do\u2018stingiz soat o\u2018n birda nima qilishingizni so\u2018raydi.",
    "Kelajakdagi paytni tasavvur qilib, davom etayotgan jarayonni ko\u2018ramiz: will be + flying.",
    "Soat oltida ovqatlanish davom etadi, shuning uchun will be having.",
    "Soat sakkizda ishlayotgan bo\u2018lasanmi?",
    "Will + you + be + working. Be va -ing ikkalasi ham saqlanadi.",
    "Will be dan keyin jarayon uchun studying kerak.",
    "Soat o\u2018n birda parvoz davom etayotgan bo\u2018ladi.",
    "Kecha allaqachon qo\u2018nganman.",
    "Har kuni Rimga uchaman."
  ],
  "future-perfect": [
    "Juma kunigacha muddat",
    "Kelajakdagi muddatgacha nima tayyor bo\u2018lishini aytish.",
    "Hisobot juma kuni kerak. Shu muddatgacha ish tugashini va\u2019da qilasiz.",
    "By Friday \u2014 oxirgi muddat. Kelajakdan tugagan natijaga qaraymiz: will have + V3.",
    "Ertaga tushgacha test allaqachon tugagan bo\u2018ladi: will have finished.",
    "Juma kunigacha tugatgan bo\u2018lasanmi?",
    "Will + you + have + finished. By oxirgi muddatni bildiradi.",
    "Will have dan keyin V3 kerak: write \u2192 wrote \u2192 written.",
    "Juma kunigacha hisobot tayyor bo\u2018ladi.",
    "Hisobotni faqat juma kuni boshlayman.",
    "Har doim juma kunlari hisobot yozaman."
  ],
  "future-perfect-continuous": [
    "Yangi jamoada bir yil",
    "Kelajakdagi sanagacha jarayon qancha davom etishini aytish.",
    "O\u2018tgan iyulda shu yerda ishlay boshlagansiz. Kelasi iyulda bir yil bo\u2018ladi va ish davom etadi.",
    "Muddatgacha jarayonning davomiyligi muhim: will have been + -ing.",
    "Soat o\u2018ngacha safarning davomiyligi olti soatga yetadi.",
    "Iyungacha qancha vaqt o\u2018qigan bo\u2018lasan?",
    "How long + will + you + have been + studying. Davomiylik kelajakdagi paytda o\u2018lchanadi.",
    "Will have been dan keyingi jarayon uchun -ing shakli kerak: working.",
    "Iyulda ishlash muddatim bir yilga yetadi.",
    "Iyulda birinchi marta ishlay boshlayman.",
    "Bu yerda faqat kecha ishlaganman."
  ],
  "articles": [
    "Yangi it",
    "Yangi tilga olingan narsani suhbatdoshga ma\u2019lum narsadan ajratish.",
    "Uchrashgan itingizni birinchi marta tilga olasiz. Ikkinchi gapda suhbatdosh qaysi it haqida gap ketayotganini biladi.",
    "Avval a dog bilan yangi narsa tanishtiriladi. Keyin the dog o\u2018sha ma\u2019lum narsani bildiradi.",
    "Hour dagi h talaffuz qilinmaydi. An birinchi harfga emas, tovushga qarab tanlanadi.",
    "Men mushuk ko\u2018rdim. O\u2018sha mushuk qora edi.",
    "A cat \u2014 birinchi eslatish. The cat \u2014 o\u2018sha ma\u2019lum mushuk.",
    "Advice sanalmaydigan so\u2018z. Some advice yoki a piece of advice ishlatiladi.",
    "The oldin tilga olingan itni bildiradi.",
    "The har qanday noma\u2019lum itni bildiradi.",
    "Dog oldidan hech qachon artikl kelmaydi."
  ],
  "modals": [
    "Do\u2018stga maslahat",
    "Maslahat, qobiliyat va taqiqni aniq ifodalash.",
    "Do\u2018stingiz uzoq vaqt dam olmasdan ishlayapti. Buyruq bermasdan, muloyimlik bilan tanaffusni maslahat qilasiz.",
    "Should maslahatni ifodalaydi. Modal fe\u2019ldan keyin to siz boshlang\u2018ich shakl ishlatiladi.",
    "She bilan ham can ga -s qo\u2018shilmaydi. Undan keyin swim to siz keladi.",
    "Bu yerda mashinani qo\u2018yish mumkin emas.",
    "Must not taqiqni bildiradi. Don\u2019t have to esa zarurat yo\u2018qligini bildiradi.",
    "Can dan keyin to qo\u2018yilmaydi. Speak boshlang\u2018ich shaklda qoladi.",
    "Bu maslahat.",
    "Bu qat\u2019iy taqiq.",
    "Bu kechagi voqea haqida hikoya."
  ],
  "conditionals": [
    "Rejalar va ob-havo",
    "Shartni haqiqiy yoki faraziy natija bilan bog\u2018lash.",
    "Sayr qilishni rejalayapsiz, ammo yomg\u2018ir kutilmoqda. Ertaga qanday yo\u2018l tutishni muhokama qilasiz.",
    "First conditional: if + Present Simple, will + V. Kelajak ma\u2019nosi if dan keyin will talab qilmaydi.",
    "If qismida Present Simple ishlatiladi: studies. Will natija qismida keladi.",
    "Vaqtim ko\u2018proq bo\u2018lsa, sayohat qilardim.",
    "Second conditional: had faraziy hozirgi vaziyatni, would travel uning natijasini bildiradi.",
    "Kelajak haqidagi odatiy shartda if dan keyin Present Simple kerak: rains.",
    "Bu kelajakda yuz berishi mumkin bo\u2018lgan haqiqiy vaziyat.",
    "Bu o\u2018tmish haqidagi afsus.",
    "Bu allaqachon aniq yuz bergan voqea."
  ],
  "passive": [
    "Ko\u2018prik tarixi",
    "Harakat bajarilgan narsaga e\u2019tibor qaratish.",
    "Gid ko\u2018prik haqida aytyapti. Ko\u2018prik va qurilgan yil muhim, quruvchilar esa aytilmagan.",
    "Was o\u2018tgan zamonni, built esa build fe\u2019lining V3 shaklini bildiradi. Bajaruvchi muhim bo\u2018lsa, by orqali qo\u2018shiladi.",
    "English birlikda, shuning uchun is. Speak \u2192 spoke \u2192 spoken.",
    "Deraza kecha sindirildi.",
    "Harakat derazaga qaratilgan. Was + broken o\u2018tgan zamondagi majhul nisbatni hosil qiladi.",
    "Majhul nisbatda be dan keyin V3 kerak: build \u2192 built \u2192 built.",
    "Ko\u2018prik qurilgan obyekt, harakat esa o\u2018tmishda.",
    "Ko\u2018prikning o\u2018zi nimadir qurgan.",
    "Ko\u2018prik kelajakda quriladi."
  ],
  "comparatives": [
    "Sumka tanlash",
    "Ikki narsani solishtirib, guruhdan bittasini ajratish.",
    "Qo\u2018l yukini tanlayapsiz. Ikki sumkani ko\u2018tarib, vaznini solishtirasiz.",
    "Lighter ikki narsani solishtiradi, than ikkinchisini kiritadi. Guruhdagi eng yengili uchun the lightest ishlatiladi.",
    "Interesting uzun sifat: more interesting, -er siz.",
    "Bu shahardagi eng yaxshi kafe.",
    "Good \u2192 better \u2192 best. Guruhdagi eng yaxshi bittasi uchun the best ishlatiladi.",
    "More va -er birga ishlatilmaydi. Big \u2192 bigger, g ikki marta yoziladi.",
    "Bu sumka menikidan yengilroq.",
    "Bu barcha sumkalar ichida eng og\u2018iri.",
    "Ikkala sumkaning vazni bir xil."
  ],
  "prepositions": [
    "Uchrashuv belgilash",
    "Soat, kun va oyni aniq aytish.",
    "Dushanbaga dars belgilayapsiz. Xabarda kunni ham, aniq vaqtni ham ko\u2018rsatish kerak.",
    "At \u2014 aniq vaqt, on \u2014 kunlar va sanalar, in \u2014 oylar va yillar. Ma\u2019noga qarab predlog tanlanadi.",
    "July \u2014 oy, shuning uchun in July. To\u2018liq sana bilan on kerak: on 5 July.",
    "Dars dushanba kuni soat to\u2018qqizda boshlanadi.",
    "At nine \u2014 aniq vaqt. On Monday \u2014 hafta kuni.",
    "Bunday vaqt ifodasida next / last / this / every oldidan predlog kerak emas.",
    "On kunni, at aniq vaqtni bildiradi.",
    "At har doim oy bilan ishlatiladi.",
    "In har doim hafta kuni bilan ishlatiladi."
  ]
};

// design/grammar-content.js
var pair = (ru, en) => ({ ru, en });
var lesson = (place, goal, story, sentence, chunk, meanings, clue, gap2, build2, fix2) => ({ place, goal, story, sentence, chunk, meanings, clue, gap: gap2, build: build2, fix: fix2 });
var gap = (sentence, answers, hint, why) => ({ type: "gap", sentence, answers, hint, why });
var build = (sentence, translation, why) => ({ type: "build", sentence, translation, why });
var fix = (sentence, answers, why) => ({ type: "fix", sentence, answers, why });
var journeys = {
  "present-simple": lesson(
    pair("\u0417\u043D\u0430\u043A\u043E\u043C\u0441\u0442\u0432\u043E \u0437\u0430 \u043A\u043E\u0444\u0435", "Meeting over coffee"),
    pair("\u0420\u0430\u0441\u0441\u043A\u0430\u0437\u0430\u0442\u044C \u043E \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0430\u0445 \u0438 \u0437\u0430\u0434\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441 \u043E \u0447\u0443\u0436\u043E\u043C \u0440\u0430\u0441\u043F\u043E\u0440\u044F\u0434\u043A\u0435.", "Describe habits and ask about someone\u2019s routine."),
    pair("\u0412\u044B \u0437\u043D\u0430\u043A\u043E\u043C\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u043E\u0432\u043E\u0439 \u043A\u043E\u043B\u043B\u0435\u0433\u043E\u0439. \u041E\u043D\u0430 \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u043E\u0431\u044B\u0447\u043D\u043E \u0434\u0435\u043B\u0430\u0435\u0442 \u043F\u0435\u0440\u0435\u0434 \u0440\u0430\u0431\u043E\u0442\u043E\u0439.", "You meet a new colleague. She tells you what she usually does before work."),
    "I walk to work every morning.",
    "walk",
    [pair("\u041E\u043D\u0430 \u043E\u0431\u044B\u0447\u043D\u043E \u0445\u043E\u0434\u0438\u0442 \u043D\u0430 \u0440\u0430\u0431\u043E\u0442\u0443 \u043F\u0435\u0448\u043A\u043E\u043C.", "She usually walks to work."), pair("\u041E\u043D\u0430 \u0438\u0434\u0451\u0442 \u043D\u0430 \u0440\u0430\u0431\u043E\u0442\u0443 \u0438\u043C\u0435\u043D\u043D\u043E \u0441\u0435\u0439\u0447\u0430\u0441.", "She is walking to work right now."), pair("\u041E\u043D\u0430 \u0443\u0436\u0435 \u0434\u043E\u0448\u043B\u0430 \u0434\u043E \u0440\u0430\u0431\u043E\u0442\u044B.", "She has already arrived at work.")],
    pair("Every morning \u2014 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0435\u0435\u0441\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435. Present Simple \u043E\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u0442 \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0443, \u0430 \u043D\u0435 \u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u0432 \u044D\u0442\u0443 \u0441\u0435\u043A\u0443\u043D\u0434\u0443.", "Every morning signals a repeated action. Present Simple describes a habit, rather than an action in progress."),
    gap("Mia ___ (take) the bus every day.", ["takes"], "take \u2192 takes", pair("Mia = she. \u0412 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0438 \u0441 he / she / it \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C -s: takes.", "Mia = she. Add -s in a positive sentence with he / she / it: takes.")),
    build("Does she work on Saturdays?", pair("\u041E\u043D\u0430 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043F\u043E \u0441\u0443\u0431\u0431\u043E\u0442\u0430\u043C?", "Ask whether she works on Saturdays."), pair("Does + she + work. \u041E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u0435 -s \u0443\u0436\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043E \u0432 does, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 work \u0431\u0435\u0437 -s.", "Does + she + work. Does carries the third-person ending, so work stays in its base form.")),
    fix("He doesn\u2019t works here.", ["He doesn\u2019t work here.", "He does not work here."], pair("\u041F\u043E\u0441\u043B\u0435 doesn\u2019t \u043D\u0443\u0436\u043D\u0430 \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0430\u044F \u0444\u043E\u0440\u043C\u0430 work. \u041D\u0435\u043B\u044C\u0437\u044F \u0441\u0442\u0430\u0432\u0438\u0442\u044C -s \u0434\u0432\u0430\u0436\u0434\u044B.", "Use the base form work after doesn\u2019t. Do not mark the third person twice."))
  ),
  "present-continuous": lesson(
    pair("\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0434\u0440\u0443\u0433\u0443", "A message to a friend"),
    pair("\u041E\u043F\u0438\u0441\u0430\u0442\u044C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0441\u0435\u0439\u0447\u0430\u0441 \u0438 \u043E\u0442\u043B\u0438\u0447\u0438\u0442\u044C \u0435\u0433\u043E \u043E\u0442 \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0438.", "Describe an action in progress and distinguish it from a habit."),
    pair("\u0414\u0440\u0443\u0433 \u0437\u0432\u043E\u043D\u0438\u0442 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0432\u0430\u0448\u0435\u0439 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0438 \u043A \u044D\u043A\u0437\u0430\u043C\u0435\u043D\u0443. \u0412\u044B \u043E\u0431\u044A\u044F\u0441\u043D\u044F\u0435\u0442\u0435, \u043F\u043E\u0447\u0435\u043C\u0443 \u0441\u0435\u0439\u0447\u0430\u0441 \u0437\u0430\u043D\u044F\u0442\u044B.", "A friend calls while you are preparing for an exam. Explain why you are busy right now."),
    "I am studying for my exam right now.",
    "am studying",
    [pair("\u0423\u0447\u0451\u0431\u0430 \u0438\u0434\u0451\u0442 \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441.", "Studying is happening right now."), pair("\u042D\u0442\u043E \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0430.", "This is a daily habit."), pair("\u042D\u043A\u0437\u0430\u043C\u0435\u043D \u0443\u0436\u0435 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0441\u044F.", "The exam has already finished.")],
    pair("Right now \u0437\u0430\u0434\u0430\u0451\u0442 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442. \u041D\u0443\u0436\u043D\u044B \u0438 am, \u0438 studying: \u0432\u0441\u043F\u043E\u043C\u043E\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0433\u043B\u0430\u0433\u043E\u043B + \u043F\u0440\u043E\u0446\u0435\u0441\u0441.", "Right now sets the current moment. Both am and studying are needed: the auxiliary and the ongoing action."),
    gap("Look! The children ___ (play) outside.", ["are playing"], "children = they \u2192 are + play-ing", pair("Children \u2014 \u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: are playing. Look! \u043E\u0431\u0440\u0430\u0449\u0430\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u043D\u0430 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u044F\u0449\u0435\u0435 \u0441\u0435\u0439\u0447\u0430\u0441.", "Children is plural: are playing. Look! draws attention to an action happening now.")),
    build("Are you waiting for the bus?", pair("\u0422\u044B \u0441\u0435\u0439\u0447\u0430\u0441 \u0436\u0434\u0451\u0448\u044C \u0430\u0432\u0442\u043E\u0431\u0443\u0441?", "Ask whether someone is waiting for the bus."), pair("\u0412 \u0432\u043E\u043F\u0440\u043E\u0441\u0435 are \u0441\u0442\u043E\u0438\u0442 \u043F\u0435\u0440\u0435\u0434 you, \u0437\u0430\u0442\u0435\u043C waiting. Do \u0437\u0434\u0435\u0441\u044C \u043D\u0435 \u043D\u0443\u0436\u0435\u043D.", "Put are before you in the question, followed by waiting. Do is not needed.")),
    fix("She reading a book now.", ["She is reading a book now."], pair("\u041F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E is. \u0424\u043E\u0440\u043C\u0430 -ing \u0441\u0430\u043C\u0430 \u043F\u043E \u0441\u0435\u0431\u0435 \u043D\u0435 \u043E\u0431\u0440\u0430\u0437\u0443\u0435\u0442 Present Continuous.", "Is is missing. An -ing form alone does not form Present Continuous."))
  ),
  "present-perfect": lesson(
    pair("\u041A\u043B\u044E\u0447\u0438 \u0438\u0441\u0447\u0435\u0437\u043B\u0438", "Missing keys"),
    pair("\u0421\u0432\u044F\u0437\u0430\u0442\u044C \u043F\u0440\u043E\u0448\u043B\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0441 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C \u0441\u0435\u0439\u0447\u0430\u0441.", "Connect a past action with its present result."),
    pair("\u0412\u044B \u0441\u0442\u043E\u0438\u0442\u0435 \u0443 \u0434\u0432\u0435\u0440\u0438 \u0438 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u043E\u0439\u0442\u0438. \u041A\u043B\u044E\u0447\u0438 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u044B, \u0438 \u044D\u0442\u043E \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0430 \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441.", "You are at the door and cannot get in. The keys are missing, and that matters now."),
    "I have lost my keys.",
    "have lost",
    [pair("\u041A\u043B\u044E\u0447\u0435\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0442, \u0438 \u044F \u043D\u0435 \u043C\u043E\u0433\u0443 \u0432\u043E\u0439\u0442\u0438.", "The keys are missing now, so I cannot get in."), pair("\u042F \u043D\u0430\u0437\u044B\u0432\u0430\u044E \u0442\u043E\u0447\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043F\u043E\u0442\u0435\u0440\u0438 \u0432\u0447\u0435\u0440\u0430.", "I specify the exact time I lost them yesterday."), pair("\u042F \u0442\u0435\u0440\u044F\u044E \u043A\u043B\u044E\u0447\u0438 \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C.", "I lose my keys every day.")],
    pair("Have lost \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0432 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u043C. \u0415\u0441\u043B\u0438 \u043D\u0430\u0437\u0432\u0430\u0442\u044C yesterday, \u043D\u0443\u0436\u0435\u043D Past Simple: I lost my keys yesterday.", "Have lost focuses on the present result. With yesterday, use Past Simple: I lost my keys yesterday."),
    gap("She ___ (finish) her homework, so she can go out.", ["has finished"], "she \u2192 has + finish-ed", pair("\u0415\u0441\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0441\u0435\u0439\u0447\u0430\u0441: \u0434\u043E\u043C\u0430\u0448\u043D\u044F\u044F \u0440\u0430\u0431\u043E\u0442\u0430 \u0433\u043E\u0442\u043E\u0432\u0430. She \u0442\u0440\u0435\u0431\u0443\u0435\u0442 has.", "There is a result now: the homework is ready. Use has with she.")),
    build("Have you ever visited London?", pair("\u0422\u044B \u043A\u043E\u0433\u0434\u0430-\u043D\u0438\u0431\u0443\u0434\u044C \u0431\u044B\u0432\u0430\u043B \u0432 \u041B\u043E\u043D\u0434\u043E\u043D\u0435?", "Ask about someone\u2019s experience of visiting London."), pair("Have + you + ever + V3. \u0412\u043E\u043F\u0440\u043E\u0441 \u043E\u0431 \u043E\u043F\u044B\u0442\u0435 \u0434\u043E \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0431\u0435\u0437 \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D\u043D\u043E\u0439 \u0434\u0430\u0442\u044B.", "Have + you + ever + past participle. This asks about experience up to now without a finished date.")),
    fix("I have seen him yesterday.", ["I saw him yesterday."], pair("Yesterday \u2014 \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C. Seen \u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043D\u0430 saw, have \u0443\u0431\u0438\u0440\u0430\u0435\u043C.", "Yesterday is a finished past time. Use saw and remove have."))
  ),
  "present-perfect-continuous": lesson(
    pair("\u041F\u0435\u0440\u0435\u0440\u044B\u0432 \u0432 \u0443\u0447\u0451\u0431\u0435", "A study break"),
    pair("\u0421\u043A\u0430\u0437\u0430\u0442\u044C, \u043A\u0430\u043A \u0434\u043E\u043B\u0433\u043E \u0434\u043B\u0438\u0442\u0441\u044F \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0440\u043E\u0446\u0435\u0441\u0441.", "Say how long an ongoing activity has lasted."),
    pair("\u0412\u044B \u043D\u0430\u0447\u0430\u043B\u0438 \u0437\u0430\u043D\u0438\u043C\u0430\u0442\u044C\u0441\u044F \u0434\u0432\u0430 \u0447\u0430\u0441\u0430 \u043D\u0430\u0437\u0430\u0434 \u0438 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0443\u0447\u0438\u0442\u0435\u0441\u044C. \u0421\u0435\u0439\u0447\u0430\u0441 \u043F\u043E\u0440\u0430 \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0435\u0440\u0435\u0440\u044B\u0432.", "You started studying two hours ago and are still studying. It is time for a break."),
    "I have been studying for two hours.",
    "have been studying",
    [pair("\u042F \u043D\u0430\u0447\u0430\u043B \u0440\u0430\u043D\u044C\u0448\u0435 \u0438 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0437\u0430\u043D\u0438\u043C\u0430\u044E\u0441\u044C.", "I started earlier and am still studying."), pair("\u042F \u043D\u0430\u0447\u043D\u0443 \u0437\u0430\u043D\u0438\u043C\u0430\u0442\u044C\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u0434\u0432\u0430 \u0447\u0430\u0441\u0430.", "I will start studying in two hours."), pair("\u042F \u0443\u0447\u0438\u043B\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0447\u0435\u0440\u0430.", "I only studied yesterday.")],
    pair("For two hours \u2014 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043E \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430. Have been + -ing \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u0435\u0442 \u043F\u0440\u043E\u0446\u0435\u0441\u0441.", "For two hours is a duration up to now. Have been + -ing emphasises the activity."),
    gap("They ___ (wait) since nine o\u2019clock and are still here.", ["have been waiting"], "have + been + wait-ing", pair("They \u2192 have. Since nine o\u2019clock \u043D\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0430\u0447\u0430\u043B\u043E \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u0442\u0441\u044F.", "Use have with they. Since nine o\u2019clock gives the starting point of an ongoing activity.")),
    build("How long have you been learning English?", pair("\u041A\u0430\u043A \u0434\u0430\u0432\u043D\u043E \u0442\u044B \u0443\u0447\u0438\u0448\u044C \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439?", "Ask how long someone has been learning English."), pair("How long + have + you + been + learning. \u0421\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u043C \u043E \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430.", "How long + have + you + been + learning. Ask about the duration of an activity.")),
    fix("I have been knowing her for years.", ["I have known her for years."], pair("Know \u043E\u0431\u044B\u0447\u043D\u043E \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0437\u0434\u0435\u0441\u044C Present Perfect: have known.", "Know normally describes a state, so use Present Perfect: have known."))
  ),
  "past-simple": lesson(
    pair("\u0412\u0447\u0435\u0440\u0430\u0448\u043D\u0438\u0439 \u0432\u0435\u0447\u0435\u0440", "Yesterday evening"),
    pair("\u0420\u0430\u0441\u0441\u043A\u0430\u0437\u0430\u0442\u044C \u043E \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u043E\u043C \u0441\u043E\u0431\u044B\u0442\u0438\u0438 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "Describe a completed past event."),
    pair("\u0412 \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A \u043A\u043E\u043B\u043B\u0435\u0433\u0430 \u0441\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u0442, \u043A\u0430\u043A \u043F\u0440\u043E\u0448\u043B\u0438 \u0432\u044B\u0445\u043E\u0434\u043D\u044B\u0435. \u0412\u044B \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0435 \u043E \u0432\u0447\u0435\u0440\u0430\u0448\u043D\u0435\u043C \u0444\u0438\u043B\u044C\u043C\u0435.", "On Monday, a colleague asks about your weekend. You tell them about a film you watched yesterday."),
    "We watched a film yesterday.",
    "watched",
    [pair("\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0441\u044F \u0432\u0447\u0435\u0440\u0430.", "The film was watched yesterday and is over."), pair("\u041C\u044B \u0441\u043C\u043E\u0442\u0440\u0438\u043C \u0444\u0438\u043B\u044C\u043C \u0441\u0435\u0439\u0447\u0430\u0441.", "We are watching it now."), pair("\u041C\u044B \u0441\u043C\u043E\u0442\u0440\u0438\u043C \u0444\u0438\u043B\u044C\u043C\u044B \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C.", "We watch films every day.")],
    pair("Yesterday \u2014 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434. \u0423 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E\u0433\u043E \u0433\u043B\u0430\u0433\u043E\u043B\u0430 watch \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C -ed.", "Yesterday is a finished period. Add -ed to the regular verb watch."),
    gap("She ___ (go) home at six yesterday.", ["went"], "go \u2192 went \u2192 gone", pair("\u0412 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0438 Past Simple \u043D\u0443\u0436\u043D\u0430 \u0432\u0442\u043E\u0440\u0430\u044F \u0444\u043E\u0440\u043C\u0430. Go \u2014 \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0433\u043B\u0430\u0433\u043E\u043B: went.", "A positive Past Simple sentence uses the past form. Go is irregular: went.")),
    build("Did you enjoy the film?", pair("\u0422\u0435\u0431\u0435 \u043F\u043E\u043D\u0440\u0430\u0432\u0438\u043B\u0441\u044F \u0444\u0438\u043B\u044C\u043C?", "Ask whether someone enjoyed the film."), pair("Did + you + enjoy. \u041F\u043E\u0441\u043B\u0435 did \u0433\u043B\u0430\u0433\u043E\u043B \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044F \u0432 \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0443\u044E \u0444\u043E\u0440\u043C\u0443.", "Did + you + enjoy. After did, the verb returns to its base form.")),
    fix("We didn\u2019t went out yesterday.", ["We didn\u2019t go out yesterday.", "We did not go out yesterday."], pair("\u041F\u0440\u043E\u0448\u0435\u0434\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F \u0443\u0436\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043E \u0432 didn\u2019t, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 go, \u0430 \u043D\u0435 went.", "Didn\u2019t already marks the past, so use go rather than went."))
  ),
  "past-continuous": lesson(
    pair("\u0417\u0432\u043E\u043D\u043E\u043A \u043F\u043E\u0441\u0440\u0435\u0434\u0438 \u0443\u0436\u0438\u043D\u0430", "A call during dinner"),
    pair("\u041E\u043F\u0438\u0441\u0430\u0442\u044C \u0444\u043E\u043D \u0434\u043B\u044F \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0433\u043E \u0441\u043E\u0431\u044B\u0442\u0438\u044F \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "Describe the background to a short past event."),
    pair("\u0412\u044B \u0443\u0436\u0438\u043D\u0430\u043B\u0438, \u043A\u043E\u0433\u0434\u0430 \u0437\u0430\u0437\u0432\u043E\u043D\u0438\u043B \u0442\u0435\u043B\u0435\u0444\u043E\u043D. \u0423\u0436\u0438\u043D \u0443\u0436\u0435 \u0448\u0451\u043B \u0432 \u043C\u043E\u043C\u0435\u043D\u0442 \u0437\u0432\u043E\u043D\u043A\u0430.", "You were having dinner when the phone rang. Dinner was already in progress at that moment."),
    "I was having dinner when the phone rang.",
    "was having",
    [pair("\u0423\u0436\u0438\u043D \u0431\u044B\u043B \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u0432 \u043C\u043E\u043C\u0435\u043D\u0442 \u0437\u0432\u043E\u043D\u043A\u0430.", "Dinner was in progress when the phone rang."), pair("\u0423\u0436\u0438\u043D \u0435\u0449\u0451 \u043D\u0435 \u043D\u0430\u0447\u0430\u043B\u0441\u044F.", "Dinner had not started."), pair("\u042F \u0432\u0441\u0435\u0433\u0434\u0430 \u0443\u0436\u0438\u043D\u0430\u044E \u043F\u043E\u0441\u043B\u0435 \u0437\u0432\u043E\u043D\u043A\u0430.", "I always have dinner after a call.")],
    pair("Was having \u2014 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0444\u043E\u043D. Rang \u2014 \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u043F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u043E \u043D\u0430 \u044D\u0442\u043E\u043C \u0444\u043E\u043D\u0435.", "Was having is the ongoing background. Rang is the short event that happened during it."),
    gap("At eight last night, they ___ (watch) TV.", ["were watching"], "they \u2192 were + watch-ing", pair("At eight last night \u0437\u0430\u0434\u0430\u0451\u0442 \u043C\u043E\u043C\u0435\u043D\u0442 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C. They \u0442\u0440\u0435\u0431\u0443\u0435\u0442 were.", "At eight last night sets a past moment. Use were with they.")),
    build("Were you sleeping when I called?", pair("\u0422\u044B \u0441\u043F\u0430\u043B, \u043A\u043E\u0433\u0434\u0430 \u044F \u043F\u043E\u0437\u0432\u043E\u043D\u0438\u043B?", "Ask whether someone was asleep when you called."), pair("Were + you + sleeping \u2014 \u0432\u043E\u043F\u0440\u043E\u0441 \u043E \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435; called \u2014 \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u043E\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435.", "Were + you + sleeping asks about an ongoing action; called is the short completed event.")),
    fix("They was waiting at the station.", ["They were waiting at the station."], pair("\u0421 they \u043D\u0443\u0436\u043D\u0430 \u0444\u043E\u0440\u043C\u0430 were. Was \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0441 I / he / she / it.", "They takes were. Use was with I / he / she / it."))
  ),
  "past-perfect": lesson(
    pair("\u041E\u043F\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u043D\u0430 \u043F\u043E\u0435\u0437\u0434", "Missing the train"),
    pair("\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C, \u043A\u0430\u043A\u043E\u0435 \u0438\u0437 \u0434\u0432\u0443\u0445 \u043F\u0440\u043E\u0448\u043B\u044B\u0445 \u0441\u043E\u0431\u044B\u0442\u0438\u0439 \u0441\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0440\u0430\u043D\u044C\u0448\u0435.", "Show which of two past events happened first."),
    pair("\u0412\u044B \u043F\u0440\u0438\u0448\u043B\u0438 \u043D\u0430 \u0432\u043E\u043A\u0437\u0430\u043B \u0432 \u0434\u0435\u0441\u044F\u0442\u044C. \u041F\u043E\u0435\u0437\u0434 \u0443\u0435\u0445\u0430\u043B \u0432 9:55, \u0438 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0443 \u0432\u044B \u0443\u0432\u0438\u0434\u0435\u043B\u0438 \u043F\u0443\u0441\u0442\u043E\u0439.", "You reached the station at ten. The train left at 9:55, so the platform was empty."),
    "When I arrived, the train had left.",
    "had left",
    [pair("\u041F\u043E\u0435\u0437\u0434 \u0443\u0435\u0445\u0430\u043B \u0440\u0430\u043D\u044C\u0448\u0435 \u043C\u043E\u0435\u0433\u043E \u043F\u0440\u0438\u0445\u043E\u0434\u0430.", "The train left before I arrived."), pair("\u041F\u043E\u0435\u0437\u0434 \u0443\u0435\u0445\u0430\u043B \u043F\u043E\u0441\u043B\u0435 \u043C\u043E\u0435\u0433\u043E \u043F\u0440\u0438\u0445\u043E\u0434\u0430.", "The train left after I arrived."), pair("\u041F\u043E\u0435\u0437\u0434 \u0435\u0449\u0451 \u0441\u0442\u043E\u0438\u0442 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435.", "The train is still at the platform.")],
    pair("\u041F\u0440\u0438\u0445\u043E\u0434 \u2014 \u0442\u043E\u0447\u043A\u0430 \u043E\u0442\u0441\u0447\u0451\u0442\u0430 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C. Had left \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0441\u043E\u0431\u044B\u0442\u0438\u0435 \u0434\u043E \u044D\u0442\u043E\u0439 \u0442\u043E\u0447\u043A\u0438.", "Arrival is the past reference point. Had left describes an event before it."),
    gap("By the time we arrived, the shop ___ (close).", ["had closed"], "had + close-d", pair("\u041C\u0430\u0433\u0430\u0437\u0438\u043D \u0437\u0430\u043A\u0440\u044B\u043B\u0441\u044F \u0434\u043E \u043D\u0430\u0448\u0435\u0433\u043E \u043F\u0440\u0438\u0445\u043E\u0434\u0430. Had \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u043B\u0438\u0446.", "The shop closed before our arrival. Had is the same for every subject.")),
    build("Had she eaten before the meeting?", pair("\u041E\u043D\u0430 \u043F\u043E\u0435\u043B\u0430 \u0434\u043E \u0432\u0441\u0442\u0440\u0435\u0447\u0438?", "Ask whether she had eaten before the meeting."), pair("Had + she + eaten. Eaten \u2014 \u0442\u0440\u0435\u0442\u044C\u044F \u0444\u043E\u0440\u043C\u0430 eat.", "Had + she + eaten. Eaten is the past participle of eat.")),
    fix("The train had went before I arrived.", ["The train had gone before I arrived."], pair("\u041F\u043E\u0441\u043B\u0435 had \u043D\u0443\u0436\u043D\u0430 \u0442\u0440\u0435\u0442\u044C\u044F \u0444\u043E\u0440\u043C\u0430: go \u2192 went \u2192 gone.", "Use the past participle after had: go \u2192 went \u2192 gone."))
  ),
  "past-perfect-continuous": lesson(
    pair("\u0423\u0441\u0442\u0430\u043B\u043E\u0441\u0442\u044C \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0433\u0443\u043B\u043A\u0438", "Tired after a walk"),
    pair("\u041E\u0431\u044A\u044F\u0441\u043D\u0438\u0442\u044C \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u0434\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "Explain the duration of an activity before a past moment."),
    pair("\u0412\u044B \u043D\u0430\u0448\u043B\u0438 \u0434\u0435\u0440\u0435\u0432\u043D\u044E \u043F\u043E\u0441\u043B\u0435 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u0447\u0430\u0441\u043E\u0432 \u0445\u043E\u0434\u044C\u0431\u044B. \u0420\u0430\u0441\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0435, \u043F\u043E\u0447\u0435\u043C\u0443 \u0442\u043E\u0433\u0434\u0430 \u0442\u0430\u043A \u0443\u0441\u0442\u0430\u043B\u0438.", "You found a village after several hours of walking. Explain why you were so tired then."),
    "We had been walking for hours when we found the village.",
    "had been walking",
    [pair("\u0425\u043E\u0434\u044C\u0431\u0430 \u0434\u043B\u0438\u043B\u0430\u0441\u044C \u0434\u043E \u0442\u043E\u0433\u043E, \u043A\u0430\u043A \u043C\u044B \u043D\u0430\u0448\u043B\u0438 \u0434\u0435\u0440\u0435\u0432\u043D\u044E.", "Walking had lasted up to the moment we found the village."), pair("\u041C\u044B \u043D\u0430\u0447\u043D\u0451\u043C \u0438\u0434\u0442\u0438 \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F \u0434\u0435\u0440\u0435\u0432\u043D\u0438.", "We will start walking after visiting the village."), pair("\u041C\u044B \u0433\u0443\u043B\u044F\u0435\u043C \u0441\u0435\u0439\u0447\u0430\u0441.", "We are walking now.")],
    pair("Had been walking \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u0442 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u0441 \u0431\u043E\u043B\u0435\u0435 \u043F\u043E\u0437\u0434\u043D\u0435\u0439 \u0442\u043E\u0447\u043A\u043E\u0439 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "Had been walking connects a sustained activity to a later past reference point."),
    gap("She was tired because she ___ (work) all day.", ["had been working"], "had + been + work-ing", pair("\u0420\u0430\u0431\u043E\u0442\u0430 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u043B\u0430\u0441\u044C \u0434\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D\u0430 \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B\u0430 \u0443\u0441\u0442\u0430\u043B\u043E\u0441\u0442\u044C.", "The work had continued up to the point when she felt tired.")),
    build("How long had you been waiting?", pair("\u041A\u0430\u043A \u0434\u043E\u043B\u0433\u043E \u0442\u044B \u0436\u0434\u0430\u043B \u043A \u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443?", "Ask how long someone had been waiting up to that point."), pair("How long + had + you + been + waiting. \u0422\u043E\u0447\u043A\u0430 \u043E\u0442\u0441\u0447\u0451\u0442\u0430 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "How long + had + you + been + waiting. The reference point is in the past.")),
    fix("We had been waited for an hour when she arrived.", ["We had been waiting for an hour when she arrived."], pair("\u041F\u0440\u043E\u0446\u0435\u0441\u0441 \u043F\u043E\u0441\u043B\u0435 had been \u0442\u0440\u0435\u0431\u0443\u0435\u0442 -ing: waiting.", "An ongoing action after had been needs the -ing form: waiting."))
  ),
  "future-simple": lesson(
    pair("\u041F\u0440\u0435\u0434\u043B\u043E\u0436\u0438\u0442\u044C \u043F\u043E\u043C\u043E\u0449\u044C", "Offering help"),
    pair("\u0412\u044B\u0440\u0430\u0437\u0438\u0442\u044C \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0441\u0435\u0439\u0447\u0430\u0441, \u043E\u0431\u0435\u0449\u0430\u043D\u0438\u0435 \u0438\u043B\u0438 \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0430\u043D\u0438\u0435.", "Express a decision made now, a promise or a prediction."),
    pair("\u0412\u044B \u0432\u0438\u0434\u0438\u0442\u0435, \u0447\u0442\u043E \u0434\u0440\u0443\u0433\u0443 \u0442\u044F\u0436\u0435\u043B\u043E \u043D\u0435\u0441\u0442\u0438 \u0441\u0443\u043C\u043A\u0443, \u0438 \u0442\u0443\u0442 \u0436\u0435 \u043F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u0435\u0442\u0435 \u043F\u043E\u043C\u043E\u0449\u044C.", "You see a friend struggling with a bag and immediately offer to help."),
    "I will help you with that bag.",
    "will help",
    [pair("\u042F \u043F\u0440\u0435\u0434\u043B\u0430\u0433\u0430\u044E \u043F\u043E\u043C\u043E\u0449\u044C \u043F\u0440\u044F\u043C\u043E \u0432 \u043C\u043E\u043C\u0435\u043D\u0442 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430.", "I offer help at the moment of speaking."), pair("\u042F \u043E\u043F\u0438\u0441\u044B\u0432\u0430\u044E \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0443 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "I describe a past habit."), pair("\u042F \u0443\u0436\u0435 \u043F\u043E\u043C\u043E\u0433 \u0438 \u0443\u0448\u0451\u043B.", "I have already helped and left.")],
    pair("Will \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u0440\u0435\u0448\u0435\u043D\u0438\u044F, \u043F\u0440\u0438\u043D\u044F\u0442\u043E\u0433\u043E \u0441\u0435\u0439\u0447\u0430\u0441. \u041F\u043E\u0441\u043B\u0435 will \u2014 \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \u0431\u0435\u0437 to.", "Will is used for a decision made now. It is followed by the base form without to."),
    gap("I think it ___ (rain) tomorrow.", ["will rain", "\u2019ll rain", "'ll rain"], "will + rain", pair("I think \u0432\u0432\u043E\u0434\u0438\u0442 \u043F\u0440\u0435\u0434\u0441\u043A\u0430\u0437\u0430\u043D\u0438\u0435. \u041F\u043E\u0441\u043B\u0435 will \u0444\u043E\u0440\u043C\u0430 rain \u043D\u0435 \u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F.", "I think introduces a prediction. The verb rain stays in its base form after will.")),
    build("Will you help me tomorrow?", pair("\u0422\u044B \u043F\u043E\u043C\u043E\u0436\u0435\u0448\u044C \u043C\u043D\u0435 \u0437\u0430\u0432\u0442\u0440\u0430?", "Ask whether someone will help you tomorrow."), pair("Will + you + help. \u0412\u043E\u043F\u0440\u043E\u0441 \u0441\u0442\u0440\u043E\u0438\u0442\u0441\u044F \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u043E\u0439 will \u043F\u0435\u0440\u0435\u0434 \u043F\u043E\u0434\u043B\u0435\u0436\u0430\u0449\u0438\u043C.", "Will + you + help. Form the question by placing will before the subject.")),
    fix("I will to call you tonight.", ["I will call you tonight."], pair("Will \u2014 \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u043B\u0430\u0433\u043E\u043B; \u043F\u043E\u0441\u043B\u0435 \u043D\u0435\u0433\u043E \u043D\u0435 \u0441\u0442\u0430\u0432\u0438\u043C to.", "Will is a modal verb; do not put to after it."))
  ),
  "future-continuous": lesson(
    pair("\u0417\u0430\u0432\u0442\u0440\u0430 \u0432 \u044D\u0442\u043E \u0432\u0440\u0435\u043C\u044F", "This time tomorrow"),
    pair("\u041E\u043F\u0438\u0441\u0430\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0441 \u0432 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0431\u0443\u0434\u0443\u0449\u0435\u0433\u043E.", "Describe an activity in progress at a future moment."),
    pair("\u0412\u0430\u0448 \u0440\u0435\u0439\u0441 \u0437\u0430\u0432\u0442\u0440\u0430 \u0441 \u0434\u0435\u0441\u044F\u0442\u0438 \u0434\u043E \u0434\u0432\u0435\u043D\u0430\u0434\u0446\u0430\u0442\u0438. \u0414\u0440\u0443\u0433 \u0441\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u0435\u0442, \u0447\u0435\u043C \u0432\u044B \u0431\u0443\u0434\u0435\u0442\u0435 \u0437\u0430\u043D\u044F\u0442\u044B \u0432 \u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044C.", "Your flight tomorrow runs from ten to twelve. A friend asks what you will be doing at eleven."),
    "At eleven tomorrow, I will be flying to Rome.",
    "will be flying",
    [pair("\u0412 \u043E\u0434\u0438\u043D\u043D\u0430\u0434\u0446\u0430\u0442\u044C \u044F \u0431\u0443\u0434\u0443 \u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435 \u043F\u043E\u043B\u0451\u0442\u0430.", "At eleven, the flight will be in progress."), pair("\u042F \u0443\u0436\u0435 \u043F\u0440\u0438\u0437\u0435\u043C\u043B\u0438\u043B\u0441\u044F \u0432\u0447\u0435\u0440\u0430.", "I landed yesterday."), pair("\u042F \u043B\u0435\u0442\u0430\u044E \u0432 \u0420\u0438\u043C \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C.", "I fly to Rome every day.")],
    pair("\u041C\u044B \u043C\u044B\u0441\u043B\u0435\u043D\u043D\u043E \u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u043C\u0441\u044F \u0432 \u0431\u0443\u0434\u0443\u0449\u0435\u043C \u0438 \u0432\u0438\u0434\u0438\u043C \u043F\u0440\u043E\u0446\u0435\u0441\u0441: will be + flying.", "Imagine the future moment and see the activity in progress: will be + flying."),
    gap("At six tomorrow, we ___ (have) dinner.", ["will be having", "\u2019ll be having", "'ll be having"], "will + be + have \u2192 having", pair("\u0423\u0436\u0438\u043D \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442\u044C \u0432 \u0448\u0435\u0441\u0442\u044C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 will be having.", "Dinner will be in progress at six, so use will be having.")),
    build("Will you be working at eight?", pair("\u0422\u044B \u0431\u0443\u0434\u0435\u0448\u044C \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0432 \u0432\u043E\u0441\u0435\u043C\u044C?", "Ask whether someone will be working at eight."), pair("Will + you + be + working. \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C \u0438 be, \u0438 -ing.", "Will + you + be + working. Keep both be and -ing.")),
    fix("She will be study at nine tomorrow.", ["She will be studying at nine tomorrow."], pair("\u041F\u043E\u0441\u043B\u0435 will be \u0434\u043B\u044F \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u043D\u0443\u0436\u043D\u0430 \u0444\u043E\u0440\u043C\u0430 studying.", "An activity in progress after will be needs studying."))
  ),
  "future-perfect": lesson(
    pair("\u0414\u0435\u0434\u043B\u0430\u0439\u043D \u0432 \u043F\u044F\u0442\u043D\u0438\u0446\u0443", "A Friday deadline"),
    pair("\u0421\u043A\u0430\u0437\u0430\u0442\u044C, \u0447\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0433\u043E\u0442\u043E\u0432\u043E \u043A \u0431\u0443\u0434\u0443\u0449\u0435\u043C\u0443 \u0441\u0440\u043E\u043A\u0443.", "Say what will be completed by a future deadline."),
    pair("\u041E\u0442\u0447\u0451\u0442 \u043D\u0443\u0436\u0435\u043D \u0432 \u043F\u044F\u0442\u043D\u0438\u0446\u0443. \u0412\u044B \u043E\u0431\u0435\u0449\u0430\u0435\u0442\u0435, \u0447\u0442\u043E \u043A \u044D\u0442\u043E\u043C\u0443 \u0441\u0440\u043E\u043A\u0443 \u0440\u0430\u0431\u043E\u0442\u0430 \u0443\u0436\u0435 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430.", "The report is needed on Friday. You promise it will already be completed by then."),
    "By Friday, I will have finished the report.",
    "will have finished",
    [pair("\u041A \u043F\u044F\u0442\u043D\u0438\u0446\u0435 \u043E\u0442\u0447\u0451\u0442 \u0431\u0443\u0434\u0435\u0442 \u0433\u043E\u0442\u043E\u0432.", "The report will be ready by Friday."), pair("\u042F \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430\u0447\u043D\u0443 \u043E\u0442\u0447\u0451\u0442 \u0432 \u043F\u044F\u0442\u043D\u0438\u0446\u0443.", "I will only start the report on Friday."), pair("\u042F \u0432\u0441\u0435\u0433\u0434\u0430 \u043F\u0438\u0448\u0443 \u043E\u0442\u0447\u0451\u0442\u044B \u043F\u043E \u043F\u044F\u0442\u043D\u0438\u0446\u0430\u043C.", "I always write reports on Fridays.")],
    pair("By Friday \u2014 \u0441\u0440\u043E\u043A. \u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0438\u0437 \u0431\u0443\u0434\u0443\u0449\u0435\u0433\u043E \u043D\u0430\u0437\u0430\u0434 \u043D\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442: will have + V3.", "By Friday is the deadline. Look back from the future at the completed result: will have + past participle."),
    gap("By noon tomorrow, she ___ (finish) the test.", ["will have finished", "\u2019ll have finished", "'ll have finished"], "will + have + finish-ed", pair("\u041A \u043F\u043E\u043B\u0443\u0434\u043D\u044E \u0442\u0435\u0441\u0442 \u0443\u0436\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0441\u044F: will have finished.", "The test will already be completed by noon: will have finished.")),
    build("Will you have finished by Friday?", pair("\u0422\u044B \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0448\u044C \u043A \u043F\u044F\u0442\u043D\u0438\u0446\u0435?", "Ask whether the work will be finished by Friday."), pair("Will + you + have + finished. By \u043D\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043A\u0440\u0430\u0439\u043D\u0438\u0439 \u0441\u0440\u043E\u043A.", "Will + you + have + finished. By marks the deadline.")),
    fix("By then, I will have wrote the email.", ["By then, I will have written the email."], pair("\u041F\u043E\u0441\u043B\u0435 will have \u043D\u0443\u0436\u043D\u0430 V3: write \u2192 wrote \u2192 written.", "Use the past participle after will have: write \u2192 wrote \u2192 written."))
  ),
  "future-perfect-continuous": lesson(
    pair("\u0413\u043E\u0434 \u0432 \u043D\u043E\u0432\u043E\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u0435", "A year with a new team"),
    pair("\u041F\u043E\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u043A \u0431\u0443\u0434\u0443\u0449\u0435\u0439 \u0434\u0430\u0442\u0435.", "State the duration of an activity at a future date."),
    pair("\u0412\u044B \u043D\u0430\u0447\u0430\u043B\u0438 \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0437\u0434\u0435\u0441\u044C \u0432 \u0438\u044E\u043B\u0435 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0433\u043E\u0434\u0430. \u0412 \u043D\u0430\u0441\u0442\u0443\u043F\u0430\u044E\u0449\u0435\u043C \u0438\u044E\u043B\u0435 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0441\u044F \u0433\u043E\u0434, \u0438 \u0440\u0430\u0431\u043E\u0442\u0430 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0441\u044F.", "You started working here last July. This coming July marks a year, and the work will continue."),
    "By July, I will have been working here for a year.",
    "will have been working",
    [pair("\u0412 \u0438\u044E\u043B\u0435 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043C\u043E\u0435\u0439 \u0440\u0430\u0431\u043E\u0442\u044B \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0435\u0442 \u0433\u043E\u0434\u0430.", "In July, the duration of my work will reach a year."), pair("\u042F \u0432\u043F\u0435\u0440\u0432\u044B\u0435 \u043D\u0430\u0447\u043D\u0443 \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0432 \u0438\u044E\u043B\u0435.", "I will start working for the first time in July."), pair("\u042F \u0440\u0430\u0431\u043E\u0442\u0430\u043B \u0437\u0434\u0435\u0441\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0447\u0435\u0440\u0430.", "I only worked here yesterday.")],
    pair("\u0412\u0430\u0436\u043D\u0430 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043A \u0441\u0440\u043E\u043A\u0443, \u0430 \u043D\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0440\u0430\u0431\u043E\u0442\u044B: will have been + -ing.", "The focus is the duration at a deadline, rather than a completed amount of work: will have been + -ing."),
    gap("At ten, we ___ (drive) for six hours.", ["will have been driving", "\u2019ll have been driving", "'ll have been driving"], "will + have + been + drive \u2192 driving", pair("\u041A \u0434\u0435\u0441\u044F\u0442\u0438 \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0435\u0437\u0434\u043A\u0438 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0435\u0442 \u0448\u0435\u0441\u0442\u0438 \u0447\u0430\u0441\u043E\u0432.", "At ten, the journey\u2019s duration will have reached six hours.")),
    build("How long will you have been studying by June?", pair("\u041A\u0430\u043A \u0434\u043E\u043B\u0433\u043E \u0442\u044B \u0431\u0443\u0434\u0435\u0448\u044C \u0443\u0447\u0438\u0442\u044C\u0441\u044F \u043A \u0438\u044E\u043D\u044E?", "Ask what the duration of studying will be by June."), pair("How long + will + you + have been + studying. \u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0438\u0437\u043C\u0435\u0440\u044F\u0435\u0442\u0441\u044F \u0432 \u0431\u0443\u0434\u0443\u0449\u0435\u0439 \u0442\u043E\u0447\u043A\u0435.", "How long + will + you + have been + studying. Measure the duration at a future point.")),
    fix("By July, she will have been work here for a year.", ["By July, she will have been working here for a year."], pair("\u041F\u043E\u0441\u043B\u0435 will have been \u0434\u043B\u044F \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430 \u043D\u0443\u0436\u043D\u0430 -ing \u0444\u043E\u0440\u043C\u0430: working.", "An ongoing action after will have been needs the -ing form: working."))
  ),
  "articles": lesson(
    pair("\u041D\u043E\u0432\u0430\u044F \u0441\u043E\u0431\u0430\u043A\u0430", "A new dog"),
    pair("\u041E\u0442\u043B\u0438\u0447\u0438\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u043F\u0440\u0435\u0434\u043C\u0435\u0442 \u043E\u0442 \u0443\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0433\u043E \u0441\u043E\u0431\u0435\u0441\u0435\u0434\u043D\u0438\u043A\u0443.", "Distinguish a new item from one already known to the listener."),
    pair("\u0412\u044B \u0432\u043F\u0435\u0440\u0432\u044B\u0435 \u0443\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u0442\u0435 \u0441\u043E\u0431\u0430\u043A\u0443, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u043B\u0438. \u0412\u043E \u0432\u0442\u043E\u0440\u043E\u0439 \u0444\u0440\u0430\u0437\u0435 \u0441\u043E\u0431\u0435\u0441\u0435\u0434\u043D\u0438\u043A \u0443\u0436\u0435 \u0437\u043D\u0430\u0435\u0442, \u043E \u043A\u0430\u043A\u043E\u0439 \u0441\u043E\u0431\u0430\u043A\u0435 \u0440\u0435\u0447\u044C.", "You mention a dog for the first time. In the second sentence, the listener knows which dog you mean."),
    "I saw a dog. The dog was friendly.",
    "The dog",
    [pair("The \u0443\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0430 \u0443\u0436\u0435 \u0443\u043F\u043E\u043C\u044F\u043D\u0443\u0442\u0443\u044E \u0441\u043E\u0431\u0430\u043A\u0443.", "The refers to the dog already mentioned."), pair("The \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u043B\u044E\u0431\u0443\u044E \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0443\u044E \u0441\u043E\u0431\u0430\u043A\u0443.", "The means any unknown dog."), pair("\u041F\u0435\u0440\u0435\u0434 dog \u043D\u0438\u043A\u043E\u0433\u0434\u0430 \u043D\u0435 \u0431\u044B\u0432\u0430\u0435\u0442 \u0430\u0440\u0442\u0438\u043A\u043B\u044F.", "Dog never takes an article.")],
    pair("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 a dog \u2014 \u0432\u0432\u043E\u0434\u0438\u043C \u043F\u0440\u0435\u0434\u043C\u0435\u0442. \u0417\u0430\u0442\u0435\u043C the dog \u2014 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C\u0441\u044F \u043A \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u043C\u0443 \u0437\u043D\u0430\u043A\u043E\u043C\u043E\u043C\u0443 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u0443.", "First a dog introduces the item. Then the dog refers back to that specific known item."),
    gap("We waited for ___ hour.", ["an"], "hour \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441 \u0433\u043B\u0430\u0441\u043D\u043E\u0433\u043E \u0437\u0432\u0443\u043A\u0430 /a\u028A/", pair("H \u0432 hour \u043D\u0435 \u043F\u0440\u043E\u0438\u0437\u043D\u043E\u0441\u0438\u0442\u0441\u044F. \u0412\u044B\u0431\u0438\u0440\u0430\u0435\u043C an \u043F\u043E \u043F\u0435\u0440\u0432\u043E\u043C\u0443 \u0437\u0432\u0443\u043A\u0443, \u0430 \u043D\u0435 \u043F\u043E \u0431\u0443\u043A\u0432\u0435.", "The h in hour is silent. Choose an by the first sound, rather than the letter.")),
    build("I saw a cat. The cat was black.", pair("\u042F \u0443\u0432\u0438\u0434\u0435\u043B \u043A\u043E\u0448\u043A\u0443. \u042D\u0442\u0430 \u043A\u043E\u0448\u043A\u0430 \u0431\u044B\u043B\u0430 \u0447\u0451\u0440\u043D\u043E\u0439.", "Introduce a cat, then describe that same cat."), pair("A cat \u2014 \u043F\u0435\u0440\u0432\u043E\u0435 \u0443\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435. The cat \u2014 \u0442\u043E\u0442 \u0436\u0435 \u0443\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u043F\u0440\u0435\u0434\u043C\u0435\u0442.", "A cat introduces it. The cat refers to the same known animal.")),
    fix("She gave me an advice.", ["She gave me some advice.", "She gave me advice.", "She gave me a piece of advice."], pair("Advice \u2014 \u043D\u0435\u0438\u0441\u0447\u0438\u0441\u043B\u044F\u0435\u043C\u043E\u0435 \u0441\u043B\u043E\u0432\u043E. \u041F\u043E\u0434\u0445\u043E\u0434\u044F\u0442 some advice \u0438\u043B\u0438 a piece of advice.", "Advice is uncountable. Use some advice or a piece of advice."))
  ),
  "modals": lesson(
    pair("\u0421\u043E\u0432\u0435\u0442 \u0434\u0440\u0443\u0433\u0443", "Advice for a friend"),
    pair("\u0412\u044B\u0440\u0430\u0437\u0438\u0442\u044C \u0441\u043E\u0432\u0435\u0442, \u0443\u043C\u0435\u043D\u0438\u0435 \u0438 \u0437\u0430\u043F\u0440\u0435\u0442 \u0431\u0435\u0437 \u043F\u0443\u0442\u0430\u043D\u0438\u0446\u044B.", "Express advice, ability and prohibition clearly."),
    pair("\u0414\u0440\u0443\u0433 \u0434\u043E\u043B\u0433\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0431\u0435\u0437 \u043E\u0442\u0434\u044B\u0445\u0430. \u0412\u044B \u043C\u044F\u0433\u043A\u043E \u0441\u043E\u0432\u0435\u0442\u0443\u0435\u0442\u0435 \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0435\u0440\u0435\u0440\u044B\u0432, \u0430 \u043D\u0435 \u043E\u0442\u0434\u0430\u0451\u0442\u0435 \u043F\u0440\u0438\u043A\u0430\u0437.", "A friend has been working without rest. You gently suggest a break rather than give an order."),
    "You should take a break.",
    "should take",
    [pair("\u042D\u0442\u043E \u0441\u043E\u0432\u0435\u0442.", "This is advice."), pair("\u042D\u0442\u043E \u0441\u0442\u0440\u043E\u0433\u0438\u0439 \u0437\u0430\u043F\u0440\u0435\u0442.", "This is a strict prohibition."), pair("\u042D\u0442\u043E \u0440\u0430\u0441\u0441\u043A\u0430\u0437 \u043E \u0432\u0447\u0435\u0440\u0430\u0448\u043D\u0435\u043C \u0441\u043E\u0431\u044B\u0442\u0438\u0438.", "This describes a past event.")],
    pair("Should \u043F\u0435\u0440\u0435\u0434\u0430\u0451\u0442 \u0441\u043E\u0432\u0435\u0442. \u041F\u043E\u0441\u043B\u0435 \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0433\u043B\u0430\u0433\u043E\u043B\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \u0431\u0435\u0437 to.", "Should expresses advice. A modal is followed by the base form without to."),
    gap("She ___ (can / swim) very well.", ["can swim"], "can + swim", pair("Can \u043D\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 -s \u0434\u0430\u0436\u0435 \u0441 she. \u041F\u043E\u0441\u043B\u0435 \u043D\u0435\u0433\u043E swim \u0431\u0435\u0437 to.", "Can does not take -s with she. Follow it with swim without to.")),
    build("You must not park here.", pair("\u0417\u0434\u0435\u0441\u044C \u043D\u0435\u043B\u044C\u0437\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u0430\u0442\u044C\u0441\u044F.", "Express a prohibition on parking here."), pair("Must not \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u0437\u0430\u043F\u0440\u0435\u0442. Don\u2019t have to \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u0438.", "Must not expresses prohibition. Don\u2019t have to means there is no necessity.")),
    fix("He can to speak English.", ["He can speak English."], pair("\u041F\u043E\u0441\u043B\u0435 can \u043D\u0435 \u0441\u0442\u0430\u0432\u0438\u043C to. Speak \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0432 \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u043E\u0439 \u0444\u043E\u0440\u043C\u0435.", "Do not put to after can. Speak stays in its base form."))
  ),
  "conditionals": lesson(
    pair("\u041F\u043B\u0430\u043D\u044B \u0438 \u043F\u043E\u0433\u043E\u0434\u0430", "Plans and the weather"),
    pair("\u0421\u0432\u044F\u0437\u0430\u0442\u044C \u0443\u0441\u043B\u043E\u0432\u0438\u0435 \u0441 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u043C \u0438\u043B\u0438 \u0432\u043E\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u044B\u043C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C.", "Connect a condition to a real or imagined result."),
    pair("\u0412\u044B \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u0435\u0442\u0435 \u043F\u0440\u043E\u0433\u0443\u043B\u043A\u0443, \u043D\u043E \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u043E\u0431\u0435\u0449\u0430\u0435\u0442 \u0434\u043E\u0436\u0434\u044C. \u041E\u0431\u0441\u0443\u0436\u0434\u0430\u0435\u0442\u0435 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u043D\u0430 \u0437\u0430\u0432\u0442\u0440\u0430.", "You plan a walk, but rain is forecast. Discuss a possible decision for tomorrow."),
    "If it rains, we will stay home.",
    "If it rains",
    [pair("\u042D\u0442\u043E \u0440\u0435\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u0430\u044F \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044F \u0432 \u0431\u0443\u0434\u0443\u0449\u0435\u043C.", "This is a real possibility in the future."), pair("\u042D\u0442\u043E \u0441\u043E\u0436\u0430\u043B\u0435\u043D\u0438\u0435 \u043E \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "This is regret about the past."), pair("\u042D\u0442\u043E \u0441\u043E\u0431\u044B\u0442\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0443\u0436\u0435 \u0442\u043E\u0447\u043D\u043E \u0441\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C.", "This is an event that has definitely already happened.")],
    pair("First conditional: if + Present Simple, will + V. \u0411\u0443\u0434\u0443\u0449\u0438\u0439 \u0441\u043C\u044B\u0441\u043B \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 will \u0432 \u0447\u0430\u0441\u0442\u0438 \u043F\u043E\u0441\u043B\u0435 if.", "First conditional: if + Present Simple, will + base form. A future meaning does not require will after if."),
    gap("If she ___ (study) tonight, she will be ready tomorrow.", ["studies"], "if + Present Simple; she \u2192 -s", pair("\u0412 \u0447\u0430\u0441\u0442\u0438 \u0441 if \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C Present Simple: studies. Will \u0441\u0442\u043E\u0438\u0442 \u0432 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0435.", "Use Present Simple in the if-clause: studies. Will belongs in the result.")),
    build("If I had more time, I would travel.", pair("\u0415\u0441\u043B\u0438 \u0431\u044B \u0443 \u043C\u0435\u043D\u044F \u0431\u044B\u043B\u043E \u0431\u043E\u043B\u044C\u0448\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0438, \u044F \u0431\u044B \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u043E\u0432\u0430\u043B.", "Describe an imagined situation with more time."), pair("Second conditional: had \u043E\u0431\u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u0432\u043E\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0435, would travel \u2014 \u0435\u0433\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.", "Second conditional: had describes an imagined present, and would travel is its result.")),
    fix("If it will rain, we will stay home.", ["If it rains, we will stay home."], pair("\u0412 \u043E\u0431\u044B\u0447\u043D\u043E\u043C \u0443\u0441\u043B\u043E\u0432\u0438\u0438 \u043E \u0431\u0443\u0434\u0443\u0449\u0435\u043C \u043F\u043E\u0441\u043B\u0435 if \u043D\u0443\u0436\u0435\u043D Present Simple: rains.", "An ordinary future condition uses Present Simple after if: rains."))
  ),
  "passive": lesson(
    pair("\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043C\u043E\u0441\u0442\u0430", "The history of a bridge"),
    pair("\u041F\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0432 \u0446\u0435\u043D\u0442\u0440 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F \u043F\u0440\u0435\u0434\u043C\u0435\u0442, \u043D\u0430\u0434 \u043A\u043E\u0442\u043E\u0440\u044B\u043C \u0441\u043E\u0432\u0435\u0440\u0448\u0438\u043B\u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435.", "Focus on the object affected by an action."),
    pair("\u0413\u0438\u0434 \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043E \u043C\u043E\u0441\u0442\u0435. \u0412\u0430\u0436\u043D\u044B \u0441\u0430\u043C \u043C\u043E\u0441\u0442 \u0438 \u0433\u043E\u0434 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u0430, \u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u0438 \u043D\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u044B.", "A guide talks about a bridge. The bridge and its construction date matter; the builders are not named."),
    "The bridge was built in 1990.",
    "was built",
    [pair("\u041C\u043E\u0441\u0442 \u2014 \u043E\u0431\u044A\u0435\u043A\u0442 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u0430, \u0438 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "The bridge received the action, which happened in the past."), pair("\u041C\u043E\u0441\u0442 \u0441\u0430\u043C \u0447\u0442\u043E-\u0442\u043E \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u043B.", "The bridge built something itself."), pair("\u041C\u043E\u0441\u0442 \u0435\u0449\u0451 \u0442\u043E\u043B\u044C\u043A\u043E \u0431\u0443\u0434\u0443\u0442 \u0441\u0442\u0440\u043E\u0438\u0442\u044C.", "The bridge will be built in the future.")],
    pair("Was \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u0440\u043E\u0448\u043B\u043E\u0435, built \u2014 V3 \u043E\u0442 build. \u0418\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0447\u0435\u0440\u0435\u0437 by, \u0435\u0441\u043B\u0438 \u043E\u043D \u0432\u0430\u0436\u0435\u043D.", "Was marks the past; built is the past participle of build. Add the agent with by if it matters."),
    gap("English ___ (speak) in many countries.", ["is spoken"], "be \u0432 Present Simple + speak \u2192 spoken", pair("English \u2014 \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 is. Speak \u2192 spoke \u2192 spoken.", "English is singular, so use is. Speak \u2192 spoke \u2192 spoken.")),
    build("The window was broken yesterday.", pair("\u041E\u043A\u043D\u043E \u0440\u0430\u0437\u0431\u0438\u043B\u0438 \u0432\u0447\u0435\u0440\u0430.", "Describe what happened to the window yesterday."), pair("Window \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435. Was + broken \u0432\u044B\u0440\u0430\u0436\u0430\u0435\u0442 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0439 \u0437\u0430\u043B\u043E\u0433 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C.", "The window receives the action. Was + broken forms the past passive.")),
    fix("The house was build in 1980.", ["The house was built in 1980."], pair("\u0412 \u043F\u0430\u0441\u0441\u0438\u0432\u043D\u043E\u043C \u0437\u0430\u043B\u043E\u0433\u0435 \u043F\u043E\u0441\u043B\u0435 be \u043D\u0443\u0436\u043D\u0430 V3: build \u2192 built \u2192 built.", "The passive uses the past participle after be: build \u2192 built \u2192 built."))
  ),
  "comparatives": lesson(
    pair("\u0412\u044B\u0431\u0438\u0440\u0430\u0435\u043C \u0441\u0443\u043C\u043A\u0443", "Choosing a bag"),
    pair("\u0421\u0440\u0430\u0432\u043D\u0438\u0442\u044C \u0434\u0432\u0430 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u0430 \u0438 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043E\u0434\u0438\u043D \u0438\u0437 \u0433\u0440\u0443\u043F\u043F\u044B.", "Compare two items and identify one in a group."),
    pair("\u0412\u044B \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442\u0435 \u0440\u0443\u0447\u043D\u0443\u044E \u043A\u043B\u0430\u0434\u044C. \u041F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442\u0435 \u0434\u0432\u0435 \u0441\u0443\u043C\u043A\u0438 \u0438 \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u0442\u0435 \u0438\u0445 \u0432\u0435\u0441.", "You are choosing cabin baggage. Lift two bags and compare their weight."),
    "This bag is lighter than mine.",
    "lighter than",
    [pair("\u042D\u0442\u0430 \u0441\u0443\u043C\u043A\u0430 \u043B\u0435\u0433\u0447\u0435 \u043C\u043E\u0435\u0439.", "This bag weighs less than mine."), pair("\u042D\u0442\u0430 \u0441\u0443\u043C\u043A\u0430 \u0441\u0430\u043C\u0430\u044F \u0442\u044F\u0436\u0451\u043B\u0430\u044F \u0438\u0437 \u0432\u0441\u0435\u0445.", "This is the heaviest bag of all."), pair("\u041E\u0431\u0435 \u0441\u0443\u043C\u043A\u0438 \u0432\u0435\u0441\u044F\u0442 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E.", "Both bags weigh the same.")],
    pair("Lighter \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u0442 \u0434\u0432\u0430 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u0430, than \u0432\u0432\u043E\u0434\u0438\u0442 \u0432\u0442\u043E\u0440\u043E\u0439. \u0414\u043B\u044F \u043B\u0443\u0447\u0448\u0435\u0433\u043E \u0438\u0437 \u0433\u0440\u0443\u043F\u043F\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u043C the lightest.", "Lighter compares two items; than introduces the second. Use the lightest for the lightest item in a group."),
    gap("This book is ___ (interesting) than that one.", ["more interesting"], "\u0434\u043B\u0438\u043D\u043D\u043E\u0435 \u043F\u0440\u0438\u043B\u0430\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u2192 more + adjective", pair("Interesting \u2014 \u0434\u043B\u0438\u043D\u043D\u043E\u0435 \u043F\u0440\u0438\u043B\u0430\u0433\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435: more interesting, \u0431\u0435\u0437 -er.", "Interesting is a long adjective: more interesting, without -er.")),
    build("This is the best caf\xE9 in town.", pair("\u042D\u0442\u043E \u043B\u0443\u0447\u0448\u0435\u0435 \u043A\u0430\u0444\u0435 \u0432 \u0433\u043E\u0440\u043E\u0434\u0435.", "Identify the best caf\xE9 in the town."), pair("Good \u2192 better \u2192 best. \u0414\u043B\u044F \u043E\u0434\u043D\u043E\u0433\u043E \u043B\u0443\u0447\u0448\u0435\u0433\u043E \u0438\u0437 \u0433\u0440\u0443\u043F\u043F\u044B: the best.", "Good \u2192 better \u2192 best. Use the best to identify one item in a group.")),
    fix("My room is more bigger than yours.", ["My room is bigger than yours."], pair("\u041D\u0435\u043B\u044C\u0437\u044F \u0441\u043E\u0447\u0435\u0442\u0430\u0442\u044C more \u0438 -er. Big \u2192 bigger, \u0441 \u0443\u0434\u0432\u043E\u0435\u043D\u0438\u0435\u043C g.", "Do not combine more and -er. Big \u2192 bigger, with a doubled g."))
  ),
  "prepositions": lesson(
    pair("\u041D\u0430\u0437\u043D\u0430\u0447\u0430\u0435\u043C \u0432\u0441\u0442\u0440\u0435\u0447\u0443", "Arranging a meeting"),
    pair("\u0422\u043E\u0447\u043D\u043E \u043D\u0430\u0437\u0432\u0430\u0442\u044C \u0432\u0440\u0435\u043C\u044F, \u0434\u0435\u043D\u044C \u0438 \u043C\u0435\u0441\u044F\u0446.", "Specify a time, a day and a month."),
    pair("\u0412\u044B \u0434\u043E\u0433\u043E\u0432\u0430\u0440\u0438\u0432\u0430\u0435\u0442\u0435\u0441\u044C \u043E \u0437\u0430\u043D\u044F\u0442\u0438\u0438 \u0432 \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A. \u0412 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0438 \u043D\u0443\u0436\u043D\u043E \u043D\u0430\u0437\u0432\u0430\u0442\u044C \u0438 \u0434\u0435\u043D\u044C, \u0438 \u0442\u043E\u0447\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.", "You arrange a lesson on Monday. Your message needs both a day and an exact time."),
    "Let\u2019s meet on Monday at ten.",
    "on Monday at ten",
    [pair("On \u2014 \u0434\u0435\u043D\u044C, at \u2014 \u0442\u043E\u0447\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.", "On marks the day; at marks the exact time."), pair("At \u0432\u0441\u0435\u0433\u0434\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0441 \u043C\u0435\u0441\u044F\u0446\u0435\u043C.", "At is always used with a month."), pair("In \u0432\u0441\u0435\u0433\u0434\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u0441 \u0434\u043D\u0451\u043C \u043D\u0435\u0434\u0435\u043B\u0438.", "In is always used with a weekday.")],
    pair("At \u2014 \u0442\u043E\u0447\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F, on \u2014 \u0434\u043D\u0438 \u0438 \u0434\u0430\u0442\u044B, in \u2014 \u043C\u0435\u0441\u044F\u0446\u044B \u0438 \u0433\u043E\u0434\u044B. \u042D\u0442\u0438 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u043C\u043E\u0433\u0430\u044E\u0442 \u0432\u044B\u0431\u0440\u0430\u0442\u044C \u043F\u0440\u0435\u0434\u043B\u043E\u0433.", "At is for exact times, on for days and dates, and in for months and years. These meanings guide the choice."),
    gap("My birthday is ___ July.", ["in"], "\u043C\u0435\u0441\u044F\u0446 \u2192 in", pair("July \u2014 \u043C\u0435\u0441\u044F\u0446, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 in July. \u0414\u043B\u044F \u043F\u043E\u043B\u043D\u043E\u0439 \u0434\u0430\u0442\u044B \u043D\u0443\u0436\u0435\u043D on: on 5 July.", "July is a month, so use in July. A full date uses on: on 5 July.")),
    build("The lesson starts at nine on Monday.", pair("\u0423\u0440\u043E\u043A \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0432 \u0434\u0435\u0432\u044F\u0442\u044C \u0432 \u043F\u043E\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0438\u043A.", "Say the lesson starts at nine on Monday."), pair("At nine \u2014 \u0442\u043E\u0447\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F. On Monday \u2014 \u0434\u0435\u043D\u044C \u043D\u0435\u0434\u0435\u043B\u0438.", "At nine is an exact time. On Monday is a weekday.")),
    fix("We will meet on next Monday.", ["We will meet next Monday."], pair("\u041F\u0435\u0440\u0435\u0434 next / last / this / every \u0432 \u0442\u0430\u043A\u043E\u043C \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u0438 \u043F\u0440\u0435\u0434\u043B\u043E\u0433 \u043D\u0435 \u043D\u0443\u0436\u0435\u043D.", "Do not use a preposition before next / last / this / every in this time expression."))
  )
};
for (const [id, translations] of Object.entries(uzJourneys)) {
  const entry = journeys[id];
  [entry.place, entry.goal, entry.story, entry.clue, entry.gap.why, entry.build.translation, entry.build.why, entry.fix.why, ...entry.meanings].forEach((field, index) => {
    field.uz = translations[index];
  });
}
function normaliseAnswer(value) {
  return String(value).toLowerCase().replace(/[’‘]/g, "'").replace(/\bi'm\b/g, "i am").replace(/\b(you|we|they)'re\b/g, "$1 are").replace(/\b(i|you|we|they)'ve\b/g, "$1 have").replace(/\b(he|she|it)'s\b/g, "$1 is").replace(/\bdoesn't\b/g, "does not").replace(/\bdon't\b/g, "do not").replace(/\bdidn't\b/g, "did not").replace(/\bisn't\b/g, "is not").replace(/\baren't\b/g, "are not").replace(/\bwasn't\b/g, "was not").replace(/\bweren't\b/g, "were not").replace(/\bwon't\b/g, "will not").replace(/\bcan't\b/g, "cannot").replace(/\bmustn't\b/g, "must not").replace(/\bshouldn't\b/g, "should not").replace(/\b([a-z]+)'ll\b/g, "$1 will").replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
}

// design/grammar.jsx
function factory(runtime) {
  return (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
}
function orbitGrammar(runtime, React, { topics, translate, locale, save, sessions = [], signedIn, navigate, speak, primitives }) {
  const h = factory(runtime);
  const c = (ru, en, uz) => locale === "en" ? en : locale === "uz" ? uz || en : ru;
  const content = (value2) => typeof value2 === "string" ? translate(value2) : value2[locale] || value2.en;
  const [group, setGroup] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [topic, setTopic] = React.useState(null);
  const [phase, setPhase] = React.useState(0);
  const [exercise, setExercise] = React.useState(0);
  const [value, setValue] = React.useState("");
  const [words, setWords] = React.useState([]);
  const [feedback, setFeedback] = React.useState(null);
  const [attempted, setAttempted] = React.useState(false);
  const [practice, setPractice] = React.useState([]);
  const [answers, setAnswers] = React.useState([]);
  const [saving, setSaving] = React.useState("");
  const [saveError, setSaveError] = React.useState("");
  const [quit, setQuit] = React.useState(false);
  const [resume, setResume] = React.useState(null);
  const focusRef = React.useRef(null);
  const started = React.useRef(0);
  const resultId = React.useRef("");
  const payload = React.useRef(null);
  const draftKey = "orbit-grammar-journey-v1";
  const labels = [c("\u041F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0439 \u0441\u043C\u044B\u0441\u043B", "Find the meaning", "Ma\u2019noni anglang"), c("\u0420\u0430\u0437\u0431\u0435\u0440\u0438 \u043B\u043E\u0433\u0438\u043A\u0443", "Understand the form", "Qoidani tushuning"), c("\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u0430\u043C", "Guided practice", "Mashq qiling"), c("\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u0441\u0435\u0431\u044F", "Independent check", "O\u2018zingizni tekshiring"), c("\u0422\u0432\u043E\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "Your result", "Natijangiz")];
  const { Tabs, TabsList, TabsTrigger } = primitives;
  React.useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(draftKey));
      if (draft && topics.some((t) => t.id === draft.topicId) && [0, 1, 2, 3, 4].includes(draft.phase) && Array.isArray(draft.answers) && Array.isArray(draft.practice) && Array.isArray(draft.words)) setResume(draft);
    } catch {
    }
  }, []);
  React.useEffect(() => {
    if (!topic) return;
    try {
      if (phase === 4 && saving === "done") sessionStorage.removeItem(draftKey);
      else sessionStorage.setItem(draftKey, JSON.stringify({ topicId: topic.id, phase, exercise, value, words, feedback, attempted, practice, answers, started: started.current, payload: payload.current }));
    } catch {
    }
  }, [topic, phase, exercise, value, words, feedback, attempted, practice, answers, saving]);
  React.useEffect(() => {
    if (!topic) return;
    focusRef.current?.focus({ preventScroll: true });
    focusRef.current?.closest(".og-lesson")?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [topic?.id, phase, exercise]);
  const resetQuestion = () => {
    setValue("");
    setWords([]);
    setFeedback(null);
    setAttempted(false);
  };
  const open = (chosen, draft) => {
    setTopic(chosen);
    setPhase(draft?.phase || 0);
    setExercise(draft?.exercise || 0);
    setValue(draft?.value || "");
    setWords(draft?.words || []);
    setFeedback(draft?.feedback || null);
    setAttempted(draft?.attempted || false);
    setPractice(draft?.practice || []);
    setAnswers(draft?.answers || []);
    setSaving("");
    setSaveError("");
    setQuit(false);
    setResume(null);
    started.current = draft?.started || Date.now();
    resultId.current = draft?.payload?.id || "";
    payload.current = draft?.payload || null;
  };
  React.useEffect(() => {
    const requested = sessionStorage.getItem("orbit-open-topic");
    if (requested) {
      sessionStorage.removeItem("orbit-open-topic");
      const chosen = topics.find((t) => t.id === requested);
      if (chosen) open(chosen);
    }
  }, []);
  const close = () => {
    setTopic(null);
    setQuit(false);
    window.speechSynthesis?.cancel();
    try {
      setResume(JSON.parse(sessionStorage.getItem(draftKey)));
    } catch {
    }
  };
  const latest = (id) => sessions.filter((s) => s.kind === "grammar" && s.itemId === id).sort((a, b) => b.createdAt - a.createdAt)[0];
  const mastered = topics.filter((t) => {
    const s = latest(t.id);
    return s && s.score / s.total >= 0.8;
  }).length;
  const list = topics.filter((t) => (group === "all" || t.group === group) && (t.name + " " + translate(t.name) + " " + translate(t.summary)).toLowerCase().includes(search.toLowerCase()));
  const journey = topic ? journeys[topic.id] : null;
  const meaningPosition = topic ? topics.indexOf(topic) % 3 : 0;
  const meanings = journey ? journey.meanings.map((_, i) => journey.meanings[(i - meaningPosition + 3) % 3]) : [];
  const question = phase === 2 ? [journey.gap, journey.build, journey.fix][exercise] : null;
  const tokens = question?.type === "build" ? question.sentence.split(" ").map((word, id) => ({ word, id })).sort((a, b) => (a.id * 7 + 3) % 19 - (b.id * 7 + 3) % 19) : [];
  const built = words.map((id) => question?.sentence.split(" ")[id]).join(" ");
  const current = phase === 3 ? topic.questions[exercise] : null;
  const score = topic ? answers.filter((a, i) => a === topic.questions[i]?.answer).length : 0;
  const wrong = topic ? topic.questions.map((q, i) => ({ q, i })).filter(({ q, i }) => answers[i] !== q.answer) : [];
  const canCheck = phase === 0 ? value !== "" : question?.type === "build" ? words.length === tokens.length : value.trim().length > 0;
  const check = (event) => {
    event?.preventDefault();
    if (!canCheck || feedback?.correct) return;
    const correct = phase === 0 ? value === String(meaningPosition) : question.type === "build" ? normaliseAnswer(built) === normaliseAnswer(question.sentence) : question.answers.some((a) => normaliseAnswer(a) === normaliseAnswer(value));
    if (!attempted) setPractice((previous) => [...previous, correct]);
    setAttempted(true);
    setFeedback({ correct });
  };
  const advance = () => {
    resetQuestion();
    if (phase === 0) setPhase(1);
    else if (phase === 1) {
      setExercise(0);
      setPhase(2);
    } else if (phase === 2 && exercise < 2) setExercise(exercise + 1);
    else if (phase === 2) {
      setExercise(0);
      setPhase(3);
    }
  };
  const assess = () => {
    if (value === "") return;
    const next = [...answers, Number(value)];
    setAnswers(next);
    resetQuestion();
    if (exercise < topic.questions.length - 1) setExercise(exercise + 1);
    else {
      resultId.current = crypto.randomUUID();
      const date2 = /* @__PURE__ */ new Date();
      const day = [date2.getFullYear(), String(date2.getMonth() + 1).padStart(2, "0"), String(date2.getDate()).padStart(2, "0")].join("-");
      payload.current = { id: resultId.current, kind: "grammar", itemId: topic.id, score: next.filter((a, i) => a === topic.questions[i].answer).length, total: topic.questions.length, seconds: Math.min(7200, Math.max(0, Math.round((Date.now() - started.current) / 1e3))), day };
      setPhase(4);
    }
  };
  const saveResult = async () => {
    if (!payload.current || saving === "busy" || saving === "done") return;
    setSaving("busy");
    setSaveError("");
    try {
      await save(payload.current);
      setSaving("done");
    } catch {
      setSaving("error");
      setSaveError(c("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C. \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C \u0432\u0445\u043E\u0434 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438 \u043F\u043E\u043F\u044B\u0442\u043A\u0443.", "Could not save. Your result remains here \u2014 check your sign-in and retry.", "Saqlanmadi. Natija shu yerda \u2014 akkauntga kirib, qayta urinib ko\u2018ring."));
    }
  };
  const options = (items, selected, onSelect) => /* @__PURE__ */ h("fieldset", { className: "og-options" }, /* @__PURE__ */ h("legend", { className: "og-sr-only" }, c("\u0412\u044B\u0431\u0435\u0440\u0438 \u043E\u0442\u0432\u0435\u0442", "Choose an answer", "Javobni tanlang")), items.map((item, i) => /* @__PURE__ */ h("label", { key: i, className: selected === String(i) ? "is-selected" : "" }, /* @__PURE__ */ h("input", { type: "radio", name: "og-answer", value: i, checked: selected === String(i), onChange: () => {
    onSelect(String(i));
    setFeedback(null);
  }, disabled: feedback?.correct }), /* @__PURE__ */ h("span", { className: "og-option-letter" }, String.fromCharCode(65 + i)), /* @__PURE__ */ h("span", null, item))));
  if (!topic) return /* @__PURE__ */ h("div", { className: "og-library" }, /* @__PURE__ */ h("div", { className: "og-heading" }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, "GRAMMAR, IN REAL LIFE"), /* @__PURE__ */ h("h1", null, c("\u041D\u0435 \u0437\u0430\u0443\u0447\u0438\u0432\u0430\u0439.", "Don\u2019t just memorise.", "Faqat yodlamang."), /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, c("\u041D\u0430\u0447\u043D\u0438 \u043F\u043E\u043D\u0438\u043C\u0430\u0442\u044C.", "Start understanding.", "Tushunishni boshlang."))), /* @__PURE__ */ h("p", null, c("\u041E\u0442 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \xAB\u043F\u043E\u0447\u0435\u043C\u0443?\xBB \u0434\u043E \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F. \u041E\u0434\u043D\u0430 \u0442\u0435\u043C\u0430 \u2014 \u043E\u0434\u043D\u043E \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435.", "From your first \u201Cwhy?\u201D to a confident sentence. One topic. One small discovery.", "Birinchi \xABnega?\xBBdan ishonchli gapgacha. Har bir mavzu \u2014 kichik kashfiyot."))), /* @__PURE__ */ h("section", { className: "og-start" }, /* @__PURE__ */ h("div", { className: "og-start-copy" }, /* @__PURE__ */ h("span", { className: "og-label" }, resume ? c("\u041F\u0420\u041E\u0414\u041E\u041B\u0416\u0418 \u0422\u0410\u041C, \u0413\u0414\u0415 \u041E\u0421\u0422\u0410\u041D\u041E\u0412\u0418\u041B\u0421\u042F", "PICK UP WHERE YOU LEFT OFF", "TO\u2018XTAGAN JOYINGIZDAN DAVOM ETING") : c("\u0422\u0412\u041E\u042F \u041F\u0415\u0420\u0412\u0410\u042F \u0418\u0421\u0422\u041E\u0420\u0418\u042F", "YOUR FIRST STORY", "BIRINCHI HIKOYANGIZ")), /* @__PURE__ */ h("h2", null, resume ? topics.find((t) => t.id === resume.topicId)?.name : "Present Simple"), /* @__PURE__ */ h("p", null, resume ? c("\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0448\u0430\u0433 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D \u0432 \u044D\u0442\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435. \u041C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u043D\u0435\u043C\u0443 \u043F\u043E\u0441\u043B\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B.", "Your current step is kept in this tab, including after a page refresh.", "Joriy bosqich bu sahifada saqlangan. Sahifa yangilansa ham davom etishingiz mumkin.") : content(journeys["present-simple"].goal)), /* @__PURE__ */ h("button", { className: "og-primary", onClick: () => open(topics.find((t) => t.id === (resume?.topicId || "present-simple")), resume) }, resume ? c("\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0443\u0440\u043E\u043A", "Continue lesson", "Darsni davom ettirish") : c("\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0435\u0440\u0432\u044B\u0439 \u0443\u0440\u043E\u043A", "Start your first lesson", "Birinchi darsni boshlash"), /* @__PURE__ */ h("span", null, "\u2197"))), /* @__PURE__ */ h("div", { className: "og-start-art", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { className: "og-orbit-ring" }), /* @__PURE__ */ h("div", { className: "og-art-dot" }), /* @__PURE__ */ h("span", { className: "og-art-time" }, "every day"), /* @__PURE__ */ h("b", null, "I ", /* @__PURE__ */ h("span", null, "do.")), /* @__PURE__ */ h("small", null, "small steps. real understanding."))), /* @__PURE__ */ h("div", { className: "og-route-strip" }, labels.slice(0, 4).map((label, i) => /* @__PURE__ */ h("div", { key: label }, /* @__PURE__ */ h("span", null, String(i + 1).padStart(2, "0")), label))), /* @__PURE__ */ h("div", { className: "og-catalog-heading" }, /* @__PURE__ */ h("h2", null, c("\u041D\u0430\u0439\u0434\u0438 \u0441\u0432\u043E\u044E \u0442\u0435\u043C\u0443.", "Find your topic.", "Mavzuni tanlang.")), /* @__PURE__ */ h("span", null, signedIn ? `${mastered} / ${topics.length} ` + c("\u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043E", "checks passed", "tekshiruv bajarildi") : c("18 \u0442\u0435\u043C \xB7 \u0432 \u0441\u0432\u043E\u0451\u043C \u0440\u0438\u0442\u043C\u0435", "18 topics \xB7 your own pace", "18 mavzu \xB7 o\u2018z ritmingizda"))), /* @__PURE__ */ h("div", { className: "og-filters" }, /* @__PURE__ */ h(Tabs, { value: group, onValueChange: setGroup }, /* @__PURE__ */ h(TabsList, { className: "og-tabs" }, ["all", "Present", "Past", "Future", "Basics"].map((id) => /* @__PURE__ */ h(TabsTrigger, { key: id, value: id }, id === "all" ? c("\u0412\u0441\u0435 \u0442\u0435\u043C\u044B", "All topics", "Barcha mavzular") : id === "Basics" ? c("\u041E\u0441\u043D\u043E\u0432\u044B", "Essentials", "Asoslar") : id)))), /* @__PURE__ */ h("label", { className: "og-search" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 20 20", "aria-hidden": "true" }, /* @__PURE__ */ h("circle", { cx: "8", cy: "8", r: "5.5" }), /* @__PURE__ */ h("path", { d: "m12 12 5 5" })), /* @__PURE__ */ h("input", { "aria-label": c("\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0433\u0440\u0430\u043C\u043C\u0430\u0442\u0438\u043A\u0435", "Search grammar", "Grammatika bo\u2018yicha qidiruv"), placeholder: c("\u041D\u0430\u0439\u0442\u0438 \u0442\u0435\u043C\u0443", "Find a topic", "Mavzuni qidiring"), value: search, onChange: (e) => setSearch(e.target.value) }))), /* @__PURE__ */ h("div", { className: "og-topic-grid" }, list.map((t) => {
    const session = latest(t.id);
    const passed = session && session.score / session.total >= 0.8;
    const repeat = passed && session.day < (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
    return /* @__PURE__ */ h("button", { className: "og-topic " + (passed ? "is-passed" : ""), key: t.id, onClick: () => open(t) }, /* @__PURE__ */ h("div", { className: "og-topic-meta" }, /* @__PURE__ */ h("span", null, String(topics.indexOf(t) + 1).padStart(2, "0")), /* @__PURE__ */ h("span", null, t.level), passed && /* @__PURE__ */ h("span", { className: "og-passed-label" }, repeat ? c("\u041A \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u044E", "Review due", "Takrorlang") : c("\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430", "Check passed", "Tekshiruv bajarildi"), " \u2713")), /* @__PURE__ */ h("h3", null, translate(t.name)), /* @__PURE__ */ h("p", null, content(journeys[t.id].goal)), /* @__PURE__ */ h("div", { className: "og-topic-footer" }, /* @__PURE__ */ h("span", null, c("\u0418\u0441\u0442\u043E\u0440\u0438\u044F \xB7 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \xB7 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430", "Story \xB7 practice \xB7 check", "Hikoya \xB7 mashq \xB7 tekshiruv")), /* @__PURE__ */ h("span", { "aria-hidden": "true" }, "\u2197")));
  })), !list.length && /* @__PURE__ */ h("div", { className: "og-empty" }, /* @__PURE__ */ h("h3", null, c("\u0422\u0430\u043A\u043E\u0439 \u0442\u0435\u043C\u044B \u043F\u043E\u043A\u0430 \u043D\u0435\u0442", "No matching topic", "Mavzu topilmadi")), /* @__PURE__ */ h("p", null, c("\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0434\u0440\u0443\u0433\u043E\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438\u043B\u0438 \u0443\u0431\u0435\u0440\u0438 \u0444\u0438\u043B\u044C\u0442\u0440\u044B.", "Try another name or clear the filters.", "Boshqa nom kiriting yoki filtrlarni tozalang.")), /* @__PURE__ */ h("button", { className: "og-secondary", onClick: () => {
    setSearch("");
    setGroup("all");
  } }, c("\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435 \u0442\u0435\u043C\u044B", "Show all topics", "Barcha mavzular"))), /* @__PURE__ */ h("p", { className: "og-sources" }, c("\u0421\u0432\u0435\u0440\u044F\u0439 \u043F\u0440\u0430\u0432\u0438\u043B\u0430 \u0441 \u043F\u0435\u0440\u0432\u043E\u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0430\u043C\u0438:", "Explore the reference guides:", "Qoidalar bo\u2018yicha manbalar:"), " ", /* @__PURE__ */ h("a", { href: "https://learnenglish.britishcouncil.org/grammar", target: "_blank", rel: "noreferrer" }, "British Council"), " \xB7 ", /* @__PURE__ */ h("a", { href: "https://dictionary.cambridge.org/grammar/british-grammar/", target: "_blank", rel: "noreferrer" }, "Cambridge Dictionary")));
  return /* @__PURE__ */ h("div", { className: "og-lesson" }, /* @__PURE__ */ h("div", { className: "og-lesson-top" }, /* @__PURE__ */ h("button", { className: "og-back", onClick: () => phase === 4 ? close() : setQuit(true) }, "\u2190 ", c("\u0412\u0441\u0435 \u0442\u0435\u043C\u044B", "All topics", "Barcha mavzular")), /* @__PURE__ */ h("span", null, translate(topic.name), /* @__PURE__ */ h("b", null, topic.level))), quit && /* @__PURE__ */ h("div", { className: "og-exit", role: "status" }, /* @__PURE__ */ h("p", null, c("\u0423\u0440\u043E\u043A \u0435\u0449\u0451 \u043D\u0435 \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D. \u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0448\u0430\u0433 \u043E\u0441\u0442\u0430\u043D\u0435\u0442\u0441\u044F \u0432 \u044D\u0442\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435, \u0447\u0442\u043E\u0431\u044B \u0442\u044B \u043C\u043E\u0433 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C.", "The lesson is unfinished. Your current step stays in this tab so you can continue.", "Dars tugamagan. Davom etish uchun joriy bosqich bu sahifada saqlanadi.")), /* @__PURE__ */ h("button", { className: "og-secondary", onClick: () => setQuit(false) }, c("\u041E\u0441\u0442\u0430\u0442\u044C\u0441\u044F", "Keep learning", "Davom etish")), /* @__PURE__ */ h("button", { className: "og-back", onClick: close }, c("\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0442\u0435\u043C\u0430\u043C", "Return to topics", "Mavzularga qaytish"))), /* @__PURE__ */ h("ol", { className: "og-steps", "aria-label": c("\u042D\u0442\u0430\u043F\u044B \u0443\u0440\u043E\u043A\u0430", "Lesson stages", "Dars bosqichlari") }, labels.map((label, i) => /* @__PURE__ */ h("li", { key: label, className: i < phase ? "is-done" : i === phase ? "is-current" : "", "aria-current": i === phase ? "step" : void 0 }, /* @__PURE__ */ h("span", null, i < phase ? "\u2713" : i + 1), /* @__PURE__ */ h("b", null, label)))), /* @__PURE__ */ h("div", { className: "og-lesson-layout" }, /* @__PURE__ */ h("section", { className: "og-stage", "aria-labelledby": "og-stage-title" }, /* @__PURE__ */ h("div", { className: "og-stage-heading", ref: focusRef, tabIndex: -1 }, /* @__PURE__ */ h("span", { className: "og-label" }, phase < 4 ? `${String(phase + 1).padStart(2, "0")} / 04 \xB7 ` : "", phase === 0 ? content(journey.place) : labels[phase]), /* @__PURE__ */ h("h1", { id: "og-stage-title" }, phase === 0 ? c("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u2014 \u0441\u043C\u044B\u0441\u043B.", "Meaning comes first.", "Avval \u2014 ma\u2019no.") : phase === 1 ? c("\u0422\u0435\u043F\u0435\u0440\u044C \u0432\u0441\u0451 \u0441\u0445\u043E\u0434\u0438\u0442\u0441\u044F.", "Now it makes sense.", "Endi hammasi tushunarli.") : phase === 2 ? c("\u0422\u0432\u043E\u044F \u043E\u0447\u0435\u0440\u0435\u0434\u044C.", "Your turn.", "Sizning navbatingiz.") : phase === 3 ? c("\u0411\u0435\u0437 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043E\u043A.", "On your own.", "Yordamsiz.") : score / topic.questions.length >= 0.8 ? c("\u041F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0435\u0441\u0442\u044C.", "You\u2019ve got it.", "Tushundingiz.") : c("\u0415\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438.", "A little more practice.", "Yana bir oz mashq."))), phase === 0 && /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("p", { className: "og-lead" }, content(journey.story)), /* @__PURE__ */ h("div", { className: "og-scene" }, /* @__PURE__ */ h("span", null, c("\u0422\u0412\u041E\u042F \u0424\u0420\u0410\u0417\u0410", "YOUR SENTENCE", "SIZNING GAPINGIZ")), /* @__PURE__ */ h("p", null, journey.sentence.split(journey.chunk)[0], /* @__PURE__ */ h("mark", null, journey.chunk), journey.sentence.split(journey.chunk)[1]), /* @__PURE__ */ h("button", { className: "og-audio", "aria-label": c("\u041F\u0440\u043E\u0441\u043B\u0443\u0448\u0430\u0442\u044C \u0444\u0440\u0430\u0437\u0443", "Listen to the sentence", "Gapni tinglash"), onClick: () => speak(journey.sentence) }, "\u2197 ", c("\u041F\u043E\u0441\u043B\u0443\u0448\u0430\u0442\u044C", "Listen", "Tinglash"))), /* @__PURE__ */ h("h2", { className: "og-question" }, c("\u0427\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0430\u0435\u0442 \u044D\u0442\u0430 \u0444\u0440\u0430\u0437\u0430?", "What does this sentence tell us?", "Bu gap nimani anglatadi?")), options(meanings.map(content), value, setValue), feedback && /* @__PURE__ */ h("div", { className: "og-feedback " + (feedback.correct ? "is-good" : "is-wrong"), role: "status" }, /* @__PURE__ */ h("strong", null, feedback.correct ? c("\u0414\u0430, \u0442\u044B \u0443\u043B\u043E\u0432\u0438\u043B \u0441\u043C\u044B\u0441\u043B.", "Yes, you found the meaning.", "Ha, ma\u2019noni tushundingiz.") : c("\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438 \u043D\u0430 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u044E \u0435\u0449\u0451 \u0440\u0430\u0437.", "Look at the situation again.", "Vaziyatga yana bir qarang.")), /* @__PURE__ */ h("p", null, content(journey.clue))), /* @__PURE__ */ h("div", { className: "og-actions" }, feedback?.correct ? /* @__PURE__ */ h("button", { className: "og-primary", onClick: advance }, c("\u0420\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u043F\u0440\u0430\u0432\u0438\u043B\u0435", "Understand the rule", "Qoidani tushunish"), " \u2192") : /* @__PURE__ */ h("button", { className: "og-primary", disabled: !canCheck, onClick: check }, c("\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u043C\u044B\u0441\u043B\u044C", "Check your idea", "Fikrni tekshirish")))), phase === 1 && /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("p", { className: "og-lead" }, translate(topic.summary)), /* @__PURE__ */ h("div", { className: "og-insight" }, /* @__PURE__ */ h("span", null, "01"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, c("\u0421\u043C\u044B\u0441\u043B \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442 \u0444\u043E\u0440\u043C\u0443", "Meaning chooses the form", "Ma\u2019no shaklni tanlaydi")), /* @__PURE__ */ h("p", null, content(journey.clue)))), /* @__PURE__ */ h("div", { className: "og-insight" }, /* @__PURE__ */ h("span", null, "02"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, c("\u0421\u043E\u0431\u0435\u0440\u0438 \u0444\u0440\u0430\u0437\u0443 \u043F\u043E \u0447\u0430\u0441\u0442\u044F\u043C", "Build the sentence", "Gapni tuzing")), /* @__PURE__ */ h("div", { className: "og-formulas" }, topic.formula.map((line) => /* @__PURE__ */ h("div", { key: line }, translate(line)))))), /* @__PURE__ */ h("div", { className: "og-insight" }, /* @__PURE__ */ h("span", null, "03"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, c("\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u043D\u0430 \u043F\u0440\u0438\u043C\u0435\u0440\u0430\u0445", "Look at examples", "Misollarni ko\u2018ring")), topic.examples.map((example) => /* @__PURE__ */ h("div", { key: example, className: "og-example" }, /* @__PURE__ */ h("p", null, translate(example)), /* @__PURE__ */ h("button", { className: "og-audio", "aria-label": c("\u041E\u0437\u0432\u0443\u0447\u0438\u0442\u044C \u043F\u0440\u0438\u043C\u0435\u0440", "Listen to example", "Misolni tinglash"), onClick: () => speak(example.split(" \u2014 ")[0]) }, "\u25B6"))))), /* @__PURE__ */ h("aside", { className: "og-note" }, /* @__PURE__ */ h("strong", null, c("\u041B\u043E\u0432\u0443\u0448\u043A\u0430, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u0441\u0442\u043E\u0438\u0442 \u0437\u0430\u043C\u0435\u0442\u0438\u0442\u044C", "A trap to notice", "E\u2019tibor berish kerak")), /* @__PURE__ */ h("p", null, translate(topic.tip))), /* @__PURE__ */ h("p", { className: "og-notation" }, c("V \u2014 \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \xB7 V2 \u2014 \u043F\u0440\u043E\u0448\u0435\u0434\u0448\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \xB7 V3 \u2014 \u043F\u0440\u0438\u0447\u0430\u0441\u0442\u0438\u0435 \u043F\u0440\u043E\u0448\u0435\u0434\u0448\u0435\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438.", "V \u2014 base form \xB7 V2 \u2014 past form \xB7 V3 \u2014 past participle.", "V \u2014 boshlang\u2018ich shakl \xB7 V2 \u2014 o\u2018tgan zamon \xB7 V3 \u2014 o\u2018tgan zamon sifatdoshi.")), /* @__PURE__ */ h("div", { className: "og-actions" }, /* @__PURE__ */ h("button", { className: "og-primary", onClick: advance }, c("\u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u0430\u043C\u043E\u043C\u0443", "Try it yourself", "Mashq qilish"), " \u2192"))), phase === 2 && /* @__PURE__ */ h("form", { onSubmit: check }, /* @__PURE__ */ h("div", { className: "og-question-meta" }, /* @__PURE__ */ h("span", null, question.type === "gap" ? c("\u0417\u0430\u043F\u043E\u043B\u043D\u0438 \u043F\u0440\u043E\u043F\u0443\u0441\u043A", "Fill the gap", "Bo\u2018sh joyni to\u2018ldiring") : question.type === "build" ? c("\u0421\u043E\u0431\u0435\u0440\u0438 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435", "Build a sentence", "Gapni tuzing") : c("\u0418\u0441\u043F\u0440\u0430\u0432\u044C \u043E\u0448\u0438\u0431\u043A\u0443", "Correct the mistake", "Xatoni tuzating")), /* @__PURE__ */ h("span", null, exercise + 1, " / 3")), /* @__PURE__ */ h("h2", { className: "og-question" }, question.type === "gap" ? c("\u041F\u043E\u0441\u0442\u0430\u0432\u044C \u0433\u043B\u0430\u0433\u043E\u043B \u0438\u043B\u0438 \u0441\u043B\u043E\u0432\u043E \u0432 \u043D\u0443\u0436\u043D\u0443\u044E \u0444\u043E\u0440\u043C\u0443.", "Use the correct verb form or word.", "To\u2018g\u2018ri shakl yoki so\u2018zni kiriting.") : question.type === "build" ? content(question.translation) : c("\u0412 \u044D\u0442\u043E\u0439 \u0444\u0440\u0430\u0437\u0435 \u0435\u0441\u0442\u044C \u043E\u0448\u0438\u0431\u043A\u0430. \u041D\u0430\u043F\u0438\u0448\u0438 \u0435\u0451 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E.", "This sentence has a mistake. Write it correctly.", "Bu gapda xato bor. To\u2018g\u2018ri gapni yozing.")), question.type === "build" ? /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "og-sentence-board", "aria-live": "polite" }, words.length ? words.map((id, i) => /* @__PURE__ */ h("button", { type: "button", key: id, disabled: feedback?.correct, "aria-label": c("\u0423\u0431\u0440\u0430\u0442\u044C \u0441\u043B\u043E\u0432\u043E ", "Remove word ", "So\u2018zni olib tashlash ") + question.sentence.split(" ")[id], onClick: () => {
    setWords(words.filter((_, n) => n !== i));
    setFeedback(null);
  } }, question.sentence.split(" ")[id], " ", /* @__PURE__ */ h("span", null, "\xD7"))) : /* @__PURE__ */ h("span", null, c("\u0412\u044B\u0431\u0438\u0440\u0430\u0439 \u0441\u043B\u043E\u0432\u0430 \u0432 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435", "Choose words in the right order", "So\u2018zlarni to\u2018g\u2018ri tartibda tanlang"))), /* @__PURE__ */ h("div", { className: "og-word-bank" }, tokens.map(({ word, id }) => /* @__PURE__ */ h("button", { key: id, type: "button", disabled: words.includes(id) || feedback?.correct, onClick: () => {
    setWords([...words, id]);
    setFeedback(null);
  } }, word))), /* @__PURE__ */ h("button", { type: "button", className: "og-back", disabled: !words.length || feedback?.correct, onClick: () => {
    setWords([]);
    setFeedback(null);
  } }, c("\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u0431\u043E\u0440\u043A\u0443 \u0437\u0430\u043D\u043E\u0432\u043E", "Clear sentence", "Gapni tozalash"))) : /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "og-prompt " + (question.type === "fix" ? "og-mistake" : "") }, question.sentence), /* @__PURE__ */ h("label", { className: "og-answer-field" }, question.type === "gap" ? c("\u0422\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u044B\u0435 \u0441\u043B\u043E\u0432\u0430", "Only the missing words", "Faqat tushirib qoldirilgan so\u2018zlar") : c("\u041F\u043E\u043B\u043D\u043E\u0435 \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435", "The full corrected sentence", "To\u2018liq tuzatilgan gap"), /* @__PURE__ */ h("input", { lang: "en", autoComplete: "off", autoCapitalize: "none", spellCheck: false, value, disabled: feedback?.correct, onChange: (e) => {
    setValue(e.target.value);
    setFeedback(null);
  }, "aria-describedby": "og-answer-note", placeholder: question.type === "gap" ? "\u2026" : c("\u041D\u0430\u043F\u0438\u0448\u0438 \u043F\u043E-\u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438", "Write in English", "Ingliz tilida yozing") })), /* @__PURE__ */ h("small", { id: "og-answer-note", className: "og-input-note" }, c("\u0420\u0435\u0433\u0438\u0441\u0442\u0440, \u043F\u0443\u043D\u043A\u0442\u0443\u0430\u0446\u0438\u044F \u0438 \u043E\u0431\u044B\u0447\u043D\u044B\u0435 \u0441\u043E\u043A\u0440\u0430\u0449\u0435\u043D\u0438\u044F \u043D\u0435 \u0432\u043B\u0438\u044F\u044E\u0442 \u043D\u0430 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.", "Capitalisation, punctuation and common contractions do not affect the result.", "Katta harflar, tinish belgilari va oddiy qisqartmalar natijaga ta\u2019sir qilmaydi."))), feedback && /* @__PURE__ */ h("div", { className: "og-feedback " + (feedback.correct ? "is-good" : "is-wrong"), role: "status" }, /* @__PURE__ */ h("strong", null, feedback.correct ? c("\u0418\u043C\u0435\u043D\u043D\u043E \u0442\u0430\u043A.", "Exactly.", "To\u2018g\u2018ri.") : c("\u041F\u043E\u0447\u0442\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.", "Almost. Try again.", "Yana urinib ko\u2018ring.")), /* @__PURE__ */ h("p", null, content(question.why)), !feedback.correct && question.type !== "build" && /* @__PURE__ */ h("p", null, c("\u041E\u0440\u0438\u0435\u043D\u0442\u0438\u0440: ", "A model: ", "Namuna: "), /* @__PURE__ */ h("b", { lang: "en" }, question.answers[0]))), /* @__PURE__ */ h("div", { className: "og-actions" }, feedback?.correct ? /* @__PURE__ */ h("button", { className: "og-primary", type: "button", onClick: advance }, exercise === 2 ? c("\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435", "Start the check", "Tekshiruvni boshlash") : c("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435", "Next exercise", "Keyingi mashq"), " \u2192") : /* @__PURE__ */ h("button", { className: "og-primary", type: "submit", disabled: !canCheck }, c("\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C", "Check", "Tekshirish")), question.type === "gap" && !feedback?.correct && /* @__PURE__ */ h("button", { className: "og-back", type: "button", onClick: () => {
    if (!attempted) {
      setPractice((p) => [...p, false]);
      setAttempted(true);
    }
    setFeedback({ correct: false });
  } }, c("\u041D\u0443\u0436\u043D\u0430 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430", "I need a hint", "Yordam kerak")))), phase === 3 && /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("p", { className: "og-lead" }, c("\u0427\u0435\u0442\u044B\u0440\u0435 \u043D\u043E\u0432\u044B\u0445 \u0432\u043E\u043F\u0440\u043E\u0441\u0430. \u041E\u0442\u0432\u0435\u0442\u044B \u0438 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u044F \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0432 \u043A\u043E\u043D\u0446\u0435 \u2014 \u0437\u0434\u0435\u0441\u044C \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u0435.", "Four new questions. Answers and explanations appear at the end, so this checks independent understanding.", "To\u2018rtta yangi savol. Javoblar va izohlar oxirida ko\u2018rsatiladi.")), /* @__PURE__ */ h("div", { className: "og-question-meta" }, /* @__PURE__ */ h("span", null, c("\u0421\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430", "Independent check", "Mustaqil tekshiruv")), /* @__PURE__ */ h("span", null, exercise + 1, " / ", topic.questions.length)), /* @__PURE__ */ h("h2", { className: "og-question" }, translate(current.q)), options(current.options.map(translate), value, setValue), /* @__PURE__ */ h("div", { className: "og-actions" }, /* @__PURE__ */ h("button", { className: "og-primary", disabled: value === "", onClick: assess }, exercise === topic.questions.length - 1 ? c("\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "See your result", "Natijani ko\u2018rish") : c("\u0414\u0430\u043B\u044C\u0448\u0435", "Continue", "Davom etish"), " \u2192"))), phase === 4 && /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "og-score" }, /* @__PURE__ */ h("strong", null, score, /* @__PURE__ */ h("span", null, " / ", topic.questions.length)), /* @__PURE__ */ h("p", null, c("\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432 \u0431\u0435\u0437 \u043F\u043E\u0434\u0441\u043A\u0430\u0437\u043E\u043A", "correct answers without hints", "yordamsiz to\u2018g\u2018ri javoblar"))), /* @__PURE__ */ h("p", { className: "og-lead" }, score / topic.questions.length >= 0.8 ? c("\u042D\u0442\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430. \u0412\u0435\u0440\u043D\u0438\u0441\u044C \u043A \u0442\u0435\u043C\u0435 \u0437\u0430\u0432\u0442\u0440\u0430 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0432\u0441\u043F\u043E\u043C\u043D\u0438\u0442\u044C \u043F\u0440\u0430\u0432\u0438\u043B\u043E \u043D\u0430 \u043D\u043E\u0432\u044B\u0445 \u043F\u0440\u0438\u043C\u0435\u0440\u0430\u0445.", "This check is passed. Return tomorrow and recall the rule with fresh examples.", "Tekshiruv bajarildi. Ertaga qaytib, qoidani yangi misollarda eslang.") : c("\u0412 \u044D\u0442\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u0435\u0449\u0451 \u043E\u0441\u0442\u0430\u043B\u0438\u0441\u044C \u043E\u0448\u0438\u0431\u043A\u0438. \u0420\u0430\u0437\u0431\u0435\u0440\u0438 \u0438\u0445, \u0432\u0435\u0440\u043D\u0438\u0441\u044C \u043A \u043F\u0440\u0438\u043C\u0435\u0440\u0430\u043C \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u043E\u0432\u0430.", "This check still has some mistakes. Review them, revisit the examples and try again.", "Qoidani o\u2018rgandingiz. Xatolarni ko\u2018rib chiqing va qayta tekshiring.")), /* @__PURE__ */ h("div", { className: "og-practice-score" }, /* @__PURE__ */ h("span", null, "\u2713"), c("\u041D\u0430 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0435 \u0441 \u043F\u0435\u0440\u0432\u043E\u0439 \u043F\u043E\u043F\u044B\u0442\u043A\u0438: ", "In guided practice, correct on first try: ", "Mashqda birinchi urinishda: "), /* @__PURE__ */ h("b", null, practice.filter(Boolean).length, " / 4")), wrong.length > 0 && /* @__PURE__ */ h("section", { className: "og-review" }, /* @__PURE__ */ h("h2", null, c("\u0412\u043E\u0442 \u0447\u0442\u043E \u0441\u0442\u043E\u0438\u0442 \u0437\u0430\u043A\u0440\u0435\u043F\u0438\u0442\u044C", "What to reinforce", "Nimani takrorlash kerak")), wrong.map(({ q, i }) => /* @__PURE__ */ h("div", { key: i }, /* @__PURE__ */ h("strong", null, translate(q.q)), /* @__PURE__ */ h("p", { className: "og-review-wrong" }, c("\u0422\u0432\u043E\u0439 \u043E\u0442\u0432\u0435\u0442: ", "Your answer: ", "Javobingiz: "), translate(q.options[answers[i]])), /* @__PURE__ */ h("p", null, c("\u0412\u0435\u0440\u043D\u043E: ", "Correct: ", "To\u2018g\u2018ri: "), /* @__PURE__ */ h("b", null, translate(q.options[q.answer]))), /* @__PURE__ */ h("p", null, translate(q.why))))), /* @__PURE__ */ h("details", { className: "og-all-answers" }, /* @__PURE__ */ h("summary", null, c("\u0420\u0430\u0437\u0431\u043E\u0440 \u0432\u0441\u0435\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432", "Review all answers", "Barcha javoblarni ko\u2018rish")), topic.questions.map((q, i) => /* @__PURE__ */ h("div", { key: i }, /* @__PURE__ */ h("strong", null, answers[i] === q.answer ? "\u2713" : "\u21BB", " ", translate(q.q)), /* @__PURE__ */ h("p", null, translate(q.options[q.answer]), " \u2014 ", translate(q.why))))), /* @__PURE__ */ h("div", { className: "og-save" }, /* @__PURE__ */ h("h2", null, c("\u0421\u043E\u0445\u0440\u0430\u043D\u0438 \u044D\u0442\u043E\u0442 \u0448\u0430\u0433.", "Keep this step.", "Natijani saqlang.")), signedIn ? /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { className: "og-primary", disabled: saving === "busy" || saving === "done", onClick: saveResult }, saving === "busy" ? c("\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C\u2026", "Saving\u2026", "Saqlanmoqda\u2026") : saving === "done" ? c("\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E \u0432 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0435 \u2713", "Saved to progress \u2713", "Natija saqlandi \u2713") : saving === "error" ? c("\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435", "Retry saving", "Qayta saqlash") : c("\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", "Save your result", "Natijani saqlash")), saveError && /* @__PURE__ */ h("p", { role: "alert" }, saveError)) : /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("p", null, c("\u0411\u0435\u0437 \u0432\u0445\u043E\u0434\u0430 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0432 \u044D\u0442\u043E\u043C \u0443\u0440\u043E\u043A\u0435. \u0412 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u043C\u0435\u0436\u0434\u0443 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F\u043C\u0438.", "Without signing in, your result stays in this lesson. An account keeps results between visits.", "Akkauntsiz natija shu darsda mavjud. Akkaunt natijalarni keyingi tashriflar uchun saqlaydi.")), /* @__PURE__ */ h("button", { className: "og-secondary", onClick: () => navigate("account") }, c("\u0412\u043E\u0439\u0442\u0438 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442", "Sign in", "Akkauntga kirish"), " \u2192"))), /* @__PURE__ */ h("div", { className: "og-result-actions" }, /* @__PURE__ */ h("button", { className: "og-secondary", onClick: () => {
    setAnswers([]);
    setExercise(0);
    resetQuestion();
    setPhase(3);
    setSaving("");
    setSaveError("");
    started.current = Date.now();
    payload.current = null;
  } }, c("\u041F\u0440\u043E\u0439\u0442\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u0441\u043D\u043E\u0432\u0430", "Retake the check", "Qayta tekshirish")), /* @__PURE__ */ h("button", { className: "og-back", onClick: () => {
    setPhase(1);
    resetQuestion();
    setAnswers([]);
    setPractice(practice.slice(0, 1));
    setSaving("");
    setSaveError("");
    started.current = Date.now();
    payload.current = null;
  } }, c("\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435", "Review the explanation", "Qoidani takrorlash")), /* @__PURE__ */ h("button", { className: "og-back", onClick: close }, c("\u041A \u0434\u0440\u0443\u0433\u0438\u043C \u0442\u0435\u043C\u0430\u043C", "Explore other topics", "Boshqa mavzular"), " \u2197")))), /* @__PURE__ */ h("aside", { className: "og-guide" }, /* @__PURE__ */ h("span", { className: "og-label" }, c("\u041F\u041E\u0421\u041B\u0415 \u042D\u0422\u041E\u0413\u041E \u0423\u0420\u041E\u041A\u0410", "AFTER THIS LESSON", "DARS OXIRIDA")), /* @__PURE__ */ h("h2", null, content(journey.goal)), /* @__PURE__ */ h("div", { className: "og-guide-orbit", "aria-hidden": "true" }, /* @__PURE__ */ h("span", null, phase === 4 ? "\u2713" : String(phase + 1).padStart(2, "0"))), /* @__PURE__ */ h("p", null, phase === 3 ? c("\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0432\u0441\u043F\u043E\u043C\u043D\u0438\u0442\u044C \u043B\u043E\u0433\u0438\u043A\u0443 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E. \u041E\u0448\u0438\u0431\u043A\u0438 \u0440\u0430\u0437\u0431\u0435\u0440\u0451\u043C \u0432 \u043A\u043E\u043D\u0446\u0435.", "Recall the logic on your own. We will review mistakes at the end.", "Qoidani mustaqil eslang. Xatolar oxirida ko\u2018rsatiladi.") : phase === 4 ? c("\u041F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u043E\u0439 \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u0435.", "Understanding becomes a habit through review.", "Takrorlash tushunishni mustahkamlaydi.") : c("\u041D\u0435 \u0442\u043E\u0440\u043E\u043F\u0438\u0441\u044C. \u041F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0432\u0430\u0436\u043D\u0435\u0435 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438. \u041D\u0430 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0435 \u043C\u043E\u0436\u043D\u043E \u043E\u0448\u0438\u0431\u0430\u0442\u044C\u0441\u044F \u0438 \u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430.", "Take your time. Understanding matters more than speed. Guided practice lets you make mistakes and try again.", "Shoshilmang. Tushunish tezlikdan muhim. Mashqda xato qilib, qayta urinishingiz mumkin.")), /* @__PURE__ */ h("div", { className: "og-guide-progress", role: "progressbar", "aria-label": c("\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0443\u0440\u043E\u043A\u0430", "Lesson progress", "Dars jarayoni"), "aria-valuenow": phase * 25, "aria-valuemin": 0, "aria-valuemax": 100 }, /* @__PURE__ */ h("i", { style: { width: `${phase * 25}%` } })))));
}

// design/account.jsx
function orbitAccountGuest(runtime, React, { account, reload, locale }) {
  const h = (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
  const c = (ru, en, uz) => locale === "en" ? en : locale === "uz" ? uz || en : ru;
  const [mode, setMode] = React.useState("login");
  const [authError, setAuthError] = React.useState(false);
  React.useEffect(() => setAuthError(new URLSearchParams(window.location.search).has("authError")), []);
  const google = /* @__PURE__ */ h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ h("path", { fill: "#4285F4", d: "M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.6h3.4c2-1.8 2.8-4.4 2.8-7.5Z" }), /* @__PURE__ */ h("path", { fill: "#34A853", d: "M12 22c2.7 0 5-1 6.8-2.4l-3.4-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10 10 0 0 0 12 22Z" }), /* @__PURE__ */ h("path", { fill: "#FBBC05", d: "M6.4 13.8a6 6 0 0 1 0-3.6V7.5H3a10 10 0 0 0 0 9l3.4-2.7Z" }), /* @__PURE__ */ h("path", { fill: "#EA4335", d: "M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.7A6 6 0 0 1 12 6Z" }));
  return /* @__PURE__ */ h("section", { className: "oa-account" }, /* @__PURE__ */ h("div", { className: "oa-story" }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, "YOUR OWN ORBIT"), /* @__PURE__ */ h("h1", null, c("\u0422\u0432\u043E\u0439 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439.", "Your English.", "Sizning ingliz tilingiz."), /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, c("\u0422\u0432\u043E\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F.", "Your story.", "Sizning hikoyangiz."))), /* @__PURE__ */ h("p", null, c("\u0417\u0430\u043D\u044F\u0442\u0438\u044F, \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u043F\u043E\u0431\u0435\u0434\u044B \u0438 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433 \u2014 \u0432 \u043E\u0434\u043D\u043E\u043C \u043C\u0435\u0441\u0442\u0435.", "Lessons, small wins and your next step \u2014 together in one place.", "Darslar, kichik g\u2018alabalar va keyingi qadam \u2014 bir joyda.")), /* @__PURE__ */ h("div", { className: "oa-art", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { className: "oa-ring" }), /* @__PURE__ */ h("div", { className: "oa-sphere" }), /* @__PURE__ */ h("span", null, "your pace. your orbit."))), /* @__PURE__ */ h("div", { className: "oa-panel" }, /* @__PURE__ */ h("div", { className: "oa-mode", role: "group", "aria-label": c("\u0412\u0445\u043E\u0434 \u0438\u043B\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F", "Sign in or create an account", "Kirish yoki ro\u2018yxatdan o\u2018tish") }, /* @__PURE__ */ h("button", { className: mode === "login" ? "is-active" : "", "aria-pressed": mode === "login", onClick: () => setMode("login") }, c("\u0412\u043E\u0439\u0442\u0438", "Sign in", "Kirish")), /* @__PURE__ */ h("button", { className: mode === "signup" ? "is-active" : "", "aria-pressed": mode === "signup", onClick: () => setMode("signup") }, c("\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442", "Create account", "Akkaunt yaratish"))), /* @__PURE__ */ h("h2", null, mode === "login" ? c("\u0420\u0430\u0434\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u0442\u0435\u0431\u044F.", "Welcome back.", "Xush kelibsiz.") : c("\u041D\u0430\u0447\u043D\u0451\u043C \u0442\u0432\u043E\u044E \u0438\u0441\u0442\u043E\u0440\u0438\u044E.", "Let\u2019s start your story.", "Hikoyangizni boshlaymiz.")), /* @__PURE__ */ h("p", null, mode === "login" ? c("\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438 \u0441 \u0442\u043E\u0433\u043E \u043C\u0435\u0441\u0442\u0430, \u0433\u0434\u0435 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u043B\u0441\u044F.", "Pick up where you left off.", "To\u2018xtagan joyingizdan davom eting.") : c("\u041F\u0435\u0440\u0432\u044B\u0439 \u0432\u0445\u043E\u0434 \u0447\u0435\u0440\u0435\u0437 Google \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u0442\u0432\u043E\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C ORBIT.", "Your first Google sign-in automatically creates your ORBIT profile.", "Google orqali birinchi kirish ORBIT profilingizni avtomatik yaratadi.")), account?.googleReady ? /* @__PURE__ */ h("a", { href: "/api/auth/google", target: "_top", className: "oa-google" }, google, c("\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441 Google", "Continue with Google", "Google bilan davom etish")) : /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { className: "oa-google", disabled: true }, google, c("\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441 Google", "Continue with Google", "Google bilan davom etish")), /* @__PURE__ */ h("p", { className: "oa-unavailable" }, account ? c("\u0412\u0445\u043E\u0434 \u0447\u0435\u0440\u0435\u0437 Google \u043F\u043E\u043A\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D. \u0422\u044B \u043C\u043E\u0436\u0435\u0448\u044C \u043D\u0430\u0447\u0430\u0442\u044C \u0443\u0447\u0438\u0442\u044C\u0441\u044F \u0431\u0435\u0437 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430.", "Google sign-in is not available yet. You can start learning without an account.", "Google orqali kirish hozircha mavjud emas. Akkauntsiz o\u2018rganishni boshlashingiz mumkin.") : c("\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C \u0432\u0445\u043E\u0434\u0430\u2026", "Checking sign-in availability\u2026", "Kirish imkoniyati tekshirilmoqda\u2026")), /* @__PURE__ */ h("button", { className: "og-back", onClick: reload }, c("\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0449\u0451 \u0440\u0430\u0437", "Check again", "Qayta tekshirish"))), authError && /* @__PURE__ */ h("p", { className: "oa-auth-error", role: "alert" }, c("\u0412\u0445\u043E\u0434 \u043D\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u043E\u0432\u0430 \u0438 \u0440\u0430\u0437\u0440\u0435\u0448\u0438 Google \u043F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0438\u043C\u044F \u0438 email.", "Sign-in was not completed. Try again and allow Google to share your name and email.", "Kirish tugamadi. Qayta urinib, ism va emailga ruxsat bering.")), /* @__PURE__ */ h("div", { className: "oa-benefits" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, "01"), /* @__PURE__ */ h("p", null, c("\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0432 \u0442\u0432\u043E\u0451\u043C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435.", "Progress stays with your account.", "Natijalar akkauntingizda saqlanadi."))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, "02"), /* @__PURE__ */ h("p", null, c("\u0421\u0432\u043E\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C, \u0446\u0435\u043B\u0438 \u0438 \u0440\u0438\u0442\u043C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F.", "Your profile, goals and learning rhythm.", "O\u2018z profilingiz, maqsadlaringiz va ritmingiz."))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, "03"), /* @__PURE__ */ h("p", null, c("\u041E\u0434\u0438\u043D \u0432\u0445\u043E\u0434 \u0434\u043B\u044F \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u0438 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F.", "One sign-in for joining and returning.", "Yangi va qayta kirish uchun bitta tugma.")))), /* @__PURE__ */ h("a", { className: "oa-guest", href: "#grammar" }, c("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0443\u0440\u043E\u043A", "Try a lesson first", "Avval darsni sinab ko\u2018rish"), " \u2197")));
}

// design/campus-icons.jsx
function createVisuals(runtime) {
  const h = (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
  const paths = { home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z", lessons: "m2 8 10-5 10 5-10 5ZM6 10v7q6 6 12 0v-7M22 8v8", practice: "M9 3H5a2 2 0 0 0-2 2v4m12-6h4a2 2 0 0 1 2 2v4M3 15v4a2 2 0 0 0 2 2h4m6 0h4a2 2 0 0 0 2-2v-4M9 8l7 4-7 4Z", marks: "M6 3h12v18H6ZM9 7h6M9 11h6M9 15h2m2 2 2 2 4-4", ranking: "M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 13v5m-4 3h8m-6-3h4", extra: "M5 5h14v16H5ZM8 2v6m8-6v6M5 10h14m-7 3v5m-2-3h4", bell: "M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 4h4M12 2v2", chat: "M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-9l-6 4v-4H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 5h10M7 12h7", arrow: "M5 12h14m-6-6 6 6-6 6", up: "M7 17 17 7M7 7h10v10", logout: "M9 3H4v18h5m5-5 4-4-4-4m-7 4h11", menu: "M4 6h16M4 12h16M4 18h16", close: "m6 6 12 12M6 18 18 6", headphones: "M4 15v-3a8 8 0 0 1 16 0v3M4 13H2v7h4v-7Zm16 0h2v7h-4v-7Z", play: "m8 4 13 8-13 8Z", book: "M12 5C8 2 4 3 2 4v15c3-2 7-1 10 1 3-2 7-3 10-1V4c-3-2-7-1-10 1Zm0 0v15", coin: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v10m3-8c-4-4-9 2-3 3 6 1 1 7-3 3", star: "m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z", people: "M8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM2 21v-6a6 6 0 0 1 12 0v6m1-8a5 5 0 0 1 7 5v3", settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 2h6l1 4 3 1 3 4-3 3v4l-4 2-3-2-3 2-4-2v-4l-3-3 3-4 3-1Z", calendar: "M4 5h16v16H4ZM8 2v6m8-6v6M4 10h16m-11 4h2m2 0h2m-6 3h2", bag: "M5 8h14l2 13H3Zm4 0V5a3 3 0 0 1 6 0v3", search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6", globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0q-8 10 0 20 8-10 0-20M3 8h18M3 16h18", mic: "M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8", check: "m5 12 4 4L19 6", lock: "M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2", send: "m3 3 19 9-19 9 4-9Zm4 9h15", file: "M5 2h9l5 5v15H5Zm9 0v6h5M8 12h8M8 16h6", wave: "M2 10v4m4-8v12m4-16v20m4-18v16m4-13v10m4-7v4", screen: "M2 3h20v14H2Zm10 14v5m-5 0h10", heart: "M12 21S2 15 2 8a5 5 0 0 1 10-1A5 5 0 0 1 22 8c0 7-10 13-10 13Z" };
  function Icon({ name, size = 20, ...props }) {
    return /* @__PURE__ */ h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.65", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...props }, /* @__PURE__ */ h("path", { d: paths[name] || paths.star }));
  }
  function Logo() {
    return /* @__PURE__ */ h("span", { className: "oc-logo" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 40 40", "aria-hidden": "true" }, /* @__PURE__ */ h("circle", { cx: "20", cy: "20", r: "9" }), /* @__PURE__ */ h("ellipse", { cx: "20", cy: "20", rx: "19", ry: "7", transform: "rotate(-35 20 20)" }), /* @__PURE__ */ h("circle", { cx: "34", cy: "9", r: "2.5" })), /* @__PURE__ */ h("b", null, "orbit", /* @__PURE__ */ h("span", null, ".")));
  }
  function ObjectArt({ kind, className = "" }) {
    return /* @__PURE__ */ h("div", { className: "oc-object oc-object-" + kind + " " + className, "aria-hidden": "true" }, kind === "headphones" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("i", { className: "oc-headband" }), /* @__PURE__ */ h("i", { className: "oc-ear oc-ear-l" }), /* @__PURE__ */ h("i", { className: "oc-ear oc-ear-r" })) : kind === "book" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("b", null, "Aa", /* @__PURE__ */ h("span", null, "ENGLISH", /* @__PURE__ */ h("br", null), "IN MOTION"))) : kind === "play" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h(Icon, { name: "play", size: 55 })) : kind === "trophy" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("i", { className: "oc-cup" }), /* @__PURE__ */ h("i", { className: "oc-cup-stem" }), /* @__PURE__ */ h("i", { className: "oc-cup-base" })) : kind === "coin" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("b", null, "o")) : kind === "star" ? /* @__PURE__ */ h("svg", { viewBox: "0 0 120 120" }, /* @__PURE__ */ h("defs", null, /* @__PURE__ */ h("linearGradient", { id: "starGold", x2: ".8", y2: "1" }, /* @__PURE__ */ h("stop", { stopColor: "#ffed9e" }), /* @__PURE__ */ h("stop", { offset: ".5", stopColor: "#f8c44b" }), /* @__PURE__ */ h("stop", { offset: "1", stopColor: "#d48c15" }))), /* @__PURE__ */ h("path", { d: "m60 5 17 34 38 6-28 27 7 39-34-18-34 18 7-39L5 45l38-6Z", fill: "url(#starGold)", stroke: "#fff8", strokeWidth: "2" })) : /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("i", { className: "oc-glass-ball" }), /* @__PURE__ */ h("i", { className: "oc-glass-ring" })));
  }
  function Landscape({ variant = 0 }) {
    return /* @__PURE__ */ h("div", { className: "oc-landscape oc-landscape-" + variant, "aria-hidden": "true" }, /* @__PURE__ */ h("i", { className: "oc-land-sun" }), /* @__PURE__ */ h("i", { className: "oc-land-hill oc-land-far" }), /* @__PURE__ */ h("i", { className: "oc-land-hill oc-land-mid" }), /* @__PURE__ */ h("i", { className: "oc-land-hill oc-land-front" }), /* @__PURE__ */ h("i", { className: "oc-land-orbit" }));
  }
  return { Icon, Logo, ObjectArt, Landscape };
}

// design/auth.jsx
function createCampusLogin(runtime, React) {
  const h = (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
  const { useState, useEffect, useRef } = React, { Icon } = createVisuals(runtime);
  function ProfileIcon({ staff }) {
    return /* @__PURE__ */ h("svg", { viewBox: "0 0 48 48", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, staff ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("rect", { x: "10", y: "10", width: "28", height: "34", rx: "5" }), /* @__PURE__ */ h("rect", { x: "19", y: "4", width: "10", height: "12", rx: "3" }), /* @__PURE__ */ h("circle", { cx: "24", cy: "25", r: "4" }), /* @__PURE__ */ h("path", { d: "M17 37a7 7 0 0 1 14 0" })) : /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("circle", { cx: "24", cy: "10", r: "6" }), /* @__PURE__ */ h("path", { d: "M24 28c-6-6-13-7-20-5v18c8-2 14 0 20 4 6-4 12-6 20-4V23c-7-2-14-1-20 5Zm0 0v17M10 20v-2m28 2v-2" })));
  }
  return function CampusLogin({ account }) {
    const [portal, setPortal] = useState(""), [step, setStep] = useState("profile"), [busy, setBusy] = useState(false), [error, setError] = useState(""), [visible, setVisible] = useState(false);
    const identifier = useRef(null), heading = useRef(null);
    useEffect(() => {
      const path = window.location.pathname;
      setPortal(path === "/student" ? "student" : ["/teacher", "/admin"].includes(path) ? "staff" : "");
    }, []);
    useEffect(() => {
      if (step === "credentials") identifier.current?.focus();
    }, [step]);
    async function login(event) {
      event.preventDefault();
      setBusy(true);
      setError("");
      const values = Object.fromEntries(new FormData(event.currentTarget)), body = { identifier: portal === "student" ? values.phone : values.identifier, password: values.password, portal };
      try {
        const response = await fetch("/api/school/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043E\u0439\u0442\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.");
        window.location.assign("/" + data.user.role + "#home");
      } catch (e) {
        setError(e.message);
        setBusy(false);
      }
    }
    function back() {
      setStep("profile");
      setError("");
      setVisible(false);
      requestAnimationFrame(() => heading.current?.focus());
    }
    return /* @__PURE__ */ h("section", { className: "oa-auth", "aria-label": "\u0412\u0445\u043E\u0434 \u0432 ORBIT" }, /* @__PURE__ */ h("div", { className: "oa-left" }, /* @__PURE__ */ h("div", { className: "oa-content", key: step }, step === "profile" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("span", { className: "oa-eyebrow" }, "ONE CAMPUS. YOUR ORBIT."), /* @__PURE__ */ h("h1", { ref: heading, tabIndex: "-1" }, "Choose your", /* @__PURE__ */ h("br", { className: "oa-title-break" }), " profile", /* @__PURE__ */ h("span", null, ".")), /* @__PURE__ */ h("p", { className: "oa-description" }, "\u0422\u0432\u043E\u0439 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C."), /* @__PURE__ */ h("fieldset", { className: "oa-profiles" }, /* @__PURE__ */ h("legend", null, "\u0412\u044B\u0431\u0435\u0440\u0438 \u0442\u0438\u043F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430"), [["student", "Student", "\u0423\u0440\u043E\u043A\u0438, \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u0438 \u0442\u0432\u043E\u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F."], ["staff", "Staff", "\u0423\u0447\u0438\u0442\u0435\u043B\u044F \u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0446\u0435\u043D\u0442\u0440\u0430."]].map(([value, title, description]) => /* @__PURE__ */ h("label", { key: value, className: "oa-profile " + (portal === value ? "is-selected" : "") }, /* @__PURE__ */ h("input", { type: "radio", name: "portal", value, checked: portal === value, onChange: () => setPortal(value) }), /* @__PURE__ */ h("span", { className: "oa-profile-icon" }, /* @__PURE__ */ h(ProfileIcon, { staff: value === "staff" })), /* @__PURE__ */ h("span", { className: "oa-profile-copy" }, /* @__PURE__ */ h("b", null, title), /* @__PURE__ */ h("small", null, description)), /* @__PURE__ */ h("span", { className: "oa-radio", "aria-hidden": "true" }, /* @__PURE__ */ h("i", null))))), /* @__PURE__ */ h("button", { className: "oa-next", disabled: !portal || !account, onClick: () => setStep("credentials") }, "Next", /* @__PURE__ */ h(Icon, { name: "arrow", size: 25 })), /* @__PURE__ */ h("p", { className: "oa-note" }, "\u0414\u043E\u0441\u0442\u0443\u043F \u0432\u044B\u0434\u0430\u0451\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0442\u0432\u043E\u0435\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430.")) : /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("button", { className: "oa-back", type: "button", onClick: back, disabled: busy }, /* @__PURE__ */ h(Icon, { name: "arrow" }), "Choose your profile"), /* @__PURE__ */ h("span", { className: "oa-eyebrow" }, portal === "student" ? "STUDENT SPACE" : "STAFF SPACE"), /* @__PURE__ */ h("h1", null, "Welcome", /* @__PURE__ */ h("br", null), "back", /* @__PURE__ */ h("span", null, ".")), /* @__PURE__ */ h("p", { className: "oa-description" }, portal === "student" ? "\u0412\u0432\u0435\u0434\u0438 \u043D\u043E\u043C\u0435\u0440, \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0435\u0439, \u0438 \u043F\u0430\u0440\u043E\u043B\u044C." : "\u0412\u0432\u0435\u0434\u0438 \u043B\u043E\u0433\u0438\u043D \u0438 \u043F\u0430\u0440\u043E\u043B\u044C, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432\u044B\u0434\u0430\u043B\u0430 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F."), /* @__PURE__ */ h("form", { className: "oa-form", onSubmit: login }, /* @__PURE__ */ h("label", null, /* @__PURE__ */ h("span", null, portal === "student" ? "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430" : "\u041B\u043E\u0433\u0438\u043D"), /* @__PURE__ */ h("input", { key: portal, "aria-label": portal === "student" ? "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430" : "\u041B\u043E\u0433\u0438\u043D", "aria-describedby": portal === "student" ? "oa-phone-help" : void 0, ref: identifier, name: portal === "student" ? "phone" : "identifier", type: portal === "student" ? "tel" : "text", inputMode: portal === "student" ? "tel" : "text", autoComplete: portal === "student" ? "tel" : "username", autoCapitalize: "none", spellCheck: "false", required: true, maxLength: portal === "student" ? 40 : 80, placeholder: portal === "student" ? "+998 90 123 45 67" : "\u0422\u0432\u043E\u0439 \u043B\u043E\u0433\u0438\u043D", disabled: busy }), portal === "student" && /* @__PURE__ */ h("small", { id: "oa-phone-help", className: "oa-field-help" }, "\u0414\u043B\u044F \u0423\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u0430\u043D\u0430 \u043C\u043E\u0436\u043D\u043E \u0432\u0432\u0435\u0441\u0442\u0438 9 \u0446\u0438\u0444\u0440 \u0431\u0435\u0437 +998.")), /* @__PURE__ */ h("label", null, /* @__PURE__ */ h("span", null, "\u041F\u0430\u0440\u043E\u043B\u044C"), /* @__PURE__ */ h("span", { className: "oa-password" }, /* @__PURE__ */ h("input", { "aria-label": "\u041F\u0430\u0440\u043E\u043B\u044C", name: "password", type: visible ? "text" : "password", autoComplete: "current-password", required: true, maxLength: "200", placeholder: "\u0412\u0432\u0435\u0434\u0438 \u043F\u0430\u0440\u043E\u043B\u044C", disabled: busy }), /* @__PURE__ */ h("button", { type: "button", onClick: () => setVisible(!visible), disabled: busy, "aria-label": visible ? "\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" : "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C", "aria-pressed": visible }, /* @__PURE__ */ h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", "aria-hidden": "true" }, /* @__PURE__ */ h("path", { d: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" }), /* @__PURE__ */ h("circle", { cx: "12", cy: "12", r: "3" }), visible && /* @__PURE__ */ h("path", { d: "m3 3 18 18" }))))), error && /* @__PURE__ */ h("p", { className: "oa-error", role: "alert" }, error), /* @__PURE__ */ h("button", { className: "oa-next", disabled: busy || !account }, busy ? "\u0412\u0445\u043E\u0434\u0438\u043C\u2026" : "Log in", /* @__PURE__ */ h(Icon, { name: "arrow", size: 25 }))), /* @__PURE__ */ h("p", { className: "oa-note" }, "\u0417\u0430\u0431\u044B\u043B \u043F\u0430\u0440\u043E\u043B\u044C? \u041E\u0431\u0440\u0430\u0442\u0438\u0441\u044C \u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u0446\u0435\u043D\u0442\u0440\u0430.")))), /* @__PURE__ */ h("aside", { className: "oa-scene " + (portal === "staff" ? "oa-scene-staff" : ""), "aria-label": "\u0422\u0432\u043E\u0439 \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u043C\u0438\u0440 ORBIT" }, /* @__PURE__ */ h("span", { className: "oa-scene-label" }, "ORBIT CAMPUS ", /* @__PURE__ */ h("span", null, "\u2197")), /* @__PURE__ */ h("div", { className: "oa-scene-heading" }, /* @__PURE__ */ h("span", null, "ENGLISH. A NEW PERSPECTIVE."), /* @__PURE__ */ h("h2", null, portal === "staff" ? /* @__PURE__ */ h(runtime.Fragment, null, "Great teachers.", /* @__PURE__ */ h("br", null), "Greater futures.") : /* @__PURE__ */ h(runtime.Fragment, null, "A little practice.", /* @__PURE__ */ h("br", null), "A bigger world."))), /* @__PURE__ */ h("div", { className: "oa-computer", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { className: "oa-monitor" }, /* @__PURE__ */ h("i", { className: "oa-camera" }), /* @__PURE__ */ h("div", { className: "oa-screen" }, /* @__PURE__ */ h("img", { src: "/orbit-auth-preview.jpg", alt: "" })), /* @__PURE__ */ h("div", { className: "oa-chin" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 40 40" }, /* @__PURE__ */ h("circle", { cx: "20", cy: "20", r: "7" }), /* @__PURE__ */ h("ellipse", { cx: "20", cy: "20", rx: "16", ry: "6", transform: "rotate(-35 20 20)" })))), /* @__PURE__ */ h("div", { className: "oa-stand" }), /* @__PURE__ */ h("div", { className: "oa-base" }), /* @__PURE__ */ h("div", { className: "oa-keyboard" }), /* @__PURE__ */ h("div", { className: "oa-mouse" })), /* @__PURE__ */ h("div", { className: "oa-scene-footer" }, /* @__PURE__ */ h("span", { className: "oa-status-dot" }), "Your next chapter starts here.", /* @__PURE__ */ h("span", null, step === "profile" ? "01 / 02" : "02 / 02"))));
  };
}

// design/school.jsx
var components = /* @__PURE__ */ new WeakMap();
var roleNames = { admin: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F", teacher: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C", student: "\u0423\u0447\u0435\u043D\u0438\u043A" };
var skillNames = { general: "\u041E\u0431\u0449\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430", listening: "Listening", reading: "Reading", speaking: "Speaking", writing: "Writing", grammar: "Grammar", vocabulary: "Vocabulary" };
var levelOptions = ["A1", "A2", "B1", "B2", "C1", "C2"].map((x) => [x, x]);
var skillOptions = Object.entries(skillNames);
var statusNames = { draft: "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A", submitted: "\u041D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435", reviewed: "\u041F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E", returned: "\u041D\u0430 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0443" };
var dateText = (value) => new Date(value).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
var fullName = (p) => `${p.firstName} ${p.lastName}`.trim();
async function api(path, body, method = body ? "POST" : "GET") {
  const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : void 0, body: body ? JSON.stringify(body) : void 0 });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441.");
  return data;
}
function createComponents(runtime, React) {
  const h = (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
  const { useState, useEffect, useCallback } = React;
  function Avatar({ person, small = false }) {
    if (person.avatar) return /* @__PURE__ */ h("img", { className: "os-avatar" + (small ? " os-avatar-small" : ""), src: person.avatar, alt: "\u0424\u043E\u0442\u043E " + fullName(person) });
    const female = person.gender === "female";
    return /* @__PURE__ */ h("span", { className: "os-avatar os-avatar-default " + (small ? "os-avatar-small" : ""), role: "img", "aria-label": person.gender === "unspecified" ? "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u0430\u0432\u0430\u0442\u0430\u0440" : female ? "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u0436\u0435\u043D\u0441\u043A\u0438\u0439 \u0430\u0432\u0430\u0442\u0430\u0440" : "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u043C\u0443\u0436\u0441\u043A\u043E\u0439 \u0430\u0432\u0430\u0442\u0430\u0440" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 100 100", "aria-hidden": "true" }, /* @__PURE__ */ h("circle", { cx: "50", cy: "50", r: "50", fill: female ? "#e5ddff" : person.gender === "male" ? "#dceeff" : "#e7eeef" }), female && /* @__PURE__ */ h("path", { d: "M25 57V37a25 25 0 0 1 50 0v27H25Z", fill: "#424775" }), /* @__PURE__ */ h("path", { d: "M17 100v-7a33 33 0 0 1 66 0v7", fill: female ? "#9079d9" : person.gender === "male" ? "#5795d1" : "#7ba5a5" }), /* @__PURE__ */ h("path", { d: "M41 61v12c0 10 18 10 18 0V61", fill: "#ecc1a2" }), /* @__PURE__ */ h("ellipse", { cx: "50", cy: "42", rx: "19", ry: "24", fill: "#f7d4b9" }), /* @__PURE__ */ h("path", { d: female ? "M30 39C26 10 72 5 71 39 61 31 49 30 42 24c-2 9-7 14-12 15Z" : "M30 37c-3-15 5-24 19-24 16 0 24 8 22 24-9-6-18-10-27-8-4 6-8 8-14 8Z", fill: "#424775" }), /* @__PURE__ */ h("circle", { cx: "43", cy: "43", r: "1.8", fill: "#424775" }), /* @__PURE__ */ h("circle", { cx: "58", cy: "43", r: "1.8", fill: "#424775" }), /* @__PURE__ */ h("path", { d: "M44 54q6 5 12 0", fill: "none", stroke: "#bf8268", strokeWidth: "2", strokeLinecap: "round" })));
  }
  function Notice({ error, message }) {
    return error ? /* @__PURE__ */ h("p", { className: "os-message os-error", role: "alert" }, error) : message ? /* @__PURE__ */ h("p", { className: "os-message", role: "status" }, message) : null;
  }
  function Empty({ title, detail }) {
    return /* @__PURE__ */ h("div", { className: "os-empty" }, /* @__PURE__ */ h("span", { "aria-hidden": "true" }, "\u25CE"), /* @__PURE__ */ h("h3", null, title), /* @__PURE__ */ h("p", null, detail));
  }
  function Form({ fields, initial = {}, onSubmit, label = "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C", help, onChange }) {
    const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
    async function submit(event) {
      event.preventDefault();
      setBusy(true);
      setError("");
      setMessage("");
      const values = Object.fromEntries(new FormData(event.currentTarget));
      try {
        await onSubmit(values);
        setMessage("\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E.");
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
    return /* @__PURE__ */ h("form", { className: "os-form", onSubmit: submit, onChange: onChange ? (event) => onChange(event.target.name, event.target.value) : void 0 }, /* @__PURE__ */ h("div", { className: "os-fields" }, fields.map((f) => /* @__PURE__ */ h("label", { key: f.name, className: f.wide ? "os-wide" : "" }, /* @__PURE__ */ h("span", null, f.label), f.type === "select" ? /* @__PURE__ */ h("select", { "aria-label": f.label, name: f.name, defaultValue: initial[f.name] ?? f.defaultValue ?? f.options[0]?.[0], required: f.required }, f.options.map(([value, title]) => /* @__PURE__ */ h("option", { key: value, value }, title))) : f.type === "textarea" ? /* @__PURE__ */ h("textarea", { "aria-label": f.label, name: f.name, rows: f.rows || 4, defaultValue: initial[f.name] || "", placeholder: f.placeholder, maxLength: f.maxLength || 6e3, required: f.required }) : /* @__PURE__ */ h("input", { "aria-label": f.label, name: f.name, type: f.type || "text", inputMode: f.inputMode, defaultValue: initial[f.name] ?? f.defaultValue ?? "", placeholder: f.placeholder, autoComplete: f.autoComplete || "off", min: f.min, max: f.max, minLength: f.minLength, maxLength: f.maxLength || 200, required: f.required })))), help && /* @__PURE__ */ h("p", { className: "os-help" }, help), /* @__PURE__ */ h(Notice, { error, message }), /* @__PURE__ */ h("button", { className: "os-primary", disabled: busy }, busy ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C\u2026" : label));
  }
  const Login = createCampusLogin(runtime, React);
  function PersonButton({ person, onClick }) {
    return /* @__PURE__ */ h("button", { className: "os-person", onClick }, /* @__PURE__ */ h(Avatar, { person, small: true }), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, fullName(person)), /* @__PURE__ */ h("small", null, roleNames[person.role], " \xB7 ", person.number)), /* @__PURE__ */ h("span", { className: "os-arrow" }, "\u2197"));
  }
  function Credentials({ value, onClose }) {
    const [copied, setCopied] = useState(false), student = value.role === "student";
    return /* @__PURE__ */ h("div", { className: "os-credentials", role: "status" }, /* @__PURE__ */ h("div", { className: "os-card-heading" }, /* @__PURE__ */ h("h3", null, "\u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430"), /* @__PURE__ */ h("button", { className: "os-text", onClick: onClose }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C")), /* @__PURE__ */ h("p", null, "\u041F\u0435\u0440\u0435\u0434\u0430\u0439 \u0438\u0445 \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0443 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430. \u041F\u0430\u0440\u043E\u043B\u044C \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u0439\u0447\u0430\u0441."), /* @__PURE__ */ h("dl", null, /* @__PURE__ */ h("dt", null, student ? "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" : "\u041B\u043E\u0433\u0438\u043D"), /* @__PURE__ */ h("dd", null, student ? value.phone || "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u0430\u0437\u043D\u0430\u0447\u044C \u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430" : value.login), /* @__PURE__ */ h("dt", null, "\u041D\u043E\u043C\u0435\u0440 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430"), /* @__PURE__ */ h("dd", null, value.number), /* @__PURE__ */ h("dt", null, "\u041F\u0430\u0440\u043E\u043B\u044C"), /* @__PURE__ */ h("dd", null, value.password)), /* @__PURE__ */ h("button", { className: "os-secondary", onClick: async () => {
      try {
        await navigator.clipboard.writeText(["ORBIT", student ? "\u0422\u0435\u043B\u0435\u0444\u043E\u043D: " + (value.phone || "\u041D\u0435 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D") : "\u041B\u043E\u0433\u0438\u043D: " + value.login, "\u041D\u043E\u043C\u0435\u0440 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430: " + value.number, "\u041F\u0430\u0440\u043E\u043B\u044C: " + value.password, location.origin + "/" + value.role].join("\n"));
        setCopied(true);
      } catch {
        setCopied(false);
      }
    } }, copied ? "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E" : "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435"));
  }
  function Users({ overview, refresh }) {
    const [create, setCreate] = useState(false), [createRole, setCreateRole] = useState("student"), [phoneTarget, setPhoneTarget] = useState(null), [credentials, setCredentials] = useState(null), [error, setError] = useState(""), [busy, setBusy] = useState(""), [query, setQuery] = useState("");
    const fields = [{ name: "role", label: "\u0420\u043E\u043B\u044C", type: "select", options: [["student", "\u0423\u0447\u0435\u043D\u0438\u043A"], ["teacher", "\u0423\u0447\u0438\u0442\u0435\u043B\u044C"]] }, ...createRole === "teacher" ? [{ name: "newLogin", label: "\u041B\u043E\u0433\u0438\u043D \u0443\u0447\u0438\u0442\u0435\u043B\u044F", required: true, minLength: 3, maxLength: 60, placeholder: "\u041B\u0430\u0442\u0438\u043D\u0438\u0446\u0430, \u0446\u0438\u0444\u0440\u044B, \u0442\u043E\u0447\u043A\u0438" }] : [], { name: "phone", label: createRole === "student" ? "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430" : "\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u0434\u043B\u044F \u0441\u0432\u044F\u0437\u0438", type: "tel", inputMode: "tel", autoComplete: "tel", required: createRole === "student", maxLength: 40, placeholder: "+998 90 123 45 67" }, { name: "firstName", label: "\u0418\u043C\u044F", required: true, maxLength: 60 }, { name: "lastName", label: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F", maxLength: 60 }, { name: "gender", label: "\u041F\u043E\u043B / \u0431\u0430\u0437\u043E\u0432\u044B\u0439 \u0430\u0432\u0430\u0442\u0430\u0440", type: "select", options: [["unspecified", "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D"], ["female", "\u0416\u0435\u043D\u0441\u043A\u0438\u0439"], ["male", "\u041C\u0443\u0436\u0441\u043A\u043E\u0439"]] }, { name: "level", label: "\u041D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C", type: "select", options: levelOptions }, { name: "newPassword", label: "\u041F\u0430\u0440\u043E\u043B\u044C", type: "password", autoComplete: "new-password", minLength: 8, placeholder: "\u041F\u0443\u0441\u0442\u043E\u0435 \u043F\u043E\u043B\u0435 \u2014 \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C" }];
    async function action(p, type) {
      setError("");
      setBusy(p.id);
      try {
        const result = await api("/api/school/users/" + p.id + "/" + type, type === "status" ? { active: !p.active } : {});
        if (type === "reset") setCredentials(result);
        await refresh();
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy("");
      }
    }
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, "\u041B\u044E\u0434\u0438 \u0442\u0432\u043E\u0435\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430."), /* @__PURE__ */ h("p", null, "\u0423\u0447\u0435\u043D\u0438\u043A\u0438 \u0432\u0445\u043E\u0434\u044F\u0442 \u043F\u043E \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0443, \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438 \u2014 \u043F\u043E \u043B\u043E\u0433\u0438\u043D\u0443.")), /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setCreate(!create) }, create ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443" : "+ \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442")), credentials && /* @__PURE__ */ h(Credentials, { value: credentials, onClose: () => setCredentials(null) }), /* @__PURE__ */ h(Notice, { error }), create && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u041D\u043E\u0432\u044B\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442"), /* @__PURE__ */ h(Form, { fields, initial: { role: createRole }, onChange: (name, value) => {
      if (name === "role") setCreateRole(value);
    }, onSubmit: async (values) => {
      const result = await api("/api/school/users", { ...values, login: values.role === "teacher" ? values.newLogin : void 0, password: values.newPassword });
      setCredentials(result);
      setCreate(false);
      await refresh();
    }, label: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438 \u0432\u044B\u0434\u0430\u0442\u044C \u0434\u043E\u0441\u0442\u0443\u043F", help: "\u0414\u043B\u044F \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u043D\u0443\u0436\u0435\u043D \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0442\u0435\u043B\u0435\u0444\u043E\u043D \u0438 \u043F\u0430\u0440\u043E\u043B\u044C. \u0414\u043B\u044F \u0423\u0437\u0431\u0435\u043A\u0438\u0441\u0442\u0430\u043D\u0430 \u043C\u043E\u0436\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u0442\u044C 9 \u0446\u0438\u0444\u0440. \u0417\u0430\u0442\u0435\u043C \u0434\u043E\u0431\u0430\u0432\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u0432 \u0433\u0440\u0443\u043F\u043F\u0443." })), phoneTarget && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("div", { className: "os-card-heading" }, /* @__PURE__ */ h("h3", null, "\u041D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \xB7 ", fullName(phoneTarget)), /* @__PURE__ */ h("button", { className: "os-text", onClick: () => setPhoneTarget(null) }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C")), /* @__PURE__ */ h(Form, { key: phoneTarget.id, fields: [{ name: "phone", label: "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430", type: "tel", inputMode: "tel", required: true, maxLength: 40, placeholder: "+998 90 123 45 67" }], initial: { phone: phoneTarget.loginPhone || phoneTarget.phone || "" }, onSubmit: async (values) => {
      await api("/api/school/users/" + phoneTarget.id + "/phone", values);
      setPhoneTarget(null);
      await refresh();
    }, label: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430", help: "\u041D\u043E\u043C\u0435\u0440 \u0434\u043E\u043B\u0436\u0435\u043D \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u0430\u0442\u044C \u044D\u0442\u043E\u043C\u0443 \u0443\u0447\u0435\u043D\u0438\u043A\u0443. \u041F\u0440\u0438 \u0441\u043C\u0435\u043D\u0435 \u043D\u043E\u043C\u0435\u0440\u0430 \u0435\u0433\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0435 \u0441\u0435\u0441\u0441\u0438\u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0442\u0441\u044F, \u043F\u0430\u0440\u043E\u043B\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F." })), /* @__PURE__ */ h("label", { className: "os-search" }, /* @__PURE__ */ h("span", null, "\u041F\u043E\u0438\u0441\u043A \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430"), /* @__PURE__ */ h("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u0418\u043C\u044F, \u0444\u0430\u043C\u0438\u043B\u0438\u044F, \u0442\u0435\u043B\u0435\u0444\u043E\u043D, \u043B\u043E\u0433\u0438\u043D \u0438\u043B\u0438 \u043D\u043E\u043C\u0435\u0440" })), /* @__PURE__ */ h("div", { className: "os-table-wrap" }, /* @__PURE__ */ h("table", { className: "os-table" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, "\u0410\u043A\u043A\u0430\u0443\u043D\u0442"), /* @__PURE__ */ h("th", null, "\u0420\u043E\u043B\u044C"), /* @__PURE__ */ h("th", null, "\u0412\u0445\u043E\u0434 / \u043D\u043E\u043C\u0435\u0440 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430"), /* @__PURE__ */ h("th", null, "\u0421\u0442\u0430\u0442\u0443\u0441"), /* @__PURE__ */ h("th", null, "\u0414\u043E\u0441\u0442\u0443\u043F"))), /* @__PURE__ */ h("tbody", null, overview.people.filter((p) => [fullName(p), p.login, p.number, p.phone, p.loginPhone].join(" ").toLowerCase().includes(query.toLowerCase())).map((p) => /* @__PURE__ */ h("tr", { key: p.id }, /* @__PURE__ */ h("td", null, /* @__PURE__ */ h("div", { className: "os-inline-person" }, /* @__PURE__ */ h(Avatar, { person: p, small: true }), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, fullName(p)), p.phone && /* @__PURE__ */ h("small", { className: "os-contact" }, p.phone)))), /* @__PURE__ */ h("td", null, roleNames[p.role]), /* @__PURE__ */ h("td", null, p.role === "student" ? p.loginPhone || "\u041D\u0430\u0437\u043D\u0430\u0447\u044C \u0442\u0435\u043B\u0435\u0444\u043E\u043D" : p.login, /* @__PURE__ */ h("small", null, p.number)), /* @__PURE__ */ h("td", null, /* @__PURE__ */ h("span", { className: "os-tag " + (!p.active ? "os-tag-muted" : "") }, p.active ? "\u0410\u043A\u0442\u0438\u0432\u0435\u043D" : "\u041E\u0442\u043A\u043B\u044E\u0447\u0451\u043D")), /* @__PURE__ */ h("td", null, p.role !== "admin" && /* @__PURE__ */ h("div", { className: "os-row-actions" }, p.role === "student" && /* @__PURE__ */ h("button", { disabled: busy === p.id, className: "os-text", onClick: () => setPhoneTarget(p) }, "\u041D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430"), /* @__PURE__ */ h("button", { disabled: busy === p.id, className: "os-text", onClick: () => action(p, "reset") }, "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C"), /* @__PURE__ */ h("button", { disabled: busy === p.id, className: "os-text", onClick: () => action(p, "status") }, p.active ? "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C" : "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C")))))))), /* @__PURE__ */ h("p", { className: "os-help" }, "\u0410\u043A\u043A\u0430\u0443\u043D\u0442\u044B \u0438 \u043D\u043E\u043C\u0435\u0440\u0430 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \u043D\u0430\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F. \u041F\u0440\u0438 \u043E\u0442\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0438 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u0438 \u0441\u0431\u0440\u043E\u0441\u0435 \u043F\u0430\u0440\u043E\u043B\u044F \u0435\u0433\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0435 \u0441\u0435\u0441\u0441\u0438\u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u044E\u0442\u0441\u044F. \u0420\u0430\u0431\u043E\u0442\u044B \u0438 \u043E\u0446\u0435\u043D\u043A\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F."));
  }
  function GroupCards({ groups, onOpen }) {
    return /* @__PURE__ */ h("div", { className: "os-group-grid" }, groups.map((g) => /* @__PURE__ */ h("button", { className: "os-group-card", key: g.id, onClick: () => onOpen(g.id) }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "os-tag" }, g.level), /* @__PURE__ */ h("span", { className: "os-arrow" }, "\u2197")), /* @__PURE__ */ h("h3", null, g.name), /* @__PURE__ */ h("p", null, g.teacher_name || `${g.teacher_first_name} ${g.teacher_last_name}`), /* @__PURE__ */ h("div", { className: "os-group-art", "aria-hidden": "true" }, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null)), /* @__PURE__ */ h("footer", null, /* @__PURE__ */ h("b", null, g.student_count, " ", /* @__PURE__ */ h("small", null, "\u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432")), /* @__PURE__ */ h("span", null, g.schedule || "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0443\u0442\u043E\u0447\u043D\u044F\u0435\u0442\u0441\u044F", g.room && /* @__PURE__ */ h("small", null, g.room))))));
  }
  function Groups({ overview, role, refresh, onOpen }) {
    const [create, setCreate] = useState(false);
    const teachers = overview.people.filter((p) => p.role === "teacher" && p.active).map((p) => [p.id, fullName(p)]);
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, role === "student" ? "\u0417\u0434\u0435\u0441\u044C \u0443\u0447\u0430\u0442\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435." : "\u0423 \u043A\u0430\u0436\u0434\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B \u2014 \u0441\u0432\u043E\u0439 \u0440\u0438\u0442\u043C."), /* @__PURE__ */ h("p", null, role === "admin" ? "\u041D\u0430\u0437\u043D\u0430\u0447\u0430\u0439 \u0443\u0447\u0438\u0442\u0435\u043B\u0435\u0439 \u0438 \u0441\u043E\u0431\u0438\u0440\u0430\u0439 \u0433\u0440\u0443\u043F\u043F\u044B." : role === "teacher" ? "\u0412\u0441\u0435 \u0442\u0432\u043E\u0438 \u0433\u0440\u0443\u043F\u043F\u044B \u0432 \u043E\u0434\u043D\u043E\u043C \u043C\u0435\u0441\u0442\u0435." : "\u0422\u0432\u043E\u0438 \u0443\u0447\u0438\u0442\u0435\u043B\u044F, \u043E\u0434\u043D\u043E\u0433\u0440\u0443\u043F\u043F\u043D\u0438\u043A\u0438 \u0438 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F.")), role === "admin" && /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setCreate(!create) }, create ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443" : "+ \u041D\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430")), create && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443"), teachers.length ? /* @__PURE__ */ h(Form, { fields: [{ name: "name", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0433\u0440\u0443\u043F\u043F\u044B", required: true, maxLength: 80 }, { name: "level", label: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C", type: "select", options: levelOptions }, { name: "teacherId", label: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C", type: "select", options: teachers }, { name: "schedule", label: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435", maxLength: 160, placeholder: "\u041F\u043D / \u0421\u0440 / \u041F\u0442 \xB7 18:00" }, { name: "room", label: "\u041A\u0430\u0431\u0438\u043D\u0435\u0442 \u0438\u043B\u0438 \u043C\u0435\u0441\u0442\u043E", maxLength: 80, placeholder: "\u0410\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044F 3" }], onSubmit: async (values) => {
      const data = await api("/api/school/groups", values);
      await refresh();
      setCreate(false);
      onOpen(data.id);
    }, label: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443" }) : /* @__PURE__ */ h(Empty, { title: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0434\u043E\u0431\u0430\u0432\u044C \u0443\u0447\u0438\u0442\u0435\u043B\u044F", detail: "\u0421\u043E\u0437\u0434\u0430\u0439 \u0435\u0433\u043E \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u0410\u043A\u043A\u0430\u0443\u043D\u0442\u044B\xBB." })), overview.groups.length ? /* @__PURE__ */ h(GroupCards, { groups: overview.groups, onOpen }) : /* @__PURE__ */ h(Empty, { title: "\u0413\u0440\u0443\u043F\u043F \u043F\u043E\u043A\u0430 \u043D\u0435\u0442", detail: role === "admin" ? "\u0421\u043E\u0437\u0434\u0430\u0439 \u043F\u0435\u0440\u0432\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0438 \u0434\u043E\u0431\u0430\u0432\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432." : "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043D\u0430\u0437\u043D\u0430\u0447\u0438\u0442 \u0442\u0432\u043E\u044E \u0433\u0440\u0443\u043F\u043F\u0443. \u041F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438 \u0437\u0430\u0434\u0430\u043D\u0438\u044F." }));
  }
  function GroupSettings({ data, overview, refresh }) {
    const [selected, setSelected] = useState(data.students.map((p) => p.id)), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
    const students = overview.people.filter((p) => p.role === "student" && p.active), teachers = overview.people.filter((p) => p.role === "teacher" && p.active).map((p) => [p.id, fullName(p)]);
    async function save() {
      setBusy(true);
      setError("");
      try {
        await api(`/api/school/groups/${data.group.id}/members`, { studentIds: selected });
        await refresh();
        setMessage("\u0421\u043E\u0441\u0442\u0430\u0432 \u0433\u0440\u0443\u043F\u043F\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D.");
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
    return /* @__PURE__ */ h("div", { className: "os-settings-grid" }, /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0413\u0440\u0443\u043F\u043F\u0430 \u0438 \u0443\u0447\u0438\u0442\u0435\u043B\u044C"), /* @__PURE__ */ h(Form, { key: data.group.teacher_id, fields: [{ name: "name", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", required: true }, { name: "level", label: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C", type: "select", options: levelOptions }, { name: "teacherId", label: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C", type: "select", options: teachers }, { name: "schedule", label: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435" }, { name: "room", label: "\u041A\u0430\u0431\u0438\u043D\u0435\u0442" }], initial: { ...data.group, teacherId: data.group.teacher_id }, onSubmit: async (values) => {
      await api(`/api/school/groups/${data.group.id}/settings`, values);
      await refresh();
    } })), /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0421\u043E\u0441\u0442\u0430\u0432 \u0433\u0440\u0443\u043F\u043F\u044B"), /* @__PURE__ */ h("p", null, "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434 \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438."), /* @__PURE__ */ h("div", { className: "os-member-picker" }, students.map((p) => /* @__PURE__ */ h("label", { key: p.id }, /* @__PURE__ */ h("input", { type: "checkbox", checked: selected.includes(p.id), onChange: (e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id)) }), /* @__PURE__ */ h(Avatar, { person: p, small: true }), /* @__PURE__ */ h("span", null, fullName(p), /* @__PURE__ */ h("small", null, p.number))))), !students.length && /* @__PURE__ */ h("p", null, "\u0421\u043E\u0437\u0434\u0430\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u044B \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432 \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \xAB\u0410\u043A\u043A\u0430\u0443\u043D\u0442\u044B\xBB."), /* @__PURE__ */ h(Notice, { error, message }), /* @__PURE__ */ h("button", { className: "os-primary", disabled: busy, onClick: save }, busy ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C\u2026" : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0441\u043E\u0441\u0442\u0430\u0432")));
  }
  function Journal({ data, user, refresh, onPerson }) {
    const teach = user.role !== "student";
    const [lessonId, setLessonId] = useState(data.lessons[0]?.id || ""), [create, setCreate] = useState(false), [attendance, setAttendance] = useState({}), [grades, setGrades] = useState({}), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
    useEffect(() => {
      if (!data.lessons.some((l) => l.id === lessonId)) setLessonId(data.lessons[0]?.id || "");
      setAttendance({});
      setGrades({});
    }, [data]);
    useEffect(() => {
      setAttendance({});
      setGrades({});
      setError("");
      setMessage("");
    }, [lessonId]);
    const people = teach ? data.students : data.students.filter((p) => p.id === user.userId);
    async function save() {
      setError("");
      setMessage("");
      setBusy(true);
      try {
        const rows = Object.entries(attendance).map(([studentId, status]) => ({ studentId, status: status || "unmarked" }));
        if (rows.length) await api(`/api/school/lessons/${lessonId}/attendance`, { rows });
        const marks = Object.entries(grades).filter(([, value]) => value.score !== "" && value.score !== void 0).map(([studentId, value]) => ({ studentId, skill: value.skill || "general", score: Number(value.score), comment: value.comment || "" }));
        if (marks.length) await api(`/api/school/lessons/${lessonId}/marks`, { rows: marks });
        await refresh();
        setMessage("\u0416\u0443\u0440\u043D\u0430\u043B \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D.");
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
    const lesson2 = data.lessons.find((l) => l.id === lessonId);
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, "\u041A\u0430\u0436\u0434\u043E\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u2014 \u0448\u0430\u0433 \u0432\u043F\u0435\u0440\u0451\u0434."), /* @__PURE__ */ h("p", null, teach ? "\u041E\u0442\u043C\u0435\u0447\u0430\u0439 \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u043E\u0446\u0435\u043D\u0438\u0432\u0430\u0439 \u0440\u0430\u0431\u043E\u0442\u0443." : "\u0422\u0432\u043E\u044F \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u043E\u0446\u0435\u043D\u043A\u0438 \u0437\u0430 \u0437\u0430\u043D\u044F\u0442\u0438\u044F.")), teach && /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setCreate(!create) }, create ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443" : "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u0435")), create && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h(Form, { fields: [{ name: "date", label: "\u0414\u0430\u0442\u0430", type: "date", required: true, defaultValue: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) }, { name: "title", label: "\u0422\u0435\u043C\u0430 \u0437\u0430\u043D\u044F\u0442\u0438\u044F", required: true, maxLength: 160 }], onSubmit: async (values) => {
      const result = await api("/api/school/lessons", { ...values, groupId: data.group.id });
      await refresh();
      setLessonId(result.id);
      setCreate(false);
    }, label: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u0435" })), data.lessons.length ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("label", { className: "os-select-label" }, /* @__PURE__ */ h("span", null, "\u0417\u0430\u043D\u044F\u0442\u0438\u0435"), /* @__PURE__ */ h("select", { value: lessonId, onChange: (e) => setLessonId(e.target.value) }, data.lessons.map((l) => /* @__PURE__ */ h("option", { value: l.id, key: l.id }, dateText(l.date), " \xB7 ", l.title)))), /* @__PURE__ */ h("div", { className: "os-table-wrap" }, /* @__PURE__ */ h("table", { className: "os-table os-journal" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, "\u0423\u0447\u0435\u043D\u0438\u043A"), /* @__PURE__ */ h("th", null, "\u041F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C"), /* @__PURE__ */ h("th", null, "\u041D\u0430\u0432\u044B\u043A"), /* @__PURE__ */ h("th", null, "\u041E\u0446\u0435\u043D\u043A\u0430 / 100"), teach && /* @__PURE__ */ h("th", null, "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439"))), /* @__PURE__ */ h("tbody", null, people.map((p) => {
      const a = data.attendance.find((a2) => a2.lesson_id === lessonId && a2.student_id === p.id);
      const skill = grades[p.id]?.skill || "general", mark = data.marks.find((m) => m.lesson_id === lessonId && m.student_id === p.id && m.skill === skill);
      return /* @__PURE__ */ h("tr", { key: p.id }, /* @__PURE__ */ h("td", null, /* @__PURE__ */ h("button", { className: "os-text os-name-link", onClick: () => onPerson(p.id) }, fullName(p))), /* @__PURE__ */ h("td", null, teach ? /* @__PURE__ */ h("select", { "aria-label": "\u041F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C: " + fullName(p), value: attendance[p.id] ?? a?.status ?? "", onChange: (e) => setAttendance({ ...attendance, [p.id]: e.target.value }) }, /* @__PURE__ */ h("option", { value: "" }, "\u041D\u0435 \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043E"), /* @__PURE__ */ h("option", { value: "present" }, "\u041F\u0440\u0438\u0448\u0451\u043B"), /* @__PURE__ */ h("option", { value: "late" }, "\u041E\u043F\u043E\u0437\u0434\u0430\u043B"), /* @__PURE__ */ h("option", { value: "absent" }, "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u043B"), /* @__PURE__ */ h("option", { value: "excused" }, "\u0423\u0432\u0430\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u0438\u0447\u0438\u043D\u0430")) : { present: "\u041F\u0440\u0438\u0448\u0451\u043B", late: "\u041E\u043F\u043E\u0437\u0434\u0430\u043B", absent: "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u043B", excused: "\u0423\u0432\u0430\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u0438\u0447\u0438\u043D\u0430" }[a?.status] || "\u041D\u0435 \u043E\u0442\u043C\u0435\u0447\u0435\u043D\u043E"), /* @__PURE__ */ h("td", null, teach ? /* @__PURE__ */ h("select", { "aria-label": "\u041D\u0430\u0432\u044B\u043A: " + fullName(p), value: skill, onChange: (e) => setGrades({ ...grades, [p.id]: { skill: e.target.value, score: "", comment: "" } }) }, skillOptions.map(([id, name]) => /* @__PURE__ */ h("option", { key: id, value: id }, name))) : data.marks.filter((m) => m.lesson_id === lessonId && m.student_id === p.id).map((m) => /* @__PURE__ */ h("div", { key: m.skill }, skillNames[m.skill]))), /* @__PURE__ */ h("td", null, teach ? /* @__PURE__ */ h("input", { "aria-label": "\u041E\u0446\u0435\u043D\u043A\u0430: " + fullName(p), type: "number", min: "0", max: "100", value: grades[p.id]?.score ?? mark?.score ?? "", onChange: (e) => setGrades({ ...grades, [p.id]: { ...grades[p.id], skill, score: e.target.value, comment: grades[p.id]?.comment ?? mark?.comment ?? "" } }), placeholder: "\u2014" }) : data.marks.filter((m) => m.lesson_id === lessonId && m.student_id === p.id).map((m) => /* @__PURE__ */ h("div", { key: m.skill }, /* @__PURE__ */ h("b", null, m.score), m.comment && /* @__PURE__ */ h("small", null, m.comment)))), teach && /* @__PURE__ */ h("td", null, /* @__PURE__ */ h("input", { "aria-label": "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439: " + fullName(p), value: grades[p.id]?.comment ?? mark?.comment ?? "", maxLength: "600", onChange: (e) => setGrades({ ...grades, [p.id]: { ...grades[p.id], skill, score: grades[p.id]?.score ?? mark?.score ?? "", comment: e.target.value } }), placeholder: "\u041E\u0431\u0440\u0430\u0442\u043D\u0430\u044F \u0441\u0432\u044F\u0437\u044C" })));
    }))), !people.length && /* @__PURE__ */ h("p", { className: "os-help" }, "\u0412 \u0433\u0440\u0443\u043F\u043F\u0435 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432.")), /* @__PURE__ */ h(Notice, { error, message }), teach && /* @__PURE__ */ h("button", { className: "os-primary", disabled: busy, onClick: save }, busy ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C\u2026" : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0436\u0443\u0440\u043D\u0430\u043B"), /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043E\u0446\u0435\u043D\u043E\u043A", lesson2 ? " \xB7 " + lesson2.title : ""), /* @__PURE__ */ h("div", { className: "os-mark-list" }, data.marks.filter((m) => m.lesson_id === lessonId).map((m) => /* @__PURE__ */ h("div", { key: m.student_id + m.skill }, /* @__PURE__ */ h("span", null, fullName(data.students.find((p) => p.id === m.student_id) || { firstName: "\u0423\u0447\u0435\u043D\u0438\u043A", lastName: "" }), /* @__PURE__ */ h("small", null, skillNames[m.skill], m.comment ? " \xB7 " + m.comment : "")), /* @__PURE__ */ h("b", null, m.score, /* @__PURE__ */ h("small", null, "/100"))))), !data.marks.some((m) => m.lesson_id === lessonId) && /* @__PURE__ */ h("p", null, "\u041E\u0446\u0435\u043D\u043E\u043A \u043F\u043E\u043A\u0430 \u043D\u0435\u0442."))) : /* @__PURE__ */ h(Empty, { title: "\u0416\u0443\u0440\u043D\u0430\u043B \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F", detail: teach ? "\u0414\u043E\u0431\u0430\u0432\u044C \u0434\u0430\u0442\u0443 \u0438 \u0442\u0435\u043C\u0443 \u0437\u0430\u043D\u044F\u0442\u0438\u044F, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432." : "\u0423\u0447\u0438\u0442\u0435\u043B\u044C \u0434\u043E\u0431\u0430\u0432\u0438\u0442 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u0438 \u043E\u0442\u043C\u0435\u0442\u0438\u0442 \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C." }));
  }
  function StudentAssignment({ assignment, submission, refresh }) {
    const [completed, setCompleted] = useState(submission?.completed || []), [answer, setAnswer] = useState(submission?.answer || ""), [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
    const locked = submission && ["submitted", "reviewed"].includes(submission.status), percent = Math.round(completed.length / assignment.checklist.length * 100);
    async function save(status) {
      setBusy(true);
      setError("");
      setMessage("");
      try {
        await api(`/api/school/assignments/${assignment.id}/submit`, { answer, completed, status });
        await refresh();
        setMessage(status === "submitted" ? "\u0420\u0430\u0431\u043E\u0442\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430 \u0443\u0447\u0438\u0442\u0435\u043B\u044E." : "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D.");
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
    return /* @__PURE__ */ h("section", { className: "os-card os-assignment" }, /* @__PURE__ */ h("div", { className: "os-card-heading" }, /* @__PURE__ */ h("span", { className: "os-tag os-status-" + (submission?.status || "draft") }, submission ? statusNames[submission.status] : "\u041D\u0443\u0436\u043D\u043E \u0432\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u044C"), /* @__PURE__ */ h("span", { className: "os-deadline" }, "\u0414\u043E ", dateText(assignment.due_at))), /* @__PURE__ */ h("h3", null, assignment.title), /* @__PURE__ */ h("span", { className: "os-help" }, skillNames[assignment.skill]), /* @__PURE__ */ h("p", { className: "os-prewrap" }, assignment.instructions), /* @__PURE__ */ h("div", { className: "os-progress-label" }, /* @__PURE__ */ h("span", null, "\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E \u0448\u0430\u0433\u043E\u0432: ", completed.length, " \u0438\u0437 ", assignment.checklist.length), /* @__PURE__ */ h("b", null, percent, "%")), /* @__PURE__ */ h("div", { className: "os-progress-bar" }, /* @__PURE__ */ h("i", { style: { width: percent + "%" } })), /* @__PURE__ */ h("div", { className: "os-checklist" }, assignment.checklist.map((step, index) => /* @__PURE__ */ h("label", { key: index }, /* @__PURE__ */ h("input", { type: "checkbox", disabled: locked, checked: completed.includes(index), onChange: (e) => setCompleted(e.target.checked ? [...completed, index] : completed.filter((n) => n !== index)) }), /* @__PURE__ */ h("span", null, step)))), /* @__PURE__ */ h("label", { className: "os-answer" }, /* @__PURE__ */ h("span", null, "\u0422\u0432\u043E\u0439 \u043E\u0442\u0432\u0435\u0442"), /* @__PURE__ */ h("textarea", { value: answer, onChange: (e) => setAnswer(e.target.value), disabled: locked, maxLength: "12000", rows: "6", placeholder: "\u041D\u0430\u043F\u0438\u0448\u0438 \u043E\u0442\u0432\u0435\u0442, \u0434\u043E\u0431\u0430\u0432\u044C \u043F\u0440\u0438\u043C\u0435\u0440\u044B \u0438\u043B\u0438 \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u0441\u0432\u043E\u044E \u0440\u0430\u0431\u043E\u0442\u0443\u2026" })), submission?.feedback && /* @__PURE__ */ h("div", { className: "os-feedback" }, /* @__PURE__ */ h("b", null, "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0443\u0447\u0438\u0442\u0435\u043B\u044F"), /* @__PURE__ */ h("p", { className: "os-prewrap" }, submission.feedback)), submission?.status === "reviewed" && /* @__PURE__ */ h("div", { className: "os-grade-result" }, /* @__PURE__ */ h("b", null, submission.score, /* @__PURE__ */ h("small", null, "/100")), /* @__PURE__ */ h("span", null, "\u041E\u0446\u0435\u043D\u043A\u0430 \u0443\u0447\u0438\u0442\u0435\u043B\u044F")), /* @__PURE__ */ h(Notice, { error, message }), !locked && /* @__PURE__ */ h("div", { className: "os-row-actions" }, /* @__PURE__ */ h("button", { className: "os-secondary", disabled: busy, onClick: () => save("draft") }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A"), /* @__PURE__ */ h("button", { className: "os-primary", disabled: busy, onClick: () => save("submitted") }, busy ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C\u2026" : "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0443\u0447\u0438\u0442\u0435\u043B\u044E")), /* @__PURE__ */ h("p", { className: "os-help" }, "\u041F\u0440\u043E\u0446\u0435\u043D\u0442 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435 \u0448\u0430\u0433\u0438. \u041E\u0446\u0435\u043D\u043A\u0443 \u0432\u044B\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0443\u0447\u0438\u0442\u0435\u043B\u044C \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438."));
  }
  function TeacherAssignment({ assignment, data, refresh, onPerson }) {
    const submissions = data.submissions.filter((s) => s.assignment_id === assignment.id), [expanded, setExpanded] = useState(false);
    return /* @__PURE__ */ h("section", { className: "os-card os-assignment" }, /* @__PURE__ */ h("div", { className: "os-card-heading" }, /* @__PURE__ */ h("span", { className: "os-tag" }, skillNames[assignment.skill]), /* @__PURE__ */ h("span", { className: "os-deadline" }, "\u0414\u043E ", dateText(assignment.due_at))), /* @__PURE__ */ h("h3", null, assignment.title), /* @__PURE__ */ h("p", { className: "os-prewrap" }, assignment.instructions), /* @__PURE__ */ h("ol", null, assignment.checklist.map((step, i) => /* @__PURE__ */ h("li", { key: i }, step))), /* @__PURE__ */ h("div", { className: "os-assignment-summary" }, /* @__PURE__ */ h("b", null, submissions.filter((s) => ["submitted", "reviewed"].includes(s.status)).length, " ", /* @__PURE__ */ h("small", null, "\u0438\u0437 ", data.students.length, " \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E")), /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => setExpanded(!expanded) }, expanded ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0440\u0430\u0431\u043E\u0442\u044B" : "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0440\u0430\u0431\u043E\u0442\u044B")), expanded && /* @__PURE__ */ h("div", { className: "os-review-list" }, data.students.map((p) => {
      const s = submissions.find((s2) => s2.student_id === p.id);
      return /* @__PURE__ */ h("section", { className: "os-review", key: p.id }, /* @__PURE__ */ h("div", { className: "os-card-heading" }, /* @__PURE__ */ h("button", { className: "os-text", onClick: () => onPerson(p.id) }, fullName(p)), /* @__PURE__ */ h("span", { className: "os-tag os-status-" + (s?.status || "draft") }, s ? statusNames[s.status] : "\u041D\u0435 \u043D\u0430\u0447\u0430\u0442\u043E")), /* @__PURE__ */ h("p", { className: "os-help" }, Math.round((s?.completed.length || 0) / assignment.checklist.length * 100), "% \u0448\u0430\u0433\u043E\u0432 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E"), s && ["submitted", "reviewed"].includes(s.status) ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("p", { className: "os-student-answer os-prewrap" }, s.answer), /* @__PURE__ */ h(Form, { key: s.updated_at, fields: [{ name: "status", label: "\u0420\u0435\u0448\u0435\u043D\u0438\u0435", type: "select", options: [["reviewed", "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0438 \u043E\u0446\u0435\u043D\u0438\u0442\u044C"], ["returned", "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u043D\u0430 \u0434\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0443"]] }, { name: "score", label: "\u041E\u0446\u0435\u043D\u043A\u0430 / 100", type: "number", min: 0, max: 100 }, { name: "feedback", label: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0443\u0447\u0438\u0442\u0435\u043B\u044F", type: "textarea", wide: true, maxLength: 2e3 }], initial: { score: s.score ?? "", feedback: s.feedback }, onSubmit: async (values) => {
        await api(`/api/school/assignments/${assignment.id}/review`, { ...values, score: values.score === "" ? null : Number(values.score), studentId: p.id });
        await refresh();
      }, label: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443" })) : /* @__PURE__ */ h("p", null, s?.status === "returned" ? "\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u0438\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0439 \u0443\u0447\u0435\u043D\u0438\u043A\u0430." : "\u0420\u0430\u0431\u043E\u0442\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430 \u043D\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443."));
    }), !data.students.length && /* @__PURE__ */ h("p", null, "\u0412 \u0433\u0440\u0443\u043F\u043F\u0435 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432.")));
  }
  function Assignments({ data, user, refresh, onPerson }) {
    const teach = user.role !== "student", [create, setCreate] = useState(false);
    const submissionFor = (id) => data.submissions.find((s) => s.assignment_id === id && s.student_id === user.userId);
    const totalSteps = data.assignments.reduce((n, a) => n + a.checklist.length, 0), doneSteps = data.assignments.reduce((n, a) => n + (submissionFor(a.id)?.completed.length || 0), 0), percent = totalSteps ? Math.round(doneSteps / totalSteps * 100) : 0;
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, "\u0417\u043D\u0430\u043D\u0438\u044F \u0441\u0442\u0430\u043D\u043E\u0432\u044F\u0442\u0441\u044F \u0442\u0432\u043E\u0438\u043C\u0438."), /* @__PURE__ */ h("p", null, teach ? "\u0414\u0430\u0439 \u0437\u0430\u0434\u0430\u043D\u0438\u0435, \u043F\u043E\u043B\u0443\u0447\u0438 \u0440\u0430\u0431\u043E\u0442\u0443 \u0438 \u043F\u043E\u043C\u043E\u0433\u0438 \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433." : "\u0412\u044B\u043F\u043E\u043B\u043D\u044F\u0439 \u0448\u0430\u0433\u0438, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0439 \u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0439 \u0440\u0430\u0431\u043E\u0442\u0443 \u0443\u0447\u0438\u0442\u0435\u043B\u044E.")), teach && /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setCreate(!create) }, create ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443" : "+ \u041D\u043E\u0432\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435")), !teach && data.assignments.length > 0 && /* @__PURE__ */ h("div", { className: "os-homework-overview" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, percent, "%"), /* @__PURE__ */ h("span", null, "\u0448\u0430\u0433\u043E\u0432 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, 100 - percent, "%"), /* @__PURE__ */ h("span", null, "\u0435\u0449\u0451 \u0432\u043F\u0435\u0440\u0435\u0434\u0438")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, data.submissions.filter((s) => s.student_id === user.userId && s.status === "reviewed").length, /* @__PURE__ */ h("small", null, " / ", data.assignments.length)), /* @__PURE__ */ h("span", null, "\u0440\u0430\u0431\u043E\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E"))), create && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0414\u043E\u043C\u0430\u0448\u043D\u0435\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435"), /* @__PURE__ */ h(Form, { fields: [{ name: "title", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", required: true, maxLength: 160 }, { name: "dueAt", label: "\u0421\u0440\u043E\u043A", type: "date", required: true }, { name: "skill", label: "\u041D\u0430\u0432\u044B\u043A", type: "select", options: skillOptions }, { name: "instructions", label: "\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C", type: "textarea", wide: true, required: true }, { name: "checklist", label: "\u0428\u0430\u0433\u0438 \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u2014 \u043A\u0430\u0436\u0434\u044B\u0439 \u0441 \u043D\u043E\u0432\u043E\u0439 \u0441\u0442\u0440\u043E\u043A\u0438", type: "textarea", wide: true, required: true, placeholder: "\u041F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442\n\u0412\u044B\u043F\u0438\u0441\u0430\u0442\u044C \u043F\u044F\u0442\u044C \u043D\u043E\u0432\u044B\u0445 \u0441\u043B\u043E\u0432\n\u041E\u0442\u0432\u0435\u0442\u0438\u0442\u044C \u043D\u0430 \u0432\u043E\u043F\u0440\u043E\u0441\u044B" }], onSubmit: async (values) => {
      await api("/api/school/assignments", { ...values, groupId: data.group.id, checklist: values.checklist.split("\n").map((s) => s.trim()).filter(Boolean) });
      await refresh();
      setCreate(false);
    }, label: "\u0412\u044B\u0434\u0430\u0442\u044C \u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u0433\u0440\u0443\u043F\u043F\u0435" })), /* @__PURE__ */ h("div", { className: "os-assignments" }, data.assignments.map((a) => teach ? /* @__PURE__ */ h(TeacherAssignment, { key: a.id, assignment: a, data, refresh, onPerson }) : /* @__PURE__ */ h(StudentAssignment, { key: a.id + ":" + (submissionFor(a.id)?.updated_at || 0), assignment: a, submission: submissionFor(a.id), refresh }))), !data.assignments.length && /* @__PURE__ */ h(Empty, { title: "\u041F\u043E\u043A\u0430 \u043C\u043E\u0436\u043D\u043E \u0432\u044B\u0434\u043E\u0445\u043D\u0443\u0442\u044C", detail: teach ? "\u0421\u043E\u0437\u0434\u0430\u0439 \u043F\u0435\u0440\u0432\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435 \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B." : "\u0423\u0447\u0438\u0442\u0435\u043B\u044C \u0435\u0449\u0451 \u043D\u0435 \u0432\u044B\u0434\u0430\u043B \u0434\u043E\u043C\u0430\u0448\u043D\u0435\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435." }));
  }
  function GroupView({ id, user, overview, refreshOverview, onBack, onPerson, initialTab = "assignments" }) {
    const [data, setData] = useState(null), [error, setError] = useState(""), [tab, setTab] = useState(initialTab);
    const refresh = useCallback(async () => {
      try {
        const result = await api("/api/school/groups/" + id);
        setData(result);
        setError("");
        await refreshOverview();
      } catch (e) {
        setError(e.message);
        throw e;
      }
    }, [id]);
    useEffect(() => {
      refresh().catch(() => {
      });
    }, [refresh]);
    if (!data) return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { className: "os-text", onClick: onBack }, "\u2190 \u0412\u0441\u0435 \u0433\u0440\u0443\u043F\u043F\u044B"), /* @__PURE__ */ h(Notice, { error }), !error && /* @__PURE__ */ h("p", { className: "os-help" }, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0433\u0440\u0443\u043F\u043F\u0443\u2026"));
    const tabs = [["assignments", "\u0414\u043E\u043C\u0430\u0448\u043D\u0438\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F"], ["journal", "\u0416\u0443\u0440\u043D\u0430\u043B"], ["people", "\u0423\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0438"], ...user.role === "admin" ? [["settings", "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0433\u0440\u0443\u043F\u043F\u044B"]] : []];
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { className: "os-back", onClick: onBack }, "\u2190 \u0412\u0441\u0435 \u0433\u0440\u0443\u043F\u043F\u044B"), /* @__PURE__ */ h("div", { className: "os-group-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "orbit-overline" }, "YOUR CLASS / ", data.group.level), /* @__PURE__ */ h("h1", null, data.group.name), /* @__PURE__ */ h("p", null, data.group.teacher_first_name, " ", data.group.teacher_last_name, " \xB7 ", data.group.schedule || "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0443\u0442\u043E\u0447\u043D\u044F\u0435\u0442\u0441\u044F", data.group.room ? " \xB7 " + data.group.room : "")), /* @__PURE__ */ h("span", { className: "os-tag" }, data.students.length, " \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432")), /* @__PURE__ */ h("div", { className: "os-tabs os-subtabs", role: "tablist", "aria-label": "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u0433\u0440\u0443\u043F\u043F\u044B" }, tabs.map(([id2, label]) => /* @__PURE__ */ h("button", { key: id2, role: "tab", "aria-selected": tab === id2, onClick: () => setTab(id2) }, label))), /* @__PURE__ */ h(Notice, { error }), tab === "assignments" ? /* @__PURE__ */ h(Assignments, { data, user, refresh, onPerson }) : tab === "journal" ? /* @__PURE__ */ h(Journal, { data, user, refresh, onPerson }) : tab === "settings" ? /* @__PURE__ */ h(GroupSettings, { key: data.group.id, data, overview, refresh }) : /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("h2", null, "\u0420\u044F\u0434\u043E\u043C \u0441 \u0442\u043E\u0431\u043E\u0439."), /* @__PURE__ */ h("div", { className: "os-person-grid" }, data.students.map((p) => /* @__PURE__ */ h(PersonButton, { key: p.id, person: p, onClick: () => onPerson(p.id) }))), /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => onPerson(data.group.teacher_id) }, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0443\u0447\u0438\u0442\u0435\u043B\u044F \u2197")));
  }
  function People({ onPerson }) {
    const [people, setPeople] = useState(null), [query, setQuery] = useState(""), [role, setRole] = useState("all"), [error, setError] = useState("");
    useEffect(() => {
      api("/api/school/people").then((data) => setPeople(data.people)).catch((e) => setError(e.message));
    }, []);
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, "\u041B\u044E\u0434\u0438, \u0441 \u043A\u043E\u0442\u043E\u0440\u044B\u043C\u0438 \u0440\u0430\u0441\u0442\u0451\u0448\u044C."), /* @__PURE__ */ h("p", null, "\u0417\u043D\u0430\u043A\u043E\u043C\u044C\u0441\u044F \u0441 \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C\u0438 \u0438 \u0443\u0447\u0438\u0442\u0435\u043B\u044F\u043C\u0438 \u0441\u0432\u043E\u0435\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430."))), /* @__PURE__ */ h("div", { className: "os-directory-tools" }, /* @__PURE__ */ h("label", { className: "os-search" }, /* @__PURE__ */ h("span", null, "\u041F\u043E\u0438\u0441\u043A \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430"), /* @__PURE__ */ h("input", { placeholder: "\u0418\u043C\u044F \u0438\u043B\u0438 \u043D\u043E\u043C\u0435\u0440 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430", value: query, onChange: (e) => setQuery(e.target.value) })), /* @__PURE__ */ h("label", { className: "os-select-label" }, /* @__PURE__ */ h("span", null, "\u041A\u0442\u043E"), /* @__PURE__ */ h("select", { value: role, onChange: (e) => setRole(e.target.value) }, /* @__PURE__ */ h("option", { value: "all" }, "\u0412\u0441\u0435"), /* @__PURE__ */ h("option", { value: "student" }, "\u0423\u0447\u0435\u043D\u0438\u043A\u0438"), /* @__PURE__ */ h("option", { value: "teacher" }, "\u0423\u0447\u0438\u0442\u0435\u043B\u044F"), /* @__PURE__ */ h("option", { value: "admin" }, "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F")))), /* @__PURE__ */ h(Notice, { error }), people ? /* @__PURE__ */ h("div", { className: "os-person-grid" }, people.filter((p) => (role === "all" || p.role === role) && `${fullName(p)} ${p.number}`.toLowerCase().includes(query.toLowerCase())).map((p) => /* @__PURE__ */ h(PersonButton, { key: p.id, person: p, onClick: () => onPerson(p.id) }))) : !error && /* @__PURE__ */ h("p", null, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u043F\u0440\u043E\u0444\u0438\u043B\u0438\u2026"));
  }
  async function imageData(file, kind) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw Error("\u0412\u044B\u0431\u0435\u0440\u0438 PNG, JPEG \u0438\u043B\u0438 WebP.");
    if (file.size > 1e7) throw Error("\u0412\u044B\u0431\u0435\u0440\u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u043E 10 \u041C\u0411.");
    const image = await createImageBitmap(file), canvas = document.createElement("canvas");
    canvas.width = kind === "avatar" ? 512 : 1600;
    canvas.height = kind === "avatar" ? 512 : 540;
    const ctx = canvas.getContext("2d"), scale = Math.max(canvas.width / image.width, canvas.height / image.height);
    ctx.fillStyle = "#f5f5f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, (canvas.width - image.width * scale) / 2, (canvas.height - image.height * scale) / 2, image.width * scale, image.height * scale);
    image.close();
    return canvas.toDataURL("image/jpeg", 0.85);
  }
  function Profile({ id, user, account, reload, onBack }) {
    const [data, setData] = useState(null), [edit, setEdit] = useState(false), [error, setError] = useState(""), [upload, setUpload] = useState("");
    const own = id === user.userId;
    const refresh = useCallback(async () => {
      const result = await api("/api/school/people/" + id);
      setData(result);
    }, [id]);
    useEffect(() => {
      refresh().catch((e) => setError(e.message));
    }, [refresh]);
    async function uploadImage(event, kind) {
      const file = event.target.files?.[0];
      if (!file) return;
      setUpload(kind);
      setError("");
      try {
        await api("/api/school/media", { kind, data: await imageData(file, kind) });
        await refresh();
        await reload();
      } catch (e) {
        setError(e.message);
      } finally {
        setUpload("");
        event.target.value = "";
      }
    }
    async function remove(kind) {
      setUpload(kind);
      setError("");
      try {
        await api("/api/school/media", { kind }, "DELETE");
        await refresh();
        await reload();
      } catch (e) {
        setError(e.message);
      } finally {
        setUpload("");
      }
    }
    if (!data) return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Notice, { error }), !error && /* @__PURE__ */ h("p", null, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u043F\u0440\u043E\u0444\u0438\u043B\u044C\u2026"));
    const p = data.person, practiceCount = data.totals.practice, fields = [{ name: "firstName", label: "\u0418\u043C\u044F", required: true, maxLength: 60 }, { name: "lastName", label: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F", maxLength: 60 }, { name: "gender", label: "\u041F\u043E\u043B / \u0431\u0430\u0437\u043E\u0432\u044B\u0439 \u0430\u0432\u0430\u0442\u0430\u0440", type: "select", options: [["unspecified", "\u041D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D"], ["female", "\u0416\u0435\u043D\u0441\u043A\u0438\u0439"], ["male", "\u041C\u0443\u0436\u0441\u043A\u043E\u0439"]] }, { name: "level", label: "\u041C\u043E\u0439 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C", type: "select", options: levelOptions }, { name: "phone", label: user.role === "student" ? "\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u0434\u043B\u044F \u0441\u0432\u044F\u0437\u0438 (\u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \u043C\u0435\u043D\u044F\u0435\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F)" : "\u0422\u0435\u043B\u0435\u0444\u043E\u043D (\u0432\u0438\u0434\u0435\u043D \u0442\u0435\u0431\u0435 \u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438)", maxLength: 40 }, { name: "bannerStyle", label: "\u0426\u0432\u0435\u0442 \u0431\u0430\u043D\u043D\u0435\u0440\u0430", type: "select", options: [["blue", "\u0413\u043E\u043B\u0443\u0431\u0430\u044F \u043E\u0440\u0431\u0438\u0442\u0430"], ["violet", "\u041B\u0430\u0432\u0430\u043D\u0434\u043E\u0432\u044B\u0439"], ["mint", "\u041C\u044F\u0442\u043D\u044B\u0439"], ["sunset", "\u0422\u0451\u043F\u043B\u044B\u0439 \u0437\u0430\u043A\u0430\u0442"]] }, { name: "bio", label: "\u041E \u0441\u0435\u0431\u0435", type: "textarea", wide: true, maxLength: 600, placeholder: "\u0422\u0432\u043E\u0438 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u044B, \u0446\u0435\u043B\u0438 \u0438 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F." }];
    return /* @__PURE__ */ h("div", { className: "os-profile" }, /* @__PURE__ */ h("button", { className: "os-back", onClick: onBack }, "\u2190 ", own ? "\u0412 \u043A\u0430\u0431\u0438\u043D\u0435\u0442" : "\u041A \u043B\u044E\u0434\u044F\u043C \u0446\u0435\u043D\u0442\u0440\u0430"), /* @__PURE__ */ h("div", { className: "os-banner os-banner-" + p.bannerStyle, style: p.banner ? { backgroundImage: `url(${p.banner})` } : void 0 }, !p.banner && /* @__PURE__ */ h("div", { className: "os-banner-orbits", "aria-hidden": "true" }, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null)), /* @__PURE__ */ h("span", null, "YOUR OWN ORBIT"), own && /* @__PURE__ */ h("label", { className: "os-image-control" }, upload === "banner" ? "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C\u2026" : "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0431\u0430\u043D\u043D\u0435\u0440", /* @__PURE__ */ h("input", { type: "file", accept: "image/png,image/jpeg,image/webp", disabled: !!upload, onChange: (e) => uploadImage(e, "banner") }))), /* @__PURE__ */ h("div", { className: "os-profile-heading" }, /* @__PURE__ */ h("div", { className: "os-profile-avatar" }, /* @__PURE__ */ h(Avatar, { person: p }), own && /* @__PURE__ */ h("label", { className: "os-avatar-upload", "aria-label": "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0432\u043E\u0451 \u0444\u043E\u0442\u043E" }, upload === "avatar" ? "\u2026" : "+", /* @__PURE__ */ h("input", { type: "file", accept: "image/png,image/jpeg,image/webp", disabled: !!upload, onChange: (e) => uploadImage(e, "avatar") }))), /* @__PURE__ */ h("div", { className: "os-profile-title" }, /* @__PURE__ */ h("span", { className: "os-tag" }, roleNames[p.role]), /* @__PURE__ */ h("h1", null, fullName(p)), /* @__PURE__ */ h("p", null, p.number, " ", /* @__PURE__ */ h("span", null, "\xB7 ", p.level, " / \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C"))), own && /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => setEdit(!edit) }, edit ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440" : "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C")), /* @__PURE__ */ h(Notice, { error }), own && user.role === "student" && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0422\u0432\u043E\u0439 \u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430"), /* @__PURE__ */ h("b", null, account.profile.loginPhone || "\u041F\u043E\u043F\u0440\u043E\u0441\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E \u043D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C \u043D\u043E\u043C\u0435\u0440"), /* @__PURE__ */ h("p", { className: "os-help" }, "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0435\u0433\u043E \u043C\u043E\u0436\u0435\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F. \u0422\u0435\u043B\u0435\u0444\u043E\u043D \u0434\u043B\u044F \u0441\u0432\u044F\u0437\u0438 \u0432 \u0430\u043D\u043A\u0435\u0442\u0435 \u043D\u0435 \u043C\u0435\u043D\u044F\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430.")), own && edit && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("div", { className: "os-row-actions" }, p.avatar && /* @__PURE__ */ h("button", { className: "os-text", disabled: !!upload, onClick: () => remove("avatar") }, "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0431\u0430\u0437\u043E\u0432\u044B\u0439 \u0430\u0432\u0430\u0442\u0430\u0440"), p.banner && /* @__PURE__ */ h("button", { className: "os-text", disabled: !!upload, onClick: () => remove("banner") }, "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0446\u0432\u0435\u0442\u043D\u043E\u0439 \u0431\u0430\u043D\u043D\u0435\u0440")), /* @__PURE__ */ h(Form, { key: p.gender + p.bannerStyle, fields, initial: { ...p, phone: account.profile.phone }, onSubmit: async (values) => {
      await api("/api/account", values);
      await refresh();
      await reload();
    }, help: "\u0418\u043C\u044F, \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435, \u0431\u0430\u043D\u043D\u0435\u0440 \u0438 \u0443\u0440\u043E\u0432\u043D\u0438 \u0432\u0438\u0434\u043D\u044B \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0430\u043C \u0446\u0435\u043D\u0442\u0440\u0430. \u0422\u0435\u043B\u0435\u0444\u043E\u043D \u043D\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0432 \u043F\u0440\u043E\u0444\u0438\u043B\u0435 \u0434\u0440\u0443\u0433\u0438\u043C \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C." })), /* @__PURE__ */ h("div", { className: "os-profile-grid" }, /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, "ABOUT YOU"), /* @__PURE__ */ h("h3", null, "\u0421\u0432\u043E\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F."), /* @__PURE__ */ h("p", { className: "os-prewrap" }, p.bio || "\u0417\u0434\u0435\u0441\u044C \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u044F. \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F."), /* @__PURE__ */ h("a", { className: "os-text", href: "/people/" + p.id + "#account" }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u043D\u0430 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u2197")), /* @__PURE__ */ h("section", { className: "os-profile-stats" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, practiceCount), /* @__PURE__ */ h("span", null, "\u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, data.totals.homework), /* @__PURE__ */ h("span", null, "\u0440\u0430\u0431\u043E\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043E")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, data.totals.attended), /* @__PURE__ */ h("span", null, "\u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u043E")))), /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, "\u0410\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u0432\u043E \u0432\u0441\u0435\u0445 \u0438\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u044F\u0445."), /* @__PURE__ */ h("p", null, "\u0423\u0440\u043E\u0432\u043D\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442 \u0443\u0447\u0438\u0442\u0435\u043B\u044C. \u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430\u0437\u0430\u043D\u0430 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E."))), /* @__PURE__ */ h("div", { className: "os-skill-grid" }, Object.entries(skillNames).filter(([id2]) => id2 !== "general").map(([id2, name]) => {
      const level = data.assessed.find((s) => s.skill === id2), practice = data.practice.find((s) => s.kind === id2);
      return /* @__PURE__ */ h("section", { className: "os-skill", key: id2 }, /* @__PURE__ */ h("span", null, name), /* @__PURE__ */ h("b", null, level?.level || "\u2014"), /* @__PURE__ */ h("p", null, level ? "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u0443\u0447\u0438\u0442\u0435\u043B\u0435\u043C" : "\u041F\u043E\u043A\u0430 \u043D\u0435 \u043E\u0446\u0435\u043D\u0451\u043D"), /* @__PURE__ */ h("div", { className: "os-progress-bar" }, /* @__PURE__ */ h("i", { style: { width: (practice?.accuracy || 0) + "%" } })), /* @__PURE__ */ h("small", null, practice ? `${practice.accuracy}% \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C \xB7 ${practice.count} \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439` : "\u041D\u0435\u0442 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0439"));
    })), data.canAssess && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043D\u0430\u0432\u044B\u043A\u0430"), /* @__PURE__ */ h(Form, { fields: [{ name: "skill", label: "\u041D\u0430\u0432\u044B\u043A", type: "select", options: skillOptions.filter(([id2]) => id2 !== "general") }, { name: "level", label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C", type: "select", options: levelOptions }], onSubmit: async (values) => {
      await api("/api/school/skills", { ...values, studentId: id });
      await refresh();
    }, label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0443\u0440\u043E\u0432\u0435\u043D\u044C" })), /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u043F\u043E\u0431\u0435\u0434\u044B. \u0422\u0432\u043E\u0438."), /* @__PURE__ */ h("p", null, "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u043E\u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u0437\u0430 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0435 \u0440\u0430\u0431\u043E\u0442\u044B."))), data.achievements.length ? /* @__PURE__ */ h("div", { className: "os-achievements" }, data.achievements.map((a) => /* @__PURE__ */ h("section", { key: a.name }, /* @__PURE__ */ h("span", null, a.icon), /* @__PURE__ */ h("h3", null, a.name), /* @__PURE__ */ h("p", null, a.detail)))) : /* @__PURE__ */ h(Empty, { title: "\u041F\u0435\u0440\u0432\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u043F\u0435\u0440\u0435\u0434\u0438", detail: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438 \u0443\u043F\u0440\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u044C \u0441\u0432\u043E\u044E \u043F\u0435\u0440\u0432\u0443\u044E \u0434\u043E\u043C\u0430\u0448\u043D\u044E\u044E \u0440\u0430\u0431\u043E\u0442\u0443." }));
  }
  function Dashboard({ overview, user, onGroup, onTab }) {
    const role = user.role, groups = overview.groups, students = role === "admin" ? overview.people.filter((p) => p.active && p.role === "student").length : groups.reduce((sum, g) => sum + g.student_count, 0);
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("section", { className: "os-welcome" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "orbit-overline" }, "ORBIT CAMPUS / ", roleNames[role].toUpperCase()), /* @__PURE__ */ h("h1", null, role === "admin" ? "\u0412\u0441\u0451 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F" : "\u0420\u0430\u0441\u0442\u0438 \u0432 \u0441\u0432\u043E\u0435\u0439", /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, role === "admin" ? "\u0441 \u0445\u043E\u0440\u043E\u0448\u0435\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u044B." : "\u043E\u0440\u0431\u0438\u0442\u0435.")), /* @__PURE__ */ h("p", null, role === "admin" ? "\u041B\u044E\u0434\u0438, \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435 \u2014 \u043F\u043E\u0434 \u0442\u0432\u043E\u0438\u043C \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C." : role === "teacher" ? "\u0422\u0432\u043E\u0438 \u0443\u0447\u0435\u043D\u0438\u043A\u0438. \u0418\u0445 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F. \u0412\u0430\u0448 \u043E\u0431\u0449\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442." : "\u0422\u0432\u043E\u0439 \u043A\u043B\u0430\u0441\u0441, \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u0438 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u043F\u043E\u0431\u0435\u0434\u044B \u2014 \u0440\u044F\u0434\u043E\u043C."), /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => onTab(role === "admin" ? "users" : "groups") }, role === "admin" ? "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430\u043C\u0438" : "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0438 \u0433\u0440\u0443\u043F\u043F\u044B", " \u2197")), /* @__PURE__ */ h("div", { className: "os-welcome-art", "aria-hidden": "true" }, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("b", null, "1.0"))), /* @__PURE__ */ h("div", { className: "os-dashboard-stats" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, "\u0423\u0447\u0435\u0431\u043D\u044B\u0445 \u0433\u0440\u0443\u043F\u043F"), /* @__PURE__ */ h("b", null, groups.length)), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, role === "student" ? "\u041E\u0434\u043D\u043E\u0433\u0440\u0443\u043F\u043F\u043D\u0438\u043A\u043E\u0432 \u0432 \u0433\u0440\u0443\u043F\u043F\u0430\u0445" : role === "admin" ? "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432" : "\u0423\u0447\u0435\u043D\u0438\u043A\u043E\u0432 \u0432 \u0433\u0440\u0443\u043F\u043F\u0430\u0445"), /* @__PURE__ */ h("b", null, role === "student" ? groups.reduce((n, g) => n + Math.max(0, g.student_count - 1), 0) : students)), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, role === "admin" ? "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0443\u0447\u0438\u0442\u0435\u043B\u0435\u0439" : role === "teacher" ? "\u0422\u0432\u043E\u044F \u0440\u043E\u043B\u044C" : "\u0422\u0432\u043E\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C"), /* @__PURE__ */ h("b", null, role === "admin" ? overview.people.filter((p) => p.active && p.role === "teacher").length : role === "teacher" ? "Teacher" : overview.account.profile.level))), /* @__PURE__ */ h("div", { className: "os-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, role === "admin" ? "\u0422\u0432\u043E\u0439 \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440." : "\u0422\u0432\u043E\u0438 \u0433\u0440\u0443\u043F\u043F\u044B."), /* @__PURE__ */ h("p", null, "\u041E\u0442\u043A\u0440\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0443, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u0438 \u0436\u0443\u0440\u043D\u0430\u043B.")), /* @__PURE__ */ h("button", { className: "os-text", onClick: () => onTab("groups") }, "\u0412\u0441\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u2197")), groups.length ? /* @__PURE__ */ h(GroupCards, { groups: groups.slice(0, 4), onOpen: onGroup }) : /* @__PURE__ */ h(Empty, { title: "\u041D\u0430\u0447\u043D\u0451\u043C \u0441 \u043F\u0435\u0440\u0432\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B", detail: role === "admin" ? "\u0421\u043E\u0437\u0434\u0430\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0443\u0447\u0438\u0442\u0435\u043B\u044F, \u0437\u0430\u0442\u0435\u043C \u0433\u0440\u0443\u043F\u043F\u0443 \u0438 \u0434\u043E\u0431\u0430\u0432\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432." : "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043D\u0430\u0437\u043D\u0430\u0447\u0438\u0442 \u0442\u0432\u043E\u044E \u0433\u0440\u0443\u043F\u043F\u0443. \u0417\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0442\u0432\u043E\u0439 \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442." }), role === "admin" && overview.audit.length > 0 && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"), /* @__PURE__ */ h("div", { className: "os-audit" }, overview.audit.map((a) => /* @__PURE__ */ h("div", { key: a.id }, /* @__PURE__ */ h("span", null, a.action, /* @__PURE__ */ h("small", null, a.detail, " \xB7 ", a.actor)), /* @__PURE__ */ h("time", null, dateText(a.created_at)))))));
  }
  function Portal({ account, reload, initialTab = "dashboard" }) {
    const [overview, setOverview] = useState(null), [tab, setTab] = useState(initialTab), [groupId, setGroupId] = useState(""), [personId, setPersonId] = useState(""), [error, setError] = useState("");
    const user = account?.user;
    const refresh = useCallback(async () => {
      if (!user) return;
      const data = await api("/api/school/overview");
      setOverview(data);
    }, [user?.userId]);
    useEffect(() => {
      if (user) refresh().catch((e) => setError(e.message));
      else setOverview(null);
    }, [refresh]);
    useEffect(() => {
      const match = window.location.pathname.match(/^\/people\/([^/]+)$/);
      if (match) setPersonId(match[1]);
    }, []);
    async function logout() {
      try {
        await api("/api/auth/logout", {});
        window.location.assign("/#account");
      } catch (e) {
        setError(e.message);
      }
    }
    function goTab(id) {
      setTab(id);
      setGroupId("");
      setPersonId("");
      setError("");
    }
    if (!user) return /* @__PURE__ */ h(Login, { account });
    if (!overview) return /* @__PURE__ */ h("div", { className: "os-portal" }, /* @__PURE__ */ h(Notice, { error }), !error && /* @__PURE__ */ h("p", null, "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0442\u0432\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u2026"), error && /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => refresh().then(() => setError("")).catch((e) => setError(e.message)) }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"));
    const tabs = [["dashboard", "\u041E\u0431\u0437\u043E\u0440"], ["groups", user.role === "student" ? "\u041C\u043E\u0439 \u043A\u043B\u0430\u0441\u0441" : "\u0413\u0440\u0443\u043F\u043F\u044B"], ...user.role === "admin" ? [["users", "\u0410\u043A\u043A\u0430\u0443\u043D\u0442\u044B"]] : [], ["people", "\u041B\u044E\u0434\u0438 \u0446\u0435\u043D\u0442\u0440\u0430"], ["profile", "\u041C\u043E\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C"]];
    return /* @__PURE__ */ h("section", { className: "os-portal" }, /* @__PURE__ */ h("header", { className: "os-campus-bar" }, /* @__PURE__ */ h("a", { href: "/" + user.role, className: "os-campus-brand" }, "ORBIT ", /* @__PURE__ */ h("span", null, "CAMPUS"), /* @__PURE__ */ h("small", null, "1.0")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "os-tag" }, roleNames[user.role]), /* @__PURE__ */ h("button", { className: "os-text", onClick: logout }, "\u0412\u044B\u0439\u0442\u0438"))), /* @__PURE__ */ h("nav", { className: "os-tabs", "aria-label": "\u0423\u0447\u0435\u0431\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442" }, tabs.map(([id, label]) => /* @__PURE__ */ h("button", { key: id, className: tab === id && !groupId && !personId ? "is-active" : "", onClick: () => goTab(id) }, label))), /* @__PURE__ */ h(Notice, { error }), personId || tab === "profile" ? /* @__PURE__ */ h(Profile, { key: personId || user.userId, id: personId || user.userId, user, account, reload: async () => {
      await reload();
      await refresh();
    }, onBack: () => goTab(personId ? "people" : "dashboard") }) : groupId ? /* @__PURE__ */ h(GroupView, { key: groupId, id: groupId, user, overview, refreshOverview: refresh, onBack: () => {
      setGroupId("");
      setTab("groups");
    }, onPerson: setPersonId }) : tab === "users" ? /* @__PURE__ */ h(Users, { overview, refresh }) : tab === "groups" ? /* @__PURE__ */ h(Groups, { overview, role: user.role, refresh, onOpen: setGroupId }) : tab === "people" ? /* @__PURE__ */ h(People, { onPerson: setPersonId }) : /* @__PURE__ */ h(Dashboard, { overview, user, onGroup: setGroupId, onTab: goTab }), /* @__PURE__ */ h("footer", { className: "os-campus-footer" }, /* @__PURE__ */ h("span", null, "ORBIT CAMPUS 1.0"), /* @__PURE__ */ h("span", null, "\u0423\u0447\u0438\u043C\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435. \u0414\u0432\u0438\u0436\u0435\u043C\u0441\u044F \u0434\u0430\u043B\u044C\u0448\u0435.")));
  }
  return { Portal, Avatar, Login, Form, Notice, Empty, Users, Groups, GroupView, People, Profile, Credentials };
}
function orbitSchool(runtime, React, props) {
  if (!components.has(runtime)) components.set(runtime, createComponents(runtime, React));
  return runtime.jsx(components.get(runtime).Portal, props);
}
function getSchoolComponents(runtime, React) {
  if (!components.has(runtime)) components.set(runtime, createComponents(runtime, React));
  return components.get(runtime);
}

// design/voice-room.jsx
function createVoiceRoom(runtime, React, { api: api3, Icon, Avatar, Notice }) {
  const h = (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
  return function VoiceRoom({ user }) {
    const [rooms, setRooms] = React.useState([]), [room, setRoom] = React.useState(null), [members, setMembers] = React.useState([]), [error, setError] = React.useState(""), [busy, setBusy] = React.useState(false), [muted, setMuted] = React.useState(false), [connections, setConnections] = React.useState({});
    const stream = React.useRef(null), peers = React.useRef(/* @__PURE__ */ new Map()), activeRoom = React.useRef(null), pending = React.useRef(/* @__PURE__ */ new Map());
    const load = React.useCallback(() => api3("/api/campus/rooms").then((d) => setRooms(d.rooms)).catch((e) => setError(e.message)), []);
    React.useEffect(() => {
      load();
      const timer = setInterval(load, 1e4);
      return () => clearInterval(timer);
    }, [load]);
    const leave = React.useCallback(() => {
      if (activeRoom.current) api3(`/api/campus/rooms/${activeRoom.current.id}/leave`, {}).catch(() => {
      });
      activeRoom.current = null;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
      peers.current.forEach((p) => {
        p.close();
        p.audio?.remove();
      });
      peers.current.clear();
      pending.current.clear();
      setRoom(null);
      setMembers([]);
      setConnections({});
      setMuted(false);
    }, []);
    React.useEffect(() => () => {
      leave();
    }, [leave]);
    function peerFor(memberId) {
      if (peers.current.has(memberId)) return peers.current.get(memberId);
      const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      stream.current.getTracks().forEach((t) => peer.addTrack(t, stream.current));
      peer.onicecandidate = (event) => {
        if (event.candidate && activeRoom.current) api3(`/api/campus/rooms/${activeRoom.current.id}/signal`, { recipientId: memberId, payload: { type: "candidate", candidate: event.candidate.toJSON() } }).catch(() => {
        });
      };
      peer.ontrack = (event) => {
        if (!peer.audio) {
          peer.audio = document.createElement("audio");
          peer.audio.autoplay = true;
          peer.audio.setAttribute("playsinline", "");
        }
        peer.audio.srcObject = event.streams[0];
        peer.audio.play().catch(() => {
        });
      };
      peer.onconnectionstatechange = () => setConnections((old) => ({ ...old, [memberId]: peer.connectionState }));
      peers.current.set(memberId, peer);
      return peer;
    }
    React.useEffect(() => {
      if (!room) return;
      let running = false, closed = false;
      const poll = async () => {
        if (running || closed) return;
        running = true;
        try {
          const data = await api3(`/api/campus/rooms/${room.id}/poll`);
          if (closed) return;
          setMembers(data.members);
          for (const member of data.members) {
            if (member.id === user.userId) continue;
            const existed = peers.current.has(member.id), peer = peerFor(member.id);
            if (!existed && user.userId < member.id) {
              const offer = await peer.createOffer();
              await peer.setLocalDescription(offer);
              await api3(`/api/campus/rooms/${room.id}/signal`, { recipientId: member.id, payload: { type: "offer", description: peer.localDescription.toJSON() } });
            }
          }
          for (const signal of data.signals) {
            const peer = peerFor(signal.sender_id), p = signal.payload;
            if (p.type === "offer") {
              await peer.setRemoteDescription(p.description);
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              await api3(`/api/campus/rooms/${room.id}/signal`, { recipientId: signal.sender_id, payload: { type: "answer", description: peer.localDescription.toJSON() } });
            } else if (p.type === "answer") await peer.setRemoteDescription(p.description);
            else if (p.type === "candidate") {
              if (peer.remoteDescription) await peer.addIceCandidate(p.candidate);
              else pending.current.set(signal.sender_id, [...pending.current.get(signal.sender_id) || [], p.candidate]);
            }
            if (peer.remoteDescription && pending.current.has(signal.sender_id)) {
              for (const candidate of pending.current.get(signal.sender_id)) await peer.addIceCandidate(candidate);
              pending.current.delete(signal.sender_id);
            }
          }
          for (const [memberId, peer] of peers.current) {
            if (!data.members.some((m) => m.id === memberId)) {
              peer.close();
              peer.audio?.remove();
              peers.current.delete(memberId);
            }
          }
        } catch (e) {
          if (!closed) setError(e.message);
        } finally {
          running = false;
        }
      };
      poll();
      const timer = setInterval(poll, 1500);
      return () => {
        closed = true;
        clearInterval(timer);
      };
    }, [room?.id]);
    async function join(target) {
      setError("");
      setBusy(true);
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Error("\u0414\u043B\u044F \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0430 \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0441\u0430\u0439\u0442 \u0447\u0435\u0440\u0435\u0437 HTTPS \u0438\u043B\u0438 localhost.");
        const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        try {
          await api3(`/api/campus/rooms/${target.id}/join`, {});
        } catch (e) {
          media.getTracks().forEach((t) => t.stop());
          throw e;
        }
        stream.current = media;
        activeRoom.current = target;
        setRoom(target);
        await load();
      } catch (e) {
        setError(e.name === "NotAllowedError" ? "\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u0435 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D\u0443, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0439\u0442\u0438 \u0432 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440." : e.message);
      } finally {
        setBusy(false);
      }
    }
    async function create(kind) {
      setBusy(true);
      setError("");
      try {
        const name = kind === "pair" ? "Let\u2019s talk \xB7 " + user.displayName : "Conversation club \xB7 " + user.displayName;
        const d = await api3("/api/campus/rooms", { name, kind });
        await join({ id: d.id, name, kind });
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    }
    return /* @__PURE__ */ h("div", { className: "oc-voice" }, /* @__PURE__ */ h(Notice, { error }), room ? /* @__PURE__ */ h("section", { className: "oc-call-active" }, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "LIVE CONVERSATION"), /* @__PURE__ */ h("h2", null, room.name), /* @__PURE__ */ h("div", { className: "oc-call-members" }, members.map((m) => /* @__PURE__ */ h("div", { key: m.id }, /* @__PURE__ */ h(Avatar, { person: m }), /* @__PURE__ */ h("b", null, m.firstName), /* @__PURE__ */ h("small", null, m.id === user.userId ? "\u0412\u044B" : connections[m.id] === "connected" ? "\u041D\u0430 \u0441\u0432\u044F\u0437\u0438" : connections[m.id] === "failed" ? "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u044C\u0441\u044F" : "\u0421\u043E\u0435\u0434\u0438\u043D\u044F\u0435\u043C\u2026")))), /* @__PURE__ */ h("p", null, members.length < 2 ? "\u041F\u0440\u0438\u0433\u043B\u0430\u0441\u0438 \u043E\u0434\u043D\u043E\u0433\u0440\u0443\u043F\u043F\u043D\u0438\u043A\u0430: \u043E\u043D \u0443\u0432\u0438\u0434\u0438\u0442 \u043A\u043E\u043C\u043D\u0430\u0442\u0443 \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 Practice." : "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u043F\u0440\u043E\u0441\u0442\u043E\u0433\u043E: What made you smile today?"), /* @__PURE__ */ h("div", { className: "oc-call-actions" }, /* @__PURE__ */ h("button", { className: "os-secondary " + (muted ? "is-muted" : ""), onClick: () => {
      stream.current?.getAudioTracks().forEach((t) => t.enabled = muted);
      setMuted(!muted);
    } }, /* @__PURE__ */ h(Icon, { name: "mic" }), muted ? "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D" : "\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043C\u0438\u043A\u0440\u043E\u0444\u043E\u043D"), /* @__PURE__ */ h("button", { className: "oc-danger", onClick: leave }, "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C"))) : /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("div", { className: "oc-voice-hero" }, /* @__PURE__ */ h("div", { className: "oc-voice-rings" }), /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "REAL PEOPLE. REAL ENGLISH."), /* @__PURE__ */ h("h2", null, "\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F", /* @__PURE__ */ h("br", null), "\u0441 \u043F\u0440\u043E\u0441\u0442\u043E\u0433\u043E hello."), /* @__PURE__ */ h("p", null, "\u041F\u043E\u0437\u043E\u0432\u0438 \u043E\u0434\u043D\u043E\u0433\u0440\u0443\u043F\u043F\u043D\u0438\u043A\u0430 \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0443\u0439 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u0433\u043E\u043B\u043E\u0441\u043E\u043C."), /* @__PURE__ */ h("div", { className: "oc-row" }, /* @__PURE__ */ h("button", { className: "oc-white-button", disabled: busy, onClick: () => create("pair") }, /* @__PURE__ */ h(Icon, { name: "mic" }), "\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440 \u0432\u0434\u0432\u043E\u0451\u043C"), /* @__PURE__ */ h("button", { className: "oc-glass-button", disabled: busy, onClick: () => create("group") }, /* @__PURE__ */ h(Icon, { name: "people" }), "\u0413\u0440\u0443\u043F\u043F\u0430 \u0434\u043E 4 \u0447\u0435\u043B\u043E\u0432\u0435\u043A"))), /* @__PURE__ */ h("div", { className: "oc-room-list" }, rooms.map((r) => /* @__PURE__ */ h("div", { className: "oc-room-row", key: r.id }, /* @__PURE__ */ h("span", { className: "oc-live-dot" }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, r.name), /* @__PURE__ */ h("small", null, r.members, " / ", r.kind === "pair" ? 2 : 4, " \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432")), /* @__PURE__ */ h("button", { className: "os-secondary", disabled: busy || r.members >= (r.kind === "pair" ? 2 : 4), onClick: () => join(r) }, "\u0412\u043E\u0439\u0442\u0438 \u2197")))), /* @__PURE__ */ h("p", { className: "os-help" }, "\u0413\u043E\u043B\u043E\u0441 \u043F\u0435\u0440\u0435\u0434\u0430\u0451\u0442\u0441\u044F \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u043C\u0435\u0436\u0434\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430\u043C\u0438. \u0412 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0441\u0435\u0442\u044F\u0445 \u0441 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F\u043C\u0438 \u043F\u0440\u044F\u043C\u043E\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u043C\u043E\u0436\u0435\u0442 \u0431\u044B\u0442\u044C \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E.")));
  };
}

// design/visual-lessons.js
var visualLessons = [
  { title: "Present Simple", topic: "present-simple", section: "grammar", slides: [
    { label: "A LITTLE EVERY DAY", phrase: "Small habits. A bigger world.", explain: "Present Simple \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u0430\u0442\u044C \u043E \u0442\u043E\u043C, \u0447\u0442\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0442\u0441\u044F.", narration: "Small habits create a bigger world. We use the present simple to talk about routines and facts." },
    { label: "YOUR ROUTINE", phrase: "I walk to school every morning.", explain: "Every morning \u2014 \u043A\u0430\u0436\u0434\u043E\u0435 \u0443\u0442\u0440\u043E. \u042D\u0442\u043E \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0430, \u0430 \u043D\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441.", narration: "I walk to school every morning. Every morning tells us this is a routine." },
    { label: "A SMALL CHANGE", phrase: "She walks to school.", explain: "\u0421 he, she \u0438 it \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C \u043A \u0433\u043B\u0430\u0433\u043E\u043B\u0443 -s: walk \u2192 walks.", narration: "She walks to school. With he, she, and it, add s to the verb." },
    { label: "ASK A QUESTION", phrase: "Does she walk to school?", explain: "Does \u0443\u0436\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0444\u043E\u0440\u043C\u0443 she. \u041F\u043E\u044D\u0442\u043E\u043C\u0443 walk \u0431\u0435\u0437 -s.", narration: "Does she walk to school? Does carries the s, so the main verb stays in its base form." },
    { label: "MAKE IT NEGATIVE", phrase: "She doesn\u2019t take the bus.", explain: "Doesn\u2019t + \u043D\u0430\u0447\u0430\u043B\u044C\u043D\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \u0433\u043B\u0430\u0433\u043E\u043B\u0430. \u041D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0439 -s \u0432\u0442\u043E\u0440\u043E\u0439 \u0440\u0430\u0437.", narration: "She does not take the bus. Use does not and the base form of the verb." },
    { label: "YOUR TURN", phrase: "What do you do every day?", explain: "\u041F\u043E\u0434\u0443\u043C\u0430\u0439 \u043E \u0441\u0432\u043E\u0435\u0439 \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0435. \u0417\u0430\u0442\u0435\u043C \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0438 \u043A \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0435.", narration: "What do you do every day? Think of one habit. Now it is your turn to practise." }
  ] },
  { title: "Present Continuous", topic: "present-continuous", section: "grammar", slides: [
    { label: "IN THIS MOMENT", phrase: "The world is moving.", explain: "Present Continuous \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0434\u0438\u0442 \u0441\u0435\u0439\u0447\u0430\u0441.", narration: "The world is moving. We use the present continuous to describe actions happening now." },
    { label: "WHAT IS HAPPENING?", phrase: "I am reading a story.", explain: "\u041D\u0443\u0436\u043D\u044B \u0434\u0432\u0435 \u0447\u0430\u0441\u0442\u0438: am \u0438 \u0433\u043B\u0430\u0433\u043E\u043B \u0441 -ing.", narration: "I am reading a story. We need two parts: am and the verb ending in ing." },
    { label: "FIND YOUR FORM", phrase: "She is reading. They are listening.", explain: "I \u2192 am. He, she, it \u2192 is. We, you, they \u2192 are.", narration: "She is reading. They are listening. Use am with I, is with he, she, and it, and are with we, you, and they." },
    { label: "NOW OR EVERY DAY?", phrase: "I read every day. I am reading now.", explain: "\u041F\u0440\u0438\u0432\u044B\u0447\u043A\u0430 \u2014 Present Simple. \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0441\u0435\u0439\u0447\u0430\u0441 \u2014 Present Continuous.", narration: "I read every day. I am reading now. Every day is a habit. Now is an action in progress." },
    { label: "START A CONVERSATION", phrase: "Are you listening?", explain: "\u0427\u0442\u043E\u0431\u044B \u0437\u0430\u0434\u0430\u0442\u044C \u0432\u043E\u043F\u0440\u043E\u0441, \u043F\u043E\u0441\u0442\u0430\u0432\u044C am, is \u0438\u043B\u0438 are \u043F\u0435\u0440\u0435\u0434 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u043E\u043C.", narration: "Are you listening? Put am, is, or are before the subject to ask a question." },
    { label: "YOUR TURN", phrase: "What is happening around you?", explain: "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438 \u0432\u043E\u043A\u0440\u0443\u0433 \u0438 \u043E\u043F\u0438\u0448\u0438 \u043E\u0434\u043D\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043F\u043E-\u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438.", narration: "What is happening around you? Look around and describe one action in English." }
  ] },
  { title: "Stories worth reading", section: "reading", slides: [
    { label: "A NEW PERSPECTIVE", phrase: "Read for the story.", explain: "\u041D\u0435 \u043F\u044B\u0442\u0430\u0439\u0441\u044F \u043F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u043A\u0430\u0436\u0434\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0441\u0440\u0430\u0437\u0443. \u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u0430\u0439\u0434\u0438 \u0433\u043B\u0430\u0432\u043D\u0443\u044E \u043C\u044B\u0441\u043B\u044C.", narration: "Read for the story. You do not need to translate every word. First, find the main idea." },
    { label: "MEET THE CHARACTER", phrase: "Lina moved closer to work.", explain: "\u041A\u0442\u043E \u0433\u0435\u0440\u043E\u0439? \u0427\u0442\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u043E\u0441\u044C? \u0414\u0432\u0430 \u0432\u043E\u043F\u0440\u043E\u0441\u0430 \u043F\u043E\u043C\u043E\u0433\u0430\u044E\u0442 \u043F\u043E\u043D\u044F\u0442\u044C \u0441\u044E\u0436\u0435\u0442.", narration: "Lina moved closer to work. Who is the character? What changed? These questions help you follow a story." },
    { label: "NOTICE THE CONNECTION", phrase: "So she bought a bicycle.", explain: "So \u0441\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u0442 \u043F\u0440\u0438\u0447\u0438\u043D\u0443 \u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442: \u0436\u0438\u043B\u0430 \u0431\u043B\u0438\u0436\u0435 \u2192 \u043A\u0443\u043F\u0438\u043B\u0430 \u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434.", narration: "So she bought a bicycle. So connects a reason with a result." },
    { label: "LOOK FOR DETAILS", phrase: "She takes the bus when it rains.", explain: "\u0414\u0435\u0442\u0430\u043B\u0438 \u0443\u0442\u043E\u0447\u043D\u044F\u044E\u0442 \u0433\u043B\u0430\u0432\u043D\u0443\u044E \u043C\u044B\u0441\u043B\u044C. \u041D\u0435 \u0434\u0435\u043B\u0430\u0439 \u0432\u044B\u0432\u043E\u0434\u043E\u0432, \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u043D\u0435\u0442 \u0432 \u0442\u0435\u043A\u0441\u0442\u0435.", narration: "She takes the bus when it rains. Details make the main idea more precise. Do not add information that is not in the text." },
    { label: "MAKE IT YOURS", phrase: "One story. A new way to think.", explain: "\u0412\u044B\u0431\u0435\u0440\u0438 \u043F\u043E\u043B\u0435\u0437\u043D\u0443\u044E \u0444\u0440\u0430\u0437\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0435\u0451 \u043A \u0441\u0432\u043E\u0435\u0439 \u0436\u0438\u0437\u043D\u0438.", narration: "One story can give you a new way to think. Choose one useful phrase and connect it to your own life." }
  ] }
];

// design/campus.jsx
var cache = /* @__PURE__ */ new WeakMap();
async function api2(path, body, method = body ? "POST" : "GET") {
  const r = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : void 0, body: body ? JSON.stringify(body) : void 0 });
  const d = await r.json();
  if (!r.ok) throw Error(d.error || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435.");
  return d;
}
var roles = { admin: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F", teacher: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C", student: "\u0423\u0447\u0435\u043D\u0438\u043A" };
var skillNames2 = { vocabulary: "Vocabulary", grammar: "Grammar", listening: "Listening", writing: "Writing", reading: "Reading", speaking: "Speaking" };
var levelName = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced", C2: "Proficiency" };
var format = (n) => Number(n || 0).toLocaleString("ru-RU");
var date = (v, opts = { day: "numeric", month: "short" }) => new Date(v).toLocaleDateString("ru-RU", opts);
var titles = { home: "Home", lessons: "Lessons", practice: "Practice", marks: "Marks", ranking: "Ranking", extra: "Extra lesson", account: "My profile", groups: "Groups", users: "Accounts", people: "People", catalog: "Campus studio", shop: "Orbit Store", events: "Events", universities: "Universities", videos: "Video library", messages: "Messages", homework: "My homework", grammar: "Grammar", reading: "Reading", listening: "Podcasts", books: "Books", translator: "Translator", vocabulary: "Vocabulary", speaking: "Speaking studio", dialogue: "Role-play", pronunciation: "Pronunciation", writing: "Writing studio", typing: "Typing studio", progress: "My progress" };
var courseTopics = [["present-simple", "Present Simple", "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0435 \u0438\u0441\u0442\u043E\u0440\u0438\u0438", "A1"], ["present-continuous", "Present Continuous", "\u0416\u0438\u0437\u043D\u044C \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441", "A1"], ["past-simple", "Past Simple", "\u0422\u043E, \u0447\u0442\u043E \u0443\u0436\u0435 \u0441\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C", "A1"], ["past-continuous", "Past Continuous", "\u0412\u043D\u0443\u0442\u0440\u0438 \u0438\u0441\u0442\u043E\u0440\u0438\u0438", "A2"], ["present-perfect", "Present Perfect", "\u041E\u043F\u044B\u0442, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0441 \u0442\u043E\u0431\u043E\u0439", "A2"], ["future-simple", "Future Simple", "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433", "A2"], ["future-continuous", "Future Continuous", "\u0412 \u0437\u0430\u0432\u0442\u0440\u0430\u0448\u043D\u0435\u043C \u0434\u043D\u0435", "B1"], ["articles", "Articles", "\u0414\u0435\u0442\u0430\u043B\u0438 \u0438\u043C\u0435\u044E\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435", "A1"], ["comparatives", "Comparatives", "\u041D\u0430\u0439\u0434\u0438 \u0440\u0430\u0437\u043D\u0438\u0446\u0443", "A2"], ["modals", "Modal verbs", "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u044F", "A2"], ["conditionals", "Conditionals", "\u0410 \u0447\u0442\u043E, \u0435\u0441\u043B\u0438\u2026", "B1"], ["passive", "Passive voice", "\u0414\u0440\u0443\u0433\u043E\u0439 \u0432\u0437\u0433\u043B\u044F\u0434", "B1"], ["present-perfect-continuous", "Present Perfect Continuous", "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0441 \u0438\u0441\u0442\u043E\u0440\u0438\u0435\u0439", "B1"], ["past-perfect", "Past Perfect", "\u0414\u043E \u0442\u043E\u0433\u043E \u0441\u0430\u043C\u043E\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430", "B1"], ["past-perfect-continuous", "Past Perfect Continuous", "\u041F\u0440\u043E\u0446\u0435\u0441\u0441 \u0432 \u043F\u0440\u043E\u0448\u043B\u043E\u043C", "B2"], ["future-perfect", "Future Perfect", "\u041A \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u0446\u0435\u043B\u0438", "B2"], ["future-perfect-continuous", "Future Perfect Continuous", "\u0412\u0437\u0433\u043B\u044F\u0434 \u0432\u043F\u0435\u0440\u0451\u0434", "B2"], ["prepositions", "Prepositions", "\u041D\u0430 \u0441\u0432\u043E\u0451\u043C \u043C\u0435\u0441\u0442\u0435", "A1"]];
function createApp(runtime, React) {
  const h = (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
  const { useState, useEffect, useCallback, useRef } = React;
  const { Avatar, Login, Form, Notice, Empty, Users, Groups, GroupView, People, Profile } = getSchoolComponents(runtime, React);
  const { Icon, Logo, ObjectArt, Landscape } = createVisuals(runtime);
  const VoiceRoom = createVoiceRoom(runtime, React, { api: api2, Icon, Avatar, Notice });
  function SectionTitle({ title, caption, action, onClick }) {
    return /* @__PURE__ */ h("div", { className: "oc-section-title" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h2", null, title), caption && /* @__PURE__ */ h("p", null, caption)), action && /* @__PURE__ */ h("button", { onClick, className: "oc-link" }, action, /* @__PURE__ */ h(Icon, { name: "up", size: 15 })));
  }
  function Modal({ title, children, onClose }) {
    const close = useRef(null);
    useEffect(() => {
      const prev = document.activeElement;
      close.current?.focus();
      const listener = (e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "Tab") {
          const nodes = [...close.current.closest("[role=dialog]").querySelectorAll("button,a,input,select,textarea")].filter((n) => !n.disabled && n.offsetParent !== null);
          if (e.shiftKey && document.activeElement === nodes[0]) {
            e.preventDefault();
            nodes.at(-1)?.focus();
          } else if (!e.shiftKey && document.activeElement === nodes.at(-1)) {
            e.preventDefault();
            nodes[0]?.focus();
          }
        }
      };
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", listener);
      return () => {
        document.body.style.overflow = original;
        document.removeEventListener("keydown", listener);
        prev?.focus();
      };
    }, []);
    return /* @__PURE__ */ h("div", { className: "oc-modal-shade", onClick: (e) => e.target === e.currentTarget && onClose() }, /* @__PURE__ */ h("section", { className: "oc-modal", role: "dialog", "aria-modal": "true", "aria-label": title }, /* @__PURE__ */ h("header", null, /* @__PURE__ */ h("h2", null, title), /* @__PURE__ */ h("button", { ref: close, onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043E\u043A\u043D\u043E" }, /* @__PURE__ */ h(Icon, { name: "close" }))), children));
  }
  function Stats({ stats, rank, homework, onGo, onHomework }) {
    return /* @__PURE__ */ h("div", { className: "oc-stat-grid" }, /* @__PURE__ */ h("button", { className: "oc-stat-card", onClick: () => onGo("shop") }, /* @__PURE__ */ h(ObjectArt, { kind: "coin" }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, format(stats?.coins)), /* @__PURE__ */ h("span", null, "Orbit coins")), /* @__PURE__ */ h("small", null, "\u0422\u0432\u043E\u0438 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u043F\u043E\u0431\u0435\u0434\u044B")), /* @__PURE__ */ h("button", { className: "oc-stat-card", onClick: () => onGo("ranking") }, /* @__PURE__ */ h(ObjectArt, { kind: "star" }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, format(stats?.xp)), /* @__PURE__ */ h("span", null, "Learning score")), /* @__PURE__ */ h("small", null, "\u0417\u043D\u0430\u043D\u0438\u044F \u0441\u0442\u0430\u043D\u043E\u0432\u044F\u0442\u0441\u044F \u0441\u0438\u043B\u043E\u0439")), /* @__PURE__ */ h("button", { className: "oc-stat-card", onClick: () => onGo("ranking") }, /* @__PURE__ */ h(ObjectArt, { kind: "trophy" }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, rank ? "#" + rank : "\u2014"), /* @__PURE__ */ h("span", null, "Campus ranking")), /* @__PURE__ */ h("small", null, rank ? "\u0422\u0432\u043E\u044F \u043F\u043E\u0437\u0438\u0446\u0438\u044F \u0432 \u0446\u0435\u043D\u0442\u0440\u0435" : "\u041F\u0435\u0440\u0432\u044B\u0435 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B \u0432\u043F\u0435\u0440\u0435\u0434\u0438")), /* @__PURE__ */ h("button", { className: "oc-stat-homework", onClick: onHomework }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, "My homework"), /* @__PURE__ */ h(Icon, { name: "up", size: 19 })), /* @__PURE__ */ h("p", null, homework?.title || "\u0422\u0432\u043E\u0439 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433"), /* @__PURE__ */ h("b", null, homework ? Math.round(homework.completed.length / homework.checklist.length * 100) : 0, /* @__PURE__ */ h("small", null, "%")), /* @__PURE__ */ h("div", { className: "oc-homework-ring" }), /* @__PURE__ */ h("span", { className: "oc-stat-homework-bottom" }, "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435", /* @__PURE__ */ h(Icon, { name: "arrow", size: 15 }))));
  }
  function Home({ account, data, rank, onGo, onService, onGroup }) {
    const first = data.assignments.find((a) => a.status !== "reviewed") || data.assignments[0];
    const services = [["translator", "Translator", "\u041F\u043E\u043D\u0438\u043C\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435", "book", "blue"], ["referral", "Invite a friend", "\u0423\u0447\u0438\u0442\u044C\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435", "people", "mint"], ["mock", "Level challenge", "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0441\u0435\u0431\u044F", "marks", "pink"], ["events", "Events", "\u0411\u044B\u0442\u044C \u0432 \u0446\u0435\u043D\u0442\u0440\u0435", "calendar", "amber"], ["universities", "Universities", "\u041C\u0435\u0447\u0442\u0430\u0442\u044C \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u043D\u0435\u0435", "lessons", "teal"], ["letter", "Enrollment letter", "\u0422\u0432\u043E\u0439 \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441", "file", "violet"]];
    return /* @__PURE__ */ h("div", { className: "oc-page oc-home-page" }, /* @__PURE__ */ h("div", { className: "oc-greeting" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "YOUR WORLD. IN ENGLISH."), /* @__PURE__ */ h("h1", null, "\u041F\u0440\u0438\u0432\u0435\u0442, ", account.profile.firstName, /* @__PURE__ */ h("span", null, "\u2726")), /* @__PURE__ */ h("p", null, "\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0434\u0435\u043D\u044C, \u0447\u0442\u043E\u0431\u044B \u0443\u0437\u043D\u0430\u0442\u044C \u0447\u0442\u043E-\u0442\u043E \u043D\u043E\u0432\u043E\u0435.")), /* @__PURE__ */ h("span", { className: "oc-date" }, /* @__PURE__ */ h(Icon, { name: "calendar", size: 16 }), date(Date.now(), { day: "numeric", month: "long", weekday: "short" }))), /* @__PURE__ */ h(Stats, { stats: data.stats, rank, homework: first, onGo, onHomework: () => first ? onGroup(first.group_id) : onGo("homework") }), /* @__PURE__ */ h(SectionTitle, { title: "Library", caption: "\u0418\u0441\u0442\u043E\u0440\u0438\u0438, \u0432 \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0436\u0438\u0432\u0451\u0442 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439.", action: "\u0412\u0441\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B", onClick: () => onGo("lessons") }), /* @__PURE__ */ h("div", { className: "oc-library-grid" }, [["listening", "Podcasts", "\u0421\u043B\u0443\u0448\u0430\u0439. \u0427\u0443\u0432\u0441\u0442\u0432\u0443\u0439. \u041F\u043E\u043D\u0438\u043C\u0430\u0439.", "headphones", "Listen to the world"], ["videos", "Videos", "\u0411\u043E\u043B\u044C\u0448\u0438\u0435 \u0438\u0434\u0435\u0438. \u0416\u0438\u0432\u043E\u0439 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439.", "play", "A different perspective"], ["books", "Books", "\u0415\u0449\u0451 \u043E\u0434\u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0430 \u0442\u0432\u043E\u0435\u0433\u043E \u043C\u0438\u0440\u0430.", "book", "One more chapter"]].map(([id, title, desc, kind, foot]) => /* @__PURE__ */ h("button", { className: "oc-library-card oc-library-" + kind, key: id, onClick: () => onGo(id) }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, foot), /* @__PURE__ */ h("h3", null, title), /* @__PURE__ */ h("p", null, desc), /* @__PURE__ */ h("span", { className: "oc-circle-arrow" }, /* @__PURE__ */ h(Icon, { name: "up", size: 17 }))), /* @__PURE__ */ h(ObjectArt, { kind })))), /* @__PURE__ */ h(SectionTitle, { title: "Services", caption: "\u0412\u0441\u0451, \u0447\u0442\u043E \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0434\u0432\u0438\u0433\u0430\u0442\u044C\u0441\u044F \u0434\u0430\u043B\u044C\u0448\u0435." }), /* @__PURE__ */ h("div", { className: "oc-services" }, services.map(([id, title, desc, icon, color]) => /* @__PURE__ */ h("button", { key: id, className: "oc-service oc-service-" + color, onClick: () => ["referral", "letter", "mock"].includes(id) ? onService(id) : onGo(id) }, /* @__PURE__ */ h("span", null, title), /* @__PURE__ */ h("small", null, desc), /* @__PURE__ */ h(Icon, { name: icon, size: 52 }), /* @__PURE__ */ h("span", { className: "oc-service-arrow" }, "\u2197")))), /* @__PURE__ */ h(SectionTitle, { title: "Orbit Store", caption: "\u041D\u0430\u0433\u0440\u0430\u0434\u044B \u0437\u0430 \u0442\u0432\u043E\u0451 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u043F\u0435\u0440\u0451\u0434. \u0422\u043E\u043B\u044C\u043A\u043E \u0437\u0430 \u0431\u0430\u043B\u043B\u044B ORBIT.", action: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D", onClick: () => onGo("shop") }), /* @__PURE__ */ h("div", { className: "oc-shop-categories" }, [["orbit", "Orbit collection", "\u0422\u0432\u043E\u044F \u043E\u0440\u0431\u0438\u0442\u0430", "orb"], ["books", "Books & stationery", "\u0418\u0434\u0435\u0438 \u043D\u0430 \u0431\u0443\u043C\u0430\u0433\u0435", "book"], ["experiences", "Experiences", "\u0411\u043E\u043B\u044C\u0448\u0435 \u0432\u043F\u0435\u0447\u0430\u0442\u043B\u0435\u043D\u0438\u0439", "trophy"], ["rewards", "Your rewards", "\u041D\u0430\u0433\u0440\u0430\u0434\u044B \u0436\u0434\u0443\u0442", "star"]].map(([id, title, desc, kind]) => /* @__PURE__ */ h("button", { className: "oc-shop-category", key: id, onClick: () => onGo("shop") }, /* @__PURE__ */ h("h3", null, title), /* @__PURE__ */ h("p", null, desc), /* @__PURE__ */ h(ObjectArt, { kind }), /* @__PURE__ */ h(Icon, { name: "up", size: 16 })))), /* @__PURE__ */ h("div", { className: "oc-home-bottom" }, /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("i", null), " \u0421\u0434\u0435\u043B\u0430\u043D\u043E \u0434\u043B\u044F \u0442\u0432\u043E\u0435\u0433\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0448\u0430\u0433\u0430."), /* @__PURE__ */ h("span", null, "ORBIT CAMPUS \xB7 1.1")));
  }
  function Radar({ skills = {} }) {
    const keys = Object.keys(skillNames2), center = 150, radius = 105, point = (i, value) => [center + Math.sin(i * Math.PI / 3) * radius * value, center - Math.cos(i * Math.PI / 3) * radius * value];
    return /* @__PURE__ */ h("div", { className: "oc-radar" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 300 300", role: "img", "aria-label": "\u0414\u0438\u0430\u0433\u0440\u0430\u043C\u043C\u0430 \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u0438 \u043F\u043E \u0448\u0435\u0441\u0442\u0438 \u043D\u0430\u0432\u044B\u043A\u0430\u043C" }, [0.25, 0.5, 0.75, 1].map((f) => /* @__PURE__ */ h("polygon", { key: f, points: keys.map((_, i) => point(i, f).join(",")).join(" "), fill: "none", stroke: "#dfe8f5" })), keys.map((_, i) => /* @__PURE__ */ h("path", { key: i, d: `M150 150L${point(i, 1).join(" ")}`, stroke: "#e3ebf5" })), /* @__PURE__ */ h("polygon", { points: keys.map((k, i) => point(i, (skills[k] || 0) / 100).join(",")).join(" "), fill: "#499ef22a", stroke: "#368bdf", strokeWidth: "2" }), keys.map((k, i) => /* @__PURE__ */ h("circle", { key: k, cx: point(i, (skills[k] || 0) / 100)[0], cy: point(i, (skills[k] || 0) / 100)[1], r: "3.5", fill: "#368bdf" }))), keys.map((k, i) => /* @__PURE__ */ h("div", { className: "oc-radar-label oc-radar-label-" + i, key: k }, /* @__PURE__ */ h("span", null, skillNames2[k]), /* @__PURE__ */ h("b", null, skills[k] === null || skills[k] === void 0 ? "\u2014" : skills[k] + "%"))));
  }
  function LearningSummary({ account, data, onGo }) {
    return /* @__PURE__ */ h("section", { className: "oc-learning-summary" }, /* @__PURE__ */ h("div", { className: "oc-summary-orbits" }), /* @__PURE__ */ h("button", { className: "oc-summary-settings", onClick: () => onGo("account"), "aria-label": "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0440\u043E\u0444\u0438\u043B\u044F" }, /* @__PURE__ */ h(Icon, { name: "settings", size: 18 })), /* @__PURE__ */ h("div", { className: "oc-summary-person" }, /* @__PURE__ */ h(Avatar, { person: account.profile }), /* @__PURE__ */ h("h2", null, account.user.displayName), /* @__PURE__ */ h("p", null, levelName[account.profile.level], " \xB7 ", account.profile.number)), /* @__PURE__ */ h("div", { className: "oc-summary-bottom" }, /* @__PURE__ */ h("div", { className: "oc-summary-kpis" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "coin" }), /* @__PURE__ */ h("b", null, format(data.stats.coins)), /* @__PURE__ */ h("span", null, "Coins")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "star" }), /* @__PURE__ */ h("b", null, format(data.stats.xp)), /* @__PURE__ */ h("span", null, "Score")), /* @__PURE__ */ h("div", { className: "oc-summary-wide" }, /* @__PURE__ */ h("span", null, "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u043E\u0446\u0435\u043D\u043A\u0430 \u0437\u0430 \u0434\u043E\u043C\u0430\u0448\u043A\u0438"), /* @__PURE__ */ h("b", null, data.stats.average === null ? "\u2014" : data.stats.average + "%"))), /* @__PURE__ */ h("div", { className: "oc-summary-kpis" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "people" }), /* @__PURE__ */ h("b", null, data.groups.length), /* @__PURE__ */ h("span", null, "\u0413\u0440\u0443\u043F\u043F")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "check" }), /* @__PURE__ */ h("b", null, data.stats.completed), /* @__PURE__ */ h("span", null, "\u0422\u0435\u043C \u0438\u0437\u0443\u0447\u0435\u043D\u043E")), /* @__PURE__ */ h("div", { className: "oc-summary-wide" }, /* @__PURE__ */ h("span", null, "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C"), /* @__PURE__ */ h("b", null, account.profile.level))), /* @__PURE__ */ h("div", { className: "oc-summary-skills" }, ["grammar", "vocabulary", "listening", "speaking"].map((k) => /* @__PURE__ */ h("div", { key: k }, /* @__PURE__ */ h("span", null, skillNames2[k]), /* @__PURE__ */ h("b", null, data.stats.skills[k] === null ? "\u2014" : data.stats.skills[k] + "%"), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("i", { style: { width: (data.stats.skills[k] || 0) + "%" } })))))));
  }
  function Lessons({ account, data, sessions, onGo, onGroup }) {
    const [type, setType] = useState("course"), [focused, setFocused] = useState(null), rail = useRef(null);
    const course = courseTopics.map(([id, title, desc, level], i) => {
      const result = sessions.filter((s) => s.kind === "grammar" && s.itemId === id).sort((a, b) => b.score / b.total - a.score / a.total)[0];
      return { id, title, desc, level, index: i, percent: result ? Math.round(result.score / result.total * 100) : 0, done: !!result };
    });
    return /* @__PURE__ */ h("div", { className: "oc-page" }, /* @__PURE__ */ h(LearningSummary, { account, data, onGo }), /* @__PURE__ */ h(SectionTitle, { title: "\u0422\u0432\u043E\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442. \u0422\u0432\u043E\u0439 \u0442\u0435\u043C\u043F.", caption: "\u041E\u0442 \u043F\u0435\u0440\u0432\u043E\u0433\u043E hello \u2014 \u043A \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0439 \u0440\u0435\u0447\u0438." }), /* @__PURE__ */ h("div", { className: "oc-segments" }, /* @__PURE__ */ h("button", { className: type === "course" ? "is-active" : "", onClick: () => setType("course") }, "\u0421\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0440\u043E\u043A\u0438"), /* @__PURE__ */ h("button", { className: type === "class" ? "is-active" : "", onClick: () => setType("class") }, "\u0417\u0430\u043D\u044F\u0442\u0438\u044F \u0433\u0440\u0443\u043F\u043F\u044B")), type === "course" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("div", { className: "oc-course-wrap" }, /* @__PURE__ */ h("button", { className: "oc-rail-arrow oc-rail-left", "aria-label": "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0435 \u0443\u0440\u043E\u043A\u0438", onClick: () => rail.current?.scrollBy({ left: -330, behavior: "smooth" }) }, "\u2039"), /* @__PURE__ */ h("div", { className: "oc-course-rail", ref: rail }, course.map((t) => /* @__PURE__ */ h("button", { key: t.id, className: "oc-course-card " + (focused === t.id ? "is-selected" : ""), onClick: () => setFocused(t.id) }, /* @__PURE__ */ h(Landscape, { variant: t.index % 5 }), /* @__PURE__ */ h("span", { className: "oc-course-level" }, t.level, " / ", String(t.index + 1).padStart(2, "0")), /* @__PURE__ */ h("h3", null, t.title), /* @__PURE__ */ h("p", null, t.desc), /* @__PURE__ */ h("div", { className: "oc-course-status" }, /* @__PURE__ */ h("span", { className: t.done ? "is-done" : "" }, t.done ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h(Icon, { name: "check", size: 13 }), t.percent, "%") : "\u041D\u0430\u0447\u0430\u0442\u044C")), /* @__PURE__ */ h("small", null, t.done ? "\u041C\u043E\u0436\u043D\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C" : "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u2192 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u2192 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430")))), /* @__PURE__ */ h("button", { className: "oc-rail-arrow oc-rail-right", "aria-label": "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0435 \u0443\u0440\u043E\u043A\u0438", onClick: () => rail.current?.scrollBy({ left: 330, behavior: "smooth" }) }, "\u203A")), focused && /* @__PURE__ */ h("section", { className: "oc-course-detail" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "\u0422\u0412\u041E\u0419 \u0421\u041B\u0415\u0414\u0423\u042E\u0429\u0418\u0419 \u0428\u0410\u0413"), /* @__PURE__ */ h("h2", null, course.find((t) => t.id === focused)?.title), /* @__PURE__ */ h("p", null, "\u041F\u043E\u0439\u043C\u0438 \u0441\u043C\u044B\u0441\u043B, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u043D\u0430 \u043F\u0440\u0438\u043C\u0435\u0440\u0430\u0445 \u0438 \u0437\u0430\u043A\u0440\u0435\u043F\u0438 \u0432 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435.")), /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => {
      sessionStorage.setItem("orbit-open-topic", focused);
      onGo("grammar");
    } }, "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0443\u0440\u043E\u043A", /* @__PURE__ */ h(Icon, { name: "arrow", size: 18 }))), /* @__PURE__ */ h("p", { className: "oc-course-note" }, "\u041A\u0430\u0436\u0434\u0430\u044F \u0442\u0435\u043C\u0430 \u043E\u0442\u043A\u0440\u044B\u0442\u0430. \u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0439\u0441\u044F \u043A \u0441\u043B\u043E\u0436\u043D\u043E\u043C\u0443 \u0438 \u0434\u0432\u0438\u0433\u0430\u0439\u0441\u044F \u0432 \u0441\u0432\u043E\u0451\u043C \u0440\u0438\u0442\u043C\u0435.")) : data.lessons.length ? /* @__PURE__ */ h("div", { className: "oc-class-lessons" }, data.lessons.map((l, i) => /* @__PURE__ */ h("button", { key: l.id, className: "oc-class-lesson", onClick: () => onGroup(l.group_id) }, /* @__PURE__ */ h(Landscape, { variant: i % 5 }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, date(l.date)), /* @__PURE__ */ h("h3", null, l.title), /* @__PURE__ */ h("p", null, l.group_name), /* @__PURE__ */ h("span", { className: "oc-link" }, "\u0417\u0430\u0434\u0430\u043D\u0438\u044F \u0438 \u0436\u0443\u0440\u043D\u0430\u043B \u2197"))))) : /* @__PURE__ */ h(Empty, { title: "\u0417\u0430\u043D\u044F\u0442\u0438\u044F \u0441\u043A\u043E\u0440\u043E \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F", detail: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C \u0434\u043E\u0431\u0430\u0432\u0438\u0442 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0438 \u0442\u0435\u043C\u044B \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0442\u0432\u043E\u0435\u0439 \u0433\u0440\u0443\u043F\u043F\u044B." }), /* @__PURE__ */ h(SectionTitle, { title: "\u0411\u043E\u043B\u044C\u0448\u0435 \u0441\u043F\u043E\u0441\u043E\u0431\u043E\u0432 \u0443\u0447\u0438\u0442\u044C\u0441\u044F." }), /* @__PURE__ */ h("div", { className: "oc-learning-tools" }, [["grammar", "Aa", "Grammar", "\u041F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0439 \u043B\u043E\u0433\u0438\u043A\u0443 \u044F\u0437\u044B\u043A\u0430"], ["vocabulary", "W", "Vocabulary", "\u0421\u043B\u043E\u0432\u0430, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043E\u0441\u0442\u0430\u043D\u0443\u0442\u0441\u044F \u0441 \u0442\u043E\u0431\u043E\u0439"], ["reading", "R", "Reading", "\u0418\u0441\u0442\u043E\u0440\u0438\u0438 \u0441 \u043D\u043E\u0432\u044B\u043C \u0441\u043C\u044B\u0441\u043B\u043E\u043C"], ["writing", "W", "Writing", "\u041D\u0430\u0439\u0434\u0438 \u0441\u0432\u043E\u0439 \u0441\u0442\u0438\u043B\u044C"]].map(([id, letter, title, desc]) => /* @__PURE__ */ h("button", { key: id, onClick: () => onGo(id) }, /* @__PURE__ */ h("span", null, letter), /* @__PURE__ */ h("h3", null, title), /* @__PURE__ */ h("p", null, desc), /* @__PURE__ */ h(Icon, { name: "up", size: 18 })))));
  }
  function Practice({ onGo, onGame, onVoice }) {
    return /* @__PURE__ */ h("div", { className: "oc-page" }, /* @__PURE__ */ h("section", { className: "oc-speaking-hero" }, /* @__PURE__ */ h("div", { className: "oc-speaking-pattern" }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "THE WORLD IS LISTENING."), /* @__PURE__ */ h("h1", null, "\u0422\u0432\u043E\u0439 \u0433\u043E\u043B\u043E\u0441.", /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, "\u0411\u0435\u0437 \u0433\u0440\u0430\u043D\u0438\u0446.")), /* @__PURE__ */ h("p", null, "\u0412 \u043A\u043E\u0444\u0435\u0439\u043D\u0435, \u043D\u0430 \u0438\u043D\u0442\u0435\u0440\u0432\u044C\u044E \u0438\u043B\u0438 \u0432 \u043D\u043E\u0432\u043E\u043C \u0433\u043E\u0440\u043E\u0434\u0435.", /* @__PURE__ */ h("br", null), "\u041D\u0430\u0439\u0434\u0438 \u0441\u043B\u043E\u0432\u0430 \u0434\u043B\u044F \u0441\u0432\u043E\u0435\u0439 \u0438\u0441\u0442\u043E\u0440\u0438\u0438."), /* @__PURE__ */ h("div", { className: "oc-row" }, /* @__PURE__ */ h("button", { className: "oc-white-button", onClick: () => onGo("dialogue") }, /* @__PURE__ */ h(Icon, { name: "chat", size: 17 }), "Role-play"), /* @__PURE__ */ h("button", { className: "oc-glass-button", onClick: () => onGo("speaking") }, /* @__PURE__ */ h(Icon, { name: "mic", size: 17 }), "Free talk"))), /* @__PURE__ */ h("div", { className: "oc-speaking-art", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { className: "oc-art-bubble" }, "Hello", /* @__PURE__ */ h("span", null, ".")), /* @__PURE__ */ h("div", { className: "oc-art-bubble oc-art-bubble-two" }, "Let\u2019s talk \u2197"), /* @__PURE__ */ h("div", { className: "oc-speaking-orb" }), /* @__PURE__ */ h("span", { className: "oc-speaking-coordinate" }, "VOICE / 01"))), /* @__PURE__ */ h("button", { className: "oc-live-banner", onClick: onVoice }, /* @__PURE__ */ h("div", { className: "oc-live-wave" }, Array.from({ length: 32 }, (_, i) => /* @__PURE__ */ h("i", { key: i, style: { "--wave": `${22 + Math.abs(Math.sin(i * 0.61)) * 70}%` } }))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-live-pill" }, /* @__PURE__ */ h("i", null), "Live conversation"), /* @__PURE__ */ h("h2", null, "Hello, real world."), /* @__PURE__ */ h("p", null, "\u041F\u043E\u0433\u043E\u0432\u043E\u0440\u0438 \u0441 \u043E\u0434\u043D\u043E\u0433\u0440\u0443\u043F\u043F\u043D\u0438\u043A\u043E\u043C. \u0418\u043B\u0438 \u0441\u043E\u0431\u0435\u0440\u0438 \u0441\u0432\u043E\u0439 conversation club.")), /* @__PURE__ */ h("span", { className: "oc-call-button" }, /* @__PURE__ */ h(Icon, { name: "mic", size: 26 }))), /* @__PURE__ */ h(SectionTitle, { title: "Play. Learn. Repeat.", caption: "\u041D\u0435\u043C\u043D\u043E\u0433\u043E \u0430\u0437\u0430\u0440\u0442\u0430. \u041C\u043D\u043E\u0433\u043E \u043D\u043E\u0432\u044B\u0445 \u0437\u043D\u0430\u043D\u0438\u0439." }), /* @__PURE__ */ h("div", { className: "oc-games" }, [["sprint", "Sprint", "90 \u0441\u0435\u043A\u0443\u043D\u0434. \u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u0438.", "01", "blue"], ["smart", "Smart", "\u0414\u0443\u043C\u0430\u0439 \u0433\u043B\u0443\u0431\u0436\u0435. \u041D\u0430\u0445\u043E\u0434\u0438 \u0441\u0432\u044F\u0437\u0438.", "02", "violet"], ["duel", "Challenge", "\u0411\u0440\u043E\u0441\u044C \u0432\u044B\u0437\u043E\u0432 \u0441\u0432\u043E\u0435\u043C\u0443 \u0440\u0435\u043A\u043E\u0440\u0434\u0443.", "03", "mint"]].map(([id, title, desc, num, color]) => /* @__PURE__ */ h("button", { key: id, className: "oc-game oc-game-" + color, onClick: () => onGame(id) }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "ORBIT / ", num), /* @__PURE__ */ h(Icon, { name: "up", size: 19 })), /* @__PURE__ */ h("h3", null, title), /* @__PURE__ */ h("p", null, desc), /* @__PURE__ */ h("div", { className: "oc-game-art" }, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("b", null, id === "sprint" ? "90" : id === "smart" ? "Aa" : "\u2197")), /* @__PURE__ */ h("span", { className: "oc-game-foot" }, "\u0412 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0412 \u0442\u0432\u043E\u0451\u043C \u0442\u0435\u043C\u043F\u0435.")))), /* @__PURE__ */ h("div", { className: "oc-practice-bottom" }, /* @__PURE__ */ h("button", { onClick: () => onGo("pronunciation") }, /* @__PURE__ */ h(Icon, { name: "wave", size: 27 }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h3", null, "Say it your way."), /* @__PURE__ */ h("p", null, "\u041F\u0440\u043E\u0438\u0437\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u0438 \u0440\u0438\u0442\u043C \u0440\u0435\u0447\u0438")), /* @__PURE__ */ h(Icon, { name: "up" })), /* @__PURE__ */ h("button", { onClick: () => onGo("typing") }, /* @__PURE__ */ h(Icon, { name: "screen", size: 27 }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h3", null, "Find your flow."), /* @__PURE__ */ h("p", null, "\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0438 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u0435\u0447\u0430\u0442\u0438")), /* @__PURE__ */ h(Icon, { name: "up" }))));
  }
  function Marks({ account, data, onGroup }) {
    const [groupId, setGroupId] = useState(data.groups[0]?.id || ""), [month, setMonth] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 7)), [journal, setJournal] = useState(null), [error, setError] = useState(""), [selected, setSelected] = useState(null);
    useEffect(() => {
      let valid = true;
      if (groupId) api2(`/api/campus/marks?groupId=${encodeURIComponent(groupId)}&month=${month}`).then((d) => {
        if (valid) {
          setJournal(d);
          setError("");
        }
      }).catch((e) => {
        if (valid) setError(e.message);
      });
      return () => {
        valid = false;
      };
    }, [groupId, month]);
    if (!data.groups.length) return /* @__PURE__ */ h(Empty, { title: "\u0422\u0432\u043E\u0439 \u0436\u0443\u0440\u043D\u0430\u043B \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441 \u0433\u0440\u0443\u043F\u043F\u044B", detail: "\u041F\u043E\u0441\u043B\u0435 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0433\u0440\u0443\u043F\u043F\u044B \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0430\u043D\u044F\u0442\u0438\u044F, \u043E\u0446\u0435\u043D\u043A\u0438 \u0438 \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C." });
    return /* @__PURE__ */ h("div", { className: "oc-page" }, /* @__PURE__ */ h("div", { className: "oc-page-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "SMALL STEPS. REAL PROGRESS."), /* @__PURE__ */ h("h1", null, "\u041A\u0430\u0436\u0434\u044B\u0439 \u0448\u0430\u0433 \u0438\u043C\u0435\u0435\u0442 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435."), /* @__PURE__ */ h("p", null, account.user.role === "student" ? "\u0422\u0432\u043E\u0438 \u043E\u0446\u0435\u043D\u043A\u0438 \u0438 \u043F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C. \u0412\u0441\u0451 \u0432 \u043E\u0434\u043D\u043E\u0439 \u043A\u0430\u0440\u0442\u0438\u043D\u0435." : "\u0412\u0441\u044F \u0433\u0440\u0443\u043F\u043F\u0430. \u0412\u0441\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u044F. \u041D\u0438 \u043E\u0434\u043D\u043E\u0439 \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u043D\u043E\u0439 \u0434\u0435\u0442\u0430\u043B\u0438."))), /* @__PURE__ */ h("div", { className: "oc-journal-toolbar" }, /* @__PURE__ */ h("label", null, /* @__PURE__ */ h("span", null, "\u0413\u0440\u0443\u043F\u043F\u0430"), /* @__PURE__ */ h("select", { "aria-label": "\u0413\u0440\u0443\u043F\u043F\u0430 \u0436\u0443\u0440\u043D\u0430\u043B\u0430", value: groupId, onChange: (e) => setGroupId(e.target.value) }, data.groups.map((g) => /* @__PURE__ */ h("option", { key: g.id, value: g.id }, g.name)))), /* @__PURE__ */ h("label", null, /* @__PURE__ */ h("span", null, "\u041C\u0435\u0441\u044F\u0446"), /* @__PURE__ */ h("input", { "aria-label": "\u041C\u0435\u0441\u044F\u0446 \u0436\u0443\u0440\u043D\u0430\u043B\u0430", type: "month", value: month, onChange: (e) => setMonth(e.target.value) })), account.user.role !== "student" && /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => onGroup(groupId, "journal") }, /* @__PURE__ */ h(Icon, { name: "marks", size: 17 }), "\u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0436\u0443\u0440\u043D\u0430\u043B"), /* @__PURE__ */ h("div", { className: "oc-mark-legend" }, /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("i", { className: "is-high" }), "85\u2013100"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("i", { className: "is-mid" }), "60\u201384"), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("i", { className: "is-low" }), "0\u201359"))), /* @__PURE__ */ h(Notice, { error }), journal?.lessons.length ? /* @__PURE__ */ h("div", { className: "oc-journal-scroll" }, /* @__PURE__ */ h("table", { className: "oc-journal-table" }, /* @__PURE__ */ h("thead", null, /* @__PURE__ */ h("tr", null, /* @__PURE__ */ h("th", null, /* @__PURE__ */ h(Icon, { name: "people", size: 16 }), " ", account.user.role === "student" ? "\u041C\u043E\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442" : "Students"), journal.lessons.map((l) => /* @__PURE__ */ h("th", { key: l.id }, /* @__PURE__ */ h("b", null, date(l.date, { day: "2-digit", month: "short" })), /* @__PURE__ */ h("span", null, l.title))))), /* @__PURE__ */ h("tbody", null, journal.people.map((p, index) => /* @__PURE__ */ h("tr", { key: p.id }, /* @__PURE__ */ h("th", null, /* @__PURE__ */ h("span", { className: "oc-row-number" }, index + 1), /* @__PURE__ */ h(Avatar, { person: p, small: true }), /* @__PURE__ */ h("b", null, p.firstName, " ", p.lastName), p.id === account.user.userId && /* @__PURE__ */ h("span", { className: "oc-you" }, "\u0412\u044B")), journal.lessons.map((l) => {
      const marks = journal.marks.filter((m) => m.lesson_id === l.id && m.student_id === p.id), att = journal.attendance.find((a) => a.lesson_id === l.id && a.student_id === p.id);
      return /* @__PURE__ */ h("td", { key: l.id }, /* @__PURE__ */ h("div", null, marks.map((m) => /* @__PURE__ */ h("button", { key: m.skill, title: skillNames2[m.skill] || "\u041E\u0431\u0449\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430", className: "oc-mark " + (m.score >= 85 ? "is-high" : m.score >= 60 ? "is-mid" : "is-low"), onClick: () => setSelected({ ...m, person: p, lesson: l }) }, m.score)), !marks.length && /* @__PURE__ */ h("span", { className: "oc-mark-dash" }, "\u2014")), att && /* @__PURE__ */ h("small", { className: "oc-attendance oc-attendance-" + att.status }, { present: "\u041F\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u043B", late: "\u041E\u043F\u043E\u0437\u0434\u0430\u043B", absent: "\u041E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u043B", excused: "\u0423\u0432. \u043F\u0440\u0438\u0447\u0438\u043D\u0430" }[att.status]));
    })))))) : !error && /* @__PURE__ */ h(Empty, { title: "\u0412 \u044D\u0442\u043E\u043C \u043C\u0435\u0441\u044F\u0446\u0435 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u0438\u0439", detail: "\u0412\u044B\u0431\u0435\u0440\u0438 \u0434\u0440\u0443\u0433\u043E\u0439 \u043C\u0435\u0441\u044F\u0446 \u0438\u043B\u0438 \u0434\u043E\u0436\u0434\u0438\u0441\u044C \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F." }), selected && /* @__PURE__ */ h(Modal, { title: "\u041E\u0446\u0435\u043D\u043A\u0430 \u0437\u0430 \u0437\u0430\u043D\u044F\u0442\u0438\u0435", onClose: () => setSelected(null) }, /* @__PURE__ */ h("div", { className: "oc-mark-detail" }, /* @__PURE__ */ h(Avatar, { person: selected.person }), /* @__PURE__ */ h("h3", null, selected.person.firstName, " ", selected.person.lastName), /* @__PURE__ */ h("p", null, selected.lesson.title, " \xB7 ", date(selected.lesson.date)), /* @__PURE__ */ h("b", { className: "oc-mark-big " + (selected.score >= 85 ? "is-high" : selected.score >= 60 ? "is-mid" : "is-low") }, selected.score, /* @__PURE__ */ h("small", null, "/100")), /* @__PURE__ */ h("span", null, skillNames2[selected.skill] || "\u041E\u0431\u0449\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430"), /* @__PURE__ */ h("p", null, selected.comment || "\u0423\u0447\u0438\u0442\u0435\u043B\u044C \u043F\u043E\u043A\u0430 \u043D\u0435 \u043E\u0441\u0442\u0430\u0432\u0438\u043B \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439."))));
  }
  function Ranking({ account, data, onPerson }) {
    const [scope, setScope] = useState("school"), [level, setLevel] = useState(""), [groupId, setGroupId] = useState(data.groups[0]?.id || ""), [ranking, setRanking] = useState([]), [self, setSelf] = useState(data.stats), [error, setError] = useState("");
    useEffect(() => {
      let active = true;
      if (scope === "group" && !groupId) return;
      api2(`/api/campus/ranking?scope=${scope}&level=${level}&groupId=${groupId}`).then((d) => {
        if (active) {
          setRanking(d.ranking);
          setSelf(d.self);
          setError("");
        }
      }).catch((e) => active && setError(e.message));
      return () => {
        active = false;
      };
    }, [scope, level, groupId]);
    const own = ranking.find((p) => p.id === account.user.userId);
    return /* @__PURE__ */ h("div", { className: "oc-page oc-ranking-page" }, /* @__PURE__ */ h("div", { className: "oc-ranking-left" }, /* @__PURE__ */ h("section", { className: "oc-podium" }, /* @__PURE__ */ h("div", { className: "oc-podium-light" }), /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "THE NEXT LEVEL IS YOU."), /* @__PURE__ */ h("h2", null, "\u0412 \u043E\u0434\u043D\u043E\u0439 \u043E\u0440\u0431\u0438\u0442\u0435.", /* @__PURE__ */ h("br", null), "\u0412\u044B\u0448\u0435 \u0441 \u043A\u0430\u0436\u0434\u044B\u043C \u0434\u043D\u0451\u043C."), ranking.length ? /* @__PURE__ */ h("div", { className: "oc-podium-people" }, [1, 0, 2].map((index, i) => {
      const p = ranking[index];
      return /* @__PURE__ */ h("div", { className: "oc-podium-person oc-place-" + (index + 1), key: index }, p ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("button", { "aria-label": "\u041F\u0440\u043E\u0444\u0438\u043B\u044C " + p.firstName + " " + p.lastName, onClick: () => onPerson(p.id) }, /* @__PURE__ */ h(Avatar, { person: p })), /* @__PURE__ */ h("b", null, p.firstName), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", null, index + 1))) : /* @__PURE__ */ h("div", { className: "oc-podium-empty" }, /* @__PURE__ */ h("span", null, "\u2726")));
    })) : /* @__PURE__ */ h("div", { className: "oc-podium-nopeople" }, /* @__PURE__ */ h(ObjectArt, { kind: "trophy" }), /* @__PURE__ */ h("p", null, "\u0417\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043B\u0438\u0434\u0435\u0440\u044B \u0442\u0432\u043E\u0435\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430."))), /* @__PURE__ */ h("div", { className: "oc-segments" }, /* @__PURE__ */ h("button", { className: level === account.profile.level ? "is-active" : "", onClick: () => setLevel(account.profile.level) }, "\u041C\u043E\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C"), /* @__PURE__ */ h("button", { className: !level ? "is-active" : "", onClick: () => setLevel("") }, "\u0412\u0441\u0435 \u0443\u0440\u043E\u0432\u043D\u0438")), /* @__PURE__ */ h("div", { className: "oc-segments" }, /* @__PURE__ */ h("button", { className: scope === "school" ? "is-active" : "", onClick: () => setScope("school") }, "\u041F\u043E \u0446\u0435\u043D\u0442\u0440\u0443"), /* @__PURE__ */ h("button", { disabled: !data.groups.length, className: scope === "group" ? "is-active" : "", onClick: () => setScope("group") }, "\u041F\u043E \u0433\u0440\u0443\u043F\u043F\u0435")), scope === "group" && /* @__PURE__ */ h("select", { className: "oc-ranking-select", "aria-label": "\u0413\u0440\u0443\u043F\u043F\u0430 \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0430", value: groupId, onChange: (e) => setGroupId(e.target.value) }, data.groups.map((g) => /* @__PURE__ */ h("option", { key: g.id, value: g.id }, g.name))), /* @__PURE__ */ h(Notice, { error }), /* @__PURE__ */ h("div", { className: "oc-ranking-list" }, ranking.map((p) => /* @__PURE__ */ h("button", { key: p.id, className: p.id === account.user.userId ? "is-self" : "", onClick: () => onPerson(p.id) }, /* @__PURE__ */ h("span", { className: "oc-rank-number " + (p.rank < 4 ? "oc-rank-top" : "") }, p.rank), /* @__PURE__ */ h(Avatar, { person: p, small: true }), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, p.firstName, " ", p.lastName), /* @__PURE__ */ h("small", null, levelName[p.level])), /* @__PURE__ */ h("strong", null, format(p.xp), /* @__PURE__ */ h(Icon, { name: "star", size: 15 }))))), /* @__PURE__ */ h("p", { className: "os-help" }, "Score \u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0438\u0437 \u043B\u0443\u0447\u0448\u0438\u0445 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432 \u0442\u0435\u043C, \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0445 \u0434\u043E\u043C\u0430\u0448\u043D\u0438\u0445 \u0440\u0430\u0431\u043E\u0442 \u0438 \u043B\u0438\u0447\u043D\u044B\u0445 \u0440\u0435\u043A\u043E\u0440\u0434\u043E\u0432. \u041F\u043E\u0432\u0442\u043E\u0440 \u043E\u0434\u043D\u043E\u0439 \u0442\u0435\u043C\u044B \u043D\u0435 \u043D\u0430\u043A\u0440\u0443\u0447\u0438\u0432\u0430\u0435\u0442 \u0440\u0435\u0439\u0442\u0438\u043D\u0433.")), /* @__PURE__ */ h("div", { className: "oc-ranking-right" }, /* @__PURE__ */ h("section", { className: "oc-ranking-profile" }, /* @__PURE__ */ h(Avatar, { person: account.profile, small: true }), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, account.user.displayName), /* @__PURE__ */ h("span", null, levelName[account.profile.level])), /* @__PURE__ */ h("strong", null, self.average === null ? "\u2014" : self.average + "%", /* @__PURE__ */ h("small", null, "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u043E\u0446\u0435\u043D\u043A\u0430"))), /* @__PURE__ */ h("div", { className: "oc-ranking-kpis" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "coin" }), /* @__PURE__ */ h("b", null, format(self.coins)), /* @__PURE__ */ h("span", null, "Coins")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "star" }), /* @__PURE__ */ h("b", null, format(self.xp)), /* @__PURE__ */ h("span", null, "Score")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "ranking" }), /* @__PURE__ */ h("b", null, own ? "#" + own.rank : "\u2014"), /* @__PURE__ */ h("span", null, "\u041C\u0435\u0441\u0442\u043E \u0432 \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0435")), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(Icon, { name: "check" }), /* @__PURE__ */ h("b", null, self.completed), /* @__PURE__ */ h("span", null, "\u0418\u0437\u0443\u0447\u0435\u043D\u043E \u0442\u0435\u043C"))), /* @__PURE__ */ h("section", { className: "oc-radar-card" }, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "YOUR ENGLISH. IN EVERY DIMENSION."), /* @__PURE__ */ h(Radar, { skills: self.skills }), /* @__PURE__ */ h("p", null, "\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0445 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432")), /* @__PURE__ */ h("div", { className: "oc-ranking-note" }, /* @__PURE__ */ h(Icon, { name: "heart", size: 22 }), /* @__PURE__ */ h("p", null, "\u0421\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0439 \u0441\u0435\u0431\u044F \u0441 \u0441\u043E\u0431\u043E\u0439 \u0432\u0447\u0435\u0440\u0430.", /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("b", null, "\u0422\u0432\u043E\u0439 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433 \u0432\u0430\u0436\u043D\u0435\u0435 \u043B\u044E\u0431\u043E\u0433\u043E \u043C\u0435\u0441\u0442\u0430.")))));
  }
  function Extra({ account }) {
    const [info, setInfo] = useState(null), [tab, setTab] = useState("upcoming"), [book, setBook] = useState(false), [create, setCreate] = useState(false), [error, setError] = useState("");
    const refresh = useCallback(() => api2("/api/campus/support").then(setInfo), []);
    useEffect(() => {
      refresh().catch((e) => setError(e.message));
    }, []);
    const teach = account.user.role !== "student", mySlots = info?.slots.filter((s) => account.user.role === "admin" || s.teacher_id === account.user.userId) || [], list = info?.bookings.filter((b) => tab === "upcoming" ? b.status === "booked" && b.starts_at > Date.now() : b.status !== "booked" || b.starts_at <= Date.now()) || [];
    async function change(b, status) {
      try {
        await api2("/api/campus/support/status", { id: b.id, status });
        await refresh();
      } catch (e) {
        setError(e.message);
      }
    }
    return /* @__PURE__ */ h("div", { className: "oc-page" }, /* @__PURE__ */ h("div", { className: "oc-extra-toolbar" }, /* @__PURE__ */ h("div", { className: "oc-segments" }, /* @__PURE__ */ h("button", { className: tab === "upcoming" ? "is-active" : "", onClick: () => setTab("upcoming") }, "Upcoming"), /* @__PURE__ */ h("button", { className: tab === "history" ? "is-active" : "", onClick: () => setTab("history") }, "Bookings history")), teach ? /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setCreate(true) }, "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432\u0440\u0435\u043C\u044F") : /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setBook(true) }, "+ \u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u0437\u0430\u043D\u044F\u0442\u0438\u0435")), /* @__PURE__ */ h(Notice, { error }), teach && mySlots.length > 0 && /* @__PURE__ */ h("section", { className: "oc-available-slots" }, /* @__PURE__ */ h(SectionTitle, { title: "\u041E\u0442\u043A\u0440\u044B\u0442\u043E\u0435 \u0432\u0440\u0435\u043C\u044F", caption: "\u0417\u0430\u043F\u0438\u0441\u044C \u0432\u0438\u0434\u043D\u0430 \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C \u0446\u0435\u043D\u0442\u0440\u0430." }), mySlots.map((s) => /* @__PURE__ */ h("div", { key: s.id }, /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, s.topic), /* @__PURE__ */ h("small", null, date(s.starts_at), " \xB7 ", new Date(s.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), " \xB7 ", s.minutes, " \u043C\u0438\u043D \xB7 ", s.teacher_name)), /* @__PURE__ */ h("span", { className: "os-tag" }, s.taken ? "\u0417\u0430\u043D\u044F\u0442\u043E" : "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E"), /* @__PURE__ */ h("button", { className: "oc-link", onClick: async () => {
      try {
        await api2("/api/campus/support/slots/cancel", { slotId: s.id });
        await refresh();
      } catch (e) {
        setError(e.message);
      }
    } }, "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0432\u0440\u0435\u043C\u044F")))), list.length ? /* @__PURE__ */ h("div", { className: "oc-bookings" }, list.map((b) => /* @__PURE__ */ h("section", { className: "oc-booking", key: b.id }, /* @__PURE__ */ h("div", { className: "oc-booking-date" }, /* @__PURE__ */ h("b", null, new Date(b.starts_at).getDate()), /* @__PURE__ */ h("span", null, date(b.starts_at, { month: "short" }))), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "os-tag os-status-" + (b.status === "completed" ? "reviewed" : b.status === "cancelled" ? "returned" : "submitted") }, { booked: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E", completed: "\u041F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u043E", cancelled: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E" }[b.status]), /* @__PURE__ */ h("h3", null, b.topic), /* @__PURE__ */ h("p", null, b.teacher_name, " \xB7 ", new Date(b.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), " \xB7 ", b.minutes, " \u043C\u0438\u043D"), teach && /* @__PURE__ */ h("small", null, "\u0423\u0447\u0435\u043D\u0438\u043A: ", b.student_name), b.note && /* @__PURE__ */ h("p", null, b.note)), /* @__PURE__ */ h("div", null, b.status === "booked" && /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("button", { className: "oc-link", onClick: () => change(b, "cancelled") }, "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"), teach && /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => change(b, "completed") }, "\u0417\u0430\u043D\u044F\u0442\u0438\u0435 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u043E")))))) : /* @__PURE__ */ h("section", { className: "oc-extra-empty" }, /* @__PURE__ */ h("div", { className: "oc-support-art" }, /* @__PURE__ */ h("div", { className: "oc-support-orbit" }), /* @__PURE__ */ h("div", { className: "oc-support-board" }, /* @__PURE__ */ h("span", null, "hello."), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null)), /* @__PURE__ */ h("div", { className: "oc-support-person" }, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("b", null))), /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "A LITTLE HELP. A BIG DIFFERENCE."), /* @__PURE__ */ h("h1", null, "\u0421\u043B\u043E\u0436\u043D\u0430\u044F \u0442\u0435\u043C\u0430?", /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, "\u0420\u0430\u0437\u0431\u0435\u0440\u0451\u043C\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435.")), /* @__PURE__ */ h("p", null, "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u0441 \u0443\u0447\u0438\u0442\u0435\u043B\u0435\u043C \u2014", /* @__PURE__ */ h("br", null), "\u0447\u0442\u043E\u0431\u044B \u0432\u0441\u0451 \u043D\u0430\u043A\u043E\u043D\u0435\u0446 \u0432\u0441\u0442\u0430\u043B\u043E \u043D\u0430 \u0441\u0432\u043E\u0438 \u043C\u0435\u0441\u0442\u0430."), /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => teach ? setCreate(true) : setBook(true) }, /* @__PURE__ */ h(Icon, { name: "extra", size: 18 }), teach ? "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0432\u0440\u0435\u043C\u044F \u0434\u043B\u044F \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432" : "Book an extra lesson")), create && info && /* @__PURE__ */ h(Modal, { title: "\u0412\u0440\u0435\u043C\u044F \u0434\u043B\u044F \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F", onClose: () => setCreate(false) }, /* @__PURE__ */ h(Form, { fields: [...account.user.role === "admin" ? [{ name: "teacherId", label: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C", type: "select", options: info.teachers.map((p) => [p.id, p.firstName + " " + p.lastName]) }] : [], { name: "topic", label: "\u0422\u0435\u043C\u0430 \u0438\u043B\u0438 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435", required: true, placeholder: "\u0420\u0430\u0437\u0431\u0435\u0440\u0451\u043C Present Perfect" }, { name: "startsAt", label: "\u0414\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F", type: "datetime-local", required: true }, { name: "minutes", label: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C", type: "select", options: [["20", "20 \u043C\u0438\u043D\u0443\u0442"], ["30", "30 \u043C\u0438\u043D\u0443\u0442"], ["45", "45 \u043C\u0438\u043D\u0443\u0442"], ["60", "60 \u043C\u0438\u043D\u0443\u0442"]] }], onSubmit: async (values) => {
      await api2("/api/campus/support/slots", { ...values, startsAt: new Date(values.startsAt).getTime() });
      await refresh();
      setCreate(false);
    }, label: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C" })), book && info && /* @__PURE__ */ h(Modal, { title: "Book an extra lesson", onClose: () => setBook(false) }, info.slots.filter((s) => !s.taken).length ? /* @__PURE__ */ h(Form, { fields: [{ name: "slotId", label: "\u0423\u0447\u0438\u0442\u0435\u043B\u044C \u0438 \u0432\u0440\u0435\u043C\u044F", type: "select", options: info.slots.filter((s) => !s.taken).map((s) => [s.id, `${date(s.starts_at)} \xB7 ${new Date(s.starts_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} \xB7 ${s.teacher_name} \xB7 ${s.topic}`]) }, { name: "note", label: "\u0421 \u0447\u0435\u043C \u043D\u0443\u0436\u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C?", type: "textarea", maxLength: 600 }], onSubmit: async (values) => {
      await api2("/api/campus/support/book", values);
      await refresh();
      setBook(false);
    }, label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C" }) : /* @__PURE__ */ h(Empty, { title: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442", detail: "\u0423\u0447\u0438\u0442\u0435\u043B\u044F \u0441\u043A\u043E\u0440\u043E \u043E\u0442\u043A\u0440\u043E\u044E\u0442 \u043D\u043E\u0432\u044B\u0435 \u0441\u043B\u043E\u0442\u044B. \u041C\u043E\u0436\u043D\u043E \u043D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0441\u0432\u043E\u0435\u043C\u0443 \u0443\u0447\u0438\u0442\u0435\u043B\u044E \u0432 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u0445." })));
  }
  function Game({ mode, onClose, onDone }) {
    const [attempt, setAttempt] = useState(null), [answers, setAnswers] = useState([]), [index, setIndex] = useState(0), [result, setResult] = useState(null), [error, setError] = useState(""), [remaining, setRemaining] = useState(0), [busy, setBusy] = useState(false);
    const saving = useRef(false), answerRef = useRef([]), attemptRef = useRef(null);
    useEffect(() => {
      api2("/api/campus/practice/start", { mode }).then((d) => {
        setAttempt(d);
        attemptRef.current = d;
        const a = d.questions.map(() => null);
        setAnswers(a);
        answerRef.current = a;
        setRemaining(Math.ceil((d.expiresAt - Date.now()) / 1e3));
      }).catch((e) => setError(e.message));
      return () => window.speechSynthesis?.cancel();
    }, []);
    async function finish() {
      if (saving.current || !attemptRef.current) return;
      saving.current = true;
      setBusy(true);
      try {
        const d = await api2("/api/campus/practice/finish", { id: attemptRef.current.id, answers: answerRef.current });
        setResult(d);
        onDone();
      } catch (e) {
        setError(e.message);
        saving.current = false;
      } finally {
        setBusy(false);
      }
    }
    useEffect(() => {
      if (!attempt || result) return;
      const timer = setInterval(() => {
        const left = Math.max(0, Math.ceil((attempt.expiresAt - Date.now()) / 1e3));
        setRemaining(left);
        if (left === 0) {
          clearInterval(timer);
          finish();
        }
      }, 1e3);
      return () => clearInterval(timer);
    }, [attempt?.id, result]);
    const q = attempt?.questions[index];
    return /* @__PURE__ */ h(Modal, { title: mode === "mock" ? "Level challenge" : mode === "duel" ? "Personal challenge" : mode === "sprint" ? "Orbit Sprint" : "Orbit Smart", onClose }, /* @__PURE__ */ h(Notice, { error }), result ? /* @__PURE__ */ h("div", { className: "oc-game-result" }, /* @__PURE__ */ h(ObjectArt, { kind: "trophy" }), /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, "ANOTHER STEP FORWARD."), /* @__PURE__ */ h("h2", null, Math.round(result.score / result.total * 100), /* @__PURE__ */ h("small", null, "%")), /* @__PURE__ */ h("p", null, result.score, " \u0438\u0437 ", result.total, " \u0432\u0435\u0440\u043D\u043E. \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D."), /* @__PURE__ */ h("div", { className: "oc-game-review" }, result.review.map((q2, i) => /* @__PURE__ */ h("div", { className: q2.selected === q2.correct ? "is-correct" : "is-wrong", key: i }, /* @__PURE__ */ h("b", null, i + 1, ". ", q2.q), /* @__PURE__ */ h("p", null, "\u041E\u0442\u0432\u0435\u0442: ", q2.options[q2.correct]), /* @__PURE__ */ h("small", null, q2.why)))), /* @__PURE__ */ h("button", { className: "os-primary", onClick: onClose }, "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435")) : q ? /* @__PURE__ */ h("div", { className: "oc-game-question" }, /* @__PURE__ */ h("div", { className: "oc-game-timer" }, /* @__PURE__ */ h("span", null, index + 1, " / ", attempt.questions.length), /* @__PURE__ */ h("b", null, Math.floor(remaining / 60), ":", String(remaining % 60).padStart(2, "0"))), /* @__PURE__ */ h("div", { className: "oc-progress" }, /* @__PURE__ */ h("i", { style: { width: (index + 1) / attempt.questions.length * 100 + "%" } })), q.passage && /* @__PURE__ */ h("blockquote", null, q.passage), q.audio && /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(q.audio);
      utterance.lang = "en-GB";
      utterance.rate = 0.88;
      speechSynthesis.speak(utterance);
    } }, /* @__PURE__ */ h(Icon, { name: "headphones", size: 17 }), "\u0421\u043B\u0443\u0448\u0430\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C"), /* @__PURE__ */ h("h3", null, q.q), /* @__PURE__ */ h("div", { className: "oc-game-options" }, q.options.map((option, i) => /* @__PURE__ */ h("button", { key: i, className: answers[index] === i ? "is-selected" : "", onClick: () => {
      const next = answers.map((a, j) => j === index ? i : a);
      setAnswers(next);
      answerRef.current = next;
    } }, /* @__PURE__ */ h("span", null, String.fromCharCode(65 + i)), option))), /* @__PURE__ */ h("div", { className: "oc-row" }, /* @__PURE__ */ h("button", { className: "os-secondary", disabled: !index || busy, onClick: () => setIndex(index - 1) }, "\u041D\u0430\u0437\u0430\u0434"), index < attempt.questions.length - 1 ? /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setIndex(index + 1) }, "\u0414\u0430\u043B\u044C\u0448\u0435", /* @__PURE__ */ h(Icon, { name: "arrow", size: 17 })) : /* @__PURE__ */ h("button", { disabled: busy, className: "os-primary", onClick: finish }, busy ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C\u2026" : "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C")), /* @__PURE__ */ h("p", { className: "os-help" }, mode === "mock" ? "\u0423\u0447\u0435\u0431\u043D\u0430\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u044F\u0437\u044B\u043A\u0430. \u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043D\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u043C IELTS." : "\u0412 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 \u0438\u0434\u0451\u0442 \u043B\u0443\u0447\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u044D\u0442\u043E\u0433\u043E \u0440\u0435\u0436\u0438\u043C\u0430.")) : !error && /* @__PURE__ */ h("p", null, "\u041F\u043E\u0434\u0433\u043E\u0442\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u0432\u043E\u043F\u0440\u043E\u0441\u044B\u2026"));
  }
  function VisualLesson({ lesson: lesson2, onGo, onClose }) {
    const [index, setIndex] = useState(0), [playing, setPlaying] = useState(false), [sound, setSound] = useState(true), [finished, setFinished] = useState(false);
    const slide = lesson2.slides[index];
    useEffect(() => {
      if (!playing || finished) return;
      let closed = false, timer;
      const next = () => {
        if (closed) return;
        if (index === lesson2.slides.length - 1) {
          setFinished(true);
          setPlaying(false);
        } else setIndex((i) => i + 1);
      };
      if (sound && "speechSynthesis" in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(slide.narration);
        utterance.lang = "en-GB";
        utterance.rate = 0.86;
        utterance.onend = () => {
          timer = setTimeout(next, 1500);
        };
        utterance.onerror = () => {
          timer = setTimeout(next, 8500);
        };
        speechSynthesis.speak(utterance);
      } else timer = setTimeout(next, 8500);
      return () => {
        closed = true;
        clearTimeout(timer);
        window.speechSynthesis?.cancel();
      };
    }, [index, playing, sound, finished]);
    return /* @__PURE__ */ h(Modal, { title: lesson2.title + " \xB7 Visual lesson", onClose }, /* @__PURE__ */ h("div", { className: "oc-visual-player" }, /* @__PURE__ */ h(Landscape, { variant: index % 5 }), /* @__PURE__ */ h("div", { className: "oc-visual-slide", key: index }, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, slide.label), /* @__PURE__ */ h("h3", null, slide.phrase), /* @__PURE__ */ h("p", null, slide.explain)), /* @__PURE__ */ h("div", { className: "oc-visual-progress" }, lesson2.slides.map((s, i) => /* @__PURE__ */ h("button", { key: i, "aria-label": "\u0421\u0446\u0435\u043D\u0430 " + (i + 1), className: i <= index ? "is-active" : "", onClick: () => {
      setIndex(i);
      setFinished(false);
    } })))), /* @__PURE__ */ h("div", { className: "oc-visual-controls" }, /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => {
      if (finished) {
        setIndex(0);
        setFinished(false);
      }
      setPlaying(!playing);
    } }, /* @__PURE__ */ h(Icon, { name: "play", size: 16 }), playing ? "\u041F\u0430\u0443\u0437\u0430" : finished ? "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0435\u0449\u0451 \u0440\u0430\u0437" : "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0443\u0440\u043E\u043A"), /* @__PURE__ */ h("button", { className: "oc-link", onClick: () => setSound(!sound) }, sound ? "\u0417\u0432\u0443\u043A \u0432\u043A\u043B\u044E\u0447\u0451\u043D" : "\u0411\u0435\u0437 \u0437\u0432\u0443\u043A\u0430"), /* @__PURE__ */ h("span", null, index + 1, " / ", lesson2.slides.length)), /* @__PURE__ */ h("p", { className: "os-help" }, "\u041D\u0430\u0433\u043B\u044F\u0434\u043D\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F ORBIT \u0441 \u043E\u0437\u0432\u0443\u0447\u043A\u043E\u0439 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430. \u041C\u043E\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u044C \u0441\u0446\u0435\u043D\u044B \u0438 \u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432 \u0441\u0432\u043E\u0451\u043C \u0442\u0435\u043C\u043F\u0435."), /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => {
      if (lesson2.topic) sessionStorage.setItem("orbit-open-topic", lesson2.topic);
      onClose();
      onGo(lesson2.section);
    } }, "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0435", /* @__PURE__ */ h(Icon, { name: "arrow", size: 17 })));
  }
  function Catalog({ account, kind, onGo, stats, onUpdate }) {
    const [info, setInfo] = useState(null), [error, setError] = useState(""), [message, setMessage] = useState(""), [create, setCreate] = useState(false), [view, setView] = useState("all"), [video, setVideo] = useState(null);
    const refresh = useCallback(() => api2("/api/campus/catalog").then(setInfo), []);
    useEffect(() => {
      refresh().catch((e) => setError(e.message));
    }, [refresh]);
    const isAdmin = account.user.role === "admin", items = info?.items.filter((i) => kind === "catalog" || i.kind === { shop: "reward", events: "event", universities: "university", videos: "video" }[kind]) || [];
    async function action(path, body) {
      setError("");
      setMessage("");
      try {
        await api2(path, body);
        await refresh();
        await onUpdate();
        setMessage("\u0413\u043E\u0442\u043E\u0432\u043E. \u0417\u0430\u043F\u0438\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430.");
      } catch (e) {
        setError(e.message);
      }
    }
    const labels = { reward: "\u041D\u0430\u0433\u0440\u0430\u0434\u0430", event: "\u0421\u043E\u0431\u044B\u0442\u0438\u0435", university: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442", video: "\u0412\u0438\u0434\u0435\u043E" };
    return /* @__PURE__ */ h("div", { className: "oc-page" }, /* @__PURE__ */ h("section", { className: "oc-catalog-hero oc-catalog-" + kind }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "oc-eyebrow" }, kind === "shop" ? "SMALL WINS. SOMETHING SPECIAL." : kind === "videos" ? "WATCH. WONDER. UNDERSTAND." : "MORE TO YOUR ORBIT."), /* @__PURE__ */ h("h1", null, kind === "shop" ? "\u0422\u044B \u0437\u0430\u0441\u043B\u0443\u0436\u0438\u043B." : kind === "events" ? "\u0412\u0441\u0442\u0440\u0435\u0447\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u043B\u044F\u044E\u0442." : kind === "universities" ? "\u041C\u0435\u0447\u0442\u0430\u0439 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u043D\u0435\u0435." : kind === "videos" ? "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438 \u043D\u0430 \u043C\u0438\u0440 \u0438\u043D\u0430\u0447\u0435." : "\u0421\u043E\u0437\u0434\u0430\u0432\u0430\u0439 \u0441\u0432\u043E\u044E \u043E\u0440\u0431\u0438\u0442\u0443."), /* @__PURE__ */ h("p", null, kind === "shop" ? "\u041E\u0431\u043C\u0435\u043D\u0438\u0432\u0430\u0439 \u0431\u0430\u043B\u043B\u044B ORBIT \u043D\u0430 \u043D\u0430\u0433\u0440\u0430\u0434\u044B \u0441\u0432\u043E\u0435\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430." : kind === "events" ? "\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u043D\u044B\u0435 \u043A\u043B\u0443\u0431\u044B, \u043D\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u043A\u043E\u043C\u0441\u0442\u0432\u0430 \u0438 \u043E\u0431\u0449\u0438\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F." : kind === "universities" ? "\u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438, \u043A \u043A\u043E\u0442\u043E\u0440\u044B\u043C \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0434\u043E\u0440\u043E\u0433\u0443 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439." : kind === "videos" ? "\u0412\u0438\u0434\u0435\u043E \u0438 \u043D\u0430\u0433\u043B\u044F\u0434\u043D\u044B\u0435 \u0443\u0440\u043E\u043A\u0438 \u0434\u043B\u044F \u043D\u043E\u0432\u043E\u0433\u043E \u0432\u0437\u0433\u043B\u044F\u0434\u0430 \u043D\u0430 \u044F\u0437\u044B\u043A." : "\u041D\u0430\u0433\u0440\u0430\u0434\u044B, \u0441\u043E\u0431\u044B\u0442\u0438\u044F, \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u044B \u0438 \u0432\u0438\u0434\u0435\u043E \u2014 \u043F\u043E\u0434 \u0442\u0432\u043E\u0438\u043C \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C.")), /* @__PURE__ */ h(ObjectArt, { kind: kind === "shop" ? "orb" : kind === "videos" ? "play" : "star" })), kind === "shop" && /* @__PURE__ */ h("div", { className: "oc-wallet" }, /* @__PURE__ */ h(Icon, { name: "coin", size: 22 }), /* @__PURE__ */ h("span", null, "\u0422\u0432\u043E\u0439 \u0431\u0430\u043B\u0430\u043D\u0441"), /* @__PURE__ */ h("b", null, format(stats.coins)), /* @__PURE__ */ h("small", null, "Orbit coins")), isAdmin && /* @__PURE__ */ h("div", { className: "oc-row oc-catalog-actions" }, /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => setCreate(!create) }, create ? "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0440\u043C\u0443" : "+ \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B"), /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => setView(view === "all" ? "orders" : "all") }, view === "all" ? "\u0412\u044B\u0434\u0430\u0447\u0430 \u043D\u0430\u0433\u0440\u0430\u0434" : "\u041A\u0430\u0442\u0430\u043B\u043E\u0433")), /* @__PURE__ */ h(Notice, { error, message }), create && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h(Form, { fields: [{ name: "kind", label: "\u0422\u0438\u043F", type: "select", options: Object.entries(labels) }, { name: "title", label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", required: true, maxLength: 160 }, { name: "description", label: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", type: "textarea", wide: true, required: true, maxLength: 3e3 }, { name: "url", label: "HTTPS-\u0441\u0441\u044B\u043B\u043A\u0430 (\u0434\u043B\u044F \u0432\u0438\u0434\u0435\u043E \u0438\u043B\u0438 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430)", type: "url", wide: true, maxLength: 2e3 }, { name: "cost", label: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043D\u0430\u0433\u0440\u0430\u0434\u044B \u0432 \u0431\u0430\u043B\u043B\u0430\u0445 ORBIT", type: "number", min: 0, defaultValue: 0 }, { name: "stock", label: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043D\u0430\u0433\u0440\u0430\u0434", type: "number", min: 0, defaultValue: 1 }, { name: "date", label: "\u0414\u0430\u0442\u0430 / \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F", maxLength: 40 }], onSubmit: async (values) => {
      await api2("/api/campus/catalog", values);
      await refresh();
      setCreate(false);
    }, label: "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u0442\u044C \u0432 \u0446\u0435\u043D\u0442\u0440\u0435" })), view === "orders" ? /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u0412\u044B\u0434\u0430\u0447\u0430 \u043D\u0430\u0433\u0440\u0430\u0434"), info?.orders.length ? info.orders.map((o) => /* @__PURE__ */ h("div", { className: "oc-order-row", key: o.id }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, o.title), /* @__PURE__ */ h("p", null, o.user_name, " \xB7 ", o.cost, " \u0431\u0430\u043B\u043B\u043E\u0432 \xB7 ", { requested: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u0432\u044B\u0434\u0430\u0447\u0438", fulfilled: "\u0412\u044B\u0434\u0430\u043D\u043E", cancelled: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E" }[o.status])), o.status === "requested" && /* @__PURE__ */ h("div", { className: "oc-row" }, /* @__PURE__ */ h("button", { className: "os-secondary", onClick: () => action("/api/campus/shop/status", { id: o.id, status: "fulfilled" }) }, "\u0412\u044B\u0434\u0430\u043D\u043E"), /* @__PURE__ */ h("button", { className: "oc-link", onClick: () => action("/api/campus/shop/status", { id: o.id, status: "cancelled" }) }, "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0438 \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0431\u0430\u043B\u043B\u044B")))) : /* @__PURE__ */ h("p", null, "\u0417\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u043D\u0430 \u043D\u0430\u0433\u0440\u0430\u0434\u044B \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.")) : /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("div", { className: "oc-catalog-grid" }, items.map((item, i) => /* @__PURE__ */ h("section", { key: item.id, className: "oc-catalog-item " + (!item.active ? "is-inactive" : "") }, /* @__PURE__ */ h("div", { className: "oc-catalog-art" }, /* @__PURE__ */ h(ObjectArt, { kind: item.kind === "reward" ? ["book", "star", "headphones", "orb"][i % 4] : item.kind === "video" ? "play" : item.kind === "event" ? "trophy" : "book" }), /* @__PURE__ */ h("span", { className: "os-tag" }, labels[item.kind])), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("h3", null, item.title), /* @__PURE__ */ h("p", { className: "os-prewrap" }, item.description), item.date && /* @__PURE__ */ h("small", null, item.date), item.kind === "reward" ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("b", { className: "oc-item-cost" }, /* @__PURE__ */ h(Icon, { name: "coin", size: 18 }), format(item.cost), /* @__PURE__ */ h("small", null, "Orbit coins")), account.user.role === "student" && /* @__PURE__ */ h("button", { className: "os-primary", disabled: stats.coins < item.cost, onClick: () => action("/api/campus/shop/redeem", { itemId: item.id }) }, "\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043D\u0430\u0433\u0440\u0430\u0434\u0443")) : item.kind === "event" ? /* @__PURE__ */ h("button", { className: "os-primary", disabled: info.registered.includes(item.id), onClick: () => action("/api/campus/events/book", { eventId: item.id }) }, info.registered.includes(item.id) ? "\u0422\u044B \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u2713" : "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F") : item.url ? /* @__PURE__ */ h("a", { href: item.url, target: "_blank", rel: "noopener noreferrer", className: "os-secondary" }, item.kind === "video" ? "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0438\u0434\u0435\u043E" : "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0430\u0439\u0442", " \u2197") : null, isAdmin && /* @__PURE__ */ h("button", { className: "oc-link oc-archive", onClick: () => action("/api/campus/catalog/status", { id: item.id, active: !item.active }) }, item.active ? "\u0421\u043A\u0440\u044B\u0442\u044C" : "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u0442\u044C"))))), !items.length && kind !== "videos" && /* @__PURE__ */ h(Empty, { title: kind === "shop" ? "\u0422\u0432\u043E\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043D\u0430\u0433\u0440\u0430\u0434\u0430 \u0441\u043A\u043E\u0440\u043E \u0437\u0434\u0435\u0441\u044C." : "\u041A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F.", detail: isAdmin ? "\u0414\u043E\u0431\u0430\u0432\u044C \u043F\u0435\u0440\u0432\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B. \u041E\u043D \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0443 \u0432\u0441\u0435\u0445 \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432 \u0446\u0435\u043D\u0442\u0440\u0430." : "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0434\u043E\u0431\u0430\u0432\u0438\u0442 \u0441\u044E\u0434\u0430 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0438 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u0442\u0432\u043E\u0435\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430." }), kind === "videos" && /* @__PURE__ */ h("div", { className: "oc-native-videos" }, /* @__PURE__ */ h(SectionTitle, { title: "ORBIT visual lessons", caption: "\u041F\u043E\u043D\u044F\u0442\u043D\u044B\u0435 \u0438\u0434\u0435\u0438. \u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0435 \u0438\u0441\u0442\u043E\u0440\u0438\u0438. \u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430." }), /* @__PURE__ */ h("div", { className: "oc-library-grid" }, [["Present Simple", "\u041C\u0438\u0440 \u043F\u0440\u0438\u0432\u044B\u0447\u0435\u043A", "grammar"], ["Present Continuous", "\u0412 \u043C\u043E\u043C\u0435\u043D\u0442\u0435", "grammar"], ["Stories worth reading", "\u041D\u0430\u0445\u043E\u0434\u0438 \u0441\u043C\u044B\u0441\u043B", "reading"]].map(([title, desc, section], i) => /* @__PURE__ */ h("button", { className: "oc-motion-lesson", key: title, onClick: () => setVideo(i) }, /* @__PURE__ */ h(Landscape, { variant: i }), /* @__PURE__ */ h(Icon, { name: "play", size: 36 }), /* @__PURE__ */ h("h3", null, title), /* @__PURE__ */ h("p", null, desc))))), kind === "shop" && info?.orders.length > 0 && /* @__PURE__ */ h("section", { className: "os-card" }, /* @__PURE__ */ h("h3", null, "\u041C\u043E\u0438 \u043D\u0430\u0433\u0440\u0430\u0434\u044B"), info.orders.map((o) => /* @__PURE__ */ h("div", { className: "oc-order-row", key: o.id }, /* @__PURE__ */ h("b", null, o.title), /* @__PURE__ */ h("span", null, { requested: "\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u0432\u044B\u0434\u0430\u0447\u0438", fulfilled: "\u0412\u044B\u0434\u0430\u043D\u043E \u2713", cancelled: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E \xB7 \u0431\u0430\u043B\u043B\u044B \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u044B" }[o.status]))))), video !== null && /* @__PURE__ */ h(VisualLesson, { lesson: visualLessons[video], onGo, onClose: () => setVideo(null) }));
  }
  function Messages({ account, onDone }) {
    const [info, setInfo] = useState(null), [recipient, setRecipient] = useState(""), [error, setError] = useState("");
    const bottom = useRef(null);
    const refresh = useCallback(() => api2("/api/campus/messages").then(setInfo), []);
    useEffect(() => {
      refresh().catch((e) => setError(e.message));
      const timer = setInterval(refresh, 6e3);
      return () => clearInterval(timer);
    }, []);
    useEffect(() => {
      if (recipient) {
        api2("/api/campus/messages/read", { senderId: recipient }).then(onDone).catch(() => {
        });
        bottom.current?.scrollIntoView({ block: "nearest" });
      }
    }, [recipient, info?.messages.length]);
    const partner = info?.contacts.find((p) => p.id === recipient);
    return /* @__PURE__ */ h("div", { className: "oc-messages" }, /* @__PURE__ */ h("aside", null, /* @__PURE__ */ h("h2", null, "Messages"), /* @__PURE__ */ h("p", null, "\u0423\u0447\u0438\u0442\u044C\u0441\u044F \u043F\u0440\u043E\u0449\u0435, \u043A\u043E\u0433\u0434\u0430 \u043C\u043E\u0436\u043D\u043E \u0441\u043F\u0440\u043E\u0441\u0438\u0442\u044C."), info?.contacts.map((p) => /* @__PURE__ */ h("button", { key: p.id, onClick: () => setRecipient(p.id), className: p.id === recipient ? "is-active" : "" }, /* @__PURE__ */ h(Avatar, { person: p, small: true }), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, p.firstName, " ", p.lastName), /* @__PURE__ */ h("small", null, roles[p.role]))))), /* @__PURE__ */ h("section", null, /* @__PURE__ */ h(Notice, { error }), partner ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("header", null, /* @__PURE__ */ h(Avatar, { person: partner, small: true }), /* @__PURE__ */ h("b", null, partner.firstName, " ", partner.lastName)), /* @__PURE__ */ h("div", { className: "oc-message-thread" }, info.messages.filter((m) => m.sender_id === recipient || m.recipient_id === recipient).map((m) => /* @__PURE__ */ h("div", { key: m.id, className: "oc-message-bubble " + (m.sender_id === account.user.userId ? "is-own" : "") }, /* @__PURE__ */ h("p", null, m.body), /* @__PURE__ */ h("small", null, new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), m.sender_id === account.user.userId && m.read_at ? " \xB7 \u041F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043E" : ""))), /* @__PURE__ */ h("span", { ref: bottom })), /* @__PURE__ */ h(Form, { key: recipient + ":" + info.messages.length, fields: [{ name: "body", label: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435", type: "textarea", wide: true, required: true, maxLength: 3e3, rows: 2 }], onSubmit: async (values) => {
      await api2("/api/campus/messages", { ...values, recipientId: recipient });
      await refresh();
    }, label: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C" })) : /* @__PURE__ */ h(Empty, { title: "\u041D\u0430\u0447\u043D\u0438 \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440", detail: "\u0412\u044B\u0431\u0435\u0440\u0438 \u0443\u0447\u0438\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E. \u0417\u0434\u0435\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u0441\u044F \u0432\u0430\u0448\u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F." })));
  }
  function Service({ type, account, onClose, onGame }) {
    const [message, setMessage] = useState("");
    if (type === "mock") {
      onGame("mock");
      return null;
    }
    return /* @__PURE__ */ h(Modal, { title: type === "referral" ? "Invite a friend" : "Enrollment letter", onClose }, /* @__PURE__ */ h("div", { className: "oc-service-intro" }, /* @__PURE__ */ h(ObjectArt, { kind: type === "referral" ? "orb" : "book" }), /* @__PURE__ */ h("h3", null, type === "referral" ? "\u0425\u043E\u0440\u043E\u0448\u0438\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u043B\u0443\u0447\u0448\u0435 \u0434\u0435\u043B\u0438\u0442\u044C." : "\u0422\u0432\u043E\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u0432 ORBIT."), /* @__PURE__ */ h("p", null, type === "referral" ? "\u041F\u0440\u0438\u0433\u043B\u0430\u0441\u0438 \u0434\u0440\u0443\u0433\u0430 \u0443\u0437\u043D\u0430\u0442\u044C \u043E \u0446\u0435\u043D\u0442\u0440\u0435. \u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043F\u043E\u043C\u043E\u0436\u0435\u0442 \u0441 \u0437\u0430\u043F\u0438\u0441\u044C\u044E \u0438 \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442." : "\u0417\u0430\u043F\u0440\u043E\u0441\u0438 \u0443 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F. \u0423\u043A\u0430\u0436\u0438, \u0434\u043B\u044F \u0447\u0435\u0433\u043E \u043D\u0443\u0436\u0435\u043D \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0438 \u043D\u0430 \u043A\u0430\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435.")), /* @__PURE__ */ h(Notice, { message }), /* @__PURE__ */ h(Form, { fields: type === "referral" ? [{ name: "body", label: "\u041A\u043E\u0433\u043E \u0445\u043E\u0447\u0435\u0448\u044C \u043F\u0440\u0438\u0433\u043B\u0430\u0441\u0438\u0442\u044C?", type: "textarea", required: true, wide: true, placeholder: "\u0418\u043C\u044F \u0434\u0440\u0443\u0433\u0430 \u0438 \u0443\u0434\u043E\u0431\u043D\u044B\u0439 \u0441\u043F\u043E\u0441\u043E\u0431 \u0441\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u0442\u043E\u0431\u043E\u0439. \u041A\u043E\u043D\u0442\u0430\u043A\u0442 \u0434\u0440\u0443\u0433\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0439 \u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u0435\u0433\u043E \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u044F.", maxLength: 3e3 }] : [{ name: "body", label: "\u0414\u043B\u044F \u0447\u0435\u0433\u043E \u043D\u0443\u0436\u0435\u043D \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442?", type: "textarea", required: true, wide: true, placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F \u043D\u0430 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435 \u0434\u043B\u044F \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430.", maxLength: 3e3 }], onSubmit: async (values) => {
      await api2("/api/campus/requests", { ...values, kind: type });
      setMessage("\u0417\u0430\u043F\u0440\u043E\u0441 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438. \u041E\u0442\u0432\u0435\u0442 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0432 \u0440\u0430\u0437\u0434\u0435\u043B\u0435 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432.");
    }, label: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441" }));
  }
  function Requests({ account }) {
    const [requests, setRequests] = useState([]), [error, setError] = useState("");
    const refresh = () => api2("/api/campus/requests").then((d) => setRequests(d.requests));
    useEffect(() => {
      refresh().catch((e) => setError(e.message));
    }, []);
    return /* @__PURE__ */ h("div", null, /* @__PURE__ */ h(SectionTitle, { title: "\u0417\u0430\u043F\u0440\u043E\u0441\u044B", caption: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u044F \u0434\u0440\u0443\u0437\u0435\u0439 \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B \u043E\u0431 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0438." }), /* @__PURE__ */ h(Notice, { error }), requests.map((r) => /* @__PURE__ */ h("section", { key: r.id, className: "os-card" }, /* @__PURE__ */ h("span", { className: "os-tag" }, { referral: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0434\u0440\u0443\u0433\u0430", letter: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F", university: "\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442" }[r.kind]), /* @__PURE__ */ h("h3", null, r.user_name), /* @__PURE__ */ h("p", { className: "os-prewrap" }, r.body), r.reply && /* @__PURE__ */ h("div", { className: "os-feedback" }, /* @__PURE__ */ h("b", null, "\u041E\u0442\u0432\u0435\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438"), /* @__PURE__ */ h("p", null, r.reply)), account.user.role === "admin" && /* @__PURE__ */ h(Form, { fields: [{ name: "reply", label: "\u041E\u0442\u0432\u0435\u0442", type: "textarea", required: true, wide: true, maxLength: 3e3 }, { name: "status", label: "\u0421\u0442\u0430\u0442\u0443\u0441", type: "select", options: [["done", "\u0413\u043E\u0442\u043E\u0432\u043E"], ["in_progress", "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"]] }], initial: { reply: r.reply, status: r.status === "new" ? "in_progress" : r.status }, onSubmit: async (values) => {
      await api2("/api/campus/requests/reply", { ...values, id: r.id });
      await refresh();
    }, label: "\u041E\u0442\u0432\u0435\u0442\u0438\u0442\u044C" }))), !requests.length && !error && /* @__PURE__ */ h(Empty, { title: "\u0417\u0430\u043F\u0440\u043E\u0441\u043E\u0432 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442", detail: "\u041E\u0442\u0432\u0435\u0442\u044B \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 \u043D\u0430 \u0442\u0432\u043E\u0438 \u0437\u0430\u043F\u0440\u043E\u0441\u044B \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C." }));
  }
  function App({ Learning, language }) {
    const [account, setAccount] = useState(null), [overview, setOverview] = useState(null), [data, setData] = useState(null), [sessions, setSessions] = useState([]), [progress, setProgress] = useState({ reviews: [], drafts: [], bookmarks: [] }), [view, setView] = useState("home"), [mobile, setMobile] = useState(false), [compact, setCompact] = useState(false), [error, setError] = useState(""), [game, setGame] = useState(""), [service, setService] = useState(""), [voice, setVoice] = useState(false), [group, setGroup] = useState(null), [person, setPerson] = useState(""), [rank, setRank] = useState(null), [notifications, setNotifications] = useState(false);
    const reload = useCallback(async () => {
      const a = await api2("/api/account");
      setAccount(a);
      if (a.user) {
        const [d, o, p, r] = await Promise.all([api2("/api/campus/dashboard"), api2("/api/school/overview"), api2("/api/progress"), api2("/api/campus/ranking")]);
        setData(d);
        setOverview(o);
        setSessions(p.sessions);
        setProgress(p);
        setRank(r.ranking.find((x) => x.id === a.user.userId)?.rank || null);
      } else {
        setData(null);
        setOverview(null);
      }
    }, []);
    const navigate = useCallback((id) => {
      if (!titles[id] && id !== "requests") id = "home";
      setView(id);
      setGroup(null);
      setPerson("");
      setMobile(false);
      setNotifications(false);
      window.location.hash = id;
      window.scrollTo({ top: 0, behavior: "instant" });
      window.speechSynthesis?.cancel();
    }, []);
    useEffect(() => {
      const onHash = () => {
        const v = location.hash.slice(1);
        if (v === "campus-content") return;
        setView(titles[v] || v === "requests" ? v : "home");
        setGroup(null);
        setPerson("");
      };
      onHash();
      const match = location.pathname.match(/^\/people\/([^/]+)$/);
      if (match) {
        setPerson(match[1]);
        setView("account");
      }
      reload().catch((e) => setError(e.message));
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }, []);
    useEffect(() => {
      const context = document.modelContext;
      if (!context?.registerTool) return;
      const controller = new AbortController();
      Promise.resolve(context.registerTool({ name: "navigate_orbit_campus", description: "Open an ORBIT campus section. Does not change any saved records.", inputSchema: { type: "object", properties: { section: { type: "string", enum: Object.keys(titles) } }, required: ["section"], additionalProperties: false }, execute: async (input) => {
        if (!titles[input.section]) throw Error("Unknown section");
        navigate(input.section);
        return { section: input.section };
      } }, { signal: controller.signal })).catch(() => {
      });
      return () => controller.abort();
    }, [navigate]);
    useEffect(() => {
      const media = matchMedia("(max-width:760px)");
      const update = () => setCompact(media.matches);
      update();
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }, []);
    useEffect(() => {
      if (!mobile) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const close = (e) => {
        if (e.key === "Escape") setMobile(false);
      };
      document.addEventListener("keydown", close);
      return () => {
        document.body.style.overflow = previous;
        document.removeEventListener("keydown", close);
      };
    }, [mobile]);
    const save = useCallback(async (payload) => {
      await api2("/api/progress", payload);
      await reload();
    }, [reload]);
    async function logout() {
      try {
        await api2("/api/auth/logout", {});
        setMobile(false);
        setAccount({ user: null, profile: null, googleReady: false });
        setData(null);
        setOverview(null);
        setError("");
        window.location.assign("/#account");
      } catch (e) {
        setError(e.message);
      }
    }
    function openGroup(id, tab = "assignments") {
      setNotifications(false);
      setGroup({ id, tab });
      setPerson("");
      setView("groups");
      setMobile(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    function openPerson(id) {
      setPerson(id);
      setGroup(null);
      setView("account");
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    function openService(id) {
      if (id === "mock") setGame("mock");
      else setService(id);
    }
    if (!account) return /* @__PURE__ */ h("div", { className: "oc-loading" }, /* @__PURE__ */ h(Logo, null), /* @__PURE__ */ h("span", { className: "oc-loading-orb" }), /* @__PURE__ */ h("p", null, error || "\u0421\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0442\u0432\u043E\u044E \u043E\u0440\u0431\u0438\u0442\u0443\u2026"), error && /* @__PURE__ */ h("button", { className: "os-primary", onClick: () => reload().then(() => setError("")).catch((e) => setError(e.message)) }, "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"));
    if (!account.user) return /* @__PURE__ */ h("div", { className: "oc-auth-page" }, /* @__PURE__ */ h("header", null, /* @__PURE__ */ h(Logo, null), /* @__PURE__ */ h("span", null, "YOUR WORLD. IN ENGLISH.")), /* @__PURE__ */ h(Login, { account }), /* @__PURE__ */ h("footer", null, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " ORBIT CAMPUS ", /* @__PURE__ */ h("span", null, "English. A new perspective.")));
    if (!data || !overview) return /* @__PURE__ */ h("div", { className: "oc-loading" }, /* @__PURE__ */ h(Logo, null), /* @__PURE__ */ h("span", { className: "oc-loading-orb" }), /* @__PURE__ */ h("p", null, error || "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0442\u0432\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u2026"));
    const main = [["home", "Home", "home"], ["lessons", "Lessons", "lessons"], ["practice", "Practice", "practice"], ["marks", "Marks", "marks"], ["ranking", "Ranking", "ranking"], ["extra", "Extra lesson", "extra"]];
    const management = account.user.role === "admin" ? [["groups", "\u0413\u0440\u0443\u043F\u043F\u044B", "people"], ["users", "\u0410\u043A\u043A\u0430\u0443\u043D\u0442\u044B", "settings"], ["catalog", "Campus studio", "bag"]] : account.user.role === "teacher" ? [["groups", "\u041C\u043E\u0438 \u0433\u0440\u0443\u043F\u043F\u044B", "people"]] : [];
    const active = view === "homework" ? "lessons" : ["dialogue", "speaking", "pronunciation", "typing"].includes(view) ? "practice" : ["grammar", "vocabulary", "reading", "writing", "listening", "books", "videos"].includes(view) ? "lessons" : view;
    let content;
    const props = { save, sessions, reviews: progress.reviews, drafts: progress.drafts, bookmarks: progress.bookmarks, signedIn: true, navigate, onDraft: (promptId, text) => setProgress((old) => ({ ...old, drafts: [...old.drafts.filter((d) => d.promptId !== promptId), { promptId, text, updatedAt: Date.now() }] })), loaded: true, reload };
    if (person || view === "account") content = /* @__PURE__ */ h(Profile, { key: person || account.user.userId, id: person || account.user.userId, user: account.user, account, reload, onBack: () => navigate("home") });
    else if (group) content = /* @__PURE__ */ h(GroupView, { key: group.id + group.tab, id: group.id, user: account.user, overview, refreshOverview: reload, initialTab: group.tab, onBack: () => {
      setGroup(null);
      setView("groups");
    }, onPerson: openPerson });
    else if (view === "home") content = /* @__PURE__ */ h(Home, { account, data, rank, onGo: navigate, onService: openService, onGroup: openGroup });
    else if (view === "lessons") content = /* @__PURE__ */ h(Lessons, { account, data, sessions, onGo: navigate, onGroup: openGroup });
    else if (view === "practice") content = voice ? /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("button", { className: "oc-back", onClick: () => setVoice(false) }, "\u2190 \u0412\u0441\u0435 \u0441\u043F\u043E\u0441\u043E\u0431\u044B \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438"), /* @__PURE__ */ h(VoiceRoom, { user: account.user })) : /* @__PURE__ */ h(Practice, { onGo: navigate, onGame: setGame, onVoice: () => setVoice(true) });
    else if (view === "marks") content = /* @__PURE__ */ h(Marks, { account, data, onGroup: openGroup });
    else if (view === "ranking") content = /* @__PURE__ */ h(Ranking, { account, data, onPerson: openPerson });
    else if (view === "extra") content = /* @__PURE__ */ h(Extra, { account });
    else if (view === "groups" || view === "homework") content = /* @__PURE__ */ h(Groups, { overview, role: account.user.role, refresh: reload, onOpen: openGroup });
    else if (view === "users") content = account.user.role === "admin" ? /* @__PURE__ */ h(Users, { overview, refresh: reload }) : /* @__PURE__ */ h(Empty, { title: "\u0420\u0430\u0437\u0434\u0435\u043B \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438", detail: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442\u0430\u043C\u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0446\u0435\u043D\u0442\u0440\u0430." });
    else if (view === "people") content = /* @__PURE__ */ h(People, { onPerson: openPerson });
    else if (view === "messages") content = /* @__PURE__ */ h(Messages, { account, onDone: reload });
    else if (view === "requests") content = /* @__PURE__ */ h(Requests, { account });
    else if (["catalog", "shop", "events", "universities", "videos"].includes(view)) content = /* @__PURE__ */ h(Catalog, { key: view, account, kind: view, onGo: navigate, stats: data.stats, onUpdate: reload });
    else content = /* @__PURE__ */ h("div", { className: "oc-learning-engine workspace" }, /* @__PURE__ */ h("button", { className: "oc-back", onClick: () => navigate("lessons") }, "\u2190 Lessons"), /* @__PURE__ */ h(Learning, { key: view, section: view, ...props }));
    return /* @__PURE__ */ h("div", { className: "oc-app " + (mobile ? "oc-menu-open" : "") }, /* @__PURE__ */ h("a", { className: "oc-skip", href: "#campus-content" }, "\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u043C\u043E\u043C\u0443"), mobile && /* @__PURE__ */ h("button", { className: "oc-nav-shade", onClick: () => setMobile(false), "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E" }), /* @__PURE__ */ h("aside", { className: "oc-sidebar", inert: compact && !mobile ? true : void 0, "aria-hidden": compact && !mobile ? true : void 0 }, /* @__PURE__ */ h("button", { className: "oc-brand-button", onClick: () => navigate("home"), "aria-label": "ORBIT \u2014 \u0433\u043B\u0430\u0432\u043D\u0430\u044F" }, /* @__PURE__ */ h(Logo, null), /* @__PURE__ */ h("span", null, "ENGLISH IN MOTION")), /* @__PURE__ */ h("div", { className: "oc-sidebar-divider" }), /* @__PURE__ */ h("span", { className: "oc-sidebar-caption" }, "YOUR SPACE"), /* @__PURE__ */ h("nav", { "aria-label": "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F" }, main.map(([id, label, icon]) => /* @__PURE__ */ h("button", { key: id, className: active === id ? "is-active" : "", onClick: () => navigate(id) }, /* @__PURE__ */ h("span", null, /* @__PURE__ */ h(Icon, { name: icon, size: 19 })), label, active === id && /* @__PURE__ */ h("i", null)))), management.length > 0 && /* @__PURE__ */ h(runtime.Fragment, null, /* @__PURE__ */ h("span", { className: "oc-sidebar-caption oc-manage-caption" }, account.user.role === "admin" ? "CAMPUS MANAGEMENT" : "TEACHER SPACE"), /* @__PURE__ */ h("nav", { "aria-label": "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0446\u0435\u043D\u0442\u0440\u043E\u043C" }, management.map(([id, label, icon]) => /* @__PURE__ */ h("button", { key: id, className: active === id ? "is-active" : "", onClick: () => navigate(id) }, /* @__PURE__ */ h("span", null, /* @__PURE__ */ h(Icon, { name: icon, size: 18 })), label)))), /* @__PURE__ */ h("div", { className: "oc-sidebar-bottom" }, /* @__PURE__ */ h("div", { className: "oc-sidebar-note" }, /* @__PURE__ */ h("div", { className: "oc-sidebar-mini-orbit" }), /* @__PURE__ */ h("span", null, "Small steps.", /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("b", null, "A whole new world."))), /* @__PURE__ */ h("button", { onClick: () => navigate("people") }, /* @__PURE__ */ h(Icon, { name: "people", size: 18 }), "\u041B\u044E\u0434\u0438 \u0446\u0435\u043D\u0442\u0440\u0430"), /* @__PURE__ */ h("button", { onClick: () => navigate("requests") }, /* @__PURE__ */ h(Icon, { name: "file", size: 18 }), "\u0417\u0430\u043F\u0440\u043E\u0441\u044B"), /* @__PURE__ */ h("button", { onClick: logout }, /* @__PURE__ */ h(Icon, { name: "logout", size: 18 }), "Log out"), /* @__PURE__ */ h("small", null, "ORBIT CAMPUS ", /* @__PURE__ */ h("span", null, "1.1")))), /* @__PURE__ */ h("div", { className: "oc-main" }, /* @__PURE__ */ h("header", { className: "oc-topbar" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("button", { className: "oc-menu-button", onClick: () => setMobile(!mobile), "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E" }, /* @__PURE__ */ h(Icon, { name: "menu" })), /* @__PURE__ */ h("span", { className: "oc-topbar-title" }, person ? "Profile" : group ? "My class" : titles[view] || "Requests"), /* @__PURE__ */ h("span", { className: "oc-topbar-subtitle" }, roles[account.user.role])), /* @__PURE__ */ h("div", { className: "oc-topbar-actions" }, language, /* @__PURE__ */ h("button", { className: "oc-icon-button " + (notifications ? "is-active" : ""), "aria-label": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", onClick: () => setNotifications(!notifications) }, /* @__PURE__ */ h(Icon, { name: "bell", size: 19 }), data.assignments.some((a) => a.status === "reviewed") && /* @__PURE__ */ h("i", null)), /* @__PURE__ */ h("button", { className: "oc-icon-button", "aria-label": "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F", onClick: () => navigate("messages") }, /* @__PURE__ */ h(Icon, { name: "chat", size: 19 }), data.unread > 0 && /* @__PURE__ */ h("span", null, data.unread)), /* @__PURE__ */ h("div", { className: "oc-topbar-separator" }), /* @__PURE__ */ h("button", { className: "oc-topbar-profile", "aria-label": "\u041C\u043E\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C", onClick: () => navigate("account") }, /* @__PURE__ */ h(Avatar, { person: account.profile, small: true }), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, account.user.displayName), /* @__PURE__ */ h("small", null, levelName[account.profile.level])), /* @__PURE__ */ h("svg", { width: "12", height: "12", viewBox: "0 0 12 12", "aria-hidden": "true" }, /* @__PURE__ */ h("path", { d: "m3 4 3 3 3-3", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }))))), notifications && /* @__PURE__ */ h("div", { className: "oc-notifications" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("b", null, "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F"), /* @__PURE__ */ h("button", { onClick: () => setNotifications(false), "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }, /* @__PURE__ */ h(Icon, { name: "close", size: 17 }))), data.assignments.slice(0, 5).map((a) => /* @__PURE__ */ h("button", { key: a.id, onClick: () => openGroup(a.group_id) }, /* @__PURE__ */ h(Icon, { name: a.status === "reviewed" ? "check" : "book", size: 20 }), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, a.status === "reviewed" ? "\u0420\u0430\u0431\u043E\u0442\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u0430" : "\u0414\u043E\u043C\u0430\u0448\u043D\u0435\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435"), /* @__PURE__ */ h("small", null, a.title, " \xB7 ", a.status === "reviewed" ? a.score + "/100" : "\u0434\u043E " + date(a.due_at))))), !data.assignments.length && /* @__PURE__ */ h("p", null, "\u041F\u043E\u043A\u0430 \u0432\u0441\u0451 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E. \u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C."), data.unread > 0 && /* @__PURE__ */ h("button", { onClick: () => navigate("messages") }, /* @__PURE__ */ h(Icon, { name: "chat" }), /* @__PURE__ */ h("span", null, "\u041D\u043E\u0432\u044B\u0445 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439: ", data.unread))), /* @__PURE__ */ h("main", { className: "oc-content os-portal", id: "campus-content", tabIndex: "-1" }, /* @__PURE__ */ h(Notice, { error }), content)), game && /* @__PURE__ */ h(Game, { mode: game, onClose: () => setGame(""), onDone: reload }), service && /* @__PURE__ */ h(Service, { type: service, account, onClose: () => setService(""), onGame: setGame }));
  }
  return App;
}
function orbitCampus(runtime, React, props) {
  if (!cache.has(runtime)) cache.set(runtime, createApp(runtime, React));
  return runtime.jsx(cache.get(runtime), props);
}

// design/interface.jsx
function factory2(runtime) {
  return (type, props, ...children) => {
    const { key, ...rest } = props || {};
    return runtime.jsxs(type, { ...rest, ...children.length ? { children: children.length === 1 ? children[0] : children } : {} }, key);
  };
}
function copy(locale) {
  const english = locale === "en";
  const uzbek = locale === "uz";
  return (ru, en, uz) => english ? en : uzbek ? uz || ru : ru;
}
function orbitHeader(runtime, React, { view, navigate, locale, language, name }) {
  const h = factory2(runtime);
  const c = copy(locale);
  React.useEffect(() => mountMotion(), []);
  const sections = [
    ["homework", c("\u0414\u043E\u043C\u0430\u0448\u043D\u0435\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435", "Homework", "Uy vazifasi"), "01"],
    ["grammar", c("\u0413\u0440\u0430\u043C\u043C\u0430\u0442\u0438\u043A\u0430", "Grammar", "Grammatika"), "02"],
    ["vocabulary", c("\u0421\u043B\u043E\u0432\u0430\u0440\u043D\u044B\u0439 \u0437\u0430\u043F\u0430\u0441", "Vocabulary", "So\u2018z boyligi"), "03"],
    ["reading", c("\u0427\u0442\u0435\u043D\u0438\u0435", "Reading", "O\u2018qish"), "04"],
    ["speaking", c("\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u043D\u0430\u044F \u0441\u0442\u0443\u0434\u0438\u044F", "Speaking studio", "Suhbat studiyasi"), "05"],
    ["listening", c("\u0410\u0443\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435", "Listening", "Tinglash"), "06"],
    ["writing", c("\u0421\u0442\u0443\u0434\u0438\u044F \u043F\u0438\u0441\u044C\u043C\u0430", "Writing studio", "Yozish studiyasi"), "07"],
    ["books", c("\u041A\u043D\u0438\u0436\u043D\u0430\u044F \u043F\u043E\u043B\u043A\u0430", "Bookshelf", "Kitob javoni"), "08"],
    ["typing", c("\u0422\u0440\u0435\u043D\u0430\u0436\u0451\u0440 \u043F\u0435\u0447\u0430\u0442\u0438", "Typing studio", "Yozish mashqi"), "09"],
    ["translator", c("\u041F\u0435\u0440\u0435\u0432\u043E\u0434\u0447\u0438\u043A", "Translator", "Tarjimon"), "10"],
    ["progress", c("\u041C\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441", "My progress", "Natijalarim"), "11"]
  ];
  const go = (id, event) => {
    event?.currentTarget.closest("details")?.removeAttribute("open");
    navigate(id);
  };
  return /* @__PURE__ */ h("header", { className: "orbit-header", "data-view": view }, /* @__PURE__ */ h("div", { className: "orbit-header-inner" }, /* @__PURE__ */ h("button", { className: "orbit-wordmark", "aria-label": c("ORBIT \u2014 \u0433\u043B\u0430\u0432\u043D\u0430\u044F", "ORBIT \u2014 home", "ORBIT \u2014 bosh sahifa"), onClick: () => navigate("home") }, /* @__PURE__ */ h("svg", { viewBox: "0 0 40 40", "aria-hidden": "true" }, /* @__PURE__ */ h("circle", { cx: "20", cy: "20", r: "9" }), /* @__PURE__ */ h("ellipse", { cx: "20", cy: "20", rx: "18", ry: "7", transform: "rotate(-35 20 20)" }), /* @__PURE__ */ h("circle", { className: "orbit-mark-dot", cx: "33", cy: "9", r: "3" })), /* @__PURE__ */ h("span", null, "orbit", /* @__PURE__ */ h("span", { className: "orbit-logo-period" }, "."))), /* @__PURE__ */ h("nav", { className: "orbit-navigation", "aria-label": c("\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F", "Main navigation", "Asosiy navigatsiya") }, /* @__PURE__ */ h("button", { className: view === "home" ? "is-active" : "", onClick: () => navigate("home") }, c("\u041E\u0431\u0437\u043E\u0440", "Discover", "Umumiy")), /* @__PURE__ */ h("details", { className: "orbit-nav-menu" }, /* @__PURE__ */ h("summary", { className: !["home", "account", "progress"].includes(view) ? "is-active" : "" }, c("\u041F\u0440\u0430\u043A\u0442\u0438\u043A\u0430", "Practice", "Mashqlar"), /* @__PURE__ */ h("svg", { viewBox: "0 0 12 12", "aria-hidden": "true" }, /* @__PURE__ */ h("path", { d: "m3 4 3 3 3-3" }))), /* @__PURE__ */ h("div", { className: "orbit-menu-panel" }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, c("\u0422\u0412\u041E\u0401 \u041F\u0420\u041E\u0421\u0422\u0420\u0410\u041D\u0421\u0422\u0412\u041E", "YOUR SPACE", "SENING MAKONING")), sections.map(([id, label, number]) => /* @__PURE__ */ h("button", { key: id, className: view === id ? "is-active" : "", onClick: (event) => go(id, event) }, /* @__PURE__ */ h("span", null, number), label)))), /* @__PURE__ */ h("button", { className: view === "account" ? "is-active" : "", onClick: () => navigate("account") }, c("\u041C\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442", "My campus", "Mening kabinetim"))), /* @__PURE__ */ h("div", { className: "orbit-header-actions" }, language, /* @__PURE__ */ h("button", { className: "orbit-account-button", onClick: () => navigate("account") }, name || c("\u0412\u043E\u0439\u0442\u0438", "Sign in", "Kirish")))));
}
function orbitHome(runtime, React, { setView, locale, today = 0, goal = 3 }) {
  const h = factory2(runtime);
  const c = copy(locale);
  const skills = [
    { id: "grammar", number: "01", name: c("\u0413\u0440\u0430\u043C\u043C\u0430\u0442\u0438\u043A\u0430", "Grammar", "Grammatika"), title: c("\u0421\u043C\u044B\u0441\u043B.\n\u0412 \u043A\u0430\u0436\u0434\u043E\u0439 \u0444\u0440\u0430\u0437\u0435.", "Meaning.\nIn every sentence.", "Har bir gapda\nma\u2019no."), detail: c("\u041F\u043E\u0439\u043C\u0438 \u043B\u043E\u0433\u0438\u043A\u0443 \u044F\u0437\u044B\u043A\u0430.", "Understand the logic of language.", "Til mantiqini tushun."), kind: "grammar", art: "Aa" },
    { id: "vocabulary", number: "02", name: c("\u0421\u043B\u043E\u0432\u0430\u0440\u044C", "Vocabulary", "Lug\u2018at"), title: c("\u041D\u0430\u0439\u0434\u0438\n\u0441\u0432\u043E\u0438 \u0441\u043B\u043E\u0432\u0430.", "Find\nyour words.", "O\u2018z so\u2018zlaringni\ntop."), detail: c("\u0414\u043B\u044F \u0442\u043E\u0433\u043E, \u0447\u0442\u043E \u0432\u0430\u0436\u043D\u043E \u0442\u0435\u0431\u0435.", "For the things that matter to you.", "Sen uchun muhim narsalar."), kind: "words", art: "possibility" },
    { id: "speaking", number: "03", name: c("\u0420\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u043D\u0430\u044F \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430", "Speaking", "Suhbat"), title: c("\u0422\u0432\u043E\u0439 \u0433\u043E\u043B\u043E\u0441.\n\u0411\u0435\u0437 \u0433\u0440\u0430\u043D\u0438\u0446.", "Your voice.\nWithout limits.", "Ovozing.\nChegarasiz."), detail: c("\u041F\u0443\u0441\u0442\u044C \u0442\u0435\u0431\u044F \u0443\u0441\u043B\u044B\u0448\u0430\u0442.", "Let the world hear you.", "Dunyo seni eshitsin."), kind: "voice" },
    { id: "reading", number: "04", name: c("\u0427\u0442\u0435\u043D\u0438\u0435", "Reading", "O\u2018qish"), title: c("\u0411\u043E\u043B\u044C\u0448\u0435,\n\u0447\u0435\u043C \u0441\u043B\u043E\u0432\u0430.", "More\nthan words.", "So\u2018zlardan\nko\u2018proq."), detail: c("\u0418\u0441\u0442\u043E\u0440\u0438\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0442 \u043C\u0438\u0440.", "Stories that open up the world.", "Dunyoni ochadigan hikoyalar."), kind: "reading", art: "Once\nupon\na time." },
    { id: "listening", number: "05", name: c("\u0410\u0443\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435", "Listening", "Tinglash"), title: c("\u041F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0439\n\u0440\u0438\u0442\u043C \u044F\u0437\u044B\u043A\u0430.", "Feel the rhythm\nof language.", "Til ohangini\nhis qil."), detail: c("\u0416\u0438\u0432\u0430\u044F \u0440\u0435\u0447\u044C. \u041D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0435 \u0434\u0438\u0430\u043B\u043E\u0433\u0438.", "Real voices. Real conversations.", "Jonli nutq. Haqiqiy suhbatlar."), kind: "listening" },
    { id: "writing", number: "06", name: c("\u041F\u0438\u0441\u044C\u043C\u043E", "Writing", "Yozish"), title: c("\u041C\u044B\u0441\u043B\u0438,\n\u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0437\u0432\u0443\u0447\u0430\u0442.", "Thoughts\nthat resonate.", "Jaranglaydigan\nfikrlar."), detail: c("\u0412\u044B\u0440\u0430\u0437\u0438 \u0442\u043E, \u0447\u0442\u043E \u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0435\u0448\u044C.", "Express what you feel.", "Hislaringni ifoda et."), kind: "writing", art: "Dear world," }
  ];
  return /* @__PURE__ */ h("div", { className: "orbit-home" }, /* @__PURE__ */ h("section", { className: "orbit-hero", "aria-labelledby": "orbit-hero-title" }, /* @__PURE__ */ h("div", { className: "orbit-hero-copy" }, /* @__PURE__ */ h("div", { className: "orbit-hero-kicker" }, /* @__PURE__ */ h("span", { className: "orbit-kicker-line" }), c("\u041D\u041E\u0412\u0410\u042F \u0422\u041E\u0427\u041A\u0410 \u041E\u0422\u0421\u0427\u0401\u0422\u0410", "A NEW POINT OF VIEW", "YANGI BOSHLANISH NUQTASI")), /* @__PURE__ */ h("h1", { id: "orbit-hero-title" }, c("\u0422\u0432\u043E\u0439 \u043C\u0438\u0440.", "Your world.", "Sening dunyong."), /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, c("\u041D\u0430 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u043C.", "In English.", "Ingliz tilida."))), /* @__PURE__ */ h("p", { className: "orbit-hero-description" }, c("\u041D\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u0443\u0447\u0438\u0442\u044C \u044F\u0437\u044B\u043A.", "More than learning a language.", "Til o\u2018rganishdan ko\u2018proq."), /* @__PURE__ */ h("br", null), c("\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0441\u0435\u0431\u044F \u2014 \u0441 \u043A\u0430\u0436\u0434\u044B\u043C \u0441\u043B\u043E\u0432\u043E\u043C.", "Discovering yourself, one word at a time.", "Har bir so\u2018z bilan o\u2018zingni kashf et.")), /* @__PURE__ */ h("div", { className: "orbit-hero-buttons" }, /* @__PURE__ */ h("button", { className: "orbit-button orbit-button-dark", onClick: () => setView("homework") }, c("\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435", "Begin your journey", "Sayohatni boshlash")), /* @__PURE__ */ h("button", { className: "orbit-film-button", "data-orbit-action": "intro" }, /* @__PURE__ */ h("span", { className: "orbit-play-symbol" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 18 18", "aria-hidden": "true" }, /* @__PURE__ */ h("path", { d: "m6 4 8 5-8 5Z" }))), c("\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0438\u043D\u0442\u0440\u043E", "Watch the film", "Introni ko\u2018rish"))), /* @__PURE__ */ h("div", { className: "orbit-hero-footnote" }, c("\u0412 \u0442\u0432\u043E\u0451\u043C \u0440\u0438\u0442\u043C\u0435. \u0412 \u0442\u0432\u043E\u0435\u0439 \u043E\u0440\u0431\u0438\u0442\u0435.", "Your pace. Your orbit.", "Sening ritming. Sening orbitang."))), /* @__PURE__ */ h("div", { className: "orbit-hero-art" }, /* @__PURE__ */ h("div", { className: "orbit-art-halo" }), /* @__PURE__ */ h("img", { className: "orbit-sphere", src: "/orbit-sphere.svg", alt: "", width: "800", height: "800", fetchPriority: "high" }), /* @__PURE__ */ h("div", { className: "orbit-art-coordinate" }, "ORBIT / ENGLISH IN MOTION"), /* @__PURE__ */ h("button", { className: "orbit-hello", "aria-label": c("\u041F\u043E\u0441\u043B\u0443\u0448\u0430\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u043D\u043E\u0448\u0435\u043D\u0438\u0435 Hello", "Listen to Hello", "Hello talaffuzini tinglash"), "data-orbit-action": "hello" }, /* @__PURE__ */ h("span", { className: "orbit-hello-icon" }, /* @__PURE__ */ h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ h("path", { d: "m4 10 4 0 5-4v12l-5-4H4Z" }), /* @__PURE__ */ h("path", { d: "M16 9a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" }))), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, "Hello."), /* @__PURE__ */ h("small", null, "/h\u0259\u02C8l\u0259\u028A/")), /* @__PURE__ */ h("span", { className: "orbit-hello-label" }, c("\u0412\u0441\u0451 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C", "It all starts here", "Hammasi shu yerdan boshlanadi")))), /* @__PURE__ */ h("div", { className: "orbit-hero-bottom" }, /* @__PURE__ */ h("span", null, "ENGLISH. A NEW PERSPECTIVE."), /* @__PURE__ */ h("span", null, c("\u041B\u0438\u0441\u0442\u0430\u0439. \u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0439.", "Scroll. Discover.", "Kashf et."), /* @__PURE__ */ h("svg", { viewBox: "0 0 18 24", "aria-hidden": "true" }, /* @__PURE__ */ h("rect", { x: "4", y: "2", width: "10", height: "19", rx: "5" }), /* @__PURE__ */ h("path", { d: "M9 6v4" }))))), /* @__PURE__ */ h("section", { className: "orbit-explore", id: "orbit-explore", "aria-labelledby": "orbit-explore-title" }, /* @__PURE__ */ h("div", { className: "orbit-section-heading", "data-orbit-reveal": true }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "orbit-overline" }, c("\u0412\u0415\u0421\u042C \u042F\u0417\u042B\u041A. \u0422\u0412\u041E\u042F \u041E\u0420\u0411\u0418\u0422\u0410.", "ONE LANGUAGE. YOUR ORBIT.", "BIR TIL. SENING ORBITANG.")), /* @__PURE__ */ h("h2", { id: "orbit-explore-title" }, c("\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u0448\u0430\u0433\u0438.", "Small steps.", "Kichik qadamlar."), /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, c("\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u043D\u043E\u0432\u044B\u0439 \u043C\u0438\u0440.", "A whole new world.", "Butunlay yangi dunyo.")))), /* @__PURE__ */ h("p", null, c("\u0428\u0435\u0441\u0442\u044C \u043D\u0430\u0432\u044B\u043A\u043E\u0432. \u0411\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E \u043C\u043D\u043E\u0433\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0435\u0439.\n\u0412\u044B\u0431\u0435\u0440\u0438, \u0447\u0442\u043E \u0445\u043E\u0447\u0435\u0448\u044C \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F.", "Six skills. Endless possibilities.\nChoose what you want to discover today.", "Olti ko\u2018nikma. Cheksiz imkoniyatlar.\nBugun nimani kashf etmoqchisan?"))), /* @__PURE__ */ h("div", { className: "orbit-skills" }, skills.map((skill) => /* @__PURE__ */ h("button", { key: skill.id, className: "orbit-skill orbit-skill-" + skill.kind, onClick: () => setView(skill.id), "data-orbit-reveal": true }, /* @__PURE__ */ h("div", { className: "orbit-skill-top" }, /* @__PURE__ */ h("span", null, skill.name), /* @__PURE__ */ h("span", null, skill.number)), /* @__PURE__ */ h("div", { className: "orbit-skill-art orbit-skill-art-" + skill.kind, "aria-hidden": "true" }, skill.art && /* @__PURE__ */ h("span", null, skill.art), skill.kind === "words" && /* @__PURE__ */ h("div", { className: "orbit-mini-sphere" }), ["voice", "listening"].includes(skill.kind) && /* @__PURE__ */ h("div", { className: "orbit-wave" }, Array.from({ length: 25 }, (_, i) => /* @__PURE__ */ h("i", { key: i, style: { "--bar": i, "--height": 20 + Math.pow(Math.sin(i * 1.7), 2) * 75 + "%" } }))), skill.kind === "writing" && /* @__PURE__ */ h("div", { className: "orbit-writing-lines" }, /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null), /* @__PURE__ */ h("i", null))), /* @__PURE__ */ h("div", { className: "orbit-skill-copy" }, /* @__PURE__ */ h("h3", null, skill.title), /* @__PURE__ */ h("p", null, skill.detail), /* @__PURE__ */ h("span", { className: "orbit-skill-plus", "aria-hidden": "true" }, "+")))))), /* @__PURE__ */ h("section", { className: "orbit-cinema", "data-orbit-reveal": true }, /* @__PURE__ */ h("div", { className: "orbit-cinema-art", "aria-hidden": "true" }, /* @__PURE__ */ h("div", { className: "orbit-cinema-orb" }), /* @__PURE__ */ h("div", { className: "orbit-cinema-ring" }), /* @__PURE__ */ h("div", { className: "orbit-cinema-ring orbit-cinema-ring-two" })), /* @__PURE__ */ h("div", { className: "orbit-cinema-copy" }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, c("\u0422\u042B \u041C\u041E\u0416\u0415\u0428\u042C \u0411\u041E\u041B\u042C\u0428\u0415", "THERE IS MORE TO YOU", "SEN KO\u2018PROG\u2018IGA QODIRSAN")), /* @__PURE__ */ h("h2", null, c("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043B\u043E\u0432\u043E.", "First, a word.", "Avval bir so\u2018z."), /* @__PURE__ */ h("br", null), c("\u041F\u043E\u0442\u043E\u043C \u2014 \u0446\u0435\u043B\u044B\u0439 \u043C\u0438\u0440.", "Then, a whole world.", "Keyin \u2014 butun dunyo.")), /* @__PURE__ */ h("p", null, c("\u041D\u043E\u0432\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F. \u041D\u043E\u0432\u0430\u044F \u0432\u0441\u0442\u0440\u0435\u0447\u0430. \u041D\u043E\u0432\u0430\u044F \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C.\n\u0422\u0432\u043E\u0439 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u0438\u0439 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441 \u0442\u0435\u0431\u044F.", "A new story. A new connection. A new possibility.\nYour English begins with you.", "Yangi hikoya. Yangi uchrashuv. Yangi imkoniyat.\nIngliz tiling sendan boshlanadi.")), /* @__PURE__ */ h("button", { className: "orbit-button orbit-button-white", onClick: () => setView("speaking") }, c("\u041D\u0430\u0439\u0442\u0438 \u0441\u0432\u043E\u0439 \u0433\u043E\u043B\u043E\u0441", "Find your voice", "O\u2018z ovozingni top")))), /* @__PURE__ */ h("section", { className: "orbit-daily", "data-orbit-reveal": true }, /* @__PURE__ */ h("div", { className: "orbit-section-heading" }, /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("span", { className: "orbit-overline" }, c("\u0421\u0415\u0413\u041E\u0414\u041D\u042F \u2014 \u0425\u041E\u0420\u041E\u0428\u0418\u0419 \u0414\u0415\u041D\u042C", "TODAY IS A GOOD DAY", "BUGUN AJOYIB KUN")), /* @__PURE__ */ h("h2", null, c("15 \u043C\u0438\u043D\u0443\u0442.", "15 minutes.", "15 daqiqa."), /* @__PURE__ */ h("br", null), /* @__PURE__ */ h("span", null, c("\u0422\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0442\u0435\u0431\u044F.", "Just for you.", "Faqat sen uchun.")))), /* @__PURE__ */ h("div", { className: "orbit-daily-goal" }, /* @__PURE__ */ h("span", null, c("\u0422\u0432\u043E\u044F \u0434\u043D\u0435\u0432\u043D\u0430\u044F \u0446\u0435\u043B\u044C", "Your daily goal", "Kunlik maqsading")), /* @__PURE__ */ h("b", null, today, /* @__PURE__ */ h("small", null, " / ", goal)), /* @__PURE__ */ h("div", null, /* @__PURE__ */ h("i", { style: { width: Math.min(100, today / Math.max(1, goal) * 100) + "%" } })), /* @__PURE__ */ h("small", null, c("\u041D\u0435 \u0441\u043F\u0435\u0448\u0438. \u041F\u0440\u043E\u0441\u0442\u043E \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439.", "No rush. Just keep going.", "Shoshilma. Davom et.")))), /* @__PURE__ */ h("div", { className: "orbit-daily-items" }, [["01", "grammar", c("\u0420\u0430\u0437\u0431\u0435\u0440\u0438\u0441\u044C \u0432 Present Simple", "Discover Present Simple", "Present Simple bilan tanish"), c("\u041F\u043E\u043D\u044F\u0442\u044C. \u041F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C. \u0417\u0430\u043F\u043E\u043C\u043D\u0438\u0442\u044C.", "Understand. Try. Remember.", "Tushun. Sinab ko\u2018r. Eslab qol.")], ["02", "vocabulary", c("\u041D\u0430\u0439\u0434\u0438 5 \u043D\u043E\u0432\u044B\u0445 \u0441\u043B\u043E\u0432", "Find 5 new words", "5 ta yangi so\u2018z top"), c("\u0414\u043B\u044F \u0442\u0432\u043E\u0435\u0433\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0440\u0430\u0437\u0433\u043E\u0432\u043E\u0440\u0430.", "For your next conversation.", "Keyingi suhbating uchun.")], ["03", "speaking", c("\u0420\u0430\u0441\u0441\u043A\u0430\u0436\u0438 \u043C\u0438\u0440\u0443 \u043E \u0441\u0435\u0431\u0435", "Tell the world about yourself", "Dunyoga o\u2018zing haqingda ayt"), c("\u0422\u0432\u043E\u044F \u043F\u0435\u0440\u0432\u0430\u044F \u0438\u0441\u0442\u043E\u0440\u0438\u044F \u043D\u0430 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u043C.", "Your first story in English.", "Ingliz tilidagi ilk hikoyang.")]].map(([number, id, title, description]) => /* @__PURE__ */ h("button", { key: id, className: "orbit-daily-item", onClick: () => setView(id) }, /* @__PURE__ */ h("span", { className: "orbit-daily-number" }, number), /* @__PURE__ */ h("span", null, /* @__PURE__ */ h("b", null, title), /* @__PURE__ */ h("small", null, description)), /* @__PURE__ */ h("span", { className: "orbit-daily-time" }, "5 ", c("\u043C\u0438\u043D", "min", "daq")), /* @__PURE__ */ h("span", { className: "orbit-daily-plus", "aria-hidden": "true" }, "+"))))), /* @__PURE__ */ h("section", { className: "orbit-extra", "data-orbit-reveal": true }, /* @__PURE__ */ h("button", { onClick: () => setView("books") }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, c("\u041A\u041D\u0418\u0416\u041D\u0410\u042F \u041F\u041E\u041B\u041A\u0410", "YOUR BOOKSHELF", "KITOB JAVONING")), /* @__PURE__ */ h("h3", null, c("\u041E\u0440\u0438\u0433\u0438\u043D\u0430\u043B.\n\u0421\u043E\u0432\u0441\u0435\u043C \u0434\u0440\u0443\u0433\u043E\u0439 \u0432\u0437\u0433\u043B\u044F\u0434.", "The original.\nA different perspective.", "Asl nusxa.\nYangi nigoh.")), /* @__PURE__ */ h("p", null, c("\u0427\u0438\u0442\u0430\u0439 \u043B\u044E\u0431\u0438\u043C\u044B\u0435 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043D\u0430 \u044F\u0437\u044B\u043A\u0435 \u0430\u0432\u0442\u043E\u0440\u0430.", "Read great stories in the author\u2019s own words.", "Hikoyalarni muallif tilida o\u2018qi.")), /* @__PURE__ */ h("span", { className: "orbit-extra-art", "aria-hidden": "true" }, "a", /* @__PURE__ */ h("br", null), "story."), /* @__PURE__ */ h("span", { className: "orbit-skill-plus", "aria-hidden": "true" }, "+")), /* @__PURE__ */ h("button", { onClick: () => setView("typing") }, /* @__PURE__ */ h("span", { className: "orbit-overline" }, c("\u041D\u0410\u0419\u0414\u0418 \u0421\u0412\u041E\u0419 FLOW", "FIND YOUR FLOW", "O\u2018Z RITMINGNI TOP")), /* @__PURE__ */ h("h3", null, c("\u0414\u0443\u043C\u0430\u0439.\n\u041F\u0435\u0447\u0430\u0442\u0430\u0439. \u0427\u0443\u0432\u0441\u0442\u0432\u0443\u0439.", "Think.\nType. Feel.", "O\u2018yla.\nYoz. His qil.")), /* @__PURE__ */ h("p", null, c("\u0416\u0438\u0432\u044B\u0435 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0432 \u0442\u0432\u043E\u0451\u043C \u0440\u0438\u0442\u043C\u0435.", "Real expressions. Your rhythm.", "Jonli iboralar. Sening ritming.")), /* @__PURE__ */ h("div", { className: "orbit-keys", "aria-hidden": "true" }, /* @__PURE__ */ h("i", null, "H"), /* @__PURE__ */ h("i", null, "e"), /* @__PURE__ */ h("i", null, "l"), /* @__PURE__ */ h("i", null, "l"), /* @__PURE__ */ h("i", null, "o")), /* @__PURE__ */ h("span", { className: "orbit-skill-plus", "aria-hidden": "true" }, "+"))), /* @__PURE__ */ h("footer", { className: "orbit-footer" }, /* @__PURE__ */ h("button", { className: "orbit-wordmark", "aria-label": "ORBIT", onClick: () => setView("home") }, /* @__PURE__ */ h("span", null, "orbit.")), /* @__PURE__ */ h("p", null, c("\u0422\u0432\u043E\u0439 \u043C\u0438\u0440 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0431\u043E\u043B\u044C\u0448\u0435.", "Your world is getting bigger.", "Dunyong kengaymoqda.")), /* @__PURE__ */ h("span", null, "\xA9 2026 ORBIT"), /* @__PURE__ */ h("button", { className: "orbit-footer-replay", "data-orbit-action": "intro" }, c("\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0438\u043D\u0442\u0440\u043E \u0435\u0449\u0451 \u0440\u0430\u0437", "Watch the film again", "Introni yana ko\u2018rish"))), /* @__PURE__ */ h("dialog", { id: "orbit-intro", className: "orbit-intro", "aria-label": c("\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 ORBIT", "Welcome to ORBIT", "ORBITga xush kelibsiz") }, /* @__PURE__ */ h("div", { className: "orbit-intro-stage" }, /* @__PURE__ */ h("img", { src: "/orbit-sphere.svg", alt: "", className: "orbit-intro-orb" }), /* @__PURE__ */ h("span", { className: "orbit-intro-brand" }, "ORBIT PRESENTS"), /* @__PURE__ */ h("div", { className: "orbit-intro-frame orbit-intro-frame-one" }, /* @__PURE__ */ h("span", null, c("\u0412\u0441\u0451 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F", "It all begins", "Hammasi boshlanadi")), /* @__PURE__ */ h("span", null, c("\u0441 \u043E\u0434\u043D\u043E\u0433\u043E \u0441\u043B\u043E\u0432\u0430.", "with a single word.", "bitta so\u2018zdan."))), /* @__PURE__ */ h("div", { className: "orbit-intro-frame orbit-intro-frame-two" }, "Hello", /* @__PURE__ */ h("span", null, ".")), /* @__PURE__ */ h("div", { className: "orbit-intro-frame orbit-intro-frame-three" }, /* @__PURE__ */ h("span", null, c("\u0410 \u0434\u0430\u043B\u044C\u0448\u0435 \u2014", "And then \u2014", "Keyin esa \u2014")), /* @__PURE__ */ h("span", null, c("\u0446\u0435\u043B\u044B\u0439 \u043C\u0438\u0440.", "a whole new world.", "butun dunyo."))), /* @__PURE__ */ h("div", { className: "orbit-intro-track" }, /* @__PURE__ */ h("i", null)), /* @__PURE__ */ h("button", { className: "orbit-intro-skip", "data-orbit-action": "skip" }, c("\u041F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C", "Skip intro", "O\u2018tkazib yuborish")))));
}
export {
  orbitAccountGuest,
  orbitCampus,
  orbitGrammar,
  orbitHeader,
  orbitHome,
  orbitSchool
};
