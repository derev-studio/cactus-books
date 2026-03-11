# Локальная библиотека источников Cactaceae

## Итоговая структура проекта

```
data/
├── sources/
│   ├── backeberg/                    # Система Бакеберга (морфология, описания)
│   │   ├── Backeberg_DieCactaceae_Vol1.pdf
│   │   └── Cactician_4_Generitaxa_Index.pdf
│   ├── gbif/                         # Выгрузка с GBIF.org (Darwin Core Archive)
│   │   └── README_GBIF.md            # куда положить папку 0026914-... и цепочка шагов
│   ├── modern_taxonomy/              # Современная таксономия (NCBI, USDA)
│   │   ├── taxdump.tar.gz           # (распакован → *.dmp)
│   │   ├── plantlst.txt             # USDA PLANTS
│   │   ├── names.dmp, nodes.dmp, ... # NCBI
│   │   └── download_report.txt
│   ├── SOURCES_OVERVIEW.md           # Описание каждого источника
│   └── download_report.txt
├── processed/                       # Извлечённые данные (только современная система)
│   ├── genera.csv                   # Роды (NCBI)
│   ├── species.csv                  # Виды (NCBI + USDA, с авторами из USDA)
│   ├── synonyms.csv                 # Синонимы (NCBI + USDA)
│   └── authors.csv                  # Авторы названий (USDA)
├── taxonomy.json                    # Дерево для сайта (Бакеберг-подобное)
├── species/                         # Виды по родам для сайта
├── fill-placeholders.js
└── README_CACTACEAE_SOURCES.md      # этот файл
```

Корень проекта:
- `download_cactaceae_sources.py` — скачивание Backeberg + современные базы, распаковка ZIP/TAR.GZ.
- `extract_cactaceae_data.py` — извлечение из NCBI и USDA только Cactaceae → CSV в `data/processed/`.

---

## Что сделано (готово к следующему этапу)

1. **Папки:** `data/sources/backeberg`, `data/sources/modern_taxonomy`, `data/processed` созданы.

2. **Скачано:**
   - **Backeberg:** PDF тома 1 «Die Cactaceae», PDF «Cactician 4» (индекс).
   - **Современные:** NCBI taxdump (распакован), USDA plantlst.txt.
   - **Не скачались:** WFO (URL 404), Caryophyllales backbone (ResearchGate — ручная загрузка).

3. **Источники разобраны:** см. `data/sources/SOURCES_OVERVIEW.md` (где роды/виды/морфология/распространение, Backeberg vs современные).

4. **Данные раздельно:**
   - Backeberg только в `data/sources/backeberg/` (для морфологии и классической системы).
   - Современная таксономия в `data/sources/modern_taxonomy/` и извлечённые CSV в `data/processed/`.

5. **Извлечённые CSV (современная система):**
   - `genera.csv` — 160 родов (NCBI).
   - `species.csv` — 2595 записей (NCBI + USDA, с авторами из USDA).
   - `synonyms.csv` — 2100 синонимов (NCBI + USDA).
   - `authors.csv` — 287 авторов (USDA).

6. **Скрипты:**
   - Запуск загрузки: `python3 download_cactaceae_sources.py`.
   - Запуск извлечения: `python3 extract_cactaceae_data.py`.

---

## Следующий этап (позже)

- Объединить современную таксономию из `data/processed/*.csv` с морфологическими описаниями из Backeberg (парсинг PDF или ручной перенос).
- Построить на сайте раскрывающееся дерево классификации (уже есть дерево по Бакебергу в `classification-cacti.html`; при необходимости можно добавить второе дерево по современной системе или объединённое).

Данные Backeberg и современной системы не смешиваются; объединение — на этапе интеграции в сайт.
