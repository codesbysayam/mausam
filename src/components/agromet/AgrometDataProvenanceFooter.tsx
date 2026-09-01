import React from 'react';
import {
  ShieldCheck,
  Radio,
  Database,
  Cpu,
  Clock,
  Info,
} from 'lucide-react';

interface AgrometDataProvenanceFooterProps {
  lastUpdatedStr: string;
  stationName: string;
}

export const AgrometDataProvenanceFooter: React.FC<AgrometDataProvenanceFooterProps> = ({
  lastUpdatedStr,
  stationName,
}) => {
  const sources = [
    {
      name: 'IMD AWS & Surface Network',
      role: 'Hourly surface weather telemetry, rainfall accumulation, and anemometer feeds.',
      badge: 'GOV MET SERVICE',
    },
    {
      name: 'Gramin Krishi Mausam Sewa (GKMS)',
      role: 'District-level AMFU advisories, phenological matrices, and IPM pest advisories.',
      badge: 'AGROMET NODE',
    },
    {
      name: 'NCMRWF & IMD NWP Center',
      role: 'Unified model numerical weather prediction, high-resolution WRF, and GFS output.',
      badge: 'NWP ENSEMBLE',
    },
    {
      name: 'ICAR & SAU Research Stations',
      role: 'Crop water requirement indices (ETc), stage thresholds, and bio-control protocols.',
      badge: 'ACADEMIC / ICAR',
    },
  ];

  return (
    <footer
      id="agromet-data-provenance"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#38BDF8]" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              AGROMET DATA PROVENANCE &amp; OBSERVATION METHODOLOGY
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Authoritative institutional integrations powering this agricultural decision-support engine
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#94A3B8] flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Last Synced: <strong className="text-white">{lastUpdatedStr} IST</strong></span>
        </div>
      </div>

      {/* 4 Source Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#0F172A] border border-[#1E293B] p-4 space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 inline-block">
                {src.badge}
              </span>
              <h3 className="text-xs font-mono font-bold text-white">
                {src.name}
              </h3>
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              {src.role}
            </p>
          </div>
        ))}
      </div>

      {/* Institutional Disclaimer */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 flex items-start gap-3 text-[11px] font-mono text-[#94A3B8] leading-relaxed">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <span>
          <strong className="text-white">Notice &amp; Disclaimer:</strong> Weather forecasts and agromet advisories are generated through state-of-the-art numerical modeling and IMD AMFU institutional nodes. Local field conditions, soil texture, microclimatic variations, and canal supply schedules must be cross-verified by farmers before undertaking capital-intensive field operations.
        </span>
      </div>
    </footer>
  );
};
