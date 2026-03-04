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

  const I18N = {
    brand: { ru: "🌵 Кактусярий", en: "🌵 Кактусярий", jp: "🌵 Кактусярий", it: "🌵 Кактусярий", zh: "🌵 Кактусярий", es: "🌵 Кактусярий", de: "🌵 Кактусярий", fr: "🌵 Кактусярий", he: "🌵 Кактусярий" },
    intro_btn_zastavka: { ru: "Заставка", en: "Screensaver", jp: "スクリーンセーバー", it: "Salvaschermo", zh: "屏保", es: "Salvapantallas", de: "Bildschirmschoner", fr: "Écran de veille", he: "מסך נעילה" },
    intro_btn_site: { ru: "Сайт", en: "Site", jp: "サイト", it: "Sito", zh: "网站", es: "Sitio", de: "Seite", fr: "Site", he: "אתר" },
    intro_aria_zastavka: { ru: "Смотреть заставку", en: "Watch screensaver", jp: "スクリーンセーバーを見る", it: "Guarda salvaschermo", zh: "观看屏保", es: "Ver salvapantallas", de: "Bildschirmschoner ansehen", fr: "Voir l'écran de veille", he: "צפה במסך נעילה" },
    intro_aria_site: { ru: "Перейти на сайт", en: "Go to site", jp: "サイトへ", it: "Vai al sito", zh: "进入网站", es: "Ir al sitio", de: "Zur Seite", fr: "Aller au site", he: "עבור לאתר" },
    nav_gallery: { ru: "Галерея", en: "Gallery", jp: "ギャラリー", it: "Galleria", zh: "画廊", es: "Galería", de: "Galerie", fr: "Galerie", he: "גלריה" },
    nav_stories: { ru: "Рассказы", en: "Stories", jp: "ストーリー", it: "Racconti", zh: "故事", es: "Relatos", de: "Geschichten", fr: "Histoires", he: "סיפורים" },
    nav_about: { ru: "Обо мне", en: "About me", jp: "自己紹介", it: "Su di me", zh: "关于我", es: "Sobre mí", de: "Über mich", fr: "À propos", he: "עלי" },
    footer_studio: { ru: "Кактусярий ©", en: "Кактусярий ©", jp: "Кактусярий ©", it: "Кактусярий ©", zh: "Кактусярий ©", es: "Кактусярий ©", de: "Кактусярий ©", fr: "Кактусярий ©", he: "Кактусярий ©" },
    footer_derev: { ru: "Сайт сделан в Derev Studio", en: "Site by Derev Studio", jp: "Derev Studio 制作", it: "Sito by Derev Studio", zh: "Derev Studio 制作", es: "Sitio por Derev Studio", de: "Seite von Derev Studio", fr: "Site par Derev Studio", he: "האתר — Derev Studio" },
    footer_why: { ru: "Почему «Кактусярий»? В детстве у меня была коллекция кактусов, и мама называла её Кактусярий — мы ездили с ней по разным городам, в ботанические сады, к коллекционерам, общались, удивлялись и покупали кактусы.", en: "Why «Кактусярий»? As a child I had a cactus collection, and my mom called it Cactusarium — we traveled with her to different cities, botanical gardens, visited collectors, met people, were amazed and bought cacti.", jp: "なぜ「Кактусярий」？子供の頃、サボテンコレクションがあり、母がそう呼んでいました。母と一緒にいろんな街へ、植物園やコレクターを訪ね、交流し、サボテンを買いました。", it: "Perché «Кактусярий»? Da bambino avevo una collezione di cactus e mia mamma la chiamava così — viaggiavamo insieme per città, orti botanici, collezionisti, ci emozionavamo e compravamo cactus.", zh: "为什么叫「Кактусярий」？小时候我有一批仙人掌收藏，妈妈叫它「仙人掌园」——我们一起去过很多城市、植物园、收藏家，交流、惊叹、买仙人掌。", es: "¿Por qué «Кактусярий»? De niño tenía una colección de cactus y mi madre la llamaba así — viajábamos juntos a distintas ciudades, jardines botánicos, coleccionistas, nos asombramos y comprábamos cactus.", de: "Warum «Кактусярий»? Als Kind hatte ich eine Kakteen-Sammlung, und meine Mutter nannte sie so — wir reisten mit ihr in verschiedene Städte, in Botanische Gärten, zu Sammlern, staunten und kauften Kakteen.", fr: "Pourquoi « Кактусярий » ? Enfant, j'avais une collection de cactus et ma mère l'appelait ainsi — nous voyageions avec elle dans différentes villes, jardins botaniques, chez des collectionneurs, nous émerveillions et achetions des cactus.", he: "למה «Кактусярий»? כילד הייתה לי אוסף קקטי, ואמא קראה לו כך — נסענו איתה לערים שונות, לגנים בוטניים, לאספנים, התפעלנו וקנינו קקטי." },
    footer_why_saved: { ru: "Это название я сохранил для сайта.", en: "I kept that name for the site.", jp: "その名前をサイトに残しました。", it: "Ho conservato questo nome per il sito.", zh: "我把这个名字留给了网站。", es: "Guardé ese nombre para el sitio.", de: "Diesen Namen habe ich für die Seite behalten.", fr: "J'ai gardé ce nom pour le site.", he: "שמרתי את השם לאתר." },
    gallery_heading: { ru: "Галерея", en: "Gallery", jp: "ギャラリー", it: "Galleria", zh: "画廊", es: "Galería", de: "Galerie", fr: "Galerie", he: "גלריה" },
    gallery_heading_accent: { ru: "фото и работы", en: "photos & works", jp: "写真と作品", it: "foto e opere", zh: "照片与作品", es: "fotos y obras", de: "Fotos & Werke", fr: "photos et œuvres", he: "תמונות ויצירות" },
    gallery_empty: { ru: "Пока нет ни одной работы. Как только JSON с рисунками появится в GitHub, этот блок автоматически превратится в интерактивную галерею.", en: "No artworks yet. Once the JSON with drawings appears on GitHub, this block will become an interactive gallery.", jp: "まだ作品がありません。", it: "Nessuna opera ancora.", zh: "暂无作品。", es: "Aún no hay obras.", de: "Noch keine Werke.", fr: "Pas encore d'œuvres.", he: "אין עדיין יצירות." },
    gallery_prev: { ru: "Предыдущий рисунок", en: "Previous", jp: "前へ", it: "Precedente", zh: "上一张", es: "Anterior", de: "Vorheriges", fr: "Précédent", he: "הקודם" },
    gallery_next: { ru: "Следующий рисунок", en: "Next", jp: "次へ", it: "Successivo", zh: "下一张", es: "Siguiente", de: "Nächstes", fr: "Suivant", he: "הבא" },
    lightbox_aria: { ru: "Просмотр в полном размере", en: "Full size view", jp: "全画面表示", it: "Vista a grandezza intera", zh: "全屏查看", es: "Vista a tamaño completo", de: "Vollansicht", fr: "Vue pleine taille", he: "תצוגה מלאה" },
    lightbox_close: { ru: "Закрыть", en: "Close", jp: "閉じる", it: "Chiudi", zh: "关闭", es: "Cerrar", de: "Schließen", fr: "Fermer", he: "סגור" },
    lightbox_prev: { ru: "Предыдущее", en: "Previous", jp: "前へ", it: "Precedente", zh: "上一张", es: "Anterior", de: "Vorheriges", fr: "Précédent", he: "הקודם" },
    lightbox_next: { ru: "Следующее", en: "Next", jp: "次へ", it: "Successivo", zh: "下一张", es: "Siguiente", de: "Nächstes", fr: "Suivant", he: "הבא" },
    about_title: { ru: "Обо мне", en: "About me", jp: "自己紹介", it: "Su di me", zh: "关于我", es: "Sobre mí", de: "Über mich", fr: "À propos", he: "עלי" },
    about_text: { ru: "Кактусы, книги, фотография — то, чем живу. Здесь собраны заметки, снимки и мысли. Пространство для души и творчества.", en: "Cacti, books, photography — what I live by. Here are notes, photos and thoughts. A space for the soul and creativity.", jp: "サボテン、本、写真 — 私の生きがい。", it: "Cactus, libri, fotografia — ciò che amo.", zh: "仙人掌、书籍、摄影——我的生活。", es: "Cactus, libros, fotografía — lo que me inspira.", de: "Kakteen, Bücher, Fotografie — wofür ich lebe.", fr: "Cactus, livres, photo — ce qui me fait vivre.", he: "קטי, ספרים, צילום — מה שאני חי בו." },
    petals_label: { ru: "Лепестки", en: "Petals", jp: "花びら", it: "Petali", zh: "花瓣", es: "Pétalos", de: "Blütenblätter", fr: "Pétales", he: "עלי כותרת" },
    wind_label: { ru: "Ветер", en: "Wind", jp: "風", it: "Vento", zh: "风", es: "Viento", de: "Wind", fr: "Vent", he: "רוח" },
    music_label: { ru: "Музыка", en: "Music", jp: "音楽", it: "Musica", zh: "音乐", es: "Música", de: "Musik", fr: "Musique", he: "מוזיקה" },
    track: { ru: "Трек", en: "Track", jp: "トラック", it: "Traccia", zh: "曲目", es: "Pista", de: "Track", fr: "Piste", he: "מסלול" },
    track_1: { ru: "Трек 1", en: "Track 1", jp: "トラック1", it: "Traccia 1", zh: "曲目 1", es: "Pista 1", de: "Track 1", fr: "Piste 1", he: "מסלול 1" },
    track_2: { ru: "Трек 2", en: "Track 2", jp: "トラック2", it: "Traccia 2", zh: "曲目 2", es: "Pista 2", de: "Track 2", fr: "Piste 2", he: "מסלול 2" },
    sound: { ru: "Звук", en: "Sound", jp: "サウンド", it: "Suono", zh: "声音", es: "Sonido", de: "Sound", fr: "Son", he: "צליל" },
    volume: { ru: "Громкость", en: "Volume", jp: "音量", it: "Volume", zh: "音量", es: "Volumen", de: "Lautstärke", fr: "Volume", he: "עוצמה" },
    on: { ru: "Вкл", en: "On", jp: "オン", it: "On", zh: "开", es: "On", de: "An", fr: "On", he: "פעיל" },
    off: { ru: "Выкл", en: "Off", jp: "オフ", it: "Off", zh: "关", es: "Off", de: "Aus", fr: "Off", he: "כבוי" },
    petals_aria: { ru: "Лепестки и ветер", en: "Petals and wind", jp: "花びらと風", it: "Petali e vento", zh: "花瓣与风", es: "Pétalos y viento", de: "Blütenblätter und Wind", fr: "Pétales et vent", he: "עלי כותרת ורוח" },
    music_aria: { ru: "Музыка", en: "Music", jp: "音楽", it: "Musica", zh: "音乐", es: "Música", de: "Musik", fr: "Musique", he: "מוזיקה" },
    volume_wind_aria: { ru: "Громкость ветра", en: "Wind volume", jp: "風の音量", it: "Volume vento", zh: "风声音量", es: "Volumen del viento", de: "Windlautstärke", fr: "Volume du vent", he: "עוצמת רוח" },
    volume_music_aria: { ru: "Громкость музыки", en: "Music volume", jp: "音楽の音量", it: "Volume musica", zh: "音乐音量", es: "Volumen de música", de: "Musiklautstärke", fr: "Volume de la musique", he: "עוצמת מוזיקה" },
    turn_on_music: { ru: "Включить музыку", en: "Turn on music", jp: "音楽をオン", it: "Accendi musica", zh: "打开音乐", es: "Encender música", de: "Musik einschalten", fr: "Activer la musique", he: "הפעל מוזיקה" },
    turn_off_music: { ru: "Выключить музыку", en: "Turn off music", jp: "音楽をオフ", it: "Spegni musica", zh: "关闭音乐", es: "Apagar música", de: "Musik ausschalten", fr: "Désactiver la musique", he: "כבה מוזיקה" },
    more_petals: { ru: "Больше", en: "More", jp: "増やす", it: "Più", zh: "更多", es: "Más", de: "Mehr", fr: "Plus", he: "עוד" },
    less_petals: { ru: "Меньше", en: "Less", jp: "減らす", it: "Meno", zh: "更少", es: "Menos", de: "Weniger", fr: "Moins", he: "פחות" },
    fuji_magic_aria: { ru: "Магия Fuji: лепестки, звуки", en: "Fuji magic: petals, sounds", jp: "富士マジック: 花びら、音", it: "Magia Fuji: petali, suoni", zh: "富士魔法：花瓣与声音", es: "Magia Fuji: pétalos, sonidos", de: "Fuji-Magie: Blütenblätter, Klänge", fr: "Magie Fuji : pétales, sons", he: "קסם פוג'י: עלי כותרת, צלילים" },
    video_not_supported: { ru: "Ваш браузер не поддерживает воспроизведение видео.", en: "Your browser does not support video playback.", jp: "お使いのブラウザは動画再生に対応していません。", it: "Il browser non supporta la riproduzione video.", zh: "您的浏览器不支持视频播放。", es: "Tu navegador no soporta la reproducción de video.", de: "Ihr Browser unterstützt keine Videowiedergabe.", fr: "Votre navigateur ne prend pas en charge la lecture vidéo.", he: "הדפדפן שלך לא תומך בהשמעת וידאו." },
    stories_back: { ru: "← На главную", en: "← Back to main", jp: "← メインへ", it: "← Torna alla home", zh: "← 返回主页", es: "← Volver al inicio", de: "← Zur Startseite", fr: "← Retour à l'accueil", he: "← לדף הראשי" },
    stories_loading: { ru: "Загрузка рассказов…", en: "Loading stories…", jp: "ストーリーを読み込み中…", it: "Caricamento racconti…", zh: "加载故事中…", es: "Cargando relatos…", de: "Geschichten werden geladen…", fr: "Chargement des histoires…", he: "טוען סיפורים…" },
    stories_no: { ru: "Пока нет рассказов.", en: "No stories yet.", jp: "まだストーリーがありません。", it: "Nessun racconto ancora.", zh: "暂无故事。", es: "Aún no hay relatos.", de: "Noch keine Geschichten.", fr: "Pas encore d'histoires.", he: "אין עדיין סיפורים." },
    stories_error: { ru: "Не удалось загрузить рассказы.", en: "Failed to load stories.", jp: "ストーリーの読み込みに失敗しました。", it: "Impossibile caricare i racconti.", zh: "加载故事失败。", es: "Error al cargar relatos.", de: "Geschichten konnten nicht geladen werden.", fr: "Échec du chargement des histoires.", he: "טעינת הסיפורים נכשלה." },
    stories_nav_main: { ru: "На главную", en: "To main", jp: "メインへ", it: "Alla home", zh: "回主页", es: "Al inicio", de: "Zur Startseite", fr: "À l'accueil", he: "לדף הראשי" },
    stories_nav_start: { ru: "На стартовую", en: "To start", jp: "スタートへ", it: "Alla pagina iniziale", zh: "到启动页", es: "Al inicio", de: "Zur Startseite", fr: "À la page d'accueil", he: "לעמוד הפתיחה" },
    derev_p1: { ru: "Здесь — моё пространство: кактусы, книги, фотография. Всю жизнь увлекаюсь коллекционированием и съёмкой. Пишу книги, снимаю природу и людей. Этот сайт — место, где всё это встречается.", en: "This is my space: cacti, books, photography. I've been collecting and shooting all my life. I write books, photograph nature and people. This site is where it all comes together.", jp: "ここは私の空間 — サボテン、本、写真。", it: "Qui è il mio spazio: cactus, libri, fotografia.", zh: "这里是我的空间：仙人掌、书籍、摄影。", es: "Aquí está mi espacio: cactus, libros, fotografía.", de: "Hier ist mein Raum: Kakteen, Bücher, Fotografie.", fr: "Ici, mon espace : cactus, livres, photographie.", he: "כאן המרחב שלי: קקטי, ספרים, צילום." },
    derev_p2: { ru: "Надеюсь, гостям здесь будет уютно. Заходите в галерею, почитайте заметки, отдохните в комнате отдыха или поболтайте с Хранителем.", en: "I hope guests will feel at home here. Browse the gallery, read the notes, relax in the rest room or chat with the Guardian.", jp: "訪れてくれた方に居心地よく過ごしてもらえたら。", it: "Spero che gli ospiti si sentano a casa.", zh: "希望访客在这里感到舒适。", es: "Espero que los visitantes se sientan a gusto.", de: "Ich hoffe, Gäste fühlen sich hier wohl.", fr: "J'espère que les visiteurs s'y sentiront bien.", he: "מקווה שאורחים ירגישו כאן בנוח." },
    derev_sign: { ru: "С благодарностью и уважением,", en: "With gratitude and respect,", jp: "感謝と敬意を込めて、", it: "Con gratitudine e rispetto,", zh: "谨致谢意与敬意，", es: "Con gratitud y respeto,", de: "Mit Dankbarkeit und Respekt,", fr: "Avec gratitude et respect,", he: "בתודה ובכבוד," },
    derev_back: { ru: "На главную", en: "Back to main", jp: "メインへ", it: "Torna alla home", zh: "返回主页", es: "Volver al inicio", de: "Zur Startseite", fr: "Retour à l'accueil", he: "לדף הראשי" },
    globe_aria: { ru: "Выбор языка", en: "Choose language", jp: "言語を選択", it: "Scegli lingua", zh: "选择语言", es: "Elegir idioma", de: "Sprache wählen", fr: "Choisir la langue", he: "בחירת שפה" },

    nav_guardian: { ru: "✦ Колючий Собеседник", en: "✦ Cactus Companion", jp: "✦ 守護者", it: "✦ Compagno", zh: "✦ 守护者", es: "✦ Compañero", de: "✦ Begleiter", fr: "✦ Compagnon", he: "✦ שומר" },
    guardian_back: { ru: "← На главную", en: "← Back to main", jp: "← メインへ", it: "← Torna alla home", zh: "← 返回主页", es: "← Volver al inicio", de: "← Zur Startseite", fr: "← Retour à l'accueil", he: "← לדף הראשי" },
    guardian_title: { ru: "Колючий Собеседник", en: "Cactus Companion", jp: "守護者", it: "Compagno cactus", zh: "守护者", es: "Compañero cactus", de: "Kaktus-Begleiter", fr: "Compagnon cactus", he: "שומר" },
    guardian_subtitle: { ru: "Собеседник знает книгу Кактусология, подскажет вид и ареал, маршрут до места произрастания. Разговор о кактусах, языках, творчестве.", en: "The companion knows the Cactology book, can suggest species and range, route to habitat. Chat about cacti, languages, creativity.", jp: "サポート、アドバイス、会話。守護者はサイトのストーリーと本を知り、創作・言語をサポートします。", it: "Il compagno conosce il libro Cactologia, specie e areali. Conversazione su cactus, lingue, creatività.", zh: "守护者了解网站故事和书籍，支持创作、语言。", es: "El compañero conoce el libro Cactología, especies y área. Charla sobre cactus, idiomas, creatividad.", de: "Der Begleiter kennt das Buch Kaktologie, Arten und Verbreitung. Gespräch über Kakteen, Sprachen, Kreativität.", fr: "Le compagnon connaît le livre Cactologie, espèces et aire. Conversation sur les cactus, langues, créativité.", he: "השומר מכיר את הסיפורים והספר באתר." },
    guardian_mode: { ru: "Режим:", en: "Mode:", jp: "モード：", it: "Modalità:", zh: "模式：", es: "Modo:", de: "Modus:", fr: "Mode :", he: "מצב:" },
    guardian_mode_assistant: { ru: "Разговор", en: "Chat", jp: "会話", it: "Chat", zh: "聊天", es: "Charla", de: "Gespräch", fr: "Conversation", he: "שיחה" },
    guardian_mode_children: { ru: "Для детей", en: "For children", jp: "子ども向け", it: "Per bambini", zh: "儿童模式", es: "Para niños", de: "Für Kinder", fr: "Pour enfants", he: "לילדים" },
    guardian_mode_language: { ru: "Языки", en: "Languages", jp: "言語", it: "Lingue", zh: "语言", es: "Idiomas", de: "Sprachen", fr: "Langues", he: "שפות" },
    guardian_mode_art: { ru: "Рисование", en: "Drawing", jp: "絵", it: "Disegno", zh: "绘画", es: "Dibujo", de: "Zeichnen", fr: "Dessin", he: "ציור" },
    guardian_mode_psychology: { ru: "Душа", en: "Soul", jp: "心", it: "Anima", zh: "心灵", es: "Alma", de: "Seele", fr: "Âme", he: "נשמה" },
    guardian_role_lang: { ru: "Языки", en: "Languages", jp: "言語", it: "Lingue", zh: "语言", es: "Idiomas", de: "Sprachen", fr: "Langues", he: "שפות" },
    guardian_role_art: { ru: "Рисование", en: "Drawing", jp: "絵", it: "Arte", zh: "绘画", es: "Arte", de: "Kunst", fr: "Art", he: "ציור" },
    guardian_role_soul: { ru: "Душа", en: "Soul", jp: "心", it: "Anima", zh: "心灵", es: "Alma", de: "Seele", fr: "Âme", he: "נשמה" },
    guardian_welcome: { ru: "Здравствуй. Я — Колючий Собеседник. Знаю книгу Кактусология, подскажу вид, ареал, маршрут до места произрастания. Поговорим о кактусах, языках, творчестве. Просто напиши — я здесь.", en: "Hello. I am the Cactus Companion. I know the Cactology book, can suggest species, range, route to habitat. Let's talk about cacti, languages, creativity. Just write — I'm here.", jp: "こんにちは。守護者です。サイトの本とストーリーを知っています。書いてください。", it: "Salve. Sono il Compagno cactus. Conosco il libro Cactologia. Parliamo di cactus, lingue, creatività. Scrivi — sono qui.", zh: "你好。我是守护者。了解网站书籍。我们可以聊创作、语言。写信给我。", es: "Hola. Soy el Compañero cactus. Conozco el libro Cactología. Hablemos de cactus, idiomas, creatividad. Escribe — estoy aquí.", de: "Hallo. Ich bin der Kaktus-Begleiter. Kenn das Buch Kaktologie. Sprechen über Kakteen, Sprachen, Kreativität. Schreib — ich bin hier.", fr: "Bonjour. Je suis le Compagnon cactus. Je connais le livre Cactologie. Parlons cactus, langues, créativité. Écris — je suis là.", he: "שלום. אני השומר. מכיר את הספר והסיפורים. כתבי — אני כאן." },
    guardian_placeholder: { ru: "Напиши Собеседнику…", en: "Write to the Companion…", jp: "守護者へ書く…", it: "Scrivi al Compagno…", zh: "写信给守护者…", es: "Escribe al Compañero…", de: "Schreib dem Begleiter…", fr: "Écris au Compagnon…", he: "כתוב לשומר…" },
    guardian_hint: { ru: "Собеседник помнит контекст, знает книгу Кактусология. Картинки — только кактусы и суккуленты.", en: "The Companion remembers the conversation and knows the Cactology book. Images: cacti and succulents only.", jp: "守護者は会話と本を覚えています。", it: "Il Compagno ricorda la conversazione e il libro Cactologia.", zh: "守护者记得对话和书籍内容。", es: "El Compañero recuerda la conversación y el libro Cactología.", de: "Der Begleiter erinnert sich an das Gespräch und das Buch Kaktologie.", fr: "Le Compagnon se souvient de la conversation et du livre Cactologie.", he: "השומר זוכר את השיחה והספר." },

    story_s1771904883169_title: { ru: "Зелёный вечер", en: "Green Evening", jp: "緑の夕暮れ", it: "Serata verde", zh: "绿意黄昏", es: "Atardecer verde", de: "Grüner Abend", fr: "Soirée verte", he: "ערב ירוק" },
    story_s1771904883169_content: { ru: "Бывают мгновения, когда мир вокруг затихает, и остаётся только шепот воды, крик улетающих птиц и мягкое тепло уходящего солнца. В такие часы природа раскрывается по-особому.\n\n«Зелёный вечер» — не просто пейзаж, это застывшее мгновение гармонии. Солнечные блики на воде, прохладный воздух, высокое небо. Каждый такой вечер напоминает о красоте нашего мира и о том, как важно иногда остановиться и просто смотреть вокруг.\n\nПусть вдохновение будет безграничным, как небо на закате. Путь созидания и красоты — он для каждого, кто умеет видеть.", en: "There are moments when the world falls silent, and all that remains is the whisper of water, the call of birds, and the soft warmth of the setting sun. In such hours nature opens up in a special way.\n\n«Green Evening» is not just a landscape; it is a frozen moment of harmony. Sunbeams on the water, cool air, the high sky. Every such evening reminds us of the beauty of our world and how important it is sometimes to stop and simply look around.\n\nMay inspiration be as boundless as the sunset sky. The path of creation and beauty is for everyone who knows how to see.", jp: "周囲が静まり返り、水のささやき、鳥の声、沈む太陽の温もりだけが残る瞬間があります。そんな時に自然は特別な姿を見せます。\n\n「緑の夕暮れ」は単なる風景ではありません。調和のとれた一瞬です。水面の光、涼しい空気、高い空。そんな夕べは、世界の美しさと、時に立ち止まって見渡すことの大切さを思い起こさせます。\n\n夕焼けの空のように、ひらめきが限りなく広がりますように。", it: "Ci sono momenti in cui il mondo si fa silenzioso, e non restano che il sussurro dell'acqua, il grido degli uccelli e il tiepido calore del sole che tramonta. In quelle ore la natura si rivela in modo speciale.\n\n«Serata verde» non è solo un paesaggio; è un attimo fermato di armonia. Riflessi sull'acqua, aria fresca, cielo alto. Ogni sera così ricorda la bellezza del mondo e l'importanza di fermarsi a guardare.\n\nChe l'ispirazione sia senza confini come il cielo al tramonto.", zh: "有时，世界会安静下来，只剩下水声、鸟鸣和落日余温。在这样的时刻，大自然会特别地展开。\n\n《绿意黄昏》不只是风景，而是凝固的和谐瞬间。水面上的阳光、清凉的空气、高远的天空。每一个这样的傍晚都提醒我们世界的美，以及偶尔停下来看看周围的重要。\n\n愿灵感如日落时的天空一样无边无际。", es: "Hay momentos en que el mundo enmudece, y solo quedan el susurro del agua, el grito de los pájaros y el suave calor del sol que se va. En esas horas la naturaleza se abre de un modo especial.\n\n«Atardecer verde» no es solo un paisaje; es un instante detenido de armonía. Destellos en el agua, aire fresco, cielo alto. Cada tarde así recuerda la belleza del mundo y lo importante que es a veces parar y mirar alrededor.\n\nQue la inspiración sea tan ilimitada como el cielo al atardecer.", de: "Es gibt Momente, in denen die Welt verstummt und nur noch das Flüstern des Wassers, der Ruf der Vögel und die sanfte Wärme der untergehenden Sonne bleiben. In solchen Stunden zeigt sich die Natur auf besondere Weise.\n\n«Grüner Abend» ist nicht nur eine Landschaft; es ist ein eingefrorener Augenblick der Harmonie. Sonnenlicht auf dem Wasser, kühle Luft, hoher Himmel. Jeder solche Abend erinnert an die Schönheit der Welt und daran, wie wichtig es ist, manchmal innezuhalten und zu schauen.\n\nMöge die Inspiration so grenzenlos sein wie der Himmel bei Sonnenuntergang.", fr: "Il est des instants où le monde se tait, et il ne reste que le chuchotement de l'eau, le cri des oiseaux et la douce chaleur du soleil qui décline. À ces heures, la nature se révèle d'une façon particulière.\n\n« Soirée verte » n'est pas qu'un paysage ; c'est un instant figé d'harmonie. Reflets sur l'eau, air frais, ciel haut. Chaque soir ainsi rappelle la beauté du monde et l'importance de s'arrêter parfois pour regarder autour de soi.\n\nQue l'inspiration soit aussi sans limites que le ciel au coucher du soleil.", he: "יש רגעים שבהם העולם נופל לשקט, ונותרים רק לחש המים, קריאת הציפורים והחום הרך של השמש השוקעת. בשעות כאלה הטבע נפתח באופן מיוחד.\n\n«ערב ירוק» אינו רק נוף; זה רגע קפוא של הרמוניה. אור על המים, אוויר צונן, שמיים גבוהים. כל ערב כזה מזכיר את יופיו של העולם ואת חשיבות העצירה והמבט מסביב.\n\nהשאיפה תהיה ללא גבול כמו השמיים בשקיעה." },

    story_s1771907766592_title: { ru: "Спящие друзья", en: "Sleeping Friends", jp: "眠れる友達", it: "Amici dormienti", zh: "睡着的朋友", es: "Amigos dormidos", de: "Schlafende Freunde", fr: "Amis endormis", he: "חברים ישנים" },
    relax_back: { ru: "← Главная", en: "← Main", jp: "← メインへ", it: "← Home", zh: "← 主页", es: "← Inicio", de: "← Start", fr: "← Accueil", he: "← לדף הראשי" },
    relax_title: { ru: "✦ Комната отдыха", en: "✦ Rest room", jp: "✦ 休息室", it: "✦ Stanza relax", zh: "✦ 休息室", es: "✦ Sala de descanso", de: "✦ Ruheraum", fr: "✦ Salle de repos", he: "✦ חדר מנוחה" },
    relax_sound: { ru: "♪ Звук", en: "♪ Sound", jp: "♪ サウンド", it: "♪ Suono", zh: "♪ 声音", es: "♪ Sonido", de: "♪ Sound", fr: "♪ Son", he: "♪ צליל" },
    relax_silence: { ru: "♪ Тишина", en: "♪ Silence", jp: "♪ 無音", it: "♪ Silenzio", zh: "♪ 静音", es: "♪ Silencio", de: "♪ Stille", fr: "♪ Silence", he: "♪ שקט" },
    relax_breathe_in: { ru: "вдыхай...", en: "breathe in...", jp: "吸って…", it: "inspira...", zh: "吸气…", es: "inspira...", de: "einatmen...", fr: "inspire...", he: "שאפי..." },
    relax_breathe_hold: { ru: "задержи...", en: "hold...", jp: "止めて…", it: "trattieni...", zh: "屏住…", es: "mantén...", de: "halten...", fr: "retenir...", he: "החזיקי..." },
    relax_breathe_out: { ru: "выдыхай...", en: "breathe out...", jp: "吐いて…", it: "espira...", zh: "呼气…", es: "espira...", de: "ausatmen...", fr: "expire...", he: "נשפי..." },
    relax_pause: { ru: "· пауза ·", en: "· pause ·", jp: "· 一時停止 ·", it: "· pausa ·", zh: "· 暂停 ·", es: "· pausa ·", de: "· Pause ·", fr: "· pause ·", he: "· השהייה ·" },
    relax_timer_5: { ru: "⏱ 5 мин", en: "⏱ 5 min", jp: "⏱ 5分", it: "⏱ 5 min", zh: "⏱ 5分钟", es: "⏱ 5 min", de: "⏱ 5 Min", fr: "⏱ 5 min", he: "⏱ 5 דק'" },
    relax_timer_10: { ru: "⏱ 10 мин", en: "⏱ 10 min", jp: "⏱ 10分", it: "⏱ 10 min", zh: "⏱ 10分钟", es: "⏱ 10 min", de: "⏱ 10 Min", fr: "⏱ 10 min", he: "⏱ 10 דק'" },
    relax_timer_15: { ru: "⏱ 15 мин", en: "⏱ 15 min", jp: "⏱ 15分", it: "⏱ 15 min", zh: "⏱ 15分钟", es: "⏱ 15 min", de: "⏱ 15 Min", fr: "⏱ 15 min", he: "⏱ 15 דק'" },
    relax_draw: { ru: "🎨 Рисовать", en: "🎨 Draw", jp: "🎨 描く", it: "🎨 Disegna", zh: "🎨 绘画", es: "🎨 Dibujar", de: "🎨 Zeichnen", fr: "🎨 Dessiner", he: "🎨 ציירי" },
    relax_meditation_done: { ru: "🔔 Медитация завершена", en: "🔔 Meditation complete", jp: "🔔 瞑想完了", it: "🔔 Meditazione completata", zh: "🔔 冥想结束", es: "🔔 Meditación completada", de: "🔔 Meditation beendet", fr: "🔔 Méditation terminée", he: "🔔 מדיטציה הושלמה" },
    relax_done: { ru: "✓ Готово", en: "✓ Done", jp: "✓ 完了", it: "✓ Fatto", zh: "✓ 完成", es: "✓ Listo", de: "✓ Fertig", fr: "✓ Terminé", he: "✓ הושלם" },

    draw_back: { ru: "← На главную", en: "← Main", jp: "← メインへ", it: "← Home", zh: "← 主页", es: "← Inicio", de: "← Start", fr: "← Accueil", he: "← לדף הראשי" },
    draw_title: { ru: "✦ Творческая комната", en: "✦ Creative room", jp: "✦ 創作ルーム", it: "✦ Stanza creativa", zh: "✦ 创作室", es: "✦ Sala creativa", de: "✦ Kreativraum", fr: "✦ Salle créative", he: "✦ חדר יצירה" },
    draw_nav_relax: { ru: "🌙 Отдых", en: "🌙 Rest", jp: "🌙 休息", it: "🌙 Relax", zh: "🌙 休息", es: "🌙 Descanso", de: "🌙 Ruhe", fr: "🌙 Repos", he: "🌙 מנוחה" },
    draw_nav_guardian: { ru: "Колючий Собеседник →", en: "Companion →", jp: "守護者 →", it: "Compagno →", zh: "守护者 →", es: "Compañero →", de: "Begleiter →", fr: "Compagnon →", he: "שומר →" },
    draw_welcome_title: { ru: "🎨 Творческая комната", en: "🎨 Creative room", jp: "🎨 創作ルーム", it: "🎨 Stanza creativa", zh: "🎨 创作室", es: "🎨 Sala creativa", de: "🎨 Kreativraum", fr: "🎨 Salle créative", he: "🎨 חדר יצירה" },
    draw_welcome_step1: { ru: "🖌 Выбери цвет внизу", en: "🖌 Pick a color below", jp: "🖌 下で色を選んで", it: "🖌 Scegli un colore sotto", zh: "🖌 在下面选颜色", es: "🖌 Elige un color abajo", de: "🖌 Wähle unten eine Farbe", fr: "🖌 Choisis une couleur en bas", he: "🖌 בחרי צבע למטה" },
    draw_welcome_step2: { ru: "📏 Размер кисти — ползунок", en: "📏 Brush size — slider", jp: "📏 ブラシサイズ — スライダー", it: "📏 Dimensione pennello — slider", zh: "📏 画笔大小 — 滑块", es: "📏 Tamaño del pincel — deslizador", de: "📏 Pinselgröße — Schieber", fr: "📏 Taille du pinceau — curseur", he: "📏 גודל מכחול — מחוון" },
    draw_welcome_step3: { ru: "✏ Рисуй по белому холсту", en: "✏ Draw on the white canvas", jp: "✏ 白いキャンバスに描いて", it: "✏ Disegna sulla tela bianca", zh: "✏ 在白画布上画", es: "✏ Dibuja en el lienzo blanco", de: "✏ Zeichne auf die weiße Leinwand", fr: "✏ Dessine sur la toile blanche", he: "✏ ציירי על הבד הלבן" },
    draw_welcome_step4: { ru: "↩ Ctrl+Z — отменить", en: "↩ Ctrl+Z — undo", jp: "↩ Ctrl+Z — 元に戻す", it: "↩ Ctrl+Z — annulla", zh: "↩ Ctrl+Z — 撤销", es: "↩ Ctrl+Z — deshacer", de: "↩ Strg+Z — rückgängig", fr: "↩ Ctrl+Z — annuler", he: "↩ Ctrl+Z — בטל" },
    draw_welcome_step5: { ru: "⬇ Сохранить — кнопка справа", en: "⬇ Save — button on the right", jp: "⬇ 保存 — 右のボタン", it: "⬇ Salva — pulsante a destra", zh: "⬇ 保存 — 右侧按钮", es: "⬇ Guardar — botón a la derecha", de: "⬇ Speichern — Button rechts", fr: "⬇ Enregistrer — bouton à droite", he: "⬇ שמור — כפתור מימין" },
    draw_welcome_btn: { ru: "Понятно, начинаю!", en: "Got it, let's go!", jp: "わかった、始めよう！", it: "Capito, iniziamo!", zh: "好的，开始吧！", es: "¡Entendido, vamos!", de: "Alles klar, los!", fr: "Compris, c'est parti !", he: "הבנתי, בואי נתחיל!" },
    draw_hint: { ru: "выбери цвет и рисуй!", en: "pick a color and draw!", jp: "色を選んで描いて！", it: "scegli un colore e disegna!", zh: "选颜色然后画！", es: "¡elige un color y dibuja!", de: "wähle eine Farbe und zeichne!", fr: "choisis une couleur et dessine !", he: "בחרי צבע וציירי!" },
    draw_brush: { ru: "Кисть", en: "Brush", jp: "ブラシ", it: "Pennello", zh: "画笔", es: "Pincel", de: "Pinsel", fr: "Pinceau", he: "מכחול" },
    draw_eraser: { ru: "Ластик", en: "Eraser", jp: "消しゴム", it: "Gomma", zh: "橡皮", es: "Goma", de: "Radierer", fr: "Gomme", he: "מחק" },
    draw_undo: { ru: "Отменить (Ctrl+Z)", en: "Undo (Ctrl+Z)", jp: "元に戻す (Ctrl+Z)", it: "Annulla (Ctrl+Z)", zh: "撤销 (Ctrl+Z)", es: "Deshacer (Ctrl+Z)", de: "Rückgängig (Strg+Z)", fr: "Annuler (Ctrl+Z)", he: "בטל (Ctrl+Z)" },
    draw_clear: { ru: "Очистить всё", en: "Clear all", jp: "すべて消す", it: "Cancella tutto", zh: "清空", es: "Borrar todo", de: "Alles löschen", fr: "Tout effacer", he: "נקה הכל" },
    draw_save: { ru: "Скачать рисунок", en: "Download drawing", jp: "絵をダウンロード", it: "Scarica disegno", zh: "下载图画", es: "Descargar dibujo", de: "Zeichnung herunterladen", fr: "Télécharger le dessin", he: "הורדי ציור" },

    story_s1771907766592_content: { ru: "На берегу тихого озера, где туман мягко стелется над водой, нашли покой два маленьких сердца. Пушистый щенок и рыжий котенок, устав от дневных игр, уснули в высокой траве, согретые последними лучами уходящего солнца.\n\nВ этом мире нет места вражде, когда рядом верный друг, а над головой — бескрайнее небо, окрашенное в золотые тона. Эта картина напоминает нам о самом главном: истинная гармония рождается в тишине и искренности. Пусть этот теплый вечер останется в памяти как символ доброты, которая не требует слов.\n\nА это видео про них  https://www.youtube.com/watch?v=FjS6o9yL16o", en: "On the shore of a quiet lake, where mist softly spreads over the water, two little hearts have found peace. A fluffy puppy and a ginger kitten, tired from the day's games, fell asleep in the tall grass, warmed by the last rays of the setting sun.\n\nIn this world there is no room for hostility when a faithful friend is by your side and an endless sky, painted in golden tones, stretches above. This painting reminds us of what matters most: true harmony is born in silence and sincerity. May this warm evening remain in memory as a symbol of kindness that needs no words.\n\nAnd here is a video about them  https://www.youtube.com/watch?v=FjS6o9yL16o", jp: "静かな湖の岸辺で、霧が水面に柔らかく広がる中、二つの小さな心が安らぎを見つけました。ふわふわの子犬と茶色の子猫が、昼間の遊びに疲れて、沈む太陽の最後の光に温められながら、高い草の中で眠りました。\n\n忠実な友がそばにいるとき、この世界に敵意の居場所はありません。頭上には金色に染まった果てしない空。この絵は私たちに最も大切なことを思い出させます。真の調和は静寂と誠実さから生まれるのです。この温かい夕べが、言葉を必要としない優しさの象徴として記憶に残りますように。\n\nそしてこちらは彼らについての動画です  https://www.youtube.com/watch?v=FjS6o9yL16o", it: "Sulla riva di un lago tranquillo, dove la nebbia si stende dolcemente sull'acqua, due piccoli cuori hanno trovato pace. Un cucciolo soffice e un gattino rosso, stanchi dai giochi del giorno, si sono addormentati nell'erba alta, scal dati dagli ultimi raggi del sole che tramonta.\n\nIn questo mondo non c'è posto per l'ostilità quando un amico fedele è al tuo fianco e sopra di te un cielo infinito dipinto di toni dorati. Questo dipinto ci ricorda l'essenziale: la vera armonia nasce nel silenzio e nella sincerità. Che questa serata tiepida resti nella memoria come simbolo di una gentilezza che non ha bisogno di parole.\n\nE questo è un video su di loro  https://www.youtube.com/watch?v=FjS6o9yL16o", zh: "在宁静的湖畔，薄雾轻笼水面，两颗小心灵找到了安宁。毛茸茸的小狗和橘色的小猫，玩了一整天后，在落日余晖中于高草丛里睡着了。\n\n当身边有忠诚的伙伴、头顶是金色的无边天空时，这个世界没有敌意的位置。这幅画提醒我们最重要的东西：真正的和谐生于静默与真诚。愿这个温暖的傍晚作为不需言语的善意的象征留在记忆里。\n\n这是关于它们的视频  https://www.youtube.com/watch?v=FjS6o9yL16o", es: "En la orilla de un lago tranquilo, donde la niebla se extiende suavemente sobre el agua, dos pequeños corazones encontraron paz. Un cachorro esponjoso y un gatito pelirrojo, cansados de los juegos del día, se durmieron en la hierba alta, calentados por los últimos rayos del sol.\n\nEn este mundo no hay lugar para la hostilidad cuando un amigo fiel está a tu lado y sobre ti un cielo infinito teñido de tonos dorados. Esta pintura nos recuerda lo esencial: la verdadera armonía nace en el silencio y la sinceridad. Que esta tarde cálida quede en la memoria como símbolo de una bondad que no necesita palabras.\n\nY este es un video sobre ellos  https://www.youtube.com/watch?v=FjS6o9yL16o", de: "Am Ufer eines stillen Sees, wo Nebel weich über das Wasser zieht, haben zwei kleine Herzen Ruhe gefunden. Ein flauschiges Welpen und ein roter Kater, müde vom Spiel des Tages, schlafen im hohen Gras, gewärmt von den letzten Strahlen der untergehenden Sonne.\n\nIn dieser Welt ist kein Platz für Feindseligkeit, wenn ein treuer Freund an deiner Seite ist und ein endloser Himmel in Goldtönen über dir. Dieses Bild erinnert uns an das Wichtigste: wahre Harmonie entsteht in Stille und Aufrichtigkeit. Möge dieser warme Abend als Symbol einer Güte, die keine Worte braucht, in Erinnerung bleiben.\n\nUnd hier ist ein Video über sie  https://www.youtube.com/watch?v=FjS6o9yL16o", fr: "Sur le rivage d'un lac tranquille, où la brume s'étend doucement sur l'eau, deux petits cœurs ont trouvé la paix. Un chiot tout doux et un chaton roux, fatigués des jeux de la journée, se sont endormis dans les hautes herbes, réchauffés par les derniers rayons du soleil.\n\nDans ce monde, il n'y a pas de place pour l'hostilité quand un ami fidèle est à côté de soi et qu'un ciel infini teinté d'or s'étend au-dessus. Ce tableau nous rappelle l'essentiel : la vraie harmonie naît dans le silence et la sincérité. Que cette soirée douce reste en mémoire comme le symbole d'une bonté qui n'a pas besoin de mots.\n\nEt voici une vidéo sur eux  https://www.youtube.com/watch?v=FjS6o9yL16o", he: "על שפת אגם שקט, שם הערפל נפרש בעדינות על המים, שני לבבות קטנים מצאו שלווה. גור פרוותי וגור חתול ג'ינג'י, עייפים ממשחקי היום, נרדמו בעשב הגבוה, מחוממים מקרני השמש האחרונות.\n\nבעולם הזה אין מקום לעוינות כאשר חבר נאמן לצדך ושמיים אינסופיים צבועים בגווני זהב מעל. ציור זה מזכיר לנו את מה שחשוב באמת: הרמוניה אמיתית נולדת בדממה ובכנות. הלוואי שהערב החם הזה יישאר בזיכרון כסמל לחמלה שאינה צריכה מילים.\n\nוהנה סרטון עליהם  https://www.youtube.com/watch?v=FjS6o9yL16o" },
  };

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
      const v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v && SUPPORTED.some(function (s) { return s.code === v; })) return v;
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

  let currentLang = getStoredLang();

  function t(key) {
    const row = I18N[key];
    if (!row) return key;
    return row[currentLang] != null ? row[currentLang] : (row[DEFAULT_LANG] || key);
  }

  function getLang() {
    return currentLang;
  }

  function setLang(code) {
    if (!SUPPORTED.some(function (s) { return s.code === code; })) return;
    currentLang = code;
    setStoredLang(code);
    applyToPage();
    try {
      window.dispatchEvent(new CustomEvent("soulart-language-change", { detail: { lang: code } }));
    } catch (_) {}
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
      if (key.indexOf("story_") === 0 && !I18N[key]) return;
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

  function createGlobeWidget() {
    const wrap = document.createElement("div");
    wrap.className = "globe-wrap";
    wrap.setAttribute("data-i18n", "globe_aria");
    wrap.setAttribute("data-i18n-attr", "aria-label");
    wrap.setAttribute("aria-label", t("globe_aria"));

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "globe-btn";
    btn.setAttribute("data-i18n", "globe_aria");
    btn.setAttribute("data-i18n-attr", "aria-label");
    btn.setAttribute("aria-label", t("globe_aria"));
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = "<span class=\"globe-btn__icon\" aria-hidden=\"true\">🌐</span>";
    wrap.appendChild(btn);

    const menu = document.createElement("div");
    menu.className = "globe-menu globe-menu--papyrus";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-hidden", "true");
    menu.innerHTML = SUPPORTED.map(function (s) {
      var f = s.flag ? "<span class=\"globe-menu__flag\" aria-hidden=\"true\">" + s.flag + "</span>" : "";
      return "<button type=\"button\" class=\"globe-menu__item\" role=\"menuitem\" data-lang=\"" + s.code + "\">" + f + "<span class=\"globe-menu__label\">" + s.name + "</span></button>";
    }).join("");
    wrap.appendChild(menu);

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const open = menu.getAttribute("aria-hidden") !== "true";
      menu.setAttribute("aria-hidden", open ? "true" : "false");
      menu.classList.toggle("globe-menu--open", !open);
      btn.setAttribute("aria-expanded", !open);
    });

    document.addEventListener("click", function () {
      menu.setAttribute("aria-hidden", "true");
      menu.classList.remove("globe-menu--open");
      btn.setAttribute("aria-expanded", "false");
    });

    menu.addEventListener("click", function (e) {
      const item = e.target.closest("[data-lang]");
      if (!item) return;
      e.stopPropagation();
      const code = item.getAttribute("data-lang");
      setLang(code);
      menu.setAttribute("aria-hidden", "true");
      menu.classList.remove("globe-menu--open");
      btn.setAttribute("aria-expanded", "false");
    });

    return wrap;
  }

  function init(container) {
    applyToPage();
    const globe = createGlobeWidget();
    if (container && container.appendChild) {
      container.appendChild(globe);
    } else {
      document.body.appendChild(globe);
    }
    setTimeout(function () { applyToPage(); }, 50);
  }

  window.I18n = {
    t: t,
    getLang: getLang,
    setLang: setLang,
    applyToPage: applyToPage,
    init: init,
    SUPPORTED: SUPPORTED,
  };
})();
