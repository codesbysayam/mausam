// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Master Ask MAUSAM Meteorological Assistant Panel
// Canonical Orchestrator Integration with Zero-Discrepancy UI
// ====================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  AskMausamContext,
  AskMausamMessage,
  LanguageCode,
} from '../../types/askMausam';
import { AskMausamOrchestrator } from '../../services/askMausam/askMausamOrchestrator';
import { routeIntent, getIntentLoadingMessage } from '../../services/askMausam/intentRouter';
import { INDIA_STATES_UTS } from '../../data/indiaRegions';
import { QuickActions } from './QuickActions';
import { MessageBubble } from './MessageBubble';

interface AskMausamPanelProps {
  currentLocation?: {
    name: string;
    city?: string;
    state?: string;
    district?: string;
    lat: number;
    lng: number;
  };
  onClose?: () => void;
  onSelectLocation?: (locationName: string) => void;
}

export const AskMausamPanel: React.FC<AskMausamPanelProps> = ({
  currentLocation,
  onClose,
  onSelectLocation,
}) => {
  const [messages, setMessages] = useState<AskMausamMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Checking atmospheric observations…');
  const [lastTiming, setLastTiming] = useState<{ locationMs: number; providersMs: number; aiMs: number; totalMs: number } | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>('English');
  const [activeTab, setActiveTab] = useState<'CHAT' | 'REGIONS' | 'ABOUT'>('CHAT');

  // Authoritative Canonical Context (drives Header, Context Strip, and Answer Cards)
  const [canonicalContext, setCanonicalContext] = useState<AskMausamContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const activeAbortController = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize canonical context and initial briefing on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      // 1. Pre-fetch background weather context for header ribbon silently
      try {
        const initialLocQuery = currentLocation?.name
          ? `Current weather in ${currentLocation.name}`
          : 'Current weather in Bhubaneswar, Odisha';

        const result = await AskMausamOrchestrator.execute({
          query: initialLocQuery,
          selectedAppLocation: currentLocation,
          preferredLanguage,
        });

        if (isMounted) {
          setCanonicalContext(result.context);
        }
      } catch (err) {
        console.error('Failed to pre-fetch Ask MAUSAM context:', err);
      }

      // 2. Initial Greeting Briefing (Clean introduction, NOT a weather table!)
      if (isMounted) {
        const welcomeMsg: AskMausamMessage = {
          id: `msg-welcome`,
          sender: 'assistant',
          text: `### Welcome to Ask MAUSAM

I am your **National Meteorological Assistant**, providing verified atmospheric, marine, and disaster intelligence directly from official providers including the **India Meteorological Department (IMD)**, **SACHET / NDMA**, **Central Pollution Control Board (CPCB)**, and **INCOIS**.

**You can ask me about:**
- **What is MAUSAM?** (*platform architecture & verified datasets*)
- **Active Weather Warnings** (*e.g., "any rainfall warnings in Odisha?", "active alerts"*)
- **Current Temperature & Sky** (*e.g., "what is the weather in Odisha?", "temperature in Delhi"*)
- **Forecasts** (*e.g., "will it rain tomorrow?", "7-day forecast for Odisha"*)
- **Air Quality (AQI)** (*e.g., "what is AQI?", "AQI in Bhubaneswar"*)
- **Doppler Radar** (*e.g., "show radar for Odisha", "how does radar work?"*)`,
          timestamp: Date.now(),
          structured: {
            answer: '',
            location: currentLocation?.name || 'India',
            intent: 'GREETING',
            responseType: 'knowledge',
            sourceStatus: 'LIVE',
            facts: [
              { label: 'Coverage', value: 'All 28 States & 8 Union Territories' },
              { label: 'Alerts', value: 'Live SACHET / NDMA Bulletins' },
              { label: 'Telemetry', value: 'IMD Station Grounding' },
            ],
            suggestedFollowUps: [
              'What is MAUSAM?',
              `Show current weather for ${currentLocation?.name || 'Odisha'}`,
              `Any rainfall warnings in ${currentLocation?.state || 'Odisha'}?`,
              'What is AQI?',
            ],
            debug: {
              query: 'WELCOME_INIT',
              intent: 'GREETING',
              location: `${currentLocation?.name || 'India'} (context only)`,
              locationIsContextOnly: true,
              providers: [],
              fastPath: 'LOCAL_KNOWLEDGE',
              latencyMs: 0,
            },
          },
        };

        setMessages([welcomeMsg]);
      }
    }

    init();

    return () => {
      isMounted = false;
      if (activeAbortController.current) {
        activeAbortController.current.abort();
      }
    };
  }, [currentLocation]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    // Abort previous in-flight request if any
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }
    const controller = new AbortController();
    activeAbortController.current = controller;

    setInputText('');

    const userMsg: AskMausamMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    const routing = routeIntent(textToSend);
    const isInstantKnowledge =
      routing.isGeneralKnowledge ||
      routing.intent === 'GENERAL_KNOWLEDGE' ||
      routing.intent === 'ABOUT_MAUSAM' ||
      routing.intent === 'HELP' ||
      routing.intent === 'GREETING' ||
      routing.requiredTools.length === 0;

    // Requirement 15: For local knowledge answers: NO LOADING SCREEN.
    if (!isInstantKnowledge) {
      setLoadingMessage(getIntentLoadingMessage(routing.intent));
      setIsLoading(true);
    }

    try {
      const result = await AskMausamOrchestrator.execute({
        query: textToSend,
        selectedAppLocation: currentLocation,
        preferredLanguage,
        signal: controller.signal,
      });

      // Synchronize canonical context with latest query result
      setCanonicalContext(result.context);
      if (result.timingMs) {
        setLastTiming(result.timingMs);
      }

      const assistantMsg: AskMausamMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: result.response.answer,
        timestamp: Date.now(),
        structured: result.response,
        contextSnapshot: result.context,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;

      const errorMsg: AskMausamMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Atmospheric telemetry stream temporarily interrupted. Station observations are being refreshed.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (canonicalContext) {
      handleSendMessage(`What is the current weather update for ${canonicalContext.location.name}?`);
    }
  };

  const curWeather = canonicalContext?.currentWeather;
  const loc = canonicalContext?.location;
  const activeWarnings = canonicalContext?.warnings || [];
  const topWarning = activeWarnings[0];
  const aqiVal = canonicalContext?.aqi?.index;
  const aqiCat = canonicalContext?.aqi?.category;

  return (
    <div className="flex flex-col h-full bg-[#090E17] text-[#D7DEE8] border-l border-[#1F2C3F] font-sans">
      {/* 1. MASTER METEOROLOGICAL HEADER */}
      <div className="p-3.5 bg-[#0D1524] border-b border-[#1F2C3F] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0284C7]/20 border border-[#0284C7]/40 flex items-center justify-center text-[#38BDF8] font-bold text-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Ask MAUSAM
                </h2>
                {loc?.name && (
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#162234] text-[#38BDF8] border border-[#1F2C3F]">
                    {loc.name}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                India Meteorological & Atmospheric Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selector */}
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
              aria-label="Select Assistant Language"
              className="bg-[#121D2C] border border-[#1F2C3F] text-xs text-[#CBD5E1] rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              <option value="English">EN</option>
              <option value="Hindi">HI</option>
              <option value="Odia">OD</option>
              <option value="Bengali">BN</option>
              <option value="Tamil">TA</option>
              <option value="Telugu">TE</option>
              <option value="Marathi">MR</option>
            </select>

            <button
              onClick={handleClearChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg hover:bg-[#1A2638] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                title="Close panel"
                className="p-1.5 rounded-lg hover:bg-[#1A2638] text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 2. CANONICAL CONTEXT STRIP: Temperature, Condition, Humidity, Wind, AQI, Warning */}
        {canonicalContext && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-2 rounded-xl bg-[#121E30] border border-[#1F2C3F] text-[11px]">
            {/* Temperature */}
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-[#94A3B8] uppercase">Temp</span>
              <span className="font-bold text-white font-mono text-xs">
                {curWeather ? `${curWeather.temperatureC}°C` : 'N/A'}
              </span>
            </div>

            {/* Condition */}
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-[#94A3B8] uppercase">Sky</span>
              <span className="font-medium text-[#38BDF8] truncate text-xs">
                {curWeather?.condition || 'Monitored'}
              </span>
            </div>

            {/* Humidity */}
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-[#94A3B8] uppercase">Humidity</span>
              <span className="font-medium text-[#CBD5E1] text-xs">
                {curWeather?.humidity !== undefined ? `${curWeather.humidity}%` : 'N/A'}
              </span>
            </div>

            {/* Wind */}
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-[#94A3B8] uppercase">Wind</span>
              <span className="font-medium text-[#CBD5E1] truncate text-xs">
                {curWeather?.windSpeedKmh !== undefined ? `${curWeather.windSpeedKmh} km/h` : 'N/A'}
              </span>
            </div>

            {/* AQI */}
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-[#94A3B8] uppercase">AQI</span>
              <span className="font-medium text-xs truncate" style={{ color: aqiVal && aqiVal > 200 ? '#EF4444' : aqiVal && aqiVal > 100 ? '#EAB308' : '#10B981' }}>
                {aqiVal !== undefined ? `${aqiVal} (${aqiCat || 'AQI'})` : 'N/A'}
              </span>
            </div>

            {/* Warning Status */}
            <div className="flex flex-col px-1">
              <span className="text-[10px] text-[#94A3B8] uppercase">Warning</span>
              {topWarning ? (
                <span className="font-bold text-[10px] uppercase text-[#EF4444] truncate">
                  {topWarning.severity} Alert
                </span>
              ) : (
                <span className="font-medium text-[10px] text-[#10B981] truncate">
                  No Alert
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex items-center border-b border-[#1F2C3F] bg-[#0A101B] px-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'CHAT'
              ? 'border-[#38BDF8] text-[#38BDF8]'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Assistant Chat
        </button>
        <button
          onClick={() => setActiveTab('REGIONS')}
          className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'REGIONS'
              ? 'border-[#38BDF8] text-[#38BDF8]'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          All 36 States & UTs
        </button>
        <button
          onClick={() => setActiveTab('ABOUT')}
          className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ABOUT'
              ? 'border-[#38BDF8] text-[#38BDF8]'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          Grounding Truth
        </button>
      </div>

      {/* 4. BODY CONTENT */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Scrollable message stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            <QuickActions
              onSelectPrompt={(p) => handleSendMessage(p)}
              currentLocationName={loc?.name}
            />

            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onSelectPrompt={(p) => handleSendMessage(p)}
                onSelectLocation={onSelectLocation}
              />
            ))}

            {isLoading && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F172A] border border-[#1E293B] text-xs text-[#94A3B8]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-ping" />
                  <span className="text-[#38BDF8] font-medium animate-pulse">{loadingMessage}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono tracking-wider">PARALLEL PIPELINE</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input field */}
          <div className="p-3 sm:p-4 bg-[#0D1524] border-t border-[#1F2C3F] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about weather, rainfall, warnings, AQI, agriculture..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#121D2C] border border-[#1F2C3F] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-40 disabled:hover:bg-[#0284C7] text-white text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#64748B] px-1">
              {(() => {
                const lastMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
                const isKnowledge =
                  lastMsg?.structured?.responseType === 'knowledge' ||
                  lastMsg?.structured?.intent === 'GENERAL_KNOWLEDGE' ||
                  lastMsg?.structured?.intent === 'ABOUT_MAUSAM' ||
                  lastMsg?.structured?.intent === 'ABOUT_DEVELOPER' ||
                  lastMsg?.structured?.intent === 'HELP' ||
                  lastMsg?.structured?.intent === 'GREETING';

                if (isKnowledge) {
                  return (
                    <>
                      <span>Grounding: MAUSAM Canonical Knowledge Base</span>
                      {lastTiming ? (
                        <span className="font-mono text-[#34D399]">
                          Resolved in {lastTiming.totalMs}ms (Local Knowledge)
                        </span>
                      ) : (
                        <span>Verified Knowledge Grounding</span>
                      )}
                    </>
                  );
                }

                return (
                  <>
                    <span>Grounding: IMD & Open-Meteo Normalized Telemetry</span>
                    {lastTiming ? (
                      <span className="font-mono text-[#38BDF8]">
                        Resolved in {lastTiming.totalMs}ms{' '}
                        {lastTiming.aiMs === 0
                          ? `(${lastMsg?.structured?.debug?.fastPath || 'Telemetry Fast-Path'})`
                          : `(Providers: ${lastTiming.providersMs}ms)`}
                      </span>
                    ) : (
                      <span>Zero-Discrepancy Fact Enforcement</span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REGIONS' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              All 36 Indian States & Union Territories
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Select any state or union territory to query live meteorological observations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INDIA_STATES_UTS.map((reg) => (
              <button
                key={reg.id}
                onClick={() => {
                  setActiveTab('CHAT');
                  handleSendMessage(`What is the current weather in ${reg.name}?`);
                }}
                className="p-2.5 rounded-xl bg-[#121D2C] hover:bg-[#1A283C] border border-[#1F2C3F] hover:border-[#38BDF8]/40 transition-colors text-left flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-white text-xs block">{reg.name}</span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {reg.capital} • {reg.type === 'STATE' ? 'State' : 'Union Territory'}
                  </span>
                </div>
                <span className="text-[11px] text-[#38BDF8] font-mono">{reg.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ABOUT' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-[#CBD5E1] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#121D2C] border border-[#1F2C3F] space-y-2">
            <h4 className="font-bold text-white text-sm">Truthful Meteorological Grounding</h4>
            <p>
              Ask MAUSAM functions strictly as a tool-grounded meteorological system. Responses are not generated from latent training memories; they are verified against live station feeds and high-resolution numerical atmospheric models.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121D2C] border border-[#1F2C3F] space-y-2">
            <h4 className="font-bold text-white text-sm">Official IMD Data Connector</h4>
            <p>
              Direct IMD API access requires registered credentials (<code className="text-[#38BDF8]">IMD_API_KEY</code>) set in the server environment. When direct IMD access is unconfigured, the system truthfully notes it and provides calibrated Open-Meteo telemetry fallback.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#121D2C] border border-[#1F2C3F] space-y-2">
            <h4 className="font-bold text-white text-sm">Zero Data Discrepancy Protocol</h4>
            <p>
              The top header, context strip, answer cards, and message bubble all share a single canonical context object (<code className="text-[#38BDF8]">AskMausamContext</code>). The Contradiction Detection Engine validates every candidate response against ground facts before rendering.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
