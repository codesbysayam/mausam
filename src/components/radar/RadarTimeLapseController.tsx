import React, { useEffect, useCallback } from 'react';
import { RadarFrame, RadarMotionVector, RadarDataStatus } from '../../services/radarService';

export type RadarTimeSpan = '1h' | '3h' | '6h';

export interface RadarTimeLapseControllerProps {
  frames: RadarFrame[];
  activeFrameIndex: number;
  onChangeFrame: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  loop?: boolean;
  onToggleLoop?: () => void;
  timeSpan?: RadarTimeSpan;
  onChangeTimeSpan?: (span: RadarTimeSpan) => void;
  motionVector?: RadarMotionVector;
  dataStatus?: RadarDataStatus;
  className?: string;
  isCollapsible?: boolean;
  initialCollapsed?: boolean;
}

export const RadarTimeLapseController: React.FC<RadarTimeLapseControllerProps> = ({
  frames,
  activeFrameIndex,
  onChangeFrame,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  loop = true,
  onToggleLoop,
  timeSpan = '6h',
  onChangeTimeSpan,
  motionVector,
  dataStatus = 'LIVE',
  className = '',
  isCollapsible = true,
  initialCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(initialCollapsed);

  const currentFrame = frames[activeFrameIndex] || frames[frames.length - 1];
  const isLatest = activeFrameIndex === frames.length - 1;
  const isEarliest = activeFrameIndex === 0;

  // Keyboard navigation shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Avoid intercepting input fields or search bars
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

  // Calculate percentage along timeline
  const progressPercent =
    frames.length > 1 ? (activeFrameIndex / (frames.length - 1)) * 100 : 100;

  // Stop Leaflet map panning/zooming when interacting with playback controls
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  /* ==========================================================
     COLLAPSED PILL MODE
     ========================================================== */
  if (isCollapsible && isCollapsed) {
    return (
      <div
        id="radar-time-lapse-collapsed-pill"
        onClick={handleContainerClick}
        onMouseDown={handleContainerMouseDown}
        onDoubleClick={(e) => e.stopPropagation()}
        className={`bg-[#071727]/95 backdrop-blur-md border border-[#19456B] rounded-xl px-3 py-1.5 text-xs text-[#E1EEF8] shadow-2xl flex items-center justify-between gap-2.5 max-w-[calc(100vw-24px)] ${className}`}
        role="region"
        aria-label="Radar Time-Lapse Playback Mini Bar"
      >
        {/* Play/Pause & Step Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Animation [Space]' : 'Play 6-Hour Time-Lapse [Space]'}
            className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-[#F97316] hover:bg-[#EA580C] text-white ring-1 ring-[#FDBA74]'
                : 'bg-[#1565C0] hover:bg-[#0D47A1] text-white ring-1 ring-[#38BDF8]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span className="hidden xs:inline">{isPlaying ? 'Pause' : 'Play 6h'}</span>
          </button>

          {/* Step Back (-15m) */}
          <button
            type="button"
            onClick={() => onChangeFrame(Math.max(0, activeFrameIndex - 1))}
            disabled={isEarliest}
            title="Step Back 15 Minutes [Left Arrow]"
            className="w-6 h-6 rounded bg-[#0D253D] hover:bg-[#153D63] text-[#A5C0D8] hover:text-white border border-[#1A456B] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[14px]">skip_previous</span>
          </button>

          {/* Step Forward (+15m) */}
          <button
            type="button"
            onClick={() => onChangeFrame(Math.min(frames.length - 1, activeFrameIndex + 1))}
            disabled={isLatest}
            title="Step Forward 15 Minutes [Right Arrow]"
            className="w-6 h-6 rounded bg-[#0D253D] hover:bg-[#153D63] text-[#A5C0D8] hover:text-white border border-[#1A456B] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[14px]">skip_next</span>
          </button>
        </div>

        {/* Center Frame & Time Info */}
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-[#00C897] shrink-0 animate-pulse" />
          <div className="flex items-center gap-1.5 font-mono text-[11px] truncate">
            <span className="text-[#8A9FB4] hidden sm:inline">
              F{activeFrameIndex + 1}/{frames.length}
            </span>
            <strong className="text-[#F0F6FC]">
              {currentFrame.formattedTime.split(',')[0]}
            </strong>
            <span className="text-[#38BDF8] text-[10px] font-bold px-1 rounded bg-[#102C48] border border-[#1A4E7E]">
              {currentFrame.relativeLabel || (isLatest ? 'LIVE' : `${currentFrame.ageMinutes}m`)}
            </span>
          </div>
        </div>

        {/* Right Controls: Speed & Expand */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono text-[#8A9FB4] hidden sm:inline">
            {playbackSpeed}x
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="w-6 h-6 rounded bg-[#0B2136] hover:bg-[#153D63] text-[#38BDF8] hover:text-white border border-[#163B5D] flex items-center justify-center transition-colors cursor-pointer"
            title="Expand 6-Hour Time-Lapse Console"
          >
            <span className="material-symbols-outlined text-[15px]">expand_less</span>
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     EXPANDED FULL CONSOLE MODE
     ========================================================== */
  return (
    <div
      id="radar-time-lapse-expanded-console"
      onClick={handleContainerClick}
      onMouseDown={handleContainerMouseDown}
      onDoubleClick={(e) => e.stopPropagation()}
      className={`bg-[#071727]/95 backdrop-blur-md border border-[#19456B] rounded-xl p-2.5 sm:p-3 text-xs text-[#E1EEF8] shadow-2xl ${className}`}
      role="region"
      aria-label="Radar 6-Hour Time-Lapse Playback Workstation"
    >
      {/* 1. Header Strip: Title, Status, IST Timestamp & Collapse Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#15344F]">
        {/* Left: Mode Title, Animation Pulse & Time Span Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#102C48] border border-[#1A4E7E] text-[11px] font-bold text-[#38BDF8]">
            <span
              className={`material-symbols-outlined text-[15px] ${
                isPlaying ? 'animate-spin text-[#38BDF8]' : 'text-[#38BDF8]'
              }`}
            >
              radar
            </span>
            <span>6-HOUR RADAR TIME-LAPSE</span>
          </div>

          {/* Animation Status Badge */}
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
              isPlaying
                ? 'bg-[#F97316]/20 text-[#FB923C] border-[#F97316]/40 animate-pulse'
                : 'bg-[#1565C0]/20 text-[#38BDF8] border-[#1565C0]/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPlaying ? 'bg-[#F97316]' : 'bg-[#38BDF8]'
              }`}
            />
            {isPlaying ? 'ANIMATING' : 'PAUSED'}
          </span>

          {/* Time Span Switcher: 6 Hours, 3 Hours, 1 Hour */}
          {onChangeTimeSpan && (
            <div className="flex items-center bg-[#0B2136] p-0.5 rounded border border-[#163B5D]">
              {(['6h', '3h', '1h'] as RadarTimeSpan[]).map((span) => (
                <button
                  key={span}
                  type="button"
                  onClick={() => onChangeTimeSpan(span)}
                  className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                    timeSpan === span
                      ? 'bg-[#1565C0] text-white shadow-xs font-bold'
                      : 'text-[#8A9FB4] hover:text-white'
                  }`}
                  title={`View weather progression over last ${span.replace('h', ' hours')}`}
                >
                  {span.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Frame Counter, Timestamp Badge & Collapse Button */}
        <div className="flex items-center gap-2">
          {/* Frame Number Counter */}
          <div className="text-[11px] font-mono text-[#8A9FB4] hidden sm:inline">
            Frame <span className="font-bold text-[#F0F6FC]">{activeFrameIndex + 1}</span>/
            <span className="font-bold text-[#F0F6FC]">{frames.length}</span>
          </div>

          {/* Active Frame Timestamp Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#092238] border border-[#194C77]">
            <span
              className={`w-2 h-2 rounded-full ${
                isLatest ? 'bg-[#00C897] animate-ping' : 'bg-[#38BDF8]'
              }`}
            />
            <span className="font-mono font-bold text-[#F0F6FC] text-[11px]">
              {currentFrame.formattedTime.split(',')[0]}
            </span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                isLatest
                  ? 'bg-[#00C897]/20 text-[#00C897] border border-[#00C897]/40'
                  : 'bg-[#1565C0]/25 text-[#38BDF8] border border-[#1565C0]/40'
              }`}
            >
              {currentFrame.relativeLabel || (isLatest ? 'LIVE' : `${currentFrame.ageMinutes}m ago`)}
            </span>
          </div>

          {/* Minimize / Collapse Button */}
          {isCollapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-5 h-5 rounded hover:bg-[#102C48] text-[#8AA1B7] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Minimize playback bar"
              aria-expanded={true}
            >
              <span className="material-symbols-outlined text-[15px]">expand_more</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Timeline Bar & 1-Hour Tick Markers */}
      <div className="py-2">
        <div className="relative flex flex-col gap-1">
          {/* Timeline Slider Track */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={activeFrameIndex}
              onChange={(e) => onChangeFrame(Number(e.target.value))}
              aria-label="6-hour radar time-lapse progression timeline"
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#0A2238] border border-[#1A456B] accent-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
              style={{
                background: `linear-gradient(to right, #1565C0 0%, #38BDF8 ${progressPercent}%, #0B2238 ${progressPercent}%, #0B2238 100%)`,
              }}
            />
          </div>

          {/* 1-Hour Visual Tick Markers across the 6-Hour Timeline */}
          <div className="flex items-center justify-between text-[9.5px] font-mono text-[#7A93AA] pt-0.5 px-1 select-none">
            <button
              type="button"
              onClick={() => onChangeFrame(0)}
              className="text-[#38BDF8] font-bold hover:underline cursor-pointer"
              title="Jump to -6 Hours"
            >
              -6h
            </button>
            <span className="hidden sm:inline">-5h</span>
            <span className="hidden xs:inline">-4h</span>
            <span className="text-[#8AB4D5] font-semibold">-3h</span>
            <span className="hidden xs:inline">-2h</span>
            <span className="hidden sm:inline">-1h</span>
            <button
              type="button"
              onClick={() => onChangeFrame(frames.length - 1)}
              className="text-[#00C897] font-bold hover:underline cursor-pointer"
              title="Jump to LIVE scan"
            >
              LIVE (NOW)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Transport Controls: Play/Pause, Step, Speed, Loop */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#122A42]">
        {/* Playback Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Jump to -6h (Start) */}
          <button
            type="button"
            onClick={() => onChangeFrame(0)}
            disabled={isEarliest}
            title="Jump to Start (6 Hours Ago) [Home]"
            className="w-7 h-7 rounded bg-[#0D253D] hover:bg-[#153D63] text-[#A5C0D8] hover:text-white border border-[#1A456B] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">first_page</span>
          </button>

          {/* Step Backward (-15m) */}
          <button
            type="button"
            onClick={() => onChangeFrame(Math.max(0, activeFrameIndex - 1))}
            disabled={isEarliest}
            title="Step Back 15 Minutes [Left Arrow]"
            className="w-7 h-7 rounded bg-[#0D253D] hover:bg-[#153D63] text-[#A5C0D8] hover:text-white border border-[#1A456B] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">skip_previous</span>
          </button>

          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Time-Lapse [Space]' : 'Play 6-Hour Time-Lapse Loop [Space]'}
            className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isPlaying
                ? 'bg-[#F97316] hover:bg-[#EA580C] text-white ring-1 ring-[#FDBA74]'
                : 'bg-[#1565C0] hover:bg-[#0D47A1] text-white ring-1 ring-[#38BDF8]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause' : 'Play 6h Loop'}</span>
          </button>

          {/* Step Forward (+15m) */}
          <button
            type="button"
            onClick={() => onChangeFrame(Math.min(frames.length - 1, activeFrameIndex + 1))}
            disabled={isLatest}
            title="Step Forward 15 Minutes [Right Arrow]"
            className="w-7 h-7 rounded bg-[#0D253D] hover:bg-[#153D63] text-[#A5C0D8] hover:text-white border border-[#1A456B] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">skip_next</span>
          </button>

          {/* Jump to Live (End) */}
          <button
            type="button"
            onClick={() => onChangeFrame(frames.length - 1)}
            disabled={isLatest}
            title="Jump to Live Scan [End]"
            className="w-7 h-7 rounded bg-[#0D253D] hover:bg-[#153D63] text-[#A5C0D8] hover:text-white border border-[#1A456B] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">last_page</span>
          </button>

          {/* Keyboard Hint Badge */}
          <span className="text-[9px] font-mono text-[#627D96] ml-1 hidden lg:inline">
            [Space] Play • [←/→] Step
          </span>
        </div>

        {/* Speed Controls & Continuous Loop Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#7A93AA] uppercase tracking-wider font-semibold hidden md:inline">
            Speed:
          </span>
          <div className="flex items-center bg-[#0B2136] p-0.5 rounded border border-[#163B5D]">
            {[0.5, 1, 2, 4].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onChangeSpeed(spd)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-[#1565C0] text-white font-bold shadow-xs'
                    : 'text-[#8A9FB4] hover:text-white'
                }`}
                title={`Play time-lapse at ${spd}x speed`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Continuous Loop Toggle */}
          {onToggleLoop && (
            <button
              type="button"
              onClick={onToggleLoop}
              title={loop ? 'Continuous Loop Enabled' : 'Loop Disabled (Stops at latest frame)'}
              className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors border cursor-pointer ${
                loop
                  ? 'bg-[#1565C0]/20 text-[#38BDF8] border-[#38BDF8]/50'
                  : 'bg-[#0B2136] text-[#7A93AA] border-[#163B5D] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">repeat</span>
              <span className="hidden sm:inline">Loop</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Synoptic Storm Vector & Atmosphere Motion Insight */}
      {motionVector && (
        <div className="mt-2 pt-1.5 border-t border-[#122A42] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9.5px] text-[#8AA1B7]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#38BDF8] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">air</span>
              Storm Movement Vector:
            </span>
            <span className="font-mono text-[#F0F6FC] bg-[#0A2238] px-1.5 py-0.5 rounded border border-[#163B5D]">
              Heading {motionVector.compassDir} ({motionVector.azimuthDeg}°) @ {motionVector.speedKmh} km/h
            </span>
            <span className="text-[#8AA1B7] hidden lg:inline">• {motionVector.stormDescription}</span>
          </div>

          <div className="text-[9px] font-mono text-[#6A8197] shrink-0">
            RainViewer Global Mosaic + IMD DWR Network
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarTimeLapseController;
