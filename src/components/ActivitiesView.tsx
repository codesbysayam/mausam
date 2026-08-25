import React, { useState } from 'react';
import { FITNESS_PROFILES, HOURLY_FORECAST } from '../data/weatherData';
import { FitnessProfile } from '../types';

export const ActivitiesView: React.FC = () => {
  const [selectedSportKey, setSelectedSportKey] = useState<string>('running');
  const [userWeightKg, setUserWeightKg] = useState<number>(70);
  const [intensity, setIntensity] = useState<'moderate' | 'tempo' | 'threshold'>('threshold');

  const profile: FitnessProfile = FITNESS_PROFILES[selectedSportKey] || FITNESS_PROFILES.running;

  // Hydration adjusted by user weight and intensity
  const calculatedHydration = Math.round(
    profile.hydrationRateMlPerHour * (userWeightKg / 70) * (intensity === 'threshold' ? 1.2 : intensity === 'tempo' ? 1.0 : 0.85)
  );

  const sportsList = [
    { key: 'running', label: 'Running / Marathon', icon: 'directions_run' },
    { key: 'cycling', label: 'Road Cycling', icon: 'directions_bike' },
    { key: 'hiking', label: 'Trail & Ridge Hiking', icon: 'hiking' },
    { key: 'outdoor_workout', label: 'Park Calisthenics', icon: 'fitness_center' },
    { key: 'commute', label: 'Pedestrian Commute', icon: 'directions_walk' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* Sport Selection & Fitness Profile (Span 8) */}
      <section className="col-span-1 md:col-span-8 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-h3 text-base font-bold text-[#FFFFFF] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4FA8E0] text-[20px]">cardio_load</span>
              Fitness &amp; Outdoor Physiological Intelligence
            </h2>
            <p className="text-xs text-[#8A94A6] mt-0.5">
              Thermoregulation, bio-aerosol inhalation risk &amp; hydration models
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71] animate-pulse"></span>
            <span className="text-xs text-[#2ECC71] font-bold">
              Suitability: {profile.suitabilityScore}/100
            </span>
          </div>
        </div>

        {/* Sport Selector Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {sportsList.map((sport) => {
            const isSelected = selectedSportKey === sport.key;
            return (
              <button
                key={sport.key}
                onClick={() => setSelectedSportKey(sport.key)}
                className={`p-3 rounded-lg flex flex-col items-center gap-2 card-border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B72B9]/20 border-[#0B72B9] text-[#FFFFFF] shadow-md'
                    : 'bg-[#0F141A] text-[#8A94A6] hover:bg-[#242F3D]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ color: isSelected ? '#4FA8E0' : '#8A94A6' }}
                >
                  {sport.icon}
                </span>
                <span className="text-[10px] uppercase text-center font-bold tracking-tight">
                  {sport.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actionable Windows Banner */}
        <div className="bg-[#0F141A] card-border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase text-[#2ECC71] font-bold">
              Recommended Training Window
            </span>
            <h3 className="font-h3 text-2xl md:text-3xl font-bold text-[#FFFFFF] mt-1">
              {profile.optimalWindow}
            </h3>
            <p className="text-xs text-[#8A94A6] mt-1">
              {profile.recommendation}
            </p>
          </div>
          <div className="bg-[#1E2733] p-3 rounded-lg card-border text-right shrink-0">
            <span className="text-[10px] uppercase text-[#8A94A6]">
              Thermal Stress
            </span>
            <p className="text-lg text-[#2ECC71] font-bold">
              {profile.thermalStress}
            </p>
          </div>
        </div>

        {/* Hour-by-Hour Suitability Timeline */}
        <div>
          <h4 className="font-h4 text-xs uppercase text-[#8A94A6] tracking-wider font-bold mb-3">
            Hour-by-Hour Outdoor Training Score
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {HOURLY_FORECAST.slice(0, 8).map((h) => {
              const score = Math.max(
                30,
                Math.round(100 - (h.aqi - 50) * 0.4 - (h.temp > 25 ? (h.temp - 25) * 5 : 0) - (h.uv > 5 ? h.uv * 4 : 0))
              );
              const isGood = score >= 75;
              const isFair = score >= 55 && score < 75;

              return (
                <div
                  key={h.time}
                  className="bg-[#0F141A] card-border rounded-lg p-2.5 flex flex-col items-center text-center gap-1"
                >
                  <span className="text-[11px] text-[#8A94A6]">{h.time}</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: isGood ? '#2ECC71' : isFair ? '#FFB703' : '#E74C3C' }}
                  >
                    {score}
                  </span>
                  <span className="text-[10px] text-[#8A94A6]">
                    AQI {h.aqi}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Real-time Hydration & Physiological Calculator (Span 4) */}
      <section className="col-span-1 md:col-span-4 bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col justify-between gap-6">
        <div>
          <div className="p-4 card-header-divider bg-[#0F141A] rounded-t-xl -m-6 mb-6">
            <span className="text-xs uppercase text-[#4FA8E0] font-bold">
              Metabolic Hydration Planner
            </span>
            <h3 className="font-h3 text-base font-bold text-[#FFFFFF] mt-1">
              Physiological Fluid Replenishment
            </h3>
          </div>

          {/* User Parameters */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs text-[#8A94A6] mb-1">
                <span>Body Weight</span>
                <span className="font-bold text-[#4FA8E0]">{userWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="45"
                max="120"
                value={userWeightKg}
                onChange={(e) => setUserWeightKg(Number(e.target.value))}
                className="w-full accent-[#0B72B9] cursor-pointer"
              />
            </div>

            <div>
              <span className="text-xs uppercase text-[#8A94A6] font-bold block mb-1.5">
                Exertion Intensity
              </span>
              <div className="flex gap-1.5 p-1 bg-[#0F141A] rounded-lg card-border">
                {(['moderate', 'tempo', 'threshold'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setIntensity(lvl)}
                    className={`flex-1 py-1 text-xs uppercase font-semibold rounded-md transition-all cursor-pointer ${
                      intensity === lvl
                        ? 'bg-[#0B72B9] text-[#FFFFFF] shadow-sm'
                        : 'text-[#8A94A6] hover:text-[#FFFFFF]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-[#0F141A] p-4 rounded-xl card-border mt-2 flex flex-col items-center text-center">
              <span className="text-xs uppercase text-[#4FA8E0] font-bold">
                Target Hourly Intake
              </span>
              <span className="text-4xl font-bold text-[#FFFFFF] my-1">
                {calculatedHydration}
                <span className="text-xl font-normal text-[#4FA8E0] ml-1">mL/h</span>
              </span>
              <p className="text-xs text-[#8A94A6] mt-1 leading-relaxed">
                Includes electrolytes (450mg Sodium/L) to prevent hyponatremia at 24.8°C with 64% ambient RH.
              </p>
            </div>
          </div>
        </div>

        {/* Sunscreen & Protective Gear Recommendation */}
        <div className="bg-[#0F141A] card-border p-3.5 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-[#FFB703] text-[22px] shrink-0">
            wb_sunny
          </span>
          <div>
            <p className="text-xs uppercase text-[#FFB703] font-bold">
              Solar Protection Advisory
            </p>
            <p className="text-xs text-[#8A94A6] mt-0.5 leading-relaxed">
              Peak UV Index 8 expected midday. Reapply broad-spectrum SPF 50+ every 90 minutes during sweat exposure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
