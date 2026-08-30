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
import { ForecastSevereWarningBanner } from '../components/forecast/ForecastSevereWarningBanner';
import { ForecastAtmosphericHero } from '../components/forecast/ForecastAtmosphericHero';
import { ForecastHourlyTimeline } from '../components/forecast/ForecastHourlyTimeline';
import { ForecastPrecipitationOutlook } from '../components/forecast/ForecastPrecipitationOutlook';
import { ForecastSevenDaySection } from '../components/forecast/ForecastSevenDaySection';
import { ForecastDecisionSupport } from '../components/forecast/ForecastDecisionSupport';
import { ForecastTrendChart } from '../components/forecast/ForecastTrendChart';
import { ForecastAtmosphericConditions } from '../components/forecast/ForecastAtmosphericConditions';
import { ForecastPersonalizedSection } from '../components/forecast/ForecastPersonalizedSection';
import { ForecastRadarPreview } from '../components/forecast/ForecastRadarPreview';
import { ForecastDataProvenance } from '../components/forecast/ForecastDataProvenance';
import { WindIntelligenceCard } from '../components/forecast/WindIntelligenceCard';
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
  const currentWeather = weatherBundle?.current || INITIAL_WEATHER;
  const activeAlerts = weatherBundle?.alerts || [];

  // Format last updated timestamp in standard IST
  const lastUpdatedStr = useMemo(() => {
    const d = weatherBundle?.lastFetchedAt ? new Date(weatherBundle.lastFetchedAt) : new Date();
    return (
      new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d) + ' IST'
    );
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

  const handleNavigateToRadar = useCallback(() => {
    if (onNavigateToTab) {
      onNavigateToTab('radar');
    }
  }, [onNavigateToTab]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* 1. MODEL SELECTION & EXPORT TOOLBAR */}
      <ForecastControlHeader
        selectedLocation={selectedLocation}
        modelType={modelType}
        onSelectModel={setModelType}
        lastUpdated={lastUpdatedStr}
        isLive={weatherBundle?.isLive}
        onExportCSV={handleExportCSV}
      />

      {/* CSV Export Success Notification */}
      {exportNotification && (
        <div className="bg-[#22C7A0]/15 text-[#22C7A0] border border-[#22C7A0]/40 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{exportNotification}</span>
          </div>
          <span className="text-[10px] text-[#93A4B8] uppercase font-mono">Ready in Downloads</span>
        </div>
      )}

      {/* 2. SEVERE WEATHER ALERT BANNER (High Visibility If Active) */}
      <ForecastSevereWarningBanner
        alerts={activeAlerts}
        cityName={selectedLocation.city}
      />

      {/* 3. LOCATION & OBSERVATORY HEADER STRIP */}
      <ForecastStatusBar
        selectedLocation={selectedLocation}
        lastUpdated={lastUpdatedStr}
        isLive={weatherBundle?.isLive}
        isLoading={isLoadingWeather}
        onRefresh={handleRefresh}
        onSelectLocation={onSelectLocation}
      />

      {/* 4. ATMOSPHERIC HERO BANNER (Living Canvas + Big Temperature + Human Narrative) */}
      <ForecastAtmosphericHero
        weather={currentWeather}
        location={selectedLocation}
        hourly={modelHourly}
        daily={modelDaily}
        alerts={activeAlerts}
        modelName={activeModelMeta.shortName}
      />

      {/* 5. 24-HOUR HOURLY TIMELINE WITH CONTINUOUS TEMP CURVE */}
      <ForecastHourlyTimeline
        hourly={modelHourly}
        modelName={activeModelMeta.shortName}
      />

      {/* 6. DEDICATED PRECIPITATION OUTLOOK & QPF INTENSITY TIMELINE */}
      <ForecastPrecipitationOutlook hourly={modelHourly} />

      {/* 7. 7-DAY SYNOPTIC OUTLOOK WITH EXPANDABLE DIAGNOSTIC ACCORDION */}
      <ForecastSevenDaySection
        daily={modelDaily}
        modelName={activeModelMeta.shortName}
      />

      {/* 8. DECISION-SUPPORT SUITE ("What to Expect" + "Best Time for Outdoor & Transit") */}
      <ForecastDecisionSupport
        hourly={modelHourly}
        weather={currentWeather}
        todayForecast={modelDaily[0]}
      />

      {/* 9. CONTINUOUS PARAMETER TRENDS (Interactive SVG Chart with Temp, Rain, Wind, Humidity) */}
      <ForecastTrendChart
        hourly={modelHourly}
        modelName={activeModelMeta.shortName}
      />

      {/* 10. COMPACT ATMOSPHERIC CONDITIONS (Humidity, UV, Visibility, Pressure) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ForecastAtmosphericConditions weather={currentWeather} />

        {/* Wind Intelligence & Boundary Layer Dynamics */}
        <WindIntelligenceCard hourly={modelHourly} />
      </div>

      {/* 11. SOLAR CYCLE & EPHEMERIS + RADAR PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <SolarCycleCard
          weather={currentWeather}
          location={selectedLocation}
        />

        <ForecastRadarPreview
          location={selectedLocation}
          lastUpdated={lastUpdatedStr}
          onNavigateToRadar={handleNavigateToRadar}
        />
      </div>

      {/* 12. FORECAST MODEL CONSENSUS & ENSEMBLE COMPARISON */}
      <ModelConsensusCard
        metrics={comparison.metrics}
        consensusAgreementPercent={comparison.consensusAgreementPercent}
        synopticVerdict={comparison.synopticVerdict}
      />

      {/* 13. PERSONALIZED LIFESTYLE INTERPRETATION (Fitness, Health, Travel, Agriculture, etc.) */}
      <ForecastPersonalizedSection
        weather={currentWeather}
        hourly={modelHourly}
        daily={modelDaily}
        alerts={activeAlerts}
      />

      {/* 14. 24-HOUR SYNOPTIC TABULAR MATRIX (Collapsible with CSV Export) */}
      <ForecastMatrixTable
        hourly={modelHourly}
        modelType={modelType}
        modelName={activeModelMeta.shortName}
        cityName={selectedLocation.city}
        onExportCSV={handleExportCSV}
      />

      {/* 15. SUBTLE DATA PROVENANCE & ARCHITECTURE FOOTER */}
      <ForecastDataProvenance
        lastUpdated={lastUpdatedStr}
        isLive={weatherBundle?.isLive}
        stationId={selectedLocation.id}
        modelName={activeModelMeta.fullName}
      />
    </div>
  );
};
