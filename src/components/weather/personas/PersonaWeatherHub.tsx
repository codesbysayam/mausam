import React, { useState, useEffect, useCallback } from 'react';
import { LocationRecord } from '../../../types';
import { WeatherDataBundle } from '../../../services/weatherService';
import { authoritativeClient, PersonaDataBundle } from '../../../services/authoritativeService';
import { HealthCard } from './HealthCard';
import { FitnessCard } from './FitnessCard';
import { BeachSurferCard } from './BeachSurferCard';
import { TravelerCard } from './TravelerCard';
import { FamilyCommuteCard } from './FamilyCommuteCard';
import { AgriGardenCard } from './AgriGardenCard';
import { CommuterCard } from './CommuterCard';
import { EventPlannerCard } from './EventPlannerCard';

interface PersonaWeatherHubProps {
  selectedLocation: LocationRecord;
  weatherBundle: WeatherDataBundle;
}

type PersonaFilter =
  | 'all'
  | 'health'
  | 'fitness'
  | 'beach'
  | 'travel'
  | 'family'
  | 'agri'
  | 'commute'
  | 'events';

export const PersonaWeatherHub: React.FC<PersonaWeatherHubProps> = ({
  selectedLocation,
  weatherBundle,
}) => {
  const [activeFilter, setActiveFilter] = useState<PersonaFilter>('all');
  const [bundle, setBundle] = useState<PersonaDataBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const loadPersonaData = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const data = await authoritativeClient.getPersonaBundle(
          selectedLocation,
          {
            temp: weatherBundle.current.temp,
            humidity: weatherBundle.current.humidity,
            windSpeed: weatherBundle.current.windSpeed,
            windDir: weatherBundle.current.windDirection,
            uvIndex: weatherBundle.current.uvIndex,
            isRaining:
              weatherBundle.current.condition?.toLowerCase().includes('rain') ||
              weatherBundle.current.condition?.toLowerCase().includes('shower') ||
              weatherBundle.current.condition?.toLowerCase().includes('drizzle'),
            visibilityKm: weatherBundle.current.visibility,
            sunrise: weatherBundle.current.sunrise,
            sunset: weatherBundle.current.sunset,
          },
          forceRefresh
        );
        setBundle(data);
        setLastRefreshedAt(new Date());
      } catch (err) {
        console.error('Failed to load persona data bundle:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedLocation, weatherBundle]
  );

  // Automatically refresh when station changes or telemetry updates
  useEffect(() => {
    loadPersonaData();
  }, [loadPersonaData]);

  const filterTabs: Array<{ id: PersonaFilter; label: string; icon: string; count?: number }> = [
    { id: 'all', label: 'All Personas', icon: 'dashboard_customize' },
    { id: 'health', label: 'Health & Air', icon: 'health_and_safety' },
    { id: 'fitness', label: 'Outdoor Fitness', icon: 'directions_run' },
    { id: 'beach', label: 'Beach & Surf', icon: 'surfing' },
    { id: 'travel', label: 'Travelers', icon: 'luggage' },
    { id: 'family', label: 'Parents & Family', icon: 'family_restroom' },
    { id: 'agri', label: 'Agriculture', icon: 'agriculture' },
    { id: 'commute', label: 'Commuters', icon: 'directions_car' },
    { id: 'events', label: 'Event Planners', icon: 'event' },
  ];

  return (
    <section
      id="authoritative-persona-hub"
      className="w-full bg-[#131A22] rounded-xl border border-[#334155] p-4 sm:p-6 mb-8 shadow-lg"
      aria-label="Authoritative Multi-Persona Weather Intelligence Hub"
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#334155]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71] animate-ping" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4FA8E0] text-[22px]">
                verified_user
              </span>
              Authoritative Personalized Weather Intelligence
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6] mt-1">
            Official CPCB AQI, WorldTides, Azure Maps Severe Alerts, Open-Meteo Marine &amp; Agromet feeds for{' '}
            <strong className="text-white">{selectedLocation.displayName || selectedLocation.city}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#8A94A6] hidden sm:inline">
            Updated {lastRefreshedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            type="button"
            onClick={() => loadPersonaData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#17212B] hover:bg-[#1E2733] text-xs text-[#4FA8E0] border border-[#334155] transition-all font-semibold disabled:opacity-50"
            title="Refresh authoritative persona feeds"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              refresh
            </span>
            <span>{isRefreshing ? 'Syncing...' : 'Sync Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Persona Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar border-b border-[#334155]/60">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#0B72B9] text-white border-[#4FA8E0] shadow-md shadow-[#0B72B9]/20'
                  : 'bg-[#17212B] hover:bg-[#1E2733] text-[#8A94A6] hover:text-[#D7DEE8] border-[#334155]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && !bundle ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 border-2 border-[#0B72B9] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-[#8A94A6]">
            Connecting to CPCB, WorldTides, Marine &amp; Meteorological feeds for {selectedLocation.city}...
          </p>
        </div>
      ) : bundle ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-5">
          {/* 1. HEALTH-CONSCIOUS */}
          {(activeFilter === 'all' || activeFilter === 'health') && (
            <div className="h-full">
              <HealthCard
                aqi={bundle.health.aqi}
                pollen={bundle.health.pollen}
                uvIndex={bundle.health.uvIndex}
                uvRiskLabel={bundle.health.uvRiskLabel}
                uvAdvice={bundle.health.uvAdvice}
                humidity={bundle.health.humidity}
                city={selectedLocation.city}
              />
            </div>
          )}

          {/* 2. OUTDOOR FITNESS */}
          {(activeFilter === 'all' || activeFilter === 'fitness') && (
            <div className="h-full">
              <FitnessCard
                sunrise={bundle.fitness.sunrise}
                sunset={bundle.fitness.sunset}
                bestRunningHours={bundle.fitness.bestRunningHours}
                workoutSuitability={bundle.fitness.workoutSuitability}
                heatAlertActive={bundle.fitness.heatAlertActive}
                heatAlertMessage={bundle.fitness.heatAlertMessage}
                windSpeedKmh={bundle.fitness.windSpeedKmh}
                windDirection={bundle.fitness.windDirection}
                hydrationRateMlHour={bundle.fitness.hydrationRateMlHour}
                thermalStressLevel={bundle.fitness.thermalStressLevel}
                city={selectedLocation.city}
              />
            </div>
          )}

          {/* 3. BEACHGOERS & SURFERS */}
          {(activeFilter === 'all' || activeFilter === 'beach') && (
            <div className="h-full">
              <BeachSurferCard
                isCoastal={bundle.beachAndSurf.isCoastal}
                tides={bundle.beachAndSurf.tides}
                marine={bundle.beachAndSurf.marine}
                city={selectedLocation.city}
              />
            </div>
          )}

          {/* 4. TRAVELERS */}
          {(activeFilter === 'all' || activeFilter === 'travel') && (
            <div className="h-full">
              <TravelerCard
                activeAlerts={bundle.travel.activeAlerts}
                packingSuggestions={bundle.travel.packingSuggestions}
                travelSafetyRating={bundle.travel.travelSafetyRating}
                city={selectedLocation.city}
                state={selectedLocation.state}
                lat={selectedLocation.lat}
                lng={selectedLocation.lng}
              />
            </div>
          )}

          {/* 5. PARENTS & FAMILIES */}
          {(activeFilter === 'all' || activeFilter === 'family') && (
            <div className="h-full">
              <FamilyCommuteCard
                morningCommuteStatus={bundle.familyCommute.morningCommuteStatus}
                eveningCommuteStatus={bundle.familyCommute.eveningCommuteStatus}
                morningWindow={bundle.familyCommute.morningWindow}
                eveningWindow={bundle.familyCommute.eveningWindow}
                rainExpectedDuringCommute={bundle.familyCommute.rainExpectedDuringCommute}
                commuteRainSummary={bundle.familyCommute.commuteRainSummary}
                schoolBusSafetyNote={bundle.familyCommute.schoolBusSafetyNote}
                severeWarnings={bundle.familyCommute.severeWarnings}
                city={selectedLocation.city}
              />
            </div>
          )}

          {/* 6. AGRICULTURE & GARDENERS */}
          {(activeFilter === 'all' || activeFilter === 'agri') && (
            <div className="h-full">
              <AgriGardenCard
                soilMoisturePercent={bundle.agriculture.soilMoisturePercent}
                soilMoistureStatus={bundle.agriculture.soilMoistureStatus}
                threeDayRainfallTotalMm={bundle.agriculture.threeDayRainfallTotalMm}
                frostAlertActive={bundle.agriculture.frostAlertActive}
                frostAlertMessage={bundle.agriculture.frostAlertMessage}
                currentCropSeason={bundle.agriculture.currentCropSeason}
                seasonalPlantingTip={bundle.agriculture.seasonalPlantingTip}
                irrigationRecommendation={bundle.agriculture.irrigationRecommendation}
                city={selectedLocation.city}
                state={selectedLocation.state}
              />
            </div>
          )}

          {/* 7. COMMUTERS & DRIVERS */}
          {(activeFilter === 'all' || activeFilter === 'commute') && (
            <div className="h-full">
              <CommuterCard
                roadCondition={bundle.commuter.roadCondition}
                roadSafetyIndex={bundle.commuter.roadSafetyIndex}
                roadSafetyLabel={bundle.commuter.roadSafetyLabel}
                visibilityKm={bundle.commuter.visibilityKm}
                visibilityStatus={bundle.commuter.visibilityStatus}
                travelHazards={bundle.commuter.travelHazards}
                city={selectedLocation.city}
              />
            </div>
          )}

          {/* 8. EVENT PLANNERS */}
          {(activeFilter === 'all' || activeFilter === 'events') && (
            <div className="h-full lg:col-span-2">
              <EventPlannerCard
                extendedForecast={bundle.eventPlanner.extendedForecast}
                comfortIndexToday={bundle.eventPlanner.comfortIndexToday}
                comfortCategoryToday={bundle.eventPlanner.comfortCategoryToday}
                eventRecommendation={bundle.eventPlanner.eventRecommendation}
                city={selectedLocation.city}
              />
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
};
