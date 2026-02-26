/**
 * UzunYaşa — Odometer Counter System
 * Each digit rolls independently like a mechanical odometer.
 * 
 * Usage: Add data-odometer="10000" data-suffix="+" to any element.
 * Or it auto-detects .stat-value elements with numbers.
 * 
 * Respects prefers-reduced-motion.
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // CSS INJECTION
  // ============================================
  
  const style = document.createElement('style');
  style.textContent = `
    .odometer-wrapper {
      display: inline-flex;
      align-items: baseline;
      overflow: hidden;
      line-height: 1;
    }
    
    .odometer-digit-slot {
      display: inline-block;
      position: relative;
      overflow: hidden;
      height: 1.15em;
      width: 0.65em;
      text-align: center;
    }
    
    .odometer-digit-slot.narrow {
      width: 0.4em;
    }
    
    .odometer-digit-track {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      transition: transform 1.8s cubic-bezier(0.23, 1, 0.32, 1);
    }
    
    .odometer-digit-track .odometer-digit {
      display: block;
      height: 1.15em;
      line-height: 1.15em;
      text-align: center;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum";
    }
    
    .odometer-static {
      display: inline;
      line-height: 1.15em;
    }
    
    .odometer-suffix {
      display: inline;
      line-height: 1.15em;
      opacity: 0;
      transform: translateX(-5px);
      transition: opacity 0.5s ease 1.6s, transform 0.5s ease 1.6s;
    }
    
    .odometer-suffix.visible {
      opacity: 1;
      transform: translateX(0);
    }
    
    .odometer-prefix {
      display: inline;
      line-height: 1.15em;
    }
    
    /* Glow effect when counting completes */
    .odometer-complete {
      animation: odometerGlow 1s ease forwards;
    }
    
    @keyframes odometerGlow {
      0% { text-shadow: none; }
      50% { text-shadow: 0 0 20px rgba(13, 115, 119, 0.4), 0 0 40px rgba(13, 115, 119, 0.15); }
      100% { text-shadow: none; }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .odometer-digit-track {
        transition: none !important;
      }
      .odometer-suffix {
        transition: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // ODOMETER BUILDER
  // ============================================
  
  function buildOdometer(el) {
    const text = el.textContent.trim();
    const match = text.match(/([\d,.%]+)/);
    if (!match) return; // "Kanıta Dayalı" — skip non-numeric
    
    const numStr = match[1];
    const numIndex = text.indexOf(numStr);
    const prefix = text.substring(0, numIndex);
    const suffix = text.substring(numIndex + numStr.length);
    
    // Parse the number parts
    const chars = numStr.split('');
    
    // Store original data
    el.dataset.odometerTarget = numStr;
    el.dataset.odometerPrefix = prefix;
    el.dataset.odometerSuffix = suffix;
    
    // Build the odometer HTML
    const wrapper = document.createElement('span');
    wrapper.className = 'odometer-wrapper';
    
    // Prefix
    if (prefix) {
      const prefixEl = document.createElement('span');
      prefixEl.className = 'odometer-prefix';
      prefixEl.textContent = prefix;
      wrapper.appendChild(prefixEl);
    }
    
    // Digit slots
    chars.forEach((char, i) => {
      if (/\d/.test(char)) {
        const slot = document.createElement('span');
        slot.className = 'odometer-digit-slot';
        
        const track = document.createElement('span');
        track.className = 'odometer-digit-track';
        track.dataset.targetDigit = char;
        track.dataset.index = i;
        
        // Create digits 0-9
        for (let d = 0; d <= 9; d++) {
          const digit = document.createElement('span');
          digit.className = 'odometer-digit';
          digit.textContent = d;
          track.appendChild(digit);
        }
        
        // Start at 0
        track.style.transform = 'translateY(0)';
        
        slot.appendChild(track);
        wrapper.appendChild(slot);
      } else {
        // Non-digit characters (comma, dot, %)
        const staticEl = document.createElement('span');
        staticEl.className = 'odometer-static';
        if (char === ',' || char === '.') {
          staticEl.classList.add('narrow');
        }
        staticEl.textContent = char;
        wrapper.appendChild(staticEl);
      }
    });
    
    // Suffix
    if (suffix) {
      const suffixEl = document.createElement('span');
      suffixEl.className = 'odometer-suffix';
      suffixEl.textContent = suffix;
      wrapper.appendChild(suffixEl);
    }
    
    // Replace content
    el.textContent = '';
    el.appendChild(wrapper);
    
    return wrapper;
  }

  // ============================================
  // ANIMATE TO TARGET
  // ============================================
  
  function animateOdometer(el) {
    const wrapper = el.querySelector('.odometer-wrapper');
    if (!wrapper) return;
    
    const tracks = wrapper.querySelectorAll('.odometer-digit-track');
    const totalTracks = tracks.length;
    
    tracks.forEach((track, i) => {
      const target = parseInt(track.dataset.targetDigit);
      
      if (prefersReducedMotion) {
        // Instant for reduced motion
        track.style.transform = `translateY(-${target * (100 / 10)}%)`;
        return;
      }
      
      // Stagger each digit (rightmost starts first for odometer feel)
      const reverseIndex = totalTracks - 1 - i;
      const delay = reverseIndex * 0.08; // 80ms stagger from right to left
      
      // Extra spins for dramatic effect (higher digits spin more)
      const extraSpins = Math.max(0, Math.floor((totalTracks - i) * 0.5));
      const totalDistance = target + (extraSpins * 10);
      
      // Temporarily add extra digits for the spin
      if (extraSpins > 0) {
        for (let spin = 0; spin < extraSpins; spin++) {
          for (let d = 0; d <= 9; d++) {
            const digit = document.createElement('span');
            digit.className = 'odometer-digit';
            digit.textContent = d;
            track.appendChild(digit);
          }
        }
      }
      
      const totalDigits = 10 + (extraSpins * 10);
      
      setTimeout(() => {
        track.style.transition = `transform ${1.4 + reverseIndex * 0.15}s cubic-bezier(0.23, 1, 0.32, 1)`;
        track.style.transform = `translateY(-${totalDistance * (100 / totalDigits)}%)`;
      }, delay * 1000);
    });
    
    // Show suffix after animation
    const suffix = wrapper.querySelector('.odometer-suffix');
    if (suffix) {
      suffix.classList.add('visible');
    }
    
    // Glow effect on completion
    const maxDuration = 1.4 + totalTracks * 0.15 + totalTracks * 0.08;
    setTimeout(() => {
      el.classList.add('odometer-complete');
    }, maxDuration * 1000);
  }

  // ============================================
  // DONUT CHART COUNTER (for %32.1 etc.)
  // ============================================
  
  function animateDonutText(svgText) {
    const text = svgText.textContent.trim();
    const match = text.match(/([\d.]+)/);
    if (!match) return;
    
    const target = parseFloat(match[0]);
    const prefix = text.substring(0, text.indexOf(match[0]));
    const suffix = text.substring(text.indexOf(match[0]) + match[0].length);
    const hasDecimal = match[0].includes('.');
    const duration = 2000;
    const start = performance.now();
    
    svgText.textContent = prefix + '0' + suffix;
    
    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = eased * target;
      
      if (hasDecimal) {
        svgText.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        svgText.textContent = prefix + Math.round(current) + suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        svgText.textContent = text; // Restore exact original
      }
    }
    
    requestAnimationFrame(tick);
  }

  // ============================================
  // HARVARD STAT COUNTER (the big +10 years)
  // ============================================
  
  function initHarvardCounter() {
    // Find the Harvard "5 habits = +10 years" section
    document.querySelectorAll('text, [font-size]').forEach(el => {
      // SVG text elements in the Harvard infographic
    });
  }

  // ============================================
  // INITIALIZE
  // ============================================
  
  function init() {
    // 1. Build odometers for stat values
    const statValues = document.querySelectorAll('.stat-value');
    const odometerElements = [];
    
    statValues.forEach(el => {
      if (el.dataset.odometerInit) return;
      el.dataset.odometerInit = 'true';
      
      const text = el.textContent.trim();
      if (!/\d/.test(text)) return; // Skip non-numeric like "Kanıta Dayalı"
      
      const wrapper = buildOdometer(el);
      if (wrapper) {
        odometerElements.push(el);
      }
    });
    
    // 2. Also handle elements with data-odometer attribute
    document.querySelectorAll('[data-odometer]').forEach(el => {
      if (el.dataset.odometerInit) return;
      el.dataset.odometerInit = 'true';
      
      const target = el.dataset.odometer;
      const suffix = el.dataset.odometerSuffix || '';
      el.textContent = target + suffix;
      
      const wrapper = buildOdometer(el);
      if (wrapper) {
        odometerElements.push(el);
      }
    });
    
    // 3. Observe for scroll trigger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateOdometer(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    odometerElements.forEach(el => observer.observe(el));
    
    // 4. SVG text counters (donut charts etc.)
    const svgTexts = document.querySelectorAll('svg text');
    const svgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find text elements inside this SVG
          const texts = entry.target.querySelectorAll('text');
          texts.forEach(t => {
            if (/\d/.test(t.textContent) && !t.dataset.counterDone) {
              t.dataset.counterDone = 'true';
              animateDonutText(t);
            }
          });
          svgObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    
    document.querySelectorAll('svg').forEach(svg => {
      if (svg.querySelector('text') && /\d/.test(svg.textContent)) {
        svgObserver.observe(svg);
      }
    });
  }

  // Remove old counter code conflict — disable existing statsObserver
  // The old code in index.html has its own counter; we override it
  window.__odometerActive = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
