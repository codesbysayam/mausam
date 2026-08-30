import React, { useState } from 'react';
import { CropAdvisory } from '../../types';
import { ChevronDown, Droplet, Sprout, Bug, Tractor, ShieldCheck, AlertCircle } from 'lucide-react';

interface CropAdvisoryAccordionProps {
  crop: CropAdvisory;
  district: string;
}

export const CropAdvisoryAccordion: React.FC<CropAdvisoryAccordionProps> = ({ crop, district }) => {
  const [openSection, setOpenSection] = useState<string | null>('irrigation');

  const toggleSection = (sectionKey: string) => {
    setOpenSection(openSection === sectionKey ? null : sectionKey);
  };

  const sections = [
    {
      id: 'irrigation',
      title: 'Irrigation & Water Management',
      icon: <Droplet className="w-4 h-4 text-[#38BDF8]" />,
      badge: 'Water Management',
      badgeColor: 'bg-[#38BDF8]/15 text-[#38BDF8]',
      content: crop.irrigationAdvice,
      why: 'Precipitation combined with soil moisture buffer meets transpiration demand without pumping.',
      when: 'Hold for next 48 hours; reassess after rainfall.',
    },
    {
      id: 'fertilizer',
      title: 'Nutrient Application & Foliar Sprays',
      icon: <Sprout className="w-4 h-4 text-[#2ECC71]" />,
      badge: 'Nutrient Strategy',
      badgeColor: 'bg-[#2ECC71]/15 text-[#2ECC71]',
      content: crop.fertilizerAdvice,
      why: 'Wet leaves accelerate chemical runoff and volatilization losses.',
      when: 'Clear morning window (08:00 – 11:30 AM) on dry leaves.',
    },
    {
      id: 'pest',
      title: 'Plant Protection, Pest & Disease Control',
      icon: <Bug className="w-4 h-4 text-[#EF4444]" />,
      badge: 'Biosecurity & IPM',
      badgeColor: 'bg-[#EF4444]/15 text-[#EF4444]',
      content: crop.pestDiseaseAdvice,
      why: 'Persistent RH >80% provides favorable micro-environment for fungal sporulation.',
      when: 'Scout immediately; apply bio-fungicide during calm breeze.',
    },
    {
      id: 'sowing',
      title: 'Sowing, Seedbed & Canopy Cultural Practices',
      icon: <Tractor className="w-4 h-4 text-[#A855F7]" />,
      badge: 'Agronomy Practice',
      badgeColor: 'bg-[#A855F7]/15 text-[#A855F7]',
      content: crop.sowingAdvice,
      why: 'Proper row spacing and ridge management protect against root suffocation.',
      when: 'Implement prior to expected heavy rainfall showers.',
    },
    {
      id: 'harvesting',
      title: 'Harvesting, Storage & Post-Harvest Safety',
      icon: <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />,
      badge: 'Post-Harvest',
      badgeColor: 'bg-[#F59E0B]/15 text-[#F59E0B]',
      content: crop.harvestingAdvice,
      why: 'Moisture ingress causes seed grain molding and germination loss.',
      when: 'Store under covered sheds on elevated wooden pallets.',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#0F1622] border border-[#1E2E40] p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
              Crop-Specific Stage Advisory: {crop.cropName}
            </h3>
          </div>
          <p className="text-xs text-[#93A4B8]">
            Detailed stage-wise agronomic recommendations issued by AMFU {district} node.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#93A4B8]">Phenology:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#182635] text-[#38BDF8] border border-[#2A3E54]">
            {crop.stage}
          </span>
        </div>
      </div>

      {/* Accordion Group */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const isOpen = openSection === sec.id;

          return (
            <div
              key={sec.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                isOpen
                  ? 'bg-[#121D2A] border-[#2ECC71]/40 shadow-lg'
                  : 'bg-[#111A24] border-[#1E2E40] hover:border-[#2A3E54] hover:bg-[#131E2A]'
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#182635] border border-[#2A3E54]">
                    {sec.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {sec.title}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${sec.badgeColor}`}>
                        {sec.badge}
                      </span>
                    </div>
                    {!isOpen && (
                      <p className="text-xs text-[#93A4B8] truncate max-w-md sm:max-w-xl mt-0.5">
                        {sec.content}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`p-1.5 rounded-lg bg-[#182635] text-[#93A4B8] transition-transform duration-200 ${isOpen ? 'rotate-180 text-white bg-[#2ECC71]/20' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {/* Accordion Expanded Body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#1E2E40]/60 space-y-3">
                  {/* Primary Advisory Statement */}
                  <div className="p-3 rounded-lg bg-[#0F1622] border border-[#1E2E40]">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-1">
                      Authoritative Recommendation
                    </span>
                    <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                      {sec.content}
                    </p>
                  </div>

                  {/* Why & When Sub-panels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-[#0F1622] border border-[#1E2E40]">
                      <span className="text-[10px] text-[#38BDF8] uppercase font-bold block mb-0.5">
                        Agronomic Reason (Why?)
                      </span>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        {sec.why}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0F1622] border border-[#1E2E40]">
                      <span className="text-[10px] text-[#2ECC71] uppercase font-bold block mb-0.5">
                        Optimal Execution Window (When?)
                      </span>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed font-mono">
                        {sec.when}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
