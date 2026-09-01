import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { LocatingPhase } from '../services/geolocationService';
import { CurrentLocationBanner } from '../components/location/CurrentLocationBanner';
import {
  NWPModelType,
  NWP_MODELS,
  StructuredModelForecast,
  fetchStructuredModelForecast,
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
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { INITIAL_WEATHER } from '../data/weatherData';

interface ForecastPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onRefresh?: () => void;
  onSelectLocation?: (loc: LocationRecord) => void;
  onNavigateToTab?: (tab: string) => void;
  isLoadingWeather?: boolean;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  weatherBundle,
  selectedLocation,
  onRefresh,
  onSelectLocation,
  onNavigateToTab,
  isLoadingWeather = false,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const [modelType, setModelType] = useState<NWPModelType>('WRF');
  const [exportNotification, setExportNotification] = useState<string | null>(null);
  const [structuredForecast, setStructuredForecast] = useState<StructuredModelForecast | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);

  const rawHourly = weatherBundle?.hourly || [];
  const rawDaily = weatherBundle?.daily || [];
  const currentWeather = weatherBundle?.current || INITIAL_WEATHER;
  const activeAlerts = weatherBundle?.alerts || [];

  const lat = typeof selectedLocation.lat === 'number' ? selectedLocation.lat : 20.2961;
  const lon = typeof selectedLocation.lng === 'number' ? selectedLocation.lng : 85.8245;

  // Fetch real model-specific stream whenever location or model selection changes
  useEffect(() => {
    let isCancelled = false;
    async function loadModelRun() {
      setIsLoadingModel(true);
      try {
        const forecast = await fetchStructuredModelForecast(
          modelType,
          { lat, lon, city: selectedLocation.city, state: selectedLocation.state },
          rawHourly,
          rawDaily
        );
        if (!isCancelled) {
          setStructuredForecast(forecast);
        }
      } catch (e) {
        console.error('[ForecastPage] Failed to fetch structured NWP model:', e);
      } finally {
        if (!isCancelled) {
          setIsLoadingModel(false);
        }
      }
    }

    loadModelRun();
    return () => {
      isCancelled = true;
    };
  }, [modelType, lat, lon, selectedLocation.city, selectedLocation.state, rawHourly, rawDaily]);

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

  // Use structured model hourly & daily if loaded, else fallback to mathematically transformed forecast
  const modelHourly = useMemo(() => {
    if (structuredForecast && structuredForecast.model === modelType && structuredForecast.hourly.length > 0) {
      return structuredForecast.hourly;
    }
    return getModelHourlyForecast(rawHourly, modelType);
  }, [structuredForecast, rawHourly, modelType]);

  const modelDaily = useMemo(() => {
    if (structuredForecast && structuredForecast.model === modelType && structuredForecast.daily.length > 0) {
      return structuredForecast.daily;
    }
    return getModelDailyForecast(rawDaily, modelType);
  }, [structuredForecast, rawDaily, modelType]);

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
    csv += `Coordinates: "${lat.toFixed(4)}N, ${lon.toFixed(4)}E"\n`;
    csv += `Model: "${activeModelMeta.fullName}"\n`;
    csv += `Core: "${activeModelMeta.coreType}"\n`;
    csv += `Grid Resolution: "${activeModelMeta.gridResolution}"\n`;
    csv += `Provider: "${activeModelMeta.sourceProvider}"\n`;
    csv += `Export Timestamp: "${lastUpdatedStr}"\n\n`;
    csv += `Time (IST),Temperature (C),Feels Like (C),Weather Condition,Rain Prob (%),Precip QPF (mm),Wind Speed (km/h),Wind Dir,Wind Degree,Relative Humidity (%),Cloud Cover (%),Visibility (km),Solar UV Index,Dew Point (C)\n`;

    normalized.forEach((h) => {
      csv += `"${h.time}","${h.validTemp !== undefined ? h.validTemp : 'N/A'}","${h.feelsLike !== undefined ? h.feelsLike : 'N/A'}","${h.condition}","${h.validRainProb !== undefined ? h.validRainProb : 'N/A'}","${h.validPrecipMm !== undefined ? h.validPrecipMm : '0'}","${h.validWindSpeed !== undefined ? h.validWindSpeed : 'N/A'}","${h.validWindDirection}","${h.windDegree}","${h.validHumidity !== undefined ? h.validHumidity : 'N/A'}","${h.validCloudCover !== undefined ? h.validCloudCover : 'N/A'}","${h.visibilityKm !== undefined ? h.visibilityKm : 'N/A'}","${h.uvIndex !== undefined ? h.uvIndex : 'N/A'}","${h.dewPoint !== undefined ? h.dewPoint : 'N/A'}"\n`;
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

    setExportNotification(`Exported ${activeModelMeta.shortName} Structured Forecast Dataset (CSV)`);
    setTimeout(() => setExportNotification(null), 3500);
  }, [modelHourly, selectedLocation, activeModelMeta, lastUpdatedStr, modelType, lat, lon]);

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
      {/* Real Geolocation & Active Station Banner */}
      <CurrentLocationBanner
        location={selectedLocation}
        source={locationSource}
        isLocating={isLocating}
        onDetectLocation={onDetectLocation ? () => onDetectLocation(true) : undefined}
        onChangeLocationClick={onOpenLocationCenter}
      />

      {/* 1. MODEL SELECTION & EXPORT TOOLBAR */}
      <ForecastControlHeader
        selectedLocation={selectedLocation}
        modelType={modelType}
        onSelectModel={setModelType}
        lastUpdated={lastUpdatedStr}
        isLive={weatherBundle?.isLive}
        onExportCSV={handleExportCSV}
        structuredForecast={structuredForecast}
        isLoadingModel={isLoadingModel}
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
        validFrom={structuredForecast?.validFrom}
        validUntil={structuredForecast?.validUntil}
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
