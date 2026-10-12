#!/usr/bin/env python3
"""Перевірка уроків, що працюють на ядрі (assets/lesson.js).

Кожен такий урок відкривається в безголовому Chrome з ?selftest: ядро саме випадково «проходить» урок,
будує посилання з результатами й пише підсумок у заголовок сторінки. Скрипт збирає ці підсумки.

Запуск із кореня репозиторію:
    python3 _tools/check-lessons.py              # усі уроки на ядрі
    python3 _tools/check-lessons.py 7/lesson-cloud-services
Код виходу 1, якщо хоч один урок з помилками чи попередженнями.

Тека _tools/ не публікується на GitHub Pages (Jekyll пропускає теки, що починаються з «_»).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
CORE = 'assets/lesson.js'


def lessons(args):
    if args:
        return [ROOT / a.rstrip('/') / 'index.html' if not a.endswith('.html') else ROOT / a for a in args]
    return sorted(p for p in ROOT.glob('*/*/index.html') if CORE in p.read_text(encoding='utf-8'))


def check(page):
    url = page.as_uri() + '?selftest'
    out = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--virtual-time-budget=8000', '--dump-dom', url],
                         capture_output=True, text=True, timeout=120).stdout
    m = re.search(r'<title>SELFTEST (.*?)</title>', out, re.S)
    if not m:
        return None
    return json.loads(m.group(1).replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"'))


def main():
    pages = lessons(sys.argv[1:])
    if not pages:
        print('Уроків на ядрі не знайдено.')
        return 0
    failed = 0
    for page in pages:
        name = page.parent.relative_to(ROOT)
        r = check(page)
        if r is None:
            failed += 1
            print(f'✗ {name}: немає звіту — ядро не завантажилось або впало до самоперевірки')
            continue
        problems = r['errors'] + r['warnings']
        if not r['finalQuiz']:
            problems.append('немає фінального тесту (makeFinalQuiz)')
        mark = '✗' if problems else '✓'
        failed += bool(problems)
        print(f"{mark} {name}: блоків {r['blocks']} (випадково пройдено {r['finished']}), нейрончиків {r['neurons']}, посилання {r.get('link', '—')} симв.")
        for p in problems:
            print(f'    · {p}')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
