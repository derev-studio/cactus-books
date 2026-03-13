#!/usr/bin/env python3
"""
Перевод морфологии на русский (morphology_* → morphology_*_ru).
Как советовал Google Gemini: deep_translator (Google + MyMemory), умная пауза, один проход по всей базе.

Если deep_translator установлен — используем его (надёжнее). Иначе — только MyMemory по urllib (часто лимит).

Установка библиотеки (один раз, БЕЗ venv — флаг --user):
  pip3 install --user deep-translator

Запуск:
  cd /Users/alexanderermolovich/Documents/cactus
  python3 -u scripts/translate_morphology_to_ru.py
"""

import json
import random
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT = SCRIPT_DIR.parent
SPECIES_DIR = PROJECT / "data" / "species"
MORPH_FIELDS = ["morphology_stem", "morphology_spines", "morphology_flower", "morphology_fruit"]
MAX_TEXT_LEN = 4500
PAUSE_MIN, PAUSE_MAX = 1.2, 2.2
LONG_PAUSE_EVERY = 35
LONG_PAUSE_MIN, LONG_PAUSE_MAX = 30, 50
RETRIES = 3
RETRY_PAUSE = 12

# MyMemory (запасной вариант, только urllib)
MYMEMORY_URL = "https://api.mymemory.translated.net/get"
USER_AGENT = "CactusBooks/1.0 (educational; taxonomy)"


def _translate_mymemory(text: str) -> str | None:
    if not text or not (text := text.strip()):
        return None
    text = text[:2500]
    try:
        url = MYMEMORY_URL + "?" + urllib.parse.urlencode({"q": text, "langpair": "en|ru"})
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode())
        out = (data.get("responseData") or {}).get("translatedText")
        if out and out.strip():
            return out.strip()
    except Exception:
        pass
    return None


def _translate_deeptranslator(text: str) -> str | None:
    if not text or not (text := text.strip()):
        return None
    text = text[:MAX_TEXT_LEN]
    try:
        from deep_translator import GoogleTranslator
        out = GoogleTranslator(source="en", target="ru").translate(text)
        if out and out.strip():
            return out.strip()
    except Exception:
        pass
    try:
        from deep_translator import MyMemoryTranslator
        out = MyMemoryTranslator(source="en", target="ru").translate(text)
        if out and out.strip():
            return out.strip()
    except Exception:
        pass
    return None


def translate_en_ru(text: str, use_deeptranslator: bool) -> str | None:
    if use_deeptranslator:
        return _translate_deeptranslator(text)
    return _translate_mymemory(text)


def main(limit: int | None = None, only_genera: list[str] | None = None):
    import sys
    use_dt = False
    try:
        from deep_translator import GoogleTranslator
        use_dt = True
    except ImportError:
        pass

    only_set = {g.strip().lower().replace(".json", "") for g in (only_genera or [])}
    total_done = 0
    genera_saved = 0
    request_count = 0

    print("Скрипт перевода запущен. Ждите…", flush=True)
    if use_dt:
        print("Используется deep_translator (Google + MyMemory) — как советовал Gemini.", flush=True)
    else:
        print("Используется только MyMemory (urllib). Установи для лучшего результата: pip3 install --user deep-translator", flush=True)
    print("Умная пауза: 1.2–2.2 сек, каждые 35 запросов — длинная пауза.", flush=True)
    if limit:
        print("Ограничение: не более", limit, "полей.")
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
                    print("  [пауза", round(long_pause), "сек]", flush=True)
                    time.sleep(long_pause)
                else:
                    time.sleep(random.uniform(PAUSE_MIN, PAUSE_MAX))
                ru_val = None
                for attempt in range(RETRIES):
                    if attempt > 0:
                        print("    повтор…", flush=True)
                    ru_val = translate_en_ru(en_val, use_dt)
                    if ru_val:
                        break
                    time.sleep(RETRY_PAUSE)
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
        print("(Переводы не получены. Если без deep_translator — установи: pip3 install --user deep-translator)", flush=True)


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
