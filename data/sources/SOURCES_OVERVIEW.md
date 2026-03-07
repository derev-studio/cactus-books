# Обзор источников Cactaceae

## Краткий отчёт о скачивании

- **Скачаны:** Backeberg Die Cactaceae Vol.1 (PDF), Cactician 4 (PDF), NCBI taxdump (tar.gz, распакован), USDA plantlst.txt.
- **Не скачались:** WFO plantlist (URL 404), Caryophyllales backbone (ResearchGate — требуется ручная загрузка).
- **Форматы:** PDF, tar.gz (распакован в .dmp), TXT (CSV-like).

---

## Backeberg (система Курта Бакеберга)

### 1. Backeberg_DieCactaceae_Vol1.pdf
- **Где роды:** В тексте по томам (Vol.1 — начало; полная система в 6 томах).
- **Где виды:** Описания видов по родам в каждом томе.
- **Морфологические описания:** Да — стебель, рёбра/сосочки, колючки, цветки, цветочная трубка, плод.
- **Текстовые описания растений:** Да — развёрнутые описания на немецком.
- **Распространение:** Упоминается в тексте по видам/родам.

### 2. Cactician_4_Generitaxa_Index.pdf
- **Где роды:** Аннотированный индекс надродовых и надвидовых таксонов по Backeberg.
- **Где виды:** В контексте индекса (ссылки/номенклатура).
- **Морфология/описания:** Кратко в аннотациях; детали — в основном в Die Cactaceae.
- **Распространение:** По ссылкам на литературу.

**Итог Backeberg:** Использовать для морфологии, текстовых описаний и классической системы Бакеберга. Данные в PDF — для извлечения нужен отдельный парсинг (PyPDF2/pdfplumber и т.п.).

---

## Современная таксономия

### 1. NCBI Taxonomy (taxdump: names.dmp, nodes.dmp)
- **Семейство:** Cactaceae (tax_id 3593).
- **Подсемейства / трибы / роды / виды:** Да — в виде дерева таксонов в `nodes.dmp` (parent_id, rank); названия в `names.dmp` (scientific name, synonym и др.).
- **Авторы названий:** Нет в стандартных DMP (только название и тип имени).
- **Синонимы:** Да — в `names.dmp` (разные name_class: scientific name, synonym, etc.).
- **Распространение / экология:** Нет.

**Формат:** Таблицы, разделённые `|`, с полями tax_id, parent_tax_id, rank, name_txt, name_class.

### 2. USDA PLANTS (plantlst.txt)
- **Семейство:** Колонка "Family" — фильтр по Cactaceae.
- **Подсемейства/трибы:** Нет в этом файле (только family, genus, species-level).
- **Роды и виды:** Да — "Scientific Name with Author", "Symbol", "Synonym Symbol".
- **Авторы названий:** В строке "Scientific Name with Author".
- **Синонимы:** Да — через "Synonym Symbol" и отдельные строки.
- **Распространение/экология:** В других файлах USDA (профили); в plantlst — только номенклатура.

**Формат:** CSV-like, кавычки, колонки Symbol, Synonym Symbol, Scientific Name with Author, Common Name, Family.

### 3. World Flora Online (WFO)
- **Статус:** Не скачан (404 по указанной ссылке). Актуальные данные: [worldfloraonline.org/downloadData](https://worldfloraonline.org/downloadData) или Zenodo (версии 2024-12, 2025-12).
- **При успешной загрузке:** подсемейства, трибы, роды, виды; номенклатура, синонимы; распространение по ссылкам.

### 4. Caryophyllales.org Cactaceae Backbone
- **Статус:** PDF не скачивается скриптом (ResearchGate 403). Ручная загрузка с [ResearchGate](https://www.researchgate.net/publication/354247877_...).
- **Содержимое:** Подсемейства, трибы, роды, виды; морфология (стебель, колючки, цветки, трубка, плод), распространение, экология.

---

## Раздельное хранение

- **Backeberg:** только в `data/sources/backeberg/` — для морфологии, описаний и системы Бакеберга.
- **Современные базы:** только в `data/sources/modern_taxonomy/` и извлечённые CSV в `data/processed/` — для актуальной таксономии, родов, видов, синонимов, авторов.

Данные Backeberg и современной системы не смешиваются.
