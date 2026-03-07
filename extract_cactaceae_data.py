#!/usr/bin/env python3
"""
Извлечение из современных баз только семейства Cactaceae.
Сохраняет в data/processed/ CSV: genera.csv, species.csv, synonyms.csv, authors.csv.
Данные Backeberg не смешиваются (они только в data/sources/backeberg/).
"""

import csv
import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
MODERN_DIR = DATA_DIR / "sources" / "modern_taxonomy"
PROCESSED_DIR = DATA_DIR / "processed"

CACTACEAE_NCBI_ID = 3593
DMP_SEP = "\t|\t"


def load_ncbi_nodes(nodes_path: Path) -> dict:
    """tax_id -> {parent_id, rank}."""
    nodes = {}
    with open(nodes_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            parts = line.strip().split(DMP_SEP)
            if len(parts) < 3:
                continue
            tax_id = int(parts[0].strip())
            parent_id = int(parts[1].strip())
            rank = parts[2].strip()
            nodes[tax_id] = {"parent_id": parent_id, "rank": rank}
    return nodes


def get_cactaceae_subtree(nodes: dict, root: int) -> set:
    """Все tax_id в поддереве root (включительно)."""
    children = {}
    for nid, info in nodes.items():
        p = info["parent_id"]
        children.setdefault(p, []).append(nid)
    subtree = {root}
    stack = [root]
    while stack:
        tid = stack.pop()
        for nid in children.get(tid, []):
            subtree.add(nid)
            stack.append(nid)
    return subtree


def load_ncbi_names(names_path: Path, tax_ids: set) -> dict:
    """tax_id -> list of {name_txt, name_class}."""
    names = {}
    with open(names_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            parts = line.strip().split(DMP_SEP)
            if len(parts) < 4:
                continue
            try:
                tax_id = int(parts[0].strip())
            except ValueError:
                continue
            if tax_id not in tax_ids:
                continue
            name_txt = parts[1].strip()
            name_class = parts[3].strip().rstrip("\t|").strip()
            if tax_id not in names:
                names[tax_id] = []
            names[tax_id].append({"name_txt": name_txt, "name_class": name_class})
    return names


def extract_ncbi_cactaceae():
    nodes_path = MODERN_DIR / "nodes.dmp"
    names_path = MODERN_DIR / "names.dmp"
    if not nodes_path.exists() or not names_path.exists():
        return {}, [], [], []

    nodes = load_ncbi_nodes(nodes_path)
    subtree = get_cactaceae_subtree(nodes, CACTACEAE_NCBI_ID)
    names = load_ncbi_names(names_path, subtree)

    genera = []
    species = []
    synonyms = []
    authors = []

    for tax_id in subtree:
        rank = nodes.get(tax_id, {}).get("rank", "")
        parent_id = nodes[tax_id]["parent_id"]
        tax_names = names.get(tax_id, [])

        sci_name = None
        for n in tax_names:
            if n["name_class"] == "scientific name":
                sci_name = n["name_txt"]
                break
        if not sci_name:
            continue

        if rank == "genus":
            genera.append({"tax_id": tax_id, "parent_id": parent_id, "name": sci_name})
        elif rank == "species" or rank == "subspecies" or rank == "variety":
            species.append({"tax_id": tax_id, "parent_id": parent_id, "name": sci_name, "rank": rank})

        for n in tax_names:
            if n["name_class"] in ("synonym", "equivalent name", "genbank synonym"):
                synonyms.append({"tax_id": tax_id, "accepted_name": sci_name, "synonym": n["name_txt"]})

    return genera, species, synonyms, authors


def parse_usda_plantlst(plantlst_path: Path):
    """Filter Cactaceae from USDA plantlst.txt (CSV-like)."""
    if not plantlst_path.exists():
        return [], [], []

    cactaceae_symbols = set()
    all_rows = []
    with open(plantlst_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            all_rows.append(row)
            fam = (row.get("Family") or "").strip()
            sym = (row.get("Symbol") or "").strip()
            if fam == "Cactaceae":
                cactaceae_symbols.add(sym)

    species = []
    synonyms = []
    authors = []
    cactaceae_rows = {r.get("Symbol", "").strip(): r for r in all_rows if (r.get("Symbol") or "").strip() in cactaceae_symbols}

    for sym in cactaceae_symbols:
        row = cactaceae_rows.get(sym)
        if not row:
            continue
        name_author = (row.get("Scientific Name with Author") or "").strip()
        if not name_author:
            continue
        author = extract_author(name_author)
        species.append({"symbol": sym, "scientific_name_with_author": name_author, "author": author})
        if author:
            authors.append({"symbol": sym, "scientific_name": name_author, "author": author})

    for row in all_rows:
        syn_sym = (row.get("Synonym Symbol") or "").strip()
        sym = (row.get("Symbol") or "").strip()
        if not syn_sym:
            continue
        if sym in cactaceae_symbols or syn_sym in cactaceae_symbols:
            name_author = (row.get("Scientific Name with Author") or "").strip()
            synonyms.append({"symbol": sym, "synonym_symbol": syn_sym, "name": name_author})

    return species, synonyms, authors


def extract_author(name_with_author: str) -> str:
    """Выделить автора из строки вида 'Genus species (Auth.) Auth.' или 'Genus species Auth.'."""
    if not name_with_author:
        return ""
    m = re.search(r"\(([^)]+)\)\s*$|[\s,]([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+et\s+al\.?)?)\s*$", name_with_author)
    if m:
        return (m.group(1) or m.group(2) or "").strip()
    return ""


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    ncbi_genera, ncbi_species, ncbi_synonyms, _ = extract_ncbi_cactaceae()
    usda_species, usda_synonyms, usda_authors = parse_usda_plantlst(MODERN_DIR / "plantlst.txt")

    # genera: только NCBI (в USDA нет подсемейств/триб/родов отдельно)
    with open(PROCESSED_DIR / "genera.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["tax_id", "parent_id", "name"])
        w.writeheader()
        w.writerows(ncbi_genera)

    # species: NCBI + USDA (объединяем; USDA даёт авторов)
    with open(PROCESSED_DIR / "species.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["tax_id", "parent_id", "name", "rank", "symbol", "scientific_name_with_author", "author"],
        )
        w.writeheader()
        for s in ncbi_species:
            w.writerow({"tax_id": s["tax_id"], "parent_id": s["parent_id"], "name": s["name"], "rank": s.get("rank", ""), "symbol": "", "scientific_name_with_author": "", "author": ""})
        for s in usda_species:
            w.writerow({"tax_id": "", "parent_id": "", "name": s.get("scientific_name_with_author", s.get("symbol", "")), "rank": "", "symbol": s.get("symbol", ""), "scientific_name_with_author": s.get("scientific_name_with_author", ""), "author": s.get("author", "")})

    # synonyms: NCBI + USDA
    with open(PROCESSED_DIR / "synonyms.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["tax_id", "accepted_name", "synonym", "symbol", "synonym_symbol", "name"])
        w.writeheader()
        for s in ncbi_synonyms:
            w.writerow({"tax_id": s["tax_id"], "accepted_name": s["accepted_name"], "synonym": s["synonym"], "symbol": "", "synonym_symbol": "", "name": ""})
        for s in usda_synonyms:
            w.writerow({"tax_id": "", "accepted_name": "", "synonym": "", "symbol": s.get("symbol"), "synonym_symbol": s.get("synonym_symbol"), "name": s.get("name")})

    # authors: из USDA (из Scientific Name with Author)
    with open(PROCESSED_DIR / "authors.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["symbol", "scientific_name", "author"])
        w.writeheader()
        w.writerows(usda_authors)

    print("Extracted to", PROCESSED_DIR)
    print("  genera.csv:", len(ncbi_genera))
    print("  species.csv:", len(ncbi_species) + len(usda_species))
    print("  synonyms.csv:", len(ncbi_synonyms) + len(usda_synonyms))
    print("  authors.csv:", len(usda_authors))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
