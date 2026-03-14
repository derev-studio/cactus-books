/**
 * Локализация шапки по сохранённому языку сайта (как i18n.js).
 * Язык берётся из localStorage cactusbooks_lang — меню и книга ведут себя одинаково.
 */
(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'cactusbooks_lang';
  var HEADER_LANGS = { ar: true, hy: true, be: true, bn: true, bg: true, zh: true, hr: true, cs: true, nl: true, en: true, es: true, fr: true, ka: true, de: true, el: true, he: true, hi: true, hu: true, id: true, it: true, jp: true, kk: true, ko: true, ky: true, pl: true, pt: true, ro: true, ru: true, sr: true, sk: true, sl: true, sv: true, th: true, tr: true, uk: true, uz: true, vi: true };

  function getHeaderStrings() {
    var data = window.__LANGUAGES__ && window.__LANGUAGES__.header;
    return data || {};
  }

  function getStoredLang() {
    try {
      var v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v && HEADER_LANGS[v]) return v;
    } catch (_) {}
    return null;
  }

  function getBrowserLocale() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var tag = (list[i] || '').split('-')[0].toLowerCase();
      if (tag === 'ja') tag = 'jp';
      if (HEADER_LANGS[tag]) return tag;
    }
    return 'en';
  }

  function getHeaderLocale() {
    if (window.I18n && typeof window.I18n.getLang === 'function') return window.I18n.getLang();
    if (window.LanguageManager && typeof window.LanguageManager.getLang === 'function') return window.LanguageManager.getLang();
    return getStoredLang() || getBrowserLocale();
  }

  function applyHeaderLocale() {
    var lang = getHeaderLocale();
    var headerData = getHeaderStrings();
    var ui = headerData[lang] || headerData.en;
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

  function runWhenHeaderReady(fn) {
    if (window.__LANGUAGES__ && window.__LANGUAGES__.header) {
      fn();
    } else {
      window.addEventListener('cactusbooks-languages-loaded', fn, { once: true });
    }
  }
  function tryApplyHeader() {
    if (window.__LANGUAGES__ && window.__LANGUAGES__.header) applyHeaderLocale();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { runWhenHeaderReady(applyHeaderLocale); });
  } else {
    runWhenHeaderReady(applyHeaderLocale);
  }
  window.addEventListener('cactusbooks-lang-applied', applyHeaderLocale);
  window.addEventListener('cactusbooks-languages-loaded', tryApplyHeader);
})();
