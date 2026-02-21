const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Aralıklı Oruç: Yağ mı Kas mı Gidiyor?
const SLIDES = [
  {
    id: 'hook',
    bg: 'hook-bg',
    html: `
      <div class="hook-content">
        <div class="hook-pill">⚖️</div>
        <div class="hook-main">YAĞ MI<br>KAS MI?</div>
        <div class="hook-line"></div>
        <div class="hook-sub">Aralıklı oruç tutunca<br>vücuttan ne gidiyor?</div>
      </div>`
  },
  {
    id: 'fact1',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">1</div>
        <div class="fact-main">Yeni bir araştırma<br><span class="accent">şaşırtıcı bir şey</span> buldu:<br>Yağ hücreleri kendini<br>koruyor!</div>
      </div>
      <div class="source-line">Kaynak: Cell Reports, 2026</div>`
  },
  {
    id: 'fact2',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">2</div>
        <div class="fact-main">Yağ hücrelerindeki<br><span class="accent">IRF4 proteini</span><br>insülin düştüğünde<br>yağı korumaya alıyor</div>
      </div>
      <div class="source-line">Kaynak: Cell Reports, Marko DM ve ark.</div>`
  },
  {
    id: 'fact3',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">3</div>
        <div class="fact-main">Yani oruçta vücut<br><span class="accent">yağ yerine kası</span><br>yakmayı tercih<br>edebiliyor!</div>
      </div>`
  },
  {
    id: 'fact4',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">4</div>
        <div class="fact-main">Kas kaybını önlemek için<br><span class="accent">protein çok önemli</span><br>Kiloya göre 1.2-1.6 gram<br>protein almalısın</div>
      </div>
      <div class="source-line">Kaynak: Uluslararası Beslenme Kılavuzları</div>`
  },
  {
    id: 'fact5',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">5</div>
        <div class="fact-main"><span class="accent">Direnç egzersizi</span><br>kas kaybını önlüyor<br>Haftada en az 2 gün<br>ağırlık antrenmanı şart!</div>
      </div>`
  },
  {
    id: 'summary',
    bg: 'summary-bg',
    html: `
      <div class="summary-content">
        <div class="summary-icon">🧬</div>
        <div class="summary-main">Aralıklı oruç <span class="accent">işe yarıyor</span><br>ama doğru yapmalısın!</div>
        <div class="summary-sub">Protein + Egzersiz = Kas Koruma</div>
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
        <div class="cta-save">Bu bilgiyi kaydet ve<br>sevdiklerinle paylaş!</div>
        <div class="cta-actions">
          <div class="cta-btn">Kaydet 🔖</div>
          <div class="cta-btn">Paylaş 📤</div>
        </div>
        <div class="cta-handle">@uzunyasaorg</div>
        <div class="cta-url">uzunyasa.com</div>
      </div>`
  }
];

const TEMPLATE = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1920px; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; position: relative; background: transparent; }
  .overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%); z-index: 1; }
  .content-wrap { position: relative; z-index: 10; width: 100%; height: 100%; }
  .watermark { position: absolute; top: 50px; right: 60px; z-index: 50; font-size: 30px; font-weight: 700; }
  .watermark .uzun { color: #fff; } .watermark .yasa { color: #E8963E; }
  .source-line { position: absolute; bottom: 120px; left: 0; right: 0; text-align: center; font-size: 22px; color: rgba(255,255,255,0.45); }
  .footer-bar { position: absolute; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between; padding: 28px 60px; border-top: 2px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); }
  .footer-brand { font-size: 24px; font-weight: 700; color: #14919B; }
  .footer-tagline { font-size: 16px; color: rgba(255,255,255,0.4); font-style: italic; }
  .accent { color: #E8963E; }
  .hook-content { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; }
  .hook-pill { font-size: 100px; margin-bottom: 40px; }
  .hook-main { font-size: 88px; font-weight: 900; line-height: 1.1; color: #E8963E; margin-bottom: 30px; text-shadow: 0 4px 30px rgba(232,150,62,0.5); }
  .hook-line { width: 100px; height: 5px; background: #E8963E; border-radius: 3px; margin: 20px 0 30px; }
  .hook-sub { font-size: 44px; font-weight: 600; line-height: 1.35; text-shadow: 0 2px 15px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7); }
  .fact-content { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 70px; }
  .fact-num { width: 110px; height: 110px; border-radius: 50%; background: rgba(232,150,62,0.2); border: 3px solid rgba(232,150,62,0.6); display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 900; color: #E8963E; margin-bottom: 50px; box-shadow: 0 0 40px rgba(232,150,62,0.2); }
  .fact-main { font-size: 46px; font-weight: 700; line-height: 1.4; text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7); }
  .summary-content { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; }
  .summary-icon { font-size: 90px; margin-bottom: 40px; }
  .summary-main { font-size: 54px; font-weight: 900; line-height: 1.3; margin-bottom: 30px; text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7); }
  .summary-sub { font-size: 38px; font-weight: 600; color: #E8963E; letter-spacing: 3px; }
  .cta-content { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; }
  .cta-logo { font-size: 72px; font-weight: 900; margin-bottom: 20px; } .cta-logo .uzun { color: #fff; } .cta-logo .yasa { color: #E8963E; }
  .cta-tagline { font-size: 30px; color: rgba(255,255,255,0.7); margin-bottom: 40px; }
  .cta-save { font-size: 36px; font-weight: 600; line-height: 1.4; margin-bottom: 40px; }
  .cta-actions { display: flex; gap: 30px; margin-bottom: 40px; }
  .cta-btn { padding: 18px 36px; border-radius: 14px; font-size: 30px; font-weight: 700; background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.25); }
  .cta-handle { font-size: 26px; color: rgba(255,255,255,0.5); margin-bottom: 15px; }
  .cta-url { font-size: 30px; font-weight: 700; color: #E8963E; }
  .bokeh { position: absolute; border-radius: 50%; z-index: 0; }
  .b1 { width: 200px; height: 200px; top: 10%; left: -5%; background: radial-gradient(circle, rgba(232,150,62,0.15), transparent 70%); }
  .b2 { width: 300px; height: 300px; bottom: 15%; right: -8%; background: radial-gradient(circle, rgba(232,150,62,0.1), transparent 70%); }
  .b3 { width: 150px; height: 150px; top: 25%; right: 10%; background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%); }
  .b4 { width: 250px; height: 250px; bottom: 30%; left: 5%; background: radial-gradient(circle, rgba(20,145,155,0.15), transparent 70%); }
</style></head>
<body id="slide" class="{{BG_CLASS}}">
  <div class="overlay"></div>
  <div class="content-wrap">
    <div class="watermark"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>
    {{CONTENT}}
    <div class="footer-bar">
      <div class="footer-brand">uzunyasa.com</div>
      <div class="footer-tagline">Türkiye uzun yaşasın diye.</div>
    </div>
  </div>
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const outDir = path.resolve(__dirname, 'slides-if');
  fs.mkdirSync(outDir, { recursive: true });

  for (const slide of SLIDES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    const html = TEMPLATE.replace('{{BG_CLASS}}', slide.bg).replace('{{CONTENT}}', slide.html);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, `${slide.id}.png`), type: 'png', omitBackground: true });
    console.log(`✅ ${slide.id}`);
    await page.close();
  }

  await browser.close();
  console.log('\n🎬 IF reel slides ready!');
})();
