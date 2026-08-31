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
    const newBulletin = getAgrometBulletin(newState, selectedDistrict);
    setBulletin(newBulletin);
    if (newBulletin.district !== selectedDistrict) {
      setSelectedDistrict(newBulletin.district);
    }
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

  // Find active crop advisory
  const activeCropAdvisory: CropAdvisory =
    bulletin.crops.find(
      (c) => c.cropName.toLowerCase() === selectedCrop.toLowerCase()
    ) ||
    bulletin.crops[0] || {
      cropName: selectedCrop,
      stage: 'Vegetative Tillering',
      sowingAdvice: 'Ensure proper seed bed preparation with certified seed varieties.',
      irrigationAdvice: 'Irrigate according to moisture tension in root zone. Hold if rain occurs.',
      fertilizerAdvice: 'Apply recommended NPK split doses in morning hours on dry leaves.',
      pestDiseaseAdvice: 'Inspect field corners for sheath blight and blast symptoms.',
      harvestingAdvice: 'Ensure grain moisture below 14% prior to warehousing.',
      riskLevel: 'Moderate',
      riskAlert: 'High humidity increases leaf wetness duration. Avoid night irrigation.',
    };

  return (
    <div className="flex flex-col gap-10 max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-8 py-5 select-none font-sans text-[#CBD5E1]">
      {/* 1. Agromet Command Center Header */}
      <AgrometHero
        bulletin={bulletin}
        selectedState={selectedState}
        selectedDistrict={selectedDistrict}
        onStateChange={handleStateChange}
        onDistrictChange={handleDistrictChange}
        isLoading={isLoading}
      />

      {/* Chapter 01: Farm Status Hero */}
      <section id="chapter-farm-status" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-widest px-1">
          <span>01</span>
          <span className="w-8 h-[1px] bg-[#38BDF8]/40" />
          <span>Today on the Farm</span>
        </div>
        <TodaysFarmOutlook bulletin={bulletin} />
      </section>

      {/* Chapter 02: Today's Farm Decisions */}
      <section id="chapter-farm-decisions" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#2ECC71] uppercase tracking-widest px-1">
          <span>02</span>
          <span className="w-8 h-[1px] bg-[#2ECC71]/40" />
          <span>Priority Action Plan</span>
        </div>
        <FarmActionPlan bulletin={bulletin} selectedCrop={selectedCrop} />
      </section>

      {/* Chapter 03: Weather -> Crop Impact Pipeline */}
      <section id="chapter-causal-impact" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-widest px-1">
          <span>03</span>
          <span className="w-8 h-[1px] bg-[#38BDF8]/40" />
          <span>Weather → Farm Impact Linkage</span>
        </div>
        <WeatherFarmImpactFlow bulletin={bulletin} />
      </section>

      {/* Chapter 04: Rain & Soil Intelligence */}
      <section id="chapter-rainfall-soil" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-widest px-1">
          <span>04</span>
          <span className="w-8 h-[1px] bg-[#38BDF8]/40" />
          <span>Rainfall &amp; Soil Intelligence</span>
        </div>
        <RainfallAndSoilSection bulletin={bulletin} />
      </section>

      {/* Chapter 05: Your Crop Intelligence (Single Deep Crop Profile) */}
      <section id="chapter-crop-intelligence" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#2ECC71] uppercase tracking-widest px-1">
          <span>05</span>
          <span className="w-8 h-[1px] bg-[#2ECC71]/40" />
          <span>Your Crop Intelligence &amp; Phenology</span>
        </div>
        <CropSelectorAndHealth
          bulletin={bulletin}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedCrop={selectedCrop}
          onSelectCrop={handleCropSelect}
          activeCropAdvisory={activeCropAdvisory}
        />
      </section>

      {/* Chapter 06: Pest & Disease Biosecurity Watch */}
      <section id="chapter-pest-watch" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#EF4444] uppercase tracking-widest px-1">
          <span>06</span>
          <span className="w-8 h-[1px] bg-[#EF4444]/40" />
          <span>Pest &amp; Disease Surveillance</span>
        </div>
        <PestDiseaseWatch bulletin={bulletin} selectedCrop={selectedCrop} />
      </section>

      {/* Chapter 07: Field Work Windows & Operations Timeline */}
      <section id="chapter-field-windows" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#A855F7] uppercase tracking-widest px-1">
          <span>07</span>
          <span className="w-8 h-[1px] bg-[#A855F7]/40" />
          <span>Best Field Work Windows</span>
        </div>
        <FieldOperationsAndFertilizer
          bulletin={bulletin}
          selectedCrop={selectedCrop}
        />
      </section>

      {/* Chapter 08: 5-Day Agricultural Horizon & Risk Radar */}
      <section id="chapter-outlook-radar" className="space-y-6">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#38BDF8] uppercase tracking-widest px-1">
          <span>08</span>
          <span className="w-8 h-[1px] bg-[#38BDF8]/40" />
          <span>5-Day Farm Horizon &amp; Risk Radar</span>
        </div>
        <FarmWeatherCalendar bulletin={bulletin} />
        <AgriculturalRiskScore bulletin={bulletin} />
      </section>

      {/* Chapter 09: Official Agromet Field Briefing */}
      <section id="chapter-official-bulletin" className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-mono font-bold text-[#2ECC71] uppercase tracking-widest px-1">
          <span>09</span>
          <span className="w-8 h-[1px] bg-[#2ECC71]/40" />
          <span>Official AAS Field Briefing</span>
        </div>
        <DistrictAgrometBulletin bulletin={bulletin} />
      </section>

      {/* Verification Protocol & Data Provenance */}
      <AgrometDataProvenance bulletin={bulletin} />
    </div>
  );
};
