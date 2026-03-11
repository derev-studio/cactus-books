#!/usr/bin/env python3
"""
Просмотр GBIF occurrence.txt без загрузки всего файла в память.
Файл может быть 50+ МБ — читаем только начало и считаем строки построчно.

Использование:
  python3 scripts/inspect_gbif_occurrence.py [путь к occurrence.txt]

Если путь не указан, ищет data/sources/gbif/*/occurrence.txt
"""

import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
DEFAULT_GLOB = PROJECT / "data" / "sources" / "gbif" / "*" / "occurrence.txt"


def find_occurrence_file():
    # data/sources/gbif/0026914-.../occurrence.txt
    matches = list(Path(DEFAULT_GLOB.parent).glob(Path(DEFAULT_GLOB.name)))
    if matches:
        return matches[0]
    # или в корне проекта: cactus/0026914-.../occurrence.txt
    for d in PROJECT.iterdir():
        if d.is_dir() and d.name.startswith("0026914"):
            occ = d / "occurrence.txt"
            if occ.exists():
                return occ
    return None


def main():
    if len(sys.argv) >= 2:
        path = Path(sys.argv[1])
    else:
        path = find_occurrence_file()
    if not path or not path.exists():
        print("Файл occurrence.txt не найден. Укажи путь или положи архив в data/sources/gbif/0026914-.../")
        return
    print("Файл:", path)
    print("Размер: {:.1f} МБ".format(path.stat().st_size / (1024 * 1024)))
    print()

    max_preview = 25  # строк для показа
    count = 0
    header = None
    preview_lines = []

    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            count += 1
            if count == 1:
                header = line.strip()
                preview_lines.append(header)
                continue
            if count <= max_preview:
                preview_lines.append(line.rstrip())
            if count % 500_000 == 0 and count > 0:
                print("  … прочитано строк:", count, end="\r")

    print("Всего строк (с заголовком):", count)
    print()
    print("--- Заголовок (колонки) ---")
    print(header[:500] + ("..." if len(header) > 500 else ""))
    print()
    print("--- Первые 5 записей (начало каждой строки) ---")
    for i, ln in enumerate(preview_lines[1:6], 1):
        print(i, ln[:200] + ("..." if len(ln) > 200 else ""))
    print()
    print("Готово. Файл не загружался целиком в память.")


if __name__ == "__main__":
    main()
