const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  {
    // Slide 1 — Hook
    topLabel: '',
    bigText: 'Bilmediğin\nSeni Öldürebilir',
    subText: '',
    bottomText: '',
    accent: '#ef4444',
    bgGrad: 'linear-gradient(180deg, #1a0a0a 0%, #0a1628 100%)',
  },
  {
    // Slide 2 — Shocking stat
    topLabel: 'JAMA Internal Medicine · 2007',
    bigText: '%52',
    subText: 'Sağlık okuryazarlığı düşük olanların\nölüm riski bu kadar daha yüksek',
    bottomText: 'Baker et al. · 3.260 kişi · 6 yıl takip',
    accent: '#ef4444',
    bgGrad: 'linear-gradient(180deg, #1e0505 0%, #0a1628 100%)',
  },
  {
    // Slide 3 — Turkey stat
    topLabel: 'T.C. SAĞLIK BAKANLIĞI · 2023',
    bigText: '%53,9',
    subText: 'Türkiye nüfusunun yarısından fazlasının\nsağlık okuryazarlığı yetersiz veya sınırlı',
    bottomText: '9.541 katılımcı · 15.430 hane · Yüz yüze görüşme',
    accent: '#E8963E',
    bgGrad: 'linear-gradient(180deg, #1a1005 0%, #0a1628 100%)',
  },
  {
    // Slide 4 — BMJ
    topLabel: 'BMJ · 2012 · İNGİLTERE',
    bigText: '%16 vs %6',
    subText: 'Düşük okuryazarlık grubunda ölüm oranı\nyüksek grubun neredeyse 3 katı',
    bottomText: 'Bostock & Steptoe · 7.857 kişi · 5 yıl takip',
    accent: '#14919B',
    bgGrad: 'linear-gradient(180deg, #051a1c 0%, #0a1628 100%)',
  },
  {
    // Slide 5 — Age gap
    topLabel: 'TÜRKİYE VERİSİ',
    bigText: '%22,7',
    subText: '65 yaş üstünde yeterli sağlık\nokuryazarlığına sahip olanların oranı\n\nHer 4-5 kişiden sadece 1\'i',
    bottomText: 'En çok ihtiyaç duyanlar en az sahip olanlar',
    accent: '#ec4899',
    bgGrad: 'linear-gradient(180deg, #1a0515 0%, #0a1628 100%)',
  },
  {
    // Slide 6 — WHO quote
    topLabel: 'DÜNYA SAĞLIK ÖRGÜTÜ',
    bigText: '',
    subText: '"Sağlık okuryazarlığı, bir bireyin\nsağlık durumunun gelir, eğitim düzeyi\nve etnik gruptan daha güçlü\nbir öngörücüsüdür."',
    bottomText: 'WHO · Health Literacy Fact Sheet',
    accent: '#3b82f6',
    bgGrad: 'linear-gradient(180deg, #050f1a 0%, #0a1628 100%)',
    isQuote: true,
  },
  {
    // Slide 7 — Why it matters
    topLabel: 'NEDEN ÖNEMLİ?',
    bigText: '',
    subText: '→ İlacını yanlış kullananlar\n→ Tarama testlerini atlayanlar\n→ Mucize diyetlere inananlar\n→ Semptomları geç fark edenler\n→ Doktora soru soramayanlar',
    bottomText: 'Bilgi boşluğunu safsata dolduruyor',
    accent: '#f59e0b',
    bgGrad: 'linear-gradient(180deg, #1a1505 0%, #0a1628 100%)',
    isList: true,
  },
  {
    // Slide 8 — CTA
    topLabel: '',
    bigText: 'Bilgi\nHayat Kurtarır',
    subText: 'Kanıta dayalı · Ücretsiz · Herkes için',
    bottomText: 'uzunyasa.com',
    accent: '#14919B',
    bgGrad: 'linear-gradient(180deg, #051a1c 0%, #0a1628 100%)',
    isCTA: true,
  },
];

function generateSlideHTML(slide, index) {
  const isQuote = slide.isQuote;
  const isList = slide.isList;
  const isCTA = slide.isCTA;
  
  const bigFontSize = slide.bigText.length <= 6 ? '180px' : 
                      slide.bigText.length <= 12 ? '120px' : 
                      slide.bigText.length <= 20 ? '90px' : '72px';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  width: 1080px; height: 1920px; 
  font-family: 'Inter', sans-serif; color: #fff; 
  overflow: hidden; position: relative;
  background: ${slide.bgGrad};
}

.noise {
  position: absolute; inset: 0; opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

.content {
  position: relative; z-index: 10; width: 100%; height: 100%;
  padding: 120px 80px 140px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
}

.top-label {
  position: absolute; top: 120px; left: 0; right: 0;
  font-size: 18px; font-weight: 700; letter-spacing: 4px;
  color: ${slide.accent}; text-align: center;
  text-transform: uppercase;
}

.big-text {
  font-family: 'Playfair Display', serif;
  font-size: ${bigFontSize}; font-weight: 900;
  line-height: 1.0; color: #fff;
  text-shadow: 0 4px 40px rgba(0,0,0,0.5);
  white-space: pre-line;
  ${isCTA ? `background: linear-gradient(135deg, #14919B, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;` : ''}
}

.sub-text {
  font-size: ${isQuote ? '38px' : isList ? '36px' : '32px'}; 
  font-weight: ${isQuote ? '400' : '400'};
  color: rgba(255,255,255,${isQuote ? '0.85' : '0.75'});
  line-height: 1.5; margin-top: ${slide.bigText ? '48px' : '0'};
  white-space: pre-line;
  max-width: 850px;
  ${isQuote ? 'font-style: italic; font-family: "Playfair Display", serif; font-size: 42px; line-height: 1.4;' : ''}
  ${isList ? 'text-align: left; font-size: 38px; line-height: 1.7;' : ''}
}

.bottom-text {
  position: absolute; bottom: 140px; left: 0; right: 0;
  font-size: 18px; font-weight: 500;
  color: rgba(255,255,255,0.4); text-align: center;
  letter-spacing: 1px;
}

/* Accent line */
.accent-line {
  width: 60px; height: 4px; border-radius: 2px;
  background: ${slide.accent}; margin-bottom: 40px;
}

/* Logo for CTA slide */
.logo-cta {
  font-size: 28px; font-weight: 700; letter-spacing: 1px;
  margin-top: 48px;
}
.logo-cta .uzun { color: #fff; }
.logo-cta .yasa { color: #E8963E; }

/* Slide number */
.slide-num {
  position: absolute; top: 60px; right: 80px;
  font-size: 16px; font-weight: 600;
  color: rgba(255,255,255,0.2);
}
</style></head>
<body>
<div class="noise"></div>
<div class="content">
  <div class="slide-num">${index + 1}/8</div>
  ${slide.topLabel ? `<div class="top-label">${slide.topLabel}</div>` : ''}
  
  ${slide.bigText ? `<div class="accent-line"></div><div class="big-text">${slide.bigText}</div>` : '<div class="accent-line"></div>'}
  ${slide.subText ? `<div class="sub-text">${slide.subText}</div>` : ''}
  ${isCTA ? `<div class="logo-cta"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>` : ''}
  
  ${slide.bottomText ? `<div class="bottom-text">${slide.bottomText}</div>` : ''}
</div>
</body></html>`;
}

async function main() {
  const outDir = path.join(__dirname, 'reel-okuryazarlik');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome'
  });

  for (let i = 0; i < SLIDES.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    const html = generateSlideHTML(SLIDES[i], i);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    
    const outPath = path.join(outDir, `slide-${String(i+1).padStart(2,'0')}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    await page.close();
    console.log(`✅ slide-${String(i+1).padStart(2,'0')}.png`);
  }

  await browser.close();
  console.log(`\n🎉 ${SLIDES.length} reel slaytı üretildi → ${outDir}/`);
}

main().catch(console.error);
