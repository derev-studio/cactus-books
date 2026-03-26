/**
 * Единая система языка сайта.
 * Умное определение языка: 1) выбор пользователя, 2) язык системы, 3) геолокация, 4) русский по умолчанию
 * Для Израиля с русским языком системы - показывает русский, а не иврит
 */
(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'cactusbooks_lang';
  var SUPPORTED = ['ar', 'hy', 'be', 'bn', 'bg', 'zh', 'hr', 'cs', 'nl', 'en', 'es', 'fr', 'ka', 'de', 'el', 'he', 'hi', 'hu', 'id', 'it', 'jp', 'kk', 'ko', 'ky', 'pl', 'pt', 'ro', 'ru', 'sr', 'sk', 'sl', 'sv', 'th', 'tr', 'uk', 'uz', 'vi'];
  var DEFAULT_LANG = 'ru';
  
  // Карта соответствия стран языкам
  var COUNTRY_LANG_MAP = {
    'IL': 'he', // Израиль
    'UA': 'uk', // Украина
    'BY': 'be', // Беларусь
    'KZ': 'kk', // Казахстан
    'KG': 'ky', // Кыргызстан
    'UZ': 'uz', // Узбекистан
    'AM': 'hy', // Армения
    'GE': 'ka', // Грузия
    'RU': 'ru', // Россия
  };

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
      }
    } catch (_) {}
    return DEFAULT_LANG;
  }
  
  function detectByTimezone() {
    try {
      var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      var city = timezone.split('/')[1];
      if (!city) return null;
      
      // Определяем страну по часовому поясу
      if (city.includes('Jerusalem') || city.includes('Tel_Aviv')) return 'IL';
      if (city.includes('Kyiv') || city.includes('Kiev')) return 'UA';
      if (city.includes('Minsk')) return 'BY';
      if (city.includes('Almaty') || city.includes('Astana')) return 'KZ';
      if (city.includes('Bishkek')) return 'KG';
      if (city.includes('Tashkent')) return 'UZ';
      if (city.includes('Yerevan')) return 'AM';
      if (city.includes('Tbilisi')) return 'GE';
      if (city.includes('Moscow') || city.includes('St_Petersburg')) return 'RU';
    } catch (_) {}
    return null;
  }
  
  function getSmartLang() {
    // 1. Проверяем сохраненный выбор пользователя
    var stored = getStored();
    if (stored) return stored;
    
    // 2. Определяем язык браузера/системы
    var browserLang = detectBrowser();
    
    // 3. Для Израиля: если язык системы русский - показываем русский, а не иврит
    var userCountry = detectByTimezone();
    if (userCountry === 'IL' && browserLang === 'ru') {
      return 'ru'; // Пользователь из Израиля с русским языком
    }
    
    // 4. Для других стран: если есть официальный язык страны - используем его
    if (userCountry && COUNTRY_LANG_MAP[userCountry]) {
      // Но только если язык системы не совпадает с официальным языком страны
      var officialLang = COUNTRY_LANG_MAP[userCountry];
      if (browserLang !== officialLang && browserLang !== DEFAULT_LANG) {
        return browserLang; // Используем язык системы
      }
      return officialLang; // Используем официальный язык страны
    }
    
    // 5. По умолчанию - язык системы
    return browserLang;
  }

  function getLang() {
    var smartLang = getSmartLang();
    try { localStorage.setItem(LANG_STORAGE_KEY, smartLang); } catch (_) {}
    return smartLang;
  }

  function setLang(code) {
    if (SUPPORTED.indexOf(code) === -1) return;
    try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch (_) {}
    applyRtl(code);
    updateActiveLanguageUI(code); // Обновляем подсветку активного языка
    try {
      window.dispatchEvent(new CustomEvent('cactusbooks-lang-applied', { detail: { lang: code } }));
    } catch (_) {}
  }
  
  // Функция для обновления подсветки активного языка в интерфейсе
  function updateActiveLanguageUI(langCode) {
    // Обновляем кнопки на стартовой странице
    document.querySelectorAll('.intro__lang-btn').forEach(function(btn) {
      if (btn.getAttribute('data-lang') === langCode) {
        btn.setAttribute('data-current-lang', 'true');
      } else {
        btn.removeAttribute('data-current-lang');
      }
    });
    
    // Обновляем пункты в выпадающем меню
    document.querySelectorAll('.globe-menu__item').forEach(function(item) {
      if (item.getAttribute('data-lang') === langCode) {
        item.setAttribute('data-current-lang', 'true');
      } else {
        item.removeAttribute('data-current-lang');
      }
    });
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
