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
  identifierPreface: "Я только обучаюсь, могу ошибиться. По моим данным это возможно [название]. А как вы считаете, как он называется?",

  // Твой GitHub: галерея и админка работают с этим репо. Оставь пустым — только локальные data/.
  githubOwner: "",           // например: alexanderermolovich
  githubRepo: "cactus",      // имя репозитория (cactus, cactus-books и т.д.)
};
