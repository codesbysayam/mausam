import React from 'react';
import { NavigationTab } from '../types';

interface SideNavBarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenHelp,
}) => {
  const mainNavItems = [
    { id: 'today' as NavigationTab, label: 'Overview', icon: 'dashboard' },
    { id: 'forecast' as NavigationTab, label: 'Forecast', icon: 'wb_sunny' },
    { id: 'insights' as NavigationTab, label: 'Insights', icon: 'analytics' },
    { id: 'radar' as NavigationTab, label: 'Radar Map', icon: 'radar' },
    { id: 'alerts' as NavigationTab, label: 'Alerts', icon: 'notifications_active' },
    { id: 'saved-places' as NavigationTab, label: 'Saved Places', icon: 'bookmark' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full border-r border-[rgba(225,230,235,0.12)] bg-[#1E2733] shrink-0 select-none font-sans">
      {/* Brand Header */}
      <div className="p-4 card-header-divider bg-[#0F141A]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#0B72B9] flex items-center justify-center text-white font-bold text-sm shadow-md">
            M
          </div>
          <div className="overflow-hidden">
            <h2 className="font-h4 text-xs text-[#4FA8E0] uppercase tracking-wider font-bold leading-tight truncate">
              MAUSAM
            </h2>
            <p className="text-[11px] text-[#8A94A6] flex items-center gap-1 mt-0.5">
              Atmospheric Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold transition-all text-left cursor-pointer w-full ${
                isActive
                  ? 'text-[#4FA8E0] bg-[#0B72B9]/15 border-r-2 border-[#0B72B9]'
                  : 'text-[#8A94A6] hover:text-[#FFFFFF] hover:bg-[#242F3D]/50'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Auxiliary Links */}
      <div className="p-4 card-header-divider border-t border-[rgba(225,230,235,0.12)] flex flex-col gap-1 bg-[#0F141A]">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[#8A94A6] hover:text-[#FFFFFF] hover:bg-[#242F3D] rounded transition-colors text-left cursor-pointer w-full"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Settings
        </button>
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[#8A94A6] hover:text-[#FFFFFF] hover:bg-[#242F3D] rounded transition-colors text-left cursor-pointer w-full"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
          Help
        </button>
      </div>
    </aside>
  );
};
