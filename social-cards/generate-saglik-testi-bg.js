const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XAI_API_KEY;

// Warm, friendly, hopeful backgrounds — NOT scary
const PROMPTS = [
  // Slide 1: "Sana bir şey söylesem..." — intimate, warm
  "Warm cozy photograph of two coffee cups on a wooden table, soft morning light, blurred cafe background, golden tones, intimate atmosphere, no text no letters no words",
  // Slide 2: "78 yıl yaşayacaksın" — life, light
  "Beautiful golden hour photograph of a long winding road through countryside, warm sunlight, hopeful journey concept, cinematic, no text no letters",
  // Slide 3: "57 yıldan sonra..." — gentle awareness (not scary)
  "Soft photograph of autumn leaves changing colors on a tree, warm amber and orange tones, passage of time concept, gentle, no text no letters",
  // Slide 4: "Ama iyi haber var" — hope, green, nature
  "Vibrant photograph of fresh green sprout growing from soil, morning dew, spring energy, new beginning concept, warm light, no text no letters",
  // Slide 5: "+14 yıl" — active, energetic
  "Beautiful photograph of people jogging together in a sunny park, golden hour backlight, healthy active lifestyle, warm community feeling, no text no letters",
  // Slide 6: "Senin sağlık süren kaç?" — curiosity, tech
  "Modern smartphone on a clean desk with warm sunlight casting shadows, minimal aesthetic, teal and white tones, wellness app concept, no text no letters",
  // Slide 7: CTA — brand, warm
  "Abstract flowing teal and warm orange gradient, smooth organic shapes, peaceful and inviting, modern wellness brand aesthetic, no text no letters"
];

const outDir = path.join(__dirname, 'reel-saglik-testi');

async function generateImage(prompt, index) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'grok-imagine-image',
      prompt: prompt,
      n: 1
    });

    const options = {
      hostname: 'api.x.ai',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.data && json.data[0]) {
            const imgData = json.data[0].b64_json || json.data[0].url;
            if (json.data[0].b64_json) {
              const buf = Buffer.from(json.data[0].b64_json, 'base64');
              const outPath = path.join(outDir, `bg-${String(index + 1).padStart(2, '0')}.png`);
              fs.writeFileSync(outPath, buf);
              console.log(`  ✅ bg-${String(index + 1).padStart(2, '0')}.png (${(buf.length/1024).toFixed(0)}KB)`);
              resolve(outPath);
            } else if (json.data[0].url) {
              // Download from URL
              https.get(json.data[0].url, (imgRes) => {
                const chunks = [];
                imgRes.on('data', c => chunks.push(c));
                imgRes.on('end', () => {
                  const buf = Buffer.concat(chunks);
                  const outPath = path.join(outDir, `bg-${String(index + 1).padStart(2, '0')}.png`);
                  fs.writeFileSync(outPath, buf);
                  console.log(`  ✅ bg-${String(index + 1).padStart(2, '0')}.png (${(buf.length/1024).toFixed(0)}KB)`);
                  resolve(outPath);
                });
              });
            }
          } else {
            console.error(`  ❌ Slide ${index + 1}: ${JSON.stringify(json).substring(0, 200)}`);
            reject(new Error('No image data'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  if (!API_KEY) { console.error('XAI_API_KEY missing!'); process.exit(1); }
  
  console.log('🎨 Grok Imagine ile sıcak arka planlar üretiliyor...\n');
  
  for (let i = 0; i < PROMPTS.length; i++) {
    try {
      await generateImage(PROMPTS[i], i);
    } catch (e) {
      console.error(`  ⚠️ Slide ${i + 1} hata: ${e.message}`);
    }
    // Rate limit
    if (i < PROMPTS.length - 1) await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n🎉 Arka planlar tamamlandı!');
}

main();
