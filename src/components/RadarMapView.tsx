import React, { useState } from 'react';
import { WeatherStation, WeatherAlert, LocationRecord } from '../types';
import { STATIONS } from '../data/weatherData';
import { locationService } from '../services/locationService';
import { IndiaWeatherMap, StateWeatherData } from './map/IndiaWeatherMap';
import { WeatherMapMetric } from './map/MapLayerControl';
import { INDIA_WEATHER_DATA } from '../data/indiaWeatherData';

interface RadarMapViewProps {
  alerts?: WeatherAlert[];
  selectedLocation?: LocationRecord;
  onSelectLocation?: (location: LocationRecord) => void;
  onSelectStation?: (station: WeatherStation) => void;
  selectedStationId?: string;
}

export const RadarMapView: React.FC<RadarMapViewProps> = ({
  selectedLocation,
  onSelectLocation,
  onSelectStation,
}) => {
  const [activeMetric, setActiveMetric] = useState<WeatherMapMetric>('temperature');

  const handleStateClick = (stateData: StateWeatherData) => {
    // Find matching LocationRecord in the national registry
    const allLocs = locationService.getAllLocations();
    const matched =
      allLocs.find(
        (l) =>
          l.state.toLowerCase() === stateData.name.toLowerCase() ||
          (stateData.city && l.city.toLowerCase() === stateData.city.toLowerCase()) ||
          l.id.toLowerCase() === stateData.id.toLowerCase()
      ) ||
      allLocs.find((l) => l.state.toLowerCase().includes(stateData.name.toLowerCase()));

    if (matched) {
      if (onSelectLocation) {
        onSelectLocation(matched);
      }
      if (onSelectStation) {
        const station = locationService.locationToWeatherStation(matched);
        onSelectStation(station);
      }
    }
  };

  const currentStateName = selectedLocation?.state || 'Odisha';

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto select-none font-sans">
      {/* Banner */}
      <div className="bg-[#1E2733] card-border rounded-xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#0B72B9]/20 border border-[#0B72B9]/40 flex items-center justify-center text-[#4FA8E0]">
            <span className="material-symbols-outlined text-[24px]">
              public
            </span>
          </div>
          <div>
            <h2 className="font-h3 text-base text-[#FFFFFF] font-bold">
              National Synoptic Environmental &amp; Weather Map
            </h2>
            <p className="font-body-md text-xs text-[#8A94A6]">
              All 28 States &amp; 8 Union Territories with real-time temperature, AQI, humidity, pollen risk, and 24h precipitation layers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#0F141A] px-3 py-1.5 rounded-lg card-border text-xs text-[#2ECC71] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse"></span>
            <span>36 States &amp; UTs Synced</span>
          </div>
          <a
            href="https://mausam.imd.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B72B9]/15 border border-[#0B72B9]/30 text-[#4FA8E0] text-xs font-semibold hover:bg-[#0B72B9] hover:text-[#FFFFFF] transition-colors"
          >
            <span>Official IMD Portal</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
      </div>

      {/* Main Interactive India Weather Map */}
      <IndiaWeatherMap
        data={INDIA_WEATHER_DATA}
        metric={activeMetric}
        onMetricChange={setActiveMetric}
        selectedState={currentStateName}
        onStateSelect={handleStateClick}
      />

      {/* Indian Doppler Radar Stations & Met Observatories Directory */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center pb-3 border-b border-[rgba(225,230,235,0.12)] mb-4">
          <div>
            <h3 className="font-h3 text-sm font-bold text-[#FFFFFF]">
              Key Doppler Weather Radar (DWR) &amp; Met Stations Network
            </h3>
            <p className="font-body-md text-xs text-[#8A94A6]">
              Dual-Polarization S-Band &amp; C-Band Radar Hubs for Cyclone, Nowcasting &amp; Cloud Tracking
            </p>
          </div>
          <span className="text-xs text-[#4FA8E0] hidden sm:inline font-medium">
            Source: India Meteorological Department (IMD)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STATIONS.map((station) => (
            <div
              key={station.id}
              onClick={() => onSelectStation && onSelectStation(station)}
              className="bg-[#0F141A] p-3.5 rounded-lg card-border hover:border-[#0B72B9] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] text-[#4FA8E0] font-bold">
                    {station.code}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] text-[10px] font-semibold">
                    {station.status.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-h4 text-sm font-bold text-[#FFFFFF]">
                  {station.name}
                </h4>
                <p className="text-[12px] text-[#8A94A6] mt-0.5">
                  {station.state} • Elev: {station.elevation}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-[rgba(225,230,235,0.12)] text-xs">
                <span className="text-[#FFFFFF] font-bold">{station.temp}°C</span>
                <span className="text-[#4FA8E0] font-semibold">{station.reflectivityDbz || 30} dBZ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
