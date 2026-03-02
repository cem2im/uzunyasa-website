const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============ STORY SERİSİ (5 adet, 1080x1920) ============
const STORIES = [
  {
    id: 'story-01',
    bg: 'linear-gradient(160deg, #ffffff 0%, #f0fafb 50%, #fef8f0 100%)',
    content: `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 50px">
        <div style="font-size:28px;margin-bottom:40px">🤔</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:52px;font-weight:900;color:#0f172a;line-height:1.2;margin-bottom:30px;letter-spacing:-1px">
          Sana bir soru:
        </h1>
        <p style="font-size:40px;font-weight:800;color:#14919B;line-height:1.3;margin-bottom:40px;font-family:'Playfair Display',serif">
          Kaç yılın<br><em>gerçekten</em><br>sağlıklı geçecek?
        </p>
        <div style="width:60px;height:4px;background:#E8963E;border-radius:2px;margin-bottom:40px"></div>
        <p style="font-size:22px;color:#94a3b8;font-weight:500">Cevabı seni şaşırtabilir.</p>
      </div>
      <div style="padding:30px 50px 60px;text-align:center">
        <p style="font-size:18px;color:#94a3b8;font-weight:600">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
      </div>
    `
  },
  {
    id: 'story-02',
    bg: 'linear-gradient(160deg, #ffffff 0%, #f8fafc 100%)',
    content: `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px 50px">
        <p style="font-size:20px;color:#14919B;font-weight:700;text-transform:uppercase;letter-spacing:3px;margin-bottom:30px">Türkiye Gerçeği</p>
        
        <div style="margin-bottom:35px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
            <span style="font-size:18px;font-weight:600;color:#475569">Yaşam Süresi</span>
            <span style="font-size:28px;font-weight:900;color:#14919B">78 yıl</span>
          </div>
          <div style="height:20px;background:#f1f5f9;border-radius:10px;overflow:hidden">
            <div style="width:100%;height:100%;background:linear-gradient(90deg,#14919B,#1ab5c1);border-radius:10px"></div>
          </div>
        </div>
        
        <div style="margin-bottom:35px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
            <span style="font-size:18px;font-weight:600;color:#475569">Sağlıklı Kısmı</span>
            <span style="font-size:28px;font-weight:900;color:#059669">57 yıl</span>
          </div>
          <div style="height:20px;background:#f1f5f9;border-radius:10px;overflow:hidden">
            <div style="width:73%;height:100%;background:linear-gradient(90deg,#059669,#10b981);border-radius:10px"></div>
          </div>
        </div>
        
        <div style="text-align:center;margin:30px 0">
          <p style="font-family:'Playfair Display',serif;font-size:80px;font-weight:900;color:#dc2626;line-height:1">20.5</p>
          <p style="font-size:20px;font-weight:700;color:#dc2626;margin-top:5px">yıl fark</p>
        </div>

        <div style="background:rgba(20,145,155,0.06);border:1px solid rgba(20,145,155,0.15);border-radius:16px;padding:24px;text-align:center;margin-top:20px">
          <p style="font-size:24px;font-weight:700;color:#0f172a;line-height:1.5">
            Bu farkı kapatmak<br><span style="color:#14919B">mümkün</span> 💪
          </p>
        </div>
      </div>
      <div style="padding:20px 50px 50px;text-align:center">
        <p style="font-size:14px;color:#94a3b8">Kaynak: TÜİK 2025 · WHO HALE</p>
      </div>
    `
  },
  {
    id: 'story-03',
    bg: 'linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #fefce8 100%)',
    content: `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 50px">
        <div style="font-size:28px;margin-bottom:30px">🌿</div>
        <p style="font-size:22px;color:#059669;font-weight:700;margin-bottom:30px">Harvard araştırdı:</p>
        
        <h1 style="font-family:'Playfair Display',serif;font-size:68px;font-weight:900;color:#059669;line-height:1.1;margin-bottom:10px">
          +14 yıl
        </h1>
        <p style="font-size:26px;font-weight:700;color:#0f172a;margin-bottom:40px">sağlıklı ömür</p>
        
        <div style="width:80%;height:1px;background:#e2e8f0;margin-bottom:40px"></div>
        
        <p style="font-size:22px;color:#475569;line-height:1.6;font-weight:500;margin-bottom:15px">
          5 basit alışkanlık ile.
        </p>
        
        <div style="text-align:left;margin:20px 0;padding:0 20px">
          <p style="font-size:20px;color:#475569;line-height:2.2;font-weight:500">
            ✅ Sigara içmemek<br>
            ✅ Sağlıklı beslenme<br>
            ✅ Düzenli egzersiz<br>
            ✅ Sağlıklı kilo<br>
            ✅ Ilımlı alkol tüketimi
          </p>
        </div>
        
        <p style="font-size:14px;color:#94a3b8;margin-top:30px">Li et al. 2018 · Circulation · 123.000 kişi · 34 yıl takip</p>
      </div>
      <div style="padding:20px 50px 50px;text-align:center">
        <p style="font-size:18px;color:#94a3b8;font-weight:600">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
      </div>
    `
  },
  {
    id: 'story-04',
    bg: 'linear-gradient(160deg, #ffffff 0%, #f0fafb 100%)',
    content: `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 50px">
        <div style="background:rgba(20,145,155,0.08);border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:30px">🧬</div>
        
        <p style="font-size:22px;color:#14919B;font-weight:700;margin-bottom:20px">Merak ettin mi?</p>
        
        <h1 style="font-family:'Playfair Display',serif;font-size:44px;font-weight:900;color:#0f172a;line-height:1.25;margin-bottom:30px;letter-spacing:-1px">
          Senin sağlık<br>süren kaç yıl?
        </h1>
        
        <div style="background:#ffffff;border:2px solid #e2e8f0;border-radius:20px;padding:30px;box-shadow:0 4px 15px rgba(0,0,0,0.06);margin-bottom:30px;width:100%">
          <p style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:15px">🎯 Ücretsiz Sağlık Süresi Testi</p>
          <div style="display:flex;justify-content:center;gap:24px;margin-bottom:15px">
            <div style="text-align:center">
              <p style="font-size:28px;font-weight:900;color:#14919B">9</p>
              <p style="font-size:12px;color:#94a3b8;font-weight:600">SORU</p>
            </div>
            <div style="text-align:center">
              <p style="font-size:28px;font-weight:900;color:#E8963E">2</p>
              <p style="font-size:12px;color:#94a3b8;font-weight:600">DAKİKA</p>
            </div>
            <div style="text-align:center">
              <p style="font-size:28px;font-weight:900;color:#059669">∞</p>
              <p style="font-size:12px;color:#94a3b8;font-weight:600">DEĞER</p>
            </div>
          </div>
          <p style="font-size:15px;color:#475569;line-height:1.5">Sana özel skor + aksiyon planı + içerik önerileri</p>
        </div>
        
        <p style="font-size:20px;color:#475569;font-weight:500">Hazır mısın? 👆</p>
      </div>
      <div style="padding:20px 50px 50px;text-align:center">
        <p style="font-size:18px;color:#94a3b8;font-weight:600">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
      </div>
    `
  },
  {
    id: 'story-05',
    bg: 'linear-gradient(160deg, #14919B 0%, #0f7a83 100%)',
    content: `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:60px 50px">
        <p style="font-size:22px;color:rgba(255,255,255,0.8);font-weight:600;margin-bottom:30px">Hadi birlikte bakalım 👇</p>
        
        <h1 style="font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:#ffffff;line-height:1.2;margin-bottom:40px;letter-spacing:-1px">
          2 Dakikanı Ayır,<br>Hayatına<br><span style="color:#E8963E">20 Yıl</span> Kat.
        </h1>
        
        <div style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:60px;padding:18px 50px;margin-bottom:50px">
          <p style="font-size:24px;font-weight:800;color:#ffffff">uzunyasa.com/test</p>
        </div>
        
        <div style="background:rgba(255,255,255,0.1);border-radius:16px;padding:20px 30px;margin-top:20px">
          <p style="font-size:16px;color:rgba(255,255,255,0.8);line-height:1.6">
            ✅ Bilimsel verilere dayalı<br>
            ✅ Tamamen ücretsiz<br>
            ✅ 2 dakikada tamamla<br>
            ✅ Kişisel aksiyon planı al
          </p>
        </div>
      </div>
      <div style="padding:30px 50px 60px;text-align:center">
        <p style="font-size:20px;font-weight:800;color:rgba(255,255,255,0.9)">Uzun<span style="color:#E8963E">Yaşa</span> 🧬</p>
      </div>
    `
  }
];

// ============ REEL SLAYTLARI (7 adet, 1080x1920) ============
const REEL_SLIDES = [
  {
    id: 'reel-01',
    text: 'Sana Bir Şey\nSöylesem...',
    sub: '',
    accent: '#14919B',
    label: ''
  },
  {
    id: 'reel-02',
    text: '78 Yıl\nYaşayacaksın.',
    sub: 'Ama hepsini sağlıklı mı?',
    accent: '#E8963E',
    label: ''
  },
  {
    id: 'reel-03',
    text: '57 Yıldan\nSonra...',
    sub: 'Ortalama bir Türk vatandaşı\nkronik hastalıklarla tanışıyor.',
    accent: '#dc2626',
    label: 'TÜİK 2025 · WHO HALE'
  },
  {
    id: 'reel-04',
    text: 'Ama\nİyi Haber Var 💪',
    sub: 'Bu farkı kapatmak\nsenin elinde.',
    accent: '#059669',
    label: ''
  },
  {
    id: 'reel-05',
    text: '5 Basit\nAlışkanlık',
    sub: 'Hayatına 14 yıl katabilir.\nEvet, on dört yıl.',
    accent: '#059669',
    label: 'Li et al. · Harvard · 2018 · Circulation'
  },
  {
    id: 'reel-06',
    text: 'Senin Sağlık\nSüren Kaç?',
    sub: '9 soru · 2 dakika\nSana özel sonuç + aksiyon planı',
    accent: '#14919B',
    label: 'ÜCRETSİZ SAĞLIK SÜRESİ TESTİ'
  },
  {
    id: 'reel-07',
    text: 'Hadi Birlikte\nBakalım 🧬',
    sub: 'uzunyasa.com/test',
    accent: '#14919B',
    label: 'Biyodaki linkten teste gir 👆',
    isCTA: true
  }
];

function generateReelSlideHTML(slide, index, total) {
  const accent = slide.accent;
  const isCTA = slide.isCTA;
  const textSize = slide.text.length > 20 ? '72px' : '82px';
  
  return `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;background:transparent;font-family:'Inter',sans-serif;overflow:hidden}</style>
</head><body>
<div style="width:1080px;height:1920px;display:flex;flex-direction:column;justify-content:space-between;padding:120px 70px 100px;position:relative">
  
  ${slide.label ? `<div style="text-align:center">
    <span style="display:inline-block;padding:8px 24px;border-radius:30px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);font-size:16px;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:2px;text-transform:uppercase">${slide.label}</span>
  </div>` : '<div></div>'}
  
  <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center">
    <h1 style="font-family:'Playfair Display',serif;font-size:${textSize};font-weight:900;color:#ffffff;line-height:1.15;letter-spacing:-2px;text-shadow:0 2px 20px rgba(0,0,0,0.4);white-space:pre-line;margin-bottom:30px">${slide.text}</h1>
    ${slide.sub ? `<p style="font-size:26px;font-weight:500;color:rgba(255,255,255,0.85);line-height:1.6;text-shadow:0 1px 10px rgba(0,0,0,0.3);white-space:pre-line">${slide.sub}</p>` : ''}
  </div>
  
  <div style="text-align:center">
    <p style="font-size:20px;font-weight:800;color:rgba(255,255,255,0.7)">Uzun<span style="color:#E8963E">Yaşa</span></p>
  </div>
</div>
</body></html>`;
}

async function main() {
  const outDir = path.join(__dirname, '..', 'social-posts', 'saglik-testi');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // ============ STORIES ============
  console.log('📱 Story görselleri üretiliyor...');
  for (const story of STORIES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    
    const html = `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{width:1080px;height:1920px;font-family:'Inter',sans-serif}</style>
</head><body>
<div style="width:1080px;height:1920px;background:${story.bg};display:flex;flex-direction:column">
${story.content}
</div>
</body></html>`;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, `${story.id}.png`), type: 'png' });
    await page.close();
    console.log(`  ✅ ${story.id}.png`);
  }

  // ============ REEL SLIDES (transparent overlay PNGs) ============
  console.log('\n🎞️ Reel slaytları üretiliyor...');
  const reelDir = path.join(__dirname, 'reel-saglik-testi');
  fs.mkdirSync(reelDir, { recursive: true });
  
  for (let i = 0; i < REEL_SLIDES.length; i++) {
    const slide = REEL_SLIDES[i];
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    
    const html = generateReelSlideHTML(slide, i, REEL_SLIDES.length);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ 
      path: path.join(reelDir, `slide-${String(i+1).padStart(2,'0')}.png`), 
      type: 'png',
      omitBackground: true 
    });
    await page.close();
    console.log(`  ✅ slide-${String(i+1).padStart(2,'0')}.png`);
  }

  await browser.close();
  console.log('\n🎉 Tamamlandı!');
  console.log(`Stories: ${outDir}/`);
  console.log(`Reel slides: ${reelDir}/`);
}

main().catch(console.error);
