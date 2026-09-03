import React, { useState, useMemo, useEffect } from 'react';
import {
  INDIAN_STATES_AND_DISTRICTS,
  getExtendedAgrometBulletin,
  ExtendedAgrometBulletin,
} from '../services/agrometService';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { LocatingPhase } from '../services/geolocationService';
import { CropType, PhenologicalStage } from '../services/agronomicEngine';
import { CurrentLocationBanner } from '../components/location/CurrentLocationBanner';

// Import the 14 Command Center components
import { AgrometCommandHeader } from '../components/agromet/AgrometCommandHeader';
import { FarmStatusOverview } from '../components/agromet/FarmStatusOverview';
import { TodaysFarmActionCenter } from '../components/agromet/TodaysFarmActionCenter';
import { WeatherCropResponse7Day } from '../components/agromet/WeatherCropResponse7Day';
import { CropIntelligenceCard } from '../components/agromet/CropIntelligenceCard';
import { CropStageTimeline } from '../components/agromet/CropStageTimeline';
import { WeatherCropRiskRadar } from '../components/agromet/WeatherCropRiskRadar';
import { AgriculturalTimeline72h } from '../components/agromet/AgriculturalTimeline72h';
import { IrrigationIntelligenceCommand } from '../components/agromet/IrrigationIntelligenceCommand';
import { SprayingWindowAnalyzer } from '../components/agromet/SprayingWindowAnalyzer';
import { BioticRiskMonitor } from '../components/agromet/BioticRiskMonitor';
import { OfficialAgrometAdvisories } from '../components/agromet/OfficialAgrometAdvisories';
import { FieldOperationsCalendarGrid } from '../components/agromet/FieldOperationsCalendarGrid';
import { NearestObservationNetwork } from '../components/agromet/NearestObservationNetwork';
import { AgrometDataProvenanceFooter } from '../components/agromet/AgrometDataProvenanceFooter';

interface AgrometPageProps {
  weatherBundle?: WeatherDataBundle;
  selectedLocation?: LocationRecord;
  onNavigateToTab?: (tab: string) => void;
  onDetectLocation?: (forceRefresh?: boolean) => Promise<any>;
  isLocating?: boolean;
  locatePhase?: LocatingPhase;
  locationSource?: 'DEVICE_GPS' | 'MANUAL_SEARCH';
  onOpenLocationCenter?: () => void;
}

export const AgrometPage: React.FC<AgrometPageProps> = ({
  weatherBundle,
  selectedLocation,
  onNavigateToTab,
  onDetectLocation,
  isLocating = false,
  locatePhase = 'idle',
  locationSource = 'MANUAL_SEARCH',
  onOpenLocationCenter,
}) => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);

  // Initialize with selectedLocation state/district if available
  const [selectedState, setSelectedState] = useState<string>(() => {
    if (selectedLocation?.state && INDIAN_STATES_AND_DISTRICTS[selectedLocation.state]) {
      return selectedLocation.state;
    }
    return 'Odisha';
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    const defaultDistricts = INDIAN_STATES_AND_DISTRICTS[selectedState] || [];
    if (selectedLocation?.district && defaultDistricts.includes(selectedLocation.district)) {
      return selectedLocation.district;
    }
    if (selectedLocation?.city && defaultDistricts.includes(selectedLocation.city)) {
      return selectedLocation.city;
    }
    return defaultDistricts[0] || 'Bhubaneswar';
  });

  // Sync state and district when selectedLocation updates (e.g. GPS detected or location changed)
  useEffect(() => {
    if (selectedLocation?.state && INDIAN_STATES_AND_DISTRICTS[selectedLocation.state]) {
      setSelectedState(selectedLocation.state);
      const districts = INDIAN_STATES_AND_DISTRICTS[selectedLocation.state] || [];
      if (selectedLocation.district && districts.includes(selectedLocation.district)) {
        setSelectedDistrict(selectedLocation.district);
      } else if (selectedLocation.city && districts.includes(selectedLocation.city)) {
        setSelectedDistrict(selectedLocation.city);
      } else if (districts[0]) {
        setSelectedDistrict(districts[0]);
      }
    }
  }, [selectedLocation]);

  const [selectedCrop, setSelectedCrop] = useState<CropType>('Rice (Paddy)');
  const [selectedStage, setSelectedStage] = useState<PhenologicalStage>('Tillering');
  const [sowingDate, setSowingDate] = useState<Date>(() => new Date(Date.now() - 42 * 24 * 60 * 60 * 1000));

  // Fetch / synthesize extended bulletin based on state & district
  const bulletin: ExtendedAgrometBulletin = useMemo(() => {
    return getExtendedAgrometBulletin(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const districts = INDIAN_STATES_AND_DISTRICTS[state] || [];
    const firstDistrict = districts[0] || '';
    setSelectedDistrict(firstDistrict);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

  // Timestamp string for live provenance
  const now = new Date();
  const lastUpdatedStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const stationName = `AMFU ${selectedDistrict} • IMD Agro-Met Network`;
  const isLive = Boolean(weatherBundle?.current?.temp);

  return (
    <div
      id="agromet-command-center-page"
      className="space-y-6 pb-20 max-w-7xl mx-auto px-2 sm:px-4"
    >
      {/* Real Geolocation & Active Station Banner */}
      {selectedLocation && (
        <CurrentLocationBanner
          location={selectedLocation}
          source={locationSource}
          isLocating={isLocating}
          onDetectLocation={onDetectLocation ? () => onDetectLocation(true) : undefined}
          onChangeLocationClick={onOpenLocationCenter}
        />
      )}

      {/* SECTION 1: AGROMET COMMAND HEADER & SELECTORS */}
      <AgrometCommandHeader
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onStateChange={handleStateChange}
        onDistrictChange={handleDistrictChange}
        selectedCrop={selectedCrop}
        onCropChange={setSelectedCrop}
        selectedStage={selectedStage}
        onStageChange={setSelectedStage}
        lastUpdatedStr={lastUpdatedStr}
        stationName={stationName}
        isLive={isLive}
        sowingDate={sowingDate}
        onSowingDateChange={setSowingDate}
      />

      {/* SECTION 2: FARM STATUS OVERVIEW (6 High-Impact Telemetry Cards) */}
      <FarmStatusOverview
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        lastUpdatedStr={lastUpdatedStr}
        stationName={stationName}
      />

      {/* SECTION 3: TODAY'S FARM ACTION CENTER (The Visual Centerpiece) */}
      <TodaysFarmActionCenter
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 4: 7-DAY WEATHER & CROP RESPONSE OUTLOOK */}
      <WeatherCropResponse7Day
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 5: CROP INTELLIGENCE CARD */}
      <CropIntelligenceCard
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 6: CROP PHENOLOGICAL LIFECYCLE TIMELINE (Interactive Stepper) */}
      <CropStageTimeline
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        onStageSelect={setSelectedStage}
        sowingDate={sowingDate}
      />

      {/* SECTION 7: WEATHER-CROP RISK RADAR (7-Factor Diagnostic) */}
      <WeatherCropRiskRadar
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 8: 72-HOUR AGRICULTURAL OPERATION TIMELINE */}
      <AgriculturalTimeline72h
        weather={weatherBundle}
        district={selectedDistrict}
      />

      {/* SECTION 9: PRECISION IRRIGATION & SOIL HYDROLOGY COMMAND */}
      <IrrigationIntelligenceCommand
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 10: SPRAYING WINDOW & DRIFT HAZARD ANALYZER */}
      <SprayingWindowAnalyzer
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 11: PEST & DISEASE INCUBATION RADAR (BIOTIC RISK) */}
      <BioticRiskMonitor
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 12: OFFICIAL GKMS / AMFU BULLETINS */}
      <OfficialAgrometAdvisories
        bulletin={bulletin}
      />

      {/* SECTION 13: 7-DAY FARM OPERATIONS CALENDAR MATRIX */}
      <FieldOperationsCalendarGrid
        weather={weatherBundle}
        selectedCrop={selectedCrop}
        selectedStage={selectedStage}
        district={selectedDistrict}
      />

      {/* SECTION 14: NEAREST METEOROLOGICAL OBSERVATION NETWORK */}
      <NearestObservationNetwork
        weather={weatherBundle}
        stateName={selectedState}
        districtName={selectedDistrict}
        lastUpdatedStr={lastUpdatedStr}
      />

      {/* SECTION 15: AGROMET DATA PROVENANCE & METHODOLOGY */}
      <AgrometDataProvenanceFooter
        lastUpdatedStr={lastUpdatedStr}
        stationName={stationName}
      />
    </div>
  );
};
