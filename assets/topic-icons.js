/* Значки для вигляду «Картки» у списках тем (assets/topics.js).
   Плаский «наліпковий» стиль: яскраві заливки й темний контур 3 px, viewBox 64 × 64.
   У PLAN уроку чи теми — icon: "mouse" (ключ звідси); якщо ключа немає, icon показується як емодзі.
   Значки спільні для всіх класів — нові додавати сюди ж. */
const TOPIC_ICONS = (()=>{
  const K = '#2B2D42';   // контур
  const s = (body) => `<svg viewBox="0 0 64 64" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const arrow = (x, y, k=1) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 0V17L4.6 12.6L8 20L11 18.6L7.7 11.4H14Z" fill="#fff" stroke-width="${2.2/k}"/>`;
  // зірка з центром (cx, cy), зовнішнім і внутрішнім радіусом
  const star = (cx, cy, R, r, fill, sw=3) => {
    const p = [];
    for(let i = 0; i < 10; i++){
      const a = Math.PI / 5 * i - Math.PI / 2, d = i % 2 ? r : R;
      p.push(`${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`);
    }
    return `<path d="M${p.join('L')}Z" fill="${fill}"${sw ? ` stroke-width="${sw}"` : ' stroke="none"'}/>`;
  };
  // літери й цифри на значку
  const t = (x, y, str, fill, size, style='') => `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" stroke="none" font-family="'Baloo 2','Nunito Sans',sans-serif" font-weight="800" font-size="${size}"${style ? ` font-style="${style}"` : ''}>${str}</text>`;
  // аркуш із загнутим кутиком
  const page = (fill, fold, body) => s(`
      <path d="M14 4h26l12 12v40a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z" fill="${fill}"/>
      <path d="M40 4v12h12" fill="${fold}"/>${body}`);
  // вікно браузера з крапками й адресним рядком
  const win = (body) => s(`
      <rect x="4" y="8" width="56" height="48" rx="5" fill="#fff"/>
      <path d="M4 13a5 5 0 0 1 5-5h46a5 5 0 0 1 5 5v6H4Z" fill="#E9ECF5"/>
      <circle cx="10" cy="13.5" r="1.8" fill="#FF5A4E" stroke="none"/><circle cx="15.5" cy="13.5" r="1.8" fill="#FFC93C" stroke="none"/><circle cx="21" cy="13.5" r="1.8" fill="#2ECC71" stroke="none"/>
      <rect x="27" y="11" width="28" height="5" rx="2.5" fill="#fff" stroke-width="1.5"/>
      ${body}<rect x="4" y="8" width="56" height="48" rx="5"/>`);
  // людина: голова й тулуб
  const person = (x, y, r, w, fill) => {
    const by = y + r + 2 + w;
    return `<path d="M${x - w} ${by}a${w} ${w} 0 0 1 ${2 * w} 0v4H${x - w}Z" fill="${fill}"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD9B0"/>`;
  };
  // плата micro:bit — світлодіоди-усмішка й кнопки A/B; moving — нахилена, з рисками руху
  const microbit = (moving) => {
    const on = ['.....', '.X.X.', '.....', 'X...X', '.XXX.'];
    const leds = on.map((row, r)=>[...row].map((c, k)=>`<rect x="${22.5 + k * 4}" y="${21.5 + r * 4}" width="3" height="3" rx=".6" fill="${c === 'X' ? '#FF5A4E' : '#5C6080'}" stroke="none"/>`).join('')).join('');
    const board = `<rect x="6" y="14" width="52" height="36" rx="6" fill="${K}"/>${leds}
      <circle cx="14" cy="32" r="4" fill="#C7CBD9" stroke-width="2"/><circle cx="50" cy="32" r="4" fill="#C7CBD9" stroke-width="2"/>
      ${[12, 22, 32, 42, 52].map(x=>`<rect x="${x - 2.5}" y="46" width="5" height="4" fill="#F2C94C" stroke="none"/>`).join('')}`;
    return s(moving
      ? `<g transform="rotate(-12 32 32) scale(.86) translate(5 5)">${board}</g><path d="M4 12l-2 6M8 8l-3 8M58 46l3 6M54 52l3 6" stroke="#FF6B4A" stroke-width="3"/>`
      : board);
  };
  return {
    /* ---- теми ---- */
    bulb: s(`
      <path d="M32 6C22 6 15 13 15 22c0 7 4 10 7 14v4h20v-4c3-4 7-7 7-14 0-9-7-16-17-16Z" fill="#FFC93C"/>
      <path d="M22 40h20v7a3 3 0 0 1-3 3H25a3 3 0 0 1-3-3Z" fill="#C7CBD9"/>
      <path d="M26 56h12M22 45h20" />
      <path d="M26 20c1-4 4-6 8-6" stroke="#fff" stroke-width="3.5"/>`),
    pc: s(`
      <rect x="4" y="12" width="38" height="28" rx="4" fill="#2D9CDB"/>
      <path d="M17 40v8h12v-8M13 50h20" fill="#C7CBD9"/>
      <rect x="46" y="12" width="14" height="40" rx="3" fill="#E9ECF5"/>
      <path d="M50 20h6M50 26h6"/><circle cx="53" cy="44" r="2.5" fill="#2ECC71"/>
      <path d="M10 19h10" stroke="#fff"/>`),
    cursor: s(`
      <path d="M44 8v6M56 20h-6M52 11l-4 4" stroke="#FF6B4A" stroke-width="3.5"/>
      ${arrow(16, 14, 2)}`),

    /* ---- уроки ---- */
    message: s(`
      <path d="M8 14a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H28l-11 10V42h-3a6 6 0 0 1-6-6Z" fill="#FF6B4A"/>
      <circle cx="32" cy="17" r="2.8" fill="#fff" stroke="none"/>
      <path d="M32 24v10" stroke="#fff" stroke-width="5"/>`),
    letter: s(`
      <path d="M3 24h8M6 32h6M3 40h8" stroke="#FF6B4A" stroke-width="3.5"/>
      <rect x="16" y="14" width="44" height="34" rx="4" fill="#fff"/>
      <path d="M17 16l21 17 21-17" fill="#E9ECF5"/>
      <rect x="46" y="20" width="9" height="10" rx="1.5" fill="#FFC93C" stroke-width="2.2"/>`),
    book: s(`
      <path d="M32 16c-7-5-16-6-26-4v38c10-2 19-1 26 4Z" fill="#fff"/>
      <path d="M32 16c7-5 16-6 26-4v38c-10-2-19-1-26 4Z" fill="#fff"/>
      <path d="M12 21c5-1 10 0 14 2M12 29c5-1 10 0 14 2M12 37c5-1 10 0 14 2" stroke="#9AA0B4" stroke-width="2.5"/>
      <path d="M38 23c4-2 9-3 14-2M38 31c4-2 9-3 14-2" stroke="#9AA0B4" stroke-width="2.5"/>
      <path d="M44 12v16l4-3 4 3V11" fill="#FF6B4A" stroke-width="2.5"/>`),
    gear: s(`
      <circle cx="32" cy="32" r="20" stroke="#6C5CE7" stroke-width="9" stroke-dasharray="6.2 4.27" stroke-linecap="butt"/>
      <circle cx="32" cy="32" r="17" fill="#6C5CE7"/>
      <circle cx="32" cy="32" r="7" fill="#fff"/>`),
    pencil: s(`<g transform="rotate(-45 32 32)">
      <rect x="14" y="25" width="30" height="14" fill="#FFC93C"/>
      <path d="M14 32h30" stroke="#E9A400" stroke-width="2"/>
      <rect x="44" y="25" width="9" height="14" rx="2" fill="#FF8FA3"/>
      <path d="M14 25L3 32l11 7Z" fill="#F5D7A1"/>
      <path d="M6.7 29.6L3 32l3.7 2.4Z" fill="${K}"/></g>`),
    buddy: s(`
      <rect x="8" y="8" width="48" height="36" rx="6" fill="#16A3A0"/>
      <circle cx="24" cy="23" r="3.5" fill="#fff" stroke="none"/><circle cx="40" cy="23" r="3.5" fill="#fff" stroke="none"/>
      <path d="M23 32c5 5 13 5 18 0" stroke="#fff"/>
      <path d="M26 44v6h12v-6M20 54h24" fill="#C7CBD9"/>`),
    lights: s(`
      <rect x="20" y="4" width="24" height="52" rx="9" fill="${K}"/>
      <circle cx="32" cy="16" r="6" fill="#FF5A4E" stroke="none"/>
      <circle cx="32" cy="30" r="6" fill="#FFC93C" stroke="none"/>
      <circle cx="32" cy="44" r="6" fill="#2ECC71" stroke="none"/>
      <path d="M28 56v4h8v-4" fill="#9AA0B4"/>`),
    devices: s(`
      <rect x="6" y="12" width="36" height="26" rx="3" fill="#2D9CDB"/>
      <path d="M2 40h44l-4 7H6Z" fill="#C7CBD9"/>
      <rect x="42" y="20" width="18" height="32" rx="4" fill="${K}"/>
      <rect x="45.5" y="24" width="11" height="21" rx="1.5" fill="#FFC93C" stroke="none"/>
      <path d="M11 18h9" stroke="#fff"/>`),
    mouse: s(`
      <path d="M32 12C30 5 38 3 42 2" stroke-width="3"/>
      <rect x="18" y="12" width="28" height="46" rx="14" fill="#fff"/>
      <path d="M32 12.5V30H18.4v-4A13.6 13.6 0 0 1 32 12.5Z" fill="#FF6B4A"/>
      <path d="M18.5 30h27M32 13v17"/>
      <rect x="30" y="17" width="4" height="8" rx="2" fill="${K}" stroke="none"/>`),
    power: s(`
      <circle cx="32" cy="32" r="25" fill="#2ECC71"/>
      <path d="M24 22.5A13 13 0 1 0 40 22.5" stroke="#fff" stroke-width="5"/>
      <path d="M32 16v16" stroke="#fff" stroke-width="5"/>`),
    desktop: s(`
      <rect x="4" y="8" width="56" height="38" rx="5" fill="#7CC4F2"/>
      <path d="M6 38l14-12 10 8 10-9 18 13" fill="#2ECC71" stroke="none"/>
      <circle cx="47" cy="17" r="4.5" fill="#FFC93C" stroke="none"/>
      <rect x="10" y="13" width="8" height="7" rx="1.5" fill="#FFC93C" stroke-width="2"/>
      <rect x="10" y="24" width="8" height="7" rx="1.5" fill="#fff" stroke-width="2"/>
      <path d="M5.5 39h53v2.5a3 3 0 0 1-3 3h-47a3 3 0 0 1-3-3Z" fill="#1F5F99" stroke="none"/>
      <rect x="4" y="8" width="56" height="38" rx="5"/>
      <path d="M27 46v7h10v-7M20 56h24" fill="#C7CBD9"/>`),
    window: s(`
      <rect x="5" y="10" width="54" height="44" rx="5" fill="#fff"/>
      <path d="M10 10h44a5 5 0 0 1 5 5v7H5v-7a5 5 0 0 1 5-5Z" fill="#6C5CE7"/>
      <path d="M33 16h4" stroke="#fff" stroke-width="2.5"/>
      <rect x="41.5" y="13.5" width="5" height="5" rx="1" stroke="#fff" stroke-width="2.2"/>
      <path d="M50 13.5l5 5M55 13.5l-5 5" stroke="#fff" stroke-width="2.5"/>
      <path d="M12 30h22M12 38h30M12 46h16" stroke="#C7CBD9" stroke-width="3"/>`),
    menu: s(`
      <rect x="8" y="6" width="40" height="50" rx="5" fill="#fff"/>
      <rect x="11" y="20" width="34" height="11" rx="3" fill="#FFC93C" stroke="none"/>
      <rect x="14" y="11" width="5" height="5" rx="1" fill="#FF6B4A" stroke="none"/><path d="M24 13.5h16" stroke="#9AA0B4"/>
      <rect x="14" y="23" width="5" height="5" rx="1" fill="#2D9CDB" stroke="none"/><path d="M24 25.5h16"/>
      <rect x="14" y="35" width="5" height="5" rx="1" fill="#2ECC71" stroke="none"/><path d="M24 37.5h16" stroke="#9AA0B4"/>
      <rect x="14" y="46" width="5" height="5" rx="1" fill="#6C5CE7" stroke="none"/><path d="M24 48.5h12" stroke="#9AA0B4"/>
      ${arrow(40, 26, 1.3)}`),
    folder: s(`
      <path d="M6 16a4 4 0 0 1 4-4h14l5 5h25a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" fill="#F2A516"/>
      <rect x="13" y="20" width="36" height="22" rx="2" fill="#fff" stroke-width="2.5" transform="rotate(-4 31 31)"/>
      <path d="M6 28h52v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z" fill="#FFC93C"/>`),
    keyboard: s(`
      <rect x="3" y="18" width="58" height="32" rx="5" fill="#E9ECF5"/>
      ${[9,18,27,36,45].map(x=>`<rect x="${x}" y="23" width="7" height="6" rx="1.5" fill="#fff" stroke-width="2"/>`).join('')}
      ${[12,21,30,39,48].map(x=>`<rect x="${x}" y="32" width="7" height="6" rx="1.5" fill="${x===21||x===39?'#FFC93C':'#fff'}" stroke-width="2"/>`).join('')}
      <rect x="54" y="23" width="3" height="6" rx="1" fill="#fff" stroke-width="2"/>
      <rect x="18" y="41" width="28" height="5" rx="1.5" fill="#fff" stroke-width="2"/>`),
    trophy: s(`
      <path d="M20 8h24v14a12 12 0 0 1-24 0Z" fill="#FFC93C"/>
      <path d="M20 13h-7a7 7 0 0 0 9 11M44 13h7a7 7 0 0 1-9 11"/>
      <path d="M29 34h6v8h-6Z" fill="#F2A516"/>
      <rect x="20" y="42" width="24" height="7" rx="2" fill="#F2A516"/>
      <rect x="16" y="49" width="32" height="7" rx="2" fill="#6C5CE7"/>
      <path d="M27 14v8" stroke="#fff" stroke-width="3.5"/>`),

    /* ---- значки 5–9 класів ---- */
    globe: s(`
      <circle cx="32" cy="32" r="25" fill="#2D9CDB"/>
      <path d="M14 20c6 0 8 4 6 8s-8 3-9 8M38 9c-2 5 2 8 6 8s8 3 7 9M42 56c0-6 4-8 8-9" stroke="#2ECC71" stroke-width="5"/>
      <ellipse cx="32" cy="32" rx="11" ry="25" stroke="#fff" stroke-width="2.5"/>
      <path d="M7 32h50" stroke="#fff" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="25"/>`),
    robot: s(`
      <path d="M32 6v7"/><circle cx="32" cy="6" r="3" fill="#FF6B4A"/>
      <rect x="5" y="24" width="7" height="13" rx="2" fill="#FFC93C"/><rect x="52" y="24" width="7" height="13" rx="2" fill="#FFC93C"/>
      <rect x="12" y="13" width="40" height="34" rx="10" fill="#7CC4F2"/>
      <rect x="18" y="21" width="28" height="17" rx="6" fill="${K}"/>
      <circle cx="26" cy="29.5" r="3.5" fill="#2ECC71" stroke="none"/><circle cx="38" cy="29.5" r="3.5" fill="#2ECC71" stroke="none"/>
      <path d="M22 47v3h20v-3"/><rect x="16" y="50" width="32" height="10" rx="4" fill="#FF6B4A"/>`),
    classroom: s(`
      <path d="M16 44l-5 14M48 44l5 14" stroke-width="3.5"/>
      <rect x="5" y="7" width="54" height="36" rx="3" fill="#2E9E6A"/>
      <path d="M13 17h16M13 25h24M13 33h10" stroke="#fff" stroke-width="2.5"/>
      ${star(46, 22, 7, 3, '#FFC93C', 2)}
      <path d="M8 44h48" stroke-width="4"/>`),
    transfer: s(`
      <rect x="3" y="12" width="20" height="38" rx="4" fill="#2D9CDB"/><rect x="7" y="18" width="12" height="22" rx="1.5" fill="#fff" stroke="none"/>
      <rect x="41" y="12" width="20" height="38" rx="4" fill="#FF6B4A"/><rect x="45" y="18" width="12" height="22" rx="1.5" fill="#fff" stroke="none"/>
      <path d="M26 24h12M34 20l4 4-4 4M38 38H26M30 34l-4 4 4 4" stroke-width="3.5"/>`),
    phone: s(`
      <path d="M50 20a10 10 0 0 1 0 14M55 15a17 17 0 0 1 0 24M14 20a10 10 0 0 0 0 14M9 15a17 17 0 0 0 0 24" stroke="#FF6B4A"/>
      <rect x="20" y="6" width="24" height="52" rx="6" fill="${K}"/>
      <rect x="24" y="13" width="16" height="34" rx="2" fill="#7CC4F2" stroke="none"/>
      <circle cx="32" cy="52" r="2" fill="#fff" stroke="none"/>`),
    search: s(`
      <path d="M40 40l15 15" stroke-width="10"/><path d="M41 41l13 13" stroke="#FF6B4A" stroke-width="4.5"/>
      <circle cx="27" cy="27" r="18" fill="#BFE3FA"/>
      <path d="M17 24a11 11 0 0 1 8-8" stroke="#fff" stroke-width="4"/>`),
    fake: s(`
      <rect x="6" y="6" width="40" height="50" rx="4" fill="#fff"/>
      <rect x="12" y="12" width="28" height="7" rx="1.5" fill="${K}" stroke="none"/>
      <path d="M12 27h20M12 34h16M12 41h18M12 48h12" stroke="#9AA0B4" stroke-width="2.5"/>
      <circle cx="46" cy="44" r="14" fill="#FF5A4E"/>
      ${t(46, 51, '?', '#fff', 22)}`),
    chip: s(`
      <path d="M24 16V7M32 16V7M40 16V7M24 48v9M32 48v9M40 48v9M16 24H7M16 32H7M16 40H7M48 24h9M48 32h9M48 40h9"/>
      <rect x="16" y="16" width="32" height="32" rx="4" fill="#6C5CE7"/>
      <rect x="24" y="24" width="16" height="16" rx="2" fill="#FFC93C"/>`),
    copy: s(`
      <rect x="8" y="5" width="30" height="38" rx="4" fill="#C7CBD9"/>
      <rect x="24" y="20" width="30" height="38" rx="4" fill="#fff"/>
      <path d="M30 30h18M30 38h18M30 46h12" stroke="#2D9CDB"/>`),
    pie: s(`
      <circle cx="32" cy="32" r="24" fill="#2D9CDB"/>
      <path d="M32 32V8a24 24 0 0 1 22.8 31.4Z" fill="#FFC93C"/>
      <path d="M32 32l22.8 7.4A24 24 0 0 1 40 54.6Z" fill="#FF6B4A"/>`),
    slides: s(`
      <path d="M32 44v8M22 59l10-7 10 7"/>
      <rect x="6" y="9" width="52" height="35" rx="3" fill="#fff"/>
      <path d="M3 9h58" stroke-width="4"/>
      <rect x="12" y="16" width="18" height="21" rx="2" fill="#FF6B4A"/>
      <path d="M36 19h16M36 27h12M36 35h14" stroke="#9AA0B4" stroke-width="2.5"/>`),
    survey: s(`
      <rect x="11" y="8" width="42" height="51" rx="4" fill="#fff"/>
      <rect x="23" y="4" width="18" height="9" rx="2" fill="#C7CBD9"/>
      <path d="M17 23l3 3 6-6M17 36l3 3 6-6" stroke="#2ECC71" stroke-width="3.5"/>
      <rect x="17.5" y="45" width="8" height="8" rx="1.5" stroke-width="2.5"/>
      <path d="M31 24h15M31 37h15M31 50h15" stroke="#9AA0B4"/>`),
    flask: s(`
      <path d="M27 6v18L12 50a5 5 0 0 0 4.3 7.5h31.4A5 5 0 0 0 52 50L37 24V6Z" fill="#fff"/>
      <path d="M19 38h26l7 12a5 5 0 0 1-4.3 7.5H16.3A5 5 0 0 1 12 50Z" fill="#2ECC71" stroke="none"/>
      <path d="M27 6v18L12 50a5 5 0 0 0 4.3 7.5h31.4A5 5 0 0 0 52 50L37 24V6Z"/>
      <path d="M23 6h18"/>
      <circle cx="26" cy="47" r="2.5" fill="#fff" stroke="none"/><circle cx="36" cy="51" r="2" fill="#fff" stroke="none"/><circle cx="34" cy="31" r="2" fill="#2ECC71" stroke="none"/>`),
    shapes: s(`
      <rect x="30" y="28" width="27" height="27" rx="3" fill="#2D9CDB"/>
      <circle cx="22" cy="22" r="14" fill="#FF6B4A"/>
      <path d="M8 56l12-20 12 20Z" fill="#FFC93C"/>`),
    brush: s(`
      <path d="M32 6C17 6 6 17 6 31c0 13 10 23 20 23 5 0 6-3 5-6s0-7 5-7h9c8 0 13-5 13-12C58 16 47 6 32 6Z" fill="#FFE2B8"/>
      <circle cx="19" cy="24" r="4.5" fill="#FF5A4E"/><circle cx="31" cy="15" r="4.5" fill="#FFC93C"/>
      <circle cx="44" cy="19" r="4.5" fill="#2D9CDB"/><circle cx="17" cy="38" r="4.5" fill="#2ECC71"/>
      <circle cx="44" cy="32" r="3.5" fill="#fff"/>`),
    bars: s(`
      <rect x="14" y="34" width="10" height="22" rx="1.5" fill="#2D9CDB"/>
      <rect x="28" y="22" width="10" height="34" rx="1.5" fill="#FFC93C"/>
      <rect x="42" y="10" width="10" height="46" rx="1.5" fill="#FF6B4A"/>
      <path d="M7 6v50h52"/>`),
    film: s(`
      <rect x="5" y="11" width="54" height="42" rx="4" fill="${K}"/>
      ${[10, 19, 28, 37, 46].map(x=>`<rect x="${x + 1}" y="15" width="4" height="4" rx="1" fill="#fff" stroke="none"/><rect x="${x + 1}" y="45" width="4" height="4" rx="1" fill="#fff" stroke="none"/>`).join('')}
      <rect x="11" y="23" width="19" height="18" rx="2" fill="#FFC93C" stroke="none"/>
      <rect x="34" y="23" width="19" height="18" rx="2" fill="#7CC4F2" stroke="none"/>`),
    wand: s(`
      <path d="M10 56l28-28" stroke-width="9"/><path d="M10 56l28-28" stroke="#6C5CE7" stroke-width="3.5"/>
      ${star(44, 20, 13, 5.5, '#FFC93C', 2.5)}
      <path d="M14 14v8M10 18h8M54 42v8M50 46h8" stroke="#FF6B4A"/>`),
    linear: s(`
      <rect x="16" y="3" width="32" height="13" rx="4" fill="#2ECC71"/>
      <path d="M32 16v7M28 20l4 4 4-4"/>
      <rect x="16" y="25" width="32" height="13" rx="4" fill="#2D9CDB"/>
      <path d="M32 38v7M28 42l4 4 4-4"/>
      <rect x="16" y="47" width="32" height="13" rx="4" fill="#FF6B4A"/>`),
    branch: s(`
      <path d="M19 17H10v15M45 17h9v15M11 46v8h42v-8"/>
      <path d="M32 4l15 13-15 13-15-13Z" fill="#FFC93C"/>
      ${t(32, 23, '?', K, 14)}
      <rect x="2" y="32" width="18" height="14" rx="3" fill="#2ECC71"/>
      <rect x="44" y="32" width="18" height="14" rx="3" fill="#FF6B4A"/>`),
    loop: s(`
      <path d="M47 21a19 19 0 0 0-32 5" stroke="#2D9CDB" stroke-width="7"/>
      <path d="M17 43a19 19 0 0 0 32-5" stroke="#FF6B4A" stroke-width="7"/>
      <path d="M7 25l8 11 8-10Z" fill="#2D9CDB" stroke-width="2.5"/>
      <path d="M57 39l-8-11-8 10Z" fill="#FF6B4A" stroke-width="2.5"/>`),
    stars: s(`
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#2B3A67"/>
      <path d="M14 46L28 30l17 9 9-24" stroke="#fff" stroke-width="2" stroke-dasharray="3 4"/>
      ${star(14, 46, 7, 3, '#FFC93C', 2)}${star(28, 30, 6, 2.6, '#FFC93C', 2)}${star(45, 39, 6, 2.6, '#FFC93C', 2)}${star(52, 15, 8, 3.4, '#FFC93C', 2)}`),
    ornament: s(`
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((a, i)=>`<ellipse cx="32" cy="15" rx="6" ry="11" fill="${i % 2 ? '#D63A84' : '#6C5CE7'}" transform="rotate(${a} 32 32)" stroke-width="2.5"/>`).join('')}
      <circle cx="32" cy="32" r="8" fill="#FFC93C"/>`),
    gamepad: s(`
      <path d="M19 17h26c9 0 13 7 14 17 1 9-2 16-7 16-4 0-6-4-9-7H21c-3 3-5 7-9 7-5 0-8-7-7-16 1-10 5-17 14-17Z" fill="#6C5CE7"/>
      <path d="M19 26v12M13 32h12" stroke="#fff" stroke-width="4"/>
      <circle cx="43" cy="28" r="3.5" fill="#FFC93C" stroke-width="2"/><circle cx="50" cy="35" r="3.5" fill="#FF6B4A" stroke-width="2"/>`),
    doc: page('#2D9CDB', '#9BD0F5', `<path d="M18 28h26M18 36h26M18 44h18" stroke="#fff"/>`),
    sheet: page('#2ECC71', '#A8EBC4', `<rect x="17" y="26" width="28" height="22" rx="1" stroke="#fff" stroke-width="2.5"/>
      <path d="M17 33.3h28M17 40.6h28M26.5 26v22" stroke="#fff" stroke-width="2.5"/>`),
    mailbox: s(`
      <rect x="27" y="42" width="9" height="17" fill="#9AA0B4"/>
      <path d="M46 28V7h10v7H46" fill="#FF5A4E"/>
      <path d="M20 12h24a12 12 0 0 1 12 12v19H8V24a12 12 0 0 1 12-12Z" fill="#2D9CDB"/>
      <path d="M20 12a12 12 0 0 1 12 12v19"/>
      <rect x="12" y="26" width="15" height="9" rx="1" fill="#fff" stroke-width="2.5"/>`),
    send: s(`
      <path d="M4 44h10M8 52h8M2 36h6" stroke="#FF6B4A" stroke-width="3.5"/>
      <path d="M8 30L58 8 46 54 33 39Z" fill="#fff"/>
      <path d="M58 8L33 39l-1 15 8-9" fill="#C7CBD9"/>`),
    phish: s(`
      <path d="M30 2v20c0 6-8 9-11 3" stroke="#9AA0B4" stroke-width="4"/>
      <rect x="6" y="30" width="38" height="27" rx="3" fill="#fff"/>
      <path d="M7 32l18 13 18-13"/>
      <circle cx="48" cy="44" r="12" fill="#FF5A4E"/>
      <path d="M48 37v8" stroke="#fff" stroke-width="4"/><circle cx="48" cy="50.5" r="2.2" fill="#fff" stroke="none"/>`),
    social: s(`
      <path d="M8 14a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H28l-11 10V42h-3a6 6 0 0 1-6-6Z" fill="#D63A84"/>
      <path d="M32 35c-8-5-12-9-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 5-4 9-12 14Z" fill="#fff" stroke="none"/>`),
    backpack: s(`
      <path d="M24 16v-4a8 8 0 0 1 16 0v4"/>
      <rect x="12" y="16" width="40" height="43" rx="11" fill="#FF6B4A"/>
      <rect x="19" y="35" width="26" height="17" rx="4" fill="#FFC93C"/>
      <path d="M19 42h26M32 42v4"/>`),
    team: s(`
      ${person(15, 18, 6, 10, '#2D9CDB')}${person(49, 18, 6, 10, '#2ECC71')}
      <path d="M17 58h30" stroke="none"/>${person(32, 22, 8, 13, '#FF6B4A')}`),
    textcursor: s(`
      <rect x="5" y="9" width="54" height="46" rx="5" fill="#fff"/>
      <path d="M12 21h22M12 43h28" stroke="#9AA0B4"/>
      <rect x="11" y="27" width="31" height="10" fill="#BFE3FA" stroke="none"/>
      <path d="M12 32h28" stroke="#2D9CDB"/>
      <path d="M48 22v20M44 20h8M44 44h8" stroke="#FF6B4A" stroke-width="3.5"/>`),
    font: s(`
      <rect x="4" y="6" width="56" height="52" rx="8" fill="#fff"/>
      ${t(22, 47, 'A', '#6C5CE7', 38)}${t(44, 47, 'a', '#FF6B4A', 32)}`),
    align: s(`
      <rect x="6" y="6" width="52" height="52" rx="6" fill="#fff"/>
      <path d="M14 18h36M14 27h36M14 36h36M14 45h22" stroke="#16A3A0" stroke-width="4"/>`),
    list: s(`
      <rect x="6" y="6" width="52" height="52" rx="6" fill="#fff"/>
      <circle cx="16" cy="19" r="3.5" fill="#FF6B4A" stroke-width="2"/><circle cx="16" cy="32" r="3.5" fill="#FFC93C" stroke-width="2"/><circle cx="16" cy="45" r="3.5" fill="#2ECC71" stroke-width="2"/>
      <path d="M25 19h25M25 32h20M25 45h23" stroke="#9AA0B4" stroke-width="3.5"/>`),
    image: s(`
      <rect x="5" y="9" width="54" height="46" rx="5" fill="#7CC4F2"/>
      <path d="M6 50l16-18 10 10 8-8 18 18v-2H6Z" fill="#2ECC71"/>
      <circle cx="45" cy="21" r="5.5" fill="#FFC93C"/>
      <rect x="5" y="9" width="54" height="46" rx="5"/>`),
    table: s(`
      <rect x="5" y="9" width="54" height="46" rx="4" fill="#fff"/>
      <path d="M5 13a4 4 0 0 1 4-4h46a4 4 0 0 1 4 4v8H5Z" fill="#FFC93C"/>
      <path d="M5 33h54M5 44h54M23 9v46M41 9v46" stroke-width="2.5"/>
      <rect x="5" y="9" width="54" height="46" rx="4"/>`),
    formula: s(`
      <rect x="4" y="13" width="56" height="38" rx="7" fill="#fff"/>
      ${t(22, 42, 'f', '#2ECC71', 30, 'italic')}${t(40, 42, 'x', '#6C5CE7', 28, 'italic')}
      <path d="M50 22v20" stroke="#2D9CDB" stroke-width="2.5"/>`),
    model: s(`
      <path d="M8 58h48" stroke-width="3.5"/>
      <rect x="14" y="30" width="30" height="24" fill="#FFC93C"/>
      <path d="M9 32L29 13l20 19Z" fill="#FF6B4A"/>
      <rect x="24" y="40" width="10" height="14" fill="#fff"/>
      <rect x="44" y="22" width="12" height="34" rx="2" fill="#7CC4F2"/>
      <path d="M44 28h5M44 34h7M44 40h5M44 46h7" stroke-width="2"/>`),
    event: s(`
      <circle cx="32" cy="32" r="25" fill="#FFC93C"/>
      <path d="M36 10L20 36h12l-4 18 17-26H33Z" fill="#fff"/>`),
    puzzle: s(`
      <path transform="translate(5 -3)" d="M5 18h13a5.5 5.5 0 1 1 11 0h13v13a5.5 5.5 0 1 0 0 11v13H29a5.5 5.5 0 1 0-11 0H5V42a5.5 5.5 0 1 1 0-11Z" fill="#6C5CE7"/>
      <path d="M17 24a5 5 0 0 1 5-5" stroke="#fff" stroke-width="3"/>`),
    microbit: microbit(false),
    shake: microbit(true),
    note: s(`
      <path d="M24 46V15l28-7v32" stroke-width="4"/>
      <path d="M24 15l28-7v8l-28 7Z" fill="${K}"/>
      <ellipse cx="17" cy="47" rx="8" ry="6" fill="#6C5CE7"/>
      <ellipse cx="45" cy="41" rx="8" ry="6" fill="#D63A84"/>`),
    network: s(`
      <path d="M32 32L11 12M32 32l21-20M32 32L11 52M32 32l21 20"/>
      <circle cx="11" cy="12" r="7" fill="#FF6B4A"/><circle cx="53" cy="12" r="7" fill="#FFC93C"/>
      <circle cx="11" cy="52" r="7" fill="#2ECC71"/><circle cx="53" cy="52" r="7" fill="#6C5CE7"/>
      <circle cx="32" cy="32" r="10" fill="#2D9CDB"/>`),
    shield: s(`
      <path d="M32 4l22 8v16c0 14-9 25-22 32C19 53 10 42 10 28V12Z" fill="#2ECC71"/>
      <path d="M22 32l7 7 13-14" stroke="#fff" stroke-width="5"/>`),
    profile: s(`
      <rect x="4" y="12" width="56" height="40" rx="5" fill="#fff"/>
      <circle cx="20" cy="27" r="6.5" fill="#FFD9B0"/>
      <path d="M9 45a11 11 0 0 1 22 0Z" fill="#2D9CDB"/>
      <path d="M37 25h16M37 33h12M37 41h16" stroke="#9AA0B4"/>`),
    apps: s(`
      <rect x="7" y="7" width="22" height="22" rx="6" fill="#FF6B4A"/><rect x="35" y="7" width="22" height="22" rx="6" fill="#FFC93C"/>
      <rect x="7" y="35" width="22" height="22" rx="6" fill="#2D9CDB"/><rect x="35" y="35" width="22" height="22" rx="6" fill="#2ECC71"/>
      <circle cx="18" cy="18" r="4" fill="#fff" stroke="none"/><path d="M40 23l6-10 6 10Z" fill="#fff" stroke="none"/>
      <rect x="13" y="41" width="10" height="10" rx="1.5" fill="#fff" stroke="none"/><path d="M40 46l4 4 8-8" stroke="#fff" stroke-width="3.5"/>`),
    browser: win(`<circle cx="32" cy="38" r="10" fill="#2D9CDB"/><ellipse cx="32" cy="38" rx="4" ry="10" stroke="#fff" stroke-width="2"/><path d="M22 38h20" stroke="#fff" stroke-width="2"/><circle cx="32" cy="38" r="10"/>`),
    web: win(`<rect x="10" y="25" width="19" height="15" rx="2" fill="#FFC93C" stroke-width="2.5"/>
      <path d="M35 27h17M35 33h13M35 39h17M10 46h42M10 51h28" stroke="#9AA0B4" stroke-width="2.5"/>`),
    cloud: s(`
      <path d="M18 49a12 12 0 0 1-1-24 15 15 0 0 1 29-3 11 11 0 0 1 3 27Z" fill="#7CC4F2"/>
      <path d="M32 44V30M26 35l6-6 6 6" stroke="#fff" stroke-width="4"/>`),
    key: s(`
      <rect x="44" y="34" width="5" height="9" rx="1" fill="#FFC93C"/><rect x="52" y="34" width="5" height="12" rx="1" fill="#FFC93C"/>
      <rect x="28" y="28" width="31" height="8" rx="2" fill="#FFC93C"/>
      <circle cx="20" cy="32" r="14" fill="#FFC93C"/>
      <circle cx="16" cy="32" r="4" fill="#fff"/>`),
    chat: s(`
      <path d="M6 12a5 5 0 0 1 5-5h28a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H20l-8 7v-7h-1a5 5 0 0 1-5-5Z" fill="#2D9CDB"/>
      <path d="M58 30a5 5 0 0 0-5-5H27a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h17l8 7v-7h1a5 5 0 0 0 5-5Z" fill="#FFC93C"/>
      <circle cx="32" cy="37" r="2.5" fill="${K}" stroke="none"/><circle cx="40" cy="37" r="2.5" fill="${K}" stroke="none"/><circle cx="48" cy="37" r="2.5" fill="${K}" stroke="none"/>`),
    pixel: s(`
      ${['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'].map((row, y)=>[...row].map((c, x)=>c === 'X'
        ? `<rect x="${4 + x * 8}" y="${8 + y * 8}" width="8" height="8" fill="${(x + y) % 3 ? '#FF5A4E' : '#FF8A75'}" stroke-width="2"/>` : '').join('')).join('')}`),
    license: s(`
      <rect x="5" y="7" width="54" height="38" rx="4" fill="#fff"/>
      <path d="M12 16h28M12 24h20M12 32h16" stroke="#9AA0B4" stroke-width="2.5"/>
      <path d="M38 46l-3 14 5-3 4 4 1-13Z" fill="#FF6B4A"/><path d="M50 46l3 14-5-3-4 4-1-13Z" fill="#FF6B4A"/>
      <circle cx="44" cy="38" r="10" fill="#FFC93C"/>
      ${star(44, 38, 5, 2.2, '#fff', 0)}`),
    copyright: s(`
      <circle cx="32" cy="32" r="25" fill="#FFC93C"/>
      <path d="M41 24a12 12 0 1 0 0 16" stroke-width="5"/>`),
    newspaper: s(`
      <path d="M50 18h8v32a5 5 0 0 1-10 0" fill="#E9ECF5"/>
      <path d="M6 10h44v40a5 5 0 0 0 5 5H11a5 5 0 0 1-5-5Z" fill="#fff"/>
      <rect x="12" y="16" width="32" height="7" rx="1.5" fill="${K}" stroke="none"/>
      <rect x="12" y="29" width="14" height="12" rx="1" fill="#7CC4F2" stroke-width="2"/>
      <path d="M31 30h13M31 36h13M31 42h10M12 48h32" stroke="#9AA0B4" stroke-width="2.5"/>`),
    template: s(`
      <rect x="9" y="5" width="46" height="54" rx="4" fill="#fff"/>
      <g stroke="#6C5CE7" stroke-width="2.5" stroke-dasharray="4 3">
        <rect x="15" y="11" width="34" height="9" rx="2"/><rect x="15" y="25" width="15" height="15" rx="2"/>
        <rect x="34" y="25" width="15" height="15" rx="2"/><rect x="15" y="45" width="34" height="8" rx="2"/></g>`),
    code: s(`
      <rect x="4" y="10" width="56" height="44" rx="6" fill="${K}"/>
      <path d="M22 24l-8 8 8 8M42 24l8 8-8 8" stroke="#2ECC71" stroke-width="4"/>
      <path d="M36 20l-8 24" stroke="#FFC93C" stroke-width="4"/>`),
    variable: s(`
      <rect x="10" y="24" width="44" height="33" rx="3" fill="#F2A516"/>
      <path d="M6 17h52v9H6Z" fill="#FFC93C"/>
      <rect x="20" y="33" width="24" height="15" rx="2" fill="#fff" stroke-width="2.5"/>
      ${t(32, 45, 'x', K, 16, 'italic')}
      <path d="M22 17l3-9h14l3 9" fill="#2ECC71" stroke-width="2.5"/>`),
    turtle: s(`
      <path d="M2 56c8-2 10-6 14-6" stroke="#FF6B4A" stroke-dasharray="3 4"/>
      <ellipse cx="18" cy="46" rx="5" ry="4" fill="#9BE7A8"/><ellipse cx="44" cy="46" rx="5" ry="4" fill="#9BE7A8"/>
      <ellipse cx="18" cy="22" rx="5" ry="4" fill="#9BE7A8"/><ellipse cx="44" cy="22" rx="5" ry="4" fill="#9BE7A8"/>
      <circle cx="54" cy="34" r="7" fill="#9BE7A8"/><circle cx="56" cy="32" r="1.6" fill="${K}" stroke="none"/>
      <ellipse cx="31" cy="34" rx="19" ry="15" fill="#2ECC71"/>
      <path d="M25 24l-5 10 5 10h12l5-10-5-10Z" stroke="#1E8E4E" stroke-width="2.5"/>`),
    bug: s(`
      <path d="M26 10l-4-6M38 10l4-6M18 28H6M18 38H6l-2 6M18 48l-8 6M46 28h12M46 38h12l2 6M46 48l8 6"/>
      <circle cx="32" cy="15" r="8" fill="${K}"/>
      <ellipse cx="32" cy="38" rx="15" ry="19" fill="#FF5A4E"/>
      <path d="M32 19v38"/><circle cx="25" cy="32" r="3" fill="${K}" stroke="none"/><circle cx="39" cy="42" r="3" fill="${K}" stroke="none"/><circle cx="25" cy="47" r="2.5" fill="${K}" stroke="none"/>`),
    play: s(`
      <rect x="4" y="12" width="56" height="40" rx="11" fill="#FF5A4E"/>
      <path d="M27 22v20l17-10Z" fill="#fff"/>`),
    mask: s(`
      <path d="M6 16c9-4 18-4 26 0 8-4 17-4 26 0 0 18-9 32-26 32S6 34 6 16Z" fill="#6C5CE7"/>
      <path d="M14 26c3-4 9-4 12 0-3 4-9 4-12 0ZM38 26c3-4 9-4 12 0-3 4-9 4-12 0Z" fill="#fff"/>
      <path d="M24 38c5 3 11 3 16 0" stroke="#fff"/>
      <path d="M32 48v4M14 54l4-4M50 54l-4-4" stroke="#9AA0B4" stroke-dasharray="2 4"/>`),
    mic: s(`
      <path d="M14 28a18 18 0 0 0 36 0M32 46v10M22 58h20"/>
      <rect x="22" y="4" width="20" height="34" rx="10" fill="#C7CBD9"/>
      <path d="M22 18h8M22 25h8" stroke-width="2.5"/>
      <circle cx="51" cy="10" r="5" fill="#FF5A4E"/>`),
    check: s(`
      <circle cx="32" cy="32" r="25" fill="#2ECC71"/>
      <path d="M20 33l8 8 16-17" stroke="#fff" stroke-width="5.5"/>`),
    contacts: s(`
      <path d="M52 14h6v10h-6M52 28h6v10h-6M52 42h6v10h-6" fill="#FFC93C" stroke-width="2.5"/>
      <rect x="10" y="5" width="42" height="54" rx="4" fill="#FF6B4A"/>
      <path d="M5 16h9M5 28h9M5 40h9M5 52h9" stroke-width="3.5"/>
      <circle cx="31" cy="25" r="7" fill="#fff"/>
      <path d="M19 46a12 12 0 0 1 24 0Z" fill="#fff"/>`),
    egov: s(`
      <path d="M5 22L32 6l27 16Z" fill="#FFC93C"/>
      <rect x="8" y="22" width="48" height="6" fill="#C7CBD9"/>
      ${[12, 23, 35, 46].map(x=>`<rect x="${x}" y="28" width="6" height="22" fill="#fff"/>`).join('')}
      <rect x="5" y="50" width="54" height="7" rx="1" fill="#C7CBD9"/>`),
    doctor: s(`
      <rect x="10" y="9" width="44" height="31" rx="3" fill="#fff"/>
      <path d="M15 26h8l4-8 6 16 4-8h12" stroke="#FF5A4E" stroke-width="3.5"/>
      <path d="M4 42h56l-5 8H9Z" fill="#C7CBD9"/>
      <circle cx="50" cy="50" r="10" fill="#2ECC71"/>
      <path d="M50 44v12M44 50h12" stroke="#fff" stroke-width="4"/>`),
    trash: s(`
      <path d="M14 15l4 42h28l4-42Z" fill="#9AA0B4"/>
      <path d="M25 24l1 25M32 24v25M39 24l-1 25" stroke="#fff" stroke-width="2.5"/>
      <path d="M8 15h48M25 15V9h14v6" stroke-width="3.5"/>`),
    warn: s(`
      <path d="M32 6L60 56H4Z" fill="#FFC93C"/>
      <path d="M32 24v15" stroke-width="5"/><circle cx="32" cy="47" r="3" fill="${K}" stroke="none"/>`),
    sort: s(`
      <rect x="5" y="7" width="14" height="9" rx="2" fill="#FF6B4A"/><rect x="5" y="20" width="23" height="9" rx="2" fill="#FFC93C"/>
      <rect x="5" y="33" width="32" height="9" rx="2" fill="#2ECC71"/><rect x="5" y="46" width="41" height="9" rx="2" fill="#2D9CDB"/>
      <path d="M55 8v46M49 47l6 7 6-7" stroke-width="3.5"/>`),
    binary: s(`
      <rect x="5" y="5" width="54" height="54" rx="9" fill="${K}"/>
      ${t(22, 30, '1', '#2ECC71', 22)}${t(42, 30, '0', '#FFC93C', 22)}${t(22, 52, '0', '#FFC93C', 22)}${t(42, 52, '1', '#2ECC71', 22)}`),
    ref: s(`
      <rect x="4" y="14" width="44" height="44" rx="3" fill="#fff"/>
      <rect x="18.7" y="28.7" width="14.6" height="14.6" fill="#FFC93C" stroke="none"/>
      <path d="M4 28.7h44M4 43.3h44M18.7 14v44M33.3 14v44" stroke-width="2"/>
      <rect x="4" y="14" width="44" height="44" rx="3"/>
      <path d="M34 30L22 42" stroke-width="3.5"/>
      <path d="M44 5l15 15-6 2-8 8 2 8-4 4-19-19 4-4 8 2 8-8Z" fill="#FF5A4E"/>`),
    sitemap: s(`
      <path d="M32 18v10M12 38v-10h40v10M32 28v10"/>
      <rect x="22" y="5" width="20" height="13" rx="3" fill="#2D9CDB"/>
      <rect x="3" y="38" width="18" height="13" rx="3" fill="#FFC93C"/><rect x="23" y="38" width="18" height="13" rx="3" fill="#2ECC71"/><rect x="43" y="38" width="18" height="13" rx="3" fill="#FF6B4A"/>`),
    vector: s(`
      <path d="M8 50L18 14M56 14L46 50" stroke="#9AA0B4" stroke-width="2"/>
      <path d="M8 50C18 14 46 50 56 14" stroke="#6C5CE7" stroke-width="4.5"/>
      <circle cx="18" cy="14" r="4" fill="#fff" stroke-width="2.5"/><circle cx="46" cy="50" r="4" fill="#fff" stroke-width="2.5"/>
      <rect x="3" y="45" width="10" height="10" rx="1.5" fill="#FFC93C" stroke-width="2.5"/><rect x="51" y="9" width="10" height="10" rx="1.5" fill="#FFC93C" stroke-width="2.5"/>`),
    scales: s(`
      <path d="M10 18L4 36M10 18l10 18M54 18l-10 18M54 18l6 18" stroke-width="2"/>
      <path d="M32 10v44M10 18h44" stroke-width="3.5"/>
      <rect x="20" y="53" width="24" height="6" rx="2" fill="#C7CBD9"/>
      <path d="M3 36a9 9 0 0 0 18 0Z" fill="#FFC93C"/><path d="M43 36a9 9 0 0 0 18 0Z" fill="#FFC93C"/>
      <circle cx="32" cy="9" r="4" fill="#FF6B4A"/>`),
    drive: s(`
      <rect x="22" y="4" width="20" height="17" fill="#C7CBD9"/>
      <rect x="26" y="9" width="4" height="4" fill="${K}" stroke="none"/><rect x="34" y="9" width="4" height="4" fill="${K}" stroke="none"/>
      <rect x="17" y="20" width="30" height="40" rx="5" fill="#2D9CDB"/>
      <rect x="23" y="34" width="18" height="12" rx="2" fill="#fff" stroke-width="2.5"/>`),
    leaf: s(`
      <path d="M10 54C10 24 28 8 56 8c0 30-16 46-46 46Z" fill="#2ECC71"/>
      <path d="M8 56L42 22M26 38h11M33 31V20" stroke="#fff" stroke-width="3"/>`),
    calc: s(`
      <rect x="12" y="4" width="40" height="56" rx="6" fill="${K}"/>
      <rect x="17" y="10" width="30" height="12" rx="2" fill="#9BE7A8" stroke="none"/>
      ${[0, 1, 2].map(r=>[0, 1, 2].map(c=>`<rect x="${18 + c * 10}" y="${28 + r * 10}" width="7" height="7" rx="1.5" fill="${r === 2 && c === 2 ? '#FF6B4A' : '#fff'}" stroke="none"/>`).join('')).join('')}`),
    terminal: s(`
      <rect x="4" y="8" width="56" height="48" rx="6" fill="${K}"/>
      <path d="M4 18h56" stroke="#5C6080" stroke-width="2"/>
      <path d="M13 28l9 6-9 6" stroke="#2ECC71" stroke-width="4"/>
      <path d="M27 42h16" stroke="#fff" stroke-width="4"/>`),
    func: s(`
      <path d="M3 32h12M11 28l4 4-4 4M49 32h12M57 28l4 4-4 4" stroke-width="3.5"/>
      <rect x="17" y="14" width="30" height="36" rx="6" fill="#6C5CE7"/>
      ${t(32, 42, 'f', '#fff', 26, 'italic')}`),
    app: s(`
      <rect x="16" y="3" width="32" height="58" rx="6" fill="${K}"/>
      <rect x="20" y="9" width="24" height="46" rx="2" fill="#fff" stroke="none"/>
      <rect x="20" y="9" width="24" height="8" fill="#2D9CDB" stroke="none"/>
      <rect x="23" y="21" width="18" height="12" rx="2" fill="#FFC93C" stroke="none"/>
      <path d="M24 38h16M24 43h12" stroke="#9AA0B4" stroke-width="2.5"/>
      <rect x="23" y="47" width="18" height="5" rx="2.5" fill="#FF6B4A" stroke="none"/>`),
    grid: s(`
      <rect x="5" y="9" width="54" height="46" rx="4" fill="#fff"/>
      <path d="M23 9v46M41 9v46M5 24.3h54M5 39.7h54" stroke="#9AA0B4" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="41" cy="24.3" r="8" fill="#FF6B4A"/>
      <path d="M8 52l12-12 8 8" stroke="#2ECC71" stroke-width="3.5"/>
      <rect x="5" y="9" width="54" height="46" rx="4"/>`),
    wireframe: s(`
      <rect x="5" y="7" width="54" height="50" rx="4" fill="#fff"/>
      <rect x="11" y="13" width="42" height="7" rx="2" fill="#E9ECF5" stroke-width="2"/>
      <rect x="11" y="25" width="20" height="18" rx="2" stroke="#9AA0B4" stroke-width="2"/>
      <path d="M11 25l20 18M31 25L11 43" stroke="#9AA0B4" stroke-width="2"/>
      <path d="M36 27h17M36 33h17M36 39h11" stroke="#9AA0B4" stroke-width="2.5"/>
      <rect x="11" y="48" width="16" height="5" rx="2.5" fill="#2D9CDB" stroke="none"/>`),
    server: s(`
      ${[6, 25, 44].map(y=>`<rect x="10" y="${y}" width="44" height="14" rx="3" fill="#C7CBD9"/><circle cx="18" cy="${y + 7}" r="2.5" fill="#2ECC71" stroke="none"/><path d="M34 ${y + 7}h14" stroke-width="2.5"/>`).join('')}`),
    target: s(`
      <circle cx="30" cy="34" r="24" fill="#FF5A4E"/><circle cx="30" cy="34" r="16" fill="#fff"/><circle cx="30" cy="34" r="8" fill="#FF5A4E"/>
      <path d="M30 34L56 8" stroke-width="3.5"/><path d="M50 6l6 2 2 6M48 14l6-6" stroke="#2D9CDB" stroke-width="3.5"/>`),
    brand: s(`
      <path d="M6 10h24l28 28-20 20L6 30Z" fill="#FFC93C"/>
      <circle cx="16" cy="20" r="4" fill="#fff"/>
      ${star(33, 37, 9, 4, '#FF6B4A', 2.5)}`),
    flag: s(`
      <path d="M12 6v54" stroke-width="4"/>
      <path d="M14 9c10-5 18 5 28 0s12-2 14-2v26c-6 0-8 4-16 4s-14-8-26-2Z" fill="#FF5A4E"/>`),
    smarthome: s(`
      <path d="M8 30L32 8l24 22v27H8Z" fill="#7CC4F2"/>
      <path d="M20 38a17 17 0 0 1 24 0M25 44a9 9 0 0 1 14 0" stroke="#fff" stroke-width="4"/>
      <circle cx="32" cy="50" r="3" fill="#fff" stroke="none"/>
      <path d="M4 33L32 7l28 26" stroke-width="3.5"/>`),
    db: s(`
      <path d="M10 14v36c0 5 10 8 22 8s22-3 22-8V14" fill="#2D9CDB"/>
      <path d="M10 26c0 5 10 8 22 8s22-3 22-8M10 38c0 5 10 8 22 8s22-3 22-8"/>
      <ellipse cx="32" cy="14" rx="22" ry="8" fill="#7CC4F2"/>`),
    link: s(`
      ${[[22, 42, '#2D9CDB'], [42, 22, '#FF6B4A']].map(([x, y, c])=>`<rect x="${x - 15}" y="${y - 8}" width="30" height="16" rx="8" transform="rotate(-45 ${x} ${y})" stroke-width="10"/><rect x="${x - 15}" y="${y - 8}" width="30" height="16" rx="8" transform="rotate(-45 ${x} ${y})" stroke="${c}" stroke-width="4.5"/>`).join('')}`),
    filter: s(`
      <path d="M6 8h52L38 32v19l-12 7V32Z" fill="#6C5CE7"/>
      <path d="M14 14h36" stroke="#fff" stroke-width="2.5"/>`),
    cube: s(`
      <path d="M8 18v28l24 12V30Z" fill="#2D9CDB"/>
      <path d="M56 18v28L32 58V30Z" fill="#1F5F99"/>
      <path d="M32 6l24 12-24 12L8 18Z" fill="#7CC4F2"/>`),
    blocks: s(`
      <rect x="5" y="35" width="25" height="23" rx="2" fill="#FF6B4A"/>
      <rect x="34" y="35" width="25" height="23" rx="2" fill="#2D9CDB"/>
      <path d="M18 33L32 8l14 25Z" fill="#FFC93C"/>
      <circle cx="17.5" cy="46.5" r="5" stroke="#fff" stroke-width="2.5"/><path d="M41 42l11 9M52 42l-11 9" stroke="#fff" stroke-width="2.5"/>`),
    extrude: s(`
      <path d="M6 46l26-11 26 11-26 11Z" fill="#FFC93C"/>
      <path d="M14 42V20l18-8 18 8v22" stroke="#9AA0B4" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M32 44V12M24 20l8-8 8 8" stroke="#FF6B4A" stroke-width="4"/>`),
    camera: s(`
      <path d="M20 19l4-8h16l4 8" fill="${K}"/>
      <rect x="4" y="18" width="56" height="37" rx="6" fill="${K}"/>
      <circle cx="32" cy="37" r="13" fill="#fff"/><circle cx="32" cy="37" r="8" fill="#2D9CDB" stroke="none"/>
      <circle cx="29" cy="34" r="2.5" fill="#fff" stroke="none"/>
      <rect x="47" y="23" width="7" height="4" rx="1" fill="#FFC93C" stroke="none"/>`),
    house: s(`
      <rect x="40" y="10" width="7" height="14" fill="#C7CBD9"/>
      <rect x="12" y="30" width="40" height="27" fill="#FFC93C"/>
      <path d="M5 32L32 9l27 23Z" fill="#FF6B4A"/>
      <rect x="18" y="36" width="10" height="10" rx="1" fill="#7CC4F2" stroke-width="2.5"/>
      <rect x="34" y="39" width="11" height="18" rx="1" fill="#fff"/>`),
    python: s(`
      <path d="M31 5c-11 0-13 5-13 9v6h14v3H12c-5 0-8 4-8 11s3 12 8 12h5v-7c0-5 4-9 9-9h13c4 0 7-3 7-7V14c0-5-4-9-15-9Z" fill="#3776AB"/>
      <g transform="rotate(180 32 32)"><path d="M31 5c-11 0-13 5-13 9v6h14v3H12c-5 0-8 4-8 11s3 12 8 12h5v-7c0-5 4-9 9-9h13c4 0 7-3 7-7V14c0-5-4-9-15-9Z" fill="#FFD43B"/></g>
      <circle cx="24.5" cy="11.5" r="2.6" fill="#fff"/><circle cx="39.5" cy="52.5" r="2.6" fill="#fff"/>`),
    abc: s(`
      ${[[4, '#FF6B4A', 'A'], [23, '#FFC93C', 'b'], [42, '#2ECC71', 'c']].map(([x, c, l], i)=>`<rect x="${x}" y="${16 + (i % 2) * 6}" width="18" height="24" rx="4" fill="${c}"/>${t(x + 9, 34 + (i % 2) * 6, l, K, 18)}`).join('')}`),
    scissors: s(`
      <path d="M26 39L50 6M38 39L14 6" stroke-width="8"/>
      <path d="M26 39L50 6M38 39L14 6" stroke="#C7CBD9" stroke-width="3"/>
      <circle cx="21" cy="47" r="9" fill="#FF6B4A"/><circle cx="43" cy="47" r="9" fill="#FF6B4A"/>
      <circle cx="21" cy="47" r="3.5" fill="#fff"/><circle cx="43" cy="47" r="3.5" fill="#fff"/>
      <circle cx="32" cy="24" r="2.5" fill="${K}" stroke="none"/>`),
    lock: s(`
      <path d="M20 28v-8a12 12 0 0 1 24 0v8" stroke-width="6"/>
      <rect x="11" y="28" width="42" height="31" rx="5" fill="#FFC93C"/>
      <circle cx="32" cy="40" r="4" fill="${K}" stroke="none"/><path d="M32 42v8" stroke-width="4"/>`),
    dice: s(`
      <rect x="8" y="8" width="48" height="48" rx="11" fill="#fff"/>
      ${[[20, 20], [44, 20], [32, 32], [20, 44], [44, 44]].map(([x, y])=>`<circle cx="${x}" cy="${y}" r="4.2" fill="#FF5A4E" stroke="none"/>`).join('')}`),
    quiz: s(`
      <circle cx="32" cy="32" r="25" fill="#6C5CE7"/>
      ${t(32, 45, '?', '#FFC93C', 36)}
      ${star(53, 11, 6, 2.6, '#FFC93C', 2)}`),
    compass: s(`
      <circle cx="32" cy="32" r="26" fill="#2D9CDB"/>
      <circle cx="32" cy="32" r="19" fill="#fff"/>
      <path d="M32 15v4M32 45v4M15 32h4M45 32h4" stroke-width="2.5"/>
      <path d="M32 32l-6-3 6-14 6 14Z" fill="#FF5A4E" stroke-width="2.5"/>
      <path d="M32 32l6 3-6 14-6-14Z" fill="#C7CBD9" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="3" fill="${K}" stroke="none"/>`),
    trail: s(`
      <path d="M8 54c10 0 8-14 18-14s8-12 16-14" stroke="#9AA0B4" stroke-dasharray="1 6" stroke-width="4"/>
      <circle cx="8" cy="54" r="5" fill="#2ECC71"/><circle cx="26" cy="40" r="5" fill="#FFC93C"/>
      ${arrow(38, 8, 1.7)}`)
  };
})();
