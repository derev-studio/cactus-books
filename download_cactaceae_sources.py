#!/usr/bin/env python3
"""
Скачивание источников по семейству Cactaceae для локальной библиотеки.
Backeberg → data/sources/backeberg
Современные базы → data/sources/modern_taxonomy
ZIP/TAR.GZ распаковываются после скачивания.
"""

import os
import sys
import zipfile
import tarfile
import urllib.request
from pathlib import Path

# Корень данных (скрипт запускают из корня проекта)
SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR / "data"
BACKEBERG_DIR = DATA_DIR / "sources" / "backeberg"
MODERN_DIR = DATA_DIR / "sources" / "modern_taxonomy"

USER_AGENT = "Cactaceae-Sources-Download/1.0 (bot; educational)"

# --- Backeberg (морфология, описания, классическая система) ---
BACKEBERG_SOURCES = [
    {
        "name": "Backeberg_DieCactaceae_Vol1",
        "url": "https://www.cactuspro.com/biblio_fichiers/pdf/Backeberg/Backeberg_DieCact1.pdf",
        "filename": "Backeberg_DieCactaceae_Vol1.pdf",
    },
    {
        "name": "Cactician_Generitaxa_Index",
        "url": "https://www.crassulaceae.ch/docs/940b467dfd5453333fd8c33f7089ae91_Cactician%204%20HQ-1.pdf",
        "filename": "Cactician_4_Generitaxa_Index.pdf",
    },
]

# --- Современная таксономия (NCBI, WFO, USDA, Caryophyllales) ---
MODERN_SOURCES = [
    {
        "name": "NCBI_taxdump",
        "url": "ftp://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdump.tar.gz",
        "filename": "taxdump.tar.gz",
        "unzip": True,
        "archive_type": "tar.gz",
    },
    {
        "name": "WFO_plantlist",
        "url": "https://zenodo.org/records/18007552/files/wfo_plantlist_2025-06.zip?download=1",
        "filename": "wfo_plantlist_2025-06.zip",
        "unzip": True,
        "archive_type": "zip",
    },
    {
        "name": "USDA_plantlst",
        "url": "https://plants.sc.egov.usda.gov/DocumentLibrary/Txt/plantlst.txt",
        "filename": "plantlst.txt",
        "unzip": False,
    },
    # Caryophyllales.org backbone — PDF на ResearchGate; прямой скач часто требует браузера
    {
        "name": "Caryophyllales_Cactaceae_backbone",
        "url": "https://www.researchgate.net/publication/354247877_Cactaceae_at_Caryophyllalesorg_-_a_dynamic_online_species-level_taxonomic_backbone_for_the_family",
        "filename": "Caryophyllales_Cactaceae_backbone.pdf",
        "unzip": False,
        "note": "ResearchGate may require manual download; URL is publication page.",
    },
]


def download_file(url: str, dest_path: Path, note: str = "") -> bool:
    """Скачать файл по URL в dest_path. Возвращает True при успехе."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            with open(dest_path, "wb") as f:
                f.write(resp.read())
        return True
    except Exception as e:
        if note:
            print(f"  Note: {note}")
        print(f"  Error: {e}")
        return False


def unzip_archive(archive_path: Path, extract_dir: Path, archive_type: str) -> bool:
    """Распаковать ZIP или TAR.GZ в extract_dir."""
    try:
        if archive_type == "zip":
            with zipfile.ZipFile(archive_path, "r") as z:
                z.extractall(extract_dir)
        elif archive_type == "tar.gz":
            with tarfile.open(archive_path, "r:gz") as t:
                try:
                    t.extractall(extract_dir, filter="data")
                except TypeError:
                    t.extractall(extract_dir)
        else:
            return False
        return True
    except Exception as e:
        print(f"  Unpack error: {e}")
        return False


def main():
    BACKEBERG_DIR.mkdir(parents=True, exist_ok=True)
    MODERN_DIR.mkdir(parents=True, exist_ok=True)

    report = {
        "downloaded": [],
        "failed": [],
        "formats": set(),
        "backeberg": [],
        "modern": [],
    }

    print("=== Backeberg sources ===\n")
    for s in BACKEBERG_SOURCES:
        name, url, filename = s["name"], s["url"], s["filename"]
        dest = BACKEBERG_DIR / filename
        print(f"Downloading {name} -> {dest.relative_to(DATA_DIR)}")
        if download_file(url, dest, s.get("note", "")):
            report["downloaded"].append(str(dest))
            report["backeberg"].append(filename)
            report["formats"].add(Path(filename).suffix.lower().lstrip("."))
        else:
            report["failed"].append((name, url))

    print("\n=== Modern taxonomy sources ===\n")
    for s in MODERN_SOURCES:
        name, url, filename = s["name"], s["url"], s["filename"]
        dest = MODERN_DIR / filename
        print(f"Downloading {name} -> {dest.relative_to(DATA_DIR)}")
        if download_file(url, dest, s.get("note", "")):
            report["downloaded"].append(str(dest))
            report["modern"].append(filename)
            ext = Path(filename).suffix.lower().lstrip(".")
            if ext in ("zip", "gz"):
                report["formats"].add("zip" if ext == "zip" else "tar.gz")
            else:
                report["formats"].add(ext)
            if s.get("unzip") and s.get("archive_type"):
                print(f"  Unpacking {filename}...")
                if unzip_archive(dest, MODERN_DIR, s["archive_type"]):
                    print("  Unpacked OK.")
                else:
                    report["failed"].append((name + " (unpack)", dest))
        else:
            report["failed"].append((name, url))

    # --- Краткий отчёт ---
    report_path = DATA_DIR / "sources" / "download_report.txt"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("Cactaceae sources — download report\n")
        f.write("=" * 50 + "\n\n")
        f.write("Downloaded:\n")
        for p in report["downloaded"]:
            f.write(f"  {p}\n")
        f.write("\nFailed:\n")
        for name, url in report["failed"]:
            f.write(f"  {name}: {url}\n")
        f.write("\nFormats: " + ", ".join(sorted(report["formats"])) + "\n")
        f.write("\nBackeberg files: " + ", ".join(report["backeberg"]) + "\n")
        f.write("Modern files: " + ", ".join(report["modern"]) + "\n")
    print(f"\nReport written to {report_path}")

    print("\n--- Summary ---")
    print("Downloaded:", len(report["downloaded"]))
    print("Failed:", len(report["failed"]))
    print("Formats:", report["formats"])
    print("Backeberg:", report["backeberg"])
    print("Modern:", report["modern"])

    return 0 if not report["failed"] else 1


if __name__ == "__main__":
    sys.exit(main())
