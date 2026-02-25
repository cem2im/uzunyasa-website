#!/usr/bin/env node
const puppeteer = require('../../social-cards/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  'slide-1.html',
  'slide-2.html', 
  'slide-3.html',
  'slide-4.html',
  'slide-5.html'
];

const DIR = __dirname;
const OUT = path.join(DIR, 'output');

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  
  console.log('🚀 Starting Sahur-Iftar carousel render...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  for (let i = 0; i < SLIDES.length; i++) {
    const file = path.join(DIR, SLIDES[i]);
    const page = await browser.newPage();
    
    // Set Instagram carousel dimensions (4:5 aspect ratio)
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.goto('file://' + file, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for Google Fonts to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1500));
    
    const outFile = path.join(OUT, `slide-${i + 1}.png`);
    await page.screenshot({ 
      path: outFile, 
      type: 'png',
      fullPage: false
    });
    await page.close();
    console.log(`✅ ${SLIDES[i]} → slide-${i + 1}.png`);
  }
  
  await browser.close();
  console.log(`\n🎉 Done! ${SLIDES.length} slides rendered to ${OUT}/`);
  console.log('📱 Ready for Instagram carousel (1080×1350, 4:5 format)');
})();