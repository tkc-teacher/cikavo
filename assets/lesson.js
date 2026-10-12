/* Ядро інтерактивного уроку.
   Дає уроку: HUD з лічильником нейрончиків, облік блоків (смужка ліворуч), стандартні механіки,
   фінальний тест з екраном завершення (купка нейрончиків, діаграми), посилання з результатами
   на спільну сторінку result/ і самоперевірку для _tools/check-lessons.py.

   Новий урок — з шаблону _tools/lesson-template/index.html; правила — CLAUDE.md, розділ 3.
   Урок лежить на два рівні нижче кореня сайту ({клас}/{урок}/index.html):
     <link rel="stylesheet" href="../../assets/lesson.css">
     <body data-lesson="lesson7-cloud-services" data-hud="7 клас · Хмарні сервіси">
       ... hero, <div class="container"> секції-кроки з .step-label ... </div>, <footer> ...
       <script src="../../assets/lesson.js"></script>
       <script> makeMatching(...); ...; makeFinalQuiz('finalQuiz', [...], {summary:'…'}); </script>

   Для уроку доступні: addNeurons, stepTask, trackTask, shuffle, loadPic, makeChoices, makeClassify, makeYesNo,
   makeMatching, makeSortBoard, makeSequence, makeFinalQuiz. Власна вправа уроку підключається через trackTask. */
(()=>{
'use strict';

const body = document.body;
const LESSON_ID = body.dataset.lesson || location.pathname;
const STORAGE_KEY = LESSON_ID + '-neurons';
const SALT = 'cikavo·131';            // має збігатися з result/index.html
const SVGNS = 'http://www.w3.org/2000/svg';

// Іконка нейрончика (жовта, як у лічильнику HUD) — розмітка однакова в усіх уроках
const NEURON_SVG = `
  <line x1="16.2" y1="12" x2="20.3" y2="12" stroke="#FFC93C" stroke-width="1.6" stroke-linecap="round"/><circle cx="20.3" cy="12" r="1.2" fill="#FFC93C"/>
  <line x1="14.1" y1="15.6" x2="16.6" y2="20" stroke="#FFC93C" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.6" cy="20" r="1.2" fill="#FFC93C"/>
  <line x1="9.9" y1="15.6" x2="7.4" y2="20" stroke="#FFC93C" stroke-width="1.6" stroke-linecap="round"/><circle cx="7.4" cy="20" r="1.2" fill="#FFC93C"/>
  <line x1="7.8" y1="12" x2="3.7" y2="12" stroke="#FFC93C" stroke-width="1.6" stroke-linecap="round"/><circle cx="3.7" cy="12" r="1.2" fill="#FFC93C"/>
  <line x1="9.9" y1="8.4" x2="7.4" y2="4" stroke="#FFC93C" stroke-width="1.6" stroke-linecap="round"/><circle cx="7.4" cy="4" r="1.2" fill="#FFC93C"/>
  <line x1="14.1" y1="8.4" x2="16.6" y2="4" stroke="#FFC93C" stroke-width="1.6" stroke-linecap="round"/><circle cx="16.6" cy="4" r="1.2" fill="#FFC93C"/>
  <circle cx="12" cy="12" r="4.4" fill="#FFC93C"/><circle cx="12" cy="12" r="1.6" fill="#E0A800" opacity="0.6"/>`;
const LINK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
  <path d="M10 7.5H7a4.5 4.5 0 0 0 0 9h3"/><path d="M14 7.5h3a4.5 4.5 0 0 1 0 9h-3"/><path d="M8.5 12h7"/></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

const pct = (a, b)=>b ? Math.min(100, Math.round(a / b * 100)) : 0;
// текст підпису з пробілами між частинами (<span>Крок 1</span>Назва → «Крок 1 Назва»)
const label = el=>el ? [...el.childNodes].map(n=>n.textContent).join(' ').replace(/\s+/g, ' ').trim() : '';
const shuffle = arr=>[...arr].sort(()=>Math.random() - 0.5);


/* ---------- HUD І НЕЙРОНЧИКИ ---------- */
body.insertAdjacentHTML('afterbegin', `
  <div class="hud">
    <div class="hud-bar"><div class="hud-bar-fill"></div></div>
    <div class="hud-row">
      <span class="hud-title"></span>
      <div class="neuron-counter"><svg viewBox="0 0 24 24" fill="none">${NEURON_SVG}</svg><span id="neuronCount">0</span></div>
    </div>
  </div>`);
const hud = body.querySelector('.hud');
hud.querySelector('.hud-title').textContent = body.dataset.hud || '';
const hudFill = hud.querySelector('.hud-bar-fill');
const counterEl = hud.querySelector('.neuron-counter');
const neuronEl = hud.querySelector('#neuronCount');

let neurons = 0;
function addNeurons(n){
  neurons += n;
  neuronEl.textContent = neurons;
  neuronEl.classList.add('pop');
  setTimeout(()=>neuronEl.classList.remove('pop'), 250);
  saveProgress();
  summary();
}
// Технічний борг (CLAUDE.md, розділ 10): window.storage є лише в артефактах Claude, на сайті прогрес не зберігається
async function saveProgress(){
  try{ await window.storage?.set(STORAGE_KEY, JSON.stringify({neurons}), false); }catch(e){}
}
async function loadProgress(){
  try{
    const res = await window.storage?.get(STORAGE_KEY, false);
    if(res?.value){ const d = JSON.parse(res.value); if(typeof d.neurons === 'number'){ neurons = d.neurons; neuronEl.textContent = neurons; } }
  }catch(e){}
}
loadProgress();

// Смужка прогресу в HUD прив'язана до прокрутки сторінки
addEventListener('scroll', ()=>{
  const h = document.documentElement;
  hudFill.style.width = Math.min(100, Math.max(0, h.scrollTop / (h.scrollHeight - h.clientHeight) * 100)) + '%';
}, {passive:true});


/* ---------- ОБЛІК БЛОКІВ ----------
   Вправа реєструється через stepTask(елемент, скільки нейрончиків можна отримати, скільки в ній елементів
   [, true — для підсумкового тесту]) і викликає повернуту функцію done(), коли завершена;
   про кожен правильно виконаний елемент (картку, пару, крок) повідомляє через done.item().
   Блок — секція з .step-label; він пройдений, коли завершено всі його вправи (хоча б одна має бути).
   Секція без вправ («Гід», «Цікаво знати») позначається <section data-guide> — вона не рахується як блок. */
const blocks = [...document.querySelectorAll('section')].filter(s=>s.querySelector('.step-label') && !s.hasAttribute('data-guide'));
const tasks = blocks.map(()=>({ total:0, done:0, max:0, items:0, ok:0, quiz:false, finished:false }));

// Смужка ліворуч: висота екрана ділиться на блоки; сірий — не пройдено, зелений — пройдено
const rail = document.createElement('nav');
rail.className = 'lesson-rail';
rail.setAttribute('aria-label', 'Блоки уроку');
blocks.forEach(b=>{
  const btn = document.createElement('button');
  const name = label(b.querySelector('.step-label'));
  btn.setAttribute('aria-label', name);
  btn.innerHTML = '<span class="rail-tip"><span></span><small>ще не пройдено</small></span>';
  btn.querySelector('.rail-tip span').textContent = name;
  btn.addEventListener('click', ()=>b.scrollIntoView({behavior:'smooth'}));
  rail.appendChild(btn);
});
body.appendChild(rail);
const segs = [...rail.children];
const placeRail = ()=>{ rail.style.top = hud.offsetHeight + 'px'; };
addEventListener('resize', placeRail);

function finish(i){
  if(tasks[i].finished) return;
  tasks[i].finished = true;
  segs[i].classList.add('done');
  segs[i].querySelector('small').textContent = 'пройдено ✓';
  summary();
}
function markCurrent(){
  let cur = -1;
  blocks.forEach((b, i)=>{ if(b.getBoundingClientRect().top < innerHeight * 0.4) cur = i; });
  segs.forEach((s, i)=>s.classList.toggle('current', i === cur));
}
addEventListener('scroll', markCurrent, {passive:true});
// після скрипта уроку (DOMContentLoaded настає, коли виконано всі скрипти сторінки)
addEventListener('DOMContentLoaded', ()=>{
  placeRail(); markCurrent();
  tasks.forEach((x, i)=>{ if(!x.total) console.warn('Блок без завдання:', label(blocks[i].querySelector('.step-label'))); });
});

function stepTask(el, max, items, quiz){
  const i = blocks.indexOf(el.closest('section'));
  if(i < 0){ const noop = ()=>{}; noop.item = noop; return noop; }
  const T = tasks[i];
  T.total++; T.max += max; T.items += items;
  if(quiz) T.quiz = true;
  let called = false;
  const done = ()=>{
    if(called) return;
    called = true;
    if(++T.done === T.total) finish(i);
  };
  done.item = ()=>{ T.ok++; };
  return done;
}

// Скорочення для власної вправи уроку: const hit = trackTask(елемент, скільки елементів, максимум нейрончиків);
// hit() — на кожен правильно виконаний елемент; після останнього вправа сама завершується.
// Нейрончики вправа нараховує сама, як і раніше (addNeurons).
function trackTask(el, items, maxNeurons = items){
  const done = stepTask(el, maxNeurons, items);
  let n = 0;
  return ()=>{ if(n >= items) return; done.item(); if(++n === items) done(); };
}


/* ---------- ТОЧНІСТЬ І ЧАС ---------- */
const WRONG = ['wrong','wrong-try','wrong-flash','miss','bad','shake'];
const errs = blocks.map(()=>0);            // помилкові спроби на кожен блок
let quizScore = null, t0 = 0, t1 = 0, action = 0, counted = -1;

// Час рахується від першої дії учня в будь-якому блоці уроку
const touch = e=>{
  action++;
  if(!t0 && blocks.includes(e.target.closest?.('section'))) t0 = Date.now();
};
['pointerdown','keydown','drop'].forEach(t=>document.addEventListener(t, touch, true));

// Помилка — елемент отримав клас на кшталт .wrong; рахуємо одну на дію, у блоці, де вона сталася
new MutationObserver(list=>{
  if(counted === action) return;
  for(const m of list){
    const cl = m.target.classList, was = m.oldValue || '';
    const i = blocks.indexOf(m.target.closest?.('section'));
    if(i >= 0 && WRONG.some(c=>cl?.contains(c) && !was.split(' ').includes(c))){ errs[i]++; counted = action; return; }
  }
}).observe(body, {subtree:true, attributes:true, attributeFilter:['class'], attributeOldValue:true});

// Точність блоку: тест — найкращий результат (не здано — 0%);
// вправи — виконані елементи / (усі елементи + помилкові спроби), тож невиконане рахується як помилка.
// Загальна точність — середнє по всіх блоках.
function accuracy(){
  const per = tasks.map((T, i)=>{
    if(T.quiz) return quizScore ? pct(quizScore[0], quizScore[1]) : 0;
    return T.items ? pct(T.finished ? T.items : Math.min(T.ok, T.items), T.items + errs[i]) : null;
  });
  const vals = per.filter(v=>v !== null);
  return { per, avg: vals.length ? Math.round(vals.reduce((a, b)=>a + b, 0) / vals.length) : 0 };
}


/* ---------- УНІВЕРСАЛЬНІ МЕХАНІКИ ---------- */

// Фото з images/ уроку в контейнер .pic (id або сам елемент); якщо файлу ще немає — емодзі-заглушка
function loadPic(container, file, fallbackEmoji){
  const el = typeof container === 'string' ? document.getElementById(container) : container;
  if(!el) return;
  const img = document.createElement('img');
  img.src = `images/${file}`;
  img.alt = '';
  img.addEventListener('error', ()=>{ el.innerHTML = `<div class="fallback">${fallbackEmoji}</div>`; });
  el.innerHTML = '';
  el.appendChild(img);
}

// Картки з варіантами відповіді: items — [{text, opts:[...], correct, why?, hint?, logo?, pre?}]
// logo — файл .svg з images/ уроку або емодзі; pre (або snippet) — розмітка над запитанням (напр. фрагмент листа);
// hint — підказка після хибної відповіді; {col:true} — варіанти стовпчиком (клас .choice-row.col задає урок)
function makeChoices(containerId, items, {col = false} = {}){
  const list = document.getElementById(containerId);
  const done = stepTask(list, items.length, items.length);
  let left = items.length;
  items.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'classify-card';
    const pic = item.logo ? (item.logo.endsWith('.svg') ? `<img class="q-logo" src="images/${item.logo}" alt="">` : `<span class="q-emoji">${item.logo}</span>`) : '';
    card.innerHTML = (item.pre || item.snippet || '') + (pic ? `<div class="q-head">${pic}<p class="q">${item.text}</p></div>` : `<p class="q">${item.text}</p>`) + `<div class="choice-row${col ? ' col' : ''}"></div><div class="choice-feedback"></div>`;
    const row = card.querySelector('.choice-row');
    const fb = card.querySelector('.choice-feedback');
    let answered = false;
    item.opts.forEach((opt, i)=>{
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = opt;
      btn.addEventListener('click', ()=>{
        if(answered) return;
        if(i === item.correct){
          btn.classList.add('correct');
          answered = true;
          fb.textContent = 'Правильно ✓ ' + (item.why || '');
          addNeurons(1);
          done.item();
          if(--left === 0) done();
        } else {
          btn.classList.add('wrong');
          fb.textContent = item.hint || 'Ще раз подумай';
        }
      });
      row.appendChild(btn);
    });
    list.appendChild(card);
  });
}

// Однакові варіанти для всіх карток: items — [{text, correct, why?}], opts — [...]
function makeClassify(containerId, items, opts){
  makeChoices(containerId, items.map(it=>({...it, opts: it.opts || opts})));
}

// Так / Ні: items — [{text, correct:true|false, why?}]
function makeYesNo(containerId, items, optYes = 'Так', optNo = 'Ні'){
  makeChoices(containerId, items.map(it=>({...it, opts:[optYes, optNo], correct: it.correct ? 0 : 1})));
}

// Зіставлення «термін ↔ пояснення»: pairs — [{name, desc, icon?}] (desc можна назвати func або def);
// progressId — необов'язковий рядок «Зіставлено: N з M»; onDone — що зробити, коли всі пари знайдено
// (можна передати замість bonus: makeMatching(pool, list, pairs, progress, ()=>…))
function makeMatching(poolId, listId, pairs, progressId, bonus = 2, onDone){
  if(typeof bonus === 'function'){ onDone = bonus; bonus = 2; }
  pairs = pairs.map(p=>({...p, desc: p.desc ?? p.func ?? p.def}));
  const pool = document.getElementById(poolId);
  const list = document.getElementById(listId);
  const progress = progressId ? document.getElementById(progressId) : null;
  const done = stepTask(list, pairs.length + bonus, pairs.length);
  let selected = null, matched = 0;

  function updateProgress(){
    if(progress) progress.textContent = (matched === pairs.length) ? 'Усі пари знайдено ✓' : `Зіставлено: ${matched} з ${pairs.length}`;
  }
  shuffle(pairs).forEach(p=>{
    const chip = document.createElement('div');
    chip.className = 'match-chip';
    chip.innerHTML = (p.icon || '') + p.name;
    chip.addEventListener('click', ()=>{
      if(chip.classList.contains('placed')) return;
      pool.querySelectorAll('.match-chip').forEach(c=>c.classList.remove('selected'));
      chip.classList.add('selected');
      selected = p.name;
    });
    pool.appendChild(chip);
  });
  shuffle(pairs).forEach(p=>{
    const card = document.createElement('div');
    card.className = 'desc-card';
    card.innerHTML = `<div class="desc-text">${p.desc}</div><div class="desc-slot">?</div>`;
    card.addEventListener('click', ()=>{
      if(card.classList.contains('matched') || !selected) return;
      const slot = card.querySelector('.desc-slot');
      if(selected === p.name){
        slot.innerHTML = (p.icon || '') + p.name;
        slot.classList.add('filled');
        card.classList.add('matched');
        const chip = [...pool.children].find(c=>c.textContent.trim() === p.name);
        if(chip) chip.classList.add('placed');
        selected = null;
        matched++; done.item();
        addNeurons(1);
        updateProgress();
        if(matched === pairs.length){ addNeurons(bonus); done(); onDone?.(); }
      } else {
        card.classList.add('shake');
        setTimeout(()=>card.classList.remove('shake'), 350);
      }
    });
    list.appendChild(card);
  });
  updateProgress();
}

// Розкласти по кошиках: bucketMap — {ключ: id кошика або сам елемент}, items — [{text, bucket:ключ}]
// (ключ можна назвати zone); progressId — необов'язковий рядок «Розкладено: N з M»
function makeSortBoard(poolId, bucketMap, items, progressId, bonus = 2){
  items = items.map(it=>({...it, bucket: it.bucket ?? it.zone}));
  const pool = document.getElementById(poolId);
  const progress = progressId ? document.getElementById(progressId) : null;
  const done = stepTask(pool, items.length + bonus, items.length);
  let selected = null, placed = 0;

  function updateProgress(){
    if(progress) progress.textContent = (placed === items.length) ? 'Усе розкладено ✓' : `Розкладено: ${placed} з ${items.length}`;
  }
  shuffle(items).forEach(item=>{
    const chip = document.createElement('div');
    chip.className = 'sort-chip';
    chip.textContent = item.text;
    chip.dataset.bucket = item.bucket;
    chip.addEventListener('click', ()=>{
      if(chip.classList.contains('placed')) return;
      pool.querySelectorAll('.sort-chip').forEach(c=>c.classList.remove('selected'));
      chip.classList.add('selected');
      selected = chip;
    });
    pool.appendChild(chip);
  });
  Object.entries(bucketMap).forEach(([key, target])=>{
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    el.addEventListener('click', ()=>{
      if(!selected) return;
      if(selected.dataset.bucket === key){
        selected.classList.add('placed');
        selected.classList.remove('selected');
        el.querySelector('.bucket-items').appendChild(selected);
        selected = null;
        placed++; done.item();
        addNeurons(1);
        updateProgress();
        if(placed === items.length){ addNeurons(bonus); done(); }
      } else {
        el.classList.add('wrong');
        setTimeout(()=>el.classList.remove('wrong'), 350);
      }
    });
  });
  updateProgress();
}

// Покроковий вибір: «Що робиш ПЕРШИМ?» → «ДРУГИМ?»…; steps — правильний порядок; onDone — після останнього кроку
function makeSequence(doneId, qId, optsId, fbId, steps, finalText, onDone){
  const doneEl = document.getElementById(doneId);
  const qEl = document.getElementById(qId);
  const optsEl = document.getElementById(optsId);
  const fb = document.getElementById(fbId);
  const done = stepTask(optsEl, steps.length + 3, steps.length);
  const ordinals = ['ПЕРШИМ','ДРУГИМ','ТРЕТІМ','ЧЕТВЕРТИМ','П’ЯТИМ','ШОСТИМ','СЬОМИМ'];
  let pos = 0;
  function render(){
    optsEl.innerHTML = '';
    if(pos === steps.length){ qEl.textContent = ''; fb.textContent = finalText; addNeurons(3); done(); onDone?.(); return; }
    qEl.innerHTML = `Що робиш <b>${ordinals[pos]}</b>?`;
    shuffle(steps.slice(pos)).forEach(s=>{
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.textContent = s;
      b.addEventListener('click', ()=>{
        if(s === steps[pos]){
          doneEl.insertAdjacentHTML('beforeend', `<li>${s}</li>`);
          fb.textContent = '';
          pos++; addNeurons(1); done.item();
          render();
        } else { b.classList.add('wrong'); fb.textContent = 'Не зараз — спершу потрібно інше.'; }
      });
      optsEl.appendChild(b);
    });
  }
  render();
}


/* ---------- ФІНАЛЬНИЙ ТЕСТ І ЕКРАН ЗАВЕРШЕННЯ ----------
   makeFinalQuiz(id порожнього div, questions — [{q, opts:[...], correct, why?}], {summary, perCorrect = 2})
   будує тест, а після нього — екран завершення. Тест можна перездати після «Повернутися до уроку»:
   нейрончики даються лише за відповіді понад найкращий результат, бонус +3 — лише за першу спробу.
   Урок без тесту (напр. завершується творчим проєктом): questions = [] — замість тесту кнопка «Завершити урок». */
let fin = null;                             // елементи екрана завершення, коли тест побудовано

const donutFig = (cls, title, sub)=>`
  <figure class="donut ${cls}">
    <div class="donut-ring"><svg viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="42"/><circle class="val" cx="50" cy="50" r="42"/></svg><b></b></div>
    <figcaption>${title}<small>${sub}</small></figcaption>
  </figure>`;

function makeFinalQuiz(containerId, questions, {summary:text = '', perCorrect = 2} = {}){
  const root = document.getElementById(containerId);
  const noQuiz = !questions.length;
  root.innerHTML = (noQuiz ? `
    <div class="finish-box"><button class="btn-primary finish-btn">Завершити урок ✓</button></div>` : `
    <div class="quiz-box">
      <div class="quiz-progress"></div>
      <div class="quiz-q"></div>
      <div class="quiz-options"></div>
      <div class="quiz-why"></div>
      <div class="quiz-nav"><button class="btn-next">Далі</button></div>
    </div>`) + `
    <div class="completion">
      <div class="done-top">
        <h3>Урок пройдено!</h3>
        ${text ? `<p>${text}</p>` : ''}
        <div class="pile" aria-hidden="true"></div>
        <div class="pile-total"><b class="pile-count">0</b><span class="pile-word">нейрончиків</span></div>
      </div>
      <div class="done-bottom">
        <div class="donuts">${donutFig('dn-passed', 'Пройдено', '')}${donutFig('dn-accuracy', 'Точність', 'з урахуванням помилок')}</div>
        <div class="done-actions">
          <button class="rs-btn">${LINK_ICON}Поділитися результатами</button>
          <button class="btn-sun">← Повернутися до уроку</button>
        </div>
      </div>
    </div>`;
  const $ = s=>root.querySelector(s);
  const box = $(noQuiz ? '.finish-box' : '.quiz-box'), qEl = $('.quiz-q'), optsEl = $('.quiz-options'), progEl = $('.quiz-progress'), whyEl = $('.quiz-why'), nextBtn = $('.btn-next');
  fin = { root, box, el:$('.completion'), pile:$('.pile'), count:$('.pile-count'), word:$('.pile-word'),
          passed:$('.dn-passed'), acc:$('.dn-accuracy'), share:$('.rs-btn'), section:root.closest('section') };

  if(noQuiz){
    $('.finish-btn').addEventListener('click', ()=>{ t1 = Date.now(); showCompletion(); summary(); });
  }
  const done = noQuiz ? null : stepTask(qEl, questions.length * perCorrect + 3, questions.length, true);
  let qi = 0, answered = false, score = 0, best = 0, attempt = 0;

  function render(){
    answered = false;
    nextBtn.classList.remove('active');
    const item = questions[qi];
    progEl.textContent = `Запитання ${qi + 1} з ${questions.length}`;
    qEl.textContent = item.q;
    whyEl.textContent = '';
    optsEl.innerHTML = '';
    item.opts.forEach((opt, i)=>{
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', ()=>{
        if(answered) return;
        answered = true;
        optsEl.querySelectorAll('.quiz-opt').forEach((ob, oi)=>{
          if(oi === item.correct) ob.classList.add('correct');
          else if(oi === i) ob.classList.add('wrong');
        });
        if(i === item.correct){ score++; if(score > best) addNeurons(perCorrect); }
        if(item.why) whyEl.textContent = (i === item.correct ? '✓ ' : 'Правильну відповідь підсвічено. ') + item.why;
        nextBtn.classList.add('active');
        nextBtn.textContent = (qi === questions.length - 1) ? 'Завершити' : 'Далі';
      });
      optsEl.appendChild(b);
    });
  }
  if(!noQuiz) nextBtn.addEventListener('click', ()=>{
    if(!nextBtn.classList.contains('active')) return;
    qi++;
    if(qi < questions.length){ render(); return; }
    best = Math.max(best, score); attempt++;
    quizScore = [best, questions.length]; t1 = Date.now();
    done();
    showCompletion();
    if(attempt === 1) addNeurons(3);
    summary();
  });

  // Повернення до уроку: тест знову доступний, переходимо до першого непройденого блоку (або до тесту)
  $('.btn-sun').addEventListener('click', ()=>{
    fin.el.classList.remove('show');
    showCounter();
    box.style.display = '';
    if(!noQuiz){ qi = 0; score = 0; render(); }
    const i = tasks.findIndex(x=>!x.finished);
    (i >= 0 ? blocks[i] : fin.section).scrollIntoView({behavior:'smooth'});
  });

  fin.share.addEventListener('click', async ()=>{
    if(!await copyLink()) return;
    fin.share.classList.add('done'); fin.share.innerHTML = CHECK_ICON + 'Посилання скопійоване';
    setTimeout(()=>{ fin.share.classList.remove('done'); fin.share.innerHTML = LINK_ICON + 'Поділитися результатами'; }, 1600);
  });

  if(!noQuiz) render();
  summary();
}

function showCompletion(){
  fin.box.style.display = 'none';
  fin.el.classList.add('show');
}
const showing = ()=>!!fin && fin.el.classList.contains('show');

// Колір від червоного (0%) до зеленого (100%)
const heat = v=>`hsl(${Math.round(v * 1.2)}, 68%, 42%)`;
function setDonut(fig, v, caption){
  const c = fig.querySelector('.val'), C = 2 * Math.PI * 42;
  c.style.strokeDasharray = C;
  c.style.strokeDashoffset = C * (1 - v / 100);
  c.style.stroke = heat(v);
  c.style.opacity = v ? 1 : 0;
  const b = fig.querySelector('b');
  b.textContent = v + '%';
  b.style.color = heat(v);
  if(caption !== undefined) fig.querySelector('small').textContent = caption;
}

// Підсумок на екрані завершення: пройдено, точність, купка
function summary(){
  if(!fin) return;
  const passed = tasks.filter(x=>x.finished).length;
  setDonut(fin.passed, pct(passed, blocks.length), `${passed} з ${blocks.length} блоків`);
  setDonut(fin.acc, accuracy().avg);
  if(showing()) renderPile();
}


/* ---------- КУПКА НЕЙРОНЧИКІВ ----------
   Кожен зароблений нейрончик лягає у випадкове місце, скочується вбік, поки поруч є нижче місце,
   і частково накладається на сусідів — так складається горбик не більший за діаграму (130×130).
   Нові нейрончики вилітають з лічильника в HUD і по прямій летять на своє місце; лічильник при цьому
   зменшується, а після останнього ховається. Після повернення до уроку лічильник з'являється знову, без анімації. */
const PILE_W = 130, PILE_MAX = 130, ICON = 18, COL = 2, SLOPE = 10;
let pileH = [], pileN = 0, landed = 0, flying = 0;
const plural = (n, one, few, many)=>{
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many;
};
function setPileCount(){
  fin.count.textContent = landed;
  fin.word.textContent = plural(landed, 'нейрончик', 'нейрончики', 'нейрончиків');
}
function hideCounter(){ if(showing() && !flying) counterEl.classList.add('gone'); }
function showCounter(){
  counterEl.style.transition = 'none';
  counterEl.classList.remove('gone');
  neuronEl.textContent = neurons;
  counterEl.offsetWidth;                 // застосувати без анімації
  counterEl.style.transition = '';
}
const icon = cls=>{
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.innerHTML = NEURON_SVG;
  if(cls) svg.classList.add(cls);
  return svg;
};

function renderPile(){
  const pileEl = fin.pile;
  const n = Math.max(0, neurons);
  if(n < pileN){ pileEl.innerHTML = ''; pileH = []; pileN = 0; landed = 0; }
  const span = Math.ceil(ICON / COL), half = Math.ceil(span / 2), cols = Math.floor(PILE_W / COL) - span;
  if(!pileH.length) pileH = Array(cols + span).fill(0);
  // нейрончик лягає на середню висоту під собою — частково западає між сусідами
  const top = c=>pileH.slice(c, c + span).reduce((t, h)=>t + h, 0) / span;
  // чим більше нейрончиків, тим щільніше вони лягають, щоб купка лишалась у межах
  const layer = Math.max(2.5, Math.min(8, PILE_W * (PILE_MAX - ICON) * .55 / (Math.max(1, n) * ICON)));
  const fresh = [];
  for(let k = pileN; k < n; k++){
    // ближче до центру падає частіше
    let c = Math.round((Math.random() + Math.random()) / 2 * cols);
    // скочується на пів нейрончика в нижчий бік, поки перепад висот більший за SLOPE
    for(let guard = 0; guard < cols; guard++){
      const here = top(c), l = c - half >= 0 ? top(c - half) : Infinity, r = c + half <= cols ? top(c + half) : Infinity;
      if(here - Math.min(l, r) < SLOPE) break;
      c += (l < r ? -1 : r < l ? 1 : (Math.random() < .5 ? -1 : 1)) * half;
    }
    const y = Math.min(top(c), PILE_MAX - ICON);
    for(let j = c; j < c + span; j++) pileH[j] = Math.max(pileH[j], y + layer);
    const svg = icon();
    svg.style.left = (c * COL / PILE_W * 100) + '%';
    svg.style.bottom = y + 'px';
    svg.style.setProperty('--r', Math.round(Math.random() * 360) + 'deg');
    svg.style.opacity = 0;               // з'явиться, коли долетить
    pileEl.appendChild(svg);
    fresh.push(svg);
  }
  pileN = n;
  pileEl.style.height = Math.min(PILE_MAX, Math.max(40, Math.max(...pileH) + ICON)) + 'px';
  if(!fresh.length){ setPileCount(); hideCounter(); return; }

  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    fresh.forEach(s=>s.style.opacity = '');
    landed += fresh.length; setPileCount(); hideCounter();
    return;
  }
  flying += fresh.length;
  // купка має бути на екрані, щоб було видно, куди летять нейрончики
  const r = pileEl.getBoundingClientRect();
  const visible = r.top >= hud.offsetHeight && r.bottom <= innerHeight;
  if(!visible) pileEl.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(()=>{
    const step = Math.min(45, 2200 / fresh.length);
    fresh.forEach((svg, k)=>setTimeout(()=>fly(svg), k * step));
  }, visible ? 200 : 750);
}
function land(svg){
  svg.style.opacity = '';
  landed++; flying--;
  setPileCount(); hideCounter();
}
function fly(svg){
  // якщо учень уже повернувся до уроку — без польоту
  if(!showing()) return land(svg);
  const from = counterEl.querySelector('svg').getBoundingClientRect();
  const to = svg.getBoundingClientRect();
  const sx = from.left + from.width / 2 - ICON / 2, sy = from.top + from.height / 2 - ICON / 2;
  const tx = to.left + to.width / 2 - ICON / 2, ty = to.top + to.height / 2 - ICON / 2;
  neuronEl.textContent = Math.max(0, (+neuronEl.textContent || 0) - 1);
  const f = icon('flyer');
  body.appendChild(f);
  f.animate([
    {transform:`translate(${sx}px, ${sy}px) scale(1.2) rotate(0deg)`},
    {transform:`translate(${tx}px, ${ty}px) scale(1) rotate(${svg.style.getPropertyValue('--r')})`}
  ], {duration:650 + Math.random() * 200, easing:'cubic-bezier(.5,0,.5,1)'}).onfinish = ()=>{ f.remove(); land(svg); };
}


/* ---------- РЕЗУЛЬТАТ ЗА ПОСИЛАННЯМ ----------
   Учень копіює посилання на спільну сторінку result/, де після «#» закодовано все потрібне:
   назва уроку, клас, блоки з точністю, нейрончики, час. Вчитель відкриває його й бачить картку з результатами —
   сам урок для цього не потрібен. Контрольна сума не дає непомітно змінити числа вручну. */
function sign(str){   // cyrb53
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for(const ch of SALT + str){ const c = ch.codePointAt(0); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function b64url(bytes){
  let bin = '';
  bytes.forEach(b=>bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
// Стискаємо вбудованим у браузер deflate (як gzip, але без заголовків — коротше): «z=…»;
// браузер без CompressionStream передає дані без стиснення: «j=…»
async function pack(str){
  const bytes = new TextEncoder().encode(str);
  if(typeof CompressionStream === 'undefined') return 'j=' + b64url(bytes);
  const z = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();
  return 'z=' + b64url(new Uint8Array(z));
}

// Формат даних (v:1) — його ж читає result/index.html:
// c — клас і тема, t — назва уроку, d — час завершення (секунди), m — хвилин на урок,
// n — [нейрончики, максимум], a — загальна точність,
// b — блоки: [назва, пройдено (1/0), точність або -1, якщо в блоці нічого рахувати], h — контрольна сума
async function makeLink(){
  const end = t1 || Date.now(), A = accuracy();
  const d = {
    v:1,
    c:body.dataset.hud || '',
    t:label(document.querySelector('.hero h1')) || document.title,
    d:Math.round(end / 1000),
    m:t0 ? Math.max(1, Math.round((end - t0) / 60000)) : 0,
    n:[neurons, tasks.reduce((t, x)=>t + x.max, 0)],
    a:A.avg,
    b:blocks.map((sec, i)=>[label(sec.querySelector('.step-label')), tasks[i].finished ? 1 : 0, A.per[i] ?? -1])
  };
  d.h = sign(JSON.stringify(d));
  // урок лежить на два рівні нижче кореня ({клас}/{урок}/), тож спільна сторінка — ../../result/
  const page = new URL('../../result/' + (location.protocol === 'file:' ? 'index.html' : ''), location.href).href;
  return page + '#' + await pack(JSON.stringify(d));
}
async function copyLink(){
  const link = makeLink();
  // ClipboardItem з обіцянкою — щоб Safari не відхилив копіювання через паузу на стиснення
  try{
    await navigator.clipboard.write([new ClipboardItem({'text/plain': link.then(s=>new Blob([s], {type:'text/plain'}))})]);
    return true;
  }catch(e){}
  const str = await link;
  let ok = false;
  try{ await navigator.clipboard.writeText(str); ok = true; }catch(e){}
  if(!ok){   // запасний спосіб — через тимчасове поле
    const ta = document.createElement('textarea');
    ta.value = str; ta.style.cssText = 'position:fixed; opacity:0;';
    body.appendChild(ta); ta.select();
    try{ ok = document.execCommand('copy'); }catch(e){}
    ta.remove();
  }
  if(!ok) prompt('Скопіюй посилання:', str);
  return ok;
}


/* ---------- ВИПАДКОВІ РЕЗУЛЬТАТИ (для самоперевірки) ----------
   Випадково позначає блоки пройденими, нараховує нейрончики й показує екран завершення. */
function simulate(){
  const r = (a, b)=>a + Math.floor(Math.random() * (b - a + 1));
  let target = 0;
  tasks.forEach((T, i)=>{
    const done = T.finished || Math.random() < .7;
    errs[i] = r(0, 3);
    T.ok = done ? T.items : r(0, T.items);
    if(T.quiz) quizScore = done ? [r(Math.ceil(T.items / 2), T.items), T.items] : null;
    target += done ? r(Math.round(T.max * .7), T.max) : r(0, Math.floor(T.max / 2));
    if(done) finish(i);
  });
  t1 = Date.now(); t0 = t1 - r(8, 40) * 60000;
  if(fin) showCompletion();
  addNeurons(target - neurons);         // купка сама прокрутиться на екран і прийме нейрончики
}


/* ---------- САМОПЕРЕВІРКА ----------
   Для _tools/check-lessons.py: з ?selftest урок ловить помилки й попередження, сам «проходить» урок випадково,
   будує посилання з результатами й пише підсумок у document.title («SELFTEST {...}»). */
if(/[?&]selftest\b/.test(location.search)){
  const report = { errors:[], warnings:[] };
  addEventListener('error', e=>report.errors.push(`${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno})`));
  const warn = console.warn;
  console.warn = (...a)=>{ report.warnings.push(a.join(' ')); warn(...a); };
  addEventListener('load', ()=>setTimeout(async ()=>{
    try{ simulate(); }catch(e){ report.errors.push('simulate: ' + e.message); }
    report.blocks = tasks.length;
    report.finished = tasks.filter(x=>x.finished).length;
    report.finalQuiz = !!fin;
    report.neurons = neurons;
    try{ report.link = (await makeLink()).length; }catch(e){ report.errors.push('makeLink: ' + e.message); }
    document.title = 'SELFTEST ' + JSON.stringify(report);
  }, 300));
}


Object.assign(window, { addNeurons, stepTask, trackTask, shuffle, loadPic, makeChoices, makeClassify, makeYesNo, makeMatching, makeSortBoard, makeSequence, makeFinalQuiz });
})();
