import React from 'react';
import { HourlyForecastItem } from '../../types';
import { SectionHeader } from '../common/SectionHeader';
import { useLanguage } from '../../i18n/LanguageContext';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  modelType?: 'WRF' | 'GEFS' | 'ECMWF';
  modelSubtitle?: string;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({
  hourly,
  modelType = 'WRF',
  modelSubtitle,
}) => {
  const { t, tCondition, language } = useLanguage();
  const displayItems = hourly.slice(0, 12);

  const modelLabels = {
    WRF: 'IMD-WRF 3km Mesoscale High-Res Model',
    GEFS: 'Global Ensemble Forecast System (GEFS 12km)',
    ECMWF: 'ECMWF Integrated Forecasting System (IFS 9km HRES)',
  };

  const defaultSubtitle = `Nowcasting projection calibrated via ${modelLabels[modelType]}`;

  return (
    <div className="mausam-card">
      <SectionHeader
        title={t('hourlyForecast', '24-Hour Synoptic Hourly Forecast')}
        subtitle={modelSubtitle || defaultSubtitle}
        icon="schedule"
      />

      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-2 min-w-[720px]">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 bg-[#1E2733] border rounded p-2.5 flex flex-col items-center text-center justify-between min-w-[85px] ${
                item.isNow
                  ? 'border-[#4FA8E0] bg-[#0B72B9]/15'
                  : 'border-[#334155]'
              }`}
            >
              <div className="text-xs font-bold text-[#D7DEE8]">
                {item.time}
                {item.isNow && (
                  <span className="block text-[10px] text-[#4FA8E0] font-normal">
                    ({language === 'hi' ? 'अब' : language === 'or' ? 'ଏବେ' : 'Now'})
                  </span>
                )}
              </div>

              <div className="my-2 flex flex-col items-center">
                <span className="text-lg font-bold text-white font-mono">
                  {Math.round(item.temp)}°C
                </span>
                <span className="text-[11px] text-[#8A94A6] line-clamp-1 mt-0.5 max-w-[80px]">
                  {tCondition(item.condition)}
                </span>
              </div>

              <div className="w-full pt-1.5 border-t border-[#334155] text-[11px] text-[#8A94A6] flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span>{language === 'hi' ? 'वर्षा' : language === 'or' ? 'ବର୍ଷା' : 'Rain'}</span>
                  <span className="text-[#4FA8E0] font-bold font-mono">
                    {item.precipitationProbability || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span>{language === 'hi' ? 'हवा' : language === 'or' ? 'ପବନ' : 'Wind'}</span>
                  <span className="text-[#D7DEE8] font-mono">
                    {item.windSpeed || 10}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
