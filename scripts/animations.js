/**
 * UzunYasa - Professional Animations
 * Pure vanilla JS - no external dependencies
 * Uses Intersection Observer for scroll-triggered animations
 */

(function () {
  'use strict';

  // Respect reduced motion preference
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS =====
  function initScrollAnimations() {
    var animElements = document.querySelectorAll(
      '.anim-fade-in, .anim-slide-up, .anim-slide-left, .anim-slide-right, .anim-scale-in, .anim-bar'
    );

    if (!animElements.length) return;

    if (prefersReducedMotion) {
      animElements.forEach(function (el) {
        el.classList.add('anim-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    animElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== AUTO-APPLY SCROLL REVEAL TO SECTIONS =====
  function autoApplyScrollReveal() {
    if (prefersReducedMotion) return;

    // Apply fade-in-up to content sections that don't already have animation classes
    var sections = document.querySelectorAll(
      'section, .content-section, .info-section, .features-section, .stats-section, .cta-section'
    );

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );

    sections.forEach(function (section) {
      // Skip hero, header, footer, and already animated elements
      if (
        section.classList.contains('hero') ||
        section.closest('header') ||
        section.closest('footer') ||
        section.closest('nav') ||
        section.classList.contains('anim-fade-in') ||
        section.classList.contains('anim-slide-up') ||
        section.classList.contains('anim-visible')
      ) return;

      // Only apply if not already styled with animation
      if (!section.style.opacity || section.style.opacity === '1') {
        section.style.opacity = '0';
        section.style.transform = 'translateY(25px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(section);
      }
    });
  }

  // ===== ANIMATED COUNTER =====
  function animateCounter(el, target, duration, suffix, prefix) {
    if (prefersReducedMotion) {
      el.textContent = (prefix || '') + formatNumber(target) + (suffix || '');
      return;
    }

    var start = performance.now();
    duration = duration || 2000;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutExpo(progress);
      var current = Math.round(eased * target);

      el.textContent = (prefix || '') + formatNumber(current) + (suffix || '');

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function formatNumber(n) {
    if (n >= 1000) {
      return n.toLocaleString('tr-TR');
    }
    return n.toString();
  }

  // ===== COUNT-UP ELEMENTS =====
  function initCounters() {
    var counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var target = parseFloat(el.getAttribute('data-count-to'));
            var suffix = el.getAttribute('data-count-suffix') || '';
            var prefix = el.getAttribute('data-count-prefix') || '';
            var duration = parseInt(el.getAttribute('data-count-duration')) || 2000;
            animateCounter(el, target, duration, suffix, prefix);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== AUTO-DETECT STAT NUMBERS AND ANIMATE =====
  function autoAnimateNumbers() {
    // Find stat-like elements that contain numbers but don't have data-count-to
    var statSelectors = [
      '.stat-number', '.stat-value', '.stat h2', '.stat h3',
      '.stats-number', '.counter', '.count',
      '.stat-box h2', '.stat-box h3', '.stat-box .number',
      '.comparison-stat', '.metric-value'
    ];

    var statElements = document.querySelectorAll(statSelectors.join(', '));

    statElements.forEach(function (el) {
      if (el.hasAttribute('data-count-to') || el.dataset.counted) return;

      var text = el.textContent.trim();
      // Match numbers like "1500", "%25", "10.5", "+30" etc.
      var match = text.match(/^([+%]?)(\d[\d.,]*)([%+\w\s]*$)/);
      if (!match) return;

      var prefix = match[1] || '';
      var numStr = match[2].replace(/\./g, '').replace(/,/g, '.');
      var num = parseFloat(numStr);
      var suffix = match[3] || '';

      if (isNaN(num) || num === 0) return;

      el.setAttribute('data-count-to', num);
      if (prefix) el.setAttribute('data-count-prefix', prefix);
      if (suffix) el.setAttribute('data-count-suffix', suffix);
      el.dataset.counted = 'pending';
    });

    // Re-init counters to pick up new ones
    initCounters();
  }

  // ===== PROGRESS RINGS =====
  function initProgressRings() {
    var rings = document.querySelectorAll('.progress-ring-circle[data-percent]');
    if (!rings.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var circle = entry.target;
            var percent = parseFloat(circle.getAttribute('data-percent'));
            var radius = parseFloat(circle.getAttribute('r'));
            var circumference = 2 * Math.PI * radius;

            if (prefersReducedMotion) {
              circle.style.strokeDasharray = (percent / 100) * circumference + ' ' + circumference;
            } else {
              circle.style.strokeDasharray = '0 ' + circumference;
              requestAnimationFrame(function () {
                circle.style.strokeDasharray =
                  (percent / 100) * circumference + ' ' + circumference;
              });
            }

            observer.unobserve(circle);
          }
        });
      },
      { threshold: 0.3 }
    );

    rings.forEach(function (ring) {
      observer.observe(ring);
    });
  }

  // ===== FLOATING HEALTH ICONS =====
  function injectFloatingIcons(containerSelector) {
    if (prefersReducedMotion) return;

    var container = document.querySelector(containerSelector);
    if (!container) return;
    if (container.querySelector('.floating-icons-container')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'floating-icons-container';
    wrapper.setAttribute('aria-hidden', 'true');

    var icons = [
      '<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
      '<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M20 10c0-4-3-7-7-7-1 0-1 0-1 0s0 0-1 0c-4 0-7 3-7 7 0 6 5 11 8 13 3-2 8-7 8-13zM12 5c0 0 .5-2 2-3"/></svg>',
      '<svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor"><circle cx="17" cy="4" r="2"/><path d="M15.5 7.5L12 9l-3 1.5L7 13l-3 4h2.5l2-3 2-1.5 1 3-2 4.5h2.5l2-4 2.5 1.5 2 3.5h2.5L17 14l-1.5-3z"/></svg>',
      '<svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="13" r="5"/><path d="M12 8v3l2 2"/></svg>',
      '<svg viewBox="0 0 24 24" width="38" height="38" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>',
    ];

    icons.forEach(function (svg) {
      var iconEl = document.createElement('div');
      iconEl.className = 'floating-icon';
      iconEl.innerHTML = svg;
      wrapper.appendChild(iconEl);
    });

    container.insertBefore(wrapper, container.firstChild);
  }

  // ===== TYPEWRITER CURSOR =====
  function addTypewriterCursor() {
    var rotatingContainer = document.querySelector('.rotating-container');
    if (!rotatingContainer || prefersReducedMotion) return;
    if (rotatingContainer.querySelector('.typewriter-cursor')) return;

    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    rotatingContainer.parentNode.insertBefore(cursor, rotatingContainer.nextSibling);
  }

  // ===== STAGGER CHILDREN ON SCROLL =====
  function initStaggerChildren() {
    var staggerContainers = document.querySelectorAll('[data-stagger-children]');
    if (!staggerContainers.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var children = entry.target.children;
            Array.prototype.forEach.call(children, function (child, i) {
              if (prefersReducedMotion) {
                child.classList.add('anim-visible');
              } else {
                child.style.transitionDelay = i * 0.1 + 's';
                requestAnimationFrame(function () {
                  child.classList.add('anim-visible');
                });
              }
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    staggerContainers.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ===== BLOG CARD STAGGER =====
  function initBlogCardStagger() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.blog-card, .blog-grid > *').forEach(function (card) {
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      return;
    }

    var blogGrids = document.querySelectorAll('.blog-grid, .blog-cards, .articles-grid');
    if (!blogGrids.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var cards = entry.target.querySelectorAll('.blog-card, [class*="-card"], article');
            cards.forEach(function (card, i) {
              card.style.transitionDelay = (i * 0.1) + 's';
              requestAnimationFrame(function () {
                card.classList.add('anim-visible');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              });
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 }
    );

    blogGrids.forEach(function (grid) {
      observer.observe(grid);
    });
  }

  // ===== ANIMATED BAR CHARTS =====
  function initAnimatedBars() {
    var bars = document.querySelectorAll('.anim-bar');
    if (!bars.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('anim-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    bars.forEach(function (bar) {
      observer.observe(bar);
    });
  }

  // ===== QUIZ SMOOTH TRANSITIONS =====
  function enhanceQuizTransitions() {
    var quizContainer = document.querySelector('.quiz-container, .question-card');
    if (!quizContainer) return;

    var progressBar = document.querySelector('.progress-bar, .quiz-progress');
    if (progressBar) {
      progressBar.classList.add('quiz-progress-bar');
    }
  }

  // ===== BUTTON RIPPLE EFFECT =====
  function initRippleEffect() {
    if (prefersReducedMotion) return;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('button, .btn, a.btn, [class*="btn-"]');
      if (!btn) return;

      // Ensure position relative and overflow hidden
      var style = getComputedStyle(btn);
      if (style.position === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';

      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';

      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  }

  // ===== STICKY HEADER =====
  function initStickyHeader() {
    var header = document.querySelector('header, .header, .navbar, .site-header, nav.main-nav');
    if (!header) return;

    var scrollThreshold = 50;

    function onScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check initial state
  }

  // ===== BACK TO TOP BUTTON =====
  function initBackToTop() {
    // Check if already exists
    if (document.querySelector('.back-to-top')) return;

    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Yukarı çık');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);

    function toggleVisibility() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== TOAST NOTIFICATION SYSTEM =====
  function initToastSystem() {
    // Create container if not exists
    if (!document.querySelector('.toast-container')) {
      var container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Expose global toast function
    window.uzToast = function (message, type, duration) {
      type = type || 'info';
      duration = duration || 3000;

      var container = document.querySelector('.toast-container');
      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.textContent = message;
      container.appendChild(toast);

      setTimeout(function () {
        toast.classList.add('toast-exit');
        toast.addEventListener('animationend', function () {
          toast.remove();
        });
      }, duration);
    };
  }

  // ===== SCALE-IN FOR STAT BOXES =====
  function initStatBoxAnimations() {
    if (prefersReducedMotion) return;

    var statBoxes = document.querySelectorAll(
      '.stat-box, .stat-card, .stat, .stats-item, .metric-card, .number-card'
    );

    if (!statBoxes.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    statBoxes.forEach(function (box) {
      if (!box.classList.contains('anim-scale-in') && !box.classList.contains('anim-visible')) {
        box.style.opacity = '0';
        box.style.transform = 'scale(0.9)';
        box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(box);
      }
    });
  }

  // ===== INIT ALL =====
  function init() {
    initScrollAnimations();
    initCounters();
    autoAnimateNumbers();
    initProgressRings();
    initStaggerChildren();
    initBlogCardStagger();
    initAnimatedBars();
    addTypewriterCursor();
    enhanceQuizTransitions();
    initRippleEffect();
    initStickyHeader();
    initBackToTop();
    initToastSystem();
    initStatBoxAnimations();
    autoApplyScrollReveal();

    // Floating icons in hero section
    injectFloatingIcons('.hero');

    // Add pulse to CTA buttons
    document.querySelectorAll('.hero-btn-primary, .cta-btn-primary').forEach(function (btn) {
      if (!prefersReducedMotion) {
        btn.classList.add('btn-pulse');
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
