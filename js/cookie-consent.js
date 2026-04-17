/* ═══════════════════════════════════════════════════════
   ROAST LAUNCH — Cookie Consent Banner
   GDPR-Compliant | Blocks analytics until explicit consent
   ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────
  const CONSENT_KEY = 'roast_cookie_consent';
  const ANALYTICS_SCRIPTS = [
    { id: 'ga-4', src: 'https://www.googletagmanager.com' },
    { id: 'meta-pixel', src: 'https://connect.facebook.net' }
  ];

  // ── CONSENT STATE MANAGER ──────────────────────────
  const ConsentManager = {
    getConsent() {
      const stored = localStorage.getItem(CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    },

    setConsent(analyticsEnabled) {
      const consent = {
        analytics: analyticsEnabled,
        timestamp: new Date().toISOString(),
        version: 1
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      return consent;
    },

    hasUserDecided() {
      return this.getConsent() !== null;
    },

    isAnalyticsEnabled() {
      const consent = this.getConsent();
      return consent ? consent.analytics : false;
    }
  };

  // ── ANALYTICS BLOCKER ───────────────────────────────
  // Block GA4 and Meta Pixel from loading until consent is given
  const AnalyticsBlocker = {
    blockAnalytics() {
      // Disable dataLayer and gtag until consent
      if (typeof window.dataLayer !== 'undefined') {
        window.dataLayer.push({ 'gtag.config': { 'allow_storage_access': false } });
      }

      // Prevent gtag from sending data
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    },

    enableAnalytics() {
      // Update consent for Google
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }

      // Enable Meta Pixel
      if (typeof window.fbq === 'function') {
        window.fbq('consent', 'grant');
      }
    },

    disableAnalytics() {
      // Keep analytics blocked
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
    }
  };

  // ── BANNER UI ───────────────────────────────────────
  const Banner = {
    create() {
      const banner = document.createElement('div');
      banner.id = 'cookie-consent-banner';
      banner.className = 'cookie-consent-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-labelledby', 'cookie-consent-title');
      banner.setAttribute('aria-describedby', 'cookie-consent-desc');

      banner.innerHTML = `
        <div class="cookie-consent-content">
          <div class="cookie-consent-text">
            <h2 id="cookie-consent-title">We respect your privacy</h2>
            <p id="cookie-consent-desc">
              We use cookies to enhance your experience. Essential cookies are always enabled.
              Analytics cookies help us understand how you use our site so we can improve it.
              <a href="/privacy" class="cookie-consent-link">Learn more about our privacy practices</a>.
            </p>
          </div>
          <div class="cookie-consent-buttons">
            <button class="cookie-consent-btn cookie-consent-btn--secondary" id="cookie-btn-essential">
              Essential Only
            </button>
            <button class="cookie-consent-btn cookie-consent-btn--primary" id="cookie-btn-accept">
              Accept All
            </button>
          </div>
        </div>
      `;

      return banner;
    },

    insert(banner) {
      document.body.appendChild(banner);
    },

    remove() {
      const banner = document.getElementById('cookie-consent-banner');
      if (banner) {
        banner.classList.add('cookie-consent-banner--fade-out');
        setTimeout(() => {
          banner.remove();
        }, 300);
      }
    },

    attachListeners() {
      const acceptBtn = document.getElementById('cookie-btn-accept');
      const essentialBtn = document.getElementById('cookie-btn-essential');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          ConsentManager.setConsent(true);
          AnalyticsBlocker.enableAnalytics();
          this.remove();
        });
      }

      if (essentialBtn) {
        essentialBtn.addEventListener('click', () => {
          ConsentManager.setConsent(false);
          AnalyticsBlocker.disableAnalytics();
          this.remove();
        });
      }
    }
  };

  // ── STYLES ──────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Cookie Consent Banner Styles */
      #cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #FAFAF8;
        border-top: 1px solid #E8E5E0;
        box-shadow: 0 -2px 8px rgba(28, 18, 9, 0.08);
        z-index: 9999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: cookie-consent-slide-up 0.4s ease-out;
      }

      @keyframes cookie-consent-slide-up {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      #cookie-consent-banner.cookie-consent-banner--fade-out {
        animation: cookie-consent-fade-out 0.3s ease-out forwards;
      }

      @keyframes cookie-consent-fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      .cookie-consent-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .cookie-consent-text {
        flex: 1;
        min-width: 0;
      }

      #cookie-consent-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: #1C1209;
        line-height: 1.4;
      }

      #cookie-consent-desc {
        margin: 0;
        font-size: 14px;
        color: #5C5450;
        line-height: 1.5;
      }

      .cookie-consent-link {
        color: #C4612A;
        text-decoration: underline;
        cursor: pointer;
        font-weight: 500;
        transition: color 0.2s ease;
      }

      .cookie-consent-link:hover {
        color: #A84C1F;
      }

      .cookie-consent-buttons {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
      }

      .cookie-consent-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        white-space: nowrap;
      }

      .cookie-consent-btn--primary {
        background-color: #C4612A;
        color: #FAFAF8;
      }

      .cookie-consent-btn--primary:hover {
        background-color: #A84C1F;
        box-shadow: 0 2px 6px rgba(196, 97, 42, 0.2);
      }

      .cookie-consent-btn--primary:active {
        transform: scale(0.98);
      }

      .cookie-consent-btn--secondary {
        background-color: #F7F3EE;
        color: #1C1209;
        border: 1px solid #E8E5E0;
      }

      .cookie-consent-btn--secondary:hover {
        background-color: #E8E5E0;
        border-color: #D9D4CD;
      }

      .cookie-consent-btn--secondary:active {
        transform: scale(0.98);
      }

      /* Responsive Design */
      @media (max-width: 640px) {
        .cookie-consent-content {
          flex-direction: column;
          padding: 16px;
          gap: 16px;
        }

        .cookie-consent-text {
          text-align: left;
        }

        .cookie-consent-buttons {
          width: 100%;
          flex-direction: column;
        }

        .cookie-consent-btn {
          width: 100%;
        }

        #cookie-consent-title {
          font-size: 15px;
        }

        #cookie-consent-desc {
          font-size: 13px;
        }
      }

      /* Print styles */
      @media print {
        #cookie-consent-banner {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── INITIALIZATION ──────────────────────────────────
  function init() {
    // Block analytics by default
    AnalyticsBlocker.blockAnalytics();

    // Check if user has already made a choice
    if (ConsentManager.hasUserDecided()) {
      // User has made a choice; apply their preference
      if (ConsentManager.isAnalyticsEnabled()) {
        AnalyticsBlocker.enableAnalytics();
      }
      return;
    }

    // User hasn't decided yet; show banner
    injectStyles();
    const banner = Banner.create();
    Banner.insert(banner);
    Banner.attachListeners();
  }

  // ── RUN ON DOM READY ────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
