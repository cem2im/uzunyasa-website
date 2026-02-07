#!/usr/bin/env node
/**
 * Updates the blog.html page with latest posts from blog-posts.json
 */

const fs = require('fs');
const path = require('path');

const BLOG_INDEX = path.join(__dirname, '../data/blog-posts.json');
const BLOG_PAGE = path.join(__dirname, '../pages/blog.html');

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

function generatePostCard(post) {
  return `
            <a href="blog/${post.slug}.html" class="post-card">
                <div class="post-image" style="background: linear-gradient(135deg, ${post.categoryColor}, ${post.categoryColor}aa);">
                    <span class="post-image-placeholder">${post.categoryIcon}</span>
                </div>
                <div class="post-body">
                    <span class="post-category">${post.categoryName}</span>
                    <h3>${post.title}</h3>
                    <p>${post.description}</p>
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
            </a>`;
}

function generateFeaturedPost(post) {
  return `
        <article class="featured-post">
            <div class="featured-image" style="background: linear-gradient(135deg, ${post.categoryColor}, ${post.categoryColor}aa);">
                <span class="featured-image-placeholder">${post.categoryIcon}</span>
            </div>
            <div class="featured-body">
                <span class="post-category">${post.categoryName}</span>
                <h2>${post.title}</h2>
                <p>${post.description}</p>
                <div class="post-meta">
                    <span>📅 ${formatDate(post.date)}</span>
                    <span>•</span>
                    <span>⏱️ ${post.readTime} dk okuma</span>
                </div>
                <a href="blog/${post.slug}.html" class="read-more">Devamını Oku →</a>
            </div>
        </article>`;
}

function main() {
  if (!fs.existsSync(BLOG_INDEX)) {
    console.log('ℹ️ Blog index dosyası yok, atlanıyor');
    return;
  }
  
  const posts = JSON.parse(fs.readFileSync(BLOG_INDEX, 'utf-8'));
  
  if (posts.length === 0) {
    console.log('ℹ️ Hiç blog yazısı yok, atlanıyor');
    return;
  }
  
  let blogHtml = fs.readFileSync(BLOG_PAGE, 'utf-8');
  
  // Generate featured post (first post)
  const featuredHtml = generateFeaturedPost(posts[0]);
  
  // Generate post cards (rest of the posts, max 9)
  const postCardsHtml = posts.slice(1, 10).map(generatePostCard).join('\n');
  
  // Replace featured post section
  blogHtml = blogHtml.replace(
    /<article class="featured-post">[\s\S]*?<\/article>/,
    featuredHtml
  );
  
  // Replace posts grid
  blogHtml = blogHtml.replace(
    /(<div class="posts-grid">)[\s\S]*?(<\/div>\s*<!-- Newsletter -->)/,
    `$1\n${postCardsHtml}\n        $2`
  );
  
  fs.writeFileSync(BLOG_PAGE, blogHtml);
  console.log(`✅ Blog sayfası güncellendi (${posts.length} yazı)`);
}

main();
