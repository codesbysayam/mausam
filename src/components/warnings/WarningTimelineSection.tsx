import React from 'react';
import { WarningRecord } from '../../types/warningTypes';

interface WarningTimelineSectionProps {
  activeWarning?: WarningRecord | null;
}

export const WarningTimelineSection: React.FC<WarningTimelineSectionProps> = ({
  activeWarning,
}) => {
  // Default operational lifecycle events if no specific warning is selected
  const defaultEvents = [
    {
      time: '08:30 IST',
      stage: 'Synoptic Advisory',
      title: 'Monsoon Depression Tracking',
      desc: 'Initial meteorological alert bulletin published to NDMA and State Relief Commissioners.',
      status: 'completed',
    },
    {
      time: '12:15 IST',
      stage: 'Warning Upgraded',
      title: 'Red Alert Issued for Coastal Subdivisions',
      desc: 'Doppler Weather Radars detect deep convective clouds with precipitation rate > 25 mm/hr.',
      status: 'completed',
    },
    {
      time: '14:00 IST',
      stage: 'Warning Active',
      title: 'Squall Line & Rain Commenced',
      desc: 'High surface winds (55 km/h) recorded at automated coastal weather stations.',
      status: 'current',
    },
    {
      time: '18:30 IST',
      stage: 'Peak Hazard Window',
      title: 'Maximum Rain & Waterlogging Risk',
      desc: 'Highest hourly rainfall intensity forecasted; public advised to stay indoors.',
      status: 'upcoming',
    },
    {
      time: '06:00 IST',
      stage: 'Expiry & Review',
      title: 'System Weakening / Downgrade',
      desc: 'Synoptic review meeting; progressive downgrade to Yellow/Green code as system dissipates.',
      status: 'upcoming',
    },
  ];

  const events =
    activeWarning?.timeline && activeWarning.timeline.length > 0
      ? activeWarning.timeline.map((t) => ({
          time: t.time,
          stage: t.stage,
          title: t.title,
          desc: t.description,
          status: t.status,
        }))
      : defaultEvents;

  return (
    <section
      id="warning-lifecycle-timeline-section"
      aria-label="Warning Lifecycle Timeline"
      className="bg-[#0B2239] border border-[#1D4E73] rounded-md p-4 sm:p-6 shadow-md flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1D4E73] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#071A2D] border border-[#1D4E73] flex items-center justify-center text-[#E3F2FD]">
            <span className="material-symbols-outlined text-[20px]">
              timelapse
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">
              Operational Warning Lifecycle &amp; Progression Timeline
            </h3>
            <p className="text-[11px] text-[#B8C7D9]">
              Standard 5-stage meteorological alert progression from synoptic detection to expiration
            </p>
          </div>
        </div>

        {activeWarning && (
          <span className="text-[11px] font-mono text-[#E3F2FD] bg-[#071A2D] px-2.5 py-1 rounded border border-[#1D4E73]">
            Bulletin: {activeWarning.bulletinNo}
          </span>
        )}
      </div>

      {/* Horizontal on Desktop, Vertical on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
        {events.map((evt, idx) => {
          const isCompleted = evt.status === 'completed';
          const isCurrent = evt.status === 'current';

          return (
            <div
              key={idx}
              className={`p-3 rounded-md border flex flex-col justify-between gap-2 relative transition-all ${
                isCurrent
                  ? 'bg-[#071A2D] border-[#FF0000] shadow-md ring-1 ring-[#FF0000]/50'
                  : isCompleted
                  ? 'bg-[#071A2D]/80 border-[#008000]/40'
                  : 'bg-[#071A2D]/50 border-[#1D4E73]'
              }`}
            >
              {/* Top Node Indicator */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                    isCurrent
                      ? 'bg-[#FF0000] text-white'
                      : isCompleted
                      ? 'bg-[#008000]/20 text-[#008000]'
                      : 'bg-[#0B2239] text-[#B8C7D9]'
                  }`}
                >
                  {evt.time}
                </span>

                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCurrent
                      ? 'bg-[#FF0000] animate-ping'
                      : isCompleted
                      ? 'bg-[#008000]'
                      : 'bg-[#1D4E73]'
                  }`}
                />
              </div>

              {/* Title & Stage */}
              <div>
                <div className="text-[10px] font-bold text-[#B8C7D9] uppercase tracking-wider">
                  {evt.stage}
                </div>
                <div className="text-xs font-bold text-white mt-0.5 leading-snug">
                  {evt.title}
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#D7DEE8] leading-relaxed line-clamp-3">
                {evt.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
