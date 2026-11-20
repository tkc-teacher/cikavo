/* Клавіатурні перегони — дані гри: тексти заїздів, етапи й слова Автошколи, нікнейми суперників, символи тренування.
   Підключається в index.html перед основним скриптом; тут лише дані, без логіки.
   Слова можна додавати й прибирати вільно. Не міняти: порядок пар у ABC_STAGES (номер етапу — прогрес гравця). */

/* ================= Тексти ================= */
// Слова лише з літер основного ряду (ФІВА ПР ОЛДЖЄ / ASDF G H JKL)
const TEXTS = {
  uk:{
    // Парк розваг (молодша школа): короткі слова лише з основного ряду, малими літерами
    tiny:['дід','два','від','рід','рів','лід','дар','жар','лад','пар','віл','вал','ода','вода','лава','ліва','пара','рада',
          'лапа','фара','дало','рало','папа','двір','ліпа','жало'],
    home:['два','дід','вода','лава','пара','двір','ліпа','фара','рада','права','лапа','відро','жало','діра','водопад',
          'папір','лід','овал','оладі','радів','жар','дрова','ода','поділ','плід','провід','дало'],
    words:['кіт','сонце','миша','файл','папка','екран','клавіша','школа','урок','друг','книга','місто','весна','ранок',
           'хмара','річка','зошит','олівець','пісня','вікно','принтер','мережа','пароль','браузер','курсор','сайт','робот',
           'ракета','планета','зірка','дельфін','їжак','щастя','юнак','мрія','гра','код','піксель','дані','текст','кнопка','монітор'],
    sentences:['Клавіатура допомагає швидко вводити текст.','Миша та клавіатура є пристроями введення.',
           'Друкуй усіма десятьма пальцями.','Дивись на екран і не підглядай на клавіші.','Надійний пароль довгий і складний.',
           'Тиха вода греблю рве.','Повторення мати навчання.','Наш робот вчиться друкувати без помилок.',
           'Принтер друкує текст на папері.','Файли зберігаються в папках.','Не відкривай листи від незнайомців.',
           'Монітор показує зображення.','Без праці не виловиш і рибки зі ставка.','Терпіння і праця все перетруть.',
           'Інформатика вчить думати логічно.','Зберігай роботу кожні кілька хвилин.']
  },
  en:{
    tiny:['as','dad','sad','lad','add','ask','gas','had','has','all','fall','hall','flag','glad','lag','ash','dash','half','gala','lass'],
    home:['dad','sad','lad','add','ask','glass','flask','salad','hall','fall','all','gas','flag','half','shall','dash',
          'glad','has','had','lash','flash','gala','lag'],
    words:['cat','sun','mouse','file','folder','screen','key','school','friend','book','robot','rocket','planet','star',
           'music','window','printer','network','password','browser','cursor','game','apple','river','cloud','pixel',
           'code','data','button','monitor','text','zebra','quiz','jump','yellow','happy'],
    sentences:['Practice makes perfect.','My robot can type very fast.','The mouse and the keyboard are input devices.',
           'Save your work every few minutes.','A strong password is long and secret.','The printer puts text on paper.',
           'Every file lives in a folder.','Slow and steady wins the race.','Look at the screen and not at the keys.',
           'Computers help us learn new things.','Keep your fingers on the home row.'],
    // Речення з розділовими знаками . , - ( ) " ! ? @ ' : — для змагання «Слалом знаків»
    punct:['Hi, Anna! Can you send me the file?','My e-mail is robot@school.ua: write to me!',
           "Don't forget: save your work (every few minutes)!",'"Ready?" asked the robot. "Go!"',
           "It's a mouse, not a cat (a computer mouse)!",'Write to help@lab.org - or ask the teacher.',
           'Is it a mouse, a keyboard, or a printer?',"Let's race: you, me, and the robot!",
           "Tom's laptop isn't new, but it's fast.",'Is this link safe? Check it: look at the address!',
           'Sam asked: "Where is my folder?"','Ready, steady - go!','Click "Save" (or press the keys).',
           "We're online: kate@mail.com, max@mail.com.",'Oops! Wrong key - try again.',
           'Wow! The robot is fast, but you are faster.',"Where's my mouse? (It's under the book!)",
           'Note: the password is secret - never share it!','Ann wrote: "See you at school!"',
           "My login is anna_k@mail.com - don't tell anyone!",'What is a file? It is a box for data.',
           'Hello, world! Hello, robot!',"Is it raining? Yes, it is - take your umbrella!",
           'Max said: "I can type with ten fingers!"',"First, open the browser; then, type the address."]
  }
};

/* ================= Автошкола: літери додаються поступово ================= */
// Етапи — пари літер: спершу основний ряд від вказівних пальців, далі найчастіші літери верхнього й нижнього рядів
const ABC_STAGES = {
  uk:['ао','вл','ід','фж','пр','ен','кг','ти','уш','мь','сб','цщ','зє','яч','юй','хї'],
  en:['fj','dk','sl','ah','ge','ri','tn','ou','cm','wy','pb','vx','qz']
};
// Справжні слова для етапів (до них додаються слова з TEXTS); у заїзд беруться лише ті, що складаються з уже вивчених літер
const ABC_WORDS = {
  uk:`вал віл лава вола ліва ліво дід два дві від лід дало вода діва долі ода дол жало жила ждав жав фол фал
      пар рад рід рів дар жар лад рада пара фара папа лапа ліпа двір рало дрова права поділ плід провід папір відро радів оладі
      день дерево не на він вона воно вони ріпа ріка рано неділя дорога поле лен оренда
      нога ганок ніготь книга кеди кадр око рука гора горіх гра голова дні дно рік кіно кран гарно
      тато тітка кіт кит вітер літо тепло тиша ракета плита пірат тир тінь риба
      уроки тиша шапка каша наша ваша шкіра шлях вуха шум друг дуже уважно шина
      мама мій сім мало малина мир мова мед мені сіль тінь біль день кінь пень лось
      сова сад сік сон сир сила бал біла білка банан бобер сніг собака сестра слон суп сусід білий баба
      цукор цибуля цвіт щастя щука щоки ящик кущ плащ цирк вулиця сонце щітка цвях
      зима зошит зуб коза завжди їжак є єнот зелений знову зірка зебра
      яблуко я ячмінь час чай чашка чорний чотири учень червоний ягода яма ясно
      юла юнак юшка йога мій твій край гай чайник мрія
      хата хліб холод хмара їжа їде їсти хвіст хор хлопчик дах`,
  en:`jaffa fed dad sad lad add ask all fall hall flag glad lag ash dash half gala lass has had
      fall kid did skid dill silk lid lid
      he she held shed head hedge egg leg seal sell shall
      red ride rise fire hire his her girl grid fries
      ten tent net nest hint tin then this that the train treat sent
      out our four sun run fun round house hot note shout
      cat come cool camp milk mice mouse moon music
      way why yes you yard wow window yellow
      play puppy pen bed bag bus bear best boy
      very van seven box six fox next
      quiz quick queen zoo zebra lazy`
};

// Суперники: на кожен заїзд — випадковий нікнейм (український чи англійський — за мовою заїзду)
const RIVALS = {   // короткі (до 9 літер), щоб табличка над транспортом на старті не виходила за трасу
  uk:['Блискавка','Турбо','Їжачок','Совеня','Пікселько','Метеорит','Комета','Зайчик','Білочка','Котик','Вареник','Пробіл',
      'Ніндзя','Шустрик','Байт','Лисичка','Курсор','Дракончик','Вітерець','Хмаринка','Бджілка','Капітан','Мишка','Ведмедик'],
  en:['Speedy','Turbo','Panda','Koala','Hippo','Zoom','Lucky','Buzzy','Comet','Jaguar','Snail','Mouse','Owl','Shark','Pixel','Tiger']
};

/* ================= Тренування: символи ================= */
// Символи. Як набрати — рахується з розкладок (TRAIN_NUM + LAYOUTS): на картці — потрібна клавіша серед сусідніх, з Shift, якщо треба.
// Символів, яких у розкладці немає (@ в українській, № в англійській), там не показуємо.
// Порядок — групами: розділові знаки, дужки, математичні, інші. Прогрес — за самим знаком, тож порядок можна міняти
const SYMBOLS = [
  // розділові знаки
  { c:'.', name:'крапка' }, { c:',', name:'кома' }, { c:'!', name:'знак оклику' }, { c:'?', name:'знак питання' },
  { c:':', name:'двокрапка' }, { c:';', name:'крапка з комою' }, { c:'-', name:'дефіс' }, { c:'"', name:'лапки' },
  { c:"'", name:'апостроф', alt:['’','ʼ'] },
  // дужки
  { c:'(', name:'дужка' }, { c:')', name:'дужка' }, { c:'[', name:'квадратна дужка' }, { c:']', name:'квадратна дужка' },
  { c:'{', name:'фігурна дужка' }, { c:'}', name:'фігурна дужка' },
  // математичні
  { c:'+', name:'плюс' }, { c:'=', name:'дорівнює' }, { c:'*', name:'зірочка (множення)' }, { c:'/', name:'скісна риска (ділення)' },
  { c:'%', name:'відсоток' }, { c:'<', name:'менше' }, { c:'>', name:'більше' }, { c:'^', name:'«дашок»' },
  // інші
  { c:'@', name:'«собачка»' }, { c:'#', name:'решітка' }, { c:'№', name:'номер' }, { c:'&', name:'амперсанд («і»)' },
  { c:'$', name:'долар' }, { c:'_', name:'підкреслення' }, { c:'\\', name:'зворотна скісна риска' }, { c:'|', name:'вертикальна риска' },
  { c:'~', name:'тильда' }, { c:'`', name:'зворотний апостроф' }
];
