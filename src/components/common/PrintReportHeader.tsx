import React from 'react';
import { LocationRecord } from '../../types';

interface PrintReportHeaderProps {
  reportTitle: string;
  reportSubtitle?: string;
  location: LocationRecord;
  lastUpdated?: string | Date;
}

export const PrintReportHeader: React.FC<PrintReportHeaderProps> = ({
  reportTitle,
  reportSubtitle = 'Official Indian Meteorological Department (IMD) Ground Telemetry Network',
  location,
  lastUpdated,
}) => {
  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(lastUpdated instanceof Date ? lastUpdated : lastUpdated ? new Date(lastUpdated) : new Date());

  const lat = typeof location.lat === 'number' ? location.lat.toFixed(4) : '20.2961';
  const lng = typeof location.lng === 'number' ? location.lng.toFixed(4) : '85.8245';

  return (
    <div
      id="mausam-official-print-bulletin-header"
      className="mausam-print-official-header hidden print:block mb-6 pb-4 border-b-2 border-[#0B3D91] select-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10pt] font-extrabold tracking-widest text-[#0B3D91] uppercase">
            Government of India • Ministry of Earth Sciences
          </div>
          <div className="text-[17pt] font-black tracking-tight text-[#0F172A] uppercase leading-tight mt-0.5">
            India Meteorological Department
          </div>
          <div className="text-[12pt] font-bold text-[#1565C0] uppercase tracking-wide mt-1">
            {reportTitle}
          </div>
          <div className="text-[9pt] text-[#475569] mt-0.5">
            {reportSubtitle}
          </div>
        </div>

        <div className="text-right text-[8.5pt] font-mono text-[#334155] border-l border-[#CBD5E1] pl-4 flex flex-col gap-0.5 shrink-0">
          <div>
            <strong className="text-[#0F172A]">Station:</strong> {location.city}, {location.state}
          </div>
          <div>
            <strong className="text-[#0F172A]">Coords:</strong> {lat}°N, {lng}°E
          </div>
          <div>
            <strong className="text-[#0F172A]">Station ID:</strong> {location.id || location.imdStation || 'AWS-IND-01'}
          </div>
          <div className="text-[8pt] text-[#64748B] mt-1 pt-1 border-t border-[#E2E8F0]">
            Generated: {formattedDate} IST
          </div>
        </div>
      </div>
    </div>
  );
};
