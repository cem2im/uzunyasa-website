const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 6 Viral Reels — each 6 slides
const REELS = {
  'yalnizlik': [
    { text: '3,4 Milyon Kişi\nİncelendi', sub: 'En büyük ölüm riski\nsigara değildi.', accent: '#ef4444', label: '' },
    { text: '%26', sub: 'Yalnızlık ve sosyal izolasyonun\nartırdığı ölüm riski', accent: '#ef4444', label: 'Holt-Lunstad · 2015 · 70 Çalışma · 3,4M Kişi' },
    { text: 'Yalnızlık\n> Obezite\n> Hareketsizlik', sub: '%26  >  %23  >  %25', accent: '#ef4444', label: 'Perspectives on Psychological Science' },
    { text: 'Sosyal İzolasyon', sub: 'Kronik inflamasyon ↑\nKortizol ↑\nKardiyovasküler risk ↑\nBağışıklık ↓', accent: '#ef4444', label: 'BİYOLOJİK MEKANİZMA' },
    { text: 'Haftada 3\nSosyal Etkileşim', sub: 'Riski anlamlı ölçüde azaltıyor\nYüz yüze > Dijital', accent: '#10b981', label: 'NE YAPMALI?' },
    { text: 'İnsan Sosyal\nBir Canlı', sub: 'Bu biyolojik bir gerçek.\nFelsefe değil.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'adim': [
    { text: '226.889 Kişilik\nÇalışma', sub: '60 yıllık bir yalanı yıktı.', accent: '#E8963E', label: '' },
    { text: '万歩計', sub: '1964 · Yamasa Corporation · Japonya\n"10.000 adım ölçer" — Bir ürün adı.\nBilimsel değil, pazarlama.', accent: '#E8963E', label: 'YALANIN KAYNAĞI' },
    { text: 'Her +1.000 Adım\n= %15 ↓ Ölüm Riski', sub: 'Fayda 4.000 adımda başlıyor\n8.000\'de plato yapıyor', accent: '#10b981', label: 'European J of Preventive Cardiology · 2023' },
    { text: '4.000 Adım', sub: '= 30 dakika yürüyüş\n= 2-3 kilometre\nHepsi bu.', accent: '#14919B', label: 'GERÇEK HEDEF' },
    { text: '10.000 ❌\n4.000 ✓', sub: 'Mükemmel, iyinin düşmanıdır.\n4.000 adım > 0 adım', accent: '#10b981', label: '' },
    { text: 'Bugün\nYürüyüşe Çık', sub: '30 dakika. Hepsi bu.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'kas': [
    { text: 'UCLA Araştırması', sub: 'Ölüm riskinin 1 numaralı\nöngörücüsü BMI değil.', accent: '#ef4444', label: '' },
    { text: 'Kas Kütlesi\n> BMI', sub: 'Düşük kas kütlesi → tüm nedenlere\nbağlı ölüm riski 2 kat artıyor', accent: '#ef4444', label: 'Srikanthan & Karlamangla · Am J Med · 2014' },
    { text: '%8 Kas Kaybı\nHer 10 Yılda', sub: '40 yaşından sonra sarkopeni başlıyor\nZayıf ama kassız = yüksek risk', accent: '#E8963E', label: 'SARKOPENI' },
    { text: '55+ Yaş\n3.659 Kişi', sub: 'En güçlü yaşam süresi öngörücüsü:\nNe BMI, ne kolesterol\nKas kütlesi indeksi', accent: '#14919B', label: 'ÇALIŞMA DETAYI' },
    { text: 'Haftada 2x\nDirenç Egzersizi', sub: '+ Günde 1.2-1.6 g/kg protein\n(ESPEN 2021 kılavuzu)', accent: '#10b981', label: 'NE YAPMALI?' },
    { text: 'Tartıdaki Kilo\nDeğil, Kasındaki', sub: 'Seni yaşatan bu.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'uyku': [
    { text: 'Science Dergisi\nBir Keşif Yaptı', sub: 'Beyin sadece uykuda temizleniyor.', accent: '#6366f1', label: '' },
    { text: 'Glimfatik\nSistem', sub: 'Uyku sırasında beyin-omurilik sıvısı\ntoksinleri temizliyor', accent: '#6366f1', label: 'Xie et al. · Science · 2013' },
    { text: '%60 Daha Hızlı', sub: 'β-amiloid proteini (Alzheimer proteini)\nuyku sırasında %60 daha hızlı\ntemizleniyor', accent: '#6366f1', label: 'NEDEN ÖNEMLİ?' },
    { text: '< 7 Saat Uyku\n= %30 ↑ Alzheimer', sub: 'Tek bir gecelik uyku kaybı bile\nβ-amiloid birikimine neden oluyor', accent: '#ef4444', label: 'Shokri-Kojori · PNAS · 2018' },
    { text: 'Alzheimer\n70\'lerde Başlamıyor', sub: '40\'larınızdaki uykusuz\ngecelerde başlıyor.', accent: '#ef4444', label: '' },
    { text: 'Uyku Lüks Değil\nBeyin Bakımı', sub: '7-9 saat. Her gece.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'bagirsak': [
    { text: 'Caltech\nBunu Kanıtladı', sub: 'Mutluluk hormonu\nbeyinde üretilmiyor.', accent: '#ec4899', label: '' },
    { text: '%95', sub: 'Serotoninin %95\'i\nbağırsakta üretiliyor\nBeyinde değil', accent: '#ec4899', label: 'Yano et al. · Cell · 2015' },
    { text: 'Enterokromafin\nHücreleri', sub: '→ Serotonin sentezi\n→ Vagus siniri\n→ Beyin', accent: '#ec4899', label: 'MEKANİZMA' },
    { text: 'Disbiyoz\n= Depresyon Riski ↑', sub: 'Bağırsak flora bozukluğu\nruh halini doğrudan etkiliyor', accent: '#ef4444', label: 'Valles-Colomer · Nature Microbiology · 2019' },
    { text: 'Probiyotik\n+ Prebiyotik', sub: 'Anksiyete skorlarında\nanlamlı iyileşme', accent: '#10b981', label: 'Liu et al. · BMJ Nutrition · 2019' },
    { text: 'Ruh Haliniz\nBağırsakta Başlıyor', sub: 'Beslenmeniz ruh sağlığınızdır.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
  'oturma': [
    { text: '1 Milyon Kişilik\nLancet Çalışması', sub: 'Koltuğunuz en tehlikeli\nmobilyanız.', accent: '#ef4444', label: '' },
    { text: '%59 ↑\nÖlüm Riski', sub: 'Günde 8+ saat oturma\n+ egzersiz yapmama\n= en yüksek risk grubu', accent: '#ef4444', label: 'Ekelund et al. · Lancet · 2016 · 1.005.791 Kişi' },
    { text: 'Sigara İçmiyorsunuz\nAlkol Almıyorsunuz', sub: 'Ama günde 8 saat\noturuyorsunuz.', accent: '#E8963E', label: '' },
    { text: '60-75 dk/gün\nOrta Yoğunluk Aktivite', sub: 'Bu riski tamamen SİLİYOR\n(aynı Lancet çalışması)', accent: '#10b981', label: 'İYİ HABER' },
    { text: 'Saatte 1 Kez\n2-3 Dakika Kalk', sub: 'Bu kadar basit.\nRisk %30 azalıyor.', accent: '#10b981', label: 'American Heart Association' },
    { text: 'Her Saat Başı\nKalk', sub: 'Bu kadar.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
  ],
};

function generateSlideHTML(slide, reelAccent, index, total) {
  const accent = slide.accent || reelAccent;
  const isCTA = slide.isCTA;
  const textLen = slide.text.length;
  const fontSize = textLen <= 12 ? '130px' : textLen <= 25 ? '90px' : textLen <= 40 ? '72px' : '60px';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1920px; background: transparent; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; }
.vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%); }
.content { position: relative; z-index: 10; width: 100%; height: 100%; padding: 100px 72px 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.label { position: absolute; top: 100px; left: 0; right: 0; font-size: 16px; font-weight: 700; letter-spacing: 4px; color: ${accent}; text-align: center; text-transform: uppercase; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.accent-line { width: 50px; height: 3px; background: ${accent}; margin-bottom: 32px; border-radius: 2px; }
.big-text { font-family: 'Playfair Display', serif; font-size: ${fontSize}; font-weight: 900; line-height: 1.05; white-space: pre-line; text-shadow: 0 4px 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5); ${isCTA ? `background: linear-gradient(135deg, #14919B, #E8963E); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; filter: drop-shadow(0 4px 20px rgba(0,0,0,0.5));` : ''} }
.sub-text { font-size: 30px; font-weight: 400; color: rgba(255,255,255,0.8); line-height: 1.55; margin-top: 36px; white-space: pre-line; max-width: 850px; text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7); }
.bottom-bar { position: absolute; bottom: 80px; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 72px; }
.slide-num { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.3); }
.logo { font-size: 18px; font-weight: 700; }
.logo .uzun { color: rgba(255,255,255,0.6); }
.logo .yasa { color: #E8963E; }
</style></head>
<body>
<div class="vignette"></div>
<div class="content">
  ${slide.label ? `<div class="label">${slide.label}</div>` : ''}
  <div class="accent-line"></div>
  <div class="big-text">${slide.text}</div>
  ${slide.sub ? `<div class="sub-text">${slide.sub}</div>` : ''}
  <div class="bottom-bar">
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

  for (const [reelName, slides] of Object.entries(REELS)) {
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
        omitBackground: true  // TRANSPARENT
      });
      await page.close();
    }
    console.log(`✅ ${reelName}: ${slides.length} slayt`);
  }

  await browser.close();
  console.log('\n🎉 Tüm viral reel slaytları hazır!');
}

main().catch(console.error);
