import React, { useState, useEffect } from 'react';
import { CurrentWeather, WeatherStation } from '../types';

interface GroundingLink {
  title: string;
  url: string;
  type: 'search' | 'maps';
  snippet?: string;
}

interface AskMausamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeather;
  currentStation: WeatherStation;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  groundingSources?: GroundingLink[];
  modeUsed?: string;
}

export const AskMausamDrawer: React.FC<AskMausamDrawerProps> = ({
  isOpen,
  onClose,
  weather,
  currentStation,
}) => {
  const [groundingMode, setGroundingMode] = useState<'auto' | 'search' | 'maps'>('auto');
  const [language, setLanguage] = useState<string>('English');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `${currentStation?.name || 'Bhubaneswar Observatory'}, ${currentStation?.state || 'Odisha'}

${weather.temp}°C — ${weather.condition}
Feels like: ${weather.feelsLike ?? weather.temp}°C
Humidity: ${weather.humidity}%
Wind: ${weather.windSpeed} km/h ${weather.windDirection}
Pressure: ${weather.pressure} hPa
AQI: ${weather.aqiPm25} (${weather.aqiStatus})
Pollen: ${weather.pollen}

Observed:
${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST

Status: OBSERVED
Source: India Meteorological Department (IMD) / MAUSAM Core`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'India Meteorological Department (IMD)',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supportedLanguages = [
    'English',
    'Hindi (हिन्दी)',
    'Odia (ଓଡ଼ିଆ)',
    'Bengali (বাংলা)',
    'Marathi (मराठी)',
    'Tamil (தமிழ்)',
    'Telugu (తెలుగు)',
    'Kannada (ಕನ್ನಡ)',
    'Malayalam (മലയാളം)',
    'Gujarati (ગુજરાતી)',
    'Punjabi (ਪੰਜਾਬੀ)',
    'Assamese (অসমীয়া)',
    'Urdu (اردو)',
  ];

  const quickPromptsByMode: Record<'auto' | 'search' | 'maps', string[]> = {
    auto: [
      'What is the current weather & conditions?',
      'Can I go for an outdoor run right now?',
      'Why is relative humidity high today?',
      'Is there an active rainfall warning?',
      'Agromet farming advisory for my state',
    ],
    search: [
      'Latest IMD severe rain and thunderstorm warning',
      'Bay of Bengal low pressure or cyclone bulletin',
      'Air quality forecast for next 48 hours',
      'Monsoon circulation and western disturbance news',
    ],
    maps: [
      'Closest IMD Doppler Weather Radar (DWR) station',
      'Emergency cyclone shelters and relief centers nearby',
      'Nearby coastal weather observatories',
      'Topography & flood vulnerability around here',
    ],
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-mausam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          station: currentStation,
          mode: groundingMode,
          lat: currentStation.lat,
          lng: currentStation.lng,
          preferredLanguage: language.split(' ')[0],
          location: {
            country: 'India',
            state: currentStation.state,
            city: currentStation.district || currentStation.name,
            station: currentStation.name,
            stationId: currentStation.code || currentStation.id || '42971',
            latitude: currentStation.lat,
            longitude: currentStation.lng,
          },
          observation: {
            temperatureC: weather.temp,
            feelsLikeC: weather.feelsLike ?? weather.temp,
            condition: weather.condition,
            relativeHumidity: weather.humidity,
            windSpeedKmh: weather.windSpeed,
            windDirection: weather.windDirection,
            windDirectionDegrees: weather.windDirectionDeg ?? 247,
            pressureHpa: weather.pressure,
            visibilityKm: weather.visibilityKm ?? 7,
            dewPointC: weather.dewPoint,
            rainfall24hMm: weather.precipitation,
            rainProbability: weather.precipitationProbability,
            uvIndex: weather.uvIndex,
          },
          airQuality: {
            aqi: weather.aqiIndex ?? 63,
            pm25: weather.aqiPm25,
            pm10: weather.aqiPm10 ?? 58,
            category: weather.aqiStatus,
          },
          pollen: {
            index: weather.pollenCount ?? 8,
            category: weather.pollen,
          },
          astronomy: {
            sunrise: weather.sunrise ?? '05:29',
            sunset: weather.sunset ?? '18:07',
          },
          metadata: {
            observedAt: weather.lastUpdated || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            source: weather.source || 'India Meteorological Department (IMD)',
            status: weather.isLive ? 'LIVE' : 'OBSERVED',
          },
          weatherContext: {
            temp: weather.temp,
            high: weather.high,
            low: weather.low,
            condition: weather.condition,
            aqi: weather.aqiPm25,
            uv: weather.uvIndex,
            humidity: weather.humidity,
            pollen: weather.pollen,
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.response || data.fallback || 'Telemetry processing complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'India Meteorological Department (IMD)',
        groundingSources: data.groundingSources || [],
        modeUsed: data.modeUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error calling /api/ask-mausam:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I couldn't retrieve the latest weather data right now. The MAUSAM data service may be temporarily unavailable. Please refresh the data or try again shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'MAUSAM Core [Offline Guard]',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity select-none font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Ask MAUSAM AI Weather Assistant"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full sm:max-w-lg bg-[#0F141A] border-l border-[#334155] h-full max-h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#334155] flex justify-between items-center bg-[#17212B] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#1E2733] border border-[#334155] flex items-center justify-center text-[#4FA8E0] shrink-0">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                psychology
              </span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  MAUSAM AI Assistant
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-[#0B72B9]/20 text-[#4FA8E0] text-[9px] sm:text-[10px] font-bold border border-[#0B72B9]/40 shrink-0">
                  IMD / Gemini
                </span>
              </div>
              <p className="text-[11px] text-[#8A94A6] truncate">
                Synced: {currentStation?.name || 'Observatory'} ({typeof currentStation?.lat === 'number' ? currentStation.lat.toFixed(2) : '20.29'}°N, {typeof currentStation?.lng === 'number' ? currentStation.lng.toFixed(2) : '85.82'}°E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-[#1E2733] border border-[#334155] text-[#8A94A6] hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-2"
            aria-label="Close assistant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* AI Grounding Mode & Language Selector */}
        <div className="px-3 sm:px-4 py-2 bg-[#0F141A] border-b border-[#334155] flex flex-col gap-2 text-xs shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[#8A94A6] shrink-0 text-[10px] sm:text-[11px] font-medium">
                Grounding:
              </span>
              <button
                onClick={() => setGroundingMode('auto')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium ${
                  groundingMode === 'auto'
                    ? 'bg-[#0B72B9] text-white'
                    : 'bg-[#17212B] text-[#8A94A6] hover:text-white border border-[#334155]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                Auto
              </button>
              <button
                onClick={() => setGroundingMode('search')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium ${
                  groundingMode === 'search'
                    ? 'bg-[#0B72B9] text-white'
                    : 'bg-[#17212B] text-[#8A94A6] hover:text-white border border-[#334155]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">search</span>
                Search
              </button>
              <button
                onClick={() => setGroundingMode('maps')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium ${
                  groundingMode === 'maps'
                    ? 'bg-[#0B72B9] text-white'
                    : 'bg-[#17212B] text-[#8A94A6] hover:text-white border border-[#334155]'
                }`}
              >
                <span className="material-symbols-outlined text-[12px]">location_on</span>
                Maps
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="material-symbols-outlined text-[#8A94A6] text-[13px]">
                translate
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#17212B] text-[#4FA8E0] text-[10px] sm:text-[11px] font-medium rounded border border-[#334155] px-1.5 py-0.5 focus:outline-none"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang} value={lang} className="bg-[#17212B] text-white">
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3 sm:p-3.5 rounded max-w-[94%] sm:max-w-[90%] text-xs sm:text-sm leading-relaxed break-words [overflow-wrap:anywhere] ${
                  m.role === 'user'
                    ? 'bg-[#0B72B9] text-white font-medium'
                    : 'bg-[#17212B] border border-[#334155] text-[#D7DEE8]'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* Grounding Source Citations & Maps links */}
                {m.groundingSources && m.groundingSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#334155] flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#4FA8E0] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        verified
                      </span>
                      Grounding Sources &amp; Place Links:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.groundingSources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            source.type === 'maps'
                              ? 'bg-[#2ECC71]/15 text-[#2ECC71] hover:bg-[#2ECC71]/25 border border-[#2ECC71]/30'
                              : 'bg-[#0B72B9]/15 text-[#4FA8E0] hover:bg-[#0B72B9]/25 border border-[#0B72B9]/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {source.type === 'maps' ? 'place' : 'travel_explore'}
                          </span>
                          <span className="truncate max-w-[160px] sm:max-w-[200px]">
                            {source.title}
                          </span>
                          <span className="material-symbols-outlined text-[10px] opacity-70">
                            open_in_new
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {m.source && (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#8A94A6] pt-1">
                    <span>Engine: {m.source}</span>
                    {m.modeUsed && (
                      <span className="uppercase tracking-wider px-1 bg-black/20 rounded">
                        Mode: {m.modeUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#8A94A6] mt-1 px-1 font-mono">
                {m.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-[#4FA8E0] text-xs p-3 bg-[#17212B] rounded border border-[#334155] w-fit animate-pulse">
              <span className="material-symbols-outlined text-[16px] animate-spin">
                autorenew
              </span>
              Synthesizing {groundingMode === 'maps' ? 'Google Maps spatial' : groundingMode === 'search' ? 'Google Search live IMD' : 'atmospheric'} telemetry...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 sm:p-3 border-t border-[#334155] bg-[#0F141A] flex flex-wrap gap-1.5 max-h-32 overflow-y-auto shrink-0">
          {quickPromptsByMode[groundingMode].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="ask-mausam-cursor text-[11px] sm:text-xs px-2.5 py-1 rounded bg-[#17212B] border border-[#334155] text-[#D7DEE8] hover:text-[#4FA8E0] hover:border-[#4FA8E0] transition-all text-left break-words max-w-full"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-3.5 border-t border-[#334155] bg-[#17212B] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={
              groundingMode === 'maps'
                ? 'Ask for radar stations, cyclone shelters...'
                : groundingMode === 'search'
                ? 'Ask for today’s IMD weather bulletins, warnings...'
                : 'Ask about weather, AQI, rain forecast, alerts...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#0F141A] border border-[#334155] rounded px-3 py-2 text-xs text-white placeholder-[#8A94A6] focus:outline-none focus:border-[#4FA8E0]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            className="mausam-btn mausam-btn--sm ask-mausam-cursor shrink-0 px-3"
            aria-label="Send message"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
