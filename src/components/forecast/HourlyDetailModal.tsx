import React from 'react';
import { NormalizedHourlyItem } from '../../services/forecastNormalizer';
import { WeatherConditionIcon } from './WeatherConditionIcon';
import {
  X,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Sun,
  Compass,
  Gauge,
  Cloud,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HourlyDetailModalProps {
  item: NormalizedHourlyItem | null;
  modelName: string;
  onClose: () => void;
}

export const HourlyDetailModal: React.FC<HourlyDetailModalProps> = ({
  item,
  modelName,
  onClose,
}) => {
  if (!item) return null;

  return (
    <div
      id="hourly-forecast-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#1E2733] border border-[#314255] rounded-xl p-5 sm:p-6 shadow-2xl max-w-lg w-full text-white flex flex-col gap-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#314255]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0]">
              <WeatherConditionIcon condition={item.condition} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white font-mono">{item.time} IST</span>
                {item.isNow && (
                  <span className="text-[10px] bg-[#4FA8E0]/20 text-[#4FA8E0] border border-[#4FA8E0]/40 px-2 py-0.5 rounded font-bold">
                    CURRENT TIMESTEP
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A94A6]">
                Forecast Model: <strong className="text-[#4FA8E0]">{modelName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8A94A6] hover:text-white rounded-lg hover:bg-[#314255] transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Weather State & Overview */}
        <div className="bg-[#151D26] p-4 rounded-lg border border-[#314255] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#8A94A6] uppercase font-bold tracking-wider block">
              Weather Condition
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{item.condition}</h3>
            <span className="text-xs text-[#8A94A6]">
              Feels like <strong className="text-[#D7DEE8] font-mono">{item.feelsLike}°C</strong> • Dew Point: <strong className="text-[#D7DEE8] font-mono">{item.dewPoint}°C</strong>
            </span>
          </div>

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white">
              {item.validTemp}°C
            </div>
            <span className="text-[11px] text-[#2ECC71]">Continuous Surface Grid</span>
          </div>
        </div>

        {/* Diagnostic Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Rain Probability */}
          <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6]">
              <CloudRain className="w-3.5 h-3.5 text-[#4FA8E0]" />
              <span>Precip Probability</span>
            </div>
            <div className="text-base font-bold font-mono text-[#4FA8E0] mt-1.5">
              {item.validRainProb}%
            </div>
            <span className="text-[10px] text-[#8A94A6]">QPF: {item.validPrecipMm} mm</span>
          </div>

          {/* Wind & Gusts */}
          <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6]">
              <Wind className="w-3.5 h-3.5 text-[#2ECC71]" />
              <span>Wind Speed</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1.5">
              {item.validWindSpeed} <span className="text-xs font-normal text-[#8A94A6]">km/h</span>
            </div>
            <span className="text-[10px] text-[#8A94A6]">
              {item.validWindDirection} • Gust: {item.gustSpeed}k
            </span>
          </div>

          {/* Relative Humidity */}
          <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6]">
              <Droplets className="w-3.5 h-3.5 text-[#1ABC9C]" />
              <span>Relative Humidity</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1.5">
              {item.validHumidity}%
            </div>
            <span className="text-[10px] text-[#8A94A6]">Boundary moisture</span>
          </div>

          {/* Cloud Cover */}
          <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6]">
              <Cloud className="w-3.5 h-3.5 text-[#BDC3C7]" />
              <span>Cloud Cover</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1.5">
              {item.validCloudCover}%
            </div>
            <span className="text-[10px] text-[#8A94A6]">Total sky fraction</span>
          </div>

          {/* Visibility */}
          <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6]">
              <Eye className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Visibility</span>
            </div>
            <div className="text-base font-bold font-mono text-white mt-1.5">
              {item.visibilityKm} <span className="text-xs font-normal text-[#8A94A6]">km</span>
            </div>
            <span className="text-[10px] text-[#8A94A6]">Surface horizontal</span>
          </div>

          {/* Solar UV Index */}
          <div className="bg-[#151D26] p-3 rounded-lg border border-[#314255] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8A94A6]">
              <Sun className="w-3.5 h-3.5 text-[#F1C40F]" />
              <span>UV Index</span>
            </div>
            <div className="text-base font-bold font-mono text-[#F1C40F] mt-1.5">
              {item.uvIndex} <span className="text-xs font-normal text-[#8A94A6]">/ 11+</span>
            </div>
            <span className="text-[10px] text-[#8A94A6]">
              {item.uvIndex >= 6 ? 'High' : item.uvIndex >= 3 ? 'Moderate' : 'Low/None'}
            </span>
          </div>
        </div>

        {/* Footer info note */}
        <div className="text-[11px] text-[#8A94A6] bg-[#151D26] p-2.5 rounded border border-[#314255] flex items-center justify-between">
          <span>Source: Model-integrated dynamical timestep</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#4FA8E0] hover:underline font-semibold"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
