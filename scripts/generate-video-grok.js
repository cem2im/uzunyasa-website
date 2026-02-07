#!/usr/bin/env node
/**
 * Video Generator with Grok AI for UzunYaşa
 * Extracts impactful sentences from blog and generates promotional videos
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

// Extract impactful content from blog
function extractImpactfulContent(htmlContent, meta) {
  // Find statistics (numbers with %)
  const statsRegex = /%\d+|\d+%|\d+\s*milyon|\d+\s*bin|\d+\s*kat/gi;
  const stats = htmlContent.match(statsRegex) || [];
  
  // Find sentences with strong words
  const strongWords = ['önemli', 'kritik', 'tehlikeli', 'etkili', 'önlenebilir', 'şaşırtıcı', 'çarpıcı', 'gerçek', 'bilimsel'];
  const sentences = htmlContent
    .replace(/<[^>]+>/g, ' ')
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 100);
  
  const impactful = sentences.filter(s => 
    strongWords.some(w => s.toLowerCase().includes(w)) ||
    statsRegex.test(s)
  ).slice(0, 5);
  
  // Find key facts (sentences with numbers)
  const factsWithNumbers = sentences.filter(s => /\d+/.test(s)).slice(0, 3);
  
  return {
    title: meta.title,
    category: meta.category,
    stats: stats.slice(0, 3),
    impactfulSentences: impactful,
    facts: factsWithNumbers,
    description: meta.description
  };
}

// Generate video prompt based on content type
function generateVideoPrompt(content, style = 'impact') {
  const backgrounds = {
    health: 'serene nature scene with sunlight through trees, healthy lifestyle imagery',
    medical: 'clean modern hospital corridor, medical equipment soft focus',
    nutrition: 'fresh colorful vegetables and fruits on wooden table, soft lighting',
    exercise: 'sunrise over mountains, person silhouette doing yoga',
    turkish: 'Istanbul skyline time-lapse at golden hour, Bosphorus view',
    science: 'abstract DNA helix visualization, blue medical background',
    warning: 'dramatic clouds, storm clearing to sunshine'
  };
  
  // Select background based on category
  let bg = backgrounds.health;
  const cat = content.category.toLowerCase();
  if (cat.includes('beslenme') || cat.includes('diyet')) bg = backgrounds.nutrition;
  if (cat.includes('egzersiz')) bg = backgrounds.exercise;
  if (cat.includes('tedavi') || cat.includes('ilaç')) bg = backgrounds.medical;
  if (cat.includes('türkiye') || cat.includes('obezite')) bg = backgrounds.turkish;
  
  // Pick the most impactful sentence
  const mainMessage = content.impactfulSentences[0] || content.description.substring(0, 80);
  const stat = content.stats[0] || '';
  
  // Create structured prompt
  const prompt = `Cinematic promotional video, 5-8 seconds, smooth motion:

BACKGROUND: ${bg}, slow cinematic movement, dreamy soft focus

TEXT OVERLAY (Turkish, bold modern font, white with subtle shadow):
- Top small text: "${content.category}" with subtle icon
- Center LARGE text: "${stat ? stat + ' - ' : ''}${mainMessage.substring(0, 50)}"
- Bottom small text: "uzunyasa.com"

ANIMATION: 
- Background slowly zooms in
- Text fades in line by line (0.5s each)
- Subtle particle effect
- Professional, trustworthy medical aesthetic

COLOR SCHEME: Teal (#0D7377) accents, clean whites, soft greens

MOOD: Hopeful, informative, professional healthcare`;

  return prompt;
}

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
    category: categoryMatch ? categoryMatch[1].replace(/[🔬💊📊🏃‍♀️⚡🧠❤️🥗⚖⚠✨🌍😴]/g, '').trim() : 'Sağlık',
    keyPoints: points
  };
}

// Generate video with Grok API
async function generateGrokVideo(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'grok-imagine-video',
      prompt: prompt
    });

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: '/v1/videos/generations',
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
          if (json.request_id) {
            resolve({ requestId: json.request_id });
          } else if (json.video && json.video.url) {
            resolve({ url: json.video.url });
          } else {
            reject(new Error('Unexpected response: ' + body));
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

// Check video status
async function checkVideoStatus(requestId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: `/v1/videos/${requestId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.video && json.video.url) {
            resolve({ url: json.video.url, duration: json.video.duration });
          } else if (json.status === 'pending' || json.status === 'processing') {
            resolve({ url: null, status: json.status });
          } else {
            resolve({ url: null, raw: json });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Poll for video result
async function pollVideoResult(requestId, maxAttempts = 30) {
  console.log(`   ⏳ Video oluşturuluyor (${requestId})...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000));
    
    try {
      const result = await checkVideoStatus(requestId);
      if (result.url) {
        console.log(`   ✅ Video hazır! (${result.duration}s)`);
        return result.url;
      }
      process.stdout.write(`   ⏳ ${i + 1}/${maxAttempts}...\r`);
    } catch (e) {
      // Continue polling
    }
  }
  
  throw new Error('Video oluşturma zaman aşımı');
}

// Download video from URL
async function downloadVideo(url, outputPath) {
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

// Main function
async function main() {
  const blogFiles = process.argv.slice(2);
  
  if (blogFiles.length === 0) {
    console.log('🎬 UzunYaşa Video Generator (Grok AI)\n');
    console.log('Usage: node generate-video-grok.js [blog-file.html ...]');
    console.log('Example: node generate-video-grok.js glp1-tam-rehber.html');
    return;
  }
  
  console.log('🎬 UzunYaşa Video Generator başlatılıyor...\n');
  
  // Ensure output directory exists
  const videoDir = path.join(process.cwd(), 'videos/social');
  fs.mkdirSync(videoDir, { recursive: true });
  
  for (const blogFile of blogFiles) {
    const filePath = blogFile.startsWith('pages/') ? blogFile : `pages/blog/${blogFile}`;
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Dosya bulunamadı: ${filePath}`);
      continue;
    }
    
    const slug = path.basename(filePath, '.html');
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const meta = extractBlogMeta(htmlContent);
    
    console.log(`📝 İşleniyor: ${slug}`);
    console.log(`   Başlık: ${meta.title}`);
    console.log(`   Kategori: ${meta.category}`);
    
    // Extract impactful content
    const content = extractImpactfulContent(htmlContent, meta);
    console.log(`   📊 Bulunan istatistikler: ${content.stats.join(', ') || 'yok'}`);
    console.log(`   💬 Çarpıcı cümle: "${content.impactfulSentences[0]?.substring(0, 50) || meta.description.substring(0, 50)}..."`);
    
    // Generate prompt
    const prompt = generateVideoPrompt(content);
    console.log(`\n   🎨 Video Prompt:`);
    console.log(`   ${prompt.substring(0, 200)}...\n`);
    
    try {
      const result = await generateGrokVideo(prompt);
      
      let videoUrl;
      if (result.url) {
        videoUrl = result.url;
      } else if (result.requestId) {
        videoUrl = await pollVideoResult(result.requestId);
      }
      
      if (videoUrl) {
        const outputPath = path.join(videoDir, `${slug}.mp4`);
        await downloadVideo(videoUrl, outputPath);
        console.log(`   📁 Kaydedildi: ${outputPath}`);
      }
    } catch (err) {
      console.log(`   ❌ Hata: ${err.message}`);
    }
    
    console.log(`   🎉 Tamamlandı: ${slug}\n`);
  }
  
  console.log('✨ Tüm videolar oluşturuldu!');
}

main().catch(err => {
  console.error('Hata:', err);
  process.exit(1);
});
