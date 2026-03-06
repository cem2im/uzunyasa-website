const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const STORIES = [
  {
    // Slide 1: Hook
    topLabel: 'PROF. DR. CEM ŞİMŞEK',
    topSub: 'Gastroenteroloji Uzmanı',
    bigText: 'Türkiye İlk Kez\nDünyanın En İyi\nHastaneleri\nArasında',
    subText: 'Newsweek + Statista · 2026\n32 ülke · 2.530 hastane değerlendirildi',
    accent: '#DC2626',
    bgGradient: 'linear-gradient(165deg, #fff5f5 0%, #fee2e2 20%, #fecaca 60%, #fda4af 100%)',
    textColor: '#1a1a2e',
    slideNum: '1/4',
    footer: 'Kaydırın →',
    flagEmoji: '🇹🇷'
  },
  {
    // Slide 2: The 3 hospitals
    topLabel: '🏆 DÜNYA İLK 250',
    topSub: 'Newsweek World\'s Best Hospitals 2026',
    bigText: '3 Türk\nHastanesi',
    subText: '#213  Koç Üniversitesi Hastanesi\n           %91.8 skor · İstanbul\n\n#234  Hacettepe Üniversitesi\n           %83.5 skor · Ankara\n\n#248  Anadolu Sağlık Merkezi\n           %82.1 skor · Gebze',
    accent: '#0D7377',
    bgGradient: 'linear-gradient(165deg, #f0fdfa 0%, #ccfbf1 30%, #99f6e4 100%)',
    textColor: '#1a1a2e',
    slideNum: '2/4',
    source: 'rankings.newsweek.com'
  },
  {
    // Slide 3: Context — what it means
    topLabel: 'NE ANLAMA GELİYOR?',
    topSub: '',
    bigText: 'İlk Katılımda\nİlk 250\'ye\n3 Hastane',
    subText: 'Türkiye bu sıralamaya 2026\'da\nilk kez dahil edildi.\n\nİlk yılda 3 hastanenin\ndünyanın en iyileri arasına girmesi\nciddi bir başarı.\n\nSağlık turizminin yükselişi\ntesadüf değil.',
    accent: '#E8963E',
    bgGradient: 'linear-gradient(165deg, #fffbf0 0%, #fef3c7 30%, #fde68a 100%)',
    textColor: '#1a1a2e',
    slideNum: '3/4'
  },
  {
    // Slide 4: Pride + personal touch
    topLabel: 'PROF. DR. CEM ŞİMŞEK',
    topSub: 'Gastroenteroloji Uzmanı',
    bigText: 'Türk Tıbbı\nYükseliyor.',
    subText: 'Dünya 1. Mayo Clinic\nDünya 2. Toronto General\nDünya 3. Cleveland Clinic\n\nBiz de bu yolda ilerliyoruz.\nHedef: Daha çok Türk hastanesi,\ndaha yüksek sıralarda. 🇹🇷',
    accent: '#DC2626',
    bgGradient: 'linear-gradient(165deg, #fff5f5 0%, #ffe4e6 30%, #fecdd3 100%)',
    textColor: '#1a1a2e',
    slideNum: '4/4',
    isCTA: true
  }
];

function generateStoryHTML(s) {
  const accent = s.accent;
  const isCTA = s.isCTA;
  const textLen = s.bigText.length;

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

.top { text-align: center; }
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

.accent-line {
  width: 80px; height: 5px;
  background: ${accent};
  border-radius: 3px;
  margin: 0 auto;
}

.middle {
  text-align: center;
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 45px;
}

.big-text {
  font-family: 'Playfair Display', serif;
  font-size: ${textLen <= 30 ? '90px' : textLen <= 50 ? '76px' : textLen <= 70 ? '66px' : '58px'};
  font-weight: 900;
  line-height: 1.15;
  white-space: pre-line;
  color: ${s.textColor};
  ${isCTA ? `background: linear-gradient(135deg, #DC2626, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;` : ''}
}

.sub-text {
  font-size: 30px;
  font-weight: 400;
  color: #444;
  line-height: 1.65;
  white-space: pre-line;
  max-width: 900px;
  text-align: left;
}

.bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.source {
  font-size: 18px; font-weight: 500;
  color: #999; font-style: italic;
}

.slide-num {
  font-size: 18px; font-weight: 700;
  color: ${accent}; letter-spacing: 2px;
}

.footer-cta {
  font-size: 24px; font-weight: 700;
  color: ${accent}; letter-spacing: 1px;
}

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

  const outDir = path.join(__dirname, 'story-hospital-ranking');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < STORIES.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(generateStoryHTML(STORIES[i]), { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, `story-${i+1}.png`), type: 'png' });
    await page.close();
    console.log(`✅ Story ${i+1}/4`);
  }

  await browser.close();
  console.log('🎉 Hastane ranking story\'leri hazır!');
}

main().catch(console.error);
