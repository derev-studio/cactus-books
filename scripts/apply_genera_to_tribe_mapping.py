#!/usr/bin/env python3
"""
Переносит роды из трибы «Прочие роды (по GBIF)» в соответствующие трибы по файлу
data/processed/genera_to_tribe_mapping.csv.

Важно: меняется только taxonomy.json (дерево). Файлы data/species/<род>.json не трогаются —
все виды, подвиды, разновидности и формы остаются на месте.
"""

import csv
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
TAXONOMY_PATH = PROJECT / "data" / "taxonomy.json"
MAPPING_CSV = PROJECT / "data" / "processed" / "genera_to_tribe_mapping.csv"


def find_subfamily(tree, subfamily_id):
    for sub in tree.get("children") or []:
        if (sub.get("id") or "").lower() == subfamily_id.lower():
            return sub
    return None


def find_tribe(subfamily, tribe_id):
    for tribe in subfamily.get("children") or []:
        if (tribe.get("id") or "").lower() == tribe_id.lower():
            return tribe
    return None


def find_genus_in_tribe(tribe, genus_id):
    for i, node in enumerate(tribe.get("children") or []):
        if (node.get("id") or "").lower() == genus_id.lower():
            return i, node
    return None, None


def main():
    if not MAPPING_CSV.exists():
        print("Нет файла", MAPPING_CSV)
        return
    if not TAXONOMY_PATH.exists():
        print("Нет файла", TAXONOMY_PATH)
        return

    mapping = []
    with open(MAPPING_CSV, "r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            g = (row.get("genus_id") or "").strip().lower()
            t = (row.get("tribe_id") or "").strip().lower()
            sub = (row.get("subfamily_id") or "").strip().lower()
            if g and t and sub:
                mapping.append({"genus_id": g, "tribe_id": t, "subfamily_id": sub})

    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        tree = json.load(f)

    cactoideae = find_subfamily(tree, "cactoideae")
    opuntioideae = find_subfamily(tree, "opuntioideae")
    pereskioideae = find_subfamily(tree, "pereskioideae")
    if not cactoideae:
        print("Не найден Cactoideae")
        return

    genera_gbif = find_tribe(cactoideae, "genera_gbif")
    if not genera_gbif:
        print("Не найдена триба genera_gbif")
        return

    # Создаём трибу Echinocereeae, если её нет
    if not find_tribe(cactoideae, "echinocereeae"):
        ech_tribe = {
            "id": "echinocereeae",
            "name": "Echinocereeae",
            "type": "tribe",
            "info": "Эхиноцереусовые — Echinocereus, Bergerocactus и близкие.",
            "children": []
        }
        # Вставляем после Cacteae (перед Trichocereeae)
        tribes = cactoideae.get("children") or []
        new_tribes = []
        for t in tribes:
            if (t.get("id") or "").lower() == "cacteae":
                new_tribes.append(t)
                new_tribes.append(ech_tribe)
            elif (t.get("id") or "").lower() != "echinocereeae":
                new_tribes.append(t)
        cactoideae["children"] = new_tribes
        print("Добавлена триба Echinocereeae")

    moved = 0
    for m in mapping:
        gid = m["genus_id"]
        tid = m["tribe_id"]
        subid = m["subfamily_id"]
        sub = find_subfamily(tree, subid)
        if not sub:
            print("  Пропуск", gid, ": подсемейство", subid, "не найдено")
            continue
        tribe = find_tribe(sub, tid)
        if not tribe:
            print("  Пропуск", gid, ": триба", tid, "не найдена")
            continue
        idx, genus_node = find_genus_in_tribe(genera_gbif, gid)
        if genus_node is None:
            print("  Пропуск", gid, ": род не найден в genera_gbif")
            continue
        # Удалить из genera_gbif
        genera_gbif["children"].pop(idx)
        # Добавить в целевую трибу
        tribe["children"].append(genus_node)
        moved += 1
        print("  ", gid, "→", tid)

    # Удалить пустую трибу «Прочие роды», если пуста
    if not (genera_gbif.get("children") or []):
        tribes = cactoideae.get("children") or []
        cactoideae["children"] = [t for t in tribes if (t.get("id") or "").lower() != "genera_gbif"]
        print("Триба «Прочие роды (по GBIF)» удалена (пуста).")
    else:
        print("В «Прочих родах» осталось родов:", len(genera_gbif["children"]))

    with open(TAXONOMY_PATH, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)

    print()
    print("Перенесено родов:", moved)
    print("Файлы data/species/*.json не изменялись — все виды, подвиды, разновидности и формы сохранены.")


if __name__ == "__main__":
    main()
