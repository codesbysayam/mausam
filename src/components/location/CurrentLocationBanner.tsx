import React from 'react';
import { LocationStatusBar, LocationStatusBarProps } from './LocationStatusBar';

export interface CurrentLocationBannerProps extends LocationStatusBarProps {
  lastDetectedAt?: Date | null;
}

/**
 * CurrentLocationBanner is a wrapper around the unified LocationStatusBar
 * component to maintain backwards compatibility across legacy references.
 */
export const CurrentLocationBanner: React.FC<CurrentLocationBannerProps> = (props) => {
  return <LocationStatusBar {...props} />;
};

export default CurrentLocationBanner;
