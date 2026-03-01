#!/usr/bin/env node
/**
 * Generate background videos via Grok Imagine Video API for Hipertansiyon Reel
 * Themes: heartbeat, salt, vegetables/fruit, running/exercise, blood pressure monitor, healthy food
 * ⚠️ NO pharmacy/medicine/pill imagery — lifestyle only
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) { console.error('❌ XAI_API_KEY not set'); process.exit(1); }

const BACKGROUNDS = [
  {
    id: 'hook',
    prompt: 'Cinematic close-up of a digital blood pressure monitor showing high reading numbers on dark background, dramatic red and blue lighting, heart rate line animation, medical device on clean surface, slow camera dolly, 9:16 vertical video, no text no watermark, no people no faces, no pills no medicine'
  },
  {
    id: 'fact1',
    prompt: 'Cinematic overhead shot of large pile of white salt crystals being poured slowly on dark surface, dramatic side lighting creating sparkle effects, macro close-up showing individual salt grains, dark moody atmosphere, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'fact2',
    prompt: 'Beautiful arrangement of fresh colorful vegetables and fruits on dark wooden table - tomatoes, spinach, berries, bananas, avocados - DASH diet Mediterranean food, cinematic food photography with warm golden lighting, slow camera reveal, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'fact3',
    prompt: 'Cinematic slow-motion shot of running shoes hitting a park trail at sunrise, morning jog on nature path, golden hour lighting filtering through trees, healthy active lifestyle, ground-level camera angle, 9:16 vertical video, no text no watermark, no faces visible'
  },
  {
    id: 'fact4',
    prompt: 'Cinematic close-up of a stethoscope and blood pressure cuff on clean clinical white surface, soft blue and teal medical lighting, professional healthcare monitoring equipment, slow camera movement, 9:16 vertical video, no text no watermark, no people no faces, no pills no pharmacy'
  },
  {
    id: 'fact5',
    prompt: 'Abstract world map visualization with glowing teal connection lines and data points spreading across continents, dark background with golden particle effects, global health program visualization, futuristic data network, slow animation, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'summary',
    prompt: 'Cinematic abstract 3D heart beating slowly with healthy red glow, surrounded by flowing teal energy particles on dark navy background, golden light rays emanating from the heart, healthy cardiovascular visualization, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'cta',
    prompt: 'Elegant dark teal background with floating golden bokeh particles representing health and longevity, soft warm atmosphere, premium aesthetic with slow-motion light rays, 9:16 vertical video, no text no watermark, no people no faces'
  }
];

function apiRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.x.ai', port: 443, path: apiPath, method,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    
    const req = https.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch(e) { reject(new Error(`Parse error: ${buf.substring(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, res2 => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', reject);
  });
}

async function main() {
  const outDir = path.resolve(__dirname, 'hipertansiyon-backgrounds');
  fs.mkdirSync(outDir, { recursive: true });

  // Step 1: Submit all requests
  console.log('🎬 Submitting all Hipertansiyon background video requests...\n');
  const jobs = [];
  
  for (const bg of BACKGROUNDS) {
    console.log(`  📤 ${bg.id}: submitting...`);
    try {
      const res = await apiRequest('POST', '/v1/videos/generations', {
        model: 'grok-imagine-video',
        prompt: bg.prompt,
        duration: 5,
        aspect_ratio: '9:16',
        resolution: '720p'
      });
      
      if (res.request_id) {
        console.log(`  ✅ ${bg.id}: request_id=${res.request_id}`);
        jobs.push({ id: bg.id, requestId: res.request_id, done: false, url: null });
      } else if (res.video?.url) {
        console.log(`  ✅ ${bg.id}: immediate result`);
        jobs.push({ id: bg.id, requestId: null, done: true, url: res.video.url });
      } else {
        console.log(`  ❌ ${bg.id}: unexpected response:`, JSON.stringify(res).substring(0, 200));
      }
    } catch (e) {
      console.log(`  ❌ ${bg.id}: ${e.message}`);
    }
  }

  console.log(`\n📊 ${jobs.length}/${BACKGROUNDS.length} requests submitted\n`);

  // Step 2: Poll all pending jobs
  const maxPolls = 60;
  for (let i = 0; i < maxPolls; i++) {
    const pending = jobs.filter(j => !j.done);
    if (pending.length === 0) break;
    
    await new Promise(r => setTimeout(r, 5000));
    
    for (const job of pending) {
      try {
        const res = await apiRequest('GET', `/v1/videos/${job.requestId}`, null);
        if (res.video?.url) {
          job.done = true;
          job.url = res.video.url;
          console.log(`  ✅ ${job.id}: ready!`);
        }
      } catch (e) { /* continue */ }
    }
    
    const doneCount = jobs.filter(j => j.done).length;
    process.stdout.write(`  ⏳ Poll ${i+1}: ${doneCount}/${jobs.length} done\r`);
  }

  console.log('\n');

  // Step 3: Download all
  for (const job of jobs) {
    if (job.url) {
      const dest = path.join(outDir, `${job.id}.mp4`);
      console.log(`  📥 Downloading ${job.id}...`);
      await download(job.url, dest);
      console.log(`  ✅ ${dest}`);
    } else {
      console.log(`  ⚠️ ${job.id}: no video available`);
    }
  }

  console.log('\n🎉 All Hipertansiyon backgrounds downloaded!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
