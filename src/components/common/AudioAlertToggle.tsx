// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Audio Alert Toggle & Profile Selector Component
// Supports Authentic EAS Broadcast, NDMA Warning Siren & Broadcast Chime
// ====================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  BellRing,
  BellOff,
  Radio,
  SlidersHorizontal,
  Check,
  Play,
  Square,
} from 'lucide-react';
import { useAlertAudio } from '../../hooks/useAlertAudio';
import { AlertSoundType } from '../../services/alertAudioService';

interface AudioAlertToggleProps {
  variant?: 'compact' | 'pill' | 'header' | 'ticker';
  showLabel?: boolean;
  className?: string;
}

export const AudioAlertToggle: React.FC<AudioAlertToggleProps> = ({
  variant = 'compact',
  showLabel = true,
  className = '',
}) => {
  const {
    isAudioAlertEnabled,
    soundType,
    volume,
    isPlaying,
    soundProfiles,
    toggleAudioAlert,
    setAudioAlertEnabled,
    setSoundType,
    setVolume,
    playTestSound,
    stopSound,
  } = useAlertAudio();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [justToggled, setJustToggled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = toggleAudioAlert();
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 800);
  };

  const handleTestAudio = (e: React.MouseEvent, type?: AlertSoundType) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSound();
    } else {
      playTestSound(type || soundType);
    }
  };

  const activeProfile =
    soundProfiles.find((p) => p.id === soundType) || soundProfiles[0];

  // 1. Ticker Variant (Minimal for global top banner)
  if (variant === 'ticker') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          id="audio-alert-toggle-ticker"
          type="button"
          role="switch"
          aria-checked={isAudioAlertEnabled}
          onClick={handleToggle}
          title={
            isAudioAlertEnabled
              ? 'Severe Weather Audio Alert: Enabled (Click to disable)'
              : 'Severe Weather Audio Alert: Disabled (Click to enable emergency sound)'
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
            isAudioAlertEnabled
              ? 'bg-[#E74C3C]/20 border border-[#E74C3C]/60 text-[#FF8A80] hover:bg-[#E74C3C]/30'
              : 'bg-[#1E2733] border border-[#334155] text-[#8A94A6] hover:text-[#D7DEE8]'
          }`}
        >
          {isAudioAlertEnabled ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E74C3C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E74C3C]"></span>
              </span>
              <Volume2 className="w-3.5 h-3.5 text-[#FF8A80]" />
              <span className="text-[11px] font-mono tracking-tight hidden sm:inline">
                Audio: ON
              </span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#8A94A6]" />
              <span className="text-[11px] font-mono tracking-tight hidden sm:inline">
                Audio: OFF
              </span>
            </>
          )}
        </button>

        {isAudioAlertEnabled && (
          <button
            type="button"
            onClick={(e) => handleTestAudio(e)}
            title="Test current severe alert audio"
            className="px-1.5 py-0.5 rounded bg-[#101E2C] border border-[#1D5278] hover:bg-[#1A334D] text-[#38BDF8] text-[10px] font-mono cursor-pointer"
          >
            {isPlaying ? '■ Stop' : '▶ Test'}
          </button>
        )}
      </div>
    );
  }

  // 2. Header Variant (For Warning Bulletin Header with full profile & volume settings)
  if (variant === 'header') {
    return (
      <div className={`relative flex items-center gap-2 ${className}`} ref={menuRef}>
        {/* Main Audio Toggle Button */}
        <button
          id="audio-alert-toggle-header"
          type="button"
          role="switch"
          aria-checked={isAudioAlertEnabled}
          onClick={handleToggle}
          title={
            isAudioAlertEnabled
              ? 'Severe Weather Audio Alert: Active (Click to mute)'
              : 'Severe Weather Audio Alert: Muted (Click to enable emergency warning sound)'
          }
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
            isAudioAlertEnabled
              ? 'bg-[#180B0D] border-[#E74C3C] text-white shadow-sm ring-1 ring-[#E74C3C]/40 hover:bg-[#250F12]'
              : 'bg-[#101E2C] border-[#1D5278] text-[#8EA3B8] hover:text-white hover:border-[#38BDF8]'
          } ${justToggled ? 'scale-105 transition-transform' : ''}`}
        >
          <div className="flex items-center justify-center">
            {isAudioAlertEnabled ? (
              <BellRing className="w-4 h-4 text-[#FF6B6B] animate-pulse" />
            ) : (
              <BellOff className="w-4 h-4 text-[#8EA3B8]" />
            )}
          </div>

          <div className="flex flex-col items-start text-left leading-none">
            <span className="text-[11px] font-bold tracking-wide">
              {isAudioAlertEnabled ? 'Audio Alert: ON' : 'Audio Alert: OFF'}
            </span>
            <span className="text-[9px] font-mono text-[#8EA3B8] mt-0.5">
              {isAudioAlertEnabled ? activeProfile.label.split('(')[0].trim() : 'Silent mode'}
            </span>
          </div>
        </button>

        {/* Test Alert Sound Button (Always plays the authentic emergency broadcast sound) */}
        <button
          id="btn-test-alert-audio"
          type="button"
          onClick={(e) => handleTestAudio(e)}
          title="Test Severe Weather Emergency Alert Audio"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none ${
            isPlaying
              ? 'bg-[#E74C3C] border-[#FF8A80] text-white animate-pulse shadow-md'
              : 'bg-[#101E2C] border-[#1D5278] hover:bg-[#1A334D] hover:border-[#38BDF8] text-[#38BDF8] hover:text-[#7DD3FC]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span className="font-mono text-[11px]">Stop Alert</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="font-mono text-[11px]">Test Alert Audio</span>
            </>
          )}
        </button>

        {/* Sound Settings / Selector Trigger Button */}
        <button
          id="btn-audio-alert-settings"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          title="Configure Emergency Sound & Volume"
          aria-expanded={isMenuOpen}
          aria-label="Sound settings"
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
            isMenuOpen
              ? 'bg-[#1565C0] border-[#38BDF8] text-white'
              : 'bg-[#101E2C] border-[#1D5278] hover:bg-[#1A334D] text-[#8EA3B8] hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Dropdown Sound Profile & Volume Panel */}
        {isMenuOpen && (
          <div
            id="audio-alert-profile-dropdown"
            className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#0F1722] border border-[#2B4365] rounded-xl shadow-2xl p-3.5 z-50 flex flex-col gap-3 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#22334A]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2E8F0]">
                <Radio className="w-3.5 h-3.5 text-[#E74C3C]" />
                <span>Emergency Alert Sound</span>
              </div>
              <span className="text-[10px] font-mono text-[#8EA3B8] uppercase">
                Studio Audio
              </span>
            </div>

            {/* Sound Profile List */}
            <div className="flex flex-col gap-1.5">
              {soundProfiles.map((p) => {
                const isSelected = p.id === soundType;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSoundType(p.id);
                      if (!isAudioAlertEnabled) {
                        setAudioAlertEnabled(true);
                      }
                      playTestSound(p.id);
                    }}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#182333] border-[#38BDF8] shadow-sm'
                        : 'bg-[#121B27] border-[#1E2D40] hover:bg-[#1A2637] hover:border-[#2D4360]'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#F1F5F9]">
                          {p.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                        {p.description}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSoundType(p.id);
                        playTestSound(p.id);
                      }}
                      title={`Preview ${p.label}`}
                      className="p-1 rounded bg-[#0A121B] hover:bg-[#1E3A5F] text-[#38BDF8] shrink-0 mt-0.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#22334A]">
              <div className="flex items-center justify-between text-[11px] font-medium text-[#AFC4D8]">
                <span>Alert Volume:</span>
                <span className="font-mono text-white">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#E74C3C] cursor-pointer h-1.5 bg-[#1E2D40] rounded-lg"
              />
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-1 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  toggleAudioAlert();
                }}
                className="text-[#94A3B8] hover:text-white underline cursor-pointer"
              >
                {isAudioAlertEnabled ? 'Disable Audio' : 'Enable Audio'}
              </button>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="px-2.5 py-1 rounded bg-[#1A334D] hover:bg-[#204569] text-[#7DD3FC] font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Compact / Pill Variant
  return (
    <div className={`inline-flex items-center gap-1.5 shrink-0 ${className}`}>
      <button
        id="audio-alert-toggle-pill"
        type="button"
        role="switch"
        aria-checked={isAudioAlertEnabled}
        onClick={handleToggle}
        title={
          isAudioAlertEnabled
            ? `Severe Weather Audio Alert: ${activeProfile.label} (Click to mute)`
            : 'Severe Weather Audio Alert: Off (Click to activate emergency alert sound)'
        }
        className={`inline-flex items-center justify-center gap-1.5 h-10 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none shrink-0 ${
          isAudioAlertEnabled
            ? 'bg-[#E74C3C]/15 border-[#E74C3C]/60 text-[#FF8A80] hover:bg-[#E74C3C]/25'
            : 'bg-[#0B2239] border-[#1D4E73] hover:border-[#1565C0]/60 text-[#8EA3B8] hover:text-[#D7DEE8] hover:bg-[#102D47]'
        }`}
      >
        {isAudioAlertEnabled ? (
          <>
            <Volume2 className="w-4 h-4 text-[#FF6B6B]" />
            {showLabel && (
              <span className="text-[11px] font-mono">Audio Alert ON</span>
            )}
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-[#8EA3B8]" />
            {showLabel && (
              <span className="text-[11px] font-mono">Audio Alert OFF</span>
            )}
          </>
        )}
      </button>

      {isAudioAlertEnabled && showLabel && (
        <button
          type="button"
          onClick={(e) => handleTestAudio(e)}
          title="Test Alert Audio"
          className="h-10 px-2 rounded-xl border border-[#223246] bg-[#101824] hover:bg-[#182333] text-[#38BDF8] text-[10px] font-mono cursor-pointer"
        >
          {isPlaying ? '■' : '▶'}
        </button>
      )}
    </div>
  );
};
