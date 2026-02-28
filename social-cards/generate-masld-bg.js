#!/usr/bin/env node
/**
 * Generate background videos via Grok Imagine Video API for MASLD Reel
 * Themes: liver, endoscopy, medications, healthy living
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) { console.error('❌ XAI_API_KEY not set'); process.exit(1); }

const BACKGROUNDS = [
  {
    id: 'hook',
    prompt: 'Cinematic close-up of a 3D anatomical liver model with visible fat deposits glowing in orange, dark navy blue background, dramatic medical lighting, slow camera orbit around the organ, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'fact1',
    prompt: 'Aerial cinematic view of a busy Turkish city street with people walking, warm golden hour lighting, teal and dark blue color grading, slow drone-like camera movement, urban health concept, 9:16 vertical video, no text no watermark, no faces visible'
  },
  {
    id: 'fact2',
    prompt: 'Modern medical research laboratory with microscope slides and liver tissue samples, dark blue and teal lighting, glass petri dishes with biological specimens, slow camera dolly forward, scientific atmosphere, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'fact3',
    prompt: 'Person stepping on a modern digital weight scale, shot from above showing only feet and scale display, warm morning light streaming through window, healthy lifestyle aesthetic, slow zoom in on scale, 9:16 vertical video, no text no watermark, no face visible'
  },
  {
    id: 'fact4',
    prompt: 'Modern endoscopy equipment in a clean clinical room, medical monitors and flexible endoscope on sterile blue surface, soft teal and white lighting, slow cinematic camera pan across equipment, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'fact5',
    prompt: 'Pharmaceutical pills and modern medicine capsules arranged on dark reflective surface, orange and teal dramatic lighting, slow camera dolly across medications, premium pharmaceutical aesthetic, 9:16 vertical video, no text no watermark, no people no faces'
  },
  {
    id: 'summary',
    prompt: 'Abstract 3D visualization of a healthy liver transforming from fatty to clean, dark navy background with golden and teal particle effects, futuristic medical hologram aesthetic, slow rotation, 9:16 vertical video, no text no watermark, no people no faces'
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
  const outDir = path.resolve(__dirname, 'masld-backgrounds');
  fs.mkdirSync(outDir, { recursive: true });

  // Step 1: Submit all requests
  console.log('🎬 Submitting all MASLD background video requests...\n');
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
          console.log(`  ✅ ${job.id}: ready! (${res.video.duration || '?'}s)`);
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

  console.log('\n🎉 All MASLD backgrounds downloaded!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
