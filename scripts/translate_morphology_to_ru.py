#!/usr/bin/env python3
"""
Переводит поля морфологии (morphology_stem, morphology_spines, morphology_flower, morphology_fruit)
на русский и записывает в morphology_*_ru. Работает не спеша: пауза 2–3 сек между запросами.

Использует MyMemory API (бесплатно, без ключа; лимит ~1000 слов/день при частых запросах).
Запуск: python3 scripts/translate_morphology_to_ru.py --limit 15
        python3 scripts/translate_morphology_to_ru.py --genera gymnocalycium,rebutia
"""

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
SPECIES_DIR = PROJECT / "data" / "species"
PAUSE_SEC = 1.2
USER_AGENT = "CactusBooks/1.0 (educational; taxonomy)"
MYMEMORY_URL = "https://api.mymemory.translated.net/get"


def translate_en_ru(text: str) -> str | None:
    if not text or not text.strip():
        return None
    text = text.strip()[:3000]
    try:
        url = MYMEMORY_URL + "?" + urllib.parse.urlencode({"q": text, "langpair": "en|ru"})
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
        translated = (data.get("responseData") or {}).get("translatedText")
        if translated and translated.strip():
            return translated.strip()
    except (OSError, urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError, TimeoutError):
        pass
    return None


def main(limit: int | None = None, only_genera: list[str] | None = None):
    import sys
    only_set = {g.strip().lower().replace(".json", "") for g in (only_genera or [])}
    total_done = 0
    genera_saved = 0
    morph_fields = ["morphology_stem", "morphology_spines", "morphology_flower", "morphology_fruit"]

    print("Перевод морфологии на русский (не спеша, пауза", PAUSE_SEC, "сек между запросами).", flush=True)
    print("Обхожу роды по очереди — ниже будут строки «Род: …» и «Перевожу: …». Ждите.", flush=True)
    if limit:
        print("Ограничение: не более", limit, "видов.")
    if only_set:
        print("Только роды:", ", ".join(sorted(only_set)))
    print()

    for genus_file in sorted(SPECIES_DIR.glob("*.json")):
        if only_set and genus_file.stem.lower() not in only_set:
            continue
        if limit is not None and total_done >= limit:
            break
        print("  Род:", genus_file.stem, flush=True)
        try:
            species_list = json.loads(genus_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(species_list, list):
            continue
        changed = False
        for sp in species_list:
            if limit is not None and total_done >= limit:
                break
            for field in morph_fields:
                en_val = sp.get(field)
                ru_field = field + "_ru"
                if not en_val or not (en_val := str(en_val).strip()) or sp.get(ru_field):
                    continue
                name = sp.get("name") or sp.get("id") or "?"
                print("  Перевожу:", name, "…", flush=True)
                time.sleep(PAUSE_SEC)
                ru_val = translate_en_ru(en_val)
                if ru_val:
                    sp[ru_field] = ru_val
                    changed = True
                    total_done += 1
                    print("    ✓", name, "—", field, flush=True)
                if limit is not None and total_done >= limit:
                    break
        if changed:
            genus_file.write_text(json.dumps(species_list, ensure_ascii=False, indent=2), encoding="utf-8")
            genera_saved += 1
            print("  Сохранён:", genus_file.name)
    print()
    print("Готово. Переведено видов (полей):", total_done, ", обновлено родов:", genera_saved)


if __name__ == "__main__":
    import sys
    limit_val = None
    genera_val = None
    if "--limit" in sys.argv:
        try:
            i = sys.argv.index("--limit") + 1
            if i < len(sys.argv):
                limit_val = int(sys.argv[i])
        except (ValueError, IndexError):
            pass
    if "--genera" in sys.argv:
        try:
            i = sys.argv.index("--genera") + 1
            if i < len(sys.argv):
                genera_val = [g.strip() for g in sys.argv[i].split(",") if g.strip()]
        except (ValueError, IndexError):
            pass
    main(limit=limit_val, only_genera=genera_val)
