#!/usr/bin/env node
/**
 * add-jsonld-batch2.js — Batch 2: Remaining pages (rehberler, section indexes, info pages, etc.)
 * Idempotent: skips files that already have JSON-LD
 */

const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '..');
const TODAY = '2026-02-26';
const BASE_URL = 'https://uzunyasa.com';

let totalUpdated = 0;
const results = { guides: 0, sections: 0, info: 0, tools: 0, treatment: 0, legal: 0 };

// ── Helpers ──

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

function extractOgImage(html) {
  const match = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  return match ? match[1].trim() : null;
}

function hasJsonLd(html) {
  return html.includes('application/ld+json');
}

function insertJsonLd(html, jsonLdObj) {
  const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLdObj, null, 2)}\n</script>`;
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex === -1) return null;
  return html.slice(0, headCloseIndex) + scriptTag + '\n' + html.slice(headCloseIndex);
}

function processFile(filePath, jsonLdObj, category) {
  const html = fs.readFileSync(filePath, 'utf8');
  if (hasJsonLd(html)) {
    console.log(`  ✅ ${path.relative(WEBSITE_DIR, filePath)} — zaten var`);
    return false;
  }
  // Skip tiny redirects
  if (html.length < 300 || /meta\s+http-equiv=["']refresh["']/i.test(html)) {
    console.log(`  ⏭️  ${path.relative(WEBSITE_DIR, filePath)} — redirect, atlanıyor`);
    return false;
  }
  const newHtml = insertJsonLd(html, jsonLdObj);
  if (newHtml) {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    console.log(`  ✏️  ${path.relative(WEBSITE_DIR, filePath)} — JSON-LD eklendi`);
    totalUpdated++;
    results[category]++;
    return true;
  }
  console.warn(`  ⚠️  ${path.relative(WEBSITE_DIR, filePath)} — </head> bulunamadı`);
  return false;
}

const publisher = {
  "@type": "Organization",
  "name": "UzunYaşa",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${BASE_URL}/images/logo-icon-new.png`
  }
};

const author = {
  "@type": "Person",
  "name": "Prof. Dr. Cem Şimşek",
  "url": `${BASE_URL}/pages/hakkimizda.html`
};

// ═══════════════════════════════════════
// 1. REHBER (Guide) SAYFALARI — Article
// ═══════════════════════════════════════

console.log('📚 Rehber sayfaları işleniyor...');

const guidePages = [
  'pages/rehberler/50-yas-egzersiz.html',
  'pages/rehberler/akdeniz-diyeti.html',
  'pages/rehberler/aralikli-oruc.html',
  'pages/rehberler/evde-egzersiz.html',
  'pages/rehberler/kalori-acigi.html',
  'pages/rehberler/kalp-sagligi.html',
  'pages/rehberler/plato-kirma.html',
  'pages/rehberler/tip2-diyabet.html',
  'pages/rehberler/uyku-kalitesi.html',
];

for (const rel of guidePages) {
  const filePath = path.join(WEBSITE_DIR, rel);
  if (!fs.existsSync(filePath)) { console.log(`  ❌ ${rel} bulunamadı`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html) || rel;
  const description = extractDescription(html) || '';
  const image = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;

  processFile(filePath, {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": author,
    "publisher": publisher,
    "datePublished": "2025-12-01",
    "dateModified": TODAY,
    "mainEntityOfPage": `${BASE_URL}/${rel}`,
    "image": image
  }, 'guides');
}

// ═══════════════════════════════════════
// 2. TEDAVİ SAYFALARI — MedicalWebPage
// ═══════════════════════════════════════

console.log('\n🏥 Tedavi sayfaları işleniyor...');

const treatmentPages = [
  'pages/tedavi/endoskopik-prosedurler.html',
];

for (const rel of treatmentPages) {
  const filePath = path.join(WEBSITE_DIR, rel);
  if (!fs.existsSync(filePath)) { console.log(`  ❌ ${rel} bulunamadı`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html) || rel;
  const description = extractDescription(html) || '';
  const image = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;

  processFile(filePath, {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "name": title,
    "description": description,
    "author": author,
    "publisher": publisher,
    "datePublished": "2025-12-01",
    "dateModified": TODAY,
    "mainEntityOfPage": `${BASE_URL}/${rel}`,
    "image": image,
    "about": {
      "@type": "MedicalProcedure",
      "name": title
    }
  }, 'treatment');
}

// ═══════════════════════════════════════
// 3. SECTION INDEX SAYFALARI — CollectionPage
// ═══════════════════════════════════════

console.log('\n📂 Bölüm index sayfaları işleniyor...');

const sectionPages = [
  'pages/araclar.html',
  'pages/beslenme.html',
  'pages/bilim.html',
  'pages/blog.html',
  'pages/egzersiz.html',
  'pages/rehberler.html',
  'pages/tedavi.html',
  'pages/uyku-stres.html',
];

for (const rel of sectionPages) {
  const filePath = path.join(WEBSITE_DIR, rel);
  if (!fs.existsSync(filePath)) { console.log(`  ❌ ${rel} bulunamadı`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html) || rel;
  const description = extractDescription(html) || '';
  const image = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;

  processFile(filePath, {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": `${BASE_URL}/${rel}`,
    "publisher": publisher,
    "mainEntityOfPage": `${BASE_URL}/${rel}`,
    "image": image
  }, 'sections');
}

// ═══════════════════════════════════════
// 4. BİLGİ SAYFALARI — WebPage / AboutPage
// ═══════════════════════════════════════

console.log('\nℹ️  Bilgi sayfaları işleniyor...');

const infoPages = [
  { file: 'pages/hakkimizda.html', type: 'AboutPage' },
  { file: 'pages/danisma-kurulu.html', type: 'WebPage' },
  { file: 'pages/hikayeler.html', type: 'WebPage' },
  { file: 'pages/istatistikler.html', type: 'WebPage' },
  { file: 'pages/icerik-haritasi.html', type: 'WebPage' },
  { file: 'pages/editoryal-politika.html', type: 'WebPage' },
  { file: 'pages/preview-ai-experts.html', type: 'WebPage' },
];

for (const { file: rel, type } of infoPages) {
  const filePath = path.join(WEBSITE_DIR, rel);
  if (!fs.existsSync(filePath)) { console.log(`  ❌ ${rel} bulunamadı`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html) || rel;
  const description = extractDescription(html) || '';
  const image = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;

  processFile(filePath, {
    "@context": "https://schema.org",
    "@type": type,
    "name": title,
    "description": description,
    "url": `${BASE_URL}/${rel}`,
    "publisher": publisher,
    "mainEntityOfPage": `${BASE_URL}/${rel}`,
    "image": image
  }, 'info');
}

// ═══════════════════════════════════════
// 5. ARAÇ SAYFALARI (test, rapor, app) — WebApplication
// ═══════════════════════════════════════

console.log('\n🔧 Araç/Test sayfaları işleniyor...');

const toolPages = [
  'pages/test.html',
  'pages/test-duygusal.html',
  'pages/raporum.html',
  'pages/ecem-app.html',
];

for (const rel of toolPages) {
  const filePath = path.join(WEBSITE_DIR, rel);
  if (!fs.existsSync(filePath)) { console.log(`  ❌ ${rel} bulunamadı`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html) || rel;
  const description = extractDescription(html) || '';
  const image = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;

  processFile(filePath, {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "url": `${BASE_URL}/${rel}`,
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "author": publisher,
    "image": image
  }, 'tools');
}

// ═══════════════════════════════════════
// 6. YASAL SAYFALAR — WebPage
// ═══════════════════════════════════════

console.log('\n📜 Yasal sayfalar işleniyor...');

const legalPages = [
  'pages/cerez-politikasi.html',
  'pages/gizlilik-politikasi.html',
  'pages/kullanim-sartlari.html',
];

for (const rel of legalPages) {
  const filePath = path.join(WEBSITE_DIR, rel);
  if (!fs.existsSync(filePath)) { console.log(`  ❌ ${rel} bulunamadı`); continue; }
  const html = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(html) || rel;
  const description = extractDescription(html) || '';

  processFile(filePath, {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": `${BASE_URL}/${rel}`,
    "publisher": publisher,
    "dateModified": TODAY
  }, 'legal');
}

// ═══════════════════════════════════════
// ÖZET
// ═══════════════════════════════════════

console.log('\n' + '═'.repeat(55));
console.log(`📊 Batch 2 Sonuç:`);
console.log(`   Rehber sayfaları:    ${results.guides}`);
console.log(`   Bölüm index'leri:   ${results.sections}`);
console.log(`   Bilgi sayfaları:     ${results.info}`);
console.log(`   Araç/Test sayfaları: ${results.tools}`);
console.log(`   Tedavi sayfaları:    ${results.treatment}`);
console.log(`   Yasal sayfalar:      ${results.legal}`);
console.log(`   ─────────────────────`);
console.log(`   TOPLAM:              ${totalUpdated}`);
console.log('═'.repeat(55));
