/**
 * UzunYaşa — Design Details Bundle
 * #4 Animated SVG micro-icons
 * #5 Custom cursor  
 * #6 Trust badges marquee
 * 
 * Respects prefers-reduced-motion.
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // STYLES
  // ============================================
  
  const style = document.createElement('style');
  style.textContent = `
    /* ===== #5 CUSTOM CURSOR ===== */
    
    /* Only on desktop */
    @media (hover: hover) and (pointer: fine) {
      /* Custom cursor dot follower */
      .cursor-dot {
        position: fixed;
        top: 0;
        left: 0;
        width: 8px;
        height: 8px;
        background: #0D7377;
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        transition: transform 0.15s ease, opacity 0.3s ease, width 0.3s ease, height 0.3s ease, background 0.3s ease;
        mix-blend-mode: difference;
        opacity: 0;
      }
      
      .cursor-dot.visible {
        opacity: 1;
      }
      
      .cursor-ring {
        position: fixed;
        top: 0;
        left: 0;
        width: 36px;
        height: 36px;
        border: 1.5px solid rgba(13, 115, 119, 0.35);
        border-radius: 50%;
        pointer-events: none;
        z-index: 99998;
        transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease, opacity 0.3s ease;
        opacity: 0;
      }
      
      .cursor-ring.visible {
        opacity: 1;
      }
      
      /* Hover states */
      .cursor-dot.hovering-link {
        width: 40px;
        height: 40px;
        background: rgba(232, 150, 62, 0.15);
        mix-blend-mode: normal;
        border: 2px solid rgba(232, 150, 62, 0.5);
      }
      
      .cursor-ring.hovering-link {
        width: 50px;
        height: 50px;
        border-color: transparent;
      }
      
      .cursor-dot.hovering-button {
        width: 50px;
        height: 50px;
        background: rgba(232, 150, 62, 0.1);
        mix-blend-mode: normal;
        border: 2px solid rgba(232, 150, 62, 0.6);
      }
      
      .cursor-ring.hovering-button {
        width: 60px;
        height: 60px;
        border-color: transparent;
      }
      
      /* Hide on touch/mobile */
      body.custom-cursor-active {
        cursor: none;
      }
      
      body.custom-cursor-active a,
      body.custom-cursor-active button,
      body.custom-cursor-active [class*="btn"],
      body.custom-cursor-active input,
      body.custom-cursor-active select,
      body.custom-cursor-active textarea {
        cursor: none;
      }
    }
    
    /* ===== #6 TRUST BADGES MARQUEE ===== */
    
    .trust-marquee {
      width: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #f0fafa 0%, #faf8f0 100%);
      border-bottom: 1px solid rgba(13, 115, 119, 0.08);
      padding: 0.6rem 0;
      position: relative;
    }
    
    .trust-marquee::before,
    .trust-marquee::after {
      content: '';
      position: absolute;
      top: 0;
      width: 80px;
      height: 100%;
      z-index: 2;
      pointer-events: none;
    }
    
    .trust-marquee::before {
      left: 0;
      background: linear-gradient(90deg, #f0fafa, transparent);
    }
    
    .trust-marquee::after {
      right: 0;
      background: linear-gradient(-90deg, #faf8f0, transparent);
    }
    
    .trust-marquee-track {
      display: flex;
      animation: marqueeScroll 35s linear infinite;
      width: max-content;
    }
    
    .trust-marquee:hover .trust-marquee-track {
      animation-play-state: paused;
    }
    
    .trust-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1.5rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: #4B5563;
      white-space: nowrap;
      letter-spacing: 0.01em;
      font-family: 'Inter', sans-serif;
    }
    
    .trust-badge-icon {
      font-size: 1rem;
      flex-shrink: 0;
    }
    
    .trust-badge-separator {
      color: rgba(13, 115, 119, 0.2);
      font-size: 0.6rem;
      padding: 0 0.5rem;
    }
    
    @keyframes marqueeScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    /* ===== #4 ANIMATED SVG ICONS ===== */
    
    .animated-icon {
      display: inline-block;
    }
    
    .animated-icon svg {
      overflow: visible;
    }
    
    /* Heartbeat pulse */
    .icon-heartbeat path.heartbeat-line {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      animation: heartbeatDraw 2s ease forwards;
    }
    
    @keyframes heartbeatDraw {
      to { stroke-dashoffset: 0; }
    }
    
    /* DNA helix rotation */
    .icon-dna {
      animation: dnaSpin 8s linear infinite;
    }
    
    @keyframes dnaSpin {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    
    /* Pulse circle for live indicators */
    .icon-pulse-circle {
      animation: pulseCircle 2s ease-in-out infinite;
    }
    
    @keyframes pulseCircle {
      0%, 100% { r: 4; opacity: 1; }
      50% { r: 7; opacity: 0.5; }
    }
    
    /* Checkmark draw */
    .icon-checkmark path {
      stroke-dasharray: 30;
      stroke-dashoffset: 30;
    }
    
    .icon-checkmark.animate path {
      animation: checkDraw 0.6s ease forwards;
    }
    
    @keyframes checkDraw {
      to { stroke-dashoffset: 0; }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .trust-marquee-track {
        animation: none !important;
      }
      .icon-dna {
        animation: none !important;
      }
      .icon-pulse-circle {
        animation: none !important;
      }
      .cursor-dot, .cursor-ring {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // #5 CUSTOM CURSOR
  // ============================================
  
  function initCustomCursor() {
    // Only on desktop with fine pointer
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (prefersReducedMotion) return;
    
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);
    
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let visible = false;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!visible) {
        visible = true;
        dot.classList.add('visible');
        ring.classList.add('visible');
        document.body.classList.add('custom-cursor-active');
      }
      
      // Dot follows instantly
      dot.style.left = (mouseX - dot.offsetWidth / 2) + 'px';
      dot.style.top = (mouseY - dot.offsetHeight / 2) + 'px';
    });
    
    // Ring follows with delay (smooth trailing)
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      
      ring.style.left = (ringX - ring.offsetWidth / 2) + 'px';
      ring.style.top = (ringY - ring.offsetHeight / 2) + 'px';
      
      requestAnimationFrame(animateRing);
    }
    animateRing();
    
    // Hover detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, [class*="btn"], button');
      const isButton = e.target.closest('button, [class*="btn-primary"], [class*="btn-accent"], .hero-btn-primary, .hero-btn-secondary');
      
      if (isButton) {
        dot.classList.add('hovering-button');
        dot.classList.remove('hovering-link');
        ring.classList.add('hovering-button');
        ring.classList.remove('hovering-link');
      } else if (target) {
        dot.classList.add('hovering-link');
        dot.classList.remove('hovering-button');
        ring.classList.add('hovering-link');
        ring.classList.remove('hovering-button');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, [class*="btn"], button');
      if (target) {
        dot.classList.remove('hovering-link', 'hovering-button');
        ring.classList.remove('hovering-link', 'hovering-button');
      }
    });
    
    // Hide on mouse leave window
    document.addEventListener('mouseleave', () => {
      dot.classList.remove('visible');
      ring.classList.remove('visible');
    });
    
    document.addEventListener('mouseenter', () => {
      dot.classList.add('visible');
      ring.classList.add('visible');
    });
  }

  // ============================================
  // #6 TRUST BADGES MARQUEE
  // ============================================
  
  function initTrustMarquee() {
    // Only on pages with a header (mainly homepage and section pages)
    const header = document.querySelector('.header, header');
    if (!header) return;
    
    // Don't add to blog article pages or tool pages
    const isArticle = document.querySelector('article');
    const isTool = window.location.pathname.includes('/araclar/');
    if (isArticle || isTool) return;
    
    const badges = [
      { icon: '📚', text: '50+ Bilimsel Rehber' },
      { icon: '🔬', text: 'PubMed Referanslı İçerik' },
      { icon: '👨‍⚕️', text: 'Uzman Hekim Kurulu' },
      { icon: '🇹🇷', text: 'Türkiye Sağlık Verisi' },
      { icon: '🧬', text: 'Kanıta Dayalı Bilgi' },
      { icon: '📊', text: '10,000+ Aylık Okuyucu' },
      { icon: '🏥', text: '12 Branş Danışma Kurulu' },
      { icon: '✅', text: 'Bağımsız & Reklamsız' },
      { icon: '📱', text: 'Ücretsiz İnteraktif Araçlar' },
      { icon: '🔄', text: 'Güncel Araştırma Takibi' },
    ];
    
    const marquee = document.createElement('div');
    marquee.className = 'trust-marquee';
    
    const track = document.createElement('div');
    track.className = 'trust-marquee-track';
    
    // Duplicate badges for seamless loop
    const badgeHTML = badges.map(b => 
      `<span class="trust-badge"><span class="trust-badge-icon">${b.icon}</span>${b.text}</span><span class="trust-badge-separator">•</span>`
    ).join('');
    
    track.innerHTML = badgeHTML + badgeHTML; // Double for seamless
    marquee.appendChild(track);
    
    // Insert after header
    header.after(marquee);
    
    // Adjust body padding to account for marquee height
    const headerHeight = header.offsetHeight;
    const marqueeHeight = marquee.offsetHeight;
    
    // Find hero or first section and adjust top padding
    const hero = document.querySelector('.hero');
    if (hero) {
      const currentPadding = parseInt(window.getComputedStyle(hero).paddingTop);
      hero.style.paddingTop = (currentPadding + marqueeHeight) + 'px';
    }
  }

  // ============================================
  // #4 ANIMATED SVG MICRO-ICONS
  // ============================================
  
  function initAnimatedIcons() {
    if (prefersReducedMotion) return;
    
    // Replace static stat icons with animated versions on scroll
    const statIcons = document.querySelectorAll('.stat-icon svg');
    
    statIcons.forEach(svg => {
      if (svg.dataset.animInit) return;
      svg.dataset.animInit = 'true';
      
      // Add subtle breathing animation to all stat icons
      svg.style.transition = 'transform 0.3s ease';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Bounce-in animation
            entry.target.style.animation = 'iconBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      svg.style.opacity = '0';
      svg.style.transform = 'scale(0.5)';
      observer.observe(svg);
    });
    
    // Add the bounce keyframe
    const bounceStyle = document.createElement('style');
    bounceStyle.textContent = `
      @keyframes iconBounceIn {
        0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
        50% { opacity: 1; transform: scale(1.1) rotate(3deg); }
        70% { transform: scale(0.95) rotate(-1deg); }
        100% { opacity: 1; transform: scale(1) rotate(0deg); }
      }
    `;
    document.head.appendChild(bounceStyle);
    
    // Add continuous subtle pulse to advisory board icons
    const boardIcons = document.querySelectorAll('.board-icon, .advisory-icon, .danisma-icon');
    boardIcons.forEach((icon, i) => {
      icon.style.animation = `iconFloat ${3 + (i % 3)}s ease-in-out infinite ${i * 0.3}s`;
    });
    
    const floatStyle = document.createElement('style');
    floatStyle.textContent = `
      @keyframes iconFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(floatStyle);
  }

  // ============================================
  // INITIALIZE
  // ============================================
  
  function init() {
    requestAnimationFrame(() => {
      initCustomCursor();
      initTrustMarquee();
      
      setTimeout(() => {
        initAnimatedIcons();
      }, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
