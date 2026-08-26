import React, { useState } from 'react';
import { AGROMET_BULLETINS, INDIAN_STATES_AND_DISTRICTS } from '../data/agrometData';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';

export const AgrometPage: React.FC = () => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);
  const [selectedState, setSelectedState] = useState<string>(states[0]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    INDIAN_STATES_AND_DISTRICTS[states[0]][0]
  );

  const key = `${selectedState}-${selectedDistrict}`;
  const bulletin = AGROMET_BULLETINS[key] || AGROMET_BULLETINS['Punjab-Ludhiana'];

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const districts = INDIAN_STATES_AND_DISTRICTS[state] || [];
    setSelectedDistrict(districts[0] || '');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header & District Selection Bar */}
      <div className="mausam-card flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold text-lg">
            National Agromet Advisory Service (Gramin Krishi Mausam Sewa - GKMS)
          </h2>
          <p className="text-xs text-[#8A94A6] mt-0.5">
            Bi-weekly district agricultural meteorological bulletins &amp; crop-specific management advisories.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="mausam-select text-xs"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="mausam-select text-xs"
          >
            {(INDIAN_STATES_AND_DISTRICTS[selectedState] || []).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulletin Synoptic Overview Card */}
      <div className="mausam-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#334155] gap-2">
          <div>
            <span className="text-[11px] text-[#4FA8E0] font-bold uppercase">
              {bulletin.amfuUnit}
            </span>
            <h3 className="text-white font-bold text-base mt-0.5">
              District Agromet Bulletin: {bulletin.district}, {bulletin.state}
            </h3>
          </div>

          <div className="text-right text-xs text-[#8A94A6]">
            <div>Bulletin No: <strong className="text-[#D7DEE8] font-mono">{bulletin.bulletinNo}</strong></div>
            <div>Validity: <strong className="text-[#D7DEE8] font-mono">{bulletin.validPeriod}</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-[#1E2733] rounded border border-[#334155]">
            <span className="text-xs font-bold text-white uppercase block mb-1">
              Weather Synopsis
            </span>
            <p className="text-xs text-[#D7DEE8] leading-relaxed">
              {bulletin.weatherSummary}
            </p>
          </div>

          <div className="p-3 bg-[#1E2733] rounded border border-[#334155]">
            <span className="text-xs font-bold text-white uppercase block mb-1">
              5-Day Quantitative Rainfall Outlook
            </span>
            <p className="text-xs text-[#4FA8E0] font-mono leading-relaxed mt-1">
              {bulletin.rainfallForecast5Days}
            </p>
          </div>
        </div>
      </div>

      {/* Crop-by-Crop Specific Advisories */}
      <div className="mausam-card">
        <SectionHeader
          title="Crop Specific Stage-Wise Advisory Matrix"
          subtitle="Agronomic recommendations for sowing, irrigation, nutrient, and pest control"
          icon="eco"
        />

        <div className="flex flex-col gap-4">
          {bulletin.crops.map((crop, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#1E2733] border border-[#334155] rounded flex flex-col gap-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#334155]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{crop.cropName}</span>
                  <span className="text-xs text-[#8A94A6]">({crop.stage})</span>
                </div>
                <StatusBadge
                  label={`${crop.riskLevel} Pest Risk`}
                  variant={
                    crop.riskLevel === 'High'
                      ? 'danger'
                      : crop.riskLevel === 'Moderate'
                      ? 'warning'
                      : 'good'
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs text-[#D7DEE8]">
                <div className="p-2.5 bg-[#17212B] rounded border border-[#334155]">
                  <strong className="text-[#4FA8E0] block mb-1">Irrigation Management</strong>
                  {crop.irrigationAdvice}
                </div>

                <div className="p-2.5 bg-[#17212B] rounded border border-[#334155]">
                  <strong className="text-[#4FA8E0] block mb-1">Nutrient &amp; Fertilizer</strong>
                  {crop.fertilizerAdvice}
                </div>

                <div className="p-2.5 bg-[#17212B] rounded border border-[#334155]">
                  <strong className="text-[#4FA8E0] block mb-1">Pest &amp; Disease Control</strong>
                  {crop.pestDiseaseAdvice}
                </div>

                <div className="p-2.5 bg-[#17212B] rounded border border-[#334155]">
                  <strong className="text-[#4FA8E0] block mb-1">Harvesting &amp; Field Ops</strong>
                  {crop.harvestingAdvice}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
