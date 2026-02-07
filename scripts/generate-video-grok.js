#!/usr/bin/env node
/**
 * Video Generator with Grok AI for UzunYaşa
 * Generates promotional videos using xAI Grok API
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
    if (points.length < 3 && text.length < 50) points.push(text);
  }
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'Blog Yazısı',
    description: descMatch ? descMatch[1] : '',
    category: categoryMatch ? categoryMatch[1].replace(/[🔬💊📊🏃‍♀️⚡🧠❤️🥗⚖⚠✨]/g, '').trim() : 'Sağlık',
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
          console.log('   API Response:', JSON.stringify(json, null, 2));
          
          if (json.data && json.data[0] && json.data[0].url) {
            resolve({ url: json.data[0].url, requestId: null });
          } else if (json.request_id) {
            resolve({ url: null, requestId: json.request_id });
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

// Poll for video result
async function pollVideoResult(requestId, maxAttempts = 30) {
  console.log(`   ⏳ Polling for video (request_id: ${requestId})...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds between polls
    
    try {
      const result = await checkVideoStatus(requestId);
      if (result.url) {
        return result.url;
      }
      console.log(`   ⏳ Still processing... (${i + 1}/${maxAttempts})`);
    } catch (e) {
      console.log(`   ⚠️ Poll error: ${e.message}`);
    }
  }
  
  throw new Error('Video generation timed out');
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
          // Handle /v1/videos/{id} response format
          if (json.video && json.video.url) {
            resolve({ url: json.video.url, duration: json.video.duration });
          } else if (json.status === 'pending' || json.status === 'processing') {
            resolve({ url: null });
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

// Generate Turkish video prompt
function generateVideoPrompt(meta) {
  const title = meta.title;
  const category = meta.category;
  
  return `Profesyonel sağlık tanıtım videosu, ${category} konusu, "${title}" başlıklı içerik için, 
modern tıbbi görsellerle, yeşil-teal renk teması, sakin ve güven veren atmosfer, 
sağlıklı yaşam temalı görüntüler, doğa ve insan sağlığı birleşimi, 
cinematic kalite, 5-10 saniye, döngüsel (loop) yapılabilir`;
}

// Main function
async function main() {
  const blogFiles = process.argv.slice(2);
  
  if (blogFiles.length === 0) {
    console.log('Usage: node generate-video-grok.js [blog-file.html ...]');
    console.log('Example: node generate-video-grok.js glp1-tam-rehber.html');
    return;
  }
  
  console.log('🎬 Starting Grok AI video generator...\n');
  
  // Ensure output directory exists
  const videoDir = path.join(process.cwd(), 'videos/social');
  fs.mkdirSync(videoDir, { recursive: true });
  
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
    
    const prompt = generateVideoPrompt(meta);
    console.log(`   🎨 Generating video...`);
    console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
    
    try {
      const result = await generateGrokVideo(prompt);
      
      let videoUrl = result.url;
      
      // If we got a request_id, poll for the result
      if (!videoUrl && result.requestId) {
        videoUrl = await pollVideoResult(result.requestId);
      }
      
      if (videoUrl) {
        const outputPath = path.join(videoDir, `${slug}.mp4`);
        await downloadVideo(videoUrl, outputPath);
        console.log(`   ✅ Video saved: ${outputPath}`);
      } else {
        console.log(`   ⚠️ No video URL received`);
      }
    } catch (err) {
      console.log(`   ❌ Video failed: ${err.message}`);
    }
    
    console.log(`   🎉 Done: ${slug}\n`);
  }
  
  console.log('✨ All done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
