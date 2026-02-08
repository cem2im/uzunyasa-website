const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const browser = await chromium.launch();
  const dir = __dirname;
  
  // Render color version
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1600, height: 400 });
  await page.goto('file://' + path.join(dir, 'generate-logo.html'), { waitUntil: 'networkidle' });
  
  // Wait for font to load
  await page.waitForTimeout(2000);
  
  const logo = await page.$('#logo');
  await logo.screenshot({ path: path.join(dir, 'logo-new.png'), omitBackground: true });
  console.log('Rendered logo-new.png');
  
  // Make everything white for dark background version
  await page.evaluate(() => {
    document.querySelector('.text').style.color = 'white';
    document.querySelectorAll('.leaf-left, .leaf-right, .stem').forEach(el => el.style.background = 'white');
    document.querySelector('.sun').style.background = 'white';
    // Update SVG gradient to white
    document.querySelectorAll('#arcGrad stop').forEach(s => s.setAttribute('stop-color', 'white'));
    document.querySelectorAll('polygon, path[fill="#E8963E"]').forEach(el => el.setAttribute('fill', 'white'));
    document.querySelectorAll('path[stroke="#E8963E"]').forEach(el => el.setAttribute('stroke', 'white'));
  });
  
  await logo.screenshot({ path: path.join(dir, 'logo-white-new.png'), omitBackground: true });
  console.log('Rendered logo-white-new.png');
  
  await page.close();
  await browser.close();
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
