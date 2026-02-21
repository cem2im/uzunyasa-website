const fs = require('fs');
const path = require('path');

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) { console.error('❌ XAI_API_KEY gerekli'); process.exit(1); }

const PROMPTS = [
  'cinematic close-up of a person measuring waist with tape, soft warm lighting, fitness studio, shallow depth of field, no text no watermark, no faces',
  'cinematic slow motion of molecular biology 3D visualization showing protein structures and cell membranes, dark blue and orange color scheme, no text no watermark, no people no faces',
  'cinematic macro shot of fat tissue cells under microscope, glowing orange and blue, scientific visualization, no text no watermark, no people no faces',
  'cinematic slow motion of healthy meal preparation with lean protein chicken breast and vegetables, warm kitchen lighting, no text no watermark, no faces',
  'cinematic close-up of protein powder being scooped with measuring scoop, gym lighting, bokeh background, no text no watermark, no faces',
  'cinematic slow motion of weight training dumbbell curl, moody gym lighting with orange highlights, no text no watermark, no faces shown',
  'cinematic DNA double helix rotating with orange and teal glow particles, dark background, scientific visualization, no text no watermark, no people no faces',
  'cinematic abstract dark background with floating orange and teal bokeh light particles, elegant and minimal, no text no watermark, no people no faces'
];

const NAMES = ['hook', 'fact1', 'fact2', 'fact3', 'fact4', 'fact5', 'summary', 'cta'];
const outDir = path.resolve(__dirname, 'backgrounds-if');
fs.mkdirSync(outDir, { recursive: true });

async function submitVideo(prompt) {
  const res = await fetch('https://api.x.ai/v1/videos/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${XAI_API_KEY}` },
    body: JSON.stringify({ model: 'grok-imagine-video', prompt, response_format: 'url', n: 1 })
  });
  const data = await res.json();
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
    if (data.error) throw new Error(`Video failed: ${requestId} - ${data.error}`);
    process.stdout.write('.');
  }
}

async function downloadVideo(url, filePath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filePath, buffer);
}

(async () => {
  console.log('🎬 Submitting 8 background videos to Grok...');

  // Submit all in parallel
  const jobs = await Promise.all(PROMPTS.map(async (prompt, i) => {
    const id = await submitVideo(prompt);
    console.log(`📤 ${NAMES[i]}: submitted (${id})`);
    return { name: NAMES[i], id };
  }));

  // Poll all in parallel
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
