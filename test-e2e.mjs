import puppeteer from 'puppeteer';

(async () => {
  console.log("Starting Puppeteer E2E test...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  const inputs = await page.$$('input.peer');
  console.log(`Found ${inputs.length} input elements.`);
  
  if (inputs.length >= 2) {
    console.log("Typing 'Берлін'...");
    await inputs[0].type('Берлін');
    await page.waitForSelector('.z-\\[100\\] div.p-3', { timeout: 5000 }).catch(() => console.log("Timeout waiting for suggestion"));
    
    const suggestions1 = await page.$$('.z-\\[100\\] div.p-3');
    console.log(`Suggestions for 'Берлін': ${suggestions1.length}`);
    if (suggestions1.length > 0) {
      await suggestions1[0].click();
      console.log("Clicked Berlin suggestion.");
    }
    
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Typing 'Київ'...");
    await inputs[1].type('Київ');
    await page.waitForSelector('.z-\\[100\\] div.p-3', { timeout: 5000 }).catch(() => console.log("Timeout waiting for suggestion"));
    
    const suggestions2 = await page.$$('.z-\\[100\\] div.p-3');
    console.log(`Suggestions for 'Київ': ${suggestions2.length}`);
    if (suggestions2.length > 0) {
      await suggestions2[0].click();
      console.log("Clicked Kyiv suggestion.");
    }
    
    console.log("Waiting for route calculation...");
    await new Promise(r => setTimeout(r, 4000));
    
    const panels = await page.evaluate(() => {
      // Collect visible text from some elements
      return Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
    });
    console.log("Active Panel Headers:", panels);
  }

  await browser.close();
  console.log("Test finished.");
})();
