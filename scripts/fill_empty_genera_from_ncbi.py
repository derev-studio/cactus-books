#!/usr/bin/env python3
"""
Заполняет пустые data/species/<genus>.json видами из data/processed/species.csv (NCBI).
Только для файлов, которые сейчас пусты ([]). Не перезаписывает GBIF-данные.
"""

import csv
import json
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
SPECIES_CSV = PROJECT / "data" / "processed" / "species.csv"
TAXONOMY_PATH = PROJECT / "data" / "taxonomy.json"
SPECIES_DIR = PROJECT / "data" / "species"


def slug(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"[^\w\s\-]", "", s)
    s = re.sub(r"\s+", "-", s).strip("-")
    return s[:80]


def get_our_genera():
    """Роды из taxonomy: id -> латинское имя."""
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        tree = json.load(f)
    out = {}
    for sub in tree.get("children") or []:
        for tribe in sub.get("children") or []:
            for g in tribe.get("children") or []:
                if g.get("type") == "genus":
                    out[g["id"]] = (g.get("name") or "").strip()
    return out


def is_empty(genus_id: str) -> bool:
    path = SPECIES_DIR / f"{genus_id}.json"
    if not path.exists():
        return True
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return isinstance(data, list) and len(data) == 0
    except Exception:
        return True


def main():
    our_genera = get_our_genera()
    name_to_id = {v.lower(): k for k, v in our_genera.items()}

    # Собираем строки из species.csv по родам (первое слово name)
    if not SPECIES_CSV.exists():
        print("Не найден", SPECIES_CSV)
        return

    by_genus = {}
    by_tax_id = {}
    with open(SPECIES_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = (row.get("name") or "").strip()
            if not name or " " not in name:
                continue
            genus_name = name.split()[0]
            rank = (row.get("rank") or "").strip().lower()
            tax_id = row.get("tax_id", "").strip()
            parent_id = row.get("parent_id", "").strip()
            if genus_name.lower() not in name_to_id:
                continue
            by_genus.setdefault(genus_name.lower(), []).append({
                "tax_id": tax_id,
                "parent_id": parent_id,
                "name": name,
                "rank": rank,
            })
            by_tax_id[tax_id] = {"name": name, "rank": rank}

    added_total = 0
    for g_name, rows in by_genus.items():
        genus_id = name_to_id.get(g_name)
        if not genus_id or not is_empty(genus_id):
            continue

        species_rows = [r for r in rows if r["rank"] == "species"]
        subspecies_rows = [r for r in rows if r["rank"] == "subspecies"]
        # variety, form — тоже в infraspecific
        other_infra = [r for r in rows if r["rank"] in ("variety", "form", "subvariety")]

        if not species_rows:
            continue

        # Собираем виды; к каждому — infraspecific по parent_id
        species_by_tax_id = {r["tax_id"]: r for r in species_rows}
        entries = []
        for r in species_rows:
            name = r["name"]
            tax_id = r["tax_id"]
            infraspecific = []
            for sub in subspecies_rows + other_infra:
                if sub["parent_id"] == tax_id:
                    infraspecific.append({
                        "name": sub["name"],
                        "rank": sub["rank"],
                    })
            entry = {
                "id": slug(name),
                "name": name,
                "description": "По данным NCBI. Морфология и синонимы будут добавлены.",
                "source": "ncbi",
            }
            if infraspecific:
                entry["infraspecific"] = infraspecific
            entries.append(entry)

        if not entries:
            continue

        out_path = SPECIES_DIR / f"{genus_id}.json"
        out_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
        added_total += len(entries)
        print(f"  {g_name}: {len(entries)} видов → {out_path.name}")

    print()
    print("Заполнено пустых родов из NCBI, всего видов:", added_total)


if __name__ == "__main__":
    main()
