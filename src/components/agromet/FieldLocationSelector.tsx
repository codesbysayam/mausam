import React from 'react';
import { INDIAN_STATES_AND_DISTRICTS } from '../../services/agrometService';
import { MapPin, Sprout, Filter, CheckCircle2, ChevronDown, Compass } from 'lucide-react';

interface FieldLocationSelectorProps {
  selectedState: string;
  selectedDistrict: string;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
  availableCrops: string[];
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
}

export const FieldLocationSelector: React.FC<FieldLocationSelectorProps> = ({
  selectedState,
  selectedDistrict,
  onStateChange,
  onDistrictChange,
  availableCrops,
  selectedCrop,
  onSelectCrop,
}) => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);
  const districts = INDIAN_STATES_AND_DISTRICTS[selectedState] || [selectedDistrict];

  return (
    <div
      id="field-location-control"
      className="rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-5 sm:p-6 shadow-xl space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1E2E40]">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              Field Observatory &amp; Crop Context
            </h3>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
              Select your farm state, agro-climatic district, and target crop to calibrate advisories
            </p>
          </div>
        </div>

        {/* Location Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* State Selector */}
          <div className="flex items-center gap-2 bg-[#080E16] border border-[#1E2E40] rounded-xl px-3 py-1.5 focus-within:border-[#38BDF8] transition-colors">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">State</span>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer pr-2"
            >
              {states.map((s) => (
                <option key={s} value={s} className="bg-[#0B131D] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-2 bg-[#080E16] border border-[#1E2E40] rounded-xl px-3 py-1.5 focus-within:border-[#38BDF8] transition-colors">
            <span className="text-[10px] font-mono uppercase font-bold text-[#64748B]">District</span>
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white focus:outline-none cursor-pointer pr-2"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-[#0B131D] text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Crop Selector Horizontal Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <span className="flex items-center gap-1.5 text-white font-bold">
            <Sprout className="w-4 h-4 text-[#10B981]" />
            <span>Select Target Crop in {selectedDistrict}:</span>
          </span>
          <span className="text-[11px] text-[#64748B]">
            {availableCrops.length} Agromet-Monitored Crops
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {availableCrops.map((crop) => {
            const isSelected = crop === selectedCrop;
            return (
              <button
                key={crop}
                type="button"
                onClick={() => onSelectCrop(crop)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#10B981] text-[#07130E] shadow-lg shadow-[#10B981]/20 scale-105'
                    : 'bg-[#080E16] text-[#94A3B8] border border-[#1E2E40] hover:border-[#38BDF8]/40 hover:text-white'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{crop}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
