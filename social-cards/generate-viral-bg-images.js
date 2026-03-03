const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;

const REELS = {
  yalnizlik: [
    "Dark moody photograph of a single person walking alone on an empty rainy city street at night, blue neon reflections, cinematic, no text no letters",
    "Abstract dark red organic particles flowing in black space, scientific visualization, no text",
    "Three silhouettes standing apart from each other, dark blue atmospheric, loneliness concept, no text",
    "Medical visualization of inflammation in blood vessels, dark background with red glowing veins, no text",
    "Warm photograph of friends gathering around a table, golden candlelight, community connection, no text",
    "Abstract flowing teal and dark blue liquid, smooth organic shapes, peaceful, no text"
  ],
  adim: [
    "Aerial photograph of a massive crowd walking in a busy city intersection, thousands of people, cinematic, no text",
    "Vintage 1960s Japanese advertisement aesthetic, retro pedometer device, sepia tones, no text",
    "Abstract green data visualization chart going upward on dark background, scientific, no text",
    "Person walking alone on a beautiful forest path, golden hour sunlight filtering through trees, no text",
    "Bold red X and green checkmark on dark background, comparison concept, minimalist, no text",
    "Beautiful sunrise over a peaceful walking trail through nature, warm teal and orange sky, no text"
  ],
  kas: [
    "UCLA university campus building with dramatic sky, cinematic establishing shot, dark blue tones, no text",
    "Anatomical visualization of human muscles glowing red on dark background, medical illustration style, no text",
    "Time-lapse concept of human aging, abstract dark visualization with fading silhouette, no text",
    "Scientific laboratory with medical data screens, dark cinematic with teal screen glow, no text",
    "Person doing deadlift in gym with dramatic side lighting, cinematic black and white with orange accent, no text",
    "Abstract teal gradient with flowing particles moving upward, smooth and peaceful, no text"
  ],
  uyku: [
    "Science magazine journal floating in dark blue space, academic research concept, cinematic, no text",
    "Brain neural network glowing purple and blue, cerebrospinal fluid flowing through, dark medical visualization, no text",
    "Microscopic view of protein plaques being dissolved by flowing blue liquid, dark scientific, no text",
    "Brain MRI scan with red warning highlights on dark background, medical diagnostic aesthetic, no text",
    "Person sleeping peacefully in dark room with soft blue moonlight through window, cinematic, no text",
    "Abstract indigo and teal aurora flowing peacefully, dark cosmic background, no text"
  ],
  bagirsak: [
    "Caltech university campus at dusk, modern architecture, dark blue and pink sky, cinematic, no text",
    "Glowing pink serotonin molecules floating in dark cosmic space, scientific visualization, no text",
    "Colorful gut microbiome bacteria under electron microscope, dark background with pink and purple glow, no text",
    "Abstract dark red and black visualization of biological disruption, medical warning aesthetic, no text",
    "Beautiful arrangement of fermented probiotic foods on dark slate, kefir yogurt kimchi, warm lighting, no text",
    "Abstract flowing teal and pink gradient, smooth organic movement, peaceful, no text"
  ],
  oturma: [
    "The Lancet medical journal on dark desk with dramatic red lighting, academic research, no text",
    "Person sitting at office desk viewed from behind, multiple screens, dark moody blue lighting, no text",
    "Cigarette and office chair placed side by side on dark background, dramatic comparison, no text",
    "Person jogging through green park with bright sunlight, cinematic slow motion feel, hopeful, no text",
    "Person standing up from desk stretching arms above head, warm office light, relief moment, no text",
    "Abstract teal flowing gradient with upward light particles, smooth and uplifting, no text"
  ],
  gencim: [
    "Young diverse people running and laughing in a sunny park at golden hour, energetic lifestyle, vibrant warm tones, cinematic photography, no text no letters",
    "Dark dramatic scientific data visualization with red glowing numbers 23 floating in space, medical research aesthetic, no text no letters",
    "Beautiful Mediterranean food and running shoes side by side on wooden surface, healthy lifestyle concept, warm natural lighting, no text no letters",
    "Harvard university campus with autumn trees golden light, prestigious academic architecture, warm hopeful atmosphere, cinematic, no text no letters",
    "Multigenerational family exercising together in nature park, grandparents with children, warm sunset golden light, emotional and heartwarming, no text no letters",
    "Person standing on hilltop at sunrise with arms wide open, green nature, golden light rays, freedom hope and new beginning, inspiring cinematic, no text no letters"
  ]
};

function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'grok-imagine-image',
      prompt: prompt,
      n: 1,
      response_format: 'url'
    });

    const options = {
      hostname: 'api.x.ai',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.data && parsed.data[0]) {
            resolve(parsed.data[0].url);
          } else {
            reject(new Error(`No image URL: ${data.substring(0, 200)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const handler = (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, handler).on('error', reject);
        return;
      }
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    };
    https.get(url, handler).on('error', reject);
  });
}

async function main() {
  const targetReel = process.argv[2]; // Optional: specify single reel
  const reelsToProcess = targetReel ? { [targetReel]: REELS[targetReel] } : REELS;

  for (const [reelName, prompts] of Object.entries(reelsToProcess)) {
    if (!prompts) { console.log(`❌ Unknown reel: ${reelName}`); continue; }
    const dir = path.join(__dirname, `reel-viral-${reelName}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log(`\n🎨 ${reelName.toUpperCase()} — ${prompts.length} görsel üretiliyor...`);

    for (let i = 0; i < prompts.length; i++) {
      const idx = String(i + 1).padStart(2, '0');
      const outPath = path.join(dir, `bg-${idx}.png`);
      
      try {
        console.log(`   🖼️  BG ${idx}: Üretiliyor...`);
        const url = await generateImage(prompts[i]);
        await downloadFile(url, outPath);
        console.log(`   ✅ BG ${idx}: OK`);
      } catch (e) {
        console.log(`   ❌ BG ${idx}: ${e.message}`);
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\n🎉 Tüm arka plan görselleri tamamlandı!');
}

main().catch(console.error);
