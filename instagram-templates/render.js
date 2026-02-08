const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = __dirname;
const POSTS_FILE = path.join(TEMPLATE_DIR, 'posts', 'posts.json');
const OUTPUT_DIR = path.join(TEMPLATE_DIR, 'posts');

async function renderPost(browser, post) {
  const templatePath = path.join(TEMPLATE_DIR, post.template);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Replace all placeholders
  for (const [key, value] of Object.entries(post.data)) {
    html = html.replaceAll(`{{${key}}}`, value.replace(/\n/g, '<br>'));
  }

  const tmpFile = path.join(OUTPUT_DIR, `_tmp_${post.id}.html`);
  fs.writeFileSync(tmpFile, html);

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1080, height: 1350 });
  await page.goto('file://' + tmpFile, { waitUntil: 'networkidle' });
  
  const outputPath = path.join(OUTPUT_DIR, `post-${String(post.id).padStart(2, '0')}.png`);
  await page.screenshot({ path: outputPath, type: 'png' });
  await page.close();
  
  fs.unlinkSync(tmpFile);
  console.log(`Rendered: ${outputPath}`);
  return outputPath;
}

async function main() {
  const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
  const browser = await chromium.launch();
  
  for (const post of posts) {
    await renderPost(browser, post);
  }
  
  await browser.close();
  console.log(`Done! Rendered ${posts.length} posts.`);
}

main().catch(e => { console.error(e); process.exit(1); });
