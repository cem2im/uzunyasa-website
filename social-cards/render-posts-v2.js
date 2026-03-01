const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ITEMS = [
  // ARAÇLAR
  { type: 'araç', slug: 'diyet-asistani', dir: 'araclar', icon: '🍽️', title: 'Diyet Asistanı', subtitle: 'Kişisel Haftalık Yemek Planı', bullets: ['BMI, TDEE ve makro otomatik hesaplama', 'Türk mutfağından sağlıklı öneriler', 'Haftalık alışveriş listesi dahil', 'Hedefine göre özelleştirilmiş plan'], stat: '2 dk\'da hazır' },
  { type: 'araç', slug: 'egzersiz-asistani', dir: 'araclar', icon: '💪', title: 'Egzersiz Asistanı', subtitle: 'Kişisel Antrenman Programı', bullets: ['Başlangıç, orta ve ileri seviye', 'Ev, salon veya dış mekan seçimi', 'Set, tekrar ve ilerleme planı', 'Kilo verme veya kas yapma hedefi'], stat: 'Kişiye özel' },
  { type: 'araç', slug: 'glp1-karsilastirma', dir: 'araclar', icon: '💊', title: 'GLP-1 İlaç Karşılaştırma', subtitle: '7 İlacı Yan Yana Karşılaştır', bullets: ['Etkinlik, dozaj ve yan etki verileri', 'Tirzepatide %21 vs Semaglutide %15', 'Türkiye fiyat ve erişim bilgisi', 'İnteraktif seçim ve filtreleme'], stat: '7 ilaç' },
  { type: 'araç', slug: 'glp1-uygunluk-testi', dir: 'araclar', icon: '🧪', title: 'GLP-1 Uygunluk Testi', subtitle: '2 Dakikada Ön Değerlendirme', bullets: ['Klinik kılavuzlara dayalı analiz', 'BMI + komorbidite değerlendirmesi', 'Türkiye erişim bilgileri dahil', 'Sonucu doktorunla paylaş'], stat: '2 dk test' },
  { type: 'araç', slug: 'kac-kilo-vermeliyim', dir: 'araclar', icon: '⚖️', title: 'Kaç Kilo Vermeliyim?', subtitle: 'Bilimsel İdeal Kilo Hesaplayıcı', bullets: ['BMI ve TDEE bilimsel formülleri', 'Haftalık kilo kaybı planı', 'Sağlık etkisi analizi dahil', 'Gerçekçi ve sürdürülebilir hedef'], stat: 'Bilimsel formül' },
  { type: 'araç', slug: 'kalori-karsilastirici', dir: 'araclar', icon: '🍕', title: 'Kalori Karşılaştırıcı', subtitle: 'Hangisi Daha Kalorili?', bullets: ['100 yemek — Türk + dünya mutfağı', 'Quiz formatında eğlenceli test', 'Sürpriz sonuçlara hazır ol!', 'Arkadaşlarınla yarış ve paylaş'], stat: '100 yemek' },
  { type: 'araç', slug: 'makro-ucgeni', dir: 'araclar', icon: '📊', title: 'Makro Üçgeni', subtitle: 'Besin Makro Tahmin Oyunu', bullets: ['100 Türk yemeğinin makro verileri', 'Protein, yağ, karbonhidrat tahmin et', 'Eğlenceli oyun formatında öğren', 'Beslenme bilgini test et'], stat: '100 yemek' },
  { type: 'araç', slug: 'mit-kirici', dir: 'araclar', icon: '🧠', title: 'Mit Kırıcı', subtitle: '50 Sağlık Mitini Test Et', bullets: ['50 popüler sağlık miti', 'Her mit için bilimsel kaynak', '8 kategori, quiz formatı', 'Yanlış bildiğin "gerçekler"i keşfet'], stat: '50 mit' },
  { type: 'araç', slug: 'sahur-iftar-planlayici', dir: 'araclar', icon: '🌙', title: 'Sahur & İftar Planlayıcısı', subtitle: 'Ramazan Beslenme Rehberi', bullets: ['Kalori + makro otomatik hesaplama', 'Türk mutfağından 197+ yemek', 'Su ve sıvı tüketim planı dahil', '30 şehir için imsakiye entegreli'], stat: '197 yemek' },
  { type: 'araç', slug: 'score2-risk-hesaplayici', dir: 'araclar', icon: '❤️', title: 'SCORE2 Kalp Risk Hesaplayıcı', subtitle: '10 Yıllık Kalp Krizi Riskin', bullets: ['ESC 2021 kılavuzuna dayalı', 'Türkiye risk katsayıları ile', 'Yaş, kolesterol, tansiyon analizi', '1 dakikada sonuç ve öneriler'], stat: '1 dk\'da sonuç' },
  { type: 'araç', slug: 'supplement-kanit-rehberi', dir: 'araclar', icon: '💊', title: 'Supplement Kanıt Rehberi', subtitle: '60+ Takviye Bilimsel Puanlama', bullets: ['Tier S\'ten F\'ye kanıt puanlama', 'Amaca göre akıllı filtreleme', 'Her takviye için bilimsel kaynaklar', 'Gereksiz harcamaya son ver'], stat: '60+ takviye' },
  { type: 'araç', slug: 'turkiye-obezite-haritasi', dir: 'araclar', icon: '🗺️', title: 'Türkiye Obezite Haritası', subtitle: '81 İl Bazlı İnteraktif Veri', bullets: ['TÜİK verilerine dayalı güncel data', 'Bölgesel karşılaştırma imkanı', 'İlini bul, Türkiye ile kıyasla', '%32 ulusal obezite oranı detayları'], stat: '81 il verisi' },
  // REHBERLER
  { type: 'rehber', slug: '50-yas-egzersiz', dir: 'rehberler', icon: '🏋️', title: '50 Yaş Üstü Egzersiz Rehberi', subtitle: 'Başlamak İçin Asla Geç Değil', bullets: ['8 haftalık başlangıç programı', 'Alzheimer riski %45 azalır', '80 yaşında bile kas yapılır', 'Güvenlik kuralları dahil'], stat: '8 haftalık plan' },
  { type: 'rehber', slug: 'akdeniz-diyeti', dir: 'rehberler', icon: '🫒', title: 'Akdeniz Diyeti Başlangıç Rehberi', subtitle: '7 Yıldır Dünyanın 1 Numarası', bullets: ['4 haftalık geçiş planı', 'Kalp krizi riski %30 azalır', 'Tam haftalık menü önerileri', 'Alışveriş listesi dahil'], stat: '%30 kalp koruması' },
  { type: 'rehber', slug: 'aralikli-oruc', dir: 'rehberler', icon: '⏰', title: 'Aralıklı Oruç Başlangıç Rehberi', subtitle: 'Ne Zaman Yediğin de Önemli', bullets: ['16:8 yöntemi adım adım', '5 haftada alışkanlık oluştur', 'Otofaji ve hücre onarımı bilimi', 'Kime uygun, kime değil?'], stat: '5 hafta plan' },
  { type: 'rehber', slug: 'evde-egzersiz', dir: 'rehberler', icon: '🏠', title: 'Evde Egzersiz Başlangıç Rehberi', subtitle: 'Ekipmansız, Ücretsiz, Etkili', bullets: ['4 haftalık detaylı program', '4 temel hareket yeterli', 'Form rehberi ve görseller dahil', 'Spor salonuna gerek yok'], stat: '4 hafta plan' },
  { type: 'rehber', slug: 'kalori-acigi', dir: 'rehberler', icon: '🔬', title: 'Kalori Açığı Oluşturma Rehberi', subtitle: 'Kilo Vermenin Tek Formülü', bullets: ['500 kcal açık = 0.5 kg/hafta', '5 kanıtlı strateji detaylı', 'Sıvı kalori tuzağı uyarısı', 'Hafta sonu hatasından kaçınma'], stat: '5 strateji' },
  { type: 'rehber', slug: 'kalp-sagligi', dir: 'rehberler', icon: '❤️‍🩹', title: 'Kalp Sağlığı Koruma Rehberi', subtitle: 'Risk Faktörlerinin %80\'i Elinde', bullets: ['Hedef değerler tablosu', 'Sigara bırakma etkisi verileri', '%5-10 kilo kaybı bile yeterli', 'Acil belirtiler kontrol listesi'], stat: '%80 önlenebilir' },
  { type: 'rehber', slug: 'plato-kirma', dir: 'rehberler', icon: '📈', title: 'Plato Kırma Rehberi', subtitle: 'Tartı Durduğunda Ne Yapmalı?', bullets: ['7 kanıta dayalı strateji', 'Diet break paradoksu açıklaması', 'NEAT gücünü keşfet', 'Metabolizma resetleme yöntemleri'], stat: '7 strateji' },
  { type: 'rehber', slug: 'tip2-diyabet', dir: 'rehberler', icon: '🩺', title: 'Tip 2 Diyabet Önleme Rehberi', subtitle: '%58 Önlenebilir Bir Hastalık', bullets: ['Yaşam tarzı ilaçtan etkili (DPP)', '%5-7 kilo kaybı yeterli', 'Pre-diyabet erken uyarı belirtileri', 'Risk faktörleri ve hedef değerler'], stat: '%58 önlenebilir' },
  { type: 'rehber', slug: 'uyku-kalitesi', dir: 'rehberler', icon: '🌙', title: 'Uyku Kalitesini Artırma Rehberi', subtitle: '7 Saatten Az = Ciddi Riskler', bullets: ['10 altın kural detaylı', 'İdeal akşam rutini şablonu', 'Kafein yarılanma ömrü uyarısı', 'Alkol tuzağı bilimsel açıklama'], stat: '10 altın kural' },
];

function generateHTML(item) {
  const isArac = item.type === 'araç';
  const badge = isArac ? '🛠️ ÜCRETSİZ ARAÇ' : '📚 ÜCRETSİZ REHBER';
  const ctaText = isArac ? 'Hemen Dene →' : 'Rehberi Oku →';
  const accent = isArac ? '#14919B' : '#E8963E';
  const accentLight = isArac ? '#1ab5c0' : '#f0a54e';
  const accentDark = isArac ? '#0d6b73' : '#c47828';

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1080px; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; position: relative; }

/* === BACKGROUND === */
.bg {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #0a1628 0%, #0f1d35 40%, #0a1628 100%);
}

/* Mesh gradient blobs */
.blob1 {
  position: absolute; top: -120px; right: -80px; width: 500px; height: 500px;
  background: radial-gradient(circle, ${accent}18 0%, transparent 70%);
  border-radius: 50%; filter: blur(60px);
}
.blob2 {
  position: absolute; bottom: -60px; left: -100px; width: 400px; height: 400px;
  background: radial-gradient(circle, ${accent}12 0%, transparent 70%);
  border-radius: 50%; filter: blur(50px);
}
.blob3 {
  position: absolute; top: 40%; left: 50%; width: 300px; height: 300px;
  background: radial-gradient(circle, #E8963E08 0%, transparent 70%);
  border-radius: 50%; filter: blur(40px); transform: translate(-50%, -50%);
}

/* Geometric decorations */
.geo-ring {
  position: absolute; top: 60px; right: 60px; width: 120px; height: 120px;
  border: 2px solid ${accent}20; border-radius: 50%;
}
.geo-ring-inner {
  position: absolute; top: 80px; right: 80px; width: 80px; height: 80px;
  border: 1.5px solid ${accent}15; border-radius: 50%;
}
.geo-dots {
  position: absolute; bottom: 180px; right: 50px;
  display: grid; grid-template-columns: repeat(4, 8px); gap: 12px;
}
.geo-dot { width: 8px; height: 8px; border-radius: 50%; background: ${accent}15; }
.geo-line {
  position: absolute; top: 280px; right: 40px; width: 1.5px; height: 140px;
  background: linear-gradient(to bottom, ${accent}25, transparent);
}
.geo-corner {
  position: absolute; bottom: 0; right: 0; width: 240px; height: 240px;
  background: linear-gradient(135deg, transparent 50%, ${accent}06 100%);
}

/* Top accent bar with gradient */
.top-bar {
  position: absolute; top: 0; left: 0; right: 0; height: 5px;
  background: linear-gradient(90deg, ${accentDark}, ${accent}, ${accentLight}, ${accent}, ${accentDark});
}

/* === CONTENT === */
.content {
  position: relative; z-index: 10; width: 100%; height: 100%;
  padding: 56px 64px; display: flex; flex-direction: column;
}

/* Badge - glassmorphism */
.badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 30px;
  background: ${accent}15; border: 1.5px solid ${accent}40;
  backdrop-filter: blur(10px);
  font-size: 18px; font-weight: 800; letter-spacing: 3px; color: ${accentLight};
  text-transform: uppercase; align-self: flex-start;
  margin-bottom: 36px;
}

/* Icon circle */
.icon-wrap {
  width: 88px; height: 88px; border-radius: 24px;
  background: linear-gradient(135deg, ${accent}25, ${accent}10);
  border: 1.5px solid ${accent}30;
  display: flex; align-items: center; justify-content: center;
  font-size: 44px; margin-bottom: 28px;
}

/* Title */
.title {
  font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 800;
  line-height: 1.15; margin-bottom: 14px;
  background: linear-gradient(135deg, #fff 0%, #e0e8f0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

/* Subtitle */
.subtitle {
  font-size: 24px; color: ${accentLight}; font-weight: 600;
  margin-bottom: 36px; letter-spacing: 0.3px;
  display: flex; align-items: center; gap: 10px;
}
.subtitle::before {
  content: ''; width: 28px; height: 2px; background: ${accent}; display: inline-block;
}

/* Stat badge */
.stat-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 20px; border-radius: 12px;
  background: linear-gradient(135deg, ${accent}20, ${accent}08);
  border: 1px solid ${accent}30;
  font-size: 20px; font-weight: 700; color: ${accentLight};
  margin-bottom: 32px; align-self: flex-start;
}
.stat-badge::before {
  content: '✦'; font-size: 14px; color: ${accent};
}

/* Bullets */
.bullets { display: flex; flex-direction: column; gap: 20px; flex: 1; }
.bullet {
  display: flex; align-items: center; gap: 18px;
  font-size: 24px; font-weight: 500; color: #c8d0dc; line-height: 1.35;
}
.bullet-icon {
  width: 36px; height: 36px; min-width: 36px; border-radius: 10px;
  background: linear-gradient(135deg, ${accent}22, ${accent}08);
  border: 1px solid ${accent}25;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: ${accentLight}; font-weight: 700;
}

/* CTA */
.cta {
  margin-top: 36px; padding: 22px 40px; border-radius: 16px;
  background: linear-gradient(135deg, ${accent}, ${accentLight});
  font-size: 26px; font-weight: 800; text-align: center;
  letter-spacing: 0.5px; color: #fff;
  box-shadow: 0 8px 32px ${accent}40, 0 2px 8px ${accent}30;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* Footer */
.footer {
  margin-top: 24px; display: flex; align-items: center; justify-content: space-between;
}
.logo-text { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
.logo-uzun { color: #fff; }
.logo-yasa { color: #E8963E; }
.handle { font-size: 19px; color: #667788; font-weight: 500; }

/* Divider line above footer */
.divider {
  width: 100%; height: 1px; margin-top: 20px;
  background: linear-gradient(90deg, transparent, ${accent}20, transparent);
}
</style></head>
<body>

<!-- Background layers -->
<div class="bg"></div>
<div class="blob1"></div>
<div class="blob2"></div>
<div class="blob3"></div>
<div class="geo-ring"></div>
<div class="geo-ring-inner"></div>
<div class="geo-line"></div>
<div class="geo-corner"></div>
<div class="geo-dots">
  ${Array(16).fill('<div class="geo-dot"></div>').join('')}
</div>
<div class="top-bar"></div>

<!-- Content -->
<div class="content">
  <div class="badge">${badge}</div>
  <div class="icon-wrap">${item.icon}</div>
  <div class="title">${item.title}</div>
  <div class="subtitle">${item.subtitle}</div>
  <div class="stat-badge">${item.stat}</div>

  <div class="bullets">
    ${item.bullets.map((b, i) => `<div class="bullet"><div class="bullet-icon">0${i+1}</div><span>${b}</span></div>`).join('\n    ')}
  </div>

  <div class="cta">${ctaText}</div>
  <div class="divider"></div>
  <div class="footer">
    <div class="logo-text"><span class="logo-uzun">Uzun</span><span class="logo-yasa">Yaşa</span></div>
    <div class="handle">@uzunyasaorg</div>
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
