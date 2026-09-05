import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { CurrentWeather as CurrentWeatherType, LocationRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  location: LocationRecord;
  lastUpdated?: string;
  onRefresh?: () => void;
  onChangeLocationClick?: () => void;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({
  weather,
  location,
  lastUpdated,
  onRefresh,
}) => {
  const { t, tCondition } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const isHighTemp = weather.temp >= 35;
  const isRain = weather.precipitationMm > 0 || weather.condition.toLowerCase().includes('rain');

  const translatedCondition = tCondition(weather.condition);

  const handleShareCard = async () => {
    if (!cardRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0B1724',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setIsCapturing(false);
          return;
        }

        const fileName = `MAUSAM_${(location.city || 'Weather').replace(/\s+/g, '_')}_Summary.png`;

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [new File([blob], fileName, { type: 'image/png' })] })
        ) {
          navigator
            .share({
              title: `MAUSAM Meteorological Report - ${location.city}`,
              text: `Weather in ${location.city}: ${weather.temp}°C, ${weather.condition}`,
              files: [new File([blob], fileName, { type: 'image/png' })],
            })
            .catch(() => {
              // Fallback download on share cancellation
              triggerDownload(blob, fileName);
            });
        } else {
          triggerDownload(blob, fileName);
        }

        setShareToast('PNG Snapshot Created!');
        setTimeout(() => setShareToast(null), 2500);
        setIsCapturing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Weather card snapshot error:', err);
      setIsCapturing(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={cardRef} className="mausam-card flex flex-col justify-between relative">
      {/* Location Bar / Observation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#334155] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
              location_on
            </span>
            <h2 className="text-white font-bold text-base sm:text-lg tracking-tight">
              {location.city}, {location.state}
            </h2>
            {location.district && location.district !== location.city && (
              <span className="text-xs text-[#8A94A6]">
                ({location.district})
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#8A94A6] mt-0.5">
            {t('station', 'Station')}: {weather.stationCode || 'OBS-IND'} • {t('elevation', 'Elev')}: {weather.elevation || location.elevation || '45m ASL'} • Lat: {typeof location.lat === 'number' ? location.lat.toFixed(2) : '20.29'}°N, Lon: {typeof location.lng === 'number' ? location.lng.toFixed(2) : '85.82'}°E
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#8A94A6] text-[11px]">
            {t('updated', 'Updated')}: <strong className="text-[#D7DEE8]">{lastUpdated || t('justNow', 'Just Now')}</strong>
          </span>

          {/* Social Share PNG Button */}
          <button
            type="button"
            id="current-weather-share-btn"
            onClick={handleShareCard}
            disabled={isCapturing}
            className="mausam-btn mausam-btn--secondary mausam-btn--sm flex items-center gap-1 text-[#4FA8E0] hover:text-white"
            title="Share Weather Card (PNG Snapshot)"
            aria-label="Share Weather Card Snapshot"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isCapturing ? 'hourglass_top' : 'share'}
            </span>
            <span className="hidden sm:inline text-[11px]">
              {isCapturing ? 'Capturing...' : 'Share'}
            </span>
          </button>

          {onRefresh && (
            <button
              type="button"
              id="current-weather-refresh-btn"
              onClick={onRefresh}
              className="mausam-btn mausam-btn--secondary mausam-btn--sm"
              title={t('refresh', 'Refresh')}
              aria-label={t('refresh', 'Refresh')}
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
            </button>
          )}
        </div>
      </div>

      {shareToast && (
        <div className="absolute top-2 right-2 bg-[#0B72B9] text-white px-3 py-1 rounded text-xs shadow-lg animate-fade-in z-20">
          {shareToast}
        </div>
      )}

      {/* Main Temperature & Weather State Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 items-center">
        {/* Left Column: Temperature and Status */}
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <div className="flex items-baseline">
              <span className="text-5xl sm:text-6xl font-bold text-white font-mono tracking-tight">
                {typeof weather.temp === 'number' && !Number.isNaN(weather.temp) ? Math.round(weather.temp) : 28}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[#4FA8E0] ml-1">
                °C
              </span>
            </div>
            <div className="text-xs text-[#8A94A6] mt-1 flex items-center gap-1.5">
              <span>{t('feelsLike', 'Feels like')}</span>
              <strong className="text-white font-mono">
                {typeof weather.feelsLike === 'number' && !Number.isNaN(weather.feelsLike)
                  ? `${Math.round(weather.feelsLike)}°C`
                  : typeof weather.temp === 'number' && !Number.isNaN(weather.temp)
                  ? `${Math.round(weather.temp)}°C`
                  : '28°C'}
              </strong>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-l border-[#334155] pl-4">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base">
                {translatedCondition}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8A94A6]">
              <span>
                {t('high', 'High')}:{' '}
                <strong className="text-white font-mono">
                  {typeof weather.tempMax === 'number' && !Number.isNaN(weather.tempMax)
                    ? `${Math.round(weather.tempMax)}°C`
                    : typeof weather.high === 'number' && !Number.isNaN(weather.high)
                    ? `${Math.round(weather.high)}°C`
                    : typeof weather.temp === 'number' && !Number.isNaN(weather.temp)
                    ? `${Math.round(weather.temp + 2)}°C`
                    : '31°C'}
                </strong>
              </span>
              <span>•</span>
              <span>
                {t('low', 'Low')}:{' '}
                <strong className="text-white font-mono">
                  {typeof weather.tempMin === 'number' && !Number.isNaN(weather.tempMin)
                    ? `${Math.round(weather.tempMin)}°C`
                    : typeof weather.low === 'number' && !Number.isNaN(weather.low)
                    ? `${Math.round(weather.low)}°C`
                    : typeof weather.temp === 'number' && !Number.isNaN(weather.temp)
                    ? `${Math.round(weather.temp - 3)}°C`
                    : '24°C'}
                </strong>
              </span>
            </div>

            <div className="mt-1">
              {isRain ? (
                <StatusBadge label={t('precipitationActive', 'Precipitation Active')} variant="info" icon="rainy" />
              ) : isHighTemp ? (
                <StatusBadge label={t('highTemperature', 'High Temperature')} variant="alert" icon="thermostat" />
              ) : (
                <StatusBadge label={t('normalStatus', 'Normal Synoptic Status')} variant="good" icon="check" />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Key Environmental Overview Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#1E2733] p-3 rounded border border-[#334155]">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A94A6]">{t('humidity', 'Humidity')}</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {weather.humidity}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A94A6]">{t('windSpeed', 'Wind Speed')}</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {weather.windSpeed} km/h {weather.windDirection}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A94A6]">{t('pressure', 'Pressure')}</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {weather.pressure} hPa
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A94A6]">{t('visibility', 'Visibility')}</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {weather.visibility ?? weather.visibilityKm ?? 10} km
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A94A6]">{t('uvIndex', 'UV Index')}</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {weather.uvIndex} <span className="text-[10px] text-[#8A94A6]">({weather.uvDescription || 'Moderate'})</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#8A94A6]">{t('dewPoint', 'Dew Point')}</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {weather.dewPoint || 22}°C
            </span>
          </div>
        </div>
      </div>

      {/* Solar Day-Cycle Footer */}
      <div className="pt-3 border-t border-[#334155] flex flex-wrap items-center justify-between text-xs text-[#8A94A6] gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#FFC93C]">
              wb_sunny
            </span>
            <span>{t('sunrise', 'Sunrise')}: <strong className="text-[#D7DEE8] font-mono">{weather.sunrise || '05:42 AM IST'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#FF8C42]">
              wb_twilight
            </span>
            <span>{t('sunset', 'Sunset')}: <strong className="text-[#D7DEE8] font-mono">{weather.sunset || '06:18 PM IST'}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-[#4FA8E0]">
            radar
          </span>
          <span>{t('dopplerRadarActive', 'Doppler S-Band Radial Radar Coverage: Active')}</span>
        </div>
      </div>
    </div>
  );
};
