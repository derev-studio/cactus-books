#!/usr/bin/env python3
"""
Извлекает из PDF Баккеберга (Die Cactaceae, Vol. 1) текстовый слой и собирает
все биномиальные названия вида «Genus epithet» (и варианты с subsp./var.).
Результат: сколько уникальных названий удалось вытащить для сравнения с NCBI.

Требуется: pypdf (pip install pypdf или venv). PDF: data/sources/backeberg/Backeberg_DieCactaceae_Vol1.pdf
"""

import re
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PDF_PATH = SCRIPT_DIR.parent / "data" / "sources" / "backeberg" / "Backeberg_DieCactaceae_Vol1.pdf"
OUT_TSV = SCRIPT_DIR.parent / "data" / "processed" / "backeberg_vol1_names.tsv"


def normalize_binomial(s: str) -> str:
    """Приводим к виду 'genus epithet' (нижний регистр)."""
    s = (s or "").strip().lower()
    s = re.sub(r"\s+", " ", s)
    # убрать автора и год
    s = re.sub(r"\s+[a-z.]+\s*,?\s*\d{4}\s*$", "", s)
    s = re.sub(r"\s+[A-Za-z]+\.?\s*$", "", s)
    return s.strip()


def main():
    try:
        from pypdf import PdfReader
    except ImportError:
        print("Установите pypdf: pip install pypdf (или используйте venv проекта)")
        return

    if not PDF_PATH.exists():
        print("PDF не найден:", PDF_PATH)
        return

    # Известные роды кактусов (для фильтра шума) — можно расширить
    known_genera = {
        "pereskia", "maihuenia", "opuntia", "nopalea", "cylindropuntia", "grusonia",
        "tephrocactus", "maihueniopsis", "mammillaria", "coryphantha", "escobaria",
        "ferocactus", "echinocactus", "thelocactus", "gymnocalycium", "rebutia",
        "sulcorebutia", "echinopsis", "trichocereus", "lobivia", "cleistocactus",
        "oreocereus", "espostoa", "rhipsalis", "schlumbergera", "hatiora",
        "selenicereus", "epiphyllum", "disocactus", "cereus", "carnegiea",
        "pachycereus", "stenocereus", "myrtillocactus", "browningia", "armatocereus",
        "bergerocactus", "austrocylindropuntia", "consolea", "cylindropuntia",
        "rathbunia", "pachycerei", "echinocereus", "leptocereus", "neoraimondia",
        "acanthocereus", "peniocereus", "polaskia", "micranthocereus", "ubehlmannia",
        "melocactus", "discocactus", "coleocephalocereus", "arojadoa", "yavia",
        "weberbauerocereus", "matucana", "haageocereus", "denmoza", "oroya",
        "cleistocactus", "espostoa", "rebutia", "sulcorebutia", "weingartia",
        "lobivia", "trichocereus", "soehrensia", "leucostele", "chamaecereus",
        "acanthocalycium", "echinomastus", "thelocactus", "stenocereus",
    }

    reader = PdfReader(str(PDF_PATH))
    names = set()
    # Паттерн: слово (род) + слово (эпитет), возможно subsp./var.
    # Упрощённо: два слова подряд, первое с заглавной (в тексте часто так)
    pattern = re.compile(
        r"\b([A-Z][a-z]+)\s+([a-z][a-z0-9\-]+(?:\s+(?:subsp\.|var\.|f\.)\s+[a-z0-9\-]+)?)\b",
        re.IGNORECASE,
    )

    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        for m in pattern.finditer(text):
            genus, epithet_part = m.group(1).lower(), m.group(2).lower()
            epithet_part = re.sub(r"\s+", " ", epithet_part)
            if genus not in known_genera:
                continue
            first_epithet = epithet_part.split()[0] if epithet_part.split() else ""
            if not first_epithet or len(first_epithet) < 2 or len(first_epithet) > 30:
                continue
            if re.search(r"\d", first_epithet) or "-" in first_epithet and first_epithet.startswith("n-"):
                continue
            binom = genus + " " + first_epithet
            names.add(normalize_binomial(binom))

    names = {n for n in names if re.match(r"^[a-z]+\s+[a-z][a-z0-9\-]*$", n)}

    count = len(names)
    print("Страниц в PDF:", len(reader.pages))
    print("Уникальных биномиальных названий извлечено:", count)
    if count > 0:
        sample = sorted(names)[:30]
        print("Примеры:", ", ".join(sample))

    OUT_TSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_TSV, "w", encoding="utf-8") as f:
        f.write("name\n")
        for n in sorted(names):
            f.write(n + "\n")
    print("Сохранено в", OUT_TSV)


if __name__ == "__main__":
    main()
