import React from 'react';
import {
  Compass,
  Sprout,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { CropType, PhenologicalStage, ALL_CROPS, CROP_STAGES } from '../../services/agronomicEngine';
import { INDIAN_STATES_AND_DISTRICTS } from '../../services/agrometService';

interface AgrometCommandHeaderProps {
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
  selectedCrop: CropType;
  onCropChange: (crop: CropType) => void;
  selectedStage: PhenologicalStage;
  onStageChange: (stage: PhenologicalStage) => void;
  lastUpdatedStr: string;
  stationName: string;
  isLive: boolean;
}

export const AgrometCommandHeader: React.FC<AgrometCommandHeaderProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  selectedCrop,
  onCropChange,
  selectedStage,
  onStageChange,
  lastUpdatedStr,
  stationName,
  isLive,
}) => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);
  const districts = INDIAN_STATES_AND_DISTRICTS[selectedState] || [selectedDistrict];

  return (
    <header
      id="agromet-command-header"
      className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-[#1E293B] shadow-2xl p-6 sm:p-8"
    >
      {/* Background Decorative Tech Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="agriHeaderGrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#38BDF8" strokeWidth="0.5" />
              <circle cx="16" cy="16" r="0.75" fill="#10B981" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#agriHeaderGrid)" />
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Authority & Hero Branding */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" />
              <span>IMD • GKMS AGROMET</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ICAR • NCMRWF</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E293B] text-[#94A3B8] text-[11px] font-mono">
              <Radio className={`w-3 h-3 ${isLive ? 'text-[#10B981] animate-pulse' : 'text-[#F59E0B]'}`} />
              <span>{isLive ? 'LIVE IMD DATA' : 'STATION SYNC'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              AGROMET COMMAND CENTER
            </h1>
            <p className="text-sm text-[#38BDF8] font-mono font-semibold tracking-wide">
              Weather-driven agricultural decision support
            </p>
            <div className="text-xs text-[#94A3B8] font-mono flex items-center gap-2 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="font-bold text-white uppercase">LIVE AGRICULTURAL WEATHER INTELLIGENCE</span>
              <span>•</span>
              <span className="text-[#64748B]">{stationName}</span>
            </div>
          </div>

          {/* Timestamp provenance bar */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] bg-[#090D16]/70 border border-[#1E293B] rounded-lg px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Last updated:</span>
            <span className="text-white font-bold">{lastUpdatedStr} IST</span>
          </div>
        </div>

        {/* RIGHT COLUMN: State, District, Crop, and Stage Selectors */}
        <div className="lg:col-span-6 bg-[#090D16]/90 border border-[#1E293B] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Observatory &amp; Target Field Matrix</span>
            </div>
            <span className="text-[11px] font-mono text-[#10B981]">
              36 States/UTs Connected
            </span>
          </div>

          {/* Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* State Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase">
                1. State / Union Territory
              </label>
              <select
                id="agromet-state-selector"
                value={selectedState}
                onChange={(e) => onStateChange(e.target.value)}
                className="w-full bg-[#0F172A] text-xs font-mono font-semibold text-white border border-[#334155] rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
              >
                {states.map((s) => (
                  <option key={s} value={s} className="bg-[#0F172A] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase">
                2. Agro-Climatic District
              </label>
              <select
                id="agromet-district-selector"
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="w-full bg-[#0F172A] text-xs font-mono font-semibold text-white border border-[#334155] rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-[#0F172A] text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase">
                3. Agricultural Crop
              </label>
              <select
                id="agromet-crop-selector"
                value={selectedCrop}
                onChange={(e) => onCropChange(e.target.value as CropType)}
                className="w-full bg-[#0F172A] text-xs font-mono font-semibold text-[#10B981] border border-[#334155] rounded-lg px-3 py-2 focus:outline-none focus:border-[#10B981] cursor-pointer"
              >
                {ALL_CROPS.map((c) => (
                  <option key={c} value={c} className="bg-[#0F172A] text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Phenological Stage Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase">
                4. Phenological Stage
              </label>
              <select
                id="agromet-stage-selector"
                value={selectedStage}
                onChange={(e) => onStageChange(e.target.value as PhenologicalStage)}
                className="w-full bg-[#0F172A] text-xs font-mono font-semibold text-[#38BDF8] border border-[#334155] rounded-lg px-3 py-2 focus:outline-none focus:border-[#38BDF8] cursor-pointer"
              >
                {CROP_STAGES.map((st) => (
                  <option key={st} value={st} className="bg-[#0F172A] text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
