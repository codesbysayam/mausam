// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Official Meteorological Warning Alert Audio Control
// Professional operational console with real AudioService bindings
// ====================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Volume1,
  BellRing,
  BellOff,
  AlertTriangle,
  Play,
  Square,
  Sliders,
  Settings,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { useAlertAudio } from '../../hooks/useAlertAudio';
import { AlertSeverityThreshold } from '../../services/alertAudioService';

interface AudioAlertToggleProps {
  variant?: 'header' | 'compact' | 'ticker' | 'pill';
  showLabel?: boolean;
  className?: string;
}

export const AudioAlertToggle: React.FC<AudioAlertToggleProps> = ({
  variant = 'header',
  showLabel = true,
  className = '',
}) => {
  const {
    isAudioAlertEnabled,
    isPlaying,
    status,
    volume,
    minSeverity,
    activeWarningBanner,
    toggleAudioAlert,
    setVolume,
    setMinSeverity,
    playTestSound,
    stopSound,
  } = useAlertAudio();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [testButtonState, setTestButtonState] = useState<'idle' | 'playing' | 'error'>('idle');
  const settingsRef = useRef<HTMLDivElement>(null);

  // Sync testButtonState with global isPlaying
  useEffect(() => {
    if (isPlaying) {
      setTestButtonState('playing');
    } else {
      setTestButtonState('idle');
    }
  }, [isPlaying]);

  // Close settings popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleAudioAlert();
  };

  const handleTestAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSound();
      setTestButtonState('idle');
    } else {
      setTestButtonState('playing');
      const success = await playTestSound();
      if (!success) {
        setTestButtonState('error');
        setTimeout(() => setTestButtonState('idle'), 2500);
      }
    }
  };

  const volumePercent = Math.round(volume * 100);

  // Status badge label and styling
  const statusLabel =
    status === 'unavailable'
      ? 'Unavailable'
      : status === 'playing'
      ? 'Playing'
      : isAudioAlertEnabled
      ? 'Ready'
      : 'Muted';

  // Ticker / Compact / Pill variants for navigational bars
  if (variant === 'ticker' || variant === 'compact' || variant === 'pill') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          role="switch"
          aria-checked={isAudioAlertEnabled}
          onClick={handleToggle}
          title={`Severe Audio Alert: ${isAudioAlertEnabled ? 'ON' : 'OFF'} (${statusLabel})`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full sm:rounded text-xs font-semibold transition-all cursor-pointer ${
            status === 'unavailable'
              ? 'bg-[#2A1810] border border-[#D97706] text-[#FBBF24]'
              : isAudioAlertEnabled
              ? 'bg-[#180B0D] border border-[#E74C3C] text-[#FF8A80]'
              : 'bg-[#081F33] border border-[#1D5278] text-[#8EA3B8]'
          }`}
        >
          {isAudioAlertEnabled ? (
            <BellRing className="w-3.5 h-3.5 text-[#FF6B6B]" />
          ) : (
            <BellOff className="w-3.5 h-3.5 text-[#8EA3B8]" />
          )}
          {showLabel && (
            <span className="font-mono text-[11px]">
              {status === 'unavailable'
                ? 'Audio: UNAVAILABLE'
                : isAudioAlertEnabled
                ? 'Audio: ON'
                : 'Audio: OFF'}
            </span>
          )}
        </button>

        {isAudioAlertEnabled && (
          <button
            type="button"
            onClick={handleTestAudio}
            className="px-2 py-1 rounded bg-[#102D47] hover:bg-[#1565C0] text-[#38BDF8] border border-[#1D5278] text-[10px] font-mono cursor-pointer"
          >
            {isPlaying ? '■ Stop' : '▶ Test'}
          </button>
        )}
      </div>
    );
  }

  // Header Variant: Full Operational Control as requested
  return (
    <div className={`relative flex flex-col gap-2 ${className}`} ref={settingsRef}>
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Primary Permission / Control Switch */}
        <button
          id="audio-alert-toggle-header"
          type="button"
          role="switch"
          aria-checked={isAudioAlertEnabled}
          onClick={handleToggle}
          title={
            status === 'unavailable'
              ? 'Audio alert unavailable in this browser environment'
              : isAudioAlertEnabled
              ? 'Audio Alert: ON (Click to mute)'
              : 'Audio Alert: OFF (Click to activate real emergency alert audio)'
          }
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
            status === 'unavailable'
              ? 'bg-[#2A1810] border-[#D97706] text-[#FBBF24]'
              : isAudioAlertEnabled
              ? 'bg-[#1A0B0E] border-[#E74C3C] text-white shadow-md ring-1 ring-[#E74C3C]/50 hover:bg-[#250F14]'
              : 'bg-[#081F33] border-[#1D5278] text-[#8EA3B8] hover:text-white hover:border-[#38BDF8]'
          }`}
        >
          <div className="flex items-center justify-center shrink-0">
            {status === 'unavailable' ? (
              <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
            ) : isAudioAlertEnabled ? (
              <BellRing className="w-4 h-4 text-[#FF6B6B] animate-pulse" />
            ) : (
              <BellOff className="w-4 h-4 text-[#8EA3B8]" />
            )}
          </div>

          <div className="flex flex-col items-start text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold tracking-wide uppercase">
                {status === 'unavailable'
                  ? 'Audio Alert: UNAVAILABLE'
                  : isAudioAlertEnabled
                  ? 'AUDIO ALERT: ON'
                  : 'AUDIO ALERT: OFF'}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                  status === 'playing'
                    ? 'bg-[#E74C3C] text-white animate-pulse'
                    : isAudioAlertEnabled
                    ? 'bg-[#00E676]/20 text-[#00E676]'
                    : 'bg-[#1D5278] text-[#8EA3B8]'
                }`}
              >
                {statusLabel}
              </span>
            </div>
            <span className="text-[10px] text-[#AFC4D8] mt-0.5">
              {status === 'unavailable'
                ? 'Device audio not initialized'
                : isAudioAlertEnabled
                ? 'High-Priority Meteorological Alert'
                : 'Muted • Click to enable warning audio'}
            </span>
          </div>
        </button>

        {/* 2. Test Alert Button (invokes exact production AlertAudioService.play) */}
        <button
          id="btn-test-alert-audio"
          type="button"
          onClick={handleTestAudio}
          disabled={status === 'unavailable'}
          title="Test Alert Audio (Invokes the real production alert audio pipeline)"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
            testButtonState === 'playing'
              ? 'bg-[#E74C3C] border-[#FF8A80] text-white shadow-md animate-pulse'
              : testButtonState === 'error'
              ? 'bg-[#B91C1C] border-[#F87171] text-white'
              : 'bg-[#081F33] border-[#1D5278] hover:bg-[#102D47] hover:border-[#38BDF8] text-[#38BDF8] hover:text-[#7DD3FC]'
          }`}
        >
          {testButtonState === 'playing' ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span className="font-mono text-[11px] font-bold">Stop Alert</span>
            </>
          ) : testButtonState === 'error' ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">Audio Blocked</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-mono text-[11px]">TEST ALERT</span>
              <span className="text-[#8EA3B8] font-mono text-[10px]">·</span>
              <span className="text-[#AFC4D8] font-mono text-[10px]">{volumePercent}%</span>
            </>
          )}
        </button>

        {/* 3. Settings / Volume Popover Trigger */}
        <button
          id="btn-audio-alert-settings"
          type="button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          title="Configure Alert Threshold and Volume"
          aria-expanded={isSettingsOpen}
          aria-label="Alert audio settings"
          className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
            isSettingsOpen
              ? 'bg-[#1565C0] border-[#38BDF8] text-white shadow'
              : 'bg-[#081F33] border-[#1D5278] hover:bg-[#102D47] text-[#8EA3B8] hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time High-Priority Alert Notice (Appears when real new active warning triggers) */}
      {activeWarningBanner && (
        <div
          id="official-live-audio-alert-toast"
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border shadow-xl animate-bounce text-xs font-semibold ${
            activeWarningBanner.severity === 'red'
              ? 'bg-[#3A0D12] border-[#E74C3C] text-white ring-1 ring-[#FF8A80]'
              : 'bg-[#351F04] border-[#D97706] text-[#FEF3C7]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E74C3C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E74C3C]"></span>
            </span>
            <div>
              <span className="font-bold text-[#FF8A80] uppercase tracking-wider block">
                🔴 NEW OFFICIAL WARNING
              </span>
              <span className="text-white font-medium">
                {activeWarningBanner.severity.toUpperCase()} ALERT — {activeWarningBanner.hazard}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded text-[#AFC4D8] border border-white/10 shrink-0">
            {isAudioAlertEnabled ? 'Audio alert played' : 'Muted'}
          </span>
        </div>
      )}

      {/* Settings Dropdown Popover */}
      {isSettingsOpen && (
        <div
          id="audio-alert-settings-popover"
          className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#0B263D] border border-[#1D5278] rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-3.5 text-white"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#1D5278]/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E3F2FD]">
              <ShieldAlert className="w-4 h-4 text-[#38BDF8]" />
              <span>Alert Audio Configuration</span>
            </div>
            <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded">
              Verified Pipeline
            </span>
          </div>

          {/* Volume Control */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AFC4D8] flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
                Alert Volume
              </span>
              <span className="font-mono font-bold text-white">{volumePercent}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.0"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Alert audio volume"
              className="w-full accent-[#38BDF8] bg-[#081F33] h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#AFC4D8] font-mono">
              <span>10% (Soft)</span>
              <span>70% (Standard)</span>
              <span>100% (Maximum)</span>
            </div>
          </div>

          {/* Minimum Severity Trigger Threshold */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-[#1D5278]/60">
            <span className="text-xs text-[#AFC4D8]">Audio Trigger Threshold</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['yellow', 'orange', 'red'] as AlertSeverityThreshold[]).map((level) => {
                const isSelected = minSeverity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setMinSeverity(level)}
                    className={`px-2 py-1.5 rounded text-[11px] font-bold uppercase transition-all cursor-pointer border ${
                      isSelected
                        ? level === 'red'
                          ? 'bg-[#E74C3C] text-white border-[#FF8A80]'
                          : level === 'orange'
                          ? 'bg-[#E67E22] text-white border-[#F39C12]'
                          : 'bg-[#F1C40F] text-[#071A2D] border-white'
                        : 'bg-[#081F33] text-[#AFC4D8] border-[#1D5278] hover:bg-[#102D47]'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#AFC4D8] mt-0.5 leading-normal">
              {minSeverity === 'red'
                ? 'Only urgent Red Alerts (Cyclone, Extreme Rain) will chime.'
                : minSeverity === 'orange'
                ? 'Orange and Red warnings trigger audible broadcast tone.'
                : 'All color-coded warnings (Yellow, Orange, Red) trigger audio.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#1D5278]/60 flex items-center justify-between text-[10px] text-[#AFC4D8] font-mono">
            <span>Sound: MAUSAM 853Hz+960Hz</span>
            <button
              type="button"
              onClick={handleTestAudio}
              className="text-[#38BDF8] hover:underline cursor-pointer"
            >
              Test tone ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
