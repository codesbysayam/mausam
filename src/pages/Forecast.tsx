import React, { useState, useMemo, useCallback } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import {
  NWPModelType,
  NWP_MODELS,
  getModelHourlyForecast,
  getModelDailyForecast,
  calculateModelComparison,
} from '../services/nwpModelService';
import { normalizeHourlyForecast, normalizeDailyForecast } from '../services/forecastNormalizer';
import { ForecastControlHeader } from '../components/forecast/ForecastControlHeader';
import { ForecastStatusBar } from '../components/forecast/ForecastStatusBar';
import { ForecastHourlyTimeline } from '../components/forecast/ForecastHourlyTimeline';
import { ForecastSevenDaySection } from '../components/forecast/ForecastSevenDaySection';
import { ForecastTrendChart } from '../components/forecast/ForecastTrendChart';
import { PrecipitationIntelligenceCard } from '../components/forecast/PrecipitationIntelligenceCard';
import { WindIntelligenceCard } from '../components/forecast/WindIntelligenceCard';
import { AtmosphericComfortCard } from '../components/forecast/AtmosphericComfortCard';
import { SolarCycleCard } from '../components/weather/SolarCycleCard';
import { ModelConsensusCard } from '../components/forecast/ModelConsensusCard';
import { ForecastMatrixTable } from '../components/forecast/ForecastMatrixTable';
import { CheckCircle2 } from 'lucide-react';
import { INITIAL_WEATHER } from '../data/weatherData';

interface ForecastPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onRefresh?: () => void;
  onSelectLocation?: (loc: LocationRecord) => void;
  onNavigateToTab?: (tab: string) => void;
  isLoadingWeather?: boolean;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  weatherBundle,
  selectedLocation,
  onRefresh,
  onSelectLocation,
  onNavigateToTab,
  isLoadingWeather = false,
}) => {
  const [modelType, setModelType] = useState<NWPModelType>('WRF');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const rawHourly = weatherBundle?.hourly || [];
  const rawDaily = weatherBundle?.daily || [];
  const currentWeather = weatherBundle?.current;

  // Format last updated timestamp in standard IST
  const lastUpdatedStr = useMemo(() => {
    const d = weatherBundle?.lastFetchedAt ? new Date(weatherBundle.lastFetchedAt) : new Date();
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d) + ' IST';
  }, [weatherBundle?.lastFetchedAt]);

  // Compute model-specific dynamically transformed hourly & daily trajectories
  const modelHourly = useMemo(() => {
    return getModelHourlyForecast(rawHourly, modelType);
  }, [rawHourly, modelType]);

  const modelDaily = useMemo(() => {
    return getModelDailyForecast(rawDaily, modelType);
  }, [rawDaily, modelType]);

  // Compute multi-model comparative consensus metrics
  const comparison = useMemo(() => {
    return calculateModelComparison(rawHourly, rawDaily);
  }, [rawHourly, rawDaily]);

  const activeModelMeta = NWP_MODELS[modelType];

  // CSV Export handler with real dataset and standardized filename
  const handleExportCSV = useCallback(() => {
    const normalized = normalizeHourlyForecast(modelHourly);
    const dateStr = new Date().toISOString().split('T')[0];
    const safeCity = (selectedLocation?.city || 'India').replace(/[^a-zA-Z0-9]/g, '_');

    let csv = `IMD MAUSAM NUMERICAL WEATHER PREDICTION EXPORT\n`;
    csv += `Station: "${selectedLocation.city}, ${selectedLocation.state}"\n`;
    csv += `Coordinates: "${selectedLocation.lat?.toFixed(2)}N, ${selectedLocation.lng?.toFixed(2)}E"\n`;
    csv += `Model: "${activeModelMeta.fullName}"\n`;
    csv += `Export Timestamp: "${lastUpdatedStr}"\n\n`;
    csv += `Time (IST),Temperature (C),Feels Like (C),Weather Condition,Rain Prob (%),Precip QPF (mm),Wind Speed (km/h),Wind Dir,Wind Degree,Relative Humidity (%),Cloud Cover (%),Visibility (km),Solar UV Index\n`;

    normalized.forEach((h) => {
      csv += `"${h.time}","${h.validTemp}","${h.feelsLike}","${h.condition}","${h.validRainProb}","${h.validPrecipMm}","${h.validWindSpeed}","${h.validWindDirection}","${h.windDegree}","${h.validHumidity}","${h.validCloudCover}","${h.visibilityKm}","${h.uvIndex}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mausam-forecast-${safeCity}-${modelType.toLowerCase()}-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotification(`Exported ${activeModelMeta.shortName} Forecast Dataset (CSV)`);
    setTimeout(() => setExportNotification(null), 3500);
  }, [modelHourly, selectedLocation, activeModelMeta, lastUpdatedStr, modelType]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto pb-10">
      {/* 1. FORECAST COMMAND CONTROL CENTER HEADER */}
      <ForecastControlHeader
        selectedLocation={selectedLocation}
        modelType={modelType}
        onSelectModel={setModelType}
        lastUpdated={lastUpdatedStr}
        isLive={weatherBundle?.isLive}
        onExportCSV={handleExportCSV}
      />

      {/* Export Notification Toast */}
      {exportNotification && (
        <div className="bg-[#2ECC71]/15 text-[#2ECC71] border border-[#2ECC71]/40 px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{exportNotification}</span>
          </div>
          <span className="text-[10px] text-[#8A94A6] uppercase">Downloaded</span>
        </div>
      )}

      {/* 2. LOCATION + FORECAST STATUS STRIP */}
      <ForecastStatusBar
        selectedLocation={selectedLocation}
        lastUpdated={lastUpdatedStr}
        isLive={weatherBundle?.isLive}
        isLoading={isLoadingWeather}
        onRefresh={handleRefresh}
        onSelectLocation={onSelectLocation}
      />

      {/* 3. 24-HOUR HOURLY FORECAST TIMELINE */}
      <ForecastHourlyTimeline
        hourly={modelHourly}
        modelName={activeModelMeta.shortName}
      />

      {/* 4. 7-DAY EXTENDED SYNOPTIC OUTLOOK (COMPACT / DETAILED VIEWS) */}
      <ForecastSevenDaySection
        daily={modelDaily}
        modelName={activeModelMeta.shortName}
      />

      {/* 5. FORECAST PARAMETER TRENDS (INTERACTIVE SVG AREA/LINE CHARTS) */}
      <ForecastTrendChart
        hourly={modelHourly}
        modelName={activeModelMeta.shortName}
      />

      {/* 6. METEOROLOGICAL INTELLIGENCE GRID (2x2 on Large, 1-col on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Precipitation Intelligence */}
        <PrecipitationIntelligenceCard hourly={modelHourly} />

        {/* Wind Intelligence & Rotating Compass */}
        <WindIntelligenceCard hourly={modelHourly} />

        {/* Atmospheric Moisture & Psychrometric Comfort */}
        <AtmosphericComfortCard hourly={modelHourly} />

        {/* Astronomical Solar Ephemeris & Live Sunrise/Sunset Countdown */}
        <SolarCycleCard
          weather={currentWeather || INITIAL_WEATHER}
          location={selectedLocation}
        />
      </div>

      {/* 7. MULTI-MODEL ENSEMBLE CONSENSUS & SPREAD MATRIX */}
      <ModelConsensusCard
        metrics={comparison.metrics}
        consensusAgreementPercent={comparison.consensusAgreementPercent}
        synopticVerdict={comparison.synopticVerdict}
      />

      {/* 8. COMPLETE 24-HOUR SYNOPTIC TIME-SERIES MATRIX */}
      <ForecastMatrixTable
        hourly={modelHourly}
        modelType={modelType}
        modelName={activeModelMeta.shortName}
        cityName={selectedLocation.city}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
