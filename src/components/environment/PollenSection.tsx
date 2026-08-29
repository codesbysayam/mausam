import React, { useState } from 'react';
import { CurrentWeather } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface PollenSectionProps {
  weather: CurrentWeather;
}

export const PollenSection: React.FC<PollenSectionProps> = ({ weather }) => {
  const pollenCount = weather.pollenCount || 2;
  const [selectedAllergen, setSelectedAllergen] = useState<number>(0);

  // Map pollen index (1-5) to clinical health advisory
  const getPollenAdvisory = (level: number) => {
    if (level <= 1) {
      return {
        rating: 'Very Low',
        color: '#2ECC71',
        badgeVariant: 'good' as const,
        description: 'Bio-aerosol concentrations are minimal. Negligible allergic risk for general population.',
        healthAdvice: 'Ideal conditions for outdoor cardiovascular exercise, gardening, and natural ventilation.',
        sensitiveGroups: 'Asthma/allergy sufferers do not require pre-exposure antihistamine prophylaxis.',
      };
    } else if (level === 2) {
      return {
        rating: 'Low to Moderate',
        color: '#3498DB',
        badgeVariant: 'info' as const,
        description: 'Low botanical pollen dispersion with minor background spore presence.',
        healthAdvice: 'Safe for most outdoor activities. Hypersensitive individuals should wash eyes/face after long exposure.',
        sensitiveGroups: 'Mild allergic rhinitis patients may experience occasional sneezing during morning peak hours.',
      };
    } else if (level === 3) {
      return {
        rating: 'Moderate Risk',
        color: '#F1C40F',
        badgeVariant: 'warning' as const,
        description: 'Elevated aero-allergen counts driven by moderate diurnal winds and warm afternoon temps.',
        healthAdvice: 'Keep vehicle windows closed when driving. Consider HEPA-filtered air purifiers indoors.',
        sensitiveGroups: 'Asthmatic patients and contact lens wearers should carry prescribed inhalers and lubricating drops.',
      };
    } else if (level === 4) {
      return {
        rating: 'High Risk',
        color: '#E67E22',
        badgeVariant: 'alert' as const,
        description: 'Substantial pollen discharge from anemophilous weeds and flowering Poaceae grasses.',
        healthAdvice: 'Limit strenuous outdoor workouts between 06:00 AM and 10:00 AM. Shower and change clothes after returning indoors.',
        sensitiveGroups: 'Allergic bronchitis and rhinitis patients should follow prophylactic medication plans.',
      };
    } else {
      return {
        rating: 'Severe / Very High',
        color: '#E74C3C',
        badgeVariant: 'danger' as const,
        description: 'Extreme bio-allergen saturation. Intense allergen plume triggering acute bronchospasms.',
        healthAdvice: 'Stay indoors with closed doors/windows. Use N95 respiratory protection if outdoors is unavoidable.',
        sensitiveGroups: 'High medical vigilance required for pediatric and geriatric COPD/asthma patients.',
      };
    }
  };

  const currentAdvisory = getPollenAdvisory(pollenCount);

  const pollenTypes = [
    {
      name: 'Grass Pollen (Poaceae)',
      level: pollenCount > 3 ? 'High' : 'Moderate',
      variant: pollenCount > 3 ? ('alert' as const) : ('warning' as const),
      species: 'Cynodon dactylon, Poaceae species',
      peakHours: '06:00 AM – 10:00 AM',
      grainCount: `${(pollenCount * 18 + 12)} grains/m³`,
      reactivity: 'High allergenicity; prominent cause of hay fever',
    },
    {
      name: 'Tree Pollen (Arboreal)',
      level: 'Low',
      variant: 'good' as const,
      species: 'Neem (Azadirachta), Acacia, Eucalyptus',
      peakHours: '11:00 AM – 03:00 PM',
      grainCount: '8 grains/m³',
      reactivity: 'Mild cross-reactive oral allergy potential',
    },
    {
      name: 'Weed Pollen (Asteraceae)',
      level: pollenCount > 2 ? 'Moderate' : 'Low',
      variant: pollenCount > 2 ? ('warning' as const) : ('good' as const),
      species: 'Parthenium hysterophorus (Congress grass), Amaranthus',
      peakHours: '08:00 AM – 12:00 PM',
      grainCount: `${(pollenCount * 14 + 5)} grains/m³`,
      reactivity: 'Contact dermatitis and allergic rhinitis trigger',
    },
    {
      name: 'Mold & Fungal Spores',
      level: weather.humidity > 75 ? 'Moderate' : 'Low',
      variant: weather.humidity > 75 ? ('warning' as const) : ('good' as const),
      species: 'Alternaria, Cladosporium, Aspergillus',
      peakHours: 'Evening & Night humid periods',
      grainCount: weather.humidity > 75 ? '65 spores/m³' : '22 spores/m³',
      reactivity: 'Associated with nocturnal coughing and childhood wheezing',
    },
  ];

  return (
    <div className="mausam-card flex flex-col gap-4">
      <SectionHeader
        title="Aero-Allergen &amp; Bio-Pollen Surveillance"
        subtitle="Botanical dispersion and bio-aerosol tracking for respiratory allergy mitigation and clinical advisory"
        icon="grain"
      />

      {/* Main Pollen Concentration Indicator & Health Advisory Card */}
      <div
        id="pollen-concentration-indicator"
        className="bg-[#17212B] border border-[#334155] rounded-lg p-4 flex flex-col md:flex-row gap-4 items-stretch"
      >
        {/* Gauge / Level Display */}
        <div className="w-full md:w-56 shrink-0 bg-[#0F141A] p-4 rounded-md border border-[#334155] flex flex-col justify-between items-center text-center">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#8A94A6]">
            Pollen Index Level
          </span>

          <div className="my-2 relative flex flex-col items-center justify-center">
            <div
              className="w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300"
              style={{
                borderColor: currentAdvisory.color,
                boxShadow: `0 0 15px ${currentAdvisory.color}33`,
              }}
            >
              <span className="font-mono text-3xl font-black text-white">{pollenCount}</span>
              <span className="text-[10px] text-[#8A94A6] -mt-1">of 5 max</span>
            </div>
          </div>

          <StatusBadge label={currentAdvisory.rating} variant={currentAdvisory.badgeVariant} />
        </div>

        {/* Clinical Health Advisory & Dispersion Factors */}
        <div className="flex-1 flex flex-col justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">medical_services</span>
              <h4 className="font-bold text-white text-sm">Clinical Aero-Allergen Health Advisory</h4>
            </div>
            <p className="text-[#D7DEE8] leading-relaxed">{currentAdvisory.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#1E2733] p-3 rounded border border-[#334155]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4FA8E0] block mb-0.5">
                General Population Protocol
              </span>
              <p className="text-[#8A94A6] leading-relaxed">{currentAdvisory.healthAdvice}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#F1C40F] block mb-0.5">
                Hypersensitive &amp; Asthma Advisory
              </span>
              <p className="text-[#8A94A6] leading-relaxed">{currentAdvisory.sensitiveGroups}</p>
            </div>
          </div>

          {/* Real-time Environmental Bio-factors */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#8A94A6] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#3498DB]">air</span>
              <span>Wind Speed: <strong className="text-white">{weather.windSpeed} km/h</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#2ECC71]">water_drop</span>
              <span>Relative Humidity: <strong className="text-white">{weather.humidity}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#F1C40F]">wb_sunny</span>
              <span>UV Index: <strong className="text-white">{weather.uvIndex}/10</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Aero-Allergen Botanical Species Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pollenTypes.map((p, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedAllergen(idx)}
            className={`p-3 bg-[#1E2733] border rounded flex flex-col justify-between cursor-pointer transition-all ${
              selectedAllergen === idx
                ? 'border-[#0B72B9] bg-[#1E2733]/90 shadow-md ring-1 ring-[#0B72B9]'
                : 'border-[#334155] hover:border-[#4FA8E0]'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white text-xs">{p.name}</span>
                <StatusBadge label={p.level} variant={p.variant} />
              </div>
              <div className="text-[11px] text-[#8A94A6] mt-0.5 line-clamp-1 italic">
                {p.species}
              </div>
              <div className="text-[11px] text-[#4FA8E0] font-mono mt-1 font-semibold">
                {p.grainCount}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#334155] text-[11px] text-[#8A94A6] flex justify-between">
              <span>Peak:</span>
              <span className="text-white font-mono">{p.peakHours}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
