#!/usr/bin/env python3
"""
Собирает data/stories.json из всех articles/*.json.
Запускайте после добавления/правки статей в Prose.io (или вручную).
ID истории = имя файла без расширения (например zelenyj-vecher).
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTICLES_DIR = os.path.join(ROOT, "articles")
OUT_PATH = os.path.join(ROOT, "data", "stories.json")

def main():
    stories = []
    if not os.path.isdir(ARTICLES_DIR):
        os.makedirs(ARTICLES_DIR, exist_ok=True)
        with open(OUT_PATH, "w", encoding="utf-8") as f:
            json.dump({"stories": []}, f, ensure_ascii=False, indent=2)
        return

    for name in sorted(os.listdir(ARTICLES_DIR)):
        if not name.endswith(".json"):
            continue
        path = os.path.join(ARTICLES_DIR, name)
        if not os.path.isfile(path):
            continue
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            continue
        story_id = name[:-5]
        title = data.get("title") or story_id
        image = data.get("image") or ""
        content = data.get("content") or ""
        stories.append({
            "id": story_id,
            "title": title,
            "coverUrl": image,
            "content": content,
        })

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump({"stories": stories}, f, ensure_ascii=False, indent=2)
    print("Written", len(stories), "stories to", OUT_PATH)

if __name__ == "__main__":
    main()
