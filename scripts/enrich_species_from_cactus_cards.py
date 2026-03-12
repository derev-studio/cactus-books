#!/usr/bin/env python3
"""
Обогащает карточки видов из data/species/*.json данными из cactus_cards_species.csv:
— цепочка синонимов (nameHistory) из all_names
— морфология (morphology_stem, morphology_spines, morphology_flower, morphology_fruit)
— ссылки на фото (photo_main_url, photo_flower_url, photo_spines_url)

Правило: подвиды, разновидности, формы (infraspecific) не трогаем — не удаляем и не объединяем.
Добавляем только новые поля или дополняем синонимы; дубликаты по полному названию не создаём.
"""

import csv
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
CARDS_CSV = PROJECT / "data" / "sources" / "cactus_database" / "cactus_cards_species.csv"
SPECIES_DIR = PROJECT / "data" / "species"


def normalize_epithet(name: str) -> str:
    s = (name or "").strip()
    s = re.sub(r"\s*[\(\[].*$", "", s).strip()
    parts = s.split()
    return parts[-1].lower() if len(parts) >= 2 else s.lower()


def load_cards_by_genus_epithet():
    """(genus_lower, epithet_lower) -> row dict."""
    out = {}
    with open(CARDS_CSV, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            genus = (row.get("accepted_genus") or "").strip().lower()
            epithet = (row.get("species") or "").strip().lower()
            if not genus or not epithet:
                continue
            out[(genus, epithet)] = row
    return out


def parse_name_history(all_names: str) -> list:
    """Из строки через | делаем список названий без повторов."""
    if not (all_names or "").strip():
        return []
    names = [n.strip() for n in all_names.split("|") if n.strip()]
    seen = set()
    out = []
    for n in names:
        n_lower = n.lower()
        if n_lower in seen:
            continue
        seen.add(n_lower)
        out.append(n)
    return out


def main():
    if not CARDS_CSV.exists():
        print("Нет файла", CARDS_CSV)
        return

    print("Загружаю cactus_cards_species.csv ...")
    cards = load_cards_by_genus_epithet()
    print("  Записей по (род, эпитет):", len(cards))
    print()

    updated_count = 0
    for genus_file in sorted(SPECIES_DIR.glob("*.json")):
        try:
            species_list = json.loads(genus_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(species_list, list):
            continue
        genus = genus_file.stem.lower()
        changed = False
        for sp in species_list:
            name = (sp.get("name") or "").strip()
            epithet = normalize_epithet(name)
            if not epithet:
                continue
            row = cards.get((genus, epithet))
            if not row:
                continue
            # Добавляем поля только если их ещё нет или они пустые; infraspecific не трогаем
            if row.get("all_names"):
                history = parse_name_history(row["all_names"])
                if history and (not sp.get("nameHistory") or len(sp.get("nameHistory") or []) < len(history)):
                    sp["nameHistory"] = history
                    changed = True
            for key in ("morphology_stem", "morphology_spines", "morphology_flower", "morphology_fruit",
                        "photo_main_url", "photo_flower_url", "photo_spines_url"):
                val = (row.get(key) or "").strip()
                if val and not sp.get(key):
                    sp[key] = val
                    changed = True
            if row.get("notes_ru") and not sp.get("notes_ru"):
                sp["notes_ru"] = (row["notes_ru"] or "").strip()
                changed = True
        if changed:
            genus_file.write_text(json.dumps(species_list, ensure_ascii=False, indent=2), encoding="utf-8")
            updated_count += 1
            print("  Обновлён:", genus_file.name)

    print()
    print("Готово. Обновлено файлов родов:", updated_count)
    print("Подвиды/разновидности/формы не трогались.")


if __name__ == "__main__":
    main()
