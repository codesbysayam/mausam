import React from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';

interface ReportsPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const reports = [
    {
      title: 'Daily Weather Report (All-India Summary)',
      date: '26 August 2026',
      type: 'PDF Bulletin',
      size: '2.4 MB',
      category: 'National Weather Observation',
    },
    {
      title: `District Meteorological Bulletin — ${selectedLocation.city}, ${selectedLocation.state}`,
      date: '26 August 2026',
      type: 'PDF Bulletin',
      size: '1.1 MB',
      category: 'Sub-Divisional Report',
    },
    {
      title: 'Southwest Monsoon Seasonal Rainfall Distribution Report',
      date: 'August 2026',
      type: 'Technical Monograph',
      size: '8.6 MB',
      category: 'Climatological Study',
    },
    {
      title: 'National Ambient Air Quality Annual Summary (CPCB)',
      date: '2025-2026',
      type: 'Government Publication',
      size: '14.2 MB',
      category: 'Environmental Registry',
    },
    {
      title: 'State Agrometeorological Advisory Bulletin (Odisha / All-India)',
      date: '24 August 2026',
      type: 'GKMS Bulletin',
      size: '1.8 MB',
      category: 'Agricultural Meteorology',
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="mausam-card">
        <SectionHeader
          title="Official Meteorological Reports &amp; Publications"
          subtitle="Archive of national synoptic summaries, agromet bulletins, and climatological monographs"
          icon="description"
        />

        <div className="flex flex-col gap-3">
          {reports.map((r, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-[#1E2733] border border-[#334155] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
                    picture_as_pdf
                  </span>
                  <span className="font-bold text-white text-sm">{r.title}</span>
                </div>
                <div className="text-xs text-[#8A94A6] mt-1 flex items-center gap-3">
                  <span>Category: <strong className="text-[#D7DEE8]">{r.category}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-[#D7DEE8]">{r.date}</strong></span>
                  <span>•</span>
                  <span>Size: <strong className="text-[#D7DEE8] font-mono">{r.size}</strong></span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="mausam-btn mausam-btn--secondary mausam-btn--sm shrink-0"
              >
                <span className="material-symbols-outlined text-[15px]">
                  download
                </span>
                <span>Export / Print</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
