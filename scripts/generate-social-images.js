#!/usr/bin/env node
/**
 * Social Media Image Generator for UzunYaşa
 * Generates Instagram carousel images and embeds them in blog posts
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Blog post metadata extractor
function extractBlogMeta(htmlContent) {
  const titleMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const descMatch = htmlContent.match(/<meta name="description" content="([^"]+)"/);
  const categoryMatch = htmlContent.match(/class="category[^"]*">([^<]+)</);
  
  // Extract key points from content
  const points = [];
  const h2Matches = htmlContent.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g);
  for (const match of h2Matches) {
    if (points.length < 4) points.push(match[1]);
  }
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'Blog Yazısı',
    description: descMatch ? descMatch[1] : '',
    category: categoryMatch ? categoryMatch[1].trim() : 'Sağlık',
    keyPoints: points
  };
}

// Generate Instagram caption
function generateCaption(meta, slug) {
  return `📖 ${meta.title}

${meta.description}

📌 İçerik:
${meta.keyPoints.map(p => `• ${p}`).join('\n')}

👉 Detaylı rehber için bio'daki linke tıkla!
🔗 uzunyasa.com/blog/${slug}

#uzunyasa #sağlık #sağlıklıyaşam #türkiye #bilim #tıp #beslenme #diyet #kiloverme #obezite`;
}

// Generate social media box HTML for blog post
function generateSocialBox(meta, slug, caption) {
  return `
    <!-- SOCIAL MEDIA KIT - Auto-generated -->
    <div class="social-media-kit" style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border: 2px solid #195157; border-radius: 16px; padding: 32px; margin: 32px 0;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="font-size: 28px;">📱</span>
            <h3 style="margin: 0; color: #195157; font-size: 22px;">Instagram İçeriği</h3>
            <span style="background: #195157; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-left: auto;">Hazır!</span>
        </div>
        
        <div style="margin-bottom: 24px;">
            <p style="font-weight: 600; margin-bottom: 12px; color: #374151;">📋 Caption (kopyala):</p>
            <textarea id="social-caption" readonly style="width: 100%; min-height: 200px; padding: 16px; border: 1px solid #d1d5db; border-radius: 12px; font-family: inherit; font-size: 14px; line-height: 1.6; resize: vertical; background: white;">${caption.replace(/"/g, '&quot;')}</textarea>
            <button onclick="navigator.clipboard.writeText(document.getElementById('social-caption').value); this.textContent='✅ Kopyalandı!'; setTimeout(()=>this.textContent='📋 Caption Kopyala', 2000)" style="margin-top: 12px; background: #195157; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">📋 Caption Kopyala</button>
        </div>
        
        <div>
            <p style="font-weight: 600; margin-bottom: 12px; color: #374151;">🖼️ Carousel Görselleri (4 slide):</p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                <a href="../../images/social/${slug}-slide1.jpg" download style="text-decoration: none;">
                    <img src="../../images/social/${slug}-slide1.jpg" alt="Slide 1" style="width: 100%; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <span style="display: block; text-align: center; font-size: 12px; color: #6b7280; margin-top: 4px;">1. Kapak</span>
                </a>
                <a href="../../images/social/${slug}-slide2.jpg" download style="text-decoration: none;">
                    <img src="../../images/social/${slug}-slide2.jpg" alt="Slide 2" style="width: 100%; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <span style="display: block; text-align: center; font-size: 12px; color: #6b7280; margin-top: 4px;">2. İçerik</span>
                </a>
                <a href="../../images/social/${slug}-slide3.jpg" download style="text-decoration: none;">
                    <img src="../../images/social/${slug}-slide3.jpg" alt="Slide 3" style="width: 100%; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <span style="display: block; text-align: center; font-size: 12px; color: #6b7280; margin-top: 4px;">3. Detay</span>
                </a>
                <a href="../../images/social/${slug}-slide4.jpg" download style="text-decoration: none;">
                    <img src="../../images/social/${slug}-slide4.jpg" alt="Slide 4" style="width: 100%; border-radius: 8px; border: 2px solid #e5e7eb;">
                    <span style="display: block; text-align: center; font-size: 12px; color: #6b7280; margin-top: 4px;">4. CTA</span>
                </a>
            </div>
            <button onclick="['1','2','3','4'].forEach(n=>{const a=document.createElement('a');a.href='../../images/social/${slug}-slide'+n+'.jpg';a.download='${slug}-slide'+n+'.jpg';a.click()})" style="margin-top: 16px; background: #D4A574; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; width: 100%;">⬇️ Tüm Görselleri İndir</button>
        </div>
    </div>
    <!-- END SOCIAL MEDIA KIT -->
`;
}

// Generate HTML for slides (same as before but cleaner)
function generateSlideHTML(meta, slideNum, slug) {
  const backgrounds = {
    1: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1400',
    2: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400',
    3: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1400',
    4: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400'
  };
  
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1080px;
      font-family: 'Inter', -apple-system, sans-serif;
      color: white;
      position: relative;
    }
    .corner { position: absolute; width: 60px; height: 60px; border: 2px solid rgba(255,255,255,0.1); }
    .corner-tl { top: 30px; left: 30px; border-right: none; border-bottom: none; border-radius: 12px 0 0 0; }
    .corner-br { bottom: 30px; right: 30px; border-left: none; border-top: none; border-radius: 0 0 12px 0; }
  `;
  
  const templates = {
    1: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(25,81,87,0.72) 0%, rgba(42,125,131,0.65) 100%), url('${backgrounds[1]}') center/cover; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; }
.logo { position: absolute; top: 60px; font-size: 26px; font-weight: 600; text-shadow: 2px 2px 8px rgba(0,0,0,0.4); }
.icon { width: 120px; height: 120px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 28px; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; backdrop-filter: blur(20px); font-size: 56px; }
.divider { width: 60px; height: 3px; background: linear-gradient(90deg, transparent, #D4A574, transparent); margin-bottom: 24px; }
h1 { font-size: 72px; font-weight: 700; line-height: 1.1; margin-bottom: 20px; text-shadow: 2px 2px 12px rgba(0,0,0,0.4); }
.accent { color: #D4A574; }
.subtitle { font-size: 28px; opacity: 0.9; text-shadow: 1px 1px 6px rgba(0,0,0,0.3); }
.dots { position: absolute; bottom: 50px; display: flex; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); }
.dot.active { width: 24px; border-radius: 4px; background: #D4A574; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<div class="logo">🌿 UzunYaşa</div>
<div class="icon">📖</div>
<div class="divider"></div>
<h1>${meta.title.split(':')[0]}<br><span class="accent">${meta.title.includes(':') ? meta.title.split(':')[1] : 'Rehber'}</span></h1>
<p class="subtitle">${meta.category}</p>
<div class="dots"><div class="dot active"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
</body></html>`,

    2: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(25,81,87,0.70) 0%, rgba(42,125,131,0.62) 100%), url('${backgrounds[2]}') center/cover; display: flex; flex-direction: column; justify-content: center; padding: 80px; }
.logo { position: absolute; top: 40px; left: 50px; font-size: 20px; text-shadow: 1px 1px 6px rgba(0,0,0,0.4); }
.page { position: absolute; top: 40px; right: 50px; font-size: 18px; opacity: 0.7; }
h2 { font-size: 44px; font-weight: 700; margin-bottom: 36px; color: #D4A574; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); }
.card { background: rgba(0,0,0,0.3); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px 32px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
.num { font-size: 32px; min-width: 50px; }
.text { font-size: 24px; line-height: 1.4; }
.dots { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); }
.dot.active { width: 24px; border-radius: 4px; background: #D4A574; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<div class="logo">🌿 UzunYaşa</div>
<div class="page">2/4</div>
<h2>📋 İçerik</h2>
${meta.keyPoints.slice(0,4).map((p,i) => `<div class="card"><span class="num">${['①','②','③','④'][i]}</span><span class="text">${p}</span></div>`).join('')}
<div class="dots"><div class="dot"></div><div class="dot active"></div><div class="dot"></div><div class="dot"></div></div>
</body></html>`,

    3: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(124,58,237,0.72) 0%, rgba(91,33,182,0.65) 100%), url('${backgrounds[3]}') center/cover; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; text-align: center; }
.logo { position: absolute; top: 40px; left: 50px; font-size: 20px; text-shadow: 1px 1px 6px rgba(0,0,0,0.4); }
.page { position: absolute; top: 40px; right: 50px; font-size: 18px; opacity: 0.7; }
h2 { font-size: 44px; font-weight: 700; margin-bottom: 36px; color: #fcd34d; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); }
.box { background: rgba(0,0,0,0.3); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; max-width: 800px; }
.box p { font-size: 26px; line-height: 1.7; }
.dots { position: absolute; bottom: 50px; display: flex; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); }
.dot.active { width: 24px; border-radius: 4px; background: #fcd34d; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<div class="logo">🌿 UzunYaşa</div>
<div class="page">3/4</div>
<h2>💡 Özet</h2>
<div class="box"><p>${meta.description.substring(0, 220)}${meta.description.length > 220 ? '...' : ''}</p></div>
<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot active"></div><div class="dot"></div></div>
</body></html>`,

    4: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(25,81,87,0.70) 0%, rgba(42,125,131,0.62) 100%), url('${backgrounds[4]}') center/cover; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; text-align: center; }
h2 { font-size: 52px; font-weight: 700; margin-bottom: 20px; line-height: 1.2; text-shadow: 2px 2px 12px rgba(0,0,0,0.4); }
.accent { color: #D4A574; }
.sub { font-size: 26px; opacity: 0.9; margin-bottom: 40px; text-shadow: 1px 1px 6px rgba(0,0,0,0.3); }
.cta { background: #D4A574; color: white; font-size: 26px; font-weight: 700; padding: 22px 50px; border-radius: 50px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(212,165,116,0.4); }
.url { font-size: 20px; background: rgba(0,0,0,0.3); padding: 12px 28px; border-radius: 24px; backdrop-filter: blur(10px); }
.logo { position: absolute; bottom: 80px; font-size: 24px; font-weight: 600; text-shadow: 2px 2px 8px rgba(0,0,0,0.4); }
.dots { position: absolute; bottom: 40px; display: flex; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); }
.dot.active { width: 24px; border-radius: 4px; background: #D4A574; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<h2>Detaylı rehber için<br><span class="accent">uzunyasa.com</span></h2>
<p class="sub">Bilimsel • Bağımsız • Türkçe</p>
<div class="cta">🔗 Bio'daki Link</div>
<div class="url">uzunyasa.com/blog/${slug}</div>
<div class="logo">🌿 UzunYaşa</div>
<div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div><div class="dot active"></div></div>
</body></html>`
  };
  
  return templates[slideNum];
}

// Inject social box into blog HTML
function injectSocialBox(htmlContent, socialBox) {
  // Check if already has social box
  if (htmlContent.includes('social-media-kit')) {
    // Replace existing
    return htmlContent.replace(
      /<!-- SOCIAL MEDIA KIT - Auto-generated -->[\s\S]*?<!-- END SOCIAL MEDIA KIT -->/,
      socialBox.trim()
    );
  }
  
  // Insert after first <article> or <main> or after </header>
  const insertPoints = [
    { pattern: /(<article[^>]*>)/i, after: true },
    { pattern: /(<main[^>]*>)/i, after: true },
    { pattern: /(<\/header>)/i, after: true },
    { pattern: /(<div class="content[^"]*">)/i, after: true }
  ];
  
  for (const point of insertPoints) {
    if (point.pattern.test(htmlContent)) {
      return htmlContent.replace(point.pattern, `$1\n${socialBox}`);
    }
  }
  
  // Fallback: insert after <body>
  return htmlContent.replace(/(<body[^>]*>)/i, `$1\n${socialBox}`);
}

async function main() {
  const blogFiles = process.argv.slice(2);
  
  if (blogFiles.length === 0) {
    console.log('Usage: node generate-social-images.js [blog-file.html ...]');
    console.log('No blog files specified');
    return;
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (const blogFile of blogFiles) {
    const filePath = blogFile.startsWith('pages/') ? blogFile : `pages/blog/${blogFile}`;
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    const slug = path.basename(filePath, '.html');
    let htmlContent = fs.readFileSync(filePath, 'utf8');
    const meta = extractBlogMeta(htmlContent);
    
    console.log(`\n📝 Processing: ${slug}`);
    console.log(`   Title: ${meta.title}`);
    
    // Ensure output directory exists
    const socialDir = 'images/social';
    fs.mkdirSync(socialDir, { recursive: true });
    
    // Generate slides
    for (let i = 1; i <= 4; i++) {
      const slideHTML = generateSlideHTML(meta, i, slug);
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1080 });
      await page.setContent(slideHTML, { waitUntil: 'networkidle0' });
      
      const outputPath = `${socialDir}/${slug}-slide${i}.jpg`;
      await page.screenshot({ path: outputPath, type: 'jpeg', quality: 92 });
      console.log(`   ✅ Generated: ${outputPath}`);
      
      await page.close();
    }
    
    // Generate caption
    const caption = generateCaption(meta, slug);
    
    // Generate social box HTML
    const socialBox = generateSocialBox(meta, slug, caption);
    
    // Inject into blog post
    const updatedHTML = injectSocialBox(htmlContent, socialBox);
    fs.writeFileSync(filePath, updatedHTML);
    console.log(`   ✅ Injected social kit into: ${filePath}`);
    
    console.log(`   ✅ Done: ${slug}`);
  }
  
  await browser.close();
  console.log('\n🎉 All done!');
}

main().catch(console.error);
