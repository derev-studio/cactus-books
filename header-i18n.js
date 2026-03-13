/**
 * Локализация шапки по сохранённому языку сайта (как i18n.js).
 * Язык берётся из localStorage cactusbooks_lang — меню и книга ведут себя одинаково.
 */
(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'cactusbooks_lang';
  var HEADER_LANGS = { ru: true, uk: true, en: true, es: true };

  var HEADER_STRINGS = {
    ru: {
      brand: '🌵 Кактусярий',
      searchPlaceholder: 'Название кактуса…',
      searchBtn: 'Найти',
      navLabel: 'Навигатор по кактусам',
      linkOrigin: 'Происхождение видов',
      linkGeography: 'Места обитания',
      linkCare: 'Здоровье кактуса',
      linkIdentifier: 'Опознать кактус',
      linkGuardian: 'Колючий Собеседник',
      moreSummary: 'Ещё',
      dropdownHome: 'Главная',
      dropdownNav: 'Навигатор по кактусам',
      dropdownBook: 'Кактусология',
      dropdownGreat: 'Великие кактусоводы',
      dropdownGallery: 'Галерея',
      dropdownStories: 'Рассказы',
      dropdownRelax: 'Отдых',
      dropdownDraw: 'Рисование',
      dropdownSucculents: 'Суккуленты',
      dropdownEdible: 'Съедобные кактусы',
      dropdownRarities: 'Редкости',
      dropdownFacts: 'Интересные факты',
      dropdownCaution: 'Осторожно',
      startLink: '← Стартовая',
      dropdownFiles: 'Список файлов (по алфавиту)'
    },
    uk: {
      brand: '🌵 Кактусярий',
      searchPlaceholder: 'Назва кактуса…',
      searchBtn: 'Знайти',
      navLabel: 'Навігатор по кактусах',
      linkOrigin: 'Походження видів',
      linkGeography: 'Місця проживання',
      linkCare: "Здоров'я кактуса",
      linkIdentifier: 'Впізнати кактус',
      linkGuardian: 'Колючий Співбесідник',
      moreSummary: 'Ще',
      dropdownHome: 'Головна',
      dropdownNav: 'Навігатор по кактусах',
      dropdownBook: 'Кактусологія',
      dropdownGreat: 'Великі кактусоводи',
      dropdownGallery: 'Галерея',
      dropdownStories: 'Оповідання',
      dropdownRelax: 'Відпочинок',
      dropdownDraw: 'Малювання',
      dropdownSucculents: 'Сукуленти',
      dropdownEdible: 'Їстівні кактуси',
      dropdownRarities: 'Рідкості',
      dropdownFacts: 'Цікаві факти',
      dropdownCaution: 'Обережно',
      startLink: '← Стартова',
      dropdownFiles: 'Список файлів (за абеткою)'
    },
    en: {
      brand: '🌵 Cactusarium',
      searchPlaceholder: 'Cactus name…',
      searchBtn: 'Search',
      navLabel: 'Cactus navigator',
      linkOrigin: 'Origin of species',
      linkGeography: 'Habitats',
      linkCare: 'Cactus care',
      linkIdentifier: 'Identify cactus',
      linkGuardian: 'Prickly Companion',
      moreSummary: 'More',
      dropdownHome: 'Home',
      dropdownNav: 'Cactus navigator',
      dropdownBook: 'Cactology',
      dropdownGreat: 'Great cactologists',
      dropdownGallery: 'Gallery',
      dropdownStories: 'Stories',
      dropdownRelax: 'Relax',
      dropdownDraw: 'Drawing',
      dropdownSucculents: 'Succulents',
      dropdownEdible: 'Edible cacti',
      dropdownRarities: 'Rarities',
      dropdownFacts: 'Interesting facts',
      dropdownCaution: 'Caution',
      startLink: '← Start',
      dropdownFiles: 'File list (A–Z)'
    },
    es: {
      brand: '🌵 Cactusarium',
      searchPlaceholder: 'Nombre del cactus…',
      searchBtn: 'Buscar',
      navLabel: 'Navegador de cactus',
      linkOrigin: 'Origen de las especies',
      linkGeography: 'Hábitats',
      linkCare: 'Cuidado del cactus',
      linkIdentifier: 'Identificar cactus',
      linkGuardian: 'Compañero espinoso',
      moreSummary: 'Más',
      dropdownHome: 'Inicio',
      dropdownNav: 'Navegador de cactus',
      dropdownBook: 'Cactología',
      dropdownGreat: 'Grandes cactólogos',
      dropdownGallery: 'Galería',
      dropdownStories: 'Relatos',
      dropdownRelax: 'Relax',
      dropdownDraw: 'Dibujo',
      dropdownSucculents: 'Suculentas',
      dropdownEdible: 'Cactus comestibles',
      dropdownRarities: 'Rarezas',
      dropdownFacts: 'Datos curiosos',
      dropdownCaution: 'Precaución',
      startLink: '← Inicio',
      dropdownFiles: 'Lista de archivos (A–Z)'
    }
  };

  function getStoredLang() {
    try {
      var v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v && HEADER_LANGS[v]) return v;
    } catch (_) {}
    return null;
  }

  function getBrowserLocale() {
    var lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (lang.indexOf('uk') === 0) return 'uk';
    if (lang.indexOf('ru') === 0) return 'ru';
    if (lang.indexOf('es') === 0) return 'es';
    return 'en';
  }

  function getHeaderLocale() {
    return getStoredLang() || getBrowserLocale();
  }

  function applyHeaderLocale() {
    var lang = getHeaderLocale();
    var ui = HEADER_STRINGS[lang] || HEADER_STRINGS.ru;
    var set = function (id, text) {
      var el = document.getElementById(id);
      if (el && text !== undefined) el.textContent = text;
    };
    var setPlaceholder = function (id, text) {
      var el = document.getElementById(id);
      if (el && text !== undefined) el.placeholder = text;
    };

    if (ui.brand !== undefined) set('header-brand', ui.brand);
    setPlaceholder('nav-search', ui.searchPlaceholder);
    set('header-search-btn', ui.searchBtn);
    set('header-nav-label', ui.navLabel);
    set('header-link-origin', ui.linkOrigin);
    set('header-link-geography', ui.linkGeography);
    set('header-link-care', ui.linkCare);
    set('header-link-identifier', ui.linkIdentifier);
    set('header-link-guardian', ui.linkGuardian);
    set('header-more-summary', ui.moreSummary);
    set('header-dropdown-home', ui.dropdownHome);
    set('header-dropdown-nav', ui.dropdownNav);
    set('header-dropdown-book', ui.dropdownBook);
    set('header-dropdown-great', ui.dropdownGreat);
    set('header-dropdown-gallery', ui.dropdownGallery);
    set('header-dropdown-stories', ui.dropdownStories);
    set('header-dropdown-relax', ui.dropdownRelax);
    set('header-dropdown-draw', ui.dropdownDraw);
    set('header-dropdown-succulents', ui.dropdownSucculents);
    set('header-dropdown-edible', ui.dropdownEdible);
    set('header-dropdown-rarities', ui.dropdownRarities);
    set('header-dropdown-facts', ui.dropdownFacts);
    set('header-dropdown-caution', ui.dropdownCaution);
    set('header-start-link', ui.startLink);
    set('header-dropdown-files', ui.dropdownFiles);
    var bookLink = document.getElementById('header-dropdown-book');
    if (bookLink) {
      var base = (bookLink.getAttribute('href') || '').replace(/book-read[^.]*\.html$/, '');
      if (lang === 'uk') bookLink.href = base + 'book-read.html';
      else if (lang === 'ru') bookLink.href = base + 'book-read-ru.html';
      else bookLink.href = base + 'book-read-en.html';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeaderLocale);
  } else {
    applyHeaderLocale();
  }
  window.addEventListener('cactusbooks-lang-applied', applyHeaderLocale);
})();
