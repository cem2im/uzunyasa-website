const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 6 Viral Reels — V2: Full vertical spread layout
const REELS = {
  'yalnizlik': [
    { text: 'En Büyük\nÖlüm Riski\nSigara Değil', sub: '3,4 milyon kişilik meta-analiz\nbunu kanıtladı.', accent: '#ef4444', label: '' },
    { text: '%26', sub: 'Yalnızlık ve sosyal izolasyonun\nartırdığı ölüm riski', accent: '#ef4444', label: 'Holt-Lunstad · 2015 · 70 Çalışma · 3,4M Kişi' },
    { text: 'Yalnızlık\n> Obezite\n> Hareketsizlik', sub: '%26  >  %23  >  %25', accent: '#ef4444', label: 'Perspectives on Psychological Science' },
    { text: 'Sosyal İzolasyon', sub: 'Kronik inflamasyon ↑\nKortizol ↑\nKardiyovasküler risk ↑\nBağışıklık ↓', accent: '#ef4444', label: 'BİYOLOJİK MEKANİZMA' },
    { text: 'Haftada 3\nSosyal Etkileşim', sub: 'Riski anlamlı ölçüde azaltıyor\nYüz yüze > Dijital', accent: '#10b981', label: 'NE YAPMALI?' },
    { text: 'İnsan Sosyal\nBir Canlı', sub: 'Bu biyolojik bir gerçek.\nFelsefe değil.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'adim': [
    { text: '10.000 Adım\nBir Yalan', sub: '226.889 kişilik çalışma\n60 yıllık miti yıktı.', accent: '#E8963E', label: '' },
    { text: '万歩計', sub: '1964 · Yamasa Corporation · Japonya\n"10.000 adım ölçer" — Bir ürün adı.\nBilimsel değil, pazarlama.', accent: '#E8963E', label: 'YALANIN KAYNAĞI' },
    { text: 'Her +1.000 Adım\n= %15 ↓ Ölüm Riski', sub: 'Fayda 4.000 adımda başlıyor\n8.000\'de plato yapıyor', accent: '#10b981', label: 'European J of Preventive Cardiology · 2023' },
    { text: '4.000 Adım', sub: '= 30 dakika yürüyüş\n= 2-3 kilometre\nHepsi bu.', accent: '#14919B', label: 'GERÇEK HEDEF' },
    { text: '10.000 ❌\n4.000 ✓', sub: 'Mükemmel, iyinin düşmanıdır.\n4.000 adım > 0 adım', accent: '#10b981', label: '' },
    { text: 'Bugün\nYürüyüşe Çık', sub: '30 dakika. Hepsi bu.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'kas': [
    { text: 'Zayıf Olmak\nSizi Kurtarmıyor', sub: 'UCLA: Ölüm riskinin 1 numaralı\nöngörücüsü BMI değil.', accent: '#ef4444', label: '' },
    { text: 'Kas Kütlesi\n> BMI', sub: 'Düşük kas kütlesi → tüm nedenlere\nbağlı ölüm riski 2 kat artıyor', accent: '#ef4444', label: 'Srikanthan & Karlamangla · Am J Med · 2014' },
    { text: '%8 Kas Kaybı\nHer 10 Yılda', sub: '40 yaşından sonra sarkopeni başlıyor\nZayıf ama kassız = yüksek risk', accent: '#E8963E', label: 'SARKOPENI' },
    { text: '55+ Yaş\n3.659 Kişi', sub: 'En güçlü yaşam süresi öngörücüsü:\nNe BMI, ne kolesterol\nKas kütlesi indeksi', accent: '#14919B', label: 'ÇALIŞMA DETAYI' },
    { text: 'Haftada 2x\nDirenç Egzersizi', sub: '+ Günde 1.2-1.6 g/kg protein\n(ESPEN 2021 kılavuzu)', accent: '#10b981', label: 'NE YAPMALI?' },
    { text: 'Tartıdaki Kilo\nDeğil, Kasındaki', sub: 'Seni yaşatan bu.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'uyku': [
    { text: 'Beyniniz\nHer Gece\nÇöp Topluyor', sub: 'Ama sadece uyurken.', accent: '#6366f1', label: '' },
    { text: 'Glimfatik\nSistem', sub: 'Uyku sırasında beyin-omurilik sıvısı\ntoksinleri temizliyor', accent: '#6366f1', label: 'Xie et al. · Science · 2013' },
    { text: '%60 Daha Hızlı', sub: 'β-amiloid proteini (Alzheimer proteini)\nuyku sırasında %60 daha hızlı\ntemizleniyor', accent: '#6366f1', label: 'NEDEN ÖNEMLİ?' },
    { text: '< 7 Saat Uyku\n= %30 ↑ Alzheimer', sub: 'Tek bir gecelik uyku kaybı bile\nβ-amiloid birikimine neden oluyor', accent: '#ef4444', label: 'Shokri-Kojori · PNAS · 2018' },
    { text: 'Alzheimer\n70\'lerde Başlamıyor', sub: '40\'larınızdaki uykusuz\ngecelerde başlıyor.', accent: '#ef4444', label: '' },
    { text: 'Uyku Lüks Değil\nBeyin Bakımı', sub: '7-9 saat. Her gece.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'bagirsak': [
    { text: 'Mutluluk\nBeyinde\nÜretilmiyor', sub: 'Caltech kanıtladı. Serotoninin\n%95\'i başka bir organda.', accent: '#ec4899', label: '' },
    { text: '%95', sub: 'Serotoninin %95\'i\nbağırsakta üretiliyor\nBeyinde değil', accent: '#ec4899', label: 'Yano et al. · Cell · 2015' },
    { text: 'Enterokromafin\nHücreleri', sub: '→ Serotonin sentezi\n→ Vagus siniri\n→ Beyin', accent: '#ec4899', label: 'MEKANİZMA' },
    { text: 'Disbiyoz\n= Depresyon Riski ↑', sub: 'Bağırsak flora bozukluğu\nruh halini doğrudan etkiliyor', accent: '#ef4444', label: 'Valles-Colomer · Nature Microbiology · 2019' },
    { text: 'Probiyotik\n+ Prebiyotik', sub: 'Anksiyete skorlarında\nanlamlı iyileşme', accent: '#10b981', label: 'Liu et al. · BMJ Nutrition · 2019' },
    { text: 'Ruh Haliniz\nBağırsakta Başlıyor', sub: 'Beslenmeniz ruh sağlığınızdır.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'oturma': [
    { text: 'Koltuğunuz\nSizi Öldürüyor', sub: '1 milyon kişilik Lancet çalışması\nbunu söylüyor.', accent: '#ef4444', label: '' },
    { text: '%59 ↑\nÖlüm Riski', sub: 'Günde 8+ saat oturma\n+ egzersiz yapmama\n= en yüksek risk grubu', accent: '#ef4444', label: 'Ekelund et al. · Lancet · 2016 · 1.005.791 Kişi' },
    { text: 'Sigara İçmiyorsunuz\nAlkol Almıyorsunuz', sub: 'Ama günde 8 saat\noturuyorsunuz.', accent: '#E8963E', label: '' },
    { text: '60-75 dk/gün\nOrta Yoğunluk Aktivite', sub: 'Bu riski tamamen SİLİYOR\n(aynı Lancet çalışması)', accent: '#10b981', label: 'İYİ HABER' },
    { text: 'Saatte 1 Kez\n2-3 Dakika Kalk', sub: 'Bu kadar basit.\nRisk %30 azalıyor.', accent: '#10b981', label: 'American Heart Association' },
    { text: 'Her Saat Başı\nKalk', sub: 'Bu kadar.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'gencim': [
    { text: 'Gencim Güzelim\nBana Bir Şey\nOlmaz', sub: '38.481 kişilik çalışma\nbu cümleyi çürüttü.', accent: '#E8963E', label: '' },
    { text: '23 Yıl Fark', sub: '30 yaşında en sağlıklı vs\nen sağlıksız yaşam tarzı arasında\nerkeklerde 23, kadınlarda 18 yıl', accent: '#ef4444', label: 'Jackowska et al. · PLoS ONE · 2024 · 38.481 Kişi' },
    { text: 'Sadece\n4 Seçim', sub: 'Sigara içmemek\nDüzenli hareket\nİyi beslenme\nSağlıklı kilo', accent: '#14919B', label: 'PAHALISI YOK · KARMAŞIĞI YOK' },
    { text: 'Harvard:\n+14 Yıl', sub: '5 alışkanlık sürdüren 50 yaşındakiler\n14 yıl daha uzun yaşıyor', accent: '#10b981', label: 'Li et al. · Circulation · 2018 · 123.219 Kişi' },
    { text: 'Genetik\n≠ Kader', sub: 'Ailede kalp hastalığı olanlar bile\ngençlikte sağlıklı yaşayınca\nriski sıfırladı', accent: '#10b981', label: 'CARDIA Study · Circulation · 2012' },
    { text: 'Sağlık Süren\nKaç Yıl?', sub: '2 dakikada öğren.', accent: '#14919B', label: 'uzunyasa.com/test', isCTA: true },
  ],
};

function generateSlideHTML(slide, reelAccent, index, total) {
  const accent = slide.accent || reelAccent;
  const isCTA = slide.isCTA;
  const textLen = slide.text.length;
  // Bigger fonts
  const fontSize = textLen <= 8 ? '160px' : textLen <= 15 ? '120px' : textLen <= 25 ? '96px' : textLen <= 40 ? '78px' : '64px';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; background: transparent; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; }

/* Strong overlay — dark center band for text readability */
.overlay {
  position: absolute; inset: 0;
  background: 
    linear-gradient(to bottom, 
      rgba(0,0,0,0.85) 0%, 
      rgba(0,0,0,0.75) 15%,
      rgba(0,0,0,0.65) 30%, 
      rgba(0,0,0,0.60) 50%, 
      rgba(0,0,0,0.65) 70%, 
      rgba(0,0,0,0.75) 85%,
      rgba(0,0,0,0.85) 100%);
}

/* Content spread across full height */
.content {
  position: relative; z-index: 10;
  width: 100%; height: 100%;
  padding: 140px 72px 140px;
  display: flex; flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
}

/* Top section: label */
.top-section {
  flex: 0 0 auto;
  width: 100%;
}

.label {
  font-size: 17px; font-weight: 700;
  letter-spacing: 4px; color: ${accent};
  text-transform: uppercase;
  text-shadow: 0 2px 15px rgba(0,0,0,0.9);
  line-height: 1.4;
}

/* Middle section: main text + sub - takes most space */
.middle-section {
  flex: 1 1 auto;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  width: 100%;
  gap: 40px;
}

.accent-line { width: 60px; height: 4px; background: ${accent}; border-radius: 2px; }

.big-text {
  font-family: 'Playfair Display', serif;
  font-size: ${fontSize}; font-weight: 900;
  line-height: 1.1; white-space: pre-line;
  text-shadow: 0 4px 40px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6);
  max-width: 950px;
  ${isCTA ? `background: linear-gradient(135deg, #14919B, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 4px 30px rgba(0,0,0,0.6));` : ''}
}

.sub-text {
  font-size: 34px; font-weight: 400;
  color: rgba(255,255,255,0.85);
  line-height: 1.6; white-space: pre-line;
  max-width: 850px;
  text-shadow: 0 2px 25px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8);
}

/* Bottom section: slide number + logo */
.bottom-section {
  flex: 0 0 auto;
  width: 100%;
  display: flex; justify-content: space-between; align-items: center;
}

.slide-num { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.25); }
.logo { font-size: 20px; font-weight: 700; }
.logo .uzun { color: rgba(255,255,255,0.6); }
.logo .yasa { color: #E8963E; }
</style></head>
<body>
<div class="overlay"></div>
<div class="content">
  <div class="top-section">
    ${slide.label ? `<div class="label">${slide.label}</div>` : '&nbsp;'}
  </div>
  <div class="middle-section">
    <div class="accent-line"></div>
    <div class="big-text">${slide.text}</div>
    ${slide.sub ? `<div class="sub-text">${slide.sub}</div>` : ''}
  </div>
  <div class="bottom-section">
    <div class="slide-num">${index+1}/${total}</div>
    <div class="logo"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>
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

  const filterReel = process.argv[2];
  const entries = filterReel ? [[filterReel, REELS[filterReel]]] : Object.entries(REELS);
  for (const [reelName, slides] of entries) {
    if (!slides) { console.log(`❌ Reel "${reelName}" not found`); continue; }
    const outDir = path.join(__dirname, `reel-viral-${reelName}`);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (let i = 0; i < slides.length; i++) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920 });
      const html = generateSlideHTML(slides[i], '#14919B', i, slides.length);
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 800));
      await page.screenshot({
        path: path.join(outDir, `slide-${String(i+1).padStart(2,'0')}.png`),
        type: 'png',
        omitBackground: true
      });
      await page.close();
    }
    console.log(`✅ ${reelName}: ${slides.length} slayt`);
  }

  await browser.close();
  console.log('\n🎉 Tüm V2 slaytlar hazır!');
}

main().catch(console.error);

// This won't actually append since file already has main() at end
// Using separate script instead
