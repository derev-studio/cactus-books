#!/usr/bin/env python3
"""
Строит data/synonyms_bridge.json: связь имён по Бакебергу (taxonomy + species/*.json)
с современными названиями и синонимами из data/processed/synonyms.csv (NCBI + USDA).

Ключ — id рода или вида в нашем проекте. Значение — backeberg, modern, synonyms, previouslyCalled.
"""

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

SCRIPT_DIR = Path(__file__).resolve().parent
DATA = SCRIPT_DIR.parent / "data"
TAXONOMY_PATH = DATA / "taxonomy.json"
SPECIES_DIR = DATA / "species"
SYNONYMS_CSV = DATA / "processed" / "synonyms.csv"
OUT_PATH = DATA / "synonyms_bridge.json"


def normalize_name(s: str) -> str:
    """Для сопоставления: нижний регистр, без автора (всё после запятой или года)."""
    if not s or not isinstance(s, str):
        return ""
    s = s.strip().lower()
    # Убрать автора: "Mammillaria goodridgei Scheer, 1850" -> "mammillaria goodridgei"
    s = re.sub(r"\s+\d{4}\s*$", "", s)
    if "," in s:
        s = s.split(",")[0].strip()
    return " ".join(s.split()[:3])  # род + вид (+ подвид)


def collect_genera(taxonomy: dict) -> List[Tuple[str, str]]:
    out = []
    for ch in taxonomy.get("children") or []:
        for tribe in ch.get("children") or []:
            for g in tribe.get("children") or []:
                if g.get("type") == "genus":
                    out.append((g["id"], g.get("name") or ""))
    return out


def collect_species() -> List[Tuple[str, str]]:
    out = []
    for f in sorted(SPECIES_DIR.glob("*.json")):
        try:
            arr = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(arr, list):
            continue
        for sp in arr:
            sid = (sp.get("id") or "").strip()
            name = (sp.get("name") or "").strip()
            if sid and name:
                out.append((sid, name))
    return out


def load_synonym_maps(csv_path: Path) -> Tuple[Dict, Dict]:
    """
    synonym -> accepted_name (если наше имя устаревший синоним)
    accepted_name -> [synonyms] (если наше имя принятое)
    Ключи нормализованы (normalize_name).
    """
    syn_to_accepted = {}
    accepted_to_syns = {}
    if not csv_path.exists():
        return syn_to_accepted, accepted_to_syns
    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            acc = (row.get("accepted_name") or "").strip()
            syn = (row.get("synonym") or "").strip()
            if not acc or not syn:
                continue
            n_acc = normalize_name(acc)
            n_syn = normalize_name(syn)
            if not n_acc or not n_syn:
                continue
            syn_to_accepted[n_syn] = acc  # храним оригинал для вывода
            accepted_to_syns.setdefault(n_acc, []).append(syn)
    return syn_to_accepted, accepted_to_syns


def main():
    taxonomy = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    genera = collect_genera(taxonomy)
    species = collect_species()
    syn_to_accepted, accepted_to_syns = load_synonym_maps(SYNONYMS_CSV)

    bridge = {"genera": {}, "species": {}}

    def make_name_history(backeberg_name: str, modern: str, synonyms: List[str], previously_called: str) -> List[str]:
        """Цепочка названий (2–4 и больше): для карточки «Ранее: … ; сейчас: …»."""
        seen = set()
        out = []
        for x in (previously_called, backeberg_name, modern) if previously_called else (backeberg_name, modern):
            if x and x not in seen:
                seen.add(x)
                out.append(x)
        for s in (synonyms or [])[:10]:
            if s and s not in seen:
                seen.add(s)
                out.append(s)
        return out

    for gid, name in genera:
        n = normalize_name(name)
        modern = name
        synonyms = []
        previously_called = None
        if n in syn_to_accepted:
            modern = syn_to_accepted[n]
            previously_called = name
        if n in accepted_to_syns:
            synonyms = list(dict.fromkeys(accepted_to_syns[n]))
        pc = previously_called if (previously_called and previously_called != modern) else None
        bridge["genera"][gid] = {
            "backeberg": name,
            "modern": modern,
            "synonyms": synonyms[:15],
            "previouslyCalled": pc,
            "nameHistory": make_name_history(name, modern, synonyms, pc or ""),
        }

    for sid, name in species:
        n = normalize_name(name)
        modern = name
        synonyms = []
        previously_called = None
        if n in syn_to_accepted:
            modern = syn_to_accepted[n]
            previously_called = name
        if n in accepted_to_syns:
            synonyms = list(dict.fromkeys(accepted_to_syns[n]))
        pc = previously_called if (previously_called and previously_called != modern) else None
        bridge["species"][sid] = {
            "backeberg": name,
            "modern": modern,
            "synonyms": synonyms[:15],
            "previouslyCalled": pc,
            "nameHistory": make_name_history(name, modern, synonyms, pc or ""),
        }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(bridge, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Written", OUT_PATH)
    print("Genera:", len(bridge["genera"]), "Species:", len(bridge["species"]))


if __name__ == "__main__":
    main()
