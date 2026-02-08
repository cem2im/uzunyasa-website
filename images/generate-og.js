const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  const html = `<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1200px; height: 630px;
  background: linear-gradient(135deg, #0D7377 0%, #195157 100%);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-family: 'Inter', sans-serif;
  color: white;
  position: relative;
  overflow: hidden;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.03);
}
.c1 { width: 600px; height: 600px; top: -200px; right: -100px; }
.c2 { width: 400px; height: 400px; bottom: -150px; left: -100px; }
.logo {
  font-family: 'Playfair Display', serif;
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -1px;
  margin-bottom: 24px;
}
.tagline {
  font-size: 28px;
  font-weight: 500;
  opacity: 0.95;
  margin-bottom: 16px;
  font-style: italic;
}
.subtitle {
  font-size: 20px;
  font-weight: 400;
  opacity: 0.75;
  margin-bottom: 40px;
}
.url {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.6;
  padding: 8px 24px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 30px;
}
.divider {
  width: 80px; height: 3px;
  background: rgba(255,255,255,0.4);
  margin-bottom: 24px;
  border-radius: 2px;
}
</style>
</head>
<body>
<div class="bg-circle c1"></div>
<div class="bg-circle c2"></div>
<div class="logo">UzunYaşa</div>
<div class="divider"></div>
<div class="tagline">Türkiye uzun yaşasın diye.</div>
<div class="subtitle">Kanıta dayalı kilo yönetimi platformu</div>
<div class="url">uzunyasa.com</div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(__dirname, 'og-default.png'), type: 'png' });
  await browser.close();
  console.log('Created og-default.png');
})();
