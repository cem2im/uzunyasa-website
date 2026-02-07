/**
 * UzunYaşa Blog Content Generator
 * 
 * Bu script şunları yapar:
 * 1. Güncel sağlık haberlerini/makalelerini bulur
 * 2. Claude AI ile Türkçe blog yazısı oluşturur
 * 3. HTML dosyası olarak kaydeder
 * 
 * Kullanım:
 * ANTHROPIC_API_KEY=xxx node blog-generator.js --topic "GLP-1 ilaçları"
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  outputDir: path.join(__dirname, '../pages/blog'),
  categories: {
    'beslenme': { icon: '🥗', color: '#10B981' },
    'egzersiz': { icon: '🏃', color: '#3B82F6' },
    'kilo-yonetimi': { icon: '⚖️', color: '#F59E0B' },
    'bilim': { icon: '🧬', color: '#8B5CF6' },
    'tedavi': { icon: '💊', color: '#EC4899' },
    'yasam-tarzi': { icon: '😴', color: '#06B6D4' }
  }
};

// Blog Post Template
const BLOG_TEMPLATE = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} | UzunYaşa Blog</title>
    <meta name="description" content="{{description}}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-teal: #195157;
            --accent-orange: #E8963E;
            --text-dark: #1a1a1a;
            --text-gray: #6b7280;
            --bg-cream: #FAF9F7;
            --bg-white: #FFFFFF;
            --border-light: #e5e7eb;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', sans-serif;
            color: var(--text-dark);
            line-height: 1.8;
            background: var(--bg-cream);
        }
        .header {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border-light);
            padding: 0.75rem 2rem;
        }
        .header-inner {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .logo-img { height: 60px; }
        .back-link {
            color: var(--primary-teal);
            text-decoration: none;
            font-weight: 500;
        }
        article {
            max-width: 800px;
            margin: 0 auto;
            padding: 8rem 2rem 4rem;
        }
        .post-header {
            margin-bottom: 2rem;
        }
        .post-category {
            display: inline-block;
            background: {{categoryColor}}20;
            color: {{categoryColor}};
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 1rem;
        }
        .post-meta {
            color: var(--text-gray);
            font-size: 0.9rem;
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .post-image {
            width: 100%;
            height: 400px;
            background: linear-gradient(135deg, {{categoryColor}}, {{categoryColor}}aa);
            border-radius: 16px;
            margin: 2rem 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5rem;
        }
        .post-content {
            font-size: 1.1rem;
        }
        .post-content h2 {
            font-size: 1.5rem;
            margin: 2rem 0 1rem;
            color: var(--primary-teal);
        }
        .post-content h3 {
            font-size: 1.25rem;
            margin: 1.5rem 0 0.75rem;
        }
        .post-content p {
            margin-bottom: 1.25rem;
        }
        .post-content ul, .post-content ol {
            margin: 1rem 0 1.5rem 1.5rem;
        }
        .post-content li {
            margin-bottom: 0.5rem;
        }
        .post-content blockquote {
            border-left: 4px solid var(--accent-orange);
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: var(--text-gray);
        }
        .key-points {
            background: var(--bg-white);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        .key-points h4 {
            color: var(--primary-teal);
            margin-bottom: 1rem;
        }
        .sources {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-light);
        }
        .sources h4 {
            font-size: 1rem;
            margin-bottom: 0.75rem;
        }
        .sources ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        .sources li {
            font-size: 0.9rem;
            color: var(--text-gray);
            margin-bottom: 0.5rem;
        }
        .sources a {
            color: var(--primary-teal);
        }
        .share-section {
            margin-top: 3rem;
            padding: 2rem;
            background: var(--bg-white);
            border-radius: 12px;
            text-align: center;
        }
        .share-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 1rem;
        }
        .share-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            font-size: 0.9rem;
        }
        .share-btn.twitter { background: #1DA1F2; color: white; }
        .share-btn.linkedin { background: #0A66C2; color: white; }
        .share-btn.whatsapp { background: #25D366; color: white; }
        footer {
            background: var(--text-dark);
            color: white;
            padding: 2rem;
            text-align: center;
            margin-top: 4rem;
        }
        @media (max-width: 640px) {
            h1 { font-size: 1.75rem; }
            article { padding: 6rem 1rem 2rem; }
            .post-image { height: 250px; font-size: 3rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-inner">
            <a href="../../index.html">
                <img src="../../images/logo.svg" alt="UzunYaşa" class="logo-img">
            </a>
            <a href="../blog.html" class="back-link">← Blog'a Dön</a>
        </div>
    </header>

    <article>
        <div class="post-header">
            <span class="post-category">{{categoryIcon}} {{categoryName}}</span>
            <h1>{{title}}</h1>
            <div class="post-meta">
                <span>📅 {{date}}</span>
                <span>⏱️ {{readTime}} dk okuma</span>
                <span>✍️ {{author}}</span>
            </div>
        </div>

        <div class="post-image">{{categoryIcon}}</div>

        <div class="post-content">
            {{content}}
        </div>

        <div class="key-points">
            <h4>📌 Önemli Noktalar</h4>
            {{keyPoints}}
        </div>

        <div class="sources">
            <h4>📚 Kaynaklar</h4>
            {{sources}}
        </div>

        <div class="share-section">
            <p><strong>Bu yazıyı paylaşın</strong></p>
            <div class="share-buttons">
                <a href="https://twitter.com/intent/tweet?text={{encodedTitle}}&url={{url}}" class="share-btn twitter" target="_blank">Twitter</a>
                <a href="https://www.linkedin.com/shareArticle?mini=true&url={{url}}&title={{encodedTitle}}" class="share-btn linkedin" target="_blank">LinkedIn</a>
                <a href="https://wa.me/?text={{encodedTitle}}%20{{url}}" class="share-btn whatsapp" target="_blank">WhatsApp</a>
            </div>
        </div>
    </article>

    <footer>
        <p>© 2025 UzunYaşa. Tüm hakları saklıdır.</p>
    </footer>
</body>
</html>`;

// Blog post generation prompt
const SYSTEM_PROMPT = `Sen UzunYaşa için blog yazarısın. Türkçe, bilimsel, anlaşılır ve SEO-uyumlu blog yazıları yazıyorsun.

KURALLAR:
1. Her zaman Türkçe yaz
2. Bilimsel kaynaklara dayalı ol
3. Anlaşılır ve akıcı bir dil kullan
4. Alt başlıklar (h2, h3) kullan
5. Bullet point'ler ve listeler kullan
6. 1000-1500 kelime arası yaz
7. Okuyucuyu bilgilendir, satış yapma
8. Tıbbi tavsiye verme, "doktorunuza danışın" de

ÇIKTI FORMATI (JSON):
{
  "title": "Başlık (60 karakter max)",
  "description": "Meta açıklama (155 karakter max)",
  "category": "beslenme|egzersiz|kilo-yonetimi|bilim|tedavi|yasam-tarzi",
  "content": "HTML formatında içerik (h2, h3, p, ul, li, blockquote kullan)",
  "keyPoints": ["Önemli nokta 1", "Önemli nokta 2", "..."],
  "sources": [{"title": "Kaynak adı", "url": "https://..."}],
  "readTime": 8
}`;

// Generate blog post
async function generateBlogPost(topic, sourceInfo = '') {
  const userPrompt = `Konu: ${topic}

${sourceInfo ? `Kaynak bilgiler:\n${sourceInfo}\n\n` : ''}

Bu konuda kapsamlı bir blog yazısı yaz. Güncel bilimsel araştırmalara değin. Türkiye'deki okuyucular için uygun olsun.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.anthropicKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  const data = await response.json();
  const content = data.content[0].text;
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse blog content');
  
  return JSON.parse(jsonMatch[0]);
}

// Save blog post as HTML
function saveBlogPost(post) {
  const slug = post.title
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const category = CONFIG.categories[post.category] || CONFIG.categories['beslenme'];
  const date = new Date().toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  let html = BLOG_TEMPLATE
    .replace(/\{\{title\}\}/g, post.title)
    .replace(/\{\{description\}\}/g, post.description)
    .replace(/\{\{categoryName\}\}/g, post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .replace(/\{\{categoryIcon\}\}/g, category.icon)
    .replace(/\{\{categoryColor\}\}/g, category.color)
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{readTime\}\}/g, post.readTime)
    .replace(/\{\{author\}\}/g, 'UzunYaşa Editör')
    .replace(/\{\{content\}\}/g, post.content)
    .replace(/\{\{keyPoints\}\}/g, `<ul>${post.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>`)
    .replace(/\{\{sources\}\}/g, `<ul>${post.sources.map(s => `<li><a href="${s.url}" target="_blank">${s.title}</a></li>`).join('')}</ul>`)
    .replace(/\{\{encodedTitle\}\}/g, encodeURIComponent(post.title))
    .replace(/\{\{url\}\}/g, encodeURIComponent(`https://cem2im.github.io/uzunyasa-website/pages/blog/${slug}.html`));

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const filepath = path.join(CONFIG.outputDir, `${slug}.html`);
  fs.writeFileSync(filepath, html);
  
  console.log(`✅ Blog yazısı kaydedildi: ${filepath}`);
  return { slug, filepath };
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const topicIndex = args.indexOf('--topic');
  
  if (topicIndex === -1 || !args[topicIndex + 1]) {
    console.log(`
UzunYaşa Blog Generator

Kullanım:
  node blog-generator.js --topic "Konu başlığı"

Örnek:
  node blog-generator.js --topic "GLP-1 ilaçları ve kilo verme"
  node blog-generator.js --topic "Aralıklı oruç faydaları"
    `);
    return;
  }

  const topic = args[topicIndex + 1];
  console.log(`📝 Blog yazısı oluşturuluyor: ${topic}`);
  
  try {
    const post = await generateBlogPost(topic);
    const result = saveBlogPost(post);
    console.log(`\n🎉 Tamamlandı!`);
    console.log(`   Başlık: ${post.title}`);
    console.log(`   Dosya: ${result.filepath}`);
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

module.exports = { generateBlogPost, saveBlogPost };

// Run if called directly
if (require.main === module) {
  main();
}
