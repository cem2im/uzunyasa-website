# 🌿 UzunYaşa

**Türkiye'nin bağımsız, kanıta dayalı sağlıklı yaşam platformu.**

[![Website](https://img.shields.io/badge/Website-uzunyasa.com-195157?style=flat-square)](https://uzunyasa.com)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square)]()

---

## 📋 Proje Hakkında

UzunYaşa, [Tıpta Yapay Zeka Derneği](https://tyzd.org) tarafından desteklenen, kâr amacı gütmeyen bir sağlık bilgi platformudur. Obezite, beslenme, egzersiz ve kilo yönetimi konularında bilimsel kanıtlara dayalı, bağımsız ve anlaşılır içerikler sunar.

### Misyon
- 🔬 **Bilimsel doğruluk**: Tüm içerikler hakemli dergilere dayanır
- 🛡️ **Bağımsızlık**: Hiçbir sponsorluk veya ticari bağ yok
- 🌍 **Erişilebilirlik**: Herkes için ücretsiz, Türkçe içerik

---

## 🏗️ Proje Yapısı

```
uzunyasa-website/
├── index.html              # Ana sayfa
├── images/                 # Görseller ve logolar
│   ├── logo.svg
│   ├── logo-white.svg
│   └── icon.png
├── videos/                 # Video dosyaları
│   ├── hero.mp4
│   └── background-*.mp4
├── pages/
│   ├── blog.html           # Blog ana sayfası
│   ├── blog/               # Blog yazıları (19 makale)
│   │   ├── glp1-tam-rehber.html
│   │   ├── esg-endoskopik-sleeve-rehber.html
│   │   └── ...
│   ├── rehberler.html      # Rehberler ana sayfası
│   ├── rehberler/          # Pratik rehberler (9 rehber)
│   │   ├── aralikli-oruc.html
│   │   ├── kalori-acigi.html
│   │   └── ...
│   ├── tedavi.html         # Tedavi seçenekleri
│   ├── tedavi/             # Tedavi alt sayfaları
│   │   ├── gastrik-sleeve.html
│   │   ├── gastrik-bypass.html
│   │   └── endoskopik-prosedurler.html
│   ├── beslenme.html       # Beslenme bölümü
│   ├── egzersiz.html       # Egzersiz bölümü
│   ├── uyku-stres.html     # Uyku ve stres
│   ├── araclar.html        # BMI, kalori hesaplayıcılar
│   ├── test.html           # Tedavi uygunluk testi
│   ├── hikayeler.html      # Başarı hikayeleri
│   ├── hakkimizda.html     # Hakkımızda
│   ├── bilim.html          # Bilimsel kaynaklar
│   └── ecem-app.html       # Ecem AI diyetisyen (PWA)
└── manifest.json           # PWA manifest
```

---

## 📚 İçerik Kategorileri

### Blog Yazıları (19)
| Kategori | Yazı Sayısı |
|----------|-------------|
| GLP-1 İlaçları | 4 |
| Cerrahi/Prosedürler | 5 |
| Karşılaştırmalar | 4 |
| Beslenme | 3 |
| Egzersiz | 2 |
| Yaşam Tarzı | 1 |

### Rehberler (9)
- Aralıklı Oruç
- Kalori Açığı
- Akdeniz Diyeti
- Evde Egzersiz
- 50 Yaş Üstü Egzersiz
- Uyku Kalitesi
- Plato Kırma
- Tip 2 Diyabet
- Kalp Sağlığı

### Araçlar
- BMI Hesaplayıcı
- Kalori İhtiyacı Hesaplayıcı
- Bel/Boy Oranı
- Tedavi Uygunluk Testi

---

## 🛠️ Teknolojiler

- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Hosting**: GitHub Pages
- **Fonts**: Inter, Playfair Display (Google Fonts)
- **Görseller**: Unsplash (ücretsiz stok fotoğraflar)
- **Video**: MP4 format, optimize edilmiş

---

## 🚀 Deployment

Site GitHub Pages üzerinde otomatik deploy edilir:

```bash
# Değişiklikleri push et
git add .
git commit -m "Update content"
git push origin main

# GitHub Pages otomatik olarak deploy eder (~1-2 dk)
```

**Canlı site**: https://uzunyasa.com (veya https://cem2im.github.io/uzunyasa-website)

---

## 📝 İçerik Ekleme

### Yeni Blog Yazısı
1. `pages/blog/` klasörüne yeni HTML dosyası oluştur
2. Mevcut bir yazıyı template olarak kullan
3. `pages/blog.html` dosyasına kart ekle
4. `index.html` blog bölümünü güncelle (opsiyonel)

### Yeni Rehber
1. `pages/rehberler/` klasörüne HTML dosyası ekle
2. `pages/rehberler.html` listesine ekle

---

## ⚠️ Önemli Notlar

- **Tıbbi Uyarı**: Bu site tıbbi tavsiye sağlamaz. Tüm kararlar için bir sağlık uzmanına danışılmalıdır.
- **Telif Hakkı**: © 2026 UzunYaşa. Tüm hakları saklıdır.
- **Görsel Kaynaklar**: Unsplash ücretsiz lisansı altında kullanılmaktadır.

---

## 👥 Katkıda Bulunanlar

- **Tıpta Yapay Zeka Derneği** - [tyzd.org](https://tyzd.org)
- **İçerik**: Gastroenteroloji ve Endokrinoloji Uzmanları Danışma Kurulu

---

## 📞 İletişim

- **Web**: [uzunyasa.com](https://uzunyasa.com)
- **Dernek**: [tyzd.org](https://tyzd.org)
- **E-posta**: Hakkımızda sayfasındaki iletişim formu

---

*Son güncelleme: 7 Şubat 2026*
