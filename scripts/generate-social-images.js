#!/usr/bin/env node
/**
 * Social Media & Blog Visual Generator for UzunYaşa
 * Generates Instagram carousel images AND embeds them as blog visuals
 */

const path = require('path');
const fs = require('fs');

// Handle puppeteer from scripts/node_modules
const scriptDir = path.dirname(__filename);
const puppeteer = require(path.join(scriptDir, 'node_modules', 'puppeteer'));

// Set working directory to repo root
const repoRoot = path.resolve(scriptDir, '..');
process.chdir(repoRoot);
console.log(`Working directory: ${process.cwd()}`);

// Blog post metadata extractor
function extractBlogMeta(htmlContent) {
  const titleMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const descMatch = htmlContent.match(/<meta name="description" content="([^"]+)"/);
  const categoryMatch = htmlContent.match(/class="post-category[^"]*">([^<]+)</);
  
  // Extract key points from h2 headings
  const points = [];
  const h2Matches = htmlContent.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g);
  for (const match of h2Matches) {
    const text = match[1].trim();
    if (points.length < 5 && text.length < 60) points.push(text);
  }
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'Blog Yazısı',
    description: descMatch ? descMatch[1] : '',
    category: categoryMatch ? categoryMatch[1].replace(/[🔬💊📊🏃‍♀️⚡🧠❤️🥗]/g, '').trim() : 'Sağlık',
    keyPoints: points
  };
}

// Generate summary section HTML (for bottom of blog)
function generateSummarySection(meta, slug) {
  const hashtags = '#uzunyasa #sağlık #' + slug.split('-').slice(0,3).join(' #');
  
  return `
    <!-- BLOG SUMMARY - Auto-generated -->
    <div class="blog-summary" style="margin-top: 4rem; padding-top: 2rem; border-top: 2px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem;">
            <div style="width: 4px; height: 32px; background: linear-gradient(to bottom, #195157, #2a7d83); border-radius: 2px;"></div>
            <h2 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 1.75rem; color: #195157;">Özet</h2>
        </div>
        
        <blockquote style="margin: 0 0 1.5rem 0; padding: 1.5rem 2rem; background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%); border-left: 4px solid #195157; border-radius: 0 12px 12px 0; font-size: 1.1rem; line-height: 1.8; color: #374151; font-style: italic;">
            ${meta.description}
        </blockquote>
        
        <div style="margin-bottom: 1.5rem;">
            <p style="font-weight: 600; color: #195157; margin-bottom: 0.75rem; font-size: 0.95rem;">📌 Bu rehberde:</p>
            <ul style="list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem;">
                ${meta.keyPoints.map(p => `<li style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.95rem; color: #4b5563;"><span style="color: #10b981;">✓</span> ${p}</li>`).join('\n                ')}
            </ul>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            ${hashtags.split(' ').map(tag => `<span style="font-size: 0.8rem; color: #9ca3af;">${tag}</span>`).join('\n            ')}
        </div>
    </div>
    <!-- END BLOG SUMMARY -->
`;
}

// Generate visual info card HTML (for within blog content)
function generateInfoCard(meta, slug, imageNum) {
  return `
    <!-- VISUAL INFO CARD -->
    <figure class="visual-summary" style="margin: 2rem 0; text-align: center;">
        <a href="../../images/social/${slug}-slide${imageNum}.jpg" target="_blank" style="display: block;">
            <img src="../../images/social/${slug}-slide${imageNum}.jpg" 
                 alt="${meta.title} - Görsel Özet" 
                 style="width: 100%; max-width: 500px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        </a>
        <figcaption style="margin-top: 0.75rem; font-size: 0.85rem; color: #6b7280; font-style: italic;">
            📊 Görsel özet - büyütmek için tıklayın
        </figcaption>
    </figure>
    <!-- END VISUAL INFO CARD -->
`;
}

// Generate HTML for slides
function generateSlideHTML(meta, slideNum, slug, bgImages) {
  const baseStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1080px;
      font-family: 'Inter', -apple-system, sans-serif;
      color: white; position: relative;
    }
    .corner { position: absolute; width: 50px; height: 50px; border: 2px solid rgba(255,255,255,0.1); }
    .corner-tl { top: 24px; left: 24px; border-right: none; border-bottom: none; border-radius: 10px 0 0 0; }
    .corner-br { bottom: 24px; right: 24px; border-left: none; border-top: none; border-radius: 0 0 10px 0; }
    .dots { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); }
    .dot.active { width: 24px; border-radius: 4px; background: #D4A574; }
  `;

  const dots = [1,2,3,4].map(n => `<div class="dot${n === slideNum ? ' active' : ''}"></div>`).join('');
  
  const templates = {
    1: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(25,81,87,0.75) 0%, rgba(42,125,131,0.68) 100%), url('${bgImages[0]}') center/cover; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; }
.logo { position: absolute; top: 50px; font-size: 24px; font-weight: 600; text-shadow: 2px 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 8px; }
.icon { width: 100px; height: 100px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 28px; backdrop-filter: blur(16px); font-size: 48px; }
.divider { width: 50px; height: 3px; background: linear-gradient(90deg, transparent, #D4A574, transparent); margin-bottom: 20px; }
h1 { font-size: 58px; font-weight: 700; line-height: 1.15; margin-bottom: 20px; text-shadow: 2px 2px 12px rgba(0,0,0,0.4); max-width: 900px; }
.accent { color: #D4A574; display: block; }
.subtitle { font-size: 24px; opacity: 0.9; margin-bottom: 20px; text-shadow: 1px 1px 6px rgba(0,0,0,0.3); }
.tags { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.tag { font-size: 14px; padding: 8px 18px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15); border-radius: 100px; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<div class="logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c-1.5 2-3 4-3 7 0 3.5 2 6 3 8m0-15c1.5 2 3 4 3 7 0 3.5-2 6-3 8"/></svg> UzunYaşa</div>
<div class="icon">📖</div>
<div class="divider"></div>
<h1>${meta.title.length > 45 ? meta.title.substring(0, 45) + '<span class="accent">' + meta.title.substring(45) + '</span>' : meta.title}</h1>
<p class="subtitle">${meta.category}</p>
<div class="tags"><span class="tag">Bilimsel</span><span class="tag">Bağımsız</span><span class="tag">Türkçe</span></div>
<div class="dots">${dots}</div>
</body></html>`,

    2: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(25,81,87,0.72) 0%, rgba(42,125,131,0.65) 100%), url('${bgImages[1]}') center/cover; display: flex; flex-direction: column; justify-content: center; padding: 70px; }
.logo { position: absolute; top: 36px; left: 44px; font-size: 18px; text-shadow: 1px 1px 6px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; }
.page { position: absolute; top: 36px; right: 44px; font-size: 16px; opacity: 0.7; }
h2 { font-size: 40px; font-weight: 700; margin-bottom: 32px; color: #D4A574; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); }
.card { background: rgba(0,0,0,0.32); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 22px 28px; margin-bottom: 16px; display: flex; align-items: center; gap: 18px; }
.num { font-size: 24px; min-width: 40px; opacity: 0.8; }
.text { font-size: 22px; line-height: 1.4; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<div class="logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c-1.5 2-3 4-3 7 0 3.5 2 6 3 8m0-15c1.5 2 3 4 3 7 0 3.5-2 6-3 8"/></svg> UzunYaşa</div>
<div class="page">2/4</div>
<h2>📋 Bu Rehberde</h2>
${meta.keyPoints.slice(0,5).map((p,i) => `<div class="card"><span class="num">${i+1}.</span><span class="text">${p}</span></div>`).join('\n')}
<div class="dots">${dots}</div>
</body></html>`,

    3: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(91,33,182,0.75) 0%, rgba(124,58,237,0.68) 100%), url('${bgImages[2]}') center/cover; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 70px; text-align: center; }
.logo { position: absolute; top: 36px; left: 44px; font-size: 18px; text-shadow: 1px 1px 6px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px; }
.page { position: absolute; top: 36px; right: 44px; font-size: 16px; opacity: 0.7; }
h2 { font-size: 40px; font-weight: 700; margin-bottom: 32px; color: #fcd34d; text-shadow: 2px 2px 10px rgba(0,0,0,0.4); }
.box { background: rgba(0,0,0,0.32); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px 44px; max-width: 820px; }
.box p { font-size: 26px; line-height: 1.7; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<div class="logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c-1.5 2-3 4-3 7 0 3.5 2 6 3 8m0-15c1.5 2 3 4 3 7 0 3.5-2 6-3 8"/></svg> UzunYaşa</div>
<div class="page">3/4</div>
<h2>💡 Özet</h2>
<div class="box"><p>${meta.description.substring(0, 200)}${meta.description.length > 200 ? '...' : ''}</p></div>
<div class="dots">${dots}</div>
</body></html>`,

    4: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}
body { background: linear-gradient(135deg, rgba(25,81,87,0.72) 0%, rgba(42,125,131,0.65) 100%), url('${bgImages[3]}') center/cover; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 70px; text-align: center; }
h2 { font-size: 48px; font-weight: 700; margin-bottom: 16px; line-height: 1.2; text-shadow: 2px 2px 12px rgba(0,0,0,0.4); }
.accent { color: #D4A574; }
.sub { font-size: 24px; opacity: 0.9; margin-bottom: 36px; text-shadow: 1px 1px 6px rgba(0,0,0,0.3); }
.cta { background: #D4A574; color: white; font-size: 24px; font-weight: 700; padding: 20px 44px; border-radius: 50px; margin-bottom: 20px; box-shadow: 0 8px 32px rgba(212,165,116,0.4); }
.url { font-size: 18px; background: rgba(0,0,0,0.32); padding: 12px 24px; border-radius: 20px; backdrop-filter: blur(10px); }
.logo { position: absolute; bottom: 80px; font-size: 22px; font-weight: 600; text-shadow: 2px 2px 8px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 8px; }
</style></head><body>
<div class="corner corner-tl"></div><div class="corner corner-br"></div>
<h2>Detaylı rehber için<br><span class="accent">uzunyasa.com</span></h2>
<p class="sub">Bilimsel • Bağımsız • Türkçe</p>
<div class="cta">🔗 Bio'daki Link</div>
<div class="url">uzunyasa.com/blog/${slug}</div>
<div class="logo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c-1.5 2-3 4-3 7 0 3.5 2 6 3 8m0-15c1.5 2 3 4 3 7 0 3.5-2 6-3 8"/></svg> UzunYaşa</div>
<div class="dots">${dots}</div>
</body></html>`
  };
  
  return templates[slideNum];
}

// Inject summary into blog HTML (at the bottom, before </article> or </div class="content">)
function injectSummary(htmlContent, summaryHTML, infoCardHTML) {
  // Remove old injections if any
  let content = htmlContent
    .replace(/<!-- BLOG SUMMARY - Auto-generated -->[\s\S]*?<!-- END BLOG SUMMARY -->/g, '')
    .replace(/<!-- VISUAL INFO CARD -->[\s\S]*?<!-- END VISUAL INFO CARD -->/g, '')
    .replace(/<!-- SOCIAL MEDIA KIT - Auto-generated -->[\s\S]*?<!-- END SOCIAL MEDIA KIT -->/g, '');
  
  // Find the end of content div or article to inject summary
  const contentEndPatterns = [
    /(<div class="cta-box">)/i,  // Before CTA box if exists
    /(<\/div>\s*<\/article>)/i,   // End of article
    /(<footer)/i                  // Before footer
  ];
  
  for (const pattern of contentEndPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, `${summaryHTML}\n\n$1`);
      break;
    }
  }
  
  // Inject info card after first major section (after first h2's content)
  const h2Match = content.match(/(<h2[^>]*>[^<]+<\/h2>[\s\S]*?)((?=<h2)|(?=<div class="cta)|(?=<div class="blog-summary))/);
  if (h2Match && infoCardHTML) {
    // Find a good spot - after a paragraph following first h2
    const firstH2Section = h2Match[1];
    const paragraphs = firstH2Section.match(/<\/p>/g);
    if (paragraphs && paragraphs.length >= 2) {
      // Insert after second paragraph in first section
      let count = 0;
      content = content.replace(firstH2Section, firstH2Section.replace(/<\/p>/g, (match) => {
        count++;
        if (count === 2) {
          return match + '\n' + infoCardHTML;
        }
        return match;
      }));
    }
  }
  
  return content;
}

// Background images for different categories
const bgImageSets = {
  default: [
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1400',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400'
  ],
  surgery: [
    'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1400',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400'
  ],
  nutrition: [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1400',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400'
  ]
};

async function main() {
  const blogFiles = process.argv.slice(2);
  
  if (blogFiles.length === 0) {
    console.log('Usage: node generate-social-images.js [blog-file.html ...]');
    return;
  }
  
  console.log('🚀 Starting social media content generator...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  for (const blogFile of blogFiles) {
    const filePath = blogFile.startsWith('pages/') ? blogFile : `pages/blog/${blogFile}`;
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }
    
    const slug = path.basename(filePath, '.html');
    let htmlContent = fs.readFileSync(filePath, 'utf8');
    const meta = extractBlogMeta(htmlContent);
    
    console.log(`📝 Processing: ${slug}`);
    console.log(`   Title: ${meta.title}`);
    console.log(`   Category: ${meta.category}`);
    
    // Select background images based on category
    const bgImages = bgImageSets.default;
    
    // Ensure output directory exists
    const socialDir = path.join(process.cwd(), 'images/social');
    fs.mkdirSync(socialDir, { recursive: true });
    
    // Generate slides
    for (let i = 1; i <= 4; i++) {
      const slideHTML = generateSlideHTML(meta, i, slug, bgImages);
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1080 });
      await page.setContent(slideHTML, { waitUntil: 'networkidle0', timeout: 30000 });
      
      const outputPath = path.join(socialDir, `${slug}-slide${i}.jpg`);
      await page.screenshot({ path: outputPath, type: 'jpeg', quality: 92 });
      console.log(`   ✅ Slide ${i}: ${outputPath}`);
      
      await page.close();
    }
    
    // Generate summary section
    const summaryHTML = generateSummarySection(meta, slug);
    
    // Generate info card (using slide 3 - the summary/stats slide)
    const infoCardHTML = generateInfoCard(meta, slug, 3);
    
    // Inject into blog post
    const updatedHTML = injectSummary(htmlContent, summaryHTML, infoCardHTML);
    fs.writeFileSync(filePath, updatedHTML);
    console.log(`   ✅ Blog updated with summary section`);
    
    console.log(`   🎉 Done: ${slug}\n`);
  }
  
  await browser.close();
  console.log('✨ All done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
