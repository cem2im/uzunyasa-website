#!/usr/bin/env node
/**
 * add-jsonld.js — Tüm blog, araç ve ana sayfaya JSON-LD structured data ekler
 * Tekrar çalıştırılabilir: zaten JSON-LD olan dosyaları atlar
 * Redirect dosyalarını atlar (<=278 byte veya meta refresh içeren)
 */

const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(WEBSITE_DIR, 'pages', 'blog');
const ARACLAR_DIR = path.join(WEBSITE_DIR, 'pages', 'araclar');
const INDEX_FILE = path.join(WEBSITE_DIR, 'index.html');
const BLOG_POSTS_JSON = path.join(WEBSITE_DIR, 'data', 'blog-posts.json');

const TODAY = '2026-02-24';
const BASE_URL = 'https://uzunyasa.com';

// Load blog posts metadata
const blogPosts = JSON.parse(fs.readFileSync(BLOG_POSTS_JSON, 'utf8'));
const blogPostMap = {};
for (const post of blogPosts) {
  blogPostMap[post.slug] = post;
}

let blogUpdated = 0;
let aracUpdated = 0;
let indexUpdated = 0;

// ── Helpers ──

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractTitle(html) {
  return extractTag(html, /<title[^>]*>([^<]+)<\/title>/i);
}

function extractDescription(html) {
  return extractTag(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
}

function extractOgImage(html) {
  return extractTag(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
}

function isRedirect(filePath, html) {
  const stat = fs.statSync(filePath);
  if (stat.size <= 278) return true;
  if (/meta\s+http-equiv=["']refresh["']/i.test(html)) return true;
  return false;
}

function hasJsonLd(html) {
  return html.includes('application/ld+json');
}

function escapeJsonString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function insertJsonLd(html, scriptTag) {
  // Insert before </head>
  const headCloseIndex = html.indexOf('</head>');
  if (headCloseIndex === -1) {
    console.warn('  ⚠️  </head> bulunamadı, atlanıyor');
    return null;
  }
  return html.slice(0, headCloseIndex) + scriptTag + '\n' + html.slice(headCloseIndex);
}

// ── Blog sayfaları ──

console.log('📝 Blog sayfaları işleniyor...');
const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html') && f !== 'index.html');

for (const file of blogFiles) {
  const filePath = path.join(BLOG_DIR, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.html', '');

  if (isRedirect(filePath, html)) {
    console.log(`  ⏭️  ${file} — redirect, atlanıyor`);
    continue;
  }

  if (hasJsonLd(html)) {
    console.log(`  ✅ ${file} — zaten JSON-LD var, atlanıyor`);
    continue;
  }

  const title = extractTitle(html) || slug;
  const description = extractDescription(html) || '';
  const ogImage = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;
  const postMeta = blogPostMap[slug];
  const datePublished = postMeta ? postMeta.date : TODAY;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": "UzunYaşa",
      "url": BASE_URL
    },
    "publisher": {
      "@type": "Organization",
      "name": "UzunYaşa",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/images/logo-icon-new.png`
      }
    },
    "datePublished": datePublished,
    "dateModified": TODAY,
    "mainEntityOfPage": `${BASE_URL}/pages/blog/${file}`,
    "image": ogImage
  };

  const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
  const newHtml = insertJsonLd(html, scriptTag);

  if (newHtml) {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    console.log(`  ✏️  ${file} — JSON-LD eklendi`);
    blogUpdated++;
  }
}

// ── Araç sayfaları ──

console.log('\n🔧 Araç sayfaları işleniyor...');
const aracFiles = fs.readdirSync(ARACLAR_DIR).filter(f => f.endsWith('.html'));

// Tool name mapping for better descriptions
const toolNames = {
  'sahur-iftar-planlayici': { name: 'Sahur & İftar Planlayıcı', category: 'HealthApplication' },
  'mit-kirici': { name: 'Mit Kırıcı — Sağlık Mitleri Testi', category: 'HealthApplication' },
  'glp1-karsilastirma': { name: 'GLP-1 İlaç Karşılaştırma Aracı', category: 'HealthApplication' },
  'glp1-uygunluk-testi': { name: 'GLP-1 Uygunluk Testi', category: 'HealthApplication' },
  'kac-kilo-vermeliyim': { name: 'Kaç Kilo Vermeliyim? Hesaplama Aracı', category: 'HealthApplication' },
  'kalori-karsilastirici': { name: 'Kalori Karşılaştırıcı', category: 'HealthApplication' },
  'makro-ucgeni': { name: 'Makro Üçgeni — Makro Besin Hesaplama', category: 'HealthApplication' },
  'diyet-asistani': { name: 'AI Diyet Asistanı', category: 'HealthApplication' },
  'egzersiz-asistani': { name: 'AI Egzersiz Asistanı', category: 'HealthApplication' },
  'turkiye-obezite-haritasi': { name: 'Türkiye Obezite Haritası', category: 'HealthApplication' },
};

for (const file of aracFiles) {
  const filePath = path.join(ARACLAR_DIR, file);
  const html = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.html', '');

  if (isRedirect(filePath, html)) {
    console.log(`  ⏭️  ${file} — redirect, atlanıyor`);
    continue;
  }

  if (hasJsonLd(html)) {
    console.log(`  ✅ ${file} — zaten JSON-LD var, atlanıyor`);
    continue;
  }

  const title = extractTitle(html) || (toolNames[slug] ? toolNames[slug].name : slug);
  const description = extractDescription(html) || '';
  const ogImage = extractOgImage(html) || `${BASE_URL}/images/og-default.png`;
  const appCategory = toolNames[slug] ? toolNames[slug].category : 'HealthApplication';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "url": `${BASE_URL}/pages/araclar/${file}`,
    "applicationCategory": appCategory,
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "author": {
      "@type": "Organization",
      "name": "UzunYaşa",
      "url": BASE_URL
    },
    "image": ogImage
  };

  const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
  const newHtml = insertJsonLd(html, scriptTag);

  if (newHtml) {
    fs.writeFileSync(filePath, newHtml, 'utf8');
    console.log(`  ✏️  ${file} — WebApplication JSON-LD eklendi`);
    aracUpdated++;
  }
}

// ── Ana sayfa ──

console.log('\n🏠 Ana sayfa işleniyor...');
{
  const html = fs.readFileSync(INDEX_FILE, 'utf8');

  if (hasJsonLd(html)) {
    console.log('  ✅ index.html — zaten JSON-LD var, atlanıyor');
  } else {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "UzunYaşa",
      "alternateName": "UzunYasa",
      "url": BASE_URL,
      "description": "Türkiye uzun yaşasın diye. Türkiye'nin bağımsız kilo yönetimi platformu.",
      "publisher": {
        "@type": "Organization",
        "name": "UzunYaşa",
        "url": BASE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${BASE_URL}/images/logo-icon-new.png`
        }
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${BASE_URL}/pages/blog/index.html?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
    const newHtml = insertJsonLd(html, scriptTag);

    if (newHtml) {
      fs.writeFileSync(INDEX_FILE, newHtml, 'utf8');
      console.log('  ✏️  index.html — WebSite JSON-LD eklendi');
      indexUpdated++;
    }
  }
}

// ── Özet ──

console.log('\n' + '═'.repeat(50));
console.log(`📊 Sonuç:`);
console.log(`   Blog sayfaları güncellendi: ${blogUpdated}`);
console.log(`   Araç sayfaları güncellendi: ${aracUpdated}`);
console.log(`   Ana sayfa güncellendi: ${indexUpdated}`);
console.log(`   Toplam: ${blogUpdated + aracUpdated + indexUpdated}`);
console.log('═'.repeat(50));

// Output for commit message
const total = blogUpdated + aracUpdated + indexUpdated;
if (total > 0) {
  console.log(`\nCommit mesajı: SEO: JSON-LD structured data eklendi (${blogUpdated} blog + ${aracUpdated} araç sayfası + ${indexUpdated} ana sayfa)`);
}
