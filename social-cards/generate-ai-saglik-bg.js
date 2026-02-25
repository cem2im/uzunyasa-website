#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) { console.error('❌ XAI_API_KEY not set'); process.exit(1); }

const BACKGROUNDS = [
  {
    id: 'hook',
    prompt: 'Abstract futuristic neural network visualization, glowing blue and teal synapses connecting in 3D space, dark background with floating light particles, slow camera rotation, cinematic sci-fi aesthetic, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact1',
    prompt: 'Cinematic close-up of transparent pharmaceutical capsules and molecular structures floating in dark blue liquid, golden light refractions, slow motion, medical research lab aesthetic, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact2',
    prompt: 'Futuristic medical scanning interface with holographic data streams flowing across dark room, blue and teal ambient lighting, slow camera dolly, high-tech hospital aesthetic, no people visible, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact3',
    prompt: 'Cinematic visualization of a glowing human heart and lungs hologram rotating slowly in dark space, teal and red neon highlights, medical imaging aesthetic, particles floating, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact4',
    prompt: 'Abstract 3D human body wireframe model rotating slowly, blue grid lines on dark background, digital twin visualization, floating data particles, sci-fi medical hologram, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'fact5',
    prompt: 'Cinematic close-up of DNA double helix rotating with golden particle effects, mRNA strand visualization, dark blue background with bokeh lights, futuristic biotechnology, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'summary',
    prompt: 'Abstract 3D visualization of interconnected medical icons and data flowing through neural pathways, dark teal background, golden highlights, slow camera flythrough, futuristic medical AI aesthetic, 9:16 vertical video, no text no watermark'
  },
  {
    id: 'cta',
    prompt: 'Elegant dark teal background with floating golden bokeh particles and soft light rays, slow motion, warm inviting premium atmosphere, cinematic depth of field, 9:16 vertical video, no text no watermark'
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
  const outDir = path.join(__dirname, 'ai-saglik-bg');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('🎬 Submitting 8 AI background video requests...\n');
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
        console.log(`  ❌ ${bg.id}:`, JSON.stringify(res).substring(0, 300));
      }
    } catch (e) {
      console.log(`  ❌ ${bg.id}: ${e.message}`);
    }
  }

  console.log(`\n📊 ${jobs.length}/${BACKGROUNDS.length} submitted. Polling...\n`);

  for (let i = 0; i < 120; i++) {
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
    if (i % 6 === 0) console.log(`  ⏳ Poll ${i+1}: ${doneCount}/${jobs.length} done`);
  }

  console.log('\n📥 Downloading...');
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
