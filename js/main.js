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

  // ── SCROLL ANIMATIONS ─────────────────────────────
  // Fade-in and stagger animations with robust fallback
  // to prevent sections from staying invisible if the
  // IntersectionObserver doesn't fire reliably.

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
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('stagger--visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

    fadeEls.forEach(el => fadeObserver.observe(el));
    staggerEls.forEach(el => staggerObserver.observe(el));

    // Safety fallback: if any element is STILL invisible after
    // 1.5 seconds, force it visible. This catches edge cases
    // where the observer fails to fire (e.g. elements already
    // in viewport, slow layout, GitHub Pages quirks).
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
    // No IntersectionObserver support — show everything immediately
    fadeEls.forEach(el => el.classList.add('fade-in--visible'));
    staggerEls.forEach(el => el.classList.add('stagger--visible'));
  }

  // ── FAQ ACCORDION ──────────────────────────────────
  // Works with both <details>/<summary> elements and
  // the older .faq-item h3 / .faq-answer pattern.
  document.querySelectorAll('.faq-item h3').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.parentElement;
      const answer = item.querySelector('.faq-answer');
      if (!answer) return;
      const isOpen = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item.active').forEach(openItem => {
        openItem.classList.remove('active');
        const a = openItem.querySelector('.faq-answer');
        if (a) a.style.maxHeight = null;
      });

      // Toggle this
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
  // Form submits silently into a hidden iframe so there's no
  // redirect — the user stays on the page and sees a branded
  // success message fade in where the form was.

  // Single hidden iframe shared by all forms on the page
  const nlIframe = document.createElement('iframe');
  nlIframe.name = 'nl-iframe';
  nlIframe.setAttribute('style', 'position:absolute;width:0;height:0;border:0;');
  nlIframe.setAttribute('aria-hidden', 'true');
  nlIframe.setAttribute('tabindex', '-1');
  document.body.appendChild(nlIframe);

  document.querySelectorAll('.newsletter-form').forEach(form => {

    // Get or create a .newsletter-wrap around the form
    let wrap = form.closest('.newsletter-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'newsletter-wrap';
      form.parentNode.insertBefore(wrap, form);
      wrap.appendChild(form);
    }

    // Get or create the success message inside the wrap
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

    // Point form at the hidden iframe so the redirect is invisible
    form.target = 'nl-iframe';

    form.addEventListener('submit', () => {
      // Fade the form out
      form.classList.add('newsletter-form--out');
      // After fade, hide form and reveal success state
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('newsletter-success--visible');
      }, 320);
    });
  });

});
