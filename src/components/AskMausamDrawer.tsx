import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CurrentWeather, WeatherStation, LocationRecord } from '../types';
import { WeatherDataBundle } from '../services/weatherService';
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  ALL_INDIA_STATES_MET_PROFILES,
  matchMausamQuery,
  GroundingLink,
  MausamContext,
} from '../services/mausamAssistantService';
import {
  SUPPORTED_MAUSAM_AI_LANGUAGES,
  resolveLanguageKey,
  getDrawerUiStrings,
} from '../data/mausamLanguages';
import {
  buildMausamContext,
  solveActionableQuery,
  extractTargetLocation,
  StructuredAssistantResponse,
} from '../services/mausamContextBuilder';
import { MausamMarkdown } from './MausamMarkdown';

interface AskMausamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  weather: CurrentWeather;
  weatherBundle?: WeatherDataBundle;
  selectedLocation?: LocationRecord;
  currentStation: WeatherStation;
  onSelectLocation?: (location: LocationRecord) => void;
  onNavigateTab?: (tabId: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structured?: StructuredAssistantResponse;
  source?: string;
  groundingSources?: GroundingLink[];
  suggestedFollowUps?: string[];
  modeUsed?: string;
  targetLocation?: LocationRecord;
  actionLinks?: { label: string; tabId?: string; icon: string; location?: LocationRecord }[];
}

type QuickActionCategory = 'all' | 'safety' | 'rain' | 'health' | 'agriculture';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  category: QuickActionCategory;
  query: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'rain', label: 'Will it rain?', icon: 'rainy', category: 'rain', query: 'Will it rain today in my location?' },
  { id: 'run', label: 'Can I go for a run now?', icon: 'directions_run', category: 'safety', query: 'Can I go for an outdoor run right now?' },
  { id: 'warnings', label: 'Active warnings', icon: 'warning', category: 'safety', query: 'Are there active severe weather warnings for my district?' },
  { id: 'aqi', label: 'Air quality & health', icon: 'air', category: 'health', query: 'What is the air quality index and health impact right now?' },
  { id: 'travel', label: 'Is it safe to travel?', icon: 'commute', category: 'safety', query: 'Is it safe to travel and drive on highways right now?' },
  { id: 'umbrella', label: 'Do I need an umbrella?', icon: 'umbrella', category: 'rain', query: 'Do I need an umbrella today?' },
  { id: 'crops', label: 'Crop spraying conditions', icon: 'agriculture', category: 'agriculture', query: 'Are weather conditions suitable for crop spraying today?' },
  { id: 'radar', label: 'What does Doppler radar show?', icon: 'radar', category: 'rain', query: 'What does the Doppler weather radar show for my area?' },
  { id: 'peak_temp', label: 'When will heat peak?', icon: 'thermostat', category: 'health', query: 'When will the temperature peak today?' },
  { id: 'forecast_7d', label: '7-day synoptic outlook', icon: 'calendar_month', category: 'rain', query: 'Show me the 7-day weather forecast outlook.' },
];

export const AskMausamDrawer: React.FC<AskMausamDrawerProps> = ({
  isOpen,
  onClose,
  weather,
  weatherBundle,
  selectedLocation,
  currentStation,
  onSelectLocation,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'faqs' | 'states'>('chat');
  const [quickCategory, setQuickCategory] = useState<QuickActionCategory>('all');
  const [language, setLanguage] = useState<string>('English');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('all');
  const [faqSearchQuery, setFaqSearchQuery] = useState<string>('');
  const [stateSearchQuery, setStateSearchQuery] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [activeConversationLocation, setActiveConversationLocation] = useState<LocationRecord | null>(null);

  // Resolved active location context
  const activeLocation: LocationRecord = useMemo(() => {
    if (activeConversationLocation) return activeConversationLocation;
    if (selectedLocation) return selectedLocation;
    return {
      id: currentStation?.id || 'loc-obs',
      state: currentStation?.state || 'Odisha',
      district: currentStation?.district || currentStation?.name || 'Bhubaneswar',
      city: currentStation?.district || currentStation?.name || 'Bhubaneswar',
      lat: currentStation?.lat || 20.29,
      lng: currentStation?.lng || 85.82,
      timezone: 'Asia/Kolkata',
      displayName: `${currentStation?.name || 'Bhubaneswar'}, ${currentStation?.state || 'India'}`,
    };
  }, [activeConversationLocation, selectedLocation, currentStation]);

  const stationDisplayName = useMemo(() => {
    return activeLocation.displayName || `${activeLocation.city}, ${activeLocation.state}`;
  }, [activeLocation]);

  const langKey = useMemo(() => resolveLanguageKey(language), [language]);
  const uiStrings = useMemo(() => getDrawerUiStrings(langKey), [langKey]);

  // Initial Welcome Message
  const createInitialMessage = useCallback((): Message => {
    const timeStr = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
    });

    const resolvedSource = weather.source || 'Open-Meteo';
    const isImdLive = resolvedSource.includes('IMD');
    const imdStatusStr = isImdLive ? 'Operational' : 'Not Configured';

    const structuredGreeting: StructuredAssistantResponse = {
      title: `Atmospheric Intelligence · ${activeLocation.city || activeLocation.district}`,
      statusBadge: {
        label: `${weather.temp}°C — ${weather.condition?.toUpperCase() || 'OBSERVED'}`,
        type: 'info',
      },
      metricsLine: `🌡️ ${weather.temp}°C | 💧 ${weather.humidity}% RH | 💨 ${weather.windSpeed} km/h | 🌧️ ${weather.precipitationProbability ?? 0}% rain | 🫁 AQI ${weather.aqiIndex ?? weather.aqiPm25 ?? 65}`,
      summary: `Atmospheric intelligence active for ${stationDisplayName}. Source: ${resolvedSource} (IMD: ${imdStatusStr}).`,
      markdownContent: `### Atmospheric Intelligence — ${stationDisplayName}
• **Weather Source**: **${resolvedSource}**
• **IMD Direct Access**: **${imdStatusStr}**
• **Observation Status**: **${weather.observationStatus || 'LIVE'}**

**Current Surface Observation**:
• **Air Temperature**: **${weather.temp}°C** (Feels like **${weather.feelsLike ?? weather.temp}°C**)
• **Atmospheric Condition**: **${weather.condition || 'Clear'}**
• **Relative Humidity**: **${weather.humidity}%** | **Dew Point**: **${weather.dewPoint ?? 24}°C**
• **Wind Vector**: **${weather.windSpeed} km/h** from **${weather.windDirection || 'WSW'}**
• **Air Quality Index**: **${weather.aqiIndex ?? weather.aqiPm25 ?? 65}** (${weather.aqiStatus || 'Satisfactory'})
• **Solar UV Index**: **${weather.uvIndex ?? 5}/10**

Ask any question below or tap a quick action to analyze rain risk, workout windows, travel safety, or crop advisories.

*Source: ${resolvedSource} · Updated ${timeStr} IST*`,
      source: `${resolvedSource} · Updated ${timeStr} IST`,
      suggestedFollowUps: [
        'Will it rain today in my location?',
        'Can I go for an outdoor run right now?',
        'Are there active severe weather warnings?',
        'Is it safe to travel on highways right now?',
      ],
    };

    return {
      id: 'init-1',
      role: 'assistant',
      content: structuredGreeting.markdownContent,
      structured: structuredGreeting,
      timestamp: timeStr,
      source: `${resolvedSource} · Updated ${timeStr} IST`,
      suggestedFollowUps: structuredGreeting.suggestedFollowUps,
      targetLocation: activeLocation,
    };
  }, [activeLocation, weather, stationDisplayName]);

  const [messages, setMessages] = useState<Message[]>(() => [createInitialMessage()]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filtered FAQs by category and search
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      let matchCategory = selectedFaqCategory === 'all';
      if (!matchCategory) {
        // Map category aliases to the 10 standard categories
        if (selectedFaqCategory === 'basics' && (item.categoryId === 'basics' || item.categoryId === 'current')) matchCategory = true;
        else if (selectedFaqCategory === 'forecast' && (item.categoryId === 'forecast' || item.categoryId === 'rain_alerts')) matchCategory = true;
        else if (selectedFaqCategory === 'warnings' && (item.categoryId === 'warnings' || item.categoryId === 'rain_alerts' || item.categoryId === 'disaster_citizen')) matchCategory = true;
        else if (selectedFaqCategory === 'radar' && (item.categoryId === 'radar' || item.categoryId === 'radar_science')) matchCategory = true;
        else if (selectedFaqCategory === 'aqi' && (item.categoryId === 'aqi' || item.categoryId === 'health_aqi')) matchCategory = true;
        else if (selectedFaqCategory === 'agriculture' && (item.categoryId === 'agriculture' || item.categoryId === 'agromet')) matchCategory = true;
        else if (selectedFaqCategory === 'marine' && (item.categoryId === 'marine' || item.categoryId === 'cyclone_marine' || item.categoryId === 'aviation_marine')) matchCategory = true;
        else if (selectedFaqCategory === 'safety' && (item.categoryId === 'safety' || item.categoryId === 'disaster_citizen' || item.categoryId === 'current')) matchCategory = true;
        else if (selectedFaqCategory === 'climate' && (item.categoryId === 'climate' || item.categoryId === 'states_regional')) matchCategory = true;
        else if (selectedFaqCategory === 'technical' && (item.categoryId === 'technical' || item.categoryId === 'radar_science' || item.categoryId === 'aviation_marine')) matchCategory = true;
        else if (item.categoryId === selectedFaqCategory) matchCategory = true;
      }

      const matchSearch =
        !faqSearchQuery.trim() ||
        item.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.shortQuestion.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
        item.keywords.some((k) => k.toLowerCase().includes(faqSearchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [selectedFaqCategory, faqSearchQuery]);

  // Filtered States & UTs
  const filteredStates = useMemo(() => {
    if (!stateSearchQuery.trim()) return ALL_INDIA_STATES_MET_PROFILES;
    const q = stateSearchQuery.toLowerCase();
    return ALL_INDIA_STATES_MET_PROFILES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.capital.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.representativeStation.toLowerCase().includes(q) ||
        s.aliases.some((a) => a.toLowerCase().includes(q))
    );
  }, [stateSearchQuery]);

  // Filtered quick actions
  const filteredQuickActions = useMemo(() => {
    if (quickCategory === 'all') return QUICK_ACTIONS;
    return QUICK_ACTIONS.filter((qa) => qa.category === quickCategory);
  }, [quickCategory]);

  // Scroll to bottom on message
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Execute query
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setActiveTab('chat');

    // Detect if the user targeted a specific location in this query
    const { location: targetLoc, isExplicit } = extractTargetLocation(
      query,
      activeLocation,
      messages.map((m) => ({ role: m.role, content: m.content }))
    );

    if (isExplicit) {
      setActiveConversationLocation(targetLoc);
    }

    // Build meteorological context
    const mausamCtx = buildMausamContext(query, targetLoc, weather, {
      hourly: weatherBundle?.hourly,
      daily: weatherBundle?.daily,
      alerts: weatherBundle?.alerts,
      station: currentStation,
      preferredLanguage: language,
      conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    // Solve deterministically first for instantaneous fallback
    const deterministicStructured = solveActionableQuery(mausamCtx);

    // Prepare action links
    const actionLinks: Message['actionLinks'] = [];
    const qLower = query.toLowerCase();
    if (qLower.includes('radar') || qLower.includes('echo') || qLower.includes('satellite')) {
      actionLinks.push({ label: 'Open Doppler Radar', tabId: 'radar', icon: 'radar' });
    }
    if (qLower.includes('forecast') || qLower.includes('tomorrow') || qLower.includes('7-day') || qLower.includes('rain')) {
      actionLinks.push({ label: 'View 7-Day Forecast', tabId: 'forecast', icon: 'calendar_month' });
    }
    if (qLower.includes('aqi') || qLower.includes('pollution') || qLower.includes('pm2.5')) {
      actionLinks.push({ label: 'Open AQI & Environment', tabId: 'aqi', icon: 'air' });
    }
    if (qLower.includes('warning') || qLower.includes('alert') || qLower.includes('cyclone')) {
      actionLinks.push({ label: 'Open Warnings Board', tabId: 'warnings', icon: 'warning' });
    }
    if (qLower.includes('crop') || qLower.includes('spray') || qLower.includes('farm')) {
      actionLinks.push({ label: 'Open Agromet Portal', tabId: 'agromet', icon: 'agriculture' });
    }
    if (isExplicit && onSelectLocation) {
      actionLinks.push({
        label: `Switch App Location to ${targetLoc.city}`,
        icon: 'location_on',
        location: targetLoc,
      });
    }

    try {
      // Set up a 10s timeout
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Attempt server-side API call
      const response = await fetch('/api/mausam/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: query,
          mode: 'auto',
          lat: targetLoc.lat,
          lng: targetLoc.lng,
          preferredLanguage: language,
          location: {
            country: 'India',
            state: targetLoc.state,
            city: targetLoc.city,
            district: targetLoc.district,
            station: currentStation?.name || targetLoc.city,
            stationId: currentStation?.code || '42971',
            latitude: targetLoc.lat,
            longitude: targetLoc.lng,
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
            dewPointC: weather.dewPoint ?? 24,
            rainfall24hMm: weather.precipitation ?? 0,
            rainProbability: weather.precipitationProbability ?? 0,
            uvIndex: weather.uvIndex ?? 5,
          },
          airQuality: {
            aqi: weather.aqiIndex ?? weather.aqiPm25 ?? 63,
            pm25: weather.aqiPm25,
            pm10: weather.aqiPm10 ?? 58,
            category: weather.aqiStatus || 'Satisfactory',
          },
          pollen: {
            index: weather.pollenCount ?? 8,
            category: weather.pollen || 'Low Risk',
          },
          astronomy: {
            sunrise: weather.sunrise ?? '05:29',
            sunset: weather.sunset ?? '18:07',
          },
          metadata: {
            observedAt: weather.lastUpdated || new Date().toISOString(),
            source: weather.source || 'Open-Meteo',
            imdStatus: (weather.source && weather.source.includes('IMD')) ? 'Operational' : 'Not Configured',
            status: weather.observationStatus || 'LIVE',
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.response && !data.response.includes('temporarily unavailable')) {
        const assistantMsg: Message = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          structured: deterministicStructured,
          timestamp: new Date().toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
          }),
          source: data.source || deterministicStructured.source,
          groundingSources: data.groundingSources || [],
          suggestedFollowUps: deterministicStructured.suggestedFollowUps,
          modeUsed: data.modeUsed || 'online-grounded',
          targetLocation: targetLoc,
          actionLinks,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }
      throw new Error('Empty response from backend');
    } catch {
      // Deterministic Atmospheric Fallback
      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: deterministicStructured.markdownContent,
        structured: deterministicStructured,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: deterministicStructured.source,
        groundingSources: [],
        suggestedFollowUps: deterministicStructured.suggestedFollowUps,
        modeUsed: 'atmospheric-intelligence-offline',
        targetLocation: targetLoc,
        actionLinks,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setActiveConversationLocation(null);
    setMessages([createInitialMessage()]);
  };

  // Lock body scroll and listen for Escape
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
      id="ask-mausam-drawer"
      className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs transition-opacity select-none font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Ask MAUSAM Atmospheric Intelligence Assistant"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Panel */}
      <div className="relative z-10 w-full sm:max-w-2xl bg-[#090E17] border-l border-[#1F2C3F] h-full max-h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 text-[#D7DEE8]">
        {/* Government Meteorological Header */}
        <div className="p-3 sm:p-4 border-b border-[#1F2C3F] bg-[#0E1724] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#0B72B9]/20 border border-[#0B72B9]/50 flex items-center justify-center text-[#4FA8E0] shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[24px]">air</span>
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wider uppercase">
                  ASK MAUSAM
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#0B72B9]/25 text-[#4FA8E0] text-[10px] font-bold border border-[#0B72B9]/40 shrink-0">
                  Meteorological Assistant
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] truncate mt-0.5">
                <span className="material-symbols-outlined text-[12px] text-[#2ECC71]">
                  location_on
                </span>
                <span className="text-white font-medium truncate">{stationDisplayName}</span>
                <span className="text-[#64748B]">·</span>
                <span className="text-[#38BDF8] font-mono">{weather.temp}°C {weather.condition}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleClearChat}
              title="Reset conversation to initial telemetry"
              className="p-1.5 rounded-lg bg-[#142030] border border-[#1F2C3F] text-[#94A3B8] hover:text-white hover:border-[#38BDF8] cursor-pointer transition-colors"
              aria-label="Reset conversation"
            >
              <span className="material-symbols-outlined text-[17px]">restart_alt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#142030] border border-[#1F2C3F] text-[#94A3B8] hover:text-white hover:border-[#38BDF8] cursor-pointer transition-colors"
              aria-label="Close assistant"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab & Language Selector Bar */}
        <div className="px-3 sm:px-4 py-2 bg-[#0A111C] border-b border-[#1F2C3F] flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-[#142030] p-0.5 rounded-lg border border-[#1F2C3F]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">chat</span>
              <span>Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-3 py-1 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              <span>Knowledge Library</span>
            </button>
            <button
              onClick={() => setActiveTab('states')}
              className={`px-3 py-1 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'states'
                  ? 'bg-[#0B72B9] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">map</span>
              <span>States & UTs (36)</span>
            </button>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#94A3B8] text-[14px]">translate</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#142030] text-[#38BDF8] text-[11px] font-medium rounded-md border border-[#1F2C3F] px-2 py-1 focus:outline-none focus:border-[#0B72B9] cursor-pointer"
              aria-label="Select Language"
            >
              {SUPPORTED_MAUSAM_AI_LANGUAGES.map((lang) => (
                <option key={lang.key} value={lang.label} className="bg-[#142030] text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: Chat Stream with Contextual Quick Actions */}
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-4 scrollbar-thin">
            {/* Quick Actions Panel at Top */}
            <div className="p-3 rounded-xl bg-[#0F1928] border border-[#1F2C3F] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#38BDF8] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  What do you want to know?
                </span>
                {/* Category filters */}
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[10px]">
                  {(['all', 'safety', 'rain', 'health', 'agriculture'] as QuickActionCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setQuickCategory(cat)}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                        quickCategory === cat
                          ? 'bg-[#0B72B9] text-white'
                          : 'text-[#94A3B8] hover:text-white bg-[#162438]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="flex flex-wrap gap-1.5">
                {filteredQuickActions.slice(0, 6).map((qa) => (
                  <button
                    key={qa.id}
                    onClick={() => handleSendMessage(qa.query)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#142236] border border-[#23354E] hover:border-[#38BDF8] hover:bg-[#1A2C46] text-[#E2E8F0] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[13px] text-[#38BDF8]">
                      {qa.icon}
                    </span>
                    <span className="font-medium">{qa.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3.5 sm:p-4 rounded-xl max-w-[96%] sm:max-w-[92%] text-xs sm:text-[13px] leading-relaxed break-words [overflow-wrap:anywhere] shadow-md ${
                    m.role === 'user'
                      ? 'bg-[#0B72B9] text-white font-medium rounded-tr-none'
                      : 'bg-[#101B2B] border border-[#1F2C3F] text-[#D7DEE8] rounded-tl-none'
                  }`}
                >
                  {m.role === 'user' ? (
                    <div className="text-white font-medium whitespace-pre-wrap">{m.content}</div>
                  ) : (
                    <div>
                      {/* Status Card Header if structured */}
                      {m.structured?.statusBadge && (
                        <div className="mb-3 pb-2.5 border-b border-[#1F2C3F] flex items-center justify-between gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1.5 ${
                              m.structured.statusBadge.type === 'danger'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : m.structured.statusBadge.type === 'caution'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : m.structured.statusBadge.type === 'success'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#0B72B9]/20 text-[#38BDF8] border border-[#0B72B9]/40'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {m.structured.statusBadge.type === 'danger'
                                ? 'warning'
                                : m.structured.statusBadge.type === 'caution'
                                ? 'report'
                                : 'check_circle'}
                            </span>
                            {m.structured.statusBadge.label}
                          </span>

                          {m.structured.metricsLine && (
                            <span className="text-[11px] text-[#94A3B8] font-mono">
                              {m.structured.metricsLine}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Markdown text */}
                      <MausamMarkdown content={m.content} />

                      {/* Action Links & App Navigators */}
                      {m.actionLinks && m.actionLinks.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[#1F2C3F] flex flex-wrap gap-2">
                          {m.actionLinks.map((al, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (al.tabId && onNavigateTab) {
                                  onNavigateTab(al.tabId);
                                  onClose();
                                } else if (al.location && onSelectLocation) {
                                  onSelectLocation(al.location);
                                  setActiveConversationLocation(al.location);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#0B72B9]/20 border border-[#0B72B9]/50 hover:bg-[#0B72B9]/30 text-[#38BDF8] hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {al.icon}
                              </span>
                              {al.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Grounding Source Citations */}
                      {m.groundingSources && m.groundingSources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[#1F2C3F] flex flex-col gap-1.5">
                          <span className="text-[11px] font-bold text-[#38BDF8] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            Official References
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.groundingSources.map((g, idx) => (
                              <a
                                key={idx}
                                href={g.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] px-2 py-0.5 rounded bg-[#142030] text-[#38BDF8] hover:underline flex items-center gap-1 border border-[#1F2C3F]"
                              >
                                <span>{g.title}</span>
                                <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Follow-Ups */}
                      {m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#1F2C3F]/80 flex flex-wrap gap-1.5">
                          {m.suggestedFollowUps.slice(0, 3).map((fu, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(fu)}
                              className="text-[10px] px-2 py-1 rounded-md bg-[#162335] text-[#94A3B8] hover:text-white hover:bg-[#1E3048] border border-[#23354E] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[11px] text-[#38BDF8]">
                                arrow_outward
                              </span>
                              {fu}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Footer Attribution */}
                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#64748B] pt-1.5 border-t border-[#1F2C3F]/60">
                        <span className="truncate max-w-[240px] sm:max-w-[320px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-[#2ECC71]">
                            check_circle
                          </span>
                          {m.source || 'connected MAUSAM weather data'}
                        </span>
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#1F2C3F] transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {copiedMessageId === m.id ? 'done' : 'content_copy'}
                          </span>
                          <span>{copiedMessageId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#475569] mt-1 px-1 font-mono">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-[#38BDF8] text-xs p-3.5 bg-[#101B2B] rounded-xl border border-[#1F2C3F] w-fit shadow-md animate-pulse">
                <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                <span>Querying meteorological intelligence for {stationDisplayName}...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* TAB 2: 10 Official FAQ Knowledge Categories */}
        {activeTab === 'faqs' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 scrollbar-thin">
            {/* Search */}
            <div className="relative shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#64748B] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search atmospheric FAQs, terminology, radar, AQI..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full bg-[#101B2B] border border-[#1F2C3F] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#0B72B9]"
              />
              {faqSearchQuery && (
                <button
                  onClick={() => setFaqSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#64748B] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            {/* Category Selector with 10 requested categories */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFaqCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                    selectedFaqCategory === cat.id
                      ? 'bg-[#0B72B9] text-white shadow-sm'
                      : 'bg-[#101B2B] text-[#94A3B8] hover:text-white border border-[#1F2C3F]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>

            {/* FAQ List Cards */}
            <div className="flex flex-col gap-2">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-[#64748B] text-xs">
                  <span className="material-symbols-outlined text-[32px] mb-2 block text-[#38BDF8]">
                    quiz
                  </span>
                  No FAQs matching &quot;{faqSearchQuery}&quot;. Ask directly in the assistant stream!
                </div>
              ) : (
                filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    onClick={() => handleSendMessage(faq.question)}
                    className="p-3 rounded-xl bg-[#101B2B] border border-[#1F2C3F] hover:border-[#0B72B9] hover:bg-[#142236] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-white text-xs sm:text-[13px] group-hover:text-[#38BDF8] transition-colors block">
                        {faq.question}
                      </span>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-2">
                        {faq.shortQuestion}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B72B9]/15 text-[#38BDF8] font-medium">
                          {faq.categoryId.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {faq.keywords.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#182638] flex items-center justify-center text-[#94A3B8] group-hover:text-white group-hover:bg-[#0B72B9] shrink-0 transition-colors mt-0.5">
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: All 28 States & 8 UTs Meteorological Profiles */}
        {activeTab === 'states' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 scrollbar-thin">
            {/* Search */}
            <div className="relative shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#64748B] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search State, UT, capital, or observatory..."
                value={stateSearchQuery}
                onChange={(e) => setStateSearchQuery(e.target.value)}
                className="w-full bg-[#101B2B] border border-[#1F2C3F] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#0B72B9]"
              />
              {stateSearchQuery && (
                <button
                  onClick={() => setStateSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#64748B] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
              <span>Showing {filteredStates.length} States & Union Territories</span>
              <span className="text-[#38BDF8] font-medium">Click any region to query assistant</span>
            </div>

            {/* State Cards */}
            <div className="grid grid-cols-1 gap-2">
              {filteredStates.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSendMessage(`What is the meteorological profile, current conditions, and forecast for ${st.name}?`)}
                  className="p-3 rounded-xl bg-[#101B2B] border border-[#1F2C3F] hover:border-[#0B72B9] hover:bg-[#142236] transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs sm:text-[13px] group-hover:text-[#38BDF8] transition-colors">
                        {st.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1F2C3F] text-[#94A3B8]">
                        {st.code}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#0B72B9]/20 text-[#38BDF8]">
                        {st.type === 'UNION_TERRITORY' ? 'UT' : 'State'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#CBD5E1]">
                      Capital: <strong className="text-white">{st.capital}</strong> ({st.representativeStation})
                    </p>
                    <p className="text-[10px] text-[#64748B] line-clamp-1">
                      Radar: {st.primaryRadar} | Zone: {st.agroZone}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-bold text-[#38BDF8]">
                      {st.normalTemp.min}° - {st.normalTemp.max}°C
                    </span>
                    <span className="text-[10px] text-[#2ECC71]">
                      AQI {st.typicalAqi}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-3.5 border-t border-[#1F2C3F] bg-[#0A111C] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder={uiStrings.inputPlaceholder || 'Ask anything about rain, workout safety, travel, radar, warnings...'}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#101B2B] border border-[#1F2C3F] rounded-lg px-3.5 py-2.5 text-xs sm:text-[13px] text-white placeholder-[#64748B] focus:outline-none focus:border-[#0B72B9] transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputPrompt.trim()}
            className="px-3.5 py-2.5 rounded-lg bg-[#0B72B9] hover:bg-[#0B72B9]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
            aria-label="Send query to Ask MAUSAM"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
