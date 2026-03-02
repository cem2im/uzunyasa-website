const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Story overlays — transparent bg with dark overlay gradient + text
// These go ON TOP of photo/video backgrounds
const STORIES = [
  {
    id: 'story-01-overlay',
    content: `
      <div style="width:1080px;height:1920px;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.55) 40%,rgba(0,0,0,0.65) 60%,rgba(0,0,0,0.4) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 80px">
        <div style="font-size:52px;margin-bottom:40px">🤔</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:78px;font-weight:900;color:#ffffff;line-height:1.15;margin-bottom:40px;letter-spacing:-1px;text-shadow:0 3px 20px rgba(0,0,0,0.6)">
          Sana bir soru:
        </h1>
        <p style="font-size:64px;font-weight:800;color:#ffffff;line-height:1.25;margin-bottom:50px;font-family:'Playfair Display',serif;text-shadow:0 3px 20px rgba(0,0,0,0.6)">
          Kaç yılın<br><em style="color:#E8963E">gerçekten</em><br>sağlıklı geçecek?
        </p>
        <div style="width:80px;height:5px;background:#E8963E;border-radius:3px;margin-bottom:50px"></div>
        <p style="font-size:34px;color:rgba(255,255,255,0.8);font-weight:500;text-shadow:0 2px 10px rgba(0,0,0,0.4)">Cevabı seni şaşırtabilir.</p>
        <div style="position:absolute;bottom:70px;text-align:center;width:100%">
          <p style="font-size:28px;font-weight:800;color:rgba(255,255,255,0.7)">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
        </div>
      </div>
    `
  },
  {
    id: 'story-02-overlay',
    content: `
      <div style="width:1080px;height:1920px;background:linear-gradient(180deg,rgba(0,0,0,0.35) 0%,rgba(0,0,0,0.7) 30%,rgba(0,0,0,0.75) 70%,rgba(0,0,0,0.5) 100%);display:flex;flex-direction:column;justify-content:center;padding:60px 70px">
        <p style="font-size:26px;color:#1ab5c1;font-weight:700;text-transform:uppercase;letter-spacing:4px;margin-bottom:35px;text-shadow:0 1px 5px rgba(0,0,0,0.5)">Türkiye Gerçeği</p>
        
        <div style="margin-bottom:40px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
            <span style="font-size:26px;font-weight:600;color:rgba(255,255,255,0.8)">Yaşam Süresi</span>
            <span style="font-size:44px;font-weight:900;color:#1ab5c1">78 yıl</span>
          </div>
          <div style="height:24px;background:rgba(255,255,255,0.1);border-radius:12px;overflow:hidden">
            <div style="width:100%;height:100%;background:linear-gradient(90deg,#14919B,#1ab5c1);border-radius:12px"></div>
          </div>
        </div>
        
        <div style="margin-bottom:40px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
            <span style="font-size:26px;font-weight:600;color:rgba(255,255,255,0.8)">Sağlıklı Kısmı</span>
            <span style="font-size:44px;font-weight:900;color:#10b981">57 yıl</span>
          </div>
          <div style="height:24px;background:rgba(255,255,255,0.1);border-radius:12px;overflow:hidden">
            <div style="width:73%;height:100%;background:linear-gradient(90deg,#059669,#10b981);border-radius:12px"></div>
          </div>
        </div>
        
        <div style="text-align:center;margin:30px 0">
          <p style="font-family:'Playfair Display',serif;font-size:120px;font-weight:900;color:#ef4444;line-height:1;text-shadow:0 4px 25px rgba(239,68,68,0.3)">20.5</p>
          <p style="font-size:32px;font-weight:700;color:#f87171;margin-top:8px">yıl fark</p>
        </div>

        <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:30px;text-align:center;margin-top:25px">
          <p style="font-size:36px;font-weight:700;color:#ffffff;line-height:1.5;text-shadow:0 1px 8px rgba(0,0,0,0.3)">
            Bu farkı kapatmak<br><span style="color:#1ab5c1">mümkün</span> 💪
          </p>
        </div>
        
        <div style="position:absolute;bottom:60px;left:0;right:0;text-align:center">
          <p style="font-size:20px;color:rgba(255,255,255,0.5)">Kaynak: TÜİK 2025 · WHO HALE</p>
        </div>
      </div>
    `
  },
  {
    id: 'story-03-overlay',
    content: `
      <div style="width:1080px;height:1920px;background:linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.5) 35%,rgba(0,0,0,0.6) 65%,rgba(0,0,0,0.3) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 70px">
        <div style="font-size:48px;margin-bottom:25px">🌿</div>
        <p style="font-size:32px;color:#34d399;font-weight:700;margin-bottom:30px;text-shadow:0 2px 10px rgba(0,0,0,0.5)">Harvard araştırdı:</p>
        
        <h1 style="font-family:'Playfair Display',serif;font-size:110px;font-weight:900;color:#34d399;line-height:1.1;margin-bottom:15px;text-shadow:0 4px 25px rgba(0,0,0,0.5)">
          +14 yıl
        </h1>
        <p style="font-size:40px;font-weight:700;color:#ffffff;margin-bottom:45px;text-shadow:0 2px 12px rgba(0,0,0,0.5)">sağlıklı ömür</p>
        
        <div style="width:100px;height:3px;background:rgba(255,255,255,0.3);margin-bottom:45px"></div>
        
        <p style="font-size:34px;color:rgba(255,255,255,0.9);line-height:1.6;font-weight:500;margin-bottom:15px;text-shadow:0 2px 10px rgba(0,0,0,0.4)">
          5 basit alışkanlık ile.
        </p>
        
        <div style="text-align:left;margin:25px 0;padding:0 30px">
          <p style="font-size:32px;color:rgba(255,255,255,0.85);line-height:2.0;font-weight:500;text-shadow:0 2px 10px rgba(0,0,0,0.4)">
            ✅ Sigara içmemek<br>
            ✅ Sağlıklı beslenme<br>
            ✅ Düzenli egzersiz<br>
            ✅ Sağlıklı kilo<br>
            ✅ Ilımlı alkol tüketimi
          </p>
        </div>
        
        <p style="font-size:20px;color:rgba(255,255,255,0.4);margin-top:35px;text-shadow:0 1px 5px rgba(0,0,0,0.3)">Li et al. 2018 · Circulation</p>
        
        <div style="position:absolute;bottom:70px;text-align:center;width:100%">
          <p style="font-size:28px;font-weight:800;color:rgba(255,255,255,0.7)">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
        </div>
      </div>
    `
  },
  {
    id: 'story-04-overlay',
    content: `
      <div style="width:1080px;height:1920px;background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.65) 35%,rgba(0,0,0,0.7) 65%,rgba(0,0,0,0.4) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 70px">
        <div style="background:rgba(20,145,155,0.2);border-radius:50%;width:100px;height:100px;display:flex;align-items:center;justify-content:center;font-size:48px;margin-bottom:30px">🧬</div>
        
        <p style="font-size:34px;color:#1ab5c1;font-weight:700;margin-bottom:20px;text-shadow:0 2px 10px rgba(0,0,0,0.5)">Merak ettin mi?</p>
        
        <h1 style="font-family:'Playfair Display',serif;font-size:72px;font-weight:900;color:#ffffff;line-height:1.2;margin-bottom:40px;letter-spacing:-1px;text-shadow:0 3px 20px rgba(0,0,0,0.5)">
          Senin sağlık<br>süren kaç yıl?
        </h1>
        
        <div style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:24px;padding:40px;width:88%;margin-bottom:40px">
          <p style="font-size:30px;font-weight:700;color:#ffffff;margin-bottom:30px">🎯 Ücretsiz Sağlık Süresi Testi</p>
          <div style="display:flex;justify-content:center;gap:50px;margin-bottom:25px">
            <div style="text-align:center">
              <p style="font-size:50px;font-weight:900;color:#1ab5c1">9</p>
              <p style="font-size:18px;color:rgba(255,255,255,0.6);font-weight:600">SORU</p>
            </div>
            <div style="text-align:center">
              <p style="font-size:50px;font-weight:900;color:#E8963E">2</p>
              <p style="font-size:18px;color:rgba(255,255,255,0.6);font-weight:600">DAKİKA</p>
            </div>
            <div style="text-align:center">
              <p style="font-size:50px;font-weight:900;color:#34d399">∞</p>
              <p style="font-size:18px;color:rgba(255,255,255,0.6);font-weight:600">DEĞER</p>
            </div>
          </div>
          <p style="font-size:24px;color:rgba(255,255,255,0.7);line-height:1.5">Sana özel skor + aksiyon planı</p>
        </div>
        
        <p style="font-size:32px;color:rgba(255,255,255,0.8);font-weight:600;text-shadow:0 2px 8px rgba(0,0,0,0.3)">Hazır mısın? 👆</p>
        
        <div style="position:absolute;bottom:70px;text-align:center;width:100%">
          <p style="font-size:28px;font-weight:800;color:rgba(255,255,255,0.7)">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
        </div>
      </div>
    `
  },
  {
    id: 'story-05-overlay',
    content: `
      <div style="width:1080px;height:1920px;background:linear-gradient(180deg,rgba(0,0,0,0.25) 0%,rgba(20,145,155,0.5) 30%,rgba(20,145,155,0.6) 70%,rgba(0,0,0,0.3) 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 70px">
        <p style="font-size:38px;color:rgba(255,255,255,0.9);font-weight:600;margin-bottom:40px;text-shadow:0 2px 12px rgba(0,0,0,0.4)">Hadi birlikte bakalım 👇</p>
        
        <h1 style="font-family:'Playfair Display',serif;font-size:76px;font-weight:900;color:#ffffff;line-height:1.15;margin-bottom:50px;letter-spacing:-1px;text-shadow:0 4px 25px rgba(0,0,0,0.5)">
          2 Dakikanı Ayır,<br>Hayatına<br><span style="color:#E8963E">20 Yıl</span> Kat.
        </h1>
        
        <div style="background:rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.4);border-radius:60px;padding:24px 65px;margin-bottom:50px">
          <p style="font-size:40px;font-weight:800;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.3)">uzunyasa.com/test</p>
        </div>
        
        <div style="background:rgba(0,0,0,0.2);border-radius:20px;padding:30px 40px">
          <p style="font-size:30px;color:rgba(255,255,255,0.9);line-height:1.9;font-weight:500;text-shadow:0 2px 8px rgba(0,0,0,0.3)">
            ✅ Bilimsel verilere dayalı<br>
            ✅ Tamamen ücretsiz<br>
            ✅ 2 dakikada tamamla<br>
            ✅ Kişisel aksiyon planı al
          </p>
        </div>
        
        <div style="position:absolute;bottom:70px;text-align:center;width:100%">
          <p style="font-size:28px;font-weight:800;color:rgba(255,255,255,0.9)">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
        </div>
      </div>
    `
  }
];

async function main() {
  const outDir = path.join(__dirname, 'story-saglik-testi');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const story of STORIES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    const html = `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;font-family:'Inter',sans-serif;background:transparent}</style>
</head><body>${story.content}</body></html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(outDir, `${story.id}.png`), 
      type: 'png',
      omitBackground: true 
    });
    await page.close();
    console.log(`✅ ${story.id}.png`);
  }

  await browser.close();
  console.log('🎉 Story overlay\'ler tamamlandı!');
}

main().catch(console.error);
