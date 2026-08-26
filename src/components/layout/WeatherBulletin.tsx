import React from 'react';
import { WeatherAlert } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

interface WeatherBulletinProps {
  alerts?: WeatherAlert[];
  currentLocationName?: string;
  onViewAlerts?: () => void;
}

export const WeatherBulletin: React.FC<WeatherBulletinProps> = ({
  alerts = [],
  currentLocationName = 'Bhubaneswar, Odisha',
  onViewAlerts,
}) => {
  const { t } = useLanguage();
  const activeAlert = alerts.length > 0 ? alerts[0] : null;

  if (activeAlert) {
    const isSevere = activeAlert.severity === 'Severe' || activeAlert.severity === 'Extreme';
    const isModerate = activeAlert.severity === 'Moderate';

    return (
      <div
        className={`mausam-bulletin ${
          isSevere
            ? 'mausam-bulletin--danger'
            : isModerate
            ? 'mausam-bulletin--warning'
            : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-[22px] ${
              isSevere ? 'text-[#E74C3C]' : 'text-[#F1C40F]'
            }`}
          >
            warning
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-xs">
                {t('weatherBulletin', 'WEATHER BULLETIN')}: {activeAlert.title.toUpperCase()}
              </span>
              <span className="text-[11px] font-semibold text-[#8A94A6]">
                • {t('affectedArea', 'Affected')}: {activeAlert.affectedArea || currentLocationName}
              </span>
              <span className="text-[11px] text-[#8A94A6]">
                • {t('validUntil', 'Valid until')}: {activeAlert.validUntil || '24 Hours'}
              </span>
            </div>
            <p className="text-[#D7DEE8] text-xs mt-0.5 line-clamp-1">
              {activeAlert.description}
            </p>
          </div>
        </div>

        {onViewAlerts && (
          <button
            type="button"
            onClick={onViewAlerts}
            className="mausam-btn mausam-btn--secondary mausam-btn--sm shrink-0"
          >
            <span>{t('viewAllAlerts', 'View All Alerts')} ({alerts.length})</span>
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </button>
        )}
      </div>
    );
  }

  // Normal weather condition bulletin
  return (
    <div className="mausam-bulletin mausam-bulletin--good">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[20px] text-[#2ECC71]">
          check_circle
        </span>
        <div>
          <span className="text-white font-bold text-xs">
            {t('synopticBulletin', 'SYNOPTIC BULLETIN: NORMAL METEOROLOGICAL CONDITIONS')}
          </span>
          <span className="text-[#8A94A6] text-xs ml-2">
            {t('noSevereWarnings', `No active severe storm warnings for ${currentLocationName}. Monitored across all Doppler radars.`)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#8A94A6]">
        <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
        <span>{t('observationVerified', 'Observation Verified')}</span>
      </div>
    </div>
  );
};
