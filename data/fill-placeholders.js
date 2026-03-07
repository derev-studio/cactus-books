#!/usr/bin/env node
/**
 * Один раз заполняет пустые info (роды) и description (виды) заготовками.
 * Запуск: node data/fill-placeholders.js
 * После этого можно выборочно заменять заготовки на нормальные тексты.
 */

const fs = require('fs');
const path = require('path');

const TAXONOMY_PATH = path.join(__dirname, 'taxonomy.json');
const SPECIES_DIR = path.join(__dirname, 'species');

function genusPlaceholder(name) {
  return name + ' — род кактусов семейства Cactaceae. Подробное описание будет добавлено позже.';
}

function speciesPlaceholder(name, genusName) {
  return name + ' — вид рода ' + genusName + '. Подробное описание будет добавлено позже.';
}

function capitalizeGenus(filename) {
  const base = path.basename(filename, '.json');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

// Роды в taxonomy.json
let taxonomy;
try {
  taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf8'));
} catch (e) {
  console.error('Не удалось прочитать taxonomy.json:', e.message);
  process.exit(1);
}

let genusCount = 0;

function walk(node) {
  if (!node) return;
  if (node.type === 'genus') {
    const info = (node.info || '').trim();
    if (!info) {
      node.info = genusPlaceholder(node.name || '');
      genusCount++;
    }
  }
  (node.children || []).forEach(walk);
}

walk(taxonomy);
fs.writeFileSync(TAXONOMY_PATH, JSON.stringify(taxonomy, null, 2), 'utf8');
console.log('Роды (taxonomy.json): подставлено заготовок:', genusCount);

// Виды в data/species/*.json
const speciesFiles = fs.readdirSync(SPECIES_DIR).filter((f) => f.endsWith('.json'));
let speciesCount = 0;

speciesFiles.forEach((file) => {
  const filePath = path.join(SPECIES_DIR, file);
  const genusName = capitalizeGenus(file);
  let arr;
  try {
    arr = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn('Пропуск', file, e.message);
    return;
  }
  if (!Array.isArray(arr)) return;
  let changed = false;
  arr.forEach((item) => {
    const desc = (item.description || '').trim();
    if (!desc) {
      item.description = speciesPlaceholder(item.name || item.id || '—', genusName);
      speciesCount++;
      changed = true;
    }
  });
  if (changed) fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
});

console.log('Виды (species/*.json): подставлено заготовок:', speciesCount);
console.log('Готово. Запусти один раз — все карточки будут с текстом. Дальше можно менять только нужные.');
