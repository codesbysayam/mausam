import React from 'react';

interface MatrixRow {
  level: string;
  colorName: string;
  colorHex: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  threshold: string;
  action: string;
}

const MATRIX_ROWS: MatrixRow[] = [
  {
    level: 'Red (Warning — Take Action)',
    colorName: 'Red (#FF0000)',
    colorHex: '#FF0000',
    badgeBg: 'bg-[#FF0000]/20',
    badgeBorder: 'border-[#FF0000]',
    badgeText: 'text-[#FF4D4D]',
    threshold:
      'Extremely Heavy Rainfall (≥ 204.5 mm in 24h), Super/Very Severe Cyclonic Storm (wind > 90 km/h), Violent Flash Flooding, or Severe Heatwave (> 45°C with severe departure).',
    action:
      'Immediate disaster response deployment (NDRF/SDRF). Total ban on coastal ventures. Evacuate vulnerable settlements. Follow all local administration movement restrictions.',
  },
  {
    level: 'Orange (Alert — Be Prepared)',
    colorName: 'Orange (#FFA500)',
    colorHex: '#FFA500',
    badgeBg: 'bg-[#FFA500]/20',
    badgeBorder: 'border-[#FFA500]',
    badgeText: 'text-[#FFA500]',
    threshold:
      'Very Heavy Rainfall (115.6 mm to 204.4 mm in 24h), Squally Winds (50 to 70 km/h), Severe Thunderstorm with squall line / hail, or Elevated Heatwave conditions.',
    action:
      'Keep emergency kits ready. Secure loose outdoor fixtures and farm produce. Avoid travel through known waterlogging corridors. Fishermen to avoid deep sea.',
  },
  {
    level: 'Yellow (Watch — Be Updated)',
    colorName: 'Yellow (#FFFF00)',
    colorHex: '#FFFF00',
    badgeBg: 'bg-[#FFFF00]/20',
    badgeBorder: 'border-[#FFFF00]',
    badgeText: 'text-[#FFFF00]',
    threshold:
      'Heavy Rainfall (64.5 mm to 115.5 mm in 24h), Scattered Thunderstorm with lightning activity, Moderate Wind Gusts (40 to 50 km/h), or Dense Fog (visibility 50-200m).',
    action:
      'Monitor daily IMD district weather updates. Exercise caution while commuting. Seek immediate indoor shelter upon hearing thunder or noticing dark squall clouds.',
  },
  {
    level: 'Green (No Warning — Normal)',
    colorName: 'Green (#008000)',
    colorHex: '#008000',
    badgeBg: 'bg-[#008000]/20',
    badgeBorder: 'border-[#008000]',
    badgeText: 'text-[#00E676]',
    threshold:
      'Routine seasonal meteorological conditions. No severe weather or high-impact weather hazards predicted over the subdivision during the forecast period.',
    action:
      'Normal daily outdoor, agricultural, commercial, and maritime operations may proceed without weather-induced restrictions. Follow routine advisories.',
  },
];

export const NationalClassificationMatrix: React.FC = () => {
  return (
    <section
      id="national-classification-matrix-section"
      aria-label="IMD National Early Warning Alert Matrix"
      className="bg-[#0B263D] border border-[#1D5278] rounded-md p-4 sm:p-5 shadow-sm flex flex-col gap-3"
    >
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#1D5278]">
        <div className="w-8 h-8 rounded bg-[#081F33] border border-[#1D5278] flex items-center justify-center text-[#E3F2FD] shrink-0">
          <span className="material-symbols-outlined text-[18px]">table_chart</span>
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
            National Meteorological Classification Matrix
          </h3>
          <p className="text-[11px] text-[#AFC4D8]">
            Authoritative 4-Stage Warning Thresholds &amp; Standard Operating Procedures (IMD)
          </p>
        </div>
      </div>

      {/* Responsive Table / Structured Matrix */}
      <div className="overflow-x-auto border border-[#1D5278] rounded bg-[#081F33]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1D5278] bg-[#061A2B] text-[#AFC4D8] uppercase tracking-wider text-[10px] font-bold">
              <th className="py-2.5 px-3 border-r border-[#1D5278] min-w-[150px]">
                Alert Level
              </th>
              <th className="py-2.5 px-3 border-r border-[#1D5278] min-w-[120px]">
                Color Code
              </th>
              <th className="py-2.5 px-3 border-r border-[#1D5278] min-w-[280px]">
                Atmospheric Threshold / Severity Meaning
              </th>
              <th className="py-2.5 px-3 min-w-[280px]">
                Standard Public Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D5278]/60 text-[#AFC4D8]">
            {MATRIX_ROWS.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-[#102D47]/40 transition-colors align-top"
              >
                <td className="py-3 px-3 border-r border-[#1D5278] font-bold text-white whitespace-nowrap">
                  {row.level}
                </td>

                <td className="py-3 px-3 border-r border-[#1D5278]">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${row.badgeBg} ${row.badgeBorder} ${row.badgeText}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: row.colorHex }}
                    />
                    <span>{row.colorName}</span>
                  </span>
                </td>

                <td className="py-3 px-3 border-r border-[#1D5278] leading-relaxed text-[#F5F9FC]">
                  {row.threshold}
                </td>

                <td className="py-3 px-3 leading-relaxed text-[#AFC4D8]">
                  {row.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
