#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) { console.error('❌ XAI_API_KEY not set'); process.exit(1); }

const BACKGROUNDS = [
  {
    id: 'slide1',
    prompt: 'Abstract futuristic neural network visualization, glowing blue and teal synapses connecting in 3D space, dark background with floating light particles, slow camera rotation, cinematic sci-fi aesthetic, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'slide2',
    prompt: 'Cinematic close-up of transparent pharmaceutical capsules and molecular structures floating in dark blue liquid, golden light refractions, slow motion, medical research lab aesthetic, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'slide3',
    prompt: 'Futuristic medical scanning interface, holographic body scan with data streams, dark room with blue and teal ambient lighting, slow camera dolly, high-tech hospital aesthetic, no people visible, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'slide4',
    prompt: 'Abstract timeline visualization with glowing nodes connected by light trails, moving through dark space, teal and golden particle effects, slow camera fly-through, futuristic data visualization, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'slide5',
    prompt: 'Elegant dark blue and teal background with floating golden bokeh particles and subtle DNA helix silhouette, slow motion, warm and premium atmosphere, cinematic depth of field, 9:16 vertical video, no text no watermark'
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
  const outDir = path.join(__dirname, 'backgrounds');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('🎬 Submitting 5 background video requests...\n');
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
        console.log(`  ✅ ${bg.id}: immediate`);
        jobs.push({ id: bg.id, requestId: null, done: true, url: res.video.url });
      } else {
        console.log(`  ❌ ${bg.id}:`, JSON.stringify(res).substring(0, 200));
      }
    } catch (e) {
      console.log(`  ❌ ${bg.id}: ${e.message}`);
    }
  }

  console.log(`\n📊 ${jobs.length}/${BACKGROUNDS.length} submitted\n`);

  // Poll
  for (let i = 0; i < 60; i++) {
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

  console.log('\n\n📥 Downloading...');
  for (const job of jobs) {
    if (job.url) {
      const dest = path.join(outDir, `${job.id}.mp4`);
      await download(job.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`  ✅ ${job.id}.mp4 (${(size/1024/1024).toFixed(1)}MB)`);
    } else {
      console.log(`  ⚠️ ${job.id}: no video`);
    }
  }
  console.log('\n🎉 Done!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
