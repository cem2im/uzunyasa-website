#!/usr/bin/env node
/**
 * Auto Blog Generator for GitHub Actions
 * Generates a complete blog post with HTML
 */

const fs = require('fs');
const path = require('path');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OUTPUT_DIR = path.join(__dirname, '../pages/blog');
const BLOG_INDEX = path.join(__dirname, '../data/blog-posts.json');

const CATEGORIES = {
  'beslenme': { icon: '🥗', color: '#10B981', name: 'Beslenme' },
  'egzersiz': { icon: '🏃', color: '#3B82F6', name: 'Egzersiz' },
  'kilo-yonetimi': { icon: '⚖️', color: '#F59E0B', name: 'Kilo Yönetimi' },
  'bilim': { icon: '🧬', color: '#8B5CF6', name: 'Bilimsel Araştırmalar' },
  'tedavi': { icon: '💊', color: '#EC4899', name: 'Tedavi' },
  'yasam-tarzi': { icon: '😴', color: '#06B6D4', name: 'Yaşam Tarzı' }
};

const BLOG_SYSTEM_PROMPT = `Sen UzunYaşa için Türkçe blog yazarısın. Bilimsel, anlaşılır ve SEO-uyumlu blog yazıları yazıyorsun.

KURALLAR:
1. Her zaman Türkçe yaz
2. Bilimsel kaynaklara dayalı ol (PubMed, klinik çalışmalar)
3. Anlaşılır ve akıcı bir dil kullan
4. Alt başlıklar kullan (## ve ### markdown)
5. Bullet point'ler ve listeler kullan
6. 1200-1800 kelime arası yaz
7. Okuyucuyu bilgilendir, satış yapma
8. Tıbbi tavsiye verme, "doktorunuza danışın" de
9. Başlık 60 karakter max olsun
10. İlgi çekici, tıklanabilir başlık yaz

ÇIKTI FORMATI - SADECE JSON:
{
  "title": "Başlık",
  "description": "Meta açıklama (155 karakter max)",
  "category": "beslenme|egzersiz|kilo-yonetimi|bilim|tedavi|yasam-tarzi",
  "content": "Markdown formatında içerik",
  "keyPoints": ["Önemli nokta 1", "Önemli nokta 2", "Önemli nokta 3"],
  "sources": [
    {"title": "Kaynak adı", "url": "https://pubmed.ncbi.nlm.nih.gov/..."},
    {"title": "Kaynak adı 2", "url": "https://..."}
  ],
  "readTime": 8,
  "tags": ["tag1", "tag2", "tag3"]
}`;

async function generateBlogPost(topic) {
  console.log(`📝 Blog yazısı oluşturuluyor: ${topic}`);
  
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
      messages: [{
        role: 'user',
        content: `Konu: ${topic}\n\nBu konuda kapsamlı bir blog yazısı yaz. Güncel bilimsel araştırmalara değin. Türkiye'deki okuyucular için uygun olsun.`
      }]
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

function generateHtml(post) {
  const category = CATEGORIES[post.category] || CATEGORIES['bilim'];
  const date = new Date().toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const isoDate = new Date().toISOString().split('T')[0];
  
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
        .featured-image { width: 100%; height: 350px; background: linear-gradient(135deg, ${category.color}, ${category.color}aa); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 5rem; margin-bottom: 2.5rem; }
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
        @media (max-width: 640px) { h1 { font-size: 1.65rem; } article { padding: 5.5rem 1rem 2rem; } .featured-image { height: 220px; font-size: 3rem; } }
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

        <div class="featured-image">${category.icon}</div>

        <div class="post-content">
            ${htmlContent}
        </div>

        <div class="key-points">
            <h4>📌 Önemli Noktalar</h4>
            <ul>${keyPointsHtml}</ul>
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

function updateBlogIndex(post, slug) {
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
    tags: post.tags || []
  });
  
  // Keep only last 100 posts
  posts = posts.slice(0, 100);
  
  fs.writeFileSync(BLOG_INDEX, JSON.stringify(posts, null, 2));
  console.log(`📋 Blog index güncellendi (${posts.length} yazı)`);
}

async function main() {
  const args = process.argv.slice(2);
  const topicIndex = args.indexOf('--topic');
  
  if (topicIndex === -1 || !args[topicIndex + 1]) {
    console.error('❌ Kullanım: node auto-blog-generator.js --topic "Konu"');
    process.exit(1);
  }
  
  const topic = args[topicIndex + 1];
  
  if (!ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable gerekli');
    process.exit(1);
  }
  
  try {
    // Generate content
    const post = await generateBlogPost(topic);
    console.log(`✅ İçerik oluşturuldu: ${post.title}`);
    
    // Generate slug and HTML
    const slug = generateSlug(post.title);
    const html = generateHtml(post);
    
    // Save HTML file
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const filepath = path.join(OUTPUT_DIR, `${slug}.html`);
    fs.writeFileSync(filepath, html);
    console.log(`📄 HTML kaydedildi: ${filepath}`);
    
    // Update index
    updateBlogIndex(post, slug);
    
    console.log(`\n🎉 Blog yazısı hazır!`);
    console.log(`   URL: /pages/blog/${slug}.html`);
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main();
