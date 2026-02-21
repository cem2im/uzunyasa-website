const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const TOOLS = [
  {
    id: 'diyet-asistani',
    emoji: '🥗',
    title: 'Diyet Asistanı',
    subtitle: '7 Günlük Kişisel\nYemek Planı',
    features: ['BMI & kalori hesaplama', 'Türk mutfağı tarifleri', 'Alışveriş listesi'],
    color: '#10B981',
    url: 'uzunyasa.com/pages/araclar/diyet-asistani.html',
    bgImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1080&h=1080&fit=crop'
  },
  {
    id: 'egzersiz-asistani',
    emoji: '💪',
    title: 'Egzersiz Asistanı',
    subtitle: 'Kişisel Antrenman\nProgramı',
    features: ['Seviyene göre plan', 'Ev veya spor salonu', 'Haftalık program'],
    color: '#3B82F6',
    url: 'uzunyasa.com/pages/araclar/egzersiz-asistani.html',
    bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&h=1080&fit=crop'
  },
  {
    id: 'glp1-karsilastirma',
    emoji: '💊',
    title: 'GLP-1 Karşılaştırma',
    subtitle: 'Hangi Kilo İlacı\nSana Uygun?',
    features: ['Wegovy vs Mounjaro', 'Etkinlik & yan etki', 'Fiyat karşılaştırma'],
    color: '#EC4899',
    url: 'uzunyasa.com/pages/araclar/glp1-karsilastirma.html',
    bgImage: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1080&h=1080&fit=crop'
  },
  {
    id: 'glp1-uygunluk',
    emoji: '✅',
    title: 'GLP-1 Uygunluk Testi',
    subtitle: 'Bu İlaçlar\nSana Uygun mu?',
    features: ['Klinik kılavuzlara dayalı', 'Ücretsiz ön değerlendirme', '2 dakikada sonuç'],
    color: '#8B5CF6',
    url: 'uzunyasa.com/pages/araclar/glp1-uygunluk-testi.html',
    bgImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1080&h=1080&fit=crop'
  },
  {
    id: 'kac-kilo',
    emoji: '⚖️',
    title: 'Kaç Kilo Vermeliyim?',
    subtitle: 'Kişisel Hedef\nHesaplayıcı',
    features: ['İdeal kilo hedefi', 'Süre tahmini', 'Sağlık risk analizi'],
    color: '#F59E0B',
    url: 'uzunyasa.com/pages/araclar/kac-kilo-vermeliyim.html',
    bgImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1080&h=1080&fit=crop'
  },
  {
    id: 'kalori-karsilastirici',
    emoji: '🍔',
    title: 'Kalori Karşılaştırıcı',
    subtitle: 'Hangisi Daha\nKalorili?',
    features: ['100 yemek karşılaştır', 'Türk & dünya mutfağı', 'Eğlenceli oyun'],
    color: '#EF4444',
    url: 'uzunyasa.com/pages/araclar/kalori-karsilastirici.html',
    bgImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&h=1080&fit=crop'
  },
  {
    id: 'makro-ucgeni',
    emoji: '🔺',
    title: 'Makro Üçgeni',
    subtitle: 'Besin Makro\nTahmin Oyunu',
    features: ['Protein, yağ, karb tahmin et', '100 Türk yemeği', 'Beslenme bilgini test et'],
    color: '#14B8A6',
    url: 'uzunyasa.com/pages/araclar/makro-ucgeni.html',
    bgImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1080&h=1080&fit=crop'
  },
  {
    id: 'mit-kirici',
    emoji: '🔍',
    title: 'Mit Kırıcı',
    subtitle: 'Sağlık Mitleri\nTesti',
    features: ['30 popüler mit', '6 kategori', 'Bilimsel kaynaklar'],
    color: '#F97316',
    url: 'uzunyasa.com/pages/araclar/mit-kirici.html',
    bgImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1080&h=1080&fit=crop'
  },
  {
    id: 'sahur-iftar',
    emoji: '🌙',
    title: 'Sahur & İftar Planlayıcı',
    subtitle: 'Ramazan Öğün\nPlanı',
    features: ['Kişiselleştirilmiş plan', 'Kalori & makro takibi', 'Türk mutfağı önerileri'],
    color: '#6366F1',
    url: 'uzunyasa.com/pages/araclar/sahur-iftar-planlayici.html',
    bgImage: 'https://images.unsplash.com/photo-1567982047351-76b6f93e38ee?w=1080&h=1080&fit=crop'
  },
  {
    id: 'obezite-haritasi',
    emoji: '🗺️',
    title: 'Türkiye Obezite Haritası',
    subtitle: '81 İlin Obezite\nVerileri',
    features: ['İnteraktif harita', 'TÜİK verileri', 'Bölgesel karşılaştırma'],
    color: '#DC2626',
    url: 'uzunyasa.com/pages/araclar/turkiye-obezite-haritasi.html',
    bgImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1080&h=1080&fit=crop'
  }
];

function buildHTML(tool) {
  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1080px; font-family: 'Inter', sans-serif; overflow: hidden; color: #fff; position: relative; }

  /* Background photo */
  .bg-photo {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: url('${tool.bgImage}') center center / cover no-repeat;
    z-index: 0;
  }

  /* Dark overlay for text readability */
  .bg-overlay {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0,0,0,0.5) 0%,
      rgba(0,0,0,0.7) 40%,
      rgba(0,0,0,0.85) 100%
    );
    z-index: 1;
  }

  /* Colored accent glow */
  .bg-glow {
    position: absolute; top: -100px; right: -100px;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, ${tool.color}35, transparent 70%);
    z-index: 2;
  }
  .bg-glow2 {
    position: absolute; bottom: -80px; left: -80px;
    width: 350px; height: 350px; border-radius: 50%;
    background: radial-gradient(circle, ${tool.color}25, transparent 70%);
    z-index: 2;
  }

  .card {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 80px;
    text-align: center;
  }

  .badge {
    display: inline-block;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border: 2px solid ${tool.color}90;
    color: ${tool.color};
    padding: 12px 30px;
    border-radius: 30px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 40px;
  }

  .emoji { font-size: 100px; margin-bottom: 30px;
    filter: drop-shadow(0 4px 20px rgba(0,0,0,0.5)); }

  .title {
    font-size: 56px; font-weight: 900;
    line-height: 1.2; margin-bottom: 20px;
    color: #fff;
    text-shadow: 0 3px 20px rgba(0,0,0,0.8);
  }

  .subtitle {
    font-size: 40px; font-weight: 600;
    line-height: 1.3; margin-bottom: 50px;
    color: ${tool.color};
    white-space: pre-line;
    text-shadow: 0 2px 15px rgba(0,0,0,0.6);
  }

  .features {
    display: flex; flex-direction: column; gap: 16px;
    margin-bottom: 50px;
  }
  .feature {
    display: flex; align-items: center; gap: 14px;
    font-size: 28px; font-weight: 600;
    color: rgba(255,255,255,0.9);
    text-shadow: 0 2px 10px rgba(0,0,0,0.7);
  }
  .feature-dot {
    width: 12px; height: 12px; border-radius: 50%;
    background: ${tool.color}; flex-shrink: 0;
    box-shadow: 0 0 10px ${tool.color}80;
  }

  .url-bar {
    display: inline-block;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 12px;
    padding: 14px 32px;
    font-size: 22px; color: rgba(255,255,255,0.6);
    font-weight: 500;
  }
  .url-bar .highlight { color: ${tool.color}; font-weight: 700; }

  .watermark {
    position: absolute; top: 40px; right: 50px; z-index: 20;
    font-size: 26px; font-weight: 700;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  }
  .watermark .uzun { color: #fff; }
  .watermark .yasa { color: #E8963E; }

  .free-badge {
    position: absolute; top: 40px; left: 50px; z-index: 20;
    background: #10B981; color: #fff;
    padding: 8px 22px; border-radius: 20px;
    font-size: 20px; font-weight: 800;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(16,185,129,0.4);
  }
</style></head>
<body>
  <div class="bg-photo"></div>
  <div class="bg-overlay"></div>
  <div class="bg-glow"></div>
  <div class="bg-glow2"></div>
  <div class="free-badge">ÜCRETSİZ</div>
  <div class="watermark"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>
  <div class="card">
    <div class="badge">🛠️ ONLINE ARAÇ</div>
    <div class="emoji">${tool.emoji}</div>
    <div class="title">${tool.title}</div>
    <div class="subtitle">${tool.subtitle}</div>
    <div class="features">
      ${tool.features.map(f => `<div class="feature"><div class="feature-dot"></div>${f}</div>`).join('\n      ')}
    </div>
    <div class="url-bar">🔗 <span class="highlight">${tool.url}</span></div>
  </div>
</body></html>`;
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const outDir = path.resolve(__dirname, 'tool-posts');
  fs.mkdirSync(outDir, { recursive: true });

  for (const tool of TOOLS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
    await page.setContent(buildHTML(tool), { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 400));
    const outPath = path.join(outDir, `${tool.id}.jpg`);
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 95 });
    console.log(`✅ ${tool.id}`);
    await page.close();
  }

  await browser.close();
  console.log(`\n🎨 ${TOOLS.length} araç görseli hazır!`);
})();
