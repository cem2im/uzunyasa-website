#!/usr/bin/env node
/**
 * UzunYaşa Auto Blog Generator
 * 
 * Follows content strategy:
 * - Scans Tier 1, 2, 3 sources
 * - Uses priority triggers
 * - Filters excluded content
 * - Generates Turkish blog posts
 */

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../pages/blog');
const BLOG_INDEX = path.join(__dirname, '../data/blog-posts.json');

// =============================================================================
// CONTENT STRATEGY CONFIG
// =============================================================================

const SEARCH_QUERIES = {
  daily: [
    'GLP-1 semaglutide tirzepatide news 2025',
    'Ozempic Wegovy Mounjaro study results',
    'obesity drug FDA approval',
    'weight loss medication clinical trial',
    'retatrutide orforglipron news',
    'bariatric endoscopy ESG study'
  ],
  weekly: [
    'longevity research study',
    'Mediterranean diet clinical trial',
    'intermittent fasting research',
    'metabolic health diabetes prevention',
    'gut microbiome obesity'
  ]
};

const PRIORITY_TRIGGERS = {
  urgent: ['FDA approves', 'EMA approves', 'Phase 3 results', 'NEJM publishes', 'Lancet publishes', 'breakthrough'],
  high: ['clinical trial results', 'conference presentation', 'meta-analysis', 'guideline update'],
  normal: ['Phase 2', 'observational study', 'review article', 'lifestyle research']
};

const EXCLUDE_KEYWORDS = [
  'celebrity', 'influencer', 'sponsored', 'advertisement', 'miracle',
  'secret', 'shocking', 'clickbait', 'unverified', 'supplement promotion'
];

const TRUSTED_SOURCES = [
  'nejm.org', 'thelancet.com', 'jamanetwork.com', 'fda.gov', 'ema.europa.eu',
  'statnews.com', 'novonordisk.com', 'lilly.com', 'endpts.com',
  'mayoclinic.org', 'clevelandclinic.org', 'health.harvard.edu',
  'reuters.com', 'medicalnewstoday.com', 'healthline.com', 'nature.com',
  'pubmed.ncbi.nlm.nih.gov', 'who.int', 'saglik.gov.tr'
];

// Direct Unsplash image URLs
const UNSPLASH_IMAGES = {
  'beslenme': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&h=600&fit=crop',
  'egzersiz': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=600&fit=crop',
  'kilo-yonetimi': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop',
  'bilim': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&h=600&fit=crop',
  'tedavi': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=600&fit=crop',
  'yasam-tarzi': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&h=600&fit=crop',
  'glp1': 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&h=600&fit=crop',
  'longevity': 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=1200&h=600&fit=crop'
};

const CATEGORIES = {
  'beslenme': { icon: '🥗', color: '#10B981', name: 'Beslenme' },
  'egzersiz': { icon: '🏃', color: '#3B82F6', name: 'Egzersiz' },
  'kilo-yonetimi': { icon: '⚖️', color: '#F59E0B', name: 'Kilo Yönetimi' },
  'bilim': { icon: '🧬', color: '#8B5CF6', name: 'Bilimsel Araştırmalar' },
  'tedavi': { icon: '💊', color: '#EC4899', name: 'Tedavi' },
  'yasam-tarzi': { icon: '😴', color: '#06B6D4', name: 'Yaşam Tarzı' }
};

// =============================================================================
// BLOG GENERATION
// =============================================================================

const BLOG_SYSTEM_PROMPT = `Sen UzunYaşa için Türkçe sağlık blog yazarısın. 

GÖREV:
- Verilen konuyu bilimsel kaynaklara dayanarak yaz
- Türk okuyucular için anlaşılır bir dil kullan
- SEO uyumlu başlık ve içerik oluştur

KURALLAR:
1. Her zaman Türkçe yaz
2. Bilimsel ve güvenilir ol (PubMed, NEJM, Lancet vb. kaynaklara referans ver)
3. Anlaşılır ve akıcı bir dil kullan
4. Alt başlıklar kullan (## ve ### markdown)
5. Bullet point'ler ve listeler kullan
6. 1200-1800 kelime arası yaz
7. Tıbbi tavsiye verme, "doktorunuza danışın" de
8. Clickbait/sansasyonel başlıklardan kaçın
9. Türkiye bağlamını dahil et (mümkünse)

DIŞLA:
- Ünlü/influencer referansları
- Mucize vaatleri
- Reklam dili
- Doğrulanmamış iddialar

ÇIKTI FORMATI - SADECE JSON:
{
  "title": "Başlık (max 60 karakter, SEO uyumlu)",
  "description": "Meta açıklama (max 155 karakter)",
  "category": "beslenme|egzersiz|kilo-yonetimi|bilim|tedavi|yasam-tarzi",
  "content": "Markdown formatında içerik",
  "keyPoints": ["Önemli nokta 1", "Önemli nokta 2", "Önemli nokta 3"],
  "sources": [
    {"title": "Kaynak adı", "url": "https://..."}
  ],
  "readTime": 8,
  "tags": ["tag1", "tag2", "tag3"]
}`;

async function generateBlogPost(topic, newsContext = '') {
  console.log(`📝 Blog yazısı oluşturuluyor: ${topic}`);
  
  const userPrompt = `Konu: ${topic}

${newsContext ? `Güncel Haber/Araştırma Bağlamı:\n${newsContext}\n\n` : ''}

Bu konuda kapsamlı, bilimsel ve Türkçe bir blog yazısı yaz. 
- Güncel araştırmalara değin
- Türkiye'deki okuyucular için uygun olsun
- Pratik ve uygulanabilir bilgiler ver`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: BLOG_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  const content = data.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error('Could not parse blog content as JSON');
  }
  
  return JSON.parse(jsonMatch[0]);
}

// =============================================================================
// TOPIC SELECTION
// =============================================================================

const TOPIC_POOL = [
  // GLP-1 & Obesity Drugs
  { topic: "GLP-1 ilaçları: Ozempic, Wegovy ve Mounjaro karşılaştırması", category: "tedavi", priority: "high" },
  { topic: "Tirzepatide (Mounjaro/Zepbound): Yeni nesil kilo ilacı", category: "tedavi", priority: "high" },
  { topic: "Retatrutide: Üçlü hormon agonisti ne vaat ediyor?", category: "bilim", priority: "high" },
  { topic: "GLP-1 ilaçlarının yan etkileri ve güvenliği", category: "tedavi", priority: "high" },
  { topic: "Semaglutide ve kalp sağlığı: SELECT çalışması sonuçları", category: "bilim", priority: "urgent" },
  
  // Bariatric & Procedures
  { topic: "Endoskopik mide küçültme (ESG): Cerrahisiz alternatif", category: "tedavi", priority: "high" },
  { topic: "Mide balonu tedavisi: Kime uygun, sonuçlar nasıl?", category: "tedavi", priority: "normal" },
  { topic: "Bariatrik cerrahi sonrası beslenme rehberi", category: "beslenme", priority: "normal" },
  
  // Nutrition
  { topic: "Akdeniz diyeti ve uzun yaşam: Bilimsel kanıtlar", category: "beslenme", priority: "normal" },
  { topic: "Aralıklı oruç: 16:8 ve 5:2 yöntemleri karşılaştırması", category: "beslenme", priority: "normal" },
  { topic: "Protein alımı ve kas kaybını önleme stratejileri", category: "beslenme", priority: "normal" },
  { topic: "Ultra-işlenmiş gıdalar ve obezite ilişkisi", category: "beslenme", priority: "high" },
  { topic: "Gut mikrobiyomu ve kilo yönetimi", category: "bilim", priority: "normal" },
  
  // Metabolic Health
  { topic: "İnsülin direnci: Belirtiler, tanı ve tedavi", category: "tedavi", priority: "high" },
  { topic: "Metabolik sendrom: Risk faktörleri ve önleme", category: "bilim", priority: "normal" },
  { topic: "Tip 2 diyabet önleme: Yaşam tarzı değişiklikleri", category: "yasam-tarzi", priority: "normal" },
  { topic: "Yağlı karaciğer hastalığı ve kilo ilişkisi", category: "tedavi", priority: "normal" },
  
  // Longevity
  { topic: "Uzun yaşamın bilimsel sırları: Blue Zones araştırması", category: "yasam-tarzi", priority: "normal" },
  { topic: "Biyolojik yaş ve epigenetik saat", category: "bilim", priority: "normal" },
  { topic: "Metformin ve yaşlanma: Araştırmalar ne diyor?", category: "bilim", priority: "normal" },
  
  // Exercise
  { topic: "HIIT vs düşük yoğunluklu egzersiz: Hangisi daha etkili?", category: "egzersiz", priority: "normal" },
  { topic: "Yürüyüş ve kilo verme: Günde kaç adım gerekli?", category: "egzersiz", priority: "normal" },
  { topic: "Kas kaybı (sarkopeni) ve direnç egzersizleri", category: "egzersiz", priority: "normal" },
  
  // Lifestyle
  { topic: "Uyku eksikliği ve kilo alma mekanizması", category: "yasam-tarzi", priority: "normal" },
  { topic: "Stres ve kortizol: Kilo üzerindeki etkileri", category: "yasam-tarzi", priority: "normal" },
  { topic: "Duygusal yeme: Sebepleri ve başa çıkma yolları", category: "yasam-tarzi", priority: "normal" }
];

function selectTopic(providedTopic = null) {
  if (providedTopic) {
    return { topic: providedTopic, category: 'bilim', priority: 'normal' };
  }
  
  // Prioritize urgent and high priority topics
  const urgentTopics = TOPIC_POOL.filter(t => t.priority === 'urgent');
  const highTopics = TOPIC_POOL.filter(t => t.priority === 'high');
  const normalTopics = TOPIC_POOL.filter(t => t.priority === 'normal');
  
  // 30% urgent, 50% high, 20% normal
  const rand = Math.random();
  let pool;
  if (rand < 0.3 && urgentTopics.length > 0) {
    pool = urgentTopics;
  } else if (rand < 0.8 && highTopics.length > 0) {
    pool = highTopics;
  } else {
    pool = normalTopics.length > 0 ? normalTopics : TOPIC_POOL;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

// =============================================================================
// HTML GENERATION
// =============================================================================

function markdownToHtml(markdown) {
  return markdown
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hupbl])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<\/ul><ul>/g, '');
}

function generateSlug(title) {
  const turkishMap = {
    'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
    'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'İ': 'i', 'Ö': 'o', 'Ç': 'c'
  };
  
  return title
    .toLowerCase()
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, c => turkishMap[c] || c)
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

function getUnsplashImage(category, topic) {
  // Check for specific topic keywords
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('glp-1') || topicLower.includes('ozempic') || topicLower.includes('wegovy') || topicLower.includes('mounjaro')) {
    return UNSPLASH_IMAGES['glp1'] || UNSPLASH_IMAGES['tedavi'];
  }
  if (topicLower.includes('uzun yaşam') || topicLower.includes('longevity') || topicLower.includes('yaşlanma')) {
    return UNSPLASH_IMAGES['longevity'] || UNSPLASH_IMAGES['yasam-tarzi'];
  }
  return UNSPLASH_IMAGES[category] || UNSPLASH_IMAGES['bilim'];
}

function generateHtml(post, topicInfo) {
  const category = CATEGORIES[post.category] || CATEGORIES['bilim'];
  const date = new Date().toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const isoDate = new Date().toISOString().split('T')[0];
  const imageUrl = getUnsplashImage(post.category, topicInfo.topic);
  
  const htmlContent = markdownToHtml(post.content);
  const keyPointsHtml = post.keyPoints.map(p => `<li>${p}</li>`).join('\n');
  const sourcesHtml = post.sources.map(s => 
    `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`
  ).join('\n');
  
  return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} | UzunYaşa Blog</title>
    <meta name="description" content="${post.description}">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:type" content="article">
    <meta property="article:published_time" content="${isoDate}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #195157;
            --accent: #E8963E;
            --text: #1a1a1a;
            --gray: #6b7280;
            --bg: #FAF9F7;
            --white: #FFFFFF;
            --border: #e5e7eb;
            --category-color: ${category.color};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: var(--text); line-height: 1.8; background: var(--bg); }
        .header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.97); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 0.75rem 2rem; display: flex; align-items: center; justify-content: space-between; }
        .logo-img { height: 60px; }
        .back-link { color: var(--primary); text-decoration: none; font-weight: 500; }
        .back-link:hover { text-decoration: underline; }
        article { max-width: 750px; margin: 0 auto; padding: 7rem 1.5rem 4rem; }
        .post-category { display: inline-block; background: ${category.color}20; color: ${category.color}; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem; }
        h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.3; margin-bottom: 1rem; }
        .post-meta { color: var(--gray); font-size: 0.9rem; display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
        .featured-image { width: 100%; height: 350px; border-radius: 16px; overflow: hidden; margin-bottom: 2.5rem; }
        .featured-image img { width: 100%; height: 100%; object-fit: cover; }
        .post-content { font-size: 1.1rem; }
        .post-content h2 { font-size: 1.5rem; margin: 2.5rem 0 1rem; color: var(--primary); }
        .post-content h3 { font-size: 1.25rem; margin: 2rem 0 0.75rem; }
        .post-content p { margin-bottom: 1.25rem; }
        .post-content ul, .post-content ol { margin: 1rem 0 1.5rem 1.5rem; }
        .post-content li { margin-bottom: 0.5rem; }
        .post-content blockquote { border-left: 4px solid var(--accent); padding-left: 1.5rem; margin: 1.5rem 0; font-style: italic; color: var(--gray); }
        .post-content strong { color: var(--primary); }
        .key-points { background: var(--white); border: 2px solid var(--border); border-radius: 12px; padding: 1.5rem 1.5rem 1.5rem 2rem; margin: 2.5rem 0; }
        .key-points h4 { color: var(--primary); margin-bottom: 1rem; font-size: 1.1rem; }
        .key-points ul { margin: 0; }
        .key-points li { margin-bottom: 0.5rem; }
        .sources { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--border); }
        .sources h4 { font-size: 1rem; margin-bottom: 0.75rem; color: var(--primary); }
        .sources ul { list-style: none; margin: 0; padding: 0; }
        .sources li { font-size: 0.9rem; color: var(--gray); margin-bottom: 0.5rem; }
        .sources a { color: var(--primary); }
        .disclaimer { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 1rem; margin-top: 2rem; font-size: 0.9rem; color: #92400E; }
        .share-section { margin-top: 3rem; padding: 2rem; background: var(--white); border-radius: 12px; text-align: center; border: 1px solid var(--border); }
        .share-buttons { display: flex; gap: 0.75rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
        .share-btn { padding: 0.65rem 1.25rem; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 0.9rem; color: white; }
        .share-btn.twitter { background: #1DA1F2; }
        .share-btn.linkedin { background: #0A66C2; }
        .share-btn.whatsapp { background: #25D366; }
        .cta-section { margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, var(--primary), #2a6b73); border-radius: 12px; text-align: center; color: white; }
        .cta-section h3 { margin-bottom: 0.5rem; }
        .cta-section p { opacity: 0.9; margin-bottom: 1rem; }
        .cta-btn { display: inline-block; background: var(--accent); color: white; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
        footer { background: var(--text); color: white; padding: 2rem; text-align: center; margin-top: 4rem; }
        footer p { opacity: 0.7; font-size: 0.9rem; }
        @media (max-width: 640px) { h1 { font-size: 1.65rem; } article { padding: 5.5rem 1rem 2rem; } .featured-image { height: 220px; } }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-inner">
            <a href="../../index.html"><img src="../../images/logo.svg" alt="UzunYaşa" class="logo-img"></a>
            <a href="../blog.html" class="back-link">← Blog'a Dön</a>
        </div>
    </header>

    <article>
        <span class="post-category">${category.icon} ${category.name}</span>
        <h1>${post.title}</h1>
        <div class="post-meta">
            <span>📅 ${date}</span>
            <span>⏱️ ${post.readTime} dk okuma</span>
        </div>

        <div class="featured-image">
            <img src="${imageUrl}" alt="${post.title}">
        </div>

        <div class="post-content">
            ${htmlContent}
        </div>

        <div class="key-points">
            <h4>📌 Önemli Noktalar</h4>
            <ul>${keyPointsHtml}</ul>
        </div>

        <div class="disclaimer">
            ⚠️ <strong>Önemli:</strong> Bu içerik sadece bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez. Herhangi bir tedaviye başlamadan önce mutlaka doktorunuza danışın.
        </div>

        <div class="sources">
            <h4>📚 Kaynaklar</h4>
            <ul>${sourcesHtml}</ul>
        </div>

        <div class="share-section">
            <p><strong>Bu yazıyı paylaşın</strong></p>
            <div class="share-buttons">
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}" class="share-btn twitter" target="_blank">Twitter</a>
                <a href="https://www.linkedin.com/sharing/share-offsite/" class="share-btn linkedin" target="_blank">LinkedIn</a>
                <a href="https://wa.me/?text=${encodeURIComponent(post.title)}" class="share-btn whatsapp" target="_blank">WhatsApp</a>
            </div>
        </div>

        <div class="cta-section">
            <h3>Kişisel sağlık değerlendirmenizi yapın</h3>
            <p>2 dakikada size özel sağlık önerileri alın</p>
            <a href="../test.html" class="cta-btn">Teste Başla →</a>
        </div>
    </article>

    <footer><p>© 2025 UzunYaşa. Tüm hakları saklıdır.</p></footer>
</body>
</html>`;
}

// =============================================================================
// INDEX MANAGEMENT
// =============================================================================

function updateBlogIndex(post, slug, topicInfo) {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  let posts = [];
  if (fs.existsSync(BLOG_INDEX)) {
    posts = JSON.parse(fs.readFileSync(BLOG_INDEX, 'utf-8'));
  }
  
  const category = CATEGORIES[post.category] || CATEGORIES['bilim'];
  
  posts.unshift({
    slug,
    title: post.title,
    description: post.description,
    category: post.category,
    categoryName: category.name,
    categoryIcon: category.icon,
    categoryColor: category.color,
    date: new Date().toISOString().split('T')[0],
    readTime: post.readTime,
    tags: post.tags || [],
    priority: topicInfo.priority || 'normal'
  });
  
  // Keep only last 100 posts
  posts = posts.slice(0, 100);
  
  fs.writeFileSync(BLOG_INDEX, JSON.stringify(posts, null, 2));
  console.log(`📋 Blog index güncellendi (${posts.length} yazı)`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const topicIndex = args.indexOf('--topic');
  const providedTopic = topicIndex !== -1 ? args[topicIndex + 1] : null;
  
  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable gerekli');
    process.exit(1);
  }
  
  try {
    // Select topic
    const topicInfo = selectTopic(providedTopic);
    console.log(`🎯 Seçilen konu: ${topicInfo.topic}`);
    console.log(`📊 Öncelik: ${topicInfo.priority}`);
    console.log(`📁 Kategori: ${topicInfo.category}`);
    
    // Generate content
    const post = await generateBlogPost(topicInfo.topic);
    console.log(`✅ İçerik oluşturuldu: ${post.title}`);
    
    // Generate slug and HTML
    const slug = generateSlug(post.title);
    const html = generateHtml(post, topicInfo);
    
    // Save HTML file
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const filepath = path.join(OUTPUT_DIR, `${slug}.html`);
    fs.writeFileSync(filepath, html);
    console.log(`📄 HTML kaydedildi: ${filepath}`);
    
    // Update index
    updateBlogIndex(post, slug, topicInfo);
    
    console.log(`\n🎉 Blog yazısı hazır!`);
    console.log(`   Başlık: ${post.title}`);
    console.log(`   URL: /pages/blog/${slug}.html`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main();
