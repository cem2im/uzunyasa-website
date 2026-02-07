#!/usr/bin/env node
/**
 * Social Media Generator with Grok AI Images (Turkish)
 * Generates Instagram carousel images using xAI Grok API
 */

const path = require('path');
const fs = require('fs');
const https = require('https');

// Config - API key must be set via environment variable
const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) {
  console.error('❌ XAI_API_KEY environment variable not set');
  console.error('   Run: export XAI_API_KEY=your-key-here');
  process.exit(1);
}
const repoRoot = path.resolve(__dirname, '..');
process.chdir(repoRoot);

// Blog post metadata extractor
function extractBlogMeta(htmlContent) {
  const titleMatch = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const descMatch = htmlContent.match(/<meta name="description" content="([^"]+)"/);
  const categoryMatch = htmlContent.match(/class="post-category[^"]*">([^<]+)</);
  
  const points = [];
  const h2Matches = htmlContent.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g);
  for (const match of h2Matches) {
    const text = match[1].trim();
    if (points.length < 5 && text.length < 60) points.push(text);
  }
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'Blog Yazısı',
    description: descMatch ? descMatch[1] : '',
    category: categoryMatch ? categoryMatch[1].replace(/[🔬💊📊🏃‍♀️⚡🧠❤️🥗⚖⚠✨]/g, '').trim() : 'Sağlık',
    keyPoints: points
  };
}

// Generate image with Grok API
async function generateGrokImage(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'grok-imagine-image-pro',
      prompt: prompt,
      n: 1
    });

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.data && json.data[0] && json.data[0].url) {
            resolve(json.data[0].url);
          } else {
            reject(new Error('No image URL in response: ' + body));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Download image from URL
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

// Generate Turkish prompts for each slide
function generatePrompts(meta) {
  const title = meta.title;
  const category = meta.category;
  const points = meta.keyPoints.slice(0, 4).join(', ');
  
  return {
    slide1: `Modern Instagram carousel kapak görseli, TÜRKÇE başlık: "${title}", UzunYaşa logosu üstte, yeşil-teal gradient arka plan, profesyonel sağlık temalı, minimalist tasarım, 1080x1080 kare format, büyük ve okunaklı Türkçe yazı`,
    
    slide2: `Sağlık infografiği, TÜRKÇE içerik listesi başlık "Bu Rehberde:", maddeler: ${points}, teal ve beyaz renk şeması, numaralı liste görünümü, modern minimalist tasarım, 1080x1080 kare`,
    
    slide3: `Özet infografiği, TÜRKÇE "Özet" başlığı, mor-teal gradient arka plan, bilgilendirici sağlık içeriği, modern tıbbi illüstrasyon stili, 1080x1080 kare format`,
    
    slide4: `Call-to-action Instagram slide, TÜRKÇE metin "Detaylı rehber için uzunyasa.com", "Bio'daki Link" butonu, teal gradient arka plan, UzunYaşa branding, 1080x1080 kare format`
  };
}

// Main function
async function main() {
  const blogFiles = process.argv.slice(2);
  
  if (blogFiles.length === 0) {
    console.log('Usage: node generate-social-grok.js [blog-file.html ...]');
    console.log('Example: node generate-social-grok.js glp1-tam-rehber.html');
    return;
  }
  
  console.log('🚀 Starting Grok AI social media generator...\n');
  
  // Ensure output directory exists
  const socialDir = path.join(process.cwd(), 'images/social-grok');
  fs.mkdirSync(socialDir, { recursive: true });
  
  for (const blogFile of blogFiles) {
    const filePath = blogFile.startsWith('pages/') ? blogFile : `pages/blog/${blogFile}`;
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }
    
    const slug = path.basename(filePath, '.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const meta = extractBlogMeta(htmlContent);
    
    console.log(`📝 Processing: ${slug}`);
    console.log(`   Title: ${meta.title}`);
    console.log(`   Category: ${meta.category}`);
    
    const prompts = generatePrompts(meta);
    
    // Generate all 4 slides
    for (let i = 1; i <= 4; i++) {
      const promptKey = `slide${i}`;
      console.log(`   🎨 Generating slide ${i}...`);
      
      try {
        const imageUrl = await generateGrokImage(prompts[promptKey]);
        const outputPath = path.join(socialDir, `${slug}-slide${i}.jpg`);
        await downloadImage(imageUrl, outputPath);
        console.log(`   ✅ Slide ${i}: ${outputPath}`);
      } catch (err) {
        console.log(`   ❌ Slide ${i} failed: ${err.message}`);
      }
      
      // Rate limiting - wait 2 seconds between requests
      await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log(`   🎉 Done: ${slug}\n`);
  }
  
  console.log('✨ All done!');
  console.log(`📁 Images saved to: ${socialDir}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
