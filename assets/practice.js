/* Практична робота: HUD як в уроці — смужка прогресу, прив'язана до прокрутки, і підпис з data-hud.
   Без нейрончиків і без посилань назад. */
(()=>{
  const body = document.body;
  body.insertAdjacentHTML('afterbegin', `
    <div class="hud">
      <div class="hud-bar"><div class="hud-bar-fill"></div></div>
      <div class="hud-row"><span class="hud-title"></span></div>
    </div>`);
  body.querySelector('.hud-title').textContent = body.dataset.hud || '';
  const fill = body.querySelector('.hud-bar-fill');
  const update = ()=>{
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    fill.style.width = (max > 0 ? Math.min(100, Math.max(0, h.scrollTop / max * 100)) : 0) + '%';
  };
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update);
  update();
})();
