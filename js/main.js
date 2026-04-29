/* ═══════════════════════════════════════════════════════
   ROAST LAUNCH — Site JavaScript
   ═══════════════════════════════════════════════════════ */

// Force scroll to top on fresh page loads (not back/forward nav)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

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
      // Lock body scroll when menu is open
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
      // Close More dropdown when closing mobile menu
      if (!navMenu.classList.contains('open')) {
        const moreW = document.querySelector('.nav-more');
        if (moreW) { moreW.classList.remove('open'); }
      }
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── MORE DROPDOWN ──────────────────────────────────
  const moreBtn = document.querySelector('.nav-more-btn');
  const moreWrap = document.querySelector('.nav-more');
  if (moreBtn && moreWrap) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = moreWrap.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', isOpen);
    });
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!moreWrap.contains(e.target)) {
        moreWrap.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
      }
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && moreWrap.classList.contains('open')) {
        moreWrap.classList.remove('open');
        moreBtn.setAttribute('aria-expanded', 'false');
        moreBtn.focus();
      }
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
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('stagger--visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

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
    }, 1500);

  } else {
    fadeEls.forEach(el => el.classList.add('fade-in--visible'));
    staggerEls.forEach(el => el.classList.add('stagger--visible'));
  }

  // ── ANIMATED MODULE NUMBERS ────────────────────────
  // Module numbers "count up" when they scroll into view
  // Numbers start as "00" in HTML with data-target holding the real value
  const moduleNums = document.querySelectorAll('.module-number[data-target]');
  if (moduleNums.length && 'IntersectionObserver' in window) {
    const numObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          if (isNaN(target)) return;
          let current = 0;
          // Stagger start based on index for quick cascade effect
          setTimeout(() => {
            const interval = setInterval(() => {
              current++;
              el.textContent = String(current).padStart(2, '0');
              if (current >= target) clearInterval(interval);
            }, 60);
          }, (target - 1) * 80);
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

  // ── PREVENT TEXT ORPHANS ───────────────────────────
  // Bind the trailing words of every paragraph / heading / list item
  // with non-breaking spaces so a single short word never wraps to its
  // own line ("Day 5." dropping below "decision on", etc.).
  // `text-wrap: pretty` (in style.css) is only a HINT to the browser;
  // NBSP is the deterministic typographic fix.
  //
  // Algorithm: walk backward through each prose element building a
  // "tail segment" until adding the next word would push it past
  // TAIL_LIMIT chars; replace each crossed regular space with NBSP.
  // Pre-existing NBSPs are counted but not re-replaced, which makes
  // the pass IDEMPOTENT — re-runs are no-ops, so the MutationObserver
  // can't feedback-loop and progressively destroy the layout.
  (function preventOrphans() {
    const PROSE_SELECTOR =
      'p, li, dd, figcaption, blockquote';
    const TAIL_LIMIT = 15;

    function fixAll() {
      document.querySelectorAll(PROSE_SELECTOR).forEach(fixOne);
    }

    function fixOne(el) {
      if (el.closest('input, textarea, [contenteditable="true"]')) return;

      // Skip elements with too few words: binding 2-of-3 words can
      // INVERT the layout — leaving the first short word ("A") alone
      // on its own line while the bound pair wraps together.
      const words = (el.textContent || '').trim().split(/\s+/).filter(Boolean);
      if (words.length < 4) return;

      const textNodes = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n = walker.nextNode();
      while (n) {
        textNodes.push(n);
        n = walker.nextNode();
      }
      if (!textNodes.length) return;

      let combined = '';
      const offsets = [];
      for (const tn of textNodes) {
        offsets.push(combined.length);
        combined += tn.textContent || '';
      }

      const trimmed = combined.replace(/\s+$/, '');
      if (!trimmed.length) return;

      const replacements = [];
      let cursor = trimmed.length;
      let tailLen = 0;

      while (cursor > 0) {
        let wsIdx = -1;
        for (let i = cursor - 1; i >= 0; i--) {
          const ch = trimmed[i];
          if (ch === ' ' || ch === '\u00A0' || ch === '\t' || ch === '\n') {
            wsIdx = i;
            break;
          }
        }
        if (wsIdx < 0) break;

        const wordLen = cursor - wsIdx - 1;
        if (wordLen <= 0) {
          cursor = wsIdx;
          continue;
        }

        const newTail = tailLen === 0 ? wordLen : tailLen + 1 + wordLen;
        if (tailLen > 0 && newTail > TAIL_LIMIT) break;

        if (trimmed[wsIdx] === ' ') replacements.push(wsIdx);
        tailLen = newTail;
        cursor = wsIdx;
      }

      if (!replacements.length) return;

      replacements.sort((a, b) => b - a);
      for (const pos of replacements) {
        let idx = 0;
        for (let i = textNodes.length - 1; i >= 0; i--) {
          if (offsets[i] <= pos) {
            idx = i;
            break;
          }
        }
        const tn = textNodes[idx];
        const local = pos - offsets[idx];
        const txt = tn.textContent || '';
        if (txt[local] !== ' ') continue;
        tn.textContent = txt.slice(0, local) + '\u00A0' + txt.slice(local + 1);
      }
    }

    // Initial pass after layout (two RAFs let the browser paint first).
    requestAnimationFrame(function () {
      requestAnimationFrame(fixAll);
    });

    // Catch dynamic content (newsletter success card, async injected
    // copy, etc.). RAF-debounced + idempotent so bursts of mutations
    // coalesce into a single no-op pass.
    let scheduled = false;
    const observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        fixAll();
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  })();

});
