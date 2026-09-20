/**
 * MAUSAM Atmospheric Intelligence Platform
 * Cookie & Local Storage Consent System
 * Feature #5 Implementation
 */
(function () {
  'use strict';

  const CONSENT_KEY = 'mausam_cookie_consent';

  function getConsent() {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  function saveConsent(analyticsEnabled) {
    try {
      const state = {
        analytics: Boolean(analyticsEnabled),
        timestamp: Date.now(),
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent('mausam_consent_changed', { detail: state })
      );
      removeBanner();
      closePreferences();
      return state;
    } catch (e) {
      console.warn('[MAUSAM Consent] Storage unavailable:', e);
      return null;
    }
  }

  function removeBanner() {
    const banner = document.getElementById('mausam-consent-banner');
    if (banner) {
      banner.remove();
    }
  }

  function closePreferences() {
    const overlay = document.getElementById('mausam-consent-modal-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  function openPreferences() {
    closePreferences();

    const currentConsent = getConsent();
    const analyticsChecked = currentConsent ? currentConsent.analytics : false;

    const overlay = document.createElement('div');
    overlay.id = 'mausam-consent-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'mausam-pref-title');

    overlay.innerHTML = `
      <div class="mausam-consent-modal">
        <h2 id="mausam-pref-title">Storage & Privacy Preferences</h2>
        <p class="desc">
          MAUSAM stores minimal preference state in your browser (such as your chosen location and temperature unit). We do not track personal identities or sell citizen data.
        </p>

        <div class="mausam-consent-pref-card">
          <div class="mausam-consent-pref-header">
            <span class="mausam-consent-pref-title">Essential Storage</span>
            <span class="mausam-consent-badge-required">Always Active</span>
          </div>
          <p class="mausam-consent-pref-desc">
            Required for local weather station caching, selected location preferences, emergency warning dismissals, and core offline telemetry persistence.
          </p>
        </div>

        <div class="mausam-consent-pref-card">
          <div class="mausam-consent-pref-header">
            <label for="mausam-pref-analytics" class="mausam-consent-pref-title" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="mausam-pref-analytics" ${analyticsChecked ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #0b72b9;">
              Anonymous Telemetry & Analytics
            </label>
            <span style="font-size: 11px; color: #94a3b8;">Optional</span>
          </div>
          <p class="mausam-consent-pref-desc">
            Allows anonymous operational error counting and page-view frequency to assist IMD meteorological data reliability. No personal information or exact GPS coords are logged.
          </p>
        </div>

        <div class="mausam-consent-modal-actions">
          <button type="button" class="mausam-consent-btn mausam-consent-btn-secondary" id="mausam-pref-cancel-btn">
            Cancel
          </button>
          <button type="button" class="mausam-consent-btn mausam-consent-btn-primary" id="mausam-pref-save-btn">
            Save Preferences
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Trap focus / key handlers
    const saveBtn = document.getElementById('mausam-pref-save-btn');
    const cancelBtn = document.getElementById('mausam-pref-cancel-btn');
    const analyticsCheckbox = document.getElementById('mausam-pref-analytics');

    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        saveConsent(analyticsCheckbox.checked);
      });
      saveBtn.focus();
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closePreferences);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closePreferences();
      }
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closePreferences();
      }
    });
  }

  function showBannerIfNeeded() {
    if (getConsent() !== null) {
      return;
    }

    if (document.getElementById('mausam-consent-banner')) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'mausam-consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Storage and privacy notice');

    banner.innerHTML = `
      <div class="mausam-consent-container">
        <p class="mausam-consent-text">
          <strong>MAUSAM Open Data & Storage Notice:</strong> We store minimal local preferences to preserve your selected weather observatory and radar caches. We never sell personal information. You can accept optional anonymous usage analytics or customize your preferences anytime.
        </p>
        <div class="mausam-consent-actions">
          <button type="button" class="mausam-consent-btn mausam-consent-btn-text" id="mausam-btn-manage">
            Manage Preferences
          </button>
          <button type="button" class="mausam-consent-btn mausam-consent-btn-secondary" id="mausam-btn-reject">
            Reject Optional
          </button>
          <button type="button" class="mausam-consent-btn mausam-consent-btn-primary" id="mausam-btn-accept">
            Accept Optional
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    const acceptBtn = document.getElementById('mausam-btn-accept');
    const rejectBtn = document.getElementById('mausam-btn-reject');
    const manageBtn = document.getElementById('mausam-btn-manage');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        saveConsent(true);
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        saveConsent(false);
      });
    }

    if (manageBtn) {
      manageBtn.addEventListener('click', function () {
        openPreferences();
      });
    }
  }

  // Global interface
  window.MausamConsent = {
    getConsent: getConsent,
    saveConsent: saveConsent,
    acceptAll: function () { return saveConsent(true); },
    rejectAll: function () { return saveConsent(false); },
    openPreferences: openPreferences,
  };

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBannerIfNeeded);
  } else {
    showBannerIfNeeded();
  }
})();
