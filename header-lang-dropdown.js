/**
 * На страницах кроме главной (index): одна кнопка-глобус справа вверху с выпадающим списком языков.
 * Использует I18n.SUPPORTED и I18n.setLang(); выбор сохраняется в localStorage и действует на всех страницах.
 */
(function () {
  'use strict';

  function init() {
    var container = document.getElementById('header-lang-dropdown') || document.querySelector('.header-lang-dropdown');
    if (!container || !window.I18n || !window.I18n.SUPPORTED || window.I18n.SUPPORTED.length === 0) return;

    var supported = window.I18n.SUPPORTED;
    var current = window.I18n.getLang();
    var ariaLabel = (typeof window.I18n.t === 'function' ? window.I18n.t('globe_aria') : 'Choose language') || 'Choose language';

    var details = document.createElement('details');
    details.className = 'site-header__globe header-lang-details';
    details.setAttribute('role', 'group');

    var summary = document.createElement('summary');
    summary.className = 'globe-btn header-lang-summary';
    summary.setAttribute('aria-label', ariaLabel);
    summary.setAttribute('aria-haspopup', 'listbox');
    summary.textContent = '\uD83C\uDF10';
    summary.title = ariaLabel;

    var panel = document.createElement('div');
    panel.className = 'site-header__lang-list header-lang-panel';
    panel.setAttribute('role', 'listbox');

    for (var i = 0; i < supported.length; i++) {
      var item = supported[i];
      var code = item.code, name = item.name, flag = item.flag || '';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'header-lang-option' + (code === current ? ' header-lang-option--current' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-lang', code);
      btn.setAttribute('aria-selected', code === current ? 'true' : 'false');
      btn.textContent = flag ? flag + ' ' + name : name;
      btn.title = name;
      btn.addEventListener('click', (function (c) {
        return function () {
          if (window.I18n && typeof window.I18n.setLang === 'function') window.I18n.setLang(c);
          details.removeAttribute('open');
        };
      })(code));
      panel.appendChild(btn);
    }

    details.appendChild(summary);
    details.appendChild(panel);
    container.appendChild(details);

    window.addEventListener('cactusbooks-lang-applied', function (e) {
      var lang = e.detail && e.detail.lang;
      if (!lang) return;
      panel.querySelectorAll('.header-lang-option').forEach(function (opt) {
        var isCurrent = opt.getAttribute('data-lang') === lang;
        opt.classList.toggle('header-lang-option--current', isCurrent);
        opt.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
