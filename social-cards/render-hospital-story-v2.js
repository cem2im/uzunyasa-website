const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Single story slide — clean, shareable, proud
const STORY = {
  topLabel: 'PROF. DR. CEM ŞİMŞEK',
  topSub: 'Gastroenteroloji Uzmanı',
  content: `
    <div class="flag-badge">🇹🇷 TÜRKİYE İLK KEZ DAHİL EDİLDİ</div>
    <div class="big-text">Dünyanın En İyi<br>250 Hastanesi</div>
    <div class="subtitle">Newsweek + Statista · 2026<br>32 ülke · 2.530 hastane değerlendirildi</div>
    <div class="divider"></div>
    <div class="hospital-list">
      <div class="hospital-item">
        <div class="rank">#213</div>
        <div class="hospital-info">
          <div class="hospital-name">Koç Üniversitesi Hastanesi</div>
          <div class="hospital-city">İstanbul</div>
        </div>
      </div>
      <div class="hospital-item">
        <div class="rank">#234</div>
        <div class="hospital-info">
          <div class="hospital-name">Hacettepe Üniversitesi Hastanesi</div>
          <div class="hospital-city">Ankara · <span class="kamu-badge">Tek Kamu Hastanesi</span></div>
        </div>
      </div>
      <div class="hospital-item">
        <div class="rank">#248</div>
        <div class="hospital-info">
          <div class="hospital-name">Anadolu Sağlık Merkezi</div>
          <div class="hospital-city">Gebze</div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="bottom-note">İlk katılımda 3 hastanemiz dünya ilk 250'de.<br>Türk tıbbı yükseliyor. 🇹🇷</div>
  `
};

function generateHTML() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1920px;
  background: linear-gradient(170deg, #fefefe 0%, #f8f9fa 20%, #f1f5f9 50%, #e8edf2 100%);
  font-family: 'Inter', sans-serif;
  color: #1a1a2e;
  overflow: hidden;
}

.container {
  width: 100%; height: 100%;
  padding: 100px 72px 80px;
  display: flex; flex-direction: column;
  justify-content: space-between;
}

.top { text-align: center; }
.top-label {
  font-size: 21px; font-weight: 800;
  letter-spacing: 5px; color: #0D7377;
  text-transform: uppercase;
}
.top-sub {
  font-size: 19px; font-weight: 500;
  color: #888; margin-top: 6px;
  letter-spacing: 1px;
}

.middle {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}

.flag-badge {
  background: #DC2626;
  color: white;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 3px;
  padding: 14px 36px;
  border-radius: 40px;
  margin-bottom: 50px;
  text-transform: uppercase;
}

.big-text {
  font-family: 'Playfair Display', serif;
  font-size: 80px;
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
  color: #1a1a2e;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 26px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 10px;
}

.divider {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #0D7377, #E8963E);
  border-radius: 2px;
  margin: 40px auto;
}

.hospital-list {
  width: 100%;
  max-width: 860px;
}

.hospital-item {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 24px 0;
  border-bottom: 1px solid #e5e7eb;
}
.hospital-item:last-child { border-bottom: none; }

.rank {
  font-family: 'Playfair Display', serif;
  font-size: 52px;
  font-weight: 900;
  color: #0D7377;
  min-width: 160px;
  text-align: center;
}

.hospital-name {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.3;
}

.hospital-city {
  font-size: 24px;
  color: #888;
  margin-top: 4px;
}

.kamu-badge {
  background: #0D7377;
  color: white;
  font-size: 18px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.bottom-note {
  font-size: 28px;
  color: #444;
  text-align: center;
  line-height: 1.6;
  font-weight: 500;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.source {
  font-size: 17px;
  color: #aaa;
  font-style: italic;
}

.corner-tl, .corner-br {
  position: absolute;
  width: 100px; height: 100px;
  border: 3px solid #0D737722;
}
.corner-tl { top: 50px; left: 35px; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
.corner-br { bottom: 50px; right: 35px; border-left: none; border-top: none; border-radius: 0 0 12px 0; }
</style></head>
<body>
<div class="corner-tl"></div>
<div class="corner-br"></div>
<div class="container">
  <div class="top">
    <div class="top-label">${STORY.topLabel}</div>
    <div class="top-sub">${STORY.topSub}</div>
  </div>
  <div class="middle">
    ${STORY.content}
  </div>
  <div class="bottom-bar">
    <div class="source">📎 rankings.newsweek.com</div>
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

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  await page.setContent(generateHTML(), { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, 'story-single.png'), type: 'png' });
  await page.close();
  await browser.close();
  console.log('✅ Tek sayfa story hazır!');
}

main().catch(console.error);
