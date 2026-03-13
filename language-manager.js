/**
 * Единая система языка сайта.
 * Определяет язык по navigator.language и localStorage (cactusbooks_lang).
 * Поддерживаемые: ru, en, uk, es, he (иврит), zh (китайский).
 * Для he автоматически включается dir="rtl".
 */
(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'cactusbooks_lang';
  var SUPPORTED = ['ru', 'en', 'uk', 'es', 'he', 'zh'];
  var DEFAULT_LANG = 'ru';

  function getStored() {
    try {
      var v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v && SUPPORTED.indexOf(v) !== -1) return v;
    } catch (_) {}
    return null;
  }

  function detectBrowser() {
    try {
      var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
      for (var i = 0; i < list.length; i++) {
        var tag = (list[i] || '').split('-')[0].toLowerCase();
        if (!tag) continue;
        if (tag === 'ja') tag = 'jp';
        if (SUPPORTED.indexOf(tag) !== -1) return tag;
        if (tag === 'jp') return 'en';
      }
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function getLang() {
    var stored = getStored();
    if (stored) return stored;
    var detected = detectBrowser();
    try { localStorage.setItem(LANG_STORAGE_KEY, detected); } catch (_) {}
    return detected;
  }

  function setLang(code) {
    if (SUPPORTED.indexOf(code) === -1) return;
    try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch (_) {}
    applyRtl(code);
    try {
      window.dispatchEvent(new CustomEvent('cactusbooks-lang-applied', { detail: { lang: code } }));
    } catch (_) {}
  }

  function applyRtl(lang) {
    var root = document.documentElement;
    if (lang === 'he') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'he');
    } else {
      root.removeAttribute('dir');
      root.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : lang);
    }
  }

  function init() {
    var lang = getLang();
    applyRtl(lang);
    try {
      window.dispatchEvent(new CustomEvent('cactusbooks-lang-applied', { detail: { lang: lang } }));
    } catch (_) {}
  }

  window.LanguageManager = {
    getLang: getLang,
    setLang: setLang,
    applyRtl: applyRtl,
    init: init,
    SUPPORTED: SUPPORTED,
    LANG_STORAGE_KEY: LANG_STORAGE_KEY
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
