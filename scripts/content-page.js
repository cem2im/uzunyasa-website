/* ============================================
   Content Page Premium UX — UzunYaşa
   scripts/content-page.js
   ============================================ */
(function () {
  'use strict';

  /* --- Reading Progress Bar --- */
  (function initProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    document.body.prepend(bar);
    window.addEventListener('scroll', function () {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
    }, { passive: true });
  })();

  /* --- Estimated Reading Time --- */
  (function initReadingTime() {
    const main = document.querySelector('.guide-content, .content, article, main');
    if (!main) return;
    const text = main.textContent || '';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    const metaBar = document.createElement('div');
    metaBar.className = 'content-meta-bar animate-on-scroll';
    metaBar.innerHTML =
      '<span class="reading-time">' + minutes + ' dk okuma süresi</span>' +
      '<span class="word-count">' + words.toLocaleString('tr-TR') + ' kelime</span>';
    // Insert at top of main content
    const firstH2 = main.querySelector('h2');
    if (firstH2) main.insertBefore(metaBar, firstH2);
    else main.prepend(metaBar);
  })();

  /* --- Table of Contents --- */
  (function initTOC() {
    const main = document.querySelector('.guide-content, .content, article, main');
    if (!main) return;
    const headings = main.querySelectorAll('h2');
    if (headings.length < 2) return;

    // Ensure IDs
    headings.forEach(function (h, i) {
      if (!h.id) {
        h.id = 'section-' + (i + 1);
      }
    });

    const toc = document.createElement('nav');
    toc.className = 'toc-container animate-on-scroll';
    toc.innerHTML = '<h4>İçindekiler</h4>';
    const ul = document.createElement('ol');
    ul.className = 'toc-list';
    headings.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent.replace(/🔗|📋|✓ Kopyalandı/g, '').trim();
      a.setAttribute('data-target', h.id);
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);

    // Insert after meta bar or at top
    const metaBar = main.querySelector('.content-meta-bar');
    if (metaBar) metaBar.after(toc);
    else {
      const firstH2 = main.querySelector('h2');
      if (firstH2) main.insertBefore(toc, firstH2);
    }

    // Highlight on scroll
    var tocLinks = toc.querySelectorAll('a');
    var headingArr = Array.from(headings);
    function updateActive() {
      var current = '';
      for (var i = headingArr.length - 1; i >= 0; i--) {
        if (headingArr[i].getBoundingClientRect().top <= 120) {
          current = headingArr[i].id;
          break;
        }
      }
      tocLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-target') === current);
      });
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  })();

  /* --- Copy Link Buttons on Headings --- */
  (function initCopyLinks() {
    var main = document.querySelector('.guide-content, .content, article, main');
    if (!main) return;
    main.querySelectorAll('h2, h3').forEach(function (h) {
      if (!h.id) {
        h.id = 'h-' + h.textContent.trim().toLowerCase()
          .replace(/[^a-z0-9ğüşıöçâîû]+/gi, '-')
          .replace(/^-|-$/g, '').substring(0, 40);
      }
      var btn = document.createElement('button');
      btn.className = 'heading-anchor';
      btn.innerHTML = '🔗';
      btn.title = 'Bağlantıyı kopyala';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = location.origin + location.pathname + '#' + h.id;
        navigator.clipboard.writeText(url).then(function () {
          btn.innerHTML = '✓ Kopyalandı';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.innerHTML = '🔗';
            btn.classList.remove('copied');
          }, 2000);
        });
      });
      h.appendChild(btn);
    });
  })();

  /* --- FAQ Collapsible Sections --- */
  (function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        if (item) item.classList.toggle('open');
      });
    });
  })();

  /* --- Scroll Animations (Intersection Observer) --- */
  (function initScrollAnimations() {
    var main = document.querySelector('.guide-content, .content, article, main');
    if (!main) return;

    // Mark elements for animation
    var selectors = 'h2, h3, p, ul, ol, .info-box, .warning-box, .success-box, .tip-box, .fact-box, .stat-box, .pull-quote, .key-takeaway, .comparison-block, .sources, .guide-cta, .checklist, .faq-section, .toc-container, .content-meta-bar, blockquote, table, figure';
    var elements = main.querySelectorAll(selectors);
    elements.forEach(function (el) {
      if (!el.classList.contains('animate-on-scroll')) {
        el.classList.add('animate-on-scroll');
      }
    });

    // Stagger list items
    main.querySelectorAll('ul, ol').forEach(function (list) {
      Array.from(list.children).forEach(function (li, i) {
        if (i < 5) {
          li.classList.add('animate-on-scroll', 'stagger-' + Math.min(i + 1, 4));
        }
      });
    });

    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
      observer.observe(el);
    });
  })();

})();
