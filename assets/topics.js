/* Список тем класу ({N}/index.html): два вигляди й перемикач між ними, як у Google Диску.
   - «Список» — картки тем з рядками уроків (стилі .theme-card/.lesson-row лежать у самій сторінці);
   - «Картки» — теми-острівці з картками уроків: великий значок і коротка назва (стилі — assets/topics.css).

   Як підключити: <link rel="stylesheet" href="../assets/topics.css"> у <head>, у розмітці <div class="container" id="plan"></div>
   (data-view="cards" — якщо за замовчуванням картки; <div id="view-slot"></div> у шапці — туди стане перемикач), далі <script> const PLAN = […] </script>
   і <script src="../assets/topics.js"></script>.

   PLAN — масив семестрів { semester, themes:[…] } або одразу масив тем.
   Тема: { title, hours, short?, icon?, color?, practiceColor?, lessons:[…] } — practiceColor — колір «Практикуємо» (інакше контрастний до color).
   Урок: { title, link?, practice?:{title, link}, test?, short?, icon?, note?, kind? } —
   note — короткий зміст під назвою (лише «Список»), kind: 'practice' | 'project' — бейдж «Практикум» / «Проєкт»;
   icon — ключ SVG-значка з assets/topic-icons.js (підключати перед topics.js) або емодзі;
   short — коротка назва для карток (без неї береться початок title до першої крапки), icon — емодзі картки.
   data-numbering="continuous" на #plan — наскрізна нумерація уроків через усі теми (гурток Python).
   Обраний вигляд пам'ятається лише до закриття вкладки (sessionStorage) — нове відкриття сторінки показує вигляд за замовчуванням. */
(()=>{
  const root = document.getElementById('plan');
  if(!root || typeof PLAN === 'undefined') return;

  const COLORS = ['#2D9CDB', '#16A3A0', '#FF6B4A', '#6C5CE7', '#E2702B', '#D63A84'];
  // «Практикуємо» — контрастний до кольору теми (жовтий, оранжевий чи фіолетовий); текст — темний на світлому, білий на темному
  const PRAC = { '#2D9CDB':'#FFB020', '#16A3A0':'#7B5CE7', '#FF6B4A':'#7B5CE7', '#6C5CE7':'#FFB020', '#E2702B':'#7B5CE7', '#D63A84':'#FFB020', '#3776AB':'#FFD43B' };
  const isLight = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 150; };
  const paint = (el, theme) => {
    const c = themeColor.get(theme), p = theme.practiceColor || PRAC[c.toUpperCase()] || (isLight(c) ? '#7B5CE7' : '#FFB020');
    el.style.setProperty('--c', c);
    el.style.setProperty('--p', p);
    el.style.setProperty('--p-ink', isLight(p) ? '#2B2D42' : '#fff');
  };
  const KEY = 'topics-view:' + location.pathname.replace(/index\.html$/, '');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const shortOf = l => l.short || l.title.split(/\.\s|:\s/)[0];
  // icon — ключ значка з assets/topic-icons.js (SVG) або емодзі
  const LIB = typeof TOPIC_ICONS === 'object' ? TOPIC_ICONS : {};
  const isSvg = k => k && Object.prototype.hasOwnProperty.call(LIB, k);
  const iconHTML = k => isSvg(k) ? LIB[k] : k;

  const KIND = { practice: 'Практикум', project: 'Проєкт' };
  const kindHTML = (l, cls) => l.kind && KIND[l.kind] ? `<span class="${cls} ${l.kind}">${KIND[l.kind]}</span>` : '';

  const sems = PLAN.length && PLAN[0].themes ? PLAN : [{ themes: PLAN }];
  const themes = sems.flatMap(sem => sem.themes);
  const isEmpty = !themes.length;
  // колір теми — свій (color) або по черзі з COLORS
  const themeColor = new Map(themes.map((th, i) => [th, th.color || COLORS[i % COLORS.length]]));
  // номер уроку: у межах теми або наскрізний (data-numbering="continuous")
  const continuous = root.dataset.numbering === 'continuous';
  const numbers = new Map();
  { let n = 0; themes.forEach(th => th.lessons.forEach((l, i) => numbers.set(l, continuous ? ++n : i + 1))); }

  let view;
  try{ view = sessionStorage.getItem(KEY); }catch(e){}
  if(view !== 'list' && view !== 'cards') view = root.dataset.view === 'cards' ? 'cards' : 'list';

  /* ---------- перемикач ---------- */
  const bar = document.createElement('div');
  bar.className = 'view-bar';
  bar.innerHTML = `<div class="view-toggle" role="group" aria-label="Вигляд">
      <button type="button" data-v="list" title="Список"><span class="material-symbols-outlined chk">check</span><span class="material-symbols-outlined">view_list</span></button>
      <button type="button" data-v="cards" title="Картки"><span class="material-symbols-outlined chk">check</span><span class="material-symbols-outlined">grid_view</span></button>
    </div>`;
  // місце для перемикача: #view-slot (напр. у шапці сторінки), інакше — над списком
  const slot = document.getElementById('view-slot');
  if(!isEmpty) slot ? (slot.appendChild(bar), bar.classList.add('in-slot')) : root.before(bar);
  bar.addEventListener('click', e=>{
    const b = e.target.closest('button[data-v]');
    if(!b || b.dataset.v === view) return;
    view = b.dataset.v;
    try{ sessionStorage.setItem(KEY, view); }catch(e){}
    render();
  });

  /* ---------- «Список» ---------- */
  function lessonAction(l){
    return (l.practice ? `<a class="btn-practice" href="${l.practice.link}" title="${esc(l.practice.title)}">Практикуємо</a>` : '')
      + (l.test ? `<a class="btn-open btn-test" href="${l.test}">Перевіряємо</a>`
        : l.link ? `<a class="btn-open" href="${l.link}">Вчимося</a>`
        : `<span class="tag-soon">Скоро</span>`);
  }
  function renderList(){
    sems.forEach(sem=>{
      if(sem.semester) root.insertAdjacentHTML('beforeend', `<div class="semester-title">${sem.semester}</div>`);
      sem.themes.forEach(theme=>{
        const card = document.createElement('div');
        card.className = 'theme-card';
        paint(card, theme);
        card.innerHTML = `<div class="theme-head"><h2>${theme.title}</h2><span class="theme-hours">${theme.hours}</span></div>`
          + theme.lessons.map(l=>`<div class="lesson-row">
              <span class="lesson-num">${l.test ? '✓' : numbers.get(l)}</span>
              <div class="lesson-body"><div class="lesson-title">${kindHTML(l, 'kind')}${l.title}</div>${l.note ? `<div class="lesson-note">${l.note}</div>` : ''}</div>
              <div class="lesson-action">${lessonAction(l)}</div>
            </div>`).join('');
        root.appendChild(card);
      });
    });
  }

  /* ---------- «Картки» ---------- */
  function lessonCard(l){
    const i = numbers.get(l);
    const ready = l.link || l.test;
    const cls = l.test ? 'lc test' : ready ? 'lc ready' : 'lc soon';
    const ico = l.test ? (l.icon || (isSvg('trophy') ? 'trophy' : '🏆')) : l.icon;
    const head = `${ico ? `<span class="lc-num">${l.test ? '✓' : i}</span>` : ''}
      <span class="lc-ico${!ico ? ' lc-ico-num' : isSvg(ico) ? ' lc-ico-svg' : ''}" aria-hidden="true">${ico ? iconHTML(ico) : i}</span>
      ${kindHTML(l, 'lc-kind')}
      <span class="lc-name">${l.test ? 'Тематична робота' : esc(shortOf(l))}</span>`;
    const href = l.test || l.link;
    const go = l.test ? 'Перевіряємо' : 'Вчимося';
    return `<div class="${cls}" title="${esc(l.title)}">
        ${head}
        ${ready ? `<a class="lc-main" href="${href}"><span>${go}</span></a>` : `<span class="lc-soon">Скоро</span>`}
        ${l.practice ? `<a class="lc-prac" href="${l.practice.link}" title="${esc(l.practice.title)}">Практикуємо</a>` : ''}
      </div>`;
  }
  function renderCards(){
    sems.forEach(sem=>{
      if(sem.semester) root.insertAdjacentHTML('beforeend', `<div class="semester-title">${sem.semester}</div>`);
      sem.themes.forEach(theme=>{
        const title = theme.short || theme.title.replace(/^\d+\.\s*/, '');
        const num = (theme.title.match(/^(\d+)\./) || [])[1];
        const isl = document.createElement('section');
        isl.className = 'island';
        paint(isl, theme);
        isl.innerHTML = `<div class="isl-head">
            <span class="isl-badge${isSvg(theme.icon) ? ' isl-badge-svg' : ''}" aria-hidden="true">${theme.icon ? iconHTML(theme.icon) : num || '★'}</span>
            <h2>${title}</h2>
            <span class="isl-hours">${theme.hours}</span>
          </div>
          <div class="isl-grid">${theme.lessons.map(lessonCard).join('')}</div>`;
        root.appendChild(isl);
      });
    });
  }

  function render(){
    root.innerHTML = '';
    root.classList.toggle('as-cards', view === 'cards');
    document.body.classList.toggle('view-cards', view === 'cards');
    bar.querySelectorAll('button').forEach(b=>{
      const on = b.dataset.v === view;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
    });
    if(isEmpty){
      root.innerHTML = `<div class="theme-card"><div class="theme-head"><h2>Курс готується</h2></div><p style="margin:0; color:var(--ink-soft);">Теми уроків з'являться тут найближчим часом.</p></div>`;
      return;
    }
    view === 'cards' ? renderCards() : renderList();
  }
  render();
})();
