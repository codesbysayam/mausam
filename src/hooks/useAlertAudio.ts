// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// useAlertAudio Hook - Severe Weather Notification Audio
// Seamless React binding for AlertAudioService with real warning checks
// ====================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  alertAudioService,
  AlertAudioState,
  AlertSeverityThreshold,
} from '../services/alertAudioService';

interface UseAlertAudioOptions {
  // Optional list of live warnings to monitor for new incoming alerts
  warnings?: Array<{
    id?: string;
    bulletinNo?: string;
    title?: string;
    state?: string;
    stateCode?: string;
    hazardCategory?: string;
    hazardLabel?: string;
    severity?: string;
    issuedAt?: string;
    source?: string;
  }>;
  onNewAlertTriggered?: (warning: any) => void;
}

export function useAlertAudio(options?: UseAlertAudioOptions) {
  const [audioState, setAudioState] = useState<AlertAudioState>(() =>
    alertAudioService.getStatus()
  );

  // Sync state with global alertAudioService subscription
  useEffect(() => {
    const unsubscribe = alertAudioService.subscribe((newState) => {
      setAudioState(newState);
    });
    return unsubscribe;
  }, []);

  // Monitor incoming warnings and trigger alert for genuinely new active warnings
  const prevWarningsCountRef = useRef<number>(options?.warnings?.length || 0);

  useEffect(() => {
    if (!options?.warnings || options.warnings.length === 0) return;

    // Check each warning against alertAudioService
    for (const w of options.warnings) {
      const triggered = alertAudioService.triggerOfficialWarning(w);
      if (triggered && options.onNewAlertTriggered) {
        options.onNewAlertTriggered(w);
      }
    }

    prevWarningsCountRef.current = options.warnings.length;
  }, [options?.warnings, options?.onNewAlertTriggered]);

  const toggleAudioAlert = useCallback(async () => {
    return await alertAudioService.toggle();
  }, []);

  const enableAudioAlert = useCallback(async () => {
    return await alertAudioService.enable();
  }, []);

  const disableAudioAlert = useCallback(() => {
    alertAudioService.disable();
  }, []);

  const setVolume = useCallback((vol: number) => {
    alertAudioService.setVolume(vol);
  }, []);

  const setMinSeverity = useCallback((threshold: AlertSeverityThreshold) => {
    alertAudioService.setMinSeverity(threshold);
  }, []);

  const playTestSound = useCallback(async () => {
    return await alertAudioService.play('user_manual_test');
  }, []);

  const stopSound = useCallback(() => {
    alertAudioService.stop();
  }, []);

  const clearActiveBanner = useCallback(() => {
    alertAudioService.clearActiveBanner();
  }, []);

  return {
    isAudioAlertEnabled: audioState.isEnabled,
    isPlaying: audioState.isPlaying,
    status: audioState.status,
    volume: audioState.volume,
    minSeverity: audioState.minSeverity,
    activeWarningBanner: audioState.activeWarningBanner,
    toggleAudioAlert,
    enableAudioAlert,
    disableAudioAlert,
    setVolume,
    setMinSeverity,
    playTestSound,
    stopSound,
    clearActiveBanner,
  };
}
