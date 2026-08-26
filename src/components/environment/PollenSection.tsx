import React from 'react';
import { CurrentWeather } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';

interface PollenSectionProps {
  weather: CurrentWeather;
}

export const PollenSection: React.FC<PollenSectionProps> = ({ weather }) => {
  const pollenCount = weather.pollenCount || 2;

  const pollenTypes: Array<{
    name: string;
    level: string;
    variant: 'good' | 'warning' | 'alert' | 'danger' | 'info';
    species: string;
    peakHours: string;
  }> = [
    {
      name: 'Grass Pollen',
      level: pollenCount > 3 ? 'High' : 'Moderate',
      variant: pollenCount > 3 ? 'alert' : 'warning',
      species: 'Cynodon dactylon, Poaceae species',
      peakHours: '06:00 AM – 10:00 AM',
    },
    {
      name: 'Tree Pollen',
      level: 'Low',
      variant: 'good',
      species: 'Neem, Acacia, Eucalyptus',
      peakHours: '11:00 AM – 03:00 PM',
    },
    {
      name: 'Weed Pollen',
      level: pollenCount > 2 ? 'Moderate' : 'Low',
      variant: pollenCount > 2 ? 'warning' : 'good',
      species: 'Parthenium hysterophorus (Congress grass)',
      peakHours: '08:00 AM – 12:00 PM',
    },
    {
      name: 'Mold & Fungal Spores',
      level: weather.humidity > 75 ? 'Moderate' : 'Low',
      variant: weather.humidity > 75 ? 'warning' : 'good',
      species: 'Alternaria, Cladosporium',
      peakHours: 'Evening & Night humid periods',
    },
  ];

  return (
    <div className="mausam-card">
      <SectionHeader
        title="Aero-Allergen &amp; Bio-Pollen Surveillance"
        subtitle="Botanical dispersion and bio-aerosol tracking for respiratory allergy mitigation"
        icon="grain"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pollenTypes.map((p, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white text-xs">{p.name}</span>
                <StatusBadge label={p.level} variant={p.variant} />
              </div>
              <div className="text-[11px] text-[#8A94A6] mt-1 line-clamp-1">
                {p.species}
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
