import React, { useState, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { STATE_DISASTER_NUMBERS } from '../../data/nationalWarningsData';

interface EmergencyResponseSectionProps {
  selectedLocation?: LocationRecord;
}

export const EmergencyResponseSection: React.FC<EmergencyResponseSectionProps> = ({
  selectedLocation,
}) => {
  const [stateSearch, setStateSearch] = useState('');
  const [isStateDirectoryExpanded, setIsStateDirectoryExpanded] = useState(false);

  // Part 1: National Emergency Lines
  const nationalHelplines = [
    {
      id: 'national-112',
      badge: 'Unified 24x7',
      name: 'National Emergency Helpline',
      number: '112',
      telLink: 'tel:112',
      agency: 'Ministry of Home Affairs (MHA)',
      desc: 'All-India unified emergency response for Police, Fire, Ambulance & Marine rescue.',
      icon: 'emergency',
      accentColor: 'text-[#FF4D4D]',
      btnBg: 'bg-[#FF0000] hover:bg-[#CC0000]',
    },
    {
      id: 'ndma-1078',
      badge: 'National Control',
      name: 'Disaster Management (NDMA)',
      number: '1078',
      secondary: '011-26701728',
      telLink: 'tel:1078',
      agency: 'NDMA Central Command Centre (New Delhi)',
      desc: 'National Disaster Management Authority 24x7 Control Room & Incident Coordination.',
      icon: 'shield_with_heart',
      accentColor: 'text-[#FFA500]',
      btnBg: 'bg-[#FFA500] hover:bg-[#E69500] text-[#0B263D]',
    },
    {
      id: 'state-1070',
      badge: 'Relief Commissioner',
      name: 'State Relief Commissioner / SDMA',
      number: '1070',
      secondary: 'Toll-Free in all States',
      telLink: 'tel:1070',
      agency: 'State Emergency Operations Centre (SEOC)',
      desc: 'State Disaster Management Authority 24x7 Emergency Operations Command.',
      icon: 'crisis_alert',
      accentColor: 'text-[#4FA8E0]',
      btnBg: 'bg-[#1565C0] hover:bg-[#0B3D91] text-white',
    },
    {
      id: 'imd-1800',
      badge: 'Toll-Free (IMD)',
      name: 'IMD Weather Information Helpline',
      number: '1800-180-1717',
      secondary: '011-24631913',
      telLink: 'tel:18001801717',
      agency: 'India Meteorological Department (Mausam Bhavan)',
      desc: 'Official meteorological bulletins, synoptic radar updates & cyclone inquiries.',
      icon: 'cloud_sync',
      accentColor: 'text-[#00E676]',
      btnBg: 'bg-[#008000] hover:bg-[#006600] text-white',
    },
  ];

  // Part 2: State Disaster Numbers
  const stateNumbersList = useMemo(() => {
    return Object.entries(STATE_DISASTER_NUMBERS).map(([code, data]) => ({
      code,
      stateName: data.stateName,
      number: data.number,
      directTel: data.directTel,
      agency: data.agency,
    }));
  }, []);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return stateNumbersList;
    const q = stateSearch.toLowerCase().trim();
    return stateNumbersList.filter(
      (s) =>
        s.stateName.toLowerCase().includes(q) ||
        s.agency.toLowerCase().includes(q) ||
        s.number.includes(q)
    );
  }, [stateNumbersList, stateSearch]);

  return (
    <section
      id="emergency-disaster-response-section"
      aria-label="Emergency and Disaster Response Directory"
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 sm:p-5 shadow-sm flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1D5278] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#081F33] border border-[#1D5278] flex items-center justify-center text-[#FF4D4D]">
            <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Emergency &amp; Disaster Response Directory
            </h3>
            <p className="text-[11px] text-[#AFC4D8]">
              Official 24x7 Command Helplines for Public Safety &amp; Civil Defense
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#00E676] bg-[#081F33] px-2.5 py-1 rounded border border-[#1D5278] self-start sm:self-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#008000]" />
          <span>Verified Government Lines</span>
        </span>
      </div>

      {/* Part 1: National Emergency Lines */}
      <div>
        <div className="text-xs font-bold text-[#E3F2FD] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#4FA8E0]">public</span>
          <span>Part 1: Essential National Emergency Lines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nationalHelplines.map((item) => (
            <div
              key={item.id}
              id={`helpline-card-${item.id}`}
              className="bg-[#081F33] border border-[#1D5278] rounded p-3.5 flex flex-col justify-between gap-2.5 shadow-xs hover:border-[#1565C0] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-[#AFC4D8] uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <span className={`material-symbols-outlined text-[18px] ${item.accentColor}`}>
                    {item.icon}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-tight">
                  {item.name}
                </h4>

                <div className="text-lg font-bold font-mono text-white mt-1">
                  {item.number}
                </div>
                {item.secondary && (
                  <div className="text-[10px] text-[#AFC4D8] font-mono">
                    {item.secondary}
                  </div>
                )}

                <p className="text-[10px] text-[#AFC4D8] mt-1.5 leading-snug">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1D5278] flex items-center justify-between gap-2">
                <span className="text-[9px] text-[#AFC4D8] truncate max-w-[120px]">
                  {item.agency}
                </span>

                <a
                  href={item.telLink}
                  className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1 ${item.btnBg}`}
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: State Disaster Management Directory */}
      <div className="pt-3 border-t border-[#1D5278]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="text-xs font-bold text-[#E3F2FD] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#4FA8E0]">
                apartment
              </span>
              <span>Part 2: State Disaster Management Directory (SDMA / SEOC)</span>
            </div>
            <p className="text-[11px] text-[#AFC4D8] mt-0.5">
              Direct emergency operations numbers for all States &amp; Union Territories
            </p>
          </div>

          <button
            id="btn-toggle-state-directory"
            type="button"
            onClick={() => setIsStateDirectoryExpanded((p) => !p)}
            className="self-start sm:self-auto px-3 py-1 rounded bg-[#081F33] hover:bg-[#102D47] text-[#AFC4D8] hover:text-white border border-[#1D5278] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{isStateDirectoryExpanded ? 'Collapse Directory' : 'Expand All States (24+)'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {isStateDirectoryExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>

        {isStateDirectoryExpanded && (
          <div className="space-y-3 pt-1">
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#AFC4D8] text-[16px]">
                search
              </span>
              <input
                id="input-state-directory-search"
                type="text"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                placeholder="Search state emergency number or agency..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#081F33] border border-[#1D5278] rounded text-xs text-white placeholder-[#AFC4D8] focus:outline-none focus:border-[#1565C0]"
              />
            </div>

            <div className="overflow-x-auto border border-[#1D5278] rounded bg-[#081F33] max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#1D5278]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#061A2B] z-10 border-b border-[#1D5278] text-[#AFC4D8] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-2 px-3 border-r border-[#1D5278]">State / UT</th>
                    <th className="py-2 px-3 border-r border-[#1D5278]">Helpline / Direct Line</th>
                    <th className="py-2 px-3 border-r border-[#1D5278]">Nodal Agency</th>
                    <th className="py-2 px-3 text-right">Emergency Call</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D5278]/60 text-[#AFC4D8]">
                  {filteredStates.map((st) => (
                    <tr key={st.code} className="hover:bg-[#102D47]/40 transition-colors">
                      <td className="py-2 px-3 font-bold text-white border-r border-[#1D5278]">
                        {st.stateName}
                      </td>
                      <td className="py-2 px-3 font-mono text-white border-r border-[#1D5278]">
                        {st.number}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-[#AFC4D8] border-r border-[#1D5278]">
                        {st.agency}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <a
                          href={`tel:${st.directTel}`}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#102D47] hover:bg-[#1565C0] text-[#E3F2FD] hover:text-white border border-[#1D5278] text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          <span>{st.directTel}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
