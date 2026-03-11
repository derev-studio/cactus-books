#!/usr/bin/env python3
"""
Шаг 1: из архива GBIF (occurrence.txt) собираем список уникальных видов (род + вид)
и сохраняем в data/processed/gbif_species.csv.
Шаг 2: добавляем эти виды в data/species/<genus>.json для родов, которые уже есть
в taxonomy.json. Одна система — синонимы и морфологию дополняем позже.

Читает файл построчно, без загрузки всего в память.
"""

import csv
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
GBIF_DIR = PROJECT / "0026914-260226173443078"
OCCURRENCE = GBIF_DIR / "occurrence.txt"
TAXONOMY_PATH = PROJECT / "data" / "taxonomy.json"
SPECIES_DIR = PROJECT / "data" / "species"
OUT_CSV = PROJECT / "data" / "processed" / "gbif_species.csv"


def slug(s: str) -> str:
    """id вида: mammillaria-dischorella."""
    s = (s or "").strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s[:80]


def collect_gbif_species():
    """Построчно читаем occurrence.txt, собираем уникальные виды (ранг species)."""
    if not OCCURRENCE.exists():
        print("Не найден", OCCURRENCE)
        return []
    seen = set()
    rows = []
    with open(OCCURRENCE, "r", encoding="utf-8", errors="replace") as f:
        header = f.readline()
        cols = header.strip().split("\t")
        idx_genus = cols.index("genus") if "genus" in cols else -1
        idx_species = cols.index("species") if "species" in cols else -1
        idx_sci = cols.index("scientificName") if "scientificName" in cols else -1
        idx_accepted = cols.index("acceptedNameUsage") if "acceptedNameUsage" in cols else -1
        idx_rank = cols.index("taxonRank") if "taxonRank" in cols else -1
        for line in f:
            parts = line.split("\t")
            if len(parts) <= max(idx_genus, idx_sci):
                continue
            rank = (parts[idx_rank] if idx_rank < len(parts) else "").strip().lower()
            if rank != "species":
                continue
            genus = (parts[idx_genus] if idx_genus >= 0 else "").strip()
            sp = (parts[idx_species] if idx_species >= 0 else "").strip()
            sci = (parts[idx_sci] if idx_sci >= 0 else "").strip()
            accepted = (parts[idx_accepted] if idx_accepted >= 0 and idx_accepted < len(parts) else "").strip()
            if not genus or not sci or " " not in sci:
                continue
            name = f"{genus} {sp}" if sp else sci
            key = (genus.lower(), name.lower())
            if key in seen:
                continue
            seen.add(key)
            rows.append({"genus": genus, "species": sp or sci.split()[1] if len(sci.split()) > 1 else "", "scientificName": sci, "acceptedNameUsage": accepted})
    return rows


def get_our_genera():
    """Роды из taxonomy.json: id -> латинское имя (Mammillaria)."""
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        tree = json.load(f)
    out = {}
    for sub in tree.get("children") or []:
        for tribe in sub.get("children") or []:
            for g in tribe.get("children") or []:
                if g.get("type") == "genus":
                    out[g["id"]] = (g.get("name") or "").strip()
    return out


def load_existing_species(genus_id: str) -> list:
    path = SPECIES_DIR / f"{genus_id}.json"
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def main():
    print("Шаг 1: сбор видов из GBIF...")
    rows = collect_gbif_species()
    print("Уникальных видов (ранг species):", len(rows))

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["genus", "species", "scientificName", "acceptedNameUsage"])
        w.writeheader()
        w.writerows(rows)
    print("Сохранено:", OUT_CSV)

    print()
    print("Шаг 2: добавление в data/species/*.json (роды из нашего дерева)...")
    our_genera = get_our_genera()
    name_to_id = {v.lower(): k for k, v in our_genera.items()}

    by_genus = {}
    for r in rows:
        g = r["genus"].lower()
        by_genus.setdefault(g, []).append(r)

    added_total = 0
    for g_name, species_list in by_genus.items():
        genus_id = name_to_id.get(g_name)
        if not genus_id:
            continue
        existing = load_existing_species(genus_id)
        existing_names = {s.get("name", "").strip().lower() for s in existing}
        new_entries = []
        for r in species_list:
            name = r["scientificName"]  # или genus + species
            if not name or name.lower() in existing_names:
                continue
            existing_names.add(name.lower())
            sid = slug(name)
            if not sid:
                continue
            new_entries.append({
                "id": sid,
                "name": name,
                "description": "По данным GBIF (коллекция UNAM). Морфология и синонимы будут добавлены.",
                "source": "gbif",
            })
        if not new_entries:
            continue
        merged = existing + new_entries
        out_path = SPECIES_DIR / f"{genus_id}.json"
        out_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
        added_total += len(new_entries)
        print(" ", g_name, "+", len(new_entries), "видов →", out_path.name)

    print()
    print("Добавлено видов в одну систему:", added_total)
    print("Готово. Синонимы и морфологию дополняем в следующих шагах.")


if __name__ == "__main__":
    main()
