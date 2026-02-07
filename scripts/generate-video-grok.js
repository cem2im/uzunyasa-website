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
  // Remove style, script, and head tags first
  const cleanHtml = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  
  // Get just the text content
  const textContent = cleanHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Find statistics (numbers with %)
  const statsRegex = /%\d+|\d+%/g;
  const stats = textContent.match(statsRegex) || [];
  // Filter out CSS-like values
  const realStats = stats.filter(s => !s.includes('100%'));
  
  // Find sentences with strong words
  const strongWords = ['önemli', 'kritik', 'tehlikeli', 'etkili', 'önlenebilir', 'şaşırtıcı', 'çarpıcı', 'gerçek', 'bilimsel', 'araştırma'];
  const sentences = textContent
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 120 && !s.includes('{') && !s.includes(':'));
  
  const impactful = sentences.filter(s => 
    strongWords.some(w => s.toLowerCase().includes(w)) ||
    /\d+%/.test(s)
  ).slice(0, 5);
  
  return {
    title: meta.title,
    category: meta.category,
    stats: realStats.slice(0, 3),
    impactfulSentences: impactful.length > 0 ? impactful : [meta.description],
    description: meta.description
  };
}

// Generate video prompt based on content type - STRUCTURED FORMAT
async function generateVideoPrompt(content, style = 'impact') {
  const backgrounds = {
    health: 'serene nature scene with sunlight through trees, healthy lifestyle imagery',
    medical: 'clean modern hospital corridor, soft medical lighting',
    nutrition: 'fresh colorful vegetables and fruits on wooden table, soft lighting',
    exercise: 'sunrise over mountains, person silhouette doing yoga',
    turkish: 'Turkish cityscape time-lapse at sunset, Istanbul Bosphorus view',
    science: 'abstract DNA helix visualization, blue medical background',
    lifestyle: 'cozy morning scene, warm sunlight through window'
  };
  
  // Select background based on category
  let bg = backgrounds.health;
  const cat = content.category.toLowerCase();
  if (cat.includes('beslenme') || cat.includes('diyet')) bg = backgrounds.nutrition;
  if (cat.includes('egzersiz')) bg = backgrounds.exercise;
  if (cat.includes('tedavi') || cat.includes('ilaç') || cat.includes('glp')) bg = backgrounds.medical;
  if (cat.includes('türkiye') || cat.includes('obezite') || cat.includes('epidemiyoloji')) bg = backgrounds.turkish;
  if (cat.includes('uyku') || cat.includes('yaşam')) bg = backgrounds.lifestyle;
  
  // INFORMATIVE STYLE - Factual, viral-worthy
  
  // Top: Category/Topic with emoji
  const categoryEmojis = {
    beslenme: '🥗',
    diyet: '🥗', 
    egzersiz: '🏃',
    tedavi: '💊',
    ilaç: '💊',
    glp: '💉',
    uyku: '😴',
    yaşam: '🌿',
    obezite: '⚖️',
    kalp: '❤️',
    default: '📊'
  };
  
  let emoji = categoryEmojis.default;
  const catLower = content.category.toLowerCase();
  for (const [key, val] of Object.entries(categoryEmojis)) {
    if (catLower.includes(key)) { emoji = val; break; }
  }
  
  // Short topic name (max 3 words)
  const topText = content.title.split(':')[0].split(' ').slice(0, 3).join(' ') + ' ' + emoji;
  
  // Main message - AI-generated punchy summary (3-5 words)
  const keyFacts = content.impactfulSentences.slice(0, 2).join(' ') + 
                   (content.stats.length > 0 ? ` İstatistikler: ${content.stats.join(', ')}` : '');
  
  const mainMsg = await generatePunchySummary(content.title, content.description, keyFacts);
  console.log(`   💬 AI Özet: "${mainMsg}"`);
  
  // Bottom: Credibility statement
  const credibility = [
    'Bilim kanıtladı.',
    'Araştırmalar gösteriyor.',
    'Uzmanlar öyle diyor.',
    'Klinik veriler.',
    'Gerçek bu.'
  ];
  const cta = credibility[Math.floor(Math.random() * credibility.length)];
  
  // STRUCTURED PROMPT - INFORMATIVE STYLE
  const prompt = `Vertical video for Instagram Stories.
Background: ${bg}
Top text: "${topText}" - small white, elegant
Center text LARGE: "${mainMsg}" - big bold white uppercase, impactful
Bottom text: "${cta}" - white italic, subtle
Animation: Smooth fade in, professional
Style: Educational, trustworthy, clean medical aesthetic`;

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

// Generate punchy summary using Grok Chat
async function generatePunchySummary(title, description, keyFacts) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir viral içerik uzmanısın. Blog içeriğinden EN ÇARPİCI bilgiyi 3-5 kelimeyle özetle. Sadece özeti yaz, başka bir şey yazma. Büyük harf kullan. Örnek: KALP RİSKİ %30 DÜŞÜYOR'
        },
        {
          role: 'user',
          content: `Blog: ${title}\nAçıklama: ${description}\nÖnemli bilgiler: ${keyFacts}`
        }
      ]
    });

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: '/v1/chat/completions',
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
          const summary = json.choices?.[0]?.message?.content || title.toUpperCase();
          resolve(summary.trim());
        } catch (e) {
          resolve(title.toUpperCase());
        }
      });
    });

    req.on('error', () => resolve(title.toUpperCase()));
    req.write(data);
    req.end();
  });
}

// Generate video with Grok API - with format options
async function generateGrokVideo(prompt, options = {}) {
  const duration = options.duration || 5;
  const aspectRatio = options.aspectRatio || '9:16'; // Story format default
  const resolution = options.resolution || '720p';
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'grok-imagine-video',
      prompt: prompt,
      duration: duration,
      aspect_ratio: aspectRatio,
      resolution: resolution
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
    const prompt = await generateVideoPrompt(content);
    console.log(`\n   🎨 Video Prompt:`);
    console.log(`   ${prompt.substring(0, 200)}...\n`);
    
    try {
      // Story format: 9:16, 5 seconds, 720p
      const result = await generateGrokVideo(prompt, {
        duration: 5,
        aspectRatio: '9:16',
        resolution: '720p'
      });
      
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
