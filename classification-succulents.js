/**
 * Классификация суккулентов — функциональность страницы
 * Раскрывающееся дерево классификации с детальной информацией
 */
(function () {
  'use strict';

  // Данные о суккулентах с информацией из Википедии
  var SUCCULENTS_DATA = {
    families: {
      euphorbiaceae: {
        name: 'Молочайные',
        latin: 'Euphorbiaceae',
        description: 'Крупное семейство двудольных растений, включающее около 300 родов и 7500 видов. Многие виды являются суккулентами, особенно в засушливых регионах Африки.',
        genera: {
          euphorbia: {
            name: 'Эуфорбия',
            latin: 'Euphorbia',
            description: 'Крупнейший род семейства, включающий около 2000 видов. Многие виды — суккуленты, похожие на кактусы, но с отличным строением цветков.',
            species: {
              'euphorbia-milii': {
                name: 'Эуфорбия Миля',
                latin: 'Euphorbia milii',
                description: 'Популярное комнатное растение с колючками и яркими прицветниками. Родина — Мадагаскар.',
                distribution: 'Мадагаскар',
                habitat: 'Сухие регионы, каменистые почвы',
                uses: 'Декоративное растение, популярное в комнатном цветоводстве'
              },
              'euphorbia-trigona': {
                name: 'Эуфорбия треугольная',
                latin: 'Euphorbia trigona',
                description: 'Высокий суккулент с трехгранными стеблями. Популярна в комнатном цветоводстве.',
                distribution: 'Ангола',
                habitat: 'Саванны, сухие леса',
                uses: 'Комнатное растение, живые изгороди'
              },
              'euphorbia-splendens': {
                name: 'Эуфорбия блестящая',
                latin: 'Euphorbia splendens',
                description: 'Декоративный вид с яркими цветками. Родина — Южная Африка.',
                distribution: 'Южная Африка',
                habitat: 'Каменистые склоны',
                uses: 'Садовое растение, декоративные насаждения'
              }
            }
          },
          jatropha: {
            name: 'Ятрофа',
            latin: 'Jatropha',
            description: 'Включает около 170 видов. Некоторые виды являются суккулентами и используются в декоративных целях.',
            species: {
              'jatropha-podagrica': {
                name: 'Ятрофа подагрическая',
                latin: 'Jatropha podagrica',
                description: 'Суккулент с утолщенным стволом и крупными листьями. Родина — Центральная Америка.',
                distribution: 'Центральная Америка',
                habitat: 'Тропические сухие леса',
                uses: 'Декоративное растение, традиционная медицина'
              }
            }
          }
        }
      },
      crassulaceae: {
        name: 'Толстянковые',
        latin: 'Crassulaceae',
        description: 'Семейство суккулентных растений, включающее около 35 родов и 1400 видов. Характеризуется сочными листьями и CAM-фотосинтезом.',
        genera: {
          echeveria: {
            name: 'Эхеверия',
            latin: 'Echeveria',
            description: 'Включает около 150 видов. Популярные комнатные суккуленты с розетками из сочных листьев.',
            species: {
              'echeveria-elegans': {
                name: 'Эхеверия изящная',
                latin: 'Echeveria elegans',
                description: 'Популярный вид с голубовато-зелеными листьями, образующими плотную розетку.',
                distribution: 'Мексика',
                habitat: 'Высокогорные районы, скалистые почвы',
                uses: 'Комнатное растение, рокарии, альпинарии'
              },
              'echeveria-laui': {
                name: 'Эхеверия Лау',
                latin: 'Echeveria laui',
                description: 'Декоративный вид с толстыми порошковыми листьями. Родина — Мексика.',
                distribution: 'Мексика',
                habitat: 'Скалистые каньоны',
                uses: 'Коллекционное растение, декоративные композиции'
              }
            }
          },
          crassula: {
            name: 'Крассула',
            latin: 'Crassula',
            description: 'Включает около 200 видов. Самый известный вид — денежное дерево (Crassula ovata).',
            species: {
              'crassula-ovata': {
                name: 'Крассула овальная',
                latin: 'Crassula ovata',
                description: 'Популярное комнатное растение "денежное дерево" с толстыми мясистыми листьями.',
                distribution: 'Южная Африка',
                habitat: 'Сухие склоны, каменистые почвы',
                uses: 'Комнатное растение, фэнг-шуй, традиционная медицина'
              },
              'crassula-perforata': {
                name: 'Крассула прободенная',
                latin: 'Crassula perforata',
                description: 'Вид с попарно сросшимися листьями, образующими "струну".',
                distribution: 'Южная Африка',
                habitat: 'Каменистые склоны',
                uses: 'Ампельные растения, декоративные композиции'
              }
            }
          },
          kalanchoe: {
            name: 'Каланхоэ',
            latin: 'Kalanchoe',
            description: 'Включает около 125 видов. Популярные декоративные растения с яркими цветками.',
            species: {
              'kalanchoe-blossfeldiana': {
                name: 'Каланхоэ Блоссфельда',
                latin: 'Kalanchoe blossfeldiana',
                description: 'Самый популярный вид для комнатного выращивания с яркими соцветиями.',
                distribution: 'Мадагаскар',
                habitat: 'Сухие регионы',
                uses: 'Комнатное растение, срезанные цветы'
              },
              'kalanchoe-daigremontiana': {
                name: 'Каланхоэ Дайгремонта',
                latin: 'Kalanchoe daigremontiana',
                description: 'Известен как "бриофиллум" — образует детки на краях листьев.',
                distribution: 'Мадагаскар',
                habitat: 'Сухие регионы',
                uses: 'Комнатное растение, легкое размножение'
              }
            }
          },
          sedum: {
            name: 'Очиток',
            latin: 'Sedum',
            description: 'Крупный род, включающий около 400-500 видов. Многие виды используются в садоводстве.',
            species: {
              'sedum-morganianum': {
                name: 'Очиток Моргана',
                latin: 'Sedum morganianum',
                description: 'Ампельный вид с длинными свисающими стеблями, известен как "ослиный хвост".',
                distribution: 'Мексика',
                habitat: 'Скалистые каньоны',
                uses: 'Ампельные растения, подвесные корзины'
              },
              'sedum-rubrotinctum': {
                name: 'Очиток красноокрашенный',
                latin: 'Sedum rubrotinctum',
                description: 'Компактный вид с краснеющими на солнце листьями.',
                distribution: 'Мексика',
                habitat: 'Вулканические почвы',
                uses: 'Каменистые сады, контейнеры'
              }
            }
          }
        }
      },
      asphodelaceae: {
        name: 'Асфоделовые',
        latin: 'Asphodelaceae',
        description: 'Семейство, включающее около 40 родов и 900 видов. Многие роды содержат суккулентные виды.',
        genera: {
          aloe: {
            name: 'Алоэ',
            latin: 'Aloe',
            description: 'Включает более 550 видов суккулентных растений. Родина — Африка и Аравийский полуостров.',
            species: {
              'aloe-vera': {
                name: 'Алоэ вера',
                latin: 'Aloe vera',
                description: 'Самый известный вид, используемый в медицине и косметике.',
                distribution: 'Северная Африка, Аравийский полуостров',
                habitat: 'Сухие регионы',
                uses: 'Медицина, косметика, пищевые добавки'
              },
              'aloe-arborescens': {
                name: 'Алоэ древовидное',
                latin: 'Aloe arborescens',
                description: 'Популярный комнатный вид с древовидным стволом.',
                distribution: 'Южная Африка',
                habitat: 'Скалистые склоны',
                uses: 'Комнатное растение, медицина'
              },
              'aloe-ferox': {
                name: 'Алоэ свирепое',
                latin: 'Aloe ferox',
                description: 'Крупный вид с колючками на листьях. Родина — Южная Африка.',
                distribution: 'Южная Африка',
                habitat: 'Сухие регионы',
                uses: 'Медицина, косметика, волокно'
              }
            }
          },
          haworthia: {
            name: 'Хавортия',
            latin: 'Haworthia',
            description: 'Включает около 150 видов маленьких суккулентов. Родина — Южная Африка.',
            species: {
              'haworthia-attenuata': {
                name: 'Хавортия заостренная',
                latin: 'Haworthia attenuata',
                description: 'Популярный вид с полосатыми листьями, образующими розетки.',
                distribution: 'Южная Африка',
                habitat: 'Теневые места под камнями',
                uses: 'Комнатное растение, коллекционные виды'
              },
              'haworthia-cooperi': {
                name: 'Хавортия Купера',
                latin: 'Haworthia cooperi',
                description: 'Вид с полупрозрачными кончиками листьев.',
                distribution: 'Южная Африка',
                habitat: 'Полупустынные регионы',
                uses: 'Коллекционное растение, миниатюрные сады'
              }
            }
          },
          gasteria: {
            name: 'Гастерия',
            latin: 'Gasteria',
            description: 'Включает около 20 видов. Название происходит от латинского "gaster" — живот, из-за формы цветков.',
            species: {
              'gasteria-bicolor': {
                name: 'Гастерия двухцветная',
                latin: 'Gasteria bicolor',
                description: 'Вид с пятнистыми листьями, образующими розетки.',
                distribution: 'Южная Африка',
                habitat: 'Теневые места, скалистые почвы',
                uses: 'Комнатное растение, декоративные композиции'
              }
            }
          }
        }
      }
    }
  };

  // Инициализация страницы
  function init() {
    setupClassificationTree();
    setupURLParameters();
    setupNavigation();
  }

  // Настройка дерева классификации
  function setupClassificationTree() {
    var familyCards = document.querySelectorAll('.family-card');
    
    familyCards.forEach(function(familyCard) {
      var familyKey = familyCard.getAttribute('data-family');
      var familyData = SUCCULENTS_DATA.families[familyKey];
      
      if (!familyData) return;
      
      setupFamilyCard(familyCard, familyData);
    });
  }

  // Настройка карточки семейства
  function setupFamilyCard(card, familyData) {
    var header = card.querySelector('.family-header');
    var genusList = card.querySelector('.genus-list');
    
    // Добавляем кнопку раскрытия
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'family-toggle';
    toggleBtn.innerHTML = '▼';
    toggleBtn.setAttribute('aria-label', 'Развернуть семейство ' + familyData.name);
    
    header.appendChild(toggleBtn);
    
    // Обработчик клика
    toggleBtn.addEventListener('click', function() {
      var isOpen = card.classList.contains('family-card--open');
      
      if (isOpen) {
        card.classList.remove('family-card--open');
        toggleBtn.innerHTML = '▼';
        toggleBtn.setAttribute('aria-label', 'Развернуть семейство ' + familyData.name);
      } else {
        card.classList.add('family-card--open');
        toggleBtn.innerHTML = '▲';
        toggleBtn.setAttribute('aria-label', 'Свернуть семейство ' + familyData.name);
      }
    });
    
    // Настройка родов
    var genusCards = card.querySelectorAll('.genus-card');
    genusCards.forEach(function(genusCard) {
      var genusKey = genusCard.getAttribute('data-genus');
      var genusData = familyData.genera[genusKey];
      
      if (genusData) {
        setupGenusCard(genusCard, genusData);
      }
    });
  }

  // Настройка карточки рода
  function setupGenusCard(card, genusData) {
    var header = card.querySelector('.genus-header');
    var speciesList = card.querySelector('.species-list');
    
    // Добавляем кнопку раскрытия
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'genus-toggle';
    toggleBtn.innerHTML = '▼';
    toggleBtn.setAttribute('aria-label', 'Развернуть род ' + genusData.name);
    
    header.appendChild(toggleBtn);
    
    // Обработчик клика
    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = card.classList.contains('genus-card--open');
      
      if (isOpen) {
        card.classList.remove('genus-card--open');
        toggleBtn.innerHTML = '▼';
        toggleBtn.setAttribute('aria-label', 'Развернуть род ' + genusData.name);
      } else {
        card.classList.add('genus-card--open');
        toggleBtn.innerHTML = '▲';
        toggleBtn.setAttribute('aria-label', 'Свернуть род ' + genusData.name);
      }
    });
    
    // Настройка видов
    var speciesItems = card.querySelectorAll('.species-item');
    speciesItems.forEach(function(speciesItem) {
      var speciesKey = speciesItem.getAttribute('data-species');
      var speciesData = genusData.species[speciesKey];
      
      if (speciesData) {
        setupSpeciesItem(speciesItem, speciesData);
      }
    });
  }

  // Настройка элемента вида
  function setupSpeciesItem(item, speciesData) {
    // Добавляем детальную информацию
    var detailsDiv = document.createElement('div');
    detailsDiv.className = 'species-details';
    detailsDiv.innerHTML = `
      <div class="species-info">
        <h5>${speciesData.latin}</h5>
        <p><strong>Распространение:</strong> ${speciesData.distribution}</p>
        <p><strong>Местообитание:</strong> ${speciesData.habitat}</p>
        <p><strong>Применение:</strong> ${speciesData.uses}</p>
      </div>
    `;
    
    item.appendChild(detailsDiv);
    
    // Кнопка подробной информации
    var detailBtn = document.createElement('button');
    detailBtn.className = 'species-detail-btn';
    detailBtn.innerHTML = 'Подробнее';
    detailBtn.setAttribute('aria-label', 'Подробнее о виде ' + speciesData.name);
    
    item.appendChild(detailBtn);
    
    // Обработчик клика
    detailBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      showSpeciesModal(speciesData);
    });
  }

  // Показать модальное окно с информацией о виде
  function showSpeciesModal(speciesData) {
    // Создаем модальное окно
    var modal = document.createElement('div');
    modal.className = 'species-modal';
    modal.innerHTML = `
      <div class="species-modal__content">
        <div class="species-modal__header">
          <h3>${speciesData.name}</h3>
          <button class="species-modal__close" aria-label="Закрыть">×</button>
        </div>
        <div class="species-modal__body">
          <h4>${speciesData.latin}</h4>
          <p>${speciesData.description}</p>
          <div class="species-modal__info">
            <h5>Подробная информация</h5>
            <p><strong>Распространение:</strong> ${speciesData.distribution}</p>
            <p><strong>Местообитание:</strong> ${speciesData.habitat}</p>
            <p><strong>Применение:</strong> ${speciesData.uses}</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие модального окна
    var closeBtn = modal.querySelector('.species-modal__close');
    closeBtn.addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  // Настройка URL параметров
  function setupURLParameters() {
    var params = new URLSearchParams(window.location.search);
    var family = params.get('family');
    var genus = params.get('genus');
    var species = params.get('species');
    
    if (family) {
      expandToFamily(family, genus, species);
    }
  }

  // Раскрыть до указанного уровня
  function expandToFamily(familyKey, genusKey, speciesKey) {
    var familyCard = document.querySelector('[data-family="' + familyKey + '"]');
    if (!familyCard) return;
    
    var familyData = SUCCULENTS_DATA.families[familyKey];
    if (!familyData) return;
    
    // Раскрываем семейство
    var familyToggle = familyCard.querySelector('.family-toggle');
    if (familyToggle) {
      familyToggle.click();
    }
    
    // Ждем немного и раскрываем род
    setTimeout(function() {
      if (genusKey) {
        var genusCard = familyCard.querySelector('[data-genus="' + genusKey + '"]');
        if (genusCard) {
          var genusToggle = genusCard.querySelector('.genus-toggle');
          if (genusToggle) {
            genusToggle.click();
          }
          
          // Ждем и выделяем вид
          if (speciesKey) {
            setTimeout(function() {
              var speciesItem = genusCard.querySelector('[data-species="' + speciesKey + '"]');
              if (speciesItem) {
                speciesItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                speciesItem.classList.add('species-item--highlighted');
              }
            }, 300);
          }
        }
      }
    }, 300);
  }

  // Настройка навигации
  function setupNavigation() {
    // Добавляем обработчики для ссылок на другие страницы
    var links = document.querySelectorAll('.classification-see-also a');
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        // Сохраняем текущее состояние
        var currentParams = new URLSearchParams(window.location.search);
        if (currentParams.toString()) {
          e.preventDefault();
          var href = link.getAttribute('href');
          var separator = href.includes('?') ? '&' : '?';
          window.location.href = href + separator + currentParams.toString();
        }
      });
    });
  }

  // Экспортируем функции
  window.ClassificationSucculents = {
    init: init,
    expandToFamily: expandToFamily,
    showSpeciesModal: showSpeciesModal,
    data: SUCCULENTS_DATA
  };

})();
