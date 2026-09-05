import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { LocatingPhase } from '../services/geolocationService';
import { locationService } from '../services/locationService';
import { StateWeatherData, IndiaWeatherMap } from '../components/map/IndiaWeatherMap';
import { WeatherMapMetric } from '../components/map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { useLanguage } from '../i18n/LanguageContext';
import { MainNavTab } from '../components/layout/MainNavigation';
import { CurrentLocationBanner } from '../components/location/CurrentLocationBanner';

// Modular Homepage Sections
import { HomeAtmosphericHero } from '../components/home/HomeAtmosphericHero';
import { HomeSevereAlertBanner } from '../components/home/HomeSevereAlertBanner';
import { HomeTodayAtAGlance } from '../components/home/HomeTodayAtAGlance';
import { HomeHourlyTimeline } from '../components/home/HomeHourlyTimeline';
import { HomeSevenDayForecast } from '../components/home/HomeSevenDayForecast';
import { HomeWeatherInsight } from '../components/home/HomeWeatherInsight';
import { HomePersonalizedHub } from '../components/home/HomePersonalizedHub';
import { HomeSolarCycle } from '../components/home/HomeSolarCycle';
import { HomeAirEnvironment } from '../components/home/HomeAirEnvironment';
import { HomeRadarPreview } from '../components/home/HomeRadarPreview';
import { WeatherSnapshot } from '../components/weather/WeatherSnapshot';

// New High-Visibility Functional Components
import { HomeIndiaWeatherStatus } from '../components/home/HomeIndiaWeatherStatus';
import { HomeSevereWeatherStrip } from '../components/home/HomeSevereWeatherStrip';
import { HomeWhatsHappeningNow } from '../components/home/HomeWhatsHappeningNow';
import { HomeAtmosphericChangeDetector } from '../components/home/HomeAtmosphericChangeDetector';
import { HomeLiveTimeline } from '../components/home/HomeLiveTimeline';
import { HomeQuickActionBar } from '../components/home/HomeQuickActionBar';
import { MausamDataHealth } from '../components/common/MausamDataHealth';
import { DataExportActions } from '../components/common/DataExportActions';

import {
  Table,
  Search,
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Droplet,
  Activity,
  CloudRain,
  ShieldAlert,
  BarChart3,
  SunMedium,
  Calendar,
  Radio,
  Sprout,
  FileText,
} from 'lucide-react';

interface HomePageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onNavigateToTab: (tab: MainNavTab) => void;
  onSelectLocation: (loc: LocationRecord) => void;
  onStateSelect: (state: StateWeatherData) => void;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  weatherBundle,
  selectedLocation,
  onNavigateToTab,
  onSelectLocation,
  onStateSelect,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const { t, tCondition } = useLanguage();
  const { current, hourly = [], daily = [], alerts = [], lastFetchedAt } = weatherBundle;
  const [mapMetric, setMapMetric] = useState<WeatherMapMetric>('temperature');
  const [stateSearch, setStateSearch] = useState('');
  const [selectedStateModal, setSelectedStateModal] = useState<StateWeatherData | null>(null);

  // National statistics computation across all 36 States & UTs
  const nationalStats = useMemo(() => {
    let minTemp = Infinity;
    let minTempState = '';
    let maxTemp = -Infinity;
    let maxTempState = '';
    let totalHumidity = 0;
    let totalAqi = 0;
    let rainfallStatesCount = 0;
    let activeAlertsCount = 0;

    INDIA_WEATHER_DATA.forEach((s) => {
      if (s.temperature < minTemp) {
        minTemp = s.temperature;
        minTempState = `${s.city || s.name}`;
      }
      if (s.temperature > maxTemp) {
        maxTemp = s.temperature;
        maxTempState = `${s.city || s.name}`;
      }
      totalHumidity += s.humidity;
      totalAqi += s.aqi;
      if (s.rainfall > 0) {
        rainfallStatesCount++;
      }
      if (s.rainfall >= 20 || s.aqi >= 150 || s.temperature >= 35) {
        activeAlertsCount++;
      }
    });

    const count = INDIA_WEATHER_DATA.length || 1;
    const avgHumidity = Math.round(totalHumidity / count);
    const avgAqi = Math.round(totalAqi / count);

    return {
      minTemp: Math.round(minTemp),
      minTempState,
      maxTemp: Math.round(maxTemp),
      maxTempState,
      avgHumidity,
      avgAqi,
      rainfallStatesCount,
      activeAlertsCount,
      totalStatesAndUTs: count,
    };
  }, []);

  // Filtered State-wise list
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return INDIA_WEATHER_DATA;
    return INDIA_WEATHER_DATA.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q))
    );
  }, [stateSearch]);

  const handleStateClick = (state: StateWeatherData) => {
    setSelectedStateModal(state);
    onStateSelect(state);
  };

  const handleQuickAction = (tabId: string) => {
    if (tabId === 'overview') onNavigateToTab('weather');
    else if (tabId === 'air') onNavigateToTab('aqi');
    else if (['home', 'weather', 'forecast', 'warnings', 'radar', 'aqi', 'agromet', 'reports'].includes(tabId)) {
      onNavigateToTab(tabId as MainNavTab);
    }
  };

  return (
    <div id="mausam-home-view" className="flex flex-col gap-6 w-full pb-14">
      {/* Real Geolocation & Active Station Banner */}
      <CurrentLocationBanner
        location={selectedLocation}
        source={locationSource}
        isLocating={isLocating}
        onDetectLocation={onDetectLocation ? () => onDetectLocation(true) : undefined}
        onChangeLocationClick={onOpenLocationCenter}
      />

      {/* SEVERE WEATHER ALERT STRIP */}
      <HomeSevereWeatherStrip
        alerts={alerts}
        onNavigateToWarnings={() => onNavigateToTab('warnings')}
      />

      {/* DATA HEALTH & GLOBAL REFRESH CONTROL */}
      <MausamDataHealth
        weatherStatus="Operational"
        radarStatus="Operational"
        aqiStatus="Operational"
        warningStatus="Operational"
        stationStatus="Operational"
        onRefreshAll={onDetectLocation ? () => onDetectLocation(true) : undefined}
        lastUpdated={current.lastUpdated}
      />

      {/* QUICK ACTION BAR */}
      <HomeQuickActionBar
        onNavigate={handleQuickAction}
        activeTab="overview"
      />

      {/* 1. LIVE NATIONAL WEATHER OVERVIEW (INDIA WEATHER STATUS) */}
      <HomeIndiaWeatherStatus
        onNavigate={handleQuickAction}
        lastUpdated={current.lastUpdated}
      />

      {/* 1.5 DISTINCTIVE ATMOSPHERIC HERO */}
      <HomeAtmosphericHero
        weather={current}
        location={selectedLocation}
        onExploreWeather={() => onNavigateToTab('weather')}
        onExploreForecast={() => onNavigateToTab('forecast')}
      />

      {/* WHAT'S HAPPENING NOW & WEATHER CHANGE DETECTOR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <HomeWhatsHappeningNow
          weatherBundle={weatherBundle}
          selectedLocation={selectedLocation}
          lastUpdated={current.lastUpdated}
        />
        <HomeAtmosphericChangeDetector
          current={current}
          locationKey={selectedLocation.id || selectedLocation.name}
        />
      </div>

      {/* LIVE WEATHER TIMELINE */}
      <HomeLiveTimeline
        hourly={hourly}
        locationName={selectedLocation.name}
      />

      {/* 2. DYNAMIC SEVERE WEATHER WARNING BANNER */}
      <HomeSevereAlertBanner
        alerts={alerts}
        onNavigateToWarnings={() => onNavigateToTab('warnings')}
      />

      {/* 2.5 ACTIVE OBSERVATORY TELEMETRY SNAPSHOT & GPS CONTROLLER */}
      <WeatherSnapshot
        weatherBundle={weatherBundle}
        location={selectedLocation}
        locationSource={locationSource}
        isLocating={isLocating}
        locatePhase={locatePhase}
        onDetectLocation={onDetectLocation}
        onOpenLocationCenter={onOpenLocationCenter}
      />

      {/* 3. TODAY AT A GLANCE (RICH MULTI-VARIABLE INTERACTION) */}
      <HomeTodayAtAGlance
        weather={current}
        todayForecast={daily[0]}
      />

      {/* 4. HOURLY ATMOSPHERIC TIMELINE */}
      <HomeHourlyTimeline
        hourly={hourly}
        onNavigateToHourly={() => onNavigateToTab('weather')}
      />

      {/* 5. 7-DAY SYNOPTIC OUTLOOK */}
      <HomeSevenDayForecast
        daily={daily}
        onNavigateToForecast={() => onNavigateToTab('forecast')}
      />

      {/* 6. WHAT THIS MEANS FOR YOU (INSIGHTS) & PERSONALIZED INTELLIGENCE */}
      <div className="grid grid-cols-1 gap-6">
        <HomeWeatherInsight
          weather={current}
          todayForecast={daily[0]}
        />

        <HomePersonalizedHub
          weather={current}
          hourly={hourly}
          daily={daily}
          alerts={alerts}
          onNavigateToWeather={() => onNavigateToTab('weather')}
        />
      </div>

      {/* 7. SOLAR TRAJECTORY & AIR QUALITY / ENVIRONMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <HomeSolarCycle
            location={selectedLocation}
            weather={current}
            sunrise={current.sunrise}
            sunset={current.sunset}
          />
        </div>
        <div className="lg:col-span-7">
          <HomeAirEnvironment
            weather={current}
            onNavigateToAqi={() => onNavigateToTab('aqi')}
          />
        </div>
      </div>

      {/* 8. DOPPLER RADAR PREVIEW */}
      <HomeRadarPreview
        location={selectedLocation}
        onNavigateToRadar={() => onNavigateToTab('radar')}
      />

      {/* 9. NATIONAL WEATHER SNAPSHOT (36 STATES & UNION TERRITORIES) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1499E8]/15 text-[#43C7F4] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              National Weather Snapshot (36 States &amp; UTs)
            </h2>
          </div>
          <span className="text-xs text-[#93A4B8]">
            Real-time All-India Observational Synthesis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Highest Temperature */}
          <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Highest Temp
            </span>
            <div className="text-2xl font-bold text-[#FF9F43] my-1">
              {nationalStats.maxTemp}°C
            </div>
            <span className="text-[11px] text-[#D1DCE8] truncate font-medium">
              {nationalStats.maxTempState}
            </span>
          </div>

          {/* Lowest Temperature */}
          <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Lowest Temp
            </span>
            <div className="text-2xl font-bold text-[#43C7F4] my-1">
              {nationalStats.minTemp}°C
            </div>
            <span className="text-[11px] text-[#D1DCE8] truncate font-medium">
              {nationalStats.minTempState}
            </span>
          </div>

          {/* Mean Humidity */}
          <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Mean Humidity
            </span>
            <div className="text-2xl font-bold text-[#F4F7FA] my-1">
              {nationalStats.avgHumidity}%
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              National Average
            </span>
          </div>

          {/* National Mean AQI */}
          <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Mean AQI
            </span>
            <div className="text-2xl font-bold text-[#FFC857] my-1">
              {nationalStats.avgAqi}
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              {nationalStats.avgAqi <= 100 ? 'Satisfactory' : 'Moderate'}
            </span>
          </div>

          {/* Active Rain States */}
          <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Rainfall Active
            </span>
            <div className="text-2xl font-bold text-[#1499E8] my-1">
              {nationalStats.rainfallStatesCount} <span className="text-xs font-normal text-[#93A4B8]">/ 36</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              Precipitation Zones
            </span>
          </div>

          {/* Active Surveillance Watch */}
          <div className="rounded-2xl bg-[#0B141E] border border-[#162331] p-4 flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Watch Zones
            </span>
            <div className="text-2xl font-bold text-[#22C7A0] my-1">
              {nationalStats.activeAlertsCount}
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              Advisories Active
            </span>
          </div>
        </div>
      </section>

      {/* 10. ALL-INDIA INTERACTIVE MAP */}
      <section className="flex flex-col gap-3">
        <IndiaWeatherMap
          data={INDIA_WEATHER_DATA}
          metric={mapMetric}
          onMetricChange={setMapMetric}
          selectedState={selectedLocation.state || selectedLocation.name}
          onStateSelect={handleStateClick}
        />
      </section>

      {/* 11. STATE-WISE OBSERVATIONS TABLE */}
      <section className="rounded-2xl bg-[#0B141E] border border-[#162331] p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#162331]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA] flex items-center gap-2">
              <Table className="w-4 h-4 text-[#1499E8]" />
              <span>State &amp; Union Territory Atmospheric Observations</span>
            </h2>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Live observational recordings from primary regional stations across India
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#93A4B8]" />
            <input
              type="text"
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              placeholder="Filter by state or city name..."
              className="w-full h-9 bg-[#071018] border border-[#162331] focus:border-[#1499E8] rounded-xl text-[#F4F7FA] text-xs pl-9 pr-8 focus:outline-none transition-colors"
              aria-label="Filter by state or city name"
            />
            {stateSearch && (
              <button
                type="button"
                onClick={() => setStateSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#93A4B8] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Real Data Export Actions: CSV, Excel, Print */}
        <DataExportActions
          data={filteredStates}
          reportTitle="Mausam State & Union Territory Atmospheric Observations"
        />

        {/* Table representation */}
        <div className="overflow-x-auto rounded-xl border border-[#162331]">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#071018] text-[#93A4B8] font-bold uppercase text-[10px] tracking-wider border-b border-[#162331]">
              <tr>
                <th className="p-3">State / Union Territory</th>
                <th className="p-3">Capital Station</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Rain (mm)</th>
                <th className="p-3">Humidity</th>
                <th className="p-3">AQI</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162331]/80">
              {filteredStates.map((state) => {
                const isWarning = state.rainfall >= 25 || state.temperature >= 38;
                const isWatch = state.rainfall >= 15 || state.temperature >= 34;

                const alertClass = isWarning
                  ? 'bg-[#EF5350]/15 text-[#EF5350] border-[#EF5350]/40'
                  : isWatch
                  ? 'bg-[#FF9F43]/15 text-[#FF9F43] border-[#FF9F43]/40'
                  : 'bg-[#22C7A0]/15 text-[#22C7A0] border-[#22C7A0]/40';

                const alertLabel = isWarning ? 'Warning' : isWatch ? 'Watch' : 'Routine';

                return (
                  <tr
                    key={state.id}
                    onClick={() => handleStateClick(state)}
                    className="hover:bg-[#111F30] cursor-pointer transition-colors bg-[#0B141E]"
                  >
                    <td className="p-3 font-semibold text-[#F4F7FA]">
                      {state.name}
                    </td>
                    <td className="p-3 text-[#D1DCE8]">{state.city || '—'}</td>
                    <td className="p-3 font-semibold text-[#43C7F4]">
                      {state.temperature}°C
                    </td>
                    <td className="p-3 text-[#D1DCE8]">
                      {tCondition(state.condition)}
                    </td>
                    <td className="p-3 text-[#D1DCE8]">
                      {state.rainfall > 0 ? `${state.rainfall} mm` : '0 mm'}
                    </td>
                    <td className="p-3 text-[#D1DCE8]">
                      {state.humidity}%
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          state.aqi <= 50
                            ? 'bg-[#22C7A0]/20 text-[#22C7A0]'
                            : state.aqi <= 100
                            ? 'bg-[#22C7A0]/20 text-[#22C7A0]'
                            : state.aqi <= 200
                            ? 'bg-[#FFC857]/20 text-[#FFC857]'
                            : 'bg-[#EF5350]/20 text-[#EF5350]'
                        }`}
                      >
                        {state.aqi}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${alertClass}`}>
                        {alertLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 12. QUICK ACCESS PLATFORM TOOLS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[
          {
            tab: 'weather' as MainNavTab,
            title: 'Live Weather Telemetry',
            desc: '12-parameter calibrated surface observations & micro-metrics',
            icon: SunMedium,
            color: 'text-[#43C7F4]',
            bg: 'bg-[#1499E8]/10 border-[#1499E8]/20',
          },
          {
            tab: 'forecast' as MainNavTab,
            title: 'Numerical 7-Day Forecast',
            desc: 'Multi-model ensemble consensus & diurnal temperature trend curves',
            icon: Calendar,
            color: 'text-[#22C7A0]',
            bg: 'bg-[#22C7A0]/10 border-[#22C7A0]/20',
          },
          {
            tab: 'warnings' as MainNavTab,
            title: 'Multi-Hazard Warnings',
            desc: 'Convective storm tracking, heavy rainfall bulletins & alerts',
            icon: ShieldAlert,
            color: 'text-[#FF9F43]',
            bg: 'bg-[#FF9F43]/10 border-[#FF9F43]/20',
          },
          {
            tab: 'radar' as MainNavTab,
            title: 'Doppler Radar & Satellite',
            desc: 'ISRO MOSDAC cloud loops & volume scan reflectivity',
            icon: Radio,
            color: 'text-[#1499E8]',
            bg: 'bg-[#1499E8]/10 border-[#1499E8]/20',
          },
          {
            tab: 'aqi' as MainNavTab,
            title: 'Air Quality & Pollen Hub',
            desc: 'NAQI particulate measurements and health exposure index',
            icon: Activity,
            color: 'text-[#FFC857]',
            bg: 'bg-[#FFC857]/10 border-[#FFC857]/20',
          },
          {
            tab: 'agromet' as MainNavTab,
            title: 'Gramin Krishi Agromet',
            desc: 'Farming weather advisory, irrigation calculator & soil moisture',
            icon: Sprout,
            color: 'text-[#22C7A0]',
            bg: 'bg-[#22C7A0]/10 border-[#22C7A0]/20',
          },
        ].map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <button
              key={tool.tab}
              type="button"
              onClick={() => onNavigateToTab(tool.tab)}
              className="p-4 rounded-2xl bg-[#0B141E] border border-[#162331] hover:border-[#1499E8]/40 hover:bg-[#101C2B] transition-all text-left flex items-start gap-3.5 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.bg} ${tool.color} border transition-transform group-hover:scale-105`}>
                <ToolIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F4F7FA] group-hover:text-[#43C7F4] transition-colors">
                    {tool.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#93A4B8] group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-xs text-[#93A4B8] mt-1 leading-snug">
                  {tool.desc}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* State Selection Modal */}
      {selectedStateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setSelectedStateModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[#0B141E] border border-[#162331] rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#162331] mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#43C7F4]">
                  Regional Atmospheric Profile
                </span>
                <h3 className="text-lg font-bold text-[#F4F7FA]">
                  {selectedStateModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStateModal(null)}
                className="w-8 h-8 rounded-lg bg-[#071018] text-[#93A4B8] hover:text-white flex items-center justify-center cursor-pointer border border-[#162331]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-[#071018] border border-[#162331]">
                <span className="text-[10px] text-[#93A4B8] uppercase block">Capital Station</span>
                <span className="text-sm font-bold text-[#F4F7FA]">{selectedStateModal.city || selectedStateModal.name}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#071018] border border-[#162331]">
                <span className="text-[10px] text-[#93A4B8] uppercase block">Temperature</span>
                <span className="text-lg font-bold text-[#43C7F4]">{selectedStateModal.temperature}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-[#071018] border border-[#162331]">
                <span className="text-[10px] text-[#93A4B8] uppercase block">Condition</span>
                <span className="text-sm font-semibold text-[#D1DCE8]">{selectedStateModal.condition}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#071018] border border-[#162331]">
                <span className="text-[10px] text-[#93A4B8] uppercase block">Air Quality</span>
                <span className="text-sm font-bold text-[#FFC857]">AQI {selectedStateModal.aqi}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const matched =
                    locationService.findLocationByName(selectedStateModal.city || selectedStateModal.name) ||
                    locationService.findLocationsByState(selectedStateModal.name)[0];
                  if (matched) {
                    onSelectLocation(matched);
                  }
                  setSelectedStateModal(null);
                  onNavigateToTab('weather');
                }}
                className="mausam-btn flex-1 text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5"
              >
                <span>Explore {selectedStateModal.name} Live Weather</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
