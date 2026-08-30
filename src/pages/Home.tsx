import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { locationService } from '../services/locationService';
import { StateWeatherData, IndiaWeatherMap } from '../components/map/IndiaWeatherMap';
import { WeatherMapMetric } from '../components/map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { useLanguage } from '../i18n/LanguageContext';
import { MainNavTab } from '../components/layout/MainNavigation';
import {
  buildHumanWeatherStory,
  getTimeOfDayGreeting,
  UserPersona,
  PERSONA_CONFIGS,
  getAqiMeaning,
  getHumidityMeaning,
  getWindMeaning,
  getRainProbabilityMeaning,
} from '../services/humanWeatherEngine';

interface HomePageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
  onNavigateToTab: (tab: MainNavTab) => void;
  onSelectLocation: (loc: LocationRecord) => void;
  onStateSelect: (state: StateWeatherData) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  weatherBundle,
  selectedLocation,
  onNavigateToTab,
  onSelectLocation,
  onStateSelect,
}) => {
  const { t, tCondition } = useLanguage();
  const { current, hourly = [], daily = [], alerts = [], lastFetchedAt } = weatherBundle;
  const [mapMetric, setMapMetric] = useState<WeatherMapMetric>('temperature');
  const [stateSearch, setStateSearch] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona>('general');
  const [selectedStateModal, setSelectedStateModal] = useState<StateWeatherData | null>(null);

  const formattedLastUpdated = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(lastFetchedAt || new Date());

  const { greeting, period } = getTimeOfDayGreeting();
  const story = useMemo(() => {
    return buildHumanWeatherStory(current, hourly, daily, alerts, selectedPersona);
  }, [current, hourly, daily, alerts, selectedPersona]);

  // Meaning helpers
  const aqiInfo = getAqiMeaning(current.aqi || 82);
  const humidityInfo = getHumidityMeaning(current.humidity || 72);
  const rainInfo = getRainProbabilityMeaning(current.precipitationProbability || 20);
  const windInfo = getWindMeaning(current.windSpeed || 14, current.windDirection || 'NE');

  // National statistics computation across all 28 states & 8 UTs
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

  // All-India Synoptic Status
  const synopticStatus = useMemo(() => {
    const hasRedAlert = alerts.some((a) => a.severity === 'red') || INDIA_WEATHER_DATA.some((s) => s.rainfall >= 35);
    const hasOrangeAlert = alerts.some((a) => a.severity === 'orange') || INDIA_WEATHER_DATA.some((s) => s.rainfall >= 25 || s.temperature >= 38);
    const hasYellowWatch = alerts.some((a) => a.severity === 'yellow') || INDIA_WEATHER_DATA.some((s) => s.rainfall >= 15 || s.temperature >= 34);

    if (hasRedAlert) {
      return {
        level: 'RED',
        label: 'RED (ACTION REQUIRED)',
        badgeBg: 'bg-[#EF5350]/15 border-[#EF5350]/40 text-[#EF5350]',
        desc: 'Severe weather convective activity / heavy precipitation active in multiple sub-divisions.',
        action: 'Stay updated with local disaster management instructions and avoid vulnerable lowlands.',
      };
    }
    if (hasOrangeAlert) {
      return {
        level: 'ORANGE',
        label: 'ORANGE (BE PREPARED)',
        badgeBg: 'bg-[#FF9F43]/15 border-[#FF9F43]/40 text-[#FF9F43]',
        desc: 'Isolated heavy rainfall and convective thunderstorm cells detected in coastal and central sectors.',
        action: 'Plan outdoor travel with caution; watch for localized waterlogging.',
      };
    }
    if (hasYellowWatch) {
      return {
        level: 'YELLOW',
        label: 'YELLOW (BE ALERT)',
        badgeBg: 'bg-[#FFC857]/15 border-[#FFC857]/40 text-[#FFC857]',
        desc: 'Moderate monsoon activity and scattered cloudiness reported across western and eastern sub-divisions.',
        action: 'Normal routine with awareness of brief localized showers.',
      };
    }

    return {
      level: 'GREEN',
      label: 'GREEN (ROUTINE)',
      badgeBg: 'bg-[#22C7A0]/15 border-[#22C7A0]/40 text-[#22C7A0]',
      desc: 'All-India atmospheric conditions normal. No severe cyclonic or extreme meteorological warnings active.',
      action: 'Conditions are favorable for normal daily movement and outdoor work nationwide.',
    };
  }, [alerts]);

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

  return (
    <div id="mausam-home-view" className="flex flex-col gap-6 w-full pb-12">
      {/* =========================================================================
          1. DISTINCTIVE MAUSAM HOMEPAGE HERO (ATMOSPHERIC STORYTELLING)
      ========================================================================= */}
      <section
        id="homepage-atmospheric-hero"
        className="mausam-hero-environment p-6 sm:p-8 lg:p-10 relative overflow-hidden"
      >
        {/* Soft atmospheric gradient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1499E8]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#22C7A0]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left: Dynamic Greeting & Primary Atmospheric State */}
          <div className="flex-1 min-w-0">
            {/* Top Eyebrow: Greeting + Location */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#43C7F4]">
                {greeting.toUpperCase()}
              </span>
              <span className="text-[#93A4B8] text-xs">•</span>
              <span className="text-xs font-semibold text-[#93A4B8] truncate">
                {selectedLocation.city}, {selectedLocation.state}
              </span>
            </div>

            {/* Main Display: Large Temperature & Conditions */}
            <div className="flex flex-wrap items-baseline gap-4 mb-3">
              <div className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#F4F7FA] tracking-tight">
                {Math.round(current.temp)}°C
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-semibold text-[#F4F7FA]">
                  {tCondition(current.condition)}
                </span>
                <span className="text-sm text-[#93A4B8]">
                  Feels like {Math.round(current.feelsLike || current.temp + 2)}°C
                </span>
              </div>
            </div>

            {/* Humanized Narrative Summary */}
            <p className="text-sm sm:text-base text-[#D1DCE8] max-w-2xl leading-relaxed mb-6">
              {story.whatIsHappening}
            </p>

            {/* Atmospheric Metrics Strip (Inline, non-card pattern) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-[#162331]">
              {/* Rain */}
              <div className="mausam-inline-metric">
                <span className="mausam-metric-label">Rain Risk</span>
                <span className="mausam-metric-val text-[#43C7F4]">
                  {current.precipitationProbability || 20}%
                </span>
                <span className="mausam-metric-hint">{rainInfo.headline}</span>
              </div>

              {/* Wind */}
              <div className="mausam-inline-metric">
                <span className="mausam-metric-label">Wind</span>
                <span className="mausam-metric-val">
                  {current.windSpeed || 14} <span className="text-xs font-normal text-[#93A4B8]">km/h</span>
                </span>
                <span className="mausam-metric-hint">{current.windDirection || 'NE'} • {windInfo.headline}</span>
              </div>

              {/* Air Quality */}
              <div className="mausam-inline-metric">
                <span className="mausam-metric-label">Air Quality</span>
                <span className="mausam-metric-val" style={{ color: aqiInfo.severityColor }}>
                  {current.aqi || 82} <span className="text-xs font-normal opacity-80">AQI</span>
                </span>
                <span className="mausam-metric-hint">{aqiInfo.category}</span>
              </div>

              {/* Humidity */}
              <div className="mausam-inline-metric">
                <span className="mausam-metric-label">Humidity</span>
                <span className="mausam-metric-val">
                  {current.humidity || 72}%
                </span>
                <span className="mausam-metric-hint">{humidityInfo.headline}</span>
              </div>

              {/* UV Index */}
              <div className="mausam-inline-metric col-span-2 sm:col-span-1">
                <span className="mausam-metric-label">UV Index</span>
                <span className="mausam-metric-val text-[#FFC857]">
                  {current.uvIndex || 6}
                </span>
                <span className="mausam-metric-hint">Moderate Solar</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action & Location Switcher Button */}
          <div className="lg:w-72 shrink-0 flex flex-col justify-between gap-4 p-5 rounded-xl bg-[#111C27]/80 border border-[#162331] backdrop-blur-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#93A4B8] block mb-1">
                Regional Observatory
              </span>
              <div className="text-sm font-bold text-[#F4F7FA]">
                {selectedLocation.imdStation || 'AWS Observatory'}
              </div>
              <div className="text-xs text-[#93A4B8] mt-0.5">
                Elev: {selectedLocation.elevation || '45m ASL'} • Lat {selectedLocation.lat?.toFixed(2)}°, Lng {selectedLocation.lng?.toFixed(2)}°
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-[#162331]">
              <button
                type="button"
                id="hero-explore-detailed-weather-btn"
                onClick={() => onNavigateToTab('weather')}
                className="mausam-btn w-full text-xs font-semibold py-2.5 shadow-sm"
              >
                <span>View Live Weather Details</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <button
                type="button"
                id="hero-explore-forecast-btn"
                onClick={() => onNavigateToTab('forecast')}
                className="mausam-btn mausam-btn--secondary w-full text-xs font-medium py-2"
              >
                <span>7-Day Numerical Forecast</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. DATA STORY & PERSONALIZED PRIORITY EXPERIENCE
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: "What this means for you" 4-Stage Narrative Story */}
        <div className="lg:col-span-8 mausam-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#162331] mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1499E8] text-[20px]">
                  auto_stories
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
                  Today&apos;s Atmosphere at a Glance
                </h2>
              </div>
              <span className="text-xs text-[#93A4B8]">
                Human Context Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {/* 1. What is Happening */}
              <div className="p-3.5 rounded-xl bg-[#162331]/50 border border-[#162331]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#43C7F4] mb-1">
                  1. Current Atmosphere
                </div>
                <p className="text-xs text-[#D1DCE8] leading-relaxed">
                  {story.whatIsHappening}
                </p>
              </div>

              {/* 2. What Will Happen */}
              <div className="p-3.5 rounded-xl bg-[#162331]/50 border border-[#162331]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#22C7A0] mb-1">
                  2. Outlook (Next 8 Hours)
                </div>
                <p className="text-xs text-[#D1DCE8] leading-relaxed">
                  {story.whatWillHappen}
                </p>
              </div>

              {/* 3. What Should I Know */}
              <div className="p-3.5 rounded-xl bg-[#162331]/50 border border-[#162331]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#FFC857] mb-1">
                  3. Key Factor to Note
                </div>
                <p className="text-xs text-[#D1DCE8] leading-relaxed">
                  {story.whatShouldIKnow}
                </p>
              </div>

              {/* 4. What Should I Do */}
              <div className="p-3.5 rounded-xl bg-[#162331]/50 border border-[#162331]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF9F43] mb-1">
                  4. Recommended Action
                </div>
                <p className="text-xs text-[#D1DCE8] leading-relaxed">
                  {story.recommendedAction}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#162331] text-[11px] text-[#93A4B8]">
            <span>Synced with IMD AWS Telemetry &amp; GFS Nowcast Matrix</span>
            <span>{formattedLastUpdated}</span>
          </div>
        </div>

        {/* Right 4 Cols: Personalized Priority Selector */}
        <div className="lg:col-span-4 mausam-panel flex flex-col">
          <div className="pb-3 border-b border-[#162331] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#43C7F4] block">
              Personalized Intelligence
            </span>
            <h3 className="text-sm font-bold text-[#F4F7FA] mt-0.5">
              Your Weather Priorities
            </h3>
            <p className="text-xs text-[#93A4B8] mt-1">
              Select your focus to adapt alerts, thresholds, and health advisories:
            </p>
          </div>

          {/* Persona selector pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(Object.keys(PERSONA_CONFIGS) as UserPersona[]).map((pKey) => {
              const cfg = PERSONA_CONFIGS[pKey];
              const isSelected = selectedPersona === pKey;
              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setSelectedPersona(pKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1499E8] text-white shadow-xs'
                      : 'bg-[#162331] text-[#93A4B8] hover:text-[#F4F7FA] hover:bg-[#1C2C3E]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {cfg.icon}
                  </span>
                  <span>{cfg.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Selected persona output card */}
          <div className="p-3.5 rounded-xl bg-[#162331] border border-[#162331] flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#F4F7FA]">
                  {PERSONA_CONFIGS[selectedPersona].label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${story.personaAdvice.badgeColor}`}>
                  {story.personaAdvice.badge}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#43C7F4] mb-1">
                {story.personaAdvice.highlight}
              </div>
              <p className="text-xs text-[#D1DCE8] leading-relaxed">
                {story.personaAdvice.advice}
              </p>
            </div>

            <div className="pt-2.5 mt-2 border-t border-[#111C27] text-[11px] text-[#93A4B8] flex items-center justify-between">
              <span>Persona Mode Active</span>
              <span className="text-[#1499E8] font-semibold cursor-pointer hover:underline" onClick={() => onNavigateToTab('weather')}>
                View in Weather Tab →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ALL-INDIA SYNOPTIC OPERATIONAL STATUS
      ========================================================================= */}
      <section className="mausam-panel flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 border ${synopticStatus.badgeBg}`}>
            <span className="material-symbols-outlined text-[24px]">
              {synopticStatus.level === 'GREEN' ? 'verified_user' : 'warning'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#93A4B8] uppercase font-bold tracking-wider">
                All-India Synoptic Alert Level
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${synopticStatus.badgeBg}`}>
                {synopticStatus.label}
              </span>
            </div>
            <p className="text-xs text-[#D1DCE8] mt-1">
              {synopticStatus.desc}
            </p>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Guidance: {synopticStatus.action}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('warnings')}
            className="mausam-btn mausam-btn--secondary text-xs font-semibold py-2 px-3.5 whitespace-nowrap"
          >
            <span>View All Warnings &amp; Advisories →</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          4. NATIONAL WEATHER SNAPSHOT (INLINE DATA STRIP)
      ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1499E8] text-[20px]">
              bar_chart
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA]">
              National Weather Snapshot (36 States &amp; UTs)
            </h2>
          </div>
          <span className="text-xs text-[#93A4B8]">
            Real-time All-India Aggregate
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Highest Temperature */}
          <div className="mausam-panel-subtle flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Highest Temp (India)
            </span>
            <div className="text-2xl font-semibold text-[#FF9F43] my-1">
              {nationalStats.maxTemp}°C
            </div>
            <span className="text-[11px] text-[#D1DCE8] truncate">
              {nationalStats.maxTempState}
            </span>
          </div>

          {/* Lowest Temperature */}
          <div className="mausam-panel-subtle flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Lowest Temp (India)
            </span>
            <div className="text-2xl font-semibold text-[#43C7F4] my-1">
              {nationalStats.minTemp}°C
            </div>
            <span className="text-[11px] text-[#D1DCE8] truncate">
              {nationalStats.minTempState}
            </span>
          </div>

          {/* National Mean Humidity */}
          <div className="mausam-panel-subtle flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Mean Humidity
            </span>
            <div className="text-2xl font-semibold text-[#F4F7FA] my-1">
              {nationalStats.avgHumidity}%
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              All-India Average
            </span>
          </div>

          {/* National Mean AQI */}
          <div className="mausam-panel-subtle flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              National Mean AQI
            </span>
            <div className="text-2xl font-semibold text-[#FFC857] my-1">
              {nationalStats.avgAqi}
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              {nationalStats.avgAqi <= 100 ? 'Satisfactory' : 'Moderate'}
            </span>
          </div>

          {/* Active Rain States */}
          <div className="mausam-panel-subtle flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Rainfall Active
            </span>
            <div className="text-2xl font-semibold text-[#1499E8] my-1">
              {nationalStats.rainfallStatesCount} <span className="text-xs font-normal text-[#93A4B8]">/ 36</span>
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              Precipitation Zones
            </span>
          </div>

          {/* Active Surveillance Watch */}
          <div className="mausam-panel-subtle flex flex-col justify-between">
            <span className="text-[10px] text-[#93A4B8] uppercase font-bold tracking-wider">
              Watch Zones
            </span>
            <div className="text-2xl font-semibold text-[#22C7A0] my-1">
              {nationalStats.activeAlertsCount}
            </div>
            <span className="text-[11px] text-[#93A4B8] truncate">
              Advisories Active
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INDIA WEATHER MAP & REGIONAL INTERACTION
      ========================================================================= */}
      <section className="flex flex-col gap-3">
        <IndiaWeatherMap
          data={INDIA_WEATHER_DATA}
          metric={mapMetric}
          onMetricChange={setMapMetric}
          selectedState={selectedLocation.state || selectedLocation.name}
          onStateSelect={handleStateClick}
        />
      </section>

      {/* =========================================================================
          6. STATE-WISE WEATHER OBSERVATIONS (FILTERABLE REGIONAL TABLE)
      ========================================================================= */}
      <section className="mausam-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#162331]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F4F7FA] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1499E8] text-[18px]">
                table_rows
              </span>
              <span>State &amp; Union Territory Atmospheric Observations</span>
            </h2>
            <p className="text-xs text-[#93A4B8] mt-0.5">
              Live observational recordings from primary regional stations across India
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#93A4B8] text-[16px]">
              search
            </span>
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
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Table representation */}
        <div className="mausam-table-wrapper">
          <table className="mausam-table">
            <thead>
              <tr>
                <th>State / Union Territory</th>
                <th>Capital Station</th>
                <th>Temp (°C)</th>
                <th>Condition</th>
                <th>Rain (mm)</th>
                <th>Humidity</th>
                <th>AQI</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
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
                    className="hover:bg-[#162331] cursor-pointer transition-colors"
                  >
                    <td className="font-semibold text-[#F4F7FA]">
                      {state.name}
                    </td>
                    <td className="text-[#D1DCE8]">{state.city || '—'}</td>
                    <td className="font-semibold text-[#43C7F4]">
                      {state.temperature}°C
                    </td>
                    <td className="text-[#D1DCE8]">
                      {tCondition(state.condition)}
                    </td>
                    <td className="text-[#D1DCE8]">
                      {state.rainfall > 0 ? `${state.rainfall} mm` : '0 mm'}
                    </td>
                    <td className="text-[#D1DCE8]">
                      {state.humidity}%
                    </td>
                    <td>
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
                    <td>
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

      {/* =========================================================================
          7. QUICK ACCESS PLATFORM TOOLS
      ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            tab: 'weather' as MainNavTab,
            title: 'Live Weather Telemetry',
            desc: '12-parameter calibrated surface observations & micro-metrics',
            icon: 'wb_sunny',
            color: 'text-[#43C7F4]',
            bg: 'bg-[#1499E8]/10 border-[#1499E8]/20',
          },
          {
            tab: 'forecast' as MainNavTab,
            title: 'Numerical 7-Day Forecast',
            desc: 'Multi-model ensemble consensus & diurnal temperature trend curves',
            icon: 'timeline',
            color: 'text-[#22C7A0]',
            bg: 'bg-[#22C7A0]/10 border-[#22C7A0]/20',
          },
          {
            tab: 'warnings' as MainNavTab,
            title: 'Multi-Hazard Warnings',
            desc: 'Convective storm tracking, heavy rainfall bulletins & alerts',
            icon: 'warning_amber',
            color: 'text-[#FF9F43]',
            bg: 'bg-[#FF9F43]/10 border-[#FF9F43]/20',
          },
          {
            tab: 'radar' as MainNavTab,
            title: 'Doppler Radar & Satellite',
            desc: 'ISRO MOSDAC cloud loops & volume scan reflectivity',
            icon: 'radar',
            color: 'text-[#1499E8]',
            bg: 'bg-[#1499E8]/10 border-[#1499E8]/20',
          },
          {
            tab: 'aqi' as MainNavTab,
            title: 'Air Quality & Pollen Hub',
            desc: 'NAQI particulate measurements and health exposure index',
            icon: 'air',
            color: 'text-[#FFC857]',
            bg: 'bg-[#FFC857]/10 border-[#FFC857]/20',
          },
          {
            tab: 'agromet' as MainNavTab,
            title: 'Gramin Krishi Agromet',
            desc: 'Farming weather advisory, irrigation calculator & soil moisture',
            icon: 'potted_plant',
            color: 'text-[#22C7A0]',
            bg: 'bg-[#22C7A0]/10 border-[#22C7A0]/20',
          },
        ].map((tool) => (
          <button
            key={tool.tab}
            type="button"
            onClick={() => onNavigateToTab(tool.tab)}
            className="mausam-panel p-4 hover:border-[#1499E8]/40 hover:bg-[#14202C] transition-all text-left flex items-start gap-3.5 group cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.bg} ${tool.color} border transition-transform group-hover:scale-105`}>
              <span className="material-symbols-outlined text-[20px]">
                {tool.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F4F7FA] group-hover:text-[#43C7F4] transition-colors">
                  {tool.title}
                </span>
                <span className="material-symbols-outlined text-[14px] text-[#93A4B8] group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-xs text-[#93A4B8] mt-1 leading-snug">
                {tool.desc}
              </p>
            </div>
          </button>
        ))}
      </section>

      {/* Contextual State Modal if a state was selected */}
      {selectedStateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setSelectedStateModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[#111C27] border border-[#162331] rounded-2xl p-6 shadow-2xl relative"
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
                className="w-8 h-8 rounded-lg bg-[#162331] text-[#93A4B8] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
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
                className="mausam-btn flex-1 text-xs font-semibold py-2.5"
              >
                <span>Explore {selectedStateModal.name} Weather</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
