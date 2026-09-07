import React from 'react';
import { CentralWeatherCondition } from '../types';
import { WeatherEffects } from './weather/WeatherEffects';

interface AtmosphericOverlayProps {
  condition?: CentralWeatherCondition;
  isDay?: boolean;
  opacity?: number;
}

export const AtmosphericOverlay: React.FC<AtmosphericOverlayProps> = ({
  condition = 'UNKNOWN',
  isDay = true,
  opacity = 0.65,
}) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <WeatherEffects condition={condition} isDay={isDay} opacity={opacity} />
    </div>
  );
};
