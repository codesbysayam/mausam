// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// useAlertAudio Hook - Severe Weather Notification Audio
// Monitors alert count increases and triggers distinct emergency audio
// ====================================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  alertAudioService,
  AlertSoundType,
  ALERT_SOUND_PROFILES,
  AlertSoundProfile,
} from '../services/alertAudioService';

interface UseAlertAudioOptions {
  alertCount?: number;
  onAlertIncrease?: (newCount: number, oldCount: number) => void;
}

export function useAlertAudio(options?: UseAlertAudioOptions) {
  const [isAudioAlertEnabled, setIsAudioAlertEnabled] = useState<boolean>(() =>
    alertAudioService.isAudioAlertEnabled()
  );
  const [soundType, setSoundTypeState] = useState<AlertSoundType>(() =>
    alertAudioService.getSoundType()
  );
  const [volume, setVolumeState] = useState<number>(() =>
    alertAudioService.getVolume()
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(() =>
    alertAudioService.getIsPlaying()
  );

  const prevCountRef = useRef<number | null>(null);

  // Sync state with global alertAudioService subscription
  useEffect(() => {
    const update = () => {
      setIsAudioAlertEnabled(alertAudioService.isAudioAlertEnabled());
      setSoundTypeState(alertAudioService.getSoundType());
      setVolumeState(alertAudioService.getVolume());
      setIsPlaying(alertAudioService.getIsPlaying());
    };
    const unsubscribe = alertAudioService.subscribe(update);
    return unsubscribe;
  }, []);

  const toggleAudioAlert = useCallback(() => {
    return alertAudioService.toggleAudioAlert();
  }, []);

  const setAudioAlertEnabled = useCallback((enabled: boolean) => {
    alertAudioService.setAudioAlertEnabled(enabled);
  }, []);

  const setSoundType = useCallback((type: AlertSoundType) => {
    alertAudioService.setSoundType(type);
  }, []);

  const setVolume = useCallback((vol: number) => {
    alertAudioService.setVolume(vol);
  }, []);

  const playTestSound = useCallback((overrideType?: AlertSoundType) => {
    alertAudioService.playTestSound(overrideType);
  }, []);

  const playSevereAlertSound = useCallback((overrideType?: AlertSoundType) => {
    alertAudioService.playSevereAlertSound(overrideType);
  }, []);

  const stopSound = useCallback(() => {
    alertAudioService.stopSound();
  }, []);

  // Monitor alert count changes
  useEffect(() => {
    if (options?.alertCount === undefined) return;

    const currentCount = options.alertCount;
    const prevCount = prevCountRef.current;

    // Only fire when alert count strictly increases from a previously recorded count
    if (prevCount !== null && currentCount > prevCount) {
      if (alertAudioService.isAudioAlertEnabled()) {
        alertAudioService.playSevereAlertSound();
      }
      if (options.onAlertIncrease) {
        options.onAlertIncrease(currentCount, prevCount);
      }
    }

    prevCountRef.current = currentCount;
  }, [options?.alertCount, options?.onAlertIncrease]);

  return {
    isAudioAlertEnabled,
    soundType,
    volume,
    isPlaying,
    soundProfiles: ALERT_SOUND_PROFILES,
    toggleAudioAlert,
    setAudioAlertEnabled,
    setSoundType,
    setVolume,
    playTestSound,
    playSevereAlertSound,
    stopSound,
  };
}
