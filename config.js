/**
 * Настройки ТВОЕГО сайта — отдельный проект, не связанный с репозиторием Даши.
 *
 * 1. workerUrl — твой Cloudflare Worker (ключи храни в Variables воркера, сюда только URL).
 * 2. githubOwner / githubRepo — ТВОЙ репозиторий для галереи и админки. Данные и картинки
 *    будут грузиться отсюда. Не указывай derev-studio/cactus-books — это проект Даши.
 *
 * Подробно: НАСТРОЙКА.md
 */
window.APP_CONFIG = window.APP_CONFIG || {
  workerUrl: "https://cactus-openrouter.qerevv.workers.dev",
  identifierPreface: "Определи кактус аккуратно и без фантазии. Если уверенность низкая, так и напиши: \"Низкая уверенность\". Не подменяй роды. Отвечай строго валидным JSON по схеме сервиса: name_ru, name_latin, lat, lon, region, description, facts, care, message.",

  // Твой GitHub: галерея и админка работают с этим репо. Оставь пустым — только локальные data/.
  githubOwner: "",           // например: alexanderermolovich
  githubRepo: "cactus",      // имя репозитория (cactus, cactus-books и т.д.)
};
