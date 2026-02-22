const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SLIDES = [
  // 1. Cover
  {
    id: 'cover',
    html: `
      <div class="slide cover">
        <div class="cover-badge">📌 Sabitlenmiş Yazı</div>
        <div class="cover-icon">🧬</div>
        <h1>Neden<br><span class="accent">UzunYaşa?</span></h1>
        <div class="cover-line"></div>
        <p class="cover-sub">Güvenilir sağlık bilgisi<br>herkesin hakkı.</p>
        <div class="cover-footer">
          <span class="logo"><span class="w">Uzun</span><span class="o">Yaşa</span></span>
          <span class="handle">@uzunyasaorg</span>
        </div>
      </div>`
  },
  // 2. Problem
  {
    id: 'problem',
    html: `
      <div class="slide problem">
        <div class="slide-num">1</div>
        <div class="slide-icon">😔</div>
        <h2>Her Muayenede<br>Aynı Hikaye</h2>
        <div class="quote-bubble">
          <p>"Doktor bey, internette okudum,<br>zerdeçal her şeye iyi geliyormuş."</p>
        </div>
        <div class="quote-bubble">
          <p>"YouTube'da bir kanal var,<br>oruç tutunca kanser iyileşiyormuş."</p>
        </div>
        <div class="quote-bubble">
          <p>"Komşum dedi bu ilacı bırakıp<br>bitkisel tedaviye geçeyim."</p>
        </div>
        <p class="bottom-text">Bu insanlar neden güvenilir<br>bilgiye ulaşamıyor?</p>
      </div>`
  },
  // 3. Stats
  {
    id: 'stats',
    html: `
      <div class="slide stats">
        <div class="slide-num">2</div>
        <h2>Türkiye'nin<br>Sağlık Tablosu</h2>
        <div class="stat-grid">
          <div class="stat">
            <div class="stat-num">%40</div>
            <div class="stat-label">Yetişkin<br>Obezite Oranı</div>
            <div class="stat-note">OECD ortalaması: %24</div>
          </div>
          <div class="stat">
            <div class="stat-num">7.2M</div>
            <div class="stat-label">Diyabet<br>Hastası</div>
            <div class="stat-note">Nüfusun %8.5'i</div>
          </div>
          <div class="stat">
            <div class="stat-num">%47</div>
            <div class="stat-label">Fiziksel Olarak<br>İnaktif Nüfus</div>
            <div class="stat-note">Neredeyse yarısı</div>
          </div>
          <div class="stat">
            <div class="stat-num highlight">76 yıl</div>
            <div class="stat-label">Ortalama<br>Yaşam Süresi</div>
            <div class="stat-note">AB ortalaması: 80.1</div>
          </div>
        </div>
        <p class="bottom-text">Bu hastalıkların çoğu <span class="accent">önlenebilir.</span></p>
      </div>`
  },
  // 4. Internet problem
  {
    id: 'internet',
    html: `
      <div class="slide internet">
        <div class="slide-num">3</div>
        <div class="slide-icon">⚠️</div>
        <h2>İnternette Sağlık Bilgisi:<br><span class="accent">Bir Mayın Tarlası</span></h2>
        <div class="problem-list">
          <div class="problem-item">
            <span class="pi-icon">💰</span>
            <span class="pi-text">Supplement reklamları<br>bilgi kılığında</span>
          </div>
          <div class="problem-item">
            <span class="pi-icon">🪄</span>
            <span class="pi-text">Mucize diyetler<br>her hafta yeni trend</span>
          </div>
          <div class="problem-item">
            <span class="pi-icon">🐭</span>
            <span class="pi-text">Fare deneyleri<br>"kanıtlanmış tedavi" olarak</span>
          </div>
          <div class="problem-item">
            <span class="pi-icon">⏱️</span>
            <span class="pi-text">8 dk muayene süresi<br>yanlış bilgiyi düzeltmeye yetmiyor</span>
          </div>
        </div>
      </div>`
  },
  // 5. Solution — UzunYaşa doğuşu
  {
    id: 'solution',
    html: `
      <div class="slide solution">
        <div class="slide-num">4</div>
        <div class="slide-icon">💡</div>
        <h2>UzunYaşa<br>Böyle Doğdu</h2>
        <div class="manifesto-box">
          <p>Türkiye'deki her birey, sağlığıyla ilgili kararlarını <span class="accent">bilimsel kanıtlara dayalı</span>, anlaşılır ve erişilebilir bilgilerle verebilmeli.</p>
        </div>
        <p class="solution-sub">Reklam destekli portal değil —<br>bir <span class="accent">kanıta dayalı sağlık platformu.</span></p>
      </div>`
  },
  // 6. 4 Pillars
  {
    id: 'pillars',
    html: `
      <div class="slide pillars">
        <div class="slide-num">5</div>
        <h2>Temel İlkelerimiz</h2>
        <div class="pillar-grid">
          <div class="pillar">
            <div class="pillar-icon">🔬</div>
            <h4>Kanıta Dayalı</h4>
            <p>Her iddia bilimsel kaynağa dayanır</p>
          </div>
          <div class="pillar">
            <div class="pillar-icon">🇹🇷</div>
            <h4>Türkçe & Erişilebilir</h4>
            <p>Tıbbi jargon yerine günlük dil</p>
          </div>
          <div class="pillar">
            <div class="pillar-icon">🎯</div>
            <h4>Pratik & Uygulanabilir</h4>
            <p>Teori değil, eylem planı</p>
          </div>
          <div class="pillar">
            <div class="pillar-icon">🛡️</div>
            <h4>Bağımsız</h4>
            <p>Sponsor etkisinden uzak, şeffaf</p>
          </div>
        </div>
      </div>`
  },
  // 7. Topics
  {
    id: 'topics',
    html: `
      <div class="slide topics">
        <div class="slide-num">6</div>
        <h2>Neler Bulacaksınız?</h2>
        <div class="topic-list">
          <div class="topic-item"><span>🥗</span> Beslenme Bilimi</div>
          <div class="topic-item"><span>💊</span> Obezite & GLP-1 İlaçları</div>
          <div class="topic-item"><span>💪</span> Egzersiz Bilimi</div>
          <div class="topic-item"><span>🧬</span> Uzun Yaşam & Yaşlanma</div>
          <div class="topic-item"><span>😴</span> Uyku & Stres</div>
          <div class="topic-item"><span>❤️</span> Kardiyovasküler Sağlık</div>
          <div class="topic-item"><span>🎗️</span> Kanser & Kronik Hastalıklar</div>
          <div class="topic-item"><span>🧠</span> Ruh Sağlığı</div>
        </div>
      </div>`
  },
  // 8. Tools
  {
    id: 'tools',
    html: `
      <div class="slide tools">
        <div class="slide-num">7</div>
        <h2>Ücretsiz Araçlarımız</h2>
        <div class="tool-grid">
          <div class="tool-card">
            <div class="tool-icon">🧮</div>
            <h4>BKİ Hesaplayıcı</h4>
            <p>Risk kategorini öğren</p>
          </div>
          <div class="tool-card">
            <div class="tool-icon">🍽️</div>
            <h4>Sahur & İftar Planlayıcısı</h4>
            <p>308 yemek, kişisel plan</p>
          </div>
          <div class="tool-card">
            <div class="tool-icon">❓</div>
            <h4>Mit Kırıcı</h4>
            <p>Sağlık mitlerini test et</p>
          </div>
          <div class="tool-card">
            <div class="tool-icon">🤖</div>
            <h4>Ecem AI</h4>
            <p>AI sağlık asistanı</p>
          </div>
        </div>
        <p class="bottom-text">Hepsi ücretsiz. Hepsi <span class="accent">uzunyasa.com</span>'da.</p>
      </div>`
  },
  // 9. Why the name
  {
    id: 'name',
    html: `
      <div class="slide name-slide">
        <div class="slide-num">8</div>
        <div class="slide-icon">✨</div>
        <h2>Neden "UzunYaşa"?</h2>
        <p class="name-text">Türkçede birine söyleyebileceğiniz<br>en güzel dileklerden biri.</p>
        <div class="name-highlight">
          <span class="big-text">"Uzun yaşa"</span>
        </div>
        <p class="name-text">Biz bu dileği gerçeğe<br>dönüştürmek istiyoruz.</p>
        <p class="name-sub">Sadece uzun değil —<br><span class="accent">sağlıklı uzun</span> yaşamak.</p>
      </div>`
  },
  // 10. CTA
  {
    id: 'cta',
    html: `
      <div class="slide cta">
        <div class="bokeh b1"></div>
        <div class="bokeh b2"></div>
        <div class="bokeh b3"></div>
        <div class="cta-logo"><span class="w">Uzun</span><span class="o">Yaşa</span></div>
        <div class="cta-tagline">Türkiye Uzun Yaşasın Diye. 🧬</div>
        <div class="cta-divider"></div>
        <p class="cta-action">Takip et, kaydet, paylaş!</p>
        <div class="cta-buttons">
          <div class="cta-btn">Kaydet 🔖</div>
          <div class="cta-btn">Paylaş 📤</div>
        </div>
        <div class="cta-handle">@uzunyasaorg</div>
        <div class="cta-url">uzunyasa.com</div>
      </div>`
  }
];

const TEMPLATE = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1080px; font-family: 'Inter', sans-serif; overflow: hidden; }

.slide {
  width: 1080px; height: 1080px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 70px 80px;
  background: linear-gradient(160deg, #0f2e31 0%, #195157 40%, #1a3a3e 100%);
  color: #fff;
  text-align: center;
  position: relative;
}

/* Subtle pattern overlay */
.slide::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 20% 80%, rgba(232,150,62,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%);
  pointer-events: none;
}

.slide-num {
  position: absolute; top: 45px; left: 60px;
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(232,150,62,0.15); border: 2px solid rgba(232,150,62,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 800; color: #E8963E;
}

.slide-icon { font-size: 64px; margin-bottom: 24px; }

h1 { font-size: 72px; font-weight: 900; line-height: 1.1; margin-bottom: 16px; }
h2 { font-size: 46px; font-weight: 800; line-height: 1.15; margin-bottom: 30px; }

.accent { color: #E8963E; }

/* Cover */
.cover-badge {
  background: #E8963E; color: #fff; padding: 10px 28px; border-radius: 30px;
  font-size: 20px; font-weight: 700; margin-bottom: 30px;
}
.cover-icon { font-size: 80px; margin-bottom: 20px; }
.cover-line { width: 80px; height: 4px; background: #E8963E; border-radius: 2px; margin: 20px 0 24px; }
.cover-sub { font-size: 30px; color: rgba(255,255,255,0.8); line-height: 1.5; }
.cover-footer {
  position: absolute; bottom: 50px; left: 0; right: 0;
  display: flex; align-items: center; justify-content: center; gap: 20px;
}
.logo { font-size: 28px; font-weight: 800; }
.logo .w { color: #fff; } .logo .o { color: #E8963E; }
.handle { font-size: 20px; color: rgba(255,255,255,0.5); }

/* Problem slide */
.quote-bubble {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px; padding: 18px 28px; margin-bottom: 14px; width: 100%;
}
.quote-bubble p { font-size: 24px; font-style: italic; color: rgba(255,255,255,0.85); line-height: 1.4; }
.bottom-text { font-size: 26px; font-weight: 700; margin-top: 20px; line-height: 1.4; }

/* Stats */
.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; margin-bottom: 20px;
}
.stat {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 24px 16px;
}
.stat-num { font-size: 48px; font-weight: 900; color: #E8963E; }
.stat-num.highlight { color: #ef4444; }
.stat-label { font-size: 18px; font-weight: 600; margin-top: 6px; line-height: 1.3; color: rgba(255,255,255,0.9); }
.stat-note { font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 6px; }

/* Internet problems */
.problem-list { width: 100%; text-align: left; }
.problem-item {
  display: flex; align-items: center; gap: 20px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  border-radius: 16px; padding: 20px 28px; margin-bottom: 14px;
}
.pi-icon { font-size: 36px; flex-shrink: 0; }
.pi-text { font-size: 22px; font-weight: 600; line-height: 1.35; color: rgba(255,255,255,0.9); }

/* Solution */
.manifesto-box {
  background: rgba(232,150,62,0.1); border: 2px solid rgba(232,150,62,0.3);
  border-radius: 20px; padding: 30px 36px; margin-bottom: 28px;
}
.manifesto-box p { font-size: 26px; line-height: 1.6; font-weight: 500; }
.solution-sub { font-size: 28px; font-weight: 600; line-height: 1.5; }

/* Pillars */
.pillar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
.pillar {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 28px 20px;
}
.pillar-icon { font-size: 44px; margin-bottom: 12px; }
.pillar h4 { font-size: 22px; font-weight: 800; margin-bottom: 8px; color: #E8963E; }
.pillar p { font-size: 18px; color: rgba(255,255,255,0.7); line-height: 1.4; }

/* Topics */
.topic-list { width: 100%; text-align: left; }
.topic-item {
  display: flex; align-items: center; gap: 16px;
  font-size: 26px; font-weight: 600; padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.topic-item span { font-size: 32px; width: 44px; text-align: center; }

/* Tools */
.tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; width: 100%; margin-bottom: 20px; }
.tool-card {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 26px 18px;
}
.tool-icon { font-size: 44px; margin-bottom: 10px; }
.tool-card h4 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
.tool-card p { font-size: 16px; color: rgba(255,255,255,0.6); }

/* Name slide */
.name-text { font-size: 28px; color: rgba(255,255,255,0.8); line-height: 1.5; margin-bottom: 24px; }
.name-highlight { margin: 16px 0 28px; }
.big-text { font-size: 56px; font-weight: 900; color: #E8963E; }
.name-sub { font-size: 30px; font-weight: 600; line-height: 1.5; }

/* CTA */
.cta { position: relative; }
.bokeh { position: absolute; border-radius: 50%; }
.b1 { width: 250px; height: 250px; top: -5%; left: -8%; background: radial-gradient(circle, rgba(232,150,62,0.12), transparent 70%); }
.b2 { width: 350px; height: 350px; bottom: -10%; right: -10%; background: radial-gradient(circle, rgba(232,150,62,0.08), transparent 70%); }
.b3 { width: 200px; height: 200px; top: 30%; right: 5%; background: radial-gradient(circle, rgba(20,145,155,0.1), transparent 70%); }
.cta-logo { font-size: 80px; font-weight: 900; margin-bottom: 16px; z-index: 1; }
.cta-logo .w { color: #fff; } .cta-logo .o { color: #E8963E; }
.cta-tagline { font-size: 32px; color: rgba(255,255,255,0.8); margin-bottom: 30px; z-index: 1; }
.cta-divider { width: 80px; height: 3px; background: #E8963E; border-radius: 2px; margin-bottom: 30px; z-index: 1; }
.cta-action { font-size: 30px; font-weight: 700; margin-bottom: 28px; z-index: 1; }
.cta-buttons { display: flex; gap: 20px; margin-bottom: 30px; z-index: 1; }
.cta-btn {
  padding: 16px 32px; border-radius: 14px; font-size: 24px; font-weight: 700;
  background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2);
}
.cta-handle { font-size: 24px; color: rgba(255,255,255,0.5); margin-bottom: 10px; z-index: 1; }
.cta-url { font-size: 28px; font-weight: 800; color: #E8963E; z-index: 1; }
</style></head>
<body>
{{CONTENT}}
</body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const outDir = path.resolve(__dirname, 'carousel-neden-uzunyasa');
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < SLIDES.length; i++) {
    const slide = SLIDES[i];
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
    const html = TEMPLATE.replace('{{CONTENT}}', slide.html);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 500));
    const filename = `${String(i + 1).padStart(2, '0')}-${slide.id}.png`;
    await page.screenshot({ path: path.join(outDir, filename), type: 'png' });
    console.log(`✅ ${i + 1}/${SLIDES.length} ${slide.id}`);
    await page.close();
  }

  await browser.close();
  console.log(`\n📸 ${SLIDES.length} carousel slides saved to ${outDir}/`);
})();
