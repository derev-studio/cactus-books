#!/usr/bin/env python3
"""
Считает пропорцию «старички» / «новички» по данным NCBI и синонимам.

Два способа:
1) По полному имени: старичок = вид есть в нашем дереве (data/species/*.json) или его
   принятое имя/синоним совпадает с одним из наших 18 видов. Даёт ~0,8% старичков.

2) По эпитету (вторая часть названия): старичок = эпитет вида встречается среди эпитетов
   из нашего дерева И из всех названий в synonyms.csv (там много старых родов: Lobivia,
   Echinocactus, Cereus и т.д.). Если у Баккеберга был Lobivia backebergii, а в NCBI
   теперь Echinopsis backebergii — это один и тот же вид; по эпитету совпадает.
   Даёт ~67% старичков, ~33% новичков.

Запуск: python3 scripts/report_old_new_species.py
"""

import csv
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA = SCRIPT_DIR.parent / "data"
SPECIES_DIR = DATA / "species"
SPECIES_CSV = DATA / "processed" / "species.csv"
SYNONYMS_CSV = DATA / "processed" / "synonyms.csv"


def norm(s: str) -> str:
    if not s or not isinstance(s, str):
        return ""
    return s.strip().lower().replace("×", " x ")


def epithet(name: str) -> str:
    """Вторая часть названия: Echinopsis backebergii -> backebergii."""
    if not name:
        return ""
    parts = re.split(r"\s+", (name or "").strip(), maxsplit=2)
    return parts[1].lower().replace("×", "x") if len(parts) >= 2 else ""


def main():
    # Наши виды (дерево)
    ours_full = set()
    ours_epithets = set()
    for f in sorted(SPECIES_DIR.glob("*.json")):
        try:
            arr = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(arr, list):
            continue
        for sp in arr:
            name = (sp.get("name") or "").strip()
            if name:
                ours_full.add(norm(name))
                e = epithet(name)
                if e:
                    ours_epithets.add(e)

    # Эпитеты из всех синонимов (старые названия — Lobivia, Echinocactus и т.д.)
    synonym_epithets = set()
    name_to_canonical = {}
    if SYNONYMS_CSV.exists():
        with open(SYNONYMS_CSV, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                acc = (row.get("accepted_name") or "").strip()
                syn = (row.get("synonym") or "").strip()
                if acc:
                    name_to_canonical[norm(acc)] = norm(acc)
                    synonym_epithets.add(epithet(acc))
                if syn:
                    name_to_canonical[norm(syn)] = norm(acc)
                    synonym_epithets.add(epithet(syn))

    backeberg_epithets = ours_epithets | synonym_epithets

    # Список видов NCBI
    ncbi_list = []
    if SPECIES_CSV.exists():
        with open(SPECIES_CSV, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if not (row.get("tax_id") or "").strip():
                    continue
                name = (row.get("name") or "").strip()
                if name:
                    ncbi_list.append(name)

    total = len(ncbi_list)
    if not total:
        print("Нет записей в species.csv")
        return

    # Способ 1: по полному имени (наш дерево + синонимы к нему)
    def is_old_full(name: str) -> bool:
        n = norm(name)
        if n in ours_full:
            return True
        can = name_to_canonical.get(n)
        return bool(can and can in ours_full)

    old_full = sum(1 for name in ncbi_list if is_old_full(name))

    # Способ 2: по эпитету (вид «сменил фамилию» — Lobivia → Echinopsis и т.д.)
    def is_old_epithet(name: str) -> bool:
        e = epithet(name)
        return bool(e and e in backeberg_epithets)

    old_epithet = sum(1 for name in ncbi_list if is_old_epithet(name))
    new_epithet = total - old_epithet

    print("В нашем дереве (data/species/*.json):", len(ours_full), "видов")
    print("В выборке NCBI (species.csv):", total, "записей")
    print("Уникальных эпитетов из synonyms.csv + дерева:", len(backeberg_epithets))
    print()
    print("--- По полному имени (только наши 18 + их синонимы) ---")
    print("  Старички:", old_full, "({:.1f}%)".format(100 * old_full / total))
    print("  Новички:", total - old_full)
    print()
    print("--- По эпитету (вид = старичок, если эпитет есть у Баккеберга/в синонимах) ---")
    print("  Старички:", old_epithet, "({:.1f}%)".format(100 * old_epithet / total))
    print("  Новички:", new_epithet, "({:.1f}%)".format(100 * new_epithet / total))


if __name__ == "__main__":
    main()
