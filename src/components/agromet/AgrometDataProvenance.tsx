import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import { ShieldCheck, HelpCircle, Layers, Database, Sparkles, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface AgrometDataProvenanceProps {
  bulletin: ExtendedAgrometBulletin;
}

export const AgrometDataProvenance: React.FC<AgrometDataProvenanceProps> = ({ bulletin }) => {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const glossaryItems = [
    {
      term: 'GKMS',
      title: 'Gramin Krishi Mausam Sewa',
      desc: 'National flagship agro-meteorological advisory service by IMD, Ministry of Earth Sciences, delivering district-level farm advisories twice a week (Tuesdays & Fridays).',
    },
    {
      term: 'AMFU',
      title: 'Agro-Meteorological Field Unit',
      desc: 'Operational field nodes located at State Agricultural Universities (SAUs) and ICAR institutes responsible for tailoring meteorological models to local crop phenology.',
    },
    {
      term: 'ET0',
      title: 'Reference Evapotranspiration',
      desc: 'The rate of total water loss from soil evaporation and crop transpiration in mm/day, guiding precise irrigation scheduling.',
    },
    {
      term: 'ETL',
      title: 'Economic Threshold Level',
      desc: 'The pest density at which control measures must be initiated to prevent an increasing pest population from causing economic crop damage.',
    },
    {
      term: 'GDD',
      title: 'Growing Degree Days',
      desc: 'Thermal heat units accumulated over the physiological baseline temperature, predicting crop growth stages, flowering, and maturity.',
    },
    {
      term: 'DSR',
      title: 'Direct Seeded Rice',
      desc: 'Sowing rice seeds directly in non-puddled soil without nursery raising and transplanting, requiring strict weed and moisture regulation.',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0B1017] border border-[#1E2E40] p-6 text-xs text-[#93A4B8] space-y-5">
      {/* 1. Data Integrity & Provenance Tagging */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#2ECC71]" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Authoritative Data Provenance &amp; Verification Protocol
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div className="p-3 rounded-xl bg-[#111A24] border border-[#1E2E40]">
            <span className="text-[#38BDF8] font-bold block mb-0.5">METEOROLOGICAL SOURCE</span>
            <span className="text-white font-medium">India Meteorological Department (IMD)</span>
            <span className="text-[#64748B] block mt-0.5">NCMRWF GFS 12km Ensemble</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111A24] border border-[#1E2E40]">
            <span className="text-[#2ECC71] font-bold block mb-0.5">AGROMET RESEARCH NODE</span>
            <span className="text-white font-medium">{bulletin.amfuUnit.split('•')[1]?.trim() || 'State Agricultural University (SAU)'}</span>
            <span className="text-[#64748B] block mt-0.5">ICAR Co-ordinated Research</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111A24] border border-[#1E2E40]">
            <span className="text-[#F59E0B] font-bold block mb-0.5">COMPUTATIONAL MODELS</span>
            <span className="text-white font-medium">Deterministic Agro-Met Algorithms</span>
            <span className="text-[#64748B] block mt-0.5">FAO-56 Soil Moisture &amp; ET0</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111A24] border border-[#1E2E40]">
            <span className="text-[#A855F7] font-bold block mb-0.5">PUBLICATION PROTOCOL</span>
            <span className="text-white font-medium">GKMS Bi-Weekly Release Cycle</span>
            <span className="text-[#64748B] block mt-0.5">Tuesday / Friday Synoptic Runs</span>
          </div>
        </div>
      </div>

      {/* 2. Scientific Data Hierarchy Badges */}
      <div className="p-3.5 rounded-xl bg-[#121B26] border border-[#1E2E40] flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-white font-semibold">Data Pipeline Classification:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/30 font-medium">
            ● Live Observation: Synoptic Stations
          </span>
          <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-medium">
            ● 5-Day Forecast: Numerical NWP
          </span>
          <span className="px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-medium">
            ● Model-Derived: Soil Profile &amp; Risk Index
          </span>
          <span className="px-2 py-0.5 rounded bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30 font-medium">
            ● Advisory: AMFU Agrometeorologist
          </span>
        </div>
      </div>

      {/* 3. Expandable Agro-Met Glossary */}
      <div className="border-t border-[#1E2E40] pt-3">
        <button
          type="button"
          onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
          className="flex items-center justify-between w-full text-xs font-semibold text-[#38BDF8] hover:text-[#7DD3FC] transition-colors focus:outline-none cursor-pointer py-1"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Agricultural Meteorology Terminology Glossary (GKMS, AMFU, ET0, ETL, GDD, DSR)
          </span>
          {isGlossaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isGlossaryOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-150">
            {glossaryItems.map((item) => (
              <div key={item.term} className="p-3 rounded-lg bg-[#111A24] border border-[#1E2E40]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white font-mono">{item.term}</span>
                  <span className="text-[10px] text-[#2ECC71] font-semibold">{item.title}</span>
                </div>
                <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
