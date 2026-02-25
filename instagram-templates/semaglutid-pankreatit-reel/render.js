#!/usr/bin/env node
const puppeteer = require('../../social-cards/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  'slide-1-hook.html',
  'slide-2-stats.html',
  'slide-3-risk.html',
  'slide-4-symptoms.html',
  'slide-5-cta.html'
];

const DIR = __dirname;
const OUT = path.join(DIR, 'output');
const MEDIA_DIR = '/home/clawdbot/.openclaw/media/inbound';

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  for (let i = 0; i < SLIDES.length; i++) {
    const file = path.join(DIR, SLIDES[i]);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.goto('file://' + file, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1500));

    // Render to output dir
    const outFile = path.join(OUT, `semaglutid-reel-${i + 1}.png`);
    await page.screenshot({ path: outFile, type: 'png' });
    
    // Also copy to media inbound
    const mediaFile = path.join(MEDIA_DIR, `semaglutid-reel-${i + 1}.png`);
    fs.copyFileSync(outFile, mediaFile);
    
    await page.close();
    console.log(`✅ ${SLIDES[i]} → semaglutid-reel-${i + 1}.png`);
  }

  await browser.close();
  console.log(`\nDone! ${SLIDES.length} slides rendered.`);
  console.log(`Output: ${OUT}/`);
  console.log(`Media:  ${MEDIA_DIR}/`);
})();
