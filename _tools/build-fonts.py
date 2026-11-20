#!/usr/bin/env python3
"""Завантажує шрифти Google Fonts у assets/fonts/ і складає assets/fonts/fonts.css.

Сайт не тягне шрифти з fonts.googleapis.com: так сторінки працюють без інтернету
й не залежать від Google. Усі сімейства описано в одному fonts.css — браузер
завантажує файл шрифту лише тоді, коли сторінка справді ним пише.

Новий шрифт: додати рядок у FAMILIES і запустити
    python3 _tools/build-fonts.py
Старі файли шрифтів, яких уже немає в FAMILIES, скрипт видаляє.
"""
import os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'fonts')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/124.0 Safari/537.36')  # щоб Google віддав woff2

# (назва файлу, параметр family= для css2). Діапазон ваг — змінний шрифт одним файлом.
FAMILIES = [
    ('baloo2',        'Baloo+2:wght@400..800'),
    ('nunito-sans',   'Nunito+Sans:wght@400..800'),
    ('roboto',        'Roboto:wght@400..700'),
    ('jetbrains-mono','JetBrains+Mono:wght@400..700'),
    # декоративні — урок і практична «Параметри шрифту» (6 клас), «Лист у майбутнє»
    ('caveat',        'Caveat:wght@400..700'),
    ('lobster',       'Lobster'),
    ('merriweather',  'Merriweather:wght@400;700'),
    ('pt-serif',      'PT+Serif:wght@400;700'),
    ('montserrat',    'Montserrat:wght@400..700'),
    ('pacifico',      'Pacifico'),
    ('marck-script',  'Marck+Script'),
    # значки інтерфейсів Google: усі значки, оптичний розмір 20, вага 400, FILL 0..1
    ('material-symbols', 'Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,400,0..1,0'),
]
SUBSETS = {'cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'}  # без грецької, в'єтнамської тощо


def get(url):
    # системний curl: Python на macOS часто не має сертифікатів для HTTPS
    return subprocess.run(['curl', '-sfL', '--max-time', '60', '-A', UA, url],
                          check=True, capture_output=True).stdout


def main():
    os.makedirs(OUT, exist_ok=True)
    parts, keep = [], set()
    for name, spec in FAMILIES:
        css = get(f'https://fonts.googleapis.com/css2?family={spec}&display=swap').decode()
        # блоки «/* subset */ @font-face {…}» і решта (клас .material-symbols-outlined)
        blocks = re.findall(r'(?:/\*\s*([\w-]+)\s*\*/\s*)?(@font-face\s*\{[^}]*\})', css)
        tail = re.sub(r'(?:/\*[^*]*\*/\s*)?@font-face\s*\{[^}]*\}', '', css).strip()
        out = [f'/* {spec.split(":")[0].replace("+", " ")} */']
        for subset, face in blocks:
            if subset and subset not in SUBSETS and subset != 'fallback':
                continue
            url = re.search(r'url\((https://[^)]+)\)', face).group(1)
            weight = re.search(r'font-weight:\s*([\d ]+);', face).group(1).replace(' ', '-')
            fname = f'{name}-{subset or "all"}-{weight}.woff2'
            if fname not in keep:
                with open(os.path.join(OUT, fname), 'wb') as f:
                    f.write(get(url))
                keep.add(fname)
            face = face.replace(url, fname)
            if name == 'material-symbols':
                face = face.replace('font-display: swap', 'font-display: block')
            out.append(face)
        if tail:
            out.append(tail)
        parts.append('\n'.join(out))
        print(f'{name}: {len(blocks)} блок(ів)')
    header = ('/* Шрифти сайту — локальні копії Google Fonts (OFL / Apache 2.0).\n'
              '   Згенеровано _tools/build-fonts.py — не редагувати вручну. */\n\n')
    with open(os.path.join(OUT, 'fonts.css'), 'w') as f:
        f.write(header + '\n\n'.join(parts) + '\n')
    for f in os.listdir(OUT):
        if f.endswith('.woff2') and f not in keep:
            os.remove(os.path.join(OUT, f))
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in keep)
    print(f'Файлів: {len(keep)}, разом {total // 1024} КБ')


if __name__ == '__main__':
    main()
