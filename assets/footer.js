/* Спільний футер сайту: рядок «© рік автор, місто · логотип CC · Про проєкт».
   Єдине місце, де лежать текст, логотип і стилі цього рядка — змінювати лише тут.

   Як підключити:
   - уроки й практичні роботи — нічого не робити, footer.js підвантажують lesson.js і practice.js;
   - інші сторінки — <footer></footer> і перед </body>: <script src="{шлях до кореня}assets/footer.js"></script>.
   У футері сторінки першим рядком — її назва <span class="page-name">Урок · «…» · 5 клас</span>; рядок © стає під нею
   (без назви — на початок <footer>), а підписи авторів фото .credits лишаються нижче.
   Сторінка без <footer> (повноекранні ігри) нічого не отримує. Посилання будуються від адреси цього файлу,
   тож працюють на будь-якій глибині теки й з file://. */
(()=>{
  const YEAR   = '2026';
  const AUTHOR = 'Ткачук Ігор Антонович';
  const CITY   = 'м.\u00a0Київ';   // нерозривний пробіл — «м.» не відривається від назви
  const LICENSE_NAME = 'Ліцензія Creative Commons CC BY-NC-SA 4.0';

  const CC_SVG = '<svg class="cc" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10.5 9.6A3.1 3.1 0 1 0 10.5 14.4M17.5 9.6A3.1 3.1 0 1 0 17.5 14.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';

  // колір — від тексту футера сторінки, тож рядок пасує до гами будь-якого уроку
  const CSS = `
footer .page-name{display:block;}
footer .copy{display:block; margin-top:4px; font-size:12px; opacity:.85;}
footer .copy a{color:inherit; text-decoration:none;}
footer .copy a.cc-link{display:inline-block; border:0; vertical-align:middle; line-height:0;}
footer .copy .cc{width:1.5em; height:1.5em;}
footer .copy a.about-link{display:inline-flex; align-items:center; height:1.67em; padding:0 .6em; border:1.5px solid currentColor; border-radius:999px; font-family:'Nunito Sans',sans-serif; font-weight:800; font-size:.9em; letter-spacing:.02em; line-height:1; vertical-align:middle;}
footer .copy a.about-link:hover{background:currentColor;}
footer .copy a.about-link:hover span{color:var(--surface,#fff);}`;

  const src   = document.currentScript ? document.currentScript.src : location.href;
  const about = new URL('../about/index.html', src);
  const dir   = u => u.pathname.replace(/index\.html$/, '');
  const onAbout = dir(new URL(location.href)) === dir(about);   // на самій сторінці «Про проєкт» — без посилання на себе

  function render(){
    const f = document.querySelector('footer');
    if(!f || f.querySelector('.copy')) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    const lic = onAbout ? '#license' : about.href + '#license';
    const name = f.querySelector('.page-name');   // назва сторінки — першим рядком, © під нею
    (name || f).insertAdjacentHTML(name ? 'afterend' : 'afterbegin',
      `<span class="copy">© ${YEAR} ${AUTHOR}, ${CITY} · ` +
      `<a class="cc-link" href="${lic}" rel="license" title="${LICENSE_NAME}" aria-label="${LICENSE_NAME}">${CC_SVG}</a>` +
      (onAbout ? '' : ` · <a class="about-link" href="${about.href}"><span>Про проєкт</span></a>`) +
      `</span>`);
  }
  if(document.readyState === 'loading') addEventListener('DOMContentLoaded', render);
  else render();
})();
