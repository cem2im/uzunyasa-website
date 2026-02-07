#!/usr/bin/env node
/**
 * Social Media Image Generator for UzunYaşa
 * Generates Instagram carousel images from blog posts
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

// Generate HTML for each slide
function generateSlideHTML(meta, slideNum, slug) {
  const backgrounds = {
    health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200',
    nutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
    exercise: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
    medication: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200',
    surgery: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1200'
  };
  
  const bgUrl = backgrounds.health; // Default
  
  const templates = {
    1: `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1080px;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(25,81,87,0.75), rgba(42,125,131,0.65)), url('${bgUrl}') center/cover;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 80px; color: white; text-align: center;
}
.logo { font-size: 26px; margin-bottom: 50px; text-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
h1 { font-size: 68px; font-weight: 800; line-height: 1.2; margin-bottom: 40px; text-shadow: 3px 3px 15px rgba(0,0,0,0.5); }
.highlight { color: #F5A623; }
.subtitle { font-size: 30px; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); }
.swipe { position: absolute; bottom: 60px; font-size: 22px; background: rgba(0,0,0,0.3); padding: 12px 30px; border-radius: 25px; }
</style></head>
<body>
<div class="logo">🌿 UzunYaşa</div>
<h1>${meta.title.split(':')[0]}<br><span class="highlight">${meta.title.split(':')[1] || 'Rehber'}</span></h1>
<p class="subtitle">${meta.category}</p>
<div class="swipe">Kaydır →</div>
</body></html>`,

    2: `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1080px;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(25,81,87,0.7), rgba(42,125,131,0.6)), url('${bgUrl}') center/cover;
  display: flex; flex-direction: column; justify-content: center;
  padding: 80px; color: white;
}
.logo { position: absolute; top: 40px; left: 60px; font-size: 22px; text-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
h2 { font-size: 48px; font-weight: 700; margin-bottom: 40px; color: #F5A623; text-shadow: 3px 3px 12px rgba(0,0,0,0.5); }
.point { display: flex; align-items: center; margin-bottom: 25px; background: rgba(0,0,0,0.35); padding: 25px 35px; border-radius: 18px; font-size: 26px; backdrop-filter: blur(15px); }
.icon { font-size: 36px; margin-right: 20px; min-width: 50px; }
.swipe { position: absolute; bottom: 60px; right: 60px; font-size: 22px; background: rgba(0,0,0,0.3); padding: 12px 30px; border-radius: 25px; }
</style></head>
<body>
<div class="logo">🌿 UzunYaşa</div>
<h2>📋 İçerik</h2>
${meta.keyPoints.slice(0, 4).map((p, i) => `<div class="point"><span class="icon">${['1️⃣','2️⃣','3️⃣','4️⃣'][i]}</span><span>${p}</span></div>`).join('\n')}
<div class="swipe">Kaydır →</div>
</body></html>`,

    3: `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1080px;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(124,58,237,0.72), rgba(91,33,182,0.65)), url('${bgUrl}') center/cover;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 80px; color: white; text-align: center;
}
.logo { position: absolute; top: 40px; left: 60px; font-size: 22px; text-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
h2 { font-size: 48px; font-weight: 700; margin-bottom: 30px; color: #fcd34d; text-shadow: 3px 3px 12px rgba(0,0,0,0.5); }
.desc { font-size: 28px; max-width: 800px; line-height: 1.6; background: rgba(0,0,0,0.3); padding: 40px; border-radius: 25px; backdrop-filter: blur(15px); }
.swipe { position: absolute; bottom: 60px; font-size: 22px; background: rgba(0,0,0,0.3); padding: 12px 30px; border-radius: 25px; }
</style></head>
<body>
<div class="logo">🌿 UzunYaşa</div>
<h2>💡 Özet</h2>
<p class="desc">${meta.description.substring(0, 200)}...</p>
<div class="swipe">Kaydır →</div>
</body></html>`,

    4: `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1080px;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, rgba(25,81,87,0.7), rgba(42,125,131,0.6)), url('${bgUrl}') center/cover;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 80px; color: white; text-align: center;
}
h2 { font-size: 56px; font-weight: 700; margin-bottom: 30px; line-height: 1.3; text-shadow: 3px 3px 15px rgba(0,0,0,0.5); }
.highlight { color: #F5A623; }
p { font-size: 28px; margin-bottom: 50px; max-width: 750px; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); }
.cta { background: #F5A623; color: white; font-size: 28px; font-weight: 700; padding: 25px 60px; border-radius: 50px; margin-bottom: 30px; box-shadow: 0 10px 40px rgba(245,166,35,0.5); }
.website { font-size: 24px; background: rgba(0,0,0,0.35); padding: 15px 35px; border-radius: 30px; }
.logo { position: absolute; bottom: 50px; font-size: 28px; font-weight: 600; text-shadow: 2px 2px 8px rgba(0,0,0,0.5); }
</style></head>
<body>
<h2>Detaylı rehber için<br><span class="highlight">uzunyasa.com</span></h2>
<p>Tüm bilgiler, kaynaklar ve pratik öneriler</p>
<div class="cta">👆 Bio'daki linke tıkla</div>
<div class="website">uzunyasa.com/blog/${slug}</div>
<div class="logo">🌿 UzunYaşa</div>
</body></html>`
  };
  
  return templates[slideNum];
}

// Generate caption
function generateCaption(meta, slug) {
  return `📖 ${meta.title}

${meta.description}

📌 İçerik:
${meta.keyPoints.map(p => `• ${p}`).join('\n')}

👉 Detaylı rehber için bio'daki linke tıkla!
🔗 uzunyasa.com/blog/${slug}

#uzunyasa #sağlık #sağlıklıyaşam #türkiye #bilim #tıp #beslenme #diyet #kiloverme #obezite
`;
}

async function main() {
  const blogFiles = process.argv.slice(2);
  
  if (blogFiles.length === 0) {
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
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const meta = extractBlogMeta(htmlContent);
    
    console.log(`Processing: ${slug}`);
    console.log(`Title: ${meta.title}`);
    
    // Ensure output directories exist
    fs.mkdirSync('social/instagram', { recursive: true });
    fs.mkdirSync('images/blog', { recursive: true });
    
    // Generate slides
    for (let i = 1; i <= 4; i++) {
      const slideHTML = generateSlideHTML(meta, i, slug);
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1080 });
      await page.setContent(slideHTML, { waitUntil: 'networkidle0' });
      
      const outputPath = `social/instagram/${slug}-slide${i}.jpg`;
      await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
      console.log(`Generated: ${outputPath}`);
      
      await page.close();
    }
    
    // Copy slide 1 as blog featured image
    fs.copyFileSync(
      `social/instagram/${slug}-slide1.jpg`,
      `images/blog/${slug}-featured.jpg`
    );
    
    // Generate caption
    const caption = generateCaption(meta, slug);
    fs.writeFileSync(`social/instagram/${slug}-caption.txt`, caption);
    console.log(`Generated caption: social/instagram/${slug}-caption.txt`);
  }
  
  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
