#!/usr/bin/env node
/**
 * Tüm araç, rehber ve blog sayfalarına gizlilik bildirimi ekler.
 * - Araçlar: Detaylı bildirim (veri girişi var)
 * - Rehberler + Bloglar: Kısa footer notu
 */

const fs = require('fs');
const path = require('path');
// glob not needed — using fs.readdirSync

// Araçlar için detaylı bildirim (veri girişi yapılan sayfalar)
const TOOL_NOTICE = `
<!-- Gizlilik Bildirimi -->
<div style="max-width:800px;margin:2rem auto;padding:1rem 1.5rem;background:linear-gradient(135deg,#f0fdfa,#f8fffe);border:1px solid #d1e7e8;border-radius:12px;text-align:center;font-size:0.9rem;color:#4B5563;line-height:1.6;">
  <span style="font-size:1.1rem;">🔒</span>
  <strong style="color:#195157;">Gizlilik Güvencesi:</strong>
  Girdiğiniz bilgiler yalnızca tarayıcınızda işlenir.
  <strong>Hiçbir veriniz sunucularımıza gönderilmez, saklanmaz veya üçüncü taraflarla paylaşılmaz.</strong>
  Tüm hesaplamalar cihazınızda gerçekleşir.
  <a href="/pages/gizlilik-politikasi.html" style="color:#0D7377;text-decoration:underline;margin-left:4px;">Gizlilik Politikası</a>
</div>
<!-- /Gizlilik Bildirimi -->`;

// Blog ve rehberler için kısa footer notu
const CONTENT_NOTICE = `
<!-- Gizlilik Notu -->
<div style="max-width:800px;margin:2rem auto 0;padding:0.75rem 1.25rem;border-top:1px solid #e5e7eb;text-align:center;font-size:0.82rem;color:#9CA3AF;line-height:1.5;">
  🔒 Bu site çerez veya kişisel veri toplamaz. Detaylar: <a href="/pages/gizlilik-politikasi.html" style="color:#0D7377;">Gizlilik Politikası</a>
</div>
<!-- /Gizlilik Notu -->`;

function addNotice(filePath, notice, label) {
  let html = fs.readFileSync(filePath, 'utf-8');
  
  // Zaten eklenmişse atla
  if (html.includes('Gizlilik Bildirimi') || html.includes('Gizlilik Notu') || html.includes('Gizlilik Güvencesi')) {
    console.log(`  ⏭️  ${path.basename(filePath)} — zaten var, atlandı`);
    return false;
  }
  
  // </body> etiketinden hemen önce ekle
  const bodyCloseIndex = html.lastIndexOf('</body>');
  if (bodyCloseIndex === -1) {
    console.log(`  ⚠️  ${path.basename(filePath)} — </body> bulunamadı!`);
    return false;
  }
  
  html = html.slice(0, bodyCloseIndex) + notice + '\n' + html.slice(bodyCloseIndex);
  fs.writeFileSync(filePath, html);
  console.log(`  ✅ ${path.basename(filePath)} — ${label} eklendi`);
  return true;
}

// Araçlar
const toolsDir = path.join(__dirname, '..', 'pages', 'araclar');
const tools = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html') && f !== 'index.html');

console.log(`\n🔧 ARAÇLAR (${tools.length} sayfa) — Detaylı gizlilik bildirimi:`);
let toolCount = 0;
for (const file of tools) {
  if (addNotice(path.join(toolsDir, file), TOOL_NOTICE, 'detaylı bildirim')) toolCount++;
}

// Rehberler
const guidesDir = path.join(__dirname, '..', 'pages', 'rehberler');
let guideFiles = [];
try {
  guideFiles = fs.readdirSync(guidesDir).filter(f => f.endsWith('.html') && f !== 'index.html');
} catch(e) {}

console.log(`\n📖 REHBERLER (${guideFiles.length} sayfa) — Kısa gizlilik notu:`);
let guideCount = 0;
for (const file of guideFiles) {
  if (addNotice(path.join(guidesDir, file), CONTENT_NOTICE, 'kısa not')) guideCount++;
}

// Bloglar
const blogsDir = path.join(__dirname, '..', 'pages', 'blog');
let blogFiles = [];
try {
  blogFiles = fs.readdirSync(blogsDir).filter(f => f.endsWith('.html') && f !== 'index.html');
} catch(e) {}

console.log(`\n📝 BLOGLAR (${blogFiles.length} sayfa) — Kısa gizlilik notu:`);
let blogCount = 0;
for (const file of blogFiles) {
  if (addNotice(path.join(blogsDir, file), CONTENT_NOTICE, 'kısa not')) blogCount++;
}

// Ana sayfa
const indexPath = path.join(__dirname, '..', 'index.html');
console.log(`\n🏠 ANA SAYFA:`);
let indexCount = 0;
if (addNotice(indexPath, CONTENT_NOTICE, 'kısa not')) indexCount++;

// Linkler sayfası
const linklerPath = path.join(__dirname, '..', 'linkler.html');
if (fs.existsSync(linklerPath)) {
  console.log(`\n🔗 LİNKLER SAYFASI:`);
  if (addNotice(linklerPath, CONTENT_NOTICE, 'kısa not')) indexCount++;
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ Toplam: ${toolCount} araç + ${guideCount} rehber + ${blogCount} blog + ${indexCount} diğer`);
console.log(`🔒 Gizlilik bildirimi eklendi!`);
