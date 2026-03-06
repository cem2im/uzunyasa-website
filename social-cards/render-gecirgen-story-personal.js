const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 5 Story slides for Cem's personal Instagram — professional doctor authority
const STORIES = [
  {
    // Slide 1: Hook
    topLabel: 'PROF. DR. CEM ŞİMŞEK',
    topSub: 'Gastroenteroloji Uzmanı',
    bigText: '"Geçirgen Bağırsak"\nHakkında\n3 Gerçek',
    subText: 'Size söylenmeyen şeyler var.',
    accent: '#0D7377',
    bgGradient: 'linear-gradient(165deg, #f8fffe 0%, #e6f7f7 30%, #d0f0f0 100%)',
    textColor: '#1a1a2e',
    slideNum: '1/5',
    footer: 'Kaydırın →'
  },
  {
    // Slide 2: Zonulin
    topLabel: 'GERÇEK #1',
    topSub: '',
    bigText: 'Zonulin Testleri\nGüvenilir Değil',
    subText: '2018\'de yayımlanan bağımsız bir çalışma\ngösterdi ki piyasadaki en yaygın test kiti\naslında zonulini ölçmüyor bile.\n\nParanızı boşa harcamayın.',
    accent: '#DC2626',
    bgGradient: 'linear-gradient(165deg, #fff5f5 0%, #fee2e2 30%, #fecaca 100%)',
    textColor: '#1a1a2e',
    slideNum: '2/5',
    source: 'Scheffler et al. Front Endocrinol. 2018'
  },
  {
    // Slide 3: Cause vs effect
    topLabel: 'GERÇEK #2',
    topSub: '',
    bigText: 'Sebep mi?\nSonuç mu?\nBilmiyoruz.',
    subText: 'Çölyak ve Crohn\'da bariyer bozukluğu kesin.\nAma depresyon, otizm, akne iddialarının\narkasında güçlü kanıt yok.\n\nKorelasyon ≠ Nedensellik.',
    accent: '#E8963E',
    bgGradient: 'linear-gradient(165deg, #fffbf0 0%, #fef3c7 30%, #fde68a 100%)',
    textColor: '#1a1a2e',
    slideNum: '3/5',
    source: 'Camilleri M. Gut. 2019 (Mayo Clinic)'
  },
  {
    // Slide 4: What actually works
    topLabel: 'GERÇEK #3',
    topSub: '',
    bigText: 'İlaç Yok.\nAma Çözüm Var.',
    subText: '✓ Akdeniz diyeti — RCT ile kanıtlanmış\n✓ Lifli gıdalar — bütirat üretimi\n✓ Fermente gıdalar — yoğurt, kefir, turşu\n✓ Glutamin 15g/gün — IBS\'te etkili\n✗ Pahalı "bağırsak onarım paketleri"',
    accent: '#059669',
    bgGradient: 'linear-gradient(165deg, #f0fdf4 0%, #d1fae5 30%, #a7f3d0 100%)',
    textColor: '#1a1a2e',
    slideNum: '4/5',
    source: 'Zhou et al. Gut. 2019 | LIBRE Trial'
  },
  {
    // Slide 5: CTA
    topLabel: 'PROF. DR. CEM ŞİMŞEK',
    topSub: 'Gastroenteroloji Uzmanı',
    bigText: 'Bağırsak Sağlığınız\nÖnemli.',
    subText: 'Ama "mucize" beklemeyin.\nBilgi en iyi ilaçtır.\n\nDetaylı makale:\nuzunyasa.com',
    accent: '#0D7377',
    bgGradient: 'linear-gradient(165deg, #f8fffe 0%, #e6f7f7 30%, #ccfbf1 100%)',
    textColor: '#1a1a2e',
    slideNum: '5/5',
    isCTA: true
  }
];

function generateStoryHTML(s) {
  const accent = s.accent;
  const isCTA = s.isCTA;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1920px;
  background: ${s.bgGradient};
  font-family: 'Inter', sans-serif;
  color: ${s.textColor};
  overflow: hidden;
}

.container {
  width: 100%; height: 100%;
  padding: 120px 80px 100px;
  display: flex; flex-direction: column;
  justify-content: space-between;
}

/* Top */
.top {
  text-align: center;
}
.top-label {
  font-size: 22px; font-weight: 800;
  letter-spacing: 5px; color: ${accent};
  text-transform: uppercase;
}
.top-sub {
  font-size: 20px; font-weight: 500;
  color: #666; margin-top: 8px;
  letter-spacing: 1px;
}

/* Accent line */
.accent-line {
  width: 80px; height: 5px;
  background: ${accent};
  border-radius: 3px;
  margin: 0 auto;
}

/* Middle */
.middle {
  text-align: center;
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 50px;
}

.big-text {
  font-family: 'Playfair Display', serif;
  font-size: ${s.bigText.length <= 30 ? '90px' : s.bigText.length <= 50 ? '76px' : '64px'};
  font-weight: 900;
  line-height: 1.15;
  white-space: pre-line;
  color: ${s.textColor};
  ${isCTA ? `background: linear-gradient(135deg, #0D7377, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;` : ''}
}

.sub-text {
  font-size: 32px;
  font-weight: 400;
  color: #444;
  line-height: 1.7;
  white-space: pre-line;
  max-width: 900px;
}

/* Bottom */
.bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.source {
  font-size: 18px;
  font-weight: 500;
  color: #999;
  font-style: italic;
  max-width: 600px;
}

.slide-num {
  font-size: 18px;
  font-weight: 700;
  color: ${accent};
  letter-spacing: 2px;
}

.footer-cta {
  font-size: 24px;
  font-weight: 700;
  color: ${accent};
  letter-spacing: 1px;
}

/* Decorative corner elements */
.corner-tl, .corner-br {
  position: absolute;
  width: 120px; height: 120px;
  border: 3px solid ${accent}22;
}
.corner-tl { top: 60px; left: 40px; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
.corner-br { bottom: 60px; right: 40px; border-left: none; border-top: none; border-radius: 0 0 12px 0; }

</style></head>
<body>
<div class="corner-tl"></div>
<div class="corner-br"></div>
<div class="container">
  <div class="top">
    <div class="top-label">${s.topLabel}</div>
    ${s.topSub ? `<div class="top-sub">${s.topSub}</div>` : ''}
  </div>

  <div class="middle">
    <div class="accent-line"></div>
    <div class="big-text">${s.bigText}</div>
    <div class="sub-text">${s.subText}</div>
  </div>

  <div class="bottom">
    <div>
      ${s.source ? `<div class="source">📎 ${s.source}</div>` : ''}
      ${s.footer ? `<div class="footer-cta">${s.footer}</div>` : ''}
    </div>
    <div class="slide-num">${s.slideNum}</div>
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

  const outDir = path.join(__dirname, 'story-gecirgen-personal');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < STORIES.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    const html = generateStoryHTML(STORIES[i]);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(outDir, `story-${i+1}.png`),
      type: 'png'
    });
    await page.close();
    console.log(`✅ Story ${i+1}/5`);
  }

  await browser.close();
  console.log('\n🎉 Kişisel story\'ler hazır!');
}

main().catch(console.error);
