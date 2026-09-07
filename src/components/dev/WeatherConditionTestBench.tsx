import React, { useState } from 'react';
import {
  CentralWeatherCondition,
  ALL_TEST_CONDITIONS,
  getConditionLabel,
  getConditionEffectType,
  isPrecipitationCondition,
} from '../../services/weatherConditions';
import { getWeatherVisualConfig } from '../../utils/weatherIcons';
import { WeatherEffects } from '../weather/WeatherEffects';
import {
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface WeatherConditionTestBenchProps {
  currentCondition?: CentralWeatherCondition;
  onSelectCondition?: (condition: CentralWeatherCondition | 'LIVE') => void;
  isDay?: boolean;
}

export const WeatherConditionTestBench: React.FC<WeatherConditionTestBenchProps> = ({
  currentCondition = 'CLEAR_NIGHT',
  onSelectCondition,
  isDay = false,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<CentralWeatherCondition>(currentCondition);
  const [testIsDay, setTestIsDay] = useState<boolean>(isDay);
  const [animationOpacity, setAnimationOpacity] = useState<number>(0.75);
  const [switchLog, setSwitchLog] = useState<Array<{ time: string; from: string; to: string }>>([]);

  const handleConditionChange = (newCond: CentralWeatherCondition) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    setSwitchLog((prev) => [
      { time: timeStr, from: selectedCondition, to: newCond },
      ...prev.slice(0, 4),
    ]);
    setSelectedCondition(newCond);
    if (newCond === 'CLEAR_NIGHT' || newCond === 'PARTLY_CLOUDY_NIGHT') {
      setTestIsDay(false);
    } else if (newCond === 'CLEAR_DAY' || newCond === 'PARTLY_CLOUDY_DAY') {
      setTestIsDay(true);
    }
    onSelectCondition?.(newCond);
  };

  const visualConfig = getWeatherVisualConfig(
    getConditionLabel(selectedCondition),
    testIsDay,
    selectedCondition
  );
  const IconComponent = visualConfig.icon;
  const effectType = getConditionEffectType(selectedCondition);

  return (
    <div
      id="weather-condition-test-bench"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Weather Condition & Animation Engine Test Bench (Rule 8)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Internal developer tool to verify synchronous Text → Icon → Animation mapping and clean canvas lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectCondition?.('LIVE')}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Live Feeds</span>
          </button>
        </div>
      </div>

      {/* Condition Selector Grid */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Select Target Condition:</span>
          <span className="text-cyan-400 font-semibold">{selectedCondition}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ALL_TEST_CONDITIONS.map((cond) => {
            const isSelected = selectedCondition === cond;
            const isPrecip = isPrecipitationCondition(cond);
            return (
              <button
                key={cond}
                id={`test-condition-btn-${cond.toLowerCase()}`}
                type="button"
                onClick={() => handleConditionChange(cond)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all text-left flex flex-col justify-between gap-1 border cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{cond}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  {isPrecip ? (
                    <span className="text-cyan-400 font-semibold">Precip: YES</span>
                  ) : (
                    <span className="text-slate-500">Precip: NO</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Visual Verification Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas Preview */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Active Canvas Output Preview:
            </span>
            <span className="font-mono text-cyan-300">
              Effect: <strong>{effectType.toUpperCase()}</strong>
            </span>
          </div>

          <div className="relative h-64 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-6 flex flex-col justify-between shadow-inner">
            {/* The Live Data-Driven Weather Animation Layer */}
            <WeatherEffects condition={selectedCondition} isDay={testIsDay} opacity={animationOpacity} />

            {/* Ambient Background Glow based on condition */}
            <div
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: isPrecipitationCondition(selectedCondition)
                  ? 'radial-gradient(circle at top right, #0284c7 0%, transparent 60%)'
                  : testIsDay
                  ? 'radial-gradient(circle at top right, #f59e0b 0%, transparent 60%)'
                  : 'radial-gradient(circle at top right, #3b82f6 0%, transparent 60%)',
              }}
            />

            {/* Foreground Content for validation */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center shadow-lg">
                  <IconComponent className={`w-8 h-8 ${visualConfig.iconColor}`} />
                </div>
                <div>
                  <div className="text-xs uppercase font-mono text-slate-400">Resolved Label</div>
                  <div className="text-lg font-bold text-white">
                    {getConditionLabel(selectedCondition)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700/50 text-cyan-300">
                  {testIsDay ? 'DAY MODE' : 'NIGHT MODE'}
                </span>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{visualConfig.description}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Synchronized
              </span>
            </div>
          </div>
        </div>

        {/* Right: Technical Inspector & Verification Audit */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-2">
              Synchronization Audit Matrix
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">1. Data Condition Key</span>
                <strong className="font-mono text-cyan-400">{selectedCondition}</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">2. UI Display Label</span>
                <strong className="text-white">{getConditionLabel(selectedCondition)}</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">3. Lucide Vector Icon</span>
                <span className="font-mono text-amber-300 font-semibold flex items-center gap-1">
                  <IconComponent className="w-3.5 h-3.5" />
                  {IconComponent.displayName || IconComponent.name || 'LucideIcon'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">4. Active Particle Engine</span>
                <strong className="font-mono text-purple-400">{effectType}</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">5. Rain on "Clear"?</span>
                <strong
                  className={`font-mono ${
                    selectedCondition.includes('CLEAR') && isPrecipitationCondition(selectedCondition)
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedCondition.includes('CLEAR') && isPrecipitationCondition(selectedCondition)
                    ? 'BUG: Rain running!'
                    : 'PASS: Never rain'}
                </strong>
              </div>
            </div>
          </div>

          {/* Opacity and Time toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Effect Opacity:</span>
              <span className="font-mono text-cyan-400">{Math.round(animationOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={animationOpacity}
              onChange={(e) => setAnimationOpacity(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Switch Log */}
          {switchLog.length > 0 && (
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              <span>Recent switch: </span>
              <span className="text-slate-400">
                {switchLog[0].from} → {switchLog[0].to} at {switchLog[0].time}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
