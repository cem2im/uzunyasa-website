const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SLIDES = [
  // SLIDE 1 — COVER
  {
    bg: 'photo-1532187863486-abf9dbad1b69',
    overlay: 'linear-gradient(180deg, rgba(10,22,40,0.6) 0%, rgba(10,22,40,0.92) 100%)',
    html: `
      <div class="cover-badge">ŞUBAT 2026</div>
      <div class="cover-title">Ay<br><em>Özeti</em></div>
      <div class="cover-subtitle">UzunYaşa Platformu</div>
      <div class="cover-stats">
        <div class="cs"><span>292</span><small>commit</small></div>
        <div class="cs-divider"></div>
        <div class="cs"><span>18</span><small>yeni blog</small></div>
        <div class="cs-divider"></div>
        <div class="cs"><span>3</span><small>yeni araç</small></div>
      </div>
    `,
    css: `
      .cover-badge { display:inline-block; padding:8px 24px; border-radius:30px; background:rgba(20,145,155,0.2); border:1px solid rgba(20,145,155,0.4); font-size:16px; font-weight:800; letter-spacing:4px; color:#14919B; text-transform:uppercase; margin-bottom:40px; }
      .cover-title { font-family:'Playfair Display',serif; font-size:120px; font-weight:700; line-height:0.95; margin-bottom:20px; }
      .cover-title em { color:#E8963E; font-style:italic; }
      .cover-subtitle { font-size:22px; color:rgba(255,255,255,0.6); font-weight:500; letter-spacing:2px; margin-bottom:60px; }
      .cover-stats { display:flex; align-items:center; gap:28px; }
      .cs { text-align:center; }
      .cs span { display:block; font-size:48px; font-weight:800; color:#fff; }
      .cs small { font-size:14px; color:rgba(255,255,255,0.5); font-weight:500; letter-spacing:1px; text-transform:uppercase; }
      .cs-divider { width:1px; height:50px; background:rgba(255,255,255,0.15); }
    `
  },
  // SLIDE 2 — YENİ İÇERİKLER
  {
    bg: 'photo-1504674900247-0877df9cc836',
    overlay: 'linear-gradient(180deg, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.95) 100%)',
    html: `
      <div class="slide-num">01</div>
      <div class="slide-title">Yeni<br><em>İçerikler</em></div>
      <div class="items">
        <div class="item"><div class="item-num">18</div><div class="item-text"><strong>Yeni Blog Yazısı</strong><br>GLP-1, MASLD, Mikrobiyota, Sarkopeni, Hipertansiyon…</div></div>
        <div class="item"><div class="item-num">3</div><div class="item-text"><strong>Yeni Araç</strong><br>Sahur İftar Planlayıcısı · SCORE2 · Supplement Rehberi</div></div>
        <div class="item"><div class="item-num">5+</div><div class="item-text"><strong>Instagram Reel</strong><br>GLP-1 Beyin · AI Sağlık · Sarkopeni · Mikrobiyota · MASLD</div></div>
        <div class="item"><div class="item-num">50</div><div class="item-text"><strong>Mit Kırıcı Güncelleme</strong><br>30→50 mit, 2 yeni kategori (Ramazan & Takviye)</div></div>
      </div>
    `,
    css: `
      .slide-num { font-size:72px; font-weight:800; color:rgba(20,145,155,0.25); font-family:'Playfair Display',serif; margin-bottom:8px; line-height:1; }
      .slide-title { font-family:'Playfair Display',serif; font-size:56px; font-weight:700; line-height:1.05; margin-bottom:40px; }
      .slide-title em { color:#14919B; font-style:italic; }
      .items { display:flex; flex-direction:column; gap:24px; }
      .item { display:flex; align-items:flex-start; gap:20px; }
      .item-num { font-size:36px; font-weight:800; color:#E8963E; min-width:64px; line-height:1.1; }
      .item-text { font-size:18px; line-height:1.5; color:rgba(255,255,255,0.8); }
      .item-text strong { color:#fff; font-weight:700; }
    `
  },
  // SLIDE 3 — BİLİMSEL KALİTE
  {
    bg: 'photo-1579684385127-1ef15d508118',
    overlay: 'linear-gradient(180deg, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.95) 100%)',
    html: `
      <div class="slide-num">02</div>
      <div class="slide-title">Bilimsel<br><em>Kalite</em></div>
      <div class="items">
        <div class="item"><div class="item-num">26</div><div class="item-text"><strong>Blog Akademik İnceleme</strong><br>Kanıt etiketleri, referans düzeltmeleri, hype temizliği</div></div>
        <div class="item"><div class="item-icon">📋</div><div class="item-text"><strong>Medikal Yazım Protokolü</strong><br>8 kural: PICO kilidi, sınıf vs molekül, zorunlu negatif kanıt</div></div>
        <div class="item"><div class="item-icon">🔬</div><div class="item-text"><strong>DHA/Omega-3 Düzeltmesi</strong><br>Sınıf genelleme hatası bulundu ve tüm sitede düzeltildi</div></div>
        <div class="item"><div class="item-icon">✅</div><div class="item-text"><strong>Otomatik PICO Doğrulama</strong><br>Blog generator'a 7 post-gen kalite kontrolü eklendi</div></div>
      </div>
    `,
    css: `
      .slide-num { font-size:72px; font-weight:800; color:rgba(20,145,155,0.25); font-family:'Playfair Display',serif; margin-bottom:8px; line-height:1; }
      .slide-title { font-family:'Playfair Display',serif; font-size:56px; font-weight:700; line-height:1.05; margin-bottom:40px; }
      .slide-title em { color:#14919B; font-style:italic; }
      .items { display:flex; flex-direction:column; gap:24px; }
      .item { display:flex; align-items:flex-start; gap:20px; }
      .item-num { font-size:36px; font-weight:800; color:#E8963E; min-width:64px; line-height:1.1; }
      .item-icon { font-size:28px; min-width:64px; text-align:center; line-height:1.3; }
      .item-text { font-size:18px; line-height:1.5; color:rgba(255,255,255,0.8); }
      .item-text strong { color:#fff; font-weight:700; }
    `
  },
  // SLIDE 4 — SEO & TEKNİK
  {
    bg: 'photo-1524661135-423995f22d0b',
    overlay: 'linear-gradient(180deg, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.95) 100%)',
    html: `
      <div class="slide-num">03</div>
      <div class="slide-title">SEO &<br><em>Teknik</em></div>
      <div class="items">
        <div class="item"><div class="item-pct">97.5%</div><div class="item-text"><strong>JSON-LD Structured Data</strong><br>119/122 sayfada schema.org uyumlu yapılandırılmış veri</div></div>
        <div class="item"><div class="item-pct">281</div><div class="item-text"><strong>İç Bağlantı (Internal Linking)</strong><br>49 blogda 8 konu kümesi, 141 "İlgili Yazılar" kartı</div></div>
        <div class="item"><div class="item-pct">123</div><div class="item-text"><strong>Hreflang & Twitter Cards</strong><br>Tüm sayfalarda dil etiketi + 56 sayfada OG kartları</div></div>
        <div class="item"><div class="item-pct">+15</div><div class="item-text"><strong>Lighthouse Puan Artışı</strong><br>Lazy loading, CSS preload, JS defer, inline redirect</div></div>
      </div>
    `,
    css: `
      .slide-num { font-size:72px; font-weight:800; color:rgba(20,145,155,0.25); font-family:'Playfair Display',serif; margin-bottom:8px; line-height:1; }
      .slide-title { font-family:'Playfair Display',serif; font-size:56px; font-weight:700; line-height:1.05; margin-bottom:40px; }
      .slide-title em { color:#E8963E; font-style:italic; }
      .items { display:flex; flex-direction:column; gap:24px; }
      .item { display:flex; align-items:flex-start; gap:20px; }
      .item-pct { font-size:28px; font-weight:800; color:#14919B; min-width:64px; line-height:1.3; }
      .item-text { font-size:18px; line-height:1.5; color:rgba(255,255,255,0.8); }
      .item-text strong { color:#fff; font-weight:700; }
    `
  },
  // SLIDE 5 — TASARIM
  {
    bg: 'photo-1517836357463-d25dfeac3438',
    overlay: 'linear-gradient(180deg, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.95) 100%)',
    html: `
      <div class="slide-num">04</div>
      <div class="slide-title">Premium<br><em>Tasarım</em></div>
      <div class="items">
        <div class="item"><div class="item-icon">✨</div><div class="item-text"><strong>10 Animasyon Sistemi</strong><br>Parallax hero, stagger reveal, 3D tilt kartlar, scroll progress</div></div>
        <div class="item"><div class="item-icon">🎰</div><div class="item-text"><strong>Odometer Sayaçlar</strong><br>Rolling digit slots, glow efekti, SVG donut grafik</div></div>
        <div class="item"><div class="item-icon">🎨</div><div class="item-text"><strong>Detay Dokunuşları</strong><br>Custom cursor, trust badge marquee, ikon animasyonları</div></div>
        <div class="item"><div class="item-icon">🚫</div><div class="item-text"><strong>Premium 404 Sayfası</strong><br>5 esprili mesaj, site arama, popüler bölümler, son yazılar</div></div>
      </div>
    `,
    css: `
      .slide-num { font-size:72px; font-weight:800; color:rgba(20,145,155,0.25); font-family:'Playfair Display',serif; margin-bottom:8px; line-height:1; }
      .slide-title { font-family:'Playfair Display',serif; font-size:56px; font-weight:700; line-height:1.05; margin-bottom:40px; }
      .slide-title em { color:#14919B; font-style:italic; }
      .items { display:flex; flex-direction:column; gap:24px; }
      .item { display:flex; align-items:flex-start; gap:20px; }
      .item-icon { font-size:28px; min-width:64px; text-align:center; line-height:1.3; }
      .item-text { font-size:18px; line-height:1.5; color:rgba(255,255,255,0.8); }
      .item-text strong { color:#fff; font-weight:700; }
    `
  },
  // SLIDE 6 — TOPLAM RAKAMLAR
  {
    bg: 'photo-1559757175-7cb057fba93c',
    overlay: 'linear-gradient(180deg, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.95) 100%)',
    html: `
      <div class="slide-num">05</div>
      <div class="slide-title">Şubat Sonu<br><em>Durum</em></div>
      <div class="grid">
        <div class="g"><span>52</span><small>Blog Yazısı</small></div>
        <div class="g"><span>12</span><small>Ücretsiz Araç</small></div>
        <div class="g"><span>9</span><small>Rehber</small></div>
        <div class="g"><span>122</span><small>HTML Sayfa</small></div>
        <div class="g"><span>292</span><small>Git Commit</small></div>
        <div class="g"><span>1.1K</span><small>IG Görüntüleme</small></div>
      </div>
      <div class="march-tease">Mart'ta neler geliyor? Takipte kal →</div>
      <div class="logo-bottom"><span class="lu">Uzun</span><span class="ly">Yaşa</span></div>
    `,
    css: `
      .slide-num { font-size:72px; font-weight:800; color:rgba(20,145,155,0.25); font-family:'Playfair Display',serif; margin-bottom:8px; line-height:1; }
      .slide-title { font-family:'Playfair Display',serif; font-size:56px; font-weight:700; line-height:1.05; margin-bottom:48px; }
      .slide-title em { color:#E8963E; font-style:italic; }
      .grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:32px 24px; margin-bottom:48px; }
      .g { text-align:center; padding:20px 0; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); }
      .g span { display:block; font-size:42px; font-weight:800; color:#14919B; margin-bottom:4px; }
      .g small { font-size:13px; color:rgba(255,255,255,0.5); font-weight:500; letter-spacing:0.5px; }
      .march-tease { font-size:18px; color:rgba(255,255,255,0.5); text-align:center; margin-bottom:20px; }
      .logo-bottom { text-align:center; font-size:24px; font-weight:800; }
      .lu { color:#fff; }
      .ly { color:#E8963E; }
    `
  },
];

function generateSlideHTML(slide, index) {
  const photoUrl = `https://images.unsplash.com/${slide.bg}?w=1080&h=1080&fit=crop&q=80`;
  const dotIndex = index;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1080px; font-family:'Inter',sans-serif; color:#fff; overflow:hidden; position:relative; }
.photo { position:absolute; inset:0; background:url('${photoUrl}') center/cover no-repeat; }
.overlay { position:absolute; inset:0; background:${slide.overlay}; }
.vignette { position:absolute; inset:0; background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%); }
.top-bar { position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #14919B, #E8963E); }
.content { position:relative; z-index:10; width:100%; height:100%; padding:60px 72px; display:flex; flex-direction:column; justify-content:center; }
.dots { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); display:flex; gap:6px; z-index:20; }
.dot { width:8px; height:8px; border-radius:50%; background:rgba(255,255,255,0.3); }
.dot.active { background:#fff; width:24px; border-radius:4px; }
${slide.css}
</style></head>
<body>
<div class="photo"></div>
<div class="overlay"></div>
<div class="vignette"></div>
<div class="top-bar"></div>
<div class="content">${slide.html}</div>
<div class="dots">
  ${[0,1,2,3,4,5].map(i => `<div class="dot${i === dotIndex ? ' active' : ''}"></div>`).join('')}
</div>
</body></html>`;
}

async function main() {
  const outDir = path.join(__dirname, '..', 'social-posts');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome'
  });

  for (let i = 0; i < SLIDES.length; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(generateSlideHTML(SLIDES[i], i), { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    const outPath = path.join(outDir, `february-recap-${i + 1}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    await page.close();
    console.log(`✅ Slide ${i + 1}/6`);
  }

  await browser.close();
  console.log('\n🎉 6 slide February recap üretildi!');
}

main().catch(console.error);
