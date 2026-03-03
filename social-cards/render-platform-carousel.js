const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'social-posts');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const SLIDES = [
  // 1. COVER
  {
    id: 'cover',
    photo: 'photo-1506126613408-eca07ce68773', // meditation/wellness
    overlayStyle: 'brand', // special brand gradient
    content: `
      <div class="cover-slide">
        <div class="logo-row">
          <img src="file://${path.resolve(__dirname, '..', 'images', 'logo-icon-new.png')}" class="logo-img" />
        </div>
        <div class="cover-subtitle">Türkiye'nin Kanıta Dayalı Sağlık Platformu</div>
        <h1 class="cover-title">UzunYaşa'da<br/><span class="accent-text">Ne Var?</span></h1>
        <div class="cover-tagline">Bilimsel. Bağımsız. Ücretsiz.</div>
        <div class="swipe-hint">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>Kaydır</span>
        </div>
      </div>
    `
  },
  // 2. ARAÇLAR
  {
    id: 'araclar',
    photo: 'photo-1551288049-bebda4e38f71', // data/dashboard
    overlayStyle: 'teal',
    content: `
      <div class="section-slide">
        <div class="section-badge teal">12 İNTERAKTİF ARAÇ</div>
        <h2 class="section-title">Sağlığını<br/><span class="accent-teal">Test Et</span></h2>
        <div class="card-grid">
          <div class="mini-card">
            <div class="mc-icon">${icon('heart')}</div>
            <div class="mc-text">Kalp Risk<br/>Hesaplayıcı</div>
          </div>
          <div class="mini-card">
            <div class="mc-icon">${icon('bolt')}</div>
            <div class="mc-text">50 Sağlık<br/>Miti Kır</div>
          </div>
          <div class="mini-card">
            <div class="mc-icon">${icon('scale')}</div>
            <div class="mc-text">Kaç Kilo<br/>Vermeliyim?</div>
          </div>
          <div class="mini-card">
            <div class="mc-icon">${icon('shield')}</div>
            <div class="mc-text">Supplement<br/>Kanıt Rehberi</div>
          </div>
          <div class="mini-card">
            <div class="mc-icon">${icon('timer')}</div>
            <div class="mc-text">Sağlık Süresi<br/>Hesaplayıcı</div>
          </div>
          <div class="mini-card">
            <div class="mc-icon">${icon('map')}</div>
            <div class="mc-text">Türkiye Obezite<br/>Haritası</div>
          </div>
        </div>
        <div class="section-footer">+ 6 araç daha → uzunyasa.com/pages/araclar</div>
      </div>
    `
  },
  // 3. REHBERLER
  {
    id: 'rehberler',
    photo: 'photo-1498837167922-ddd27525d352', // food/healthy
    overlayStyle: 'orange',
    content: `
      <div class="section-slide">
        <div class="section-badge orange">9 KAPSAMLI REHBER</div>
        <h2 class="section-title">Adım Adım<br/><span class="accent-orange">Sağlıklı Yaşam</span></h2>
        <div class="list-grid">
          <div class="list-item">
            <div class="li-num">01</div>
            <div class="li-text">Akdeniz Diyeti Başlangıç Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">02</div>
            <div class="li-text">Aralıklı Oruç Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">03</div>
            <div class="li-text">Kalp Sağlığı Koruma Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">04</div>
            <div class="li-text">Tip 2 Diyabet Önleme Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">05</div>
            <div class="li-text">Uyku Kalitesi Artırma Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">06</div>
            <div class="li-text">Kalori Açığı Oluşturma Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">07</div>
            <div class="li-text">Plato Kırma Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">08</div>
            <div class="li-text">50+ Egzersiz Rehberi</div>
          </div>
          <div class="list-item">
            <div class="li-num">09</div>
            <div class="li-text">Evde Egzersiz Rehberi</div>
          </div>
        </div>
      </div>
    `
  },
  // 4. BLOGLAR
  {
    id: 'bloglar',
    photo: 'photo-1532187863486-abf9dbad1b69', // medical/science
    overlayStyle: 'purple',
    content: `
      <div class="section-slide">
        <div class="section-badge purple">59+ BİLİMSEL MAKALE</div>
        <h2 class="section-title">Kanıta Dayalı<br/><span class="accent-purple">Blog Yazıları</span></h2>
        <div class="topic-clouds">
          <div class="topic-tag large">GLP-1 & Ozempic</div>
          <div class="topic-tag">Bariatrik Cerrahi</div>
          <div class="topic-tag">Beslenme Bilimi</div>
          <div class="topic-tag large">Kilo Yönetimi</div>
          <div class="topic-tag">Yaşlanma & Longevity</div>
          <div class="topic-tag">Kalp Sağlığı</div>
          <div class="topic-tag large">Diyabet</div>
          <div class="topic-tag">Bağırsak Mikrobiyotası</div>
          <div class="topic-tag">Uyku & Stres</div>
          <div class="topic-tag">Kanser & Obezite</div>
        </div>
        <div class="evidence-bar">
          <div class="ev-item">
            <div class="ev-dot green"></div>
            <span>Güçlü Kanıt</span>
          </div>
          <div class="ev-item">
            <div class="ev-dot yellow"></div>
            <span>Orta Kanıt</span>
          </div>
          <div class="ev-item">
            <div class="ev-dot red"></div>
            <span>Ön Bulgu</span>
          </div>
        </div>
        <div class="section-footer">Her yazıda kanıt düzeyi etiketleri + PubMed referanslar</div>
      </div>
    `
  },
  // 5. KİM HAZIRLIYOR
  {
    id: 'kim-hazirliyor',
    photo: 'photo-1576091160399-112ba8d25d1d', // doctor/hospital
    overlayStyle: 'dark',
    content: `
      <div class="section-slide">
        <div class="section-badge white">ARKASINDA KİM VAR?</div>
        <h2 class="section-title">Akademik<br/><span class="accent-white">Kadro</span></h2>
        <div class="profile-card">
          <div class="profile-avatar">
            <div class="avatar-ring">
              <div class="avatar-initials">CŞ</div>
            </div>
          </div>
          <div class="profile-info">
            <div class="profile-name">Prof. Dr. Cem Şimşek</div>
            <div class="profile-title">Gastroenterolog & Endoskopist</div>
          </div>
        </div>
        <div class="cred-list">
          <div class="cred-item">
            ${icon('academic')}
            <span>Üniversite profesörü & aktif araştırmacı</span>
          </div>
          <div class="cred-item">
            ${icon('microscope')}
            <span>Obezite & endoskopik tedavi uzmanı</span>
          </div>
          <div class="cred-item">
            ${icon('document')}
            <span>Uluslararası hakemli dergilerde yayınlar</span>
          </div>
          <div class="cred-item">
            ${icon('users')}
            <span>Binlerce hasta deneyimi</span>
          </div>
        </div>
        <div class="cred-quote">"Bilim herkes için erişilebilir olmalı."</div>
      </div>
    `
  },
  // 6. NE İŞE YARIYOR
  {
    id: 'ne-ise-yariyor',
    photo: 'photo-1571019613454-1cb2f99b2d8b', // fitness/health
    overlayStyle: 'teal',
    content: `
      <div class="section-slide">
        <div class="section-badge teal">NEDEN UZUNYAŞA?</div>
        <h2 class="section-title">Hayatına<br/><span class="accent-teal">20 Yıl Kat</span></h2>
        <div class="stat-hero">
          <div class="stat-number">20.5</div>
          <div class="stat-label">yıl fark</div>
          <div class="stat-sub">Türkiye'de yaşam süresi ile<br/>sağlıklı yaşam süresi arasındaki uçurum</div>
        </div>
        <div class="benefit-list">
          <div class="benefit-item">
            <div class="b-check">✓</div>
            <div class="b-text">Sağlık durumunu öğren</div>
          </div>
          <div class="benefit-item">
            <div class="b-check">✓</div>
            <div class="b-text">Riskleri erken fark et</div>
          </div>
          <div class="benefit-item">
            <div class="b-check">✓</div>
            <div class="b-text">Kanıta dayalı kararlar ver</div>
          </div>
          <div class="benefit-item">
            <div class="b-check">✓</div>
            <div class="b-text">Gerçek bilimle yanlışları ayırt et</div>
          </div>
        </div>
        <div class="source-line">Kaynak: TÜİK 2025, JAMA Network Open 2024</div>
      </div>
    `
  },
  // 7. SPONSOR YOK
  {
    id: 'bagimsiz',
    photo: 'photo-1450101499163-c8848c66ca85', // business/trust
    overlayStyle: 'dark-clean',
    content: `
      <div class="section-slide">
        <div class="section-badge gold">TAMAMEN BAĞIMSIZ</div>
        <h2 class="section-title">Reklam Yok.<br/><span class="accent-gold">Sponsor Yok.</span></h2>
        <div class="trust-grid">
          <div class="trust-card">
            <div class="trust-icon">${icon('no-ad')}</div>
            <div class="trust-title">Reklam Yok</div>
            <div class="trust-desc">Hiçbir ilaç firması, takviye markası veya klinik sponsorluk yapmıyor</div>
          </div>
          <div class="trust-card">
            <div class="trust-icon">${icon('science')}</div>
            <div class="trust-title">Sadece Bilim</div>
            <div class="trust-desc">Her iddia PubMed kaynaklı araştırmalarla destekleniyor</div>
          </div>
          <div class="trust-card">
            <div class="trust-icon">${icon('lock')}</div>
            <div class="trust-title">Ücretsiz Erişim</div>
            <div class="trust-desc">Tüm araçlar, rehberler ve makaleler herkese açık</div>
          </div>
        </div>
        <div class="trust-bottom">"Amacımız satmak değil, sağlığınızı korumak."</div>
      </div>
    `
  },
  // 8. SEN DE KATIL (CTA)
  {
    id: 'cta',
    photo: 'photo-1522202176988-66273c2fd55f', // community
    overlayStyle: 'brand-cta',
    content: `
      <div class="cta-slide">
        <div class="cta-logo">
          <img src="file://${path.resolve(__dirname, '..', 'images', 'logo-icon-new.png')}" class="logo-img-sm" />
        </div>
        <h2 class="cta-title">Sen de<br/><span class="accent-text">Katıl</span></h2>
        <div class="cta-actions">
          <div class="cta-action">
            <div class="cta-num">1</div>
            <div class="cta-desc"><strong>Takip et</strong> → @uzunyasaorg</div>
          </div>
          <div class="cta-action">
            <div class="cta-num">2</div>
            <div class="cta-desc"><strong>Sağlık testini çöz</strong> → Bio'daki link</div>
          </div>
          <div class="cta-action">
            <div class="cta-num">3</div>
            <div class="cta-desc"><strong>Arkadaşına gönder</strong> → Bilgi yayılsın</div>
          </div>
        </div>
        <div class="cta-url">uzunyasa.com</div>
        <div class="cta-tagline">Bilimle Daha Uzun, Daha İyi Yaşam</div>
      </div>
    `
  }
];

function icon(name) {
  const icons = {
    'heart': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    'bolt': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    'scale': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 3v18M5 8l7-5 7 5"/><circle cx="5" cy="14" r="3"/><circle cx="19" cy="14" r="3"/></svg>`,
    'shield': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    'timer': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4M12 2v3"/></svg>`,
    'map': `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>`,
    'academic': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 10v6M2 10l10-6 10 6-10 6-10-6z"/><path d="M6 12v5c0 2 3 4 6 4s6-2 6-4v-5"/></svg>`,
    'microscope': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="9" r="2"/><path d="M12 11v4M8 21h8M12 15a6 6 0 005.2-3M7 3l4 8M15 3l-4 8"/></svg>`,
    'document': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
    'users': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
    'no-ad': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/><path d="M9 9h.01M15 9h.01"/><path d="M8 15s1.5-2 4-2 4 2 4 2"/></svg>`,
    'science': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 3v7.4L4 19a2 2 0 001.7 3h12.6A2 2 0 0020 19l-5-8.6V3"/><path d="M7 3h10"/><circle cx="12" cy="17" r="1.5"/><circle cx="9" cy="14" r="1"/></svg>`,
    'lock': `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M12 16v2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`,
  };
  return icons[name] || icons['shield'];
}

function generateSlideHTML(slide, slideIndex, totalSlides) {
  let overlayCSS = '';
  switch(slide.overlayStyle) {
    case 'brand':
      overlayCSS = 'background: linear-gradient(160deg, rgba(20,145,155,0.85) 0%, rgba(10,22,40,0.92) 40%, rgba(10,22,40,0.96) 100%);';
      break;
    case 'teal':
      overlayCSS = 'background: linear-gradient(180deg, rgba(8,50,58,0.6) 0%, rgba(8,50,58,0.88) 50%, rgba(10,22,40,0.96) 100%);';
      break;
    case 'orange':
      overlayCSS = 'background: linear-gradient(180deg, rgba(80,40,10,0.55) 0%, rgba(60,30,8,0.85) 50%, rgba(10,22,40,0.96) 100%);';
      break;
    case 'purple':
      overlayCSS = 'background: linear-gradient(180deg, rgba(40,20,80,0.6) 0%, rgba(30,15,60,0.88) 50%, rgba(10,22,40,0.96) 100%);';
      break;
    case 'dark':
      overlayCSS = 'background: linear-gradient(180deg, rgba(10,22,40,0.7) 0%, rgba(10,22,40,0.92) 50%, rgba(10,22,40,0.98) 100%);';
      break;
    case 'dark-clean':
      overlayCSS = 'background: linear-gradient(180deg, rgba(15,25,45,0.75) 0%, rgba(10,20,35,0.92) 50%, rgba(8,15,30,0.98) 100%);';
      break;
    case 'brand-cta':
      overlayCSS = 'background: linear-gradient(160deg, rgba(232,150,62,0.7) 0%, rgba(20,145,155,0.85) 40%, rgba(10,22,40,0.95) 100%);';
      break;
  }

  // Carousel dots
  let dots = '';
  for (let i = 0; i < totalSlides; i++) {
    dots += `<div class="dot ${i === slideIndex ? 'active' : ''}"></div>`;
  }

  const photoUrl = `https://images.unsplash.com/${slide.photo}?w=1080&h=1080&fit=crop&q=80`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { width: 1080px; height: 1080px; font-family: 'Inter', sans-serif; color: #fff; overflow: hidden; position: relative; }

.photo-bg {
  position: absolute; inset: 0;
  background: url('${photoUrl}') center center / cover no-repeat;
}
.overlay {
  position: absolute; inset: 0;
  ${overlayCSS}
}
.content {
  position: relative; z-index: 2;
  width: 100%; height: 100%;
  padding: 70px 70px 90px;
  display: flex; flex-direction: column;
}

/* ===== CAROUSEL DOTS ===== */
.dots {
  position: absolute; bottom: 32px; left: 50%;
  transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 10;
}
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.3);
}
.dot.active {
  background: #fff; width: 24px; border-radius: 4px;
}

/* ===== COVER SLIDE ===== */
.cover-slide {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  height: 100%; text-align: center;
}
.logo-row { margin-bottom: 30px; }
.logo-img { width: 200px; height: auto; filter: drop-shadow(0 4px 20px rgba(0,0,0,0.4)); }
.cover-subtitle {
  font-size: 22px; font-weight: 500;
  letter-spacing: 3px; text-transform: uppercase;
  opacity: 0.8; margin-bottom: 20px;
}
.cover-title {
  font-family: 'Playfair Display', serif;
  font-size: 82px; font-weight: 900;
  line-height: 1.05; margin-bottom: 30px;
}
.accent-text { color: #E8963E; }
.cover-tagline {
  font-size: 26px; font-weight: 300;
  letter-spacing: 6px; text-transform: uppercase;
  opacity: 0.7;
  margin-bottom: 50px;
}
.swipe-hint {
  display: flex; align-items: center; gap: 10px;
  font-size: 18px; font-weight: 500; opacity: 0.6;
}

/* ===== SECTION SLIDES ===== */
.section-slide {
  display: flex; flex-direction: column;
  height: 100%;
}
.section-badge {
  display: inline-block; align-self: flex-start;
  padding: 8px 22px; border-radius: 30px;
  font-size: 16px; font-weight: 700;
  letter-spacing: 2.5px; text-transform: uppercase;
  margin-bottom: 24px;
}
.section-badge.teal { background: rgba(20,145,155,0.3); border: 1.5px solid rgba(20,145,155,0.6); }
.section-badge.orange { background: rgba(232,150,62,0.25); border: 1.5px solid rgba(232,150,62,0.5); }
.section-badge.purple { background: rgba(120,80,200,0.25); border: 1.5px solid rgba(120,80,200,0.5); }
.section-badge.white { background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.3); }
.section-badge.gold { background: rgba(232,180,62,0.2); border: 1.5px solid rgba(232,180,62,0.5); color: #f0d080; }

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 62px; font-weight: 900;
  line-height: 1.1; margin-bottom: 36px;
}
.accent-teal { color: #14919B; }
.accent-orange { color: #E8963E; }
.accent-purple { color: #a07de0; }
.accent-white { color: rgba(255,255,255,0.9); }
.accent-gold { color: #f0c060; }

/* Mini card grid (Araçlar) */
.card-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 18px; flex: 1; align-content: start;
}
.mini-card {
  display: flex; align-items: center; gap: 16px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px; padding: 20px 22px;
}
.mc-icon { color: #14919B; flex-shrink: 0; }
.mc-text { font-size: 19px; font-weight: 600; line-height: 1.3; }

/* List grid (Rehberler) */
.list-grid {
  display: flex; flex-direction: column;
  gap: 8px; flex: 1;
}
.list-item {
  display: flex; align-items: center; gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.li-num {
  font-family: 'Playfair Display', serif;
  font-size: 24px; font-weight: 700;
  color: #E8963E; width: 42px; flex-shrink: 0;
}
.li-text { font-size: 21px; font-weight: 500; }

/* Topic tags (Bloglar) */
.topic-clouds {
  display: flex; flex-wrap: wrap; gap: 14px;
  flex: 1; align-content: start; margin-bottom: 30px;
}
.topic-tag {
  padding: 14px 26px; border-radius: 40px;
  font-size: 20px; font-weight: 600;
  background: rgba(120,80,200,0.15);
  border: 1.5px solid rgba(120,80,200,0.35);
}
.topic-tag.large {
  font-size: 24px; padding: 16px 30px;
  background: rgba(120,80,200,0.25);
  border-color: rgba(120,80,200,0.5);
}

.evidence-bar {
  display: flex; gap: 30px; margin-bottom: 20px;
}
.ev-item { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 500; }
.ev-dot { width: 14px; height: 14px; border-radius: 50%; }
.ev-dot.green { background: #22c55e; }
.ev-dot.yellow { background: #eab308; }
.ev-dot.red { background: #ef4444; }

/* Profile (Kim Hazırlıyor) */
.profile-card {
  display: flex; align-items: center; gap: 28px;
  margin-bottom: 36px;
}
.avatar-ring {
  width: 100px; height: 100px; border-radius: 50%;
  background: linear-gradient(135deg, #14919B, #E8963E);
  display: flex; align-items: center; justify-content: center;
  padding: 3px;
}
.avatar-initials {
  width: 94px; height: 94px; border-radius: 50%;
  background: rgba(10,22,40,0.9);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 36px; font-weight: 700;
}
.profile-name {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 700; margin-bottom: 6px;
}
.profile-title { font-size: 20px; opacity: 0.7; font-weight: 400; }

.cred-list { display: flex; flex-direction: column; gap: 22px; flex: 1; }
.cred-item { display: flex; align-items: center; gap: 18px; font-size: 21px; font-weight: 500; }
.cred-item svg { color: rgba(255,255,255,0.6); flex-shrink: 0; }
.cred-quote {
  font-family: 'Playfair Display', serif;
  font-style: italic; font-size: 24px;
  opacity: 0.7; margin-top: 30px;
  text-align: center;
}

/* Stat hero (Ne İşe Yarıyor) */
.stat-hero {
  text-align: center; margin-bottom: 30px;
  padding: 28px; border-radius: 24px;
  background: rgba(20,145,155,0.12);
  border: 1px solid rgba(20,145,155,0.25);
}
.stat-number {
  font-family: 'Playfair Display', serif;
  font-size: 90px; font-weight: 900;
  color: #14919B; line-height: 1;
}
.stat-label {
  font-size: 28px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 3px;
  margin-bottom: 8px;
}
.stat-sub { font-size: 18px; opacity: 0.6; line-height: 1.4; }

.benefit-list { display: flex; flex-direction: column; gap: 16px; flex: 1; }
.benefit-item { display: flex; align-items: center; gap: 16px; font-size: 22px; font-weight: 500; }
.b-check {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(20,145,155,0.3); color: #14919B;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; flex-shrink: 0;
}

.source-line { font-size: 14px; opacity: 0.4; margin-top: 16px; }
.section-footer { font-size: 16px; opacity: 0.5; margin-top: auto; }

/* Trust grid (Sponsor Yok) */
.trust-grid { display: flex; flex-direction: column; gap: 22px; flex: 1; }
.trust-card {
  display: flex; align-items: flex-start; gap: 20px;
  padding: 24px; border-radius: 18px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}
.trust-icon { color: #f0c060; flex-shrink: 0; }
.trust-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.trust-desc { font-size: 18px; opacity: 0.7; line-height: 1.4; }
.trust-bottom {
  font-family: 'Playfair Display', serif;
  font-style: italic; font-size: 22px;
  text-align: center; opacity: 0.6; margin-top: auto;
}

/* CTA Slide */
.cta-slide {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  height: 100%; text-align: center;
}
.cta-logo { margin-bottom: 24px; }
.logo-img-sm { width: 120px; height: auto; filter: drop-shadow(0 4px 20px rgba(0,0,0,0.4)); }
.cta-title {
  font-family: 'Playfair Display', serif;
  font-size: 76px; font-weight: 900;
  line-height: 1.05; margin-bottom: 44px;
}
.cta-actions {
  display: flex; flex-direction: column; gap: 20px;
  margin-bottom: 50px; text-align: left;
}
.cta-action {
  display: flex; align-items: center; gap: 20px;
  font-size: 24px;
}
.cta-num {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(232,150,62,0.3);
  border: 2px solid #E8963E;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 24px; font-weight: 700;
  flex-shrink: 0;
}
.cta-desc { font-weight: 400; }
.cta-desc strong { font-weight: 700; }
.cta-url {
  font-size: 30px; font-weight: 800;
  letter-spacing: 2px; margin-bottom: 12px;
  color: #14919B;
}
.cta-tagline {
  font-size: 20px; opacity: 0.5; font-weight: 300;
  letter-spacing: 2px;
}
</style>
</head>
<body>
  <div class="photo-bg"></div>
  <div class="overlay"></div>
  <div class="content">
    ${slide.content}
  </div>
  <div class="dots">${dots}</div>
</body></html>`;
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/home/clawdbot/.cache/puppeteer/chrome/linux-145.0.7632.77/chrome-linux64/chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });

  for (let i = 0; i < SLIDES.length; i++) {
    const slide = SLIDES[i];
    const html = generateSlideHTML(slide, i, SLIDES.length);
    const htmlPath = path.join(OUTPUT_DIR, `platform-${slide.id}.html`);
    fs.writeFileSync(htmlPath, html);
    
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500)); // Wait for fonts + images

    const outputPath = path.join(OUTPUT_DIR, `platform-${slide.id}.png`);
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✅ Slide ${i+1}/${SLIDES.length}: ${slide.id} → ${outputPath}`);
  }

  await browser.close();
  console.log('\n🎉 All slides rendered!');
}

main().catch(err => { console.error(err); process.exit(1); });
