import React from 'react';
import { ShieldCheck, Database, Building2, CheckCircle2, Globe, FileCheck } from 'lucide-react';

export const ResearchSourcesSection: React.FC = () => {
  const sources = [
    {
      id: 'imd',
      name: 'India Meteorological Department (IMD)',
      ministry: 'Ministry of Earth Sciences, Govt. of India',
      role: 'National Weather Forecasting Centre, Climatological Baselines, Doppler Radar Network & Synoptic Bulletins.',
      tag: 'PRIMARY METEOROLOGICAL AUTHORITY',
      color: '#38BDF8',
    },
    {
      id: 'ncmrwf',
      name: 'NCMRWF (MoES)',
      ministry: 'National Centre for Medium Range Weather Forecasting',
      role: 'Unified Model (NCUM 12km), Ensemble Prediction Systems (NEPS), and 4D-Var Data Assimilation.',
      tag: 'NWP & SUPERCOMPUTING',
      color: '#06B6D4',
    },
    {
      id: 'cpcb',
      name: 'Central Pollution Control Board (CPCB / SAFAR)',
      ministry: 'MoEFCC / MoES Joint Surveillance',
      role: 'Continuous Ambient Air Quality Monitoring Stations (CAAQMS), NAQI Sub-Index Calculations & Bio-Aeroallergens.',
      tag: 'AIR QUALITY REGISTRY',
      color: '#10B981',
    },
    {
      id: 'isro',
      name: 'ISRO / SAC / MOSDAC',
      ministry: 'Department of Space, Govt. of India',
      role: 'INSAT-3D, INSAT-3DR Geostationary Imager & Sounder Payloads, OceanSat Scatterometer & Sea Surface Temperatures.',
      tag: 'EARTH OBSERVATION SATELLITES',
      color: '#EC4899',
    },
    {
      id: 'wmo',
      name: 'World Meteorological Organization (WMO)',
      ministry: 'United Nations Specialized Agency',
      role: 'WMO-No. 8 Guide to Meteorological Instruments & Methods of Observation Traceability Standard Compliance.',
      tag: 'GLOBAL OBSERVATION STANDARD',
      color: '#818CF8',
    },
    {
      id: 'ndma',
      name: 'National Disaster Management Authority (NDMA)',
      ministry: 'Ministry of Home Affairs, Govt. of India',
      role: 'Standard Operating Procedures for Extreme Weather Hazards, Cyclone Mitigation & Heat Action Plans.',
      tag: 'EARLY WARNING PROTOCOLS',
      color: '#F59E0B',
    },
  ];

  return (
    <div
      id="research-sources-section"
      className="rounded-3xl bg-[#0B131D] border border-[#1E2E40] p-6 sm:p-8 shadow-xl space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E40] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              Institutional Authority &amp; Data Provenance
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Official Data &amp; Research Authorities
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#2ECC71] bg-[#2ECC71]/10 px-3 py-1 rounded-xl border border-[#2ECC71]/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Authenticated Open Data Archive</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-5 rounded-2xl bg-[#080E16] border border-[#1E2E40] hover:border-[#38BDF8]/50 transition-colors flex flex-col justify-between space-y-3"
          >
            <div>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border block w-fit mb-2"
                style={{
                  color: src.color,
                  backgroundColor: `${src.color}15`,
                  borderColor: `${src.color}35`,
                }}
              >
                {src.tag}
              </span>

              <h4 className="text-sm font-bold text-white leading-snug">
                {src.name}
              </h4>

              <p className="text-[11px] font-mono text-[#38BDF8] mt-0.5">
                {src.ministry}
              </p>

              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                {src.role}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1E2E40] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1 text-[#2ECC71]">
                <FileCheck className="w-3 h-3" /> Verified Source
              </span>
              <span>Govt. of India</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
