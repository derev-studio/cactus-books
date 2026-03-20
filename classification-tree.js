/**
 * Раскрывающееся дерево систематики кактусов.
 * Ленивая загрузка: виды подгружаются только при открытии рода.
 * Карточки с заготовками, если нет описания.
 */

(function () {
  'use strict';

  var TAXONOMY_URL = 'data/taxonomy.json';
  var SPECIES_BASE = 'data/species/';
  var BRIDGE_URL = 'data/synonyms_bridge.json';

  var LEVEL_LABELS = {
    family: 'семейство',
    subfamily: 'подсемейство',
    tribe: 'триба',
    genus: 'род',
    species: 'вид'
  };

  /** Строки интерфейса из data/languages.json (секция classification) */
  function getClassificationStrings() {
    return (window.__LANGUAGES__ && window.__LANGUAGES__.classification) || {};
  }

  function getUILocale() {
    var data = getClassificationStrings();
    if (window.I18n && typeof window.I18n.getLang === 'function') {
      var lang = window.I18n.getLang();
      if (data[lang]) return lang;
    }
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    for (var i = 0; i < list.length; i++) {
      var tag = (list[i] || '').split('-')[0].toLowerCase();
      if (tag === 'ja') tag = 'jp';
      if (data[tag]) return tag;
    }
    return 'en';
  }

  var FALLBACK_UI = { back: '← Back', backAria: 'Back', close: 'Close', species: 'Species', seeAlso: 'See also', loading: 'Loading…', noSpeciesData: 'No species data.', infraspecific: 'Subspecies, varieties and forms', treeError: 'Failed to load tree.', level: { subfamily: 'subfamily', tribe: 'tribe', genus: 'genus', species: 'species' }, rank: { subspecies: 'Subspecies', variety: 'Variety', form: 'Form' }, genusPlaceholder: ' — genus of Cactaceae. Description to be added.', speciesPlaceholder: ' — species of genus %s. Description to be added.', photoSource: 'Photo: ', morphologyTitle: 'Morphology', pageTitle: 'Cactus classification', pageIntro: 'Family Cactaceae: subfamilies, tribes, genera and species.', cornerLabel: 'Cacti', prevSynonyms: 'Previously / synonyms: ', previouslyCalled: 'Previously called: ', synonymsLabel: 'Synonyms: ', synonymsBasionym: 'Synonyms / basionym: ', morphSourceLabel: 'Source: ', morphLicenseLabel: 'License: ', expandAria: 'Expand', collapseAria: 'Collapse', morphLabels: { stem: 'Stem', spines: 'Spines', flower: 'Flower', fruit: 'Fruit' } };
  function getUIStrings() {
    var data = getClassificationStrings();
    var ui = data[getUILocale()] || data.en;
    if (ui && typeof ui === 'object') return ui;
    return FALLBACK_UI;
  }

  var treeRoot = null;
  var treeLoading = null;
  var treeError = null;
  var cardPanel = null;
  var cardClose = null;
  var cardNameBackeberg = null;
  var cardNameModern = null;
  var cardNamePreviously = null;
  var cardNameSynonyms = null;
  var cardLevel = null;
  var cardDesc = null;
  var cardSpeciesWrap = null;
  var cardSpeciesList = null;
  var cardInfraspecificWrap = null;
  var cardInfraspecificList = null;
  var cardSeeAlsoWrap = null;
  var cardSeeAlsoList = null;
  var cardExploreWrap = null;
  var cardExploreGallery = null;
  var cardExploreStories = null;
  var cardExploreBook = null;
  var cardExploreGoogle = null;
  var taxonomy = null;
  var speciesCache = {};
  var synonymsBridge = null;
  var pathStack = [];
  var breadcrumbWrap = null;
  var backBtn = null;
  var breadcrumbEl = null;
  var initialTarget = null;

  // Атлас/карта ареала (на этой же странице систематики)
  var atlasAuto = false;
  var atlasToggleBtn = null;
  var atlasPanel = null;
  var atlasMapEl = null;
  var atlasStatusEl = null;
  var atlasMapInstance = null;
  var atlasCache = {}; // name -> occurrences[]
  var atlasReqId = 0;
  var currentAtlasTaxonName = '';

  function getChildren(node) {
    return node && node.children ? node.children : [];
  }

  function levelLabel(type) {
    var ui = getUIStrings();
    return (ui.level && ui.level[type]) || LEVEL_LABELS[type] || type;
  }

  function genusPlaceholder(name) {
    return name + (getUIStrings().genusPlaceholder || '');
  }

  function speciesPlaceholder(name, genusName) {
    var t = getUIStrings().speciesPlaceholder || '';
    return name + t.replace('%s', genusName || '');
  }

  /** Проверка, что строка содержит кириллицу (русский текст) */
  function hasCyrillic(str) {
    if (!str || typeof str !== 'string') return false;
    return /[\u0400-\u04FF]/.test(str);
  }

  function wikiArticleUrl(speciesName) {
    if (!speciesName || typeof speciesName !== 'string') return '';
    var s = speciesName.trim().replace(/\s*[(\[].*$/, '').trim();
    var parts = s.split(/\s+/);
    if (parts.length >= 2) {
      var genus = parts[0].replace(/\×/g, '').trim();
      var epithet = parts[1].replace(/\×/g, '').trim();
      if (genus && epithet) {
        return 'https://en.wikipedia.org/wiki/' + encodeURIComponent(genus + '_' + epithet);
      }
    }
    return 'https://en.wikipedia.org/wiki/Cactaceae';
  }

  var CC_BY_SA_URL = 'https://creativecommons.org/licenses/by-sa/4.0/deed.ru';

  /** Ссылка на карточку вида по латинскому имени (Genus epithet → ?genus=...&species=...) */
  function speciesHref(latinName) {
    if (!latinName || typeof latinName !== 'string') return '';
    var s = latinName.trim().replace(/\s*[(\[].*$/, '').trim();
    var parts = s.split(/\s+/);
    if (parts.length >= 2) {
      var genus = parts[0].toLowerCase().replace(/[^a-z0-9-]/g, '');
      var epithet = parts[1].toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (genus && epithet) {
        var speciesId = genus + '-' + epithet;
        var base = window.location.pathname || '/classification-cacti.html';
        return base + '?genus=' + encodeURIComponent(genus) + '&species=' + encodeURIComponent(speciesId);
      }
    }
    return '';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    var t = String(s);
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function getAtlasAutoFlag() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var raw = (params.get('atlas') || '').toLowerCase();
      return raw === '1' || raw === 'true' || raw === 'yes';
    } catch (_) {
      return false;
    }
  }

  function atlasSetStatus(text, isHidden) {
    if (!atlasStatusEl) return;
    if (isHidden) {
      atlasStatusEl.hidden = true;
    } else {
      atlasStatusEl.hidden = false;
      atlasStatusEl.textContent = text || '';
    }
  }

  function atlasShowPanelAndLoad(taxonName) {
    if (!atlasToggleBtn || !atlasPanel) return;
    atlasPanel.hidden = false;
    atlasToggleBtn.setAttribute('aria-expanded', 'true');
    if (atlasAuto && taxonName) atlasUpdateAtlas(taxonName);
  }

  function atlasTogglePanel() {
    if (!atlasToggleBtn || !atlasPanel) return;
    var open = atlasPanel.hidden;
    atlasPanel.hidden = !open;
    atlasToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && currentAtlasTaxonName) {
      atlasUpdateAtlas(currentAtlasTaxonName);
    }
  }

  function atlasClearMap() {
    if (atlasMapInstance) {
      try { atlasMapInstance.remove(); } catch (_) {}
    }
    atlasMapInstance = null;
  }

  function atlasRenderMap(results, centerLat, centerLon, taxonLabel) {
    if (typeof L === 'undefined' || !atlasMapEl) return;
    atlasClearMap();
    atlasMapEl.innerHTML = '';

    atlasMapInstance = L.map(atlasMapEl, {
      center: [centerLat, centerLon],
      zoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    L.control.zoom({ position: "topright" }).addTo(atlasMapInstance);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(atlasMapInstance);

    var maxMarkers = Math.min(15, results.length || 0);
    for (var i = 0; i < maxMarkers; i++) {
      var it = results[i];
      var lat = (it && typeof it.decimalLatitude === 'number') ? it.decimalLatitude : null;
      var lon = (it && typeof it.decimalLongitude === 'number') ? it.decimalLongitude : null;
      if (lat == null || lon == null) continue;
      var popupParts = [];
      if (it.locality) popupParts.push(String(it.locality));
      var cc = it.country || it.countryCode || '';
      if (cc) popupParts.push(String(cc));
      if (it.year) popupParts.push('(' + String(it.year) + ')');
      var popupHtml = popupParts.length ? popupParts.join('<br/>') : "Метка ареала";
      var marker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: "identifier-marker",
          html: "<span aria-hidden=\"true\" style=\"display:inline-block;max-width:120px;padding:2px 6px;border-radius:999px;background:#f2f5ff;border:1px solid rgba(26,39,68,0.2);color:#1a2744;font-weight:700;font-size:11px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">" + escapeHtml(String(taxonLabel || 'Ареал')) + "</span>",
          iconSize: [120, 24],
          iconAnchor: [60, 22],
        })
      }).addTo(atlasMapInstance);
      marker.bindPopup(popupHtml, { closeButton: true, autoClose: false });
    }
  }

  function atlasUpdateAtlas(taxonName) {
    if (!taxonName || !atlasMapEl) return;
    if (typeof L === 'undefined') {
      atlasSetStatus("Карта временно недоступна (Leaflet не загрузился).");
      return;
    }
    atlasSetStatus("Загружаю ареал по данным GBIF…");

    var cacheKey = String(taxonName).trim().toLowerCase();
    if (!cacheKey) return;

    atlasReqId += 1;
    var myReq = atlasReqId;

    function useResults(res, usedName) {
      if (myReq !== atlasReqId) return;
      var list = Array.isArray(res) ? res : [];
      if (!list.length) {
        atlasSetStatus("Координаты не найдены для этого названия.");
        atlasRenderMap([], 20, 0, usedName || taxonName);
        return;
      }
      var sumLat = 0, sumLon = 0, cnt = 0;
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (a && typeof a.decimalLatitude === 'number' && typeof a.decimalLongitude === 'number') {
          sumLat += a.decimalLatitude;
          sumLon += a.decimalLongitude;
          cnt += 1;
        }
        if (cnt >= 10) break;
      }
      var centerLat = cnt ? (sumLat / cnt) : 20;
      var centerLon = cnt ? (sumLon / cnt) : 0;
      atlasSetStatus("Готово: показаны точки ареала (примерно).");
      atlasRenderMap(list, centerLat, centerLon, usedName || taxonName);
    }

    if (atlasCache[cacheKey]) {
      useResults(atlasCache[cacheKey], taxonName);
      return;
    }

    function fetchOccByKey(key) {
      if (!key) return Promise.resolve([]);
      return fetch(
        "https://api.gbif.org/v1/occurrence/search?taxonKey=" + encodeURIComponent(String(key)) +
        "&limit=25&hasCoordinate=true"
      )
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("gbif-occ")); })
        .then(function (occ) { return occ && Array.isArray(occ.results) ? occ.results : []; });
    }

    function tryByName(name) {
      return fetch("https://api.gbif.org/v1/species/match?name=" + encodeURIComponent(name))
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("gbif-match")); })
        .then(function (sp) {
          var key = sp && (sp.usageKey || sp.key);
          return fetchOccByKey(key).then(function (res) { return { results: res, usedName: name }; });
        });
    }

    function tryBySuggest(name) {
      return fetch("https://api.gbif.org/v1/species/suggest?q=" + encodeURIComponent(name) + "&limit=8")
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("gbif-suggest")); })
        .then(function (arr) {
          var list = Array.isArray(arr) ? arr : [];
          var p = Promise.resolve({ results: [], usedName: name });
          list.forEach(function (cand) {
            p = p.then(function (state) {
              if (state.results && state.results.length) return state;
              var key = cand && (cand.usageKey || cand.key);
              var label = (cand && (cand.canonicalName || cand.scientificName)) || name;
              return fetchOccByKey(key).then(function (res) { return { results: res, usedName: label }; });
            });
          });
          return p;
        });
    }

    tryByName(taxonName)
      .catch(function () { return { results: [], usedName: taxonName }; })
      .then(function (state) {
        if (state.results && state.results.length) return state;
        var genusOnly = String(taxonName).trim().split(/\s+/)[0] || taxonName;
        if (genusOnly && genusOnly.toLowerCase() !== String(taxonName).trim().toLowerCase()) {
          return tryByName(genusOnly).catch(function () { return { results: [], usedName: genusOnly }; });
        }
        return state;
      })
      .then(function (state) {
        if (state.results && state.results.length) return state;
        return tryBySuggest(taxonName).catch(function () { return { results: [], usedName: taxonName }; });
      })
      .then(function (state) {
        var results = state && Array.isArray(state.results) ? state.results : [];
        atlasCache[cacheKey] = results;
        useResults(results, state && state.usedName ? state.usedName : taxonName);
      })
      .catch(function () {
        if (myReq !== atlasReqId) return;
        atlasSetStatus("Не удалось загрузить карту ареала. Попробуйте позже.");
      });
  }

  function updateUrl(genusId, speciesId) {
    if (!window.history || !window.history.replaceState) return;
    try {
      var url = new URL(window.location.href);
      if (genusId) url.searchParams.set('genus', String(genusId).toLowerCase());
      else url.searchParams.delete('genus');
      if (speciesId) url.searchParams.set('species', String(speciesId).toLowerCase());
      else url.searchParams.delete('species');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore URL errors (старые браузеры или нестандартная среда)
    }
  }

  function findGenusNode(node, genusId) {
    if (!node || !genusId) return null;
    if (node.type === 'genus' && (node.id || '').toLowerCase() === genusId) return node;
    var children = getChildren(node);
    for (var i = 0; i < children.length; i++) {
      var found = findGenusNode(children[i], genusId);
      if (found) return found;
    }
    return null;
  }

  function openInitialFromUrl() {
    if (!initialTarget || !initialTarget.genusId || !taxonomy) return;
    var genusId = initialTarget.genusId.toLowerCase();
    var genusNode = findGenusNode(taxonomy, genusId);
    if (!genusNode) return;
    openGenusCard(genusNode);
    if (initialTarget.speciesId) {
      loadSpecies(genusNode.id, genusNode.speciesFile, function (err, list) {
        if (err || !list) return;
        var sid = initialTarget.speciesId.toLowerCase();
        for (var i = 0; i < list.length; i++) {
          var sp = list[i];
          if ((sp.id || '').toLowerCase() === sid) {
            showSpeciesInCard(sp, genusNode.name, genusNode.id);
            break;
          }
        }
      });
    }
  }

  function createNodeRow(node, depth, parentEl) {
    var children = getChildren(node);
    var isLeaf = children.length === 0;
    var type = node.type || '';

    var li = document.createElement('div');
    li.className = 'tree-node';
    if (node.type === 'family') li.classList.add('tree-node--root');
    li.dataset.id = node.id || '';

    var row = document.createElement('div');
    row.className = 'tree-node__row';
    row.setAttribute('role', 'button');
    row.tabIndex = 0;

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'tree-node__toggle';
    toggle.setAttribute('aria-label', isLeaf ? '' : (getUIStrings().expandAria || 'Expand'));
    toggle.setAttribute('aria-expanded', 'false');
    if (isLeaf) toggle.setAttribute('aria-hidden', 'true');
    toggle.textContent = '▶';

    var label = document.createElement('button');
    label.type = 'button';
    label.className = 'tree-node__label';
    label.textContent = node.name || '—';

    var levelSpan = document.createElement('span');
    levelSpan.className = 'tree-node__level';
    levelSpan.textContent = levelLabel(type);

    row.appendChild(toggle);
    row.appendChild(label);
    row.appendChild(levelSpan);
    li.appendChild(row);

    var childrenWrap = document.createElement('div');
    childrenWrap.className = 'tree-node__children';
    childrenWrap.setAttribute('hidden', '');

    if (!isLeaf) {
      li.appendChild(childrenWrap);
      li.classList.add('tree-node--closed');

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = li.classList.toggle('tree-node--open');
        li.classList.toggle('tree-node--closed', !open);
        childrenWrap.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? (getUIStrings().collapseAria || 'Collapse') : (getUIStrings().expandAria || 'Expand'));
        if (open && childrenWrap.children.length === 0) {
          renderChildren(childrenWrap, children, depth + 1);
        }
      });
    }

    label.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!isLeaf) {
        var open = li.classList.toggle('tree-node--open');
        li.classList.toggle('tree-node--closed', !open);
        childrenWrap.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? (getUIStrings().collapseAria || 'Collapse') : (getUIStrings().expandAria || 'Expand'));
        if (open && childrenWrap.children.length === 0) {
          renderChildren(childrenWrap, children, depth + 1);
        }
      } else if (type === 'genus') {
        openGenusCard(node);
      }
    });

    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        label.click();
      }
    });

    parentEl.appendChild(li);
  }

  function renderChildren(container, children, depth) {
    container.innerHTML = '';
    for (var i = 0; i < children.length; i++) {
      createNodeRow(children[i], depth, container);
    }
  }

  function loadSpecies(genusId, speciesFile, cb) {
    if (speciesCache[genusId]) {
      cb(null, speciesCache[genusId]);
      return;
    }
    var url = SPECIES_BASE + speciesFile;
    fetch(url)
      .then(function (r) {
        if (!r.ok) return Promise.resolve([]);
        return r.json();
      })
      .then(function (arr) {
        speciesCache[genusId] = Array.isArray(arr) ? arr : [];
        cb(null, speciesCache[genusId]);
      })
      .catch(function () {
        speciesCache[genusId] = [];
        cb(null, []);
      });
  }

  function setCardNames(entry, fallbackName) {
    var name = fallbackName || '—';
    if (cardNameBackeberg) cardNameBackeberg.textContent = entry ? entry.backeberg : name;
    if (cardNameModern) {
      cardNameModern.textContent = entry && entry.modern ? entry.modern : '';
      cardNameModern.style.display = entry && entry.modern ? '' : 'none';
    }
    if (cardNamePreviously) {
      var prevHtml = '';
      var ui = getUIStrings();
      if (entry && entry.nameHistory && entry.nameHistory.length > 1) {
        var prevParts = entry.nameHistory.map(function (n) {
          var href = speciesHref(n);
          return href ? '<a href="' + escapeHtml(href) + '">' + escapeHtml(n) + '</a>' : escapeHtml(n);
        });
        prevHtml = (ui.prevSynonyms || 'Ранее / синонимы: ') + prevParts.join(' → ');
      } else if (entry && entry.previouslyCalled) {
        var pc = entry.previouslyCalled;
        var pcHref = speciesHref(pc);
        prevHtml = (ui.previouslyCalled || 'Ранее назывался: ') + (pcHref ? '<a href="' + escapeHtml(pcHref) + '">' + escapeHtml(pc) + '</a>' : escapeHtml(pc));
      }
      cardNamePreviously.innerHTML = prevHtml;
      cardNamePreviously.style.display = prevHtml ? '' : 'none';
    }
    if (cardNameSynonyms) {
      var synHtml = '';
      if (entry && entry.synonyms && entry.synonyms.length > 0) {
        var synParts = entry.synonyms.map(function (n) {
          var href = speciesHref(n);
          return href ? '<a href="' + escapeHtml(href) + '">' + escapeHtml(n) + '</a>' : escapeHtml(n);
        });
        var synPrefix = (entry.nameHistory && entry.nameHistory.length > 1) ? (ui.synonymsLabel || 'Синонимы: ') : (ui.synonymsBasionym || 'Синонимы / базионим: ');
        synHtml = synPrefix + synParts.join(', ');
      }
      cardNameSynonyms.innerHTML = synHtml;
      cardNameSynonyms.style.display = synHtml ? '' : 'none';
    }
  }

  function updateExploreLinks(taxonName) {
    if (!cardExploreWrap) return;
    var q = String(taxonName || '').trim();
    var enc = encodeURIComponent(q);
    if (cardExploreGallery) cardExploreGallery.href = q ? ('gallery.html?q=' + enc) : 'gallery.html';
    if (cardExploreStories) cardExploreStories.href = q ? ('stories.html?q=' + enc) : 'stories.html';
    if (cardExploreBook) cardExploreBook.href = q ? ('книга-кактусология/book-read.html?q=' + enc) : 'книга-кактусология/book-read.html';
    if (cardExploreGoogle) {
      var query = q ? ('site:derev-studio.github.io/cactus-books ' + q) : 'site:derev-studio.github.io/cactus-books cactus';
      cardExploreGoogle.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    }
    cardExploreWrap.hidden = false;
  }

  function openGenusCard(genusNode) {
    if (!cardPanel || !cardNameBackeberg || !cardLevel || !cardDesc || !cardSpeciesWrap || !cardSpeciesList) return;
    cardPanel.hidden = false;
    cardPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    var gid = (genusNode.id || '').toLowerCase();
    updateUrl(gid || '', '');
    var entry = synonymsBridge && synonymsBridge.genera ? synonymsBridge.genera[gid] : null;
    setCardNames(entry, genusNode.name || '—');
    cardLevel.textContent = levelLabel('genus');
    var info = (genusNode.info || '').trim();
    if (getUILocale() !== 'ru' && info && hasCyrillic(info)) info = '';
    cardDesc.textContent = info ? info : genusPlaceholder(genusNode.name);

    currentAtlasTaxonName = genusNode.name || '';
    updateExploreLinks(currentAtlasTaxonName);
    if (atlasAuto && currentAtlasTaxonName) {
      atlasShowPanelAndLoad(currentAtlasTaxonName);
    }

    if (cardInfraspecificWrap) cardInfraspecificWrap.hidden = true;
    if (cardSeeAlsoWrap) cardSeeAlsoWrap.hidden = true;
    var morphWrap = document.getElementById('card-morphology-wrap');
    var photoWrap = document.getElementById('card-photo-wrap');
    if (morphWrap) morphWrap.hidden = true;
    if (photoWrap) photoWrap.hidden = true;
    cardSpeciesWrap.hidden = false;
    cardSpeciesList.innerHTML = '<li>' + (getUIStrings().loading || 'Загрузка…') + '</li>';

    var speciesFile = genusNode.speciesFile;
    if (!speciesFile) {
      cardSpeciesList.innerHTML = '<li>' + (getUIStrings().noSpeciesData || 'Нет данных о видах.') + '</li>';
      return;
    }

    loadSpecies(genusNode.id, speciesFile, function (err, list) {
      cardSpeciesList.innerHTML = '';
      if (!list || list.length === 0) {
        cardSpeciesList.innerHTML = '<li>' + (getUIStrings().noSpeciesData || 'Нет данных о видах.') + '</li>';
        return;
      }
      for (var i = 0; i < list.length; i++) {
        (function (sp) {
          var li = document.createElement('li');
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = sp.name || sp.id || '—';
          btn.addEventListener('click', function () {
            showSpeciesInCard(sp, genusNode.name, genusNode.id);
          });
          li.appendChild(btn);
          cardSpeciesList.appendChild(li);
        })(list[i]);
      }
    });
  }

  function showSpeciesInCard(speciesNode, genusName, genusId) {
    if (!cardNameBackeberg || !cardLevel || !cardDesc) return;
    if (cardPanel) cardPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    var sid = (speciesNode.id || '').toLowerCase();
    var entry = synonymsBridge && synonymsBridge.species ? synonymsBridge.species[sid] : null;
    if (speciesNode.nameHistory && speciesNode.nameHistory.length > 0) {
      entry = entry || {};
      entry.nameHistory = speciesNode.nameHistory;
    }
    setCardNames(entry, speciesNode.name || '—');
    cardLevel.textContent = levelLabel('species');
    updateUrl(genusId || '', speciesNode.id || '');
    var uiLocale = getUILocale();
    var desc = (speciesNode.description || '').trim();
    var descUi = getUIStrings();
    var ruUi = getClassificationStrings().ru;
    if (ruUi && desc === ruUi.descGbifPlaceholder) desc = descUi.descGbifPlaceholder || desc;
    if (ruUi && desc === ruUi.descNcbiPlaceholder) desc = descUi.descNcbiPlaceholder || desc;
    if (uiLocale !== 'ru' && desc && hasCyrillic(desc)) desc = '';
    if (uiLocale !== 'en' && desc && !hasCyrillic(desc) && !/[\u0590-\u05FF\u0400-\u04FF]/.test(desc)) desc = '';
    if (!desc) {
      var lmLang = null;
      try {
        if (window.I18n && typeof window.I18n.getLang === 'function') {
          lmLang = window.I18n.getLang();
        } else if (window.LanguageManager && typeof window.LanguageManager.getLang === 'function') {
          lmLang = window.LanguageManager.getLang();
        }
      } catch (_) {}
      if (!lmLang) lmLang = uiLocale;
      var dataLang = (lmLang === 'be') ? 'ru' : ((lmLang === 'uk' || lmLang === 'ru' || lmLang === 'es' || lmLang === 'he' || lmLang === 'zh') ? lmLang : 'en');
      function morphForLang(field) {
        var val = dataLang === 'en' ? speciesNode['morphology_' + field] : (speciesNode['morphology_' + field + '_' + dataLang] || (dataLang === 'uk' ? speciesNode['morphology_' + field + '_ru'] : null));
        if (val) return val;
        if (uiLocale === 'en') return speciesNode['morphology_' + field] || '';
        return '';
      }
      var stem = morphForLang('stem') || '';
      var spines = morphForLang('spines') || '';
      var flower = morphForLang('flower') || '';
      var fruit = morphForLang('fruit') || '';
      var pieces = [];
      if (stem) pieces.push(stem);
      if (spines) pieces.push(spines);
      if (flower) pieces.push(flower);
      if (fruit) pieces.push(fruit);
      if (pieces.length > 0) {
        desc = pieces.join(' ');
      }
    }
    cardDesc.textContent = desc ? desc : speciesPlaceholder(speciesNode.name || '', genusName);

    currentAtlasTaxonName = speciesNode.name || '';
    updateExploreLinks(currentAtlasTaxonName);
    if (atlasAuto && currentAtlasTaxonName) {
      atlasShowPanelAndLoad(currentAtlasTaxonName);
    }
    var infras = speciesNode.infraspecific;
    if (cardInfraspecificWrap && cardInfraspecificList) {
      if (infras && infras.length > 0) {
        var rankLabels = getUIStrings().rank || { subspecies: 'Подвид', variety: 'Разновидность', form: 'Форма' };
        cardInfraspecificList.innerHTML = '';
        infras.forEach(function (item) {
          var li = document.createElement('li');
          var label = rankLabels[item.rank] || item.rank;
          li.textContent = (label ? label + ': ' : '') + (item.name || '');
          cardInfraspecificList.appendChild(li);
        });
        cardInfraspecificWrap.hidden = false;
      } else {
        cardInfraspecificWrap.hidden = true;
      }
    }
    var morphWrap = document.getElementById('card-morphology-wrap');
    var morphList = document.getElementById('card-morphology-list');
    var morphTranslateEl = document.getElementById('card-morphology-translate');
    if (morphWrap && morphList) {
      var langCode = null;
      try {
        if (window.I18n && typeof window.I18n.getLang === 'function') {
          langCode = window.I18n.getLang();
        } else if (window.LanguageManager && typeof window.LanguageManager.getLang === 'function') {
          langCode = window.LanguageManager.getLang();
        }
      } catch (_) {}
      if (!langCode) {
        var rawLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        langCode = rawLang.split('-')[0];
      }
      var dataLang = (langCode === 'be') ? 'ru' : ((langCode === 'uk' || langCode === 'ru' || langCode === 'es' || langCode === 'he' || langCode === 'zh') ? langCode : 'en');
      var uiLocaleHere = getUILocale();
      function morphTextForCard(field) {
        var val = dataLang === 'en' ? speciesNode['morphology_' + field] : (speciesNode['morphology_' + field + '_' + dataLang] || (dataLang === 'uk' ? speciesNode['morphology_' + field + '_ru'] : null));
        if (val) return val;
        if (uiLocaleHere === 'en') return speciesNode['morphology_' + field] || '';
        return '';
      }
      var stemText = morphTextForCard('stem');
      var spinesText = morphTextForCard('spines');
      var flowerText = morphTextForCard('flower');
      var fruitText = morphTextForCard('fruit');
      var morphLabels = (getUIStrings().morphLabels || { stem: 'Stem', spines: 'Spines', flower: 'Flower', fruit: 'Fruit' });
      var morphParts = [];
      if (stemText) morphParts.push({ label: morphLabels.stem, text: stemText });
      if (spinesText) morphParts.push({ label: morphLabels.spines, text: spinesText });
      if (flowerText) morphParts.push({ label: morphLabels.flower, text: flowerText });
      if (fruitText) morphParts.push({ label: morphLabels.fruit, text: fruitText });
      if (morphParts.length > 0) {
        var morphTitleEl = document.getElementById('card-morphology-title');
        if (morphTitleEl) morphTitleEl.textContent = (getUIStrings().morphologyTitle || 'Morphology');
        morphList.innerHTML = '';
        morphParts.forEach(function (p) {
          var li = document.createElement('li');
          li.innerHTML = '<strong>' + p.label + ':</strong> ' + escapeHtml(p.text);
          morphList.appendChild(li);
        });
        morphWrap.hidden = false;
        if (morphTranslateEl) morphTranslateEl.hidden = true;
        var morphSource = document.getElementById('card-morphology-source');
        if (morphSource) {
          if (speciesNode.morphology_source === 'wikipedia') {
            var wikiUrl = wikiArticleUrl(speciesNode.name);
            var ui = getUIStrings();
            var srcLbl = ui.morphSourceLabel || 'Source: ';
            var licLbl = ui.morphLicenseLabel || 'License: ';
            morphSource.innerHTML = srcLbl + '<a href="' + wikiUrl + '" target="_blank" rel="noopener">Wikipedia</a>. ' + licLbl + '<a href="' + CC_BY_SA_URL + '" target="_blank" rel="noopener">CC BY-SA 4.0</a>.';
            morphSource.hidden = false;
          } else {
            morphSource.hidden = true;
          }
        }
      } else {
        morphWrap.hidden = true;
        if (morphTranslateEl) morphTranslateEl.hidden = true;
      }
    }
    var photoWrap = document.getElementById('card-photo-wrap');
    var photoImg = document.getElementById('card-photo-main');
    var photoSource = document.getElementById('card-photo-source');
    if (photoWrap && photoImg) {
      var url = speciesNode.photo_main_url || speciesNode.photo_flower_url || '';
      console.log('Image URL:', url, '(species:', speciesNode.name || speciesNode.id, ')');
      if (url) {
        photoImg.src = url;
        photoImg.alt = speciesNode.name || ((getUIStrings().photoSource || 'Photo: ').replace(/\s*:?\s*$/, '') || 'Photo');
        photoWrap.hidden = false;
        if (photoSource) {
          if (speciesNode.photo_source === 'wikipedia') {
            var photoWikiUrl = wikiArticleUrl(speciesNode.name);
            photoSource.innerHTML = (getUIStrings().photoSource || 'Фото: ') + '<a href="' + photoWikiUrl + '" target="_blank" rel="noopener">Wikipedia</a>. <a href="' + CC_BY_SA_URL + '" target="_blank" rel="noopener">CC BY-SA 4.0</a>.';
            photoSource.hidden = false;
          } else {
            photoSource.hidden = true;
          }
        }
      } else {
        photoWrap.hidden = true;
      }
    }
    // Смотрите также: 3 других вида того же рода
    if (cardSeeAlsoWrap && cardSeeAlsoList) {
      var list = speciesCache[(genusId || '').toLowerCase()] || [];
      var others = list.filter(function (sp) {
        return (sp.id || '').toLowerCase() !== (speciesNode.id || '').toLowerCase();
      });
      for (var j = others.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = others[j];
        others[j] = others[k];
        others[k] = tmp;
      }
      var take = Math.min(3, others.length);
      cardSeeAlsoList.innerHTML = '';
      for (var i = 0; i < take; i++) {
        var sp = others[i];
        var href = (window.location.pathname || '/classification-cacti.html') + '?genus=' + encodeURIComponent((genusId || '').toLowerCase()) + '&species=' + encodeURIComponent((sp.id || '').toLowerCase());
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = href;
        a.textContent = sp.name || sp.id || '—';
        li.appendChild(a);
        cardSeeAlsoList.appendChild(li);
      }
      cardSeeAlsoWrap.hidden = take === 0;
    }
  }

  function renderBreadcrumb() {
    if (!breadcrumbWrap || !breadcrumbEl) return;
    if (pathStack.length <= 1) {
      breadcrumbWrap.hidden = true;
      return;
    }
    breadcrumbWrap.hidden = false;
    breadcrumbEl.textContent = pathStack.map(function (n) { return n.name; }).join(' › ');
  }

  function renderTiles() {
    if (!treeRoot) return;
    var current = pathStack[pathStack.length - 1];
    var children = getChildren(current);
    treeRoot.innerHTML = '';
    for (var i = 0; i < children.length; i++) {
      (function (node) {
        var type = node.type || '';
        var tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'classification-tile';
        tile.setAttribute('role', 'button');
        var nameSpan = document.createElement('span');
        nameSpan.textContent = node.name || '—';
        var levelSpan = document.createElement('span');
        levelSpan.className = 'classification-tile__level';
        levelSpan.textContent = levelLabel(type);
        tile.appendChild(nameSpan);
        tile.appendChild(levelSpan);
        tile.addEventListener('click', function () {
          if (type === 'genus') {
            openGenusCard(node);
          } else {
            pathStack.push(node);
            renderBreadcrumb();
            renderTiles();
          }
        });
        treeRoot.appendChild(tile);
      })(children[i]);
    }
    renderBreadcrumb();
  }

  function buildTree(rootNode) {
    if (!treeRoot) return;
    pathStack = [rootNode];
    if (backBtn) {
      backBtn.onclick = function () {
        if (pathStack.length > 1) {
          pathStack.pop();
          renderBreadcrumb();
          renderTiles();
        }
      };
    }
    renderTiles();
  }

  function applyUILocale() {
    var ui = getUIStrings();
    if (backBtn) {
      backBtn.textContent = ui.back;
      backBtn.setAttribute('aria-label', ui.backAria || ui.back.replace(/^\s*←\s*/, ''));
    }
    if (cardClose) {
      cardClose.setAttribute('aria-label', ui.close);
    }
    var treeLoadingEl = document.getElementById('tree-loading');
    if (treeLoadingEl) treeLoadingEl.textContent = ui.loading;
    var treeErrorEl = document.getElementById('tree-error');
    if (treeErrorEl) treeErrorEl.innerHTML = ui.treeError;
    var speciesTitle = document.getElementById('card-species-title');
    if (speciesTitle) speciesTitle.textContent = ui.species;
    var seeAlsoTitle = document.getElementById('card-see-also-title');
    if (seeAlsoTitle) seeAlsoTitle.textContent = ui.seeAlso;
    var infraspecificTitle = document.getElementById('card-infraspecific-title');
    if (infraspecificTitle) infraspecificTitle.textContent = ui.infraspecific;
    var morphTitleEl = document.getElementById('card-morphology-title');
    if (morphTitleEl && ui.morphologyTitle) morphTitleEl.textContent = ui.morphologyTitle;
    var pageTitleEl = document.querySelector('.classification-header h1');
    if (pageTitleEl && ui.pageTitle) pageTitleEl.textContent = ui.pageTitle;
    var pageIntroEl = document.querySelector('.classification-intro');
    if (pageIntroEl && ui.pageIntro) pageIntroEl.textContent = ui.pageIntro;
    var cornerEl = document.querySelector('.classification-corner');
    if (cornerEl && ui.cornerLabel) cornerEl.textContent = ui.cornerLabel;
  }

  function init() {
    treeRoot = document.getElementById('tree-root');
    treeLoading = document.getElementById('tree-loading');
    treeError = document.getElementById('tree-error');
    breadcrumbWrap = document.querySelector('.classification-breadcrumb-wrap');
    backBtn = document.querySelector('.classification-back');
    breadcrumbEl = document.getElementById('classification-breadcrumb');
    cardPanel = document.getElementById('card-panel');
    cardClose = document.getElementById('card-close');
    cardNameBackeberg = document.getElementById('card-name-backeberg');
    cardNameModern = document.getElementById('card-name-modern');
    cardNamePreviously = document.getElementById('card-name-previously');
    cardNameSynonyms = document.getElementById('card-name-synonyms');
    cardLevel = document.getElementById('card-level');
    cardDesc = document.getElementById('card-desc');
    cardSpeciesWrap = document.getElementById('card-species-wrap');
    cardSpeciesList = document.getElementById('card-species-list');
    cardInfraspecificWrap = document.getElementById('card-infraspecific-wrap');
    cardInfraspecificList = document.getElementById('card-infraspecific-list');
    cardSeeAlsoWrap = document.getElementById('card-see-also-wrap');
    cardSeeAlsoList = document.getElementById('card-see-also-list');
    cardExploreWrap = document.getElementById('card-explore-wrap');
    cardExploreGallery = document.getElementById('card-explore-gallery');
    cardExploreStories = document.getElementById('card-explore-stories');
    cardExploreBook = document.getElementById('card-explore-book');
    cardExploreGoogle = document.getElementById('card-explore-google');

    atlasToggleBtn = document.getElementById('atlas-toggle-btn');
    atlasPanel = document.getElementById('atlas-panel');
    atlasMapEl = document.getElementById('atlas-map');
    atlasStatusEl = document.getElementById('atlas-status');
    atlasAuto = getAtlasAutoFlag();
    if (atlasToggleBtn) {
      atlasToggleBtn.addEventListener('click', function () { atlasTogglePanel(); });
    }

    applyUILocale();
    document.addEventListener('cactusbooks-lang-applied', applyUILocale);

    // Разбираем адрес: ?genus=...&species=... — для прямых ссылок на карточки
    try {
      var params = new URLSearchParams(window.location.search || '');
      var g = params.get('genus') || '';
      var s = params.get('species') || '';
      if (g || s) {
        initialTarget = {
          genusId: g.toLowerCase(),
          speciesId: (s || '').toLowerCase()
        };
      }
    } catch (e) {
      initialTarget = null;
    }
    if (cardClose) {
      cardClose.addEventListener('click', function () {
        if (cardPanel) cardPanel.hidden = true;
      });
    }

    Promise.all([
      fetch(TAXONOMY_URL).then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('taxonomy')); }),
      fetch(BRIDGE_URL).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    ])
      .then(function (results) {
        taxonomy = results[0];
        synonymsBridge = results[1];
        if (treeLoading) treeLoading.hidden = true;
        if (treeError) treeError.hidden = true;
        buildTree(taxonomy);
        if (initialTarget && initialTarget.genusId) {
          openInitialFromUrl();
        }
      })
      .catch(function () {
        if (treeLoading) treeLoading.hidden = true;
        if (treeError) treeError.hidden = false;
      });
  }

  /* Дерево и карточки (в т.ч. фото из Wikipedia) запускаем сразу при готовности DOM.
     Не ждём languages.json — иначе при медленной загрузке картинки в карточках не появятся.
     Строки UI берутся из __LANGUAGES__.classification с fallback; после загрузки языков обновляем подписи. */
  function runWhenClassificationReady() {
    init();
    window.addEventListener('cactusbooks-languages-loaded', function () {
      applyUILocale();
    }, { once: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWhenClassificationReady);
  } else {
    runWhenClassificationReady();
  }
})();
