#!/usr/bin/env node
const puppeteer = require('../../social-cards/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  'slide-1-hook.html',
  'slide-2-drug.html',
  'slide-3-diagnosis.html',
  'slide-4-future.html',
  'slide-5-cta.html'
];

const DIR = __dirname;
const OUT = path.join(DIR, 'overlays');

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  for (let i = 0; i < SLIDES.length; i++) {
    const file = path.join(DIR, SLIDES[i]);
    let html = fs.readFileSync(file, 'utf8');
    
    // Force ALL backgrounds to transparent
    // Replace body background (various formats)
    html = html.replace(/(body\s*\{[^}]*?)background:\s*[^;]+;/g, '$1background: transparent;');
    
    // Remove all div backgrounds that are decorative (glows, grids, patterns)
    html = html.replace(/\.grid-bg\s*\{[^}]*\}/g, '.grid-bg { display: none; }');
    html = html.replace(/\.glow[^{]*\{[^}]*\}/g, '.glow { display: none; }');
    html = html.replace(/\.glow-1[^{]*\{[^}]*\}/g, '.glow-1 { display: none; }');
    html = html.replace(/\.glow-2[^{]*\{[^}]*\}/g, '.glow-2 { display: none; }');
    html = html.replace(/\.bg-pattern[^{]*\{[^}]*\}/g, '.bg-pattern { display: none; }');
    
    // Make card/box backgrounds semi-transparent instead of opaque
    html = html.replace(/background:\s*rgba\(255,255,255,0\.04\)/g, 'background: rgba(255,255,255,0.08)');
    html = html.replace(/background:\s*rgba\(255,255,255,0\.05\)/g, 'background: rgba(255,255,255,0.08)');
    
    // Make stat-box, comp-box backgrounds slightly visible
    html = html.replace(/background:\s*rgba\(220,38,38,0\.1\)/g, 'background: rgba(220,38,38,0.15)');
    html = html.replace(/background:\s*rgba\(13,115,119,0\.12\)/g, 'background: rgba(13,115,119,0.2)');
    
    // Footer border - make slightly more visible
    html = html.replace(/border-top:\s*2px solid rgba\(255,255,255,0\.06\)/g, 'border-top: 2px solid rgba(255,255,255,0.15)');
    
    // Add text shadow for readability on video
    html = html.replace('</style>', `
      * { text-shadow: 0 2px 12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5); }
      .footer, .footer * { text-shadow: 0 1px 8px rgba(0,0,0,0.9); }
    </style>`);
    
    const tmpFile = path.join(OUT, `_tmp_${i}.html`);
    fs.writeFileSync(tmpFile, html);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.goto('file://' + tmpFile, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1000));
    
    const outFile = path.join(OUT, `slide${i + 1}.png`);
    await page.screenshot({ path: outFile, type: 'png', omitBackground: true });
    await page.close();
    fs.unlinkSync(tmpFile);
    console.log(`✅ ${SLIDES[i]} → ${outFile}`);
  }
  
  await browser.close();
  console.log(`\nDone! ${SLIDES.length} transparent overlays rendered.`);
})();
