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

  function initMapInContainer(lat, lon, containerId, regionText) {
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
    var marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "identifier-marker",
        html: "<span aria-hidden=\"true\">🌵</span>",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    }).addTo(map);
    marker.bindPopup("<strong>" + popupText.replace(/</g, "&lt;") + "</strong>", { closeButton: true, autoClose: false });
    mapInstances[containerId] = map;
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

    var head = document.createElement("div");
    head.className = "identifier-result__head";
    var nameH = document.createElement("h2");
    nameH.className = "identifier-result__name";
    nameH.textContent = data.name_ru || "Кактус";
    var latinP = document.createElement("p");
    latinP.className = "identifier-result__latin";
    latinP.textContent = data.name_latin || "";
    head.appendChild(nameH);
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
      setTimeout(function () { initMapInContainer(lat, lon, mapId, data.region); }, 50 * index);
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
      var body = { image: base64, mime: mime };
      if (prefaceText) body.preface = prefaceText;

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
      var list = loadHistory();
      if (list.length > 0) renderAllCards();
    });
  } else {
    var list = loadHistory();
    if (list.length > 0) renderAllCards();
  }
})();
