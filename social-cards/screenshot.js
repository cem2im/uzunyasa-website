const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  
  const htmlPath = path.resolve(__dirname, process.argv[2] || 'oral-glp1-story.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 15000 });
  
  // Wait for fonts to load
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));
  
  const outPath = path.resolve(__dirname, process.argv[3] || 'oral-glp1-story.jpg');
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 95 });
  
  console.log('Screenshot saved to:', outPath);
  await browser.close();
})();
