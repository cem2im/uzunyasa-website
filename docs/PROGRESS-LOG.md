# Progress Log

All major decisions, changes, and milestones. Newest first.

---

## 2026-02-08

### Website Content — 26 New Pages Created
All empty placeholder pages filled with high-quality Turkish health content:

**Uyku (4 pages):**
- pages/uyku/uyku-hijyeni.html
- pages/uyku/sirkadiyen-ritim.html
- pages/uyku/uyku-bozukluklari.html
- pages/uyku/ruya-ve-uyku-evreleri.html

**Stres Yönetimi (4 pages):**
- pages/stres/nefes-teknikleri.html
- pages/stres/meditasyon-mindfulness.html
- pages/stres/kronik-stres.html
- pages/stres/is-yasam-dengesi.html

**Egzersiz (6 pages):**
- pages/egzersiz/kardiyovaskular.html
- pages/egzersiz/kuvvet-antrenman.html
- pages/egzersiz/esneklik-mobilite.html
- pages/egzersiz/hiit-tabata.html
- pages/egzersiz/grup-egzersizleri.html
- pages/egzersiz/rehabilitasyon.html (missing — needs creation)

**Tedavi (9 pages — 7 new + 2 existing):**
- pages/tedavi/davranissal-terapi.html (new)
- pages/tedavi/orlistat.html (new)
- pages/tedavi/naltrexone-bupropion.html (new)
- pages/tedavi/kombinasyon-tedavileri.html (new)
- pages/tedavi/yan-etkiler-riskler.html (new)
- pages/tedavi/ameliyat-oncesi-hazirlik.html (new)
- pages/tedavi/uzun-vadeli-takip.html (new)
- pages/tedavi/gastrik-sleeve.html (existing)
- pages/tedavi/gastrik-bypass.html (existing)

**Beslenme (3 pages with interactive JS):**
- pages/beslenme/bana-ne-uygun.html
- pages/beslenme/bmi-hesaplayici.html
- pages/beslenme/kalori-hesaplayici.html

### Website Audit — 10 Items Fixed
- robots.txt + sitemap.xml (46+ URLs)
- Canonical URLs on all pages
- Open Graph + Twitter Cards
- JSON-LD structured data
- Branded 404.html (Turkish)
- Extracted shared CSS → styles/main.css
- Google Analytics G-QBM7E0EHFP on all pages
- PWA: manifest.json + sw.js
- Accessibility: ARIA, skip-nav, landmarks
- Newsletter forms (Formspree placeholder)

### CSS Bug Fix
- main.css had wrong color variables (#195157 instead of #0D7377)
- Body background was bg-cream instead of bg-white
- Missing CSS variables: --primary-dark, --accent-hover, --shadow-*, --text-medium, --text-muted
- Fixed and pushed

### Instagram Setup
- Instagram account: @uzunyasaorg (Business account, 1 post)
- Buffer account connected (cemsimsek11@gmail.com)
- Buffer has uzunyasaorg + Uzun Yaşa Facebook page connected
- Currently "Notify" mode (personal) — needs Professional reconnect for auto-posting
- Week 1 content (5 posts) written → /data/workspace/instagram-week1-posts.md
- Instagram strategy document → /data/workspace/uzunyasa-instagram-strategy.md

### Infrastructure
- Chromium headless installed on Railway (playwright)
- Browser config: headless, noSandbox, executablePath set
- Git: cem2im, auto-push working

## 2026-02-07

### Initial Setup
- Cemigram ⚡ identity established
- Telegram bot @CemOpenclawBot connected
- Gateway bind fixed (lan → auto) for Railway
- Web dashboard accessible
- GitHub connected (cem2im)
- Repository cloned: uzunyasa-website
