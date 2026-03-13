#!/usr/bin/env python3
"""
Переводит поля морфологии (morphology_stem, morphology_spines, morphology_flower, morphology_fruit)
на русский и записывает в morphology_*_ru.

Использует deep_translator: сначала Google, при ошибке — MyMemory.
Умная пауза: 1–2.5 сек между запросами, каждые 40 запросов — длинная пауза 25–45 сек,
чтобы сервисы не заблокировали. Один запуск обрабатывает всю базу (data/species/*.json).

Установка зависимости (один раз, в терминале):
  pip3 install deep-translator
  или: pip3 install -r requirements.txt

Запуск:
  cd /Users/alexanderermolovich/Documents/cactus && python3 -u scripts/translate_morphology_to_ru.py
"""

import json
import random
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
SPECIES_DIR = PROJECT / "data" / "species"
MORPH_FIELDS = ["morphology_stem", "morphology_spines", "morphology_flower", "morphology_fruit"]
MAX_TEXT_LEN = 4500
PAUSE_MIN, PAUSE_MAX = 1.0, 2.5
LONG_PAUSE_EVERY = 40
LONG_PAUSE_MIN, LONG_PAUSE_MAX = 25, 45
RETRIES = 3
RETRY_PAUSE = 15


def translate_en_ru(text: str) -> str | None:
    if not text or not (text := text.strip()):
        return None
    text = text[:MAX_TEXT_LEN]
    try:
        from deep_translator import GoogleTranslator
        t = GoogleTranslator(source="en", target="ru")
        out = t.translate(text)
        if out and out.strip():
            return out.strip()
    except Exception:
        pass
    try:
        from deep_translator import MyMemoryTranslator
        t = MyMemoryTranslator(source="en", target="ru")
        out = t.translate(text)
        if out and out.strip():
            return out.strip()
    except Exception:
        pass
    return None


def translate_with_retry(text: str) -> str | None:
    for attempt in range(RETRIES):
        result = translate_en_ru(text)
        if result:
            return result
        if attempt < RETRIES - 1:
            time.sleep(RETRY_PAUSE)
    return None


def main(limit: int | None = None, only_genera: list[str] | None = None):
    import sys
    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print("Ошибка: не установлен deep-translator.", flush=True)
        print("Выполни один раз: pip install deep-translator", flush=True)
        sys.exit(1)

    only_set = {g.strip().lower().replace(".json", "") for g in (only_genera or [])}
    total_done = 0
    genera_saved = 0
    request_count = 0

    print("Скрипт перевода запущен. Ждите…", flush=True)
    print("Перевод морфологии на русский (deep_translator: Google + MyMemory).", flush=True)
    print("Умная пауза: 1–2.5 сек между запросами, каждые 40 — длинная пауза.", flush=True)
    if limit:
        print("Ограничение: не более", limit, "полей.")
    if only_set:
        print("Только роды:", ", ".join(sorted(only_set)))
    print("Обхожу data/species/*.json. Ниже — «Род: …» и «Перевожу: …».", flush=True)
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
            for field in MORPH_FIELDS:
                en_val = sp.get(field)
                ru_field = field + "_ru"
                if not en_val or not (en_val := str(en_val).strip()) or sp.get(ru_field):
                    continue
                name = sp.get("name") or sp.get("id") or "?"
                print("  Перевожу:", name, "…", flush=True)
                request_count += 1
                if request_count > 0 and request_count % LONG_PAUSE_EVERY == 0:
                    long_pause = random.uniform(LONG_PAUSE_MIN, LONG_PAUSE_MAX)
                    print("  [пауза", round(long_pause), "сек, чтобы не перегружать сервис]", flush=True)
                    time.sleep(long_pause)
                else:
                    time.sleep(random.uniform(PAUSE_MIN, PAUSE_MAX))
                ru_val = translate_with_retry(en_val)
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
            print("  Сохранён:", genus_file.name, flush=True)

    print()
    print("Готово. Переведено полей:", total_done, ", обновлено родов:", genera_saved, flush=True)
    if total_done == 0 and (limit is None or limit > 0):
        print("(Ни один перевод не получен. Проверь интернет и позже запусти снова.)", flush=True)


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
