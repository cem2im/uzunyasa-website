#!/usr/bin/env node
/**
 * UzunYaşa Internal Linking Script
 * - Adds "İlgili Yazılar" (Related Posts) section to each blog
 * - Adds contextual internal links within blog content
 * - Skips redirect stubs and index pages
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'pages', 'blog');
const DATA_FILE = path.join(__dirname, '..', 'data', 'blog-posts.json');

// ── Load blog data ──
const blogPosts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// ── Topic clusters for related post matching ──
const topicClusters = {
  glp1: [
    'glp1-tam-rehber',
    'glp1-sss-sikca-sorulan-sorular',
    'glp1-ilaclari-yan-etkileri-bilmeniz-gerekenler',
    'glp1-birakinca-ne-olur',
    'glp1-beyin-sagligi-alzheimer-parkinson',
    'glp1-patent-savaslari-2026-yeni-nesil-ilaclar',
    'glp1-vs-esg-karsilastirma',
    'oral-wegovy-fda-onayi-ilk-glp1-hapi',
    'oral-glp1-orforglipron-igneden-hapa',
    'astrazeneca-elecoglipron-oral-glp1-faz2',
    'who-cochrane-glp1-incelemesi',
    'fda-kopya-glp1-yasaklari-v2',
    'semaglutide-ve-kalp-sagligi-select-calismasi-sonuclari',
    'semaglutid-ve-pankreatit-riski-vaka-raporlari-isiginda-guven',
    'glp1-ilaclari-kanser-riskini-artirir-mi-guncel-bilimsel-veri',
    'inkretin-tedaviler-kalp-sagligi',
    'tirzepatide-yeni-nesil-kilo-verme-ilacinin-bilimsel-gercekle',
    'retatrutide-yeni-nesil-obezite-ilacinin-vaatleri',
    'ramazanda-glp1-kullananlar-icin-oruc-rehberi',
  ],
  beslenme: [
    'akdeniz-diyeti-kalp-sagligi',
    'saglikli-beslenme-temelleri',
    'saglikli-kilo-vermenin-10-altin-kurali',
    'supplement-tier-list-bilimsel-kanit-puanlama',
    'jinekolojik-kanser-tedavisinde-ketojenik-diyet-komparc-calis',
    'blue-zones-dunyanin-en-uzun-yasayan-insanlarinin-9-sirri',
    'selenyum-kalp-sagligi-meta-analiz',
  ],
  egzersiz_sarkopeni: [
    'sarkopeni-kas-kaybini-onlemek-icin-direnc-egzersizleri',
    'sarkopeni-tedavi-patofizyoloji-ve-guncel-yaklasimlar',
    'egzersiz-temelleri-rehber',
    'hiit-vs-kardio-hangisi-daha-etkili',
    'kilo-vermek-icin-gunde-kac-adim-atmali-bilimsel-yanitlar',
  ],
  kilo_yonetimi: [
    'kilo-yonetimi-tedavi-secenekleri-karsilastirmasi',
    'saglikli-kilo-vermenin-10-altin-kurali',
    'stres-ve-kortizol-kilo-almaya-neden-olan-gizli-baglanti',
    'turkiye-obezite-rehberi',
    'uyku-ve-kilo-gizli-baglanti',
    'kilo-vermek-icin-gunde-kac-adim-atmali-bilimsel-yanitlar',
  ],
  cerrahi_esg: [
    'bariatrik-cerrahi-rehberi',
    'bariatrik-cerrahi-sonrasi-kilo-alimi-ve-bozuk-yeme-davranisl',
    'esg-endoskopik-sleeve-rehber',
    'esg-vs-sleeve-gastrektomi',
    'glp1-vs-esg-karsilastirma',
    'ozempic-vs-esg-maliyet',
    'mide-balonu-tedavisi-kime-uygun-sonuclar-nasil',
    'kilo-yonetimi-tedavi-secenekleri-karsilastirmasi',
  ],
  ramazan: [
    'ramazanda-glp1-kullananlar-icin-oruc-rehberi',
    'tip2-diyabet-zaman-kisitli-beslenme-intermittent-fasting',
    'aralikli-oructa-yag-kaybi-ve-kas-koruma-bilimsel-inceleme',
  ],
  kardiyovaskuler: [
    'score2-kalp-krizi-risk-hesaplama',
    'selenyum-kalp-sagligi-meta-analiz',
    'semaglutide-ve-kalp-sagligi-select-calismasi-sonuclari',
    'inkretin-tedaviler-kalp-sagligi',
    'akdeniz-diyeti-kalp-sagligi',
    'diyabetik-bobrek-hastaligi-yeni-tedavi-yontemleri-ve-koruma-',
  ],
  diyabet: [
    'tip2-diyabet-zaman-kisitli-beslenme-intermittent-fasting',
    'insulin-direnci-belirtiler-tedavi',
    'diyabetik-bobrek-hastaligi-yeni-tedavi-yontemleri-ve-koruma-',
  ],
  yasam_tarzi: [
    'uyku-ve-kilo-gizli-baglanti',
    'blue-zones-dunyanin-en-uzun-yasayan-insanlarinin-9-sirri',
    'stres-ve-kortizol-kilo-almaya-neden-olan-gizli-baglanti',
    'yapay-zeka-uzun-omur-yaslanma-bilimi',
  ],
};

// ── Build slug → post info map ──
const slugMap = {};
for (const post of blogPosts) {
  slugMap[post.slug] = post;
}

// ── Find which clusters a slug belongs to ──
function getClusters(slug) {
  const clusters = [];
  for (const [name, members] of Object.entries(topicClusters)) {
    if (members.includes(slug)) clusters.push(name);
  }
  return clusters;
}

// ── Score relatedness between two slugs ──
function relatednessScore(slugA, slugB) {
  if (slugA === slugB) return -1;
  const clustersA = getClusters(slugA);
  const clustersB = getClusters(slugB);
  let score = 0;
  for (const c of clustersA) {
    if (clustersB.includes(c)) score += 3;
  }
  // Tag overlap bonus
  const postA = slugMap[slugA];
  const postB = slugMap[slugB];
  if (postA && postB && postA.tags && postB.tags) {
    const tagsA = new Set(postA.tags.map(t => t.toLowerCase()));
    for (const t of (postB.tags || [])) {
      if (tagsA.has(t.toLowerCase())) score += 1;
    }
  }
  // Same category bonus
  if (postA && postB && postA.category === postB.category) score += 1;
  return score;
}

// ── Get top N related posts for a slug ──
function getRelatedPosts(slug, n = 3) {
  const scores = [];
  for (const post of blogPosts) {
    if (post.slug === slug) continue;
    // Skip tool pages and special pages
    if (post.category === 'tools') continue;
    if (post.slug === 'neden-uzunyasa' || post.slug === 'bilimsel-yaklasimimiz-neden-onemli') continue;
    const score = relatednessScore(slug, post.slug);
    if (score > 0) scores.push({ post, score });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, n).map(s => s.post);
}

// ── Generate "İlgili Yazılar" HTML ──
function generateRelatedPostsHTML(relatedPosts) {
  if (relatedPosts.length === 0) return '';
  
  const cards = relatedPosts.map(post => {
    const url = post.slug + '.html';
    const icon = post.categoryIcon || '📄';
    const catName = post.categoryName || post.category || '';
    const catColor = post.categoryColor || '#0D7377';
    const desc = post.description ? post.description.substring(0, 120) + (post.description.length > 120 ? '…' : '') : '';
    
    return `
      <a href="${url}" class="related-post-card" style="text-decoration:none; color:inherit; display:block; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1.25rem; transition:all 0.2s ease; flex:1; min-width:250px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:0.75rem;">
          <span style="font-size:1.2rem;">${icon}</span>
          <span style="font-size:0.75rem; font-weight:600; color:${catColor}; text-transform:uppercase; letter-spacing:0.5px;">${catName}</span>
        </div>
        <h4 style="font-size:0.95rem; font-weight:600; color:#195157; margin-bottom:0.5rem; line-height:1.4;">${post.title}</h4>
        <p style="font-size:0.85rem; color:#6B7280; line-height:1.5; margin:0;">${desc}</p>
      </a>`;
  }).join('\n');

  return `
<!-- İLGİLİ YAZILAR - Auto-generated by internal-links.js -->
<div class="related-posts-section" style="margin-top:3rem; padding-top:2rem; border-top:2px solid #e5e7eb;">
  <div style="display:flex; align-items:center; gap:12px; margin-bottom:1.5rem;">
    <div style="width:4px; height:32px; background:linear-gradient(to bottom, #0D7377, #14919B); border-radius:2px;"></div>
    <h2 style="margin:0; font-family:'Playfair Display', serif; font-size:1.5rem; color:#195157;">İlgili Yazılar</h2>
  </div>
  <div style="display:flex; flex-wrap:wrap; gap:1rem;">
${cards}
  </div>
  <style>
    .related-post-card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.1); border-color:#14919B !important; }
    @media(max-width:768px) { .related-post-card { min-width:100% !important; } }
  </style>
</div>
<!-- END İLGİLİ YAZILAR -->
`;
}

// ── Keyword → link mapping for contextual links ──
const keywordLinks = [
  // GLP-1 / Semaglutid
  { keyword: 'GLP-1 ilaçları', slug: 'glp1-tam-rehber', variants: ['GLP-1 İlaçları', 'GLP‑1 ilaçları'] },
  { keyword: 'GLP-1 tam rehber', slug: 'glp1-tam-rehber', variants: [] },
  { keyword: 'semaglutid', slug: 'glp1-tam-rehber', variants: ['Semaglutid', 'semaglutide', 'Semaglutide'] },
  { keyword: 'tirzepatid', slug: 'tirzepatide-yeni-nesil-kilo-verme-ilacinin-bilimsel-gercekle', variants: ['Tirzepatid', 'tirzepatide', 'Tirzepatide'] },
  { keyword: 'Mounjaro', slug: 'tirzepatide-yeni-nesil-kilo-verme-ilacinin-bilimsel-gercekle', variants: ['mounjaro'] },
  { keyword: 'Ozempic', slug: 'glp1-tam-rehber', variants: ['ozempic', 'OZEMPIC'] },
  { keyword: 'Wegovy', slug: 'glp1-tam-rehber', variants: ['wegovy', 'WEGOVY'] },
  { keyword: 'oral Wegovy', slug: 'oral-wegovy-fda-onayi-ilk-glp1-hapi', variants: ['Oral Wegovy', 'oral wegovy'] },
  { keyword: 'orforglipron', slug: 'oral-glp1-orforglipron-igneden-hapa', variants: ['Orforglipron'] },
  { keyword: 'retatrutide', slug: 'retatrutide-yeni-nesil-obezite-ilacinin-vaatleri', variants: ['Retatrutide', 'retatrutid'] },
  { keyword: 'GLP-1 yan etkileri', slug: 'glp1-ilaclari-yan-etkileri-bilmeniz-gerekenler', variants: ['GLP-1 yan etkiler'] },
  { keyword: 'pankreatit riski', slug: 'semaglutid-ve-pankreatit-riski-vaka-raporlari-isiginda-guven', variants: ['pankreatit', 'Pankreatit'] },
  
  // Sarkopeni / Egzersiz
  { keyword: 'sarkopeni', slug: 'sarkopeni-tedavi-patofizyoloji-ve-guncel-yaklasimlar', variants: ['Sarkopeni', 'kas kaybı', 'kas erimesi'] },
  { keyword: 'direnç egzersizi', slug: 'sarkopeni-kas-kaybini-onlemek-icin-direnc-egzersizleri', variants: ['direnç egzersizleri', 'Direnç egzersizi', 'Direnç egzersizleri', 'direnc egzersizi'] },
  { keyword: 'HIIT', slug: 'hiit-vs-kardio-hangisi-daha-etkili', variants: [] },
  
  // Beslenme
  { keyword: 'Akdeniz diyeti', slug: 'akdeniz-diyeti-kalp-sagligi', variants: ['akdeniz diyeti', 'Akdeniz Diyeti'] },
  { keyword: 'ketojenik diyet', slug: 'jinekolojik-kanser-tedavisinde-ketojenik-diyet-komparc-calis', variants: ['Ketojenik diyet', 'keto diyet'] },
  { keyword: 'intermittent fasting', slug: 'tip2-diyabet-zaman-kisitli-beslenme-intermittent-fasting', variants: ['Intermittent Fasting', 'aralıklı oruç', 'Aralıklı oruç', 'zaman kısıtlı beslenme'] },
  
  // Supplement
  { keyword: 'supplement', slug: 'supplement-tier-list-bilimsel-kanit-puanlama', variants: ['Supplement', 'takviye', 'suplementasyon'] },
  { keyword: 'selenyum', slug: 'selenyum-kalp-sagligi-meta-analiz', variants: ['Selenyum', 'selenium'] },
  { keyword: 'kreatin', slug: 'supplement-tier-list-bilimsel-kanit-puanlama', variants: ['Kreatin'] },
  
  // Kardiyovasküler
  { keyword: 'SCORE2', slug: 'score2-kalp-krizi-risk-hesaplama', variants: ['Score2'] },
  { keyword: 'SELECT çalışması', slug: 'semaglutide-ve-kalp-sagligi-select-calismasi-sonuclari', variants: ['SELECT Çalışması', 'SELECT trial'] },
  { keyword: 'kardiyovasküler risk', slug: 'score2-kalp-krizi-risk-hesaplama', variants: ['kardiyovasküler hastalık'] },
  { keyword: 'insülin direnci', slug: 'insulin-direnci-belirtiler-tedavi', variants: ['İnsülin direnci', 'insülin rezistansı'] },
  
  // Cerrahi/ESG
  { keyword: 'bariatrik cerrahi', slug: 'bariatrik-cerrahi-rehberi', variants: ['Bariatrik cerrahi', 'bariatrik operasyon', 'sleeve gastrektomi'] },
  { keyword: 'ESG', slug: 'esg-endoskopik-sleeve-rehber', variants: ['endoskopik sleeve gastroplasti'] },
  { keyword: 'mide balonu', slug: 'mide-balonu-tedavisi-kime-uygun-sonuclar-nasil', variants: ['Mide balonu', 'intragastrik balon'] },
  
  // Ramazan
  { keyword: 'Ramazan orucu', slug: 'ramazanda-glp1-kullananlar-icin-oruc-rehberi', variants: ['ramazan orucu', 'Ramazanda oruç'] },
  
  // Diğer
  { keyword: 'Blue Zones', slug: 'blue-zones-dunyanin-en-uzun-yasayan-insanlarinin-9-sirri', variants: ['blue zones', 'Mavi Bölgeler'] },
  { keyword: 'diyabetik böbrek', slug: 'diyabetik-bobrek-hastaligi-yeni-tedavi-yontemleri-ve-koruma-', variants: ['diyabetik nefropati'] },
  { keyword: 'Cochrane', slug: 'who-cochrane-glp1-incelemesi', variants: [] },
  { keyword: 'kortizol', slug: 'stres-ve-kortizol-kilo-almaya-neden-olan-gizli-baglanti', variants: ['Kortizol'] },
];

// ── Add contextual links to HTML content ──
function addContextualLinks(html, currentSlug) {
  let linkCount = 0;
  const maxLinks = 5;
  const linkedSlugs = new Set(); // Don't link to same post twice
  
  // We want to operate only on content text, not inside tags or existing <a> elements
  // Strategy: for each keyword, find it in the HTML but only if NOT already inside an <a> tag
  
  for (const entry of keywordLinks) {
    if (linkCount >= maxLinks) break;
    if (entry.slug === currentSlug) continue; // Don't self-link
    if (linkedSlugs.has(entry.slug)) continue; // Don't link same target twice
    
    const allVariants = [entry.keyword, ...entry.variants];
    let linked = false;
    
    for (const variant of allVariants) {
      if (linked) break;
      
      // Create a regex that finds the keyword NOT inside HTML tags or <a> elements
      // We'll use a safe approach: find outside of < > and not inside <a>...</a>
      const escapedVariant = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<![<\\/\\w])(?<!<a[^>]*>)(${escapedVariant})(?![^<]*<\\/a>)(?![\\w>])`, 'g');
      
      // Simple approach: split by </a> and <a to protect existing links
      // Find first occurrence outside of anchor tags
      let found = false;
      let result = '';
      let remaining = html;
      let depth = 0;
      let pos = 0;
      
      // Simpler approach: just do one replacement with careful checking
      const idx = html.indexOf(variant);
      if (idx === -1) continue;
      
      // Check we're not inside an <a> tag
      const before = html.substring(Math.max(0, idx - 2000), idx);
      const lastAOpen = before.lastIndexOf('<a ');
      const lastAClose = before.lastIndexOf('</a>');
      if (lastAOpen > lastAClose) continue; // Inside an anchor tag
      
      // Check we're not inside an HTML tag
      const lastLT = before.lastIndexOf('<');
      const lastGT = before.lastIndexOf('>');
      if (lastLT > lastGT) continue; // Inside a tag attribute
      
      // Check the keyword isn't part of a heading (h1-h3 title)
      const lineStart = before.lastIndexOf('\n');
      const lineContext = before.substring(lineStart);
      if (/<h[123][^>]*>[^<]*$/.test(lineContext)) continue;
      
      // Do the replacement (first occurrence only)
      const url = entry.slug + '.html';
      const linkHTML = `<a href="${url}" style="color:#0D7377; text-decoration:underline; text-decoration-color:rgba(13,115,119,0.3); text-underline-offset:2px;">${variant}</a>`;
      html = html.substring(0, idx) + linkHTML + html.substring(idx + variant.length);
      
      linkCount++;
      linkedSlugs.add(entry.slug);
      linked = true;
    }
  }
  
  return { html, linkCount };
}

// ── Files to skip ──
const SKIP_FILES = new Set([
  'index.html',
  'glp1-ilaclari-ve-kilo-verme-bilmeniz-gerekenler.html', // redirect stub
]);

// Slugs to skip for related posts section (about pages)
const SKIP_RELATED = new Set([
  'neden-uzunyasa',
  'bilimsel-yaklasimimiz-neden-onemli',
]);

// ── Main processing ──
let totalBlogsProcessed = 0;
let totalRelatedSections = 0;
let totalContextualLinks = 0;
const report = [];

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));

for (const file of files) {
  if (SKIP_FILES.has(file)) {
    console.log(`⏩ Skipping ${file} (redirect/index)`);
    continue;
  }
  
  const slug = file.replace('.html', '');
  const filePath = path.join(BLOG_DIR, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const originalHTML = html;
  
  // Check if already has related posts section
  const hasRelated = html.includes('related-posts-section');
  
  let contextLinks = 0;
  let relatedAdded = false;
  
  // 1. Add contextual links (do this first, before adding related posts HTML)
  const linkResult = addContextualLinks(html, slug);
  html = linkResult.html;
  contextLinks = linkResult.linkCount;
  
  // 2. Add related posts section (if not skipped and not already present)
  if (!SKIP_RELATED.has(slug) && !hasRelated) {
    const related = getRelatedPosts(slug, 3);
    if (related.length > 0) {
      const relatedHTML = generateRelatedPostsHTML(related);
      
      // Insert before </article>
      const articleCloseIdx = html.lastIndexOf('</article>');
      if (articleCloseIdx !== -1) {
        // Find a good insertion point - before the last cta-box or author-box before </article>
        const beforeArticle = html.substring(0, articleCloseIdx);
        
        // Try to insert before the cta-box/cta-section
        let insertIdx = -1;
        
        // Look for cta-box or cta-section div that's close to the end
        const ctaBoxIdx = beforeArticle.lastIndexOf('<div class="cta-box">');
        const ctaSectionIdx = beforeArticle.lastIndexOf('<div class="cta-section">');
        const authorBoxIdx = beforeArticle.lastIndexOf('<div class="author-box">');
        
        // Pick the earliest of the ending elements
        const candidates = [ctaBoxIdx, ctaSectionIdx, authorBoxIdx].filter(i => i > 0);
        if (candidates.length > 0) {
          insertIdx = Math.min(...candidates);
        } else {
          insertIdx = articleCloseIdx;
        }
        
        html = html.substring(0, insertIdx) + '\n' + relatedHTML + '\n' + html.substring(insertIdx);
        relatedAdded = true;
        totalRelatedSections++;
      }
    }
  }
  
  // Write back if changed
  if (html !== originalHTML) {
    fs.writeFileSync(filePath, html, 'utf8');
    totalBlogsProcessed++;
    totalContextualLinks += contextLinks;
    report.push(`✅ ${file}: ${contextLinks} contextual links${relatedAdded ? ' + İlgili Yazılar' : ''}`);
    console.log(`✅ ${file}: ${contextLinks} contextual links${relatedAdded ? ' + İlgili Yazılar section' : ''}`);
  } else {
    console.log(`⚪ ${file}: no changes needed`);
  }
}

console.log('\n' + '═'.repeat(60));
console.log('📊 INTERNAL LINKING RAPORU');
console.log('═'.repeat(60));
console.log(`📝 Toplam işlenen blog: ${totalBlogsProcessed}`);
console.log(`🔗 Toplam contextual link: ${totalContextualLinks}`);
console.log(`📋 İlgili Yazılar eklenen: ${totalRelatedSections}`);
console.log(`📊 Toplam internal link: ${totalContextualLinks + (totalRelatedSections * 3)}`);
console.log('═'.repeat(60));
report.forEach(r => console.log(r));
