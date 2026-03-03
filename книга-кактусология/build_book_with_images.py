#!/usr/bin/env python3
# Собирает book-read.html с текстом И картинками из Кактусология_полная_с_картинками.docx
# Сначала извлекает картинки из docx в папку media/, затем собирает HTML.
import zipfile
import re
import html as html_module
import os

docx_path = "Кактусология_полная_с_картинками.docx"
if not os.path.isfile(docx_path):
    print("ОШИБКА: Файл не найден:", os.path.abspath(docx_path))
    print("Положите сюда полную книгу с картинками (Кактусология_полная_с_картинками.docx) и запустите скрипт снова.")
    exit(1)

z = zipfile.ZipFile(docx_path, "r")

# Извлечь все картинки из docx в папку media/
os.makedirs("media", exist_ok=True)
for name in z.namelist():
    if name.startswith("word/media/") and not name.endswith("/"):
        data = z.read(name)
        out_name = os.path.join("media", os.path.basename(name))
        with open(out_name, "wb") as f:
            f.write(data)
print("Извлечено картинок в media/:", len([n for n in z.namelist() if n.startswith("word/media/") and not n.endswith("/")]))

# rId -> media/filename
rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
rid_to_file = {}
for m in re.finditer(r'Relationship Id="(rId\d+)"[^>]*Target="(media/[^"]+)"', rels):
    rid_to_file[m.group(1)] = m.group(2).split("/")[-1]  # только имя файла

# document body
xml = z.read("word/document.xml").decode("utf-8")
# только body (без стилей и т.д.)
body_match = re.search(r'<w:body[^>]*>(.*?)</w:body>', xml, re.DOTALL)
body = body_match.group(1) if body_match else xml

out = []
# Разбиваем по параграфам (w:p может содержать вложенные w:p в некоторых случаях - упрощённо ищем по тегу)
p_blocks = re.findall(r'<w:p\s[^>]*>(.*?)</w:p>', body, re.DOTALL)
for block in p_blocks:
    texts = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', block)
    embeds = re.findall(r'r:embed="(rId\d+)"', block)
    para_text = "".join(texts).strip()
    # Текст параграфа
    if para_text:
        tag = "h3" if ("Heading" in block or (len(para_text) < 60 and para_text.endswith(":"))) else "h2" if len(para_text) < 100 else "p"
        out.append(f"<{tag}>{html_module.escape(para_text)}</{tag}>")
    # Картинки в этом параграфе
    for rid in embeds:
        fname = rid_to_file.get(rid)
        if fname and re.match(r'image\d+\.(jpeg|jpg|png)', fname, re.I):
            out.append(f'<figure class="book-img"><img src="media/{fname}" alt="" loading="lazy" /></figure>')
z.close()

body_html = "\n".join(out)
header = """<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Кактусологія — читати (з картинками)</title>
<link rel="stylesheet" href="../theme.css" />
<link rel="stylesheet" href="../page-common.css" />
<style>
body { margin: 0; min-height: 100vh; background: var(--cactus-bg); font-family: inherit; padding: 1rem; }
.page-main { max-width: 52rem; margin: 0 auto; padding: 1.5rem; background: var(--cactus-reading-bg); color: var(--cactus-reading-text); box-shadow: var(--cactus-reading-shadow); border-radius: var(--cactus-reading-radius); }
.book-back { margin-bottom: 1rem; }
.book-back a { color: #165a9e; }
.page-content .book-img { margin: 1rem 0; }
.page-content .book-img img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
</style>
</head>
<body>
<div class="page-main">
<p class="book-back"><a href="../book.html">← Назад до Кактусології</a></p>
<div class="page-content">
"""
footer = "\n</div>\n</div>\n</body>\n</html>\n"
with open("book-read.html", "w", encoding="utf-8") as f:
    f.write(header + body_html + footer)
print("OK: blocks", len(out), "chars", len(body_html))
