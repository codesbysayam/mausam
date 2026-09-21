// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Quick Actions & Meteorological Query Chips
// Categories: Weather, Rain, Forecast, Warnings, AQI, Agriculture, Travel, Health
// ====================================================================

import React from 'react';

interface QuickActionsProps {
  onSelectPrompt: (prompt: string) => void;
  currentLocationName?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectPrompt, currentLocationName }) => {
  const loc = currentLocationName || 'Current Location';

  const actionChips = [
    { label: 'Current Weather', prompt: `What is the current weather in ${loc}?` },
    { label: 'Rain Tomorrow?', prompt: `Will it rain in ${loc} tomorrow?` },
    { label: '7-Day Forecast', prompt: `Show 7-day weather forecast for ${loc}` },
    { label: 'Active Warnings', prompt: `Are there any active weather warnings for ${loc}?` },
    { label: 'Air Quality (AQI)', prompt: `What is the Air Quality Index (AQI) in ${loc}?` },
    { label: 'Agriculture / Crops', prompt: `Is it safe to spray pesticides or irrigate crops in ${loc} today?` },
    { label: 'Travel Safety', prompt: `Is it safe for highway travel and outdoor activity in ${loc}?` },
    { label: 'Health & Outdoor', prompt: `Is it safe to go for a run or outdoor exercise in ${loc}?` },
  ];

  return (
    <div className="flex flex-col gap-1.5 pb-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
        <span>Quick Inquiries</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {actionChips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => onSelectPrompt(chip.prompt)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-[#121D2C] hover:bg-[#1A283C] text-[#CBD5E1] hover:text-white border border-[#1F2C3F] transition-colors cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
