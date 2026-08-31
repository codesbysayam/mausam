import React, { useState } from 'react';
import { ExtendedAgrometBulletin } from '../../services/agrometService';
import {
  Tractor,
  Clock,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Droplets,
  Sprout,
  Sun,
  Wind,
  Layers,
} from 'lucide-react';

interface FieldOperationsAndFertilizerProps {
  bulletin: ExtendedAgrometBulletin;
  selectedCrop: string;
}

type FieldActivity = 'irrigation' | 'spraying' | 'sowing' | 'harvesting' | 'machinery';

export const FieldOperationsAndFertilizer: React.FC<FieldOperationsAndFertilizerProps> = ({
  bulletin,
  selectedCrop,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<FieldActivity>('spraying');
  const operations = bulletin.operationsTimeline;

  const activities: { id: FieldActivity; name: string; icon: string; title: string }[] = [
    { id: 'irrigation', name: 'IRRIGATION', icon: '💧', title: 'Water Scheduling' },
    { id: 'spraying', name: 'SPRAYING', icon: '🧪', title: 'Pesticide & Foliar Spray' },
    { id: 'sowing', name: 'SOWING', icon: '🌱', title: 'Direct Sowing / Planting' },
    { id: 'harvesting', name: 'HARVESTING', icon: '🌾', title: 'Crop Harvesting' },
    { id: 'machinery', name: 'MACHINERY', icon: '🚜', title: 'Tractor & Interculture' },
  ];

  const getActivityAdvice = (act: FieldActivity) => {
    switch (act) {
      case 'spraying':
        return {
          window: '08:00 AM – 11:00 AM',
          status: 'EXCELLENT',
          statusColor: 'text-[#2ECC71] bg-[#2ECC71]/15 border-[#2ECC71]/40',
          advice: 'Dew dries off leaves by 08:00 AM while wind speed remains below 10 km/h, preventing chemical drift and ensuring optimal stomatal absorption.',
          constraints: 'Wind < 12 km/h • No rain for 4h after spray • Dry leaf surface',
        };
      case 'irrigation':
        return {
          window: 'HOLD / POSTPONE 24H',
          status: 'POSTPONE',
          statusColor: 'text-[#38BDF8] bg-[#38BDF8]/15 border-[#38BDF8]/40',
          advice: 'Convective rainfall expected within next 24 hours. Hold supplemental canal or tubewell irrigation to avoid root hypoxia and nitrogen leaching.',
          constraints: 'Soil moisture currently adequate at 68%',
        };
      case 'sowing':
        return {
          window: '07:00 AM – 12:00 PM',
          status: 'GOOD',
          statusColor: 'text-[#2ECC71] bg-[#2ECC71]/15 border-[#2ECC71]/40',
          advice: 'Moderate soil moisture provides optimal seed-to-soil contact for direct seeded cultivars. Surface crusting risk remains low.',
          constraints: 'Moist seedbed • Soil temp 24–28°C',
        };
      case 'harvesting':
        return {
          window: '10:00 AM – 03:00 PM',
          status: 'FAVORABLE',
          statusColor: 'text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40',
          advice: 'Harvest mature crop during peak thermal hours when canopy moisture is at lowest. Immediately transfer threshed produce to covered shelters.',
          constraints: 'Grain moisture threshold < 14% • Store before evening shower',
        };
      case 'machinery':
      default:
        return {
          window: '11:00 AM – 05:00 PM',
          status: 'MODERATE',
          statusColor: 'text-[#A855F7] bg-[#A855F7]/15 border-[#A855F7]/40',
          advice: 'Allow topsoil surface to shed moisture before operating heavy tractor-drawn implements to prevent soil compaction and tire slippage.',
          constraints: 'Trafficable soil • Avoid waterlogged field edges',
        };
    }
  };

  const currentAdvice = getActivityAdvice(selectedActivity);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT':
        return 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/40';
      case 'GOOD':
        return 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8]/40';
      case 'MODERATE':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
      case 'POOR':
      case 'AVOID':
      default:
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
    }
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-[#101A26] to-[#0A1017] border border-[#1E2E40] p-6 sm:p-8 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1E2E40] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Tractor className="w-5 h-5 text-[#A855F7]" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              Best Field Work Windows
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Hourly operational suitability computed from atmospheric humidity, rainfall probability, temperature, and wind drift.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182635] text-xs font-mono text-[#38BDF8] border border-[#263C52] self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>Prime Operation Window: 08:00 – 11:30 AM</span>
        </div>
      </div>

      {/* 1. 24-Hour Hourly Timeline Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {operations.map((slot) => (
          <div
            key={slot.timeLabel}
            className="rounded-2xl bg-[#0B131C] border border-[#1E2E40] p-4 flex flex-col justify-between hover:border-[#A855F7]/40 transition-all text-center shadow-inner"
          >
            <div>
              <span className="text-xs font-mono font-black text-white block">
                {slot.timeLabel}
              </span>
              <div className="my-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black uppercase font-mono ${getRatingBadge(slot.rating)}`}>
                  {slot.rating}
                </span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-[#1E2E40]/60 text-[10px] text-[#94A3B8] space-y-0.5 font-mono">
              <div>{slot.tempC}°C • {slot.rhPct}% RH</div>
              <div className="text-[#64748B]">{slot.windKmh} km/h wind</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Interactive Selectable Activities Directive */}
      <div className="p-6 rounded-2xl bg-[#0B131C] border border-[#1E2E40] space-y-4 shadow-inner">
        <div>
          <span className="text-xs font-bold text-[#94A3B8] font-mono uppercase tracking-wider block mb-3">
            Select an Activity to View Specific Advisory Window:
          </span>

          {/* Activity Selector Pills */}
          <div className="flex flex-wrap gap-2.5">
            {activities.map((act) => {
              const isSelected = selectedActivity === act.id;
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setSelectedActivity(act.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer focus:outline-none flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#38BDF8] text-[#0A1017] shadow-lg shadow-[#38BDF8]/20 scale-[1.02]'
                      : 'bg-[#14202E] text-[#94A3B8] hover:text-white hover:bg-[#1A2A3D] border border-[#1E2E40]'
                  }`}
                >
                  <span className="text-sm">{act.icon}</span>
                  <span>{act.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Activity Recommendation Card */}
        <div className="p-4 rounded-xl bg-[#121E2C] border border-[#23384E] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">
                Recommended Window: <strong className="text-[#38BDF8] font-mono">{currentAdvice.window}</strong>
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase font-mono ${currentAdvice.statusColor}`}>
                {currentAdvice.status}
              </span>
            </div>
            <p className="text-xs text-[#CBD5E1] leading-relaxed pt-1">
              {currentAdvice.advice}
            </p>
          </div>

          <div className="text-right shrink-0 text-xs border-t md:border-t-0 md:border-l border-[#1E2E40] pt-2 md:pt-0 md:pl-4">
            <span className="text-[10px] text-[#64748B] font-mono uppercase block">Target Constraints</span>
            <span className="font-mono text-[#2ECC71] text-[11px] font-semibold">{currentAdvice.constraints}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
