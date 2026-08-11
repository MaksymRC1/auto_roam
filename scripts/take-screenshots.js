const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const routes = require('../src/data/popular-routes.json');

const SCREENSHOTS_DIR = path.join(__dirname, '../marketing_screenshots');

// Ensure directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function run() {
  console.log('🚀 Запуск генератора скріншотів для TikTok / Reels...');
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: "new",
    // Optional: args to speed up rendering
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to 1:1 (Square format for Instagram Posts)
  // Width 800 x Height 800 with scale 1.5 gives a nice high-res 1200x1200 image.
  await page.setViewport({
    width: 800,
    height: 800,
    deviceScaleFactor: 1.5, // High resolution
    isMobile: true,
    hasTouch: true
  });

  console.log(`Знайдено ${routes.length} маршрутів. Починаємо роботу...`);

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const url = `https://autoroam.com.ua/marshrut/${route.slug}`;
    const filename = path.join(SCREENSHOTS_DIR, `${i + 1}_${route.slug}.png`);
    
    console.log(`[${i + 1}/${routes.length}] Робимо скріншот: ${route.slug}...`);
    
    try {
      // Go to the page and wait for it to fully load
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Wait an extra second for any animations or fonts to finish loading
      await new Promise(r => setTimeout(r, 1000));
      
      // Take the screenshot
      await page.screenshot({ path: filename });
    } catch (err) {
      console.error(`❌ Помилка на сторінці ${url}:`, err.message);
    }
  }

  await browser.close();
  console.log(`✅ Всі скріншоти успішно збережено в папку: marketing_screenshots`);
}

run().catch(console.error);
