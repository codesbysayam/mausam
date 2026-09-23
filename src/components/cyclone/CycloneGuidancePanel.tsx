import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  PhoneCall,
  ShieldCheck,
  Building2,
  Play,
  Square,
  AlertCircle,
  Info,
} from 'lucide-react';
import { WeatherSystemEvent } from '../../types/cyclone';
import {
  warningTtsService,
  WarningTtsStatus,
  SupportedLanguageCode,
  SUPPORTED_LANGUAGES,
} from '../../services/warningTtsService';

interface CycloneGuidancePanelProps {
  activeSystem: WeatherSystemEvent;
}

export const CycloneGuidancePanel: React.FC<CycloneGuidancePanelProps> = ({
  activeSystem,
}) => {
  const [ttsStatus, setTtsStatus] = useState<WarningTtsStatus>(warningTtsService.getStatus());
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>('en');
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [hasNativeVoice, setHasNativeVoice] = useState<boolean>(true);

  useEffect(() => {
    const unsub = warningTtsService.subscribe((newStatus) => {
      setTtsStatus(newStatus);
    });
    return () => {
      unsub();
      warningTtsService.stop();
    };
  }, []);

  // Update voice availability notes when language changes
  useEffect(() => {
    const isNative = warningTtsService.hasNativeVoice(selectedLanguage);
    const note = warningTtsService.getVoiceNote(selectedLanguage);
    setHasNativeVoice(isNative);
    setVoiceNote(note);
  }, [selectedLanguage]);

  const isPlaying = ttsStatus === 'PLAYING';

  const handleToggleVoice = () => {
    if (isPlaying) {
      warningTtsService.stop();
      return;
    }

    const classification = activeSystem.classification || 'Deep Depression';
    const loc = activeSystem.currentLocation || 'Westcentral & adjoining Northwest Bay of Bengal';
    const wind = activeSystem.maxSustainedWind || '55-65 km/h';
    const states = (activeSystem.affectedStates || ['Andhra Pradesh', 'Odisha']).join(', ');

    // Structured segments for orderly chunked speech
    const segments = {
      title: `MAUSAM Synoptic Warning Readout. ${classification} event.`,
      severity: activeSystem.rainfallThreat || 'RED',
      affectedArea: `${loc}. Affected states: ${states}`,
      validity: `Next official bulletin expected at ${activeSystem.nextBulletinAt || '02:30 IST'}`,
      mainWarning: `Maximum sustained surface wind speeds reaching ${wind}. Red and Orange alerts active for coastal districts.`,
      safetyInstruction: 'Fishermen are strictly advised not to venture into sea. Public should avoid low-lying waterlogged roads and follow local SDMA advisories.',
    };

    const fingerprint = `${activeSystem.id}-${activeSystem.updatedAt}-${selectedLanguage}`;
    warningTtsService.speakWarning(segments, selectedLanguage, fingerprint);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. MAUSAM Warning Readout (TTS) */}
      <div className="bg-[#0B1523] border border-[#1E3A5F] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#38BDF8]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                MAUSAM Warning Readout
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] text-[10px] font-mono font-bold">
              BROWSER TTS
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Synthesized readout of the active IMD synoptic bulletin. Speech is generated on-device via browser Web Speech API.
          </p>
        </div>

        {/* Language selector buttons */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('en');
                if (isPlaying) warningTtsService.stop();
              }}
              className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                selectedLanguage === 'en'
                  ? 'bg-[#0284C7] border-[#0284C7] text-white font-bold'
                  : 'bg-[#09111C] border-[#1E2E40] text-[#94A3B8] hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('hi');
                if (isPlaying) warningTtsService.stop();
              }}
              className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                selectedLanguage === 'hi'
                  ? 'bg-[#0284C7] border-[#0284C7] text-white font-bold'
                  : 'bg-[#09111C] border-[#1E2E40] text-[#94A3B8] hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('or');
                if (isPlaying) warningTtsService.stop();
              }}
              className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                selectedLanguage === 'or'
                  ? 'bg-[#0284C7] border-[#0284C7] text-white font-bold'
                  : 'bg-[#09111C] border-[#1E2E40] text-[#94A3B8] hover:text-white'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLanguage('te');
                if (isPlaying) warningTtsService.stop();
              }}
              className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                selectedLanguage === 'te'
                  ? 'bg-[#0284C7] border-[#0284C7] text-white font-bold'
                  : 'bg-[#09111C] border-[#1E2E40] text-[#94A3B8] hover:text-white'
              }`}
            >
              తెలుగు
            </button>
          </div>

          {/* Voice capability note */}
          {voiceNote && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded border border-[#F59E0B]/30 font-mono">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{voiceNote}</span>
            </div>
          )}
        </div>

        {/* Audio play/stop button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all cursor-pointer shadow-lg ${
            isPlaying
              ? 'bg-[#EF4444] hover:bg-red-600 text-white animate-pulse'
              : 'bg-[#0284C7] hover:bg-[#0369A1] text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>Stop Warning Readout</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Play Warning Readout</span>
            </>
          )}
        </button>
      </div>

      {/* 2. MAUSAM Safety Summary */}
      <div className="bg-[#0B1523] border border-[#1E3A5F] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              MAUSAM Safety Summary
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#94A3B8]">ADVISORY PROTOCOL</span>
        </div>
        <ul className="flex flex-col gap-2 text-xs text-[#CBD5E1]">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Do not venture into coastal waters, open beaches, or low-lying inundated underpasses.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Keep emergency kits, battery torches, dry food, and mobile power banks charged.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Unplug non-essential electrical appliances during active lightning and squall periods.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span>Comply strictly with official State Disaster Management Authority (SDMA) evacuation orders.</span>
          </li>
        </ul>
        <div className="pt-2 border-t border-[#1E2E40]/60 flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
          <span>Standard public safety guideline</span>
          <span>Not a formal evacuation order</span>
        </div>
      </div>

      {/* 3. Emergency Helplines Directory */}
      <div className="bg-[#0B1523] border border-[#1E3A5F] rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E2E40]">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#FB923C]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Emergency Control Rooms
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#34D399] font-bold">24x7 TOLL FREE</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-[#09111C] border border-[#1E2E40] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">National Disaster (NDRF)</span>
            <strong className="text-white text-sm font-bold">1078</strong>
          </div>
          <div className="p-2 rounded-lg bg-[#09111C] border border-[#1E2E40] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Andhra Pradesh SEOC</span>
            <strong className="text-white text-sm font-bold">1070</strong>
          </div>
          <div className="p-2 rounded-lg bg-[#09111C] border border-[#1E2E40] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Odisha SRC Control</span>
            <strong className="text-white text-sm font-bold">1070</strong>
          </div>
          <div className="p-2 rounded-lg bg-[#09111C] border border-[#1E2E40] flex flex-col">
            <span className="text-[10px] text-[#94A3B8]">Indian Coast Guard</span>
            <strong className="text-white text-sm font-bold">1554</strong>
          </div>
        </div>
        <div className="pt-2 border-t border-[#1E2E40]/60 text-[10px] font-mono text-[#94A3B8]">
          <span>Verified Government Emergency Lines (India)</span>
        </div>
      </div>
    </div>
  );
};
