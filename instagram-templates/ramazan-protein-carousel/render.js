#!/usr/bin/env node
const puppeteer = require('../../social-cards/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  'slide-1-cover.html',
  'slide-2-problem.html',
  'slide-3-strategies.html',
  'slide-4-sample-day.html',
  'slide-5-cta.html'
];

const DIR = __dirname;
const OUT = path.join(DIR, 'output');

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  for (let i = 0; i < SLIDES.length; i++) {
    const file = path.join(DIR, SLIDES[i]);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.goto('file://' + file, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));
    
    const outFile = path.join(OUT, `slide-${i + 1}.png`);
    await page.screenshot({ path: outFile, type: 'png' });
    await page.close();
    console.log(`✅ ${SLIDES[i]} → ${outFile}`);
  }
  
  await browser.close();
  console.log(`\nDone! ${SLIDES.length} slides rendered to ${OUT}/`);
})();
