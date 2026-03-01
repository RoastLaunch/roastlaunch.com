/* ═══════════════════════════════════════════════════════
   ROAST LAUNCH — Site JavaScript
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── NAV SCROLL EFFECT ──────────────────────────────
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 20);
    });
  }

  // ── MOBILE MENU TOGGLE ─────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // ── HERO PARALLAX-LITE ─────────────────────────────
  // Subtle depth: hero content shifts slightly as you scroll
  const hero = document.querySelector('.hero-content');
  if (hero) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            hero.style.transform = `translateY(${y * 0.15}px)`;
            hero.style.opacity = Math.max(1 - y / (window.innerHeight * 0.7), 0);
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ── SCROLL ANIMATIONS ─────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-in');
  const staggerEls = document.querySelectorAll('.stagger');

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('stagger--visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => fadeObserver.observe(el));
    staggerEls.forEach(el => staggerObserver.observe(el));

    // Immediately trigger fast-entrance sections (above-the-fold)
    document.querySelectorAll('.fade-in--fast').forEach(el => {
      setTimeout(() => {
        el.classList.add('fade-in--visible');
        fadeObserver.unobserve(el);
        // Also trigger stagger children inside fast sections
        const stagger = el.querySelector('.stagger');
        if (stagger) {
          stagger.classList.add('stagger--visible');
          staggerObserver.unobserve(stagger);
        }
      }, 150);
    });

    // Safety fallback
    setTimeout(() => {
      fadeEls.forEach(el => {
        if (!el.classList.contains('fade-in--visible')) {
          el.classList.add('fade-in--visible');
        }
      });
      staggerEls.forEach(el => {
        if (!el.classList.contains('stagger--visible')) {
          el.classList.add('stagger--visible');
        }
      });
    }, 2500);

  } else {
    fadeEls.forEach(el => el.classList.add('fade-in--visible'));
    staggerEls.forEach(el => el.classList.add('stagger--visible'));
  }

  // ── ANIMATED MODULE NUMBERS ────────────────────────
  // Module numbers "count up" when they scroll into view
  const moduleNums = document.querySelectorAll('.module-number');
  if (moduleNums.length && 'IntersectionObserver' in window) {
    const numObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.textContent);
          if (isNaN(target)) return;
          let current = 0;
          el.textContent = '00';
          // Stagger start based on target number for cascade effect
          setTimeout(() => {
            const interval = setInterval(() => {
              current++;
              el.textContent = String(current).padStart(2, '0');
              if (current >= target) clearInterval(interval);
            }, 120);
          }, (target - 1) * 120);
          numObserver.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    moduleNums.forEach(el => numObserver.observe(el));
  }

  // ── FAQ ACCORDION ──────────────────────────────────
  document.querySelectorAll('.faq-item h3').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const answer = item.querySelector('.faq-answer');
      if (!answer) return;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        openItem.classList.remove('active');
        const a = openItem.querySelector('.faq-answer');
        if (a) a.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── NEWSLETTER HIDDEN IFRAME SUBMISSION ─────────────
  const nlIframe = document.createElement('iframe');
  nlIframe.name = 'nl-iframe';
  nlIframe.setAttribute('style', 'position:absolute;width:0;height:0;border:0;');
  nlIframe.setAttribute('aria-hidden', 'true');
  nlIframe.setAttribute('tabindex', '-1');
  document.body.appendChild(nlIframe);

  document.querySelectorAll('.newsletter-form').forEach(form => {

    let wrap = form.closest('.newsletter-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'newsletter-wrap';
      form.parentNode.insertBefore(wrap, form);
      wrap.appendChild(form);
    }

    let success = wrap.querySelector('.newsletter-success');
    if (!success) {
      success = document.createElement('div');
      success.className = 'newsletter-success';
      success.setAttribute('aria-live', 'polite');
      success.innerHTML =
        '<div class="newsletter-success-icon">&#10003;</div>' +
        '<p class="newsletter-success-title">Welcome to the community!</p>' +
        '<p class="newsletter-success-sub">Check your inbox to confirm your subscription.</p>';
      wrap.appendChild(success);
    }

    form.target = 'nl-iframe';

    form.addEventListener('submit', () => {
      form.classList.add('newsletter-form--out');
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('newsletter-success--visible');
      }, 320);
    });
  });

});
