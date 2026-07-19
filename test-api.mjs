import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/google/')) {
      console.log(`API response [${response.status()}] from ${url}`);
      if (url.includes('/directions')) {
        const text = await response.text();
        console.log(`Directions Response length: ${text.length}`);
      }
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const inputs = await page.$$('input.peer');
  if (inputs.length >= 2) {
    console.log("Typing 'Берлін'...");
    await inputs[0].type('Берлін');
    await page.waitForSelector('.z-\\[100\\] div.p-3', { timeout: 5000 });
    const s1 = await page.$$('.z-\\[100\\] div.p-3');
    await s1[0].click();
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Typing 'Київ'...");
    await inputs[1].type('Київ');
    await page.waitForSelector('.z-\\[100\\] div.p-3', { timeout: 5000 });
    const s2 = await page.$$('.z-\\[100\\] div.p-3');
    await s2[0].click();
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Clicking Calculate Route...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const calcBtn = btns.find(b => b.innerText.includes('Побудувати маршрут'));
      if (calcBtn) calcBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 4000));
    
    const panels = await page.evaluate(() => {
      const errNodes = document.querySelectorAll('.text-red-500, .bg-red-500');
      const errs = Array.from(errNodes).map(n => n.innerText);
      const headers = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
      return { errors: errs, headers };
    });
    console.log("Status after calculate:", panels);
  }

  await browser.close();
})();
