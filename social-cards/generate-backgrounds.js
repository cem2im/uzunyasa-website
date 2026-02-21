#!/usr/bin/env node
/**
 * Generate background videos via Grok Imagine Video API
 * Then download all results
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) { console.error('❌ XAI_API_KEY not set'); process.exit(1); }

const BACKGROUNDS = [
  {
    id: 'hook',
    prompt: 'Cinematic close-up of a single white pill on a dark reflective surface, dramatic lighting from above, golden warm tones, shallow depth of field, pharmaceutical aesthetic, slow camera dolly forward, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact1',
    prompt: 'Modern medical laboratory, glass vials and pills on clean white surface, soft blue and teal lighting, slow pan across medical equipment, cinematic depth of field, no people no faces, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact2',
    prompt: 'Person stepping on modern digital weight scale, shot from above showing only feet and scale, warm morning light from window, clean minimalist bathroom, slow motion, no face visible, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact3',
    prompt: 'Side by side: a single white pill and a medical syringe on marble surface, golden hour lighting, camera slowly zooming into the pill, clean medical aesthetic, no people, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact4',
    prompt: 'Official medical documents and research papers on a desk, FDA approval stamp visible, stethoscope nearby, warm office lighting, slow camera pan, professional medical office setting, no people, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact5',
    prompt: 'Modern pharmacy shelves with medicine boxes, clean bright lighting, camera dolly along the aisle, American drugstore aesthetic, no people no faces, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'summary',
    prompt: 'Abstract 3D DNA double helix rotating slowly, dark blue and teal background with golden particle effects, futuristic medical visualization, cinematic lighting, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'cta',
    prompt: 'Elegant dark teal background with floating golden bokeh particles, slow motion, warm and inviting atmosphere, cinematic depth of field, premium luxury aesthetic, 9:16 vertical video, no text no watermark'
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
  const outDir = path.resolve(__dirname, 'backgrounds');
  fs.mkdirSync(outDir, { recursive: true });

  // Step 1: Submit all requests
  console.log('🎬 Submitting all background video requests...\n');
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

  console.log('\n🎉 All backgrounds downloaded!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
