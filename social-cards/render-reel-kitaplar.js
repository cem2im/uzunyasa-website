const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  {
    topLabel: '',
    bigText: '10 Kitap\nHayatını Değiştirir',
    subText: 'Bilimsel kanıta dayalı sağlık kitapları',
    accent: '#7c3aed',
    bgGrad: 'linear-gradient(180deg, #1a0a2e 0%, #0a1628 100%)',
  },
  {
    topLabel: '#1 · UZUN YAŞAM',
    bigText: 'Outlive',
    subText: 'Dr. Peter Attia\n\nLongevity tıbbının kutsal kitabı.\n4 büyük ölüm nedenini önlemenin\nkanıta dayalı stratejileri.',
    bottomText: '🟢 Güçlü Kanıt · Türkçe çeviri var',
    accent: '#14919B',
    bgGrad: 'linear-gradient(180deg, #051a1c 0%, #0a1628 100%)',
  },
  {
    topLabel: '#3 · UYKU',
    bigText: 'Why We\nSleep',
    subText: 'Prof. Matthew Walker\n\n7 saatten az uyku kronik hastalık\nriskini dramatik artırıyor.\nUyku lüks değil, biyolojik zorunluluk.',
    bottomText: '🔵 İyi Kanıt · Türkçe çeviri var',
    accent: '#6366f1',
    bgGrad: 'linear-gradient(180deg, #0a0a2e 0%, #0a1628 100%)',
  },
  {
    topLabel: '#4 · BESLENME',
    bigText: 'How Not\nto Die',
    subText: 'Dr. Michael Greger\n\n15 ölüm nedeni için beslenme bazlı\nkanıtlar. Binlerce PubMed referansı.\n"Daily Dozen" listesi.',
    bottomText: '🔵 İyi Kanıt · Türkçe çeviri var',
    accent: '#16a34a',
    bgGrad: 'linear-gradient(180deg, #051a0a 0%, #0a1628 100%)',
  },
  {
    topLabel: '#6 · METABOLİZMA',
    bigText: 'Good\nEnergy',
    subText: 'Dr. Casey Means\n\nKronik hastalıkların kök nedeni:\nmitokondriyal disfonksiyon.\nABD\'de sadece %6,8 optimal\nmetabolik sağlığa sahip.',
    bottomText: '🔵 İyi Kanıt · İngilizce',
    accent: '#E8963E',
    bgGrad: 'linear-gradient(180deg, #1a1005 0%, #0a1628 100%)',
  },
  {
    topLabel: '#8 · EGZERSİZ',
    bigText: 'Exercised',
    subText: 'Prof. Daniel Lieberman\n\nHarvard evrimsel biyoloji.\nEgzersiz mitleri bilimle çürütülüyor.\nGünlük yürüyüş ölüm riskini\n%20-30 azaltıyor.',
    bottomText: '🟢 Güçlü Kanıt · Türkçe çeviri var',
    accent: '#ef4444',
    bgGrad: 'linear-gradient(180deg, #1a0505 0%, #0a1628 100%)',
  },
  {
    topLabel: '#9 · ZİHİNSEL SAĞLIK',
    bigText: 'The Body\nKeeps the\nScore',
    subText: 'Dr. Bessel van der Kolk\n\nTravma bedende nasıl kayıtlanıyor?\n30 yıllık araştırma ve fMRI verisi.',
    bottomText: '🟢 Güçlü Kanıt · Türkçe çeviri var',
    accent: '#ec4899',
    bgGrad: 'linear-gradient(180deg, #1a0515 0%, #0a1628 100%)',
  },
  {
    topLabel: '',
    bigText: 'Oku.\nAnla.\nUygula.',
    subText: 'Sağlık bilgisi lüks değil, haktır.',
    bottomText: 'uzunyasa.com',
    accent: '#14919B',
    bgGrad: 'linear-gradient(180deg, #051a1c 0%, #0a1628 100%)',
    isCTA: true,
  },
];

function generateSlideHTML(slide, index) {
  const isCTA = slide.isCTA;
  const bigFontSize = !slide.bigText ? '0px' :
                      slide.bigText.length <= 10 ? '160px' :
                      slide.bigText.length <= 18 ? '110px' :
                      slide.bigText.length <= 30 ? '88px' : '72px';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; position: relative; background: ${slide.bgGrad}; }
.noise { position: absolute; inset: 0; opacity: 0.04; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 256px; }
.content { position: relative; z-index: 10; width: 100%; height: 100%; padding: 120px 80px 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.top-label { position: absolute; top: 120px; left: 0; right: 0; font-size: 18px; font-weight: 700; letter-spacing: 4px; color: ${slide.accent}; text-align: center; text-transform: uppercase; }
.accent-line { width: 60px; height: 4px; border-radius: 2px; background: ${slide.accent}; margin-bottom: 40px; }
.big-text { font-family: 'Playfair Display', serif; font-size: ${bigFontSize}; font-weight: 900; line-height: 1.0; color: #fff; text-shadow: 0 4px 40px rgba(0,0,0,0.5); white-space: pre-line; ${isCTA ? `background: linear-gradient(135deg, #14919B, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;` : ''} }
.sub-text { font-size: 32px; font-weight: 400; color: rgba(255,255,255,0.75); line-height: 1.5; margin-top: 40px; white-space: pre-line; max-width: 850px; }
.bottom-text { position: absolute; bottom: 140px; left: 0; right: 0; font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.4); text-align: center; letter-spacing: 1px; }
.slide-num { position: absolute; top: 60px; right: 80px; font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.2); }
.logo-cta { font-size: 28px; font-weight: 700; letter-spacing: 1px; margin-top: 48px; }
.logo-cta .uzun { color: #fff; }
.logo-cta .yasa { color: #E8963E; }
</style></head>
<body>
<div class="noise"></div>
<div class="content">
  <div class="slide-num">${index + 1}/8</div>
  ${slide.topLabel ? `<div class="top-label">${slide.topLabel}</div>` : ''}
  <div class="accent-line"></div>
  ${slide.bigText ? `<div class="big-text">${slide.bigText}</div>` : ''}
  ${slide.subText ? `<div class="sub-text">${slide.subText}</div>` : ''}
  ${isCTA ? `<div class="logo-cta"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>` : ''}
  ${slide.bottomText ? `<div class="bottom-text">${slide.bottomText}</div>` : ''}
</div>
</body></html>`;
}

async function main() {
  const outDir = path.join(__dirname, 'reel-kitaplar');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'], executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome' });
  for (let i = 0; i < SLIDES.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(generateSlideHTML(SLIDES[i], i), { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, `slide-${String(i+1).padStart(2,'0')}.png`), type: 'png' });
    await page.close();
    console.log(`✅ slide-${String(i+1).padStart(2,'0')}.png`);
  }
  await browser.close();
  console.log(`\n🎉 ${SLIDES.length} slayt → ${outDir}/`);
}
main().catch(console.error);
