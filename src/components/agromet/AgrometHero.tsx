import React from 'react';
import { ExtendedAgrometBulletin, INDIAN_STATES_AND_DISTRICTS } from '../../services/agrometService';
import {
  Sprout,
  MapPin,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  Activity,
  Layers,
  Radio,
} from 'lucide-react';

interface AgrometHeroProps {
  bulletin: ExtendedAgrometBulletin;
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
  isLoading?: boolean;
}

export const AgrometHero: React.FC<AgrometHeroProps> = ({
  bulletin,
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  isLoading = false,
}) => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);
  const districts = INDIAN_STATES_AND_DISTRICTS[selectedState] || [selectedDistrict];

  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1724] via-[#0B121C] to-[#070D14] border border-[#1E2E40]/90 shadow-2xl p-6 sm:p-8 lg:p-10">
      {/* Subtle Atmospheric & Crop Horizon Silhouette Graphic */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 select-none">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1440 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skyAtmosphere" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="45%" stopColor="#2ECC71" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0B121C" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="fieldRidge1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A2B" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#0E1724" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="fieldRidge2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#070D14" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Atmospheric Glow */}
          <rect width="1440" height="450" fill="url(#skyAtmosphere)" />

          {/* Gentle contour waves */}
          <path
            d="M0 320 Q 360 260 720 300 T 1440 270 L 1440 450 L 0 450 Z"
            fill="url(#fieldRidge1)"
          />
          <path
            d="M0 360 Q 420 310 860 345 T 1440 330 L 1440 450 L 0 450 Z"
            fill="url(#fieldRidge2)"
          />

          {/* Minimalist crop stalks silhouettes */}
          <g transform="translate(1020, 220) scale(0.9)" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" opacity="0.4">
            <path d="M 60 200 Q 55 100 60 20" />
            <path d="M 60 110 Q 20 80 5 60" />
            <path d="M 60 80 Q 100 50 115 30" />
            <path d="M 60 140 Q 15 125 0 95" />
            <path d="M 60 45 Q 40 20 25 0" />
            <circle cx="60" cy="18" r="5" fill="#2ECC71" />
          </g>
          <g transform="translate(1160, 200) scale(1.1)" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.35">
            <path d="M 50 200 Q 60 95 50 10" />
            <path d="M 50 95 Q 95 65 115 40" />
            <path d="M 50 65 Q 10 40 0 18" />
            <path d="M 50 120 Q 100 100 120 75" />
            <circle cx="50" cy="8" r="4.5" fill="#38BDF8" />
          </g>
          <g transform="translate(1290, 240) scale(0.8)" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" opacity="0.4">
            <path d="M 50 200 Q 45 100 50 20" />
            <path d="M 50 100 Q 20 75 5 55" />
            <path d="M 50 70 Q 85 45 100 25" />
            <circle cx="50" cy="18" r="4" fill="#2ECC71" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left: Command Header & Title */}
        <div className="flex-1 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2ECC71]/15 border border-[#2ECC71]/35 text-[#2ECC71] text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sprout className="w-4 h-4" />
              <span>National Agromet Service • GKMS</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#182736] border border-[#2A3E54] text-xs text-[#CBD5E1] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
              <span className="text-[#38BDF8] font-bold">LIVE AGRICULTURAL DATA</span>
              <span className="text-[#64748B]">• Updated 2 min ago</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-3.5 flex-wrap">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                AGROMET
              </h1>
              <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg bg-[#182635] text-[#38BDF8] border border-[#2A3E54] tracking-wide">
                Agricultural Weather Command Center
              </span>
            </div>
            <p className="text-base sm:text-lg text-[#94A3B8] font-normal mt-2 leading-relaxed max-w-2xl">
              Weather intelligence for smarter farm decisions — translating high-resolution synoptic forecasts into decisive irrigation, nutrient, disease surveillance, and harvesting actions.
            </p>
          </div>

          {/* Current Active Location Badge & Bulletin Metadata */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131E2A] border border-[#22354A] text-xs sm:text-sm text-white">
              <MapPin className="w-4 h-4 text-[#2ECC71] shrink-0" />
              <span>
                Location: <strong className="text-[#38BDF8] font-bold font-mono">{selectedDistrict}, {selectedState}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131E2A] border border-[#22354A] text-xs text-[#94A3B8]">
              <FileText className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span>Bulletin: <strong className="text-white font-mono">{bulletin.bulletinNo}</strong></span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131E2A] border border-[#22354A] text-xs text-[#94A3B8]">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>Validity: <strong className="text-white font-mono">{bulletin.validPeriod}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Prominent Dual Location Selectors */}
        <div className="w-full lg:w-80 shrink-0 bg-[#0F1722]/90 backdrop-blur-md border border-[#1E2E40] p-5 rounded-2xl shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
              Select Agricultural Zone
            </span>
            {isLoading ? (
              <span className="text-[10px] text-[#F59E0B] font-mono animate-pulse font-semibold">
                Syncing...
              </span>
            ) : (
              <span className="text-[10px] text-[#2ECC71] font-mono font-semibold">
                IMD Verified
              </span>
            )}
          </div>

          {/* State Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
              <span>State / Union Territory</span>
              <span className="text-[10px] font-mono text-[#64748B]">{states.length} States</span>
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => onStateChange(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#152230] border border-[#2A3E54] text-sm text-white font-semibold focus:outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {states.map((state) => (
                  <option key={state} value={state} className="bg-[#0F1722] text-white">
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* District Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center justify-between">
              <span>Agro-Meteorological District</span>
              <span className="text-[10px] font-mono text-[#64748B]">{districts.length} Districts</span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#152230] border border-[#2A3E54] text-sm text-white font-semibold focus:outline-none focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {districts.map((district) => (
                  <option key={district} value={district} className="bg-[#0F1722] text-white">
                    {district}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E2E40] flex items-center justify-between text-[11px] text-[#64748B]">
            <span>AMFU Issuing Node</span>
            <span className="text-[#38BDF8] font-semibold truncate max-w-[170px]" title={bulletin.amfuUnit}>
              {bulletin.amfuUnit.split('•')[0] || 'State Univ Node'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
