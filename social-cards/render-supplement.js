const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Supplement Tier List Reel Content - Viral Format
const SLIDES = [
  {
    id: 'hook',
    bg: 'hook-bg',
    html: `
      <div class="hook-content">
        <div class="hook-pill">💰🗑️</div>
        <div class="hook-main">PARANİZİ ÇÖPE Mİ<br>ATIYORSUNUZ?</div>
        <div class="hook-line"></div>
        <div class="hook-sub">Supplement'lerin<br>gerçek bilimsel puanı!</div>
      </div>`
  },
  {
    id: 'fact1',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="tier-badge tier-s">TIER S</div>
        <div class="fact-main"><span class="accent">Kanıtı çok güçlü:</span><br>Omega-3, D Vitamini<br>Kreatin, Magnezyum</div>
        <div class="fact-sub">500+ bilimsel çalışma!</div>
      </div>
      <div class="source-line">Kaynak: Cochrane Reviews, Meta-analizler</div>`
  },
  {
    id: 'fact2',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="tier-badge tier-a">TIER A</div>
        <div class="fact-main"><span class="accent">İyi kanıt:</span><br>Probiyotik, Çinko<br>B12, CoQ10</div>
        <div class="fact-sub">Doğru kişi doğru dozda almalı</div>
      </div>`
  },
  {
    id: 'fact3',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="tier-badge tier-b">TIER B</div>
        <div class="fact-main"><span class="accent">Umut verici ama erken:</span><br>NMN, Kurkumin<br>Berberin, Kolajen</div>
        <div class="fact-sub">Çoğu hayvan çalışması!</div>
      </div>`
  },
  {
    id: 'fact4',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="tier-badge tier-f">TIER F</div>
        <div class="fact-main"><span class="accent">ÇÖPE ATIN!</span><br>Detoks çayları, yağ yakıcılar<br>alkali su 🗑️</div>
        <div class="fact-sub">SIFIR bilimsel kanıt</div>
      </div>`
  },
  {
    id: 'fact5',
    bg: 'fact-bg',
    html: `
      <div class="fact-content">
        <div class="fact-num">💸</div>
        <div class="fact-main">Aylık <span class="accent">500 TL</span> supplement bütçesi?<br>En verimli kombinasyon:<br><span class="accent">D Vitamini + Omega-3 + Magnezyum</span></div>
      </div>`
  },
  {
    id: 'summary',
    bg: 'summary-bg',
    html: `
      <div class="summary-content">
        <div class="summary-icon">🔬</div>
        <div class="summary-main">Bilim ne diyorsa <span class="accent">onu al</span><br>Reklam ne diyorsa <span class="accent">sorgulan</span></div>
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
        <div class="cta-save">Tam listeyi gör: <span class="accent">uzunyasa.com</span></div>
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
  body {
    width: 1080px; height: 1920px;
    font-family: 'Inter', sans-serif; color: #fff;
    overflow: hidden; position: relative;
    background: transparent;
  }

  /* Subtle vignette overlay for text readability on video */
  .overlay {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%);
    z-index: 1;
  }
  .content-wrap {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
  }

  .watermark {
    position: absolute; top: 50px; right: 60px; z-index: 50;
    font-size: 30px; font-weight: 700;
  }
  .watermark .uzun { color: #fff; }
  .watermark .yasa { color: #E8963E; }

  .source-line {
    position: absolute; bottom: 120px; left: 0; right: 0;
    text-align: center; font-size: 22px; color: rgba(255,255,255,0.45);
  }

  .footer-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 60px;
    border-top: 2px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.3);
  }
  .footer-brand { font-size: 24px; font-weight: 700; color: #14919B; }
  .footer-tagline { font-size: 16px; color: rgba(255,255,255,0.4); font-style: italic; }

  .accent { color: #E8963E; }

  /* HOOK */
  .hook-bg { background: transparent; }
  .hook-content {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 80px;
  }
  .hook-pill { font-size: 100px; margin-bottom: 40px; }
  .hook-main {
    font-size: 78px; font-weight: 900; line-height: 1.1;
    color: #E8963E; margin-bottom: 30px;
    text-shadow: 0 4px 30px rgba(232,150,62,0.5);
  }
  .hook-line { width: 100px; height: 5px; background: #E8963E; border-radius: 3px; margin: 20px 0 30px; }
  .hook-sub {
    font-size: 44px; font-weight: 600; line-height: 1.35;
    text-shadow: 0 2px 15px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7);
  }

  /* FACT */
  .fact-bg { background: transparent; }
  .fact-content {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 80px 60px;
  }
  
  /* Tier Badges */
  .tier-badge {
    padding: 16px 40px; border-radius: 20px;
    font-size: 48px; font-weight: 900;
    margin-bottom: 50px;
    box-shadow: 0 0 40px rgba(0,0,0,0.3);
    border: 3px solid;
    text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
  
  .tier-s {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000; border-color: #FFD700;
    box-shadow: 0 0 40px rgba(255,215,0,0.4);
  }
  
  .tier-a {
    background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
    color: #000; border-color: #C0C0C0;
    box-shadow: 0 0 40px rgba(192,192,192,0.4);
  }
  
  .tier-b {
    background: linear-gradient(135deg, #CD7F32, #B8860B);
    color: #fff; border-color: #CD7F32;
    box-shadow: 0 0 40px rgba(205,127,50,0.4);
  }
  
  .tier-f {
    background: linear-gradient(135deg, #8B0000, #DC143C);
    color: #fff; border-color: #8B0000;
    box-shadow: 0 0 40px rgba(139,0,0,0.4);
  }
  
  .fact-num {
    font-size: 90px; margin-bottom: 50px;
  }
  
  .fact-main {
    font-size: 42px; font-weight: 700; line-height: 1.4;
    text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7);
    margin-bottom: 30px;
  }
  
  .fact-sub {
    font-size: 32px; font-weight: 600; 
    color: rgba(255,255,255,0.8);
    text-shadow: 0 2px 15px rgba(0,0,0,0.8);
  }

  /* SUMMARY */
  .summary-bg { background: transparent; }
  .summary-content {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 80px;
  }
  .summary-icon { font-size: 90px; margin-bottom: 40px; }
  .summary-main {
    font-size: 54px; font-weight: 900; line-height: 1.3;
    margin-bottom: 30px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7);
  }

  /* CTA */
  .cta-bg { background: transparent; }
  .cta-content {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 80px;
  }
  .cta-logo { font-size: 72px; font-weight: 900; margin-bottom: 20px; }
  .cta-logo .uzun { color: #fff; }
  .cta-logo .yasa { color: #E8963E; }
  .cta-tagline { font-size: 30px; color: rgba(255,255,255,0.7); margin-bottom: 40px; }
  .cta-save { font-size: 36px; font-weight: 600; line-height: 1.4; margin-bottom: 40px; }
  .cta-actions { display: flex; gap: 30px; margin-bottom: 40px; }
  .cta-btn {
    padding: 18px 36px; border-radius: 14px;
    font-size: 30px; font-weight: 700;
    background: rgba(255,255,255,0.12); border: 2px solid rgba(255,255,255,0.25);
  }
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
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.resolve(__dirname, 'supplement-slides');
  fs.mkdirSync(outDir, { recursive: true });

  for (const slide of SLIDES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const html = TEMPLATE
      .replace('{{BG_CLASS}}', slide.bg)
      .replace('{{CONTENT}}', slide.html);

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));

    // Save as PNG for transparency support (for video overlay)
    const outPath = path.join(outDir, `${slide.id}.png`);
    await page.screenshot({ path: outPath, type: 'png', omitBackground: true });
    
    // Also save JPG for preview
    const jpgPath = path.join(outDir, `${slide.id}.jpg`);
    await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 95 });
    
    console.log(`✅ ${slide.id}`);
    await page.close();
  }

  await browser.close();
  console.log('\n🎯 All supplement tier list slides rendered!');
})();