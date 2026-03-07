#!/usr/bin/env python3
"""
Считает по data/processed/species.csv и synonyms.csv пропорцию:
  «старички» — таксоны, связанные с нашим деревом Бакеберга (data/species/*.json) по имени или синониму;
  «новички» — остальные (post-Backeberg / не в дереве).

Запуск: python3 scripts/report_old_new_species.py
"""

import csv
import json
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


def main():
    # Наши виды (дерево Бакеберга)
    ours = set()
    for f in sorted(SPECIES_DIR.glob("*.json")):
        try:
            arr = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(arr, list):
            continue
        for sp in arr:
            name = norm(sp.get("name") or "")
            if name:
                ours.add(name)

    # synonym -> accepted (normalized)
    name_to_canonical = {}
    if SYNONYMS_CSV.exists():
        with open(SYNONYMS_CSV, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                acc = (row.get("accepted_name") or "").strip()
                syn = (row.get("synonym") or "").strip()
                if acc:
                    name_to_canonical[norm(acc)] = norm(acc)
                if syn:
                    name_to_canonical[norm(syn)] = norm(acc)

    # Все виды из NCBI (species.csv с tax_id)
    ncbi_list = []
    if SPECIES_CSV.exists():
        with open(SPECIES_CSV, "r", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if not (row.get("tax_id") or "").strip():
                    continue
                name = (row.get("name") or "").strip()
                if name:
                    ncbi_list.append(name)

    def is_old(name: str) -> bool:
        n = norm(name)
        if n in ours:
            return True
        canonical = name_to_canonical.get(n)
        if canonical and canonical in ours:
            return True
        return False

    old_count = sum(1 for name in ncbi_list if is_old(name))
    new_count = len(ncbi_list) - old_count
    total = len(ncbi_list)

    print("В нашем дереве (data/species/*.json):", len(ours), "видов")
    print("В выборке NCBI (species.csv):", total, "записей")
    print()
    print("Старички (есть в дереве или синоним совпадает с нашим деревом):", old_count)
    print("Новички (только NCBI, не связаны с нашим деревом):", new_count)
    print()
    if total:
        print("Доля старичков: {:.1f}%".format(100 * old_count / total))
        print("Доля новичков:  {:.1f}%".format(100 * new_count / total))


if __name__ == "__main__":
    main()
