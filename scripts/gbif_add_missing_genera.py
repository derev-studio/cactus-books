#!/usr/bin/env python3
"""
Добавляет в дерево роды из GBIF, которых ещё нет в taxonomy.json,
и создаёт для них data/species/<genus>.json с видами из gbif_species.csv.
Так мы не теряем 231 вид из выгрузки (Ariocarpus, Astrophytum, Echinocereus и др.).
"""

import csv
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
TAXONOMY_PATH = PROJECT / "data" / "taxonomy.json"
SPECIES_DIR = PROJECT / "data" / "species"
GBIF_CSV = PROJECT / "data" / "processed" / "gbif_species.csv"


def slug(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s[:80]


def get_our_genera():
    """Роды из taxonomy.json: id (lowercase) -> True."""
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        tree = json.load(f)
    out = set()
    for sub in tree.get("children") or []:
        for tribe in sub.get("children") or []:
            for g in tribe.get("children") or []:
                if g.get("type") == "genus":
                    out.add((g.get("id") or "").strip().lower())
    return out


def main():
    if not GBIF_CSV.exists():
        print("Нет файла", GBIF_CSV, "— сначала запустите gbif_to_one_system.py")
        return

    our = get_our_genera()
    # Собираем по родам из GBIF
    by_genus = {}
    with open(GBIF_CSV, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            g = (row.get("genus") or "").strip().lower()
            if not g or g in our:
                continue
            name = (row.get("scientificName") or row.get("species") or "").strip()
            if not name:
                continue
            by_genus.setdefault(g, []).append(name)

    missing = sorted(by_genus.keys())
    if not missing:
        print("Все роды из GBIF уже есть в дереве.")
        return

    print("Родов из GBIF без места в дереве:", len(missing))
    print()

    # 1) Создаём data/species/<genus>.json для каждого
    SPECIES_DIR.mkdir(parents=True, exist_ok=True)
    seen_per_genus = {}
    for g in missing:
        names = list(dict.fromkeys(by_genus[g]))  # уникальные, порядок сохраняем
        entries = []
        for name in names:
            sid = slug(name)
            if not sid or sid in seen_per_genus.get(g, set()):
                continue
            seen_per_genus.setdefault(g, set()).add(sid)
            entries.append({
                "id": sid,
                "name": name,
                "description": "По данным GBIF (коллекция UNAM). Морфология и синонимы будут добавлены.",
                "source": "gbif",
            })
        if not entries:
            continue
        path = SPECIES_DIR / f"{g}.json"
        path.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
        print(" Создан", path.name, "— видов:", len(entries))

    # 2) Добавляем эти роды в taxonomy.json (новая триба в Cactoideae)
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        tree = json.load(f)

    cactoideae = None
    for sub in tree.get("children") or []:
        if (sub.get("id") or "").lower() == "cactoideae":
            cactoideae = sub
            break
    if not cactoideae or "children" not in cactoideae:
        print("Не найден Cactoideae в taxonomy.json")
        return

    # Имена с большой буквы: ariocarpus -> Ariocarpus
    def cap(s):
        return (s or "").strip().capitalize()

    new_tribe = {
        "id": "genera_gbif",
        "name": "Прочие роды (по GBIF)",
        "type": "tribe",
        "info": "Роды из выгрузки GBIF (коллекция UNAM), которых нет в классификации Бакеберга. Со временем можно перенести в соответствующие трибы.",
        "children": [
            {
                "id": g,
                "name": cap(g),
                "type": "genus",
                "info": "По данным GBIF (коллекция UNAM).",
                "speciesFile": f"{g}.json",
            }
            for g in missing
            if (SPECIES_DIR / f"{g}.json").exists()
        ],
    }

    # Проверяем, что такой трибы ещё нет
    for t in cactoideae["children"]:
        if (t.get("id") or "") == "genera_gbif":
            print("Триба genera_gbif уже есть в taxonomy.json, пропускаем добавление.")
            return

    cactoideae["children"].append(new_tribe)
    with open(TAXONOMY_PATH, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    print()
    print("В taxonomy.json добавлена триба «Прочие роды (по GBIF)» с", len(new_tribe["children"]), "родами.")
    print("Готово. Ничего не теряем — все виды из GBIF теперь в дереве.")


if __name__ == "__main__":
    main()
