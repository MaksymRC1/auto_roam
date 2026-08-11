const fs = require('fs');
const path = require('path');

const ukPath = path.join(__dirname, '../messages/uk.json');
const enPath = path.join(__dirname, '../messages/en.json');

const uk = JSON.parse(fs.readFileSync(ukPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Navbar
uk.Navbar.closeMenu = "Закрити меню";
uk.Navbar.openMenu = "Відкрити меню";
en.Navbar.closeMenu = "Close menu";
en.Navbar.openMenu = "Open menu";

// Footer
uk.Footer.allRightsReserved = "Всі права захищені.";
en.Footer.allRightsReserved = "All rights reserved.";
uk.Footer.animationsUIUX = "Анімації та сучасний UI/UX";
en.Footer.animationsUIUX = "Animations and modern UI/UX";
uk.Footer.termsOfUse = "Умови використання";
en.Footer.termsOfUse = "Terms of Use";
uk.Footer.privacyPolicy = "Політика конфіденційності";
en.Footer.privacyPolicy = "Privacy Policy";
uk.Footer.howToUse = "Як користуватися";
en.Footer.howToUse = "How to use";
uk.Footer.rateProduct = "Оцінити продукт";
en.Footer.rateProduct = "Rate product";
uk.Footer.contactUs = "Звʼязатися з нами";
en.Footer.contactUs = "Contact us";

// Metadata
uk.Metadata = {
  title: "AutoRoam — Розумний планувальник автоподорожей",
  description: "Інструмент для планування подорожей автомобілем. Враховує кордони, паливо та готелі.",
  keywords: "автоподорож, маршрут, кордон, паливо, калькулятор пального, подорож Європою, Зелена картка, страхування авто",
  ogTitle: "AutoRoam — Планувальник автоподорожей",
  twitterTitle: "AutoRoam — Розумний планувальник автоподорожей",
  twitterDescription: "Плануйте автомобільні подорожі Україною та Європою з AutoRoam."
};
en.Metadata = {
  title: "AutoRoam — Smart Road Trip Planner",
  description: "A tool for planning road trips. Takes into account borders, fuel, and hotels.",
  keywords: "road trip, route, border, fuel, fuel calculator, travel to Europe, Green Card, car insurance",
  ogTitle: "AutoRoam — Road Trip Planner",
  twitterTitle: "AutoRoam — Smart Road Trip Planner",
  twitterDescription: "Plan car trips across Ukraine and Europe with AutoRoam."
};

// StopsInput
uk.StopsInput = {
  from: "Звідки",
  to: "Куди",
  waypoint: "Проміжна зупинка",
  addStop: "Додати зупинку",
  buildRoute: "Побудувати маршрут",
  update: "Оновити",
  reset: "Скинути",
  searchPlaceholder: "Пошук...",
  myLocation: "Моє місцезнаходження",
  removeStop: "Видалити зупинку",
  swapStops: "Поміняти місцями",
  analyzingStops: "Аналізуємо зупинки",
  buildingRoute: "Будуємо маршрут",
  checkingBorders: "Перевіряємо кордони",
  calculatingFuel: "Рахуємо пальне"
};
en.StopsInput = {
  from: "From",
  to: "To",
  waypoint: "Waypoint",
  addStop: "Add stop",
  buildRoute: "Build route",
  update: "Update",
  reset: "Reset",
  searchPlaceholder: "Search...",
  myLocation: "My location",
  removeStop: "Remove stop",
  swapStops: "Swap stops",
  analyzingStops: "Analyzing stops",
  buildingRoute: "Building route",
  checkingBorders: "Checking borders",
  calculatingFuel: "Calculating fuel"
};

// TripPlanner
uk.TripPlanner = {
  heroTitle: "Подорожі без кордонів",
  heroTitle2: "Світ чекає на тебе",
  heroTitle3: "Відкривай нові горизонти",
  heroTitle4: "Назустріч пригодам",
  heroTitle5: "Твій шлях, твої правила",
  buildRoute: "Побудувати маршрут",
  routeParams: "Параметри маршруту",
  fuelCalculation: "Розрахунок палива",
  insuranceAndVignettes: "Страхування та віньєтки",
  totalEstimate: "Загальний кошторис",
  timeline: "Таймлайн",
  map: "Карта",
  back: "Назад",
  routeTimeline: "Хронологія подорожі",
  shareTitle: "Подивіться мій маршрут на AutoRoam!",
  shareText: "Мій маршрут!",
  saveAndShare: "Зберегти та поділитися",
  borderInfo: "Інформація про пункт пропуску"
};
en.TripPlanner = {
  heroTitle: "Border-free travel",
  heroTitle2: "The world is waiting for you",
  heroTitle3: "Discover new horizons",
  heroTitle4: "Towards adventures",
  heroTitle5: "Your way, your rules",
  buildRoute: "Build route",
  routeParams: "Route parameters",
  fuelCalculation: "Fuel calculation",
  insuranceAndVignettes: "Insurance & Vignettes",
  totalEstimate: "Total estimate",
  timeline: "Timeline",
  map: "Map",
  back: "Back",
  routeTimeline: "Route timeline",
  shareTitle: "Check out my route on AutoRoam!",
  shareText: "My route!",
  saveAndShare: "Save & share",
  borderInfo: "Border crossing info"
};

// FuelPanel
uk.FuelPanel = {
  currency: "Валюта розрахунків",
  fuelType: "Тип палива",
  consumption: "Витрата (л/100 км)",
  petrol95: "Бензин 95",
  petrol98: "Бензин 98/100 (Преміум)",
  diesel: "Дизель",
  dieselPremium: "Дизель (Преміум)",
  lpg: "Газ (LPG)",
  estimatedCost: "Орієнтовна вартість:",
  fuelAmount: "Кількість палива:",
  leftToDistribute: "Залишилось розподілити:"
};
en.FuelPanel = {
  currency: "Currency",
  fuelType: "Fuel type",
  consumption: "Consumption (L/100 km)",
  petrol95: "Petrol 95",
  petrol98: "Petrol 98/100 (Premium)",
  diesel: "Diesel",
  dieselPremium: "Diesel (Premium)",
  lpg: "LPG",
  estimatedCost: "Estimated cost:",
  fuelAmount: "Fuel amount:",
  leftToDistribute: "Left to distribute:"
};

// HotelPanel
uk.HotelPanel = {
  stopSettings: "Налаштування зупинок",
  stopEvery: "Зупинятися кожні (годин):",
  noStops: "Без зупинок",
  hours4: "4 години",
  hours6: "6 годин",
  hours8: "8 годин",
  hours10: "10 годин",
  hours12: "12 годин",
  activateOvernight: "Активувати ночівлю",
  ignore: "Не враховувати",
  averagePrice: "Середня ціна",
  exactPrice: "Точна ціна"
};
en.HotelPanel = {
  stopSettings: "Stop settings",
  stopEvery: "Stop every (hours):",
  noStops: "No stops",
  hours4: "4 hours",
  hours6: "6 hours",
  hours8: "8 hours",
  hours10: "10 hours",
  hours12: "12 hours",
  activateOvernight: "Activate overnight",
  ignore: "Ignore",
  averagePrice: "Average price",
  exactPrice: "Exact price"
};

// BudgetPanel
uk.BudgetPanel = {
  fuel: "Паливо",
  hotel: "Ночівля",
  vignettes: "Віньєтки та збори",
  insurance: "Страхування",
  reserve: "Резерв на непередбачувані витрати",
  estimateWarning: "* Загальна сума є орієнтовною та може змінюватися залежно від стилю водіння, черг на кордонах та інших факторів."
};
en.BudgetPanel = {
  fuel: "Fuel",
  hotel: "Hotel",
  vignettes: "Vignettes & tolls",
  insurance: "Insurance",
  reserve: "Reserve for unforeseen expenses",
  estimateWarning: "* The total amount is estimated and may vary depending on driving style, border queues, and other factors."
};

// BordersPanel
uk.BordersPanel = {
  selectedCrossings: "Обрані пункти пропуску",
  checkQueues: "Перевірити черги на сайті ДПСУ",
  schengenInfo: "Після перетину кордону з ЄС ви перебуваєте в Шенгенській зоні. Внутрішні кордони між країнами Шенгенської угоди (наприклад, між Польщею та Німеччиною) зазвичай перетинаються без зупинок, хоча можливі вибіркові перевірки."
};
en.BordersPanel = {
  selectedCrossings: "Selected border crossings",
  checkQueues: "Check queues on the DPSU website",
  schengenInfo: "After crossing the EU border, you are in the Schengen area. Internal borders between Schengen countries (e.g. between Poland and Germany) are usually crossed without stops, although random checks are possible."
};

// Insurance Additions
uk.Insurance.greenCardTitle = "Зелена картка";
uk.Insurance.greenCardDesc = "Обов'язкове страхування для виїзду за кордон";
uk.Insurance.travelInsuranceTitle = "Туристичне";
uk.Insurance.travelInsuranceDesc = "Медичне страхування для виїзду за кордон";
uk.Insurance.osagoTitle = "Автоцивілка";
uk.Insurance.osagoDesc = "Обов'язкове страхування в Україні";
uk.Insurance.accidentTitle = "Нещасні випадки";
uk.Insurance.accidentDesc = "Додаткове страхування водія та пасажирів";
uk.Insurance.requiredForEU = "Обов'язково для авто з українською реєстрацією в ЄС";
uk.Insurance.requiredForMedical = "Покриває непередбачені медичні витрати за кордоном";
uk.Insurance.requiredForUA = "Обов'язковий поліс для пересування дорогами України";
uk.Insurance.extraProtection = "Додатковий захист життя та здоров'я в дорозі";

en.Insurance.greenCardTitle = "Green Card";
en.Insurance.greenCardDesc = "Mandatory insurance for traveling abroad";
en.Insurance.travelInsuranceTitle = "Travel Insurance";
en.Insurance.travelInsuranceDesc = "Medical insurance for traveling abroad";
en.Insurance.osagoTitle = "OSAGO";
en.Insurance.osagoDesc = "Mandatory insurance in Ukraine";
en.Insurance.accidentTitle = "Accident Insurance";
en.Insurance.accidentDesc = "Additional insurance for driver and passengers";
en.Insurance.requiredForEU = "Mandatory for cars with Ukrainian registration in the EU";
en.Insurance.requiredForMedical = "Covers unforeseen medical expenses abroad";
en.Insurance.requiredForUA = "Mandatory policy for driving on Ukrainian roads";
en.Insurance.extraProtection = "Additional protection of life and health on the road";

// JourneyView
uk.JourneyView = {
  loading: "Завантажуємо маршрут...",
  routeDetails: "Деталі маршруту",
  distance: "Відстань",
  travelTime: "Час у дорозі",
  fuel: "Паливо",
  budget: "Кошторис",
  returnToSite: "Повернутися на сайт",
  share: "Поділитися",
  supportProject: "Підтримати проект"
};
en.JourneyView = {
  loading: "Loading route...",
  routeDetails: "Route details",
  distance: "Distance",
  travelTime: "Travel time",
  fuel: "Fuel",
  budget: "Budget",
  returnToSite: "Return to site",
  share: "Share",
  supportProject: "Support project"
};

// Modals
uk.Modals = {
  contactUsTitle: "Звʼязатися з нами",
  chooseMethod: "Оберіть зручний для вас спосіб звʼязку",
  askQuestion: "Задати питання",
  yourName: "Ваше ім'я",
  email: "Електронна пошта",
  message: "Повідомлення",
  send: "Надіслати",
  rateAutoRoam: "Оцініть AutoRoam",
  supportProject: "Підтримати проект",
  privacyTitle: "Політика конфіденційності",
  termsTitle: "Умови використання",
  close: "Закрити",
  cancel: "Скасувати",
  confirm: "Підтвердити"
};
en.Modals = {
  contactUsTitle: "Contact Us",
  chooseMethod: "Choose a convenient contact method",
  askQuestion: "Ask a question",
  yourName: "Your Name",
  email: "Email",
  message: "Message",
  send: "Send",
  rateAutoRoam: "Rate AutoRoam",
  supportProject: "Support Project",
  privacyTitle: "Privacy Policy",
  termsTitle: "Terms of Use",
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm"
};

// Added Modal strings
uk.Modals.supportSubtitle = "Напишіть нам, і ми відповімо якнайшвидше";
en.Modals.supportSubtitle = "Write to us and we will answer as soon as possible";
uk.Modals.sending = "Надсилання...";
en.Modals.sending = "Sending...";
uk.Modals.thankYou = "Дякуємо!";
en.Modals.thankYou = "Thank you!";
uk.Modals.messageSent = "Ваше повідомлення надіслано. Ми відповімо на вашу пошту якнайшвидше.";
en.Modals.messageSent = "Your message has been sent. We will reply to your email as soon as possible.";
uk.Modals.orWriteIn = "або напишіть в";
en.Modals.orWriteIn = "or write to us on";
uk.Modals.ratingSubtitle = "Ваша підтримка допомагає нам ставати кращими";
en.Modals.ratingSubtitle = "Your support helps us get better";
uk.Modals.thanksForRating = "Дякуємо за вашу оцінку!";
en.Modals.thanksForRating = "Thank you for your rating!";
uk.Modals.supportProjectSubtitle = "Допоможіть нам розвивати AutoRoam далі";
en.Modals.supportProjectSubtitle = "Help us develop AutoRoam further";
uk.Modals.loading = "Завантаження...";
en.Modals.loading = "Loading...";

uk.MapPicker.mapPoint = "Точка на карті";
en.MapPicker.mapPoint = "Point on map";
uk.MapPicker.selected = "Обрано:";
en.MapPicker.selected = "Selected:";

// Onboarding
uk.Onboarding = {
  skip: "Пропустити",
  next: "Далі",
  done: "Готово",
  desktopStep1Title: "Точки маршруту",
  desktopStep1Desc: "Введіть точки маршруту. Можна додати проміжні зупинки та змінити їх порядок.",
  desktopStep2Title: "Налаштування маршруту",
  desktopStep2Desc: "Виберіть валюту та тип палива, налаштуйте параметри ночівель.",
  desktopStep3Title: "Фінансовий звіт",
  desktopStep3Desc: "Тут відображатиметься повна вартість подорожі з урахуванням палива, віньєток та інших витрат.",
  tabletStep1Title: "Меню навігації",
  tabletStep1Desc: "Всі налаштування маршруту, витрат та кордонів знаходяться в цьому меню.",
  tabletStep2Title: "Управління маршрутом",
  tabletStep2Desc: "Тут ви можете побудувати маршрут, побачити хронологію та зберегти його.",
  mobileStep1Title: "Пошук та налаштування",
  mobileStep1Desc: "Натисніть на цю панель, щоб налаштувати точки маршруту, параметри авто та переглянути бюджет.",
  journeyStep1Title: "Хронологія",
  journeyStep1Desc: "Тут відображається детальна хронологія вашої подорожі з усіма зупинками та розрахунками."
};
en.Onboarding = {
  skip: "Skip",
  next: "Next",
  done: "Done",
  desktopStep1Title: "Route points",
  desktopStep1Desc: "Enter route points. You can add intermediate stops and change their order.",
  desktopStep2Title: "Route settings",
  desktopStep2Desc: "Select currency and fuel type, adjust overnight stay settings.",
  desktopStep3Title: "Financial report",
  desktopStep3Desc: "This will display the total cost of the trip, including fuel, vignettes, and other expenses.",
  tabletStep1Title: "Navigation menu",
  tabletStep1Desc: "All route, expense, and border settings are located in this menu.",
  tabletStep2Title: "Route management",
  tabletStep2Desc: "Here you can build a route, see the timeline, and save it.",
  mobileStep1Title: "Search & Settings",
  mobileStep1Desc: "Tap this panel to set up route points, car parameters, and view the budget.",
  journeyStep1Title: "Timeline",
  journeyStep1Desc: "This displays a detailed timeline of your trip with all stops and calculations."
};

// MapPicker
uk.MapPicker = {
  choosePoint: "Оберіть точку на карті",
  clickOnMap: "Клікніть на мапі, щоб додати проміжну зупинку",
  loadingMap: "Завантаження карти..."
};
en.MapPicker = {
  choosePoint: "Choose a point on the map",
  clickOnMap: "Click on the map to add an intermediate stop",
  loadingMap: "Loading map..."
};

// ArticleRating
uk.ArticleRating = {
  boring: "Скучно",
  normal: "Нормально",
  fire: "Вогонь!",
  heart: "В саме серце",
  packing: "Вже пакую валізи!"
};
en.ArticleRating = {
  boring: "Boring",
  normal: "Normal",
  fire: "Fire!",
  heart: "To the heart",
  packing: "Packing bags!"
};

// LeftPlaceholder
uk.LeftPlaceholder = {
  smartPlanning: "Розумне планування",
  smartPlanningDesc: "Враховує зупинки, кордони, ночівлі та час у дорозі.",
  borders: "Кордони",
  bordersDesc: "Вказує які документи необхідні та чи потрібна Зелена картка.",
  vignettes: "Віньєтки",
  vignettesDesc: "Надає посилання на офіційні сайти для купівлі дорожніх зборів.",
  fuel: "Паливо",
  fuelDesc: "Точно рахує витрати з урахуванням вартості пального в кожній країні.",
  hotels: "Готелі",
  hotelsDesc: "Допомагає розрахувати бюджет на ночівлі під час подорожі.",
  offline: "Офлайн (PWA)",
  offlineDesc: "Доступ до збережених маршрутів навіть без інтернету."
};
en.LeftPlaceholder = {
  smartPlanning: "Smart planning",
  smartPlanningDesc: "Takes into account stops, borders, overnights, and travel time.",
  borders: "Borders",
  bordersDesc: "Indicates what documents are required and whether a Green Card is needed.",
  vignettes: "Vignettes",
  vignettesDesc: "Provides links to official websites to purchase road tolls.",
  fuel: "Fuel",
  fuelDesc: "Accurately calculates costs based on fuel prices in each country.",
  hotels: "Hotels",
  hotelsDesc: "Helps calculate the budget for overnight stays during the trip.",
  offline: "Offline (PWA)",
  offlineDesc: "Access saved routes even without internet."
};


fs.writeFileSync(ukPath, JSON.stringify(uk, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
console.log('Successfully injected translations!');
