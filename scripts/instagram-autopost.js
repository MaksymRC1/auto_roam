const { IgApiClient } = require('instagram-private-api');
const fs = require('fs');
const path = require('path');
const routes = require('../src/data/popular-routes.json');
require('dotenv').config();

const SCREENSHOTS_DIR = path.join(__dirname, '../marketing_screenshots');
const STATE_FILE = path.join(__dirname, 'instagram-state.json');

// Get Instagram credentials from .env
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

async function postToInstagram() {
  if (!IG_USERNAME || !IG_PASSWORD) {
    console.error('❌ Помилка: Вкажіть IG_USERNAME та IG_PASSWORD у файлі .env');
    return;
  }

  // Load state to know which photo to post next
  let state = { nextIndex: 0 };
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }

  if (state.nextIndex >= routes.length) {
    console.log('✅ Всі 50 маршрутів вже опубліковано!');
    return;
  }

  const route = routes[state.nextIndex];
  const imageFilename = path.join(SCREENSHOTS_DIR, `${state.nextIndex + 1}_${route.slug}.png`);

  if (!fs.existsSync(imageFilename)) {
    console.error(`❌ Помилка: Файл ${imageFilename} не знайдено.`);
    return;
  }

  const ig = new IgApiClient();
  ig.state.generateDevice(IG_USERNAME);

  console.log(`⏳ Авторизація в Instagram для користувача ${IG_USERNAME}...`);
  try {
    await ig.account.login(IG_USERNAME, IG_PASSWORD);
    console.log('✅ Успішна авторизація!');

    // Read image file as Buffer
    const imageBuffer = fs.readFileSync(imageFilename);

    // Generate description
    const caption = `
🚗 Плануєте поїздку ${route.from} ➔ ${route.to}? 

📏 Відстань: ~${route.distanceKm} км
⏱ Час у дорозі: ~${route.timeHours} годин (без врахування кордонів)
🛂 Транзитні країни: ${route.transitCountries}

Не забудьте перевірити актуальні ціни на пальне та купити необхідні віньєтки! Все це можна безкоштовно спланувати в AutoRoam.

Посилання на планувальник у шапці профілю 🔗

#autoroam #${route.from.toLowerCase()} #${route.to.toLowerCase()} #автоподорож #подорожєвропою #українцівєвропі #віньєтки #кордон #подорожнаавто
    `.trim();

    console.log(`📤 Публікація фото для маршруту ${route.slug}...`);
    
    // Publish the photo
    const publishResult = await ig.publish.photo({
      file: imageBuffer,
      caption: caption,
    });

    console.log(`✅ Пост успішно опубліковано! ID: ${publishResult.media.id}`);

    // Update state to point to the next photo
    state.nextIndex += 1;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    
    console.log(`🎉 Наступний маршрут у черзі: ${routes[state.nextIndex]?.slug || 'Немає'}`);
    
  } catch (error) {
    console.error('❌ Виникла помилка під час публікації:', error.message);
    if (error.name === 'IgCheckpointError') {
      console.log('⚠️ Instagram просить підтвердити вхід. Зайдіть у додаток на телефоні та підтвердіть "Це був я".');
    }
  }
}

postToInstagram().catch(console.error);
