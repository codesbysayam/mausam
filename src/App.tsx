import React, { useState, useEffect, useCallback } from 'react';
import { LocationRecord, WeatherStation } from './types';
import { locationService } from './services/locationService';
import { weatherService, WeatherDataBundle } from './services/weatherService';
import { INITIAL_WEATHER, INITIAL_ALERTS, HOURLY_FORECAST, DAILY_FORECAST } from './data/weatherData';
import { GovernmentHeader } from './components/layout/GovernmentHeader';
import { MainNavigation, MainNavTab } from './components/layout/MainNavigation';
import { PageContainer } from './components/layout/PageContainer';
import { FooterNavigation, FooterView } from './components/layout/FooterNavigation';
import { StateWeatherData } from './components/map/IndiaWeatherMap';
import { HomePage } from './pages/Home';
import { WeatherPage } from './pages/Weather';
import { ForecastPage } from './pages/Forecast';
import { RadarPage } from './pages/Radar';
import { AirQualityPage } from './pages/AirQuality';
import { AlertsPage } from './pages/Alerts';
import { AgrometPage } from './pages/Agromet';
import { ReportsPage } from './pages/Reports';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { OpenDataApi } from './pages/OpenDataApi';
import { TermsOfObservation } from './pages/TermsOfObservation';
import { ApiDebugPage } from './pages/ApiDebug';
import { AskMausamDrawer } from './components/AskMausamDrawer';
import { ReportDetailModal } from './components/ReportDetailModal';
import { OFFICIAL_PUBLICATIONS, MeteorologicalPublication } from './data/reportsAndArticles';
import { useLanguage } from './i18n/LanguageContext';
import './styles/mausam.css';

export type AppView = MainNavTab | FooterView;

function getTabFromPathname(path: string): AppView {
  const cleanPath = path.toLowerCase().replace(/\/+$/, '');
  if (cleanPath === '/privacy' || cleanPath === '/privacy-policy') return 'privacy';
  if (cleanPath === '/api' || cleanPath === '/open-data-api') return 'api';
  if (cleanPath === '/terms' || cleanPath === '/terms-of-observation') return 'terms';
  if (cleanPath === '/debug' || cleanPath === '/api-debug') return 'debug';
  if (cleanPath === '/forecast') return 'forecast';
  if (cleanPath === '/warnings' || cleanPath === '/alerts') return 'warnings';
  if (cleanPath === '/radar' || cleanPath === '/maps') return 'radar';
  if (cleanPath === '/aqi' || cleanPath === '/air') return 'aqi';
  if (cleanPath === '/agromet') return 'agromet';
  if (cleanPath === '/reports') return 'reports';
  if (cleanPath === '/weather') return 'weather';
  return 'home';
}

function getPathForView(view: AppView): string {
  switch (view) {
    case 'privacy':
      return '/privacy';
    case 'api':
      return '/api';
    case 'terms':
      return '/terms';
    case 'debug':
      return '/api-debug';
    case 'forecast':
      return '/forecast';
    case 'warnings':
      return '/warnings';
    case 'radar':
      return '/radar';
    case 'aqi':
      return '/aqi';
    case 'agromet':
      return '/agromet';
    case 'reports':
      return '/reports';
    case 'weather':
      return '/weather';
    case 'home':
    default:
      return '/';
  }
}

export default function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<AppView>(() =>
    getTabFromPathname(window.location.pathname)
  );

  const [selectedLocation, setSelectedLocation] = useState<LocationRecord>(() =>
    locationService.getSelectedLocation()
  );

  const [weatherBundle, setWeatherBundle] = useState<WeatherDataBundle>({
    current: INITIAL_WEATHER,
    hourly: HOURLY_FORECAST,
    daily: DAILY_FORECAST,
    trends: [],
    alerts: INITIAL_ALERTS,
    lastFetchedAt: new Date(),
    isLive: true,
  });

  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isAskMausamOpen, setIsAskMausamOpen] = useState(false);
  const [selectedFooterPublication, setSelectedFooterPublication] = useState<MeteorologicalPublication | null>(null);

  const handleOpenFooterArticle = useCallback((pubId: string) => {
    const pub = OFFICIAL_PUBLICATIONS.find(p => p.id === pubId);
    if (pub) {
      setSelectedFooterPublication(pub);
    }
  }, []);

  // Sync state with browser popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPathname(window.location.pathname);
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = useCallback((tab: AppView, pushHistory = true) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pushHistory) {
      const targetPath = getPathForView(tab);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  }, []);

  // Load weather data for the active location
  const loadWeatherData = useCallback(async (location: LocationRecord, forceRefresh = false) => {
    setIsLoadingWeather(true);
    try {
      const bundle = await weatherService.getWeatherData(location, forceRefresh);
      setWeatherBundle(bundle);
    } catch (err) {
      console.warn('Weather sync error, using cached telemetry:', err);
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation, loadWeatherData]);

  // Handle location change via header or search
  const handleSelectLocation = (loc: LocationRecord) => {
    locationService.setSelectedLocation(loc);
    setSelectedLocation(loc);
  };

  // Handle state click from India Map or State Table
  const handleStateSelect = (state: StateWeatherData) => {
    const matched =
      locationService.findLocationByName(state.city || state.name) ||
      locationService.findLocationsByState(state.name)[0];

    if (matched) {
      handleSelectLocation(matched);
      navigateToTab('weather');
    }
  };

  const currentStationForAi: WeatherStation = {
    id: selectedLocation.id,
    name: selectedLocation.displayName,
    code: selectedLocation.imdStation || 'AWS-BBI',
    state: selectedLocation.state,
    district: selectedLocation.district,
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    elevation: selectedLocation.elevation || '45m ASL',
    status: 'active',
    pm25: weatherBundle.current.aqiPm25 || 42,
    temp: weatherBundle.current.temp,
    condition: weatherBundle.current.condition,
    weatherType: weatherBundle.current.weatherType,
    isCoastal: selectedLocation.coastalStatus === 'coastal',
  };

  return (
    <div className="mausam-app min-h-screen bg-[#0F141A] text-[#D7DEE8] flex flex-col font-sans w-full overflow-x-hidden">
      {/* 1. Official Government Header with Searchable Language Selector & Mobile Drawer */}
      <GovernmentHeader
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        onOpenAskMausam={() => setIsAskMausamOpen(true)}
        activeTab={activeTab}
        onNavigateTab={(tab) => navigateToTab(tab as AppView)}
        activeAlertCount={weatherBundle.alerts?.length || 0}
      />

      {/* 2. Primary Navigation Bar (Desktop/Tablet) */}
      <MainNavigation
        activeTab={activeTab}
        onTabChange={(tab) => navigateToTab(tab)}
        activeAlertCount={weatherBundle.alerts?.length || 0}
      />

      {/* 3. Main Body Content */}
      <main id="main-content" className="relative flex-1 w-full min-w-0">
        {/* Slim indeterminate progress bar while weather data is syncing */}
        {isLoadingWeather && (
          <div
            id="weather-sync-progress-bar"
            className="mausam-progress-indeterminate absolute top-0 left-0 right-0"
            role="progressbar"
            aria-label="Updating live meteorological telemetry"
            aria-busy="true"
          >
            <div className="mausam-progress-indeterminate-bar" />
          </div>
        )}

        <PageContainer id="mausam-main-page-container">
          {/* HOME: National Weather Overview */}
          {activeTab === 'home' && (
            <HomePage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
              onNavigateToTab={(tab) => navigateToTab(tab as AppView)}
              onSelectLocation={handleSelectLocation}
              onStateSelect={handleStateSelect}
            />
          )}

          {/* WEATHER: Detailed Location-Specific Weather */}
          {activeTab === 'weather' && (
            <WeatherPage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
              onRefresh={() => loadWeatherData(selectedLocation, true)}
              onSelectLocation={handleSelectLocation}
              onChangeLocationClick={() => {
                const desktopInput = document.getElementById('station-search-input-desktop');
                const mobileInput = document.getElementById('station-search-input-mobile');
                if (mobileInput && window.innerWidth < 768) {
                  mobileInput.focus();
                } else if (desktopInput) {
                  desktopInput.focus();
                }
              }}
              onNavigateToTab={(tab) => navigateToTab(tab as AppView)}
            />
          )}

          {/* FORECAST: Medium-Range Numerical Weather Forecast */}
          {activeTab === 'forecast' && (
            <ForecastPage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
              onRefresh={() => loadWeatherData(selectedLocation, true)}
              onSelectLocation={handleSelectLocation}
              onNavigateToTab={(tab) => navigateToTab(tab as AppView)}
              isLoadingWeather={isLoadingWeather}
            />
          )}

          {/* WARNINGS: Multi-Hazard Severe Weather Warnings & Matrix */}
          {activeTab === 'warnings' && (
            <AlertsPage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
            />
          )}

          {/* RADAR & MAPS: Doppler Weather Radar & Satellite Imagery */}
          {activeTab === 'radar' && <RadarPage />}

          {/* AQI & AIR: National Air Quality Index & Aero-Allergen Pollen */}
          {activeTab === 'aqi' && (
            <AirQualityPage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
            />
          )}

          {/* AGROMET: Gramin Krishi Mausam Sewa Agricultural Bulletins */}
          {activeTab === 'agromet' && (
            <AgrometPage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
              onNavigateToTab={(tab) => navigateToTab(tab as AppView)}
            />
          )}

          {/* REPORTS: Citizen Meteorological Reports & Observation Feeds */}
          {activeTab === 'reports' && (
            <ReportsPage
              weatherBundle={weatherBundle}
              selectedLocation={selectedLocation}
            />
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <PrivacyPolicy onNavigateHome={() => navigateToTab('home')} />
          )}

          {/* OPEN DATA API */}
          {activeTab === 'api' && (
            <OpenDataApi onNavigateHome={() => navigateToTab('home')} />
          )}

          {/* TERMS OF OBSERVATION */}
          {activeTab === 'terms' && (
            <TermsOfObservation onNavigateHome={() => navigateToTab('home')} />
          )}

          {/* IMD API INTEGRATION DIAGNOSTICS */}
          {activeTab === 'debug' && <ApiDebugPage />}
        </PageContainer>
      </main>

      {/* 4. Official Institutional Footer with unified FooterNavigation component */}
      <footer className="w-full bg-[#17212B] border-t border-[#334155] py-8 mt-12 text-xs text-[#8A94A6]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-[#334155]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white font-bold text-sm">
                  {t('mausamPortal', 'MAUSAM PORTAL')}
                </span>
                <span className="bg-[#0B72B9]/20 text-[#4FA8E0] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#0B72B9]/40">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {t('footerTagline', 'National Atmospheric Intelligence & Citizen Weather Platform. Calibrated with Doppler weather radars, Automatic Weather Stations (AWS), and satellite telemetry.')}
              </p>
            </div>

            <div>
              <span className="font-bold text-white uppercase text-[11px] block mb-2">
                {t('dataProvidersTitle', 'Data Providers & Networks')}
              </span>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('dwr-all-india-20260826')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read official All-India Weather Summary Report"
                  >
                    • {t('imdCredit', 'India Meteorological Department (IMD)')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('ncmrwf-unified-model-nwp')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read NCMRWF Unified Model NWP Monograph"
                  >
                    • {t('ncmrwfCredit', 'NCMRWF Global & Regional Models')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('cpcb-air-quality-annual-2026')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read CPCB / SAFAR National Ambient Air Quality Publication"
                  >
                    • {t('cpcbCredit', 'Central Pollution Control Board (CPCB)')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('isro-mosdac-satellite-meteorology')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read ISRO MOSDAC Satellite Radiometry & Telemetry Monograph"
                  >
                    • {t('isroCredit', 'ISRO MOSDAC Earth Observation')}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-white uppercase text-[11px] block mb-2">
                {t('citizenServicesTitle', 'Citizen Meteorological Services')}
              </span>
              <ul className="space-y-1 text-[11px]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('doppler-radar-nowcasting-techniques')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read Doppler Radar Nowcasting & Thunderstorm Warning Research"
                  >
                    • Nowcasting &amp; Thunderstorm Warnings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('agromet-advisory-gkms-odisha-india')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read Gramin Krishi Mausam Sewa (GKMS) Agromet Advisory Bulletin"
                  >
                    • Gramin Krishi Mausam Sewa (Agromet)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('cpcb-air-quality-annual-2026')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read National Air Quality Index (NAQI) & Urban Pollutant Analysis"
                  >
                    • National Air Quality Index (NAQI)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleOpenFooterArticle('aero-allergen-pollen-surveillance')}
                    className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block"
                    title="Read Aero-Allergen & Pollen Surveillance Research Monograph"
                  >
                    • Aero-Allergen Pollen Surveillance
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-white uppercase text-[11px] block mb-2">
                {t('standardProtocolsTitle', 'Standard Protocols')}
              </span>
              <p className="text-[11px] leading-relaxed">
                <button
                  type="button"
                  onClick={() => handleOpenFooterArticle('wmo-instrument-calibration-ndma-standards')}
                  className="text-left text-[#B2BDCD] hover:text-[#4FA8E0] hover:underline transition-colors cursor-pointer block leading-relaxed"
                  title="Read WMO-No. 8 Instrument Calibration & NDMA Standards Document"
                >
                  {t('footerStandardNotice', 'Adheres to World Meteorological Organization (WMO) standards for meteorological instrument calibration and NDMA hazard classification.')}
                </button>
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-center md:text-left">
            <div>
              {t('allRightsReserved', '© 2026 MAUSAM National Meteorological Platform • India Meteorological Department')}
            </div>
            
            {/* Unified FooterNavigation component */}
            <FooterNavigation
              activeTab={activeTab}
              onNavigate={(view) => navigateToTab(view)}
            />
          </div>
        </div>
      </footer>

      {/* Global Publication / Article Modal */}
      <ReportDetailModal
        publication={selectedFooterPublication}
        isOpen={Boolean(selectedFooterPublication)}
        onClose={() => setSelectedFooterPublication(null)}
      />

      {/* Floating Ask MAUSAM AI Quick Trigger */}
      <button
        id="floating-ask-mausam-btn"
        type="button"
        onClick={() => setIsAskMausamOpen(true)}
        className="ask-mausam-cursor fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-40 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#0B72B9] hover:bg-[#0A5A94] text-white text-xs font-bold shadow-xl border border-[#4FA8E0] transition-all hover:scale-105"
        title="Ask MAUSAM AI Weather & Advisory"
        aria-label="Open Ask MAUSAM AI Assistant"
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#4FA8E0] animate-spin-slow">
          auto_awesome
        </span>
        <span className="font-semibold tracking-wide text-[11px] sm:text-xs">Ask MAUSAM</span>
        <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
      </button>

      {/* AI Advisory Drawer */}
      <AskMausamDrawer
        isOpen={isAskMausamOpen}
        onClose={() => setIsAskMausamOpen(false)}
        weather={weatherBundle.current}
        currentStation={currentStationForAi}
      />
    </div>
  );
}
