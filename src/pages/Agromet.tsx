import React, { useState, useMemo, useEffect } from 'react';
import {
  INDIAN_STATES_AND_DISTRICTS,
  getExtendedAgrometBulletin,
  ExtendedAgrometBulletin,
} from '../services/agrometService';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { AgrometHero } from '../components/agromet/AgrometHero';
import { FieldLocationSelector } from '../components/agromet/FieldLocationSelector';
import { FieldConditionsCommandCenter } from '../components/agromet/FieldConditionsCommandCenter';
import { TodaysFarmActions } from '../components/agromet/TodaysFarmActions';
import { CropHealthOverview } from '../components/agromet/CropHealthOverview';
import { WeatherCropResponse } from '../components/agromet/WeatherCropResponse';
import { FarmActionTimeline } from '../components/agromet/FarmActionTimeline';
import { IrrigationIntelligence } from '../components/agromet/IrrigationIntelligence';
import { CropRiskRadar } from '../components/agromet/CropRiskRadar';
import { BestFieldWindows } from '../components/agromet/BestFieldWindows';
import { DetailedCropAdvisory } from '../components/agromet/DetailedCropAdvisory';
import { AgrometSources } from '../components/agromet/AgrometSources';

interface AgrometPageProps {
  weatherBundle?: WeatherDataBundle;
  selectedLocation?: LocationRecord;
  onNavigateToTab?: (tab: string) => void;
}

export const AgrometPage: React.FC<AgrometPageProps> = ({
  weatherBundle,
  selectedLocation,
  onNavigateToTab,
}) => {
  const states = Object.keys(INDIAN_STATES_AND_DISTRICTS);

  // Initialize with selectedLocation state/district if available, else Punjab/Ludhiana default
  const [selectedState, setSelectedState] = useState<string>(() => {
    if (selectedLocation?.state && INDIAN_STATES_AND_DISTRICTS[selectedLocation.state]) {
      return selectedLocation.state;
    }
    return states[0] || 'Punjab';
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    const defaultDistricts = INDIAN_STATES_AND_DISTRICTS[selectedState] || [];
    if (
      selectedLocation?.district &&
      defaultDistricts.includes(selectedLocation.district)
    ) {
      return selectedLocation.district;
    }
    if (
      selectedLocation?.city &&
      defaultDistricts.includes(selectedLocation.city)
    ) {
      return selectedLocation.city;
    }
    return defaultDistricts[0] || 'Ludhiana';
  });

  // Fetch / synthesize extended bulletin based on state & district
  const bulletin: ExtendedAgrometBulletin = useMemo(() => {
    return getExtendedAgrometBulletin(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  // Extract available crops
  const availableCrops = useMemo(() => {
    return bulletin.crops.map((c) => c.cropName);
  }, [bulletin]);

  // Active selected crop
  const [selectedCrop, setSelectedCrop] = useState<string>(() => {
    return availableCrops[0] || 'Rice (Paddy)';
  });

  // Sync crop if bulletin changes and selected crop is not in the list
  useEffect(() => {
    if (availableCrops.length > 0 && !availableCrops.includes(selectedCrop)) {
      setSelectedCrop(availableCrops[0]);
    }
  }, [availableCrops, selectedCrop]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const districts = INDIAN_STATES_AND_DISTRICTS[state] || [];
    const firstDistrict = districts[0] || '';
    setSelectedDistrict(firstDistrict);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

  const handleViewDetailedAdvisory = (crop: string) => {
    setSelectedCrop(crop);
    const el = document.getElementById('detailed-crop-advisory-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      id="mausam-agricultural-intelligence-page"
      className="space-y-8 pb-16"
    >
      {/* 1. AGROMET HERO */}
      <AgrometHero
        bulletin={bulletin}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        selectedCropName={selectedCrop}
        onSelectCrop={setSelectedCrop}
      />

      {/* 2. FIELD LOCATION & CROP QUICK SELECTOR */}
      <FieldLocationSelector
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onStateChange={handleStateChange}
        onDistrictChange={handleDistrictChange}
        availableCrops={availableCrops}
        selectedCrop={selectedCrop}
        onSelectCrop={setSelectedCrop}
      />

      {/* 3. CURRENT FIELD CONDITIONS COMMAND CENTER */}
      <FieldConditionsCommandCenter
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 4. WHAT SHOULD I DO TODAY? (ACTION HUB & TRANSLATOR) */}
      <TodaysFarmActions
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 5. CROP HEALTH OVERVIEW */}
      <CropHealthOverview
        bulletin={bulletin}
        selectedCrop={selectedCrop}
        onSelectCrop={setSelectedCrop}
        onViewDetailedAdvisory={handleViewDetailedAdvisory}
      />

      {/* 6. HOW WEATHER AFFECTS YOUR CROP & 7-DAY WEATHER X CROP RESPONSE */}
      <WeatherCropResponse
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 7. 5-DAY FIELD OUTLOOK */}
      <FarmActionTimeline
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 8. IRRIGATION INTELLIGENCE WINDOW & SOIL HYDROLOGY */}
      <IrrigationIntelligence
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 9. PEST & DISEASE RISK RADAR */}
      <CropRiskRadar
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 10. BEST FIELD-WORK WINDOWS */}
      <BestFieldWindows
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 11. DETAILED CROP ADVISORY & 72-HOUR TIMELINE */}
      <DetailedCropAdvisory
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 12. AUTHORITATIVE AGROMET SOURCES & PROVENANCE */}
      <AgrometSources bulletin={bulletin} />
    </div>
  );
};
