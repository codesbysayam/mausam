import React from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Sun,
  Sunrise,
  Sunset,
  CloudMoon,
  Wind,
  Droplets,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface BestFieldWindowsProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

export const BestFieldWindows: React.FC<BestFieldWindowsProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const windows = [
    {
      id: 'morning',
      title: 'MORNING WINDOW',
      time: '06:00 – 09:30 AM',
      rating: 'EXCELLENT',
      ratingColor: '#10B981',
      icon: Sunrise,
      spraying: 'Suitable (Low Wind)',
      fertilizer: 'Wait for Dew to Dry',
      machinery: 'Manual Weeding OK',
      reason: 'Low wind velocity (6–9 km/h) minimizes chemical spray drift. Comfortable ambient temperature (24–27°C).',
      weatherSummary: '25°C • Wind 8 km/h • RH 82%',
    },
    {
      id: 'afternoon',
      title: 'MIDDAY / AFTERNOON',
      time: '12:00 – 15:30 PM',
      rating: 'AVOID SPRAYING',
      ratingColor: '#EF4444',
      icon: Sun,
      spraying: 'Avoid (High Evaporation)',
      fertilizer: 'Not Recommended',
      machinery: 'Heavy Ops Caution',
      reason: 'Midday heat (31–33°C) and UV radiation accelerate spray droplet evaporation and foliar burn. Convective rain probability rises.',
      weatherSummary: '32°C • Wind 14 km/h • UV 6.4',
    },
    {
      id: 'evening',
      title: 'LATE AFTERNOON / EVENING',
      time: '16:30 – 19:00 PM',
      rating: 'GOOD FOR FIELD WORK',
      ratingColor: '#38BDF8',
      icon: Sunset,
      spraying: 'Good Window',
      fertilizer: 'Suitable for Top-Dress',
      machinery: 'Bund Inspection OK',
      reason: 'Declining temperature and stable atmospheric boundary layer facilitate effective pesticide retention and drainage clearance.',
      weatherSummary: '28°C • Wind 10 km/h • RH 75%',
    },
  ];

  return (
    <section id="best-field-windows-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1E2E40]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38BDF8]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#38BDF8]">
              Diurnal Operations Calibration
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Best Field-Work Windows
          </h2>
        </div>
        <span className="text-xs font-mono text-[#94A3B8]">
          Hourly spraying, fertilization &amp; machinery recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {windows.map((w) => {
          const IconComp = w.icon;
          return (
            <div
              key={w.id}
              className="p-5 rounded-3xl bg-[#0B131D] border border-[#1E2E40] hover:border-[#38BDF8]/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${w.ratingColor}15`,
                        color: w.ratingColor,
                      }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-white uppercase">
                        {w.title}
                      </h4>
                      <span className="text-xs font-mono text-[#38BDF8]">
                        {w.time}
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                    style={{
                      color: w.ratingColor,
                      backgroundColor: `${w.ratingColor}12`,
                      borderColor: `${w.ratingColor}35`,
                    }}
                  >
                    {w.rating}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#080E16] border border-[#1E2E40] text-[11px] font-mono text-[#94A3B8] mb-3">
                  {w.weatherSummary}
                </div>

                <p className="text-xs text-[#D7DEE8] leading-relaxed">
                  {w.reason}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#1E2E40] text-[11px] font-mono">
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Foliar Spraying:</span>
                  <span className="text-white font-bold">{w.spraying}</span>
                </div>
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Fertilizer Broadcast:</span>
                  <span className="text-white font-bold">{w.fertilizer}</span>
                </div>
                <div className="flex items-center justify-between text-[#94A3B8]">
                  <span>Tractor / Machinery:</span>
                  <span className="text-white font-bold">{w.machinery}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
