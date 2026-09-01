import React from 'react';
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Droplets,
  SprayCan,
  Sprout,
  Tractor,
  Scissors,
  Wheat,
} from 'lucide-react';
import { WeatherDataBundle } from '../../services/weatherService';
import { CropType, PhenologicalStage, generate7DayAgriculturalForecast } from '../../services/agronomicEngine';

interface FieldOperationsCalendarGridProps {
  weather?: WeatherDataBundle;
  selectedCrop: CropType;
  selectedStage: PhenologicalStage;
  district: string;
}

export const FieldOperationsCalendarGrid: React.FC<FieldOperationsCalendarGridProps> = ({
  weather,
  selectedCrop,
  selectedStage,
  district,
}) => {
  const forecast = generate7DayAgriculturalForecast(weather, selectedCrop, selectedStage);

  const operations = [
    { id: 'irrigation', name: 'Irrigation', icon: Droplets },
    { id: 'spraying', name: 'Foliar Spraying', icon: SprayCan },
    { id: 'fertilization', name: 'Fertilizer Top-Dressing', icon: Sprout },
    { id: 'sowing', name: 'Sowing & Tillage', icon: Tractor },
    { id: 'weeding', name: 'Interculture / Weeding', icon: Scissors },
    { id: 'harvesting', name: 'Harvesting & Threshing', icon: Wheat },
  ];

  // Helper to get status for an operation and day
  const getCellStatus = (opId: string, dayIdx: number) => {
    const day = forecast[dayIdx];
    if (!day) return { text: '—', status: 'na' };

    const isRain = day.rainMm > 8 || day.rainProb > 50;
    const isHeavyRain = day.rainMm > 20 || day.rainProb > 75;
    const isWindy = day.windKmh > 18;
    const isHot = day.tempMax > 38;

    if (opId === 'irrigation') {
      if (isHeavyRain || isRain) return { text: '✕ Defer', status: 'avoid' };
      if (day.rainMm > 2) return { text: '⚠ Check', status: 'caution' };
      return { text: '✓ Ideal', status: 'recommended' };
    }

    if (opId === 'spraying') {
      if (isHeavyRain || isRain || isWindy) return { text: '✕ Avoid', status: 'avoid' };
      if (isHot || day.windKmh > 12) return { text: '⚠ Caution', status: 'caution' };
      return { text: '✓ Favorable', status: 'recommended' };
    }

    if (opId === 'fertilization') {
      if (isHeavyRain) return { text: '✕ Avoid', status: 'avoid' };
      if (isRain) return { text: '⚠ Caution', status: 'caution' };
      return { text: '✓ Suitable', status: 'recommended' };
    }

    if (opId === 'sowing') {
      if (isHeavyRain) return { text: '✕ Wet Soil', status: 'avoid' };
      if (isRain) return { text: '⚠ Caution', status: 'caution' };
      return { text: '✓ Optimal', status: 'recommended' };
    }

    if (opId === 'weeding') {
      if (isHeavyRain || isRain) return { text: '✕ Avoid', status: 'avoid' };
      return { text: '✓ Suitable', status: 'recommended' };
    }

    if (opId === 'harvesting') {
      if (isHeavyRain || isRain) return { text: '✕ Avoid', status: 'avoid' };
      if (day.humidity > 80) return { text: '⚠ Dew Delay', status: 'caution' };
      return { text: '✓ Prime', status: 'recommended' };
    }

    return { text: '✓ Suitable', status: 'recommended' };
  };

  const renderCellBadge = (cell: { text: string; status: string }) => {
    if (cell.status === 'recommended') {
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#10B981]/20 text-[#10B981] font-mono text-[10px] font-bold border border-[#10B981]/40 w-full text-center">
          {cell.text}
        </span>
      );
    }
    if (cell.status === 'caution') {
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-mono text-[10px] font-bold border border-[#F59E0B]/40 w-full text-center">
          {cell.text}
        </span>
      );
    }
    if (cell.status === 'avoid') {
      return (
        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#EF4444]/20 text-[#EF4444] font-mono text-[10px] font-bold border border-[#EF4444]/40 w-full text-center">
          {cell.text}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-[#1E293B] text-[#94A3B8] font-mono text-[10px] w-full text-center">
        {cell.text}
      </span>
    );
  };

  return (
    <section
      id="agromet-calendar-grid"
      className="rounded-2xl bg-[#090D16] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              7-DAY FARM OPERATIONS CALENDAR MATRIX
            </h2>
          </div>
          <p className="text-xs font-mono text-[#94A3B8]">
            Cross-operational suitability matrix for {selectedCrop} in {district}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-[#10B981]">✓ Recommended</span>
          <span className="text-[#F59E0B]">⚠ Caution</span>
          <span className="text-[#EF4444]">✕ Avoid</span>
        </div>
      </div>

      {/* Responsive Matrix Table */}
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[#1E293B] bg-[#0F172A]/80">
              <th className="py-3 px-4 text-xs font-mono font-bold text-white uppercase w-[200px]">
                Operation
              </th>
              {forecast.map((d, idx) => (
                <th key={idx} className="py-3 px-2 text-center text-xs font-mono font-bold text-[#CBD5E1]">
                  <div className="text-white">{d.dayName}</div>
                  <div className="text-[10px] text-[#94A3B8] font-normal">{d.dateStr}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {operations.map((op) => {
              const Icon = op.icon;

              return (
                <tr key={op.id} className="hover:bg-[#0F172A]/50 transition-colors">
                  <td className="py-3.5 px-4 text-xs font-mono font-bold text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#38BDF8] shrink-0" />
                    <span>{op.name}</span>
                  </td>
                  {forecast.map((_, dayIdx) => {
                    const cell = getCellStatus(op.id, dayIdx);
                    return (
                      <td key={dayIdx} className="py-3 px-2 text-center">
                        {renderCellBadge(cell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
