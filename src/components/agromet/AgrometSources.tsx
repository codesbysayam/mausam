import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  ShieldCheck,
  Building2,
  Database,
  FileCheck,
  Globe,
  Award,
} from 'lucide-react';

interface AgrometSourcesProps {
  bulletin: ExtendedAgrometBulletin;
}

export const AgrometSources: React.FC<AgrometSourcesProps> = ({ bulletin }) => {
  const sources = [
    {
      name: 'India Meteorological Department (IMD)',
      role: 'Synoptic bulletins, Doppler radar nowcasting & AWS telemetry',
      badge: 'METEOROLOGICAL AUTHORITY',
      color: '#38BDF8',
    },
    {
      name: 'Gramin Krishi Mausam Sewa (GKMS)',
      role: 'District Agromet Field Units (AMFU) bi-weekly farmer advisory network',
      badge: 'AGROMET EXTENSION',
      color: '#10B981',
    },
    {
      name: bulletin.amfuUnit || 'State Agricultural University (SAU)',
      role: 'Agronomic stage-wise validation & crop phenology calibration',
      badge: 'ACADEMIC RESEARCH NODE',
      color: '#F59E0B',
    },
    {
      name: 'NCMRWF (MoES)',
      role: 'Unified Model (NCUM 12km) and ensemble precipitation forecasting',
      badge: 'NUMERICAL PREDICTION',
      color: '#8B5CF6',
    },
  ];

  return (
    <section
      id="agromet-sources-provenance"
      className="rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-6 sm:p-8 shadow-xl space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E40] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              Data Provenance &amp; Institutional Governance
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Authoritative Agromet Sources
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-xl border border-[#10B981]/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Official MoES / MoA&amp;FW Protocol</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sources.map((src) => (
          <div
            key={src.name}
            className="p-4 rounded-2xl bg-[#080E16] border border-[#1E2E40] hover:border-[#38BDF8]/40 transition-colors flex flex-col justify-between space-y-3"
          >
            <div>
              <span
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border block w-fit mb-2"
                style={{
                  color: src.color,
                  backgroundColor: `${src.color}15`,
                  borderColor: `${src.color}35`,
                }}
              >
                {src.badge}
              </span>

              <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                {src.name}
              </h4>

              <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-relaxed">
                {src.role}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1 text-[#10B981]">
                <FileCheck className="w-3 h-3" /> Verified Protocol
              </span>
              <span>Govt. of India</span>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Metadata Strip */}
      <div className="p-4 rounded-2xl bg-[#080E16] border border-[#1E2E40] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div>
          <span className="text-[#64748B] block">Bulletin Reference:</span>
          <span className="text-white font-bold">{bulletin.bulletinNo || 'PAU/AGMET/2026/68'}</span>
        </div>
        <div>
          <span className="text-[#64748B] block">Validity Period:</span>
          <span className="text-white font-bold">{bulletin.validPeriod || '24 Aug - 28 Aug 2026'}</span>
        </div>
        <div>
          <span className="text-[#64748B] block">Data Dissemination:</span>
          <span className="text-[#10B981] font-bold">Bi-Weekly GKMS Network</span>
        </div>
      </div>
    </section>
  );
};
