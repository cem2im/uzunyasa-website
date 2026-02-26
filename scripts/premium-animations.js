/**
 * UzunYaşa — Premium Scroll Animations
 * Stagger reveals, parallax, enhanced counters, section transitions
 * 
 * Usage: Just include this script. It auto-initializes on DOMContentLoaded.
 * Respects prefers-reduced-motion.
 */

(function() {
  'use strict';

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // ============================================
  // 1. STAGGER REVEAL — Cards animate one by one
  // ============================================
  
  function initStaggerReveal() {
    // Find all grid/flex containers that have multiple child cards
    const cardSelectors = [
      '.blog-grid', '.tools-grid', '.guides-grid', '.features-grid',
      '.treatments-grid', '.card-grid', '.stats-row', '.stats-grid',
      '[class*="-grid"]'
    ];
    
    // Also find any container with 3+ direct children that look like cards
    const containers = new Set();
    
    cardSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => containers.add(el));
    });
    
    // Find generic containers with multiple card-like children
    document.querySelectorAll('section, [class*="section"]').forEach(section => {
      const grids = section.querySelectorAll('[style*="display: grid"], [style*="display:grid"], [style*="grid-template"]');
      grids.forEach(g => containers.add(g));
      
      // Find flex containers with 3+ similar children
      section.querySelectorAll('div').forEach(div => {
        const style = window.getComputedStyle(div);
        if (style.display === 'flex' || style.display === 'grid') {
          const children = div.children;
          if (children.length >= 3) {
            containers.add(div);
          }
        }
      });
    });
    
    containers.forEach(container => {
      const children = Array.from(container.children).filter(child => {
        // Only animate substantial elements (not spacers, etc.)
        return child.offsetHeight > 30 && child.offsetWidth > 30;
      });
      
      if (children.length < 2) return;
      
      // Prepare children for stagger animation
      children.forEach((child, index) => {
        if (child.classList.contains('stagger-ready')) return;
        child.classList.add('stagger-ready');
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
        child.style.transition = `opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.12}s, 
                                  transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.12}s`;
      });
      
      // Observe the container
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            children.forEach(child => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      
      observer.observe(container);
    });
  }

  // ============================================
  // 2. PARALLAX HERO — Subtle depth on scroll
  // ============================================
  
  function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const heroVideo = hero.querySelector('.hero-video, video');
    const heroOverlay = hero.querySelector('.hero-overlay');
    const heroContent = hero.querySelector('.hero-content');
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        
        // Only apply when hero is visible
        if (scrollY < heroHeight * 1.5) {
          const progress = scrollY / heroHeight;
          
          // Background moves slower (parallax)
          if (heroVideo) {
            heroVideo.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + progress * 0.05})`;
          }
          
          // Overlay darkens as you scroll
          if (heroOverlay) {
            const opacity = Math.min(0.9, 0.55 + progress * 0.35);
            heroOverlay.style.background = `linear-gradient(180deg, 
              rgba(25, 81, 87, ${opacity * 0.8}) 0%, 
              rgba(25, 81, 87, ${opacity}) 50%, 
              rgba(15, 61, 66, ${Math.min(1, opacity + 0.1)}) 100%)`;
          }
          
          // Content fades and moves up
          if (heroContent) {
            const fadeOut = Math.max(0, 1 - progress * 1.5);
            heroContent.style.opacity = fadeOut;
            heroContent.style.transform = `translateY(${scrollY * -0.15}px)`;
          }
        }
        
        ticking = false;
      });
    }, { passive: true });
  }

  // ============================================
  // 3. ENHANCED COUNTERS — Dramatic count-up
  // ============================================
  
  function initEnhancedCounters() {
    // Find ALL elements with numbers that should animate
    const statElements = document.querySelectorAll('.stat-value, .stat-number, [data-count-to]');
    
    statElements.forEach(el => {
      if (el.dataset.counterInit) return;
      el.dataset.counterInit = 'true';
      
      const text = el.textContent.trim();
      const match = text.match(/([\d,.%]+)/);
      if (!match) return;
      
      // Store original text
      el.dataset.originalText = text;
    });
  }

  // ============================================
  // 4. SECTION DIVIDER ANIMATIONS
  // ============================================
  
  function initSectionTransitions() {
    const sections = document.querySelectorAll('section, [class*="section"]');
    
    sections.forEach((section, index) => {
      if (section.classList.contains('hero')) return;
      if (section.dataset.sectionInit) return;
      section.dataset.sectionInit = 'true';
      
      // Add subtle entry animation to section headings
      const headings = section.querySelectorAll('h2, .section-title');
      headings.forEach(heading => {
        if (heading.closest('.stagger-ready')) return;
        heading.style.opacity = '0';
        heading.style.transform = 'translateY(20px)';
        heading.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 });
        
        observer.observe(heading);
      });
      
      // Animate section subtitles with slight delay
      const subtitles = section.querySelectorAll('.section-subtitle, h2 + p, .section-title + p');
      subtitles.forEach(sub => {
        if (sub.closest('.stagger-ready')) return;
        sub.style.opacity = '0';
        sub.style.transform = 'translateY(15px)';
        sub.style.transition = 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s';
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 });
        
        observer.observe(sub);
      });
    });
  }

  // ============================================
  // 5. SCROLL PROGRESS INDICATOR (top bar)
  // ============================================
  
  function initScrollProgress() {
    // Only on pages with substantial content
    const body = document.body;
    const docHeight = Math.max(body.scrollHeight, body.offsetHeight) - window.innerHeight;
    if (docHeight < 1000) return;
    
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      width: 0%;
      background: linear-gradient(90deg, #0D7377, #14919B, #E8963E);
      z-index: 10001;
      transition: width 0.1s linear;
      pointer-events: none;
      border-radius: 0 2px 2px 0;
    `;
    document.body.appendChild(progressBar);
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = (window.scrollY / docHeight) * 100;
        progressBar.style.width = Math.min(100, scrolled) + '%';
        ticking = false;
      });
    }, { passive: true });
  }

  // ============================================
  // 6. SMOOTH REVEAL FOR IMAGES
  // ============================================
  
  function initImageReveals() {
    const images = document.querySelectorAll('article img, .blog-content img, section img:not(.logo-img):not(.logo-img-hero)');
    
    images.forEach(img => {
      if (img.dataset.revealInit) return;
      img.dataset.revealInit = 'true';
      
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      img.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      
      // If already loaded, just set up observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(img);
    });
  }

  // ============================================
  // 7. HOVER TILT EFFECT ON CARDS (subtle 3D)
  // ============================================
  
  function initTiltCards() {
    const cards = document.querySelectorAll('.tool-card, .feature-card, .guide-card, [class*="-card"]');
    
    cards.forEach(card => {
      if (card.dataset.tiltInit) return;
      card.dataset.tiltInit = 'true';
      
      card.style.transformStyle = 'preserve-3d';
      card.style.perspective = '1000px';
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -3; // max 3 degrees
        const rotateY = ((x - centerX) / centerX) * 3;
        
        card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        card.style.transition = 'transform 0.4s ease';
      });
      
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease';
      });
    });
  }

  // ============================================
  // 8. MAGNETIC BUTTONS (cursor attraction)
  // ============================================
  
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.hero-btn-primary, .hero-btn-secondary, .cta-btn-primary, .btn-primary, .btn-accent');
    
    buttons.forEach(btn => {
      if (btn.dataset.magneticInit) return;
      btn.dataset.magneticInit = 'true';
      
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0) scale(1)';
        btn.style.transition = 'transform 0.3s ease';
      });
      
      btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'transform 0.15s ease';
      });
    });
  }

  // ============================================
  // 9. ANIMATED GRADIENT BORDER ON SCROLL
  // ============================================
  
  function initGradientBorders() {
    const header = document.querySelector('.header, header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50 && lastScroll <= 50) {
        header.style.borderBottom = '2px solid transparent';
        header.style.borderImage = 'linear-gradient(90deg, #0D7377, #14919B, #E8963E, #14919B, #0D7377) 1';
        header.style.transition = 'all 0.3s ease';
      } else if (scrollY <= 50 && lastScroll > 50) {
        header.style.borderBottom = '1px solid var(--border-light, #E5E7EB)';
        header.style.borderImage = 'none';
      }
      
      lastScroll = scrollY;
    }, { passive: true });
  }

  // ============================================
  // 10. TEXT HIGHLIGHT ON SCROLL
  // ============================================
  
  function initTextHighlight() {
    // Find key stats or important text blocks
    const highlights = document.querySelectorAll('.highlight-text, strong[data-highlight], .key-stat');
    
    highlights.forEach(el => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.backgroundSize = '100% 40%';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      el.style.backgroundImage = 'linear-gradient(transparent 60%, rgba(232, 150, 62, 0.2) 60%)';
      el.style.backgroundSize = '0% 40%';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'left bottom';
      el.style.transition = 'background-size 0.8s ease';
      
      observer.observe(el);
    });
  }

  // ============================================
  // INITIALIZE ALL
  // ============================================
  
  function init() {
    // Small delay to not block initial render
    requestAnimationFrame(() => {
      initParallax();
      initScrollProgress();
      initGradientBorders();
      
      // Slightly delayed for DOM stability
      setTimeout(() => {
        initStaggerReveal();
        initSectionTransitions();
        initEnhancedCounters();
        initImageReveals();
        initTiltCards();
        initMagneticButtons();
        initTextHighlight();
      }, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
