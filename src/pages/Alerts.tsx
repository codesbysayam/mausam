import React from 'react';
import { WeatherDataBundle } from '../services/weatherService';
import { LocationRecord } from '../types';
import { WeatherWarning } from '../components/alerts/WeatherWarning';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatusBadge } from '../components/common/StatusBadge';

interface AlertsPageProps {
  weatherBundle: WeatherDataBundle;
  selectedLocation: LocationRecord;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  weatherBundle,
  selectedLocation,
}) => {
  const { alerts = [] } = weatherBundle;

  return (
    <div className="flex flex-col gap-5">
      {/* Primary Warning Component */}
      <WeatherWarning
        alerts={alerts}
        regionName={`${selectedLocation.city}, ${selectedLocation.state}`}
      />

      {/* Warning Color Legend & Action Matrix */}
      <div className="mausam-card">
        <SectionHeader
          title="National Disaster Early Warning Classification Matrix"
          subtitle="Standard operating protocol defined by National Disaster Management Authority (NDMA)"
          icon="shield"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#1E2733] border border-[#2ECC71]/40 border-l-4 border-l-[#2ECC71] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-xs">GREEN CODE</span>
              <StatusBadge label="No Action" variant="good" />
            </div>
            <p className="text-xs text-[#D7DEE8] mt-1.5 leading-relaxed">
              No severe weather expected. Routine daily activities may proceed normally.
            </p>
          </div>

          <div className="p-3.5 bg-[#1E2733] border border-[#F1C40F]/40 border-l-4 border-l-[#F1C40F] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-xs">YELLOW CODE</span>
              <StatusBadge label="Be Updated" variant="warning" />
            </div>
            <p className="text-xs text-[#D7DEE8] mt-1.5 leading-relaxed">
              Severely changing conditions possible. Keep updated on local weather forecasts.
            </p>
          </div>

          <div className="p-3.5 bg-[#1E2733] border border-[#FF8C42]/40 border-l-4 border-l-[#FF8C42] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-xs">ORANGE CODE</span>
              <StatusBadge label="Be Prepared" variant="alert" />
            </div>
            <p className="text-xs text-[#D7DEE8] mt-1.5 leading-relaxed">
              High risk of disruption in transport and power. Vulnerable populations should stay indoors.
            </p>
          </div>

          <div className="p-3.5 bg-[#1E2733] border border-[#E74C3C]/40 border-l-4 border-l-[#E74C3C] rounded">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-xs">RED CODE</span>
              <StatusBadge label="Take Action" variant="danger" />
            </div>
            <p className="text-xs text-[#D7DEE8] mt-1.5 leading-relaxed">
              Extremely severe weather event imminent. Follow state disaster management instructions.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Helpline Directory */}
      <div className="mausam-card">
        <SectionHeader
          title="National Disaster Response &amp; Emergency Helplines"
          subtitle="24x7 control room direct contact channels"
          icon="call"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between">
            <span className="text-[#8A94A6] font-semibold">National Emergency Number</span>
            <span className="text-lg font-bold text-white font-mono mt-1">112</span>
            <span className="text-[10px] text-[#4FA8E0] mt-1">Unified All-India</span>
          </div>

          <div className="p-3 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between">
            <span className="text-[#8A94A6] font-semibold">Disaster Management (NDMA)</span>
            <span className="text-lg font-bold text-white font-mono mt-1">1078 / 011-26701728</span>
            <span className="text-[10px] text-[#4FA8E0] mt-1">National Control Room</span>
          </div>

          <div className="p-3 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between">
            <span className="text-[#8A94A6] font-semibold">State Disaster Control (Odisha)</span>
            <span className="text-lg font-bold text-white font-mono mt-1">1070 / 0674-2534177</span>
            <span className="text-[10px] text-[#4FA8E0] mt-1">SRC Odisha Control</span>
          </div>

          <div className="p-3 bg-[#1E2733] border border-[#334155] rounded flex flex-col justify-between">
            <span className="text-[#8A94A6] font-semibold">IMD Weather Bulletin Inquiry</span>
            <span className="text-lg font-bold text-white font-mono mt-1">1800-180-1717</span>
            <span className="text-[10px] text-[#4FA8E0] mt-1">Toll-Free Meteorological Help</span>
          </div>
        </div>
      </div>
    </div>
  );
};
