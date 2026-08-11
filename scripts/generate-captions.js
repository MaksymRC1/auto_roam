const fs = require('fs');
const path = require('path');
const routes = require('../src/data/popular-routes.json');

const OUTPUT_FILE = path.join(__dirname, '../marketing_screenshots/instagram_posts.txt');

let content = '=== ДОПИСИ ДЛЯ INSTAGRAM (50 МАРШРУТІВ) ===\n\n';

routes.forEach((route, index) => {
  const fileName = `${index + 1}_${route.slug}.png`;
  
  const caption = `[Фото: ${fileName}]

🚗 Плануєте поїздку ${route.from} ➔ ${route.to}? 

📏 Відстань: ~${route.distanceKm} км
⏱ Час у дорозі: ~${route.timeHours} годин (без врахування кордонів)
🛂 Транзитні країни: ${route.transitCountries}

Не забудьте перевірити актуальні ціни на пальне та купити необхідні віньєтки! Все це можна швидко та безкоштовно спланувати у нашому сервісі AutoRoam. 

Посилання на планувальник у шапці профілю 🔗

#autoroam #${route.from.toLowerCase()} #${route.to.toLowerCase()} #автоподорож #подорожєвропою #українцівєвропі #віньєтки #кордон #подорожнаавто #наавто #автотуризм
--------------------------------------------------------\n\n`;

  content += caption;
});

fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
console.log(`✅ Згенеровано тексти для ${routes.length} постів у файл: ${OUTPUT_FILE}`);
