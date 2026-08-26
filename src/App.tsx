import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationTab,
  WeatherStation,
  CurrentWeather,
  WeatherConditionType,
  WeatherAlert,
  TelemetryDetail,
  LocationRecord,
  HistoricalTrendPoint,
} from './types';
import { INITIAL_WEATHER, INITIAL_ALERTS } from './data/weatherData';
import { locationService } from './services/locationService';
import { weatherService } from './services/weatherService';
import { TopNavBar } from './components/TopNavBar';
import { OverviewView } from './components/OverviewView';
import { RadarMapView } from './components/RadarMapView';
import { CrowdsourceView } from './components/CrowdsourceView';
import { AgrometView } from './components/AgrometView';
import { ForecastingToolsView } from './components/ForecastingToolsView';
import { ForecastView } from './components/ForecastView';
import { HourlyView } from './components/HourlyView';
import { InsightsView } from './components/InsightsView';
import { ActivitiesView } from './components/ActivitiesView';
import { AlertsView } from './components/AlertsView';
import { AskMausamDrawer } from './components/AskMausamDrawer';
import { TelemetryDetailModal } from './components/TelemetryDetailModal';
import { AlertDetailModal } from './components/AlertDetailModal';
import { AtmosphericOverlay } from './components/AtmosphericOverlay';
import { SavedPlacesModal } from './components/SavedPlacesModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { NotificationCenter } from './components/NotificationCenter';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('today');
  const [selectedLocation, setSelectedLocation] = useState<LocationRecord>(
    () => locationService.getSelectedLocation()
  );
  const [currentStation, setCurrentStation] = useState<WeatherStation>({
    id: selectedLocation.id,
    name: selectedLocation.displayName,
    code: selectedLocation.imdStation || 'AWS-BBI',
    state: selectedLocation.state,
    district: selectedLocation.district,
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
    elevation: selectedLocation.elevation || '45m ASL',
    status: 'active',
    pm25: 42,
    temp: 31,
    condition: 'Clear Sky',
    weatherType: 'sunny',
    isCoastal: selectedLocation.coastalStatus === 'coastal',
  });

  const [weatherType, setWeatherType] = useState<WeatherConditionType>('sunny');
  const [weather, setWeather] = useState<CurrentWeather>(INITIAL_WEATHER);
  const [alerts, setAlerts] = useState<WeatherAlert[]>(INITIAL_ALERTS);
  const [trends, setTrends] = useState<HistoricalTrendPoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Drawers
  const [isAskMausamOpen, setIsAskMausamOpen] = useState<boolean>(false);
  const [isPlacesModalOpen, setIsPlacesModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [activeTelemetryDetail, setActiveTelemetryDetail] = useState<TelemetryDetail | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

  // Synchronize dynamic weather theme class on root body
  useEffect(() => {
    document.body.className = `theme-${weatherType}`;
  }, [weatherType]);

  // Load weather data for current location
  const loadWeatherData = useCallback(async (location: LocationRecord) => {
    setIsRefreshing(true);
    try {
      const data = await weatherService.getWeatherData(location);
      setWeather(data.current);
      setWeatherType(data.current.weatherType);
      setTrends(data.trends);
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.warn('Weather sync error, using fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Fetch on mount or when selected location changes
  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation, loadWeatherData]);

  // Handle location selection
  const handleSelectLocation = (loc: LocationRecord) => {
    locationService.setSelectedLocation(loc);
    setSelectedLocation(loc);
    setCurrentStation({
      id: loc.id,
      name: loc.displayName,
      code: loc.imdStation || `AWS-${loc.district.substring(0, 3).toUpperCase()}`,
      state: loc.state,
      district: loc.district,
      lat: loc.lat,
      lng: loc.lng,
      elevation: loc.elevation || '35m ASL',
      status: 'active',
      pm25: 45,
      temp: 31,
      condition: 'Clear Sky',
      weatherType: 'sunny',
      isCoastal: loc.coastalStatus === 'coastal',
      radarType: loc.radarCoverage,
    });
    loadWeatherData(loc);
  };

  // Handle manual theme/weather filter toggle
  const handleThemeChange = (newType: WeatherConditionType) => {
    setWeatherType(newType);
    setWeather((prev) => ({
      ...prev,
      weatherType: newType,
      condition:
        newType === 'rain'
          ? 'Active Rain Showers'
          : newType === 'thunderstorm'
          ? 'Thunderstorm & Lightning'
          : newType === 'fog'
          ? 'Dense Fog & Low Visibility'
          : newType === 'duststorm'
          ? 'Dust Storm & Squall'
          : 'Clear Sky',
      isRainingNow: newType === 'rain' || newType === 'thunderstorm',
    }));
  };

  // Handle station selection
  const handleSelectStation = (station: WeatherStation) => {
    setCurrentStation(station);
    const matchedLoc = locationService.getAllLocations().find((l) => l.id === station.id);
    if (matchedLoc) {
      setSelectedLocation(matchedLoc);
      loadWeatherData(matchedLoc);
    } else {
      setWeatherType(station.weatherType);
      setWeather((prev) => ({
        ...prev,
        stationName: station.name,
        stationCode: station.code,
        temp: station.temp,
        aqiPm25: station.pm25,
        condition: station.condition,
        weatherType: station.weatherType,
        isRainingNow: station.weatherType === 'rain' || station.weatherType === 'thunderstorm',
        lastUpdated: `IMD Live Telemetry • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`,
      }));
    }
  };

  const handleOpenTelemetry = (title: string, value: string | number, unit: string) => {
    let status = 'Nominal Operational';
    let statusColor = '#2ECC71';
    let description = `Live synoptic telemetry from ${selectedLocation.displayName} calibrated for IMD & CPCB surface observation models.`;
    let normRange = 'Standard Indian Subcontinental Climatology Range';
    let history = [20, 22, 24, 25, 24.5, 23.8, 24.0];

    if (title.includes('Air Quality') || title.includes('AQI')) {
      const aqiNum = typeof value === 'number' ? value : weather.aqiIndex ?? weather.aqiPm25;
      status = weather.aqiStatus;
      statusColor = aqiNum <= 50 ? '#2ECC71' : aqiNum <= 100 ? '#F1C40F' : aqiNum <= 200 ? '#FF8C42' : '#E74C3C';
      description = `Continuous ambient air telemetry: PM2.5: ${weather.aqiPm25} µg/m³ | PM10: ${weather.aqiPm10 ?? Math.round(weather.aqiPm25 * 1.6)} µg/m³ | NO₂: ${weather.no2 ?? 24} µg/m³ | SO₂: ${weather.so2 ?? 12} µg/m³ | CO: ${weather.co ?? 420} µg/m³ | O₃: ${weather.o3 ?? 28} µg/m³.`;
      normRange = 'CPCB National Ambient Air Quality Standard (NAAQS): PM2.5 ≤ 60 µg/m³ (24h), PM10 ≤ 100 µg/m³';
      history = [
        Math.max(10, Math.round(weather.aqiPm25 * 0.8)),
        Math.max(10, Math.round(weather.aqiPm25 * 0.9)),
        Math.max(10, Math.round(weather.aqiPm25 * 1.1)),
        Math.max(10, Math.round(weather.aqiPm25 * 1.05)),
        Math.max(10, Math.round(weather.aqiPm25 * 0.95)),
        Math.max(10, Math.round(weather.aqiPm25 * 1.0)),
      ];
    } else if (title.includes('Pollen')) {
      status = `${weather.pollen} Bio-Allergen Risk`;
      statusColor = weather.pollen === 'Low' ? '#2ECC71' : weather.pollen === 'Moderate' ? '#FFB703' : '#E74C3C';
      description = `Airborne allergen monitor: Grass pollen: ${weather.grassPollen ?? 2} grains/m³ | Tree pollen: ${weather.treePollen ?? 3} grains/m³ | Weed & Herb pollen: ${weather.weedPollen ?? 1} grains/m³. Total aggregate density: ${weather.pollenCount ?? 6} grains/m³.`;
      normRange = 'Allergy Standard: 0-10 grains/m³ (Low), 11-50 (Moderate), 50+ (High)';
      history = [
        Math.max(1, (weather.pollenCount ?? 6) - 3),
        Math.max(1, (weather.pollenCount ?? 6) - 1),
        Math.max(1, (weather.pollenCount ?? 6) + 2),
        Math.max(1, (weather.pollenCount ?? 6) + 1),
        Math.max(1, weather.pollenCount ?? 6),
      ];
    } else if (title.includes('Humidity')) {
      status = weather.humidity > 80 ? 'High Humidity' : weather.humidity < 30 ? 'Dry Atmosphere' : 'Comfortable Zone';
      statusColor = weather.humidity > 80 ? '#4FA8E0' : '#2ECC71';
      description = `Relative humidity: ${weather.humidity}% with calculated atmospheric dew point at ${weather.dewPoint}°C.`;
      normRange = 'Human Comfort Envelope: 40% - 65% RH';
      history = [weather.humidity - 8, weather.humidity - 4, weather.humidity + 3, weather.humidity - 2, weather.humidity];
    } else if (title.includes('Temperature')) {
      status = weather.temp > 38 ? 'Heatwave Advisory' : weather.temp < 10 ? 'Cold Wave' : 'Normal Range';
      statusColor = weather.temp > 35 ? '#FF8C42' : '#2ECC71';
      description = `Current ambient surface dry-bulb temperature: ${weather.temp}°C (Today's Peak: ${weather.high}°C, Minimum: ${weather.low}°C).`;
      normRange = 'Typical Regional Diurnal Band: 18°C – 38°C';
      history = [weather.low, weather.temp - 4, weather.temp - 1, weather.high, weather.temp];
    }

    setActiveTelemetryDetail({
      title,
      value,
      unit,
      status,
      statusColor,
      description,
      history,
      normRange,
    });
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F141A] via-[#1E2733] to-[#0F141A] text-[#F4F7FA] font-body-md antialiased flex flex-col select-none transition-colors duration-500 relative">
      {/* Live Atmospheric Visual Weather Engine (Strictly truthful particles with isRainingNow) */}
      <AtmosphericOverlay
        weatherType={weatherType}
        isRainingNow={weather.isRainingNow}
      />

      {/* Top Navigation Bar with Alert Ticker, Location Switcher, IST Clock */}
      <TopNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weatherType={weatherType}
        setWeatherType={handleThemeChange}
        selectedStation={currentStation}
        setSelectedStation={handleSelectStation}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
        alerts={alerts}
        onSelectAlert={(alert) => setSelectedAlert(alert)}
        onOpenAskDrawer={() => setIsAskMausamOpen(true)}
        onOpenPlacesModal={() => setIsPlacesModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        isLiveWeather={weather.isLive}
      />

      {/* Main Screen Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto relative z-20">
        {/* 1. Today Overview View */}
        {activeTab === 'today' && (
          <OverviewView
            weather={weather}
            alerts={alerts}
            trends={trends}
            onOpenTelemetry={handleOpenTelemetry}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectStation={handleSelectStation}
            onRefreshWeather={() => loadWeatherData(selectedLocation)}
            isRefreshing={isRefreshing}
          />
        )}

        {/* 2. 7-Day Forecast */}
        {activeTab === 'forecast' && <ForecastView />}

        {/* 3. 24-Hour Atmospheric Hourly Matrix */}
        {activeTab === 'hourly' && <HourlyView />}

        {/* 4. Atmospheric & Environmental Intelligence Diagnostics */}
        {activeTab === 'insights' && <InsightsView />}

        {/* 5. Fitness & Outdoor Physiological Activities */}
        {activeTab === 'activities' && <ActivitiesView />}

        {/* 6. Interactive India Weather & Synoptic Map View */}
        {activeTab === 'radar' && (
          <RadarMapView
            alerts={alerts}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onSelectStation={handleSelectStation}
            selectedStationId={selectedLocation.id}
          />
        )}

        {/* 7. Crowdsource Citizen Observation (Mausam IMD) */}
        {activeTab === 'crowdsource' && <CrowdsourceView />}

        {/* 8. Agromet Agricultural Advisories (Meghdoot) */}
        {activeTab === 'agromet' && <AgrometView />}

        {/* 9. Meteorological & Warning Bulletins */}
        {activeTab === 'alerts' && <AlertsView />}

        {/* 10. Key Forecasting Instruments */}
        {activeTab === 'tools' && <ForecastingToolsView />}
      </main>

      {/* AI Weather Consultation Drawer */}
      <AskMausamDrawer
        isOpen={isAskMausamOpen}
        onClose={() => setIsAskMausamOpen(false)}
        weather={weather}
        currentStation={currentStation}
      />

      {/* Sensor Telemetry Detail Modal */}
      <TelemetryDetailModal
        telemetry={activeTelemetryDetail}
        onClose={() => setActiveTelemetryDetail(null)}
      />

      {/* Dynamic Severe Weather Warning & Bulletin Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSelectedAlert(null);
        }}
        onDismissAlert={handleDismissAlert}
      />

      {/* Saved Places / Odisha 30 Districts Modal */}
      <SavedPlacesModal
        isOpen={isPlacesModalOpen}
        onClose={() => setIsPlacesModalOpen(false)}
        currentStation={currentStation}
        onSelectStation={handleSelectStation}
        selectedLocation={selectedLocation}
        onSelectLocation={handleSelectLocation}
      />

      {/* Station Settings & Calibration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tempUnit={tempUnit}
        onToggleTempUnit={setTempUnit}
      />

      {/* Operational Help & Sensor Calibration Guide */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Atmospheric Alert Notification Center */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        alerts={alerts}
        onOpenAlertsView={() => {
          setIsNotificationsOpen(false);
          setActiveTab('alerts');
        }}
      />
    </div>
  );
}
