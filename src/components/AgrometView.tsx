import React, { useState } from 'react';
import {
  getAgrometBulletin,
  ExtendedAgrometBulletin,
} from '../services/agrometService';
import { CropAdvisory } from '../types';

// Modular Agromet Component Imports
import { AgrometHero } from './agromet/AgrometHero';
import { TodaysFarmOutlook } from './agromet/TodaysFarmOutlook';
import { FarmActionPlan } from './agromet/FarmActionPlan';
import { WeatherFarmImpactFlow } from './agromet/WeatherFarmImpactFlow';
import { RainfallAndSoilSection } from './agromet/RainfallAndSoilSection';
import { CropSelectorAndHealth } from './agromet/CropSelectorAndHealth';
import { CropAdvisoryAccordion } from './agromet/CropAdvisoryAccordion';
import { PestDiseaseWatch } from './agromet/PestDiseaseWatch';
import { FieldOperationsAndFertilizer } from './agromet/FieldOperationsAndFertilizer';
import { FarmWeatherCalendar } from './agromet/FarmWeatherCalendar';
import { AgriculturalRiskScore } from './agromet/AgriculturalRiskScore';
import { DistrictAgrometBulletin } from './agromet/DistrictAgrometBulletin';
import { AgrometDataProvenance } from './agromet/AgrometDataProvenance';

export const AgrometView: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ludhiana');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice (Paddy)');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch or dynamically compute the extended bulletin for current state & district
  const [bulletin, setBulletin] = useState<ExtendedAgrometBulletin>(() =>
    getAgrometBulletin(selectedState, selectedDistrict)
  );

  // Update bulletin when state or district changes
  const handleStateChange = (newState: string) => {
    setIsLoading(true);
    setSelectedState(newState);
    // Fetch bulletin for newState and current/first district
    const newBulletin = getAgrometBulletin(newState, selectedDistrict);
    setBulletin(newBulletin);
    // Auto-update district if mismatched
    if (newBulletin.district !== selectedDistrict) {
      setSelectedDistrict(newBulletin.district);
    }
    // Auto-select crop from new bulletin if available
    if (newBulletin.crops.length > 0) {
      setSelectedCrop(newBulletin.crops[0].cropName);
    }
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setIsLoading(true);
    setSelectedDistrict(newDistrict);
    const newBulletin = getAgrometBulletin(selectedState, newDistrict);
    setBulletin(newBulletin);
    if (newBulletin.crops.length > 0) {
      const exists = newBulletin.crops.some(
        (c) => c.cropName.toLowerCase() === selectedCrop.toLowerCase()
      );
      if (!exists) {
        setSelectedCrop(newBulletin.crops[0].cropName);
      }
    }
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleCropSelect = (cropName: string) => {
    setSelectedCrop(cropName);
  };

  // Find or fallback crop advisory
  const activeCropAdvisory: CropAdvisory =
    bulletin.crops.find(
      (c) => c.cropName.toLowerCase() === selectedCrop.toLowerCase()
    ) ||
    bulletin.crops[0] || {
      cropName: selectedCrop,
      stage: 'Vegetative Growth',
      sowingAdvice: 'Ensure proper seed bed preparation with certified seed varieties.',
      irrigationAdvice: 'Irrigate according to moisture tension in root zone.',
      fertilizerAdvice: 'Apply recommended NPK split doses in morning hours.',
      pestDiseaseAdvice: 'Practice Integrated Pest Management (IPM) regularly.',
      harvestingAdvice: 'Ensure grain moisture below 14% prior to warehousing.',
      riskLevel: 'Moderate',
      riskAlert: 'Monitor local weather alerts before chemical spraying.',
    };

  return (
    <div className="flex flex-col gap-7 max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 py-4 select-none font-sans text-[#CBD5E1]">
      {/* 1. Agromet Hero Command Center */}
      <AgrometHero
        bulletin={bulletin}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onStateChange={handleStateChange}
        onDistrictChange={handleDistrictChange}
        isLoading={isLoading}
      />

      {/* 2. Today's Farm Outlook */}
      <TodaysFarmOutlook bulletin={bulletin} />

      {/* 3. Farm Action Plan (What Should I Do Today?) */}
      <FarmActionPlan
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 4. Weather -> Farm Impact Causal Flow */}
      <WeatherFarmImpactFlow bulletin={bulletin} />

      {/* 5. Rainfall & Soil Moisture Dual Panel */}
      <RainfallAndSoilSection bulletin={bulletin} />

      {/* 6. Hourly Field Work Suitability & Nutrient Window */}
      <FieldOperationsAndFertilizer
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 7. Crop Selection & Health Overview */}
      <CropSelectorAndHealth
        bulletin={bulletin}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCrop={selectedCrop}
        onSelectCrop={handleCropSelect}
        activeCropAdvisory={activeCropAdvisory}
      />

      {/* 8. Crop-Specific Stage-Wise Advisory Matrix (Expandable Accordion) */}
      <CropAdvisoryAccordion
        bulletin={bulletin}
        selectedCrop={selectedCrop}
        onSelectCrop={handleCropSelect}
      />

      {/* 9. Pest & Disease Surveillance Watch */}
      <PestDiseaseWatch
        bulletin={bulletin}
        selectedCrop={selectedCrop}
      />

      {/* 10. 7-Day Farm Weather Calendar */}
      <FarmWeatherCalendar bulletin={bulletin} />

      {/* 11. Deterministic Multi-Factor Agricultural Risk Score */}
      <AgriculturalRiskScore bulletin={bulletin} />

      {/* 12. Official GKMS District Agromet Bulletin */}
      <DistrictAgrometBulletin bulletin={bulletin} />

      {/* 13. Data Provenance, Verification Protocol & Terminology Glossary */}
      <AgrometDataProvenance bulletin={bulletin} />
    </div>
  );
};
