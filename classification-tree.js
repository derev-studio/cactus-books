/**
 * Раскрывающееся дерево систематики кактусов.
 * Ленивая загрузка: виды подгружаются только при открытии рода.
 * Карточки с заготовками, если нет описания.
 */

(function () {
  'use strict';

  var TAXONOMY_URL = 'data/taxonomy.json';
  var SPECIES_BASE = 'data/species/';

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
  var cardName = null;
  var cardLevel = null;
  var cardDesc = null;
  var cardSpeciesWrap = null;
  var cardSpeciesList = null;
  var taxonomy = null;
  var speciesCache = {};

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

  function createNodeRow(node, depth, parentEl) {
    var children = getChildren(node);
    var isLeaf = children.length === 0;
    var type = node.type || '';

    var li = document.createElement('div');
    li.className = 'tree-node';
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

  function openGenusCard(genusNode) {
    if (!cardPanel || !cardName || !cardLevel || !cardDesc || !cardSpeciesWrap || !cardSpeciesList) return;
    cardPanel.hidden = false;
    cardName.textContent = genusNode.name || '—';
    cardLevel.textContent = levelLabel('genus');
    var info = (genusNode.info || '').trim();
    cardDesc.textContent = info ? info : genusPlaceholder(genusNode.name);

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
            showSpeciesInCard(sp, genusNode.name);
          });
          li.appendChild(btn);
          cardSpeciesList.appendChild(li);
        })(list[i]);
      }
    });
  }

  function showSpeciesInCard(speciesNode, genusName) {
    if (!cardName || !cardLevel || !cardDesc) return;
    cardName.textContent = speciesNode.name || '—';
    cardLevel.textContent = levelLabel('species');
    var desc = (speciesNode.description || '').trim();
    cardDesc.textContent = desc ? desc : speciesPlaceholder(speciesNode.name || '', genusName);
  }

  function buildTree(rootNode) {
    if (!treeRoot) return;
    treeRoot.innerHTML = '';
    createNodeRow(rootNode, 0, treeRoot);
  }

  function init() {
    treeRoot = document.getElementById('tree-root');
    treeLoading = document.getElementById('tree-loading');
    treeError = document.getElementById('tree-error');
    cardPanel = document.getElementById('card-panel');
    cardClose = document.getElementById('card-close');
    cardName = document.getElementById('card-name');
    cardLevel = document.getElementById('card-level');
    cardDesc = document.getElementById('card-desc');
    cardSpeciesWrap = document.getElementById('card-species-wrap');
    cardSpeciesList = document.getElementById('card-species-list');

    if (cardClose) {
      cardClose.addEventListener('click', function () {
        if (cardPanel) cardPanel.hidden = true;
      });
    }

    fetch(TAXONOMY_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('load failed');
        return r.json();
      })
      .then(function (data) {
        taxonomy = data;
        if (treeLoading) treeLoading.hidden = true;
        if (treeError) treeError.hidden = true;
        buildTree(taxonomy);
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
