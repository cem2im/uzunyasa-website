#!/usr/bin/env node
/**
 * Generate Supplement Tier List background videos via Grok Imagine Video API
 * Theme: supplement capsules, vitamins, laboratory, money/budget, trash bin (tier F)
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) { console.error('❌ XAI_API_KEY not set'); process.exit(1); }

const BACKGROUNDS = [
  {
    id: 'hook',
    prompt: 'Cinematic close-up of colorful supplement pills and money bills scattered on dark reflective surface, dramatic golden lighting, shallow depth of field, slow camera dolly forward revealing waste bin in background, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'fact1',
    prompt: 'Premium golden supplement capsules on clean white laboratory surface, scientific research papers in soft focus, warm golden hour lighting, slow camera pan over Omega-3, Vitamin D bottles with gold tier aesthetic, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'fact2',
    prompt: 'Modern laboratory with silver-tier supplements: probiotics, zinc, B12 bottles on clean medical counter, soft blue-white lighting, microscope and test tubes in background, slow camera movement, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'fact3',
    prompt: 'Bronze-tier supplements with amber lighting: NMN, curcumin, berberine, collagen powder containers on wooden laboratory bench, test tubes with animal research papers scattered around, warm bronze glow, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'fact4',
    prompt: 'Dramatic red lighting scene: supplement bottles being swept into trash bin, detox teas and fat burners falling into waste basket, alkaline water bottles tumbling, warning red glow, slow motion destruction, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'fact5',
    prompt: 'Turkish Lira bills (500 TL) arranged around three premium supplement bottles: Vitamin D, Omega-3, Magnesium on marble surface, calculator and budget spreadsheet visible, warm financial planning lighting, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'summary',
    prompt: 'Split screen comparison: scientific research papers with peer review stamps vs flashy marketing advertisements, microscope on one side, colorful ads on other, truth vs marketing concept, cinematic lighting, 9:16 vertical, no text no watermark no people no faces'
  },
  {
    id: 'cta',
    prompt: 'Elegant dark teal background with floating golden supplement capsules and scientific molecule structures, soft bokeh particles, premium healthcare aesthetic, warm inviting atmosphere with UzunYasa brand colors, 9:16 vertical, no text no watermark no people no faces'
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
  const outDir = path.resolve(__dirname, 'supplement-backgrounds');
  fs.mkdirSync(outDir, { recursive: true });

  // Step 1: Submit all requests
  console.log('💊 Submitting all supplement tier list background video requests...\n');
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

  console.log('\n🎉 All supplement tier list backgrounds downloaded!');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });