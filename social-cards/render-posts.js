const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ITEMS = [
  // ARAÇLAR
  { type: 'araç', slug: 'diyet-asistani', dir: 'araclar', icon: '🍽️', title: 'Diyet Asistanı', subtitle: 'Kişisel Haftalık Yemek Planı', bullets: ['BMI, TDEE ve makro hesaplama', 'Türk mutfağından sağlıklı öneriler', 'Alışveriş listesi dahil', 'Hedefine göre özelleştirilmiş'] },
  { type: 'araç', slug: 'egzersiz-asistani', dir: 'araclar', icon: '💪', title: 'Egzersiz Asistanı', subtitle: 'Kişisel Antrenman Programı', bullets: ['Başlangıç, orta, ileri seviye', 'Ev, salon veya dış mekan', 'Set/tekrar ve ilerleme planı', 'Hedefe özel program'] },
  { type: 'araç', slug: 'glp1-karsilastirma', dir: 'araclar', icon: '💊', title: 'GLP-1 İlaç\nKarşılaştırma', subtitle: '7 İlacı Yan Yana Karşılaştır', bullets: ['Etkinlik, doz, yan etki', 'Tirzepatide %21 vs Semaglutide %15', 'Türkiye fiyat ve erişim bilgisi', 'İnteraktif seçim ve filtreleme'] },
  { type: 'araç', slug: 'glp1-uygunluk-testi', dir: 'araclar', icon: '🧪', title: 'GLP-1\nUygunluk Testi', subtitle: '2 Dakikada Ön Değerlendirme', bullets: ['Klinik kılavuzlara dayalı', 'BMI + komorbidite analizi', 'Türkiye erişim bilgileri', 'Sonucu doktorunla paylaş'] },
  { type: 'araç', slug: 'kac-kilo-vermeliyim', dir: 'araclar', icon: '⚖️', title: 'Kaç Kilo\nVermeliyim?', subtitle: 'Bilimsel İdeal Kilo Hesaplayıcı', bullets: ['BMI ve TDEE formülleri', 'Haftalık kilo kaybı planı', 'Sağlık etki analizi', 'Gerçekçi hedef belirleme'] },
  { type: 'araç', slug: 'kalori-karsilastirici', dir: 'araclar', icon: '🍕', title: 'Kalori\nKarşılaştırıcı', subtitle: 'Hangisi Daha Kalorili?', bullets: ['100 yemek, Türk + dünya mutfağı', 'Quiz formatında eğlenceli test', 'Sürpriz sonuçlara hazır ol!', 'Arkadaşlarınla paylaş'] },
  { type: 'araç', slug: 'makro-ucgeni', dir: 'araclar', icon: '📊', title: 'Makro Üçgeni', subtitle: 'Besin Makro Tahmin Oyunu', bullets: ['100 Türk yemeğinin makroları', 'Protein, yağ, karbonhidrat', 'Eğlenceli oyun formatı', 'Beslenme bilgini test et'] },
  { type: 'araç', slug: 'mit-kirici', dir: 'araclar', icon: '🧠', title: 'Mit Kırıcı', subtitle: '50 Sağlık Miti — Gerçek mi?', bullets: ['50 popüler sağlık miti', 'Bilimsel kaynak gösterimi', '8 kategori, quiz formatı', 'Yanlış bildiğin "gerçekler"'] },
  { type: 'araç', slug: 'sahur-iftar-planlayici', dir: 'araclar', icon: '🌙', title: 'Sahur & İftar\nPlanlayıcısı', subtitle: 'Ramazan Beslenme Rehberi', bullets: ['Kalori + makro hesaplama', 'Türk mutfağından öneriler', 'Su ve sıvı tüketim planı', 'Kişiselleştirilmiş öğünler'] },
  { type: 'araç', slug: 'score2-risk-hesaplayici', dir: 'araclar', icon: '❤️', title: 'SCORE2 Kalp\nRisk Hesaplayıcı', subtitle: '10 Yıllık Kalp Krizi Riskin', bullets: ['ESC 2021 kılavuzlarına dayalı', 'Türkiye risk katsayıları', 'Yaş, kolesterol, tansiyon', '1 dakikada sonuç al'] },
  { type: 'araç', slug: 'supplement-kanit-rehberi', dir: 'araclar', icon: '💊', title: 'Supplement\nKanıt Rehberi', subtitle: '60+ Takviye Bilimsel Puanlama', bullets: ['Tier S\'ten F\'ye puanlama', 'Amaca göre filtreleme', 'Her takviye için kaynaklar', 'Gereksiz harcamaya son'] },
  { type: 'araç', slug: 'turkiye-obezite-haritasi', dir: 'araclar', icon: '🗺️', title: 'Türkiye\nObezite Haritası', subtitle: '81 İl Bazlı İnteraktif Veri', bullets: ['TÜİK verilerine dayalı', 'Bölgesel karşılaştırma', 'İlini bul, farkını gör', '%32 ulusal obezite oranı'] },
  // REHBERLER
  { type: 'rehber', slug: '50-yas-egzersiz', dir: 'rehberler', icon: '🏋️', title: '50 Yaş Üstü\nEgzersiz Rehberi', subtitle: 'Başlamak İçin Asla Geç Değil', bullets: ['8 haftalık başlangıç programı', 'Alzheimer riski %45 azalır', '80 yaşında bile kas yapılır', 'Güvenlik kuralları dahil'] },
  { type: 'rehber', slug: 'akdeniz-diyeti', dir: 'rehberler', icon: '🫒', title: 'Akdeniz Diyeti\nBaşlangıç Rehberi', subtitle: '7 Yıldır Dünyanın 1 Numarası', bullets: ['4 haftalık geçiş planı', 'Kalp krizi riski %30 azalır', 'Tam haftalık menü', 'Alışveriş listesi dahil'] },
  { type: 'rehber', slug: 'aralikli-oruc', dir: 'rehberler', icon: '⏰', title: 'Aralıklı Oruç\nBaşlangıç Rehberi', subtitle: 'Ne Zaman Yediğin de Önemli', bullets: ['16:8 yöntemi adım adım', '5 haftada alışkanlık oluştur', 'Otofaji ve hücre onarımı', 'Kime uygun, kime değil?'] },
  { type: 'rehber', slug: 'evde-egzersiz', dir: 'rehberler', icon: '🏠', title: 'Evde Egzersiz\nBaşlangıç Rehberi', subtitle: 'Ekipmansız, Ücretsiz, Etkili', bullets: ['4 haftalık program', '4 temel hareket yeterli', 'Form rehberi dahil', 'Spor salonuna gerek yok'] },
  { type: 'rehber', slug: 'kalori-acigi', dir: 'rehberler', icon: '🔬', title: 'Kalori Açığı\nOluşturma Rehberi', subtitle: 'Kilo Vermenin Tek Formülü', bullets: ['500 kcal açık = 0.5 kg/hafta', '5 kanıtlı strateji', 'Sıvı kalori tuzağı', 'Hafta sonu hatası'] },
  { type: 'rehber', slug: 'kalp-sagligi', dir: 'rehberler', icon: '❤️‍🩹', title: 'Kalp Sağlığı\nKoruma Rehberi', subtitle: 'Risk Faktörlerinin %80\'i Elinde', bullets: ['Hedef değerler tablosu', 'Sigara bırakma etkisi', '%5-10 kilo kaybı yeterli', 'Acil belirtiler rehberi'] },
  { type: 'rehber', slug: 'plato-kirma', dir: 'rehberler', icon: '📈', title: 'Plato Kırma\nRehberi', subtitle: 'Tartı Durduğunda Ne Yapmalı?', bullets: ['7 kanıta dayalı strateji', 'Diet break paradoksu', 'NEAT\'in gücü', 'Metabolizma resetleme'] },
  { type: 'rehber', slug: 'tip2-diyabet', dir: 'rehberler', icon: '🩺', title: 'Tip 2 Diyabet\nÖnleme Rehberi', subtitle: '%58 Önlenebilir Bir Hastalık', bullets: ['Yaşam tarzı > ilaç (DPP)', '%5-7 kilo kaybı yeterli', 'Pre-diyabet belirtileri', 'Risk faktörleri ve hedefler'] },
  { type: 'rehber', slug: 'uyku-kalitesi', dir: 'rehberler', icon: '🌙', title: 'Uyku Kalitesini\nArtırma Rehberi', subtitle: '7 Saatten Az = Ciddi Riskler', bullets: ['10 altın kural', 'İdeal akşam rutini', 'Kafein yarılanma ömrü', 'Alkol tuzağı uyarısı'] },
];

function generateHTML(item) {
  const isArac = item.type === 'araç';
  const badge = isArac ? '🛠️ ÜCRETSİZ ARAÇ' : '📚 ÜCRETSİZ REHBER';
  const ctaText = isArac ? 'Hemen Dene →' : 'Rehberi Oku →';
  const accentColor = isArac ? '#14919B' : '#E8963E';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Playfair+Display:wght@700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1080px; background: #0a1628; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; }
.container { width: 100%; height: 100%; padding: 60px; display: flex; flex-direction: column; position: relative; }

/* Gradient overlay */
.bg-gradient {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at 20% 20%, ${accentColor}15 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, ${accentColor}10 0%, transparent 50%);
}

/* Top border accent */
.top-bar { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, ${accentColor}, ${accentColor}88); }

/* Badge */
.badge {
  position: relative; z-index: 1;
  display: inline-block; padding: 10px 24px; border-radius: 30px;
  background: ${accentColor}22; border: 1.5px solid ${accentColor}66;
  font-size: 22px; font-weight: 700; letter-spacing: 2px; color: ${accentColor};
  margin-bottom: 30px; align-self: flex-start;
}

/* Icon */
.icon { position: relative; z-index: 1; font-size: 80px; margin-bottom: 20px; }

/* Title */
.title {
  position: relative; z-index: 1;
  font-family: 'Playfair Display', serif; font-size: 58px; font-weight: 700;
  line-height: 1.15; margin-bottom: 12px; white-space: pre-line;
}

/* Subtitle */
.subtitle {
  position: relative; z-index: 1;
  font-size: 26px; color: ${accentColor}; font-weight: 600;
  margin-bottom: 40px; letter-spacing: 0.5px;
}

/* Bullets */
.bullets { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; gap: 18px; }
.bullet {
  display: flex; align-items: center; gap: 16px;
  font-size: 26px; font-weight: 500; color: #e0e0e0; line-height: 1.3;
}
.bullet-dot {
  width: 10px; height: 10px; min-width: 10px; border-radius: 50%;
  background: ${accentColor};
}

/* CTA */
.cta {
  position: relative; z-index: 1;
  margin-top: 40px; padding: 20px 40px; border-radius: 16px;
  background: linear-gradient(135deg, ${accentColor}, ${accentColor}cc);
  font-size: 28px; font-weight: 800; text-align: center;
  letter-spacing: 1px;
  box-shadow: 0 8px 32px ${accentColor}44;
}

/* Logo area */
.footer {
  position: relative; z-index: 1;
  margin-top: 30px; display: flex; align-items: center; justify-content: space-between;
}
.logo-text { font-size: 28px; font-weight: 800; }
.logo-uzun { color: #fff; }
.logo-yasa { color: #E8963E; }
.url { font-size: 20px; color: #888; font-weight: 500; }

/* Corner decoration */
.corner-deco {
  position: absolute; bottom: 0; right: 0; width: 200px; height: 200px;
  background: radial-gradient(circle at 100% 100%, ${accentColor}08 0%, transparent 70%);
  border-radius: 0;
}
</style></head>
<body>
<div class="container">
  <div class="bg-gradient"></div>
  <div class="top-bar"></div>
  <div class="corner-deco"></div>

  <div class="badge">${badge}</div>
  <div class="icon">${item.icon}</div>
  <div class="title">${item.title}</div>
  <div class="subtitle">${item.subtitle}</div>

  <div class="bullets">
    ${item.bullets.map(b => `<div class="bullet"><div class="bullet-dot"></div><span>${b}</span></div>`).join('\n    ')}
  </div>

  <div class="cta">${ctaText}</div>

  <div class="footer">
    <div class="logo-text"><span class="logo-uzun">Uzun</span><span class="logo-yasa">Yaşa</span></div>
    <div class="url">uzunyasa.com</div>
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
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const outPath = path.join(outDir, `${item.slug}-post.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    await page.close();
    console.log(`✅ ${item.slug}-post.png`);
  }

  await browser.close();
  console.log(`\n🎉 ${ITEMS.length} post görseli üretildi → ${outDir}/`);
}

main().catch(console.error);
