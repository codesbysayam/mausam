import React, { useState, useMemo } from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { StateWeatherData, IndiaWeatherMap } from '../components/map/IndiaWeatherMap';
import { WeatherMapMetric } from '../components/map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';
import { useLanguage } from '../i18n/LanguageContext';
import { MainNavTab } from '../components/layout/MainNavigation';

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
  onStateSelect,
}) => {
  const { t, tCondition } = useLanguage();
  const { alerts = [], lastFetchedAt } = weatherBundle;
  const [mapMetric, setMapMetric] = useState<WeatherMapMetric>('temperature');
  const [stateSearch, setStateSearch] = useState('');

  const formattedLastUpdated = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(lastFetchedAt || new Date());

  // 1. National Statistics Computation across all 28 states and 8 UTs
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

  // 2. All-India Synoptic Status calculation based on active warnings
  const synopticStatus = useMemo(() => {
    const hasRedAlert = alerts.some((a) => a.severity === 'red') || INDIA_WEATHER_DATA.some(s => s.rainfall >= 35);
    const hasOrangeAlert = alerts.some((a) => a.severity === 'orange') || INDIA_WEATHER_DATA.some(s => s.rainfall >= 25 || s.temperature >= 38);
    const hasYellowWatch = alerts.some((a) => a.severity === 'yellow') || INDIA_WEATHER_DATA.some(s => s.rainfall >= 15 || s.temperature >= 34);

    if (hasRedAlert) {
      return {
        level: 'RED',
        label: 'RED (SEVERE WARNING)',
        color: 'text-[#E74C3C]',
        badgeBg: 'bg-[#E74C3C]/20 border-[#E74C3C]/50 text-[#E74C3C]',
        desc: 'Severe weather convective activity / heavy precipitation active in multiple sub-divisions. Action required.',
      };
    }
    if (hasOrangeAlert) {
      return {
        level: 'ORANGE',
        label: 'ORANGE (ALERT / BE PREPARED)',
        color: 'text-[#FF8C42]',
        badgeBg: 'bg-[#FF8C42]/20 border-[#FF8C42]/50 text-[#FF8C42]',
        desc: 'Isolated heavy rainfall and convective thunderstorm cells detected in central and coastal sectors.',
      };
    }
    if (hasYellowWatch) {
      return {
        level: 'YELLOW',
        label: 'YELLOW (WATCH / BE UPDATED)',
        color: 'text-[#F1C40F]',
        badgeBg: 'bg-[#F1C40F]/20 border-[#F1C40F]/50 text-[#F1C40F]',
        desc: 'Moderate monsoon activity and scattered cloudiness reported across western and eastern sub-divisions.',
      };
    }

    return {
      level: 'GREEN',
      label: 'GREEN (NORMAL)',
      color: 'text-[#2ECC71]',
      badgeBg: 'bg-[#2ECC71]/20 border-[#2ECC71]/50 text-[#2ECC71]',
      desc: 'All-India atmospheric conditions normal. No severe meteorological cyclonic or convective warnings active.',
    };
  }, [alerts]);

  // 3. Filtered State-wise list
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return INDIA_WEATHER_DATA;
    return INDIA_WEATHER_DATA.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q))
    );
  }, [stateSearch]);

  // 4. Quick Access Navigation Items
  const quickAccessItems = [
    {
      tab: 'weather' as MainNavTab,
      title: 'Location Weather',
      desc: 'Detailed telemetry for your selected observatory',
      icon: 'thermostat',
      color: 'text-[#4FA8E0]',
      bgColor: 'bg-[#0B72B9]/15',
    },
    {
      tab: 'forecast' as MainNavTab,
      title: 'Extended Forecast',
      desc: '7-day medium range numerical forecast',
      icon: 'calendar_month',
      color: 'text-[#2ECC71]',
      bgColor: 'bg-[#2ECC71]/15',
    },
    {
      tab: 'warnings' as MainNavTab,
      title: 'Weather Warnings',
      desc: 'Multi-hazard alerts & sub-divisional advisories',
      icon: 'warning',
      color: 'text-[#FF8C42]',
      bgColor: 'bg-[#FF8C42]/15',
    },
    {
      tab: 'radar' as MainNavTab,
      title: 'Radar & Maps',
      desc: 'Doppler radar reflectivity & satellite loops',
      icon: 'radar',
      color: 'text-[#9B59B6]',
      bgColor: 'bg-[#9B59B6]/15',
    },
    {
      tab: 'aqi' as MainNavTab,
      title: 'Air Quality (NAQI)',
      desc: 'Continuous air pollution & pollen tracking',
      icon: 'air',
      color: 'text-[#1ABC9C]',
      bgColor: 'bg-[#1ABC9C]/15',
    },
    {
      tab: 'agromet' as MainNavTab,
      title: 'Agromet Advisory',
      desc: 'Gramin Krishi Mausam Sewa crop bulletins',
      icon: 'agriculture',
      color: 'text-[#F1C40F]',
      bgColor: 'bg-[#F1C40F]/15',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      {/* =========================================================================
          1. ALL-INDIA SYNOPTIC STATUS BANNER
      ========================================================================= */}
      <div className="mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded flex items-center justify-center font-bold text-lg border ${synopticStatus.badgeBg}`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {synopticStatus.level === 'GREEN' ? 'verified' : 'warning'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#8A94A6] uppercase font-bold tracking-wider">
                {t('allIndiaWeatherStatus', 'ALL-INDIA SYNOPTIC STATUS')}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${synopticStatus.badgeBg}`}
              >
                {synopticStatus.label}
              </span>
            </div>
            <p className="text-xs text-[#D7DEE8] mt-0.5">
              {synopticStatus.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <span className="text-[11px] font-mono text-[#8A94A6]">
            IMD-SYNOPTIC-REF: 2026-NWP
          </span>
          <button
            type="button"
            onClick={() => onNavigateToTab('warnings')}
            className="mausam-button text-xs py-1.5 px-3 whitespace-nowrap"
          >
            {t('viewAllAlerts', 'View Advisory Matrix →')}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SELECTED LOCATION COMPACT STATUS ("YOUR LOCATION" Quick Access)
      ========================================================================= */}
      <div className="mausam-panel p-3.5 bg-[#17212B]/90 border border-[#334155] rounded-[5px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0] shrink-0">
            <span className="material-symbols-outlined text-[18px]">near_me</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4FA8E0]">
                {t('yourLocation', 'YOUR LOCATION')}
              </span>
              <span className="text-xs font-bold text-white">
                {selectedLocation.city}, {selectedLocation.state}
              </span>
              <span className="text-[11px] text-[#8A94A6] hidden md:inline">
                • {Math.round(weatherBundle.current.temp)}°C, {tCondition(weatherBundle.current.condition)}
              </span>
            </div>
            <span className="text-[11px] text-[#8A94A6]">
              {selectedLocation.imdStation || 'AWS-IND'} • Elev: {selectedLocation.elevation || '45m'} • Updated: {formattedLastUpdated}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('weather')}
            className="mausam-button text-xs py-1.5 px-3 flex items-center gap-1 text-white bg-[#0B72B9] hover:bg-[#095b94]"
          >
            <span>{t('viewDetailedWeather', 'View Detailed Weather →')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. NATIONAL WEATHER SNAPSHOT (Key All-India Indicators)
      ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">
              analytics
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              {t('nationalWeatherSnapshot', 'NATIONAL WEATHER SNAPSHOT')}
            </h2>
          </div>
          <span className="text-[11px] text-[#8A94A6]">
            All 28 States &amp; 8 Union Territories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Max Temperature */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              Highest Temp (India)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[#FF8C42]">
                {nationalStats.maxTemp}°C
              </span>
            </div>
            <span className="text-[11px] text-[#D7DEE8] truncate block mt-0.5">
              {nationalStats.maxTempState}
            </span>
          </div>

          {/* Min Temperature */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              Lowest Temp (India)
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[#4FA8E0]">
                {nationalStats.minTemp}°C
              </span>
            </div>
            <span className="text-[11px] text-[#D7DEE8] truncate block mt-0.5">
              {nationalStats.minTempState}
            </span>
          </div>

          {/* National Mean Humidity */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              National Avg Humidity
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-white">
                {nationalStats.avgHumidity}%
              </span>
            </div>
            <span className="text-[11px] text-[#8A94A6] truncate block mt-0.5">
              Relative Humidity
            </span>
          </div>

          {/* National Mean AQI */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              National Mean AQI
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className={`text-xl font-bold font-mono ${
                  nationalStats.avgAqi <= 100 ? 'text-[#2ECC71]' : 'text-[#F1C40F]'
                }`}
              >
                {nationalStats.avgAqi}
              </span>
            </div>
            <span className="text-[11px] text-[#8A94A6] truncate block mt-0.5">
              {nationalStats.avgAqi <= 100 ? 'Satisfactory' : 'Moderate'}
            </span>
          </div>

          {/* Active Rainfall Sub-divisions */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              Rainfall Active
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[#4FA8E0]">
                {nationalStats.rainfallStatesCount}
              </span>
              <span className="text-xs text-[#8A94A6]">/ 36 States &amp; UTs</span>
            </div>
            <span className="text-[11px] text-[#8A94A6] truncate block mt-0.5">
              Monsoon Coverage
            </span>
          </div>

          {/* Active Convective Watches */}
          <div className="mausam-card p-3 border border-[#334155]">
            <span className="text-[10px] text-[#8A94A6] uppercase font-bold block">
              Met Watch Zones
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[#F1C40F]">
                {nationalStats.activeAlertsCount}
              </span>
              <span className="text-xs text-[#8A94A6]">Zones</span>
            </div>
            <span className="text-[11px] text-[#8A94A6] truncate block mt-0.5">
              Surveillance Active
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. INDIA WEATHER MAP & METEOROLOGICAL TELEMETRY
      ========================================================================= */}
      <IndiaWeatherMap
        data={INDIA_WEATHER_DATA}
        metric={mapMetric}
        onMetricChange={setMapMetric}
        selectedState={selectedLocation.state || selectedLocation.name}
        onStateSelect={onStateSelect}
      />

      {/* =========================================================================
          5. STATE-WISE WEATHER SUMMARY (28 STATES & 8 UNION TERRITORIES)
      ========================================================================= */}
      <div className="mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#334155]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
                table_chart
              </span>
              <span>{t('stateWiseSummary', 'STATE-WISE WEATHER SUMMARY (28 STATES & 8 UTs)')}</span>
            </h2>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              Current observation data for all official Indian States and Union Territories
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A94A6] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              placeholder={t('searchState', 'Filter by state or UT name...')}
              className="w-full h-8 bg-[#0F141A] border border-[#334155] rounded text-white text-xs pl-8 pr-7 focus:outline-none focus:border-[#0B72B9]"
              aria-label={t('searchState', 'Filter by state or UT name...')}
            />
            {stateSearch && (
              <button
                type="button"
                onClick={() => setStateSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A94A6] hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto border border-[#334155] rounded-[5px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F141A] border-b border-[#334155] text-[#8A94A6] text-[11px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">State / Union Territory</th>
                <th className="py-2.5 px-3">Capital Station</th>
                <th className="py-2.5 px-3 font-mono">Temp (°C)</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3 font-mono">Rainfall (mm)</th>
                <th className="py-2.5 px-3 font-mono">Humidity (%)</th>
                <th className="py-2.5 px-3 font-mono">AQI</th>
                <th className="py-2.5 px-3">Alert Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/40">
              {filteredStates.map((state) => {
                const isWarning = state.rainfall >= 25 || state.temperature >= 38;
                const isWatch = state.rainfall >= 15 || state.temperature >= 34;

                const alertClass = isWarning
                  ? 'bg-[#E74C3C]/15 text-[#E74C3C] border-[#E74C3C]/40'
                  : isWatch
                  ? 'bg-[#F1C40F]/15 text-[#F1C40F] border-[#F1C40F]/40'
                  : 'bg-[#2ECC71]/15 text-[#2ECC71] border-[#2ECC71]/40';

                const alertLabel = isWarning ? 'Warning' : isWatch ? 'Watch' : 'Normal';

                return (
                  <tr
                    key={state.id}
                    onClick={() => onStateSelect(state)}
                    className="hover:bg-[#1E2733] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                      <span>{state.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#D7DEE8]">{state.city || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#4FA8E0]">
                      {state.temperature}°C
                    </td>
                    <td className="py-2.5 px-3 text-[#D7DEE8]">
                      {tCondition(state.condition)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#D7DEE8]">
                      {state.rainfall > 0 ? `${state.rainfall} mm` : '0 mm'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#D7DEE8]">
                      {state.humidity}%
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          state.aqi <= 50
                            ? 'bg-[#2ECC71]/20 text-[#2ECC71]'
                            : state.aqi <= 100
                            ? 'bg-[#2ECC71]/20 text-[#2ECC71]'
                            : state.aqi <= 200
                            ? 'bg-[#F1C40F]/20 text-[#F1C40F]'
                            : 'bg-[#FF8C42]/20 text-[#FF8C42]'
                        }`}
                      >
                        {state.aqi}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${alertClass}`}
                      >
                        {alertLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          6. MAJOR WEATHER WARNINGS & ADVISORIES
      ========================================================================= */}
      <div className="mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#334155]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF8C42] text-[18px]">
              warning
            </span>
            <span>{t('majorWeatherWarnings', 'MAJOR WEATHER WARNINGS & ADVISORIES')}</span>
          </h2>
          <span className="text-[11px] font-mono text-[#8A94A6]">
            {t('sourceIMD', 'Source: IMD / NDMA Multi-Hazard Network')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="mausam-alert warning p-3 rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white uppercase">
                  Odisha &amp; North Coastal Andhra
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/40 font-bold">
                  Code Yellow
                </span>
              </div>
              <p className="text-xs text-[#D7DEE8] mt-1.5">
                Squally wind speed reaching 40-50 km/h with scattered heavy rainfall over coastal sub-divisions. Fishermen advised not to venture into north-west Bay of Bengal.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#8A94A6] mt-2 pt-2 border-t border-[#334155]">
              <span>Valid: Next 24 Hours</span>
              <span>IMD Coastal Bulletin</span>
            </div>
          </div>

          <div className="mausam-alert normal p-3 rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white uppercase">
                  Western Himalayan Region
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#2ECC71]/20 text-[#2ECC71] border border-[#2ECC71]/40 font-bold">
                  Code Green
                </span>
              </div>
              <p className="text-xs text-[#D7DEE8] mt-1.5">
                Fairly widespread light to moderate precipitation over Jammu &amp; Kashmir, Ladakh, and Himachal Pradesh. Normal seasonal atmospheric temperatures.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#8A94A6] mt-2 pt-2 border-t border-[#334155]">
              <span>Valid: Next 48 Hours</span>
              <span>RMC New Delhi</span>
            </div>
          </div>

          <div className="mausam-alert warning p-3 rounded flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white uppercase">
                  Northeast Sub-Divisions (Assam &amp; Meghalaya)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF8C42]/20 text-[#FF8C42] border border-[#FF8C42]/40 font-bold">
                  Code Yellow
                </span>
              </div>
              <p className="text-xs text-[#D7DEE8] mt-1.5">
                Isolated heavy rainfall with thunderstorm accompanied by lightning likely over Assam, Meghalaya, and Arunachal Pradesh.
              </p>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#8A94A6] mt-2 pt-2 border-t border-[#334155]">
              <span>Valid: Next 36 Hours</span>
              <span>RMC Dispur</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. QUICK ACCESS SERVICES
      ========================================================================= */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4FA8E0] text-[18px]">
            grid_view
          </span>
          <span>{t('quickAccess', 'QUICK ACCESS SERVICES')}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {quickAccessItems.map((item) => (
            <button
              key={item.tab}
              type="button"
              onClick={() => onNavigateToTab(item.tab)}
              className="mausam-card p-3.5 border border-[#334155] hover:border-[#0B72B9] hover:bg-[#1E2733] transition-all text-left flex items-start gap-3 group"
            >
              <div
                className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${item.bgColor} ${item.color} border border-[#334155]`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white group-hover:text-[#4FA8E0] transition-colors">
                    {item.title}
                  </h3>
                  <span className="material-symbols-outlined text-[14px] text-[#8A94A6] group-hover:text-white group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
                <p className="text-[11px] text-[#8A94A6] mt-0.5 leading-snug">
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          8. RECENT WEATHER UPDATES & NATIONAL TELEMETRY STATUS
      ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bulletins */}
        <div className="mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[16px]">
              newspaper
            </span>
            <span>{t('recentUpdates', 'RECENT WEATHER BULLETINS & UPDATES')}</span>
          </h2>
          <div className="space-y-2 text-xs divide-y divide-[#334155]/40">
            <div className="pt-2 first:pt-0">
              <div className="flex justify-between text-[10px] text-[#8A94A6]">
                <span className="text-[#4FA8E0] font-bold">ALL-INDIA SYNOPTIC BULLETIN</span>
                <span>08:30 IST</span>
              </div>
              <p className="text-[#D7DEE8] mt-0.5 text-[11px]">
                Monsoon trough at mean sea level continues to pass through normal alignment with embedded cyclonic circulation over north Odisha.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[10px] text-[#8A94A6]">
                <span className="text-[#2ECC71] font-bold">DOPPLER RADAR NETWORK</span>
                <span>09:00 IST</span>
              </div>
              <p className="text-[#D7DEE8] mt-0.5 text-[11px]">
                39 Doppler Weather Radars (DWR) operational across all regional meteorological centres delivering 10-minute volume scans.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[10px] text-[#8A94A6]">
                <span className="text-[#FF8C42] font-bold">AGROMET HARVEST ADVISORY</span>
                <span>06:00 IST</span>
              </div>
              <p className="text-[#D7DEE8] mt-0.5 text-[11px]">
                Advisories issued for kharif paddy transplanting in eastern India and soybean pest monitoring in central plateau.
              </p>
            </div>
          </div>
        </div>

        {/* National Network Infrastructure Stats */}
        <div className="mausam-panel p-4 bg-[#17212B] border border-[#334155] rounded-[5px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#4FA8E0] text-[16px]">
              hub
            </span>
            <span>{t('nationalStatistics', 'NATIONAL METEOROLOGICAL INFRASTRUCTURE')}</span>
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#0F141A] p-2.5 rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] uppercase block">Automatic Weather Stations</span>
              <span className="text-base font-bold font-mono text-white">1,050+ AWS</span>
              <span className="text-[10px] text-[#2ECC71] block">Real-time Telemetry Active</span>
            </div>
            <div className="bg-[#0F141A] p-2.5 rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] uppercase block">Doppler Radars (DWR)</span>
              <span className="text-base font-bold font-mono text-white">39 S/X-Band</span>
              <span className="text-[10px] text-[#2ECC71] block">100% Operational</span>
            </div>
            <div className="bg-[#0F141A] p-2.5 rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] uppercase block">Agromet Field Units</span>
              <span className="text-base font-bold font-mono text-white">130 DAMUs</span>
              <span className="text-[10px] text-[#4FA8E0] block">Gramin Krishi Sewa</span>
            </div>
            <div className="bg-[#0F141A] p-2.5 rounded border border-[#334155]">
              <span className="text-[10px] text-[#8A94A6] uppercase block">Earth Observation Sats</span>
              <span className="text-base font-bold font-mono text-white">INSAT-3D/3DR</span>
              <span className="text-[10px] text-[#4FA8E0] block">ISRO MOSDAC 15m Loop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
