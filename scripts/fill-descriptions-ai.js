#!/usr/bin/env node
/**
 * Автозаполнение карточек: нейросеть (OpenRouter) пишет короткие описания
 * для родов и видов и записывает их в data/taxonomy.json и data/species/*.json.
 *
 * Это и есть «автоматическая база»: один раз запустил — все JSON заполнились.
 *
 * Нужен ключ OpenRouter: https://openrouter.ai/keys
 * Запуск:
 *   export OPENROUTER_API_KEY=sk-or-...
 *   node scripts/fill-descriptions-ai.js
 *
 * Опционально: DRY_RUN=1 — только показать, что будет заполнено, не писать в файлы.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const TAXONOMY_PATH = path.join(DATA_DIR, "taxonomy.json");
const SPECIES_DIR = path.join(DATA_DIR, "species");
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "meta-llama/llama-3.1-8b-instruct"; // дёшево, нормальный текст
const DELAY_MS = 1500;

const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isPlaceholderOrEmpty(text, kind) {
  if (!text || typeof text !== "string") return true;
  const t = text.trim();
  if (t.length < 40) return true;
  if (kind === "genus" && /подробное описание будет добавлено позже/i.test(t)) return true;
  if (kind === "species" && /подробное описание будет добавлено позже/i.test(t)) return true;
  return false;
}

async function askOpenRouter(apiKey, prompt) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content:
            "Напиши одно-два предложения для энциклопедии о кактусе. Только текст, без кавычек и заголовков. На русском.\n\n" +
            prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.4,
    }),
  });
  const data = await res.json();
  const text =
    data.choices?.[0]?.message?.content?.trim() || "";
  return text.replace(/^["']|["']$/g, "").trim();
}

function collectGenera(node, out) {
  if (!node) return;
  if (node.type === "genus" && isPlaceholderOrEmpty(node.info, "genus")) {
    out.push({ name: node.name || node.id, node });
  }
  (node.children || []).forEach((c) => collectGenera(c, out));
}

function capitalizeGenus(filename) {
  const base = path.basename(filename, ".json");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Задай переменную OPENROUTER_API_KEY. Пример: export OPENROUTER_API_KEY=sk-or-...");
    process.exit(1);
  }

  let taxonomy;
  try {
    taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, "utf8"));
  } catch (e) {
    console.error("Не удалось прочитать taxonomy.json:", e.message);
    process.exit(1);
  }

  const generaToFill = [];
  collectGenera(taxonomy, generaToFill);
  console.log("Родов для заполнения:", generaToFill.length);

  const speciesToFill = [];
  const speciesFiles = fs.readdirSync(SPECIES_DIR).filter((f) => f.endsWith(".json"));
  const genusByFile = {};
  speciesFiles.forEach((f) => {
    const filePath = path.join(SPECIES_DIR, f);
    let arr;
    try {
      arr = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      return;
    }
    if (!Array.isArray(arr)) return;
    const genusName = capitalizeGenus(f);
    arr.forEach((item, index) => {
      if (isPlaceholderOrEmpty(item.description, "species")) {
        speciesToFill.push({
          name: item.name || item.id,
          genusName,
          filePath,
          array: arr,
          index,
        });
      }
    });
  });
  console.log("Видов для заполнения:", speciesToFill.length);

  if (DRY_RUN) {
    console.log("DRY_RUN: файлы не изменяются. Убери DRY_RUN и запусти снова.");
    process.exit(0);
  }

  for (const { name, node } of generaToFill) {
    process.stdout.write("Род " + name + "… ");
    try {
      const text = await askOpenRouter(
        apiKey,
        "Род кактусов: " + name + ". Кратко: форма, ареал, особенности."
      );
      if (text) {
        node.info = text;
        console.log("ок");
      } else console.log("пустой ответ");
    } catch (e) {
      console.log("ошибка:", e.message);
    }
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2), "utf8");
  console.log("taxonomy.json сохранён.");

  const byFile = {};
  speciesToFill.forEach((s) => {
    if (!byFile[s.filePath]) byFile[s.filePath] = [];
    byFile[s.filePath].push(s);
  });

  for (const [filePath, items] of Object.entries(byFile)) {
    for (const { name, genusName, array, index } of items) {
      process.stdout.write("Вид " + name + "… ");
      try {
        const text = await askOpenRouter(
          apiKey,
          "Вид кактуса: " + name + " (род " + genusName + "). Одно-два предложения: внешний вид, ареал или уход."
        );
        if (text) {
          array[index].description = text;
          console.log("ок");
        } else console.log("пустой ответ");
      } catch (e) {
        console.log("ошибка:", e.message);
      }
      await sleep(DELAY_MS);
    }
    fs.writeFileSync(filePath, JSON.stringify(array, null, 2), "utf8");
  }

  console.log("Готово. Карточки заполнены описаниями от нейросети.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
