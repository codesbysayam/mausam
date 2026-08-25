import React, { useState } from 'react';
import { INITIAL_ALERTS } from '../data/weatherData';
import { WeatherAlert } from '../types';

export const AlertsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'severe' | 'warning'>('all');
  const [alerts] = useState<WeatherAlert[]>(INITIAL_ALERTS);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'severe') return a.severity === 'severe';
    if (filter === 'warning') return a.severity === 'warning';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto select-none font-sans">
      {/* Top Banner */}
      <div className="bg-[#1E2733] card-border rounded-xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#E74C3C] text-[20px]">
              crisis_alert
            </span>
            <h2 className="font-h3 text-base font-bold text-[#FFFFFF]">
              Meteorological &amp; Environmental Warning Bulletins
            </h2>
          </div>
          <p className="text-xs text-[#8A94A6]">
            Official advisories synced directly with IMD &amp; Central Pollution Control Board feeds
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-1.5 p-1 bg-[#0F141A] rounded-lg card-border">
          {(['all', 'severe', 'warning'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filter === f
                  ? 'bg-[#0B72B9] text-[#FFFFFF] shadow-sm'
                  : 'text-[#8A94A6] hover:text-[#FFFFFF]'
              }`}
            >
              {f === 'all' ? 'All Bulletins' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex flex-col gap-4">
        {filteredAlerts.map((alert) => {
          const isSevere = alert.severity === 'severe';
          return (
            <div
              key={alert.id}
              className={`bg-[#1E2733] card-border rounded-xl p-6 shadow-xl border-l-4 transition-all ${
                isSevere
                  ? 'border-l-[#E74C3C] bg-gradient-to-r from-[#E74C3C]/10 to-transparent'
                  : 'border-l-[#FFB703] bg-gradient-to-r from-[#FFB703]/10 to-transparent'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{
                      color: isSevere ? '#E74C3C' : '#FFB703',
                      fontVariationSettings: "'FILL' 1",
                    }}
                  >
                    warning
                  </span>
                  <div>
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider"
                      style={{ color: isSevere ? '#E74C3C' : '#FFB703' }}
                    >
                      {alert.agency}
                    </span>
                    <h3 className="font-h4 text-base font-bold text-[#FFFFFF]">
                      {alert.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#8A94A6]">
                  <span>Issued: {alert.issuedAt}</span>
                  <span>•</span>
                  <span className="text-[#4FA8E0] font-bold">Valid Until: {alert.validUntil}</span>
                </div>
              </div>

              <p className="text-sm text-[#F4F7FA] leading-relaxed mb-4">
                {alert.description}
              </p>

              {/* Action Item & Affected Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[rgba(225,230,235,0.12)]">
                <div className="bg-[#0F141A] p-3 rounded-lg card-border">
                  <p className="text-[10px] uppercase text-[#8A94A6] font-bold mb-1">
                    Action Item / Directive
                  </p>
                  <p className="text-xs text-[#2ECC71] font-medium">
                    {alert.actionItem}
                  </p>
                </div>

                <div className="bg-[#0F141A] p-3 rounded-lg card-border">
                  <p className="text-[10px] uppercase text-[#8A94A6] font-bold mb-1">
                    Affected Districts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.affectedDistricts.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded bg-[#1E2733] text-[#FFFFFF] text-xs card-border"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
