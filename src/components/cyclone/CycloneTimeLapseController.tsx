import React, { useEffect, useCallback, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Compass,
  Wind,
  Gauge,
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';

export interface CycloneTimeLapseFrame {
  id: string;
  time: string;
  formattedTime: string;
  relativeTime: string;
  latitude: number;
  longitude: number;
  classification: string;
  windSpeed: string;
  centralPressure: string;
  locationName: string;
  isLive: boolean;
}

export interface CycloneTimeLapseControllerProps {
  frames: CycloneTimeLapseFrame[];
  activeFrameIndex: number;
  onChangeFrame: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  loop?: boolean;
  onToggleLoop?: () => void;
  className?: string;
  isCollapsible?: boolean;
  initialCollapsed?: boolean;
}

export const CycloneTimeLapseController: React.FC<CycloneTimeLapseControllerProps> = ({
  frames,
  activeFrameIndex,
  onChangeFrame,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  loop = true,
  onToggleLoop,
  className = '',
  isCollapsible = true,
  initialCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(initialCollapsed);

  const currentFrame = frames[activeFrameIndex] || frames[frames.length - 1];
  const isLatest = activeFrameIndex === frames.length - 1;
  const isEarliest = activeFrameIndex === 0;

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onChangeFrame(Math.max(0, activeFrameIndex - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onChangeFrame(Math.min(frames.length - 1, activeFrameIndex + 1));
      } else if (e.code === 'Home') {
        e.preventDefault();
        onChangeFrame(0);
      } else if (e.code === 'End') {
        e.preventDefault();
        onChangeFrame(frames.length - 1);
      }
    },
    [activeFrameIndex, frames.length, onChangeFrame, onTogglePlay]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!frames || frames.length === 0) {
    return null;
  }

  const progressPercent =
    frames.length > 1 ? (activeFrameIndex / (frames.length - 1)) * 100 : 100;

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleContainerClick}
      onMouseDown={handleContainerMouseDown}
      className={`bg-[#0B1523]/95 backdrop-blur-md border border-[#1E3A5F] rounded-2xl shadow-2xl transition-all duration-200 select-none overflow-hidden ${className}`}
    >
      {/* 1. Header Bar: Title, Active Frame Time, Collapse/Expand Toggle */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 border-b border-[#1E2E40] bg-[#09111C]/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0284C7]/20 border border-[#0284C7]/50 text-[#38BDF8] text-[11px] font-mono font-bold">
            <Radio className="w-3 h-3 animate-pulse text-[#38BDF8]" />
            <span>6-HOUR TRACK TIME-LAPSE</span>
          </div>

          <span className="text-[11px] font-mono text-[#94A3B8] hidden md:inline">
            IMD Synoptic Surveillance
          </span>
        </div>

        {/* Center / Right: Current Frame Pill + Collapse Button */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border ${
              currentFrame.isLive
                ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                : 'bg-[#1E2E40] border-[#334155] text-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                currentFrame.isLive ? 'bg-red-500 animate-ping' : 'bg-[#38BDF8]'
              }`}
            />
            <span>{currentFrame.relativeTime}</span>
            <span className="text-[#94A3B8] font-normal">({currentFrame.formattedTime})</span>
          </div>

          {isCollapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1E2E40] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Playback Controls' : 'Collapse Playback Controls'}
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Expanded Controls Body */}
      {!isCollapsed && (
        <div className="p-3 sm:p-4 flex flex-col gap-3 font-mono text-xs">
          {/* Telemetry info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-[#1E2E40]/60">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="text-[11px] font-bold">
                {currentFrame.latitude.toFixed(2)}°N, {currentFrame.longitude.toFixed(2)}°E
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Wind className="w-3.5 h-3.5 text-[#FB923C]" />
              <span className="text-[11px] font-bold text-amber-300">
                {currentFrame.windSpeed}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-[#60A5FA]" />
              <span className="text-[11px] font-bold text-slate-200">
                {currentFrame.centralPressure}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 truncate">
              <span className="text-[10px] text-[#94A3B8] uppercase">Loc:</span>
              <span className="text-[11px] text-[#93C5FD] truncate" title={currentFrame.locationName}>
                {currentFrame.locationName}
              </span>
            </div>
          </div>

          {/* Interactive Progress Scrubber / Timeline Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="relative w-full h-6 flex items-center">
              {/* Background bar */}
              <div className="w-full h-2 bg-[#1E2E40] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#EF4444] transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Native range input slider layered transparently */}
              <input
                type="range"
                min={0}
                max={frames.length - 1}
                step={1}
                value={activeFrameIndex}
                onChange={(e) => onChangeFrame(parseInt(e.target.value, 10))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                aria-label="Cyclone track time-lapse timeline scrubber"
              />

              {/* Visual Frame Marker Ticks */}
              <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none z-10">
                {frames.map((frame, idx) => (
                  <div
                    key={frame.id}
                    className={`w-2.5 h-2.5 rounded-full border transition-all ${
                      idx === activeFrameIndex
                        ? 'bg-white border-[#38BDF8] scale-125 shadow-md shadow-[#38BDF8]/50 ring-2 ring-[#38BDF8]/40'
                        : idx < activeFrameIndex
                        ? 'bg-[#38BDF8] border-white/60 scale-90'
                        : 'bg-[#0B1523] border-[#475569] scale-75'
                    }`}
                    title={`${frame.relativeTime} (${frame.formattedTime})`}
                  />
                ))}
              </div>
            </div>

            {/* Timeline Tick Labels */}
            <div className="flex items-center justify-between text-[10px] text-[#94A3B8] px-0.5">
              <span>{frames[0]?.relativeTime} ({frames[0]?.formattedTime})</span>
              <span className="text-[#64748B] hidden sm:inline">-3.0h (17:30 IST)</span>
              <span className="font-bold text-[#EF4444]">
                {frames[frames.length - 1]?.relativeTime} ({frames[frames.length - 1]?.formattedTime})
              </span>
            </div>
          </div>

          {/* Navigation Controls & Speed Selector Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Play, Step, Jump Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Jump to Start */}
              <button
                type="button"
                onClick={() => onChangeFrame(0)}
                disabled={isEarliest}
                className="p-1.5 sm:p-2 rounded-lg bg-[#132337] hover:bg-[#1A314D] border border-[#25486F] text-[#93C5FD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Jump to Start (-6h)"
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Step Backward */}
              <button
                type="button"
                onClick={() => onChangeFrame(Math.max(0, activeFrameIndex - 1))}
                disabled={isEarliest}
                className="p-1.5 sm:p-2 rounded-lg bg-[#132337] hover:bg-[#1A314D] border border-[#25486F] text-[#93C5FD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Frame (Left Arrow)"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Primary Play / Pause Button */}
              <button
                type="button"
                onClick={onTogglePlay}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer shadow-lg ${
                  isPlaying
                    ? 'bg-[#EF4444] hover:bg-red-600 text-white ring-2 ring-red-400/40 animate-pulse'
                    : 'bg-[#0284C7] hover:bg-[#0369A1] text-white ring-1 ring-sky-300/40'
                }`}
                title={isPlaying ? 'Pause Animation (Space)' : 'Play 6h Animation (Space)'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    <span className="text-xs">PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                    <span className="text-xs">PLAY</span>
                  </>
                )}
              </button>

              {/* Step Forward */}
              <button
                type="button"
                onClick={() => onChangeFrame(Math.min(frames.length - 1, activeFrameIndex + 1))}
                disabled={isLatest}
                className="p-1.5 sm:p-2 rounded-lg bg-[#132337] hover:bg-[#1A314D] border border-[#25486F] text-[#93C5FD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Frame (Right Arrow)"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Jump to Latest / LIVE */}
              <button
                type="button"
                onClick={() => onChangeFrame(frames.length - 1)}
                disabled={isLatest}
                className="p-1.5 sm:p-2 rounded-lg bg-[#132337] hover:bg-[#1A314D] border border-[#25486F] text-[#93C5FD] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Jump to Current Center (LIVE)"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Speed & Loop Toggles */}
            <div className="flex items-center gap-2">
              {/* Loop toggle */}
              {onToggleLoop && (
                <button
                  type="button"
                  onClick={onToggleLoop}
                  className={`p-1.5 sm:p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                    loop
                      ? 'bg-[#0284C7]/20 border-[#0284C7] text-[#38BDF8]'
                      : 'bg-[#132337] border-[#1E2E40] text-[#64748B]'
                  }`}
                  title={loop ? 'Loop Enabled: continuous cycle' : 'Loop Disabled: stop at latest'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Playback speed buttons */}
              <div className="flex items-center bg-[#09111C] border border-[#1E2E40] rounded-lg p-0.5">
                {[0.5, 1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => onChangeSpeed(spd)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[#0284C7] text-white'
                        : 'text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
