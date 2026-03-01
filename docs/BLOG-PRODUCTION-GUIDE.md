# 📝 UzunYaşa Blog Yazımı Rehberi — A'dan Z'ye

**Amaç:** Bu rehber, sıfırdan profesyonel bir blog yazısı nasıl araştırılır, yazılır, HTML'e dönüştürülür ve yayınlanır, adım adım anlatır. Hiçbir ön bilgi gerektirmez.

**Son Güncelleme:** 21 Şubat 2026  
**Örnek Proje:** "GLP-1 İlaçları ve Beyin Sağlığı" blog yazısı

---

## 📋 İçindekiler

1. [Genel Bakış — Süreç Özeti](#1-genel-bakış)
2. [Adım 1: Araştırma Taraması](#2-adım-1-araştırma-taraması)
3. [Adım 2: Konu Seçimi ve Değerlendirme](#3-adım-2-konu-seçimi)
4. [Adım 3: Derin Araştırma](#4-adım-3-derin-araştırma)
5. [Adım 4: Blog Yazımı](#5-adım-4-blog-yazımı)
6. [Adım 5: HTML Sayfası Oluşturma](#6-adım-5-html-sayfası-oluşturma)
7. [Adım 6: Blog İndeks Güncelleme](#7-adım-6-blog-indeks-güncelleme)
8. [Adım 7: Sitemap Güncelleme](#8-adım-7-sitemap-güncelleme)
9. [Adım 8: Deploy (Yayınlama)](#9-adım-8-deploy)
10. [Adım 9: Reel Üretimi (Opsiyonel)](#10-adım-9-reel-üretimi)
11. [Otomatik Script ile Blog Yazımı (Yedek Yöntem)](#11-otomatik-script)
12. [Kaynak Listesi ve Güvenilirlik Tablo](#12-kaynak-listesi)
13. [SEO Kontrol Listesi](#13-seo-kontrol-listesi)
14. [Sorun Giderme](#14-sorun-giderme)

---

## 1. Genel Bakış

Blog üretimi 6 ana adımdan oluşur:

```
┌─────────────────────────────────────────────────────┐
│  1. ARAŞTIRMA      PubMed, FDA, STAT News taraması  │
│  2. KONU SEÇİMİ   Aciliyet + SEO + Türkiye bağlamı │
│  3. DERİN ARAŞTIRMA  Paper okuma, veri toplama      │
│  4. YAZIM          Türkçe, 1500+ kelime, kaynaklı   │
│  5. HTML           Tam SEO, görsel, paylaşım        │
│  6. DEPLOY         git push → GitHub Pages → canlı  │
└─────────────────────────────────────────────────────┘
```

**Sonuç:** SEO uyumlu, kaynaklı, profesyonel blog sayfası uzunyasa.com'da yayında.

**Süreç süresi:** ~30-60 dakika (araştırma derinliğine bağlı)

---

## 2. Adım 1: Araştırma Taraması

Her blog, güncel bir bilimsel kaynak veya haber ile başlar. Kaynaksız blog yazmıyoruz.

### Nerede Arıyoruz?

#### Tier 1 — Günlük Kontrol (En Önemli)

| Kaynak | URL | Ne Arıyoruz |
|--------|-----|-------------|
| **PubMed** | pubmed.ncbi.nlm.nih.gov | Yeni çalışmalar, meta-analizler |
| **FDA** | fda.gov/news-events | İlaç onayları, güvenlik uyarıları |
| **STAT News** | statnews.com | Pharma haberleri, klinik çalışma sonuçları |
| **ClinicalTrials.gov** | clinicaltrials.gov | Devam eden çalışmalar, Phase 3 sonuçları |

#### Tier 2 — Haftada 2-3 Kez

| Kaynak | URL | Ne Arıyoruz |
|--------|-----|-------------|
| **Nature Aging** | nature.com/nataging | Yaşlanma bilimi |
| **Cell Metabolism** | cell.com/cell-metabolism | Metabolizma araştırmaları |
| **Examine.com** | examine.com | Supplement analizleri |
| **AJMC** | ajmc.com | Managed care, ilaç erişimi |

#### Tier 3 — Aylık

| Kaynak | URL | Ne Arıyoruz |
|--------|-----|-------------|
| **WHO** | who.int | Global sağlık raporları |
| **Cochrane** | cochranelibrary.com | Sistematik derlemeler |
| **Sağlık Bakanlığı** | saglik.gov.tr | Türkiye sağlık verileri |

### Arama Terimleri (Search Queries)

PubMed ve Google Scholar'da şu terimleri kullanıyoruz:

**Günlük:**
```
GLP-1 semaglutide tirzepatide news 2026
Ozempic Wegovy Mounjaro study results
obesity drug FDA approval
weight loss medication clinical trial
retatrutide orforglipron news
bariatric endoscopy ESG study
```

**Haftalık:**
```
longevity research study
Mediterranean diet clinical trial
intermittent fasting research
metabolic health diabetes prevention
gut microbiome obesity
```

### Web Araması Nasıl Yapılırız?

```
Araç: web_search (Brave Search API)

Örnek:
web_search("FDA oral semaglutide obesity approval 2026", freshness="pw")
→ Son 1 haftanın haberlerini getirir

web_search("PubMed GLP-1 brain health meta-analysis", count=10)
→ 10 sonuç döner, başlık + URL + snippet
```

Sonra ilginç bir sonuç bulunca:
```
web_fetch("https://statnews.com/2026/02/17/oral-wegovy-fda-approval")
→ Sayfanın içeriğini markdown olarak çeker
```

### Tetikleyiciler — Ne Zaman Blog Yazmalıyız?

| Tetikleyici | Aciliyet | Örnek |
|-------------|----------|-------|
| **FDA onayı** | 🔴 ACİL | "FDA oral semaglutide'i onayladı" |
| **Phase 3 sonuçları** | 🔴 ACİL | "OASIS 4 çalışması sonuçları yayınlandı" |
| **NEJM/Lancet yayını** | 🔴 ACİL | "Lancet'te tirzepatide meta-analizi" |
| **Konferans sunumu** | 🟡 YÜKSEK | "ADA 2026'da yeni veriler" |
| **Kılavuz güncellemesi** | 🟡 YÜKSEK | "Avrupa obezite kılavuzu güncellendi" |
| **Phase 2 sonuçları** | 🟢 NORMAL | "Retatrutide Phase 2 verileri" |
| **Derleme makale** | 🟢 NORMAL | "Aralıklı oruç derlemesi" |

---

## 3. Adım 2: Konu Seçimi ve Değerlendirme

Bir araştırma/haber bulduktan sonra şu kriterlere bakıyoruz:

### Değerlendirme Matrisi

| Kriter | Soru | Puan (1-5) |
|--------|------|------------|
| **Güncellik** | Son 1-2 hafta içinde mi? | |
| **Etki** | Kaç kişiyi ilgilendiriyor? | |
| **Türkiye bağlamı** | Türk okuyucuyla ilgisi var mı? | |
| **SEO potansiyeli** | İnsanlar bunu arıyor mu? | |
| **Kaynak kalitesi** | RCT mi? Meta-analiz mi? Gözlemsel mi? | |
| **Rekabet** | Türkçe bu konuda iyi içerik var mı? | |

**Toplam 20+ puan → Blog yaz!**
**15-20 puan → Kısa haber/sosyal medya postu yeterli**
**15 altı → Şimdilik geç**

### Konu Havuzu (Hazır Listeden Seçim)

`auto-blog-generator.js` dosyasında 25 hazır konu var:

**Tedavi kategorisi:**
- GLP-1 ilaçları karşılaştırması (Ozempic vs Mounjaro)
- Tirzepatide: yeni nesil kilo ilacı
- GLP-1 yan etkileri ve güvenliği
- Endoskopik mide küçültme (ESG) rehberi
- Semaglutide ve kalp sağlığı (SELECT çalışması)

**Beslenme:**
- Akdeniz diyeti ve uzun yaşam
- Aralıklı oruç: 16:8 vs 5:2
- Ultra-işlenmiş gıdalar ve obezite
- Gut mikrobiyomu ve kilo yönetimi

**Bilim:**
- Biyolojik yaş ve epigenetik saat
- Metformin ve yaşlanma

**Yaşam tarzı:**
- Uyku eksikliği ve kilo alma
- Stres ve kortizol
- Duygusal yeme

---

## 4. Adım 3: Derin Araştırma

Konu seçildikten sonra, blog yazımı için derin araştırma yapıyoruz.

### Ne Topluyoruz?

```
1. ANA KAYNAK
   → Orijinal çalışma/makale (PubMed, NEJM, Lancet)
   → DOI numarası, yazarlar, yayın tarihi
   → Çalışma tipi (RCT, meta-analiz, gözlemsel, in vitro)

2. ANAHTAR VERİLER
   → İstatistikler (%67 risk azalması, p<0.001)
   → Hasta sayısı (n=12,000)
   → Çalışma süresi (68 hafta)
   → Yan etki oranları

3. BAĞLAM
   → Bu neden önemli? Daha önce ne biliniyordu?
   → Türkiye'de kaç kişiyi etkiler?
   → Mevcut tedavilerle karşılaştırma

4. DESTEKLEYICI KAYNAKLAR
   → 2-3 ek çalışma/haber
   → Uzman yorumları
   → Türkiye istatistikleri (TÜİK, Sağlık Bakanlığı)

5. GÖRSELLER
   → Unsplash'tan konuyla ilgili görsel URL'si
   → Kategori: beslenme, egzersiz, tedavi, bilim, yaşam-tarzı
```

### Web Fetch ile Kaynak Okuma

```
# PubMed makalesini oku
web_fetch("https://pubmed.ncbi.nlm.nih.gov/12345678/")
→ Başlık, özet, sonuçlar

# Haber makalesini oku
web_fetch("https://statnews.com/2026/02/17/...", maxChars=5000)
→ Tam metin, 5000 karakter limit

# FDA onay sayfasını oku
web_fetch("https://fda.gov/news-events/press-announcements/...")
→ Resmi onay detayları
```

### Araştırma Notu Şablonu

Her blog için önce şu notu dolduruyoruz:

```
KONU: [Başlık]
ANA KAYNAK: [URL + DOI]
ÇALIŞMA TİPİ: [RCT / Meta-analiz / Gözlemsel / Derleme]
YAYINLANAN: [Dergi adı, tarih]
ANAHTAR BULGULAR:
  - [Bulgu 1 + istatistik]
  - [Bulgu 2 + istatistik]
  - [Bulgu 3 + istatistik]
TÜRKİYE BAĞLAMI: [Neden Türk okuyucu için önemli?]
DESTEKLEYICI:
  - [Kaynak 2 URL]
  - [Kaynak 3 URL]
GÖRSEL KATEGORİ: [beslenme/egzersiz/tedavi/bilim/yasam-tarzi]
```

---

## 5. Adım 4: Blog Yazımı

### Yazım Kuralları

| Kural | Açıklama |
|-------|----------|
| **Dil** | Türkçe, halkın anlayacağı ama akademik doğruluktan ödün vermeyen |
| **Uzunluk** | 1500-2500 kelime |
| **Yapı** | H1 başlık + H2 alt başlıklar + H3 detaylar |
| **Kaynaklar** | En az 5 farklı kaynak; tercihen 8-12. Tek kaynağa dayanan blog **YASAK** |
| **Kaynak formatı** | "Yazarlar et al. Başlık. Dergi. Yıl;cilt:sayfa." + DOI/PubMed linki |
| **Kanıt düzeyi** | Her iddiada 🟢/🟡/🔴 etiketi + çalışma tipi + örneklem (örn: "RCT, n=1.961") |
| **Ton** | Akademik ama erişilebilir — "akıllı bir hastaya anlatan uzman doktor" |
| **Tıbbi tavsiye** | VERME! "Doktorunuza danışın" de |
| **Clickbait** | YOK! Sansasyonel başlık yok |
| **Hype dil** | YASAK: "çığır açan", "devrim yaratan", "mucize", "şok eden" |
| **Hayvan çalışması** | Mutlaka "insana doğrudan genellenemez" uyarısı ekle |
| **Preprint** | "⚠️ Preprint — henüz hakemli değerlendirmeden geçmemiştir" uyarısı ekle |
| **Fabrike veri** | Kaynak gösterilmeyen istatistik/yüzde YAZMA |
| **Landmark çalışmalar** | Konuyla ilgili büyük çalışmaları atlamak YASAK (SELECT, STEP, CREDENCE vb.) |
| **Türkiye verileri** | Obezite: ~%32 (OECD 2024). Tutarlı kullan — bloglar arası farklı rakam YASAK |

### Akademik Kalite Kontrol Listesi (Yayın Öncesi)

Yayınlamadan önce şunları kontrol et:
- [ ] En az 5 farklı kaynak var mı?
- [ ] Her iddiada kanıt seviyesi etiketi (🟢/🟡/🔴) var mı?
- [ ] Hype ifadeler temizlendi mi?
- [ ] Hayvan çalışmaları uyarılı mı?
- [ ] Preprint'ler etiketli mi?
- [ ] Kaynaksız istatistik var mı?
- [ ] HTML'de bozuk nesting (<p><h2>, <p><ul>) var mı?
- [ ] Türkiye obezite oranı tutarlı mı (~%32)?

### Yazı Yapısı Şablonu

```
1. BAŞLIK (H1)
   → Max 60 karakter
   → SEO uyumlu (anahtar kelimeyi içermeli)
   → Örnek: "GLP-1 İlaçları ve Beyin Sağlığı: Alzheimer'a Karşı Yeni Umut mu?"

2. META AÇIKLAMA
   → Max 155 karakter
   → Merak uyandırıcı ama gerçekçi
   → Örnek: "Yeni araştırmalar GLP-1 ilaçlarının beyin sağlığını koruyabileceğini gösteriyor. Bilimsel kanıtları inceliyoruz."

3. GİRİŞ PARAGRAFI (150-200 kelime)
   → Hook: dikkat çeken bir istatistik veya soru
   → Bağlam: neden bu konu önemli?
   → Vaat: bu yazıda ne öğreneceksiniz?
   → Örnek: "Türkiye'de 600.000'den fazla kişi Alzheimer hastalığıyla yaşıyor..."

4. ANA İÇERİK (800-1200 kelime)
   → 3-5 ana bölüm (H2 başlıklar)
   → Her bölümde:
     - Bilgiyi açıkla
     - İstatistik/veri ver
     - Kaynağı göster
     - Pratik bilgi ekle

   Örnek H2 başlıklar:
   ## GLP-1 İlaçları Nedir?
   ## Beyin Sağlığı Üzerindeki Etkiler
   ## Araştırma Sonuçları Ne Diyor?
   ## Türkiye'de Durum
   ## Pratik Bilgiler

5. ÖNEMLİ NOKTALAR KUTUSU
   → 3-5 maddelik özet
   → "📌 Önemli Noktalar" başlığı
   → Okuyucu tüm yazıyı okumasa bile bunları görsün

6. DISCLAIMER (Zorunlu!)
   → "⚠️ Bu içerik bilgilendirme amaçlıdır, tıbbi tavsiye değildir.
      Tedaviye başlamadan önce mutlaka doktorunuza danışın."

7. KAYNAKLAR
   → Numaralı liste
   → Tıklanabilir linkler
   → Kaynak adı + URL

8. PAYLAŞIM BÖLÜMÜ
   → Twitter, LinkedIn, WhatsApp paylaşım butonları
   → "Bu yazıyı paylaşın"

9. CTA (Call to Action)
   → "Kişisel sağlık değerlendirmenizi yapın"
   → test.html'e yönlendirme
```

### Dil Kuralları — Halkın Anlayacağı Dil

| ❌ Yazma | ✅ Yaz |
|----------|--------|
| Randomize kontrollü çalışma | Bilimsel araştırma |
| Meta-analiz | Birçok çalışmanın toplu değerlendirmesi |
| Nörodejenrasyon | Beyin hücrelerinin zarar görmesi |
| GLP-1 reseptör agonisti | İştah kesici ilaç / kilo ilacı |
| Subkutan enjeksiyon | Cilt altı iğne |
| Plasebo kontrollü | İlaç ile sahte ilaç karşılaştırmalı |
| İstatistiksel anlamlılık (p<0.001) | Bilimsel olarak kesin sonuç |
| Hazard ratio 0.33 | Risk %67 azaldı |

### Kanıt Seviyesi Belirtme

Her iddia için kanıt seviyesini belirtiyoruz:

```
🟢 Güçlü kanıt: "Büyük klinik çalışmalar gösteriyor ki..."
   → RCT, meta-analiz, 1000+ hasta

🟡 Orta kanıt: "Araştırmalar umut verici sonuçlar gösteriyor..."
   → Phase 2 çalışma, gözlemsel çalışma, 100-1000 hasta

🔴 Erken kanıt: "İlk veriler ilginç ama daha fazla araştırma gerekli..."
   → Hayvan deneyi, in vitro, vaka serileri, <100 hasta
```

---

## 6. Adım 5: HTML Sayfası Oluşturma

Blog yazıldıktan sonra HTML sayfası oluşturuyoruz.

### Dosya Adlandırma (Slug Oluşturma)

```
Başlık: "GLP-1 İlaçları ve Beyin Sağlığı: Alzheimer ve Parkinson'a Karşı Yeni Umut mu?"

Slug kuralları:
1. Küçük harfe çevir
2. Türkçe karakterleri değiştir: ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c
3. Özel karakterleri kaldır
4. Boşlukları tire (-) yap
5. Max 60 karakter

Sonuç: glp1-beyin-sagligi-alzheimer-parkinson
Dosya: pages/blog/glp1-beyin-sagligi-alzheimer-parkinson.html
```

### HTML Şablon Yapısı

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <!-- ZORUNLU SEO TAGLARI -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[BAŞLIK] | UzunYaşa Blog</title>
    <meta name="description" content="[META AÇIKLAMA - max 155 karakter]">

    <!-- ZORUNLU OG (Open Graph) TAGLARI — Sosyal medya paylaşımı için -->
    <meta property="og:title" content="[BAŞLIK]">
    <meta property="og:description" content="[META AÇIKLAMA]">
    <meta property="og:image" content="[GÖRSEL URL]">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="[YYYY-MM-DD]">

    <!-- ZORUNLU: Canonical URL (duplike içerik önleme) -->
    <link rel="canonical" href="https://uzunyasa.com/pages/blog/[SLUG].html">

    <!-- Font ve Stil -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* ... tam CSS burada (auto-blog-generator.js'den kopyala) ... */
    </style>
</head>
<body>
    <!-- HEADER -->
    <header class="header">
        <div class="header-inner">
            <a href="../../index.html">
                <img src="../../images/logo.svg" alt="UzunYaşa" class="logo-img">
            </a>
            <a href="../blog.html" class="back-link">← Blog'a Dön</a>
        </div>
    </header>

    <!-- MAKALE -->
    <article>
        <!-- Kategori etiketi -->
        <span class="post-category">[EMOJİ] [KATEGORİ ADI]</span>

        <!-- Başlık -->
        <h1>[BAŞLIK]</h1>

        <!-- Meta bilgiler -->
        <div class="post-meta">
            <span>📅 [GÜN AY YIL]</span>
            <span>⏱️ [X] dk okuma</span>
        </div>

        <!-- Öne çıkan görsel -->
        <div class="featured-image">
            <img src="[UNSPLASH URL]" alt="[BAŞLIK]">
        </div>

        <!-- İçerik -->
        <div class="post-content">
            [HTML İÇERİK - <h2>, <h3>, <p>, <ul>, <blockquote>]
        </div>

        <!-- Önemli noktalar kutusu -->
        <div class="key-points">
            <h4>📌 Önemli Noktalar</h4>
            <ul>
                <li>[Nokta 1]</li>
                <li>[Nokta 2]</li>
                <li>[Nokta 3]</li>
            </ul>
        </div>

        <!-- Disclaimer (ZORUNLU!) -->
        <div class="disclaimer">
            ⚠️ <strong>Önemli:</strong> Bu içerik sadece bilgilendirme amaçlıdır
            ve tıbbi tavsiye yerine geçmez. Herhangi bir tedaviye başlamadan
            önce mutlaka doktorunuza danışın.
        </div>

        <!-- Kaynaklar -->
        <div class="sources">
            <h4>📚 Kaynaklar</h4>
            <ul>
                <li><a href="[URL]" target="_blank">[Kaynak adı]</a></li>
            </ul>
        </div>

        <!-- Paylaşım -->
        <div class="share-section">
            <p><strong>Bu yazıyı paylaşın</strong></p>
            <div class="share-buttons">
                <a href="https://twitter.com/intent/tweet?text=..." class="share-btn twitter">Twitter</a>
                <a href="https://wa.me/?text=..." class="share-btn whatsapp">WhatsApp</a>
            </div>
        </div>

        <!-- CTA -->
        <div class="cta-section">
            <h3>Kişisel sağlık değerlendirmenizi yapın</h3>
            <p>2 dakikada size özel sağlık önerileri alın</p>
            <a href="../test.html" class="cta-btn">Teste Başla →</a>
        </div>
    </article>

    <footer><p>© 2026 UzunYaşa. Tüm hakları saklıdır.</p></footer>
</body>
</html>
```

### Görsel Seçimi

Unsplash'tan kategoriye göre hazır görseller:

| Kategori | Unsplash URL |
|----------|-------------|
| Beslenme | `photo-1498837167922-ddd27525d352?w=1200&h=600&fit=crop` |
| Egzersiz | `photo-1517836357463-d25dfeac3438?w=1200&h=600&fit=crop` |
| Kilo Yönetimi | `photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop` |
| Bilim | `photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop` |
| Tedavi | `photo-1587854692152-cbe660dbde88?w=1200&h=600&fit=crop` |
| Yaşam Tarzı | `photo-1541781774459-bb2af2f05b55?w=1200&h=600&fit=crop` |
| GLP-1 | `photo-1585435557343-3b092031a831?w=1200&h=600&fit=crop` |
| Longevity | `photo-1447452001602-7090c7ab2db3?w=1200&h=600&fit=crop` |

Tam URL: `https://images.unsplash.com/[PHOTO_ID]?w=1200&h=600&fit=crop`

### Kategori Renkleri ve Emojileri

| Kategori | Slug | Emoji | Renk |
|----------|------|-------|------|
| Beslenme | beslenme | 🥗 | #10B981 |
| Egzersiz | egzersiz | 🏃 | #3B82F6 |
| Kilo Yönetimi | kilo-yonetimi | ⚖️ | #F59E0B |
| Bilimsel Araştırmalar | bilim | 🧬 | #8B5CF6 |
| Tedavi | tedavi | 💊 | #EC4899 |
| Yaşam Tarzı | yasam-tarzi | 😴 | #06B6D4 |

---

## 7. Adım 6: Blog İndeks Güncelleme

Her yeni blog yazısı `data/blog-posts.json` dosyasına eklenmeli.

### Dosya Yapısı

```json
[
  {
    "slug": "glp1-beyin-sagligi-alzheimer-parkinson",
    "title": "GLP-1 İlaçları ve Beyin Sağlığı: Alzheimer ve Parkinson'a Karşı Yeni Umut mu?",
    "description": "Yeni araştırmalar GLP-1 ilaçlarının beyin sağlığını koruyabileceğini gösteriyor.",
    "category": "bilim",
    "categoryName": "Bilimsel Araştırmalar",
    "categoryIcon": "🧬",
    "categoryColor": "#8B5CF6",
    "date": "2026-02-18",
    "readTime": 8,
    "tags": ["GLP-1", "Alzheimer", "beyin sağlığı", "nörodejenerasyon"],
    "priority": "urgent"
  },
  ... (diğer yazılar)
]
```

### Nasıl Güncellenir?

```bash
# 1. Mevcut dosyayı oku
cat data/blog-posts.json

# 2. Yeni yazıyı DİZİNİN BAŞINA ekle (en yeni en üstte)
# JSON editörü veya script ile

# 3. Kontrol: JSON geçerli mi?
node -e "JSON.parse(require('fs').readFileSync('data/blog-posts.json'))"
# Hata vermezse OK
```

### Blog Sayfası (pages/blog.html)

`blog.html` dosyası `blog-posts.json`'u JavaScript ile okur ve kartları otomatik oluşturur. JSON güncellenince blog sayfası da güncellenir.

Eğer blog.html statik ise, `scripts/update-blog-index.js` çalıştırarak güncelle:

```bash
node scripts/update-blog-index.js
```

---

## 8. Adım 7: Sitemap Güncelleme

Google'ın yeni yazıyı bulması için sitemap'e ekle.

### Dosya: sitemap.xml

```xml
<!-- Yeni blog yazısı ekle -->
<url>
    <loc>https://uzunyasa.com/pages/blog/glp1-beyin-sagligi-alzheimer-parkinson.html</loc>
    <lastmod>2026-02-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
</url>
```

### Nereye Eklenir?

Diğer blog URL'lerinin yanına, `</urlset>` kapanış tagından ÖNCE.

---

## 9. Adım 8: Deploy (Yayınlama)

### Git Komutları

```bash
cd website/

# 1. Değişiklikleri kontrol et
git status
# Şunları görmelisin:
#   new file: pages/blog/[SLUG].html
#   modified: data/blog-posts.json
#   modified: sitemap.xml

# 2. Hepsini staging'e ekle
git add pages/blog/[SLUG].html data/blog-posts.json sitemap.xml

# 3. Commit mesajı yaz
git commit -m "Blog: [BAŞLIK KISACA]

- [SLUG].html eklendi
- blog-posts.json güncellendi
- sitemap.xml güncellendi"

# 4. Push et → GitHub Pages otomatik yayınlar
git push origin main
```

### Deploy Sonrası Kontrol

```bash
# 1-2 dakika bekle, sonra kontrol et:

# Sayfa açılıyor mu?
web_fetch("https://uzunyasa.com/pages/blog/[SLUG].html")

# Blog listesinde görünüyor mu?
web_fetch("https://uzunyasa.com/pages/blog.html")

# Sitemap'te var mı?
web_fetch("https://uzunyasa.com/sitemap.xml")
```

---

## 10. Adım 9: Reel Üretimi (Opsiyonel)

Blog yayınlandıktan sonra, aynı içerikten bir reel üretilebilir.

### Blog → Reel Dönüşüm Formülü

```
Blog başlığı → Hook
Blog'un 5 ana bulgusu → 5 Bilgi slaydı
Blog'un sonucu → Özet
"Kaydet & Paylaş" → CTA
```

### Örnek

```
Blog: "GLP-1 İlaçları ve Beyin Sağlığı"

→ Hook: "ALZHEİMER RİSKİ %67 DÜŞTÜ!"
→ Bilgi 1: "GLP-1 ilaçları sadece kilo verdirmiyor"
→ Bilgi 2: "Alzheimer riski %67 azaldı"
→ Bilgi 3: "Parkinson riski %50 düştü"
→ Bilgi 4: "12.000 hastada test edildi"
→ Bilgi 5: "Beyin hücrelerini koruyor"
→ Özet: "GLP-1 ilaçları beyin için de umut"
→ CTA: "Kaydet & Paylaş"
```

Detaylı reel üretim süreci için: `docs/REEL-PRODUCTION-GUIDE.md`

---

## 11. Otomatik Script ile Blog Yazımı (Yedek Yöntem)

Eğer manuel yazım yerine otomatik üretim istenirse:

### Script: auto-blog-generator.js

```bash
# Ortam değişkeni ayarla
export ANTHROPIC_API_KEY="sk-ant-..."

# Belirli bir konuda blog üret
node scripts/auto-blog-generator.js --topic "GLP-1 ilaçlarının yan etkileri"

# Veya hazır havuzdan rastgele seç
node scripts/auto-blog-generator.js
```

### Script Ne Yapıyor?

1. Konu havuzundan seç (veya --topic ile belirt)
2. Claude API'ye gönder (Türkçe blog yazma promptu)
3. JSON yanıt al (başlık, açıklama, içerik, kaynaklar)
4. HTML sayfası oluştur (tam CSS + SEO tagları)
5. `pages/blog/[SLUG].html` olarak kaydet
6. `data/blog-posts.json` güncelle

### ⚠️ Script vs Manuel Karşılaştırma

| Özellik | Manuel (ben yazıyorum) | Script |
|---------|----------------------|--------|
| **Kalite** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Güncellik** | Anlık araştırma | Konu havuzundan |
| **Kaynaklar** | Gerçek, doğrulanmış | Genel, yüzeysel |
| **Türkiye bağlamı** | Var | Sınırlı |
| **SEO** | Optimize | Temel |
| **Süre** | 30-60 dk | 2-3 dk |
| **İnsan kontrolü** | Gerekli değil | Gözden geçirme gerekli |

**Önerimiz:** Manuel yazımı tercih et, scripti sadece yedek olarak kullan.

---

## 12. Kaynak Listesi ve Güvenilirlik Tablosu

### Güvenilir Kaynaklar (İçerik çıkarılabilir)

| Kaynak | Alan | Güvenilirlik |
|--------|------|-------------|
| NEJM | nejm.org | ⭐⭐⭐⭐⭐ |
| The Lancet | thelancet.com | ⭐⭐⭐⭐⭐ |
| JAMA Network | jamanetwork.com | ⭐⭐⭐⭐⭐ |
| Nature | nature.com | ⭐⭐⭐⭐⭐ |
| FDA | fda.gov | ⭐⭐⭐⭐⭐ |
| WHO | who.int | ⭐⭐⭐⭐⭐ |
| PubMed | pubmed.ncbi.nlm.nih.gov | ⭐⭐⭐⭐⭐ |
| Mayo Clinic | mayoclinic.org | ⭐⭐⭐⭐ |
| Cleveland Clinic | clevelandclinic.org | ⭐⭐⭐⭐ |
| Harvard Health | health.harvard.edu | ⭐⭐⭐⭐ |
| STAT News | statnews.com | ⭐⭐⭐⭐ |
| Examine.com | examine.com | ⭐⭐⭐⭐ |
| Reuters Health | reuters.com | ⭐⭐⭐ |
| Medical News Today | medicalnewstoday.com | ⭐⭐⭐ |

### ❌ Kullanılmayacak Kaynaklar

- Ünlü/influencer web siteleri
- Supplement şirketlerinin siteleri
- "Mucize" vaatli siteler
- Reklam destekli "araştırma" siteleri
- Wikipedia (kaynak olarak değil, arka plan bilgi olarak OK)

---

## 13. SEO Kontrol Listesi

Her blog yazısı yayınlanmadan önce:

```
□ Başlık 60 karakterden kısa mı?
□ Başlıkta ana anahtar kelime var mı?
□ Meta description 155 karakterden kısa mı?
□ Meta description'da anahtar kelime var mı?
□ OG title ve description dolu mu?
□ OG image URL çalışıyor mu?
□ Canonical URL doğru mu?
□ H1 başlık sadece 1 tane mi?
□ H2 başlıklar mantıklı yapıda mı?
□ İç linkler var mı? (diğer blog yazılarına)
□ Dış linkler var mı? (kaynaklara)
□ Alt text'li görsel var mı?
□ Mobilde düzgün görünüyor mu?
□ Yükleme hızı kabul edilebilir mi?
□ blog-posts.json'a eklendi mi?
□ sitemap.xml'e eklendi mi?
□ Disclaimer (sorumluluk reddi) var mı?
```

---

## 14. Sorun Giderme

### Blog sayfası 404 veriyor
**Sebep:** Dosya adı slug ile uyuşmuyor veya push yapılmamış.
**Çözüm:** `git status` ile kontrol et, dosya adını doğrula, `git push` yap.

### Blog listesinde görünmüyor
**Sebep:** `data/blog-posts.json` güncellenmemiş.
**Çözüm:** JSON'a yeni yazıyı ekle, push yap.

### Görsel yüklenmiyor
**Sebep:** Unsplash URL'si hatalı veya değişmiş.
**Çözüm:** URL'yi tarayıcıda test et, çalışan bir Unsplash URL'si bul.

### Türkçe karakterler bozuk görünüyor
**Sebep:** `<meta charset="UTF-8">` eksik.
**Çözüm:** HTML head'e charset ekle.

### Google indekslemiyor
**Sebep:** sitemap.xml güncellenmemiş veya robots.txt engelliyor.
**Çözüm:** sitemap.xml'i kontrol et, Google Search Console'dan yeniden indeksleme iste.

### Script hata veriyor (auto-blog-generator.js)
**Sebep:** ANTHROPIC_API_KEY ayarlanmamış veya API kotası dolmuş.
**Çözüm:** `export ANTHROPIC_API_KEY="..."` komutunu çalıştır, API hesabını kontrol et.

---

## 15. Instagram Caption Oluşturma (Zorunlu)

Her blog yazısı ile birlikte bir Instagram caption da üretilir. Blog'un altına `<!-- INSTAGRAM CAPTION -->` bloğu olarak eklenir ve ayrıca Cem'e gönderilir.

### Caption Formatı

```
[HOOK — 1 cümle, dikkat çekici soru veya şaşırtıcı veri]

[3-5 bullet point — blog'un öne çıkan bilgileri]
• Veri 1
• Veri 2
• Veri 3
• Negatif kanıt/uyarı (varsa)

[TAKEAWAY — 1 cümle, pratik sonuç]

🔗 Detaylı bilgi ve kaynaklar → Bio'daki linke tıklayın

#UzunYaşa #SağlıklıYaşam #BilimselKanıt #[KonuHashtag] #[KonuHashtag2]
```

### Caption Kuralları

1. **İlk satır = Hook** — İnsanlar caption'ı "daha fazla" tıklamadan sadece ilk satırı görür. Bu satır dikkat çekmeli.
2. **Türkçe** — Tüm caption Türkçe
3. **Emoji kullan** — Ama abartma, max 5-6 emoji
4. **Hashtag sayısı** — 8-15 arası (çok az = keşfedilemez, çok fazla = spam)
5. **Hype yasak** — Blog kuralları caption'da da geçerli. "Mucize", "kesin çözüm" gibi ifadeler YOK.
6. **Negatif kanıt dahil** — "Ama dikkat: ..." gibi dürüst bir uyarı olmalı
7. **CTA** — Her caption "Bio'daki link" veya "Kaydet 🔖" ile bitmeli
8. **Karakter limiti** — Instagram max 2200 karakter, ideal 300-500

### Standart Hashtag Setleri (konuya göre seç)

**Genel (her zaman ekle):**
```
#UzunYaşa #SağlıklıYaşam #BilimselKanıt #KanıtaDayalı #Sağlık
```

**GLP-1 / Kilo:**
```
#KiloVerme #Obezite #GLP1 #Semaglutid #Ozempic #DiabetTedavisi
```

**Beslenme:**
```
#Beslenme #SağlıklıBeslenme #Diyet #Protein #AkdenizDiyeti
```

**Egzersiz:**
```
#Egzersiz #Fitness #KasKütlesi #DirençEgzersizi #Antrenman
```

**Supplement:**
```
#Takviye #Supplement #VitaminD #Omega3 #Kreatin
```

**Kalp / Tansiyon:**
```
#KalpSağlığı #Hipertansiyon #Tansiyon #Kardiyovasküler
```

**Ramazan:**
```
#Ramazan #Oruç #Sahur #İftar #RamazandaSağlık
```

**Karaciğer / GI:**
```
#KaraciğerSağlığı #MASLD #Hepatoloji #Gastroenteroloji
```

### Örnek Caption

```
Türkiye'de her 3 kişiden 1'inin tansiyonu yüksek — ve çoğu bilmiyor 😱

• 🧂 Günlük tuz tüketimimiz 18g — WHO önerisi sadece 5g
• 🏃 Haftada 150 dk egzersiz tansiyonu -7 mmHg düşürüyor
• 🥗 DASH diyeti 30 çalışmada etkili bulundu
• ⚠️ Ama yaşam tarzı tek başına çoğu hastada yeterli değil — ilaç tedavisi küçümsenmemeli

Küçük adımlar büyük fark yapar: tuzu azalt, hareket et, düzenli ölç 💪

🔗 Detaylı bilgi ve tüm kaynaklar → Bio'daki linke tıklayın

#UzunYaşa #SağlıklıYaşam #BilimselKanıt #Hipertansiyon #Tansiyon #KalpSağlığı #Tuz #DASH #Egzersiz #SağlıklıBeslenme #TansiyonKontrolü
```

---

## 🔄 Hızlı Başlangıç — Yeni Blog 11 Adımda

```
□ 1.  Araştırma tara (PubMed, FDA, STAT News)
□ 2.  Konu seç (aciliyet + SEO + Türkiye bağlamı)
□ 3.  Derin araştırma yap (paper oku, veri topla)
□ 4.  Blog yaz (1500+ kelime, Türkçe, kaynaklı)
□ 5.  HTML sayfası oluştur (tam SEO tagları)
□ 6.  Instagram caption yaz (hook + bullets + CTA + hashtags)
□ 7.  blog-posts.json güncelle
□ 8.  sitemap.xml güncelle
□ 9.  git add + commit + push
□ 10. Canlıda kontrol et (URL, liste, sitemap)
□ 11. Caption + reel Cem'e gönder → Instagram'a yükle
```

**Toplam süre:** ~30-60 dakika ⚡

---

*Bu rehber UzunYaşa blog üretim pipeline'ının tam dokümantasyonudur. Sorularınız için: @UzunYasaBot*
