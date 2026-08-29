import React from 'react';
import { LocationRecord } from '../../types';
import { warningService } from '../../services/warningService';

interface EmergencyResponseSectionProps {
  selectedLocation?: LocationRecord;
}

export const EmergencyResponseSection: React.FC<EmergencyResponseSectionProps> = ({
  selectedLocation,
}) => {
  const activeStateName = selectedLocation?.state || 'Odisha';
  const stateDisasterInfo = warningService.getStateDisasterContact(activeStateName);

  const helplines = [
    {
      id: 'national-112',
      badge: 'Unified 24x7',
      name: 'National Emergency Helpline',
      number: '112',
      telLink: 'tel:112',
      agency: 'Ministry of Home Affairs (MHA)',
      desc: 'All-India emergency response for Police, Fire, Ambulance & Marine rescue.',
      icon: 'emergency',
      accentColor: 'text-[#E74C3C]',
      btnBg: 'bg-[#E74C3C] hover:bg-[#C0392B]',
    },
    {
      id: 'ndma-1078',
      badge: 'National Control',
      name: 'Disaster Management (NDMA)',
      number: '1078 / 011-26701728',
      telLink: 'tel:1078',
      agency: 'NDMA Central Command Centre (New Delhi)',
      desc: 'National Disaster Management Authority 24x7 Control Room & Incident Operations.',
      icon: 'shield_with_heart',
      accentColor: 'text-[#FF8C42]',
      btnBg: 'bg-[#FF8C42] hover:bg-[#E67E22]',
    },
    {
      id: 'state-sdma',
      badge: `${stateDisasterInfo.stateName} State EOC`,
      name: 'State Disaster Control Room',
      number: stateDisasterInfo.number,
      telLink: `tel:${stateDisasterInfo.directTel}`,
      agency: stateDisasterInfo.agency,
      desc: `State Relief Commissioner & SDMA Emergency Operations Centre for ${stateDisasterInfo.stateName}.`,
      icon: 'crisis_alert',
      accentColor: 'text-[#0B72B9]',
      btnBg: 'bg-[#0B72B9] hover:bg-[#0A5A94]',
    },
    {
      id: 'imd-helpline',
      badge: 'Toll-Free (IMD)',
      name: 'IMD Weather Information Helpline',
      number: '1800-180-1717',
      telLink: 'tel:18001801717',
      agency: 'India Meteorological Department (Mausam Bhavan)',
      desc: 'Official meteorological bulletins, synoptic radar status & cyclone advisory inquiries.',
      icon: 'cloud_sync',
      accentColor: 'text-[#2ECC71]',
      btnBg: 'bg-[#2ECC71] hover:bg-[#27AE60]',
    },
  ];

  return (
    <section
      id="emergency-disaster-response-section"
      aria-label="Emergency and Disaster Response Directory"
      className="bg-[#1E2733] border border-[#314255] rounded-md p-4 sm:p-6 shadow-md flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#314255] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#151D26] border border-[#314255] flex items-center justify-center text-[#E74C3C]">
            <span className="material-symbols-outlined text-[20px]">
              phone_in_talk
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Emergency &amp; Disaster Response Directory
            </h3>
            <p className="text-[11px] text-[#8A94A6]">
              Verified official 24x7 command helplines for civil defense, search &amp; rescue operations
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#2ECC71] bg-[#151D26] px-2.5 py-1 rounded border border-[#314255] self-start sm:self-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
          <span>Lines Active 24/7</span>
        </span>
      </div>

      {/* 4 Essential Emergency Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {helplines.map((item) => (
          <div
            key={item.id}
            id={`helpline-card-${item.id}`}
            className="bg-[#151D26] border border-[#314255] rounded-md p-3.5 flex flex-col justify-between gap-3 transition-all hover:border-[#4FA8E0]/60"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-wider bg-[#1E2733] px-2 py-0.5 rounded border border-[#314255]">
                  {item.badge}
                </span>
                <span className={`material-symbols-outlined text-[18px] ${item.accentColor}`}>
                  {item.icon}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white leading-snug">
                {item.name}
              </h4>

              <div className="text-base font-mono font-bold text-white tracking-tight pt-0.5">
                {item.number}
              </div>

              <div className="text-[10px] text-[#4FA8E0] font-medium">
                {item.agency}
              </div>

              <p className="text-[11px] text-[#8A94A6] leading-relaxed line-clamp-2">
                {item.desc}
              </p>
            </div>

            <a
              id={`btn-call-${item.id}`}
              href={item.telLink}
              className={`w-full py-2 rounded text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm ${item.btnBg}`}
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              <span>Direct Emergency Dial</span>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
