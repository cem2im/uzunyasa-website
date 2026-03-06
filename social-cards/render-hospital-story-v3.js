const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Single page — humble, proud, personal voice from Cem, with Hacettepe photo
async function main() {
  const imgPath = path.join(__dirname, 'story-hospital-ranking', 'hacettepe-real.jpg');
  const imgData = fs.readFileSync(imgPath).toString('base64');
  const imgSrc = `data:image/jpeg;base64,${imgData}`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1920px;
  background: #fafafa;
  font-family: 'Inter', sans-serif;
  color: #1a1a2e;
  overflow: hidden;
}

/* Hacettepe photo at top */
.photo-section {
  width: 100%;
  height: 580px;
  position: relative;
  overflow: hidden;
}
.photo-section img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.photo-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 200px;
  background: linear-gradient(to top, #fafafa 0%, transparent 100%);
}
.photo-badge {
  position: absolute;
  top: 30px; left: 30px;
  background: rgba(220, 38, 38, 0.95);
  color: white;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 2.5px;
  padding: 12px 28px;
  border-radius: 30px;
  text-transform: uppercase;
}

/* Content */
.content {
  padding: 20px 72px 60px;
  display: flex; flex-direction: column;
  gap: 32px;
}

/* Personal voice header */
.personal-header {
  text-align: center;
}
.my-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #0D7377;
  text-transform: uppercase;
}

/* Main text — humble, proud */
.main-text {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 400;
  font-style: italic;
  line-height: 1.45;
  color: #2a2a3a;
  text-align: center;
  padding: 0 20px;
}
.main-text strong {
  font-weight: 900;
  font-style: normal;
  color: #1a1a2e;
}

/* Divider */
.divider {
  width: 80px; height: 4px;
  background: linear-gradient(90deg, #0D7377, #E8963E);
  border-radius: 2px;
  margin: 0 auto;
}

/* Hospital cards */
.hospitals {
  display: flex; flex-direction: column;
  gap: 16px;
}
.hospital-row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}
.hospital-row.highlight {
  border: 2px solid #0D7377;
  background: #f0fdfa;
}
.h-rank {
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  font-weight: 900;
  color: #0D7377;
  min-width: 110px;
  text-align: center;
}
.h-name {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.3;
}
.h-city {
  font-size: 22px;
  color: #888;
  margin-top: 2px;
}
.kamu-tag {
  display: inline-block;
  background: #0D7377;
  color: white;
  font-size: 16px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 12px;
  margin-left: 8px;
}

/* Bottom note */
.bottom-note {
  font-size: 22px;
  color: #888;
  text-align: center;
  line-height: 1.6;
  padding: 0 20px;
}

.source-line {
  font-size: 16px;
  color: #bbb;
  text-align: center;
  font-style: italic;
}
</style></head>
<body>

<div class="photo-section">
  <img src="${imgSrc}" alt="Hacettepe Üniversitesi Hastanesi">
  <div class="photo-overlay"></div>
  <div class="photo-badge">🇹🇷 TÜRKİYE İLK KEZ DAHİL EDİLDİ</div>
</div>

<div class="content">
  <div class="main-text">
    Newsweek <strong>"Dünyanın En İyi 250 Hastanesi"</strong> listesine Türkiye bu yıl ilk kez dahil edildi — ve <strong>3 hastanemiz</strong> listeye girdi.
  </div>

  <div class="divider"></div>

  <div class="hospitals">
    <div class="hospital-row">
      <div class="h-rank">#213</div>
      <div>
        <div class="h-name">Koç Üniversitesi Hastanesi</div>
        <div class="h-city">İstanbul</div>
      </div>
    </div>
    <div class="hospital-row highlight">
      <div class="h-rank">#234</div>
      <div>
        <div class="h-name">Hacettepe Üniversitesi Hastanesi</div>
        <div class="h-city">Ankara</div>
      </div>
    </div>
    <div class="hospital-row">
      <div class="h-rank">#248</div>
      <div>
        <div class="h-name">Anadolu Sağlık Merkezi</div>
        <div class="h-city">Gebze</div>
      </div>
    </div>
  </div>

  <div class="source-line">Newsweek + Statista · World's Best Hospitals 2026</div>
</div>

</body></html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome'
  });

  const outDir = path.join(__dirname, 'story-hospital-ranking');
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, 'story-v3.png'), type: 'png' });
  await page.close();
  await browser.close();
  console.log('✅ Story v3 hazır!');
}

main().catch(console.error);
