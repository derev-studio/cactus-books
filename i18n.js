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

  const I18N = {
    brand: { ru: "🌵 Кактусярий", en: "🌵 Cactusarium", uk: "🌵 Кактусярий", jp: "🌵 Кактусярий", it: "🌵 Cactusarium", zh: "🌵 仙人掌园", es: "🌵 Cactusarium", de: "🌵 Kakteenarium", fr: "🌵 Cactusarium", he: "🌵 קקטוסריום" },
    intro_btn_zastavka: { ru: "СМОТРЕТЬ ЗАСТАВКУ", en: "WATCH SCREENSAVER", uk: "ДИВИТИСЬ ЗАСТАВКУ", es: "VER SALVAPANTALLAS", zh: "观看屏保", he: "צפה במסך נעילה" },
    intro_btn_site: { ru: "Войти в Кактусярий", en: "Enter Cactusarium", uk: "Увійти в Кактусярий", es: "Entrar a Cactusarium", zh: "进入仙人掌园", he: "היכנס לקקטוסריום" },
    intro_aria_zastavka: { ru: "Смотреть заставку", en: "Watch screensaver", uk: "Дивитися заставку", es: "Ver salvapantallas", zh: "观看屏保", he: "צפה במסך נעילה" },
    intro_aria_site: { ru: "Войти в Кактусярий", en: "Enter Cactusarium", uk: "Увійти в Кактусярий", es: "Entrar a Cactusarium", zh: "进入仙人掌园", he: "היכנס לקקטוסריום" },
    intro_lang_label: { ru: "Язык:", en: "Language:", uk: "Мова:", es: "Idioma:", zh: "语言：", he: "שפה:" },
    nav_gallery: { ru: "Галерея", en: "Gallery", uk: "Галерея", jp: "ギャラリー", it: "Galleria", zh: "画廊", es: "Galería", de: "Galerie", fr: "Galerie", he: "גלריה" },
    nav_stories: { ru: "Рассказы", en: "Stories", uk: "Оповідання", jp: "ストーリー", it: "Racconti", zh: "故事", es: "Relatos", de: "Geschichten", fr: "Histoires", he: "סיפורים" },
    nav_about: { ru: "Обо мне", en: "About me", jp: "自己紹介", it: "Su di me", zh: "关于我", es: "Sobre mí", de: "Über mich", fr: "À propos", he: "עלי" },
    footer_studio: { ru: "Кактусярий ©", en: "Cactusarium ©", uk: "Кактусярий ©", jp: "Кактусярий ©", it: "Кактусярий ©", zh: "仙人掌园 ©", es: "Cactusarium ©", de: "Кактусярий ©", fr: "Кактусярий ©", he: "קקטוסריום ©" },
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
    fuji_magic_aria: { ru: "Магия Fuji: лепестки, звуки", en: "Fuji magic: petals, sounds", uk: "Магія Fuji: пелюстки, звуки", es: "Magia Fuji: pétalos, sonidos", zh: "富士魔法：花瓣与声音", he: "קסם פוג'י: עלי כותרת, צלילים" },
    atmosphere_aria: { ru: "Настройки атмосферы", en: "Atmosphere settings", uk: "Налаштування атмосфери", es: "Ajustes de atmósfera", zh: "氛围设置", he: "הגדרות אווירה" },
    video_not_supported: { ru: "Ваш браузер не поддерживает воспроизведение видео.", en: "Your browser does not support video playback.", uk: "Ваш браузер не підтримує відтворення відео.", es: "Tu navegador no soporta la reproducción de video.", zh: "您的浏览器不支持视频播放。", he: "הדפדפן שלך לא תומך בהשמעת וידאו." },
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
    globe_aria: { ru: "Выбор языка", en: "Choose language", uk: "Оберіть мову", zh: "选择语言", es: "Elegir idioma", he: "בחירת שפה" },
    hero_title: { ru: "Кактусярий", en: "Cactusarium", jp: "Кактусярий", it: "Cactusarium", zh: "仙人掌园", es: "Cactusarium", de: "Kakteenarium", fr: "Cactusarium", he: "Кактусярий" },
    hero_subtitle: { ru: "Опознать кактус по фото, уход по регионам, география, легенды. Всё в одном месте.", en: "Identify cacti by photo, care by region, geography, legends. All in one place.", jp: "写真でサボテンを見分け、地域ごとの育て方、地理、伝説。すべてここに。", it: "Identifica i cactus dalla foto, cura per regione, geografia, leggende. Tutto in un posto.", zh: "按照片识别仙人掌，按地区养护，地理，传说。尽在一处。", es: "Identifica cactus por foto, cuidado por región, geografía, leyendas. Todo en un lugar.", de: "Kakteen anhand von Fotos erkennen, Pflege nach Region, Geografie, Legenden. Alles an einem Ort.", fr: "Identifier les cactus par photo, soins par région, géographie, légendes. Tout en un lieu.", he: "זיהוי קקטי לפי תמונה, טיפול לפי אזור, גיאוגרפיה, אגדות. הכל במקום אחד." },

    nav_systematics: { ru: "Происхождение видов", en: "Origin of species", uk: "Походження видів", be: "Паходжанне відаў", zh: "物种起源", es: "Origen de especies", he: "מוצא המינים" },
    systematics_title: { ru: "Происхождение видов", en: "Origin of species", uk: "Походження видів", be: "Паходжанне відаў", jp: "種の起源", it: "Origine delle specie", zh: "物种起源", es: "Origen de especies", de: "Entstehung der Arten", fr: "Origine des espèces", he: "מוצא המינים" },
    systematics_intro1: { ru: "Кактусы и другие суккуленты появились на Земле не сразу. Их история — это результат долгой эволюции растений, которые постепенно приспосабливались к жизни в засушливых и суровых условиях.", be: "Кактусы і іншыя сукуленты з'явіліся на Зямлі не адразу. Іх гісторыя — вынік доўгай эвалюцыі раслін, якія паступова прыстасоўваліся да жыцця ў засушлівых і суровых умовах.", en: "Cacti and other succulents did not appear on Earth overnight. Their history is the result of long evolution of plants that gradually adapted to life in arid and harsh conditions.", jp: "サボテンや多肉植物は一夜にして現れたのではありません。乾燥した厳しい環境に適応した植物の長い進化の結果です。", it: "I cactus e le succulente non sono comparsi sulla Terra da un giorno all'altro. La loro storia è il risultato di una lunga evoluzione.", zh: "仙人掌和其他多肉植物并非一夜出现。它们的历史是植物在干旱严酷环境中长期进化的结果。", es: "Los cactus y otras suculentas no aparecieron en la Tierra de la noche a la mañana. Su historia es el resultado de una larga evolución de plantas que se adaptaron a condiciones áridas y duras.", de: "Kakteen und andere Sukkulenten sind nicht über Nacht entstanden. Ihre Geschichte ist das Ergebnis einer langen Evolution.", fr: "Les cactus et autres succulentes ne sont pas apparus du jour au lendemain. Leur histoire est le résultat d'une longue évolution.", he: "הקקטיים והסוקולנטים לא הופיעו בין לילה. ההיסטוריה שלהם היא תוצאה של אבולוציה ארוכה." },
    systematics_intro2: { ru: "Сегодня известно огромное разнообразие кактусов и родственных им растений. Чтобы понять, как они возникли, как связаны между собой и как ботаники их классифицируют, на этой странице собраны основные разделы.", be: "Сёння вядома велізарная разнастайнасць кактусаў і роднасных ім раслін. Каб зразумець, як яны ўзніклі, як звязаны паміж сабой і як батанікі іх класіфікуюць, на гэтай старонцы сабраны асноўныя раздзелы.", en: "Today a great variety of cacti and related plants is known. To understand how they originated, how they are related, and how botanists classify them, this page brings together the main sections.", jp: "今日、多様なサボテンと近縁植物が知られています。起源、系統、分類を理解するためにこのページで主要なセクションをまとめています。", it: "Oggi si conosce una grande varietà di cactus e piante affini. Per capire origine, relazioni e classificazione, questa pagina riunisce le sezioni principali.", zh: "如今已知种类繁多的仙人掌及其近缘植物。为理解其起源、亲缘与分类，本页汇集了主要板块。", es: "Hoy se conoce una gran variedad de cactus y plantas afines. Para entender su origen, parentesco y cómo los botanistas los clasifican, esta página reúne las secciones principales.", de: "Heute ist eine große Vielfalt an Kakteen und verwandten Pflanzen bekannt. Um Herkunft, Verwandtschaft und Klassifikation zu verstehen, bündelt diese Seite die Hauptbereiche.", fr: "Aujourd'hui une grande variété de cactus et plantes apparentées est connue. Pour comprendre leur origine, leurs liens et leur classification, cette page rassemble les sections principales.", he: "היום ידוע מגוון רחב של קקטיים וצמחים קרובים. כדי להבין את מוצאם, קשריהם והסיווג הבוטני, דף זה מאגד את הסעיפים העיקריים." },
    systematics_intro3: { ru: "Выберите один из разделов ниже, чтобы узнать больше о происхождении кактусов, системе их классификации и родственных суккулентах.", be: "Выберыце адзін з раздзелаў ніжэй, каб даведацца больш пра паходжанне кактусаў, сістэме іх класіфікацыі і родных сукулентах.", en: "Choose one of the sections below to learn more about the origin of cacti, their classification system, and related succulents.", jp: "サボテンの起源、分類、近縁の多肉植物について、下のセクションから選んでご覧ください。", it: "Scegli una delle sezioni qui sotto per saperne di più su origine dei cactus, sistema di classificazione e succulente affini.", zh: "请从下方板块中选择一个，以了解仙人掌的起源、分类体系及相关多肉植物。", es: "Elija una de las secciones siguientes para saber más sobre el origen de los cactus, su sistema de clasificación y las suculentas afines.", de: "Wählen Sie einen der folgenden Bereiche, um mehr über Herkunft der Kakteen, Klassifikation und verwandte Sukkulenten zu erfahren.", fr: "Choisissez l'une des sections ci-dessous pour en savoir plus sur l'origine des cactus, leur classification et les succulentes apparentées.", he: "בחרו אחד מהסעיפים למטה כדי ללמוד עוד על מוצא הקקטיים, מערכת הסיווג והסוקולנטים הקרובים." },
    systematics_link_origin: { ru: "Происхождение кактусов", en: "Origin of cacti", uk: "Походження кактусів", be: "Паходжанне кактусаў", jp: "サボテンの起源", it: "Origine dei cactus", zh: "仙人掌的起源", es: "Origen de los cactus", de: "Herkunft der Kakteen", fr: "Origine des cactus", he: "מוצא הקקטיים" },
    systematics_link_cacti: { ru: "Классификация кактусов", en: "Cactus classification", uk: "Класифікація кактусів", be: "Класіфікацыя кактусаў", jp: "サボテンの分類", it: "Classificazione dei cactus", zh: "仙人掌分类", es: "Clasificación de cactus", de: "Kakteen-Klassifikation", fr: "Classification des cactus", he: "סיווג קקטיים" },
    systematics_link_succulents: { ru: "Классификация суккулентов", en: "Succulent classification", uk: "Класифікація сукулентів", be: "Класіфікацыя сукулентаў", jp: "多肉植物の分類", it: "Classificazione delle succulente", zh: "多肉植物分类", es: "Clasificación de suculentas", de: "Sukkulenten-Klassifikation", fr: "Classification des succulentes", he: "סיווג סוקולנטים" },
    systematics_aria_tiles: { ru: "Разделы: происхождение и классификация", en: "Sections: origin and classification", uk: "Розділи: походження та класифікація", be: "Раздзелы: паходжанне і класіфікацыя", jp: "セクション：起源と分類", it: "Sezioni: origine e classificazione", zh: "板块：起源与分类", es: "Secciones: origen y clasificación", de: "Bereiche: Herkunft und Klassifikation", fr: "Sections : origine et classification", he: "סעיפים: מוצא וסיווג" },
    systematics_back: { ru: "← Происхождение видов", en: "← Origin of species", uk: "← Походження видів", be: "← Паходжанне відаў", jp: "← 種の起源", it: "← Origine delle specie", zh: "← 物种起源", es: "← Origen de especies", de: "← Entstehung der Arten", fr: "← Origine des espèces", he: "← מוצא המינים" },
    sources_summary: { ru: "Источники", en: "Sources", uk: "Джерела", be: "Крыніцы", es: "Fuentes", zh: "来源", he: "מקורות" },
    sources_ack_title: { ru: "Источники и благодарности", en: "Sources and acknowledgments", uk: "Джерела та подяки", es: "Fuentes y agradecimientos", zh: "来源与致谢", he: "מקורות ותודות" },
    sources_ack_classification_intro: { ru: "Классификация: Курт Бакеберг (Die Cactaceae)", en: "Classification: Kurt Backeberg (Die Cactaceae)", uk: "Класифікація: Курт Бакеберг (Die Cactaceae)", es: "Clasificación: Kurt Backeberg (Die Cactaceae)", zh: "分类：库尔特·巴肯贝格 (Die Cactaceae)", he: "סיווג: קורט באקנברג (Die Cactaceae)" },
    sources_ack_gbif_cite: { ru: "При использовании данных о видах: ", en: "When using species data: ", uk: "При використанні даних про види: ", es: "Al usar datos de especies: ", zh: "使用物种数据时：", he: "בשימוש בנתוני מינים: " },
    sources_ack_basis: { ru: "Основа классификации (дерево подсемейств, триб и родов) — система Курта Бакеберга (Kurt Backeberg), труд «Die Cactaceae». Благодарим за наследие.", en: "Classification basis (subfamilies, tribes, genera) — Kurt Backeberg's system, «Die Cactaceae». We thank the legacy.", uk: "Основа класифікації — система Курта Бакеберга, «Die Cactaceae». Дякуємо за спадщину.", es: "Base de la clasificación (árbol de subfamilias, tribus y géneros) — sistema de Kurt Backeberg, «Die Cactaceae». Agradecemos su legado.", zh: "分类基础（亚科、族、属）— 库尔特·巴肯贝格《Die Cactaceae》。感谢其贡献。", he: "בסיס הסיווג — שיטת קורט באקנברג, «Die Cactaceae». תודה על המורשת." },
    sources_ack_species_1: { ru: "Данные о видах частично из выгрузки ", en: "Species data partly from ", uk: "Дані про види частково з ", es: "Datos de especies en parte de ", zh: "物种数据部分来自 ", he: "נתוני מינים חלקית מ-" },
    sources_ack_species_2: { ru: " (коллекция UNAM, Мексика) и из ", en: " (UNAM collection, Mexico) and from ", uk: " (колекція UNAM) та ", es: " (colección UNAM, México) y ", zh: "（UNAM 收藏）和 ", he: " (אוסף UNAM) ו-" },
    sources_ack_species_3: { ru: ". Цитирование GBIF см. выше (DOI). Благодарим GBIF, UNAM и NCBI.", en: ". See GBIF citation above (DOI). We thank GBIF, UNAM and NCBI.", uk: ". Дякуємо GBIF, UNAM та NCBI.", es: ". Citación GBIF arriba (DOI). Agradecemos a GBIF, UNAM y NCBI.", zh: "。感谢 GBIF、UNAM 和 NCBI。", he: ". תודה ל-GBIF, UNAM ו-NCBI." },
    sources_ack_morphology_1: { ru: "Морфология и фотографии в карточках взяты из статей ", en: "Morphology and photos in cards from ", uk: "Морфологія та фото з ", es: "Morfología y fotos en las fichas proceden de ", zh: "形态与照片来自 ", he: "מורפולוגיה ותמונות מ-" },
    sources_ack_morphology_2: { ru: " (en.wikipedia.org). Авторские права — авторам и Wikipedia/Commons; использование в соответствии с ", en: " (en.wikipedia.org). Credits to authors and Wikipedia/Commons; use per ", uk: " (en.wikipedia.org). Подяка авторам та Wikipedia.", es: " (en.wikipedia.org). Créditos a autores y Wikipedia/Commons. ", zh: "（en.wikipedia.org）。感谢作者与维基百科。", he: " (en.wikipedia.org). תודה למחברים ול-Wikipedia." },
    sources_ack_morphology_3: { ru: "правилами повторного использования контента Wikipedia", en: "Wikipedia reuse policy", uk: "правилами повторного використання Wikipedia", es: "normas de reutilización de Wikipedia", zh: "维基百科内容重用规则", he: "מדיניות השימוש חוזר של Wikipedia" },
    sources_ack_morphology_4: { ru: ". Благодарим авторов и проект Wikipedia.", en: ". We thank the authors and Wikipedia.", uk: ". Дякуємо авторам та проекту Wikipedia.", es: ". Agradecemos a los autores y a Wikipedia.", zh: "。感谢作者与维基百科项目。", he: ". תודה למחברים ולמיזם Wikipedia." },
    sources_ack_names_1: { ru: "Названия и синонимы частично из ", en: "Names and synonyms partly from ", uk: "Назви та синоніми частково з ", es: "Nombres y sinónimos en parte de ", zh: "名称与同义词部分来自 ", he: "שמות ומילים נרדפות מ-" },
    sources_ack_names_2: { ru: " (WFO). Цитирование: WFO (2024). World Flora Online. Благодарим WFO и контрибьюторов.", en: " (WFO). Citation: WFO (2024). World Flora Online. We thank WFO and contributors.", uk: " (WFO). Дякуємо WFO.", es: " (WFO). Citación: WFO (2024). Agradecemos a WFO y colaboradores.", zh: "（WFO）。感谢 WFO。", he: " (WFO). תודה ל-WFO." },
    sources_ack_other_1: { ru: "Справочно использованы также ", en: "Also used for reference: ", uk: "Додатково використано ", es: "También se han usado como referencia ", zh: "参考来源还包括 ", he: "בנוסף שימוש ב-" },
    sources_ack_other_2: { ru: ", ", en: ", ", uk: ", ", es: " e ", zh: "、", he: ", " },
    sources_ack_other_3: { ru: ". Все перечисленные источники указаны в целях атрибуции и благодарности.", en: ". All sources listed for attribution and thanks.", uk: ". Усі джерела вказані для атрибуції.", es: ". Todas las fuentes se indican para atribución y agradecimiento.", zh: "。所列来源均用于署名与致谢。", he: ". כל המקורות לצורך ייחוס ותודה." },
    page_developing: { ru: "Раздел в разработке. Контент появится позже.", en: "Section in progress. Content coming soon.", es: "Sección en desarrollo. El contenido aparecerá más adelante.", de: "Bereich in Arbeit. Inhalt folgt.", fr: "Section en cours. Contenu à venir.", it: "Sezione in lavorazione. Contenuto in arrivo.", jp: "準備中です。", zh: "本节正在建设中。", he: "המדור בהכנה." },
    geography_intro: { ru: "Где растут кактусы в природе: карты, регионы, особенности местообитаний.", en: "Where cacti grow in the wild: maps, regions, habitat features.", es: "Dónde crecen los cactus en la naturaleza: mapas, regiones, hábitats.", de: "Wo Kakteen in der Natur wachsen.", fr: "Où poussent les cactus dans la nature.", it: "Dove crescono i cactus in natura.", jp: "自生のサボテン、地図・地域。", zh: "仙人掌在自然界的分布与生境。", he: "איפה קקטי גדלים בטבע." },
    care_intro: { ru: "Полив, свет, субстрат и календарь ухода — с учётом региона (умеренный климат, Израиль и др.).", en: "Watering, light, substrate and care calendar — by region (temperate, Israel, etc.).", es: "Riego, luz, sustrato y calendario de cuidados según la región.", de: "Gießen, Licht, Substrat und Pflegekalender.", fr: "Arrosage, lumière, substrat et calendrier selon la région.", it: "Annaffiatura, luce, substrato e calendario per regione.", jp: "水やり、光、土、地域別の手入れ。", zh: "浇水、光照、基质与养护日历。", he: "השקיה, אור, מצע ולוח טיפול." },
    succulents_intro: { ru: "Алоэ, хавортии, эхеверии, крассулы и другие растения с запасающими тканями — не только кактусы.", en: "Aloe, haworthias, echeverias, crassulas and other succulent plants — not just cacti.", es: "Aloe, haworthias, echeverias, crasuláceas y otras plantas suculentas.", de: "Aloe, Haworthien, Echeverien, Crassula — nicht nur Kakteen.", fr: "Aloès, haworthias, echeverias, crassulas et autres succulentes.", it: "Aloe, haworthia, echeveria, crassula e altre succulente.", jp: "アロエ、ハウォルチア、エケベリアなど。", zh: "芦荟、十二卷、拟石莲、 Crassula 等多肉植物。", he: "אלוורה, הוורתיה, אכלווריה ועוד." },
    rarities_intro: { ru: "Редкие, эндемичные и охраняемые виды: что стоит знать коллекционерам.", en: "Rare, endemic and protected species: what collectors should know.", es: "Especies raras, endémicas y protegidas para coleccionistas.", de: "Seltene, endemische und geschützte Arten.", fr: "Espèces rares, endémiques et protégées.", it: "Specie rare, endemiche e protette.", jp: "希少種、固有種、保護種。", zh: "稀有、特有与受保护种类。", he: "מינים נדירים ואנדמיים." },
    edible_intro: { ru: "Опунция, питахайя (драконий фрукт) и другие виды: плоды и побеги в кулинарии.", en: "Opuntia, dragon fruit and others: fruits and pads in cooking.", es: "Opuntia, pitaya y otros: frutos y cladodios en la cocina.", de: "Opuntie, Drachenfrucht und andere in der Küche.", fr: "Opuntia, pitaya et autres en cuisine.", it: "Opuntia, pitaya e altri in cucina.", jp: "オプンティア、ドラゴンフルーツなど。", zh: "仙人掌果、火龙果等食用种类。", he: "אופונטיה, פיטאיה ואחרים." },
    facts_intro: { ru: "Удивительные факты, мифы и малоизвестное о кактусах и суккулентах.", en: "Amazing facts, myths and little-known info about cacti and succulents.", es: "Datos curiosos, mitos y lo menos conocido sobre cactus y suculentas.", de: "Faszinierende Fakten und Mythen über Kakteen.", fr: "Faits étonnants et mythes sur les cactus.", it: "Curiosità e miti su cactus e succulente.", jp: "サボテンと多肉の豆知識。", zh: "关于仙人掌与多肉的趣闻与传说。", he: "עובדות ומיתוסים על קקטי." },
    great_cactus_intro: { ru: "История исследований, коллекционеры и учёные, внёсшие вклад в изучение кактусов.", en: "History of research, collectors and scientists who contributed to cacti study.", es: "Historia de la investigación y grandes cactólogos.", de: "Geschichte der Kakteenforschung und -sammler.", fr: "Histoire des recherches et des grands cactophiles.", it: "Storia della ricerca e dei cactofili.", jp: "研究史と偉大なサボテン学者。", zh: "研究与收藏史、著名仙人掌学者。", he: "היסטוריית המחקר וחוקרי קקטי." },
    caution_title: { ru: "Осторожно: опасные кактусы и суккуленты", en: "Caution: dangerous cacti and succulents", es: "Precaución: cactus y suculentas peligrosos", de: "Vorsicht: gefährliche Kakteen", fr: "Attention: cactus et succulentes dangereux", it: "Attenzione: cactus e succulente pericolosi", jp: "注意：危険なサボテン", zh: "注意：危险仙人掌与多肉", he: "זהירות: קקטי ומסוכנים" },
    caution_intro: { ru: "Колючки-«гарпуны», глохидии (мельчайшие шипы), плоды опунции перед едой, ядовитые виды — как не пораниться и что делать, если впилось.", en: "Hooked spines, glochids, opuntia fruits before eating, poisonous species — how to avoid injury and what to do if stuck.", es: "Espinas ganchudas, gloquidios, frutos de opuntia, especies tóxicas — cómo evitar lesiones.", de: "Hakenstacheln, Glochiden, giftige Arten — Verletzungen vermeiden.", fr: "Épines en harpon, glochides, espèces toxiques.", it: "Spine uncinate, glochidi, specie tossiche.", jp: "かぎ状のとげ、 glochid、有毒種。", zh: "钩刺、刚毛、食用前注意、有毒种类。", he: "קוצים, גלוכידים, מינים רעילים." },
    about_title: { ru: "О сайте", en: "About the site", es: "Sobre el sitio", de: "Über die Seite", fr: "À propos du site", it: "Informazioni sul sito", jp: "サイトについて", zh: "关于本站", he: "אודות האתר" },
    about_intro: { ru: "Почему «Кактусярий», кто сделал сайт и что здесь найдёте.", en: "Why Cactusarium, who made the site and what you'll find here.", es: "Por qué Cactusarium, quién hizo el sitio y qué encontrar aquí.", de: "Warum Cactusarium, wer die Seite gemacht hat.", fr: "Pourquoi Cactusarium, qui a fait le site.", it: "Perché Cactusarium e cosa trovate qui.", jp: "なぜこのサイト、誰が作ったか。", zh: "为何叫仙人掌园、谁建站、内容概览。", he: "למה קקטוסריום ומה תמצאו כאן." },
    origin_cacti_title: { ru: "Происхождение кактусов", en: "Origin of cacti", es: "Origen de los cactus", de: "Herkunft der Kakteen", fr: "Origine des cactus", it: "Origine dei cactus", jp: "サボテンの起源", zh: "仙人掌的起源", he: "מוצא הקקטיים" },
    class_succulents_intro: { ru: "Суккуленты — это не только кактусы. К суккулентным относят множество семейств и родов растений из разных частей света.", en: "Succulents are not just cacti. Many plant families and genera from around the world are succulent.", es: "Las suculentas no son solo cactus. Incluyen muchas familias y géneros de todo el mundo.", de: "Sukkulenten sind mehr als Kakteen.", fr: "Les succulentes ne sont pas que des cactus.", it: "Le succulente non sono solo cactus.", jp: "多肉植物はサボテンだけではありません。", zh: "多肉植物不只有仙人掌。", he: "סוקולנטים הם לא רק קקטי." },
    page_developing_succulents: { ru: "Раздел в разработке. Скоро здесь появится обзор классификации суккулентов. Пока можно перейти в раздел «Суккуленты».", en: "Section in progress. An overview of succulent classification will appear here soon. For now, see Succulents.", es: "Sección en desarrollo. Pronto habrá un resumen de la clasificación. Mientras tanto, véase Suculentas.", de: "Bereich in Arbeit. Bald Übersicht zur Sukkulenten-Klassifikation.", fr: "Section en cours. Bientôt un aperçu de la classification des succulentes.", it: "Sezione in lavorazione. Presto la classificazione delle succulente.", jp: "準備中。多肉の分類は近日公開。", zh: "本节建设中。可先查看「多肉植物」板块。", he: "המדור בהכנה. בקרוב סיווג סוקולנטים." },
    identifier_title: { ru: "🌵 Опознать кактус", en: "🌵 Identify cactus", es: "🌵 Identificar cactus", de: "🌵 Kaktus bestimmen", fr: "🌵 Identifier un cactus", it: "🌵 Identifica cactus", jp: "🌵 サボテンを同定", zh: "🌵 识别仙人掌", he: "🌵 זיהוי קקטוס" },
    identifier_subtitle: { ru: "Загрузите фото — узнайте вид, где растёт в природе, интересные факты и как ухаживать", en: "Upload a photo — find out the species, where it grows in nature, interesting facts and how to care for it", es: "Sube una foto — descubre la especie, dónde crece en la naturaleza, datos curiosos y cómo cuidarla", de: "Foto hochladen — Art, Standort, Pflege und Wissenswertes", fr: "Téléchargez une photo — espèce, habitat, faits et soins", it: "Carica una foto — specie, dove cresce, curiosità e cure", jp: "写真をアップロード — 種類、自生地、豆知識、手入れ", zh: "上传照片 — 识别种类、产地、趣闻与养护", he: "העלה תמונה — מין, תפוצה, עובדות וטיפול" },
    identifier_upload_hint: { ru: "Нажмите или перетащите фото кактуса сюда", en: "Click or drag a cactus photo here", es: "Haz clic o arrastra una foto de cactus aquí", de: "Klicken oder Foto hierher ziehen", fr: "Cliquez ou glissez une photo de cactus ici", it: "Clicca o trascina una foto di cactus qui", jp: "クリックまたは写真をここにドラッグ", zh: "点击或拖拽仙人掌照片到此处", he: "לחץ או גרור תמונת קקטוס לכאן" },
    identifier_btn: { ru: "Определить кактус", en: "Identify cactus", es: "Identificar cactus", de: "Kaktus bestimmen", fr: "Identifier le cactus", it: "Identifica cactus", jp: "同定する", zh: "识别仙人掌", he: "זהה קקטוס" },
    identifier_btn_loading: { ru: "Определяю…", en: "Identifying…", es: "Identificando…", de: "Wird bestimmt…", fr: "Identification…", it: "Identificazione…", jp: "同定中…", zh: "识别中…", he: "מזהה…" },
    identifier_upload_aria: { ru: "Нажмите или перетащите фото кактуса", en: "Click or drag cactus photo", es: "Clic o arrastrar foto de cactus", de: "Klicken oder Foto ziehen", fr: "Cliquer ou glisser une photo", it: "Clicca o trascina foto", jp: "クリックまたはドラッグ", zh: "点击或拖拽照片", he: "לחץ או גרור תמונה" },
    identifier_select_file_aria: { ru: "Выбрать файл", en: "Select file", es: "Seleccionar archivo", de: "Datei wählen", fr: "Choisir un fichier", it: "Seleziona file", jp: "ファイルを選択", zh: "选择文件", he: "בחר קובץ" },
    identifier_clear_aria: { ru: "Убрать фото", en: "Remove photo", es: "Quitar foto", de: "Foto entfernen", fr: "Supprimer la photo", it: "Rimuovi foto", jp: "写真を削除", zh: "移除照片", he: "הסר תמונה" },
    identifier_preview_alt: { ru: "Предпросмотр загруженного фото", en: "Preview of uploaded photo", es: "Vista previa de la foto", de: "Vorschau des Fotos", fr: "Aperçu de la photo", it: "Anteprima foto", jp: "アップロード写真のプレビュー", zh: "上传照片预览", he: "תצוגה מקדימה" },
    identifier_clear_history: { ru: "Очистить историю", en: "Clear history", es: "Borrar historial", de: "Verlauf löschen", fr: "Effacer l'historique", it: "Cancella cronologia", jp: "履歴をクリア", zh: "清除记录", he: "נקה היסטוריה" },
    nav_geography: { ru: "Места обитания", en: "Habitats", uk: "Місця проживання", zh: "生境", es: "Hábitats", he: "סביבות מחיה" },
    nav_care: { ru: "Здоровье кактуса", en: "Cactus care", uk: "Здоров'я кактуса", zh: "仙人掌养护", es: "Cuidado del cactus", he: "טיפול בקקטוס" },
    nav_identify: { ru: "Опознать кактус", en: "Identify cactus", uk: "Впізнати кактус", zh: "识别仙人掌", es: "Identificar cactus", he: "זיהוי קקטוס" },
    nav_guardian: { ru: "✦ Колючий Собеседник", en: "✦ Cactus Companion", uk: "✦ Колючий Співбесідник", zh: "✦ 守护者", es: "✦ Compañero", he: "✦ שומר" },
    nav_main: { ru: "Главная", en: "Main", uk: "Головна", zh: "首页", es: "Inicio", he: "עמוד ראשי" },
    nav_navigator: { ru: "Навигатор по кактусам", en: "Cactus navigator", uk: "Навігатор по кактусах", zh: "仙人掌导航", es: "Navegador de cactus", he: "ניווט קקטי" },
    nav_book: { ru: "Кактусология", en: "Cactology", uk: "Кактусологія", zh: "仙人掌学", es: "Cactología", he: "קטולוגיה" },
    nav_great: { ru: "Великие кактусоводы", en: "Great cactologists", uk: "Великі кактусоводи", zh: "著名仙人掌学者", es: "Grandes cactólogos", he: "חוקרי קקטי דגולים" },
    nav_relax: { ru: "Отдых", en: "Rest", uk: "Відпочинок", zh: "休息", es: "Descanso", he: "מנוחה" },
    nav_draw: { ru: "Рисование", en: "Drawing", uk: "Малювання", zh: "绘画", es: "Dibujo", he: "ציור" },
    nav_succulents: { ru: "Суккуленты", en: "Succulents", uk: "Сукуленти", zh: "多肉植物", es: "Suculentas", he: "סוקולנטים" },
    nav_edible: { ru: "Съедобные кактусы", en: "Edible cacti", uk: "Їстівні кактуси", zh: "可食仙人掌", es: "Cactus comestibles", he: "קקטי אכילים" },
    nav_rarities: { ru: "Редкости", en: "Rarities", uk: "Рідкості", zh: "珍品", es: "Rarezas", he: "נדירים" },
    nav_facts: { ru: "Интересные факты", en: "Interesting facts", uk: "Цікаві факти", zh: "趣闻", es: "Datos curiosos", he: "עובדות מעניינות" },
    nav_caution: { ru: "Осторожно", en: "Caution", uk: "Обережно", zh: "注意", es: "Precaución", he: "זהירות" },
    nav_files: { ru: "Список файлов (по алфавиту)", en: "File list (A–Z)", jp: "ファイル一覧", it: "Elenco file", zh: "文件列表", es: "Lista de archivos", de: "Dateiliste", fr: "Liste des fichiers", he: "רשימת קבצים" },
    search_placeholder: { ru: "Название кактуса…", en: "Cactus name…", uk: "Назва кактуса…", zh: "仙人掌名称…", es: "Nombre del cactus…", he: "שם קקטוס…" },
    search_btn: { ru: "Найти", en: "Search", uk: "Знайти", zh: "查找", es: "Buscar", he: "חפש" },
    more_btn: { ru: "Ещё", en: "More", uk: "Ще", zh: "更多", es: "Más", he: "עוד" },
    navigator_title: { ru: "Навигатор по кактусам", en: "Cactus navigator", jp: "サボテン案内", it: "Navigatore cactus", zh: "仙人掌导航", es: "Navegador de cactus", de: "Kakteen-Navigator", fr: "Navigateur cactus", he: "ניווט קקטי" },
    navigator_intro: { ru: "Введите название кактуса или суккулента в поле выше — откроются ссылки на разделы: уход, ареал, систематика, можно спросить ИИ.", en: "Enter a cactus or succulent name above — links to care, range, systematics, or ask the AI.", jp: "上でサボテンや多肉の名前を入力 — 手入れ、分布、分類、AIへの質問へ。", it: "Inserisci il nome di un cactus o succulenta sopra — link a cura, areale, sistematica o chiedi all'AI.", zh: "在上方输入仙人掌或多肉名称 — 可打开养护、分布、分类或向AI提问。", es: "Introduce el nombre de un cactus o suculenta arriba — enlaces a cuidado, área, sistemática o preguntar a la IA.", de: "Kakteen- oder Sukkulentenname oben eingeben — Links zu Pflege, Verbreitung, Systematik oder KI fragen.", fr: "Entrez un nom de cactus ou succulente ci-dessus — liens vers soins, répartition, systématique ou demander à l'IA.", he: "הזן שם קקטוס או סוקולנט למעלה — קישורים לטיפול, תפוצה, סיסטמטיקה או לשאול את ה-AI." },
    navigator_desc_care: { ru: "Уход для этого вида", en: "Care for this species", es: "Cuidado para esta especie", uk: "Догляд для цього виду", zh: "该物种养护", he: "טיפול למין זה" },
    navigator_desc_geography: { ru: "Ареал на карте", en: "Range on map", es: "Área en el mapa", uk: "Ареал на карті", zh: "分布地图", he: "תפוצה על המפה" },
    navigator_desc_systematics: { ru: "Систематика, названия", en: "Systematics, names", es: "Sistemática, nombres", uk: "Систематика, назви", zh: "分类与名称", he: "סיסטמטיקה, שמות" },
    navigator_desc_identifier: { ru: "Определить по фото", en: "Identify by photo", es: "Identificar por foto", uk: "Визначити за фото", zh: "按照片识别", he: "זיהוי לפי תמונה" },
    navigator_desc_guardian: { ru: "Колючий Собеседник ответит на вопрос", en: "Companion will answer your question", es: "El compañero responderá tu pregunta", uk: "Колючий Співбесідник відповість на питання", zh: "守护者回答您的问题", he: "השומר יענה על שאלתך" },
    navigator_results_title: { ru: "Результаты по запросу", en: "Results for query", es: "Resultados para la búsqueda", uk: "Результати за запитом", zh: "搜索结果", he: "תוצאות לחיפוש" },
    navigator_results_intro: { ru: "Перейдите в нужный раздел — там будет учтён ваш запрос (разделы дорабатываются).", en: "Go to the section you need — your query will be taken into account (sections in progress).", es: "Ve a la sección que necesites — allí se tendrá en cuenta tu búsqueda.", uk: "Перейдіть у потрібний розділ — там буде враховано ваш запит.", zh: "进入相应板块 — 将根据您的搜索显示内容。", he: "עבור לסעיף המתאים — השאילתה תילקח בחשבון." },
    navigator_empty_hint: { ru: "Введите запрос в поле поиска в шапке и нажмите «Найти».", en: "Enter your query in the search field in the header and click «Find».", es: "Introduce tu búsqueda en el campo de la cabecera y pulsa «Buscar».", uk: "Введіть запит у поле пошуку в шапці та натисніть «Знайти».", zh: "在顶部搜索框输入并点击「查找」。", he: "הזן את החיפוש בשדה בכותרת ולחץ «חפש»." },
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
    const row = I18N[key];
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
})();
