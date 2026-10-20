/* Python-модуль ядра: редактор коду, запуск Python просто на сторінці (Skulpt) і механіки з кодом.
   Підключається в уроках гуртка Python ПІСЛЯ lesson.js:
     <link rel="stylesheet" href="../../assets/python.css">
     <script src="../../assets/lesson.js"></script>
     <script src="../../assets/python.js"></script>

   Дає уроку:
     makeCodeTask(id, {task, code, expect | check, hint, neurons=3, file})
       — задача на код: учень пише/виправляє програму й запускає; правильно — нейрончики й блок зараховано.
         expect — точний вивід (рядки порівнюються без пробілів у кінці), показується під умовою як «Має вийти»;
         check(out, code) — власна перевірка: true — зараховано, рядок — підказка учневі.
     makeSandbox(id, code) — вільна пісочниця без обліку (у блоці має бути ще якась вправа або data-guide).
     makeFindBug(id, [{code, line, why}]) — «У якому рядку помилка?»: клац на рядок коду.
     makeTrace(id, {code, steps}) — покрокове виконання: код, «Пам'ять» з коробками-змінними й консоль;
       перед деякими рядками учень передбачає, що станеться (див. коментар біля функції).
     varBox(name, 'значення') — коробка змінної для ілюстрацій (рядок HTML; тип — за записом значення).
     pyCode(src) — підсвічений блок коду (рядок HTML) — напр. для pre у makeChoices.
   Статичні приклади в розмітці: <pre class="py-code">…</pre> — підсвічуються самі.
   Skulpt (assets/skulpt/) вантажиться лише під час першого запуску чи фокуса в редакторі. */
(()=>{
'use strict';

const BASE = new URL('skulpt/', document.currentScript.src).href;
const esc = s=>s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');


/* ---------- ПІДСВІТКА ---------- */
const KEYWORDS = new Set('False None True and as assert break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
const BUILTINS = new Set('print input int float str bool len range list dict set tuple abs min max sum round sorted type'.split(' '));
const TOKEN = /(#.*)|((?:[fFrRbB]{1,2})?(?:"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?))|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)/g;

function hlLine(line){
  let html = '', last = 0;
  line.replace(TOKEN, (m, com, str, num, word, at)=>{
    html += esc(line.slice(last, at));
    last = at + m.length;
    const cls = com ? 'c' : str ? 's' : num ? 'n' : KEYWORDS.has(word) ? 'k' : BUILTINS.has(word) ? 'b' : '';
    html += cls ? `<span class="t-${cls}">${esc(m)}</span>` : esc(m);
    return m;
  });
  return html + esc(line.slice(last));
}
// Рядки коду окремими <span class="ln">, щоб можна було позначити рядок з помилкою
const highlight = (code, errLine)=>code.split('\n').map((l, i)=>`<span class="ln${i + 1 === errLine ? ' err' : ''}">${hlLine(l)}</span>`).join('\n');
const pyCode = src=>`<pre class="py-code">${highlight(src.replace(/^\n+|\s+$/g, ''))}</pre>`;

document.querySelectorAll('pre.py-code').forEach(pre=>{ pre.innerHTML = highlight(pre.textContent.replace(/^\n+|\s+$/g, '')); });


/* ---------- SKULPT ---------- */
let skulpt = null;
function loadSkulpt(){
  if(skulpt) return skulpt;
  const add = file=>new Promise((ok, fail)=>{
    const s = document.createElement('script');
    s.src = BASE + file;
    s.onload = ok;
    s.onerror = ()=>fail(new Error('Не вдалося завантажити Python. Перевір інтернет і онови сторінку.'));
    document.head.appendChild(s);
  });
  skulpt = add('skulpt.min.js').then(()=>add('skulpt-stdlib.js'));
  skulpt.catch(()=>{ skulpt = null; });
  return skulpt;
}

const LIMIT_MS = 8000, LIMIT_OUT = 20000;
let running = null;       // хто зараз виконує програму: Skulpt один на сторінку

// Запуск програми. io: {write(text), ask(prompt) → Promise<string>}; повертає {out, error}
async function runPython(code, io){
  await loadSkulpt();
  const Sk = window.Sk;
  let out = '';
  const me = {stop:false};
  if(running) running.stop = true;
  running = me;
  Sk.configure({
    output: t=>{ out += t; if(out.length > LIMIT_OUT) me.stop = 'big'; else io.write(t); },
    read: f=>{ const x = Sk.builtinFiles?.files[f]; if(x === undefined) throw new Error(`Модуль ${f} не знайдено`); return x; },
    inputfun: p=>io.ask(p), inputfunTakesPrompt: true,
    __future__: Sk.python3, execLimit: LIMIT_MS, yieldLimit: 60, killableWhile: true, killableFor: true
  });
  try{
    await Sk.misceval.asyncToPromise(()=>Sk.importMainWithBody('<stdin>', false, code, true), {
      '*': ()=>{ if(me.stop) throw new Error(me.stop === 'big' ? 'BIG' : 'STOP'); return null; }
    });
    return { out, error:null };
  }catch(e){
    return { out, error:e };
  }finally{
    if(running === me) running = null;
  }
}


/* ---------- ПОМИЛКИ ЗРОЗУМІЛОЮ МОВОЮ ---------- */
const KNOWN = [...BUILTINS];
function near(a, b){         // відстань редагування ≤ 2 — схоже на опечатку
  if(Math.abs(a.length - b.length) > 2) return false;
  const d = Array.from({length:a.length + 1}, (_, i)=>[i]);
  for(let j = 1; j <= b.length; j++) d[0][j] = j;
  for(let i = 1; i <= a.length; i++) for(let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  return d[a.length][b.length] <= 2;
}
// Що в рядку поза лапками; open — чи лишились незакриті лапки
function outside(line){
  let rest = '', q = null;
  for(let i = 0; i < line.length; i++){
    const ch = line[i];
    if(q){ if(ch === '\\') i++; else if(ch === q) q = null; }
    else if(ch === '#') break;
    else if(ch === '"' || ch === "'") q = ch;
    else rest += ch;
  }
  return { rest, open:!!q };
}
// Шукаємо типову помилку в коді до рядка, на який показав Python (часто він показує наступний)
function lint(lines, upto){
  let depth = 0;
  for(let i = 0; i < Math.min(lines.length, upto); i++){
    const line = lines[i], n = i + 1;
    if(/[“”„«»‘’]/.test(line)) return [n, 'Тут «криві» лапки. Python розуміє лише прямі лапки: <code>"</code> або <code>\'</code>. Видали ці лапки й набери їх заново з клавіатури (англійська розкладка).'];
    const {rest, open} = outside(line);
    if(open) return [n, 'Текст не закрито лапкою. Лапки мають бути з обох боків тексту: <code>"Привіт"</code>.'];
    const word = rest.match(/[А-Яа-яЄєІіЇїҐґ'’]+/);
    if(word) return [n, `Слово «${esc(word[0])}» стоїть без лапок. Текст для виводу бери в лапки: <code>print("${esc(word[0])}")</code>. Імена змінних пиши латиницею.`];
    const opens = (rest.match(/[([{]/g) || []).length, closes = (rest.match(/[)\]}]/g) || []).length;
    if(closes > opens + depth) return [n, 'Тут зайва закривальна дужка <code>)</code>.'];
    depth += opens - closes;
    if(depth > 0 && n === upto - 1 && /^\s*\w+\s*\(/.test(lines[i + 1] || '')) return [n, 'Бракує закривальної дужки <code>)</code> в кінці рядка.'];
    if(/^\s+\S/.test(line) && !/:\s*(#.*)?$/.test(lines[i - 1] || '') && depth <= 0 && !/^\s/.test(lines[i - 1] || ''))
      return [n, 'Зайвий пробіл на початку рядка. Python уважно стежить за відступами: рядок має починатися з самого краю.'];
  }
  if(depth > 0) return [Math.min(lines.length, upto), 'Бракує закривальної дужки <code>)</code>. Кожна відкрита дужка має закритися.'];
  return null;
}
// → {line, text, raw}: номер рядка, пояснення українською й оригінальне повідомлення Python
function explain(e, code){
  const lines = code.split('\n');
  if(e.message === 'STOP') return { line:0, text:'Програму зупинено.', raw:'' };
  if(e.message === 'BIG') return { line:0, text:'Програма вивела забагато тексту, тож її зупинено. Можливо, цикл ніколи не закінчується?', raw:'' };
  if(!e.tp$name){            // збій самого Skulpt (напр. на «...» у заготовці)
    const dots = lines.findIndex(l=>outside(l).rest.includes('...'));
    if(dots >= 0) return { line:dots + 1, text:'Заміни три крапки потрібним кодом.', raw:'' };
    return { line:0, text:'Python не зміг виконати програму. Перевір, чи немає в коді незвичних символів.', raw:esc(e.message || String(e)) };
  }
  const raw = e.toString().replace(/ on line \d+$/, '');
  const line = e.traceback?.[0]?.lineno || 0;
  const arg = String(e.args?.v?.[0] ?? '');
  const res = text=>({ line, text, raw });
  switch(e.tp$name){
    case 'SyntaxError': case 'IndentationError': case 'TokenError': {
      const found = lint(lines, line || lines.length);
      if(found) return { line:found[0], text:found[1], raw };
      if(/^\s/.test(lines[line - 1] || '')) return res('Перевір відступ на початку рядка.');
      return res('Python не зрозумів цей рядок. Перевір лапки, дужки й двокрапки.');
    }
    case 'NameError': {
      const name = (arg.match(/name '(.+?)'/) || [])[1] || '';
      const same = KNOWN.find(k=>k === name.toLowerCase());
      if(same) return res(`Python розрізняє великі й малі літери: пиши <code>${same}</code>, а не <code>${esc(name)}</code>.`);
      const typo = KNOWN.find(k=>near(k, name));
      if(typo) return res(`Python не знає слова <code>${esc(name)}</code>. Можливо, ти мав на увазі <code>${typo}</code>?`);
      return res(`Python не знає, що таке <code>${esc(name)}</code>. Якщо це текст — візьми його в лапки. Якщо змінна — перевір, чи вона створена вище.`);
    }
    case 'TypeError':
      if(/concatenate|must be str|unsupported operand/.test(arg)) return res('Не можна поєднати текст і число через <code>+</code>. Перетвори число на текст <code>str(…)</code> або текст на число <code>int(…)</code>.');
      if(/not callable/.test(arg)) return res('Тут щось викликається як команда з дужками, хоча це не команда.');
      return res('Дані тут не того типу, що потрібен.');
    case 'ValueError':
      if(/invalid literal/.test(arg)) return res('Цей текст не можна перетворити на число. Введи саме число, без літер і пробілів.');
      return res('Неправильне значення.');
    case 'ZeroDivisionError': return res('Ділити на нуль не можна.');
    case 'TimeLimitError': return res('Програма працює надто довго, тож її зупинено. Можливо, цикл ніколи не закінчується?');
    case 'IndexError': return res('Такого номера елемента немає: список коротший.');
    default: return res('Під час виконання сталася помилка.');
  }
}


/* ---------- РЕДАКТОР ----------
   editor(host, code, {file, onRun(result)}) — смужка з назвою файлу й кнопками, поле коду з підсвіткою,
   консоль з виводом (і полем для input()). Повертає {el, get(), set(code), run()}. */
function editor(host, code, {file = 'main.py', onRun, extra = ''} = {}){
  const el = document.createElement('div');
  el.className = 'py-ed';
  el.innerHTML = `
    <div class="py-bar">
      <span class="py-dots"><i></i><i></i><i></i></span>
      <span class="py-file">${file}</span>
      <span class="py-actions">${extra}<button class="py-btn py-reset" type="button" title="Повернути початковий код">↺</button><button class="py-btn py-run" type="button">▶ Запустити</button></span>
    </div>
    <div class="py-body">
      <div class="py-gutter" aria-hidden="true"></div>
      <div class="py-scroll"><div class="py-layer"><pre class="py-hl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Код програми"></textarea></div></div>
    </div>
    <div class="py-out" hidden><div class="py-out-title">Консоль</div><div class="py-out-text"></div></div>`;
  host.appendChild(el);
  const ta = el.querySelector('textarea'), hl = el.querySelector('.py-hl'), gutter = el.querySelector('.py-gutter');
  const out = el.querySelector('.py-out'), outText = out.querySelector('.py-out-text');
  const runBtn = el.querySelector('.py-run');
  const start = code.replace(/^\n+|\s+$/g, '');
  let errLine = 0;

  const paint = ()=>{
    const lines = ta.value.split('\n').length;
    hl.innerHTML = highlight(ta.value, errLine) + '\n';
    gutter.innerHTML = Array.from({length:lines}, (_, i)=>`<span${i + 1 === errLine ? ' class="err"' : ''}>${i + 1}</span>`).join('');
  };
  const set = v=>{ ta.value = v; errLine = 0; paint(); };
  set(start);

  ta.addEventListener('input', ()=>{ errLine = 0; paint(); });
  ta.addEventListener('focus', ()=>{ loadSkulpt().catch(()=>{}); }, {once:true});
  ta.addEventListener('keydown', e=>{
    if(e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.shiftKey)){ e.preventDefault(); run(); return; }
    const {selectionStart:a, selectionEnd:b, value:v} = ta;
    const put = s=>{ ta.setRangeText(s, a, b, 'end'); ta.dispatchEvent(new Event('input')); };
    if(e.key === 'Tab' && !e.shiftKey){ e.preventDefault(); put('    '); }
    else if(e.key === 'Enter'){      // зберігаємо відступ, після двокрапки — додаємо
      const line = v.slice(v.lastIndexOf('\n', a - 1) + 1, a);
      const indent = line.match(/^\s*/)[0] + (/:\s*$/.test(line) ? '    ' : '');
      e.preventDefault(); put('\n' + indent);
    }
  });
  el.querySelector('.py-reset').addEventListener('click', ()=>{ set(start); out.hidden = true; });

  const print = (cls, html)=>{ const s = document.createElement('span'); s.className = cls; s.innerHTML = html; outText.appendChild(s); return s; };
  let busy = false;
  async function run(){
    if(busy){ if(running) running.stop = true; return; }
    busy = true;
    errLine = 0; paint();
    outText.innerHTML = '';
    out.hidden = false;
    runBtn.textContent = '■ Зупинити';
    runBtn.classList.add('stop');
    el.classList.add('busy');
    const src = ta.value;
    const res = await runPython(src, {
      write: t=>print('o', esc(t)),
      ask: p=>new Promise(ok=>{
        if(p) print('o', esc(String(p)));
        const inp = document.createElement('input');
        inp.className = 'py-input';
        inp.setAttribute('aria-label', 'Введи відповідь і натисни Enter');
        outText.appendChild(inp);
        inp.focus();
        inp.addEventListener('keydown', e=>{
          if(e.key !== 'Enter') return;
          const v = inp.value;
          inp.replaceWith(Object.assign(document.createElement('span'), {className:'i', textContent:v + '\n'}));
          ok(v);
        });
      })
    }).catch(e=>({ out:'', error:e }));
    busy = false;
    runBtn.textContent = '▶ Запустити';
    runBtn.classList.remove('stop');
    el.classList.remove('busy');
    outText.querySelector('.py-input')?.remove();
    let info = null;
    if(res.error){
      info = explain(res.error, src);
      errLine = info.line; paint();
      print('e', `<b>${info.line ? `Помилка в рядку ${info.line}` : 'Стоп'}</b>${info.text}${info.raw ? `<small>${esc(info.raw)}</small>` : ''}`);
    } else if(!res.out){
      print('m', 'Програма виконалась, але нічого не вивела.');
    }
    onRun?.({ ...res, code:src, info });
  }
  runBtn.addEventListener('click', run);
  return { el, get:()=>ta.value, set, run };
}


/* ---------- МЕХАНІКИ ---------- */
const norm = s=>s.replace(/\r/g, '').split('\n').map(l=>l.replace(/\s+$/, '')).join('\n').replace(/^\n+|\n+$/g, '');
// Позначка хибної спроби для обліку точності в ядрі (клас має щоразу з'являтися заново)
const flagWrong = el=>{ el.classList.remove('wrong-try'); void el.offsetWidth; el.classList.add('wrong-try'); setTimeout(()=>el.classList.remove('wrong-try'), 700); };

function makeCodeTask(id, {task = '', code = '', expect, check, hint = '', neurons = 3, file} = {}){
  const box = document.getElementById(id);
  box.classList.add('code-task');
  if(task) box.insertAdjacentHTML('beforeend', `<p class="q">${task}</p>`);
  if(expect !== undefined) box.insertAdjacentHTML('beforeend', `<div class="py-expect"><div class="py-out-title">Має вийти</div><pre>${esc(norm(expect))}</pre></div>`);
  const hit = trackTask(box, 1, neurons);
  let solved = false, fails = 0;
  const fb = document.createElement('div');
  fb.className = 'choice-feedback';
  const ed = editor(box, code, {
    file,
    extra: hint ? '<button class="py-btn py-hint" type="button">Підказка</button>' : '',
    onRun({out, error}){
      let verdict;
      if(error) verdict = error.message === 'STOP' ? null : 'Виправ помилку й запусти ще раз.';
      else if(expect !== undefined) verdict = norm(out) === norm(expect) || 'Програма працює, але вивід не збігається з тим, що має вийти. Порівняй уважно, кожен символ.';
      else verdict = check ? check(out, ed.get()) : true;
      if(verdict === null) return;
      if(verdict === true){
        fb.className = 'choice-feedback ok';
        fb.innerHTML = solved ? 'Знову правильно ✓' : `Правильно ✓ +${neurons}`;
        box.classList.add('solved');
        if(!solved){ solved = true; addNeurons(neurons); hit(); }
      } else {
        fb.className = 'choice-feedback';
        fb.innerHTML = verdict || 'Ще не те. Перечитай умову.';
        if(!solved){ flagWrong(box); if(++fails >= 2 && hint) fb.innerHTML += ' Спробуй «Підказку».'; }
      }
    }
  });
  box.appendChild(fb);
  if(hint) box.querySelector('.py-hint').addEventListener('click', ()=>{ fb.className = 'choice-feedback tip'; fb.innerHTML = '💡 ' + hint; });
  return ed;
}

function makeSandbox(id, code = ''){
  return editor(document.getElementById(id), code, {});
}

// «У якому рядку помилка?»: items — [{text?, code, line, why}]
function makeFindBug(id, items){
  const list = document.getElementById(id);
  const hit = trackTask(list, items.length, items.length);
  items.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'classify-card bug-card';
    card.innerHTML = `<p class="q">${item.text || 'Клацни рядок, у якому помилка'}</p><div class="bug-code"></div><div class="choice-feedback"></div>`;
    const codeEl = card.querySelector('.bug-code'), fb = card.querySelector('.choice-feedback');
    let answered = false;
    item.code.replace(/^\n+|\s+$/g, '').split('\n').forEach((l, i)=>{
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bug-line';
      b.innerHTML = `<span class="bug-n">${i + 1}</span><span class="bug-t">${hlLine(l) || ' '}</span>`;
      b.addEventListener('click', ()=>{
        if(answered) return;
        if(i + 1 === item.line){
          answered = true;
          b.classList.add('correct');
          card.classList.add('done');
          fb.innerHTML = 'Правильно ✓ ' + (item.why || '');
          addNeurons(1); hit();
        } else {
          b.classList.add('wrong');
          fb.textContent = 'Цей рядок правильний. Шукай далі.';
        }
      });
      codeEl.appendChild(b);
    });
    list.appendChild(card);
  });
}

/* ---------- ЗМІННІ-КОРОБКИ ---------- */
// Тип за записом значення: "текст" — str, True/False — bool, з крапкою — float, інакше — int
const litType = v=>/^["']/.test(v) ? 'str' : /^(True|False)$/.test(v) ? 'bool' : /\./.test(v) ? 'float' : 'int';
const boxInner = val=>`<span class="vb-val">${esc(val)}</span>`;
// Коробка змінної: назва зверху, значення всередині, колір — за типом
const varBox = (name, val)=>`<div class="var-box t-${litType(val)}" data-name="${name}"><div class="vb-tag">${name}</div><div class="vb-body">${boxInner(val)}</div></div>`;

/* Покрокове виконання: код ліворуч, «Пам'ять» з коробками й консоль праворуч.
   steps — рядки в порядку виконання: [{line, set?:{назва:'значення як у Python'}, out?:'вивід', ask?:{q, opts, correct, why}}].
   ask — учень спершу передбачає, що станеться в цьому рядку (+1 нейрончик), і лише тоді рядок виконується. */
function makeTrace(id, {code, steps}){
  const box = document.getElementById(id);
  const src = code.replace(/^\n+|\s+$/g, '').split('\n');
  const asks = steps.filter(s=>s.ask).length;
  const hit = trackTask(box, asks || 1, asks);
  box.classList.add('trace-wrap');
  box.innerHTML = `
    <div class="trace">
      <div class="tr-code">${src.map((l, i)=>`<div class="tr-line"><span class="tr-n">${i + 1}</span><span class="tr-t">${hlLine(l) || ' '}</span></div>`).join('')}</div>
      <div class="tr-side">
        <div class="tr-title">Пам'ять</div>
        <div class="tr-boxes"></div>
        <div class="tr-title">Консоль</div>
        <div class="tr-out"></div>
      </div>
    </div>
    <div class="tr-ask" hidden></div>
    <div class="tr-ctrl"><button class="btn-primary tr-next" type="button"></button><span class="tr-msg"></span></div>`;
  const lines = [...box.querySelectorAll('.tr-line')], boxes = box.querySelector('.tr-boxes'), out = box.querySelector('.tr-out');
  const askEl = box.querySelector('.tr-ask'), btn = box.querySelector('.tr-next'), msg = box.querySelector('.tr-msg');
  let pos = 0, replay = false;

  function mark(){
    lines.forEach(l=>l.classList.remove('cur', 'next'));
    if(pos > 0) lines[steps[pos - 1].line - 1].classList.add('cur');
    if(pos < steps.length) lines[steps[pos].line - 1].classList.add('next');
    btn.hidden = false;
    if(pos < steps.length){ btn.textContent = `▶ Виконати рядок ${steps[pos].line}`; msg.textContent = ''; }
    else { btn.textContent = '↺ Ще раз'; msg.textContent = 'Програма завершилась ✓'; }
    if(!boxes.children.length) boxes.innerHTML = '<span class="tr-empty">Поки що порожньо</span>';
  }
  function exec(step){
    boxes.querySelector('.tr-empty')?.remove();
    Object.entries(step.set || {}).forEach(([name, val])=>{
      const old = boxes.querySelector(`[data-name="${name}"]`);
      if(!old){ boxes.insertAdjacentHTML('beforeend', varBox(name, val)); boxes.lastElementChild.classList.add('pop'); return; }
      old.className = `var-box t-${litType(val)}`;
      const v = old.querySelector('.vb-val');
      v.classList.add('out');
      v.insertAdjacentHTML('afterend', boxInner(val));
      v.nextElementSibling.classList.add('drop');
      setTimeout(()=>v.remove(), 450);
    });
    if(step.out !== undefined) out.insertAdjacentHTML('beforeend', `<div class="tr-o">${esc(step.out)}</div>`);
    pos++;
    mark();
  }
  function ask(step){
    btn.hidden = true;
    askEl.hidden = false;
    askEl.innerHTML = `<p class="q">${step.ask.q}</p><div class="choice-row"></div><div class="choice-feedback"></div>`;
    const row = askEl.querySelector('.choice-row'), fb = askEl.querySelector('.choice-feedback');
    let answered = false;
    step.ask.opts.forEach((o, i)=>{
      const b = document.createElement('button');
      b.className = 'choice-btn';
      b.innerHTML = o;
      b.addEventListener('click', ()=>{
        if(answered) return;
        if(i !== step.ask.correct){ b.classList.add('wrong'); fb.textContent = 'Ні, подумай ще.'; return; }
        answered = true;
        b.classList.add('correct');
        fb.innerHTML = 'Правильно ✓ ' + (step.ask.why || '');
        addNeurons(1); hit();
        exec(step);
      });
      row.appendChild(b);
    });
  }
  btn.addEventListener('click', ()=>{
    if(pos === steps.length){        // ще раз — уже без запитань
      pos = 0; replay = true;
      boxes.innerHTML = ''; out.innerHTML = ''; askEl.hidden = true;
      mark(); return;
    }
    askEl.hidden = true;
    const step = steps[pos];
    if(step.ask && !replay) ask(step);
    else exec(step);
    if(pos === steps.length && !asks) hit();
  });
  mark();
}

Object.assign(window, { makeCodeTask, makeSandbox, makeFindBug, makeTrace, pyCode, varBox });
})();
