/**
 * MAUSAM Atmospheric Intelligence Platform
 * Privacy-Conscious Anonymous Analytics Engine
 * Feature #19 Implementation
 */
(function () {
  'use strict';

  // In-memory telemetry buffer (not persisted across sessions)
  const eventBuffer = [];
  const MAX_BUFFER = 50;

  function isAnalyticsPermitted() {
    if (typeof window.MausamConsent !== 'undefined' && typeof window.MausamConsent.getConsent === 'function') {
      const consent = window.MausamConsent.getConsent();
      return consent && consent.analytics === true;
    }
    return false;
  }

  function trackEvent(eventName, properties) {
    // 1. Never track if analytics consent is not granted
    if (!isAnalyticsPermitted()) {
      return;
    }

    try {
      // 2. Sanitize properties - strip any sensitive data, tokens, keys or raw GPS
      const safeProps = {};
      if (properties && typeof properties === 'object') {
        for (const [k, v] of Object.entries(properties)) {
          // Block keys that might be sensitive
          if (/key|secret|token|password|auth|lat|lng|coord/i.test(k)) {
            continue;
          }
          // Only permit primitive values
          if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            safeProps[k] = typeof v === 'string' ? v.slice(0, 100) : v;
          }
        }
      }

      const eventPayload = {
        name: String(eventName).slice(0, 50),
        props: safeProps,
        timestamp: Date.now(),
      };

      eventBuffer.push(eventPayload);
      if (eventBuffer.length > MAX_BUFFER) {
        eventBuffer.shift();
      }

      // Log in debug mode only without exposing private info
      if (window.__MAUSAM_DEBUG_ANALYTICS__) {
        console.debug('[MAUSAM Analytics]', eventPayload.name, safeProps);
      }
    } catch (err) {
      // Analytics failure must NEVER disrupt app
    }
  }

  // Common Event Shortcuts
  const MausamAnalytics = {
    track: trackEvent,

    trackPageView: function (pagePath) {
      trackEvent('page_view', { path: pagePath || window.location.pathname });
    },

    trackWeatherView: function (stationName, condition) {
      trackEvent('weather_view', { station: stationName, condition: condition });
    },

    trackLocationSearch: function (hasResults) {
      trackEvent('location_search', { success: Boolean(hasResults) });
    },

    trackCurrentLocationUsed: function (source) {
      trackEvent('current_location_used', { source: source || 'DEVICE_GPS' });
    },

    trackWarningsView: function (activeCount) {
      trackEvent('warnings_view', { activeCount: Number(activeCount) || 0 });
    },

    trackRadarView: function (layerType) {
      trackEvent('radar_view', { layer: layerType || 'composite' });
    },

    trackAqiView: function (category) {
      trackEvent('aqi_view', { category: category });
    },

    trackAgrometView: function (cropCategory) {
      trackEvent('agromet_view', { category: cropCategory });
    },

    trackReportDownload: function (reportId) {
      trackEvent('report_download', { id: reportId });
    },

    trackAskMausamUsed: function (topic) {
      trackEvent('ask_mausam_used', { topic: topic || 'general' });
    },

    hasConsent: function () {
      return isAnalyticsPermitted();
    },

    getRecentEvents: function () {
      return [...eventBuffer];
    },
  };

  window.MausamAnalytics = MausamAnalytics;

  // React on consent changes
  window.addEventListener('mausam_consent_changed', function (e) {
    if (e.detail && e.detail.analytics) {
      MausamAnalytics.trackPageView();
    }
  });

  // Track initial page view if already consented
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (isAnalyticsPermitted()) {
        MausamAnalytics.trackPageView();
      }
    });
  } else if (isAnalyticsPermitted()) {
    MausamAnalytics.trackPageView();
  }
})();
