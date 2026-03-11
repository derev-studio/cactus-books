#!/usr/bin/env python3
"""
Добавляет в карточки видов подвиды, разновидности и формы из GBIF occurrence.txt,
чтобы в одной карточке было видно все близкородственные таксоны. Ничего не теряем.

Читает файл построчно. Для каждой записи с рангом subspecies, variety, form
определяем родительский вид (Genus species) и добавляем в поле infraspecific
у соответствующего вида в data/species/<genus>.json.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
# Архив может лежать в корне проекта или в data/sources/gbif/
for base in (PROJECT / "0026914-260226173443078", PROJECT / "data" / "sources" / "gbif" / "0026914-260226173443078"):
    if (base / "occurrence.txt").exists():
        OCCURRENCE = base / "occurrence.txt"
        break
else:
    OCCURRENCE = PROJECT / "0026914-260226173443078" / "occurrence.txt"
SPECIES_DIR = PROJECT / "data" / "species"


def parent_species(scientific_name: str, genus: str) -> str:
    """Из 'Opuntia microdasys subsp. rufida' и genus Opuntia -> 'Opuntia microdasys'."""
    s = (scientific_name or "").strip()
    g = (genus or "").strip()
    if not s or not g:
        return ""
    # Убрать автора (скобки и после)
    s = re.sub(r"\s*[\(\[].*$", "", s).strip()
    parts = s.split()
    if len(parts) < 2:
        return ""
    # Род должен совпадать
    if parts[0].lower() != g.lower():
        return ""
    # Вид = первые два слова (род + эпитет)
    return (parts[0] + " " + parts[1]).strip()


def normalize_species_name(name: str) -> str:
    """Для сопоставления: 'Mammillaria discolor Haw.' -> 'mammillaria discolor'."""
    s = (name or "").strip()
    s = re.sub(r"\s*[\(\[].*$", "", s)
    parts = s.split()
    if len(parts) >= 2:
        return (parts[0] + " " + parts[1]).lower()
    return s.lower()


def main():
    if not OCCURRENCE.exists():
        print("Не найден", OCCURRENCE)
        return
    # Собираем из GBIF: (genus_lower, parent_species_key) -> [(full_name, rank), ...]
    infra_by_parent = defaultdict(list)
    seen = set()
    with open(OCCURRENCE, "r", encoding="utf-8", errors="replace") as f:
        header = f.readline()
        cols = header.strip().split("\t")
        idx_g = cols.index("genus") if "genus" in cols else -1
        idx_sci = cols.index("scientificName") if "scientificName" in cols else -1
        idx_rank = cols.index("taxonRank") if "taxonRank" in cols else -1
        for line in f:
            parts = line.split("\t")
            if len(parts) <= max(idx_g, idx_sci, idx_rank):
                continue
            rank = (parts[idx_rank] or "").strip().lower()
            if rank not in ("subspecies", "variety", "form"):
                continue
            genus = (parts[idx_g] or "").strip()
            sci = (parts[idx_sci] or "").strip()
            parent = parent_species(sci, genus)
            if not parent:
                continue
            key = (genus.lower(), normalize_species_name(parent))
            entry = (sci, rank)
            if (key, entry) in seen:
                continue
            seen.add((key, entry))
            infra_by_parent[key].append({"name": sci, "rank": rank})

    print("Собрано инфравидовых таксонов (подвиды/разновидности/формы) по родительским видам:", sum(len(v) for v in infra_by_parent.values()))

    # Проходим по нашим species/*.json и добавляем infraspecific
    updated_files = 0
    for genus_file in sorted(SPECIES_DIR.glob("*.json")):
        try:
            species_list = json.loads(genus_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(species_list, list):
            continue
        genus_name = genus_file.stem
        changed = False
        for sp in species_list:
            name = (sp.get("name") or "").strip()
            key = (genus_name, normalize_species_name(name))
            if key not in infra_by_parent:
                continue
            infras = infra_by_parent[key]
            # Убрать дубликаты по имени
            by_name = {}
            for x in infras:
                by_name[x["name"]] = x
            sp["infraspecific"] = list(by_name.values())
            changed = True
        if changed:
            genus_file.write_text(json.dumps(species_list, ensure_ascii=False, indent=2), encoding="utf-8")
            updated_files += 1
            print(" ", genus_file.name, "— добавлены подвиды/разновидности/формы")

    print("Обновлено файлов:", updated_files)
    print("Готово. На карточке вида теперь отображаются все его подвиды, разновидности и формы.")


if __name__ == "__main__":
    main()
