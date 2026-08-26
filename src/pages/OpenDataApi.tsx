import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface OpenDataApiProps {
  onNavigateHome?: () => void;
}

export const OpenDataApi: React.FC<OpenDataApiProps> = ({ onNavigateHome }) => {
  const { t } = useLanguage();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto py-4 text-[#D7DEE8]">
      {/* Breadcrumb / Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="mausam-button mausam-button-outline inline-flex items-center gap-2 text-xs py-1.5 px-3 hover:text-white"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>{t('returnToPortal', 'Return to Weather Portal')}</span>
        </button>

        <span className="text-xs font-mono text-[#8A94A6]">
          API Spec: MAUSAM-OPENAPI-V1-DEV
        </span>
      </div>

      {/* Header Banner */}
      <div className="mausam-panel bg-[#17212B] p-6 mb-6 border border-[#334155]">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[11px] font-bold px-2 py-0.5 rounded border border-[#0B72B9]/40">
              API Status: Prototype / Development
            </span>
            <span className="bg-[#1E2733] text-[#F1C40F] text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-[#334155]">
              SIH 2026 Reference Build
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Open Data API
          </h1>

          <p className="text-sm text-[#8A94A6]">
            MAUSAM Weather &amp; Environmental Data Interface
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[#334155] text-xs text-[#D7DEE8] leading-relaxed">
          MAUSAM is designed to support structured access to weather and environmental information through APIs. The current implementation may use a combination of application data, open datasets and external weather services.
        </div>
      </div>

      {/* Table of Contents */}
      <div className="mausam-panel bg-[#17212B] p-5 mb-6 border border-[#334155]">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
            account_tree
          </span>
          <span>API Specification Index</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { id: 'api-overview', title: '1. API Overview' },
            { id: 'api-current', title: '2. Current Weather Endpoint' },
            { id: 'api-aqi', title: '3. Air Quality Endpoint' },
            { id: 'api-pollen', title: '4. Pollen & Allergens Endpoint' },
            { id: 'api-forecast', title: '5. Forecast Endpoint' },
            { id: 'api-warnings', title: '6. Weather Warnings Endpoint' },
            { id: 'api-sources', title: '7. Data Sources' },
            { id: 'api-usage', title: '8. API Usage & Security' },
            { id: 'api-attribution', title: '9. Data Attribution' },
            { id: 'api-disclaimer', title: '10. Disclaimer' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-left py-1 px-2 rounded hover:bg-[#1E2733] text-[#4FA8E0] hover:text-white transition-colors"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main API Documentation Sections */}
      <div className="mausam-panel bg-[#17212B] p-6 sm:p-8 space-y-8 border border-[#334155] leading-[1.75] text-sm">
        {/* Section 1: Overview */}
        <section id="api-overview" className="scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2 flex items-center justify-between">
            <span>1. API OVERVIEW</span>
            <span className="text-[11px] font-mono text-[#8A94A6]">REST / JSON</span>
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed">
            The MAUSAM API architecture is intended to provide structured weather and environmental information for applications, dashboards and research-oriented use cases.
          </p>
          <p className="text-[#D7DEE8] leading-relaxed mt-2">
            Potential datasets include:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs">
            {[
              'Current weather',
              'Temperature',
              'Humidity',
              'Wind',
              'Atmospheric pressure',
              'Visibility',
              'Rainfall',
              'Forecast',
              'AQI',
              'Pollen',
              'UV index',
              'Weather warnings',
              'Location information',
            ].map((d, i) => (
              <div
                key={i}
                className="p-2 bg-[#1E2733] rounded border border-[#334155] text-[#D7DEE8] font-medium"
              >
                • {d}
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Current Weather */}
        <section id="api-current" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">
              2. CURRENT WEATHER
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40 font-mono">
              Development Example
            </span>
          </div>

          <p className="text-xs text-[#8A94A6] mb-2">
            Example endpoint to retrieve real-time surface observational parameters:
          </p>

          <div className="bg-[#0F141A] rounded border border-[#334155] p-3 font-mono text-xs mb-3 flex items-center justify-between">
            <span className="text-[#4FA8E0]">
              GET /api/weather/current?state=Odisha&amp;city=Bhubaneswar
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'GET /api/weather/current?state=Odisha&city=Bhubaneswar',
                  'cur-ep'
                )
              }
              className="text-[#8A94A6] hover:text-white text-xs"
            >
              {copiedSection === 'cur-ep' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <span className="text-xs font-bold text-white block mb-1">
            Example Response:
          </span>
          <pre className="bg-[#0F141A] rounded border border-[#334155] p-4 text-xs font-mono text-[#D7DEE8] overflow-x-auto leading-relaxed">
{`{
  "location": {
    "state": "Odisha",
    "city": "Bhubaneswar"
  },
  "temperature": 29,
  "unit": "C",
  "humidity": 78,
  "wind_speed": 14,
  "wind_unit": "km/h",
  "pressure": 1008,
  "visibility": 8,
  "weather": "Cloudy"
}`}
          </pre>
          <p className="text-[11px] text-[#8A94A6] mt-2 italic">
            * Note: This endpoint is illustrated as an architectural reference in this prototype build.
          </p>
        </section>

        {/* Section 3: Air Quality */}
        <section id="api-aqi" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">
              3. AIR QUALITY
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40 font-mono">
              Development Example
            </span>
          </div>

          <p className="text-xs text-[#8A94A6] mb-2">
            Example query for National Air Quality Index (NAQI) and particulate channels:
          </p>

          <div className="bg-[#0F141A] rounded border border-[#334155] p-3 font-mono text-xs mb-3 flex items-center justify-between">
            <span className="text-[#4FA8E0]">
              GET /api/environment/aqi?state=Odisha&amp;city=Bhubaneswar
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'GET /api/environment/aqi?state=Odisha&city=Bhubaneswar',
                  'aqi-ep'
                )
              }
              className="text-[#8A94A6] hover:text-white text-xs"
            >
              {copiedSection === 'aqi-ep' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <span className="text-xs font-bold text-white block mb-1">
            Example Response:
          </span>
          <pre className="bg-[#0F141A] rounded border border-[#334155] p-4 text-xs font-mono text-[#D7DEE8] overflow-x-auto leading-relaxed">
{`{
  "location": "Bhubaneswar",
  "aqi": 82,
  "category": "Satisfactory",
  "pm25": 38,
  "pm10": 72
}`}
          </pre>
          <p className="text-[11px] text-[#8A94A6] mt-2 italic">
            * Note: Illustrated as a development schema for environmental telemetry ingestion.
          </p>
        </section>

        {/* Section 4: Pollen */}
        <section id="api-pollen" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">
              4. POLLEN
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B72B9]/20 text-[#4FA8E0] border border-[#0B72B9]/40 font-mono">
              Development Example
            </span>
          </div>

          <p className="text-xs text-[#8A94A6] mb-2">
            Example query for aero-allergenic pollen distribution:
          </p>

          <div className="bg-[#0F141A] rounded border border-[#334155] p-3 font-mono text-xs mb-3 flex items-center justify-between">
            <span className="text-[#4FA8E0]">
              GET /api/environment/pollen?location=Bhubaneswar
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'GET /api/environment/pollen?location=Bhubaneswar',
                  'pol-ep'
                )
              }
              className="text-[#8A94A6] hover:text-white text-xs"
            >
              {copiedSection === 'pol-ep' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <span className="text-xs font-bold text-white block mb-1">
            Possible Response:
          </span>
          <pre className="bg-[#0F141A] rounded border border-[#334155] p-4 text-xs font-mono text-[#D7DEE8] overflow-x-auto leading-relaxed">
{`{
  "location": "Bhubaneswar",
  "tree": 1,
  "grass": 2,
  "weed": 3,
  "level": "Moderate"
}`}
          </pre>
        </section>

        {/* Section 5: Forecast */}
        <section id="api-forecast" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            5. FORECAST
          </h2>
          <p className="text-xs text-[#8A94A6] mb-2">
            Parameters: <code className="text-[#4FA8E0]">city</code>, <code className="text-[#4FA8E0]">state</code>, <code className="text-[#4FA8E0]">days</code>
          </p>

          <div className="bg-[#0F141A] rounded border border-[#334155] p-3 font-mono text-xs mb-2 flex items-center justify-between">
            <span className="text-[#4FA8E0]">
              GET /api/weather/forecast?state=Odisha&amp;city=Bhubaneswar&amp;days=7
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'GET /api/weather/forecast?state=Odisha&city=Bhubaneswar&days=7',
                  'fc-ep'
                )
              }
              className="text-[#8A94A6] hover:text-white text-xs"
            >
              {copiedSection === 'fc-ep' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        {/* Section 6: Weather Warnings */}
        <section id="api-warnings" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            6. WEATHER WARNINGS
          </h2>
          <p className="text-xs text-[#8A94A6] mb-2">
            Parameters: <code className="text-[#4FA8E0]">state</code>, <code className="text-[#4FA8E0]">city</code>
          </p>

          <div className="bg-[#0F141A] rounded border border-[#334155] p-3 font-mono text-xs mb-3 flex items-center justify-between">
            <span className="text-[#4FA8E0]">
              GET /api/weather/warnings?state=Odisha&amp;city=Bhubaneswar
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'GET /api/weather/warnings?state=Odisha&city=Bhubaneswar',
                  'warn-ep'
                )
              }
              className="text-[#8A94A6] hover:text-white text-xs"
            >
              {copiedSection === 'warn-ep' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-[#D7DEE8] mb-1">
            Expected return fields:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs pl-2 text-[#D7DEE8]">
            <li>Warning level (Green, Yellow, Orange, Red)</li>
            <li>Description</li>
            <li>Affected area</li>
            <li>Start time</li>
            <li>End time</li>
            <li>Source</li>
          </ul>
        </section>

        {/* Section 7: Data Sources */}
        <section id="api-sources" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            7. DATA SOURCES
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed mb-3">
            MAUSAM may integrate data from multiple verified meteorological and environmental channels:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs pl-2 text-[#D7DEE8]">
            <li>Government/open meteorological datasets</li>
            <li>Public environmental datasets</li>
            <li>Weather service providers</li>
            <li>Other verified external data sources</li>
          </ul>
          <p className="text-xs text-[#8A94A6] mt-3 italic">
            Note: Not every displayed value originates directly from IMD. Each dataset displays its actual source and measurement network wherever possible.
          </p>
        </section>

        {/* Section 8: API Usage */}
        <section id="api-usage" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            8. API USAGE
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed mb-3">
            For the prototype, API access may be limited to development or demonstration purposes.
          </p>
          <div className="p-3.5 bg-[#1E2733] rounded border border-[#334155] text-xs font-mono text-[#D7DEE8]">
            "Public API authentication is not currently enabled in this prototype."
          </div>
        </section>

        {/* Section 9: Data Attribution */}
        <section id="api-attribution" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            9. DATA ATTRIBUTION
          </h2>
          <p className="text-[#D7DEE8] leading-relaxed mb-3">
            When data originates from an external provider, appropriate source attribution is retained:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] block">Source:</span>
              <span className="font-bold text-white">IMD</span>
            </div>
            <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] block">Source:</span>
              <span className="font-bold text-white">CPCB</span>
            </div>
            <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] block">Source:</span>
              <span className="font-bold text-white">Open-Meteo</span>
            </div>
            <div className="p-2.5 bg-[#1E2733] rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] block">Source:</span>
              <span className="font-bold text-[#4FA8E0]">MAUSAM Prototype Dataset</span>
            </div>
          </div>
          <p className="text-xs text-[#8A94A6] mt-3">
            Third-party data is never represented as proprietary MAUSAM data.
          </p>
        </section>

        {/* Section 10: Disclaimer */}
        <section id="api-disclaimer" className="pt-6 border-t border-[#334155] scroll-mt-6">
          <h2 className="text-base font-bold text-white mb-2">
            10. DISCLAIMER
          </h2>
          <div className="p-4 bg-[#1E2733]/80 rounded border border-[#334155] text-xs text-[#D7DEE8] leading-relaxed">
            "MAUSAM is an SIH 2026 prototype developed for demonstration and innovation purposes. Weather and environmental information should not be treated as an official emergency warning or substitute for instructions issued by the appropriate authorities."
          </div>
        </section>
      </div>
    </div>
  );
};
