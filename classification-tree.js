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
  var taxonomy = null;
  var speciesCache = {};
  var synonymsBridge = null;
  var pathStack = [];
  var breadcrumbWrap = null;
  var backBtn = null;
  var breadcrumbEl = null;
  var initialTarget = null;

  function getChildren(node) {
    return node && node.children ? node.children : [];
  }

  function levelLabel(type) {
    return LEVEL_LABELS[type] || type;
  }

  function genusPlaceholder(name) {
    return name + ' — род кактусов семейства Cactaceae. Подробное описание будет добавлено позже.';
  }

  function speciesPlaceholder(name, genusName) {
    return name + ' — вид рода ' + (genusName || '') + '. Подробное описание будет добавлено позже.';
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

  function updateUrl(genusId, speciesId) {
    if (!window.history || !window.history.replaceState) return;
    try {
      var url = new URL(window.location.href);
      if (genusId) url.searchParams.set('genus', String(genusId).toLowerCase());
      else url.searchParams["delete"] && url.searchParams["delete"]('genus');
      if (speciesId) url.searchParams.set('species', String(speciesId).toLowerCase());
      else url.searchParams["delete"] && url.searchParams["delete"]('species');
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
    toggle.setAttribute('aria-label', isLeaf ? '' : 'Развернуть');
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
        toggle.setAttribute('aria-label', open ? 'Свернуть' : 'Развернуть');
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
        toggle.setAttribute('aria-label', open ? 'Свернуть' : 'Развернуть');
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
      var prevText = '';
      if (entry && entry.nameHistory && entry.nameHistory.length > 1) {
        prevText = 'Ранее / синонимы: ' + entry.nameHistory.join(' → ');
      } else if (entry && entry.previouslyCalled) {
        prevText = 'Ранее назывался: ' + entry.previouslyCalled;
      }
      if (cardNamePreviously) {
        cardNamePreviously.textContent = prevText;
        cardNamePreviously.style.display = prevText ? '' : 'none';
      }
    }
    if (cardNameSynonyms) {
      var synText = '';
      if (entry && entry.synonyms && entry.synonyms.length > 0 && !(entry.nameHistory && entry.nameHistory.length > 1)) {
        synText = 'Синонимы / базионим: ' + entry.synonyms.join(', ');
      } else if (entry && entry.synonyms && entry.synonyms.length > 0) {
        synText = 'Синонимы: ' + entry.synonyms.join(', ');
      }
      if (cardNameSynonyms) {
        cardNameSynonyms.textContent = synText;
        cardNameSynonyms.style.display = synText ? '' : 'none';
      }
    }
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
    cardDesc.textContent = info ? info : genusPlaceholder(genusNode.name);

    if (cardInfraspecificWrap) cardInfraspecificWrap.hidden = true;
    var morphWrap = document.getElementById('card-morphology-wrap');
    var photoWrap = document.getElementById('card-photo-wrap');
    if (morphWrap) morphWrap.hidden = true;
    if (photoWrap) photoWrap.hidden = true;
    cardSpeciesWrap.hidden = false;
    cardSpeciesList.innerHTML = '<li>Загрузка…</li>';

    var speciesFile = genusNode.speciesFile;
    if (!speciesFile) {
      cardSpeciesList.innerHTML = '<li>Нет данных о видах.</li>';
      return;
    }

    loadSpecies(genusNode.id, speciesFile, function (err, list) {
      cardSpeciesList.innerHTML = '';
      if (!list || list.length === 0) {
        cardSpeciesList.innerHTML = '<li>Нет данных о видах.</li>';
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
    var desc = (speciesNode.description || '').trim();
    cardDesc.textContent = desc ? desc : speciesPlaceholder(speciesNode.name || '', genusName);
    var infras = speciesNode.infraspecific;
    if (cardInfraspecificWrap && cardInfraspecificList) {
      if (infras && infras.length > 0) {
        var rankLabels = { subspecies: 'Подвид', variety: 'Разновидность', form: 'Форма' };
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
    if (morphWrap && morphList) {
      var morphParts = [];
      if (speciesNode.morphology_stem) morphParts.push({ label: 'Стебель', text: speciesNode.morphology_stem });
      if (speciesNode.morphology_spines) morphParts.push({ label: 'Колючки', text: speciesNode.morphology_spines });
      if (speciesNode.morphology_flower) morphParts.push({ label: 'Цветок', text: speciesNode.morphology_flower });
      if (speciesNode.morphology_fruit) morphParts.push({ label: 'Плод', text: speciesNode.morphology_fruit });
      if (morphParts.length > 0) {
        morphList.innerHTML = '';
        morphParts.forEach(function (p) {
          var li = document.createElement('li');
          li.innerHTML = '<strong>' + p.label + ':</strong> ' + p.text;
          morphList.appendChild(li);
        });
        morphWrap.hidden = false;
        var morphSource = document.getElementById('card-morphology-source');
        if (morphSource) {
          if (speciesNode.morphology_source === 'wikipedia') {
            var wikiUrl = wikiArticleUrl(speciesNode.name);
            morphSource.innerHTML = 'Источник: <a href="' + wikiUrl + '" target="_blank" rel="noopener">Wikipedia</a> (статья). Лицензия: <a href="' + CC_BY_SA_URL + '" target="_blank" rel="noopener">CC BY-SA 4.0</a>.';
            morphSource.hidden = false;
          } else {
            morphSource.hidden = true;
          }
        }
      } else {
        morphWrap.hidden = true;
      }
    }
    var photoWrap = document.getElementById('card-photo-wrap');
    var photoImg = document.getElementById('card-photo-main');
    var photoSource = document.getElementById('card-photo-source');
    if (photoWrap && photoImg) {
      var url = speciesNode.photo_main_url || speciesNode.photo_flower_url || '';
      if (url) {
        photoImg.src = url;
        photoImg.alt = speciesNode.name || 'Фото';
        photoWrap.hidden = false;
        if (photoSource) {
          if (speciesNode.photo_source === 'wikipedia') {
            var photoWikiUrl = wikiArticleUrl(speciesNode.name);
            photoSource.innerHTML = 'Фото: <a href="' + photoWikiUrl + '" target="_blank" rel="noopener">Wikipedia</a> (статья). <a href="' + CC_BY_SA_URL + '" target="_blank" rel="noopener">CC BY-SA 4.0</a>.';
            photoSource.hidden = false;
          } else {
            photoSource.hidden = true;
          }
        }
      } else {
        photoWrap.hidden = true;
      }
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
