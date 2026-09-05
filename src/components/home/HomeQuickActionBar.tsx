import React from 'react';
import { CloudSun, AlertTriangle, Radio, Activity, Wheat, FileText } from 'lucide-react';

interface HomeQuickActionBarProps {
  onNavigate: (tab: string) => void;
  activeTab?: string;
}

const QUICK_ACTIONS = [
  { id: 'overview', label: 'WEATHER', icon: CloudSun, color: 'text-[#4FA8E0]', bgHover: 'hover:border-[#4FA8E0]' },
  { id: 'warnings', label: 'WARNINGS', icon: AlertTriangle, color: 'text-[#E74C3C]', bgHover: 'hover:border-[#E74C3C]' },
  { id: 'radar', label: 'RADAR', icon: Radio, color: 'text-[#2ECC71]', bgHover: 'hover:border-[#2ECC71]' },
  { id: 'air', label: 'AQI', icon: Activity, color: 'text-[#F1C40F]', bgHover: 'hover:border-[#F1C40F]' },
  { id: 'agromet', label: 'AGROMET', icon: Wheat, color: 'text-[#1ABC9C]', bgHover: 'hover:border-[#1ABC9C]' },
  { id: 'reports', label: 'REPORTS', icon: FileText, color: 'text-[#9B59B6]', bgHover: 'hover:border-[#9B59B6]' },
];

export const HomeQuickActionBar: React.FC<HomeQuickActionBarProps> = ({
  onNavigate,
  activeTab,
}) => {
  return (
    <nav
      id="homepage-quick-action-bar"
      aria-label="Mausam Quick Action Bar"
      className="bg-[#17212B] border border-[#334155] rounded-xl p-2 sm:p-2.5 shadow-md"
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {QUICK_ACTIONS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`quick-action-btn-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-[#0B72B9] text-white border-[#0B72B9] shadow-md'
                  : `bg-[#1E2733] text-[#D7DEE8] border-[#334155] ${item.bgHover} hover:text-white`
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.color}`} />
              <span className="tracking-wide uppercase whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
