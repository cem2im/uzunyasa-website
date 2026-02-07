# Ecem Yönlendirme Kuralları (Routing Rules)

## Genel Yapı

```
Patient Assessment → Rule Engine → Personalized Recommendations
```

---

## 1. BMI Bazlı Yönlendirmeler

### BMI < 18.5 (Zayıf)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Beslenme Uzmanına Danış | /doktor-bul |
| MEDIUM | Sağlıklı Kilo Alma Rehberi | /rehberler/kilo-alma |
| LOW | Kalori Hesaplayıcı | /araclar#calorie |

### BMI 18.5-24.9 (Normal)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| MEDIUM | Kilo Koruma Rehberi | /rehberler/kilo-koruma |
| LOW | Genel Sağlık İpuçları | /beslenme |

### BMI 25-29.9 (Fazla Kilolu)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Kilo Verme Başlangıç Rehberi | /rehberler/kilo-verme |
| HIGH | Kalori Hesaplayıcı | /araclar#calorie |
| MEDIUM | Akdeniz Diyeti Rehberi | /rehberler/akdeniz-diyeti |
| MEDIUM | Egzersiz Başlangıç | /egzersiz |

### BMI 30-34.9 (Obez Sınıf 1)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Obezite Tedavi Seçenekleri | /tedavi |
| HIGH | GLP-1 İlaçları Bilgi | /tedavi#glp1 |
| HIGH | Kalori Hesaplayıcı | /araclar#calorie |
| MEDIUM | Endoskopik Tedaviler | /tedavi#endoskopik |
| MEDIUM | Davranış Değişikliği | /rehberler/davranis |

### BMI 35-39.9 (Obez Sınıf 2)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Uzman Doktora Yönlendir | /doktor-bul |
| HIGH | Bariatrik Cerrahi Bilgi | /tedavi#cerrahi |
| HIGH | GLP-1 İlaçları | /tedavi#glp1 |
| MEDIUM | Endoskopik Tedaviler | /tedavi#endoskopik |

### BMI ≥ 40 (Obez Sınıf 3 - Morbid)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| URGENT | Acil Uzman Konsültasyonu | /doktor-bul |
| HIGH | Bariatrik Cerrahi | /tedavi#cerrahi |
| HIGH | Multidisipliner Yaklaşım | /tedavi |
| MEDIUM | GLP-1 İlaçları | /tedavi#glp1 |

---

## 2. Mevcut Hastalık Bazlı Yönlendirmeler

### Tip 2 Diyabet
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Diyabet Yönetimi Rehberi | /rehberler/diyabet |
| HIGH | Düşük Karbonhidrat Beslenme | /beslenme#dusuk-karb |
| MEDIUM | Egzersiz ve Diyabet | /egzersiz#diyabet |
| MEDIUM | GLP-1 Agonistleri | /tedavi#glp1 |

### Pre-diyabet
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Diyabet Önleme Rehberi | /rehberler/diyabet-onleme |
| HIGH | Yaşam Tarzı Değişikliği | /beslenme |
| MEDIUM | Aralıklı Oruç | /rehberler/aralikli-oruc |

### Hipertansiyon
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Kalp Sağlığı Rehberi | /rehberler/kalp-sagligi |
| HIGH | DASH Diyeti | /beslenme#dash |
| MEDIUM | Tuz Azaltma Rehberi | /beslenme#tuz |
| MEDIUM | Stres Yönetimi | /uyku-stres#stres |

### Yüksek Kolesterol
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Kolesterol Düşürme Rehberi | /rehberler/kolesterol |
| HIGH | Akdeniz Diyeti | /rehberler/akdeniz-diyeti |
| MEDIUM | Egzersiz ve Kalp | /egzersiz#kardio |

### Uyku Apnesi
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Uyku Apnesi ve Kilo | /uyku-stres#apne |
| HIGH | Kilo Verme (BMI >25 ise) | /rehberler/kilo-verme |
| MEDIUM | Uyku Hijyeni | /uyku-stres |

### Yağlı Karaciğer (NAFLD)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Karaciğer Sağlığı Rehberi | /rehberler/karaciger |
| HIGH | Kilo Verme | /rehberler/kilo-verme |
| MEDIUM | Düşük Fruktoz Beslenme | /beslenme |

### PCOS
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | PCOS Yönetimi Rehberi | /rehberler/pcos |
| MEDIUM | İnsülin Direnci | /rehberler/insulin-direnci |
| MEDIUM | Düşük Karbonhidrat | /beslenme#dusuk-karb |

---

## 3. Aile Öyküsü Bazlı Yönlendirmeler

### Ailede Diyabet
| Öncelik | Yönlendirme |
|---------|-------------|
| HIGH | Diyabet Önleme Rehberi |
| MEDIUM | Düzenli Şeker Takibi Önerisi |
| LOW | Risk Faktörleri Bilgilendirme |

### Ailede Kalp Hastalığı
| Öncelik | Yönlendirme |
|---------|-------------|
| HIGH | Kalp Sağlığı Rehberi |
| HIGH | Kardiyolog Kontrolü Önerisi |
| MEDIUM | Lipid Profili Takibi |

### Ailede Obezite
| Öncelik | Yönlendirme |
|---------|-------------|
| MEDIUM | Genetik ve Obezite Bilgi |
| MEDIUM | Erken Müdahale Önemi |
| LOW | Çocuklarda Obezite Önleme |

---

## 4. Yaşam Tarzı Bazlı Yönlendirmeler

### Hareketsiz Yaşam (Sedanter)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Evde Egzersiz Başlangıç | /rehberler/evde-egzersiz |
| MEDIUM | Günlük Adım Hedefleri | /egzersiz#adim |
| MEDIUM | Masa Başı Egzersizleri | /egzersiz#ofis |

### Kötü Beslenme
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Sağlıklı Beslenme 101 | /beslenme |
| HIGH | Akdeniz Diyeti | /rehberler/akdeniz-diyeti |
| MEDIUM | Yemek Hazırlama Rehberi | /beslenme#meal-prep |

### Yetersiz Uyku (<6 saat)
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Uyku Kalitesi Rehberi | /rehberler/uyku |
| MEDIUM | Uyku Hijyeni | /uyku-stres |
| LOW | Uyku ve Kilo İlişkisi | /uyku-stres#kilo |

### Yüksek Stres
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Stres Yönetimi Rehberi | /uyku-stres#stres |
| MEDIUM | Mindfulness Başlangıç | /rehberler/mindfulness |
| MEDIUM | Kortizol ve Kilo | /uyku-stres#kortizol |

### Sigara Kullanımı
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| URGENT | Sigarayı Bırakma Desteği | /rehberler/sigara-birakma |
| HIGH | Sigara ve Metabolizma | /bilim#sigara |

### Yüksek Alkol Tüketimi
| Öncelik | Yönlendirme | Sayfa |
|---------|-------------|-------|
| HIGH | Alkol ve Sağlık | /rehberler/alkol |
| MEDIUM | Karaciğer Sağlığı | /rehberler/karaciger |

---

## 5. Tedavi Tercihi Bazlı Yönlendirmeler

### Sadece Beslenme İsteyenler
```
→ Kilo Verme Rehberi
→ Kalori Hesaplayıcı
→ Akdeniz / Düşük Karb Diyeti
→ Porsiyon Kontrolü
```

### Egzersiz İsteyenler
```
→ Evde Egzersiz Rehberi
→ Yürüyüş Programı
→ Direnç Antrenmanı Başlangıç
→ HIIT Tanıtım
```

### İlaç Tedavisi Değerlendirenler (BMI ≥27 + komorbidite VEYA BMI ≥30)
```
→ GLP-1 İlaçları Detay Sayfası
→ Ozempic/Wegovy Karşılaştırma
→ Yan Etkiler ve Beklentiler
→ Doktor Bulma
```

### Cerrahi Değerlendirenler (BMI ≥35 VEYA BMI ≥30 + ciddi komorbidite)
```
→ Bariatrik Cerrahi Seçenekleri
→ Gastrik Sleeve vs Bypass
→ Endoskopik Alternatifler (ESG, Balon)
→ Cerrahi Öncesi Hazırlık
→ Uzman Doktor Yönlendirme
```

---

## 6. Motivasyon Bazlı Yönlendirmeler

### Çok Hazır (🔥)
```
→ Hemen Başla Programı
→ 7 Günlük Başlangıç Planı
→ Günlük Takip Araçları
```

### Hazır (✅)
```
→ Adım Adım Rehberler
→ Hedef Belirleme
→ Destek Kaynakları
```

### Düşünüyor (🤔)
```
→ Bilgilendirici İçerikler
→ Başarı Hikayeleri
→ SSS
```

### Emin Değil (❓)
```
→ Neden Önemli Bilgilendirmesi
→ Risk Hesaplayıcıları
→ Uzman Görüşleri
```

---

## 7. Acil Yönlendirmeler (Red Flags)

### Hemen Doktora Yönlendir:
- BMI ≥ 40
- BMI ≥ 35 + Diyabet + Kalp Hastalığı
- Uyku Apnesi + BMI ≥ 35
- Hızlı Kilo Kaybı/Artışı Öyküsü
- Ciddi Yeme Bozukluğu Şüphesi

### Uyarı Mesajı Göster:
- Sigara + BMI ≥ 30
- Ailede Erken Kalp Hastalığı + Risk Faktörleri
- Pre-diyabet + Sedanter + Kötü Beslenme

---

## 8. Kombinasyon Kuralları

### Yüksek Riskli Profil
```
IF (BMI ≥ 30) AND (Diyabet OR Pre-diyabet) AND (Sedanter) THEN
  → URGENT: Multidisipliner Yaklaşım
  → HIGH: GLP-1 veya Cerrahi Değerlendirme
  → HIGH: Uzman Yönlendirme
```

### Metabolik Sendrom Şüphesi
```
IF (Bel Çevresi Yüksek) AND (Hipertansiyon OR Diyabet OR Kolesterol) THEN
  → HIGH: Metabolik Sendrom Bilgilendirme
  → HIGH: Kapsamlı Değerlendirme Önerisi
  → MEDIUM: Yaşam Tarzı Müdahalesi
```

### Genç Obez (18-35 yaş)
```
IF (Yaş 18-35) AND (BMI ≥ 30) THEN
  → HIGH: Erken Müdahale Önemi
  → MEDIUM: Davranış Değişikliği Odaklı
  → MEDIUM: Uzun Vadeli Planlama
```

### Yaşlı Hasta (60+)
```
IF (Yaş 60+) THEN
  → Düşük Yoğunluklu Egzersiz
  → Kas Korumalı Diyet
  → İlaç Etkileşimi Uyarısı
  → Yavaş Kilo Kaybı Hedefi
```

---

## 9. Öncelik Skorlama

Her öneri için skor hesaplama:

```javascript
score = baseScore 
      + (urgencyMultiplier * urgencyFactor)
      + (relevanceScore * 0.5)
      - (alreadySeenPenalty)
```

### Base Scores:
- URGENT: 100
- HIGH: 75
- MEDIUM: 50
- LOW: 25

### Urgency Factors:
- Multiple comorbidities: +20
- High BMI: +15
- Smoking: +10
- Family history: +5

---

## 10. Çıktı Formatı (JSON)

```json
{
  "patientId": "uuid",
  "assessmentDate": "2025-02-07T14:00:00Z",
  "riskLevel": "HIGH",
  "recommendations": [
    {
      "id": "rec_001",
      "type": "treatment",
      "title": "GLP-1 İlaçları Değerlendirmesi",
      "description": "BMI ve risk faktörlerinize göre...",
      "priority": "HIGH",
      "score": 92,
      "link": "/tedavi#glp1",
      "reason": "BMI 32 + Tip 2 Diyabet"
    },
    {
      "id": "rec_002",
      "type": "guide",
      "title": "Diyabet Yönetimi Rehberi",
      "priority": "HIGH",
      "score": 88,
      "link": "/rehberler/diyabet"
    }
  ],
  "alerts": [
    {
      "type": "warning",
      "message": "Yüksek kardiyovasküler risk. Uzman kontrolü önerilir."
    }
  ],
  "nextSteps": [
    "Kalori hesaplayıcısını kullanın",
    "Endokrinoloji randevusu alın",
    "7 günlük beslenme günlüğü tutun"
  ]
}
```

---

## Notlar

1. **Tüm kurallar kümülatif** - Birden fazla kural eşleşebilir
2. **En yüksek öncelikli 5 öneri** gösterilir
3. **URGENT durumlar** her zaman önce gösterilir
4. **Kullanıcı tercihleri** dikkate alınır (örn: cerrahi istemiyor)
5. **A/B test** için alternatif öneri setleri tutulabilir
