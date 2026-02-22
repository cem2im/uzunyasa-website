const fs = require('fs');
const path = require('path');

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) { console.error('❌ XAI_API_KEY gerekli'); process.exit(1); }

const PROMPTS = [
  // hook: AI + brain dramatic
  'cinematic futuristic AI brain neural network with glowing blue and orange synapses, dark background, deep space feel, volumetric lighting, no text no watermark, no people no faces',
  // fact1: data scanning / discovery
  'cinematic 3D visualization of massive data streams and floating molecular structures being scanned by light beams, dark teal and orange color scheme, no text no watermark, no people no faces',
  // fact2: medicine / drug discovery
  'cinematic close-up of glowing pharmaceutical molecules and drug compounds floating in dark liquid, orange and blue bioluminescent lighting, no text no watermark, no people no faces',
  // fact3: laboratory / dual purpose
  'cinematic modern AI laboratory with holographic displays showing molecular structures and health data, dark futuristic setting with teal accent lights, no text no watermark, no people no faces',
  // fact4: aging clock / biological age
  'cinematic abstract visualization of a biological clock with DNA strands spiraling around clock hands, glowing orange and deep blue, ethereal atmosphere, no text no watermark, no people no faces',
  // fact5: cell reprogramming / rejuvenation
  'cinematic microscopic view of human cells being rejuvenated with glowing energy particles, transformation from old to young cell, blue and gold colors, no text no watermark, no people no faces',
  // summary: AI + longevity fusion
  'cinematic abstract DNA double helix merging with AI circuit patterns, glowing orange and teal particles, dark cosmic background, no text no watermark, no people no faces',
  // cta: elegant brand background
  'cinematic abstract dark background with floating orange and teal bokeh light particles, elegant and minimal, slow motion dust particles, no text no watermark, no people no faces'
];

const NAMES = ['hook', 'fact1', 'fact2', 'fact3', 'fact4', 'fact5', 'summary', 'cta'];
const outDir = path.resolve(__dirname, 'backgrounds-ai-longevity');
fs.mkdirSync(outDir, { recursive: true });

async function submitVideo(prompt) {
  const res = await fetch('https://api.x.ai/v1/videos/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${XAI_API_KEY}` },
    body: JSON.stringify({ model: 'grok-imagine-video', prompt, response_format: 'url', n: 1 })
  });
  const data = await res.json();
  if (!data.request_id) { console.error('Submit error:', JSON.stringify(data)); throw new Error('No request_id'); }
  return data.request_id;
}

async function pollVideo(requestId) {
  while (true) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(`https://api.x.ai/v1/videos/${requestId}`, {
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}` }
    });
    const data = await res.json();
    if (data.video?.url) return data.video.url;
    if (data.data?.video?.url) return data.data.video.url;
    if (data.error) throw new Error(`Video failed: ${requestId} - ${JSON.stringify(data.error)}`);
    process.stdout.write('.');
  }
}

async function downloadVideo(url, filePath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

(async () => {
  console.log('🎬 Submitting 8 background videos to Grok Imagine Video...');

  const jobs = await Promise.all(PROMPTS.map(async (prompt, i) => {
    const id = await submitVideo(prompt);
    console.log(`📤 ${NAMES[i]}: submitted (${id})`);
    return { name: NAMES[i], id };
  }));

  console.log('\n⏳ Waiting for renders...');
  const results = await Promise.all(jobs.map(async (job) => {
    const url = await pollVideo(job.id);
    const filePath = path.join(outDir, `${job.name}.mp4`);
    await downloadVideo(url, filePath);
    console.log(`\n✅ ${job.name}: done`);
    return filePath;
  }));

  console.log(`\n🎬 All 8 backgrounds saved to ${outDir}/`);
})();
