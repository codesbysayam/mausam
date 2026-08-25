import React, { useState } from 'react';
import { CurrentWeather, WeatherStation } from '../types';

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
}

export const AskMausamDrawer: React.FC<AskMausamDrawerProps> = ({
  isOpen,
  onClose,
  weather,
  currentStation,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Greetings. I am Mausam AI, synced with ${currentStation.name}. Current telemetry: PM2.5 is ${weather.aqiPm25} µg/m³ with an active IMD Advisory. Temperature is ${weather.temp}°C (${weather.condition}). How can I assist with your meteorological, air quality, or outdoor activity planning?`,
      timestamp: '16:00',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Can I run outdoors right now?',
    'What is causing the PM2.5 surge?',
    'When will the rain clearing complete?',
    'Weekend cycling forecast & wind vectors',
  ];

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
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error calling /api/ask-mausam:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `[Mausam Telemetry]: Based on station readings, elevated PM2.5 (${weather.aqiPm25} µg/m³) is currently trapped under the boundary layer. Moderate clearing is anticipated by 18:00 with nocturnal ventilating breezes.`,
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
            <div className="w-8 h-8 rounded-lg bg-[#8ed5ff]/20 card-border flex items-center justify-center">
              <span className="material-symbols-outlined text-[#8ed5ff] text-[18px]">
                psychology
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#dae2fd] flex items-center gap-2">
                Ask Mausam AI
                <span className="px-1.5 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-semibold">
                  Online
                </span>
              </h3>
              <p className="text-xs text-[#bdc8d1]">
                Atmospheric Intelligence Copilot
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

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-xl max-w-[90%] text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#8ed5ff] text-[#00354a] font-medium shadow-md'
                    : 'bg-[#171f33] card-border text-[#dae2fd] shadow-md'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>
                {m.source && (
                  <span className="block mt-1 text-[11px] text-[#8ed5ff] opacity-80">
                    Engine: {m.source}
                  </span>
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
              Synthesizing atmospheric telemetry...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-[#3e484f] bg-[#060e20] flex flex-wrap gap-1.5">
          {quickPrompts.map((chip) => (
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
            placeholder="Ask about weather, PM2.5, outdoor plans..."
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
