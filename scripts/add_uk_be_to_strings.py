#!/usr/bin/env python3
"""Add uk and be to all keys in data/languages.json strings that have ru but missing uk/be.
Uses ru as fallback so Cyrillic languages never show English."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "languages.json")

# Optional: explicit Ukrainian/Belarusian for specific keys (override ru fallback)
UK_BE_OVERRIDES = {
    "petals_label": {"uk": "Пелюстки", "be": "Пялёсткі"},
    "wind_label": {"uk": "Вітер", "be": "Вецер"},
    "music_label": {"uk": "Музика", "be": "Музыка"},
    "track": {"uk": "Трек", "be": "Трек"},
    "track_1": {"uk": "Трек 1", "be": "Трек 1"},
    "track_2": {"uk": "Трек 2", "be": "Трек 2"},
    "sound": {"uk": "Звук", "be": "Гук"},
    "volume": {"uk": "Гучність", "be": "Гучнасць"},
    "on": {"uk": "Увімк.", "be": "Уключ."},
    "off": {"uk": "Вимк.", "be": "Выключ."},
    "petals_aria": {"uk": "Пелюстки та вітер", "be": "Пялёсткі і вецер"},
    "music_aria": {"uk": "Музика", "be": "Музыка"},
    "volume_wind_aria": {"uk": "Гучність вітру", "be": "Гучнасць ветру"},
    "volume_music_aria": {"uk": "Гучність музики", "be": "Гучнасць музыкі"},
    "turn_on_music": {"uk": "Увімкнути музику", "be": "Уключыць музыку"},
    "turn_off_music": {"uk": "Вимкнути музику", "be": "Выключыць музыку"},
    "more_petals": {"uk": "Більше", "be": "Больш"},
    "less_petals": {"uk": "Менше", "be": "Менш"},
    "fuji_magic_aria": {"uk": "Магія Fuji: пелюстки, звуки", "be": "Магія Fuji: пялёсткі, гукі"},
    "atmosphere_aria": {"uk": "Налаштування атмосфери", "be": "Налады атмасферы"},
    "video_not_supported": {"uk": "Ваш браузер не підтримує відтворення відео.", "be": "Ваш браузер не падтрымлівае прайграванне відэа."},
    "stories_back": {"uk": "← На головну", "be": "← На галоўную"},
    "stories_loading": {"uk": "Завантаження…", "be": "Загрузка…"},
    "stories_no": {"uk": "Немає оповідань.", "be": "Няма апавяданняў."},
    "stories_error": {"uk": "Помилка завантаження.", "be": "Памылка загрузкі."},
    "stories_nav_main": {"uk": "Головна", "be": "Галоўная"},
    "stories_nav_start": {"uk": "Почати з початку", "be": "Пачаць з пачатку"},
}

def main():
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    strings = data.get("strings", {})
    added_uk = added_be = 0
    for key, val in strings.items():
        if not isinstance(val, dict):
            continue
        if "ru" not in val:
            continue
        ru = val["ru"]
        if "uk" not in val:
            val["uk"] = UK_BE_OVERRIDES.get(key, {}).get("uk", ru)
            added_uk += 1
        if "be" not in val:
            val["be"] = UK_BE_OVERRIDES.get(key, {}).get("be", ru)
            added_be += 1
    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Added uk: {added_uk}, be: {added_be}")

if __name__ == "__main__":
    main()
