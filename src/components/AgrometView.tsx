import React, { useState } from 'react';
import {
  INDIAN_STATES_AND_DISTRICTS,
  CROP_LIST,
  getAgrometBulletin,
} from '../data/agrometData';
import { CropAdvisory } from '../types';

export const AgrometView: React.FC = () => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);
  const [selectedState, setSelectedState] = useState<string>('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ludhiana');
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice (Paddy)');

  const bulletin = getAgrometBulletin(selectedState, selectedDistrict);

  // Find or fallback crop advisory
  const activeCropAdvisory: CropAdvisory =
    bulletin.crops.find(
      (c) => c.cropName.toLowerCase() === selectedCrop.toLowerCase()
    ) ||
    bulletin.crops[0] || {
      cropName: selectedCrop,
      stage: 'Vegetative Growth',
      sowingAdvice: 'Ensure proper seed bed preparation with certified seed varieties.',
      irrigationAdvice: 'Irrigate according to moisture tension in root zone.',
      fertilizerAdvice: 'Apply recommended NPK split doses in morning hours.',
      pestDiseaseAdvice: 'Practice Integrated Pest Management (IPM) regularly.',
      harvestingAdvice: 'Ensure grain moisture below 14% prior to warehousing.',
      riskLevel: 'Moderate',
      riskAlert: 'Monitor local weather alerts before chemical spraying.',
    };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const districts = INDIAN_STATES_AND_DISTRICTS[state] || ['Central'];
    setSelectedDistrict(districts[0]);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* Top Agromet Banner */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#2ECC71] text-[20px]">
                agriculture
              </span>
            </div>
            <h2 className="font-h3 text-base font-bold text-[#FFFFFF]">
              Meghdoot Agromet Advisory Services • IMD &amp; ICAR
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6] max-w-3xl leading-relaxed">
            Location-specific, crop-based agricultural advisories delivered by Agro-Met Field Units (AMFUs). Bi-weekly Tuesday &amp; Friday bulletins for farm operations and weather risk mitigation.
          </p>
        </div>

        {/* Bi-weekly Bulletin Status Pill */}
        <div className="bg-[#0F141A] p-3 rounded-lg card-border text-right shrink-0">
          <div className="flex items-center gap-2 justify-end mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
            <span className="text-[11px] text-[#2ECC71] font-semibold">
              Bi-Weekly {bulletin.issueDay} Bulletin
            </span>
          </div>
          <span className="text-xs text-[#FFFFFF] font-semibold">
            {bulletin.issueDate}
          </span>
        </div>
      </div>

      {/* Localized Targeting Selector Bar */}
      <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. State Selector */}
        <div>
          <label className="text-xs text-[#2ECC71] font-semibold block mb-1.5">
            1. Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-[#0F141A] card-border rounded-lg px-3.5 py-2.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#2ECC71]"
          >
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* 2. District Selector */}
        <div>
          <label className="text-xs text-[#2ECC71] font-semibold block mb-1.5">
            2. Select District / Agro-Climatic Zone
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-[#0F141A] card-border rounded-lg px-3.5 py-2.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#2ECC71]"
          >
            {(INDIAN_STATES_AND_DISTRICTS[selectedState] || []).map((dist) => (
              <option key={dist} value={dist}>
                {dist} District
              </option>
            ))}
          </select>
        </div>

        {/* 3. Crop Selector */}
        <div>
          <label className="text-xs text-[#2ECC71] font-semibold block mb-1.5">
            3. Select Target Crop
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full bg-[#0F141A] card-border rounded-lg px-3.5 py-2.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#2ECC71]"
          >
            {CROP_LIST.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AMFU Field Unit Bulletin Summary */}
      <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#2ECC71] font-semibold mb-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{bulletin.amfuUnit}</span>
          </div>
          <p className="text-sm text-[#F4F7FA] leading-relaxed">
            {bulletin.weatherSummary}
          </p>
        </div>

        <div className="bg-[#0F141A] p-3 rounded-lg card-border shrink-0 max-w-sm text-left">
          <span className="text-[11px] text-[#8A94A6] font-semibold block mb-1">
            5-Day Rainfall Outlook (AMFU)
          </span>
          <p className="text-xs text-[#4FA8E0] font-bold">
            {bulletin.rainfallForecast5Days}
          </p>
        </div>
      </div>

      {/* Crop-Specific Protection Measures & Immediate Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Crop Advisory Details (Span 8) */}
        <div className="lg:col-span-8 bg-[#1E2733] card-border rounded-xl p-6 shadow-lg flex flex-col gap-5">
          <div className="flex flex-wrap justify-between items-center gap-2 pb-4 border-b border-[rgba(225,230,235,0.12)]">
            <div>
              <span className="text-xs text-[#2ECC71] font-semibold block mb-0.5">
                Crop Phenological Stage
              </span>
              <h3 className="font-h3 text-xl font-bold text-[#FFFFFF]">
                {activeCropAdvisory.cropName} • {activeCropAdvisory.stage}
              </h3>
            </div>

            {/* Risk Badge */}
            <div
              className={`px-3 py-1.5 rounded-lg card-border flex items-center gap-1.5 ${
                activeCropAdvisory.riskLevel === 'High'
                  ? 'bg-[#E74C3C]/15 border-[#E74C3C] text-[#E74C3C]'
                  : activeCropAdvisory.riskLevel === 'Moderate'
                  ? 'bg-[#FFB703]/15 border-[#FFB703] text-[#FFB703]'
                  : 'bg-[#2ECC71]/15 border-[#2ECC71] text-[#2ECC71]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span className="text-xs font-semibold">
                {activeCropAdvisory.riskLevel} Weather Risk
              </span>
            </div>
          </div>

          {/* Risk Alert Callout */}
          <div className="p-3.5 rounded-lg bg-[#0F141A] border border-[#FFB703]/40 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#FFB703] text-[20px] shrink-0 mt-0.5">
              shield_with_heart
            </span>
            <div>
              <span className="text-xs text-[#FFB703] font-semibold block">
                Immediate weather protection directive
              </span>
              <p className="text-xs text-[#F4F7FA] mt-0.5 leading-relaxed">
                {activeCropAdvisory.riskAlert}
              </p>
            </div>
          </div>

          {/* 4 Core Pillars: Sowing, Irrigation, Fertilizer, Pest/Harvesting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Sowing & Field Prep */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#2ECC71] text-[18px]">
                  potted_plant
                </span>
                <h4 className="text-xs text-[#FFFFFF] font-semibold">
                  Sowing &amp; field preparation
                </h4>
              </div>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                {activeCropAdvisory.sowingAdvice}
              </p>
            </div>

            {/* 2. Irrigation Scheduling */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                  water_drop
                </span>
                <h4 className="text-xs text-[#FFFFFF] font-semibold">
                  Irrigation management
                </h4>
              </div>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                {activeCropAdvisory.irrigationAdvice}
              </p>
            </div>

            {/* 3. Fertilizer Application */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#FFB703] text-[18px]">
                  science
                </span>
                <h4 className="text-xs text-[#FFFFFF] font-semibold">
                  Fertilizer / nutrient dosage
                </h4>
              </div>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                {activeCropAdvisory.fertilizerAdvice}
              </p>
            </div>

            {/* 4. Pest & Disease Protection */}
            <div className="bg-[#0F141A] p-4 rounded-lg card-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#9B59B6] text-[18px]">
                  pest_control
                </span>
                <h4 className="text-xs text-[#FFFFFF] font-semibold">
                  Pest &amp; disease protection
                </h4>
              </div>
              <p className="text-xs text-[#8A94A6] leading-relaxed">
                {activeCropAdvisory.pestDiseaseAdvice}
              </p>
            </div>
          </div>

          {/* Harvesting Advice */}
          <div className="bg-[#0F141A] p-4 rounded-lg card-border flex items-start gap-3">
            <span className="material-symbols-outlined text-[#2ECC71] text-[22px] shrink-0">
              grain
            </span>
            <div>
              <span className="text-xs text-[#2ECC71] font-semibold block">
                Harvesting &amp; post-harvest care
              </span>
              <p className="text-xs text-[#F4F7FA] mt-0.5 leading-relaxed">
                {activeCropAdvisory.harvestingAdvice}
              </p>
            </div>
          </div>
        </div>

        {/* Other Crops in this District Bulletin (Span 4) */}
        <div className="lg:col-span-4 bg-[#1E2733] card-border rounded-xl p-6 shadow-lg flex flex-col justify-between gap-5">
          <div>
            <div className="pb-3 border-b border-[rgba(225,230,235,0.12)] mb-4">
              <span className="text-xs text-[#2ECC71] font-semibold block mb-0.5">
                Available District Crops
              </span>
              <h4 className="text-base font-semibold text-[#FFFFFF]">
                Crops Monitored in {selectedDistrict}
              </h4>
            </div>

            <div className="flex flex-col gap-2.5">
              {bulletin.crops.map((c) => {
                const isSelected = c.cropName.toLowerCase() === selectedCrop.toLowerCase();
                return (
                  <button
                    key={c.cropName}
                    onClick={() => setSelectedCrop(c.cropName)}
                    className={`p-3 rounded-lg card-border transition-all cursor-pointer text-left flex justify-between items-center ${
                      isSelected
                        ? 'bg-[#242F3D] border-[#2ECC71] ring-1 ring-[#2ECC71] shadow-md'
                        : 'bg-[#0F141A] hover:bg-[#242F3D] border-[rgba(225,230,235,0.12)]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#FFFFFF] block">
                        {c.cropName}
                      </span>
                      <span className="text-[11px] text-[#8A94A6]">
                        {c.stage}
                      </span>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        color: c.riskLevel === 'High' ? '#E74C3C' : c.riskLevel === 'Moderate' ? '#FFB703' : '#2ECC71',
                        backgroundColor:
                          c.riskLevel === 'High'
                            ? 'rgba(231, 76, 60, 0.15)'
                            : c.riskLevel === 'Moderate'
                            ? 'rgba(255, 183, 3, 0.15)'
                            : 'rgba(46, 204, 113, 0.15)',
                      }}
                    >
                      {c.riskLevel} Risk
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Helpline & AMFU Support */}
          <div className="bg-[#0F141A] p-4 rounded-lg card-border">
            <span className="text-[11px] text-[#8A94A6] font-semibold block mb-1">
              Kisan Weather Advisory Helpdesk
            </span>
            <p className="text-xs text-[#2ECC71] font-semibold">
              Kisan Call Centre: 1800-180-1551 (Toll-Free)
            </p>
            <p className="text-[11px] text-[#8A94A6] mt-1">
              Operated daily 06:00 to 22:00 IST in 22 regional Indian languages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
