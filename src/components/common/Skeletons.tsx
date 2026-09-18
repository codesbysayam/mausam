// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Production-Grade Skeleton Components
// Mirrors exact widget dimensions and typography to prevent layout shift.
// ====================================================================

import React from 'react';

/**
 * Weather Hero Skeleton - Exactly mirrors HomeAtmosphericHero dimensions
 */
export const SkeletonWeatherHero: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="w-full rounded-2xl border border-[#1E2E40] bg-[#0A111B] p-5 sm:p-6 lg:p-8 animate-pulse shadow-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2E40]/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#172738]" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-[#172738] rounded-md" />
            <div className="h-3.5 w-28 bg-[#172738]/60 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-24 bg-[#172738] rounded-full" />
          <div className="h-7 w-20 bg-[#172738] rounded-full" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 flex items-center gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#172738]" />
          <div className="space-y-3">
            <div className="h-12 sm:h-16 w-36 bg-[#172738] rounded-lg" />
            <div className="h-4 w-48 bg-[#172738]/70 rounded" />
          </div>
        </div>

        <div className="md:col-span-5 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-[#101E2C] border border-[#1E2E40]/60 space-y-2">
              <div className="h-3 w-16 bg-[#172738] rounded" />
              <div className="h-5 w-20 bg-[#172738] rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Metric Card Skeleton
 */
export const SkeletonMetricCard: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="p-4 rounded-xl border border-[#1E2E40] bg-[#0C1521] animate-pulse space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-[#172738] rounded" />
        <div className="w-5 h-5 rounded-md bg-[#172738]" />
      </div>
      <div className="h-7 w-24 bg-[#172738] rounded-md" />
      <div className="h-3 w-32 bg-[#172738]/60 rounded" />
    </div>
  );
};

/**
 * Chart Skeleton
 */
export const SkeletonChart: React.FC<{ height?: string }> = ({ height = 'h-52' }) => {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${height} rounded-xl border border-[#1E2E40] bg-[#0C1521] p-4 flex flex-col justify-between animate-pulse`}
    >
      <div className="flex items-center justify-between border-b border-[#1E2E40]/60 pb-3">
        <div className="h-4 w-32 bg-[#172738] rounded" />
        <div className="h-3 w-24 bg-[#172738]/60 rounded" />
      </div>
      <div className="flex items-end gap-3 h-32 pt-4 px-2">
        {[40, 65, 30, 85, 55, 75, 45, 90, 60, 50, 70, 80].map((h, idx) => (
          <div
            key={idx}
            className="flex-1 bg-[#172738] rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Panel Skeleton
 */
export const SkeletonPanel: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div
      aria-hidden="true"
      className="w-full rounded-xl border border-[#1E2E40] bg-[#0C1521] p-4 sm:p-5 animate-pulse space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[#1E2E40] pb-3">
        <div className="h-4 w-40 bg-[#172738] rounded" />
        <div className="h-3 w-20 bg-[#172738]/60 rounded" />
      </div>
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[#1E2E40]/40 last:border-0">
            <div className="h-4 w-32 bg-[#172738] rounded" />
            <div className="h-4 w-20 bg-[#172738] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Severe Weather Strip Skeleton - Matches HomeSevereWeatherStrip card height & typography exactly
 */
export const SkeletonAlertCenter: React.FC = () => {
  return (
    <section
      aria-label="Loading Warning Center"
      className="w-full rounded-xl border border-[#1E2E40] border-l-4 border-l-[#3B82F6] bg-[#0B131E] p-4 sm:p-5 shadow-sm animate-pulse"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#172738]" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-36 bg-[#172738] rounded" />
            <div className="h-3 w-56 bg-[#172738]/60 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-[#172738] rounded-full" />
        </div>
      </div>
    </section>
  );
};

/**
 * Whole Page Shell Skeleton
 */
export const SkeletonPage: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6">
      <SkeletonAlertCenter />
      <SkeletonWeatherHero />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SkeletonChart height="h-64" />
        </div>
        <div className="lg:col-span-4">
          <SkeletonPanel rows={4} />
        </div>
      </div>
    </div>
  );
};
