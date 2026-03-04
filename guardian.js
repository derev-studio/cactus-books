/**
 * Колючий Собеседник — чат о кактусах, книга Кактусология, картинки только кактусы
 * Pollinations.ai | 4 режима: разговор, языки, рисование, душа
 *
 * Никаких API-ключей — Pollinations.ai бесплатный и работает без регистрации.
 * Запросы идут напрямую из браузера, никакой прокси не нужен.
 */
(function () {
  "use strict";

  /* ── Цепочка AI-сервисов (пробуем по порядку до первого успешного) ──
     Если в config.js указан workerUrl — первым идёт твой воркер (Groq). Иначе только Pollinations.
  */
  var workerBase = (window.APP_CONFIG && window.APP_CONFIG.workerUrl) ? String(window.APP_CONFIG.workerUrl).replace(/\/$/, "") : "";
  var AI_CHAIN = [];
  if (workerBase) {
    AI_CHAIN.push({ url: workerBase + "/v1/chat/completions", model: "llama-3.3-70b-versatile" });
  }
  AI_CHAIN.push(
    { url: "https://text.pollinations.ai/openai",             model: "openai-large" },
    { url: "https://text.pollinations.ai/openai",             model: "openai"       },
    { url: "https://gen.pollinations.ai/v1/chat/completions", model: "openai-large" },
    { url: "https://gen.pollinations.ai/v1/chat/completions", model: "openai-fast"  }
  );

  /* ═══════ ЛИЧНОСТЬ ХРАНИТЕЛЯ ═══════ */

  var BASE =
    "Ты — Колючий Собеседник (守護者), эксперт по кактусам и добрый собеседник. " +
    "Твои знания согласованы с книгой «Кактусология» на этом сайте: виды, ареалы, история, легенды, уход. " +
    "Сайт для кактусоводов по всему миру. Обращайся нейтрально: «ты», «друг», «гость» или «уважаемый кактусовод». " +
    "Ты разбираешься в кактусах: можешь подсказать вид, регион произрастания, маршрут до места (предлагай ссылку на карту). " +
    "Для определения кактуса по фото гость может открыть раздел «Опознать кактус» — подскажи это, если спрашивают про фото. " +
    "КАРТИНКИ: рисуй и предлагай ТОЛЬКО кактусы, суккуленты, природу кактусных регионов. Никогда не рисуй кошек, животных и прочее — только кактусная тема. " +
    "ЯЗЫК: отвечай на том же языке, на котором пишет собеседник (русский, украинский, английский и др.). " +
    "Ты немногословен, точен, тёпел. Отвечаешь по существу, с достоинством.";

  /* ═══════ ДУЭТ ═══════ */
  var ARTIST_DUO =
    "Ты — Художник (絵師), молчаливый мастер кисти и цвета. " +
    "Рядом — Сэнсэй и Психолог. Отвечай кратко, образно. Рисуй редко: только когда разговор о творчестве или человек просит картинку — скажи «нарисуй [описание]». " +
    "Сайт для кактусоводов со всего мира. Обращайся нейтрально. Отвечай на том же языке, на котором пишет собеседник.";

  var LINGUIST_DUO =
    "Ты — Сэнсэй (先生), знаток языков: русского, украинского, английского, японского и др. " +
    "Рядом — Художник и Психолог. Учишь естественно, мягко поправляешь ошибки. Дружелюбен, с лёгким юмором. " +
    "Отвечай на том же языке, на котором пишет собеседник (русский, украинский, английский и т.д.).";

  /* ═══════ ПСИХОЛОГ ═══════ */
  var PSYCHOLOGIST_SOLO =
    "Ты — Психолог, тёплый специалист по душевному состоянию. " +
    "Обращайся нейтрально: «ты», «друг» — без имени. Гости из разных стран (Россия, Украина, мир). " +
    "Твой подход: принятие без осуждения, мягкие вопросы, отражение чувств. " +
    "Ты НЕ ставишь диагнозов, НЕ назначаешь лекарства. При серьёзной ситуации — мягко напоминаешь о живом специалисте. " +
    "Говоришь спокойно, с заботой. Называй чувства, возвращай к настоящему моменту. Никогда не обесцениваешь боль. " +
    "Начинаешь с вопроса: что сейчас происходит внутри? Отвечай на том же языке, на котором пишет собеседник.";

  var PSYCHOLOGIST_DUO =
    "Ты — Психолог, тёплый специалист по душевному состоянию. " +
    "Рядом — Художник и Сэнсэй. Смотришь глубже — на чувства и состояние. " +
    "Подхватывай нить разговора. Говоришь коротко — один тёплый вопрос или одно наблюдение. " +
    "Никогда не обесцениваешь. Не советуешь лекарства. Если видишь тяжесть — называй её бережно. " +
    "Отвечай на том же языке, на котором пишет собеседник.";

  var PROMPTS = {
    assistant:
      BASE +
      " РЕЖИМ — Свободный разговор о кактусах и не только. " +
      "Ты близкий собеседник: кактусы, книга Кактусология, ареалы, уход, маршруты. Поддерживаешь, вдохновляешь. " +
      "Картинки: только кактусы и суккуленты. В конце ответа скажи «нарисуй [кактус/суккулент на русском]» — картина появится. " +
      "Если речь о рисовании — можно «[ОТКРЫТЬ_МАСТЕРСКУЮ]».",

    language:
      BASE +
      " РЕЖИМ — Репетитор по языкам. " +
      "Ты полиглот: русский, украинский, английский, японский и др. Объясняешь через образы, мягко исправляешь ошибки. " +
      "Даёшь мини-задания. Показываешь параллели между языками. Урок делаешь живым. " +
      "Отвечай на том же языке, на котором пишет собеседник. Картинки: только если тема про образ и очень редко — «нарисуй [образ]».",

    art:
      BASE +
      " РЕЖИМ — Наставник по творчеству и рисованию. " +
      "Ты чувствуешь живопись и фото: цвет, свет, композицию, настроение. " +
      "Обсуждаешь техники, помогаешь найти стиль. Говоришь образно. Ваби-саби — красота несовершенства. " +
      "Картинки: рисуй редко, только когда разговор про образ или человек просит. " +
      "Обращайся нейтрально. Отвечай на том же языке, на котором пишет собеседник.",

    psychology: PSYCHOLOGIST_SOLO,
  };

  /* ═══════ СОСТОЯНИЕ ═══════ */

  var history = [];
  var isLoading = false;

  var messagesEl = document.getElementById("guardian-messages");
  var inputEl    = document.getElementById("guardian-input");
  var sendBtn    = document.getElementById("guardian-send");
  var attachBtn  = document.getElementById("guardian-attach-photo");
  var attachInput = document.getElementById("guardian-attach-image");
  var attachPreview = document.getElementById("guardian-attach-preview");

  /** Прикреплённое фото: { dataUrl, base64, mime } или null */
  var attachedImage = null;

  if (!messagesEl || !inputEl || !sendBtn) return;

  /* Запрос из навигатора: подставить в поле ввода и в поиск шапки */
  (function () {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    if (q) {
      inputEl.value = q;
      var navSearch = document.getElementById("nav-search");
      if (navSearch) navSearch.value = q;
    }
  })();

  /* ── Прикрепить фото для отправки Собеседнику ── */
  function clearAttachedImage() {
    attachedImage = null;
    if (attachPreview) {
      attachPreview.classList.remove("is-visible");
      attachPreview.innerHTML = "";
    }
    if (attachInput) attachInput.value = "";
  }

  if (attachBtn && attachInput && attachPreview) {
    attachBtn.addEventListener("click", function () { attachInput.click(); });
    attachInput.addEventListener("change", function () {
      var file = this.files && this.files[0];
      if (!file || !file.type.startsWith("image/")) return;
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        var base64 = "";
        var mime = "image/jpeg";
        if (typeof dataUrl === "string" && dataUrl.indexOf("base64,") >= 0) {
          base64 = dataUrl.split("base64,")[1] || "";
          mime = dataUrl.indexOf("image/png") >= 0 ? "image/png" : "image/jpeg";
        }
        attachedImage = { dataUrl: dataUrl, base64: base64, mime: mime };
        attachPreview.innerHTML = "";
        var img = document.createElement("img");
        img.src = dataUrl;
        img.alt = "";
        attachPreview.appendChild(img);
        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "guardian-chat__attach-remove";
        removeBtn.textContent = "Убрать";
        removeBtn.addEventListener("click", function () { clearAttachedImage(); });
        attachPreview.appendChild(removeBtn);
        attachPreview.classList.add("is-visible");
      };
      reader.readAsDataURL(file);
    });
  }

  /* ═══════ УТИЛИТЫ ═══════ */

  function getMode() {
    var btn = document.querySelector(".guardian-mode__btn--active");
    return btn ? (btn.getAttribute("data-mode") || "assistant") : "assistant";
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessageStyled(role, text, extraClass, avatarSymbol, userImageDataUrl) {
    var isUser = role === "user";
    var msg = document.createElement("div");
    msg.className = "guardian-msg guardian-msg--" + (isUser ? "user" : "bot") +
                    (extraClass ? " guardian-msg--" + extraClass : "");

    var av = document.createElement("div");
    av.className = "guardian-msg__avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = avatarSymbol || (isUser ? "✎" : "✦");

    var bubble = document.createElement("div");
    bubble.className = "guardian-msg__bubble";

    if (userImageDataUrl && isUser) {
      var img = document.createElement("img");
      img.src = userImageDataUrl;
      img.alt = "";
      img.className = "guardian-msg__user-img";
      bubble.appendChild(img);
    }

    var p = document.createElement("p");
    p.className = "guardian-msg__text";
    p.textContent = text.replace(/\[ОТКРЫТЬ_МАСТЕРСКУЮ\]/g, "").trim();

    bubble.appendChild(p);
    msg.appendChild(av);
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    scrollToBottom();
    return msg;
  }

  function appendMessage(role, text, userImageDataUrl) {
    return appendMessageStyled(role, text, null, role === "user" ? "✎" : "✦", userImageDataUrl);
  }

  function showTyping(extraClass, symbol, label) {
    var msg = document.createElement("div");
    msg.id = "guardian-typing";
    msg.className = "guardian-msg guardian-msg--bot guardian-msg--typing" +
                    (extraClass ? " guardian-msg--" + extraClass : "");

    var av = document.createElement("div");
    av.className = "guardian-msg__avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = symbol || "✦";

    var bubble = document.createElement("div");
    bubble.className = "guardian-msg__bubble";

    var p = document.createElement("p");
    p.className = "guardian-msg__text";
    p.textContent = label || "Собеседник думает";

    bubble.appendChild(p);
    msg.appendChild(av);
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    scrollToBottom();
  }

  function hideTyping() {
    var el = document.getElementById("guardian-typing");
    if (el) el.remove();
  }

  function showError(text) {
    var old = document.getElementById("guardian-error");
    if (old) old.remove();

    var p = document.createElement("p");
    p.id = "guardian-error";
    p.className = "guardian-chat__error";
    p.textContent = text;

    var hint = document.querySelector(".guardian-chat__hint");
    if (hint && hint.parentNode) {
      hint.parentNode.insertBefore(p, hint);
    } else {
      messagesEl.parentNode.appendChild(p);
    }

    setTimeout(function () { if (p.parentNode) p.remove(); }, 9000);
  }

  /* ═══════ POLLINATIONS API (без ключей) ═══════ */

  function buildMessages(systemPrompt, userText, partnerNote) {
    var messages = [{ role: "system", content: systemPrompt }];
    for (var i = 0; i < history.length; i++) {
      messages.push({
        role: history[i].role === "model" ? "assistant" : "user",
        content: history[i].text,
      });
    }
    var txt = (partnerNote)
      ? userText + "\n[Мой коллега только что сказал: «" + partnerNote + "»]"
      : userText;
    messages.push({ role: "user", content: txt });
    return messages;
  }

  function tryEndpoint(idx, messages, onSuccess, onFail) {
    if (idx >= AI_CHAIN.length) {
      onFail("Все серверы временно недоступны. Подождите минуту и попробуйте снова.");
      return;
    }
    var ep   = AI_CHAIN[idx];
    var body = JSON.stringify({
      model: ep.model,
      messages: messages,
      temperature: 0.82,
      max_tokens: 800,
    });
    fetch(ep.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body })
      .then(function (res) {
        /* 429 — лимит, 401/403 — авторизация: пробуем следующий */
        if (res.status === 429 || res.status === 401 || res.status === 403) {
          tryEndpoint(idx + 1, messages, onSuccess, onFail);
          return;
        }
        if (!res.ok) { tryEndpoint(idx + 1, messages, onSuccess, onFail); return; }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        var text = "";
        try { text = data.choices[0].message.content || ""; } catch (e) {}
        if (!text.trim()) { tryEndpoint(idx + 1, messages, onSuccess, onFail); return; }
        onSuccess(text);
      })
      .catch(function () {
        tryEndpoint(idx + 1, messages, onSuccess, onFail);
      });
  }

  function callAIWithPrompt(systemPrompt, userText, partnerNote, onSuccess, onError) {
    tryEndpoint(0, buildMessages(systemPrompt, userText, partnerNote), onSuccess, onError);
  }

  function callAI(userText, onSuccess, onError) {
    callAIWithPrompt(PROMPTS[getMode()] || PROMPTS.assistant, userText, null, onSuccess, onError);
  }

  /* ═══════ ГОЛОС (Text-to-Speech) ═══════ */

  var voiceEnabled = localStorage.getItem("guardian_voice") === "on";
  var voiceToggleBtn = document.getElementById("guardian-voice-toggle");

  function updateVoiceUI() {
    if (!voiceToggleBtn) return;
    var icon = voiceToggleBtn.querySelector(".voice-icon");
    if (icon) icon.textContent = voiceEnabled ? "🔊" : "🔇";
    voiceToggleBtn.classList.toggle("guardian-chat__voice-btn--off", !voiceEnabled);
  }

  function cleanForSpeech(text) {
    return text
      /* убираем японские/китайские иероглифы и скобки с ними */
      .replace(/[\u3000-\u9fff\uf900-\ufaff\u3400-\u4dbf]+/g, "")
      /* убираем ромадзи в скобках типа (ma — пауза) */
      .replace(/\([^)]{1,40}\)/g, "")
      /* убираем символы типа ✦ 語 ♥ 守 */
      .replace(/[^\u0000-\u036f\u0400-\u04ff\u0020-\u007e]/g, "")
      /* убираем лишние пробелы */
      .replace(/\s{2,}/g, " ").trim()
      .slice(0, 600);
  }

  function speak(text) {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var clean = cleanForSpeech(text);
    if (!clean) return;
    var utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "ru-RU";
    utt.rate = 0.88;
    utt.pitch = 0.72;
    var trySpeak = function () {
      var voices = window.speechSynthesis.getVoices();
      /* Только хорошие голоса — лучше молчать чем говорить плохим */
      var pick = voices.find(function (v) { return /yuri/i.test(v.name); })
              || voices.find(function (v) { return /pavel|dmitri|aleksandr/i.test(v.name); })
              || voices.find(function (v) { return v.lang === "ru-RU"; })
              || voices.find(function (v) { return v.lang.startsWith("ru"); })
              || null;
      if (!pick) return;
      utt.voice = pick;
      window.speechSynthesis.speak(utt);
    };
    if (window.speechSynthesis.getVoices().length) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = trySpeak;
    }
  }

  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener("click", function () {
      voiceEnabled = !voiceEnabled;
      localStorage.setItem("guardian_voice", voiceEnabled ? "on" : "off");
      if (!voiceEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
      updateVoiceUI();
    });
    updateVoiceUI();
  }

  /* ═══════ КАРТИНКИ: по желанию Хранителя или только по просьбе ═══════ */

  var IMAGES_STORAGE_KEY = "guardian_images_mode";
  var imagesMode = localStorage.getItem(IMAGES_STORAGE_KEY) || "auto"; // по умолчанию редко по теме (см. промпты)
  var imagesToggleBtn = document.getElementById("guardian-images-toggle");

  function updateImagesUI() {
    if (!imagesToggleBtn) return;
    var label = imagesToggleBtn.querySelector(".images-label");
    if (label) label.textContent = imagesMode === "request" ? "по просьбе" : "по желанию";
    imagesToggleBtn.classList.toggle("guardian-chat__images-btn--request-only", imagesMode === "request");
    imagesToggleBtn.title = imagesMode === "request"
      ? "Картинки только когда ты просишь (нарисуй…, найди фото…). Нажми — разрешить Собеседнику рисовать по желанию."
      : "Собеседник может сам предлагать картинки (только кактусы). Нажми — только когда ты просишь.";
  }

  if (imagesToggleBtn) {
    imagesToggleBtn.addEventListener("click", function () {
      imagesMode = imagesMode === "auto" ? "request" : "auto";
      localStorage.setItem(IMAGES_STORAGE_KEY, imagesMode);
      updateImagesUI();
    });
    updateImagesUI();
  }

  /* ═══════ МИКРОФОН (Speech-to-Text) ═══════ */

  var micBtn = document.getElementById("guardian-mic");
  var isRecording = false;
  var recognition = null;

  if (micBtn) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      recognition = new SR();
      recognition.lang = "ru-RU";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      function stopRecording() {
        isRecording = false;
        micBtn.classList.remove("guardian-chat__mic--recording");
      }

      recognition.onresult = function (e) {
        var transcript = e.results[0][0].transcript;
        inputEl.value = transcript;
        inputEl.style.height = "auto";
        inputEl.style.height = Math.min(inputEl.scrollHeight, 220) + "px";
        stopRecording();
        sendMessage();
      };
      recognition.onerror = stopRecording;
      recognition.onend   = stopRecording;

      micBtn.addEventListener("click", function () {
        if (isLoading) return;
        if (isRecording) {
          recognition.stop();
        } else {
          isRecording = true;
          micBtn.classList.add("guardian-chat__mic--recording");
          try { recognition.start(); } catch (_) { stopRecording(); }
        }
      });
    } else {
      micBtn.style.display = "none";
    }
  }

  /* ═══════ ГЕНЕРАЦИЯ И ПОИСК КАРТИНОК ═══════ */

  var IMG_RE    = /(?:^|\s)(нарисуй мне|нарисуй|покажи картину|покажи мне картину|изобрази|создай картину|нарисуй картину)\s+/i;
  var FIND_RE   = /(?:^|\s)(найди фото|найди картинку|найди картину|покажи фото|найди изображение|поищи фото|поищи картинку)\s+/i;
  var BOOK_RE   = /(?:из книги|из книжки|картинк[ау] из книги|фото из книги|покажи из книги|найди в книге|покажи картинку из книги|иллюстраци[яи] из книги)/i;
  var MAP_RE    = /(?:^|\s)(найди карту|покажи карту|найди на карте|покажи на карте|где находится|карта)\s+/i;
  var ROUTE_RE  = /(?:маршрут|проложи|как добраться|как попасть|как доехать|как дойти|дорога|путь).*(?:из|от)\s+(.+?)\s+(?:в|до|к)\s+(.+?)(?:\s*[.!?]|$)/i;
  var CF_IMAGE_URL = workerBase ? workerBase + "/v1/image" : "";

  /* Пути к иллюстрациям книги Кактусология (media/image1.jpeg … image100.jpeg; 21,26 — .jpg; 79 — .png) */
  function getBookImagePath(n) {
    var ext = (n === 21 || n === 26) ? ".jpg" : (n === 79) ? ".png" : ".jpeg";
    return "книга-кактусология/media/image" + n + ext;
  }

  /* Показать картинки из книги Кактусология */
  function startFindingFromBook() {
    var indices = [];
    for (var i = 1; i <= 100; i++) indices.push(i);
    for (var j = indices.length - 1; j > 0; j--) {
      var r = Math.floor(Math.random() * (j + 1));
      var t = indices[j]; indices[j] = indices[r]; indices[r] = t;
    }
    var count = 3;
    var baseUrl = "";
    if (window.APP_CONFIG && window.APP_CONFIG.baseUrl) {
      baseUrl = window.APP_CONFIG.baseUrl;
    } else if (window.location.origin) {
      var path = (window.location.pathname || "").replace(/\/[^/]*$/, "/");
      baseUrl = window.location.origin + path;
    }
    for (var k = 0; k < count && k < indices.length; k++) {
      var card = buildImageCard("Из книги Кактусология", baseUrl + getBookImagePath(indices[k]), "book_" + indices[k], true);
      card.el.querySelector(".guardian-msg__image-delete").style.display = "none";
      messagesEl.appendChild(card.el);
    }
    scrollToBottom();
  }

  /* ── Поиск реальной фотографии через LoremFlickr (бесплатно, без ключей) ── */
  function findRealPhoto(subject, onSuccess, onFail) {
    callAIWithPrompt(
      "Translate this Russian text to 2-3 English keywords for image search, comma-separated. " +
      "Return ONLY keywords, no explanations.",
      subject, null,
      function (keywords) {
        keywords = keywords.trim().replace(/['"]/g, "").replace(/\s+/g, ",");
        var seed = Math.floor(Math.random() * 9999);
        var url = "https://loremflickr.com/768/512/" + encodeURIComponent(keywords) + "?random=" + seed;
        onSuccess(url, keywords);
      },
      function () {
        /* Перевод не удался */
        var enc = encodeURIComponent(subject.slice(0, 30));
        onSuccess("https://loremflickr.com/768/512/" + enc + "?random=" + Math.random(), subject);
      }
    );
  }

  /* ── Создать блок с найденным фото ── */
  function startFinding(subject) {
    var el = createImageBlock(subject);
    el.caption.textContent = "Ищу фото… 🔍";
    findRealPhoto(subject,
      function (url, keywords) {
        el.caption.textContent = "Нашёл фото… ⏳";
        el.img.onload  = function () {
          el.caption.textContent = "📷 " + subject;
          showDownloadBtn(el.downloadBtn, el.img, subject, el.imageId);
        };
        el.img.onerror = function () {
          /* LoremFlickr не ответил — рисуем через AI */
          el.caption.textContent = "Фото не нашлось, рисую… ⏳";
          generateImage(keywords || subject, el.img, el.caption, subject, el.downloadBtn, el.imageId);
        };
        el.img.src = url;
      },
      function () {
        generateImage(subject, el.img, el.caption, subject, el.downloadBtn, el.imageId);
      }
    );
  }

  /* ── Маршрут через Google Maps (открывается в новой вкладке) ── */
  function showRoute(from, to) {
    var mapsUrl = "https://www.google.com/maps/dir/?api=1" +
      "&origin=" + encodeURIComponent(from) +
      "&destination=" + encodeURIComponent(to) +
      "&travelmode=driving";

    var msgEl = document.createElement("div");
    msgEl.className = "guardian-msg guardian-msg--bot";

    var av = document.createElement("div");
    av.className = "guardian-msg__avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = "✦";

    var bubble = document.createElement("div");
    bubble.className = "guardian-msg__bubble";

    var caption = document.createElement("p");
    caption.className = "guardian-msg__image-caption";
    caption.textContent = "🗺 Маршрут: " + from + " → " + to;

    var btnRow = document.createElement("div");
    btnRow.className = "guardian-msg__image-btns";

    /* Кнопка на авто */
    var btnCar = document.createElement("a");
    btnCar.className = "guardian-msg__route-btn";
    btnCar.textContent = "🚗 На авто";
    btnCar.href = mapsUrl;
    btnCar.target = "_blank";
    btnCar.rel = "noopener";

    /* Кнопка пешком */
    var btnWalk = document.createElement("a");
    btnWalk.className = "guardian-msg__route-btn";
    btnWalk.textContent = "🚶 Пешком";
    btnWalk.href = mapsUrl.replace("travelmode=driving", "travelmode=walking");
    btnWalk.target = "_blank";
    btnWalk.rel = "noopener";

    /* Кнопка транспорт */
    var btnTransit = document.createElement("a");
    btnTransit.className = "guardian-msg__route-btn";
    btnTransit.textContent = "🚌 Транспорт";
    btnTransit.href = mapsUrl.replace("travelmode=driving", "travelmode=transit");
    btnTransit.target = "_blank";
    btnTransit.rel = "noopener";

    btnRow.appendChild(btnCar);
    btnRow.appendChild(btnWalk);
    btnRow.appendChild(btnTransit);
    bubble.appendChild(caption);
    bubble.appendChild(btnRow);
    msgEl.appendChild(av);
    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    scrollToBottom();
  }

  /* ── Карта через Pollinations (стилизованная) ── */
  function startMap(place) {
    var mapPrompt = place + ", detailed map, cartography style, vintage map illustration, top view";
    startDrawingWithPrompt(mapPrompt, "🗺 " + place);
  }

  /* ── Рисование с готовым английским промптом ── */
  function startDrawingWithPrompt(englishPrompt, subject) {
    var el = createImageBlock(subject);
    generateImage(englishPrompt, el.img, el.caption, subject, el.downloadBtn, el.imageId);
  }

  /* ═══════ СОХРАНЕНИЕ КАРТИНОК В БРАУЗЕРЕ ═══════ */

  var STORAGE_KEY = "guardian_saved_images";
  var MAX_SAVED   = 30;

  function loadSavedImages() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (_) { return []; }
  }

  function persistSavedImages(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
  }

  function saveImage(subject, src, id) {
    var list = loadSavedImages();
    /* Не дублируем */
    if (list.some(function (x) { return x.id === id; })) return;
    list.unshift({ id: id, subject: subject, src: src, ts: Date.now() });
    /* Храним не больше MAX_SAVED */
    if (list.length > MAX_SAVED) list = list.slice(0, MAX_SAVED);
    persistSavedImages(list);
  }

  function deleteSavedImage(id) {
    var list = loadSavedImages().filter(function (x) { return x.id !== id; });
    persistSavedImages(list);
  }

  /* ── Создать DOM-блок картинки (используется и при генерации, и при восстановлении) ── */
  function buildImageCard(subject, src, id, isSaved) {
    var imgMsg = document.createElement("div");
    imgMsg.className = "guardian-msg guardian-msg--bot";
    imgMsg.dataset.imageId = id;

    var av = document.createElement("div");
    av.className = "guardian-msg__avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = "✦";

    var bubble = document.createElement("div");
    bubble.className = "guardian-msg__bubble";

    var caption = document.createElement("p");
    caption.className = "guardian-msg__image-caption";
    caption.textContent = "✦ " + subject;

    var img = document.createElement("img");
    img.className = "guardian-msg__image";
    img.alt = subject;
    if (src) img.src = src;

    var btnRow = document.createElement("div");
    btnRow.className = "guardian-msg__image-btns";

    var downloadBtn = document.createElement("a");
    downloadBtn.className = "guardian-msg__image-download";
    downloadBtn.textContent = "⬇ Скачать";
    downloadBtn.style.display = src ? "inline-flex" : "none";
    if (src) {
      var filename = subject.replace(/[^\u0400-\u04ffa-z0-9\s]/gi, "").trim().slice(0, 40) || "картина";
      downloadBtn.download = filename + ".png";
      downloadBtn.href = src;
    }

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "guardian-msg__image-delete";
    deleteBtn.textContent = isSaved ? "✕ Удалить" : "✕";
    deleteBtn.title = "Удалить картинку";
    deleteBtn.addEventListener("click", function () {
      deleteSavedImage(id);
      imgMsg.remove();
    });

    btnRow.appendChild(downloadBtn);
    btnRow.appendChild(deleteBtn);
    bubble.appendChild(caption);
    bubble.appendChild(img);
    bubble.appendChild(btnRow);
    imgMsg.appendChild(av);
    imgMsg.appendChild(bubble);
    return { el: imgMsg, img: img, caption: caption, downloadBtn: downloadBtn };
  }

  /* ── Восстановить сохранённые картинки при загрузке страницы ── */
  function restoreSavedImages() {
    var list = loadSavedImages();
    if (!list.length) return;

    var divider = document.createElement("p");
    divider.className = "guardian-msg__saved-divider";
    divider.textContent = "✦ Сохранённые картинки";
    messagesEl.insertBefore(divider, messagesEl.firstChild);

    list.slice().reverse().forEach(function (item) {
      var card = buildImageCard(item.subject, item.src, item.id, true);
      messagesEl.insertBefore(card.el, divider.nextSibling);
    });
  }

  /* ── Показать кнопку скачивания и сохранить картинку ── */
  function showDownloadBtn(downloadBtn, img, subject, imageId) {
    var filename = subject.replace(/[^\u0400-\u04ffa-z0-9\s]/gi, "").trim().slice(0, 40) || "картина";
    var finalSrc;

    if (img.src.startsWith("data:")) {
      finalSrc = img.src;
    } else {
      try {
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        finalSrc = canvas.toDataURL("image/png");
      } catch (_) {
        finalSrc = img.src;
        downloadBtn.removeAttribute("download");
        downloadBtn.target = "_blank";
        downloadBtn.textContent = "🔗 Открыть";
      }
    }

    downloadBtn.download = filename + ".png";
    downloadBtn.href = finalSrc;
    downloadBtn.style.display = "inline-flex";

    /* Сохраняем в localStorage чтобы не пропадала при обновлении */
    saveImage(subject, finalSrc.startsWith("data:") ? finalSrc : img.src, imageId);

    scrollToBottom();
  }

  /* ── Попытка через воркер /v1/image (если есть), иначе сразу Pollinations ── */
  function generateImageCF(englishPrompt, img, caption, subject, downloadBtn, imageId, onFail) {
    if (!CF_IMAGE_URL) { onFail(); return; }
    caption.textContent = "Рисую… ✨ (подожди до минуты)";
    var ctrl = new AbortController();
    var to = setTimeout(function () { ctrl.abort(); }, 60000);
    fetch(CF_IMAGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: englishPrompt + ", beautiful art, detailed, soft light" }),
      signal: ctrl.signal
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            var msg = (data && data.error) ? data.error : ("HTTP " + res.status);
            onFail(msg);
            return { _skip: true };
          }
          return data;
        });
      })
      .then(function (data) {
        clearTimeout(to);
        if (data && data._skip) return;
        if (!data || !data.image) { onFail(data && data.error ? data.error : null); return; }
        img.onload  = function () {
          caption.textContent = "✦ " + subject;
          showDownloadBtn(downloadBtn, img, subject, imageId);
        };
        img.onerror = function () { onFail(); };
        img.src = "data:image/png;base64," + data.image;
      })
      .catch(function (err) { clearTimeout(to); onFail(null); });
  }

  /* ── AI Horde (Stable Horde) — бесплатно, без ключей, apikey 0000000000 ── */
  function generateImageHorde(englishPrompt, img, caption, subject, downloadBtn, imageId, onFail) {
    var base = "https://stablehorde.net/api/v2";
    caption.textContent = "Рисую… очередь AI Horde ⏳";
    fetch(base + "/generate/async", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: englishPrompt + ", beautiful art, detailed",
        params: { width: 512, height: 512, steps: 20, n: 1 },
        apikey: "0000000000"
      })
    })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !data.id) { onFail(); return; }
        var id = data.id;
        var deadline = Date.now() + 120000;
        function poll() {
          if (Date.now() > deadline) { onFail(); return; }
          caption.textContent = "Рисую… жду очередь ⏳";
          fetch(base + "/generate/status/" + id)
            .then(function (r) { return r.json(); })
            .then(function (st) {
              if (st.done && st.generations && st.generations[0] && st.generations[0].img) {
                img.onload = function () {
                  caption.textContent = "✦ " + subject;
                  showDownloadBtn(downloadBtn, img, subject, imageId);
                };
                img.onerror = function () { onFail(); };
                img.src = "data:image/png;base64," + st.generations[0].img;
                return;
              }
              if (st.faulted || (st.is_possible === false)) { onFail(); return; }
              setTimeout(poll, 4000);
            })
            .catch(function () { onFail(); });
        }
        setTimeout(poll, 3000);
      })
      .catch(function () { onFail(); });
  }

  /* ── Запасной вариант: Pollinations.ai через img.src (gen.pollinations.ai + image.pollinations.ai) ── */
  function generateImagePollinations(englishPrompt, img, caption, subject, downloadBtn, imageId, lastError) {
    var seed = Math.floor(Math.random() * 99999);
    var enc = encodeURIComponent(englishPrompt);
    var encFull = encodeURIComponent(englishPrompt + ", beautiful art, detailed, soft light");

    var encCactus = encodeURIComponent(englishPrompt + ", botanical, realistic, not cartoon");
    var urls = [
      "https://gen.pollinations.ai/image/" + encCactus + "?model=flux&width=768&height=512&seed=" + seed,
      "https://gen.pollinations.ai/image/" + enc + "?model=flux&width=512&height=512&seed=" + seed,
      "https://image.pollinations.ai/prompt/" + encCactus + "?width=768&height=512&seed=" + seed + "&nologo=true",
      "https://image.pollinations.ai/prompt/" + encFull + "?width=768&height=512&seed=" + seed + "&model=flux&nologo=true",
      "https://image.pollinations.ai/prompt/" + enc + "?width=512&height=512&seed=" + seed + "&model=turbo",
      "https://image.pollinations.ai/prompt/" + enc + "?width=512&height=512&seed=" + seed,
      "https://image.pollinations.ai/prompt/" + enc + "?width=512&height=512"
    ];

    var attempt = 0;
    function tryNext() {
      if (attempt >= urls.length) {
        var baseMsg = "Сервис рисования сейчас недоступен. Попробуй позже.";
        caption.textContent = lastError ? baseMsg + " (" + lastError + ")" : baseMsg + " — он восстановится.";
        caption.classList.add("guardian-msg__image-caption--error");
        return;
      }
      var url = urls[attempt++];
      caption.classList.remove("guardian-msg__image-caption--error");
      caption.textContent = "Рисую… ⏳" + (attempt > 1 ? " (вариант " + attempt + ")" : "");
      img.src = url;
    }

    img.onload  = function () {
      caption.classList.remove("guardian-msg__image-caption--error");
      caption.textContent = "✦ " + subject;
      showDownloadBtn(downloadBtn, img, subject, imageId);
    };
    img.onerror = function () { setTimeout(tryNext, 2000); };
    tryNext();
  }

  /* ── Основная точка входа: воркер → AI Horde (бесплатно) → Pollinations ── */
  function generateImage(englishPrompt, img, caption, subject, downloadBtn, imageId) {
    var cactusHint = " cactus succulent plant, green stem, spines, areoles, botanical illustration, realistic, not cartoon";
    if (!/cactus|succulent|botanical|plant|cacti|mammillaria|opuntia|echinocactus|asclepiad|desert|spines|колюч/i.test(englishPrompt)) {
      englishPrompt = (englishPrompt + cactusHint).trim();
    }
    generateImageCF(englishPrompt, img, caption, subject, downloadBtn, imageId, function (workerErr) {
      generateImageHorde(englishPrompt, img, caption, subject, downloadBtn, imageId, function (hordeErr) {
        generateImagePollinations(englishPrompt, img, caption, subject, downloadBtn, imageId, workerErr || hordeErr);
      });
    });
  }

  /* ── Создать блок с картинкой в чате (во время генерации) ── */
  function createImageBlock(subject) {
    var imageId = "img_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
    var card = buildImageCard(subject, null, imageId, false);
    card.caption.textContent = "Перевожу… ⏳";
    card.downloadBtn.style.display = "none";
    messagesEl.appendChild(card.el);
    scrollToBottom();
    return { img: card.img, caption: card.caption, downloadBtn: card.downloadBtn, imageId: imageId };
  }

  /* ── Запустить рисование по теме (переводим → рисуем) ── */
  function startDrawing(subject) {
    var el = createImageBlock(subject);
    callAIWithPrompt(
      "Translate to a short English image prompt (3-8 words). Theme: cactus, succulent, or desert plant. Return ONLY the prompt, no quotes.",
      subject, null,
      function (englishPrompt) {
        englishPrompt = englishPrompt.trim().replace(/^["']|["']$/g, "");
        generateImage(englishPrompt, el.img, el.caption, subject, el.downloadBtn, el.imageId);
      },
      function () {
        generateImage(subject, el.img, el.caption, subject, el.downloadBtn, el.imageId);
      }
    );
  }

  /* ── «Не рисуй» / «хватит картинок» → режим «только по просьбе» ── */
  var NO_IMAGES_RE = /^(не рисуй|хватит картинок|не показывай картинки|без картинок|не выдавай картинки|картинки не надо|больше не рисуй)\s*[.!]?$/i;
  function maybeDisableAutoImages(userText) {
    if (!NO_IMAGES_RE.test(userText.trim())) return false;
    imagesMode = "request";
    localStorage.setItem(IMAGES_STORAGE_KEY, imagesMode);
    updateImagesUI();
    return true;
  }

  /* ── Проверяем сообщение пользователя на все команды ── */
  function maybeShowImage(userText) {
    /* Маршрут */
    var mRoute = userText.match(ROUTE_RE);
    if (mRoute && mRoute[1] && mRoute[2]) {
      showRoute(mRoute[1].trim(), mRoute[2].trim());
      return;
    }

    /* Карта */
    var mMap = userText.match(MAP_RE);
    if (mMap) {
      var place = userText.slice(userText.indexOf(mMap[0]) + mMap[0].length).trim();
      if (place) { startMap(place); return; }
    }

    /* Картинки из книги Кактусология */
    if (BOOK_RE.test(userText)) {
      startFindingFromBook();
      return;
    }

    /* Поиск реального фото */
    var mFind = userText.match(FIND_RE);
    if (mFind) {
      var subject = userText.slice(userText.indexOf(mFind[0]) + mFind[0].length).trim();
      if (subject) { startFinding(subject); return; }
    }

    /* Рисование */
    var mDraw = userText.match(IMG_RE);
    if (mDraw) {
      var drawSubject = userText.slice(userText.indexOf(mDraw[0]) + mDraw[0].length).trim();
      if (drawSubject) startDrawing(drawSubject);
    }
  }

  /* ── Кнопка "Открыть Творческую комнату" ── */
  function showDrawRoomBtn() {
    var msgEl = document.createElement("div");
    msgEl.className = "guardian-msg guardian-msg--bot";

    var av = document.createElement("div");
    av.className = "guardian-msg__avatar";
    av.setAttribute("aria-hidden", "true");
    av.textContent = "✦";

    var bubble = document.createElement("div");
    bubble.className = "guardian-msg__bubble";

    var caption = document.createElement("p");
    caption.className = "guardian-msg__image-caption";
    caption.textContent = "✦ Творческая комната — холст, кисти, краски";

    var btn = document.createElement("a");
    btn.className = "guardian-msg__draw-room-btn";
    btn.href = "draw.html";
    btn.textContent = "🎨 Открыть Творческую комнату";

    var hint = document.createElement("p");
    hint.className = "guardian-msg__draw-room-hint";
    hint.textContent = "Рисуй кистью, выбирай цвета, сохраняй свои работы";

    bubble.appendChild(caption);
    bubble.appendChild(btn);
    bubble.appendChild(hint);
    msgEl.appendChild(av);
    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    scrollToBottom();
  }

  /* ── Проверяем ответ бота: картинка или приглашение в мастерскую ── */
  function maybeShowImageFromBot(botText) {
    /* Приглашение в творческую комнату */
    if (/\[ОТКРЫТЬ_МАСТЕРСКУЮ\]/.test(botText)) {
      showDrawRoomBtn();
    }

    /* Самурай рисует сам — только если картинки «по желанию» */
    if (imagesMode !== "auto") return;
    var m = botText.replace(/\[ОТКРЫТЬ_МАСТЕРСКУЮ\]/g, "").match(/нарисуй\s+([^\n.!?]{2,80})/i);
    if (!m) return;
    var subject = m[1].trim().replace(/[«»"']+/g, "");
    if (!subject) return;
    startDrawing(subject);
  }

  /* ═══════ ОТПРАВКА ═══════ */

  function setThinking(on) {
    document.body.classList.toggle("guardian-page--thinking", on);
  }

  function finishLoading() {
    isLoading = false;
    sendBtn.disabled = false;
    setThinking(false);
  }

  function sendDuo(userText) {
    showTyping("artist", "✦", "Художник думает…");
    callAIWithPrompt(ARTIST_DUO, userText, null,
      function (artistReply) {
        hideTyping();
        appendMessageStyled("model", artistReply, "artist", "✦");
        history.push({ role: "model", text: artistReply });
        speak(artistReply);
        maybeShowImage(userText);
        maybeShowImageFromBot(artistReply);

        showTyping("linguist", "語", "Сэнсэй думает…");
        callAIWithPrompt(LINGUIST_DUO, userText, artistReply,
          function (linguistReply) {
            hideTyping();
            finishLoading();
            appendMessageStyled("model", linguistReply, "linguist", "語");
            history.push({ role: "model", text: linguistReply });
            setTimeout(function () { speak(linguistReply); }, 800);
          },
          function (errMsg) { hideTyping(); finishLoading(); showError(errMsg); }
        );
      },
      function (errMsg) { hideTyping(); finishLoading(); showError(errMsg); }
    );
  }

  function sendTrio(userText) {
    showTyping("artist", "✦", "Художник думает…");
    callAIWithPrompt(ARTIST_DUO, userText, null,
      function (artistReply) {
        hideTyping();
        appendMessageStyled("model", artistReply, "artist", "✦");
        history.push({ role: "model", text: artistReply });
        speak(artistReply);
        maybeShowImage(userText);
        maybeShowImageFromBot(artistReply);

        showTyping("linguist", "語", "Сэнсэй думает…");
        callAIWithPrompt(LINGUIST_DUO, userText, artistReply,
          function (linguistReply) {
            hideTyping();
            appendMessageStyled("model", linguistReply, "linguist", "語");
            history.push({ role: "model", text: linguistReply });
            setTimeout(function () { speak(linguistReply); }, 800);

            /* Психолог — последний, видит контекст обоих */
            var context = "Художник сказал: «" + artistReply + "». Сэнсэй сказал: «" + linguistReply + "».";
            showTyping("psychologist", "♥", "Психолог думает…");
            callAIWithPrompt(PSYCHOLOGIST_DUO, userText, context,
              function (psychReply) {
                hideTyping();
                finishLoading();
                appendMessageStyled("model", psychReply, "psychologist", "♥");
                history.push({ role: "model", text: psychReply });
                setTimeout(function () { speak(psychReply); }, 1600);
              },
              function (errMsg) { hideTyping(); finishLoading(); showError(errMsg); }
            );
          },
          function (errMsg) { hideTyping(); finishLoading(); showError(errMsg); }
        );
      },
      function (errMsg) { hideTyping(); finishLoading(); showError(errMsg); }
    );
  }

  function sendMessage() {
    if (isLoading) return;
    var text = (inputEl.value || "").trim();
    var hasImage = attachedImage && attachedImage.base64;

    if (!text && !hasImage) return;

    if (!text && hasImage) text = "Что на этом фото?";

    inputEl.value = "";
    inputEl.style.height = "auto";
    isLoading = true;
    sendBtn.disabled = true;
    setThinking(true);

    /* Отправка с фото: только через воркер /v1/chat-image */
    if (hasImage) {
      if (!workerBase) {
        finishLoading();
        showError("Чтобы отправить фото Собеседнику, укажи воркер (workerUrl) в config.js.");
        return;
      }
      var imgToSend = attachedImage;
      clearAttachedImage();
      appendMessage("user", text, imgToSend.dataUrl);
      history.push({ role: "user", text: text });
      showTyping();
      fetch(workerBase + "/v1/chat-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          image: imgToSend.base64,
          mime: imgToSend.mime,
        }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          hideTyping();
          finishLoading();
          var reply = (data && data.reply) ? data.reply : (data && data.error) ? data.error : "Не удалось получить ответ.";
          appendMessage("model", reply);
          history.push({ role: "model", text: reply });
          speak(reply);
        })
        .catch(function () {
          hideTyping();
          finishLoading();
          showError("Сервер не ответил. Попробуй ещё раз.");
        });
      return;
    }

    appendMessage("user", text);
    history.push({ role: "user", text: text });

    /* «Хватит картинок» / «не рисуй» — переключаем на «только по просьбе» */
    if (maybeDisableAutoImages(text)) {
      appendMessageStyled("model", "Хорошо. Буду рисовать только когда попросишь — напиши «нарисуй кактус…» или «найди фото …».", null, "✦");
      history.push({ role: "model", text: "Хорошо. Буду рисовать только когда попросишь." });
      finishLoading();
      return;
    }

    if (getMode() === "duo")  { sendDuo(text);  return; }
    if (getMode() === "trio") { sendTrio(text); return; }

    showTyping();
    callAI(
      text,
      function (reply) {
        hideTyping();
        finishLoading();
        appendMessage("model", reply);
        history.push({ role: "model", text: reply });
        speak(reply);
        maybeShowImage(text);
        maybeShowImageFromBot(reply);
      },
      function (errMsg) {
        hideTyping();
        finishLoading();
        showError(errMsg);
      }
    );
  }

  /* ═══════ ОБРАБОТЧИКИ ═══════ */

  sendBtn.addEventListener("click", sendMessage);

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* Переключение режима */
  var modeBtns = document.querySelectorAll(".guardian-mode__btn");
  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) {
        b.classList.remove("guardian-mode__btn--active");
      });
      btn.classList.add("guardian-mode__btn--active");
    });
  });

  /* Плавное изменение высоты textarea */
  inputEl.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 220) + "px";
  });

  /* Восстанавливаем сохранённые картинки при загрузке */
  restoreSavedImages();
})();
