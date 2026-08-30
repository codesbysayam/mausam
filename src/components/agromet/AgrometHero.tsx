import React from 'react';
import { ExtendedAgrometBulletin, INDIAN_STATES_AND_DISTRICTS } from '../../services/agrometService';
import { Sprout, MapPin, Calendar, FileText, CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';
import { AgrometTooltip } from './AgrometTooltip';

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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#131E2A] via-[#101822] to-[#0A1017] border border-[#1E2E40] shadow-2xl p-6 sm:p-8">
      {/* Background Subtle Horizon & Agricultural Atmospheric Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1200 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ECC71" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="skyGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#2ECC71" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="1200" height="400" fill="url(#skyGlow)" />
          {/* Subtle wavy field contours */}
          <path
            d="M0 320 Q 300 280 600 310 T 1200 290 L 1200 400 L 0 400 Z"
            fill="url(#cropGrad)"
          />
          <path
            d="M0 350 Q 400 310 800 340 T 1200 330 L 1200 400 L 0 400 Z"
            fill="#172836"
            opacity="0.6"
          />
          {/* Stylized crop stalk silhouettes on the right */}
          <g transform="translate(880, 240) scale(0.7)" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" opacity="0.35">
            <path d="M 50 150 Q 45 80 50 20" />
            <path d="M 50 80 Q 20 60 10 45" />
            <path d="M 50 60 Q 80 40 95 25" />
            <path d="M 50 100 Q 15 90 5 70" />
            <path d="M 50 35 Q 35 15 25 0" />
            <circle cx="50" cy="18" r="4" fill="#2ECC71" />
          </g>
          <g transform="translate(980, 220) scale(0.85)" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.3">
            <path d="M 50 150 Q 55 70 50 10" />
            <path d="M 50 70 Q 85 50 100 30" />
            <path d="M 50 50 Q 15 30 5 15" />
            <path d="M 50 90 Q 90 75 105 55" />
            <circle cx="50" cy="8" r="4" fill="#38BDF8" />
          </g>
          <g transform="translate(1080, 250) scale(0.65)" stroke="#2ECC71" strokeWidth="2" strokeLinecap="round" opacity="0.35">
            <path d="M 50 150 Q 48 80 50 20" />
            <path d="M 50 75 Q 25 55 12 40" />
            <path d="M 50 55 Q 75 35 88 20" />
            <circle cx="50" cy="18" r="4" fill="#2ECC71" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Brand, Heading, Value Proposition & Metadata */}
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2ECC71]/15 border border-[#2ECC71]/30 text-[#2ECC71] text-xs font-semibold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" />
              <span>Gramin Krishi Mausam Sewa (GKMS)</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-medium">
              <Sparkles className="w-3 h-3 text-[#38BDF8]" />
              <span>AMFU Node</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            AGROMET
            <span className="text-sm font-normal px-2.5 py-0.5 rounded bg-[#1E293B] text-[#93A4B8] border border-[#334155]">
              v4.2 Command Center
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#93A4B8] mt-1.5 leading-relaxed font-normal">
            Weather intelligence for better farm decisions — translating atmospheric forecasts into crop-specific irrigation, nutrient, pest, and harvesting actions.
          </p>

          {/* Quick Bulletin Context Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1E2E40]/80">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-4 h-4 text-[#2ECC71] shrink-0" />
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-medium">Agro District</span>
                <span className="font-semibold text-white truncate block">{selectedDistrict}, {selectedState}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-[#38BDF8] shrink-0" />
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-medium">Bulletin Reference</span>
                <span className="font-semibold text-white font-mono text-[11px] truncate block">{bulletin.bulletinNo}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <div>
                <span className="text-[10px] text-[#64748B] block uppercase font-medium">Validity Period</span>
                <span className="font-semibold text-[#F4F7FA] text-[11px] block">{bulletin.validPeriod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Primary Location Selector */}
        <div className="lg:w-80 shrink-0 bg-[#0F1622]/90 backdrop-blur-md rounded-xl p-4 border border-[#1E2E40] shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1E2E40]">
            <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2ECC71]" />
              Target Location
            </span>
            {isLoading ? (
              <span className="text-[10px] text-[#38BDF8] animate-pulse font-mono">Syncing...</span>
            ) : (
              <span className="text-[10px] text-[#2ECC71] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live Bulletin
              </span>
            )}
          </div>

          <div className="space-y-3">
            {/* 1. State Selector */}
            <div>
              <label htmlFor="agromet-state-select" className="text-[11px] font-medium text-[#93A4B8] mb-1 flex items-center justify-between">
                <span>Select State / UT</span>
                <span className="text-[10px] text-[#64748B]">28 States</span>
              </label>
              <div className="relative">
                <select
                  id="agromet-state-select"
                  value={selectedState}
                  onChange={(e) => onStateChange(e.target.value)}
                  className="w-full appearance-none bg-[#162232] border border-[#2A3E54] rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] transition-all cursor-pointer"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#93A4B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. District Selector */}
            <div>
              <label htmlFor="agromet-district-select" className="text-[11px] font-medium text-[#93A4B8] mb-1 flex items-center justify-between">
                <span>Select District</span>
                <span className="text-[10px] text-[#64748B]">{districts.length} Agro-Zones</span>
              </label>
              <div className="relative">
                <select
                  id="agromet-district-select"
                  value={selectedDistrict}
                  onChange={(e) => onDistrictChange(e.target.value)}
                  className="w-full appearance-none bg-[#162232] border border-[#2A3E54] rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-[#2ECC71] focus:ring-1 focus:ring-[#2ECC71] transition-all cursor-pointer"
                >
                  {districts.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#93A4B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* AMFU Affiliation Node */}
            <div className="pt-2 text-[10px] text-[#64748B] leading-tight flex items-start gap-1">
              <span className="text-[#2ECC71] font-bold">Node:</span>
              <span className="truncate">{bulletin.amfuUnit}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
