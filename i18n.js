/**
 * Языки сайта: порядок по английскому алфавиту (A–Z). Флаги показываем крупно — чтобы было проще найти свой язык.
 * Для языков без перевода — русский (DEFAULT_LANG).
 */
(function () {
  const LANG_STORAGE_KEY = "cactusbooks_lang";
  /* Порядок по английскому алфавиту (English name): Arabic, Armenian, … Russian (R), … Ukrainian (U), … */
  const SUPPORTED = [
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hy", name: "Հայերեն", flag: "🇦🇲" },
    { code: "be", name: "Беларуская", flag: "🇧🇾" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "bg", name: "Български", flag: "🇧🇬" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "hr", name: "Hrvatski", flag: "🇭🇷" },
    { code: "cs", name: "Čeština", flag: "🇨🇿" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ka", name: "ქართული", flag: "🇬🇪" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
    { code: "he", name: "עברית", flag: "🇮🇱" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "hu", name: "Magyar", flag: "🇭🇺" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "jp", name: "日本語", flag: "🇯🇵" },
    { code: "kk", name: "Қазақша", flag: "🇰🇿" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ky", name: "Кыргызча", flag: "🇰🇬" },
    { code: "pl", name: "Polski", flag: "🇵🇱" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
    { code: "ro", name: "Română", flag: "🇷🇴" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "sr", name: "Српски", flag: "🇷🇸" },
    { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
    { code: "sl", name: "Slovenščina", flag: "🇸🇮" },
    { code: "sv", name: "Svenska", flag: "🇸🇪" },
    { code: "th", name: "ไทย", flag: "🇹🇭" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "uk", name: "Українська", flag: "🇺🇦" },
    { code: "uz", name: "Oʻzbekcha", flag: "🇺🇿" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  ];
  const DEFAULT_LANG = "ru";

  /* Строки загружаются из data/languages.json (секция strings). */
  function getLanguagesBase() {
    try {
      var script = document.currentScript || document.querySelector('script[src*="i18n"]');
      if (script && script.src) return script.src.replace(/[^/]*$/, '');
    } catch (_) {}
    return '';
  }
  function loadLanguages(cb) {
    if (window.__LANGUAGES__) {
      if (cb) cb();
      return;
    }
    var base = getLanguagesBase();
    var url = base + 'data/languages.json';
    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
      window.__LANGUAGES__ = data;
      try { window.dispatchEvent(new CustomEvent('cactusbooks-languages-loaded', { detail: data })); } catch (_) {}
      if (cb) cb();
    }).catch(function () {
      window.__LANGUAGES__ = { strings: {}, header: {}, classification: {} };
      if (cb) cb();
    });
  }

  function getStrings() {
    return (window.__LANGUAGES__ && window.__LANGUAGES__.strings) || {};
  }
  function getI18NRow(key) {
    var strings = getStrings();
    return strings[key] || null;
  }

  /* I18N data loaded from data/languages.json (see getI18NRow). */

  function _runInit() {
    if (!window.__LANGUAGES__ || !window.__LANGUAGES__.strings) return;
    init();
  }

  function detectBrowserLang() {
    try {
      var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
      for (var i = 0; i < list.length; i++) {
        var tag = (list[i] || "").split("-")[0].toLowerCase();
        if (!tag) continue;
        if (tag === "ja") tag = "jp";
        if (SUPPORTED.some(function (s) { return s.code === tag; })) return tag;
      }
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function getStoredLang() {
    try {
      if (window.LanguageManager && typeof window.LanguageManager.getLang === 'function') {
        return window.LanguageManager.getLang();
      }
      const v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v && SUPPORTED.some(function (s) { return s.code === v; })) {
        return v;
      }
      var detected = detectBrowserLang();
      setStoredLang(detected);
      return detected;
    } catch (_) {}
    return DEFAULT_LANG;
  }

  function setStoredLang(code) {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, code);
    } catch (_) {}
  }

  /* При открытии с ?lang=ru (или другим кодом) — принудительно ставим этот язык и убираем параметр из URL */
  try {
    var params = new URLSearchParams(window.location.search);
    var langParam = params.get("lang");
    if (langParam && SUPPORTED.some(function (s) { return s.code === langParam; })) {
      setStoredLang(langParam);
      var cleanUrl = window.location.pathname + (window.location.hash || "");
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", cleanUrl);
    }
  } catch (_) {}

  let currentLang = getStoredLang();

  function t(key) {
    const row = getI18NRow(key);
    if (!row) return key;
    if (row[currentLang] != null && row[currentLang] !== "") return row[currentLang];
    if (row.en != null && row.en !== "") return row.en;
    if (row[DEFAULT_LANG] != null && row[DEFAULT_LANG] !== "") return row[DEFAULT_LANG];
    return key;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(code) {
    if (!SUPPORTED.some(function (s) { return s.code === code; })) return;
    currentLang = code;
    setStoredLang(code);
    try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch (_) {}
    if (window.LanguageManager && window.LanguageManager.applyRtl) {
      window.LanguageManager.applyRtl(code);
    } else {
      document.documentElement.lang = code === "zh" ? "zh-Hans" : code;
      if (code === "he") document.documentElement.setAttribute("dir", "rtl");
      else document.documentElement.removeAttribute("dir");
    }
    applyToPage();
    try {
      window.dispatchEvent(new CustomEvent("soulart-language-change", { detail: { lang: code } }));
      window.dispatchEvent(new CustomEvent("cactusbooks-lang-applied", { detail: { lang: code } }));
    } catch (_) {}
    setTimeout(function () { applyToPage(); }, 0);
  }

  function escapeHtml(s) {
    if (s == null) return "";
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function escapeAttr(s) {
    if (s == null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function linkify(text) {
    if (text == null) return "";
    const re = /(https?:\/\/[^\s<>"')\]]+)/g;
    const parts = String(text).split(re);
    const out = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        out.push("<a class=\"story-link\" href=\"" + escapeAttr(parts[i]) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + escapeHtml(parts[i]) + "</a>");
      } else {
        out.push(escapeHtml(parts[i]));
      }
    }
    return out.join("");
  }

  function applyToPage() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      if (key.indexOf("story_") === 0 && !getI18NRow(key)) return;
      const text = t(key);
      if (el.getAttribute("data-i18n-attr")) {
        const attr = el.getAttribute("data-i18n-attr");
        el.setAttribute(attr, text);
      } else if (el.getAttribute("data-i18n-placeholder") !== null) {
        el.placeholder = text;
      } else if (el.getAttribute("data-i18n-linkify") !== null) {
        el.innerHTML = linkify(text);
      } else {
        el.textContent = text;
      }
    });
    document.documentElement.lang = currentLang === "zh" ? "zh-Hans" : currentLang;
  }

  function init() {
    currentLang = getStoredLang();
    if (window.LanguageManager && window.LanguageManager.applyRtl) {
      window.LanguageManager.applyRtl(currentLang);
    }
    document.documentElement.lang = currentLang === "zh" ? "zh-Hans" : currentLang;
    if (currentLang === "he") document.documentElement.setAttribute("dir", "rtl");
    applyToPage();
    setTimeout(function () { applyToPage(); }, 50);
    try {
      window.dispatchEvent(new CustomEvent("cactusbooks-lang-applied", { detail: { lang: currentLang } }));
    } catch (_) {}
  }

  window.I18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    applyToPage: applyToPage,
    init: init,
    SUPPORTED: SUPPORTED,
  };

  loadLanguages(function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _runInit);
    } else {
      _runInit();
    }
  });
})();
