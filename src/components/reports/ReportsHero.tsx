import React from 'react';
import { MeteorologicalPublication } from '../../data/reportsAndArticles';
import { BookOpen, FileText, Layers, Sparkles, Database, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReportsHeroProps {
  publications: MeteorologicalPublication[];
}

export const ReportsHero: React.FC<ReportsHeroProps> = ({ publications }) => {
  // Dynamically calculate publication intelligence counts from the real dataset
  const totalCount = publications.length;
  const researchCount = publications.filter(
    (p) =>
      p.type === 'Research Article' ||
      p.type === 'Technical Monograph' ||
      p.category === 'Scientific Monograph' ||
      p.category === 'Climatological Study'
  ).length;
  const officialCount = publications.filter(
    (p) =>
      p.type === 'PDF Bulletin' ||
      p.type === 'GKMS Bulletin' ||
      p.type === 'Government Publication' ||
      p.category === 'National Weather Observation' ||
      p.category === 'Sub-Divisional Report' ||
      p.category === 'Agricultural Meteorology'
  ).length;
  const technicalStudiesCount = publications.filter(
    (p) =>
      p.category === 'Environmental Registry' ||
      p.id.includes('radar') ||
      p.id.includes('satellite') ||
      p.id.includes('ncmrwf') ||
      p.id.includes('wmo')
  ).length;

  return (
    <div
      id="reports-hero"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1522] via-[#0E1A2B] to-[#081019] border border-[#1E2E40] p-6 sm:p-8 lg:p-10 shadow-2xl"
    >
      {/* Subtle scientific coordinate grid & atmospheric contour lines SVG backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="scientific-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38BDF8" strokeWidth="0.5" strokeOpacity="0.4" />
              <circle cx="40" cy="40" r="1" fill="#38BDF8" fillOpacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#scientific-grid)" />
          {/* Subtle Synoptic Isobars / Atmospheric Flow */}
          <path
            d="M-50,280 C200,180 400,320 650,220 C900,120 1050,260 1250,180"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="1.2"
            strokeDasharray="4,6"
            strokeOpacity="0.5"
          />
          <path
            d="M-50,220 C220,130 450,260 700,160 C950,60 1100,200 1250,120"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <path
            d="M-50,160 C240,80 500,200 750,100 C1000,0 1150,140 1250,60"
            fill="none"
            stroke="#818CF8"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Side: Page Introduction */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-[11px] font-mono font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
              Official Meteorological Research Library
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#94A3B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]" />
              Open Data Repository
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            REPORTS &amp; RESEARCH
          </h1>

          <p className="text-base sm:text-lg font-medium text-[#38BDF8] mt-2 leading-snug">
            Meteorological intelligence, scientific publications &amp; official bulletins
          </p>

          <p className="text-xs sm:text-sm text-[#94A3B8] mt-3 leading-relaxed max-w-xl">
            Explore weather observations, climatological studies, agrometeorological bulletins, atmospheric research and operational meteorological reports curated across India&apos;s primary national institutes.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[#CBD5E1]">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142232] border border-[#22354A] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
              WMO-No. 8 Calibrated
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142232] border border-[#22354A] font-mono">
              <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
              Open Research Portal
            </span>
          </div>
        </div>

        {/* Right Side: Publication Intelligence Stats Card */}
        <div className="lg:w-80 shrink-0 rounded-2xl bg-[#09111A]/90 border border-[#1E2E40] p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-[#1E2E40]">
            <span className="text-[11px] font-mono font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Publication Intelligence
            </span>
            <span className="text-[10px] font-mono text-[#2ECC71] bg-[#2ECC71]/10 px-2 py-0.5 rounded border border-[#2ECC71]/30 font-bold">
              OFFICIAL REGISTRY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#101A26] border border-[#1E2E40] flex flex-col justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                {totalCount.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] mt-1">
                Publications
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#101A26] border border-[#1E2E40] flex flex-col justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#818CF8] tracking-tight">
                {researchCount.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] mt-1">
                Research Papers
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#101A26] border border-[#1E2E40] flex flex-col justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#38BDF8] tracking-tight">
                {officialCount.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] mt-1">
                Official Bulletins
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#101A26] border border-[#1E2E40] flex flex-col justify-between">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#2ECC71] tracking-tight">
                {technicalStudiesCount.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase text-[#94A3B8] mt-1">
                Technical Studies
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E2E40] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
            <span>LATEST UPDATE:</span>
            <span className="text-white font-bold">31 AUG 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
