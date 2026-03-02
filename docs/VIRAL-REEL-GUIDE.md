# 🎬 Viral Reel Üretim Rehberi

**Son Güncelleme:** 1 Mart 2026

---

## Pipeline Özeti

```
1. İÇERİK     → Hook + 6 slayt metni (vurucu başlık + bilimsel veri)
2. SLAYTLAR    → render-viral-slides-v2.js (Puppeteer → şeffaf PNG)
3. ARKA PLAN   → generate-viral-bg-images.js (Grok Imagine Image API)
4. BİRLEŞTİRME → assemble-viral-reel-img.sh (Ken Burns + ffmpeg xfade)
```

**Süre:** ~10-15 dk per reel (görsel üretimi dahil)
**Çıktı:** 1080×1920, ~20 sn, 3-5 MB MP4

---

## Dosya Yapısı

```
website/social-cards/
├── render-viral-slides-v2.js      ← Slayt üretici (V2 layout)
├── generate-viral-bg-images.js    ← Grok arka plan görsel üretici
├── assemble-viral-reel-img.sh     ← Ken Burns + ffmpeg birleştirici
├── reel-viral-{konu}/
│   ├── slide-01.png ... slide-06.png  (şeffaf overlay)
│   ├── bg-01.png ... bg-06.png        (Grok görseller)
│   └── (comp-*.mp4 geçici, silinir)
└── ...

website/social-posts/
└── reel-viral-{konu}.mp4          ← Final çıktı
```

---

## Tasarım Kuralları (V4 Final — Onaylı)

### Layout
- **3 bölge:** Üst (label), Orta (ana metin + alt metin), Alt (slayt no + logo)
- `justify-content: space-between` — dikeyde yayılmış, sıkışma yok
- Padding: 140px üst/alt, 72px yan

### Typography
- **Ana metin:** Playfair Display, 900 weight
- **Alt metin:** Inter, 400 weight, 34px
- **Label:** Inter, 700 weight, 17px, uppercase, letter-spacing 4px
- **Font boyutu (adaptive):**
  - ≤8 karakter → 160px
  - ≤15 karakter → 120px
  - ≤25 karakter → 96px
  - ≤40 karakter → 78px
  - >40 karakter → 64px

### Overlay
- Güçlü koyu gradient — tüm frame %60-85 karartılmış
- `linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, ... rgba(0,0,0,0.60) 50%, ... rgba(0,0,0,0.85) 100%)`
- Arka plan atmosfer olarak hissediliyor ama yazıyla yarışmıyor

### Text Shadow
- Ana metin: `0 4px 40px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6)`
- Alt metin: `0 2px 25px rgba(0,0,0,0.95), 0 0 50px rgba(0,0,0,0.8)`

### Renkler
| Kullanım | Renk |
|----------|------|
| Tehlike/şok | `#ef4444` (kırmızı) |
| Çözüm/pozitif | `#10b981` (yeşil) |
| Bilgi/nötr | `#14919B` (teal) |
| Vurgu/uyarı | `#E8963E` (turuncu) |
| Uyku/beyin | `#6366f1` (indigo) |
| Bağırsak/serotonin | `#ec4899` (pembe) |
| CTA gradient | `#14919B → #E8963E` |

### Ken Burns Efekti
- Zoom: %1.0 → %1.12 (slow zoom in)
- Arka plan görseli `scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840` ile tam 9:16'ya sığdırılıyor

### Video
- 6 slayt × 3.6 sn = 21.6 sn (- fade süreleri = ~19.6 sn)
- xfade transition: fade, 0.4 sn
- Codec: libx264, CRF 20, preset medium
- `movflags +faststart` (Instagram uyumlu)

---

## Hook Yazma Kuralı (V4)

**Formül: Şok cümlesi önde, kaynak arkada**

| ❌ Eski (kaynak-odaklı) | ✅ Yeni (vurucu) |
|-------------------------|------------------|
| "3,4M kişi incelendi" | "En Büyük Ölüm Riski Sigara Değil" |
| "226.889 kişilik çalışma" | "10.000 Adım Bir Yalan" |
| "UCLA araştırması" | "Zayıf Olmak Sizi Kurtarmıyor" |
| "Science dergisi keşfetti" | "Beyniniz Her Gece Çöp Topluyor" |
| "Caltech kanıtladı" | "Mutluluk Beyinde Üretilmiyor" |
| "1M Lancet çalışması" | "Koltuğunuz Sizi Öldürüyor" |

**Kural:** İlk slayt scroll durdurucu. Kaynak ikinci slayta.

---

## Slayt Yapısı (6 slayt)

| # | İçerik | Amacı |
|---|--------|-------|
| 1 | **Vurucu hook** + kısa alt metin | Scroll durdur |
| 2 | Ana veri + kaynak citation | Güvenilirlik |
| 3 | Karşılaştırma veya mekanizma | Derinlik |
| 4 | İstatistik veya çalışma detayı | Bilimsellik |
| 5 | Çözüm / "ne yapmalı" | Pratik değer |
| 6 | CTA + gradient text + uzunyasa.com | Etkileşim |

---

## Arka Plan Görselleri

### API
- Model: `grok-imagine-image` (NOT `grok-2-image`)
- Endpoint: `POST https://api.x.ai/v1/images/generations`
- Response: `data[0].url` → JPEG indir

### Prompt Kuralları
- Her zaman "no text no letters" ekle
- Cinematic, dark tones tercih et
- Konuyla ilgili ama metin alanını boğmayan görseller
- İnsan yüzü yok (marka kuralı)

---

## Yeni Reel Ekleme — Adım Adım

### 1. Slayt verisi ekle
`render-viral-slides-v2.js` dosyasında REELS objesine yeni konu ekle:

```javascript
'yeni-konu': [
  { text: 'Vurucu Hook', sub: 'Alt açıklama', accent: '#ef4444', label: '' },
  { text: 'Ana Veri', sub: 'Detay', accent: '#ef4444', label: 'Kaynak · Yıl' },
  // ... 6 slayt
  { text: 'CTA Mesajı', sub: 'Kısa özet.', accent: '#14919B', label: 'uzunyasa.com', isCTA: true },
],
```

### 2. Arka plan prompt'ları ekle
`generate-viral-bg-images.js` dosyasında REELS objesine 6 prompt ekle.

### 3. Üret
```bash
cd website/social-cards

# Slaytları üret
node render-viral-slides-v2.js

# Arka planları üret (tek konu)
node generate-viral-bg-images.js yeni-konu

# Birleştir
bash assemble-viral-reel-img.sh yeni-konu
```

### 4. Gönder
```bash
cp ../social-posts/reel-viral-yeni-konu.mp4 /home/clawdbot/.openclaw/media/
# message tool ile Telegram'a gönder
```

---

## Üretilmiş Reeller (Mart 2026)

| # | Konu | Hook | Süre | Boyut |
|---|------|------|------|-------|
| 1 | yalnizlik | "En Büyük Ölüm Riski Sigara Değil" | 19.6s | 3.2MB |
| 2 | adim | "10.000 Adım Bir Yalan" | 19.6s | 4.5MB |
| 3 | kas | "Zayıf Olmak Sizi Kurtarmıyor" | 19.6s | 4.0MB |
| 4 | uyku | "Beyniniz Her Gece Çöp Topluyor" | 19.6s | 4.4MB |
| 5 | bagirsak | "Mutluluk Beyinde Üretilmiyor" | 19.6s | 4.5MB |
| 6 | oturma | "Koltuğunuz Sizi Öldürüyor" | 19.6s | 3.8MB |

---

## Potansiyel Yeni Konular (Backlog)

Viral potansiyeli yüksek, henüz üretilmemiş:

| Konu | Hook Taslağı | Kaynak |
|------|-------------|--------|
| Türkiye obezite | "Akdeniz Diyetinin Vatanındayız Ama 3 Kişiden 1'imiz Obez" | OECD 2024 |
| Diyabet | "Avrupa'da Diyabet Şampiyonu Kim?" | TURDEP-II, IDF |
| 8 bardak su | "Günde 8 Bardak Su Bir Yanlış Tercümeden Geldi" | 1945 ABD raporu |
| Kahve | "Kahve Sizi Öldürmüyor — Tam Tersi" | Poole, BMJ 2017 |
| Doktorun söylemediği | "Doktorunuzun Size Söyleyemediği 5 Şey" | Çoklu kaynak |
| Anneanneniz haklıymış | "Anneannenizin Tavsiyeleri Bilimsel mi?" | Kültürel + bilim |
| Soğuk duş | "30 Gün Soğuk Duş — Vücuda Ne Olur?" | Buijze, PLOS ONE 2016 |
