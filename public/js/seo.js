/**
 * MAUSAM Atmospheric Intelligence Platform
 * Client-Side SEO, OpenGraph & Meta Updater
 * Feature #6 Implementation
 */
(function () {
  'use strict';

  const ROUTE_META = {
    '/': {
      title: 'MAUSAM — National Atmospheric Intelligence & Agromet Advisory Platform',
      description: 'Official multi-tier atmospheric observation, live NDMA SACHET disaster alerts, Doppler radar imagery, and Gramin Krishi Mausam Sewa bulletins across India.',
    },
    '/weather': {
      title: 'Current Weather Telemetry & Observatories | MAUSAM',
      description: 'Live surface weather observations, surface pressure, humidity, wind vector telemetry, and precipitation across 36 Indian States and Union Territories.',
    },
    '/forecast': {
      title: '7-Day High-Resolution Meteorological Outlook | MAUSAM',
      description: 'Multi-day temperature bounds, probability of precipitation, wind projections, and numerical atmospheric guidance for Indian districts.',
    },
    '/warnings': {
      title: 'Official NDMA SACHET Severe Weather Warning Center | MAUSAM',
      description: 'Direct feeds from NDMA SACHET and IMD Early Warning Systems for cyclonic storms, flash floods, heatwaves, and severe thunderstorms.',
    },
    '/radar': {
      title: 'Live Doppler Radar & Satellite Reflectivity Maps | MAUSAM',
      description: 'Real-time DWR radar imagery mosaic, INSAT-3D infrared clouds, lightning strikes, and atmospheric layers over the Indian subcontinent.',
    },
    '/aqi': {
      title: 'National Air Quality Index (NAQI) & Aero-Allergens | MAUSAM',
      description: 'Continuous particulate matter (PM2.5, PM10), gaseous pollutant telemetry, and health impact advisories sourced from CPCB monitoring stations.',
    },
    '/agromet': {
      title: 'Agrometeorological Advisory & Gramin Krishi Mausam Sewa | MAUSAM',
      description: 'District-level crop weather calendars, sowing advisories, irrigation planning, and pest surveillance guidance for Indian farmers.',
    },
    '/reports': {
      title: 'Meteorological Research & Weather Bulletins | MAUSAM',
      description: 'Downloadable all-India weather summaries, monsoon tracking bulletins, and technical climate publications.',
    },
    '/privacy': {
      title: 'Privacy Policy & Open Data Protection | MAUSAM',
      description: 'Official privacy policy for the MAUSAM platform detailing geolocation handling, browser storage, anonymous telemetry, and citizen data protection.',
    },
    '/terms': {
      title: 'Terms of Observation & Service Disclaimers | MAUSAM',
      description: 'Terms of service and meteorological telemetry disclaimers for the MAUSAM weather and early warning intelligence platform.',
    },
    '/not-found': {
      title: '404 - Weather Station Not Found | MAUSAM',
      description: 'The requested atmospheric observation endpoint or page could not be located on the MAUSAM server.',
    },
  };

  function updateMeta(path) {
    const cleanPath = (path || window.location.pathname).toLowerCase().replace(/\/+$/, '') || '/';
    const meta = ROUTE_META[cleanPath] || ROUTE_META['/'];

    document.title = meta.title;

    let descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }

    let ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) {
      ogTitleEl.setAttribute('content', meta.title);
    }

    let ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) {
      ogDescEl.setAttribute('content', meta.description);
    }

    let twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleEl) {
      twitterTitleEl.setAttribute('content', meta.title);
    }

    let twitterDescEl = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescEl) {
      twitterDescEl.setAttribute('content', meta.description);
    }

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', 'https://mausamgovt.vercel.app' + (cleanPath === '/' ? '' : cleanPath));
    }
  }

  window.MausamSEO = {
    updateMeta: updateMeta,
    routeMeta: ROUTE_META,
  };

  // Initial update
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateMeta();
    });
  } else {
    updateMeta();
  }
})();
