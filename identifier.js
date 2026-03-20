/**
 * Определитель кактусов: загрузка фото → воркер (/v1/vision) → история не пропадает при обновлении.
 * Предисловие задаётся в config.js (identifierPreface). Последние 5 результатов сохраняются.
 */
(function () {
  "use strict";

  var workerUrl = (window.APP_CONFIG && window.APP_CONFIG.workerUrl) ? String(window.APP_CONFIG.workerUrl).replace(/\/$/, "") : "";
  var VISION_URL = workerUrl ? workerUrl + "/v1/vision" : "";
  var prefaceText = (window.APP_CONFIG && window.APP_CONFIG.identifierPreface) ? String(window.APP_CONFIG.identifierPreface).trim() : "";
  var MAX_IMAGE_SIZE = 3 * 1024 * 1024;
  var MAX_DIMENSION = 1024;
  var HISTORY_KEY = "identifier_history";
  var HISTORY_MAX = 5;

  var uploadZone = document.getElementById("upload-zone");
  var uploadInput = document.getElementById("upload-input");
  var uploadPlaceholder = document.getElementById("upload-placeholder");
  var uploadPreview = document.getElementById("upload-preview");
  var previewImg = document.getElementById("preview-img");
  var uploadClear = document.getElementById("upload-clear");
  var identifyBtn = document.getElementById("identify-btn");
  var resultSection = document.getElementById("identifier-result");
  var resultError = document.getElementById("result-error");
  var resultCards = document.getElementById("result-cards");
  var resultClearHint = document.getElementById("result-clear-hint");
  var resultClearBtn = document.getElementById("result-clear-btn");

  var currentFile = null;
  var currentDataUrl = null;
  var mapInstances = {};
  var expectedGenusFromQuery = "";
  var taxonomyGenusListPromise = null;
  var taxonomyGeneraSet = null;

  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.slice(0, HISTORY_MAX) : [];
    } catch (e) { return []; }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
    } catch (e) {}
  }

  function showError(msg) {
    if (resultError) {
      resultError.hidden = false;
      resultError.textContent = msg;
    }
    if (resultSection) resultSection.hidden = false;
  }

  function hideError() {
    if (resultError) resultError.hidden = true;
  }

  function resizeImageIfNeeded(dataUrl, maxBytes, maxDim, cb) {
    var img = new Image();
    img.onload = function () {
      var w = img.width, h = img.height;
      if (w <= maxDim && h <= maxDim) {
        try {
          var base64 = dataUrl.split(",")[1];
          if (base64 && base64.length * 0.75 <= maxBytes) { cb(null, dataUrl, base64); return; }
        } catch (e) {}
      }
      var scale = Math.min(maxDim / w, maxDim / h, 1);
      var c = document.createElement("canvas");
      c.width = Math.round(w * scale);
      c.height = Math.round(h * scale);
      var ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, c.width, c.height);
      var q = 0.85;
      var tryDataUrl = c.toDataURL("image/jpeg", q);
      while (tryDataUrl.length > maxBytes + 500 && q > 0.3) {
        q -= 0.1;
        tryDataUrl = c.toDataURL("image/jpeg", q);
      }
      cb(null, tryDataUrl, tryDataUrl.split(",")[1]);
    };
    img.onerror = function () { cb(new Error("Не удалось загрузить изображение")); };
    img.src = dataUrl;
  }

  function setPreview(file) {
    if (!file || !file.type.match(/^image\/(jpeg|png|webp)$/)) return;
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function () {
      currentDataUrl = reader.result;
      previewImg.src = currentDataUrl;
      uploadPlaceholder.hidden = true;
      uploadPreview.hidden = false;
      identifyBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  function clearPreview() {
    currentFile = null;
    currentDataUrl = null;
    if (uploadInput) uploadInput.value = "";
    previewImg.src = "";
    uploadPlaceholder.hidden = false;
    uploadPreview.hidden = true;
    identifyBtn.disabled = true;
  }

  function initMapInContainer(lat, lon, containerId, regionText, popupLinkHref, popupLinkText) {
    var container = document.getElementById(containerId);
    if (!container || typeof L === "undefined") return;
    if (mapInstances[containerId]) {
      mapInstances[containerId].remove();
      mapInstances[containerId] = null;
    }
    container.innerHTML = "";
    var map = L.map(container, {
      center: [lat, lon],
      zoom: 4,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    map.setView([lat, lon], 4);
    var popupText = (regionText && regionText.trim()) ? regionText.trim() : "Примерный ареал в природе";
    var popupHtml = "<strong>" + popupText.replace(/</g, "&lt;") + "</strong>";
    if (popupLinkHref && popupLinkHref.trim()) {
      var safeText = (popupLinkText && popupLinkText.trim()) ? popupLinkText.trim() : "Открыть в систематике";
      popupHtml += "<br/><a href=\"" + popupLinkHref.replace(/"/g, "&quot;") + "\" target=\"_self\" rel=\"noopener noreferrer\" style=\"color:#2d6cdf; text-decoration: underline;\">"
        + safeText.replace(/</g, "&lt;") + "</a>";
    }
    var marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "identifier-marker",
        html: "<span aria-hidden=\"true\">🌵</span>",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(map);
    marker.bindPopup(popupHtml, { closeButton: true, autoClose: false });
    mapInstances[containerId] = map;
  }

  function normalizeQueryToLatin(s) {
    if (!s) return "";
    var str = String(s).toLowerCase();
    var map = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'i','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
    };
    var out = "";
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      out += map.hasOwnProperty(ch) ? map[ch] : ch;
    }
    out = out.replace(/[^a-z0-9]/g, "").trim();
    out = out.replace(/kaktus/g, "cactus").replace(/kactus/g, "cactus");
    out = out.replace(/llya/g, "lla");
    out = out.replace(/arii$/i, "aria");
    return out;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var i, j;
    var dp = [];
    for (i = 0; i <= a.length; i++) dp[i] = [i];
    for (j = 1; j <= b.length; j++) dp[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[a.length][b.length];
  }

  function scoreMatch(queryNorm, candidateNorm) {
    if (!queryNorm || !candidateNorm) return -1;
    if (candidateNorm === queryNorm) return 1000;
    if (candidateNorm.indexOf(queryNorm) === 0 || queryNorm.indexOf(candidateNorm) === 0) return 800;
    if (candidateNorm.indexOf(queryNorm) !== -1 || queryNorm.indexOf(candidateNorm) !== -1) return 650;
    var dist = levenshtein(queryNorm, candidateNorm);
    if (dist <= 1) return 500;
    if (dist <= 2) return 420;
    if (dist <= 3 && queryNorm.length >= 8) return 300;
    return -1;
  }

  function collectGenera(node, out) {
    if (!node) return;
    if (node.type === "genus") out.push({ id: node.id || "", name: node.name || "" });
    var children = node.children || [];
    for (var i = 0; i < children.length; i++) collectGenera(children[i], out);
  }

  function getGenusList() {
    if (!taxonomyGenusListPromise) {
      taxonomyGenusListPromise = fetch("./data/taxonomy.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("taxonomy")); })
        .then(function (tree) {
          var arr = [];
          collectGenera(tree, arr);
          return arr;
        })
        .catch(function () { return []; });
    }
    return taxonomyGenusListPromise;
  }

  function getTaxonomyGeneraSet() {
    if (taxonomyGeneraSet) return Promise.resolve(taxonomyGeneraSet);
    return getGenusList().then(function (genera) {
      var set = {};
      for (var i = 0; i < genera.length; i++) {
        var name = String(genera[i].name || genera[i].id || "").trim();
        if (name) set[name.toLowerCase()] = true;
      }
      taxonomyGeneraSet = set;
      return taxonomyGeneraSet;
    });
  }

  function resolveExpectedGenusFromUrl() {
    try {
      var p = new URLSearchParams(window.location.search || "");
      var q = (p.get("q") || "").trim();
      if (!q) return Promise.resolve("");
      var norm = normalizeQueryToLatin(q);
      if (!norm) return Promise.resolve("");
      return getGenusList().then(function (genera) {
        var best = "";
        var bestScore = -1;
        for (var i = 0; i < genera.length; i++) {
          var g = genera[i];
          var idNorm = String(g.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          var nameNorm = String(g.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          var score = Math.max(scoreMatch(norm, idNorm), scoreMatch(norm, nameNorm));
          if (score > bestScore) {
            bestScore = score;
            best = g.name || g.id || "";
          }
        }
        return bestScore >= 300 ? String(best) : "";
      });
    } catch (_) {
      return Promise.resolve("");
    }
  }

  function extractLatinGenus(nameLatin) {
    if (!nameLatin || typeof nameLatin !== "string") return "";
    var s = nameLatin.replace(/\s*[,].*$/, "").replace(/\(.*?\)/g, " ").trim();
    s = s.replace(/×/g, " ");
    var parts = s.split(/\s+/).filter(Boolean);
    return parts.length ? parts[0] : "";
  }

  function buildCard(data, mapId) {
    var card = document.createElement("article");
    card.className = "identifier-result__card";

    if (data.message && data.message.trim()) {
      var msgWrap = document.createElement("div");
      msgWrap.className = "identifier-result__message-wrap";
      var msgP = document.createElement("p");
      msgP.className = "identifier-result__message";
      msgP.textContent = data.message.trim();
      msgWrap.appendChild(msgP);
      card.appendChild(msgWrap);
    }
    var detectedGenus = extractLatinGenus(data.name_latin || "");
    if (expectedGenusFromQuery && detectedGenus && expectedGenusFromQuery.toLowerCase() !== detectedGenus.toLowerCase()) {
      var warn = document.createElement("p");
      warn.className = "identifier-result__warning";
      warn.textContent = "Внимание: вы искали «" + expectedGenusFromQuery + "», а ИИ распознал «" + detectedGenus + "». Проверьте фото и сравните с систематикой.";
      card.appendChild(warn);
    }
    if (detectedGenus && taxonomyGeneraSet && !taxonomyGeneraSet[detectedGenus.toLowerCase()]) {
      var warnOut = document.createElement("p");
      warnOut.className = "identifier-result__warning";
      warnOut.textContent = "Род «" + detectedGenus + "» пока не найден в вашей систематике. Проверьте фото, либо откройте систематику вручную.";
      card.appendChild(warnOut);
    }

    var head = document.createElement("div");
    head.className = "identifier-result__head";
    var nameH = document.createElement("h2");
    nameH.className = "identifier-result__name";
    var nameRu = data.name_ru || "Кактус";
    var latinName = data.name_latin || "";

    // Переход по названию вида в классификацию:
    // classification-cacti.html?genus=...&species=genus-epithet
    function buildSpeciesHrefFromLatin(latin) {
      if (!latin || typeof latin !== "string") return "";
      // Убираем лишнее после запятых/скобок, чтобы получить чистый биноминальный латинский вид.
      var s = latin.replace(/\s*[,].*$/, "").replace(/\(.*?\)/g, " ").trim();
      // Иногда встречаются форматы вида "Genus × epithet".
      s = s.replace(/×/g, " ");
      var parts = s.split(/\s+/).filter(Boolean);
      if (parts.length < 2) return "";
      var genus = (parts[0] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
      var epithet = (parts[1] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
      if (!genus || !epithet) return "";
      var speciesId = genus + "-" + epithet;
      return "classification-cacti.html?genus=" + encodeURIComponent(genus) + "&species=" + encodeURIComponent(speciesId);
    }

    var href = buildSpeciesHrefFromLatin(latinName);
    if (href) {
      var nameLink = document.createElement("a");
      nameLink.className = "identifier-result__name-link";
      nameLink.href = href;
      nameLink.rel = "noopener noreferrer";
      nameLink.target = "_self";
      nameLink.textContent = nameRu;
      nameH.appendChild(nameLink);
    } else {
      nameH.textContent = nameRu;
    }

    // Явная кнопка, чтобы вы быстрее находили карту ареала
    // (люди часто не понимают, где именно “Ареал в природе” на карточке).
    var mapJumpBtn = document.createElement("button");
    mapJumpBtn.type = "button";
    mapJumpBtn.className = "identifier-result__map-jump";
    mapJumpBtn.textContent = "Показать карту ареала";
    mapJumpBtn.addEventListener("click", function () {
      var el = document.getElementById(mapId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    var latinP = document.createElement("p");
    latinP.className = "identifier-result__latin";
    latinP.textContent = data.name_latin || "";
    head.appendChild(nameH);
    head.appendChild(mapJumpBtn);
    head.appendChild(latinP);
    card.appendChild(head);

    var mapWrap = document.createElement("div");
    mapWrap.className = "identifier-result__map-wrap";
    var mapLabel = document.createElement("p");
    mapLabel.className = "identifier-result__map-label";
    mapLabel.textContent = "Ареал в природе";
    var mapDiv = document.createElement("div");
    mapDiv.id = mapId;
    mapDiv.className = "identifier-result__map";
    mapDiv.setAttribute("aria-label", "Карта ареала");
    var regionP = document.createElement("p");
    regionP.className = "identifier-result__region";
    regionP.textContent = data.region || "";
    mapWrap.appendChild(mapLabel);
    mapWrap.appendChild(mapDiv);
    mapWrap.appendChild(regionP);
    card.appendChild(mapWrap);

    var secDesc = document.createElement("div");
    secDesc.className = "identifier-result__section";
    secDesc.innerHTML = "<h3>Описание</h3>";
    var descP = document.createElement("p");
    descP.className = "identifier-result__description";
    descP.textContent = data.description || "";
    secDesc.appendChild(descP);
    card.appendChild(secDesc);

    var secFacts = document.createElement("div");
    secFacts.className = "identifier-result__section";
    secFacts.innerHTML = "<h3>Интересные факты</h3>";
    var factsUl = document.createElement("ul");
    factsUl.className = "identifier-result__facts";
    if (data.facts && Array.isArray(data.facts)) {
      data.facts.forEach(function (f) {
        var li = document.createElement("li");
        li.textContent = f;
        factsUl.appendChild(li);
      });
    }
    secFacts.appendChild(factsUl);
    card.appendChild(secFacts);

    var secCare = document.createElement("div");
    secCare.className = "identifier-result__section";
    secCare.innerHTML = "<h3>Уход</h3>";
    var careP = document.createElement("p");
    careP.className = "identifier-result__care";
    careP.textContent = data.care || "";
    secCare.appendChild(careP);
    card.appendChild(secCare);

    return card;
  }

  function renderAllCards() {
    var list = loadHistory();
    if (!resultCards) return;
    Object.keys(mapInstances).forEach(function (id) {
      if (mapInstances[id]) { mapInstances[id].remove(); mapInstances[id] = null; }
    });
    mapInstances = {};
    resultCards.innerHTML = "";

    if (list.length === 0) {
      if (resultCards) resultCards.innerHTML = "";
      if (resultSection) resultSection.hidden = true;
      if (resultClearHint) resultClearHint.hidden = true;
      return;
    }

    list.forEach(function (item, index) {
      var data = item.data || item;
      var mapId = "result-map-" + index;
      var card = buildCard(data, mapId);
      resultCards.appendChild(card);
      var lat = typeof data.lat === "number" ? data.lat : 25;
      var lon = typeof data.lon === "number" ? data.lon : -102;
      // Переход из popup карты в классификацию (если у AI вернулся латинский вид).
      var popupHref = "";
      try {
        if (data && data.name_latin) {
          // Повторяем логику buildSpeciesHrefFromLatin, чтобы popup работал без доступа к внутренней функции.
          var latin = String(data.name_latin);
          var s = latin.replace(/\s*[,].*$/, "").replace(/\(.*?\)/g, " ").trim();
          s = s.replace(/×/g, " ");
          var parts = s.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            var genus = (parts[0] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
            var epithet = (parts[1] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
            if (genus && epithet) {
              var speciesId = genus + "-" + epithet;
              popupHref = "classification-cacti.html?genus=" + encodeURIComponent(genus) + "&species=" + encodeURIComponent(speciesId);
            }
          }
        }
      } catch (_) {}

      setTimeout(function () { initMapInContainer(lat, lon, mapId, data.region, popupHref, "Открыть в систематике"); }, 50 * index);
    });

    if (resultClearHint) resultClearHint.hidden = false;
    if (resultSection) {
      resultSection.hidden = false;
      hideError();
    }
  }

  function addToHistory(data) {
    var list = loadHistory();
    list.unshift({ data: data, time: Date.now() });
    saveHistory(list);
    renderAllCards();
  }

  function doIdentify() {
    if (!currentDataUrl) return;
    if (!VISION_URL) {
      showError("Сначала настрой воркер в config.js (workerUrl). См. НАСТРОЙКА.md.");
      return;
    }
    identifyBtn.classList.add("loading");
    identifyBtn.disabled = true;

    resizeImageIfNeeded(currentDataUrl, MAX_IMAGE_SIZE, MAX_DIMENSION, function (err, dataUrl, base64) {
      if (err) {
        showError(err.message);
        identifyBtn.classList.remove("loading");
        identifyBtn.disabled = false;
        return;
      }
      var mime = dataUrl.indexOf("image/png") !== -1 ? "image/png" : "image/jpeg";
      getGenusList().then(function (genera) {
        var genusNames = genera.map(function (g) { return g.name || g.id || ""; }).filter(Boolean).slice(0, 200);
        var dynamicPreface = prefaceText || "";
        dynamicPreface += (dynamicPreface ? " " : "") +
          "Определяй только кактусы из каталога родов систематики сайта. " +
          "Если не уверен — пиши 'Низкая уверенность'. " +
          "Каталог родов (" + String(genusNames.length) + "): " + genusNames.join(", ") + ".";
        var body = { image: base64, mime: mime, preface: dynamicPreface };

        fetch(VISION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        .then(function (res) { return res.json().then(function (b) { if (!res.ok) throw new Error(b.error || "Ошибка сервера"); return b; }); })
        .then(function (body) {
          var content = body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content;
          if (!content) { showError("Не удалось распознать ответ. Попробуйте другое фото."); return; }
          var data;
          try { data = typeof content === "string" ? JSON.parse(content) : content; } catch (e) {
            showError("Ответ не в формате JSON. Попробуйте другое фото.");
            return;
          }
          if (data.error) { showError(data.error); return; }
          addToHistory(data);
          clearPreview();
        })
        .catch(function (e) { showError(e.message || "Не удалось определить кактус. Проверьте интернет."); })
        .finally(function () {
          identifyBtn.classList.remove("loading");
          identifyBtn.disabled = false;
        });
      }).catch(function () {
        identifyBtn.classList.remove("loading");
        identifyBtn.disabled = false;
        showError("Не удалось загрузить каталог родов для проверки.");
      });
    });
  }

  if (uploadZone) {
    uploadZone.addEventListener("click", function (e) {
      if (e.target === uploadInput || e.target.closest(".identifier-upload__clear")) return;
      uploadInput.click();
    });
    uploadZone.addEventListener("dragover", function (e) { e.preventDefault(); uploadZone.classList.add("drag-over"); });
    uploadZone.addEventListener("dragleave", function () { uploadZone.classList.remove("drag-over"); });
    uploadZone.addEventListener("drop", function (e) {
      e.preventDefault();
      uploadZone.classList.remove("drag-over");
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) setPreview(f);
    });
  }
  if (uploadInput) uploadInput.addEventListener("change", function () { var f = uploadInput.files && uploadInput.files[0]; if (f) setPreview(f); });
  if (uploadClear) uploadClear.addEventListener("click", function (e) { e.stopPropagation(); clearPreview(); });
  if (identifyBtn) identifyBtn.addEventListener("click", doIdentify);

  if (resultClearBtn) {
    resultClearBtn.addEventListener("click", function () {
      saveHistory([]);
      Object.keys(mapInstances).forEach(function (id) {
        if (mapInstances[id]) { mapInstances[id].remove(); mapInstances[id] = null; }
      });
      mapInstances = {};
      renderAllCards();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      resolveExpectedGenusFromUrl().then(function (g) {
        expectedGenusFromQuery = g || "";
        var list = loadHistory();
        if (list.length > 0) renderAllCards();
      });
    });
  } else {
    resolveExpectedGenusFromUrl().then(function (g) {
      expectedGenusFromQuery = g || "";
      var list = loadHistory();
      if (list.length > 0) renderAllCards();
    });
  }
})();
