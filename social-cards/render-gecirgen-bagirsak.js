const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  {
    text: 'Geçirgen\nBağırsak\nGerçek mi?',
    sub: 'Evet. Bağırsaklarımızın bir\nkoruma duvarı var.\nBu duvar bazen zayıflayabiliyor.',
    accent: '#14919B',
    label: ''
  },
  {
    text: 'Sebep mi?\nSonuç mu?',
    sub: 'Çölyak, Crohn, ülseratif kolitte kesin.\nIBS ve karaciğer yağlanmasında\ngüçlü ilişki var.\nAma henüz bilmiyoruz.',
    accent: '#E8963E',
    label: 'BİLİM NE DİYOR?'
  },
  {
    text: 'Zonulin Testleri\nGüvenilir Değil',
    sub: '2018 çalışması gösterdi:\nEn yaygın kitin ölçtüğü şey\naslında zonulin bile değil.\nNefes testi daha faydalı.',
    accent: '#ef4444',
    label: 'Scheffler et al. · Front Endocrinol · 2018'
  },
  {
    text: 'Akdeniz\nDiyeti',
    sub: 'Bağırsak duvarını güçlendirdiği\nbilimsel çalışmayla kanıtlandı.\nSebze, meyve, zeytinyağı,\nbalık, baklagil.',
    accent: '#10b981',
    label: 'LIBRE Çalışması · RCT · Kanıtlanmış'
  },
  {
    text: 'Lifli Gıdaları\nArtır',
    sub: 'Lif → faydalı bakteriler →\nbağırsak hücrelerini besleyen\nmaddeye dönüşüyor.\n+ Yoğurt, kefir, turşu ekle.',
    accent: '#10b981',
    label: 'FERMENTE GIDALAR'
  },
  {
    text: 'Glutamin\n5g × 3/gün',
    sub: 'IBS hastalarında bağırsağı\niyileştirdiği gösterildi.\nİşlenmiş gıdayı azalt.\nAlkolü sınırla. Stresi yönet.',
    accent: '#14919B',
    label: 'Zhou et al. · Gut · 2019 · RCT'
  },
  {
    text: 'Bağırsak\nSağlığın\nÖnemli',
    sub: 'Merak etmen güzel bir şey.\nDetayları bio\'daki linkten oku.',
    accent: '#14919B',
    label: 'uzunyasa.com',
    isCTA: true
  }
];

function generateSlideHTML(slide, index, total) {
  const accent = slide.accent || '#14919B';
  const isCTA = slide.isCTA;
  const textLen = slide.text.length;
  const fontSize = textLen <= 8 ? '160px' : textLen <= 15 ? '120px' : textLen <= 25 ? '96px' : textLen <= 40 ? '78px' : '64px';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; background: transparent; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; }
.overlay {
  position: absolute; inset: 0;
  background: 
    linear-gradient(to bottom, 
      rgba(0,0,0,0.85) 0%, 
      rgba(0,0,0,0.75) 15%,
      rgba(0,0,0,0.65) 30%, 
      rgba(0,0,0,0.60) 50%, 
      rgba(0,0,0,0.65) 70%, 
      rgba(0,0,0,0.75) 85%,
      rgba(0,0,0,0.85) 100%);
}
.content {
  position: relative; z-index: 10;
  width: 100%; height: 100%;
  padding: 140px 72px 140px;
  display: flex; flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}
.top-section { flex: 0 0 auto; width: 100%; }
.label {
  font-size: 17px; font-weight: 700;
  letter-spacing: 4px; color: ${accent};
  text-transform: uppercase;
  text-shadow: 0 2px 15px rgba(0,0,0,0.9);
  line-height: 1.4;
}
.middle-section {
  flex: 1 1 auto;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  width: 100%; gap: 40px;
}
.accent-line { width: 60px; height: 4px; background: ${accent}; border-radius: 2px; }
.big-text {
  font-family: 'Playfair Display', serif;
  font-size: ${fontSize}; font-weight: 900;
  line-height: 1.1; white-space: pre-line;
  text-shadow: 0 4px 40px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6);
  max-width: 950px;
  ${isCTA ? `background: linear-gradient(135deg, #14919B, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 4px 30px rgba(0,0,0,0.6));` : ''}
}
.sub-text {
  font-size: 34px; font-weight: 400;
  color: rgba(255,255,255,0.85);
  line-height: 1.6; white-space: pre-line;
  max-width: 850px;
  text-shadow: 0 2px 25px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8);
}
.bottom-section {
  flex: 0 0 auto; width: 100%;
  display: flex; justify-content: space-between; align-items: center;
}
.slide-num { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.25); }
.logo { font-size: 20px; font-weight: 700; }
.logo .uzun { color: rgba(255,255,255,0.6); }
.logo .yasa { color: #E8963E; }
</style></head>
<body>
<div class="overlay"></div>
<div class="content">
  <div class="top-section">
    ${slide.label ? `<div class="label">${slide.label}</div>` : '&nbsp;'}
  </div>
  <div class="middle-section">
    <div class="accent-line"></div>
    <div class="big-text">${slide.text}</div>
    ${slide.sub ? `<div class="sub-text">${slide.sub}</div>` : ''}
  </div>
  <div class="bottom-section">
    <div class="slide-num">${index+1}/${total}</div>
    <div class="logo"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>
  </div>
</div>
</body></html>`;
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome'
  });

  const outDir = path.join(__dirname, 'reel-viral-gecirgen-bagirsak');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < SLIDES.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    const html = generateSlideHTML(SLIDES[i], i, SLIDES.length);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(outDir, `slide-${String(i+1).padStart(2,'0')}.png`),
      type: 'png',
      omitBackground: true
    });
    await page.close();
    console.log(`✅ Slayt ${i+1}/${SLIDES.length}`);
  }

  await browser.close();
  console.log('\n🎉 Geçirgen bağırsak reel slaytları hazır!');
}

main().catch(console.error);
