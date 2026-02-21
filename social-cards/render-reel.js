const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SLIDES = [
  {
    id: 'hook',
    bg: 'hook-bg',
    html: `
      <div class="hook-content">
        <div class="hook-emoji">💊</div>
        <div class="hook-main">İĞNEYE SON!</div>
        <div class="hook-line"></div>
        <div class="hook-sub">FDA oral kilo verme hapını onayladı</div>
      </div>`
  },
  {
    id: 'fact1',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">1</div>
        <div class="fact-main">Artık iğne yok —<br><span class="fact-accent">oral GLP-1</span> onaylandı</div>
      </div>
      <div class="source-line">Kaynak: FDA / AJMC, Şubat 2026</div>`
  },
  {
    id: 'fact2',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">2</div>
        <div class="fact-main"><span class="fact-accent">%15</span>'e kadar<br>kilo kaybı kanıtlandı</div>
      </div>
      <div class="source-line">Kaynak: OASIS 4 Klinik Çalışması</div>`
  },
  {
    id: 'fact3',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">3</div>
        <div class="fact-main">Günde <span class="fact-accent">1 hap</span>,<br>haftada 1 iğne değil</div>
      </div>`
  },
  {
    id: 'fact4',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">4</div>
        <div class="fact-main"><span class="fact-accent">FDA onaylı</span>,<br>OASIS 4 verisi güçlü</div>
      </div>
      <div class="source-line">Kaynak: FDA, Şubat 2026</div>`
  },
  {
    id: 'fact5',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">5</div>
        <div class="fact-main"><span class="fact-accent">ABD</span>'de<br>satışa başladı</div>
      </div>`
  },
  {
    id: 'summary',
    bg: 'summary-bg',
    html: `
      <div class="summary-content">
        <div class="summary-icon">🧬</div>
        <div class="summary-text"><span class="summary-accent">Oral GLP-1</span> çağı<br>resmen başladı</div>
      </div>`
  },
  {
    id: 'cta',
    bg: 'cta-bg',
    html: `
      <div class="bokeh b1"></div>
      <div class="bokeh b2"></div>
      <div class="bokeh b3"></div>
      <div class="bokeh b4"></div>
      <div class="cta-content">
        <div class="cta-logo"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>
        <div class="cta-tagline">Bilimle Daha Uzun Yaşa</div>
        <div class="cta-actions">
          <div class="cta-btn">Kaydet 🔖</div>
          <div class="cta-btn">Paylaş 📤</div>
        </div>
        <div class="cta-handle">@uzunyasaorg</div>
        <div class="cta-url">uzunyasa.com</div>
      </div>`
  }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const templatePath = path.resolve(__dirname, 'reel-slides.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const outDir = path.resolve(__dirname, 'slides');
  fs.mkdirSync(outDir, { recursive: true });

  for (const slide of SLIDES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    // Inject slide content
    let html = templateHtml
      .replace(/class="[^"]*-bg"/, `class="${slide.bg}"`)
      .replace(/<!-- HOOK SLIDE[\s\S]*?<div class="footer-bar">/,
        `${slide.html}\n  <div class="footer-bar">`);

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));

    const outPath = path.join(outDir, `${slide.id}.jpg`);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 95 });
    console.log(`✅ ${slide.id}.jpg`);
    await page.close();
  }

  await browser.close();
  console.log('\nAll slides rendered!');
})();
