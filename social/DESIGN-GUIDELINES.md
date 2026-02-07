# 🎨 UzunYaşa Social Media Design Guidelines
## Ultra-Profesyonel Instagram İçerik Standartları

---

## ❌ MEVCUT SORUNLAR

### 1. Tipografi Sorunları
- ❌ Font hiyerarşisi belirsiz (h1, h2, body ayrımı yok)
- ❌ Line-height tutarsız
- ❌ Letter-spacing ayarlanmamış
- ❌ Font weight kullanımı zayıf (sadece bold/normal)
- ❌ Emoji kullanımı amatör görünüyor
- ❌ Türkçe karakterler için font optimizasyonu yok

### 2. Renk Sistemi Sorunları
- ❌ Overlay opacity tutarsız (%65-%90 arası değişiyor)
- ❌ Accent renk (turuncu) marka ile uyumsuz
- ❌ Slide'lar arası renk geçişi kopuk
- ❌ Kontrast oranları WCAG standartlarını karşılamıyor
- ❌ Renk paleti tanımlı değil

### 3. Layout Sorunları
- ❌ Grid sistemi yok
- ❌ Padding/margin tutarsız
- ❌ Element hizalamaları off-grid
- ❌ Visual hierarchy zayıf
- ❌ White space kullanımı dengesiz
- ❌ Safe zone (Instagram UI için) hesaplanmamış

### 4. Marka Tutarlılığı
- ❌ Logo yerleşimi her slide'da farklı
- ❌ "Kaydır →" butonu ucuz görünüyor
- ❌ Glassmorphism efekti tutarsız
- ❌ Shadow değerleri standardize değil
- ❌ Border-radius tutarsız

### 5. Görsel Kalite
- ❌ Fotoğraf seçimi rastgele
- ❌ Renk grading yok
- ❌ Görsel doku/pattern eksik
- ❌ İkon seti tutarsız (emoji vs custom)

---

## ✅ PROFESYONELLİK STANDARTLARI

### 1. TİPOGRAFİ SİSTEMİ

```css
/* Type Scale (1.25 ratio) */
--font-display: 'Playfair Display', serif;  /* Başlıklar */
--font-body: 'Inter', sans-serif;            /* Gövde */

--text-hero: 80px;      /* Ana başlık */
--text-h1: 64px;        /* Slide başlığı */
--text-h2: 48px;        /* Alt başlık */
--text-h3: 36px;        /* Section başlık */
--text-body: 28px;      /* Paragraf */
--text-caption: 22px;   /* Küçük metin */
--text-micro: 18px;     /* Etiket */

/* Line Heights */
--leading-tight: 1.1;   /* Başlıklar */
--leading-normal: 1.5;  /* Gövde */
--leading-relaxed: 1.7; /* Okunabilirlik */

/* Letter Spacing */
--tracking-tight: -0.02em;   /* Büyük başlık */
--tracking-normal: 0;        /* Normal */
--tracking-wide: 0.05em;     /* Küçük metin */

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-black: 900;
```

### 2. RENK SİSTEMİ

```css
/* Primary Palette */
--brand-primary: #195157;      /* Ana yeşil */
--brand-secondary: #2A7D83;    /* Açık yeşil */
--brand-accent: #D4A574;       /* Altın/bej (TURUNCU DEĞİL!) */

/* Semantic Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;

/* Neutral Scale */
--gray-50: #FAFAFA;
--gray-100: #F4F4F5;
--gray-200: #E4E4E7;
--gray-300: #D4D4D8;
--gray-800: #27272A;
--gray-900: #18181B;

/* Overlay System */
--overlay-light: rgba(25, 81, 87, 0.65);
--overlay-medium: rgba(25, 81, 87, 0.75);
--overlay-dark: rgba(25, 81, 87, 0.85);

/* Gradient Presets */
--gradient-primary: linear-gradient(135deg, #195157 0%, #2A7D83 100%);
--gradient-warm: linear-gradient(135deg, #195157 0%, #1E6B5F 50%, #2A7D83 100%);
--gradient-accent: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
```

### 3. SPACING & GRID

```css
/* Base Unit: 8px */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
--space-6: 48px;
--space-8: 64px;
--space-10: 80px;
--space-12: 96px;

/* Instagram Safe Zones */
--safe-top: 120px;      /* Username area */
--safe-bottom: 100px;   /* Like/comment icons */
--safe-sides: 60px;     /* Edge padding */

/* Content Grid */
--grid-columns: 12;
--grid-gutter: 24px;
--content-max-width: 960px;
```

### 4. EFEKT SİSTEMİ

```css
/* Shadows */
--shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
--shadow-md: 0 4px 16px rgba(0,0,0,0.12);
--shadow-lg: 0 8px 32px rgba(0,0,0,0.16);
--shadow-xl: 0 16px 48px rgba(0,0,0,0.20);
--shadow-glow: 0 0 40px rgba(212, 165, 116, 0.4);

/* Glass Effect (Standardized) */
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-border: rgba(255, 255, 255, 0.12);
--glass-blur: 20px;

/* Text Shadows */
--text-shadow-sm: 1px 1px 4px rgba(0,0,0,0.3);
--text-shadow-md: 2px 2px 8px rgba(0,0,0,0.4);
--text-shadow-lg: 3px 3px 16px rgba(0,0,0,0.5);

/* Border Radius */
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-full: 9999px;
```

---

## 📐 SLIDE YAPISI

### Slide 1: KAPAK (Hero)
```
┌─────────────────────────────────────┐
│  [SAFE ZONE - 120px]                │
│                                     │
│         🌿 UzunYaşa                 │  ← Logo: 28px, centered
│                                     │
│                                     │
│       [HERO VISUAL/ICON]            │  ← 120-160px, minimal
│                                     │
│     ━━━━━━━━━━━━━━━━━━━━            │  ← Decorative line
│                                     │
│         ANA BAŞLIK                  │  ← 80px, Playfair Display
│         Alt Başlık                  │  ← 48px, Inter, accent color
│                                     │
│       • tag • tag • tag             │  ← 22px, muted
│                                     │
│  [SAFE ZONE - 100px]                │
│                                     │
│            ○ ○ ○ ○                  │  ← Slide indicator dots
└─────────────────────────────────────┘
```

### Slide 2-3: İÇERİK
```
┌─────────────────────────────────────┐
│  🌿                     [2/4]       │  ← Logo sol, sayfa no sağ
│                                     │
│  ┌─────────────────────────────┐    │
│  │  SECTION BAŞLIK             │    │  ← 48px, accent underline
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● İçerik kartı              │    │  ← Glass card
│  │   Alt açıklama              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● İçerik kartı              │    │
│  │   Alt açıklama              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ● İçerik kartı              │    │
│  │   Alt açıklama              │    │
│  └─────────────────────────────┘    │
│                                     │
│            ○ ● ○ ○                  │
└─────────────────────────────────────┘
```

### Slide 4: CTA (Son)
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         Daha fazlası için           │  ← 36px, light
│                                     │
│       uzunyasa.com                  │  ← 64px, bold, accent
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    🔗 Detaylı Rehber        │    │  ← Primary CTA button
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│       /blog/makale-adi              │  ← 22px, muted
│                                     │
│         ━━━━━━━━━━                  │
│                                     │
│         🌿 UzunYaşa                 │
│    Bilimsel • Bağımsız • Türkçe    │  ← Tagline
│                                     │
│            ○ ○ ○ ●                  │
└─────────────────────────────────────┘
```

---

## 🖼️ FOTOĞRAF SEÇİM KRİTERLERİ

### Yapılması Gerekenler:
- ✅ Yüksek çözünürlük (min 2000px)
- ✅ Doğal ışık, soft tonlar
- ✅ Negatif alan (text için)
- ✅ Marka renkleriyle uyumlu (yeşil, turkuaz, toprak tonları)
- ✅ Kültürel uygunluk (Türk pazarı)
- ✅ Gerçekçi, samimi görünüm

### Yapılmaması Gerekenler:
- ❌ Stok fotoğraf klişeleri (gülümseyen doktor, vs.)
- ❌ Aşırı düzenlenmiş/airbrushed
- ❌ Soğuk, klinik görünüm
- ❌ Kalabalık kompozisyon
- ❌ Düşük kontrast

### Önerilen Kaynaklar:
1. **Unsplash** - Koleksiyonlar: "Wellness", "Healthy Food", "Medical"
2. **Pexels** - "Healthcare" kategorisi
3. **Stocksy** - Premium, otantik stok (ücretli)

---

## 🎯 ICON/EMOJI KULLANIMI

### Kural: Custom İkon > Emoji
Emoji'ler amatör görünür. Bunun yerine:

```
❌ 💊 🩺 💪 📊
✅ Minimal line icons (Phosphor, Feather, Heroicons)
```

### İkon Stili:
- Stroke width: 1.5-2px
- Size: 32-48px
- Color: Beyaz veya accent
- Style: Rounded/soft

---

## ✨ MİKRO DETAYLAR

### 1. Slide Indicator Dots
```css
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
}
.dot.active {
  width: 24px;
  border-radius: 4px;
  background: var(--brand-accent);
}
```

### 2. Decorative Elements
```css
/* Subtle gradient line */
.divider {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--brand-accent), transparent);
}

/* Corner accent */
.corner-accent {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-lg);
}
```

### 3. "Kaydır" Yerine
```
❌ "Kaydır →"
✅ Minimal ok ikonu + dots
✅ Ya da hiç gösterme (herkes biliyor)
```

---

## 📱 EXPORT AYARLARI

```
Format: JPEG (photos), PNG (graphics)
Quality: 95%
Color Space: sRGB
Resolution: 1080x1080px (Feed), 1080x1920px (Story)
File Size: < 1MB
```

---

## 🔄 VERSİYON KONTROLÜ

Her slide set için:
```
social/instagram/
├── [slug]/
│   ├── slide-1.jpg
│   ├── slide-2.jpg
│   ├── slide-3.jpg
│   ├── slide-4.jpg
│   ├── story-1.jpg
│   ├── story-2.jpg
│   ├── caption.txt
│   └── metadata.json
```

---

## 📋 QA CHECKLIST

Her içerik yayınlanmadan önce:

- [ ] Tüm metinler okunabilir mi? (kontrast check)
- [ ] Safe zone'lar korunuyor mu?
- [ ] Logo her slide'da görünür mü?
- [ ] Renk paleti tutarlı mı?
- [ ] Typo/yazım hatası var mı?
- [ ] Link doğru mu?
- [ ] Mobilde test edildi mi?
- [ ] Grid hizalaması doğru mu?
- [ ] Export kalitesi yeterli mi?
- [ ] Dosya boyutu uygun mu?

---

*Bu doküman UzunYaşa marka standartlarının bir parçasıdır.*
*Son güncelleme: Şubat 2026*
