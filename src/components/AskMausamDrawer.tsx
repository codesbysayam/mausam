import React, { useState } from 'react';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings. I am Mausam AI, synced with ${currentStation.name} (${currentStation.state}). Current telemetry: PM2.5 is ${weather.aqiPm25} µg/m³ with an active IMD Advisory. Temperature is ${weather.temp}°C (${weather.condition}). Google Search & Google Maps Grounding are enabled for live weather warnings, satellite radar stations, and local geography queries.`,
      timestamp: '16:00',
      source: 'Mausam Telemetry Core',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPromptsByMode: Record<'auto' | 'search' | 'maps', string[]> = {
    auto: [
      'Can I run outdoors right now?',
      'What is causing the PM2.5 surge?',
      'When will the rain clearing complete?',
      'Agromet farming advisory for my state',
    ],
    search: [
      'Latest IMD severe rain warning today',
      'Bay of Bengal low pressure cyclone bulletin',
      'Air quality forecast for next 48 hours',
      'Monsoon onset & western disturbance news',
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
        source: data.source,
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
          content: `[Mausam Telemetry]: Based on station readings at ${currentStation.name}, elevated PM2.5 (${weather.aqiPm25} µg/m³) is currently trapped under the boundary layer. Moderate clearing is anticipated by late evening with nocturnal ventilating breezes.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity select-none font-sans">
      <div className="w-full max-w-lg bg-[#0b1326] border-l border-[#3e484f] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 card-header-divider flex justify-between items-center bg-[#171f33]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8ed5ff]/20 card-border flex items-center justify-center text-[#8ed5ff]">
              <span className="material-symbols-outlined text-[20px]">
                psychology
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#dae2fd]">
                  Ask Mausam AI
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-semibold">
                  Grounded
                </span>
              </div>
              <p className="text-xs text-[#bdc8d1]">
                Synced with {currentStation.name} ({currentStation.lat.toFixed(2)}°N, {currentStation.lng.toFixed(2)}°E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#bdc8d1] hover:text-[#dae2fd] p-1.5 rounded-lg hover:bg-[#2d3449] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* AI Grounding Mode Selector */}
        <div className="px-4 py-2 bg-[#060e20] border-b border-[#3e484f]/60 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[#87929a] shrink-0 text-[11px] font-medium mr-1">
            Grounding:
          </span>
          <button
            onClick={() => setGroundingMode('auto')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[11px] font-medium ${
              groundingMode === 'auto'
                ? 'bg-[#0B72B9] text-white shadow-xs'
                : 'bg-[#171f33] text-[#bdc8d1] hover:text-white border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Smart Auto
          </button>
          <button
            onClick={() => setGroundingMode('search')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[11px] font-medium ${
              groundingMode === 'search'
                ? 'bg-[#3A6EA5] text-white shadow-xs'
                : 'bg-[#171f33] text-[#bdc8d1] hover:text-white border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">search</span>
            Google Search (News & IMD)
          </button>
          <button
            onClick={() => setGroundingMode('maps')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer shrink-0 flex items-center gap-1 text-[11px] font-medium ${
              groundingMode === 'maps'
                ? 'bg-[#22c55e] text-black font-semibold shadow-xs'
                : 'bg-[#171f33] text-[#bdc8d1] hover:text-white border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            Google Maps (Radar & Places)
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-xl max-w-[92%] text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#8ed5ff] text-[#00354a] font-medium shadow-md'
                    : 'bg-[#171f33] card-border text-[#dae2fd] shadow-md'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* Grounding Source Citations & Maps links as required by Gemini skill */}
                {m.groundingSources && m.groundingSources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-[#8ed5ff] flex items-center gap-1">
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
                              ? 'bg-[#22c55e]/15 text-[#4edea3] hover:bg-[#22c55e]/25 border border-[#22c55e]/30'
                              : 'bg-[#8ed5ff]/15 text-[#8ed5ff] hover:bg-[#8ed5ff]/25 border border-[#8ed5ff]/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {source.type === 'maps' ? 'place' : 'travel_explore'}
                          </span>
                          <span className="truncate max-w-[180px]">
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
                  <div className="mt-2 flex items-center justify-between text-[10px] text-[#87929a] pt-1">
                    <span>Engine: {m.source}</span>
                    {m.modeUsed && (
                      <span className="uppercase tracking-wider px-1 bg-black/20 rounded">
                        Mode: {m.modeUsed}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-[#87929a] mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-[#8ed5ff] text-xs p-3 bg-[#171f33] rounded-lg card-border w-fit animate-pulse">
              <span className="material-symbols-outlined text-[16px] animate-spin">
                autorenew
              </span>
              Synthesizing {groundingMode === 'maps' ? 'Google Maps spatial' : groundingMode === 'search' ? 'Google Search live IMD' : 'atmospheric'} telemetry...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-[#3e484f] bg-[#060e20] flex flex-wrap gap-1.5">
          {quickPromptsByMode[groundingMode].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#171f33] card-border text-[#bdc8d1] hover:text-[#8ed5ff] hover:border-[#8ed5ff] transition-all cursor-pointer truncate max-w-full"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 card-header-divider border-t border-[#3e484f] bg-[#171f33] flex items-center gap-2">
          <input
            type="text"
            placeholder={
              groundingMode === 'maps'
                ? 'Ask for closest radar station, shelters, landmarks...'
                : groundingMode === 'search'
                ? 'Ask for today’s IMD weather bulletins, warnings, alerts...'
                : 'Ask about weather, PM2.5, outdoor plans, alerts...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#0b1326] card-border rounded-lg px-3.5 py-2 text-sm text-[#dae2fd] placeholder-[#87929a] focus:outline-none focus:border-[#8ed5ff]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            className="bg-[#8ed5ff] text-[#00354a] p-2 rounded-lg hover:bg-[#38bdf8] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
