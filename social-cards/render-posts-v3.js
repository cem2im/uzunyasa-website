const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ITEMS = [
  // ARAÇLAR
  { slug: 'diyet-asistani', type: 'araç', title1: 'Diyet', title2: 'Asistanı', subtitle: 'Kişisel Haftalık Yemek Planı', tags: ['Beslenme', 'Ücretsiz Araç', '2026'], icon: 'fork-knife', photo: 'photo-1490645935967-10de6ba17061' },
  { slug: 'egzersiz-asistani', type: 'araç', title1: 'Egzersiz', title2: 'Asistanı', subtitle: 'Kişisel Antrenman Programı', tags: ['Fitness', 'Ücretsiz Araç', '2026'], icon: 'dumbbell', photo: 'photo-1534438327276-14e5300c3a48' },
  { slug: 'glp1-karsilastirma', type: 'araç', title1: 'GLP-1 İlaç', title2: 'Karşılaştırma', subtitle: 'Ozempic • Wegovy • Mounjaro', tags: ['İlaç Rehberi', 'Bilimsel', '2026'], icon: 'compare', photo: 'photo-1584308666744-24d5c474f2ae' },
  { slug: 'glp1-uygunluk-testi', type: 'araç', title1: 'GLP-1', title2: 'Uygunluk Testi', subtitle: '2 Dakikada Ön Değerlendirme', tags: ['Kişisel Test', 'Bilimsel', '2026'], icon: 'clipboard', photo: 'photo-1579684385127-1ef15d508118' },
  { slug: 'kac-kilo-vermeliyim', type: 'araç', title1: 'Kaç Kilo', title2: 'Vermeliyim?', subtitle: 'Bilimsel İdeal Kilo Hesaplayıcı', tags: ['Kilo Yönetimi', 'Hesaplayıcı', '2026'], icon: 'scale', photo: 'photo-1571019613454-1cb2f99b2d8b' },
  { slug: 'kalori-karsilastirici', type: 'araç', title1: 'Kalori', title2: 'Karşılaştırıcı', subtitle: 'Hangisi Daha Kalorili?', tags: ['Quiz', 'Beslenme', '2026'], icon: 'balance', photo: 'photo-1504674900247-0877df9cc836' },
  { slug: 'makro-ucgeni', type: 'araç', title1: 'Makro', title2: 'Üçgeni', subtitle: 'Besin Makro Tahmin Oyunu', tags: ['Oyun', 'Beslenme', '2026'], icon: 'triangle', photo: 'photo-1546069901-ba9599a7e63c' },
  { slug: 'mit-kirici', type: 'araç', title1: 'Mit', title2: 'Kırıcı', subtitle: '50 Sağlık Mitini Test Et', tags: ['Quiz', 'Bilimsel', '2026'], icon: 'bolt', photo: 'photo-1532187863486-abf9dbad1b69' },
  { slug: 'sahur-iftar-planlayici', type: 'araç', title1: 'Sahur & İftar', title2: 'Planlayıcısı', subtitle: 'Ramazan Beslenme Rehberi', tags: ['Ramazan', 'Ücretsiz Araç', '2026'], icon: 'moon', photo: 'photo-1567446537708-ac4aa75c9c28' },
  { slug: 'score2-risk-hesaplayici', type: 'araç', title1: 'SCORE2 Kalp', title2: 'Risk Hesaplayıcı', subtitle: '10 Yıllık Kalp Krizi Riskin', tags: ['Kardiyoloji', 'Hesaplayıcı', '2026'], icon: 'heart', photo: 'photo-1628348068343-c6a848d2b6dd' },
  { slug: 'supplement-kanit-rehberi', type: 'araç', title1: 'Supplement', title2: 'Kanıt Rehberi', subtitle: '60+ Takviye Bilimsel Puanlama', tags: ['Takviye', 'Bilimsel', '2026'], icon: 'shield', photo: 'photo-1550572017-edd951aa8f72' },
  { slug: 'turkiye-obezite-haritasi', type: 'araç', title1: 'Türkiye Obezite', title2: 'Haritası', subtitle: '81 İl Bazlı İnteraktif Veri', tags: ['Türkiye', 'Veri', '2026'], icon: 'map', photo: 'photo-1524661135-423995f22d0b' },
  // REHBERLER
  { slug: '50-yas-egzersiz', type: 'rehber', title1: '50 Yaş Üstü', title2: 'Egzersiz Rehberi', subtitle: 'Başlamak İçin Asla Geç Değil', tags: ['Egzersiz', 'Bilimsel', '2026'], icon: 'person', photo: 'photo-1571019614242-c5c5dee9f50b' },
  { slug: 'akdeniz-diyeti', type: 'rehber', title1: 'Akdeniz Diyeti', title2: 'Başlangıç Rehberi', subtitle: 'Dünyanın 1 Numaralı Diyeti', tags: ['Beslenme', 'Bilimsel', '2026'], icon: 'leaf', photo: 'photo-1498837167922-ddd27525d352' },
  { slug: 'aralikli-oruc', type: 'rehber', title1: 'Aralıklı Oruç', title2: 'Başlangıç Rehberi', subtitle: 'Ne Zaman Yediğin de Önemli', tags: ['Beslenme', 'Bilimsel', '2026'], icon: 'clock', photo: 'photo-1495474472287-4d71bcdd2085' },
  { slug: 'evde-egzersiz', type: 'rehber', title1: 'Evde Egzersiz', title2: 'Başlangıç Rehberi', subtitle: 'Ekipmansız • Ücretsiz • Etkili', tags: ['Egzersiz', 'Başlangıç', '2026'], icon: 'home', photo: 'photo-1518611012118-696072aa579a' },
  { slug: 'kalori-acigi', type: 'rehber', title1: 'Kalori Açığı', title2: 'Oluşturma Rehberi', subtitle: 'Kilo Vermenin Tek Bilimsel Formülü', tags: ['Kilo Verme', 'Bilimsel', '2026'], icon: 'target', photo: 'photo-1490818387583-1baba5e638af' },
  { slug: 'kalp-sagligi', type: 'rehber', title1: 'Kalp Sağlığı', title2: 'Koruma Rehberi', subtitle: 'Risk Faktörlerinin %80\'i Elinde', tags: ['Kardiyoloji', 'Önleme', '2026'], icon: 'heart', photo: 'photo-1559757175-7cb057fba93c' },
  { slug: 'plato-kirma', type: 'rehber', title1: 'Plato Kırma', title2: 'Rehberi', subtitle: 'Tartı Durduğunda Ne Yapmalı?', tags: ['Kilo Verme', 'Strateji', '2026'], icon: 'trending', photo: 'photo-1517836357463-d25dfeac3438' },
  { slug: 'tip2-diyabet', type: 'rehber', title1: 'Tip 2 Diyabet', title2: 'Önleme Rehberi', subtitle: '%58 Önlenebilir Bir Hastalık', tags: ['Diyabet', 'Önleme', '2026'], icon: 'shield', photo: 'photo-1505751172876-fa1923c5c528' },
  { slug: 'uyku-kalitesi', type: 'rehber', title1: 'Uyku Kalitesi', title2: 'Artırma Rehberi', subtitle: 'Kaliteli Uykunun 10 Altın Kuralı', tags: ['Uyku', 'Bilimsel', '2026'], icon: 'moon', photo: 'photo-1515894203077-9cd36032142f' },
];

// Simple SVG icons (line art, white, no emoji)
const ICONS = {
  'fork-knife': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  'dumbbell': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M6.5 6.5h11M6 12h12"/><rect x="2" y="8" width="4" height="8" rx="1"/><rect x="18" y="8" width="4" height="8" rx="1"/><rect x="4" y="6" width="2" height="12" rx="0.5"/><rect x="18" y="6" width="2" height="12" rx="0.5"/></svg>`,
  'compare': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>`,
  'clipboard': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 2h6v3H9z"/><path d="M9 10h6M9 14h4"/></svg>`,
  'scale': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M12 3v18M5 8l7-5 7 5"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/></svg>`,
  'balance': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M12 2v20M2 7h20"/><path d="M5 7l-3 8h6L5 7zM19 7l-3 8h6l-3-8z"/></svg>`,
  'triangle': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3z"/></svg>`,
  'bolt': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  'moon': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  'heart': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  'shield': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
  'map': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>`,
  'person': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0113 0"/></svg>`,
  'leaf': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 21.34M17 8A10 10 0 003 2c0 5 .5 10 14 6z"/></svg>`,
  'clock': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  'home': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path d="M9 22V12h6v10"/></svg>`,
  'target': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  'trending': `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>`,
};

function generateHTML(item) {
  const isArac = item.type === 'araç';
  const accent = isArac ? '#14919B' : '#E8963E';
  const overlayColor = isArac ? 'rgba(8, 50, 58, 0.78)' : 'rgba(45, 25, 8, 0.75)';
  const overlayGrad = isArac 
    ? 'linear-gradient(180deg, rgba(8,50,58,0.5) 0%, rgba(8,50,58,0.85) 45%, rgba(10,22,40,0.95) 100%)'
    : 'linear-gradient(180deg, rgba(45,25,8,0.45) 0%, rgba(40,22,8,0.82) 45%, rgba(10,22,40,0.95) 100%)';
  const photoUrl = `https://images.unsplash.com/${item.photo}?w=1080&h=1080&fit=crop&q=80`;
  const iconSVG = ICONS[item.icon] || ICONS['shield'];

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1080px; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; position: relative; }

/* Photo background */
.photo-bg {
  position: absolute; inset: 0;
  background: url('${photoUrl}') center center / cover no-repeat;
}

/* Color overlay */
.overlay {
  position: absolute; inset: 0;
  background: ${overlayGrad};
}

/* Subtle noise texture */
.noise {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* Vignette */
.vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%);
}

/* Content */
.content {
  position: relative; z-index: 10; width: 100%; height: 100%;
  padding: 56px 72px; display: flex; flex-direction: column;
  align-items: center; text-align: center;
}

/* Logo */
.logo {
  display: flex; align-items: center; gap: 10px;
  font-size: 22px; font-weight: 700; letter-spacing: 1px;
  opacity: 0.9; margin-bottom: auto;
}
.logo-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: ${accent};
}
.logo-uzun { color: #fff; }
.logo-yasa { color: #E8963E; }

/* Icon circle - frosted glass */
.icon-circle {
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 40px;
}
.icon-circle svg { width: 34px; height: 34px; }

/* Title block */
.title1 {
  font-family: 'Playfair Display', serif;
  font-size: 72px; font-weight: 800; line-height: 1.05;
  color: #fff; letter-spacing: -1px;
}
.title2 {
  font-family: 'Playfair Display', serif;
  font-size: 72px; font-weight: 700; font-style: italic;
  line-height: 1.05; color: ${accent}; letter-spacing: -1px;
  margin-bottom: 24px;
}

/* Subtitle */
.subtitle {
  font-size: 24px; font-weight: 400; color: rgba(255,255,255,0.75);
  letter-spacing: 1.5px; margin-bottom: auto;
}

/* Tags */
.tags {
  display: flex; gap: 12px; margin-top: 32px;
}
.tag {
  padding: 10px 22px; border-radius: 30px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
  font-size: 17px; font-weight: 500; color: rgba(255,255,255,0.8);
  letter-spacing: 0.5px;
}

/* Bottom dots (carousel indicator) */
.dots {
  display: flex; gap: 6px; margin-top: 28px;
}
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.3);
}
.dot.active { background: #fff; width: 24px; border-radius: 4px; }
</style></head>
<body>

<div class="photo-bg"></div>
<div class="overlay"></div>
<div class="noise"></div>
<div class="vignette"></div>

<div class="content">
  <div class="logo">
    <div class="logo-dot"></div>
    <span class="logo-uzun">Uzun</span><span class="logo-yasa">Yaşa</span>
  </div>

  <div class="icon-circle">${iconSVG}</div>

  <div class="title1">${item.title1}</div>
  <div class="title2">${item.title2}</div>
  <div class="subtitle">${item.subtitle}</div>

  <div class="tags">
    ${item.tags.map(t => `<div class="tag">${t}</div>`).join('\n    ')}
  </div>
  <div class="dots">
    <div class="dot active"></div>
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>
</div>

</body></html>`;
}

async function main() {
  const outDir = path.join(__dirname, '..', 'social-posts');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome'
  });

  for (const item of ITEMS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    const html = generateHTML(item);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    // Extra wait for image load
    await new Promise(r => setTimeout(r, 2000));
    
    const outPath = path.join(outDir, `${item.slug}-post.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    await page.close();
    console.log(`✅ ${item.slug}-post.png`);
  }

  await browser.close();
  console.log(`\n🎉 ${ITEMS.length} premium post üretildi → ${outDir}/`);
}

main().catch(console.error);
