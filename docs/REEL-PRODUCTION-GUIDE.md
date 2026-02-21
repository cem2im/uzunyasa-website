# 🎬 UzunYaşa Reel Üretim Rehberi — A'dan Z'ye

**Amaç:** Bu rehber, sıfırdan profesyonel bir Instagram reeli nasıl üretilir, adım adım anlatır. Hiçbir ön bilgi gerektirmez. Tüm araçlar, komutlar ve API detayları dahildir.

**Son Güncelleme:** 21 Şubat 2026  
**Örnek Proje:** Oral Wegovy / İğnesiz GLP-1 Reeli

---

## 📋 İçindekiler

1. [Genel Bakış — Süreç Özeti](#1-genel-bakış)
2. [Gerekli Araçlar](#2-gerekli-araçlar)
3. [Adım 1: İçerik Hazırlığı](#3-adım-1-içerik-hazırlığı)
4. [Adım 2: HTML Slayt Tasarımı](#4-adım-2-html-slayt-tasarımı)
5. [Adım 3: Slaytları PNG'ye Çevirme (Puppeteer)](#5-adım-3-slaytları-pngeye-çevirme)
6. [Adım 4: Arka Plan Videoları Üretme (Grok API)](#6-adım-4-arka-plan-videoları-üretme)
7. [Adım 5: Video + Metin Birleştirme (ffmpeg)](#7-adım-5-video--metin-birleştirme)
8. [Adım 6: Sahneleri Birleştirme ve Geçişler](#8-adım-6-sahneleri-birleştirme)
9. [Adım 7: Kontrol ve Gönderme](#9-adım-7-kontrol-ve-gönderme)
10. [Dosya Yapısı](#10-dosya-yapısı)
11. [Sorun Giderme](#11-sorun-giderme)
12. [Reel Stratejisi — Playbook Kuralları](#12-reel-stratejisi)

---

## 1. Genel Bakış

Reel üretimi 4 ana katmandan oluşur:

```
┌──────────────────────────────────────────────┐
│  1. İÇERİK          Konu, metin, hook yazımı │
│  2. METİN OVERLAY    HTML → PNG (şeffaf)      │
│  3. ARKA PLAN VİDEO  Grok AI ile üretim       │
│  4. BİRLEŞTİRME     ffmpeg ile composite      │
└──────────────────────────────────────────────┘
```

**Sonuç:** 720×1280 piksel, 25-30 saniye, Instagram'a hazır MP4 dosyası.

**Süreç süresi:** ~15-20 dakika (arka plan video üretimi dahil)

---

## 2. Gerekli Araçlar

### Yazılımlar (sunucuya kurulmuş olmalı)

| Araç | Ne İşe Yarar | Kurulum |
|------|-------------|---------|
| **Node.js** (v18+) | JavaScript çalıştırma | `apt install nodejs` |
| **Puppeteer** | HTML'i görüntüye çevirme | `npm install puppeteer` |
| **Chrome/Chromium** | Puppeteer'ın kullandığı tarayıcı | `npx puppeteer browsers install chrome` |
| **ffmpeg** | Video işleme, birleştirme | `apt install ffmpeg` |

### API Anahtarları

| API | Kullanım | Nereden Alınır |
|-----|---------|----------------|
| **xAI (Grok)** | Arka plan video üretimi | https://console.x.ai → API Keys |

API anahtarı ortam değişkeni olarak ayarlanır:
```bash
export XAI_API_KEY="xai-senin-anahtarin-buraya"
```

### Kurulum (ilk seferlik)

```bash
# 1. Puppeteer ve Chrome kurulumu
cd website/social-cards
npm install puppeteer
npx puppeteer browsers install chrome

# 2. ffmpeg kontrolü
ffmpeg -version  # Kurulu olmalı

# 3. Çalışma klasörlerini oluştur
mkdir -p slides-v2 backgrounds
```

---

## 3. Adım 1: İçerik Hazırlığı

### Reel Yapısı (Playbook Kuralı)

Her reel **8 sahne**den oluşur:

| Sahne | Süre | İçerik | Amaç |
|-------|------|--------|------|
| **Hook** | 3 sn | Scroll durdurucu cümle | İlk 3 saniyede dikkat çekme |
| **Bilgi 1** | 4 sn | Ana bilgi | Konuyu tanıtma |
| **Bilgi 2** | 4 sn | İstatistik/veri | Güvenilirlik |
| **Bilgi 3** | 4 sn | Pratik bilgi | "Ne işime yarar?" |
| **Bilgi 4** | 4 sn | Otorite/onay | Kaynak gösterme |
| **Bilgi 5** | 4 sn | Güncellik | "Neden şimdi?" |
| **Özet** | 4 sn | Tek cümle mesaj | Akılda kalıcı |
| **CTA** | 3 sn | Kaydet/Paylaş | Etkileşim artırma |

**Toplam:** ~26-30 saniye

### Hook Yazma Formülleri

Hook, reelin en önemli kısmıdır. İlk 3 saniyede kişi kaydırmayı bırakmazsa, geri kalanını görmez.

| Formül | Örnek |
|--------|-------|
| **Şok edici istatistik** | "Her 3 kişiden 1'i obez!" |
| **Soru** | "Haftada 1 iğne yerine günde 1 hap?" |
| **İnancı sorgula** | "Detoks diyetleri bir yalandır." |
| **Vaat** | "Bu 5 alışkanlık metabolizmanızı hızlandırır 🔥" |
| **Merak boşluğu** | "Doktorların size söylemediği bir şey var..." |
| **X'i yapmayı bırakın** | "Bu 3 alışkanlığı hemen bırakın ❌" |

### Dil Kuralları — Halkın Anlayacağı Dil

| ❌ Tıbbi/Teknik | ✅ Herkesin Anlayacağı |
|----------------|----------------------|
| GLP-1 agonisti | İştah kesici ilaç |
| Klinik çalışmalar | Yapılan araştırmalar |
| FDA onaylı | Amerika İlaç Dairesi onayladı |
| Oral semaglutide | Hap şeklinde kilo ilacı |
| Vücut ağırlığının %15'i | Kilonuzun %15'i kadar zayıflama |
| Subkutan enjeksiyon | İğne |

### Örnek İçerik Planı (Oral Wegovy Reeli)

```
HOOK:    "İĞNEYE SON! Kilo vermek için artık iğneye gerek yok!"
BİLGİ 1: "Kilo verme tedavisinde devrim! Artık hap şeklinde iştah kesici ilaç var"
BİLGİ 2: "Yapılan araştırmalarda hastalar kilolarının %15'ine kadar zayıflamayı başardı"
BİLGİ 3: "Her gün sadece bir hap alıyorsunuz — haftada bir iğne olmaya son!"
BİLGİ 4: "Amerika İlaç Dairesi bu ilacı resmen onayladı, binlerce kişide test edildi"
BİLGİ 5: "Şu an Amerika'da satışta, yakında tüm dünyaya yayılması bekleniyor"
ÖZET:    "Kilo verme tedavisinde yeni bir çağ başlıyor — İğnesiz. Kolay. Etkili."
CTA:     "Bu bilgiyi kaydet ve sevdiklerinle paylaş!"
```

---

## 4. Adım 2: HTML Slayt Tasarımı

Her slayt bir HTML dosyası olarak tasarlanır. Boyut: **1080×1920 piksel** (9:16 dikey format).

### Neden HTML?

- AI görsel üreticileri yazıyı doğru yazamaz (harf hataları yapar)
- HTML ile yazı tipi, boyut, konum tam kontrol altında
- Şeffaf PNG olarak kaydedilir → video arka planın üstüne konur

### Temel Tasarım Kuralları

```
- Arka plan: ŞEFFAF (transparent) — video üstüne konacak
- Yazı: Beyaz (#FFFFFF), kalın (700-900 weight)
- Vurgu rengi: Turuncu (#E8963E)
- Font: Inter (Google Fonts)
- Text-shadow: Güçlü (video üstünde okunabilirlik için)
- Hafif karanlık overlay (vignette): radial-gradient ile kenarlar karartılır
- Logo: Sağ üst köşe "UzunYaşa"
- Footer: Alt kısım "uzunyasa.com"
```

### Slayt Tipleri

**1. Hook Slaydı:**
```html
<div class="hook-content">
  <div class="hook-pill">💊</div>           <!-- Büyük emoji -->
  <div class="hook-main">İĞNEYE SON!</div>  <!-- Dev turuncu başlık -->
  <div class="hook-line"></div>              <!-- Turuncu çizgi -->
  <div class="hook-sub">Kilo vermek için artık<br>iğneye gerek yok!</div>
</div>
```

**2. Bilgi Slaydı (Fact):**
```html
<div class="fact-content">
  <div class="fact-num">1</div>              <!-- Numaralı daire -->
  <div class="fact-main">
    Kilo verme tedavisinde <span class="accent">devrim!</span><br>
    Artık hap şeklinde<br>
    iştah kesici ilaç var
  </div>
</div>
<div class="source-line">Kaynak: FDA, Şubat 2026</div>
```

**3. Özet Slaydı:**
```html
<div class="summary-content">
  <div class="summary-icon">🧬</div>
  <div class="summary-main">
    Kilo verme tedavisinde<br>
    <span class="accent">yeni bir çağ</span> başlıyor
  </div>
  <div class="summary-sub">İğnesiz. Kolay. Etkili.</div>
</div>
```

**4. CTA Slaydı:**
```html
<div class="cta-content">
  <div class="cta-logo"><span class="uzun">Uzun</span><span class="yasa">Yaşa</span></div>
  <div class="cta-tagline">Bilimle Daha Uzun Yaşa</div>
  <div class="cta-save">Bu bilgiyi kaydet ve<br>sevdiklerinle paylaş!</div>
  <div class="cta-actions">
    <div class="cta-btn">Kaydet 🔖</div>
    <div class="cta-btn">Paylaş 📤</div>
  </div>
  <div class="cta-handle">@uzunyasaorg</div>
  <div class="cta-url">uzunyasa.com</div>
</div>
```

### Kritik CSS Detayları

```css
/* Arka plan ŞEFFAF olmalı — video alttan gelecek */
body { background: transparent; }

/* Vignette overlay — kenarları karartır, yazı okunur kalır */
.overlay {
  background: radial-gradient(ellipse at center,
    rgba(0,0,0,0.15) 0%,    /* Ortada hafif */
    rgba(0,0,0,0.5) 100%);  /* Kenarlarda koyu */
}

/* Yazı gölgesi — video üstünde okunabilirlik için ZORUNLU */
text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7);

/* Turuncu vurgu rengi */
.accent { color: #E8963E; }
```

### Tam Şablon Dosyası

Dosya: `website/social-cards/render-reel-v2.js`

Bu dosya hem HTML şablonunu hem de 8 slaydın içeriklerini içerir. Yeni bir reel için sadece `SLIDES` dizisindeki metinleri değiştirin.

---

## 5. Adım 3: Slaytları PNG'ye Çevirme

Puppeteer, HTML'i bir tarayıcıda açıp ekran görüntüsü alır.

### Çalıştırma

```bash
cd website/social-cards
node render-reel-v2.js
```

### Ne Yapar?

1. Her slayt için Chrome'u açar (headless — ekransız)
2. Viewport'u 1080×1920 piksel yapar
3. HTML'i render eder, fontların yüklenmesini bekler
4. **Şeffaf arka planlı PNG** olarak kaydeder → `slides-v2/` klasörü
5. Kontrol için JPG de kaydeder

### Çıktı

```
slides-v2/
├── hook.png      (şeffaf arka plan — video üstüne konacak)
├── hook.jpg      (kontrol amaçlı)
├── fact1.png
├── fact1.jpg
├── fact2.png
├── ...
├── summary.png
├── cta.png
└── cta.jpg
```

### Önemli Puppeteer Ayarları

```javascript
// Tarayıcıyı başlat (sunucuda, sandbox olmadan)
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

// Viewport boyutu = slayt boyutu
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

// Fontların yüklenmesini bekle (yoksa yazılar bozuk çıkar!)
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 500)); // Ekstra güvenlik

// ŞEFFAF arka plan ile PNG kaydet
await page.screenshot({
  path: 'slides-v2/hook.png',
  type: 'png',
  omitBackground: true   // ← BU ÇOK ÖNEMLİ! Şeffaflık için
});
```

---

## 6. Adım 4: Arka Plan Videoları Üretme (Grok API)

Her sahne için Grok Imagine Video API ile sinematik arka plan videosu üretilir.

### API Bilgileri

| Alan | Değer |
|------|-------|
| Endpoint | `POST https://api.x.ai/v1/videos/generations` |
| Model | `grok-imagine-video` |
| Format | 720p, 9:16, 5 saniye |
| Yanıt | `request_id` döner → sonra poll edilir |

### İstek Gönderme

```bash
curl -X POST https://api.x.ai/v1/videos/generations \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-video",
    "prompt": "Cinematic close-up of a white pill on dark reflective surface, dramatic golden lighting, 9:16 vertical, no text no watermark",
    "duration": 5,
    "aspect_ratio": "9:16",
    "resolution": "720p"
  }'
```

**Yanıt:**
```json
{ "request_id": "abc123-def456-..." }
```

### Sonucu Kontrol Etme (Poll)

```bash
curl https://api.x.ai/v1/videos/abc123-def456-... \
  -H "Authorization: Bearer $XAI_API_KEY"
```

**Hazır olunca:**
```json
{
  "video": {
    "url": "https://..../video.mp4",
    "duration": 5
  }
}
```

**Henüz hazır değilse:**
```json
{ "status": "processing" }
```

→ 5 saniye bekle, tekrar dene. Genelde 15-30 saniye sürer.

### Video URL'sini İndirme

```bash
curl -o backgrounds/hook.mp4 "https://..../video.mp4"
```

### Her Sahne İçin Prompt Örnekleri

| Sahne | Prompt (İngilizce yazılmalı!) |
|-------|------|
| **Hook** | `Cinematic close-up of a single white pill on dark reflective surface, dramatic golden lighting, shallow depth of field, slow camera dolly forward, 9:16 vertical, no text no watermark` |
| **Bilgi 1** | `Modern medical laboratory, glass vials and pills on clean white surface, soft blue teal lighting, slow pan, no people no faces, 9:16 vertical, no text no watermark` |
| **Bilgi 2** | `Person stepping on modern digital weight scale, shot from above showing only feet and scale, warm morning light, no face visible, 9:16 vertical, no text no watermark` |
| **Bilgi 3** | `Side by side: a single white pill and a medical syringe on marble surface, golden hour lighting, camera slowly zooming into the pill, no people, 9:16 vertical, no text no watermark` |
| **Bilgi 4** | `Official medical documents and research papers on desk, FDA approval stamp, stethoscope nearby, warm office lighting, slow camera pan, no people, 9:16 vertical, no text no watermark` |
| **Bilgi 5** | `Modern pharmacy shelves with medicine boxes, clean bright lighting, camera dolly along aisle, American drugstore aesthetic, no people, 9:16 vertical, no text no watermark` |
| **Özet** | `Abstract 3D DNA double helix rotating slowly, dark blue teal background with golden particle effects, futuristic medical visualization, 9:16 vertical, no text no watermark` |
| **CTA** | `Elegant dark teal background with floating golden bokeh particles, slow motion, warm inviting atmosphere, premium luxury aesthetic, 9:16 vertical, no text no watermark` |

### Prompt Yazma Kuralları

1. **İngilizce yaz** — Grok İngilizce promptlarda daha iyi sonuç verir
2. **"no text no watermark" ekle** — yoksa rastgele yazılar koyabilir
3. **"no people no faces" ekle** — UzunYaşa kuralı: insan yüzü kullanmıyoruz
4. **"9:16 vertical" ekle** — dikey format belirt
5. **Kamera hareketi belirt** — "slow pan", "dolly forward", "zoom in" gibi
6. **Aydınlatma belirt** — "golden hour", "soft blue lighting", "cinematic"

### Otomatik Script

Tüm 8 videoyu otomatik üreten script: `website/social-cards/generate-backgrounds.js`

```bash
XAI_API_KEY="..." node generate-backgrounds.js
```

Bu script:
1. 8 video isteğini aynı anda gönderir (paralel)
2. Hepsinin tamamlanmasını bekler (5 saniyede bir kontrol)
3. Tamamlananları indirir → `backgrounds/` klasörüne kaydeder

### Çıktı

```
backgrounds/
├── hook.mp4     (5 sn, 720x1280)
├── fact1.mp4
├── fact2.mp4
├── fact3.mp4
├── fact4.mp4
├── fact5.mp4
├── summary.mp4
└── cta.mp4
```

---

## 7. Adım 5: Video + Metin Birleştirme (Composite)

Bu adımda her sahne için: **arka plan video + metin PNG overlay = final sahne videosu**

### Temel Komut

```bash
ffmpeg -y \
  -i backgrounds/hook.mp4 \        # Girdi 1: Arka plan videosu
  -loop 1 -i slides-v2/hook.png \  # Girdi 2: Metin overlay (PNG, şeffaf)
  -filter_complex " \
    [0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30[bg]; \
    [1:v]scale=720:1280,format=rgba[ov]; \
    [bg][ov]overlay=0:0[v]" \
  -map "[v]" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -t 3 \                           # Süre: 3 saniye (hook için)
  composited/hook.mp4
```

### Bu Komut Ne Yapıyor?

```
1. Arka plan videosunu alır (backgrounds/hook.mp4)
2. PNG overlay'i alır ve SONSUZ DÖNGÜYE sokar (-loop 1)
   → PNG tek kare olduğu için loop gerek!
3. Her ikisini 720×1280'e ölçekler
4. PNG'yi videonun üstüne koyar (overlay=0:0)
5. H.264 codec ile MP4 olarak kaydeder
6. -t 3 ile 3 saniyeye keser
```

### ⚠️ Kritik Uyarı: `-loop 1` Zorunlu!

PNG tek bir karedir. `-loop 1` olmadan ffmpeg, PNG'yi 1 kare (0.03 saniye) olarak okur ve video anında biter!

```
❌ YANLIŞ:  -i slides-v2/hook.png               → 0.03 saniyelik video!
✅ DOĞRU:   -loop 1 -i slides-v2/hook.png        → PNG video süresince tekrarlar
```

### Her Sahne İçin Süreler

```bash
# Hook: 3 saniye
ffmpeg ... -t 3 composited/hook.mp4

# Bilgi slaytları: 4 saniye (okuma süresi daha uzun)
ffmpeg ... -t 4 composited/fact1.mp4
ffmpeg ... -t 4 composited/fact2.mp4
ffmpeg ... -t 4 composited/fact3.mp4
ffmpeg ... -t 4 composited/fact4.mp4
ffmpeg ... -t 4 composited/fact5.mp4

# Özet: 4 saniye
ffmpeg ... -t 4 composited/summary.mp4

# CTA: 3 saniye
ffmpeg ... -t 3 composited/cta.mp4
```

### Otomatik Script

`assemble-reel-v2.sh` dosyası hem composite hem birleştirmeyi yapar:

```bash
bash assemble-reel-v2.sh
```

---

## 8. Adım 6: Sahneleri Birleştirme ve Geçişler

8 sahne videosunu tek bir reele birleştirme. **Crossfade (fade)** geçiş kullanıyoruz.

### Crossfade (xfade) Mantığı

```
Sahne A (4 sn) + Sahne B (4 sn) + 0.5 sn fade = 7.5 sn toplam
                  ↑
          A'nın son 0.5 sn'si + B'nin ilk 0.5 sn'si üst üste biner
```

### Offset Hesaplama

`offset` = fade'in BAŞLADIĞI an (birinci videonun başından itibaren)

```
İlk birleştirme:
  A süresi = 3 sn (hook)
  offset = 3 - 0.5 = 2.5
  Çıktı süresi = 3 + 4 - 0.5 = 6.5 sn

İkinci birleştirme:
  Önceki çıktı = 6.5 sn
  offset = 6.5 - 0.5 = 6.0
  Çıktı süresi = 6.5 + 4 - 0.5 = 10.0 sn

...ve böyle devam eder.
```

**Formül:** Her adımda `offset = toplam_süre - fade_süresi`

### Komutlar (Sırayla)

```bash
FADE=0.5

# 1. hook + fact1
ffmpeg -y -i hook.mp4 -i fact1.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=2.5[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p m01.mp4
# Çıktı: 6.5 sn

# 2. + fact2
ffmpeg -y -i m01.mp4 -i fact2.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=6.0[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p m02.mp4
# Çıktı: 10.0 sn

# 3. + fact3
# offset=9.5, çıktı=13.5 sn

# 4. + fact4
# offset=13.0, çıktı=17.0 sn

# 5. + fact5
# offset=16.5, çıktı=20.5 sn

# 6. + summary
# offset=20.0, çıktı=24.0 sn

# 7. + cta (FİNAL)
# offset=23.5, çıktı=26.5 sn → oral-wegovy-reel-v3.mp4
```

### Diğer Geçiş Tipleri

`xfade=transition=` parametresiyle değiştirilebilir:

| Geçiş | Görünüm |
|--------|---------|
| `fade` | Klasik fade in/out (önerilen) |
| `wipeleft` | Soldan silme |
| `wiperight` | Sağdan silme |
| `slideup` | Yukarı kaydırma |
| `dissolve` | Pixelli çözünme |
| `smoothleft` | Yumuşak sol kayma |

---

## 9. Adım 7: Kontrol ve Gönderme

### Video Kontrolü — Frame Çıkarma

```bash
# Videonun farklı noktalarından kare çıkar
ffmpeg -i oral-wegovy-reel-v3.mp4 \
  -vf "select='eq(n\,30)+eq(n\,120)+eq(n\,240)+eq(n\,360)+eq(n\,480)+eq(n\,570)+eq(n\,660)+eq(n\,750)'" \
  -vsync vfr kontrol_%03d.jpg
```

Bu komut 8 kare çıkarır — her sahne için bir tane. Gözle kontrol et:
- ✅ Arka plan videosu görünüyor mu?
- ✅ Yazılar okunabiliyor mu?
- ✅ Sayılar doğru sırada mı?
- ✅ Logo ve footer görünüyor mu?

### Video Bilgisi Kontrolü

```bash
ffprobe -v quiet -print_format json -show_format oral-wegovy-reel-v3.mp4
```

Kontrol et:
- **duration:** 25-30 saniye arası olmalı
- **size:** 2-10 MB arası ideal (Instagram yükleme limiti: 650MB)

### Teknik Özellikler

| Özellik | Değer |
|---------|-------|
| Çözünürlük | 720×1280 |
| Aspect Ratio | 9:16 |
| Codec | H.264 (libx264) |
| FPS | 30 |
| Süre | 25-30 saniye |
| Boyut | 2-10 MB |
| Format | MP4 |

---

## 10. Dosya Yapısı

```
website/social-cards/
├── render-reel-v2.js          # Metin slaytlarını PNG'ye çeviren script
├── generate-backgrounds.js    # Grok API ile arka plan video üretimi
├── assemble-reel-v2.sh        # Video birleştirme script'i
├── reel-slides.html           # HTML şablon (referans)
│
├── slides-v2/                 # Puppeteer çıktısı
│   ├── hook.png               # Şeffaf metin overlay'ler
│   ├── fact1.png
│   ├── ...
│   └── cta.png
│
├── backgrounds/               # Grok AI video çıktısı
│   ├── hook.mp4               # Arka plan videoları
│   ├── fact1.mp4
│   ├── ...
│   └── cta.mp4
│
└── oral-wegovy-reel-v3.mp4    # FİNAL REEL ✅
```

---

## 11. Sorun Giderme

### Video çok kısa (0.03 saniye) çıkıyor
**Sebep:** PNG overlay `-loop 1` olmadan kullanılmış.
**Çözüm:** `-loop 1 -i overlay.png` kullan.

### Arka plan görünmüyor (siyah ekran)
**Sebep:** HTML'de `background: transparent` yerine renkli arka plan var.
**Çözüm:** Body background'u `transparent` yap, `omitBackground: true` ile PNG kaydet.

### Yazılar okunamıyor (video üstünde kayboluyorlar)
**Sebep:** Text-shadow yetersiz veya vignette overlay çok açık.
**Çözüm:**
```css
text-shadow: 0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.7);
```
Vignette overlay'i artır: `rgba(0,0,0,0.5) → rgba(0,0,0,0.6)`

### Grok video üretimi başarısız
**Sebep:** API anahtarı yanlış veya kota dolmuş.
**Çözüm:** `XAI_API_KEY` ortam değişkenini kontrol et. https://console.x.ai adresinden kota durumunu kontrol et.

### Fontlar yüklenmiyor (kare kutular görünüyor)
**Sebep:** Google Fonts'a erişim yok veya emoji desteği eksik.
**Çözüm:** Puppeteer'da `waitUntil: 'networkidle0'` ve `document.fonts.ready` bekle.

### xfade offset hatası
**Sebep:** Offset değeri videonun süresinden uzun.
**Çözüm:** Her adımda `offset = mevcut_toplam_süre - fade_süresi` formülünü kullan.

---

## 12. Reel Stratejisi — Playbook Kuralları

### Instagram Algoritma Bilgileri

| Sinyal | Önem | Bizim İçin |
|--------|------|------------|
| **Kaydetme** | 🔴 En Yüksek | Eğitici içerik → kaydetme |
| **Paylaşma** | 🔴 En Yüksek | Şaşırtıcı bilgi → paylaşma |
| **Yorum** | 🟡 Yüksek | Soru sor, tartışma başlat |
| **İzleme süresi** | 🟡 Yüksek | İlk 3 saniye kritik! |
| **Beğeni** | 🟢 Orta | En kolay etkileşim |

### Görsel Kurallar

- ❌ İnsan yüzü kullanma (kurumsal marka)
- ❌ Satış dili kullanma ("hemen al" değil, "bilgi edin")
- ❌ TikTok watermark'ı kullanma
- ✅ Her slaytta max 3 satır yazı
- ✅ Yumuşak geçişler (fade tercih)
- ✅ Küçük köşe logosu (merkezde büyük logo DEĞİL)
- ✅ Kaynak belirt (güvenilirlik)

### Paylaşım Zamanları (UTC+3)

| Gün | Saat | Format |
|-----|------|--------|
| Salı | 19:00 | Reel |
| Perşembe | 19:00 | Reel |

### Hashtag Şablonu

```
#UzunYaşa #SağlıklıYaşam #KiloVerme #ObeziteTedavisi
#SağlıklıBeslenme #GLP1 #OralWegovy #İştahKesici
#SağlıkBilgisi #TürkiyeSağlık #BilinçliYaşam
#HealthyLiving #WeightManagement #EvidenceBased
#FDAApproved #WeightLoss
```

---

## 🔄 Hızlı Başlangıç — Yeni Reel Yapma Kontrol Listesi

```
□ 1. Konu belirle, hook yaz
□ 2. 8 slaydın metinlerini yaz (halkın dili!)
□ 3. render-reel-v2.js'deki SLIDES dizisini güncelle
□ 4. node render-reel-v2.js çalıştır → PNG'ler hazır
□ 5. generate-backgrounds.js'deki promptları güncelle
□ 6. node generate-backgrounds.js çalıştır → videolar hazır
□ 7. bash assemble-reel-v2.sh çalıştır → reel hazır!
□ 8. Kontrol karelerini çıkar, gözle doğrula
□ 9. Instagram'a yükle + caption + hashtag ekle
```

**Toplam süre:** ~15-20 dakika ⚡

---

*Bu rehber UzunYaşa reel üretim pipeline'ının tam dokümantasyonudur. Sorularınız için: @UzunYasaBot*
