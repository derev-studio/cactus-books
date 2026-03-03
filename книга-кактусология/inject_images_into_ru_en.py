#!/usr/bin/env python3
# Вставляет те же картинки в русскую и английскую версии книги и добавляет переключатель языка.
# Запускать после build_book_with_images.py (чтобы был актуальный book-read.html).

import re

def extract_blocks(html_path, content_start=None, content_end=None):
    """Извлекает из HTML последовательность блоков: ('text', tag, content) или ('img', src)."""
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    if content_start is None:
        m = re.search(r'<div class="page-content">\s*', html)
        content_start = m.end() if m else 0
    if content_end is None:
        m = re.search(r'</div>\s*</div>\s*</body>', html)
        content_end = m.start() if m else len(html)
    content = html[content_start:content_end]
    blocks = []
    # Блоки: <h2>...</h2>, <h3>...</h3>, <p>...</p>, <figure>...</figure>
    pos = 0
    while pos < len(content):
        # Figure
        fig = re.match(r'<figure[^>]*>.*?<img\s+src="([^"]+)".*?</figure>', content[pos:], re.DOTALL)
        if fig:
            blocks.append(("img", fig.group(1)))
            pos += fig.end()
            continue
        # h2
        h2 = re.match(r'<(h2)[^>]*>(.*?)</h2>', content[pos:], re.DOTALL)
        if h2:
            blocks.append(("text", "h2", h2.group(2)))
            pos += h2.end()
            continue
        # h3
        h3 = re.match(r'<(h3)[^>]*>(.*?)</h3>', content[pos:], re.DOTALL)
        if h3:
            blocks.append(("text", "h3", h3.group(2)))
            pos += h3.end()
            continue
        # p
        p = re.match(r'<(p)[^>]*>(.*?)</p>', content[pos:], re.DOTALL)
        if p:
            blocks.append(("text", "p", p.group(2)))
            pos += p.end()
            continue
        pos += 1
    return blocks

def extract_text_blocks_only(html_path):
    """Извлекает только текстовые блоки (tag, content) по порядку."""
    blocks = extract_blocks(html_path)
    return [(tag, cont) for t, tag, cont in (b for b in blocks if b[0] == "text")]

def get_uk_structure(html_path):
    """Возвращает (positions, image_srcs): positions[i] = после какого текстового блока идёт i-я картинка."""
    blocks = extract_blocks(html_path)
    text_count = 0
    positions = []
    image_srcs = []
    for b in blocks:
        if b[0] == "text":
            text_count += 1
        elif b[0] == "img":
            positions.append(text_count - 1)  # после последнего текстового блока
            image_srcs.append(b[1])
    return positions, image_srcs

def build_page_with_images(lang, title, back_text, lang_links, text_blocks, positions, image_srcs):
    """lang_links: (current_label, links_dict) например ('Русский', {'uk':'book-read.html', 'ru':None, 'en':'book-read-en.html'})."""
    num_text_uk = max(positions) + 1 if positions else 0
    n_ru = len(text_blocks)
    if n_ru == 0:
        return None
    # Куда вставлять картинку j в RU/EN: после блока r = round(positions[j] * (n_ru-1) / max(0, num_text_uk-1))
    figures_after = {}  # r -> [(img_src), ...]
    for j, pos in enumerate(positions):
        if num_text_uk <= 1:
            r = 0
        else:
            r = round(pos * (n_ru - 1) / (num_text_uk - 1))
        r = min(r, n_ru - 1)
        figures_after.setdefault(r, []).append(image_srcs[j] if j < len(image_srcs) else "media/image1.jpeg")
    header = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<link rel="stylesheet" href="../theme.css" />
<link rel="stylesheet" href="../page-common.css" />
<style>
body {{ margin: 0; min-height: 100vh; background: var(--cactus-bg); font-family: inherit; padding: 1rem; }}
.page-main {{ max-width: 52rem; margin: 0 auto; padding: 1.5rem; background: var(--cactus-reading-bg); color: var(--cactus-reading-text); box-shadow: var(--cactus-reading-shadow); border-radius: var(--cactus-reading-radius); }}
.book-back {{ margin-bottom: 1rem; }}
.book-back a {{ color: #165a9e; }}
.page-content .book-img {{ margin: 1rem 0; }}
.page-content .book-img img {{ max-width: 100%; height: auto; border-radius: 8px; display: block; }}
</style>
</head>
<body>
<div class="page-main">
<p class="book-back"><a href="../book.html">← {back_text}</a></p>
<p class="book-lang" style="margin-bottom:1rem; font-size:1.1rem;"><strong>Одна книга, три мови:</strong> {lang_links}</p>
<div class="page-content">
"""
    footer = """
</div>
</div>
</body>
</html>
"""
    out = []
    out.append(header.format(lang=lang, title=title, back_text=back_text, lang_links=lang_links))
    for i, (tag, content) in enumerate(text_blocks):
        out.append(f"<{tag}>{content}</{tag}>")
        for src in figures_after.get(i, []):
            out.append(f'<figure class="book-img"><img src="{src}" alt="" loading="lazy" /></figure>')
    out.append(footer)
    return "\n".join(out)

def main():
    uk_path = "book-read.html"
    ru_path = "book-read-ru.html"
    en_path = "book-read-en.html"

    positions, image_srcs = get_uk_structure(uk_path)
    n_uk_text = max(positions) + 1 if positions else 0
    print("UK: text blocks", n_uk_text, "images", len(image_srcs))

    # Русская версия
    ru_blocks = extract_text_blocks_only(ru_path)
    print("RU: text blocks", len(ru_blocks))
    if ru_blocks:
        lang_links_ru = '<a href="book-read.html">Українська</a> · <span style="color:var(--cactus-reading-muted);">Русский</span> · <a href="book-read-en.html">English</a>'
        html_ru = build_page_with_images(
            "ru", "Кактусология — читать (с картинками)", "Назад к Кактусологии",
            lang_links_ru, ru_blocks, positions, image_srcs
        )
        with open(ru_path, "w", encoding="utf-8") as f:
            f.write(html_ru)
        print("Written", ru_path)

    # Английская версия
    en_blocks = extract_text_blocks_only(en_path)
    print("EN: text blocks", len(en_blocks))
    if en_blocks:
        lang_links_en = '<a href="book-read.html">Українська</a> · <a href="book-read-ru.html">Русский</a> · <span style="color:var(--cactus-reading-muted);">English</span>'
        html_en = build_page_with_images(
            "en", "Cactology — read (with pictures)", "Back to Cactology",
            lang_links_en, en_blocks, positions, image_srcs
        )
        with open(en_path, "w", encoding="utf-8") as f:
            f.write(html_en)
        print("Written", en_path)

    print("OK: русская и английская версии теперь с теми же картинками и переключателем языка.")

if __name__ == "__main__":
    main()
