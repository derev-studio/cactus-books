#!/usr/bin/env python3
"""
Сравнивает data/sources/cactus_database/cactus_cards_species.csv с нашими видами
(data/species/*.json). Выводит отчёт: сколько видов уже есть, сколько новых,
у скольких в cards есть синонимы для обогащения.
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
    """Из 'Mammillaria crinita DC.' или 'Mammillaria crinita' -> 'crinita'."""
    s = (name or "").strip()
    s = re.sub(r"\s*[\(\[].*$", "", s).strip()
    parts = s.split()
    return parts[-1].lower() if len(parts) >= 2 else s.lower()


def load_our_species():
    """Возвращает set пар (genus_lower, epithet_lower) и dict genus -> set(epithet)."""
    pairs = set()
    by_genus = {}
    for f in SPECIES_DIR.glob("*.json"):
        try:
            arr = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(arr, list):
            continue
        genus = f.stem.lower()
        for sp in arr:
            name = (sp.get("name") or "").strip()
            if not name:
                continue
            epithet = normalize_epithet(name)
            if not epithet:
                continue
            pairs.add((genus, epithet))
            by_genus.setdefault(genus, set()).add(epithet)
    return pairs, by_genus


def main():
    if not CARDS_CSV.exists():
        print("Нет файла", CARDS_CSV)
        return

    print("Загружаю наши виды из data/species/*.json ...")
    our_pairs, our_by_genus = load_our_species()
    our_genera = set(our_by_genus.keys())
    print("  У нас родов:", len(our_genera), ", пар (род, эпитет):", len(our_pairs))
    print()

    print("Читаю cactus_cards_species.csv ...")
    in_tree = []       # вид уже есть у нас
    new_species = []   # вид новый (род есть, вида нет)
    new_genus = []     # рода нет в дереве
    with_synonyms = 0
    total = 0
    with open(CARDS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total += 1
            genus = (row.get("accepted_genus") or "").strip().lower()
            epithet = (row.get("species") or "").strip().lower()
            accepted = (row.get("accepted_name") or "").strip()
            names_count = int(row.get("names_count") or 0)
            if not genus or not epithet:
                continue
            if (genus, epithet) in our_pairs:
                in_tree.append((accepted, names_count))
                if names_count > 1:
                    with_synonyms += 1
            elif genus in our_genera:
                new_species.append(accepted)
            else:
                new_genus.append((genus, accepted))

    print()
    print("=" * 50)
    print("ОТЧЁТ: cactus_cards_species.csv vs наше дерево")
    print("=" * 50)
    print("Всего записей в файле cards:", total)
    print()
    print("Уже есть у нас (род + вид совпадают):", len(in_tree))
    print("  из них с синонимами (names_count > 1):", with_synonyms, "— можно подтянуть цепочки синонимов в карточки")
    print()
    print("Род есть, вида нет (можно добавить в наш род):", len(new_species))
    if new_species:
        print("  примеры:", ", ".join(new_species[:8]))
    print()
    print("Рода нет в дереве (вид бы добавить после добавления рода):", len(new_genus))
    if new_genus:
        genera_uniq = sorted(set(g for g, _ in new_genus))[:10]
        print("  примеры родов:", ", ".join(genera_uniq))
    print()
    print("Следующий шаг: обогатить синонимами", with_synonyms, "видов и/или добавить", len(new_species), "новых видов в существующие роды.")


if __name__ == "__main__":
    main()
