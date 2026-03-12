#!/usr/bin/env python3
"""
Подтягивает из Википедии (REST API) краткое описание (extract) и главное фото (thumbnail)
для видов в data/species/*.json и записывает в morphology_stem и photo_main_url.

В cactus_cards_species.csv эти поля пустые; список статей есть в cactus_wikipedia_list.csv.
Запросы к API — с паузой 1 сек, User-Agent как требует Википедия.
"""

import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
SPECIES_DIR = PROJECT / "data" / "species"
WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/"
USER_AGENT = "CactusBooks/1.0 (educational; taxonomy project)"


def wiki_title(species_name: str) -> str:
    """Из полного имени делаем заголовок страницы Википедии: Genus species."""
    s = (species_name or "").strip()
    # Часто у нас имя идёт с автором без скобок: "Ariocarpus retusus Scheidw."
    # Для Википедии почти всегда нужен только "Ariocarpus retusus".
    s = re.sub(r"\s*[\(\[].*$", "", s).strip()
    parts = s.split()
    if len(parts) >= 2:
        genus = parts[0].replace("×", "").strip()
        epithet = parts[1].replace("×", "").strip()
        if genus and epithet:
            return f"{genus}_{epithet}"
    return s.replace(" ", "_") if s else ""


def fetch_summary(title: str) -> dict | None:
    url = WIKI_API + urllib.parse.quote(title.replace(" ", "_"))
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
            if data.get("type") == "standard" and (data.get("extract") or data.get("thumbnail")):
                return data
    except (OSError, urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, TimeoutError):
        pass
    return None


def main(limit=None, only_genera=None):
    """
    only_genera: список имён файлов родов без .json, например ['rebutia', 'tephrocactus'].
    Если задан, обрабатываются только эти файлы.
    """
    print("Скрипт запущен. Жди — раз в секунду обрабатывается один вид, не закрывай терминал.")
    if limit:
        print("Ограничение: обработаю не больше", limit, "видов.")
    if only_genera:
        print("Только роды:", ", ".join(only_genera))
    print()
    total_updated = 0
    genera_done = 0
    only_set = set((g.strip().lower().replace(".json", "") for g in only_genera)) if only_genera else None
    for genus_file in sorted(SPECIES_DIR.glob("*.json")):
        if only_set is not None and genus_file.stem.lower() not in only_set:
            continue
        if limit is not None and total_updated >= limit:
            break
        try:
            species_list = json.loads(genus_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(species_list, list):
            continue
        print("  Род:", genus_file.stem, "— видов:", len(species_list))
        changed = False
        for sp in species_list:
            name = (sp.get("name") or "").strip()
            if not name:
                continue
            if sp.get("photo_main_url") and sp.get("morphology_stem"):
                continue
            title = wiki_title(name)
            if not title:
                continue
            time.sleep(1)
            data = fetch_summary(title)
            if not data:
                continue
            if not sp.get("photo_main_url") and data.get("thumbnail", {}).get("source"):
                sp["photo_main_url"] = data["thumbnail"]["source"]
                sp["photo_source"] = "wikipedia"
                changed = True
            if not sp.get("morphology_stem") and data.get("extract"):
                sp["morphology_stem"] = (data["extract"] or "")[:2000]
                if not sp.get("morphology_source"):
                    sp["morphology_source"] = "wikipedia"
                changed = True
            if changed:
                total_updated += 1
            if limit is not None and total_updated >= limit:
                break
        if changed:
            genus_file.write_text(json.dumps(species_list, ensure_ascii=False, indent=2), encoding="utf-8")
            genera_done += 1
            print(" Обновлён:", genus_file.name)
    print()
    print("Готово. Обновлено родов:", genera_done)
    print("У видов добавлены фото и/или описание из Википедии (en.wikipedia.org).")


if __name__ == "__main__":
    import sys
    LIMIT = None
    ONLY_GENERA = None
    if "--limit" in sys.argv:
        try:
            i = sys.argv.index("--limit") + 1
            if i < len(sys.argv):
                LIMIT = int(sys.argv[i])
        except (ValueError, IndexError):
            pass
    if "--genera" in sys.argv:
        try:
            i = sys.argv.index("--genera") + 1
            if i < len(sys.argv):
                ONLY_GENERA = [g.strip() for g in sys.argv[i].split(",") if g.strip()]
        except (ValueError, IndexError):
            pass
    main(limit=LIMIT, only_genera=ONLY_GENERA)
