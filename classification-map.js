/**
 * Интерактивная карта систематики кактусов (Canvas, pan/zoom, боковая панель)
 * Данные: data/taxonomy.json, data/species/<genus-id>.json
 */

(function () {
  'use strict';

  var TAXONOMY_URL = 'data/taxonomy.json';
  var SPECIES_BASE = 'data/species/';
  var NODE_WIDTH = 140;
  var NODE_HEIGHT = 32;
  var ROW_GAP = 48;
  var SIBLING_GAP = 24;

  var canvas, ctx;
  var taxonomy = null;
  var nodes = [];       // flat list { node, x, y, width, depth, screenRect }
  var view = { scale: 1, offsetX: 0, offsetY: 0 };
  var isPanning = false;
  var lastPointer = { x: 0, y: 0 };
  var lastPinchDist = 0;
  var pointerDownAt = null; // для отличия клика от перетаскивания
  var speciesCache = {};
  var mapWrap, sidePanel, panelGenusName, panelGenusInfo, panelSpeciesList, panelSpeciesDetail, panelSpeciesName, panelSpeciesDesc, panelClose, genusSearch;

  function getChildren(node) {
    return node.children || [];
  }

  function isGenus(node) {
    return node && node.type === 'genus';
  }

  function buildLayout(root) {
    if (!root) return [];
    var flat = [];
    function subtreeWidth(n) {
      var ch = getChildren(n);
      if (ch.length === 0) return NODE_WIDTH + SIBLING_GAP;
      var w = 0;
      for (var i = 0; i < ch.length; i++) w += subtreeWidth(ch[i]);
      return w + (ch.length - 1) * SIBLING_GAP;
    }
    function place(n, depth, left) {
      var ch = getChildren(n);
      var w = ch.length === 0 ? NODE_WIDTH + SIBLING_GAP : 0;
      if (ch.length > 0) {
        for (var i = 0; i < ch.length; i++) w += subtreeWidth(ch[i]);
        w += (ch.length - 1) * SIBLING_GAP;
      }
      var x = left + w / 2 - (NODE_WIDTH + SIBLING_GAP) / 2 + (NODE_WIDTH + SIBLING_GAP) / 2;
      if (ch.length === 0) x = left;
      var y = depth * (NODE_HEIGHT + ROW_GAP);
      flat.push({ node: n, x: x, y: y, width: NODE_WIDTH, height: NODE_HEIGHT, depth: depth });
      var offset = left;
      for (var j = 0; j < ch.length; j++) {
        var cw = subtreeWidth(ch[j]);
        place(ch[j], depth + 1, offset);
        offset += cw + SIBLING_GAP;
      }
    }
    var totalW = subtreeWidth(root);
    place(root, 0, 0);
    return flat;
  }

  function buildNodesFlat() {
    if (!taxonomy) return;
    nodes = buildLayout(taxonomy);
    var rootN = nodes[0];
    var shift = rootN ? rootN.x : 0;
    nodes.forEach(function (n) { n.x -= shift; });
  }

  /** Преобразование координат мыши (clientX/clientY) в координаты мира карты.
   *  Используем getBoundingClientRect() чтобы совпадать с видимым canvas. */
  function screenToWorld(sx, sy) {
    var r = canvas.getBoundingClientRect();
    var cx = sx - r.left;
    var cy = sy - r.top;
    var centerX = r.width / 2;
    var centerY = r.height / 2;
    var wx = (cx - centerX - view.offsetX) / view.scale + centerX;
    var wy = (cy - centerY - view.offsetY) / view.scale + centerY;
    return { x: wx, y: wy };
  }

  function getNodeAt(sx, sy) {
    var p = screenToWorld(sx, sy);
    for (var i = nodes.length - 1; i >= 0; i--) {
      var n = nodes[i];
      var hw = n.width / 2;
      var hh = n.height / 2;
      if (p.x >= n.x - hw && p.x <= n.x + hw && p.y >= n.y - hh && p.y <= n.y + hh) return n;
    }
    return null;
  }

  function draw() {
    if (!ctx || !canvas || nodes.length === 0) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.width;
    var h = canvas.height;
    var cssW = w / dpr;
    var cssH = h / dpr;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.restore();

    var centerX = cssW / 2;
    var centerY = cssH / 2;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(centerX + view.offsetX, centerY + view.offsetY);
    ctx.scale(view.scale, view.scale);
    ctx.translate(-centerX, -centerY);

    var searchVal = (genusSearch && genusSearch.value) ? genusSearch.value.trim().toLowerCase() : '';
    var highlightIds = {};
    if (searchVal) {
      nodes.forEach(function (n) {
        if (n.node.name && n.node.name.toLowerCase().indexOf(searchVal) !== -1) highlightIds[n.node.id] = true;
      });
    }

    nodes.forEach(function (n) {
      var type = n.node.type;
      var isHighlight = highlightIds[n.node.id];
      var hw = n.width / 2;
      var hh = n.height / 2;
      var x = n.x - hw;
      var y = n.y - hh;

      if (type === 'family') {
        ctx.fillStyle = 'rgba(212, 168, 75, 0.35)';
        ctx.strokeStyle = 'rgba(212, 168, 75, 0.9)';
      } else if (type === 'subfamily') {
        ctx.fillStyle = 'rgba(90, 100, 118, 0.25)';
        ctx.strokeStyle = 'rgba(232, 236, 244, 0.6)';
      } else if (type === 'tribe') {
        ctx.fillStyle = 'rgba(26, 39, 68, 0.5)';
        ctx.strokeStyle = 'rgba(232, 236, 244, 0.4)';
      } else {
        ctx.fillStyle = 'rgba(26, 39, 68, 0.7)';
        ctx.strokeStyle = 'rgba(212, 168, 75, 0.5)';
      }
      if (isHighlight) {
        ctx.fillStyle = 'rgba(212, 168, 75, 0.4)';
        ctx.strokeStyle = 'rgba(212, 168, 75, 0.95)';
      }
      var r = 6;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + n.width - r, y);
      ctx.arcTo(x + n.width, y, x + n.width, y + r, r);
      ctx.lineTo(x + n.width, y + n.height - r);
      ctx.arcTo(x + n.width, y + n.height, x + n.width - r, y + n.height, r);
      ctx.lineTo(x + r, y + n.height);
      ctx.arcTo(x, y + n.height, x, y + n.height - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isHighlight ? '#faf9f6' : '#e8ecf4';
      ctx.font = (type === 'family' ? '600 14px' : type === 'subfamily' ? '600 12px' : '500 11px') + ' system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var label = n.node.name || '';
      if (label.length > 18) label = label.slice(0, 16) + '…';
      ctx.fillText(label, n.x, n.y);
    });

    ctx.restore();
  }

  function drawEdges() {
    if (!ctx || !canvas || !taxonomy) return;
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.width / dpr;
    var cssH = canvas.height / dpr;
    var centerX = cssW / 2;
    var centerY = cssH / 2;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(centerX + view.offsetX, centerY + view.offsetY);
    ctx.scale(view.scale, view.scale);
    ctx.translate(-centerX, -centerY);
    ctx.strokeStyle = 'rgba(232, 236, 244, 0.25)';
    ctx.lineWidth = 1.5;
    nodes.forEach(function (n) {
      var ch = getChildren(n.node);
      if (ch.length === 0) return;
      var fromY = n.y + NODE_HEIGHT / 2;
      ch.forEach(function (c) {
        var childNode = nodes.find(function (x) { return x.node === c; });
        if (!childNode) return;
        var toY = childNode.y - NODE_HEIGHT / 2;
        var midY = (fromY + toY) / 2;
        ctx.beginPath();
        ctx.moveTo(n.x, fromY);
        ctx.lineTo(n.x, midY);
        ctx.lineTo(childNode.x, midY);
        ctx.lineTo(childNode.x, toY);
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  function render() {
    drawEdges();
    draw();
  }

  function fitToView() {
    if (nodes.length === 0) return;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(function (n) {
      var hw = n.width / 2, hh = n.height / 2;
      minX = Math.min(minX, n.x - hw);
      maxX = Math.max(maxX, n.x + hw);
      minY = Math.min(minY, n.y - hh);
      maxY = Math.max(maxY, n.y + hh);
    });
    var padding = 60;
    var contentW = maxX - minX + padding * 2;
    var contentH = maxY - minY + padding * 2;
    var cssW = canvas.width / (window.devicePixelRatio || 1);
    var cssH = canvas.height / (window.devicePixelRatio || 1);
    var scale = Math.min(cssW / contentW, cssH / contentH, 1.2);
    view.scale = Math.max(0.15, Math.min(2, scale));
    view.offsetX = (cssW / 2) - (minX + maxX) / 2 * view.scale;
    view.offsetY = (cssH / 2) - (minY + maxY) / 2 * view.scale;
    render();
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

  function openPanel(genusNode) {
    if (!sidePanel || !genusNode) return;
    panelGenusName.textContent = genusNode.name || '';
    panelGenusInfo.textContent = genusNode.info || '—';
    panelSpeciesList.innerHTML = '';
    panelSpeciesDetail.hidden = true;
    sidePanel.hidden = false;

    var speciesFile = genusNode.speciesFile;
    if (!speciesFile) {
      var empty = document.createElement('li');
      empty.textContent = 'Нет файла видов для этого рода.';
      panelSpeciesList.appendChild(empty);
      return;
    }
    panelSpeciesList.innerHTML = '<li>Загрузка…</li>';
    loadSpecies(genusNode.id, speciesFile, function (err, list) {
      panelSpeciesList.innerHTML = '';
      if (!list || list.length === 0) {
        var li = document.createElement('li');
        li.textContent = 'Нет данных о видах.';
        panelSpeciesList.appendChild(li);
        return;
      }
      list.forEach(function (sp) {
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = sp.name || sp.id || '—';
        btn.dataset.speciesId = sp.id || '';
        btn.dataset.speciesName = sp.name || '';
        btn.dataset.speciesDesc = sp.description || '';
        btn.addEventListener('click', function () {
          panelSpeciesName.textContent = sp.name || '—';
          panelSpeciesDesc.textContent = sp.description || '—';
          panelSpeciesDetail.hidden = false;
        });
        li.appendChild(btn);
        panelSpeciesList.appendChild(li);
      });
    });
  }

  function initPanel() {
    if (panelClose) panelClose.addEventListener('click', function () { sidePanel.hidden = true; });
  }

  function setupCanvas() {
    canvas = document.getElementById('taxonomy-map');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    mapWrap = document.querySelector('.map-wrap');
    sidePanel = document.getElementById('side-panel');
    panelGenusName = document.getElementById('panel-genus-name');
    panelGenusInfo = document.getElementById('panel-genus-info');
    panelSpeciesList = document.getElementById('panel-species-list');
    panelSpeciesDetail = document.getElementById('panel-species-detail');
    panelSpeciesName = document.getElementById('panel-species-name');
    panelSpeciesDesc = document.getElementById('panel-species-desc');
    panelClose = document.getElementById('panel-close');
    genusSearch = document.getElementById('genus-search');

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var el = mapWrap || canvas.parentElement;
      var w = el ? el.clientWidth : 800;
      var h = el ? el.clientHeight : 500;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      if (nodes.length > 0) render();
    }

    function pointerDown(e) {
      if (e.touches) {
        var x = e.touches[0].clientX;
        var y = e.touches[0].clientY;
        lastPointer.x = x;
        lastPointer.y = y;
        if (e.touches.length >= 2) lastPinchDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        pointerDownAt = null;
      } else {
        lastPointer.x = e.clientX;
        lastPointer.y = e.clientY;
        pointerDownAt = { x: e.clientX, y: e.clientY };
      }
      isPanning = true;
    }

    function pointerMove(e) {
      if (e.touches && e.touches.length >= 2) {
        var dist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        if (lastPinchDist > 0) {
          var factor = dist / lastPinchDist;
          view.scale = Math.max(0.1, Math.min(4, view.scale * factor));
          lastPinchDist = dist;
        }
        e.preventDefault();
        render();
        return;
      }
      if (!isPanning) return;
      var x = (e.touches ? e.touches[0] : e).clientX;
      var y = (e.touches ? e.touches[0] : e).clientY;
      view.offsetX += x - lastPointer.x;
      view.offsetY += y - lastPointer.y;
      lastPointer.x = x;
      lastPointer.y = y;
      e.preventDefault();
      render();
    }

    function pointerUp(e) {
      if (e.touches && e.touches.length >= 2) return;
      isPanning = false;
      lastPinchDist = 0;
    }

    function click(e) {
      if (e.touches) return;
      if (pointerDownAt) {
        var dx = e.clientX - pointerDownAt.x;
        var dy = e.clientY - pointerDownAt.y;
        if (dx * dx + dy * dy > 25) {
          pointerDownAt = null;
          return;
        }
      }
      pointerDownAt = null;
      var hit = getNodeAt(e.clientX, e.clientY);
      if (hit && isGenus(hit.node)) openPanel(hit.node);
    }

    function wheel(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? -0.1 : 0.1;
      var factor = 1 + delta;
      var r = canvas.getBoundingClientRect();
      var cx = e.clientX - r.left;
      var cy = e.clientY - r.top;
      var cssW = canvas.width / (window.devicePixelRatio || 1);
      var cssH = canvas.height / (window.devicePixelRatio || 1);
      var centerX = cssW / 2, centerY = cssH / 2;
      var wx = (cx - centerX - view.offsetX) / view.scale + centerX;
      var wy = (cy - centerY - view.offsetY) / view.scale + centerY;
      view.scale = Math.max(0.1, Math.min(4, view.scale * factor));
      view.offsetX = cx - centerX - (wx - centerX) * view.scale;
      view.offsetY = cy - centerY - (wy - centerY) * view.scale;
      render();
    }

    canvas.addEventListener('mousedown', pointerDown);
    canvas.addEventListener('mousemove', pointerMove);
    canvas.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('mouseleave', pointerUp);
    canvas.addEventListener('click', click);
    canvas.addEventListener('wheel', wheel, { passive: false });
    canvas.addEventListener('touchstart', pointerDown, { passive: true });
    canvas.addEventListener('touchmove', pointerMove, { passive: false });
    canvas.addEventListener('touchend', pointerUp);
    canvas.addEventListener('touchcancel', pointerUp);

    window.addEventListener('resize', resize);
    resize();
  }

  function onSearchInput() {
    render();
  }

  function init() {
    fetch(TAXONOMY_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('taxonomy load failed');
        return r.json();
      })
      .then(function (data) {
        taxonomy = data;
        buildNodesFlat();
        setupCanvas();
        initPanel();
        fitToView();
        if (genusSearch) genusSearch.addEventListener('input', onSearchInput);
      })
      .catch(function (err) {
        console.error('Taxonomy load error:', err);
        if (mapWrap) mapWrap.innerHTML = '<p class="classification-error">Не удалось загрузить карту систематики. Проверьте наличие файла data/taxonomy.json.</p>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
