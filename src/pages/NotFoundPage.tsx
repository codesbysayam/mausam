import React from 'react';
import { Compass, Home, CloudSun, AlertCircle } from 'lucide-react';
import { MainNavTab } from '../components/layout/MainNavigation';

interface NotFoundPageProps {
  onNavigateHome: () => void;
  onNavigateTab: (tab: MainNavTab) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onNavigateTab,
}) => {
  return (
    <main
      id="main-content"
      className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6"
      role="main"
      aria-labelledby="not-found-title"
    >
      <div className="w-full max-w-xl bg-[#0D1E33] border border-[#1E3A5F] rounded-2xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background radar ring decor */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 border border-[#1E3A5F]/40 rounded-full pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 border border-[#1E3A5F]/40 rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#132740] border border-[#1E3A5F] text-xs font-semibold text-[#38BDF8] mb-6">
          <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
          <span>HTTP ERROR 404 • ROUTE UNRESOLVED</span>
        </div>

        {/* 404 Heading */}
        <h1
          id="not-found-title"
          className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight font-mono mb-2"
        >
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] mb-3">
          Weather station not found.
        </h2>

        <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed mb-8">
          The requested meteorological telemetry endpoint or page does not exist on this observatory server. Please verify the URL or return to the national observation grid.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            id="not-found-home-btn"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B72B9] hover:bg-[#095991] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-2 focus:ring-offset-[#0D1E33]"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Back to MAUSAM</span>
          </button>

          <button
            type="button"
            id="not-found-weather-btn"
            onClick={() => onNavigateTab('weather')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] hover:text-white font-semibold text-sm border border-[#334155] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-2 focus:ring-offset-[#0D1E33]"
          >
            <CloudSun className="w-4 h-4 text-[#38BDF8]" aria-hidden="true" />
            <span>Check Weather</span>
          </button>
        </div>

        {/* Secondary Links */}
        <div className="mt-8 pt-6 border-t border-[#1E3A5F] flex flex-wrap items-center justify-center gap-4 text-xs text-[#94A3B8]">
          <button
            type="button"
            onClick={() => onNavigateTab('warnings')}
            className="hover:text-[#38BDF8] transition-colors"
          >
            Disaster Warnings
          </button>
          <span className="text-[#334155]" aria-hidden="true">•</span>
          <button
            type="button"
            onClick={() => onNavigateTab('radar')}
            className="hover:text-[#38BDF8] transition-colors"
          >
            Doppler Radar
          </button>
          <span className="text-[#334155]" aria-hidden="true">•</span>
          <button
            type="button"
            onClick={() => onNavigateTab('aqi')}
            className="hover:text-[#38BDF8] transition-colors"
          >
            Air Quality (AQI)
          </button>
        </div>
      </div>
    </main>
  );
};
